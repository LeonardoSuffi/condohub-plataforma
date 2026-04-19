import { http, HttpResponse } from 'msw'
import { mockEmpresaUser, mockClienteUser, mockService, mockDeal, mockNotification } from '../testUtils'

// Base URL for API - use relative path to match axios baseURL
const API_BASE = '/api'

// ========================================
// Auth Handlers
// ========================================

const authHandlers = [
  // Login
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = await request.json()
    const { email, password } = body

    // Simulate successful login
    if (email === 'empresa@test.com' && password === 'password') {
      return HttpResponse.json({
        success: true,
        data: {
          user: mockEmpresaUser,
          token: 'fake-jwt-token-empresa',
        },
      })
    }

    if (email === 'cliente@test.com' && password === 'password') {
      return HttpResponse.json({
        success: true,
        data: {
          user: mockClienteUser,
          token: 'fake-jwt-token-cliente',
        },
      })
    }

    // Invalid credentials
    return HttpResponse.json(
      {
        success: false,
        message: 'Credenciais invalidas',
      },
      { status: 422 }
    )
  }),

  // Register
  http.post(`${API_BASE}/auth/register`, async ({ request }) => {
    const body = await request.json()

    return HttpResponse.json({
      success: true,
      data: {
        user: {
          id: 999,
          name: body.name,
          email: body.email,
          type: body.type,
        },
        token: 'fake-jwt-token-new-user',
      },
    })
  }),

  // Logout
  http.post(`${API_BASE}/auth/logout`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Logout realizado com sucesso',
    })
  }),

  // Get current user
  http.get(`${API_BASE}/auth/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, message: 'Nao autenticado' },
        { status: 401 }
      )
    }

    // Return based on token
    if (authHeader.includes('empresa')) {
      return HttpResponse.json({
        success: true,
        data: mockEmpresaUser,
      })
    }

    return HttpResponse.json({
      success: true,
      data: mockClienteUser,
    })
  }),

  // Extend session
  http.post(`${API_BASE}/auth/extend-session`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      },
    })
  }),
]

// ========================================
// Services Handlers
// ========================================

const servicesHandlers = [
  // List services
  http.get(`${API_BASE}/services`, ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const perPage = parseInt(url.searchParams.get('per_page') || '10')

    return HttpResponse.json({
      success: true,
      data: [mockService],
      meta: {
        current_page: page,
        per_page: perPage,
        total: 1,
        last_page: 1,
      },
    })
  }),

  // Get single service
  http.get(`${API_BASE}/services/:id`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: { ...mockService, id: parseInt(params.id) },
    })
  }),

  // Create service
  http.post(`${API_BASE}/services`, async ({ request }) => {
    const body = await request.json()

    return HttpResponse.json({
      success: true,
      data: {
        id: 999,
        ...body,
        status: 'ativo',
        created_at: new Date().toISOString(),
      },
    })
  }),

  // Update service
  http.put(`${API_BASE}/services/:id`, async ({ request, params }) => {
    const body = await request.json()

    return HttpResponse.json({
      success: true,
      data: {
        ...mockService,
        id: parseInt(params.id),
        ...body,
      },
    })
  }),

  // Delete service
  http.delete(`${API_BASE}/services/:id`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Servico removido com sucesso',
    })
  }),
]

// ========================================
// Deals Handlers
// ========================================

const dealsHandlers = [
  // List deals
  http.get(`${API_BASE}/deals`, () => {
    return HttpResponse.json({
      success: true,
      data: [mockDeal],
    })
  }),

  // Get single deal
  http.get(`${API_BASE}/deals/:id`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: { ...mockDeal, id: parseInt(params.id) },
    })
  }),

  // Create deal
  http.post(`${API_BASE}/deals`, async ({ request }) => {
    const body = await request.json()

    return HttpResponse.json({
      success: true,
      data: {
        id: 999,
        status: 'aberto',
        service_id: body.service_id,
        created_at: new Date().toISOString(),
      },
    })
  }),

  // Update deal status
  http.patch(`${API_BASE}/deals/:id/status`, async ({ request, params }) => {
    const body = await request.json()

    return HttpResponse.json({
      success: true,
      data: {
        ...mockDeal,
        id: parseInt(params.id),
        status: body.status,
      },
    })
  }),

  // Send message
  http.post(`${API_BASE}/deals/:id/messages`, async ({ request, params }) => {
    const body = await request.json()

    return HttpResponse.json({
      success: true,
      data: {
        id: 999,
        deal_id: parseInt(params.id),
        content: body.content,
        sender_type: 'empresa',
        created_at: new Date().toISOString(),
      },
    })
  }),
]

// ========================================
// Subscription Handlers
// ========================================

const subscriptionHandlers = [
  // Get current subscription
  http.get(`${API_BASE}/subscription`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: 1,
        status: 'ativa',
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        interactions_used: 5,
        plan: {
          id: 1,
          name: 'Gratuito',
          slug: 'gratuito',
          price: 0,
          max_interactions: 10,
        },
      },
    })
  }),

  // Get available plans
  http.get(`${API_BASE}/plans`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 1,
          name: 'Gratuito',
          slug: 'gratuito',
          price: 0,
          billing_cycle: 'mensal',
          max_interactions: 10,
          features: ['basic'],
        },
        {
          id: 2,
          name: 'Plus',
          slug: 'plus',
          price: 99.00,
          billing_cycle: 'mensal',
          max_interactions: 100,
          features: ['all'],
        },
        {
          id: 3,
          name: 'Premium',
          slug: 'premium',
          price: 199.00,
          billing_cycle: 'mensal',
          max_interactions: 500,
          features: ['all', 'priority'],
        },
      ],
    })
  }),

  // Change plan
  http.post(`${API_BASE}/subscription/change-plan`, async ({ request }) => {
    const body = await request.json()

    return HttpResponse.json({
      success: true,
      message: 'Plano alterado com sucesso',
      data: {
        id: 1,
        plan_id: body.plan_id,
        status: 'ativa',
      },
    })
  }),

  // Cancel subscription
  http.post(`${API_BASE}/subscription/cancel`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Assinatura cancelada com sucesso',
    })
  }),
]

// ========================================
// Notifications Handlers
// ========================================

const notificationHandlers = [
  // List notifications
  http.get(`${API_BASE}/notifications`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        notifications: {
          data: [mockNotification],
        },
        unread_count: 1,
      },
    })
  }),

  // Unread count
  http.get(`${API_BASE}/notifications/unread-count`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        count: 1,
      },
    })
  }),

  // Mark as read
  http.patch(`${API_BASE}/notifications/:id/read`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: {
        ...mockNotification,
        id: parseInt(params.id),
        read_at: new Date().toISOString(),
      },
    })
  }),

  // Mark all as read
  http.post(`${API_BASE}/notifications/mark-all-read`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Todas as notificacoes foram marcadas como lidas',
    })
  }),

  // Delete notification
  http.delete(`${API_BASE}/notifications/:id`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      message: 'Notificacao excluida com sucesso',
    })
  }),
]

// ========================================
// Finance Handlers
// ========================================

const financeHandlers = [
  // Get finance summary
  http.get(`${API_BASE}/finance/summary`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        total_revenue: 10000.00,
        total_commission: 1000.00,
        net_revenue: 9000.00,
        current_month: {
          revenue: 2000.00,
          commission: 200.00,
        },
        pending_payments: 500.00,
      },
    })
  }),

  // Get transactions
  http.get(`${API_BASE}/finance/transactions`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 1,
          type: 'receita',
          amount: 1000.00,
          status: 'aprovado',
          description: 'Pagamento de servico',
          created_at: new Date().toISOString(),
        },
      ],
    })
  }),
]

// ========================================
// Ranking Handlers
// ========================================

const rankingHandlers = [
  // Get ranking
  http.get(`${API_BASE}/ranking`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          position: 1,
          user_id: 1,
          company_name: 'Empresa Top',
          score: 500,
          deals_completed: 25,
        },
        {
          position: 2,
          user_id: 2,
          company_name: 'Empresa Segunda',
          score: 300,
          deals_completed: 15,
        },
      ],
    })
  }),

  // Get user ranking
  http.get(`${API_BASE}/ranking/me`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        position: 5,
        score: 150,
        deals_completed: 8,
        total_value: 8000.00,
      },
    })
  }),
]

// ========================================
// Categories Handlers
// ========================================

const categoryHandlers = [
  http.get(`${API_BASE}/categories`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        { id: 1, name: 'Manutencao', slug: 'manutencao' },
        { id: 2, name: 'Limpeza', slug: 'limpeza' },
        { id: 3, name: 'Seguranca', slug: 'seguranca' },
        { id: 4, name: 'Jardinagem', slug: 'jardinagem' },
      ],
    })
  }),
]

// ========================================
// Export All Handlers
// ========================================

export const handlers = [
  ...authHandlers,
  ...servicesHandlers,
  ...dealsHandlers,
  ...subscriptionHandlers,
  ...notificationHandlers,
  ...financeHandlers,
  ...rankingHandlers,
  ...categoryHandlers,
]
