import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Hook para debounce de valores
 * Útil para inputs de busca
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook para debounce de callbacks
 * Útil para handlers de eventos
 */
export function useDebouncedCallback(callback, delay = 300) {
  const timeoutRef = useRef(null)
  const callbackRef = useRef(callback)

  // Atualiza referência do callback
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const debouncedCallback = useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    },
    [delay]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedCallback
}

/**
 * Hook para throttle de callbacks
 * Limita execução a uma vez por intervalo
 */
export function useThrottle(callback, delay = 300) {
  const lastCallRef = useRef(0)
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return useCallback(
    (...args) => {
      const now = Date.now()
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now
        callbackRef.current(...args)
      }
    },
    [delay]
  )
}

/**
 * Hook para detectar quando elemento está visível na viewport
 */
export function useInView(options = {}) {
  const [isInView, setIsInView] = useState(false)
  const [hasBeenInView, setHasBeenInView] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
        if (entry.isIntersecting) {
          setHasBeenInView(true)
          if (options.triggerOnce) {
            observer.disconnect()
          }
        }
      },
      {
        threshold: options.threshold || 0,
        rootMargin: options.rootMargin || '0px',
      }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [options.threshold, options.rootMargin, options.triggerOnce])

  return { ref, isInView, hasBeenInView }
}

/**
 * Hook para infinite scroll
 */
export function useInfiniteScroll(callback, options = {}) {
  const { threshold = 100, enabled = true } = options
  const loadingRef = useRef(false)

  useEffect(() => {
    if (!enabled) return

    const handleScroll = () => {
      if (loadingRef.current) return

      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = document.documentElement.clientHeight

      if (scrollHeight - scrollTop - clientHeight < threshold) {
        loadingRef.current = true
        Promise.resolve(callback()).finally(() => {
          loadingRef.current = false
        })
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [callback, threshold, enabled])
}

export default useDebounce
