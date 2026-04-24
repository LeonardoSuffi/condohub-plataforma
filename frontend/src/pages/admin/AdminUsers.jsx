import { useEffect, useState } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import {
  Users,
  Building2,
  UserCheck,
  UserX,
  Search,
  Plus,
  Eye,
  Edit3,
  Trash2,
  Lock,
  Unlock,
  Shield,
  ShieldOff,
  Key,
  CreditCard,
  Mail,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  AlertTriangle,
  Calendar,
  Phone,
  Download,
  Filter,
  CheckSquare,
  Square,
  RefreshCw,
  UserPlus,
  TrendingUp,
  Activity,
} from 'lucide-react'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ current: 1, last: 1, total: 0 })
  const [filters, setFilters] = useState({
    type: '',
    status: 'active',
    verified: '',
    search: '',
    per_page: 15,
    date_from: '',
    date_to: '',
    has_subscription: '',
    last_login: '',
  })
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Selecao em massa
  const [selectedUsers, setSelectedUsers] = useState([])

  // Modais
  const [selectedUser, setSelectedUser] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [filters.type, filters.status, filters.verified, filters.has_subscription, filters.last_login, pagination.current])

  useEffect(() => {
    setSelectedUsers([])
  }, [users])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const params = {
        type: filters.type || undefined,
        status: filters.status || undefined,
        verified: filters.verified !== '' ? filters.verified === 'true' : undefined,
        search: filters.search || undefined,
        per_page: filters.per_page,
        page: pagination.current,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
        has_subscription: filters.has_subscription !== '' ? filters.has_subscription === 'true' : undefined,
        last_login: filters.last_login || undefined,
      }
      const response = await api.get('/admin/users', { params })
      setUsers(response.data.data || [])
      setStats(response.data.stats || null)
      setPagination({
        current: response.data.meta?.current_page || 1,
        last: response.data.meta?.last_page || 1,
        total: response.data.meta?.total || 0,
      })
    } catch (_error) {
      toast.error('Erro ao carregar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const toggleSelectUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map(u => u.id))
    }
  }

  const handleBulkBlock = async () => {
    try {
      await Promise.all(selectedUsers.map(id =>
        api.patch(`/admin/users/${id}`, { blocked: true })
      ))
      toast.success(`${selectedUsers.length} usuarios bloqueados`)
      setSelectedUsers([])
      loadUsers()
    } catch (_error) {
      toast.error('Erro ao bloquear usuarios')
    }
  }

  const handleBulkUnblock = async () => {
    try {
      await Promise.all(selectedUsers.map(id =>
        api.patch(`/admin/users/${id}`, { blocked: false })
      ))
      toast.success(`${selectedUsers.length} usuarios desbloqueados`)
      setSelectedUsers([])
      loadUsers()
    } catch (_error) {
      toast.error('Erro ao desbloquear usuarios')
    }
  }

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedUsers.map(id =>
        api.delete(`/admin/users/${id}`)
      ))
      toast.success(`${selectedUsers.length} usuarios excluidos`)
      setSelectedUsers([])
      setShowBulkDeleteModal(false)
      loadUsers()
    } catch (_error) {
      toast.error('Erro ao excluir usuarios')
    }
  }

  const handleExport = async (format = 'csv') => {
    try {
      setExporting(true)
      const params = {
        type: filters.type || undefined,
        status: filters.status || undefined,
        verified: filters.verified !== '' ? filters.verified === 'true' : undefined,
        search: filters.search || undefined,
        format,
        all: true,
      }
      const response = await api.get('/admin/users/export', {
        params,
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `usuarios_${new Date().toISOString().split('T')[0]}.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('Exportacao concluida')
    } catch (_error) {
      generateLocalCSV()
    } finally {
      setExporting(false)
    }
  }

  const generateLocalCSV = () => {
    const headers = ['ID', 'Nome', 'Email', 'Tipo', 'Status', 'Verificado', 'Plano', 'Criado em']
    const rows = users.map(u => [
      u.id,
      u.name,
      u.email,
      u.type,
      u.deleted_at ? 'Bloqueado' : 'Ativo',
      u.company_profile?.verified ? 'Sim' : 'Nao',
      u.active_subscription?.plan?.name || '-',
      new Date(u.created_at).toLocaleDateString('pt-BR')
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `usuarios_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    toast.success('Exportacao concluida (dados da pagina atual)')
  }

  const clearFilters = () => {
    setFilters({
      type: '',
      status: 'active',
      verified: '',
      search: '',
      per_page: 15,
      date_from: '',
      date_to: '',
      has_subscription: '',
      last_login: '',
    })
    setPagination({ ...pagination, current: 1 })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPagination({ ...pagination, current: 1 })
    loadUsers()
  }

  const handleVerify = async (userId, verified) => {
    try {
      await api.patch(`/admin/users/${userId}/verify`, { verified })
      toast.success(verified ? 'Empresa verificada!' : 'Verificacao removida')
      loadUsers()
    } catch (_error) {
      toast.error('Erro ao atualizar verificacao')
    }
  }

  const handleBlock = async (userId, blocked, reason = '') => {
    try {
      await api.patch(`/admin/users/${userId}`, { blocked, blocked_reason: reason })
      toast.success(blocked ? 'Usuario bloqueado' : 'Usuario desbloqueado')
      loadUsers()
    } catch (_error) {
      toast.error('Erro ao atualizar usuario')
    }
  }

  const handleDelete = async () => {
    if (!selectedUser) return
    try {
      await api.delete(`/admin/users/${selectedUser.id}`)
      toast.success('Usuario excluido permanentemente')
      setShowDeleteModal(false)
      setSelectedUser(null)
      loadUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao excluir usuario')
    }
  }

  const handleVerifyEmail = async (userId) => {
    try {
      await api.post(`/admin/users/${userId}/verify-email`)
      toast.success('Email verificado com sucesso')
      loadUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao verificar email')
    }
  }

  const openViewModal = async (user) => {
    try {
      const response = await api.get(`/admin/users/${user.id}`)
      setSelectedUser(response.data.data)
      setShowViewModal(true)
    } catch (_error) {
      toast.error('Erro ao carregar detalhes')
    }
  }

  const openEditModal = (user) => {
    setSelectedUser(user)
    setShowEditModal(true)
  }

  const getTypeBadge = (type) => {
    const styles = {
      empresa: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      cliente: 'bg-green-500/10 text-green-400 border border-green-500/20',
      admin: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    }
    return styles[type] || 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
  }

  const getTypeLabel = (type) => {
    const labels = { empresa: 'Empresa', cliente: 'Cliente', admin: 'Admin' }
    return labels[type] || type
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header - Full Width */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/30 via-cyan-500/20 to-transparent rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: '4s' }}
          />
          <div
            className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse"
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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-white/90">Gestao de Usuarios</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Gerenciar <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Usuarios</span>
              </h1>
              <p className="text-slate-300 max-w-lg">
                Administre usuarios, empresas e clientes da plataforma.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <UserPlus className="w-5 h-5" />
                Novo Usuario
              </button>
              <button
                onClick={() => handleExport('csv')}
                disabled={exporting}
                className="flex items-center gap-2 px-5 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-medium hover:bg-white/20 transition-all disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                {exporting ? 'Exportando...' : 'Exportar'}
              </button>
              <button
                onClick={() => loadUsers()}
                className="flex items-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all"
                title="Atualizar lista"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            {[
              { value: stats?.total || 0, label: 'Total', icon: Users, color: 'from-blue-500 to-cyan-500' },
              { value: stats?.empresas || 0, label: 'Empresas', icon: Building2, color: 'from-indigo-500 to-purple-500' },
              { value: stats?.clientes || 0, label: 'Clientes', icon: UserCheck, color: 'from-emerald-500 to-teal-500' },
              { value: stats?.verificados || 0, label: 'Verificados', icon: Shield, color: 'from-amber-500 to-orange-500' },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center flex-shrink-0`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-slate-400">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-4">
              {/* Quick Stats Panel */}
              {stats && (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-900">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-400" />
                      Resumo Geral
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {[
                      { label: 'Total', value: stats.total, color: 'bg-blue-500' },
                      { label: 'Empresas', value: stats.empresas, color: 'bg-indigo-500' },
                      { label: 'Clientes', value: stats.clientes, color: 'bg-green-500' },
                      { label: 'Admins', value: stats.admins, color: 'bg-purple-500' },
                      { label: 'Bloqueados', value: stats.bloqueados, color: 'bg-red-500' },
                      { label: 'Verificados', value: stats.verificados, color: 'bg-emerald-500' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${item.color}`} />
                          <span className="text-sm text-gray-600">{item.label}</span>
                        </div>
                        <span className="font-semibold text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Filters */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100 p-4">
                <h4 className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-3">Filtro Rapido</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Todos', value: '' },
                    { label: 'Empresas', value: 'empresa' },
                    { label: 'Clientes', value: 'cliente' },
                    { label: 'Admins', value: 'admin' },
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setFilters({ ...filters, type: item.value })}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                        filters.type === item.value
                          ? 'bg-blue-600 text-white font-medium'
                          : 'text-gray-700 hover:bg-blue-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Legenda</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600">Empresa Verificada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-red-500" />
                    <span className="text-gray-600">Usuario Bloqueado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-amber-500" />
                    <span className="text-gray-600">Email nao verificado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Area */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Bulk Actions Bar */}
            {selectedUsers.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <CheckSquare className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-blue-900">
                    {selectedUsers.length} selecionado{selectedUsers.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleBulkBlock} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 rounded-xl hover:bg-amber-200 transition-colors">
                    <Lock className="w-4 h-4" /> Bloquear
                  </button>
                  <button onClick={handleBulkUnblock} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-xl hover:bg-green-200 transition-colors">
                    <Unlock className="w-4 h-4" /> Desbloquear
                  </button>
                  <button onClick={() => setShowBulkDeleteModal(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-xl hover:bg-red-200 transition-colors">
                    <Trash2 className="w-4 h-4" /> Excluir
                  </button>
                  <button onClick={() => setSelectedUsers([])} className="p-2 text-gray-500 bg-white rounded-xl hover:bg-gray-100 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <form onSubmit={handleSearch} className="flex gap-4 flex-wrap">
            <select
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">Todos os tipos</option>
              <option value="empresa">Empresas</option>
              <option value="cliente">Clientes</option>
              <option value="admin">Admins</option>
            </select>

            <select
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="active">Ativos</option>
              <option value="blocked">Bloqueados</option>
              <option value="all">Todos</option>
            </select>

            <select
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
              value={filters.verified}
              onChange={(e) => setFilters({ ...filters, verified: e.target.value })}
            >
              <option value="">Verificacao</option>
              <option value="true">Verificados</option>
              <option value="false">Nao verificados</option>
            </select>

            <div className="flex-1 relative min-w-[200px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                placeholder="Buscar por nome, email, CNPJ..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl transition-all ${
                showAdvancedFilters
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtros</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all shadow-sm font-medium"
            >
              Buscar
            </button>
          </form>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="pt-6 mt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Cadastrado de</label>
                <input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Cadastrado ate</label>
                <input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Assinatura</label>
                <select
                  value={filters.has_subscription}
                  onChange={(e) => setFilters({ ...filters, has_subscription: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-sm"
                >
                  <option value="">Todos</option>
                  <option value="true">Com assinatura</option>
                  <option value="false">Sem assinatura</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Ultimo login</label>
                <select
                  value={filters.last_login}
                  onChange={(e) => setFilters({ ...filters, last_login: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-sm"
                >
                  <option value="">Todos</option>
                  <option value="today">Hoje</option>
                  <option value="week">Ultima semana</option>
                  <option value="month">Ultimo mes</option>
                  <option value="inactive">Inativos (30+ dias)</option>
                  <option value="never">Nunca logaram</option>
                </select>
              </div>
              <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Limpar todos os filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-10 h-10 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">Nenhum usuario encontrado</p>
              <p className="text-gray-400 text-sm mt-1">Tente ajustar os filtros de busca</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="py-4 px-4 w-12">
                        <button
                          onClick={toggleSelectAll}
                          className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          {selectedUsers.length === users.length && users.length > 0 ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </th>
                      <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuario</th>
                      <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contato</th>
                      <th className="text-center py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                      <th className="text-center py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-center py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plano</th>
                      <th className="text-right py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acoes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                      <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${selectedUsers.includes(user.id) ? 'bg-blue-50/50' : ''}`}>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => toggleSelectUser(user.id)}
                            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            {selectedUsers.includes(user.id) ? (
                              <CheckSquare className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-gray-600 font-semibold text-lg">
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{user.name}</p>
                              {user.company_profile && (
                                <p className="text-sm text-gray-500 flex items-center gap-1.5">
                                  {user.company_profile.nome_fantasia || user.company_profile.razao_social}
                                  {user.company_profile.verified && (
                                    <Shield className="w-3.5 h-3.5 text-green-500" />
                                  )}
                                </p>
                              )}
                              {user.client_profile && (
                                <p className="text-sm text-gray-500">
                                  {user.client_profile.nome_organizacao || user.client_profile.tipo}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-gray-900 text-sm font-medium">{user.email}</p>
                          {(user.company_profile?.telefone || user.client_profile?.telefone) && (
                            <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3" />
                              {user.company_profile?.telefone || user.client_profile?.telefone}
                            </p>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getTypeBadge(user.type)}`}>
                            {getTypeLabel(user.type)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {user.deleted_at ? (
                              <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                                Bloqueado
                              </span>
                            ) : (
                              <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                                Ativo
                              </span>
                            )}
                            {!user.email_verified_at && (
                              <span className="text-xs text-amber-600 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                Nao verificado
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {user.active_subscription ? (
                            <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">
                              {user.active_subscription.plan?.name}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => openViewModal(user)}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Ver detalhes"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(user)}
                              className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setSelectedUser(user); setShowPasswordModal(true) }}
                              className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Alterar senha"
                            >
                              <Key className="w-4 h-4" />
                            </button>
                            {user.type === 'empresa' && (
                              <button
                                onClick={() => { setSelectedUser(user); setShowSubscriptionModal(true) }}
                                className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="Gerenciar plano"
                              >
                                <CreditCard className="w-4 h-4" />
                              </button>
                            )}
                            {user.type === 'empresa' && user.company_profile && (
                              <button
                                onClick={() => handleVerify(user.id, !user.company_profile.verified)}
                                className={`p-2 rounded-lg transition-colors ${
                                  user.company_profile.verified
                                    ? 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                                    : 'text-emerald-600 hover:bg-emerald-50'
                                }`}
                                title={user.company_profile.verified ? 'Remover verificacao' : 'Verificar empresa'}
                              >
                                {user.company_profile.verified ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                              </button>
                            )}
                            <button
                              onClick={() => handleBlock(user.id, !user.deleted_at)}
                              className={`p-2 rounded-lg transition-colors ${
                                user.deleted_at
                                  ? 'text-green-600 hover:bg-green-50'
                                  : 'text-amber-600 hover:bg-amber-50'
                              }`}
                              title={user.deleted_at ? 'Desbloquear' : 'Bloquear'}
                            >
                              {user.deleted_at ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => { setSelectedUser(user); setShowDeleteModal(true) }}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title="Excluir permanentemente"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                <p className="text-sm text-gray-600">
                  Mostrando <span className="font-semibold">{users.length}</span> de <span className="font-semibold">{pagination.total}</span> usuarios
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination({ ...pagination, current: pagination.current - 1 })}
                    disabled={pagination.current === 1}
                    className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-600 px-3">
                    Pagina <span className="font-semibold">{pagination.current}</span> de <span className="font-semibold">{pagination.last}</span>
                  </span>
                  <button
                    onClick={() => setPagination({ ...pagination, current: pagination.current + 1 })}
                    disabled={pagination.current === pagination.last}
                    className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && selectedUser && (
        <UserViewModal
          user={selectedUser}
          onClose={() => { setShowViewModal(false); setSelectedUser(null) }}
          onVerifyEmail={handleVerifyEmail}
          formatDate={formatDate}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <UserEditModal
          user={selectedUser}
          onClose={() => { setShowEditModal(false); setSelectedUser(null) }}
          onSave={() => { setShowEditModal(false); setSelectedUser(null); loadUsers() }}
        />
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <UserCreateModal
          onClose={() => setShowCreateModal(false)}
          onSave={() => { setShowCreateModal(false); loadUsers() }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <ConfirmModal
          title="Excluir Usuario"
          message={`Tem certeza que deseja excluir permanentemente o usuario "${selectedUser.name}"? Esta acao nao pode ser desfeita.`}
          confirmText="Excluir"
          confirmStyle="danger"
          onConfirm={handleDelete}
          onCancel={() => { setShowDeleteModal(false); setSelectedUser(null) }}
        />
      )}

      {/* Password Modal */}
      {showPasswordModal && selectedUser && (
        <PasswordResetModal
          user={selectedUser}
          onClose={() => { setShowPasswordModal(false); setSelectedUser(null) }}
          onSave={() => { setShowPasswordModal(false); setSelectedUser(null) }}
        />
      )}

      {/* Subscription Modal */}
      {showSubscriptionModal && selectedUser && (
        <SubscriptionModal
          user={selectedUser}
          onClose={() => { setShowSubscriptionModal(false); setSelectedUser(null) }}
          onSave={() => { setShowSubscriptionModal(false); setSelectedUser(null); loadUsers() }}
        />
      )}

      {/* Bulk Delete Modal */}
      {showBulkDeleteModal && (
        <ConfirmModal
          title="Excluir Usuarios"
          message={`Tem certeza que deseja excluir permanentemente ${selectedUsers.length} usuario${selectedUsers.length > 1 ? 's' : ''}? Esta acao nao pode ser desfeita.`}
          confirmText={`Excluir ${selectedUsers.length}`}
          confirmStyle="danger"
          onConfirm={handleBulkDelete}
          onCancel={() => setShowBulkDeleteModal(false)}
        />
      )}
    </div>
  )
}

// Quick Stat Card Component
function QuickStatCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  }

  const iconColors = {
    blue: 'bg-blue-100',
    indigo: 'bg-indigo-100',
    green: 'bg-green-100',
    purple: 'bg-purple-100',
    red: 'bg-red-100',
    emerald: 'bg-emerald-100',
  }

  return (
    <div className={`border rounded-xl p-4 ${colors[color]}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs opacity-75">{label}</p>
        </div>
      </div>
    </div>
  )
}

// User View Modal
function UserViewModal({ user, onClose, onVerifyEmail, formatDate }) {
  const profile = user.user?.company_profile || user.user?.client_profile
  const userData = user.user || user

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Detalhes do Usuario</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg">
              {userData.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{userData.name}</h3>
              <p className="text-gray-500">{userData.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  userData.type === 'empresa' ? 'bg-blue-100 text-blue-700' :
                  userData.type === 'cliente' ? 'bg-green-100 text-green-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {userData.type === 'empresa' ? 'Empresa' : userData.type === 'cliente' ? 'Cliente' : 'Admin'}
                </span>
                {user.is_blocked && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                    Bloqueado
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Email Verification */}
          {!userData.email_verified_at && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-amber-600" />
                <span className="text-sm text-amber-800 font-medium">Email nao verificado</span>
              </div>
              <button
                onClick={() => onVerifyEmail(userData.id)}
                className="px-4 py-2 text-sm font-medium bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
              >
                Verificar agora
              </button>
            </div>
          )}

          {/* Stats */}
          {user.stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {userData.type === 'empresa' && (
                <>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{user.stats.total_services || 0}</p>
                    <p className="text-xs text-gray-500">Servicos</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{user.stats.active_services || 0}</p>
                    <p className="text-xs text-gray-500">Ativos</p>
                  </div>
                </>
              )}
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{user.stats.total_deals || 0}</p>
                <p className="text-xs text-gray-500">Negociacoes</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{user.stats.completed_deals || 0}</p>
                <p className="text-xs text-gray-500">Concluidas</p>
              </div>
            </div>
          )}

          {/* Company Profile */}
          {userData.company_profile && (
            <div className="border border-gray-200 rounded-xl p-5">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-500" />
                Perfil da Empresa
                {userData.company_profile.verified && (
                  <Shield className="w-4 h-4 text-green-500" />
                )}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Razao Social</p>
                  <p className="font-medium text-gray-900">{userData.company_profile.razao_social || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Nome Fantasia</p>
                  <p className="font-medium text-gray-900">{userData.company_profile.nome_fantasia || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">CNPJ</p>
                  <p className="font-medium text-gray-900">{userData.company_profile.cnpj || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Segmento</p>
                  <p className="font-medium text-gray-900">{userData.company_profile.segmento || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Telefone</p>
                  <p className="font-medium text-gray-900">{userData.company_profile.telefone || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Cidade/UF</p>
                  <p className="font-medium text-gray-900">
                    {[userData.company_profile.cidade, userData.company_profile.estado].filter(Boolean).join('/') || '-'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Client Profile */}
          {userData.client_profile && (
            <div className="border border-gray-200 rounded-xl p-5">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-green-500" />
                Perfil do Cliente
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Tipo</p>
                  <p className="font-medium text-gray-900 capitalize">{userData.client_profile.tipo || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">CPF/CNPJ</p>
                  <p className="font-medium text-gray-900">{userData.client_profile.cpf || userData.client_profile.cnpj || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Organizacao</p>
                  <p className="font-medium text-gray-900">{userData.client_profile.nome_organizacao || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Funcionarios</p>
                  <p className="font-medium text-gray-900">{userData.client_profile.num_funcionarios || '-'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Subscription */}
          {userData.active_subscription && (
            <div className="border border-gray-200 rounded-xl p-5">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-500" />
                Assinatura Ativa
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Plano</p>
                  <p className="font-medium text-gray-900">{userData.active_subscription.plan?.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Status</p>
                  <p className="font-medium text-gray-900 capitalize">{userData.active_subscription.status}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Inicio</p>
                  <p className="font-medium text-gray-900">{formatDate(userData.active_subscription.starts_at)}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Termino</p>
                  <p className="font-medium text-gray-900">{formatDate(userData.active_subscription.ends_at)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Login Info */}
          <div className="border border-gray-200 rounded-xl p-5">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              Informacoes de Acesso
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Cadastrado em</p>
                <p className="font-medium text-gray-900">{formatDate(userData.created_at)}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Ultimo login</p>
                <p className="font-medium text-gray-900">{formatDate(userData.last_login_at)}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">IP do ultimo login</p>
                <p className="font-medium text-gray-900">{userData.last_login_ip || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Email verificado</p>
                <p className="font-medium text-gray-900">{userData.email_verified_at ? 'Sim' : 'Nao'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// User Edit Modal
function UserEditModal({ user, onClose, onSave }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    type: user.type || 'cliente',
    company: user.company_profile || {},
    client: user.client_profile || {},
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.patch(`/admin/users/${user.id}`, formData)
      toast.success('Usuario atualizado com sucesso')
      onSave()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Editar Usuario</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            >
              <option value="cliente">Cliente</option>
              <option value="empresa">Empresa</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {user.type === 'empresa' && user.company_profile && (
            <>
              <hr className="my-6" />
              <h3 className="font-semibold text-gray-900">Dados da Empresa</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome Fantasia</label>
                  <input
                    type="text"
                    value={formData.company.nome_fantasia || ''}
                    onChange={(e) => setFormData({ ...formData, company: { ...formData.company, nome_fantasia: e.target.value }})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Segmento</label>
                  <input
                    type="text"
                    value={formData.company.segmento || ''}
                    onChange={(e) => setFormData({ ...formData, company: { ...formData.company, segmento: e.target.value }})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                  <input
                    type="text"
                    value={formData.company.telefone || ''}
                    onChange={(e) => setFormData({ ...formData, company: { ...formData.company, telefone: e.target.value }})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                  <input
                    type="text"
                    value={formData.company.cidade || ''}
                    onChange={(e) => setFormData({ ...formData, company: { ...formData.company, cidade: e.target.value }})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50 font-medium transition-all"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// User Create Modal
function UserCreateModal({ onClose, onSave }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    type: 'cliente',
    company: { cnpj: '', razao_social: '', segmento: '' },
    client: { tipo: 'pessoa_fisica' },
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/admin/users', formData)
      toast.success('Usuario criado com sucesso')
      onSave()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao criar usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Novo Usuario</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Senha *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              required
              minLength={8}
              placeholder="Minimo 8 caracteres"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            >
              <option value="cliente">Cliente</option>
              <option value="empresa">Empresa</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {formData.type === 'empresa' && (
            <>
              <hr className="my-6" />
              <h3 className="font-semibold text-gray-900">Dados da Empresa</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CNPJ *</label>
                <input
                  type="text"
                  value={formData.company.cnpj}
                  onChange={(e) => setFormData({ ...formData, company: { ...formData.company, cnpj: e.target.value }})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Razao Social *</label>
                <input
                  type="text"
                  value={formData.company.razao_social}
                  onChange={(e) => setFormData({ ...formData, company: { ...formData.company, razao_social: e.target.value }})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Segmento *</label>
                <input
                  type="text"
                  value={formData.company.segmento}
                  onChange={(e) => setFormData({ ...formData, company: { ...formData.company, segmento: e.target.value }})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  required
                />
              </div>
            </>
          )}

          {formData.type === 'cliente' && (
            <>
              <hr className="my-6" />
              <h3 className="font-semibold text-gray-900">Dados do Cliente</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo *</label>
                <select
                  value={formData.client.tipo}
                  onChange={(e) => setFormData({ ...formData, client: { ...formData.client, tipo: e.target.value }})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                >
                  <option value="pessoa_fisica">Pessoa Fisica</option>
                  <option value="empresa">Empresa</option>
                  <option value="autonomo">Autonomo</option>
                </select>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50 font-medium transition-all"
            >
              {loading ? 'Criando...' : 'Criar Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Password Reset Modal
function PasswordResetModal({ user, onClose, onSave }) {
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [revokeSession, setRevokeSession] = useState(true)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post(`/admin/users/${user.id}/reset-password`, {
        password,
        revoke_sessions: revokeSession,
      })
      toast.success('Senha alterada com sucesso')
      onSave()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao alterar senha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Alterar Senha</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <p className="text-sm text-gray-600">
            Alterando senha de <strong>{user.name}</strong>
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nova Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              required
              minLength={8}
              placeholder="Minimo 8 caracteres"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={revokeSession}
              onChange={(e) => setRevokeSession(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Encerrar todas as sessoes ativas</span>
          </label>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 font-medium transition-all"
            >
              {loading ? 'Alterando...' : 'Alterar Senha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Subscription Modal
function SubscriptionModal({ user, onClose, onSave }) {
  const [loading, setLoading] = useState(false)
  const [plans, setPlans] = useState([])
  const [action, setAction] = useState('assign')
  const [planId, setPlanId] = useState('')
  const [days, setDays] = useState(30)

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      const response = await api.get('/admin/plans')
      setPlans(response.data.data || [])
    } catch (_error) {
      // Silently handle error loading plans
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post(`/admin/users/${user.id}/subscription`, {
        action,
        plan_id: action === 'assign' ? planId : undefined,
        days: action === 'extend' ? days : undefined,
      })
      toast.success(
        action === 'assign' ? 'Plano atribuido com sucesso' :
        action === 'cancel' ? 'Assinatura cancelada' :
        'Assinatura estendida'
      )
      onSave()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao gerenciar assinatura')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Gerenciar Assinatura</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <p className="text-sm text-gray-600">
            Gerenciando assinatura de <strong>{user.name}</strong>
          </p>

          {user.active_subscription && (
            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-sm text-purple-700">Plano atual:</p>
              <p className="font-semibold text-purple-900">{user.active_subscription.plan?.name}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Acao</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            >
              <option value="assign">Atribuir plano</option>
              <option value="extend" disabled={!user.active_subscription}>Estender assinatura</option>
              <option value="cancel" disabled={!user.active_subscription}>Cancelar assinatura</option>
            </select>
          </div>

          {action === 'assign' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Plano</label>
              <select
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                required
              >
                <option value="">Selecione um plano</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - R$ {plan.price}/{plan.billing_cycle}
                  </option>
                ))}
              </select>
            </div>
          )}

          {action === 'extend' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dias para estender</label>
              <input
                type="number"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                min={1}
                max={365}
                required
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-3 rounded-xl disabled:opacity-50 font-medium transition-all ${
                action === 'cancel'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-500 text-white hover:from-purple-700 hover:to-indigo-600'
              }`}
            >
              {loading ? 'Processando...' :
               action === 'assign' ? 'Atribuir Plano' :
               action === 'extend' ? 'Estender' : 'Cancelar Assinatura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Confirm Modal
function ConfirmModal({ title, message, confirmText, confirmStyle, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          </div>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${
              confirmStyle === 'danger'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
