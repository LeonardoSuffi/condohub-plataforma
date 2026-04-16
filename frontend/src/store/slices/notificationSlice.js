import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications')
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao carregar notificacoes')
    }
  }
)

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications/unread-count')
      return response.data.data.count
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao carregar contagem')
    }
  }
)

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao marcar como lida')
    }
  }
)

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/notifications/mark-all-read')
      return true
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao marcar todas como lidas')
    }
  }
)

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      await api.delete(`/notifications/${notificationId}`)
      return notificationId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao excluir notificacao')
    }
  }
)

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  marking: false,
  deleting: false,
  error: null,
}

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    addNotification: (state, action) => {
      // Avoid duplicates
      const exists = state.notifications.find(n => n.id === action.payload.id)
      if (!exists) {
        state.notifications.unshift(action.payload)
        state.unreadCount += 1
      }
    },
    resetNotifications: (state) => {
      state.notifications = []
      state.unreadCount = 0
      state.loading = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.notifications = action.payload?.notifications?.data || []
        state.unreadCount = action.payload?.unread_count || 0
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Unread Count
      .addCase(fetchUnreadCount.pending, (state) => {
        // Don't set loading for background polling
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload || 0
      })
      .addCase(fetchUnreadCount.rejected, (state) => {
        // Silent fail for background polling - don't update error state
      })
      // Mark as Read
      .addCase(markAsRead.pending, (state) => {
        state.marking = true
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.marking = false
        if (action.payload) {
          const notification = state.notifications.find(n => n.id === action.payload.id)
          if (notification && !notification.read_at) {
            notification.read_at = action.payload.read_at
            state.unreadCount = Math.max(0, state.unreadCount - 1)
          }
        }
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.marking = false
        state.error = action.payload
      })
      // Mark All as Read
      .addCase(markAllAsRead.pending, (state) => {
        state.marking = true
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.marking = false
        state.notifications.forEach(n => {
          if (!n.read_at) {
            n.read_at = new Date().toISOString()
          }
        })
        state.unreadCount = 0
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.marking = false
        state.error = action.payload
      })
      // Delete Notification
      .addCase(deleteNotification.pending, (state) => {
        state.deleting = true
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.deleting = false
        const notification = state.notifications.find(n => n.id === action.payload)
        if (notification && !notification.read_at) {
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
        state.notifications = state.notifications.filter(n => n.id !== action.payload)
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.deleting = false
        state.error = action.payload
      })
  },
})

export const { clearError, addNotification, resetNotifications } = notificationSlice.actions
export default notificationSlice.reducer
