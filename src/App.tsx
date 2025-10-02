import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useToggleTaskStatus,
} from './hooks/useTasks'
import { TaskForm } from './components/TaskForm'
import { TaskList } from './components/TaskList'
import { Card, CardContent } from './components/ui/card'

function App() {
  const { data: tasks = [], isLoading, error } = useTasks()

  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTask()
  const deleteTaskMutation = useDeleteTask()
  const toggleStatusMutation = useToggleTaskStatus()


  const handleCreateTask = async (input: {
    title: string
    description?: string
    status?: 'pending' | 'completed'
  }) => {
    await createTaskMutation.mutateAsync(input)
  }

  const handleUpdateTask = async (
    id: string,
    input: { title?: string; description?: string }
  ) => {
    await updateTaskMutation.mutateAsync({ id, input })
  }

  const handleDeleteTask = async (id: string) => {
    await deleteTaskMutation.mutateAsync(id)
  }

  const handleToggleStatus = async (id: string) => {
    await toggleStatusMutation.mutateAsync(id)
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-destructive mb-2">
                Error
              </h1>
              <p className="text-muted-foreground">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">📝 ToDo App</h1>
          <p className="text-muted-foreground text-lg">
            Simple task management with clean architecture
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <TaskForm
              onSubmit={handleCreateTask}
              isLoading={createTaskMutation.isPending}
            />
          </div>

          <div>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <TaskList
                tasks={tasks}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onToggleTaskStatus={handleToggleStatus}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
