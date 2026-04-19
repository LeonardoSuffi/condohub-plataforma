import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCurrentUser, setInitialized, resetAuth } from '../store/slices/authSlice'
import { useInactivityTimeout } from '../hooks/useInactivityTimeout'
import InactivityWarningModal from './InactivityWarningModal'

/**
 * AuthProvider - Handles initial authentication check on app load
 * Also manages inactivity timeout for security
 */
export default function AuthProvider({ children }) {
  const dispatch = useDispatch()
  const { initialized, token } = useSelector((state) => state.auth)
  const hasCheckedRef = useRef(false)
  const [isChecking, setIsChecking] = useState(!!token)

  // Inactivity timeout - 30 minutos de inatividade, aviso 5 minutos antes
  const {
    showWarning,
    remainingTime,
    extendSession,
    handleLogout: logoutFromInactivity,
  } = useInactivityTimeout(30, 5)

  useEffect(() => {
    // Only run once on mount
    if (hasCheckedRef.current) return
    hasCheckedRef.current = true

    const checkAuth = async () => {
      if (token) {
        setIsChecking(true)
        try {
          await dispatch(fetchCurrentUser()).unwrap()
        } catch (error) {
          console.log('Auth check failed, clearing token:', error)
          // Clear invalid token
          dispatch(resetAuth())
        } finally {
          setIsChecking(false)
        }
      } else {
        // No token, mark as initialized immediately
        dispatch(setInitialized())
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [dispatch, token])

  // Show loading only while actively checking auth
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500 text-sm">Verificando sessao...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {children}

      {/* Modal de aviso de inatividade */}
      <InactivityWarningModal
        isOpen={showWarning}
        remainingTime={remainingTime}
        onExtend={extendSession}
        onLogout={logoutFromInactivity}
      />
    </>
  )
}
