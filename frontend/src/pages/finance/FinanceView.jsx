import { useEffect, useState } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import {
  Download,
  TrendingUp,
  CreditCard,
  DollarSign,
  Calendar,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  ChevronRight,
  Wallet,
  PiggyBank,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  Lightbulb
} from 'lucide-react'

export default function FinanceView() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterType, setFilterType] = useState('todos')

  useEffect(() => {
    loadFinanceData()
  }, [])

  const loadFinanceData = async () => {
    try {
      const response = await api.get('/finance/transactions')
      setData(response.data.data)
    } catch (_error) {
      // Dados mock para demonstracao
      setData({
        summary: {
          total: { received: 25000, commissions_paid: 2500, net: 22500 },
          current_month: { received: 5000, commissions_paid: 500, net: 4500 },
          pending: 3500
        },
        transactions: [
          { id: 1, type: 'servico', description: 'Manutencao predial', amount: 1500, commission: 150, net_amount: 1350, status: 'concluida', created_at: new Date().toISOString() },
          { id: 2, type: 'assinatura', description: 'Plano Premium - Mensal', amount: 99, commission: 0, net_amount: 99, status: 'concluida', created_at: new Date(Date.now() - 86400000).toISOString() },
          { id: 3, type: 'servico', description: 'Instalacao eletrica', amount: 2000, commission: 200, net_amount: 1800, status: 'pendente', created_at: new Date(Date.now() - 172800000).toISOString() },
          { id: 4, type: 'servico', description: 'Pintura externa', amount: 3500, commission: 350, net_amount: 3150, status: 'processando', created_at: new Date(Date.now() - 259200000).toISOString() },
          { id: 5, type: 'estorno', description: 'Estorno - Servico cancelado', amount: -500, commission: 0, net_amount: -500, status: 'concluida', created_at: new Date(Date.now() - 345600000).toISOString() },
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await api.get('/finance/export', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `transacoes_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Exportacao concluida!')
    } catch (error) {
      toast.error('Erro ao exportar')
    }
  }

  const getTypeLabel = (type) => {
    const labels = {
      assinatura: 'Assinatura',
      comissao: 'Comissao',
      servico: 'Servico',
      estorno: 'Estorno',
    }
    return labels[type] || type
  }

  const getTypeIcon = (type) => {
    const icons = {
      assinatura: CreditCard,
      comissao: PiggyBank,
      servico: Wallet,
      estorno: RotateCcw,
    }
    return icons[type] || Receipt
  }

  const getStatusIcon = (status) => {
    const icons = {
      pendente: Clock,
      processando: AlertCircle,
      concluida: CheckCircle2,
      falhou: XCircle,
      estornada: RotateCcw,
    }
    return icons[status] || AlertCircle
  }

  const getStatusStyle = (status) => {
    const styles = {
      pendente: 'bg-amber-100 text-amber-700',
      processando: 'bg-blue-100 text-blue-700',
      concluida: 'bg-emerald-100 text-emerald-700',
      falhou: 'bg-red-100 text-red-700',
      estornada: 'bg-orange-100 text-orange-700',
    }
    return styles[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusLabel = (status) => {
    const labels = {
      pendente: 'Pendente',
      processando: 'Processando',
      concluida: 'Concluida',
      falhou: 'Falhou',
      estornada: 'Estornada',
    }
    return labels[status] || status
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0)
  }

  const filteredTransactions = data?.transactions?.filter(t => {
    const matchesSearch = !searchTerm ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getTypeLabel(t.type).toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'todos' || t.status === filterStatus
    const matchesType = filterType === 'todos' || t.type === filterType
    return matchesSearch && matchesStatus && matchesType
  }) || []

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Carregando dados financeiros...</p>
        </div>
      </div>
    )
  }

  const netPercentage = data?.summary?.total?.received > 0
    ? ((data.summary.total.net / data.summary.total.received) * 100).toFixed(1)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Animated Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-emerald-500/30 via-teal-500/20 to-transparent rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: '4s' }}
          />
          <div
            className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-green-500/20 via-emerald-500/10 to-transparent rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: '5s', animationDelay: '1s' }}
          />
        </div>

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div className="px-3 py-1 bg-emerald-500/20 backdrop-blur-sm rounded-full border border-emerald-400/30">
                  <span className="text-emerald-300 text-sm font-medium flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    {netPercentage}% liquido
                  </span>
                </div>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                Financeiro
              </h1>
              <p className="text-slate-400 text-lg">
                Acompanhe suas transacoes e receitas em tempo real
              </p>
            </div>

            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium rounded-xl hover:bg-white/20 transition-all"
            >
              <Download className="w-5 h-5" />
              Exportar CSV
            </button>
          </div>

          {/* Stats Bar */}
          {data?.summary && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Total Recebido</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(data.summary.total?.received)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center">
                    <PiggyBank className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Liquido Total</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(data.summary.total?.net)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Pendente</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(data.summary.pending)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Este Mes</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(data.summary.current_month?.received)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column - Transactions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar transacoes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                  >
                    <option value="todos">Todos Status</option>
                    <option value="pendente">Pendente</option>
                    <option value="processando">Processando</option>
                    <option value="concluida">Concluida</option>
                    <option value="falhou">Falhou</option>
                    <option value="estornada">Estornada</option>
                  </select>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                  >
                    <option value="todos">Todos Tipos</option>
                    <option value="servico">Servico</option>
                    <option value="assinatura">Assinatura</option>
                    <option value="estorno">Estorno</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  Transacoes
                </h2>
                <span className="text-sm text-gray-500">
                  {filteredTransactions.length} {filteredTransactions.length === 1 ? 'resultado' : 'resultados'}
                </span>
              </div>

              {filteredTransactions.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Nenhuma transacao encontrada</p>
                  <p className="text-sm text-gray-400 mt-1">Tente ajustar os filtros</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredTransactions.map((transaction) => {
                    const TypeIcon = getTypeIcon(transaction.type)
                    const StatusIcon = getStatusIcon(transaction.status)
                    const isNegative = transaction.amount < 0

                    return (
                      <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            isNegative ? 'bg-red-100' : 'bg-emerald-100'
                          }`}>
                            <TypeIcon className={`w-6 h-6 ${isNegative ? 'text-red-600' : 'text-emerald-600'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900 truncate">
                                {transaction.description || getTypeLabel(transaction.type)}
                              </p>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${getStatusStyle(transaction.status)}`}>
                                <StatusIcon className="w-3 h-3" />
                                {getStatusLabel(transaction.status)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">
                              {new Date(transaction.created_at).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                              {transaction.commission > 0 && (
                                <span className="text-orange-600 ml-2">
                                  Comissao: {formatCurrency(transaction.commission)}
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${isNegative ? 'text-red-600' : 'text-emerald-600'}`}>
                              {isNegative ? '' : '+'}{formatCurrency(transaction.net_amount)}
                            </p>
                            {transaction.commission > 0 && (
                              <p className="text-xs text-gray-400">
                                Bruto: {formatCurrency(transaction.amount)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Resumo do Mes */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-emerald-600" />
                Resumo do Mes
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-gray-600">
                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                    Receitas
                  </div>
                  <span className="font-semibold text-emerald-600">
                    {formatCurrency(data?.summary?.current_month?.received)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-gray-600">
                    <ArrowDownRight className="w-4 h-4 text-orange-500" />
                    Comissoes
                  </div>
                  <span className="font-semibold text-orange-600">
                    -{formatCurrency(data?.summary?.current_month?.commissions_paid)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2 text-gray-900 font-medium">
                    <TrendingUp className="w-4 h-4 text-teal-500" />
                    Liquido
                  </div>
                  <span className="font-bold text-teal-600 text-lg">
                    {formatCurrency(data?.summary?.current_month?.net)}
                  </span>
                </div>
              </div>
            </div>

            {/* Comissoes Info */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-100 p-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                <CreditCard className="w-5 h-5 text-orange-600" />
                Sobre Comissoes
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  A plataforma cobra uma comissao de <strong className="text-orange-700">10%</strong> sobre cada servico realizado.
                </p>
                <p>
                  Assinaturas e outros valores nao tem comissao aplicada.
                </p>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-emerald-600" />
                Dicas
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Exporte seus dados regularmente para controle contabil</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Acompanhe suas transacoes pendentes para evitar surpresas</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Mantenha seus dados bancarios atualizados para receber mais rapido</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
