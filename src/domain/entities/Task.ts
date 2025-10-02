export interface Task {
  id: string
  title: string
  description?: string
  status: 'pending' | 'completed'
  createdAt: Date
  updatedAt: Date
}

export interface CreateTaskInput {
  title: string
  description?: string
  status?: 'pending' | 'completed'
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  status?: 'pending' | 'completed'
}
