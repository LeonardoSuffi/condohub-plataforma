import { useEffect, useCallback, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/slices/authSlice'

/**
 * Hook para detectar inatividade do usuário e fazer logout automático
 *
 * @param {number} timeoutMinutes - Tempo de inatividade em minutos (padrão: 30)
 * @param {number} warningMinutes - Tempo antes do timeout para mostrar aviso (padrão: 5)
 */
export function useInactivityTimeout(timeoutMinutes = 30, warningMinutes = 5) {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const [showWarning, setShowWarning] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)

  const timeoutRef = useRef(null)
  const warningTimeoutRef = useRef(null)
  const countdownRef = useRef(null)
  const lastActivityRef = useRef(Date.now())

  const timeoutMs = timeoutMinutes * 60 * 1000
  const warningMs = warningMinutes * 60 * 1000

  // Limpa os timeouts de warning e logout (não limpa countdown)
  const clearAllTimeouts = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
  }, [])

  // Limpa o countdown separadamente
  const clearCountdown = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current)
  }, [])

  // Faz logout do usuário
  const handleLogout = useCallback(() => {
    clearAllTimeouts()
    clearCountdown()
    setShowWarning(false)
    dispatch(logout())
  }, [dispatch, clearAllTimeouts, clearCountdown])

  // Inicia contagem regressiva para exibir no modal
  const startCountdown = useCallback(() => {
    setRemainingTime(warningMs / 1000)

    countdownRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [warningMs])

  // Mostra aviso de inatividade
  const showInactivityWarning = useCallback(() => {
    setShowWarning(true)
    startCountdown()

    // Agenda logout após período de aviso
    timeoutRef.current = setTimeout(() => {
      handleLogout()
    }, warningMs)
  }, [handleLogout, startCountdown, warningMs])

  // Reseta o timer de inatividade
  const resetTimer = useCallback(() => {
    if (!isAuthenticated) return

    lastActivityRef.current = Date.now()
    clearAllTimeouts()
    clearCountdown()
    setShowWarning(false)

    // Agenda aviso de inatividade
    warningTimeoutRef.current = setTimeout(() => {
      showInactivityWarning()
    }, timeoutMs - warningMs)
  }, [isAuthenticated, clearAllTimeouts, clearCountdown, showInactivityWarning, timeoutMs, warningMs])

  // Extensão da sessão pelo usuário (clicou em "Continuar")
  const extendSession = useCallback(() => {
    setShowWarning(false)
    clearAllTimeouts()
    clearCountdown()
    resetTimer()
  }, [clearAllTimeouts, clearCountdown, resetTimer])

  // Monitora eventos de atividade do usuário
  useEffect(() => {
    if (!isAuthenticated) {
      clearAllTimeouts()
      clearCountdown()
      setShowWarning(false)
      return
    }

    // Se já estiver mostrando o aviso, não reinicia o timer nem limpa os timeouts
    if (showWarning) {
      return
    }

    const activityEvents = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click',
      'wheel',
    ]

    // Handler com debounce para não resetar a cada pixel de movimento
    let debounceTimer = null
    const handleActivity = () => {
      if (debounceTimer) return

      debounceTimer = setTimeout(() => {
        debounceTimer = null
        // Só reseta se não estiver mostrando o aviso
        if (!showWarning) {
          resetTimer()
        }
      }, 1000) // Debounce de 1 segundo
    }

    // Adiciona listeners
    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    // Inicia o timer
    resetTimer()

    // Cleanup - only clear when user is not authenticated
    // Don't clear when transitioning to warning state
    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
      if (debounceTimer) clearTimeout(debounceTimer)
      // Only clear timeouts if not authenticated (logout case)
      // The warning/logout timeouts should persist
    }
  }, [isAuthenticated, resetTimer, clearAllTimeouts, clearCountdown, showWarning])

  // Verifica inatividade quando a tab volta a ficar ativa
  useEffect(() => {
    if (!isAuthenticated) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const inactiveTime = Date.now() - lastActivityRef.current

        // Se ficou inativo por mais tempo que o timeout, faz logout
        if (inactiveTime >= timeoutMs) {
          handleLogout()
        } else if (inactiveTime >= timeoutMs - warningMs) {
          // Se está no período de aviso, mostra o aviso
          showInactivityWarning()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isAuthenticated, timeoutMs, warningMs, handleLogout, showInactivityWarning])

  return {
    showWarning,
    remainingTime,
    extendSession,
    handleLogout,
  }
}

export default useInactivityTimeout
