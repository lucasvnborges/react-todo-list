import React from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
} from '@/domain/entities/Task'
import { TaskUseCases } from '@/domain/usecases/TaskUseCases'
import { MirageTaskRepository } from '@/infrastructure/repositories/MirageTaskRepository'
import { useUIStore } from '@/store/useUIStore'

const repository = new MirageTaskRepository()
const useCases = new TaskUseCases(repository)

const QUERY_KEYS = {
  tasks: ['tasks'] as const,
  task: (id: string) => ['tasks', id] as const,
}

// Cache para evitar múltiplas mutations simultâneas
const pendingMutations = new Set<string>()

// Tipos genéricos para mutations
type OptimisticMutationContext<T = unknown> = {
  rollback: () => void
  data?: T
}

type MutationConfig<TData, TVariables, TContext = OptimisticMutationContext> = {
  mutationFn: (variables: TVariables) => Promise<TData>
  onOptimisticUpdate: (variables: TVariables) => TContext
  onServerSync?: (
    data: TData,
    variables: TVariables,
    context?: TContext
  ) => void
  onErrorRollback?: (
    error: Error,
    variables: TVariables,
    context?: TContext
  ) => void
  preventDuplicates?: boolean
  getDuplicateKey?: (variables: TVariables) => string
}

// Helper para criar mutations com optimistic updates
function useOptimisticMutation<
  TData,
  TVariables,
  TContext = OptimisticMutationContext,
>(config: MutationConfig<TData, TVariables, TContext>) {
  return useMutation({
    mutationFn: config.mutationFn,
    onMutate: async (variables) => {
      // Verificar duplicatas se necessário
      if (config.preventDuplicates && config.getDuplicateKey) {
        const key = config.getDuplicateKey(variables)
        if (pendingMutations.has(key)) {
          throw new Error('Mutation already in progress')
        }
        pendingMutations.add(key)
      }

      // Executar update otimista
      return config.onOptimisticUpdate(variables)
    },
    onSuccess: (data, variables, context) => {
      // Limpar cache de duplicatas
      if (config.preventDuplicates && config.getDuplicateKey) {
        const key = config.getDuplicateKey(variables)
        pendingMutations.delete(key)
      }

      // Sincronizar com servidor
      config.onServerSync?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      // Limpar cache de duplicatas
      if (config.preventDuplicates && config.getDuplicateKey) {
        const key = config.getDuplicateKey(variables)
        pendingMutations.delete(key)
      }

      // Executar rollback
      if (config.onErrorRollback) {
        config.onErrorRollback(error as Error, variables, context)
      } else if (
        context &&
        typeof context === 'object' &&
        'rollback' in context &&
        typeof context.rollback === 'function'
      ) {
        context.rollback()
      }
    },
  })
}

export function useTasks() {
  const { tasks, isLoading, error, setTasks, setLoading, setError } =
    useUIStore()

  const [hasInitialized, setHasInitialized] = React.useState(false)

  const query = useQuery({
    queryKey: QUERY_KEYS.tasks,
    queryFn: () => useCases.getAllTasks(),
    staleTime: Infinity,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  React.useEffect(() => {
    if (query.data && !hasInitialized) {
      setTasks(query.data)
      setLoading(false)
      setError(null)
      setHasInitialized(true)
    }
  }, [query.data, hasInitialized, setTasks, setLoading, setError])

  React.useEffect(() => {
    if (query.error) {
      setError(query.error as Error)
      setLoading(false)
    }
  }, [query.error, setError, setLoading])

  React.useEffect(() => {
    if (query.isLoading && !hasInitialized) {
      setLoading(true)
    }
  }, [query.isLoading, hasInitialized, setLoading])

  return {
    data: tasks,
    isLoading: isLoading || (query.isLoading && !hasInitialized),
    error: error || query.error,
    refetch: query.refetch,
  }
}

export function useCreateTask() {
  const { addTask } = useUIStore()

  return useOptimisticMutation({
    mutationFn: (input: CreateTaskInput) => useCases.createTask(input),
    onOptimisticUpdate: (newTask) => {
      const optimisticTask: Task = {
        id: `temp-${Date.now()}`,
        ...newTask,
        status: newTask.status || 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      addTask(optimisticTask)

      return {
        rollback: () => {
          const { tasks, setTasks } = useUIStore.getState()
          setTasks(tasks.filter((task) => task.id !== optimisticTask.id))
        },
        data: optimisticTask,
      }
    },
    onServerSync: (createdTask, _variables, context) => {
      if (context?.data) {
        const { tasks, setTasks } = useUIStore.getState()
        const updatedTasks = tasks.filter((task) => task.id !== context.data.id)
        setTasks([...updatedTasks, createdTask])
      }
    },
  })
}

export function useUpdateTask() {
  const { updateTask } = useUIStore()

  return useOptimisticMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      useCases.updateTask(id, input),
    onOptimisticUpdate: ({ id, input }) => {
      const { tasks } = useUIStore.getState()
      const originalTask = tasks.find((task) => task.id === id)

      updateTask(id, input)

      return {
        rollback: () => {
          if (originalTask) {
            updateTask(id, originalTask)
          }
        },
        data: { id, input, originalTask },
      }
    },
    onServerSync: (updatedTask) => {
      updateTask(updatedTask.id, updatedTask)
    },
  })
}

export function useDeleteTask() {
  const { deleteTask, addTask } = useUIStore()

  return useOptimisticMutation({
    mutationFn: (id: string) => useCases.deleteTask(id),
    onOptimisticUpdate: (id) => {
      const { tasks } = useUIStore.getState()
      const taskToDelete = tasks.find((task) => task.id === id)

      deleteTask(id)

      return {
        rollback: () => {
          if (taskToDelete) {
            addTask(taskToDelete)
          }
        },
        data: taskToDelete,
      }
    },
  })
}

export function useToggleTaskStatus() {
  const { toggleTaskStatus, updateTask } = useUIStore()

  return useOptimisticMutation({
    mutationFn: (id: string) => useCases.toggleTaskStatus(id),
    preventDuplicates: true,
    getDuplicateKey: (id: string) => id,
    onOptimisticUpdate: (id) => {
      toggleTaskStatus(id)

      return {
        rollback: () => {
          toggleTaskStatus(id) // Reverter o toggle
        },
      }
    },
    onServerSync: (updatedTask) => {
      updateTask(updatedTask.id, updatedTask)
    },
  })
}
