import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../../services/api'
import {
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  BarChart3,
  Tag,
  Settings,
  Handshake,
  Shield,
  Activity,
  PieChart,
  Loader2,
  RefreshCw,
  Star,
  User,
  Briefcase,
  Bell
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line
} from 'recharts'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']
const STATUS_COLORS = {
  aberto: '#3B82F6',
  negociando: '#F59E0B',
  concluido: '#10B981',
  rejeitado: '#EF4444',
  cancelado: '#6B7280'
}

export default function AdminPanel() {
  const { user } = useSelector((state) => state.auth)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadAnalytics()
  }, [period])

  const loadAnalytics = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true)
      const response = await api.get(`/admin/analytics?period=${period}`)
      setAnalytics(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar analytics:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0)
  }

  const formatNumber = (value) => {
    return new Intl.NumberFormat('pt-BR').format(value || 0)
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('R$') || entry.dataKey.includes('commission') || entry.dataKey.includes('subscription') || entry.dataKey.includes('total')
                ? formatCurrency(entry.value)
                : formatNumber(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  const summary = analytics?.summary || {}
  const charts = analytics?.charts || {}
  const recentActivities = analytics?.recent_activities || []
  const healthIndicators = analytics?.health || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Background Effects */}
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

        {/* Header Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
                <Shield className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium text-white/90">Painel Administrativo</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Bem-vindo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{user?.name?.split(' ')[0]}</span>
              </h1>
              <p className="text-slate-300 text-sm">
                Visao completa da plataforma ServicePro
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Period Selector */}
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/10">
                {[
                  { value: '7', label: '7 dias' },
                  { value: '30', label: '30 dias' },
                  { value: '90', label: '90 dias' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setPeriod(option.value)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                      period === option.value
                        ? 'bg-white text-slate-900'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {/* Refresh Button */}
              <button
                onClick={() => loadAnalytics(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 text-white/90 hover:bg-white/20 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium hidden sm:inline">Atualizar</span>
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            {[
              {
                label: 'Receita Total',
                value: formatCurrency(summary.revenue?.total),
                change: summary.revenue?.period > 0 ? `+${formatCurrency(summary.revenue?.period)} no periodo` : null,
                icon: DollarSign,
                color: 'from-emerald-500 to-teal-500',
                trend: 'up'
              },
              {
                label: 'Usuarios',
                value: formatNumber(summary.users?.total),
                change: summary.users?.new_period > 0 ? `+${summary.users?.new_period} novos` : null,
                icon: Users,
                color: 'from-blue-500 to-cyan-500',
                trend: 'up'
              },
              {
                label: 'Negociacoes',
                value: formatNumber(summary.deals?.total),
                change: `${summary.deals?.conversion_rate}% conversao`,
                icon: Handshake,
                color: 'from-purple-500 to-pink-500',
                trend: summary.deals?.conversion_rate >= 20 ? 'up' : 'neutral'
              },
              {
                label: 'Avaliacoes',
                value: summary.reviews?.average?.toFixed(1) || '0.0',
                change: `${formatNumber(summary.reviews?.total)} total`,
                icon: Star,
                color: 'from-amber-500 to-orange-500',
                trend: 'up'
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  {stat.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                  {stat.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
                </div>
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
                {stat.change && (
                  <p className="text-xs text-emerald-400 mt-1">{stat.change}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue Timeline */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Receita ao Longo do Tempo</h2>
                  <p className="text-sm text-gray-500">Comissoes e assinaturas</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-gray-600">Comissoes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-gray-600">Assinaturas</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="h-[280px]">
                {charts.revenue_timeline?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={charts.revenue_timeline}>
                      <defs>
                        <linearGradient id="colorCommissions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorSubscriptions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                      <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => `R$${v}`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="commissions"
                        name="Comissoes"
                        stroke="#10B981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorCommissions)"
                      />
                      <Area
                        type="monotone"
                        dataKey="subscriptions"
                        name="Assinaturas"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorSubscriptions)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Sem dados de receita no periodo</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User Growth */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Crescimento de Usuarios</h2>
                  <p className="text-sm text-gray-500">Novos cadastros por dia</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-gray-600">Empresas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                    <span className="text-gray-600">Clientes</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="h-[280px]">
                {charts.user_growth?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.user_growth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="empresas" name="Empresas" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="clientes" name="Clientes" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Sem novos usuarios no periodo</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Second Row Charts */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Deal Distribution */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Distribuicao de Negociacoes</h2>
              <p className="text-sm text-gray-500">Por status</p>
            </div>
            <div className="p-6">
              <div className="h-[250px]">
                {charts.deal_distribution?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={charts.deal_distribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {charts.deal_distribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Sem negociacoes</p>
                    </div>
                  </div>
                )}
              </div>
              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {charts.deal_distribution?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[item.status] || COLORS[idx % COLORS.length] }}
                    />
                    <span className="text-gray-600">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Categories */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Categorias Populares</h2>
              <p className="text-sm text-gray-500">Por numero de negociacoes</p>
            </div>
            <div className="p-6">
              <div className="h-[250px]">
                {charts.top_categories?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.top_categories} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                      <YAxis type="category" dataKey="name" stroke="#9CA3AF" fontSize={11} width={80} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="deals" name="Negociacoes" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Tag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Sem dados de categorias</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Deals Timeline */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Evolucao de Negociacoes</h2>
              <p className="text-sm text-gray-500">Total vs concluidas</p>
            </div>
            <div className="p-6">
              <div className="h-[250px]">
                {charts.deals_timeline?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={charts.deals_timeline}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="total"
                        name="Total"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="concluidos"
                        name="Concluidas"
                        stroke="#10B981"
                        strokeWidth={2}
                        dot={{ fill: '#10B981', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Sem negociacoes no periodo</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Third Row - Stats and Activities */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Detailed Stats */}
          <div className="lg:col-span-2 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Users Stats */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Usuarios</p>
                  <p className="text-xl font-bold text-gray-900">{formatNumber(summary.users?.total)}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Empresas</span>
                  <span className="font-medium text-gray-900">{formatNumber(summary.users?.empresas)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Clientes</span>
                  <span className="font-medium text-gray-900">{formatNumber(summary.users?.clientes)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Ativos Hoje</span>
                  <span className="font-medium text-emerald-600">{formatNumber(summary.users?.active_today)}</span>
                </div>
              </div>
            </div>

            {/* Services Stats */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Servicos</p>
                  <p className="text-xl font-bold text-gray-900">{formatNumber(summary.services?.total)}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Ativos</span>
                  <span className="font-medium text-emerald-600">{formatNumber(summary.services?.active)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Inativos</span>
                  <span className="font-medium text-gray-900">{formatNumber((summary.services?.total || 0) - (summary.services?.active || 0))}</span>
                </div>
              </div>
            </div>

            {/* Subscriptions Stats */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Assinaturas</p>
                  <p className="text-xl font-bold text-gray-900">{formatNumber(summary.subscriptions?.active)}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Ativas</span>
                  <span className="font-medium text-emerald-600">{formatNumber(summary.subscriptions?.active)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Expirando em 7d</span>
                  <span className="font-medium text-amber-600">{formatNumber(summary.subscriptions?.expiring_soon)}</span>
                </div>
              </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Receita Total</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(summary.revenue?.total)}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Comissoes</span>
                  <span className="font-medium text-gray-900">{formatCurrency(summary.revenue?.commissions)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Assinaturas</span>
                  <span className="font-medium text-gray-900">{formatCurrency(summary.revenue?.subscriptions)}</span>
                </div>
              </div>
            </div>

            {/* Companies Stats */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Empresas</p>
                  <p className="text-xl font-bold text-gray-900">{formatNumber((summary.companies?.verified || 0) + (summary.companies?.unverified || 0))}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Verificadas</span>
                  <span className="font-medium text-emerald-600">{formatNumber(summary.companies?.verified)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pendentes</span>
                  <span className="font-medium text-amber-600">{formatNumber(summary.companies?.unverified)}</span>
                </div>
              </div>
            </div>

            {/* Deals Stats */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center">
                  <Handshake className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Negociacoes</p>
                  <p className="text-xl font-bold text-gray-900">{formatNumber(summary.deals?.total)}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Concluidas</span>
                  <span className="font-medium text-emerald-600">{formatNumber(summary.deals?.completed)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Taxa Conversao</span>
                  <span className="font-medium text-gray-900">{summary.deals?.conversion_rate}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Atividade Recente</h2>
              <p className="text-sm text-gray-500">Ultimas acoes na plataforma</p>
            </div>
            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, idx) => (
                  <div key={idx} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        activity.type === 'user' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'deal' ? 'bg-purple-100 text-purple-600' :
                        'bg-emerald-100 text-emerald-600'
                      }`}>
                        {activity.type === 'user' && <User className="w-4 h-4" />}
                        {activity.type === 'deal' && <Handshake className="w-4 h-4" />}
                        {activity.type === 'transaction' && <DollarSign className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-500 truncate">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma atividade recente</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Health Indicators & Quick Actions */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Health Indicators */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Saude da Plataforma</h2>
              <p className="text-sm text-gray-500">Indicadores de performance</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {healthIndicators.map((indicator, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <div className={`w-3 h-3 rounded-full ${
                      indicator.status === 'healthy' ? 'bg-emerald-500' :
                      indicator.status === 'warning' ? 'bg-amber-500' :
                      'bg-red-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{indicator.value}</p>
                      <p className="text-xs text-gray-500">{indicator.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Acoes Rapidas</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { to: '/admin/users', icon: Users, label: 'Usuarios', color: 'from-blue-500 to-cyan-500' },
                { to: '/admin/plans', icon: CreditCard, label: 'Planos', color: 'from-purple-500 to-pink-500' },
                { to: '/admin/categories', icon: Tag, label: 'Categorias', color: 'from-amber-500 to-orange-500' },
                { to: '/admin/finance', icon: BarChart3, label: 'Financeiro', color: 'from-emerald-500 to-teal-500' },
                { to: '/admin/settings', icon: Settings, label: 'Config', color: 'from-violet-500 to-purple-500' },
              ].map((action, idx) => (
                <Link
                  key={idx}
                  to={action.to}
                  className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/20 transition-all group"
                >
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
