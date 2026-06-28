import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'

const mockUser = vi.fn()

vi.mock('../stores/useAuthStore', () => ({
  useAuthStore: (selector: (s: { user: unknown }) => unknown) =>
    selector({ user: mockUser() }),
}))

describe('ProtectedRoute', () => {
  it('redirects to /login when no user', () => {
    mockUser.mockReturnValue(null)

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <ProtectedRoute><div>Protected content</div></ProtectedRoute>
      </MemoryRouter>
    )

    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('renders children when user has required role', () => {
    mockUser.mockReturnValue({ role: 'admin' })

    render(
      <MemoryRouter>
        <ProtectedRoute roles={['admin']}><div>Admin content</div></ProtectedRoute>
      </MemoryRouter>
    )

    expect(screen.getByText('Admin content')).toBeInTheDocument()
  })

  it('shows denied message when user lacks required role', () => {
    mockUser.mockReturnValue({ role: 'bibliotecario' })

    render(
      <MemoryRouter>
        <ProtectedRoute roles={['admin']}><div>Admin content</div></ProtectedRoute>
      </MemoryRouter>
    )

    expect(screen.getByText(/Acceso denegado/)).toBeInTheDocument()
  })
})
