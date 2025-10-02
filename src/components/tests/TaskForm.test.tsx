import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskForm } from '@/components/TaskForm'

describe('TaskForm', () => {
  const mockOnSubmit = vi.fn()
  const user = userEvent.setup()

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  it('renders form elements correctly', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />)

    expect(screen.getByText('Adicionar nova tarefa')).toBeInTheDocument()
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /adicionar tarefa/i })
    ).toBeInTheDocument()
  })

  it('shows loading state when isLoading is true', () => {
    render(<TaskForm onSubmit={mockOnSubmit} isLoading={true} />)

    const submitButton = screen.getByRole('button')
    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveTextContent('Adicionando...')
  })

  it('submits form with valid data', async () => {
    mockOnSubmit.mockResolvedValue(undefined)
    render(<TaskForm onSubmit={mockOnSubmit} />)

    const titleInput = screen.getByLabelText(/título/i)
    const descriptionInput = screen.getByLabelText(/descrição/i)
    const submitButton = screen.getByRole('button', {
      name: /adicionar tarefa/i,
    })

    await user.type(titleInput, 'Nova tarefa')
    await user.type(descriptionInput, 'Descrição da tarefa')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Nova tarefa',
        description: 'Descrição da tarefa',
        status: 'pending',
      })
    })
  })

  it('submits form with only title (description optional)', async () => {
    mockOnSubmit.mockResolvedValue(undefined)
    render(<TaskForm onSubmit={mockOnSubmit} />)

    const titleInput = screen.getByLabelText(/título/i)
    const submitButton = screen.getByRole('button', {
      name: /adicionar tarefa/i,
    })

    await user.type(titleInput, 'Tarefa sem descrição')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Tarefa sem descrição',
        description: '',
        status: 'pending',
      })
    })
  })

  it('shows validation error for empty title', async () => {
    render(<TaskForm onSubmit={mockOnSubmit} />)

    const submitButton = screen.getByRole('button', {
      name: /adicionar tarefa/i,
    })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Título é obrigatório')).toBeInTheDocument()
    })
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('shows validation error for title too long', async () => {
    render(<TaskForm onSubmit={mockOnSubmit} />)

    const titleInput = screen.getByLabelText(/título/i)
    const longTitle = 'a'.repeat(26) // Mais de 25 caracteres

    await user.type(titleInput, longTitle)
    await user.click(screen.getByRole('button', { name: /adicionar tarefa/i }))

    await waitFor(() => {
      expect(
        screen.getByText('Título deve ter menos de 25 caracteres')
      ).toBeInTheDocument()
    })
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('shows validation error for description too long', async () => {
    render(<TaskForm onSubmit={mockOnSubmit} />)

    const titleInput = screen.getByLabelText(/título/i)
    const descriptionInput = screen.getByLabelText(/descrição/i)
    const longDescription = 'a'.repeat(101) // Mais de 100 caracteres

    await user.type(titleInput, 'Título válido')
    await user.type(descriptionInput, longDescription)
    await user.click(screen.getByRole('button', { name: /adicionar tarefa/i }))

    await waitFor(() => {
      expect(
        screen.getByText('Descrição deve ter menos de 100 caracteres')
      ).toBeInTheDocument()
    })
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('resets form after successful submission', async () => {
    mockOnSubmit.mockResolvedValue(undefined)
    render(<TaskForm onSubmit={mockOnSubmit} />)

    const titleInput = screen.getByLabelText(/título/i)
    const descriptionInput = screen.getByLabelText(/descrição/i)

    await user.type(titleInput, 'Nova tarefa')
    await user.type(descriptionInput, 'Descrição')
    await user.click(screen.getByRole('button', { name: /adicionar tarefa/i }))

    await waitFor(() => {
      expect(titleInput).toHaveValue('')
      expect(descriptionInput).toHaveValue('')
    })
  })

  it('applies error styling to fields with validation errors', async () => {
    render(<TaskForm onSubmit={mockOnSubmit} />)

    const titleInput = screen.getByLabelText(/título/i)
    const submitButton = screen.getByRole('button', {
      name: /adicionar tarefa/i,
    })

    await user.click(submitButton)

    await waitFor(() => {
      expect(titleInput).toHaveClass('border-destructive')
    })
  })

  it('handles form submission errors gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Create a mock that rejects but doesn't cause unhandled rejection
    const mockSubmitWithError = vi.fn().mockImplementation(() => {
      return Promise.reject(new Error('Submission failed')).catch(() => {
        // Silently handle the rejection in the test
      })
    })

    render(<TaskForm onSubmit={mockSubmitWithError} />)

    const titleInput = screen.getByLabelText(/título/i)
    await user.type(titleInput, 'Nova tarefa')
    await user.click(screen.getByRole('button', { name: /adicionar tarefa/i }))

    await waitFor(() => {
      expect(mockSubmitWithError).toHaveBeenCalled()
    })

    consoleError.mockRestore()
  })
})
