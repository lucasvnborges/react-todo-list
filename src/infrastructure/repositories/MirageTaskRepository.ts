import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
} from "@/domain/entities/Task";
import type { TaskRepository } from "@/domain/usecases/TaskUseCases";

export class MirageTaskRepository implements TaskRepository {
  private baseUrl = "/api/tasks";

  async findAll(): Promise<Task[]> {
    const response = await fetch(this.baseUrl);
    const data = await response.json();
    return data.tasks.map(this.mapToTask);
  }

  async findById(id: string): Promise<Task | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      if (!response.ok) return null;
      const data = await response.json();
      return this.mapToTask(data.task);
    } catch {
      return null;
    }
  }

  async create(input: CreateTaskInput): Promise<Task> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...input,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    });
    const data = await response.json();
    return this.mapToTask(data.task);
  }

  async update(id: string, input: UpdateTaskInput): Promise<Task> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...input,
        updatedAt: new Date().toISOString(),
      }),
    });
    const data = await response.json();
    return this.mapToTask(data.task);
  }

  async delete(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
    });
  }

  private mapToTask(
    data: Omit<Task, "createdAt" | "updatedAt"> & {
      createdAt: string;
      updatedAt: string;
    }
  ): Task {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }
}
