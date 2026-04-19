import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Async Thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials)
      const { user, token } = response.data.data
      localStorage.setItem('token', token)
      return { user, token }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao fazer login')
    }
  }
)

export const registerEmpresa = createAsyncThunk(
  'auth/registerEmpresa',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register/empresa', data)
      const { user, token } = response.data.data
      localStorage.setItem('token', token)
      return { user, token }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao cadastrar')
    }
  }
)

export const registerCliente = createAsyncThunk(
  'auth/registerCliente',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register/cliente', data)
      const { user, token } = response.data.data
      localStorage.setItem('token', token)
      return { user, token }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao cadastrar')
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('token')
    }
  }
)

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue, getState }) => {
    // Prevent multiple simultaneous calls
    const { auth } = getState()
    if (auth.loading && !auth.initialLoading) {
      return rejectWithValue('Already loading')
    }

    try {
      const response = await api.get('/users/me')
      // O endpoint retorna { user: ... }, extraímos apenas o user
      return response.data.data.user || response.data.data
    } catch (error) {
      localStorage.removeItem('token')
      return rejectWithValue(error.response?.data?.message || 'Session expired')
    }
  }
)

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.put('/users/me', data)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar perfil')
    }
  }
)

// Check if token exists in localStorage (safe for SSR/testing)
const getToken = () => {
  try {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
  } catch {
    return null
  }
}
const token = getToken()

const initialState = {
  user: null,
  token: token,
  isAuthenticated: false, // Start as false, will be set after checking
  loading: false,
  initialLoading: !!token, // True if there's a token to verify
  initialized: !token, // True if no token (no need to verify), false if there's token
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action) => {
      state.user = action.payload
    },
    resetAuth: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.loading = false
      state.initialLoading = false
      state.initialized = true
      state.error = null
      localStorage.removeItem('token')
    },
    setInitialized: (state) => {
      state.initialLoading = false
      state.initialized = true
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.initialLoading = false
        state.initialized = true
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.initialLoading = false
        state.initialized = true
      })
      // Register Empresa
      .addCase(registerEmpresa.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerEmpresa.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.initialLoading = false
        state.initialized = true
      })
      .addCase(registerEmpresa.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.initialLoading = false
        state.initialized = true
      })
      // Register Cliente
      .addCase(registerCliente.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerCliente.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.initialLoading = false
        state.initialized = true
      })
      .addCase(registerCliente.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.initialLoading = false
        state.initialized = true
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.loading = false
        state.initialLoading = false
        state.initialized = true
      })
      .addCase(logout.rejected, (state) => {
        // Even if logout fails, clear local state
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.loading = false
        state.initialLoading = false
        state.initialized = true
      })
      // Fetch Current User
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.initialLoading = false
        state.initialized = true
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.initialLoading = false
        state.initialized = true
        // Don't set error for "Already loading" case
        if (action.payload !== 'Already loading') {
          state.error = action.payload
        }
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, setUser, resetAuth, setInitialized } = authSlice.actions
export default authSlice.reducer
