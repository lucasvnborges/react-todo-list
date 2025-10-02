import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'

vi.mock('./hooks/useTasks', () => ({
  useTasks: () => ({ data: [], isLoading: false, error: null }),
  useCreateTask: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateTask: () => ({ mutateAsync: vi.fn() }),
  useDeleteTask: () => ({ mutateAsync: vi.fn() }),
  useToggleTaskStatus: () => ({ mutateAsync: vi.fn() }),
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('App', () => {
  it('renders without crashing', () => {
    const Wrapper = createWrapper()
    render(<App />, { wrapper: Wrapper })

    expect(screen.getByText(/ToDo App/i)).toBeInTheDocument()
    expect(
      screen.getByText(/Simple task management with clean architecture/i)
    ).toBeInTheDocument()
  })
})
