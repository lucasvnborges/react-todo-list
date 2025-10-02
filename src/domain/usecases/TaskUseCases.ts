import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
} from '@/domain/entities/Task'

export interface TaskRepository {
  findAll(): Promise<Task[]>
  findById(id: string): Promise<Task | null>
  create(input: CreateTaskInput): Promise<Task>
  update(id: string, input: UpdateTaskInput): Promise<Task>
  delete(id: string): Promise<void>
}

export class TaskUseCases {
  private repository: TaskRepository

  constructor(repository: TaskRepository) {
    this.repository = repository
  }

  async getAllTasks(): Promise<Task[]> {
    return this.repository.findAll()
  }

  async createTask(input: CreateTaskInput): Promise<Task> {
    const taskData = {
      ...input,
      status: input.status || ('pending' as const),
    }
    return this.repository.create(taskData)
  }

  async updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
    return this.repository.update(id, input)
  }

  async deleteTask(id: string): Promise<void> {
    return this.repository.delete(id)
  }

  async toggleTaskStatus(id: string): Promise<Task> {
    const task = await this.repository.findById(id)
    if (!task) {
      throw new Error(`Task with id ${id} not found`)
    }

    const newStatus = task.status === 'pending' ? 'completed' : 'pending'
    return this.repository.update(id, { status: newStatus })
  }
}
