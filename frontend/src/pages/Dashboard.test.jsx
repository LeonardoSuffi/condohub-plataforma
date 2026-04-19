import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, mockClienteUser, mockEmpresaUser } from '../test/testUtils'
import Dashboard from './Dashboard'

// Mock the api module - don't override user from /users/me to keep preloaded state
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn().mockImplementation((url) => {
      if (url === '/deals' || url.startsWith('/deals')) {
        return Promise.resolve({
          data: {
            data: [
              { id: 1, status: 'negociando', service: { title: 'Servico 1' }, anon_handle_a: 'Empresa #123', anon_handle_b: 'Cliente #456' },
            ],
            meta: { total: 1 },
          },
        })
      }
      if (url === '/users/me') {
        // Return null so preloaded state user is preserved
        return Promise.resolve({
          data: {
            data: null,
          },
        })
      }
      if (url === '/public/categories') {
        return Promise.resolve({
          data: {
            data: [
              { id: 1, name: 'Manutencao', slug: 'manutencao' },
              { id: 2, name: 'Limpeza', slug: 'limpeza' },
            ],
          },
        })
      }
      if (url === '/public/companies' || url.startsWith('/public/companies')) {
        return Promise.resolve({
          data: {
            data: [
              { id: 1, nome_fantasia: 'Empresa Teste', cidade: 'Sao Paulo' },
            ],
          },
        })
      }
      return Promise.resolve({ data: { data: [] } })
    }),
  },
}))

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially', () => {
    renderWithProviders(<Dashboard />, {
      preloadedState: {
        auth: {
          user: mockClienteUser,
          token: 'test-token',
          isAuthenticated: true,
          initialized: true,
        },
      },
    })

    // Loading state shows a spinner with animate-spin class
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('renders welcome message with user name', async () => {
    renderWithProviders(<Dashboard />, {
      preloadedState: {
        auth: {
          user: { ...mockClienteUser, name: 'Joao Silva' },
          token: 'test-token',
          isAuthenticated: true,
          initialized: true,
        },
      },
    })

    await waitFor(() => {
      // Component shows "Ola, {firstName}!"
      expect(screen.getByText(/Ola, Joao/i)).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('renders personalized message for cliente user', async () => {
    renderWithProviders(<Dashboard />, {
      preloadedState: {
        auth: {
          user: mockClienteUser,
          token: 'test-token',
          isAuthenticated: true,
          initialized: true,
        },
      },
    })

    await waitFor(() => {
      // Component says "Encontre os melhores profissionais para seu condominio"
      expect(screen.getByText(/encontre os melhores profissionais/i)).toBeInTheDocument()
    })
  })

  it('renders personalized message for empresa user', async () => {
    renderWithProviders(<Dashboard />, {
      preloadedState: {
        auth: {
          user: mockEmpresaUser,
          token: 'test-token',
          isAuthenticated: true,
          initialized: true,
        },
      },
    })

    // Wait for the greeting to appear
    await waitFor(() => {
      expect(screen.getByText(/Ola,/i)).toBeInTheDocument()
    }, { timeout: 5000 })

    // Verify the empresa message
    expect(screen.getByText(/gerencie suas negociacoes/i)).toBeInTheDocument()
  })

  it('renders stats cards', async () => {
    renderWithProviders(<Dashboard />, {
      preloadedState: {
        auth: {
          user: mockClienteUser,
          token: 'test-token',
          isAuthenticated: true,
          initialized: true,
        },
      },
    })

    await waitFor(() => {
      // Stats cards - use getAllBy for potential multiple matches
      const negociacoesTexts = screen.getAllByText(/negociacoes/i)
      expect(negociacoesTexts.length).toBeGreaterThan(0)
    }, { timeout: 5000 })
  })

  it('renders quick actions for cliente', async () => {
    renderWithProviders(<Dashboard />, {
      preloadedState: {
        auth: {
          user: mockClienteUser,
          token: 'test-token',
          isAuthenticated: true,
          initialized: true,
        },
      },
    })

    await waitFor(() => {
      // Component shows "Buscar Empresas" button for cliente
      const searchTexts = screen.getAllByText(/buscar empresas/i)
      expect(searchTexts.length).toBeGreaterThan(0)
    })
  })

  it('renders quick actions for empresa', async () => {
    renderWithProviders(<Dashboard />, {
      preloadedState: {
        auth: {
          user: mockEmpresaUser,
          token: 'test-token',
          isAuthenticated: true,
          initialized: true,
        },
      },
    })

    await waitFor(() => {
      // Component shows "Meus Servicos" link for empresa
      const servicosTexts = screen.getAllByText(/meus servicos/i)
      expect(servicosTexts.length).toBeGreaterThan(0)
    }, { timeout: 5000 })

    // Verify the greeting
    expect(screen.getByText(/Ola,/i)).toBeInTheDocument()
  })

  it('renders search services button for cliente', async () => {
    renderWithProviders(<Dashboard />, {
      preloadedState: {
        auth: {
          user: mockClienteUser,
          token: 'test-token',
          isAuthenticated: true,
          initialized: true,
        },
      },
    })

    await waitFor(() => {
      // Component shows "Buscar Empresas" link for cliente
      const searchLinks = screen.getAllByRole('link', { name: /buscar empresas/i })
      expect(searchLinks.length).toBeGreaterThan(0)
    }, { timeout: 5000 })
  })

  it('renders create service button for empresa', async () => {
    renderWithProviders(<Dashboard />, {
      preloadedState: {
        auth: {
          user: mockEmpresaUser,
          token: 'test-token',
          isAuthenticated: true,
          initialized: true,
        },
      },
    })

    // Wait for "Cadastrar Servico" button to appear
    await waitFor(() => {
      expect(screen.getByText(/cadastrar servico/i)).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('renders recent deals section', async () => {
    renderWithProviders(<Dashboard />, {
      preloadedState: {
        auth: {
          user: mockClienteUser,
          token: 'test-token',
          isAuthenticated: true,
          initialized: true,
        },
      },
    })

    await waitFor(() => {
      expect(screen.getByText(/negociacoes recentes/i)).toBeInTheDocument()
    })
  })

  it('displays user type correctly for cliente', async () => {
    renderWithProviders(<Dashboard />, {
      preloadedState: {
        auth: {
          user: { ...mockClienteUser, type: 'cliente' },
          token: 'test-token',
          isAuthenticated: true,
          initialized: true,
        },
      },
    })

    await waitFor(() => {
      // Component shows "Area do Cliente"
      expect(screen.getByText(/area do cliente/i)).toBeInTheDocument()
    })
  })

  it('displays user type correctly for prestador', async () => {
    renderWithProviders(<Dashboard />, {
      preloadedState: {
        auth: {
          user: { ...mockEmpresaUser, type: 'empresa' },
          token: 'test-token',
          isAuthenticated: true,
          initialized: true,
        },
      },
    })

    await waitFor(() => {
      // Component shows "Area do Parceiro" for empresa
      expect(screen.getByText(/area do parceiro/i)).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('renders admin quick actions when user is admin', async () => {
    renderWithProviders(<Dashboard />, {
      preloadedState: {
        auth: {
          user: { id: 1, name: 'Admin', type: 'admin' },
          token: 'test-token',
          isAuthenticated: true,
          initialized: true,
        },
      },
    })

    await waitFor(() => {
      // Component shows "Painel Administrativo" for admin
      expect(screen.getByText(/painel administrativo/i)).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('shows stats when user is logged in', async () => {
    renderWithProviders(<Dashboard />, {
      preloadedState: {
        auth: {
          user: { id: 1, name: 'Test', type: 'cliente' },
          token: 'test-token',
          isAuthenticated: true,
          initialized: true,
        },
      },
    })

    await waitFor(() => {
      // Component shows stats section with "Total Negociacoes"
      expect(screen.getByText(/total negociacoes/i)).toBeInTheDocument()
    })
  })
})
