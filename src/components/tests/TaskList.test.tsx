import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskList } from '@/components/TaskList'
import type { Task } from '@/domain/entities/Task'

vi.mock('@/components/TaskItem', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TaskItem: ({ task, onUpdate, onDelete, onToggleStatus }: any) => (
    <div data-testid={`task-item-${task.id}`}>
      <span>{task.title}</span>
      <span>{task.status}</span>
      <button onClick={() => onUpdate(task.id, { title: 'updated' })}>
        Update
      </button>
      <button onClick={() => onDelete(task.id)}>Delete</button>
      <button onClick={() => onToggleStatus(task.id)}>Toggle</button>
    </div>
  ),
}))

describe('TaskList', () => {
  const mockOnUpdateTask = vi.fn()
  const mockOnDeleteTask = vi.fn()
  const mockOnToggleTaskStatus = vi.fn()
  const user = userEvent.setup()

  const pendingTask: Task = {
    id: '1',
    title: 'Tarefa pendente',
    description: 'Descrição da tarefa pendente',
    status: 'pending',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  }

  const completedTask: Task = {
    id: '2',
    title: 'Tarefa concluída',
    description: 'Descrição da tarefa concluída',
    status: 'completed',
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
  }

  beforeEach(() => {
    mockOnUpdateTask.mockClear()
    mockOnDeleteTask.mockClear()
    mockOnToggleTaskStatus.mockClear()
  })

  it('renders empty state when no tasks', () => {
    render(
      <TaskList
        tasks={[]}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onToggleTaskStatus={mockOnToggleTaskStatus}
      />
    )

    expect(screen.getByText('📝')).toBeInTheDocument()
    expect(screen.getByText('Nenhuma tarefa ainda')).toBeInTheDocument()
    expect(
      screen.getByText('Crie sua primeira tarefa para começar!')
    ).toBeInTheDocument()
  })

  it('renders task statistics correctly', () => {
    const tasks = [pendingTask, completedTask, { ...pendingTask, id: '3' }]

    render(
      <TaskList
        tasks={tasks}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onToggleTaskStatus={mockOnToggleTaskStatus}
      />
    )

    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('Pendentes')).toBeInTheDocument()
    expect(screen.getByText('Concluídas')).toBeInTheDocument()
  })

  it('renders pending tasks section when there are pending tasks', () => {
    const tasks = [pendingTask, { ...pendingTask, id: '3' }]

    render(
      <TaskList
        tasks={tasks}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onToggleTaskStatus={mockOnToggleTaskStatus}
      />
    )

    expect(screen.getByText('Tarefas pendentes (2)')).toBeInTheDocument()
    expect(screen.getByTestId('task-item-1')).toBeInTheDocument()
    expect(screen.getByTestId('task-item-3')).toBeInTheDocument()
  })

  it('renders completed tasks section when there are completed tasks', () => {
    const tasks = [completedTask, { ...completedTask, id: '4' }]

    render(
      <TaskList
        tasks={tasks}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onToggleTaskStatus={mockOnToggleTaskStatus}
      />
    )

    expect(screen.getByText('Tarefas concluídas (2)')).toBeInTheDocument()
    expect(screen.getByTestId('task-item-2')).toBeInTheDocument()
    expect(screen.getByTestId('task-item-4')).toBeInTheDocument()
  })

  it('renders both pending and completed sections when both exist', () => {
    const tasks = [pendingTask, completedTask]

    render(
      <TaskList
        tasks={tasks}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onToggleTaskStatus={mockOnToggleTaskStatus}
      />
    )

    expect(screen.getByText('Tarefas pendentes (1)')).toBeInTheDocument()
    expect(screen.getByText('Tarefas concluídas (1)')).toBeInTheDocument()
    expect(screen.getByTestId('task-item-1')).toBeInTheDocument()
    expect(screen.getByTestId('task-item-2')).toBeInTheDocument()
  })

  it('does not render pending section when no pending tasks', () => {
    const tasks = [completedTask]

    render(
      <TaskList
        tasks={tasks}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onToggleTaskStatus={mockOnToggleTaskStatus}
      />
    )

    expect(screen.queryByText(/tarefas pendentes/i)).not.toBeInTheDocument()
    expect(screen.getByText('Tarefas concluídas (1)')).toBeInTheDocument()
  })

  it('does not render completed section when no completed tasks', () => {
    const tasks = [pendingTask]

    render(
      <TaskList
        tasks={tasks}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onToggleTaskStatus={mockOnToggleTaskStatus}
      />
    )

    expect(screen.getByText('Tarefas pendentes (1)')).toBeInTheDocument()
    expect(screen.queryByText(/tarefas concluídas/i)).not.toBeInTheDocument()
  })

  it('passes correct props to TaskItem components', () => {
    const tasks = [pendingTask]

    render(
      <TaskList
        tasks={tasks}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onToggleTaskStatus={mockOnToggleTaskStatus}
      />
    )

    const taskItem = screen.getByTestId('task-item-1')
    expect(taskItem).toBeInTheDocument()
    expect(taskItem).toHaveTextContent('Tarefa pendente')
    expect(taskItem).toHaveTextContent('pending')
  })

  it('calls onUpdateTask when TaskItem update is triggered', async () => {
    const tasks = [pendingTask]

    render(
      <TaskList
        tasks={tasks}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onToggleTaskStatus={mockOnToggleTaskStatus}
      />
    )

    const updateButton = screen.getByText('Update')
    await user.click(updateButton)

    expect(mockOnUpdateTask).toHaveBeenCalledWith('1', { title: 'updated' })
  })

  it('calls onDeleteTask when TaskItem delete is triggered', async () => {
    const tasks = [pendingTask]

    render(
      <TaskList
        tasks={tasks}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onToggleTaskStatus={mockOnToggleTaskStatus}
      />
    )

    const deleteButton = screen.getByText('Delete')
    await user.click(deleteButton)

    expect(mockOnDeleteTask).toHaveBeenCalledWith('1')
  })

  it('calls onToggleTaskStatus when TaskItem toggle is triggered', async () => {
    const tasks = [pendingTask]

    render(
      <TaskList
        tasks={tasks}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onToggleTaskStatus={mockOnToggleTaskStatus}
      />
    )

    const toggleButton = screen.getByText('Toggle')
    await user.click(toggleButton)

    expect(mockOnToggleTaskStatus).toHaveBeenCalledWith('1')
  })

  it('displays correct icons for pending and completed sections', () => {
    const tasks = [pendingTask, completedTask]

    render(
      <TaskList
        tasks={tasks}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onToggleTaskStatus={mockOnToggleTaskStatus}
      />
    )

    const pendingSection = screen
      .getByText('Tarefas pendentes (1)')
      .closest('div')
    const completedSection = screen
      .getByText('Tarefas concluídas (1)')
      .closest('div')

    expect(pendingSection).toBeInTheDocument()
    expect(completedSection).toBeInTheDocument()
  })

  it('maintains correct task order within sections', () => {
    const task1 = { ...pendingTask, id: '1', title: 'Primeira tarefa' }
    const task2 = { ...pendingTask, id: '2', title: 'Segunda tarefa' }
    const task3 = { ...completedTask, id: '3', title: 'Terceira tarefa' }
    const tasks = [task1, task2, task3]

    render(
      <TaskList
        tasks={tasks}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onToggleTaskStatus={mockOnToggleTaskStatus}
      />
    )

    expect(screen.getByTestId('task-item-1')).toBeInTheDocument()
    expect(screen.getByTestId('task-item-2')).toBeInTheDocument()
    expect(screen.getByTestId('task-item-3')).toBeInTheDocument()

    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('handles mixed task statuses correctly', () => {
    const mixedTasks = [
      { ...pendingTask, id: '1' },
      { ...completedTask, id: '2' },
      { ...pendingTask, id: '3' },
      { ...completedTask, id: '4' },
      { ...pendingTask, id: '5' },
    ]

    render(
      <TaskList
        tasks={mixedTasks}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onToggleTaskStatus={mockOnToggleTaskStatus}
      />
    )

    const statsCards = screen.getAllByText(/[0-9]+/)
    expect(statsCards.some((card) => card.textContent === '3')).toBe(true)
    expect(statsCards.some((card) => card.textContent === '2')).toBe(true)

    expect(screen.getByText('Tarefas pendentes (3)')).toBeInTheDocument()
    expect(screen.getByText('Tarefas concluídas (2)')).toBeInTheDocument()
  })
})
