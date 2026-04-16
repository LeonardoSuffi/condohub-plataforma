import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams(filters)
      const response = await api.get(`/services?${params}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao carregar serviços')
    }
  }
)

export const fetchServiceDetail = createAsyncThunk(
  'services/fetchServiceDetail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/services/${id}`)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao carregar serviço')
    }
  }
)

export const fetchMyServices = createAsyncThunk(
  'services/fetchMyServices',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/my-services', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao carregar meus serviços')
    }
  }
)

export const createService = createAsyncThunk(
  'services/createService',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/services', data)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao criar serviço')
    }
  }
)

export const updateService = createAsyncThunk(
  'services/updateService',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/services/${id}`, data)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar serviço')
    }
  }
)

export const deleteService = createAsyncThunk(
  'services/deleteService',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/services/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao excluir serviço')
    }
  }
)

export const fetchCategories = createAsyncThunk(
  'services/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/categories')
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao carregar categorias')
    }
  }
)

const initialState = {
  services: [],
  myServices: [],
  currentService: null,
  categories: [],
  meta: null,
  loading: false,
  loadingDetail: false,
  loadingMyServices: false,
  loadingCategories: false,
  creating: false,
  updating: false,
  deleting: false,
  error: null,
}

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    clearCurrentService: (state) => {
      state.currentService = null
      state.loadingDetail = false
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Services
      .addCase(fetchServices.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false
        state.services = action.payload?.data || []
        state.meta = action.payload?.meta || null
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.services = []
      })
      // Fetch Service Detail
      .addCase(fetchServiceDetail.pending, (state) => {
        state.loadingDetail = true
        state.error = null
      })
      .addCase(fetchServiceDetail.fulfilled, (state, action) => {
        state.loadingDetail = false
        state.currentService = action.payload
      })
      .addCase(fetchServiceDetail.rejected, (state, action) => {
        state.loadingDetail = false
        state.currentService = null
        state.error = action.payload
      })
      // Fetch My Services
      .addCase(fetchMyServices.pending, (state) => {
        state.loadingMyServices = true
        state.error = null
      })
      .addCase(fetchMyServices.fulfilled, (state, action) => {
        state.loadingMyServices = false
        state.myServices = action.payload?.data || []
        state.meta = action.payload?.meta || null
      })
      .addCase(fetchMyServices.rejected, (state, action) => {
        state.loadingMyServices = false
        state.error = action.payload
        state.myServices = []
      })
      // Create Service
      .addCase(createService.pending, (state) => {
        state.creating = true
        state.error = null
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.creating = false
        if (action.payload) {
          state.myServices.unshift(action.payload)
        }
      })
      .addCase(createService.rejected, (state, action) => {
        state.creating = false
        state.error = action.payload
      })
      // Update Service
      .addCase(updateService.pending, (state) => {
        state.updating = true
        state.error = null
      })
      .addCase(updateService.fulfilled, (state, action) => {
        state.updating = false
        if (action.payload) {
          const index = state.myServices.findIndex(s => s.id === action.payload.id)
          if (index !== -1) {
            state.myServices[index] = action.payload
          }
          // Update currentService if it's the same
          if (state.currentService?.id === action.payload.id) {
            state.currentService = action.payload
          }
        }
      })
      .addCase(updateService.rejected, (state, action) => {
        state.updating = false
        state.error = action.payload
      })
      // Delete Service
      .addCase(deleteService.pending, (state) => {
        state.deleting = true
        state.error = null
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.deleting = false
        state.myServices = state.myServices.filter(s => s.id !== action.payload)
        // Clear currentService if it was deleted
        if (state.currentService?.id === action.payload) {
          state.currentService = null
        }
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.deleting = false
        state.error = action.payload
      })
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loadingCategories = true
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loadingCategories = false
        state.categories = action.payload || []
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loadingCategories = false
        state.error = action.payload
        state.categories = []
      })
  },
})

export const { clearCurrentService, clearError } = servicesSlice.actions
export default servicesSlice.reducer
