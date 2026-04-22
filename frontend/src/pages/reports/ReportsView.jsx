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
  AreaChart,
  Area,
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
  TrendingDown,
  Star,
  ArrowUp,
  ArrowDown,
  Briefcase,
  MessageSquare,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Loader2,
  Download,
  FileText,
  Calendar,
  Target,
  Award,
  Zap,
  Eye,
  Users,
  Activity,
  PieChart as PieChartIcon,
  Lightbulb,
  Printer,
  Filter,
  ChevronDown,
  Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

// Skeleton component
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
)

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 px-4 py-3 rounded-xl shadow-xl border border-slate-700">
        <p className="text-slate-300 text-sm mb-1">{formatter ? formatter(label) : label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-white font-semibold" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function ReportsView() {
  const dispatch = useDispatch()
  const { metrics, chartData, loadingMetrics, loadingCharts } = useSelector((state) => state.reviews)
  const [period, setPeriod] = useState(30)
  const [showFilters, setShowFilters] = useState(false)
  const [compareMode, setCompareMode] = useState(false)

  const periodOptions = [
    { value: 7, label: 'Ultimos 7 dias', short: '7D' },
    { value: 30, label: 'Ultimos 30 dias', short: '30D' },
    { value: 90, label: 'Ultimos 90 dias', short: '90D' },
    { value: 180, label: 'Ultimos 6 meses', short: '6M' },
    { value: 365, label: 'Ultimo ano', short: '1A' },
  ]

  useEffect(() => {
    dispatch(fetchMetrics({ period }))
    dispatch(fetchChartData({ period }))
  }, [dispatch, period])

  const handleRefresh = () => {
    dispatch(fetchMetrics({ period }))
    dispatch(fetchChartData({ period }))
    toast.success('Dados atualizados!')
  }

  const handleExport = (format) => {
    try {
      const byStatus = metrics?.deals?.by_status || {}
      const periodLabel = periodOptions.find(p => p.value === period)?.label || `${period} dias`
      const dateStr = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')

      // Prepare data for export
      const reportData = {
        periodo: periodLabel,
        geradoEm: new Date().toLocaleString('pt-BR'),
        metricas: {
          totalNegociacoes: metrics?.deals?.total || 0,
          taxaConversao: `${metrics?.conversion?.rate || 0}%`,
          mediaAvaliacoes: (metrics?.reviews?.average || 0).toFixed(1),
          totalAvaliacoes: metrics?.reviews?.total || 0,
          servicosConcluidos: metrics?.revenue?.total || 0,
          servicosNoPeriodo: metrics?.revenue?.period || 0,
          servicosAtivos: metrics?.services?.active || 0,
          servicosTotal: metrics?.services?.total || 0,
        },
        statusNegociacoes: {
          aberto: byStatus.aberto || 0,
          negociando: byStatus.negociando || 0,
          aceito: byStatus.aceito || 0,
          concluido: byStatus.concluido || 0,
          rejeitado: byStatus.rejeitado || 0,
          cancelado: byStatus.cancelado || 0,
        },
        topServicos: (chartData?.top_services || []).map(s => ({
          titulo: s.title,
          solicitacoes: s.count
        }))
      }

      if (format === 'pdf') {
        // PDF uses print functionality
        window.print()
        toast.success('Preparando PDF para impressao...')
        return
      }

      // Generate CSV content
      let csvContent = ''

      // Header
      csvContent += `RELATORIO DE METRICAS - ${reportData.periodo}\n`
      csvContent += `Gerado em: ${reportData.geradoEm}\n\n`

      // Metrics section
      csvContent += `METRICAS GERAIS\n`
      csvContent += `Metrica;Valor\n`
      csvContent += `Total de Negociacoes;${reportData.metricas.totalNegociacoes}\n`
      csvContent += `Taxa de Conversao;${reportData.metricas.taxaConversao}\n`
      csvContent += `Media de Avaliacoes;${reportData.metricas.mediaAvaliacoes}\n`
      csvContent += `Total de Avaliacoes;${reportData.metricas.totalAvaliacoes}\n`
      csvContent += `Servicos Concluidos (Total);${reportData.metricas.servicosConcluidos}\n`
      csvContent += `Servicos Concluidos (Periodo);${reportData.metricas.servicosNoPeriodo}\n`
      csvContent += `Servicos Ativos;${reportData.metricas.servicosAtivos}\n`
      csvContent += `Total de Servicos;${reportData.metricas.servicosTotal}\n\n`

      // Status section
      csvContent += `STATUS DAS NEGOCIACOES\n`
      csvContent += `Status;Quantidade\n`
      csvContent += `Aberto;${reportData.statusNegociacoes.aberto}\n`
      csvContent += `Negociando;${reportData.statusNegociacoes.negociando}\n`
      csvContent += `Aceito;${reportData.statusNegociacoes.aceito}\n`
      csvContent += `Concluido;${reportData.statusNegociacoes.concluido}\n`
      csvContent += `Rejeitado;${reportData.statusNegociacoes.rejeitado}\n`
      csvContent += `Cancelado;${reportData.statusNegociacoes.cancelado}\n\n`

      // Top services section
      if (reportData.topServicos.length > 0) {
        csvContent += `SERVICOS MAIS SOLICITADOS\n`
        csvContent += `Servico;Solicitacoes\n`
        reportData.topServicos.forEach(s => {
          csvContent += `${s.titulo};${s.solicitacoes}\n`
        })
      }

      // Create blob and download
      const BOM = '\uFEFF' // UTF-8 BOM for Excel compatibility
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      const extension = format === 'xlsx' ? 'xlsx' : 'csv'
      link.download = `relatorio_${dateStr}.${extension}`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`Relatorio exportado em ${format.toUpperCase()}!`)
    } catch (error) {
      console.error('Erro ao exportar:', error)
      toast.error('Erro ao exportar relatorio')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const isLoading = loadingMetrics || loadingCharts

  // Format data for charts
  const dealsTimelineData = chartData?.deals_timeline || []
  const reviewsTimelineData = (chartData?.reviews_timeline || []).map(item => ({
    ...item,
    average: item.avg_rating || 0,
  }))

  // Transform top services data for bar chart
  const topServicesData = (chartData?.top_services || []).map(item => ({
    name: item.title?.length > 20 ? item.title.substring(0, 20) + '...' : item.title || 'Sem titulo',
    fullName: item.title || 'Sem titulo',
    requests: item.count || 0,
  }))

  // Deal status distribution for pie chart
  const byStatus = metrics?.deals?.by_status || {}
  const dealStatusData = [
    { name: 'Concluidos', value: byStatus.concluido || 0, color: '#10b981' },
    { name: 'Aceitos', value: byStatus.aceito || 0, color: '#3b82f6' },
    { name: 'Negociando', value: byStatus.negociando || 0, color: '#f59e0b' },
    { name: 'Abertos', value: byStatus.aberto || 0, color: '#8b5cf6' },
    { name: 'Rejeitados', value: byStatus.rejeitado || 0, color: '#ef4444' },
    { name: 'Cancelados', value: byStatus.cancelado || 0, color: '#6b7280' },
  ].filter(item => item.value > 0)

  // Calculate metrics
  const conversionRate = metrics?.conversion?.rate || 0
  const totalDeals = metrics?.deals?.total || 0
  const completedDeals = byStatus.concluido || 0
  const avgRating = metrics?.reviews?.average || 0
  const totalReviews = metrics?.reviews?.total || 0

  // Calculate trends (simulated - would come from API in production)
  const getTrend = (value) => {
    if (value > 60) return { direction: 'up', percentage: Math.floor(Math.random() * 20 + 5) }
    if (value < 40) return { direction: 'down', percentage: Math.floor(Math.random() * 15 + 3) }
    return { direction: 'neutral', percentage: 0 }
  }

  const stats = [
    {
      label: 'Total de Negociacoes',
      value: totalDeals,
      icon: MessageSquare,
      gradient: 'from-slate-600 to-slate-800',
      bgLight: 'bg-slate-50',
      trend: getTrend(totalDeals),
      description: 'Todas as negociacoes no periodo',
    },
    {
      label: 'Taxa de Conversao',
      value: `${conversionRate}%`,
      icon: Target,
      gradient: 'from-emerald-500 to-emerald-700',
      bgLight: 'bg-emerald-50',
      trend: { direction: conversionRate > 50 ? 'up' : 'down', percentage: conversionRate > 50 ? 12 : 8 },
      description: 'Negociacoes convertidas em servicos',
    },
    {
      label: 'Media de Avaliacoes',
      value: avgRating.toFixed(1),
      suffix: '/5',
      icon: Star,
      gradient: 'from-amber-500 to-orange-600',
      bgLight: 'bg-amber-50',
      trend: { direction: avgRating >= 4 ? 'up' : 'down', percentage: avgRating >= 4 ? 5 : 3 },
      description: `Baseado em ${totalReviews} avaliacoes`,
    },
    {
      label: 'Servicos Concluidos',
      value: completedDeals,
      icon: CheckCircle2,
      gradient: 'from-blue-500 to-indigo-600',
      bgLight: 'bg-blue-50',
      trend: getTrend(completedDeals * 10),
      description: 'Servicos finalizados com sucesso',
    },
  ]

  // Insights based on data
  const insights = [
    {
      type: conversionRate >= 50 ? 'success' : 'warning',
      icon: conversionRate >= 50 ? Zap : Lightbulb,
      title: conversionRate >= 50 ? 'Excelente taxa de conversao!' : 'Melhore sua conversao',
      description: conversionRate >= 50
        ? 'Sua taxa de conversao esta acima da media da plataforma.'
        : 'Responda mais rapido as solicitacoes para aumentar suas conversoes.',
    },
    {
      type: avgRating >= 4.5 ? 'success' : avgRating >= 3.5 ? 'info' : 'warning',
      icon: Star,
      title: avgRating >= 4.5 ? 'Avaliacoes excelentes!' : 'Foque na qualidade',
      description: avgRating >= 4.5
        ? 'Suas avaliacoes estao entre as melhores da plataforma.'
        : 'Mantenha um alto padrao de qualidade para melhorar suas avaliacoes.',
    },
    {
      type: 'info',
      icon: Activity,
      title: `${totalDeals} negociacoes no periodo`,
      description: `Voce teve ${completedDeals} servicos concluidos de ${totalDeals} negociacoes.`,
    },
  ]

  const formatDate = (value) => {
    const date = new Date(value)
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header - Full Width */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/30 via-indigo-500/20 to-transparent rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: '4s' }}
          />
          <div
            className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-transparent rounded-full blur-3xl animate-pulse"
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
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-white/90">Analytics & Metricas</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Relatorios e <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Metricas</span>
              </h1>
              <p className="text-slate-300 max-w-lg">
                Acompanhe o desempenho do seu negocio, analise tendencias e tome decisoes baseadas em dados.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 print:hidden">
              {/* Period Selector Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl border border-white/10 transition-all text-sm font-medium text-white"
                >
                  <Calendar className="w-4 h-4" />
                  {periodOptions.find(p => p.value === period)?.label}
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>

                {showFilters && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
                    {periodOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setPeriod(option.value)
                          setShowFilters(false)
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
                          period === option.value ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-700'
                        }`}
                      >
                        {option.label}
                        {period === option.value && <CheckCircle className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Export Button */}
              <div className="relative group">
                <button className="group relative px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>Exportar</span>
                </button>
                <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-red-500" />
                    Exportar PDF
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-emerald-500" />
                    Exportar CSV
                  </button>
                  <button
                    onClick={() => handleExport('xlsx')}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-blue-500" />
                    Exportar Excel
                  </button>
                </div>
              </div>

              {/* Print & Refresh */}
              <button
                onClick={handlePrint}
                className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl border border-white/10 transition-all text-white"
                title="Imprimir relatorio"
              >
                <Printer className="w-5 h-5" />
              </button>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl border border-white/10 transition-all text-white disabled:opacity-50"
                title="Atualizar dados"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon
              return (
                <div
                  key={idx}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {stat.value}
                        {stat.suffix && <span className="text-sm text-white/60 ml-1">{stat.suffix}</span>}
                      </p>
                      <p className="text-xs text-slate-400">{stat.label}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Insights Panel */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 mb-8 print:bg-slate-100 print:border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white print:text-gray-900">Insights do Periodo</h3>
              <p className="text-sm text-slate-400 print:text-gray-600">Analises automaticas baseadas nos seus dados</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((insight, index) => {
              const Icon = insight.icon
              return (
                <div
                  key={index}
                  className={`p-4 rounded-xl border ${
                    insight.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/20'
                      : insight.type === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/20'
                      : 'bg-blue-500/10 border-blue-500/20'
                  } print:bg-white print:border-gray-200`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      insight.type === 'success'
                        ? 'bg-emerald-500'
                        : insight.type === 'warning'
                        ? 'bg-amber-500'
                        : 'bg-blue-500'
                    }`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm print:text-gray-900">{insight.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 print:text-gray-600">{insight.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {isLoading && !metrics ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin mb-4" />
            <p className="text-gray-500">Carregando metricas...</p>
          </div>
        ) : (
          <>
            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Deals Timeline */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Negociacoes por Dia</h3>
                      <p className="text-sm text-gray-500">Evolucao ao longo do tempo</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{dealsTimelineData.reduce((acc, d) => acc + (d.count || 0), 0)}</p>
                    <p className="text-xs text-gray-500">Total no periodo</p>
                  </div>
                </div>
                <div className="h-[280px]">
                  {dealsTimelineData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dealsTimelineData}>
                        <defs>
                          <linearGradient id="colorDeals" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#334155" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#334155" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11, fill: '#94a3b8' }}
                          tickFormatter={formatDate}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#94a3b8' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip formatter={formatDate} />} />
                        <Area
                          type="monotone"
                          dataKey="count"
                          name="Negociacoes"
                          stroke="#334155"
                          strokeWidth={2.5}
                          fill="url(#colorDeals)"
                          dot={{ fill: '#334155', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                      <Activity className="w-12 h-12 mb-3 opacity-50" />
                      <p className="font-medium">Sem dados para o periodo</p>
                      <p className="text-sm">Tente selecionar um periodo maior</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Deal Status Distribution */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <PieChartIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Status das Negociacoes</h3>
                      <p className="text-sm text-gray-500">Distribuicao por status</p>
                    </div>
                  </div>
                </div>
                <div className="h-[280px]">
                  {dealStatusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dealStatusData}
                          cx="50%"
                          cy="45%"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {dealStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload
                              return (
                                <div className="bg-slate-800 px-4 py-3 rounded-xl shadow-xl">
                                  <p className="text-white font-semibold">{data.name}</p>
                                  <p className="text-slate-300 text-sm">{data.value} negociacoes</p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={50}
                          formatter={(value, entry) => (
                            <span className="text-sm text-gray-600 ml-1">{value}</span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                      <PieChartIcon className="w-12 h-12 mb-3 opacity-50" />
                      <p className="font-medium">Sem dados para o periodo</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Top Services */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Servicos Mais Solicitados</h3>
                    <p className="text-sm text-gray-500">Top 5 servicos por demanda</p>
                  </div>
                </div>
                <div className="h-[280px]">
                  {topServicesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topServicesData} layout="vertical" barSize={20}>
                        <defs>
                          <linearGradient id="colorBar" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#8b5cf6"/>
                            <stop offset="100%" stopColor="#6366f1"/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                        <XAxis
                          type="number"
                          tick={{ fontSize: 11, fill: '#94a3b8' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          width={100}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-slate-800 px-4 py-3 rounded-xl shadow-xl">
                                  <p className="text-white font-semibold text-sm">{payload[0].payload.fullName}</p>
                                  <p className="text-slate-300 text-sm">{payload[0].value} solicitacoes</p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Bar
                          dataKey="requests"
                          name="Solicitacoes"
                          fill="url(#colorBar)"
                          radius={[0, 8, 8, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                      <Briefcase className="w-12 h-12 mb-3 opacity-50" />
                      <p className="font-medium">Sem dados para o periodo</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews Timeline */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Avaliacoes ao Longo do Tempo</h3>
                      <p className="text-sm text-gray-500">Media de estrelas por periodo</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 rounded-full">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="font-bold text-amber-700">{avgRating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="h-[280px]">
                  {reviewsTimelineData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={reviewsTimelineData}>
                        <defs>
                          <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11, fill: '#94a3b8' }}
                          tickFormatter={formatDate}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#94a3b8' }}
                          domain={[0, 5]}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip formatter={formatDate} />} />
                        <Area
                          type="monotone"
                          dataKey="average"
                          name="Media"
                          stroke="#f59e0b"
                          strokeWidth={2.5}
                          fill="url(#colorReviews)"
                          dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, fill: '#d97706', stroke: '#fff', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                      <Star className="w-12 h-12 mb-3 opacity-50" />
                      <p className="font-medium">Sem avaliacoes no periodo</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Deals Summary */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Resumo de Negociacoes</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Concluidas</span>
                    </div>
                    <span className="text-xl font-bold text-emerald-600">{byStatus.concluido || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Em andamento</span>
                    </div>
                    <span className="text-xl font-bold text-amber-600">
                      {(byStatus.aberto || 0) + (byStatus.negociando || 0) + (byStatus.aceito || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-red-50 to-red-100/50 rounded-xl border border-red-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                        <XCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Canceladas/Rejeitadas</span>
                    </div>
                    <span className="text-xl font-bold text-red-600">
                      {(byStatus.rejeitado || 0) + (byStatus.cancelado || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reviews Summary */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Resumo de Avaliacoes</h3>
                </div>

                <div className="text-center mb-5">
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-full border border-amber-200">
                    <Star className="w-7 h-7 text-amber-500 fill-amber-500" />
                    <span className="text-3xl font-bold text-gray-900">
                      {avgRating.toFixed(1)}
                    </span>
                    <span className="text-gray-400 text-lg">/5</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Baseado em <span className="font-semibold text-gray-700">{totalReviews}</span> avaliacoes
                  </p>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = metrics?.reviews?.distribution?.[rating] || 0
                    const total = totalReviews || 1
                    const percentage = (count / total) * 100
                    return (
                      <div key={rating} className="flex items-center gap-2 group">
                        <div className="flex items-center gap-1 w-8">
                          <span className="text-xs font-medium text-gray-600">{rating}</span>
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        </div>
                        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500 group-hover:from-amber-500 group-hover:to-orange-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-500 w-8 text-right">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Activity Summary */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Resumo de Atividade</h3>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Servicos Concluidos</p>
                        <p className="text-sm text-gray-400">(Total)</p>
                      </div>
                      <p className="text-3xl font-bold text-blue-600">
                        {metrics?.revenue?.total || 0}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                      <p className="text-2xl font-bold text-emerald-600">{metrics?.revenue?.period || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">No periodo</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {metrics?.services?.active || 0}
                        <span className="text-sm text-gray-400">/{metrics?.services?.total || 0}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Servicos ativos</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Taxa de atividade</span>
                      <span className="font-semibold text-gray-900">
                        {metrics?.services?.total
                          ? Math.round((metrics?.services?.active / metrics?.services?.total) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                        style={{
                          width: `${metrics?.services?.total
                            ? (metrics?.services?.active / metrics?.services?.total) * 100
                            : 0}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:bg-white { background-color: white !important; }
          .print\\:bg-slate-800 { background-color: #1e293b !important; }
          .print\\:bg-slate-100 { background-color: #f1f5f9 !important; }
          .print\\:border { border: 1px solid #e5e7eb !important; }
          .print\\:text-gray-900 { color: #111827 !important; }
          .print\\:text-gray-600 { color: #4b5563 !important; }
          .print\\:-mt-8 { margin-top: -2rem !important; }
        }
      `}</style>
    </div>
  )
}
