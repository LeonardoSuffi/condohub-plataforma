import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test/testUtils'
import Home from './Home'

// Mock the api module
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn().mockImplementation((url) => {
      if (url === '/public/categories') {
        return Promise.resolve({
          data: {
            data: [
              { id: 1, name: 'Manutencao', slug: 'manutencao', icon: 'wrench' },
              { id: 2, name: 'Limpeza', slug: 'limpeza', icon: 'sparkles' },
            ],
          },
        })
      }
      if (url === '/public/stats') {
        return Promise.resolve({
          data: {
            data: {
              total_services: 100,
              total_categories: 12,
              total_companies: 50,
              total_clients: 200,
              total_deals: 150,
              completed_deals: 80,
            },
          },
        })
      }
      if (url.includes('/public/services')) {
        return Promise.resolve({
          data: {
            data: [
              {
                id: 1,
                title: 'Servico Teste',
                description: 'Descricao teste',
                category: { id: 1, name: 'Manutencao' },
                company: { nome_fantasia: 'Empresa Teste', cidade: 'Sao Paulo', estado: 'SP' },
                price_range: '1000-5000',
              },
            ],
          },
        })
      }
      return Promise.resolve({ data: { data: [] } })
    }),
  },
}))

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the hero section', async () => {
    renderWithProviders(<Home />)

    // Check for hero section content using getAllBy for multiple matches
    const heroTexts = screen.getAllByText(/encontre os melhores prestadores/i)
    expect(heroTexts.length).toBeGreaterThan(0)
  })

  it('renders the search form', async () => {
    renderWithProviders(<Home />)

    // Updated placeholder to match new Home.jsx
    expect(screen.getByPlaceholderText(/o que voce precisa/i)).toBeInTheDocument()
    // There may be multiple "Buscar" buttons, use getAllBy
    const buscarButtons = screen.getAllByRole('button', { name: /buscar/i })
    expect(buscarButtons.length).toBeGreaterThan(0)
  })

  it('renders login and register buttons when not authenticated', async () => {
    renderWithProviders(<Home />, {
      preloadedState: {
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          initialized: true,
        },
      },
    })

    // There may be multiple login/register links, use getAllBy
    const entrarLinks = screen.getAllByRole('link', { name: /entrar/i })
    expect(entrarLinks.length).toBeGreaterThan(0)
  })

  it('renders dashboard button when authenticated', async () => {
    renderWithProviders(<Home />, {
      preloadedState: {
        auth: {
          user: { id: 1, name: 'Test', type: 'cliente' },
          token: 'test-token',
          isAuthenticated: true,
          initialized: true,
        },
      },
    })

    // There may be multiple "acessar painel" links, use getAllBy
    const painelLinks = screen.getAllByRole('link', { name: /acessar painel/i })
    expect(painelLinks.length).toBeGreaterThan(0)
  })

  it('renders how it works section', async () => {
    renderWithProviders(<Home />)

    // How it works section - look for "Como funciona"
    const comoFuncionaTexts = screen.getAllByText(/como funciona/i)
    expect(comoFuncionaTexts.length).toBeGreaterThan(0)
  })

  it('loads and displays categories', async () => {
    renderWithProviders(<Home />)

    await waitFor(() => {
      // Categories are loaded asynchronously - use getAllBy for multiple matches
      const manutencaoTexts = screen.getAllByText(/manutencao/i)
      expect(manutencaoTexts.length).toBeGreaterThan(0)
    }, { timeout: 3000 })
  })

  it('renders CTA section for professionals', async () => {
    renderWithProviders(<Home />)

    // CTA section for professionals - use getAllBy for potential multiple matches
    const ctaTexts = screen.getAllByText(/cadastre sua empresa/i)
    expect(ctaTexts.length).toBeGreaterThan(0)
  })

  it('renders footer with company info', async () => {
    renderWithProviders(<Home />)

    // Footer should contain company name (there might be multiple instances)
    const condohubTexts = screen.getAllByText(/condohub/i)
    expect(condohubTexts.length).toBeGreaterThan(0)
  })

  it('search input updates on typing', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Home />)

    // Updated placeholder to match new Home.jsx
    const searchInput = screen.getByPlaceholderText(/o que voce precisa/i)
    await user.type(searchInput, 'eletrica')

    expect(searchInput).toHaveValue('eletrica')
  })
})
