import { describe, it, expect, beforeEach } from 'vitest'
import subscriptionReducer, {
  clearError,
} from './subscriptionSlice'

describe('subscriptionSlice', () => {
  const initialState = {
    plans: [],
    activeSubscription: null,
    subscriptionHistory: [],
    loading: false,
    error: null,
  }

  const mockPlan = {
    id: 1,
    name: 'Gratuito',
    slug: 'gratuito',
    price: 0,
    billing_cycle: 'mensal',
    max_interactions: 10,
    features: ['basic'],
  }

  const mockPlans = [
    mockPlan,
    { ...mockPlan, id: 2, name: 'Plus', slug: 'plus', price: 99, max_interactions: 100 },
    { ...mockPlan, id: 3, name: 'Premium', slug: 'premium', price: 199, max_interactions: 500 },
  ]

  const mockSubscription = {
    id: 1,
    plan_id: 1,
    status: 'ativa',
    starts_at: '2024-01-01T00:00:00Z',
    ends_at: '2024-02-01T00:00:00Z',
    interactions_used: 5,
    plan: mockPlan,
  }

  // ========================================
  // Initial State Tests
  // ========================================

  describe('initial state', () => {
    it('should return the initial state', () => {
      expect(subscriptionReducer(undefined, { type: 'unknown' })).toEqual(initialState)
    })
  })

  // ========================================
  // Reducers Tests
  // ========================================

  describe('reducers', () => {
    it('should handle clearError', () => {
      const stateWithError = {
        ...initialState,
        error: 'Some error occurred',
      }

      const state = subscriptionReducer(stateWithError, clearError())

      expect(state.error).toBeNull()
    })
  })

  // ========================================
  // Fetch Plans Tests
  // ========================================

  describe('async thunks - fetchPlans', () => {
    it('should set loading on pending', () => {
      const action = { type: 'subscription/fetchPlans/pending' }
      const state = subscriptionReducer(initialState, action)

      expect(state.loading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should set plans on fulfilled', () => {
      const action = { type: 'subscription/fetchPlans/fulfilled', payload: mockPlans }
      const state = subscriptionReducer({ ...initialState, loading: true }, action)

      expect(state.loading).toBe(false)
      expect(state.plans).toEqual(mockPlans)
      expect(state.plans).toHaveLength(3)
    })

    it('should set error on rejected', () => {
      const action = { type: 'subscription/fetchPlans/rejected', payload: 'Erro ao carregar planos' }
      const state = subscriptionReducer({ ...initialState, loading: true }, action)

      expect(state.loading).toBe(false)
      expect(state.error).toBe('Erro ao carregar planos')
    })
  })

  // ========================================
  // Fetch Subscriptions Tests
  // ========================================

  describe('async thunks - fetchSubscriptions', () => {
    it('should set loading on pending', () => {
      const action = { type: 'subscription/fetchSubscriptions/pending' }
      const state = subscriptionReducer(initialState, action)

      expect(state.loading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should set active subscription and history on fulfilled', () => {
      const historySubscriptions = [
        { ...mockSubscription, id: 2, status: 'expirada' },
        { ...mockSubscription, id: 3, status: 'cancelada' },
      ]

      const payload = {
        active: mockSubscription,
        history: historySubscriptions,
      }

      const action = { type: 'subscription/fetchSubscriptions/fulfilled', payload }
      const state = subscriptionReducer({ ...initialState, loading: true }, action)

      expect(state.loading).toBe(false)
      expect(state.activeSubscription).toEqual(mockSubscription)
      expect(state.subscriptionHistory).toEqual(historySubscriptions)
    })

    it('should set error on rejected', () => {
      const action = {
        type: 'subscription/fetchSubscriptions/rejected',
        payload: 'Erro ao carregar assinaturas',
      }
      const state = subscriptionReducer({ ...initialState, loading: true }, action)

      expect(state.loading).toBe(false)
      expect(state.error).toBe('Erro ao carregar assinaturas')
    })
  })

  // ========================================
  // Subscribe to Plan Tests
  // ========================================

  describe('async thunks - subscribeToPlan', () => {
    it('should set loading on pending', () => {
      const action = { type: 'subscription/subscribeToPlan/pending' }
      const state = subscriptionReducer(initialState, action)

      expect(state.loading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should set active subscription and add to history on fulfilled', () => {
      const newSubscription = { ...mockSubscription, id: 5 }

      const action = { type: 'subscription/subscribeToPlan/fulfilled', payload: newSubscription }
      const state = subscriptionReducer(
        {
          ...initialState,
          subscriptionHistory: [mockSubscription],
          loading: true,
        },
        action
      )

      expect(state.loading).toBe(false)
      expect(state.activeSubscription).toEqual(newSubscription)
      expect(state.subscriptionHistory[0]).toEqual(newSubscription) // Unshifted to front
      expect(state.subscriptionHistory).toHaveLength(2)
    })

    it('should set error on rejected', () => {
      const action = { type: 'subscription/subscribeToPlan/rejected', payload: 'Erro ao assinar' }
      const state = subscriptionReducer({ ...initialState, loading: true }, action)

      expect(state.loading).toBe(false)
      expect(state.error).toBe('Erro ao assinar')
    })
  })

  // ========================================
  // Change Plan Tests
  // ========================================

  describe('async thunks - changePlan', () => {
    it('should set loading on pending', () => {
      const action = { type: 'subscription/changePlan/pending' }
      const state = subscriptionReducer(initialState, action)

      expect(state.loading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should update active subscription on fulfilled', () => {
      const updatedSubscription = {
        ...mockSubscription,
        plan_id: 2,
        plan: mockPlans[1],
      }

      const stateWithSubscription = {
        ...initialState,
        activeSubscription: mockSubscription,
        subscriptionHistory: [mockSubscription],
        loading: true,
      }

      const action = { type: 'subscription/changePlan/fulfilled', payload: updatedSubscription }
      const state = subscriptionReducer(stateWithSubscription, action)

      expect(state.loading).toBe(false)
      expect(state.activeSubscription?.plan_id).toBe(2)
    })

    it('should update subscription in history on fulfilled', () => {
      const updatedSubscription = {
        ...mockSubscription,
        plan_id: 2,
        plan: mockPlans[1],
      }

      const stateWithHistory = {
        ...initialState,
        activeSubscription: mockSubscription,
        subscriptionHistory: [mockSubscription, { ...mockSubscription, id: 99 }],
        loading: true,
      }

      const action = { type: 'subscription/changePlan/fulfilled', payload: updatedSubscription }
      const state = subscriptionReducer(stateWithHistory, action)

      expect(state.subscriptionHistory.find(s => s.id === 1)?.plan_id).toBe(2)
    })

    it('should set error on rejected', () => {
      const action = { type: 'subscription/changePlan/rejected', payload: 'Erro ao mudar plano' }
      const state = subscriptionReducer({ ...initialState, loading: true }, action)

      expect(state.loading).toBe(false)
      expect(state.error).toBe('Erro ao mudar plano')
    })
  })

  // ========================================
  // Cancel Subscription Tests
  // ========================================

  describe('async thunks - cancelSubscription', () => {
    it('should set loading on pending', () => {
      const action = { type: 'subscription/cancelSubscription/pending' }
      const state = subscriptionReducer(initialState, action)

      expect(state.loading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should clear active subscription on fulfilled', () => {
      const stateWithSubscription = {
        ...initialState,
        activeSubscription: mockSubscription,
        subscriptionHistory: [mockSubscription],
        loading: true,
      }

      const action = {
        type: 'subscription/cancelSubscription/fulfilled',
        payload: mockSubscription.id,
      }
      const state = subscriptionReducer(stateWithSubscription, action)

      expect(state.loading).toBe(false)
      expect(state.activeSubscription).toBeNull()
    })

    it('should update subscription status in history on fulfilled', () => {
      const stateWithHistory = {
        ...initialState,
        activeSubscription: mockSubscription,
        subscriptionHistory: [{ ...mockSubscription, status: 'ativa' }],
        loading: true,
      }

      const action = {
        type: 'subscription/cancelSubscription/fulfilled',
        payload: mockSubscription.id,
      }
      const state = subscriptionReducer(stateWithHistory, action)

      expect(state.subscriptionHistory.find(s => s.id === mockSubscription.id)?.status).toBe('cancelada')
    })

    it('should set error on rejected', () => {
      const action = { type: 'subscription/cancelSubscription/rejected', payload: 'Erro ao cancelar' }
      const state = subscriptionReducer({ ...initialState, loading: true }, action)

      expect(state.loading).toBe(false)
      expect(state.error).toBe('Erro ao cancelar')
    })
  })

  // ========================================
  // Plan Workflow Tests
  // ========================================

  describe('subscription workflow', () => {
    it('should track complete subscription lifecycle', () => {
      // 1. Start with no subscription
      let state = initialState

      // 2. Subscribe to plan
      const newSubscription = { ...mockSubscription, status: 'ativa' }
      state = subscriptionReducer(state, {
        type: 'subscription/subscribeToPlan/fulfilled',
        payload: newSubscription,
      })

      expect(state.activeSubscription?.status).toBe('ativa')
      expect(state.subscriptionHistory).toHaveLength(1)

      // 3. Upgrade plan
      const upgradedSubscription = {
        ...mockSubscription,
        plan_id: 2,
        plan: mockPlans[1],
      }
      state = subscriptionReducer(state, {
        type: 'subscription/changePlan/fulfilled',
        payload: upgradedSubscription,
      })

      expect(state.activeSubscription?.plan_id).toBe(2)

      // 4. Cancel subscription
      state = subscriptionReducer(state, {
        type: 'subscription/cancelSubscription/fulfilled',
        payload: mockSubscription.id,
      })

      expect(state.activeSubscription).toBeNull()
      expect(state.subscriptionHistory[0].status).toBe('cancelada')
    })

    it('should handle plan upgrade with price difference', () => {
      const stateWithActivePlan = {
        ...initialState,
        activeSubscription: mockSubscription, // Free plan
        plans: mockPlans,
      }

      // Upgrade to Plus plan
      const upgradedSubscription = {
        ...mockSubscription,
        plan_id: 2,
        plan: mockPlans[1], // Plus plan ($99)
      }

      const state = subscriptionReducer(stateWithActivePlan, {
        type: 'subscription/changePlan/fulfilled',
        payload: upgradedSubscription,
      })

      expect(state.activeSubscription?.plan.price).toBe(99)
      expect(state.activeSubscription?.plan.max_interactions).toBe(100)
    })
  })

  // ========================================
  // Plans Display Tests
  // ========================================

  describe('plans management', () => {
    it('should store plans with all details', () => {
      const action = { type: 'subscription/fetchPlans/fulfilled', payload: mockPlans }
      const state = subscriptionReducer(initialState, action)

      const plusPlan = state.plans.find(p => p.slug === 'plus')
      expect(plusPlan).toBeDefined()
      expect(plusPlan?.price).toBe(99)
      expect(plusPlan?.max_interactions).toBe(100)
    })

    it('should order plans correctly', () => {
      const action = { type: 'subscription/fetchPlans/fulfilled', payload: mockPlans }
      const state = subscriptionReducer(initialState, action)

      // First should be free
      expect(state.plans[0].price).toBe(0)
      // Last should be most expensive
      expect(state.plans[2].price).toBe(199)
    })
  })

  // ========================================
  // Error Handling Tests
  // ========================================

  describe('error handling', () => {
    it('should clear error before each async operation', () => {
      const stateWithError = { ...initialState, error: 'Previous error' }

      // fetchPlans pending should clear error
      let state = subscriptionReducer(stateWithError, {
        type: 'subscription/fetchPlans/pending',
      })
      expect(state.error).toBeNull()

      // fetchSubscriptions pending should clear error
      state = subscriptionReducer({ ...stateWithError }, {
        type: 'subscription/fetchSubscriptions/pending',
      })
      expect(state.error).toBeNull()

      // subscribeToPlan pending should clear error
      state = subscriptionReducer({ ...stateWithError }, {
        type: 'subscription/subscribeToPlan/pending',
      })
      expect(state.error).toBeNull()

      // changePlan pending should clear error
      state = subscriptionReducer({ ...stateWithError }, {
        type: 'subscription/changePlan/pending',
      })
      expect(state.error).toBeNull()

      // cancelSubscription pending should clear error
      state = subscriptionReducer({ ...stateWithError }, {
        type: 'subscription/cancelSubscription/pending',
      })
      expect(state.error).toBeNull()
    })
  })
})
