import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchDeals, updateDealStatus } from '../../store/slices/dealsSlice'
import toast from 'react-hot-toast'

export default function DealList() {
  const dispatch = useDispatch()
  const { deals, loading } = useSelector((state) => state.deals)
  const { user } = useSelector((state) => state.auth)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    dispatch(fetchDeals({ status: filter || undefined }))
  }, [dispatch, filter])

  const handleStatusChange = async (dealId, newStatus) => {
    try {
      await dispatch(updateDealStatus({ id: dealId, status: newStatus })).unwrap()
      toast.success(`Negociação ${newStatus === 'aceito' ? 'aceita' : 'rejeitada'}!`)
    } catch (error) {
      toast.error(error || 'Erro ao atualizar status')
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      aberto: 'badge-info',
      negociando: 'badge-warning',
      aceito: 'badge-success',
      concluido: 'badge-success',
      rejeitado: 'badge-danger',
    }
    return styles[status] || 'badge-info'
  }

  const getStatusLabel = (status) => {
    const labels = {
      aberto: 'Aberto',
      negociando: 'Em Negociação',
      aceito: 'Aceito',
      concluido: 'Concluído',
      rejeitado: 'Rejeitado',
    }
    return labels[status] || status
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Negociações</h1>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('')}
            className={`px-4 py-2 rounded-lg ${!filter ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
          >
            Todas
          </button>
          {['aberto', 'negociando', 'aceito', 'concluido', 'rejeitado'].map((status) => (
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
      ) : deals.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">Nenhuma negociação encontrada</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deals.map((deal) => (
            <div key={deal.id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{deal.service?.title || 'Serviço'}</h3>
                    <span className={`badge ${getStatusBadge(deal.status)}`}>
                      {getStatusLabel(deal.status)}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-2">
                    {user?.type === 'empresa' ? (
                      <>Cliente: {deal.client?.anonymous_name || deal.anon_handle_b}</>
                    ) : (
                      <>Empresa: {deal.company?.anonymous_name || deal.anon_handle_a}</>
                    )}
                  </p>
                  <p className="text-gray-400 text-xs">
                    Criado em: {new Date(deal.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <div className="flex gap-2 ml-4">
                  {/* Empresa pode aceitar/rejeitar quando em negociação */}
                  {user?.type === 'empresa' && deal.status === 'negociando' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(deal.id, 'aceito')}
                        className="btn-success text-sm"
                      >
                        Aceitar
                      </button>
                      <button
                        onClick={() => handleStatusChange(deal.id, 'rejeitado')}
                        className="btn-danger text-sm"
                      >
                        Rejeitar
                      </button>
                    </>
                  )}

                  {/* Ir para o chat */}
                  {['aberto', 'negociando', 'aceito'].includes(deal.status) && (
                    <Link
                      to={`/chat/${deal.id}`}
                      className="btn-primary text-sm"
                    >
                      Abrir Chat
                    </Link>
                  )}
                </div>
              </div>

              {/* Info adicional após aceite */}
              {deal.status === 'aceito' && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-green-800 text-sm font-medium">
                    Negociação aceita! Os dados de contato foram liberados.
                  </p>
                  {deal.order && (
                    <p className="text-green-600 text-sm mt-1">
                      Ordem #{deal.order.id} - R$ {parseFloat(deal.order.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
