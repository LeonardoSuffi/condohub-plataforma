import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Buscar avaliacoes recebidas (empresa)
export const fetchReceivedReviews = createAsyncThunk(
  'reviews/fetchReceived',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/reviews/received', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao carregar avaliacoes')
    }
  }
)

// Buscar avaliacoes dadas (cliente)
export const fetchGivenReviews = createAsyncThunk(
  'reviews/fetchGiven',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/reviews/given', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao carregar avaliacoes')
    }
  }
)

// Criar avaliacao
export const createReview = createAsyncThunk(
  'reviews/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/reviews', data)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao criar avaliacao')
    }
  }
)

// Responder avaliacao (empresa)
export const respondToReview = createAsyncThunk(
  'reviews/respond',
  async ({ id, response: responseText }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/reviews/${id}/respond`, { response: responseText })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao responder avaliacao')
    }
  }
)

// Buscar metricas do dashboard (empresa)
export const fetchMetrics = createAsyncThunk(
  'reviews/fetchMetrics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/metrics/dashboard', { params })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao carregar metricas')
    }
  }
)

// Buscar dados para graficos (empresa)
export const fetchChartData = createAsyncThunk(
  'reviews/fetchChartData',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/metrics/charts', { params })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao carregar dados dos graficos')
    }
  }
)

const initialState = {
  reviews: [],
  stats: {
    average_rating: 0,
    total_reviews: 0,
    rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  },
  metrics: null,
  chartData: null,
  meta: null,
  loading: false,
  loadingMetrics: false,
  loadingCharts: false,
  submitting: false,
  error: null,
}

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearReviews: (state) => {
      state.reviews = []
      state.stats = initialState.stats
      state.meta = null
    },
    clearMetrics: (state) => {
      state.metrics = null
      state.chartData = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Received Reviews
      .addCase(fetchReceivedReviews.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchReceivedReviews.fulfilled, (state, action) => {
        state.loading = false
        state.reviews = action.payload.data || []
        state.stats = action.payload.stats || initialState.stats
        state.meta = action.payload.meta || null
      })
      .addCase(fetchReceivedReviews.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Given Reviews
      .addCase(fetchGivenReviews.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGivenReviews.fulfilled, (state, action) => {
        state.loading = false
        state.reviews = action.payload.data || []
        state.meta = action.payload.meta || null
      })
      .addCase(fetchGivenReviews.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create Review
      .addCase(createReview.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.submitting = false
        if (action.payload) {
          state.reviews.unshift(action.payload)
        }
      })
      .addCase(createReview.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
      })
      // Respond to Review
      .addCase(respondToReview.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(respondToReview.fulfilled, (state, action) => {
        state.submitting = false
        if (action.payload) {
          const index = state.reviews.findIndex(r => r.id === action.payload.id)
          if (index !== -1) {
            state.reviews[index] = action.payload
          }
        }
      })
      .addCase(respondToReview.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
      })
      // Fetch Metrics
      .addCase(fetchMetrics.pending, (state) => {
        state.loadingMetrics = true
        state.error = null
      })
      .addCase(fetchMetrics.fulfilled, (state, action) => {
        state.loadingMetrics = false
        state.metrics = action.payload
      })
      .addCase(fetchMetrics.rejected, (state, action) => {
        state.loadingMetrics = false
        state.error = action.payload
      })
      // Fetch Chart Data
      .addCase(fetchChartData.pending, (state) => {
        state.loadingCharts = true
        state.error = null
      })
      .addCase(fetchChartData.fulfilled, (state, action) => {
        state.loadingCharts = false
        state.chartData = action.payload
      })
      .addCase(fetchChartData.rejected, (state, action) => {
        state.loadingCharts = false
        state.error = action.payload
      })
  },
})

export const { clearReviews, clearMetrics, clearError } = reviewsSlice.actions
export default reviewsSlice.reducer
