import { describe, it, expect, beforeEach } from 'vitest'
import authReducer, {
  setUser,
  resetAuth,
  setInitialized,
  clearError,
} from './authSlice'

describe('authSlice', () => {
  const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    initialLoading: false,
    initialized: true,
    error: null,
  }

  describe('reducers', () => {
    it('should return the initial state', () => {
      expect(authReducer(undefined, { type: 'unknown' })).toEqual(
        expect.objectContaining({
          user: null,
          isAuthenticated: false,
        })
      )
    })

    it('should handle setUser', () => {
      const user = { id: 1, name: 'Test', email: 'test@test.com', type: 'cliente' }

      const state = authReducer(initialState, setUser(user))

      expect(state.user).toEqual(user)
    })

    it('should handle resetAuth', () => {
      const loggedInState = {
        ...initialState,
        user: { id: 1, name: 'Test' },
        token: 'test-token',
        isAuthenticated: true,
      }

      const state = authReducer(loggedInState, resetAuth())

      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.initialized).toBe(true)
    })

    it('should handle setInitialized', () => {
      const uninitializedState = {
        ...initialState,
        initialized: false,
        initialLoading: true,
      }

      const state = authReducer(uninitializedState, setInitialized())

      expect(state.initialized).toBe(true)
      expect(state.initialLoading).toBe(false)
    })

    it('should handle clearError', () => {
      const stateWithError = {
        ...initialState,
        error: 'Some error',
      }

      const state = authReducer(stateWithError, clearError())

      expect(state.error).toBeNull()
    })
  })

  describe('async thunks - login', () => {
    it('should set loading on pending', () => {
      const action = { type: 'auth/login/pending' }
      const state = authReducer(initialState, action)

      expect(state.loading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should authenticate user on fulfilled', () => {
      const payload = {
        user: { id: 1, name: 'Test', email: 'test@test.com', type: 'cliente' },
        token: 'test-token',
      }

      const action = { type: 'auth/login/fulfilled', payload }
      const state = authReducer({ ...initialState, loading: true }, action)

      expect(state.loading).toBe(false)
      expect(state.user).toEqual(payload.user)
      expect(state.token).toEqual(payload.token)
      expect(state.isAuthenticated).toBe(true)
      expect(state.initialized).toBe(true)
    })

    it('should set error on rejected', () => {
      const action = { type: 'auth/login/rejected', payload: 'Invalid credentials' }
      const state = authReducer({ ...initialState, loading: true }, action)

      expect(state.loading).toBe(false)
      expect(state.error).toBe('Invalid credentials')
      expect(state.initialized).toBe(true)
    })
  })

  describe('async thunks - logout', () => {
    it('should clear state on fulfilled', () => {
      const loggedInState = {
        ...initialState,
        user: { id: 1, name: 'Test' },
        token: 'test-token',
        isAuthenticated: true,
      }

      const action = { type: 'auth/logout/fulfilled' }
      const state = authReducer(loggedInState, action)

      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })

    it('should clear state even on rejected', () => {
      const loggedInState = {
        ...initialState,
        user: { id: 1, name: 'Test' },
        token: 'test-token',
        isAuthenticated: true,
      }

      const action = { type: 'auth/logout/rejected' }
      const state = authReducer(loggedInState, action)

      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })
  })

  describe('user types', () => {
    it('should correctly store empresa user via login', () => {
      const empresaUser = {
        id: 1,
        name: 'Empresa Test',
        email: 'empresa@test.com',
        type: 'empresa',
        companyProfile: { cnpj: '12345678000199' },
      }

      const action = {
        type: 'auth/login/fulfilled',
        payload: { user: empresaUser, token: 'token' },
      }
      const state = authReducer(initialState, action)

      expect(state.user.type).toBe('empresa')
      expect(state.user.companyProfile).toBeDefined()
      expect(state.isAuthenticated).toBe(true)
    })

    it('should correctly store cliente user via login', () => {
      const clienteUser = {
        id: 2,
        name: 'Cliente Test',
        email: 'cliente@test.com',
        type: 'cliente',
        clientProfile: { cpf: '12345678901' },
      }

      const action = {
        type: 'auth/login/fulfilled',
        payload: { user: clienteUser, token: 'token' },
      }
      const state = authReducer(initialState, action)

      expect(state.user.type).toBe('cliente')
      expect(state.user.clientProfile).toBeDefined()
      expect(state.isAuthenticated).toBe(true)
    })

    it('should correctly store admin user via login', () => {
      const adminUser = {
        id: 3,
        name: 'Admin Test',
        email: 'admin@test.com',
        type: 'admin',
      }

      const action = {
        type: 'auth/login/fulfilled',
        payload: { user: adminUser, token: 'token' },
      }
      const state = authReducer(initialState, action)

      expect(state.user.type).toBe('admin')
      expect(state.isAuthenticated).toBe(true)
    })
  })

  describe('async thunks - fetchCurrentUser', () => {
    it('should set user on fulfilled', () => {
      const user = { id: 1, name: 'Test', type: 'cliente' }

      const action = { type: 'auth/fetchCurrentUser/fulfilled', payload: user }
      const state = authReducer({ ...initialState, loading: true }, action)

      expect(state.loading).toBe(false)
      expect(state.user).toEqual(user)
      expect(state.isAuthenticated).toBe(true)
      expect(state.initialized).toBe(true)
    })

    it('should clear state on rejected', () => {
      const stateWithToken = {
        ...initialState,
        token: 'test-token',
      }

      const action = { type: 'auth/fetchCurrentUser/rejected', payload: 'Session expired' }
      const state = authReducer(stateWithToken, action)

      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.initialized).toBe(true)
    })
  })

  describe('async thunks - updateProfile', () => {
    it('should set loading on pending', () => {
      const action = { type: 'auth/updateProfile/pending' }
      const state = authReducer(initialState, action)

      expect(state.loading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should update user on fulfilled', () => {
      const existingUser = { id: 1, name: 'Old Name', type: 'cliente' }
      const updatedUser = { id: 1, name: 'New Name', type: 'cliente' }

      const action = { type: 'auth/updateProfile/fulfilled', payload: updatedUser }
      const state = authReducer(
        { ...initialState, user: existingUser, loading: true },
        action
      )

      expect(state.loading).toBe(false)
      expect(state.user.name).toBe('New Name')
    })

    it('should set error on rejected', () => {
      const action = { type: 'auth/updateProfile/rejected', payload: 'Update failed' }
      const state = authReducer({ ...initialState, loading: true }, action)

      expect(state.loading).toBe(false)
      expect(state.error).toBe('Update failed')
    })
  })
})
