import { useEffect, useState } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminFinance() {
  const [transactions, setTransactions] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
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
    } catch (error) {
      toast.error('Erro ao carregar dados financeiros')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = () => {
    loadData()
  }

  const handleExport = async () => {
    try {
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
    } catch (error) {
      toast.error('Erro ao exportar')
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0)
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
      'comissao': 'bg-blue-100 text-blue-700',
      'assinatura': 'bg-purple-100 text-purple-700',
      'servico': 'bg-green-100 text-green-700',
      'estorno': 'bg-red-100 text-red-700',
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-gray-500 mt-1">Gestao de transacoes e receitas</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Exportar CSV
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm text-gray-500">Receita Total</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.revenue?.total)}</p>
            <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
              <span>Este periodo</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm text-gray-500">Comissoes</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(stats.revenue?.from_commissions)}</p>
            <p className="text-sm text-gray-400 mt-2">De ordens fechadas</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm text-gray-500">Assinaturas</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{formatCurrency(stats.revenue?.from_subscriptions)}</p>
            <p className="text-sm text-gray-400 mt-2">Planos ativos</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm text-gray-500">Ordens no Periodo</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.orders?.total || 0}</p>
            <p className="text-sm text-gray-400 mt-2">{stats.orders?.completed || 0} concluidas</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
            >
              <option value="">Todos</option>
              <option value="comissao">Comissao</option>
              <option value="assinatura">Assinatura</option>
              <option value="servico">Servico</option>
              <option value="estorno">Estorno</option>
            </select>
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Data inicial</label>
            <input
              type="date"
              value={filter.dateFrom}
              onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
            />
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Data final</label>
            <input
              type="date"
              value={filter.dateTo}
              onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
            />
          </div>

          <button
            onClick={handleFilter}
            className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Filtrar
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Transacoes</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
            <p className="text-gray-500">Nenhuma transacao encontrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descricao</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      #{transaction.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(transaction.type)}`}>
                        {getTypeLabel(transaction.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {transaction.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                        {transaction.status === 'concluida' ? 'Concluida' :
                         transaction.status === 'pendente' ? 'Pendente' :
                         transaction.status === 'processando' ? 'Processando' :
                         transaction.status === 'falhou' ? 'Falhou' :
                         transaction.status === 'estornada' ? 'Estornada' : transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
