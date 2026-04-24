import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../../services/api'
import {
  Users,
  Building2,
  UserCheck,
  DollarSign,
  TrendingUp,
  MessageSquare,
  CreditCard,
  Award,
  BarChart3,
  Image,
  Tag,
  Settings,
  ChevronRight,
  ArrowUpRight,
  CheckCircle,
  Clock,
  XCircle,
  Handshake,
  Shield,
  Sparkles,
  Activity,
  PieChart,
  Loader2
} from 'lucide-react'

export default function AdminPanel() {
  const { user } = useSelector((state) => state.auth)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userStats, setUserStats] = useState(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [financeRes, usersRes] = await Promise.all([
        api.get('/admin/finance'),
        api.get('/admin/users?per_page=1')
      ])
      setStats(financeRes.data.data)
      setUserStats(usersRes.data.meta || usersRes.data)
    } catch (_error) {
      // Silently handle error
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Carregando painel...</p>
        </div>
      </div>
    )
  }

  const totalDeals = stats?.deals?.total || 0
  const completedDeals = stats?.deals?.concluido || 0
  const conversionRate = totalDeals > 0 ? ((completedDeals / totalDeals) * 100).toFixed(1) : 0

  const quickLinks = [
    { to: '/admin/users', icon: Users, label: 'Usuarios', desc: 'Gerenciar contas', color: 'from-blue-500 to-cyan-500' },
    { to: '/admin/plans', icon: CreditCard, label: 'Planos', desc: 'Assinaturas', color: 'from-purple-500 to-pink-500' },
    { to: '/admin/categories', icon: Tag, label: 'Categorias', desc: 'Servicos', color: 'from-amber-500 to-orange-500' },
    { to: '/admin/banners', icon: Image, label: 'Banners', desc: 'Promocoes', color: 'from-emerald-500 to-teal-500' },
    { to: '/admin/finance', icon: BarChart3, label: 'Financeiro', desc: 'Transacoes', color: 'from-rose-500 to-red-500' },
    { to: '/deals', icon: MessageSquare, label: 'Negociacoes', desc: 'Todas', color: 'from-indigo-500 to-violet-500' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header - Full Width */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-transparent rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: '4s' }}
          />
          <div
            className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-500/20 via-blue-500/10 to-transparent rounded-full blur-3xl animate-pulse"
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
                <Shield className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium text-white/90">Painel Administrativo</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Bem-vindo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{user?.name?.split(' ')[0]}</span>
              </h1>
              <p className="text-slate-300 max-w-lg">
                Gerencie toda a plataforma ServicePro. Usuarios, planos, categorias e muito mais.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {[
                { icon: Activity, text: 'Sistema ativo', color: 'text-emerald-400' },
                { icon: Sparkles, text: 'Tempo real', color: 'text-amber-400' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-white/70">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Receita Total', value: formatCurrency(stats?.revenue?.total), icon: DollarSign, color: 'from-emerald-500 to-teal-500' },
              { label: 'Comissoes', value: formatCurrency(stats?.revenue?.from_commissions), icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
              { label: 'Assinaturas', value: formatCurrency(stats?.revenue?.from_subscriptions), icon: CreditCard, color: 'from-purple-500 to-pink-500' },
              { label: 'Taxa Conversao', value: `${conversionRate}%`, icon: PieChart, color: 'from-amber-500 to-orange-500' },
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
                    <p className="text-xl font-bold text-white">{stat.value}</p>
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
              {/* System Status */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-900">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Status do Sistema
                  </h3>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl mb-4">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-emerald-700">Todos os servicos ativos</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Negociacoes</span>
                      <span className="font-semibold text-gray-900">{stats?.deals?.total || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Taxa de Sucesso</span>
                      <span className="font-semibold text-emerald-600">{conversionRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Usuarios</span>
                      <span className="font-semibold text-gray-900">{userStats?.total || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Navigation */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-4">
                <h4 className="text-xs font-semibold text-indigo-800 uppercase tracking-wider mb-3">Navegacao Rapida</h4>
                <div className="space-y-1">
                  {quickLinks.map((link, idx) => (
                    <Link
                      key={idx}
                      to={link.to}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/70 transition-colors group"
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${link.color} flex items-center justify-center`}>
                        <link.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700">{link.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Revenue Summary */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Receita Total</h4>
                <p className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(stats?.revenue?.total)}</p>
                <p className="text-sm text-gray-500 mb-4">Periodo atual</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                        style={{ width: stats?.revenue?.total > 0 ? `${(stats?.revenue?.from_commissions / stats?.revenue?.total) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-16 text-right">Comissoes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        style={{ width: stats?.revenue?.total > 0 ? `${(stats?.revenue?.from_subscriptions / stats?.revenue?.total) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-16 text-right">Assinat.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Area */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Deals Pipeline */}
            {stats?.deals && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Pipeline de Negociacoes</h2>
                    <p className="text-sm text-gray-500">Acompanhe o fluxo de conversao</p>
                  </div>
                  <Link
                    to="/deals"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
                  >
                    Ver todas
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="p-6">
                  {/* Pipeline Visual */}
                  <div className="flex items-center gap-2 mb-6">
                    {[
                      { label: 'Abertas', value: stats.deals.aberto || 0, color: 'bg-blue-500', width: stats.deals.total > 0 ? (stats.deals.aberto / stats.deals.total) * 100 : 0 },
                      { label: 'Negociando', value: stats.deals.negociando || 0, color: 'bg-amber-500', width: stats.deals.total > 0 ? (stats.deals.negociando / stats.deals.total) * 100 : 0 },
                      { label: 'Concluidas', value: stats.deals.concluido || 0, color: 'bg-emerald-500', width: stats.deals.total > 0 ? (stats.deals.concluido / stats.deals.total) * 100 : 0 },
                      { label: 'Rejeitadas', value: stats.deals.rejeitado || 0, color: 'bg-red-500', width: stats.deals.total > 0 ? (stats.deals.rejeitado / stats.deals.total) * 100 : 0 },
                    ].map((stage, idx) => (
                      <div key={idx} className={`h-3 ${stage.color} rounded-full transition-all`} style={{ width: `${Math.max(stage.width, 2)}%` }} />
                    ))}
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { label: 'Total', value: stats.deals.total || 0, icon: MessageSquare, color: 'from-slate-600 to-slate-700', bg: 'bg-slate-50' },
                      { label: 'Abertas', value: stats.deals.aberto || 0, icon: Clock, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
                      { label: 'Negociando', value: stats.deals.negociando || 0, icon: Handshake, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50' },
                      { label: 'Concluidas', value: stats.deals.concluido || 0, icon: CheckCircle, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50' },
                      { label: 'Rejeitadas', value: stats.deals.rejeitado || 0, icon: XCircle, color: 'from-red-500 to-red-600', bg: 'bg-red-50' },
                    ].map((item, idx) => (
                      <div key={idx} className={`${item.bg} rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow`}>
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3`}>
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Stats Cards Row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Users Card */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Usuarios</h3>
                        <p className="text-sm text-gray-500">Cadastros na plataforma</p>
                      </div>
                    </div>
                    <span className="text-3xl font-bold text-gray-900">{userStats?.total || 0}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-blue-50 rounded-xl p-3 text-center">
                      <Building2 className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <p className="text-lg font-bold text-blue-700">{userStats?.by_type?.empresa || 0}</p>
                      <p className="text-xs text-blue-600">Empresas</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-3 text-center">
                      <UserCheck className="w-5 h-5 text-green-600 mx-auto mb-1" />
                      <p className="text-lg font-bold text-green-700">{userStats?.by_type?.cliente || 0}</p>
                      <p className="text-xs text-green-600">Clientes</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-3 text-center">
                      <Shield className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                      <p className="text-lg font-bold text-purple-700">{userStats?.by_type?.admin || 0}</p>
                      <p className="text-xs text-purple-600">Admins</p>
                    </div>
                  </div>
                </div>
                <Link
                  to="/admin/users"
                  className="flex items-center justify-center gap-2 py-4 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors border-t border-gray-100"
                >
                  Gerenciar usuarios
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Revenue Card */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Financeiro</h3>
                        <p className="text-sm text-gray-500">Resumo de receitas</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-emerald-600">{formatCurrency(stats?.revenue?.total)}</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm text-gray-600">Comissoes</span>
                      </div>
                      <span className="font-semibold text-gray-900">{formatCurrency(stats?.revenue?.from_commissions)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="text-sm text-gray-600">Assinaturas</span>
                      </div>
                      <span className="font-semibold text-gray-900">{formatCurrency(stats?.revenue?.from_subscriptions)}</span>
                    </div>
                  </div>
                </div>
                <Link
                  to="/admin/finance"
                  className="flex items-center justify-center gap-2 py-4 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors border-t border-gray-100"
                >
                  Ver detalhes
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Acoes Rapidas</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { to: '/admin/users', icon: Users, label: 'Novo Usuario', color: 'from-blue-500 to-cyan-500' },
                  { to: '/admin/plans', icon: CreditCard, label: 'Novo Plano', color: 'from-purple-500 to-pink-500' },
                  { to: '/admin/categories', icon: Tag, label: 'Nova Categoria', color: 'from-amber-500 to-orange-500' },
                  { to: '/admin/banners', icon: Image, label: 'Novo Banner', color: 'from-emerald-500 to-teal-500' },
                ].map((action, idx) => (
                  <Link
                    key={idx}
                    to={action.to}
                    className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/20 transition-all group"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-white">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
