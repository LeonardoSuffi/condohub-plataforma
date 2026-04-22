import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchDeals, updateDealStatus } from '../../store/slices/dealsSlice'
import { useChat } from '@/contexts/ChatContext'
import {
  MessageSquare,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  ArrowRight,
  MessageCircle,
  Search,
  Filter,
  Handshake,
  AlertCircle,
  ArrowUpRight,
  Building2,
  User,
  Calendar,
  DollarSign,
  MoreVertical,
  Check,
  X,
  ChevronRight,
  Zap,
  Target,
  BarChart3,
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import ConfirmationModal from '@/components/chat/ConfirmationModal'

export default function DealList() {
  const dispatch = useDispatch()
  const { openChat } = useChat()
  const { deals, loading } = useSelector((state) => state.deals)
  const { user } = useSelector((state) => state.auth)
  const [filter, setFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, dealId: null, action: null })
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    dispatch(fetchDeals({ status: filter || undefined }))
  }, [dispatch, filter])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleStatusChange = async (dealId, newStatus) => {
    setActionLoading(true)
    try {
      await dispatch(updateDealStatus({ id: dealId, status: newStatus })).unwrap()
      const messages = {
        aceito: 'Negociacao aceita! Dados de contato liberados.',
        rejeitado: 'Negociacao rejeitada.',
        concluido: 'Negociacao concluida com sucesso!',
      }
      toast.success(messages[newStatus] || 'Status atualizado!')
      dispatch(fetchDeals({ status: filter || undefined }))
    } catch (error) {
      toast.error(error || 'Erro ao atualizar status')
      throw error
    } finally {
      setActionLoading(false)
    }
  }

  const openConfirmModal = (dealId, action) => {
    setConfirmModal({ isOpen: true, dealId, action })
  }

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, dealId: null, action: null })
  }

  const handleConfirm = async () => {
    const { dealId, action } = confirmModal
    await handleStatusChange(dealId, action)
  }

  const getModalConfig = () => {
    switch (confirmModal.action) {
      case 'aceito':
        return {
          title: 'Aceitar Negociacao',
          description: 'Ao aceitar, seus dados de contato serao liberados para o cliente e voce podera ver os dados dele.',
          confirmText: 'Aceitar Negociacao',
          variant: 'success',
        }
      case 'rejeitado':
        return {
          title: 'Rejeitar Negociacao',
          description: 'Tem certeza que deseja rejeitar esta negociacao? Esta acao nao pode ser desfeita.',
          confirmText: 'Rejeitar',
          variant: 'danger',
        }
      case 'concluido':
        return {
          title: 'Concluir Negociacao',
          description: 'Confirma que o servico foi realizado e a negociacao pode ser encerrada?',
          confirmText: 'Marcar como Concluido',
          variant: 'success',
        }
      default:
        return {}
    }
  }

  const getStatusStyle = (status) => {
    const styles = {
      aberto: 'bg-amber-100 text-amber-700',
      negociando: 'bg-blue-100 text-blue-700',
      aceito: 'bg-emerald-100 text-emerald-700',
      concluido: 'bg-emerald-100 text-emerald-700',
      rejeitado: 'bg-red-100 text-red-700',
    }
    return styles[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusLabel = (status) => {
    const labels = {
      aberto: 'Aberto',
      negociando: 'Negociando',
      aceito: 'Aceito',
      concluido: 'Concluido',
      rejeitado: 'Rejeitado',
    }
    return labels[status] || status
  }

  const getStatusIcon = (status) => {
    const icons = {
      aberto: Clock,
      negociando: MessageSquare,
      aceito: CheckCircle,
      concluido: CheckCircle,
      rejeitado: XCircle,
    }
    return icons[status] || MessageSquare
  }

  const filterButtons = [
    { value: '', label: 'Todas', icon: BarChart3 },
    { value: 'aberto', label: 'Abertas', icon: Clock },
    { value: 'negociando', label: 'Negociando', icon: MessageSquare },
    { value: 'aceito', label: 'Aceitas', icon: CheckCircle },
    { value: 'concluido', label: 'Concluidas', icon: Check },
    { value: 'rejeitado', label: 'Rejeitadas', icon: XCircle },
  ]

  const stats = {
    total: deals.length,
    abertos: deals.filter(d => d.status === 'aberto').length,
    negociando: deals.filter(d => d.status === 'negociando').length,
    aceitos: deals.filter(d => d.status === 'aceito' || d.status === 'concluido').length,
    rejeitados: deals.filter(d => d.status === 'rejeitado').length,
  }

  const conversionRate = stats.total > 0 ? Math.round((stats.aceitos / stats.total) * 100) : 0

  // Filter deals by search
  const filteredDeals = deals.filter(deal => {
    if (!searchTerm) return true
    const serviceName = deal.service?.title?.toLowerCase() || ''
    const clientName = deal.client?.anonymous_name?.toLowerCase() || deal.anon_handle_b?.toLowerCase() || ''
    const companyName = deal.company?.anonymous_name?.toLowerCase() || deal.anon_handle_a?.toLowerCase() || ''
    return serviceName.includes(searchTerm.toLowerCase()) ||
           clientName.includes(searchTerm.toLowerCase()) ||
           companyName.includes(searchTerm.toLowerCase())
  })

  const isEmpresa = user?.type === 'empresa'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header - Full Width */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/30 via-cyan-500/20 to-transparent rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: '4s' }}
          />
          <div
            className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-violet-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse"
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
                <Handshake className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-white/90">Central de Negociacoes</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Minhas <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Negociacoes</span>
              </h1>
              <p className="text-slate-300 max-w-lg">
                Acompanhe e gerencie suas negociacoes com {isEmpresa ? 'clientes' : 'fornecedores'} em tempo real.
              </p>
            </div>

            {/* Conversion Rate Badge */}
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{conversionRate}%</p>
                    <p className="text-sm text-white/60">Taxa de Conversao</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 mt-10">
            {[
              { label: 'Total', value: stats.total, icon: MessageSquare, color: 'from-slate-500 to-slate-600' },
              { label: 'Abertas', value: stats.abertos, icon: Clock, color: 'from-amber-500 to-orange-500' },
              { label: 'Negociando', value: stats.negociando, icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
              { label: 'Aceitas', value: stats.aceitos, icon: CheckCircle, color: 'from-emerald-500 to-teal-500' },
              { label: 'Rejeitadas', value: stats.rejeitados, icon: XCircle, color: 'from-red-500 to-rose-500', hideOnMobile: true },
            ].map((stat, idx) => (
              <div
                key={idx}
                className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-colors ${stat.hideOnMobile ? 'hidden lg:block' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center flex-shrink-0`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
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
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar negociacoes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
              {filterButtons.map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => setFilter(btn.value)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl whitespace-nowrap transition-all ${
                    filter === btn.value
                      ? 'bg-slate-900 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <btn.icon className="w-4 h-4" />
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gray-200 rounded-xl" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-gray-200 rounded-lg w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 py-20">
            <div className="text-center max-w-md mx-auto px-4">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {filter || searchTerm ? 'Nenhuma negociacao encontrada' : 'Nenhuma negociacao ainda'}
              </h3>
              <p className="text-gray-500 mb-8">
                {filter || searchTerm
                  ? 'Tente ajustar os filtros ou termo de busca.'
                  : isEmpresa
                    ? 'Aguarde clientes entrarem em contato sobre seus servicos.'
                    : 'Explore o catalogo de servicos para iniciar uma negociacao.'}
              </p>
              {filter || searchTerm ? (
                <button
                  onClick={() => { setFilter(''); setSearchTerm('') }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Limpar filtros
                </button>
              ) : !isEmpresa && (
                <Link
                  to="/empresas"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                >
                  Buscar Empresas
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDeals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                user={user}
                isEmpresa={isEmpresa}
                getStatusStyle={getStatusStyle}
                getStatusLabel={getStatusLabel}
                getStatusIcon={getStatusIcon}
                openConfirmModal={openConfirmModal}
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
                openChat={openChat}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        )}

        {/* Quick Tips */}
        {!loading && filteredDeals.length > 0 && (
          <div className="mt-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Dica para aumentar conversoes</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {isEmpresa
                    ? 'Responda rapidamente as solicitacoes e mantenha uma comunicacao clara. Empresas que respondem em ate 1 hora tem 3x mais chances de fechar negocio.'
                    : 'Seja claro sobre suas necessidades e orcamento. Isso ajuda as empresas a oferecerem propostas mais precisas e acelera o processo de negociacao.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Confirmacao */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirm}
        {...getModalConfig()}
      />
    </div>
  )
}

// Deal Card Component
function DealCard({
  deal,
  user,
  isEmpresa,
  getStatusStyle,
  getStatusLabel,
  getStatusIcon,
  openConfirmModal,
  activeDropdown,
  setActiveDropdown,
  openChat,
  actionLoading
}) {
  const StatusIcon = getStatusIcon(deal.status)
  const isActive = ['aberto', 'negociando', 'aceito'].includes(deal.status)

  const toggleDropdown = (e) => {
    e.stopPropagation()
    setActiveDropdown(activeDropdown === deal.id ? null : deal.id)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all">
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Status Icon */}
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
            deal.status === 'aceito' || deal.status === 'concluido'
              ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
              : deal.status === 'rejeitado'
                ? 'bg-gradient-to-br from-red-500 to-rose-500'
                : deal.status === 'negociando'
                  ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                  : 'bg-gradient-to-br from-amber-500 to-orange-500'
          }`}>
            <StatusIcon className="w-7 h-7 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h3 className="font-bold text-gray-900 text-lg">
                {deal.service?.title || 'Servico'}
              </h3>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusStyle(deal.status)}`}>
                {getStatusLabel(deal.status)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
              <span className="flex items-center gap-1.5">
                {isEmpresa ? <User className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                {isEmpresa
                  ? (deal.client?.anonymous_name || deal.anon_handle_b || 'Cliente')
                  : (deal.company?.anonymous_name || deal.anon_handle_a || 'Empresa')}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(deal.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>

            {/* Order Info */}
            {deal.status === 'aceito' && deal.order && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700">
                  Ordem #{deal.order.id} - R$ {parseFloat(deal.order.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Accept/Reject for Empresa */}
            {isEmpresa && deal.status === 'negociando' && (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => openConfirmModal(deal.id, 'aceito')}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  Aceitar
                </button>
                <button
                  onClick={() => openConfirmModal(deal.id, 'rejeitado')}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-rose-500 rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Rejeitar
                </button>
              </div>
            )}

            {/* Complete Button for Accepted Deals */}
            {deal.status === 'aceito' && (
              <button
                onClick={() => openConfirmModal(deal.id, 'concluido')}
                disabled={actionLoading}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Concluir
              </button>
            )}

            {/* Chat Button */}
            {isActive && (
              <button
                onClick={() => openChat(deal.id)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Chat</span>
              </button>
            )}

            {/* Mobile Dropdown for Negociando */}
            {isEmpresa && deal.status === 'negociando' && (
              <div className="relative sm:hidden">
                <button
                  onClick={toggleDropdown}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-gray-500" />
                </button>
                {activeDropdown === deal.id && (
                  <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-10 overflow-hidden">
                    <button
                      onClick={() => { openConfirmModal(deal.id, 'aceito'); setActiveDropdown(null) }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Aceitar
                    </button>
                    <button
                      onClick={() => { openConfirmModal(deal.id, 'rejeitado'); setActiveDropdown(null) }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Rejeitar
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Complete Button for Aceito */}
            {deal.status === 'aceito' && (
              <button
                onClick={() => openConfirmModal(deal.id, 'concluido')}
                disabled={actionLoading}
                className="sm:hidden flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}

            {/* Arrow for completed/rejected */}
            {!isActive && (
              <button
                onClick={() => openChat(deal.id)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
