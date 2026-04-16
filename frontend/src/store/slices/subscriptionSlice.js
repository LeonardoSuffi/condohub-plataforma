import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchPlans = createAsyncThunk(
  'subscription/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/plans')
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao carregar planos')
    }
  }
)

export const fetchSubscriptions = createAsyncThunk(
  'subscription/fetchSubscriptions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/subscriptions')
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao carregar assinaturas')
    }
  }
)

export const subscribeToPlan = createAsyncThunk(
  'subscription/subscribeToPlan',
  async (planId, { rejectWithValue }) => {
    try {
      const response = await api.post('/subscriptions', { plan_id: planId })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao assinar plano')
    }
  }
)

export const changePlan = createAsyncThunk(
  'subscription/changePlan',
  async ({ subscriptionId, planId }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/subscriptions/${subscriptionId}`, { plan_id: planId })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao mudar de plano')
    }
  }
)

export const cancelSubscription = createAsyncThunk(
  'subscription/cancelSubscription',
  async (subscriptionId, { rejectWithValue }) => {
    try {
      await api.delete(`/subscriptions/${subscriptionId}`)
      return subscriptionId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao cancelar assinatura')
    }
  }
)

const initialState = {
  plans: [],
  activeSubscription: null,
  subscriptionHistory: [],
  loading: false,
  error: null,
}

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Plans
      .addCase(fetchPlans.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.loading = false
        state.plans = action.payload
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Subscriptions
      .addCase(fetchSubscriptions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.loading = false
        state.activeSubscription = action.payload.active
        state.subscriptionHistory = action.payload.history
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Subscribe to Plan
      .addCase(subscribeToPlan.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(subscribeToPlan.fulfilled, (state, action) => {
        state.loading = false
        state.activeSubscription = action.payload
        state.subscriptionHistory.unshift(action.payload)
      })
      .addCase(subscribeToPlan.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Change Plan
      .addCase(changePlan.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(changePlan.fulfilled, (state, action) => {
        state.loading = false
        state.activeSubscription = action.payload
        const index = state.subscriptionHistory.findIndex(s => s.id === action.payload.id)
        if (index !== -1) {
          state.subscriptionHistory[index] = action.payload
        }
      })
      .addCase(changePlan.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Cancel Subscription
      .addCase(cancelSubscription.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.loading = false
        state.activeSubscription = null
        const index = state.subscriptionHistory.findIndex(s => s.id === action.payload)
        if (index !== -1) {
          state.subscriptionHistory[index].status = 'cancelada'
        }
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError } = subscriptionSlice.actions
export default subscriptionSlice.reducer
