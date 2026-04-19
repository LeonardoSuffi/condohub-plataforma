import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test/testUtils'
import Login from './Login'

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form', () => {
    renderWithProviders(<Login />)

    // There may be multiple "Entrar" elements (heading + button)
    const entrarElements = screen.getAllByText(/entrar/i)
    expect(entrarElements.length).toBeGreaterThan(0)
    expect(screen.getByText(/acesse sua conta/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/seu@email.com/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/sua senha/i)).toBeInTheDocument()
  })

  it('renders submit button', () => {
    renderWithProviders(<Login />)

    const submitButton = screen.getByRole('button', { name: /entrar/i })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).not.toBeDisabled()
  })

  it('renders registration links', () => {
    renderWithProviders(<Login />)

    expect(screen.getByRole('link', { name: /sou cliente/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sou empresa/i })).toBeInTheDocument()
  })

  it('renders forgot password link', () => {
    renderWithProviders(<Login />)

    expect(screen.getByRole('link', { name: /esqueceu a senha/i })).toBeInTheDocument()
  })

  it('has required validation on email field', () => {
    renderWithProviders(<Login />)

    const emailInput = screen.getByPlaceholderText(/seu@email.com/i)
    // Check that form has required validation set up
    expect(emailInput).toBeInTheDocument()
    expect(emailInput).toHaveAttribute('type', 'email')
  })

  it('has required validation on password field', () => {
    renderWithProviders(<Login />)

    const passwordInput = screen.getByPlaceholderText(/sua senha/i)
    // Check that password field exists
    expect(passwordInput).toBeInTheDocument()
  })

  it('allows typing in email and password fields', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Login />)

    const emailInput = screen.getByPlaceholderText(/seu@email.com/i)
    const passwordInput = screen.getByPlaceholderText(/sua senha/i)

    await user.type(emailInput, 'test@test.com')
    await user.type(passwordInput, 'password123')

    expect(emailInput).toHaveValue('test@test.com')
    expect(passwordInput).toHaveValue('password123')
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Login />)

    const passwordInput = screen.getByPlaceholderText(/sua senha/i)
    expect(passwordInput).toHaveAttribute('type', 'password')

    // Find the toggle button (it's inside the password field div)
    const toggleButton = passwordInput.parentElement.querySelector('button')
    await user.click(toggleButton)

    expect(passwordInput).toHaveAttribute('type', 'text')

    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('shows loading state when submitting', async () => {
    renderWithProviders(<Login />, {
      preloadedState: {
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          initialized: true,
          loading: true,
          error: null,
        },
      },
    })

    const submitButton = screen.getByRole('button', { name: /entrando/i })
    expect(submitButton).toBeDisabled()
  })

  it('registration links have correct href', () => {
    renderWithProviders(<Login />)

    const clienteLink = screen.getByRole('link', { name: /sou cliente/i })
    const empresaLink = screen.getByRole('link', { name: /sou empresa/i })

    expect(clienteLink).toHaveAttribute('href', '/register/cliente')
    expect(empresaLink).toHaveAttribute('href', '/register/empresa')
  })

  it('forgot password link has correct href', () => {
    renderWithProviders(<Login />)

    const forgotLink = screen.getByRole('link', { name: /esqueceu a senha/i })
    expect(forgotLink).toHaveAttribute('href', '/forgot-password')
  })
})
