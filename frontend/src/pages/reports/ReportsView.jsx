import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMetrics, fetchChartData } from '@/store/slices/reviewsSlice'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  BarChart3,
  TrendingUp,
  Star,
  ArrowUp,
  ArrowDown,
  Briefcase,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Loader2,
} from 'lucide-react'

const COLORS = ['#334155', '#10b981', '#f59e0b', '#ef4444', '#6366f1']

export default function ReportsView() {
  const dispatch = useDispatch()
  const { metrics, chartData, loadingMetrics, loadingCharts } = useSelector((state) => state.reviews)
  const [period, setPeriod] = useState(30)

  useEffect(() => {
    dispatch(fetchMetrics({ period }))
    dispatch(fetchChartData({ period }))
  }, [dispatch, period])

  const handleRefresh = () => {
    dispatch(fetchMetrics({ period }))
    dispatch(fetchChartData({ period }))
  }

  const isLoading = loadingMetrics || loadingCharts

  // Format data for charts
  const dealsTimelineData = chartData?.deals_timeline || []
  const reviewsTimelineData = (chartData?.reviews_timeline || []).map(item => ({
    ...item,
    average: item.avg_rating || 0, // Map avg_rating to average for chart
  }))

  // Transform top services data for bar chart
  const topServicesData = (chartData?.top_services || []).map(item => ({
    name: item.title || 'Sem titulo',
    requests: item.count || 0,
  }))

  // Deal status distribution for pie chart from by_status object
  const byStatus = metrics?.deals?.by_status || {}
  const dealStatusData = [
    { name: 'Concluidos', value: byStatus.concluido || 0, color: '#10b981' },
    { name: 'Negociando', value: byStatus.negociando || 0, color: '#f59e0b' },
    { name: 'Aceitos', value: byStatus.aceito || 0, color: '#3b82f6' },
    { name: 'Abertos', value: byStatus.aberto || 0, color: '#6366f1' },
    { name: 'Rejeitados', value: byStatus.rejeitado || 0, color: '#ef4444' },
  ].filter(item => item.value > 0)

  // Calculate conversion rate
  const conversionRate = metrics?.conversion?.rate || 0

  const stats = [
    {
      label: 'Total de Negociacoes',
      value: metrics?.deals?.total || 0,
      icon: MessageSquare,
      color: 'bg-slate-100 text-slate-700',
      iconBg: 'bg-slate-800',
    },
    {
      label: 'Taxa de Conversao',
      value: `${conversionRate}%`,
      icon: TrendingUp,
      color: 'bg-emerald-100 text-emerald-700',
      iconBg: 'bg-emerald-600',
      change: conversionRate > 50 ? 'up' : 'down',
    },
    {
      label: 'Media de Avaliacoes',
      value: (metrics?.reviews?.average || 0).toFixed(1),
      icon: Star,
      color: 'bg-amber-100 text-amber-700',
      iconBg: 'bg-amber-500',
      suffix: '/5',
    },
    {
      label: 'Servicos Concluidos',
      value: metrics?.revenue?.total || 0,
      icon: CheckCircle,
      color: 'bg-emerald-100 text-emerald-700',
      iconBg: 'bg-emerald-600',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h1 className="text-3xl font-bold">Relatorios</h1>
              </div>
              <p className="text-slate-300">
                Acompanhe o desempenho dos seus servicos e negociacoes
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Period Selector */}
              <div className="flex bg-white/10 rounded-lg p-1">
                {[
                  { value: 7, label: '7D' },
                  { value: 30, label: '30D' },
                  { value: 90, label: '90D' },
                  { value: 365, label: '1A' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setPeriod(option.value)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                      period === option.value
                        ? 'bg-white text-slate-800'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 -mt-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {stat.change && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                      stat.change === 'up' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {stat.change === 'up' ? (
                        <ArrowUp className="w-4 h-4" />
                      ) : (
                        <ArrowDown className="w-4 h-4" />
                      )}
                    </div>
                  )}
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}
                  {stat.suffix && <span className="text-lg text-gray-400">{stat.suffix}</span>}
                </p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            )
          })}
        </div>

        {isLoading && !metrics ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-slate-600 animate-spin" />
          </div>
        ) : (
          <>
            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Deals Timeline */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-slate-600" />
                  Negociacoes por Dia
                </h3>
                <div className="h-[300px]">
                  {dealsTimelineData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dealsTimelineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12, fill: '#94a3b8' }}
                          tickFormatter={(value) => {
                            const date = new Date(value)
                            return `${date.getDate()}/${date.getMonth() + 1}`
                          }}
                        />
                        <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                          }}
                          labelFormatter={(value) => {
                            const date = new Date(value)
                            return date.toLocaleDateString('pt-BR')
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="count"
                          name="Negociacoes"
                          stroke="#334155"
                          strokeWidth={2}
                          dot={{ fill: '#334155', strokeWidth: 2 }}
                          activeDot={{ r: 6, fill: '#10b981' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      Sem dados para o periodo
                    </div>
                  )}
                </div>
              </div>

              {/* Deal Status Distribution */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-slate-600" />
                  Status das Negociacoes
                </h3>
                <div className="h-[300px]">
                  {dealStatusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dealStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {dealStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      Sem dados para o periodo
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Top Services */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-slate-600" />
                  Servicos Mais Solicitados
                </h3>
                <div className="h-[300px]">
                  {topServicesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topServicesData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fontSize: 12, fill: '#64748b' }}
                          width={120}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                          }}
                        />
                        <Bar
                          dataKey="requests"
                          name="Solicitacoes"
                          fill="#334155"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      Sem dados para o periodo
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews Timeline */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  Avaliacoes ao Longo do Tempo
                </h3>
                <div className="h-[300px]">
                  {reviewsTimelineData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={reviewsTimelineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12, fill: '#94a3b8' }}
                          tickFormatter={(value) => {
                            const date = new Date(value)
                            return `${date.getDate()}/${date.getMonth() + 1}`
                          }}
                        />
                        <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} domain={[0, 5]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                          }}
                          labelFormatter={(value) => {
                            const date = new Date(value)
                            return date.toLocaleDateString('pt-BR')
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="average"
                          name="Media"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          dot={{ fill: '#f59e0b', strokeWidth: 2 }}
                          activeDot={{ r: 6, fill: '#d97706' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      Sem dados para o periodo
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Deals Summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo de Negociacoes</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm text-gray-700">Concluidas</span>
                    </div>
                    <span className="font-semibold text-emerald-700">{byStatus.concluido || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span className="text-sm text-gray-700">Em andamento</span>
                    </div>
                    <span className="font-semibold text-amber-700">
                      {(byStatus.aberto || 0) + (byStatus.negociando || 0) + (byStatus.aceito || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-gray-700">Rejeitadas</span>
                    </div>
                    <span className="font-semibold text-red-700">{byStatus.rejeitado || 0}</span>
                  </div>
                </div>
              </div>

              {/* Reviews Summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo de Avaliacoes</h3>
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full">
                    <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                    <span className="text-2xl font-bold text-gray-900">
                      {metrics?.reviews?.average?.toFixed(1) || '0.0'}
                    </span>
                    <span className="text-gray-500">/5</span>
                  </div>
                </div>
                <p className="text-center text-sm text-gray-500 mb-4">
                  Baseado em {metrics?.reviews?.total || 0} avaliacoes
                </p>
                {/* Rating Distribution */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = metrics?.reviews?.distribution?.[rating] || 0
                    const total = metrics?.reviews?.total || 1
                    const percentage = (count / total) * 100
                    return (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-4">{rating}</span>
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-8">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Activity Summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo de Atividade</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Servicos Concluidos (Total)</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metrics?.revenue?.total || 0}
                    </p>
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-sm text-gray-500 mb-1">Servicos Concluidos (Periodo)</p>
                    <p className="text-xl font-semibold text-emerald-600">
                      {metrics?.revenue?.period || 0}
                    </p>
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-sm text-gray-500 mb-1">Servicos Ativos</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {metrics?.services?.active || 0} de {metrics?.services?.total || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
