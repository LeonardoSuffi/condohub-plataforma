import React from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useInactivityTimeout } from './useInactivityTimeout'
import authReducer from '../store/slices/authSlice'

// Helper to create a store with custom initial state
function createTestStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState,
  })
}

// Wrapper component with Redux Provider
function createWrapper(store) {
  return function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>
  }
}

describe('useInactivityTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Reset document visibility
    Object.defineProperty(document, 'visibilityState', {
      writable: true,
      value: 'visible',
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  // ========================================
  // Initial State Tests
  // ========================================

  describe('Initial State', () => {
    it('returns showWarning false initially', () => {
      const store = createTestStore({
        auth: { isAuthenticated: true, user: { id: 1 } },
      })

      const { result } = renderHook(() => useInactivityTimeout(30, 5), {
        wrapper: createWrapper(store),
      })

      expect(result.current.showWarning).toBe(false)
    })

    it('returns remainingTime as 0 initially', () => {
      const store = createTestStore({
        auth: { isAuthenticated: true, user: { id: 1 } },
      })

      const { result } = renderHook(() => useInactivityTimeout(30, 5), {
        wrapper: createWrapper(store),
      })

      expect(result.current.remainingTime).toBe(0)
    })

    it('provides extendSession function', () => {
      const store = createTestStore({
        auth: { isAuthenticated: true, user: { id: 1 } },
      })

      const { result } = renderHook(() => useInactivityTimeout(30, 5), {
        wrapper: createWrapper(store),
      })

      expect(typeof result.current.extendSession).toBe('function')
    })

    it('provides handleLogout function', () => {
      const store = createTestStore({
        auth: { isAuthenticated: true, user: { id: 1 } },
      })

      const { result } = renderHook(() => useInactivityTimeout(30, 5), {
        wrapper: createWrapper(store),
      })

      expect(typeof result.current.handleLogout).toBe('function')
    })
  })

  // ========================================
  // Warning Display Tests
  // ========================================

  describe('Warning Display', () => {
    it('sets showWarning true after timeout minus warning period', () => {
      const store = createTestStore({
        auth: { isAuthenticated: true, user: { id: 1 } },
      })

      const timeoutMinutes = 1 // 1 minute timeout
      const warningMinutes = 0.5 // 30 seconds warning

      const { result } = renderHook(
        () => useInactivityTimeout(timeoutMinutes, warningMinutes),
        { wrapper: createWrapper(store) }
      )

      expect(result.current.showWarning).toBe(false)

      // Fast-forward to just before warning period (30 seconds)
      act(() => {
        vi.advanceTimersByTime(30 * 1000)
      })

      expect(result.current.showWarning).toBe(true)
    })

    it('starts countdown when warning is shown', () => {
      const store = createTestStore({
        auth: { isAuthenticated: true, user: { id: 1 } },
      })

      const timeoutMinutes = 1
      const warningMinutes = 0.5

      const { result } = renderHook(
        () => useInactivityTimeout(timeoutMinutes, warningMinutes),
        { wrapper: createWrapper(store) }
      )

      // Fast-forward to warning period
      act(() => {
        vi.advanceTimersByTime(30 * 1000)
      })

      expect(result.current.showWarning).toBe(true)
      expect(result.current.remainingTime).toBe(30) // 30 seconds warning
    })

    it('counts down remaining time', () => {
      const store = createTestStore({
        auth: { isAuthenticated: true, user: { id: 1 } },
      })

      const timeoutMinutes = 1
      const warningMinutes = 0.5

      const { result } = renderHook(
        () => useInactivityTimeout(timeoutMinutes, warningMinutes),
        { wrapper: createWrapper(store) }
      )

      // Fast-forward to warning period
      act(() => {
        vi.advanceTimersByTime(30 * 1000)
      })

      expect(result.current.remainingTime).toBe(30)

      // Advance 5 seconds
      act(() => {
        vi.advanceTimersByTime(5 * 1000)
      })

      expect(result.current.remainingTime).toBe(25)
    })
  })

  // ========================================
  // Extend Session Tests
  // ========================================

  describe('Extend Session', () => {
    it('extendSession resets warning state', () => {
      const store = createTestStore({
        auth: { isAuthenticated: true, user: { id: 1 } },
      })

      const timeoutMinutes = 1
      const warningMinutes = 0.5

      const { result } = renderHook(
        () => useInactivityTimeout(timeoutMinutes, warningMinutes),
        { wrapper: createWrapper(store) }
      )

      // Fast-forward to warning period
      act(() => {
        vi.advanceTimersByTime(30 * 1000)
      })

      expect(result.current.showWarning).toBe(true)

      // Extend session
      act(() => {
        result.current.extendSession()
      })

      expect(result.current.showWarning).toBe(false)
    })

    it('extendSession resets the timer', () => {
      const store = createTestStore({
        auth: { isAuthenticated: true, user: { id: 1 } },
      })

      const timeoutMinutes = 1
      const warningMinutes = 0.5

      const { result } = renderHook(
        () => useInactivityTimeout(timeoutMinutes, warningMinutes),
        { wrapper: createWrapper(store) }
      )

      // Fast-forward to warning period
      act(() => {
        vi.advanceTimersByTime(30 * 1000)
      })

      expect(result.current.showWarning).toBe(true)

      // Extend session
      act(() => {
        result.current.extendSession()
      })

      expect(result.current.showWarning).toBe(false)

      // Advance 25 seconds (should not show warning yet)
      act(() => {
        vi.advanceTimersByTime(25 * 1000)
      })

      expect(result.current.showWarning).toBe(false)

      // Advance to 30 seconds (should show warning again)
      act(() => {
        vi.advanceTimersByTime(5 * 1000)
      })

      expect(result.current.showWarning).toBe(true)
    })
  })

  // ========================================
  // Logout Tests
  // ========================================

  describe('Handle Logout', () => {
    it('handleLogout clears warning state', () => {
      const store = createTestStore({
        auth: { isAuthenticated: true, user: { id: 1 } },
      })

      const { result } = renderHook(() => useInactivityTimeout(1, 0.5), {
        wrapper: createWrapper(store),
      })

      // Fast-forward to warning period
      act(() => {
        vi.advanceTimersByTime(30 * 1000)
      })

      expect(result.current.showWarning).toBe(true)

      // Manual logout
      act(() => {
        result.current.handleLogout()
      })

      expect(result.current.showWarning).toBe(false)
    })

    it('auto-logout occurs after full timeout period', () => {
      const store = createTestStore({
        auth: { isAuthenticated: true, user: { id: 1 } },
      })

      const { result } = renderHook(() => useInactivityTimeout(1, 0.5), {
        wrapper: createWrapper(store),
      })

      // Fast-forward to warning period (30 seconds)
      act(() => {
        vi.advanceTimersByTime(30 * 1000)
      })

      expect(result.current.showWarning).toBe(true)

      // Fast-forward through warning period to trigger logout (30 more seconds)
      act(() => {
        vi.advanceTimersByTime(30 * 1000)
      })

      // After logout is triggered, warning should be cleared
      // Note: The actual Redux state change is tested in authSlice tests
      expect(result.current.showWarning).toBe(false)
    })
  })

  // ========================================
  // User Activity Tests
  // ========================================

  describe('User Activity', () => {
    it('resets timer on user activity', () => {
      const store = createTestStore({
        auth: { isAuthenticated: true, user: { id: 1 } },
      })

      const { result } = renderHook(() => useInactivityTimeout(1, 0.5), {
        wrapper: createWrapper(store),
      })

      // Advance 20 seconds
      act(() => {
        vi.advanceTimersByTime(20 * 1000)
      })

      // Simulate user activity
      act(() => {
        window.dispatchEvent(new MouseEvent('mousedown'))
        // Wait for debounce
        vi.advanceTimersByTime(1000)
      })

      // Should have reset timer
      expect(result.current.showWarning).toBe(false)

      // Advance 20 more seconds (total 20, not 40)
      act(() => {
        vi.advanceTimersByTime(20 * 1000)
      })

      // Still shouldn't show warning (timer was reset)
      expect(result.current.showWarning).toBe(false)
    })

    it('does not reset timer when warning is shown', () => {
      const store = createTestStore({
        auth: { isAuthenticated: true, user: { id: 1 } },
      })

      const { result } = renderHook(() => useInactivityTimeout(1, 0.5), {
        wrapper: createWrapper(store),
      })

      // Fast-forward to warning period
      act(() => {
        vi.advanceTimersByTime(30 * 1000)
      })

      expect(result.current.showWarning).toBe(true)

      // Simulate user activity (should not reset because warning is showing)
      act(() => {
        window.dispatchEvent(new MouseEvent('mousedown'))
        vi.advanceTimersByTime(1000)
      })

      // Warning should still be shown
      expect(result.current.showWarning).toBe(true)
    })
  })

  // ========================================
  // Visibility Change Tests
  // ========================================

  describe('Visibility Change', () => {
    it('handles tab becoming visible with timeout exceeded', () => {
      const store = createTestStore({
        auth: { isAuthenticated: true, user: { id: 1 } },
      })

      const { result } = renderHook(() => useInactivityTimeout(1, 0.5), {
        wrapper: createWrapper(store),
      })

      // Simulate tab going to background
      act(() => {
        Object.defineProperty(document, 'visibilityState', {
          writable: true,
          value: 'hidden',
        })
      })

      // Advance more than timeout (70 seconds)
      act(() => {
        vi.advanceTimersByTime(70 * 1000)
      })

      // Simulate tab coming back to foreground - this should trigger logout
      act(() => {
        Object.defineProperty(document, 'visibilityState', {
          writable: true,
          value: 'visible',
        })
        document.dispatchEvent(new Event('visibilitychange'))
      })

      // After logout is triggered, warning should be cleared
      // The actual store state change is async and tested in authSlice tests
      expect(result.current.showWarning).toBe(false)
    })

    it('shows warning when tab becomes visible in warning period', () => {
      const store = createTestStore({
        auth: { isAuthenticated: true, user: { id: 1 } },
      })

      const { result } = renderHook(() => useInactivityTimeout(1, 0.5), {
        wrapper: createWrapper(store),
      })

      // Simulate tab going to background
      act(() => {
        Object.defineProperty(document, 'visibilityState', {
          writable: true,
          value: 'hidden',
        })
      })

      // Advance to warning period (30-60 seconds)
      act(() => {
        vi.advanceTimersByTime(35 * 1000)
      })

      // Simulate tab coming back to foreground
      act(() => {
        Object.defineProperty(document, 'visibilityState', {
          writable: true,
          value: 'visible',
        })
        document.dispatchEvent(new Event('visibilitychange'))
      })

      expect(result.current.showWarning).toBe(true)
    })
  })

  // ========================================
  // Unauthenticated User Tests
  // ========================================

  describe('Unauthenticated User', () => {
    it('does nothing when user is not authenticated', () => {
      const store = createTestStore({
        auth: { isAuthenticated: false, user: null },
      })

      const { result } = renderHook(() => useInactivityTimeout(1, 0.5), {
        wrapper: createWrapper(store),
      })

      // Advance to full timeout
      act(() => {
        vi.advanceTimersByTime(60 * 1000)
      })

      // Should not show warning
      expect(result.current.showWarning).toBe(false)
    })

    it('clears timeouts when user logs out', () => {
      const store = createTestStore({
        auth: { isAuthenticated: true, user: { id: 1 } },
      })

      const { result, rerender } = renderHook(
        () => useInactivityTimeout(1, 0.5),
        { wrapper: createWrapper(store) }
      )

      // Fast-forward to warning period
      act(() => {
        vi.advanceTimersByTime(30 * 1000)
      })

      expect(result.current.showWarning).toBe(true)

      // Simulate user logging out (change store state)
      act(() => {
        store.dispatch({ type: 'auth/logout/fulfilled' })
      })

      // Re-render to trigger effect
      rerender()

      // Warning should be cleared
      expect(result.current.showWarning).toBe(false)
    })
  })

  // ========================================
  // Custom Timeout Configuration Tests
  // ========================================

  describe('Custom Configuration', () => {
    it('respects custom timeout duration', () => {
      const store = createTestStore({
        auth: { isAuthenticated: true, user: { id: 1 } },
      })

      const { result } = renderHook(
        () => useInactivityTimeout(2, 1), // 2 minutes timeout, 1 minute warning
        { wrapper: createWrapper(store) }
      )

      // Advance 30 seconds (should not show warning)
      act(() => {
        vi.advanceTimersByTime(30 * 1000)
      })

      expect(result.current.showWarning).toBe(false)

      // Advance to 1 minute (should show warning now, 1 minute before 2-minute timeout)
      act(() => {
        vi.advanceTimersByTime(30 * 1000)
      })

      expect(result.current.showWarning).toBe(true)
    })

    it('respects custom warning duration', () => {
      const store = createTestStore({
        auth: { isAuthenticated: true, user: { id: 1 } },
      })

      const { result } = renderHook(
        () => useInactivityTimeout(1, 0.25), // 1 minute timeout, 15 seconds warning
        { wrapper: createWrapper(store) }
      )

      // Advance 45 seconds (should show warning at 45 seconds for 15 second warning)
      act(() => {
        vi.advanceTimersByTime(45 * 1000)
      })

      expect(result.current.showWarning).toBe(true)
      expect(result.current.remainingTime).toBe(15) // 15 seconds warning
    })
  })

  // ========================================
  // Cleanup Tests
  // ========================================

  describe('Cleanup', () => {
    it('cleans up event listeners on unmount', () => {
      const store = createTestStore({
        auth: { isAuthenticated: true, user: { id: 1 } },
      })

      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const { unmount } = renderHook(() => useInactivityTimeout(1, 0.5), {
        wrapper: createWrapper(store),
      })

      unmount()

      // Should have removed event listeners
      expect(removeEventListenerSpy).toHaveBeenCalled()
    })
  })
})
