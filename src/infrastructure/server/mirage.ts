/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServer, Model } from 'miragejs'

interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'completed'
  createdAt: string
  updatedAt: string
}

interface ServerConfig {
  environment?: string
}

const generateId = (): string => Math.random().toString(36).substr(2, 9)

const getCurrentTimestamp = (): string => new Date().toISOString()

const createErrorResponse = (message: string, status: number) =>
  new Response(JSON.stringify({ error: message }), { status })

const createSeedTasks = (server: any): void => {
  const seedTasks: Omit<Task, 'id'>[] = [
    {
      title: 'Bem-vindo ao seu app de tarefas',
      description:
        'Esta é uma tarefa de exemplo. Você pode editá-la ou excluí-la.',
      status: 'pending',
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    },
    {
      title: 'Completar o projeto',
      description:
        'Finalizar a construção da aplicação de tarefas com arquitetura limpa',
      status: 'pending',
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    },
  ]

  seedTasks.forEach((task, index) => {
    server.create('task', {
      ...task,
      id: (index + 1).toString(),
    })
  })
}

const createTaskRoutes = (server: any) => {
  server.get('/tasks', (schema: any) => schema.all('task'))

  server.get('/tasks/:id', (schema: any, request: any) => {
    const { id } = request.params
    return schema.find('task', id)
  })

  server.post('/tasks', (schema: any, request: any) => {
    const attrs = JSON.parse(request.requestBody)
    return schema.create('task', {
      ...attrs,
      id: generateId(),
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    })
  })

  server.patch('/tasks/:id', (schema: any, request: any) => {
    const { id } = request.params
    const attrs = JSON.parse(request.requestBody)
    const task = schema.find('task', id)

    if (!task) {
      return createErrorResponse('Task not found', 404)
    }

    const updatedTask = task.update({
      ...attrs,
      updatedAt: getCurrentTimestamp(),
    })

    return updatedTask ?? createErrorResponse('Update failed', 500)
  })

  server.delete('/tasks/:id', (schema: any, request: any) => {
    const { id } = request.params
    const task = schema.find('task', id)
    task?.destroy()
    return {}
  })
}

export function makeServer({ environment = 'development' }: ServerConfig = {}) {
  return createServer({
    environment,

    models: {
      task: Model,
    },

    seeds(server) {
      createSeedTasks(server)
    },

    routes() {
      this.namespace = 'api'
      createTaskRoutes(this)
    },
  })
}
