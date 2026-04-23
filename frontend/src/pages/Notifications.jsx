import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  fetchNotifications,
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
  Check,
  ChevronRight,
  Inbox,
  Trash2,
  CheckCheck,
  Loader2,
  BellRing,
  Filter,
  MailOpen,
  Mail,
  BellOff,
  Sparkles,
  Shield,
  ArrowRight
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Notifications() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { notifications, unreadCount, loading, marking, deleting } = useSelector((state) => state.notifications)
  const [filter, setFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState([])
  const [selectMode, setSelectMode] = useState(false)

  useEffect(() => {
    dispatch(fetchNotifications())
  }, [dispatch])

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read_at
    if (filter === 'read') return notification.read_at
    return true
  })

  const handleNotificationClick = (notification) => {
    if (selectMode) {
      toggleSelect(notification.id)
      return
    }

    if (!notification.read_at) {
      dispatch(markAsRead(notification.id))
    }

    const actionUrl = notification.data?.action_url
    if (actionUrl) {
      navigate(actionUrl)
    } else if (notification.data?.deal_id) {
      navigate('/deals')
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await dispatch(markAllAsRead()).unwrap()
      toast.success('Todas as notificacoes foram marcadas como lidas')
    } catch (error) {
      toast.error('Erro ao marcar notificacoes')
    }
  }

  const handleDelete = async (e, notificationId) => {
    e.stopPropagation()
    try {
      await dispatch(deleteNotification(notificationId)).unwrap()
      toast.success('Notificacao excluida')
    } catch (error) {
      toast.error('Erro ao excluir notificacao')
    }
  }

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredNotifications.map(n => n.id))
    }
  }

  const handleDeleteSelected = async () => {
    for (const id of selectedIds) {
      await dispatch(deleteNotification(id))
    }
    setSelectedIds([])
    setSelectMode(false)
    toast.success(`${selectedIds.length} notificacao(oes) excluida(s)`)
  }

  const handleMarkSelectedRead = async () => {
    for (const id of selectedIds) {
      const notification = notifications.find(n => n.id === id)
      if (notification && !notification.read_at) {
        await dispatch(markAsRead(id))
      }
    }
    setSelectedIds([])
    toast.success('Notificacoes marcadas como lidas')
  }

  const getNotificationConfig = (notification) => {
    const type = notification.type
    const status = notification.data?.status

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
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const readCount = notifications.filter(n => n.read_at).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Full Width */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-amber-500/30 via-orange-500/20 to-transparent rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: '4s' }}
          />
          <div
            className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-violet-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: '5s', animationDelay: '1s' }}
          />
        </div>

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Text Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span className="text-sm font-medium text-white/90">Central de Notificacoes</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
                  Suas <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Notificacoes</span>
                </h1>
                <p className="text-lg text-slate-300 max-w-lg leading-relaxed">
                  Acompanhe todas as atualizacoes, mensagens e alertas importantes da sua conta em tempo real.
                </p>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={marking}
                  className="group relative px-8 py-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {marking ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCheck className="w-5 h-5" />
                    )}
                    Marcar todas como lidas
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              )}

              <div className="flex flex-wrap items-center gap-6 pt-2">
                {[
                  { icon: Bell, text: `${notifications.length} notificacoes`, color: 'text-amber-400' },
                  { icon: Sparkles, text: 'Tempo real', color: 'text-violet-400' },
                  { icon: Shield, text: 'Privado', color: 'text-emerald-400' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-white/70">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <span className="text-sm font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Stats Cards */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="grid grid-cols-2 gap-5">
                  {[
                    { value: notifications.length, label: 'Total de Notificacoes', icon: Bell, color: 'from-slate-500 to-slate-600' },
                    { value: unreadCount, label: 'Nao Lidas', icon: Mail, color: 'from-amber-500 to-orange-500' },
                    { value: readCount, label: 'Lidas', icon: MailOpen, color: 'from-emerald-500 to-teal-500' },
                    { value: selectedIds.length, label: 'Selecionadas', icon: CheckCircle, color: 'from-blue-500 to-cyan-500' },
                  ].map((stat, idx) => (
                    <div
                      key={idx}
                      className={`group bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 ${idx % 2 === 1 ? 'translate-y-6' : ''}`}
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                      <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {unreadCount > 0 && (
                  <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-5 shadow-xl border border-gray-100 flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                      <BellRing className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">Novas Notificacoes</div>
                      <div className="text-xs text-gray-500">{unreadCount} aguardando leitura</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main>
        {/* Filters Bar - Sticky */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4">
              {/* Filters */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                <span className="text-sm font-medium text-gray-400 whitespace-nowrap mr-2">Filtrar:</span>
                <button
                  onClick={() => setFilter('all')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all ${
                    filter === 'all'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 bg-gray-50 hover:bg-gray-900 hover:text-white'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  Todas
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all ${
                    filter === 'unread'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 bg-gray-50 hover:bg-gray-900 hover:text-white'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  Nao lidas
                  {unreadCount > 0 && (
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      filter === 'unread' ? 'bg-white/20' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setFilter('read')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all ${
                    filter === 'read'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 bg-gray-50 hover:bg-gray-900 hover:text-white'
                  }`}
                >
                  <MailOpen className="w-4 h-4" />
                  Lidas
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {selectMode ? (
                  <>
                    <button
                      onClick={handleSelectAll}
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      {selectedIds.length === filteredNotifications.length ? 'Desmarcar' : 'Selecionar todas'}
                    </button>
                    {selectedIds.length > 0 && (
                      <>
                        <button
                          onClick={handleMarkSelectedRead}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-full transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          Marcar lidas
                        </button>
                        <button
                          onClick={handleDeleteSelected}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-full transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Excluir ({selectedIds.length})
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setSelectMode(false)
                        setSelectedIds([])
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-full transition-colors hover:bg-gray-800"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setSelectMode(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-full whitespace-nowrap hover:bg-gray-800 transition-colors"
                  >
                    <Filter className="w-4 h-4" />
                    Selecionar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Notifications List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-[3px] border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500 text-sm">Carregando notificacoes...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                {filter === 'unread' ? (
                  <CheckCircle className="w-12 h-12 text-emerald-400" />
                ) : (
                  <BellOff className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {filter === 'unread' ? 'Tudo em dia!' :
                 filter === 'read' ? 'Nenhuma notificacao lida' :
                 'Nenhuma notificacao'}
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                {filter === 'unread'
                  ? 'Parabens! Todas as suas notificacoes foram lidas.'
                  : filter === 'read'
                  ? 'Voce ainda nao leu nenhuma notificacao.'
                  : 'Quando houver atualizacoes, elas aparecerao aqui.'}
              </p>
              {filter !== 'all' && (
                <button
                  onClick={() => setFilter('all')}
                  className="mt-6 px-6 py-3 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-full transition-colors"
                >
                  Ver todas as notificacoes
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => {
                const config = getNotificationConfig(notification)
                const Icon = config.icon
                const isSelected = selectedIds.includes(notification.id)

                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`group relative bg-white rounded-2xl border cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-gray-300 ${
                      !notification.read_at
                        ? 'border-l-4 ' + config.borderColor + ' border-gray-200'
                        : 'border-gray-200'
                    } ${isSelected ? 'ring-2 ring-blue-500 border-blue-300' : ''}`}
                  >
                    <div className="flex items-start gap-4 p-5">
                      {/* Checkbox in select mode */}
                      {selectMode && (
                        <div className="flex items-center pt-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(notification.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                      )}

                      {/* Icon */}
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${config.bgColor}`}>
                        <Icon className={`w-7 h-7 ${config.iconColor}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <p className={`text-base ${
                                !notification.read_at
                                  ? 'font-bold text-gray-900'
                                  : 'font-semibold text-gray-700'
                              }`}>
                                {notification.title}
                              </p>
                              {!notification.read_at && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-amber-700 bg-amber-100 rounded-full">
                                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                                  Nova
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2">
                              {notification.message}
                            </p>
                          </div>

                          {!selectMode && (
                            <button
                              onClick={(e) => handleDelete(e, notification.id)}
                              disabled={deleting}
                              className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1.5 text-sm text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(notification.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Arrow */}
                      {!selectMode && (
                        <ChevronRight className="w-5 h-5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity self-center" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Stats Footer */}
          {notifications.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Mostrando <span className="font-semibold text-gray-700">{filteredNotifications.length}</span> de <span className="font-semibold text-gray-700">{notifications.length}</span> notificacoes
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
