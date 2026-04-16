import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchDeals = createAsyncThunk(
  'deals/fetchDeals',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/deals', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao carregar negociacoes')
    }
  }
)

export const fetchDealDetail = createAsyncThunk(
  'deals/fetchDealDetail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/deals/${id}`)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao carregar negociacao')
    }
  }
)

export const createDeal = createAsyncThunk(
  'deals/createDeal',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/deals', data)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao criar negociacao')
    }
  }
)

export const updateDealStatus = createAsyncThunk(
  'deals/updateDealStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/deals/${id}`, { status })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar status')
    }
  }
)

export const fetchMessages = createAsyncThunk(
  'deals/fetchMessages',
  async ({ dealId, since = null }, { rejectWithValue }) => {
    try {
      const params = since ? { since } : {}
      const response = await api.get(`/deals/${dealId}/messages`, { params })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao carregar mensagens')
    }
  }
)

export const sendMessage = createAsyncThunk(
  'deals/sendMessage',
  async ({ dealId, content }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/deals/${dealId}/messages`, { content })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao enviar mensagem')
    }
  }
)

const initialState = {
  deals: [],
  currentDeal: null,
  messages: [],
  dealStatus: null,
  isAnonymous: true,
  meta: null,
  loading: false,
  loadingDetail: false,
  loadingMessages: false,
  sendingMessage: false,
  error: null,
}

const dealsSlice = createSlice({
  name: 'deals',
  initialState,
  reducers: {
    clearCurrentDeal: (state) => {
      state.currentDeal = null
      state.messages = []
      state.dealStatus = null
      state.isAnonymous = true
      state.loadingDetail = false
      state.loadingMessages = false
    },
    clearError: (state) => {
      state.error = null
    },
    addMessage: (state, action) => {
      // Avoid duplicates
      const exists = state.messages.find(m => m.id === action.payload.id)
      if (!exists) {
        state.messages.push(action.payload)
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Deals
      .addCase(fetchDeals.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDeals.fulfilled, (state, action) => {
        state.loading = false
        state.deals = action.payload.data || []
        state.meta = action.payload.meta || null
      })
      .addCase(fetchDeals.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.deals = []
      })
      // Fetch Deal Detail
      .addCase(fetchDealDetail.pending, (state) => {
        state.loadingDetail = true
        state.error = null
      })
      .addCase(fetchDealDetail.fulfilled, (state, action) => {
        state.loadingDetail = false
        state.currentDeal = action.payload
      })
      .addCase(fetchDealDetail.rejected, (state, action) => {
        state.loadingDetail = false
        state.currentDeal = null
        state.error = action.payload
      })
      // Create Deal
      .addCase(createDeal.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createDeal.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload) {
          state.deals.unshift(action.payload)
        }
      })
      .addCase(createDeal.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Deal Status
      .addCase(updateDealStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateDealStatus.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload) {
          const index = state.deals.findIndex(d => d.id === action.payload.id)
          if (index !== -1) {
            state.deals[index] = action.payload
          }
          if (state.currentDeal?.id === action.payload.id) {
            state.currentDeal = action.payload
            state.dealStatus = action.payload.status
          }
        }
      })
      .addCase(updateDealStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Messages
      .addCase(fetchMessages.pending, (state) => {
        // Only set loading on first fetch
        if (state.messages.length === 0) {
          state.loadingMessages = true
        }
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loadingMessages = false
        if (action.payload) {
          state.messages = action.payload.messages || []
          state.dealStatus = action.payload.deal_status
          state.isAnonymous = action.payload.is_anonymous ?? true
        }
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loadingMessages = false
        // Don't clear messages on refresh failure
        if (state.messages.length === 0) {
          state.error = action.payload
        }
      })
      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.sendingMessage = true
        state.error = null
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sendingMessage = false
        if (action.payload) {
          // Avoid duplicates
          const exists = state.messages.find(m => m.id === action.payload.id)
          if (!exists) {
            state.messages.push(action.payload)
          }
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sendingMessage = false
        state.error = action.payload
      })
  },
})

export const { clearCurrentDeal, clearError, addMessage } = dealsSlice.actions
export default dealsSlice.reducer
