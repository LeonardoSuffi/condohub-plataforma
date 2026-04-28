import { useEffect, useState, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '../store/slices/authSlice'
import { Clock, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

// Inactivity timeout in milliseconds (29 minutes - warn 1 minute before 30 min server timeout)
const INACTIVITY_WARNING_MS = 29 * 60 * 1000
// Time to show warning before auto-logout (1 minute)
const WARNING_DURATION_MS = 1 * 60 * 1000

export default function SessionMonitor() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector((state) => state.auth)

  const [showWarning, setShowWarning] = useState(false)
  const [countdown, setCountdown] = useState(60) // 1 minute in seconds

  const timeoutRef = useRef(null)
  const warningTimeoutRef = useRef(null)
  const countdownRef = useRef(null)
  const lastActivityRef = useRef(Date.now())

  // Reset the inactivity timer
  const resetTimer = useCallback(() => {
    if (!isAuthenticated) return

    lastActivityRef.current = Date.now()
    setShowWarning(false)
    setCountdown(60)

    // Clear existing timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)

    // Set warning timeout
    timeoutRef.current = setTimeout(() => {
      setShowWarning(true)
      setCountdown(60)

      // Start countdown
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Auto logout
            clearInterval(countdownRef.current)
            handleLogout()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      // Set final logout timeout
      warningTimeoutRef.current = setTimeout(() => {
        handleLogout()
      }, WARNING_DURATION_MS)
    }, INACTIVITY_WARNING_MS)
  }, [isAuthenticated])

  // Handle user activity
  const handleActivity = useCallback(() => {
    if (showWarning) {
      // User interacted during warning, reset everything
      resetTimer()
    } else if (Date.now() - lastActivityRef.current > 1000) {
      // Only reset if more than 1 second has passed (debounce)
      resetTimer()
    }
  }, [showWarning, resetTimer])

  // Handle logout
  const handleLogout = useCallback(() => {
    setShowWarning(false)
    dispatch(logout())
    toast.error('Sessao encerrada por inatividade')
    navigate('/login')
  }, [dispatch, navigate])

  // Extend session (user clicked continue)
  const handleExtendSession = () => {
    resetTimer()
    toast.success('Sessao estendida')
  }

  // Set up activity listeners
  useEffect(() => {
    if (!isAuthenticated) {
      // Clear all timeouts when not authenticated
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
      return
    }

    // Activity events to track
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    // Start the timer
    resetTimer()

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [isAuthenticated, handleActivity, resetTimer])

  // Format countdown
  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Don't render anything if not authenticated or warning not showing
  if (!isAuthenticated || !showWarning) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Sessao Expirando</h3>
            <p className="text-sm text-gray-500">Voce esta inativo ha algum tempo</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-center gap-3">
            <Clock className="w-6 h-6 text-amber-600" />
            <span className="text-3xl font-bold text-amber-700 font-mono">
              {formatCountdown(countdown)}
            </span>
          </div>
          <p className="text-center text-sm text-amber-600 mt-2">
            Sua sessao sera encerrada automaticamente
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleLogout}
            className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
          >
            Sair Agora
          </button>
          <button
            onClick={handleExtendSession}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:from-blue-700 hover:to-cyan-600 font-medium transition-all"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}
