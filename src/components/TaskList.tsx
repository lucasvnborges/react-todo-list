import { CheckCircle2, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Task, UpdateTaskInput } from '@/domain/entities/Task'
import { TaskItem } from '@/components/TaskItem'

interface TaskListProps {
  tasks: Task[]
  onUpdateTask: (id: string, data: UpdateTaskInput) => Promise<void>
  onDeleteTask: (id: string) => Promise<void>
  onToggleTaskStatus: (id: string) => Promise<void>
}

export function TaskList({
  tasks,
  onUpdateTask,
  onDeleteTask,
  onToggleTaskStatus,
}: TaskListProps) {
  const pendingTasks = tasks.filter((task) => task.status === 'pending')
  const completedTasks = tasks.filter((task) => task.status === 'completed')

  if (tasks.length === 0) {
    return (
      <Card className="p-12 text-center">
        <CardContent className="p-0">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            Nenhuma tarefa ainda
          </h3>
          <p className="text-muted-foreground">
            Crie sua primeira tarefa para começar!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <CardContent className="p-0">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {pendingTasks.length}
                </p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardContent className="p-0">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {completedTasks.length}
                </p>
                <p className="text-xs text-muted-foreground">Concluídas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {pendingTasks.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-foreground">
            <Clock className="h-5 w-5 text-orange-500" />
            Tarefas pendentes ({pendingTasks.length})
          </h2>
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
                onToggleStatus={onToggleTaskStatus}
              />
            ))}
          </div>
        </div>
      )}

      {completedTasks.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-foreground">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Tarefas concluídas ({completedTasks.length})
          </h2>
          <div className="space-y-3">
            {completedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
                onToggleStatus={onToggleTaskStatus}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
