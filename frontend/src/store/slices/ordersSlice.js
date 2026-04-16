import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao carregar ordens')
    }
  }
)

export const fetchOrderDetail = createAsyncThunk(
  'orders/fetchOrderDetail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/${id}`)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao carregar ordem')
    }
  }
)

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ id, status, notes, rejection_reason, value }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/orders/${id}`, {
        status,
        notes,
        rejection_reason,
        value
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar ordem')
    }
  }
)

const initialState = {
  orders: [],
  currentOrder: null,
  meta: null,
  loading: false,
  loadingDetail: false,
  updating: false,
  error: null,
}

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null
      state.loadingDetail = false
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false
        state.orders = action.payload?.data || []
        state.meta = action.payload?.meta || null
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.orders = []
      })
      // Fetch Order Detail
      .addCase(fetchOrderDetail.pending, (state) => {
        state.loadingDetail = true
        state.error = null
      })
      .addCase(fetchOrderDetail.fulfilled, (state, action) => {
        state.loadingDetail = false
        state.currentOrder = action.payload
      })
      .addCase(fetchOrderDetail.rejected, (state, action) => {
        state.loadingDetail = false
        state.currentOrder = null
        state.error = action.payload
      })
      // Update Order Status
      .addCase(updateOrderStatus.pending, (state) => {
        state.updating = true
        state.error = null
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.updating = false
        if (action.payload) {
          const index = state.orders.findIndex(o => o.id === action.payload.id)
          if (index !== -1) {
            state.orders[index] = action.payload
          }
          if (state.currentOrder?.id === action.payload.id) {
            state.currentOrder = action.payload
          }
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.updating = false
        state.error = action.payload
      })
  },
})

export const { clearCurrentOrder, clearError } = ordersSlice.actions
export default ordersSlice.reducer
