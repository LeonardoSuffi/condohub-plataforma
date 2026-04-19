import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchDeals, updateDealStatus } from '../../store/slices/dealsSlice'
import { PageHeader, PageFilters } from '@/components/ui/page-header'
import { StatsCard, StatsGrid } from '@/components/ui/stats-card'
import { EmptyState } from '@/components/ui/empty-state'
import { Badge } from '@/components/ui/badge'
import { dealStatusConfig } from '@/lib/utils'
import {
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  ArrowRight,
  MessageCircle
} from 'lucide-react'
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
      toast.success(`Negociacao ${newStatus === 'aceito' ? 'aceita' : 'rejeitada'}!`)
    } catch (error) {
      toast.error(error || 'Erro ao atualizar status')
    }
  }

  const getStatusConfig = (status) => {
    return dealStatusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-700' }
  }

  const filterButtons = [
    { value: '', label: 'Todas' },
    { value: 'aberto', label: 'Abertos' },
    { value: 'negociando', label: 'Negociando' },
    { value: 'aceito', label: 'Aceitos' },
    { value: 'concluido', label: 'Concluidos' },
    { value: 'rejeitado', label: 'Rejeitados' },
  ]

  const stats = {
    total: deals.length,
    abertos: deals.filter(d => d.status === 'aberto').length,
    negociando: deals.filter(d => d.status === 'negociando').length,
    aceitos: deals.filter(d => d.status === 'aceito' || d.status === 'concluido').length,
  }

  return (
    <div className="bg-gray-50 pb-12">
      {/* Hero Section */}
      <PageHeader
        title="Minhas Negociacoes"
        description={`Acompanhe e gerencie suas negociacoes com ${user?.type === 'empresa' ? 'clientes' : 'fornecedores'}`}
      >
        <StatsGrid className="mt-8">
          <StatsCard icon={MessageSquare} value={stats.total} label="Total" />
          <StatsCard icon={Clock} value={stats.abertos + stats.negociando} label="Em andamento" />
          <StatsCard icon={CheckCircle} value={stats.aceitos} label="Aceitos" />
          <StatsCard
            icon={TrendingUp}
            value={`${stats.total > 0 ? Math.round((stats.aceitos / stats.total) * 100) : 0}%`}
            label="Conversao"
          />
        </StatsGrid>
      </PageHeader>

      {/* Filters */}
      <PageFilters>
        {filterButtons.map((btn) => (
          <button
            key={btn.value}
            onClick={() => setFilter(btn.value)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              filter === btn.value
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </PageFilters>

      {/* Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-1/3" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : deals.length === 0 ? (
            <EmptyState
              icon={MessageCircle}
              title="Nenhuma negociacao encontrada"
              description={
                filter
                  ? 'Tente ajustar os filtros'
                  : user?.type === 'cliente'
                    ? 'Explore o catalogo de servicos para iniciar uma negociacao'
                    : 'Aguarde clientes entrarem em contato'
              }
              action={
                filter ? (
                  <button
                    onClick={() => setFilter('')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Limpar filtros
                  </button>
                ) : !filter && user?.type === 'cliente' ? (
                  <Link
                    to="/empresas"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700"
                  >
                    Buscar Empresas
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : null
              }
            />
          ) : (
            <div className="space-y-4">
              {deals.map((deal) => {
                const statusConfig = getStatusConfig(deal.status)
                return (
                  <div
                    key={deal.id}
                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          deal.status === 'aceito' || deal.status === 'concluido'
                            ? 'bg-green-100'
                            : deal.status === 'rejeitado'
                              ? 'bg-red-100'
                              : 'bg-gray-100'
                        }`}>
                          {deal.status === 'aceito' || deal.status === 'concluido' ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : deal.status === 'rejeitado' ? (
                            <XCircle className="w-6 h-6 text-red-600" />
                          ) : (
                            <MessageSquare className="w-6 h-6 text-gray-500" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-gray-900">
                              {deal.service?.title || 'Servico'}
                            </h3>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                          </div>

                          <p className="text-sm text-gray-500 mb-1">
                            {user?.type === 'empresa' ? (
                              <>Cliente: {deal.client?.anonymous_name || deal.anon_handle_b}</>
                            ) : (
                              <>Empresa: {deal.company?.anonymous_name || deal.anon_handle_a}</>
                            )}
                          </p>

                          <p className="text-xs text-gray-400">
                            Iniciado em: {new Date(deal.created_at).toLocaleDateString('pt-BR')}
                          </p>

                          {deal.status === 'aceito' && deal.order && (
                            <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100">
                              <p className="text-sm text-green-700 flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                Ordem #{deal.order.id} - R$ {parseFloat(deal.order.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {user?.type === 'empresa' && deal.status === 'negociando' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(deal.id, 'aceito')}
                              className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                            >
                              Aceitar
                            </button>
                            <button
                              onClick={() => handleStatusChange(deal.id, 'rejeitado')}
                              className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                            >
                              Rejeitar
                            </button>
                          </>
                        )}

                        {['aberto', 'negociando', 'aceito'].includes(deal.status) && (
                          <Link
                            to={`/chat/${deal.id}`}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Chat
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
