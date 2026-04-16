import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchOrders } from '../store/slices/ordersSlice'

export default function OrderList() {
  const dispatch = useDispatch()
  const { orders, loading } = useSelector((state) => state.orders)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    dispatch(fetchOrders({ status: filter || undefined }))
  }, [dispatch, filter])

  const getStatusBadge = (status) => {
    const styles = {
      pendente: 'badge-warning',
      aprovado: 'badge-info',
      concluido: 'badge-success',
      rejeitado: 'badge-danger',
    }
    return styles[status] || 'badge-info'
  }

  const getStatusLabel = (status) => {
    const labels = {
      pendente: 'Pendente',
      aprovado: 'Aprovado',
      concluido: 'Concluído',
      rejeitado: 'Rejeitado',
    }
    return labels[status] || status
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Minhas Ordens</h1>

      {/* Filters */}
      <div className="card">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('')}
            className={`px-4 py-2 rounded-lg ${!filter ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
          >
            Todas
          </button>
          {['pendente', 'aprovado', 'concluido', 'rejeitado'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg ${filter === status ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
            >
              {getStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : orders.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">Nenhuma ordem encontrada</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">Ordem #{order.id}</h3>
                    <span className={`badge ${getStatusBadge(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-1">
                    Serviço: {order.deal?.service?.title || 'N/A'}
                  </p>
                  <p className="text-gray-400 text-xs">
                    Criado em: {new Date(order.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary-600">
                    R$ {parseFloat(order.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Logs */}
              {order.logs?.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium text-gray-600 mb-2">Histórico:</p>
                  <div className="space-y-1">
                    {order.logs.slice(-3).map((log) => (
                      <div key={log.id} className="text-xs text-gray-500 flex justify-between">
                        <span>{log.old_status ? `${log.old_status} → ${log.new_status}` : `Criado: ${log.new_status}`}</span>
                        <span>{new Date(log.created_at).toLocaleString('pt-BR')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {order.rejection_reason && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg text-red-800 text-sm">
                  Motivo da rejeição: {order.rejection_reason}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
