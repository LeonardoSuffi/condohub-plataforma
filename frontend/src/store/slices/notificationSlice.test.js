import { describe, it, expect, vi, beforeEach } from 'vitest'
import notificationReducer, {
  clearError,
  addNotification,
  resetNotifications,
} from './notificationSlice'

describe('notificationSlice', () => {
  const initialState = {
    notifications: [],
    unreadCount: 0,
    loading: false,
    marking: false,
    deleting: false,
    error: null,
  }

  describe('reducers', () => {
    it('should return the initial state', () => {
      expect(notificationReducer(undefined, { type: 'unknown' })).toEqual(
        expect.objectContaining({
          notifications: [],
          unreadCount: 0,
        })
      )
    })

    it('should handle clearError', () => {
      const stateWithError = {
        ...initialState,
        error: 'Some error',
      }

      const state = notificationReducer(stateWithError, clearError())

      expect(state.error).toBeNull()
    })

    it('should handle addNotification', () => {
      const newNotification = { id: 1, title: 'New Notification', read_at: null }

      const state = notificationReducer(initialState, addNotification(newNotification))

      expect(state.notifications).toHaveLength(1)
      expect(state.notifications[0]).toEqual(newNotification)
      expect(state.unreadCount).toBe(1)
    })

    it('should not add duplicate notification', () => {
      const existingNotifications = [{ id: 1, title: 'Existing', read_at: null }]
      const duplicateNotification = { id: 1, title: 'Existing', read_at: null }

      const state = notificationReducer(
        { ...initialState, notifications: existingNotifications, unreadCount: 1 },
        addNotification(duplicateNotification)
      )

      expect(state.notifications).toHaveLength(1)
      expect(state.unreadCount).toBe(1)
    })

    it('should handle resetNotifications', () => {
      const stateWithNotifications = {
        ...initialState,
        notifications: [{ id: 1 }, { id: 2 }],
        unreadCount: 2,
        loading: true,
        error: 'Some error',
      }

      const state = notificationReducer(stateWithNotifications, resetNotifications())

      expect(state.notifications).toEqual([])
      expect(state.unreadCount).toBe(0)
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('async thunks - fetchNotifications', () => {
    it('should set loading to true on pending', () => {
      const action = { type: 'notifications/fetchNotifications/pending' }
      const state = notificationReducer(initialState, action)

      expect(state.loading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should update notifications on fulfilled', () => {
      const mockPayload = {
        notifications: {
          data: [
            { id: 1, title: 'Notification 1', read_at: null },
            { id: 2, title: 'Notification 2', read_at: '2024-01-01' },
          ],
        },
        unread_count: 1,
      }

      const action = { type: 'notifications/fetchNotifications/fulfilled', payload: mockPayload }
      const state = notificationReducer({ ...initialState, loading: true }, action)

      expect(state.loading).toBe(false)
      expect(state.notifications).toHaveLength(2)
      expect(state.unreadCount).toBe(1)
    })

    it('should handle error on rejected', () => {
      const action = { type: 'notifications/fetchNotifications/rejected', payload: 'Network error' }
      const state = notificationReducer({ ...initialState, loading: true }, action)

      expect(state.loading).toBe(false)
      expect(state.error).toBe('Network error')
    })
  })

  describe('async thunks - fetchUnreadCount', () => {
    it('should not set loading on pending (background polling)', () => {
      const action = { type: 'notifications/fetchUnreadCount/pending' }
      const state = notificationReducer(initialState, action)

      expect(state.loading).toBe(false)
    })

    it('should update unreadCount on fulfilled', () => {
      const action = { type: 'notifications/fetchUnreadCount/fulfilled', payload: 5 }
      const state = notificationReducer(initialState, action)

      expect(state.unreadCount).toBe(5)
    })

    it('should silently fail on rejected (no error update)', () => {
      const action = { type: 'notifications/fetchUnreadCount/rejected', payload: 'Error' }
      const state = notificationReducer(initialState, action)

      expect(state.error).toBeNull() // Silent fail for background polling
    })
  })

  describe('async thunks - markAsRead', () => {
    it('should set marking to true on pending', () => {
      const action = { type: 'notifications/markAsRead/pending' }
      const state = notificationReducer(initialState, action)

      expect(state.marking).toBe(true)
    })

    it('should mark notification as read and decrement count on fulfilled', () => {
      const existingNotifications = [
        { id: 1, title: 'Unread', read_at: null },
        { id: 2, title: 'Read', read_at: '2024-01-01' },
      ]
      const updatedNotification = { id: 1, title: 'Unread', read_at: '2024-01-02' }

      const action = { type: 'notifications/markAsRead/fulfilled', payload: updatedNotification }
      const state = notificationReducer(
        { ...initialState, notifications: existingNotifications, unreadCount: 1, marking: true },
        action
      )

      expect(state.marking).toBe(false)
      expect(state.notifications[0].read_at).toBe('2024-01-02')
      expect(state.unreadCount).toBe(0)
    })

    it('should not decrement count for already read notification', () => {
      const existingNotifications = [
        { id: 1, title: 'Already Read', read_at: '2024-01-01' },
      ]
      const updatedNotification = { id: 1, title: 'Already Read', read_at: '2024-01-02' }

      const action = { type: 'notifications/markAsRead/fulfilled', payload: updatedNotification }
      const state = notificationReducer(
        { ...initialState, notifications: existingNotifications, unreadCount: 0, marking: true },
        action
      )

      expect(state.unreadCount).toBe(0) // No change
    })
  })

  describe('async thunks - markAllAsRead', () => {
    it('should set marking to true on pending', () => {
      const action = { type: 'notifications/markAllAsRead/pending' }
      const state = notificationReducer(initialState, action)

      expect(state.marking).toBe(true)
    })

    it('should mark all notifications as read and reset count on fulfilled', () => {
      const existingNotifications = [
        { id: 1, title: 'Unread 1', read_at: null },
        { id: 2, title: 'Unread 2', read_at: null },
        { id: 3, title: 'Already Read', read_at: '2024-01-01' },
      ]

      const action = { type: 'notifications/markAllAsRead/fulfilled' }
      const state = notificationReducer(
        { ...initialState, notifications: existingNotifications, unreadCount: 2, marking: true },
        action
      )

      expect(state.marking).toBe(false)
      expect(state.notifications.every(n => n.read_at !== null)).toBe(true)
      expect(state.unreadCount).toBe(0)
    })
  })

  describe('async thunks - deleteNotification', () => {
    it('should set deleting to true on pending', () => {
      const action = { type: 'notifications/deleteNotification/pending' }
      const state = notificationReducer(initialState, action)

      expect(state.deleting).toBe(true)
    })

    it('should remove notification and decrement count if unread', () => {
      const existingNotifications = [
        { id: 1, title: 'Unread', read_at: null },
        { id: 2, title: 'Read', read_at: '2024-01-01' },
      ]

      const action = { type: 'notifications/deleteNotification/fulfilled', payload: 1 }
      const state = notificationReducer(
        { ...initialState, notifications: existingNotifications, unreadCount: 1, deleting: true },
        action
      )

      expect(state.deleting).toBe(false)
      expect(state.notifications).toHaveLength(1)
      expect(state.notifications[0].id).toBe(2)
      expect(state.unreadCount).toBe(0)
    })

    it('should remove notification without decrementing count if read', () => {
      const existingNotifications = [
        { id: 1, title: 'Read', read_at: '2024-01-01' },
        { id: 2, title: 'Another', read_at: '2024-01-02' },
      ]

      const action = { type: 'notifications/deleteNotification/fulfilled', payload: 1 }
      const state = notificationReducer(
        { ...initialState, notifications: existingNotifications, unreadCount: 0, deleting: true },
        action
      )

      expect(state.notifications).toHaveLength(1)
      expect(state.unreadCount).toBe(0)
    })

    it('should not go below 0 for unreadCount', () => {
      const existingNotifications = [
        { id: 1, title: 'Unread', read_at: null },
      ]

      const action = { type: 'notifications/deleteNotification/fulfilled', payload: 1 }
      const state = notificationReducer(
        { ...initialState, notifications: existingNotifications, unreadCount: 0, deleting: true },
        action
      )

      expect(state.unreadCount).toBe(0) // Math.max(0, -1) = 0
    })
  })
})
