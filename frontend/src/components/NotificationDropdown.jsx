import { useState, useEffect, useRef, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  fetchNotifications,
  fetchUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../store/slices/notificationSlice'
import {
  Bell,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Briefcase,
  Star,
  Clock,
  X,
  Check,
  ChevronRight,
  Inbox,
  BellOff,
} from 'lucide-react'

export default function NotificationDropdown() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { notifications, unreadCount, loading } = useSelector((state) => state.notifications)
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [hasNewNotification, setHasNewNotification] = useState(false)
  const dropdownRef = useRef(null)
  const pollingRef = useRef(null)
  const fastPollingRef = useRef(null)
  const prevUnreadCountRef = useRef(unreadCount)

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        handleClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Detect new notifications and show toast
  useEffect(() => {
    if (unreadCount > prevUnreadCountRef.current && prevUnreadCountRef.current !== null) {
      // New notification arrived
      setHasNewNotification(true)

      // Show toast notification
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Nova notificacao
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Voce tem {unreadCount} notificacao{unreadCount > 1 ? 'es' : ''} nao lida{unreadCount > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ), {
        duration: 5000,
        position: 'top-right',
      })

      // Reset animation after 3 seconds
      setTimeout(() => setHasNewNotification(false), 3000)
    }
    prevUnreadCountRef.current = unreadCount
  }, [unreadCount])

  // Polling for unread count - only when authenticated and user exists
  useEffect(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }

    if (!isAuthenticated || !user) {
      return
    }

    // Initial fetch
    dispatch(fetchUnreadCount())

    // Standard polling every 15 seconds for faster notification updates
    pollingRef.current = setInterval(() => {
      if (!isOpen) {
        dispatch(fetchUnreadCount())
      }
    }, 15000)

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }
  }, [dispatch, isAuthenticated, user])

  // Fast polling when dropdown is open
  useEffect(() => {
    if (fastPollingRef.current) {
      clearInterval(fastPollingRef.current)
      fastPollingRef.current = null
    }

    if (isOpen && isAuthenticated && user) {
      dispatch(fetchNotifications())

      // Fast polling every 10 seconds when open
      fastPollingRef.current = setInterval(() => {
        dispatch(fetchNotifications())
      }, 10000)
    }

    return () => {
      if (fastPollingRef.current) {
        clearInterval(fastPollingRef.current)
        fastPollingRef.current = null
      }
    }
  }, [isOpen, dispatch, isAuthenticated, user])

  const handleOpen = useCallback(() => {
    setIsOpen(true)
    setIsAnimating(true)
  }, [])

  const handleClose = useCallback(() => {
    setIsAnimating(false)
    setTimeout(() => setIsOpen(false), 150)
  }, [])

  const handleToggle = useCallback(() => {
    if (isOpen) {
      handleClose()
    } else {
      handleOpen()
    }
  }, [isOpen, handleOpen, handleClose])

  const handleNotificationClick = useCallback((notification) => {
    if (!notification.read_at) {
      dispatch(markAsRead(notification.id))
    }

    // Navigate based on notification data
    const actionUrl = notification.data?.action_url
    if (actionUrl) {
      navigate(actionUrl)
    } else if (notification.data?.deal_id) {
      navigate(`/deals`)
    }

    handleClose()
  }, [dispatch, navigate, handleClose])

  const handleMarkAllRead = useCallback(() => {
    dispatch(markAllAsRead())
  }, [dispatch])

  const handleDelete = useCallback((e, notificationId) => {
    e.stopPropagation()
    dispatch(deleteNotification(notificationId))
  }, [dispatch])

  const getNotificationConfig = (notification) => {
    const type = notification.type
    const status = notification.data?.status

    // Deal status specific colors
    if (type === 'deal_status') {
      switch (status) {
        case 'aceito':
          return {
            icon: CheckCircle,
            bgColor: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
            borderColor: 'border-l-emerald-500',
          }
        case 'rejeitado':
        case 'cancelado':
          return {
            icon: XCircle,
            bgColor: 'bg-red-100',
            iconColor: 'text-red-600',
            borderColor: 'border-l-red-500',
          }
        case 'concluido':
          return {
            icon: CheckCircle,
            bgColor: 'bg-blue-100',
            iconColor: 'text-blue-600',
            borderColor: 'border-l-blue-500',
          }
        default:
          return {
            icon: AlertCircle,
            bgColor: 'bg-amber-100',
            iconColor: 'text-amber-600',
            borderColor: 'border-l-amber-500',
          }
      }
    }

    // Type-based colors
    switch (type) {
      case 'deal_new':
        return {
          icon: Briefcase,
          bgColor: 'bg-indigo-100',
          iconColor: 'text-indigo-600',
          borderColor: 'border-l-indigo-500',
        }
      case 'message':
        return {
          icon: MessageSquare,
          bgColor: 'bg-sky-100',
          iconColor: 'text-sky-600',
          borderColor: 'border-l-sky-500',
        }
      case 'order_status':
        return {
          icon: Clock,
          bgColor: 'bg-purple-100',
          iconColor: 'text-purple-600',
          borderColor: 'border-l-purple-500',
        }
      case 'subscription':
        return {
          icon: Star,
          bgColor: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          borderColor: 'border-l-yellow-500',
        }
      default:
        return {
          icon: Bell,
          bgColor: 'bg-gray-100',
          iconColor: 'text-gray-600',
          borderColor: 'border-l-gray-400',
        }
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Agora mesmo'
    if (diffMins < 60) return `${diffMins} min atras`
    if (diffHours < 24) return `${diffHours}h atras`
    if (diffDays === 1) return 'Ontem'
    if (diffDays < 7) return `${diffDays} dias atras`
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  }

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        className={`relative p-2 rounded-lg transition-all duration-200 ${
          isOpen
            ? 'bg-slate-100 text-slate-700'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
        }`}
      >
        <Bell className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'scale-110' : ''} ${hasNewNotification ? 'animate-bounce' : ''}`} />

        {/* Animated Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center">
            <span className="absolute w-5 h-5 bg-red-400 rounded-full animate-ping opacity-75" />
            <span className="relative w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
              {unreadCount > 99 ? '99' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-50 transform origin-top-right transition-all duration-150 ${
            isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-slate-800 to-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Notificacoes</h3>
                  <p className="text-xs text-slate-300">
                    {unreadCount > 0 ? `${unreadCount} nao lida${unreadCount > 1 ? 's' : ''}` : 'Todas lidas'}
                  </p>
                </div>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  Marcar lidas
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative">
                  <div className="w-10 h-10 border-3 border-slate-200 border-t-slate-700 rounded-full animate-spin" />
                </div>
                <p className="mt-3 text-sm text-gray-500">Carregando...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 px-6 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Inbox className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Tudo em dia!</h4>
                <p className="text-sm text-gray-500">
                  Voce nao tem notificacoes no momento.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => {
                  const config = getNotificationConfig(notification)
                  const Icon = config.icon

                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`group relative px-4 py-3.5 cursor-pointer transition-all duration-200 border-l-4 ${
                        !notification.read_at
                          ? `bg-slate-50/80 ${config.borderColor}`
                          : 'border-l-transparent hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bgColor}`}>
                          <Icon className={`w-5 h-5 ${config.iconColor}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm leading-tight ${
                              !notification.read_at
                                ? 'font-semibold text-gray-900'
                                : 'font-medium text-gray-700'
                            }`}>
                              {notification.title}
                            </p>
                            <button
                              onClick={(e) => handleDelete(e, notification.id)}
                              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-400">
                              {formatTime(notification.created_at)}
                            </span>
                          </div>
                        </div>

                        {/* Unread indicator */}
                        {!notification.read_at && (
                          <div className="w-2.5 h-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex-shrink-0 mt-1.5 shadow-sm" />
                        )}
                      </div>

                      {/* Hover arrow */}
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => {
                  navigate('/notifications')
                  handleClose()
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Ver todas as notificacoes
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
