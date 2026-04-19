import { useEffect, useState } from 'react'
import api from '../../services/api'

export default function FinanceView() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFinanceData()
  }, [])

  const loadFinanceData = async () => {
    try {
      const response = await api.get('/finance/transactions')
      setData(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error)
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
    } catch (error) {
      console.error('Erro ao exportar:', error)
    }
  }

  const getTypeLabel = (type) => {
    const labels = {
      assinatura: 'Assinatura',
      comissao: 'Comissão',
      servico: 'Serviço',
      estorno: 'Estorno',
    }
    return labels[type] || type
  }

  const getStatusBadge = (status) => {
    const styles = {
      pendente: 'badge-warning',
      processando: 'badge-info',
      concluida: 'badge-success',
      falhou: 'badge-danger',
      estornada: 'badge-danger',
    }
    return styles[status] || 'badge-info'
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-gray-500">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Financeiro</h1>
        <button onClick={handleExport} className="btn-secondary">
          Exportar CSV
        </button>
      </div>

      {/* Summary */}
      {data?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <p className="text-gray-500 text-sm">Total Recebido</p>
            <p className="text-2xl font-bold text-green-600">
              R$ {parseFloat(data.summary.total?.received || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="card">
            <p className="text-gray-500 text-sm">Comissões Pagas</p>
            <p className="text-2xl font-bold text-orange-600">
              R$ {parseFloat(data.summary.total?.commissions_paid || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="card">
            <p className="text-gray-500 text-sm">Este Mês</p>
            <p className="text-2xl font-bold text-primary-600">
              R$ {parseFloat(data.summary.current_month?.received || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}

      {/* Transactions */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Transações</h2>
        {data?.transactions?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhuma transação encontrada</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Data</th>
                  <th className="text-left py-3 px-4">Tipo</th>
                  <th className="text-right py-3 px-4">Valor</th>
                  <th className="text-right py-3 px-4">Comissão</th>
                  <th className="text-right py-3 px-4">Líquido</th>
                  <th className="text-center py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.transactions?.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4">{getTypeLabel(transaction.type)}</td>
                    <td className="py-3 px-4 text-right">
                      R$ {parseFloat(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right text-orange-600">
                      R$ {parseFloat(transaction.commission).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-green-600">
                      R$ {parseFloat(transaction.net_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={getStatusBadge(transaction.status)}>
                        {transaction.status}
                      </span>
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
