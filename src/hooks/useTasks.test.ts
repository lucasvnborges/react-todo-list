import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTasks } from './useTasks'
import { useUIStore } from '@/store/useUIStore'
import { TaskUseCases } from '@/domain/usecases/TaskUseCases'
import type { Task } from '@/domain/entities/Task'

const mockTask1: Task = {
  id: '1',
  title: 'Tarefa de teste 1',
  description: 'Descrição da tarefa 1',
  status: 'pending',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
}

const mockTask2: Task = {
  id: '2',
  title: 'Tarefa de teste 2',
  description: 'Descrição da tarefa 2',
  status: 'completed',
  createdAt: new Date('2023-01-02'),
  updatedAt: new Date('2023-01-02'),
}

const mockTasks: Task[] = [mockTask1, mockTask2]

vi.mock('@/domain/usecases/TaskUseCases', () => ({
  TaskUseCases: vi.fn().mockImplementation(() => ({
    getAllTasks: vi.fn().mockResolvedValue([]),
    createTask: vi.fn().mockResolvedValue({}),
    updateTask: vi.fn().mockResolvedValue({}),
    deleteTask: vi.fn().mockResolvedValue(undefined),
    toggleTaskStatus: vi.fn().mockResolvedValue({}),
  })),
}))

vi.mock('@/infrastructure/repositories/MirageTaskRepository', () => ({
  MirageTaskRepository: vi.fn(),
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useTasks Hook', () => {
  let mockTaskUseCases: {
    getAllTasks: ReturnType<typeof vi.fn>
    createTask: ReturnType<typeof vi.fn>
    updateTask: ReturnType<typeof vi.fn>
    deleteTask: ReturnType<typeof vi.fn>
    toggleTaskStatus: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    useUIStore.setState({
      tasks: [],
      isLoading: false,
      error: null,
    })

    vi.clearAllMocks()

    const MockedTaskUseCases = vi.mocked(TaskUseCases)
    mockTaskUseCases = MockedTaskUseCases.mock.results[0]?.value || {
      getAllTasks: vi.fn(),
      createTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      toggleTaskStatus: vi.fn(),
    }

    mockTaskUseCases.getAllTasks.mockResolvedValue([])
    mockTaskUseCases.createTask.mockResolvedValue(mockTask1)
    mockTaskUseCases.updateTask.mockResolvedValue(mockTask1)
    mockTaskUseCases.deleteTask.mockResolvedValue(undefined)
    mockTaskUseCases.toggleTaskStatus.mockResolvedValue(mockTask1)
  })

  describe('useTasks - Interface básica', () => {
    it('deve retornar estado inicial correto', () => {
      const { result } = renderHook(() => useTasks(), {
        wrapper: createWrapper(),
      })

      expect(result.current.data).toEqual([])
      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBeNull()
      expect(typeof result.current.refetch).toBe('function')
    })
  })

  describe('Store UI - Operações básicas', () => {
    it('deve adicionar tarefa ao store', () => {
      const { addTask } = useUIStore.getState()

      addTask(mockTask1)

      const state = useUIStore.getState()
      expect(state.tasks).toHaveLength(1)
      expect(state.tasks[0]).toEqual(mockTask1)
    })

    it('deve atualizar tarefa no store', () => {
      const { setTasks, updateTask } = useUIStore.getState()

      setTasks([mockTask1])
      updateTask('1', { title: 'Título atualizado' })

      const state = useUIStore.getState()
      const updatedTask = state.tasks.find((task) => task.id === '1')
      expect(updatedTask?.title).toBe('Título atualizado')
    })

    it('deve deletar tarefa do store', () => {
      const { setTasks, deleteTask } = useUIStore.getState()

      setTasks(mockTasks)
      deleteTask('1')

      const state = useUIStore.getState()
      expect(state.tasks).toHaveLength(1)
      expect(state.tasks[0].id).toBe('2')
    })

    it('deve alternar status da tarefa no store', () => {
      const { setTasks, toggleTaskStatus } = useUIStore.getState()

      setTasks([mockTask1])
      toggleTaskStatus('1')

      const state = useUIStore.getState()
      const toggledTask = state.tasks.find((task) => task.id === '1')
      expect(toggledTask?.status).toBe('completed')
    })

    it('deve gerenciar estados de loading e erro', () => {
      const { setLoading, setError } = useUIStore.getState()

      setLoading(true)
      expect(useUIStore.getState().isLoading).toBe(true)

      setLoading(false)
      expect(useUIStore.getState().isLoading).toBe(false)

      const testError = new Error('Erro de teste')
      setError(testError)
      expect(useUIStore.getState().error).toBe(testError)

      setError(null)
      expect(useUIStore.getState().error).toBeNull()
    })
  })

  describe('Integração do Store', () => {
    it('deve manter consistência durante múltiplas operações', () => {
      const { setTasks, addTask, updateTask, deleteTask, toggleTaskStatus } =
        useUIStore.getState()

      setTasks([mockTask1])
      expect(useUIStore.getState().tasks).toHaveLength(1)

      addTask(mockTask2)
      expect(useUIStore.getState().tasks).toHaveLength(2)

      updateTask('1', { title: 'Título atualizado' })
      const updatedTask = useUIStore
        .getState()
        .tasks.find((task) => task.id === '1')
      expect(updatedTask?.title).toBe('Título atualizado')

      toggleTaskStatus('1')
      const toggledTask = useUIStore
        .getState()
        .tasks.find((task) => task.id === '1')
      expect(toggledTask?.status).toBe('completed')

      deleteTask('2')
      expect(useUIStore.getState().tasks).toHaveLength(1)
      expect(useUIStore.getState().tasks[0].id).toBe('1')
    })

    it('deve lidar com operações em tarefas inexistentes', () => {
      const { setTasks, updateTask, deleteTask, toggleTaskStatus } =
        useUIStore.getState()

      setTasks([mockTask1])
      const initialState = useUIStore.getState().tasks

      updateTask('999', { title: 'Não deve atualizar' })
      expect(useUIStore.getState().tasks).toEqual(initialState)

      deleteTask('999')
      expect(useUIStore.getState().tasks).toEqual(initialState)

      toggleTaskStatus('999')
      expect(useUIStore.getState().tasks).toEqual(initialState)
    })

    it('deve preservar propriedades não alteradas durante updates', () => {
      const { setTasks, updateTask } = useUIStore.getState()

      setTasks([mockTask1])
      updateTask('1', { title: 'Novo título' })

      const updatedTask = useUIStore
        .getState()
        .tasks.find((task) => task.id === '1')
      expect(updatedTask?.title).toBe('Novo título')
      expect(updatedTask?.description).toBe(mockTask1.description)
      expect(updatedTask?.status).toBe(mockTask1.status)
      expect(updatedTask?.createdAt).toEqual(mockTask1.createdAt)
    })

    it('deve atualizar updatedAt ao alternar status', () => {
      const { setTasks, toggleTaskStatus } = useUIStore.getState()

      setTasks([mockTask1])
      const originalUpdatedAt = mockTask1.updatedAt

      toggleTaskStatus('1')

      const toggledTask = useUIStore
        .getState()
        .tasks.find((task) => task.id === '1')
      expect(toggledTask?.updatedAt).not.toEqual(originalUpdatedAt)
      expect(toggledTask?.updatedAt).toBeInstanceOf(Date)
    })
  })

  describe('Casos extremos', () => {
    it('deve lidar com lista vazia de tarefas', () => {
      const { setTasks, deleteTask, toggleTaskStatus, updateTask } =
        useUIStore.getState()

      setTasks([])

      deleteTask('1')
      toggleTaskStatus('1')
      updateTask('1', { title: 'teste' })

      expect(useUIStore.getState().tasks).toEqual([])
    })

    it('deve lidar com dados de tarefa incompletos', () => {
      const { addTask } = useUIStore.getState()

      const taskIncompleta: Task = {
        id: '3',
        title: 'Tarefa sem descrição',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      addTask(taskIncompleta)

      const state = useUIStore.getState()
      expect(state.tasks).toHaveLength(1)
      expect(state.tasks[0].description).toBeUndefined()
    })

    it('deve manter ordem das tarefas após operações', () => {
      const { setTasks, updateTask } = useUIStore.getState()

      setTasks(mockTasks)
      updateTask('2', { title: 'Título atualizado' })

      const state = useUIStore.getState()
      expect(state.tasks[0].id).toBe('1')
      expect(state.tasks[1].id).toBe('2')
      expect(state.tasks[1].title).toBe('Título atualizado')
    })
  })
})
