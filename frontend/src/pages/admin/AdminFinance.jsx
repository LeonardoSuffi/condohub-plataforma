import { useEffect, useState } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Download,
  RefreshCw,
  Filter,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Receipt,
  PiggyBank,
  BarChart3,
} from 'lucide-react'

export default function AdminFinance() {
  const [transactions, setTransactions] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [filter, setFilter] = useState({
    type: '',
    dateFrom: '',
    dateTo: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [transRes, statsRes] = await Promise.all([
        api.get('/admin/transactions', { params: filter }),
        api.get('/admin/finance')
      ])
      setTransactions(transRes.data.data || [])
      setStats(statsRes.data.data)
    } catch (_error) {
      toast.error('Erro ao carregar dados financeiros')
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = () => {
    loadData()
  }

  const clearFilters = () => {
    setFilter({ type: '', dateFrom: '', dateTo: '' })
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      const response = await api.get('/finance/export', {
        params: filter,
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `transacoes_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      toast.success('Exportacao concluida!')
    } catch (_error) {
      // Generate local CSV if API fails
      generateLocalCSV()
    } finally {
      setExporting(false)
    }
  }

  const generateLocalCSV = () => {
    const headers = ['ID', 'Tipo', 'Descricao', 'Valor', 'Status', 'Data']
    const rows = transactions.map(t => [
      t.id,
      t.type,
      t.description || '',
      t.amount,
      t.status,
      new Date(t.created_at).toLocaleDateString('pt-BR')
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `transacoes_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()

    toast.success('Exportacao concluida!')
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTypeLabel = (type) => {
    const types = {
      'comissao': 'Comissao',
      'assinatura': 'Assinatura',
      'servico': 'Servico',
      'estorno': 'Estorno',
    }
    return types[type] || type
  }

  const getTypeColor = (type) => {
    const colors = {
      'comissao': 'bg-blue-100 text-blue-700 border-blue-200',
      'assinatura': 'bg-purple-100 text-purple-700 border-purple-200',
      'servico': 'bg-green-100 text-green-700 border-green-200',
      'estorno': 'bg-red-100 text-red-700 border-red-200',
    }
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const getStatusColor = (status) => {
    const colors = {
      'concluida': 'bg-green-100 text-green-700',
      'pendente': 'bg-yellow-100 text-yellow-700',
      'processando': 'bg-blue-100 text-blue-700',
      'falhou': 'bg-red-100 text-red-700',
      'estornada': 'bg-orange-100 text-orange-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusLabel = (status) => {
    const labels = {
      'concluida': 'Concluida',
      'pendente': 'Pendente',
      'processando': 'Processando',
      'falhou': 'Falhou',
      'estornada': 'Estornada',
    }
    return labels[status] || status
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header - Full Width */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-emerald-500/30 via-teal-500/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-green-500/20 via-emerald-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-white/90">Gestao Financeira</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Gestao <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Financeira</span>
              </h1>
              <p className="text-slate-300 max-w-lg">
                Acompanhe receitas, comissoes e assinaturas da plataforma. Visualize transacoes e exporte relatorios.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => loadData()}
                className="flex items-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all"
                title="Atualizar dados"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-2xl hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                {exporting ? 'Exportando...' : 'Exportar CSV'}
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            {[
              { value: formatCurrency(stats?.revenue?.total), label: 'Receita Total', icon: Wallet, color: 'from-emerald-500 to-teal-500' },
              { value: formatCurrency(stats?.revenue?.from_commissions), label: 'Comissoes', icon: Receipt, color: 'from-blue-500 to-cyan-500' },
              { value: formatCurrency(stats?.revenue?.from_subscriptions), label: 'Assinaturas', icon: CreditCard, color: 'from-purple-500 to-pink-500' },
              { value: stats?.deals?.concluido || 0, label: 'Concluidos', icon: BarChart3, color: 'from-amber-500 to-orange-500' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-colors">
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
              {/* Revenue Card */}
              {stats && (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      Receita Total
                    </h3>
                  </div>
                  <div className="p-4">
                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.revenue?.total)}</p>
                    <p className="text-sm text-gray-500 mt-1">Periodo atual</p>
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="text-gray-500">Comissoes</span>
                        </div>
                        <span className="font-semibold text-blue-600">{formatCurrency(stats.revenue?.from_commissions)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-purple-500" />
                          <span className="text-gray-500">Assinaturas</span>
                        </div>
                        <span className="font-semibold text-purple-600">{formatCurrency(stats.revenue?.from_subscriptions)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          <span className="text-gray-500">Concluidos</span>
                        </div>
                        <span className="font-semibold text-amber-600">{stats.deals?.concluido || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Filters */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-4">
                <h4 className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-3">Filtrar por Tipo</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Todos', value: '' },
                    { label: 'Comissao', value: 'comissao' },
                    { label: 'Assinatura', value: 'assinatura' },
                    { label: 'Servico', value: 'servico' },
                    { label: 'Estorno', value: 'estorno' },
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => { setFilter({ ...filter, type: item.value }); handleFilter() }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                        filter.type === item.value
                          ? 'bg-emerald-600 text-white font-medium'
                          : 'text-gray-700 hover:bg-emerald-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Filter */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  Periodo
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500">De</label>
                    <input
                      type="date"
                      value={filter.dateFrom}
                      onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })}
                      className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Ate</label>
                    <input
                      type="date"
                      value={filter.dateTo}
                      onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })}
                      className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleFilter}
                      className="flex-1 px-3 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Aplicar
                    </button>
                    <button
                      onClick={clearFilters}
                      className="px-3 py-2 text-gray-600 bg-gray-100 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Limpar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Area */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Transactions Table */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Transacoes Recentes</h2>
            <span className="text-sm text-gray-500">{transactions.length} registros</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-10 h-10 border-3 border-gray-200 border-t-green-500 rounded-full animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Receipt className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">Nenhuma transacao encontrada</p>
              <p className="text-gray-400 text-sm mt-1">Tente ajustar os filtros de busca</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Descricao</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-500">#{transaction.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getTypeColor(transaction.type)}`}>
                          {getTypeLabel(transaction.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 truncate max-w-xs">
                          {transaction.description || '-'}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={`text-sm font-semibold ${
                          transaction.type === 'estorno' ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {transaction.type === 'estorno' ? '-' : ''}{formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                          {getStatusLabel(transaction.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm text-gray-500">{formatDate(transaction.created_at)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

            {/* Summary Cards */}
            {stats && (
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Receita Total</h3>
                    <Wallet className="w-6 h-6 opacity-80" />
                  </div>
                  <p className="text-3xl font-bold mb-2">{formatCurrency(stats.revenue?.total)}</p>
                  <p className="text-green-100 text-sm">Soma de todas as transacoes</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Comissoes</h3>
                    <Receipt className="w-6 h-6 opacity-80" />
                  </div>
                  <p className="text-3xl font-bold mb-2">{formatCurrency(stats.revenue?.from_commissions)}</p>
                  <p className="text-blue-100 text-sm">De negociacoes fechadas</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Assinaturas</h3>
                    <CreditCard className="w-6 h-6 opacity-80" />
                  </div>
                  <p className="text-3xl font-bold mb-2">{formatCurrency(stats.revenue?.from_subscriptions)}</p>
                  <p className="text-purple-100 text-sm">Planos de empresas</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
