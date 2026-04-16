import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 second timeout
})

// Flag to prevent multiple 401 redirects
let isRedirecting = false

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      // Network error or timeout
      if (error.code === 'ECONNABORTED') {
        toast.error('Tempo limite excedido. Tente novamente.')
      } else if (error.message === 'Network Error') {
        toast.error('Erro de conexao. Verifique sua internet.')
      }
      return Promise.reject(error)
    }

    const { status, data } = error.response
    const message = data?.message || 'Erro inesperado'

    // Handle 401 - Unauthorized
    if (status === 401) {
      // Prevent multiple redirects
      if (!isRedirecting) {
        isRedirecting = true

        // Check if user was authenticated before clearing
        const hadToken = !!localStorage.getItem('token')

        // Clear token from localStorage
        localStorage.removeItem('token')

        // Show toast only if we were previously authenticated
        if (hadToken) {
          toast.error('Sessao expirada. Faca login novamente.')
        }

        // Reload the page to reset app state
        setTimeout(() => {
          window.location.href = '/login'
        }, 100)

        // Reset flag after a delay
        setTimeout(() => {
          isRedirecting = false
        }, 2000)
      }

      return Promise.reject(error)
    }

    // Handle 403 - Forbidden
    if (status === 403) {
      toast.error(message || 'Voce nao tem permissao para esta acao.')
      return Promise.reject(error)
    }

    // Handle 404 - Not Found
    if (status === 404) {
      // Don't show toast for 404 - let the component handle it
      return Promise.reject(error)
    }

    // Handle 422 - Validation Error
    if (status === 422) {
      const errors = data.errors
      if (errors) {
        const firstError = Object.values(errors)[0]
        toast.error(Array.isArray(firstError) ? firstError[0] : firstError)
      } else {
        toast.error(message)
      }
      return Promise.reject(error)
    }

    // Handle 429 - Too Many Requests
    if (status === 429) {
      toast.error('Muitas requisicoes. Aguarde um momento.')
      return Promise.reject(error)
    }

    // Handle 500+ - Server Errors
    if (status >= 500) {
      toast.error('Erro interno do servidor. Tente novamente mais tarde.')
      return Promise.reject(error)
    }

    // Handle other errors
    toast.error(message)
    return Promise.reject(error)
  }
)

export default api
