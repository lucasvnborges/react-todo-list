import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskItem } from '@/components/TaskItem'
import type { Task } from '@/domain/entities/Task'

Object.defineProperty(window, 'confirm', {
  writable: true,
  value: vi.fn(),
})

describe('TaskItem', () => {
  const mockOnUpdate = vi.fn()
  const mockOnDelete = vi.fn()
  const mockOnToggleStatus = vi.fn()
  const user = userEvent.setup()

  const mockTask: Task = {
    id: '1',
    title: 'Tarefa de teste',
    description: 'Descrição da tarefa de teste',
    status: 'pending',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  }

  const completedTask: Task = {
    ...mockTask,
    id: '2',
    status: 'completed',
  }

  beforeEach(() => {
    mockOnUpdate.mockClear()
    mockOnDelete.mockClear()
    mockOnToggleStatus.mockClear()
    vi.mocked(window.confirm).mockClear()
  })

  it('renders task information correctly', () => {
    render(
      <TaskItem
        task={mockTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    )

    expect(screen.getByText('Tarefa de teste')).toBeInTheDocument()
    expect(screen.getByText('Descrição da tarefa de teste')).toBeInTheDocument()
    expect(screen.getByText('12/31/2022')).toBeInTheDocument()
  })

  it('renders task without description', () => {
    const taskWithoutDescription = { ...mockTask, description: undefined }
    render(
      <TaskItem
        task={taskWithoutDescription}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    )

    expect(screen.getByText('Tarefa de teste')).toBeInTheDocument()
    expect(
      screen.queryByText('Descrição da tarefa de teste')
    ).not.toBeInTheDocument()
  })

  it('shows completed task with proper styling', () => {
    render(
      <TaskItem
        task={completedTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    )

    const title = screen.getByText('Tarefa de teste')
    expect(title).toHaveClass('line-through', 'text-muted-foreground')

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })

  it('toggles task status when checkbox is clicked', async () => {
    mockOnToggleStatus.mockResolvedValue(undefined)
    render(
      <TaskItem
        task={mockTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    )

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    expect(mockOnToggleStatus).toHaveBeenCalledWith('1')
  })

  it('enters edit mode when edit button is clicked', async () => {
    render(
      <TaskItem
        task={mockTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    )

    const buttons = screen.getAllByRole('button', { name: '' })
    const editButton = buttons[0]
    await user.click(editButton)

    expect(screen.getByDisplayValue('Tarefa de teste')).toBeInTheDocument()
    expect(
      screen.getByDisplayValue('Descrição da tarefa de teste')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /cancelar/i })
    ).toBeInTheDocument()
  })

  it('saves changes when save button is clicked', async () => {
    mockOnUpdate.mockResolvedValue(undefined)
    render(
      <TaskItem
        task={mockTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    )

    const buttons = screen.getAllByRole('button', { name: '' })
    const editButton = buttons[0]
    await user.click(editButton)

    const titleInput = screen.getByDisplayValue('Tarefa de teste')
    const descriptionInput = screen.getByDisplayValue(
      'Descrição da tarefa de teste'
    )

    await user.clear(titleInput)
    await user.type(titleInput, 'Título editado')
    await user.clear(descriptionInput)
    await user.type(descriptionInput, 'Descrição editada')

    const saveButton = screen.getByRole('button', { name: /salvar/i })
    await user.click(saveButton)

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith('1', {
        title: 'Título editado',
        description: 'Descrição editada',
      })
    })

    expect(
      screen.queryByRole('button', { name: /salvar/i })
    ).not.toBeInTheDocument()
  })

  it('cancels edit mode when cancel button is clicked', async () => {
    render(
      <TaskItem
        task={mockTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    )

    const buttons = screen.getAllByRole('button', { name: '' })
    const editButton = buttons[0]
    await user.click(editButton)

    const titleInput = screen.getByDisplayValue('Tarefa de teste')
    await user.clear(titleInput)
    await user.type(titleInput, 'Título modificado')

    const cancelButton = screen.getByRole('button', { name: /cancelar/i })
    await user.click(cancelButton)

    expect(
      screen.queryByRole('button', { name: /salvar/i })
    ).not.toBeInTheDocument()
    expect(screen.getByText('Tarefa de teste')).toBeInTheDocument()
    expect(mockOnUpdate).not.toHaveBeenCalled()
  })

  it('deletes task when delete button is clicked and confirmed', async () => {
    vi.mocked(window.confirm).mockReturnValue(true)
    mockOnDelete.mockResolvedValue(undefined)

    render(
      <TaskItem
        task={mockTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    )

    const buttons = screen.getAllByRole('button', { name: '' })
    const deleteButton = buttons[1]
    await user.click(deleteButton)

    expect(window.confirm).toHaveBeenCalledWith(
      'Tem certeza que deseja excluir esta tarefa?'
    )
    expect(mockOnDelete).toHaveBeenCalledWith('1')
  })

  it('does not delete task when delete is not confirmed', async () => {
    vi.mocked(window.confirm).mockReturnValue(false)

    render(
      <TaskItem
        task={mockTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    )

    const buttons = screen.getAllByRole('button', { name: '' })
    const deleteButton = buttons[1]
    await user.click(deleteButton)

    expect(window.confirm).toHaveBeenCalled()
    expect(mockOnDelete).not.toHaveBeenCalled()
  })

  it('hides edit and delete buttons when in edit mode', async () => {
    render(
      <TaskItem
        task={mockTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    )

    expect(screen.getAllByRole('button', { name: '' })).toHaveLength(2)

    const buttons = screen.getAllByRole('button', { name: '' })
    const editButton = buttons[0]
    await user.click(editButton)

    expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /cancelar/i })
    ).toBeInTheDocument()
    expect(screen.queryAllByRole('button', { name: '' })).toHaveLength(0)
  })

  it('applies opacity styling to completed tasks', () => {
    const { container } = render(
      <TaskItem
        task={completedTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    )

    const card = container.querySelector('.opacity-75')
    expect(card).toBeInTheDocument()
  })

  it('handles task with empty description in edit mode', async () => {
    const taskWithEmptyDescription = { ...mockTask, description: '' }
    render(
      <TaskItem
        task={taskWithEmptyDescription}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    )

    const buttons = screen.getAllByRole('button', { name: '' })
    const editButton = buttons[0]
    await user.click(editButton)

    const descriptionInput = screen.getByPlaceholderText('Descrição da tarefa')
    expect(descriptionInput).toHaveValue('')
  })
})
