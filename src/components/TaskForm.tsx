import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CreateTaskInput } from '@/domain/entities/Task'

const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(25, 'Título deve ter menos de 25 caracteres'),
  description: z
    .string()
    .max(100, 'Descrição deve ter menos de 100 caracteres')
    .optional(),
  status: z.enum(['pending', 'completed']),
})

type TaskFormData = z.infer<typeof taskSchema>

interface TaskFormProps {
  onSubmit: (data: CreateTaskInput) => Promise<void>
  isLoading?: boolean
}

export function TaskForm({ onSubmit, isLoading = false }: TaskFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'pending' as const,
    },
  })

  const onSubmitForm = async (data: TaskFormData) => {
    await onSubmit(data)
    reset()
  }

  return (
    <Card className="p-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Adicionar nova tarefa</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-foreground"
            >
              Título *
            </label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Digite o título da tarefa"
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-foreground"
            >
              Descrição
            </label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Digite a descrição da tarefa (opcional)"
              rows={3}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Adicionando...' : 'Adicionar Tarefa'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
