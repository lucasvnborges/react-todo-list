import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from '@/store/useUIStore'
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

describe('useUIStore', () => {
  beforeEach(() => {
    useUIStore.setState({
      tasks: [],
      isLoading: false,
      error: null,
    })
  })

  describe('Estado Inicial', () => {
    it('deve ter o estado inicial correto', () => {
      const state = useUIStore.getState()

      expect(state.tasks).toEqual([])
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('setTasks', () => {
    it('deve definir as tarefas corretamente', () => {
      const { setTasks } = useUIStore.getState()

      setTasks(mockTasks)

      const state = useUIStore.getState()
      expect(state.tasks).toEqual(mockTasks)
      expect(state.tasks).toHaveLength(2)
    })

    it('deve substituir as tarefas existentes', () => {
      const { setTasks } = useUIStore.getState()

      setTasks([mockTask1])
      expect(useUIStore.getState().tasks).toHaveLength(1)

      setTasks(mockTasks)
      expect(useUIStore.getState().tasks).toEqual(mockTasks)
      expect(useUIStore.getState().tasks).toHaveLength(2)
    })
  })

  describe('addTask', () => {
    it('deve adicionar uma nova tarefa à lista vazia', () => {
      const { addTask } = useUIStore.getState()

      addTask(mockTask1)

      const state = useUIStore.getState()
      expect(state.tasks).toEqual([mockTask1])
      expect(state.tasks).toHaveLength(1)
    })

    it('deve adicionar uma nova tarefa à lista existente', () => {
      const { setTasks, addTask } = useUIStore.getState()

      setTasks([mockTask1])
      addTask(mockTask2)

      const state = useUIStore.getState()
      expect(state.tasks).toEqual([mockTask1, mockTask2])
      expect(state.tasks).toHaveLength(2)
    })
  })

  describe('updateTask', () => {
    beforeEach(() => {
      useUIStore.getState().setTasks(mockTasks)
    })

    it('deve atualizar o título da tarefa', () => {
      const { updateTask } = useUIStore.getState()

      updateTask('1', { title: 'Updated Task Title' })

      const state = useUIStore.getState()
      const updatedTask = state.tasks.find((task) => task.id === '1')
      expect(updatedTask?.title).toBe('Updated Task Title')
      expect(updatedTask?.description).toBe(mockTask1.description)
    })

    it('deve atualizar o status da tarefa', () => {
      const { updateTask } = useUIStore.getState()

      updateTask('1', { status: 'completed' })

      const state = useUIStore.getState()
      const updatedTask = state.tasks.find((task) => task.id === '1')
      expect(updatedTask?.status).toBe('completed')
    })

    it('deve atualizar múltiplos campos', () => {
      const { updateTask } = useUIStore.getState()

      updateTask('1', {
        title: 'New Title',
        description: 'New Description',
        status: 'completed',
      })

      const state = useUIStore.getState()
      const updatedTask = state.tasks.find((task) => task.id === '1')
      expect(updatedTask?.title).toBe('New Title')
      expect(updatedTask?.description).toBe('New Description')
      expect(updatedTask?.status).toBe('completed')
    })

    it('não deve atualizar tarefa inexistente', () => {
      const { updateTask } = useUIStore.getState()
      const initialState = useUIStore.getState().tasks

      updateTask('non-existent', { title: 'Should not update' })

      const state = useUIStore.getState()
      expect(state.tasks).toEqual(initialState)
    })

    it('não deve afetar outras tarefas', () => {
      const { updateTask } = useUIStore.getState()

      updateTask('1', { title: 'Updated Task 1' })

      const state = useUIStore.getState()
      const task2 = state.tasks.find((task) => task.id === '2')
      expect(task2).toEqual(mockTask2)
    })
  })

  describe('deleteTask', () => {
    beforeEach(() => {
      useUIStore.getState().setTasks(mockTasks)
    })

    it('deve deletar tarefa existente', () => {
      const { deleteTask } = useUIStore.getState()

      deleteTask('1')

      const state = useUIStore.getState()
      expect(state.tasks).toHaveLength(1)
      expect(state.tasks[0]).toEqual(mockTask2)
      expect(state.tasks.find((task) => task.id === '1')).toBeUndefined()
    })

    it('não deve afetar outras tarefas ao deletar', () => {
      const { deleteTask } = useUIStore.getState()

      deleteTask('1')

      const state = useUIStore.getState()
      const remainingTask = state.tasks.find((task) => task.id === '2')
      expect(remainingTask).toEqual(mockTask2)
    })

    it('deve lidar com a exclusão de tarefa inexistente', () => {
      const { deleteTask } = useUIStore.getState()
      const initialState = useUIStore.getState().tasks

      deleteTask('non-existent')

      const state = useUIStore.getState()
      expect(state.tasks).toEqual(initialState)
      expect(state.tasks).toHaveLength(2)
    })

    it('deve lidar com a exclusão de lista vazia', () => {
      useUIStore.setState({ tasks: [] })
      const { deleteTask } = useUIStore.getState()

      deleteTask('1')

      const state = useUIStore.getState()
      expect(state.tasks).toEqual([])
    })
  })

  describe('toggleTaskStatus', () => {
    beforeEach(() => {
      useUIStore.getState().setTasks(mockTasks)
    })

    it('deve alternar tarefa pendente para concluída', () => {
      const { toggleTaskStatus } = useUIStore.getState()

      toggleTaskStatus('1')

      const state = useUIStore.getState()
      const toggledTask = state.tasks.find((task) => task.id === '1')
      expect(toggledTask?.status).toBe('completed')
    })

    it('deve alternar tarefa concluída para pendente', () => {
      const { toggleTaskStatus } = useUIStore.getState()

      toggleTaskStatus('2')

      const state = useUIStore.getState()
      const toggledTask = state.tasks.find((task) => task.id === '2')
      expect(toggledTask?.status).toBe('pending')
    })

    it('deve atualizar updatedAt ao alternar status', () => {
      const { toggleTaskStatus } = useUIStore.getState()
      const originalUpdatedAt = mockTask1.updatedAt

      toggleTaskStatus('1')

      const state = useUIStore.getState()
      const toggledTask = state.tasks.find((task) => task.id === '1')
      expect(toggledTask?.updatedAt).not.toEqual(originalUpdatedAt)
      expect(toggledTask?.updatedAt).toBeInstanceOf(Date)
    })

    it('não deve afetar outras tarefas ao alternar', () => {
      const { toggleTaskStatus } = useUIStore.getState()

      toggleTaskStatus('1')

      const state = useUIStore.getState()
      const otherTask = state.tasks.find((task) => task.id === '2')
      expect(otherTask).toEqual(mockTask2)
    })

    it('deve lidar com alternância de tarefa inexistente', () => {
      const { toggleTaskStatus } = useUIStore.getState()
      const initialState = useUIStore.getState().tasks

      toggleTaskStatus('non-existent')

      const state = useUIStore.getState()
      expect(state.tasks).toEqual(initialState)
    })
  })

  describe('setLoading', () => {
    it('deve definir loading como true', () => {
      const { setLoading } = useUIStore.getState()

      setLoading(true)

      const state = useUIStore.getState()
      expect(state.isLoading).toBe(true)
    })

    it('deve definir loading como false', () => {
      const { setLoading } = useUIStore.getState()

      setLoading(true)
      expect(useUIStore.getState().isLoading).toBe(true)

      setLoading(false)
      expect(useUIStore.getState().isLoading).toBe(false)
    })
  })

  describe('setError', () => {
    it('deve definir erro', () => {
      const { setError } = useUIStore.getState()
      const testError = new Error('Test error')

      setError(testError)

      const state = useUIStore.getState()
      expect(state.error).toBe(testError)
      expect(state.error?.message).toBe('Test error')
    })

    it('deve limpar erro definindo como null', () => {
      const { setError } = useUIStore.getState()
      const testError = new Error('Test error')

      setError(testError)
      expect(useUIStore.getState().error).toBe(testError)

      setError(null)
      expect(useUIStore.getState().error).toBeNull()
    })
  })

  describe('Integração da Store', () => {
    it('deve lidar com múltiplas operações em sequência', () => {
      const { setTasks, addTask, updateTask, deleteTask, toggleTaskStatus } =
        useUIStore.getState()

      setTasks([mockTask1])
      expect(useUIStore.getState().tasks).toHaveLength(1)

      addTask(mockTask2)
      expect(useUIStore.getState().tasks).toHaveLength(2)

      updateTask('1', { title: 'Updated Title' })
      const updatedTask = useUIStore
        .getState()
        .tasks.find((task) => task.id === '1')
      expect(updatedTask?.title).toBe('Updated Title')

      toggleTaskStatus('1')
      const toggledTask = useUIStore
        .getState()
        .tasks.find((task) => task.id === '1')
      expect(toggledTask?.status).toBe('completed')

      deleteTask('2')
      expect(useUIStore.getState().tasks).toHaveLength(1)
      expect(useUIStore.getState().tasks[0].id).toBe('1')
    })

    it('deve manter a consistência do estado entre operações', () => {
      const { setTasks, setLoading, setError } = useUIStore.getState()

      setTasks(mockTasks)
      setLoading(true)
      setError(new Error('Test error'))

      const state = useUIStore.getState()
      expect(state.tasks).toEqual(mockTasks)
      expect(state.isLoading).toBe(true)
      expect(state.error?.message).toBe('Test error')
    })
  })
})
