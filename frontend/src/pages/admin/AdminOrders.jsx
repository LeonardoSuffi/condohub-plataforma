import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchOrders, updateOrderStatus } from '../../store/slices/ordersSlice'
import toast from 'react-hot-toast'

export default function AdminOrders() {
  const dispatch = useDispatch()
  const { orders, loading } = useSelector((state) => state.orders)
  const [filter, setFilter] = useState('pendente')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [modalData, setModalData] = useState({ notes: '', rejection_reason: '', value: '' })

  useEffect(() => {
    dispatch(fetchOrders({ status: filter || undefined }))
  }, [dispatch, filter])

  const handleApprove = async (order) => {
    try {
      await dispatch(updateOrderStatus({
        id: order.id,
        status: 'aprovado',
        notes: modalData.notes,
        value: modalData.value || undefined,
      })).unwrap()
      toast.success('Ordem aprovada!')
      setSelectedOrder(null)
    } catch (error) {
      toast.error(error || 'Erro ao aprovar')
    }
  }

  const handleReject = async (order) => {
    if (!modalData.rejection_reason) {
      toast.error('Informe o motivo da rejeicao')
      return
    }
    try {
      await dispatch(updateOrderStatus({
        id: order.id,
        status: 'rejeitado',
        rejection_reason: modalData.rejection_reason,
      })).unwrap()
      toast.success('Ordem rejeitada')
      setSelectedOrder(null)
    } catch (error) {
      toast.error(error || 'Erro ao rejeitar')
    }
  }

  const handleComplete = async (order) => {
    try {
      await dispatch(updateOrderStatus({
        id: order.id,
        status: 'concluido',
        notes: modalData.notes,
      })).unwrap()
      toast.success('Ordem concluida!')
      setSelectedOrder(null)
    } catch (error) {
      toast.error(error || 'Erro ao concluir')
    }
  }

  const openModal = (order) => {
    setSelectedOrder(order)
    setModalData({ notes: '', rejection_reason: '', value: order.value })
  }

  const getStatusBadge = (status) => {
    const styles = {
      pendente: 'bg-yellow-100 text-yellow-700',
      aprovado: 'bg-blue-100 text-blue-700',
      concluido: 'bg-green-100 text-green-700',
      rejeitado: 'bg-red-100 text-red-700',
    }
    return styles[status] || 'bg-gray-100 text-gray-700'
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0)
  }

  const statusLabels = {
    pendente: 'Pendente',
    aprovado: 'Aprovado',
    concluido: 'Concluido',
    rejeitado: 'Rejeitado',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Ordens</h1>
        <p className="text-gray-500 mt-1">Aprove ou rejeite ordens de servico</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !filter ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          {['pendente', 'aprovado', 'concluido', 'rejeitado'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                filter === status ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {statusLabels[status]}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
          </svg>
          <p className="text-gray-500">Nenhuma ordem encontrada</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-semibold text-gray-900">Ordem #{order.id}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(order.status)}`}>
                      {statusLabels[order.status]}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600">
                      <span className="text-gray-500">Servico:</span> {order.deal?.service?.title || 'N/A'}
                    </p>
                    <p className="text-gray-600">
                      <span className="text-gray-500">Empresa:</span> {order.deal?.company?.nome_fantasia || order.deal?.company?.razao_social || 'N/A'}
                    </p>
                    <p className="text-gray-600">
                      <span className="text-gray-500">Cliente:</span> {order.deal?.client?.user?.name || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(order.value)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(order.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {order.status === 'pendente' && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2 justify-end">
                  <button
                    onClick={() => openModal(order)}
                    className="px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Revisar
                  </button>
                </div>
              )}

              {order.status === 'aprovado' && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2 justify-end">
                  <button
                    onClick={() => { setSelectedOrder(order); handleComplete(order); }}
                    className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Marcar como Concluida
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedOrder && selectedOrder.status === 'pendente' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revisar Ordem #{selectedOrder.id}</h3>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Servico</p>
                <p className="font-medium text-gray-900">{selectedOrder.deal?.service?.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor (pode ajustar)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
                  value={modalData.value}
                  onChange={(e) => setModalData({ ...modalData, value: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observacoes</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 resize-none"
                  rows={2}
                  value={modalData.notes}
                  onChange={(e) => setModalData({ ...modalData, notes: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo da Rejeicao (se aplicavel)</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 resize-none"
                  rows={2}
                  value={modalData.rejection_reason}
                  onChange={(e) => setModalData({ ...modalData, rejection_reason: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleReject(selectedOrder)}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Rejeitar
              </button>
              <button
                onClick={() => handleApprove(selectedOrder)}
                className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Aprovar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
