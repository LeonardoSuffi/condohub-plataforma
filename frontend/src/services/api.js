import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 second timeout
  withCredentials: true, // Importante para CSRF cookies
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
})

// Flag to prevent multiple 401 redirects
let isRedirecting = false

// Flag to prevent multiple CSRF refreshes
let isRefreshingCsrf = false
let csrfRefreshPromise = null

// Function to get CSRF cookie
const getCsrfCookie = async () => {
  if (isRefreshingCsrf) {
    return csrfRefreshPromise
  }

  isRefreshingCsrf = true
  csrfRefreshPromise = axios.get('/sanctum/csrf-cookie', {
    baseURL: '',
    withCredentials: true,
  }).finally(() => {
    isRefreshingCsrf = false
    csrfRefreshPromise = null
  })

  return csrfRefreshPromise
}

// Track last API activity for session management
const SESSION_STORAGE_KEY = 'last_api_activity'

const updateLastActivity = () => {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, Date.now().toString())
  } catch (e) {
    // Ignore sessionStorage errors (private browsing, etc)
  }
}

export const getLastApiActivity = () => {
  try {
    const timestamp = sessionStorage.getItem(SESSION_STORAGE_KEY)
    return timestamp ? parseInt(timestamp, 10) : Date.now()
  } catch (e) {
    return Date.now()
  }
}

// Request Interceptor
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // For FormData uploads, let axios set the Content-Type automatically (multipart/form-data with boundary)
    // For other requests, explicitly set JSON content type
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json'
    }

    // Ensure CSRF cookie exists for mutating requests
    const mutatingMethods = ['post', 'put', 'patch', 'delete']
    if (mutatingMethods.includes(config.method?.toLowerCase())) {
      // Check if XSRF-TOKEN cookie exists
      const hasXsrfCookie = document.cookie.includes('XSRF-TOKEN')
      if (!hasXsrfCookie) {
        await getCsrfCookie()
      }
    }

    // Update last activity timestamp
    updateLastActivity()

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
  async (error) => {
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

        // Show appropriate message based on error code
        if (hadToken) {
          const errorCode = data?.code
          if (errorCode === 'SESSION_EXPIRED') {
            toast.error('Sua sessao foi encerrada. Outro login foi detectado em outro dispositivo.')
          } else if (errorCode === 'SESSION_TIMEOUT') {
            toast.error('Sua sessao expirou. Por favor, faca login novamente.')
          } else if (errorCode === 'INACTIVITY_TIMEOUT') {
            toast.error('Sessao encerrada por inatividade. Por favor, faca login novamente.')
          } else {
            toast.error('Sessao expirada. Faca login novamente.')
          }
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

    // Handle 403 - Forbidden (Account Blocked)
    if (status === 403) {
      const errorCode = data?.code
      if (errorCode === 'ACCOUNT_BLOCKED') {
        // Clear token and redirect
        localStorage.removeItem('token')
        toast.error(message || 'Sua conta foi bloqueada. Entre em contato com o suporte.')
        setTimeout(() => {
          window.location.href = '/login'
        }, 100)
      } else {
        toast.error(message || 'Voce nao tem permissao para esta acao.')
      }
      return Promise.reject(error)
    }

    // Handle 419 - CSRF Token Mismatch
    if (status === 419) {
      // Get fresh CSRF token and retry the request
      try {
        await getCsrfCookie()
        // Retry the original request
        return api.request(error.config)
      } catch (csrfError) {
        toast.error('Erro de seguranca. Recarregue a pagina.')
        return Promise.reject(error)
      }
    }

    // Handle 404 - Not Found
    if (status === 404) {
      // Don't show toast for 404 - let the component handle it
      return Promise.reject(error)
    }

    // Handle 422 - Validation Error
    // Don't show toast here - let the component handle validation errors
    // This allows components to handle errors with more context (e.g., CAPTCHA requirements)
    if (status === 422) {
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

export { getCsrfCookie }
export default api
