import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Task } from '@/domain/entities/Task'

interface UIState {
  tasks: Task[]
  isLoading: boolean
  error: Error | null

  // Actions
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleTaskStatus: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: Error | null) => void
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      // Initial state
      tasks: [],
      isLoading: false,
      error: null,

      // Actions
      setTasks: (tasks) => set({ tasks }),

      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, task],
        })),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      toggleTaskStatus: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  status: task.status === 'pending' ? 'completed' : 'pending',
                  updatedAt: new Date(),
                }
              : task
          ),
        })),

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'ui-store',
    }
  )
)
