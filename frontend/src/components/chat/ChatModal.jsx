import { useEffect, useState, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useChat } from '@/contexts/ChatContext'
import { fetchDeals, fetchDealDetail, fetchMessages, sendMessage, updateDealStatus, clearCurrentDeal } from '@/store/slices/dealsSlice'
import { STORAGE_URL } from '@/lib/config'
import ReviewModal from '@/components/reviews/ReviewModal'
import DealActionBar from './DealActionBar'
import toast from 'react-hot-toast'
import {
  X,
  Minus,
  Send,
  ArrowLeft,
  AlertCircle,
  Loader2,
  MessageSquare,
  Building2,
  User,
  ChevronRight,
  Search,
  Star,
  CheckCircle,
} from 'lucide-react'

export default function ChatModal() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isOpen, activeDealId, minimized, closeChat, minimizeChat, maximizeChat, switchDeal } = useChat()
  const { user } = useSelector((state) => state.auth)
  const { deals, currentDeal, messages, dealStatus, isAnonymous, loadingDetail, loadingMessages } = useSelector((state) => state.deals)

  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('pendentes')
  const [actionLoading, setActionLoading] = useState(false)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)
  const messagesEndRef = useRef(null)
  const pollingRef = useRef(null)
  const inputRef = useRef(null)

  const storageUrl = STORAGE_URL

  // Load deals list
  useEffect(() => {
    if (isOpen && !minimized) {
      dispatch(fetchDeals({ per_page: 50 }))
    }
  }, [dispatch, isOpen, minimized])

  // Load deal detail and messages when activeDealId changes
  useEffect(() => {
    if (activeDealId && isOpen && !minimized) {
      dispatch(fetchDealDetail(activeDealId))
      dispatch(fetchMessages({ dealId: activeDealId }))

      // Start polling for new messages
      pollingRef.current = setInterval(() => {
        dispatch(fetchMessages({ dealId: activeDealId }))
      }, 5000)
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }
  }, [dispatch, activeDealId, isOpen, minimized])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Focus input when deal is selected
  useEffect(() => {
    if (activeDealId && inputRef.current && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [activeDealId, minimized])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    const content = newMessage.trim()
    if (!content || sending || !activeDealId) return

    setSending(true)
    setNewMessage('')

    try {
      await dispatch(sendMessage({ dealId: activeDealId, content })).unwrap()
      dispatch(fetchMessages({ dealId: activeDealId }))
    } catch (error) {
      toast.error(error || 'Erro ao enviar mensagem')
      setNewMessage(content)
    } finally {
      setSending(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    setActionLoading(true)
    try {
      await dispatch(updateDealStatus({ id: activeDealId, status: newStatus })).unwrap()
      const messages = {
        aceito: 'Negociacao aceita! Dados de contato liberados.',
        rejeitado: 'Negociacao rejeitada.',
        cancelado: 'Solicitacao cancelada.',
        concluido: 'Negociacao concluida com sucesso!',
      }
      toast.success(messages[newStatus] || 'Status atualizado!')
      if (['rejeitado', 'cancelado'].includes(newStatus)) {
        switchDeal(null)
      }
      dispatch(fetchDeals({ per_page: 50 }))
      if (activeDealId && !['rejeitado', 'cancelado'].includes(newStatus)) {
        dispatch(fetchDealDetail(activeDealId))
      }
    } catch (error) {
      toast.error(error || 'Erro ao atualizar status')
      throw error
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteDeal = async () => {
    setActionLoading(true)
    try {
      // Soft delete - just hide from the user's list
      await dispatch(updateDealStatus({ id: activeDealId, status: 'arquivado' })).unwrap()
      toast.success('Conversa excluida!')
      switchDeal(null)
      dispatch(fetchDeals({ per_page: 50 }))
    } catch (error) {
      toast.error(error || 'Erro ao excluir conversa')
      throw error
    } finally {
      setActionLoading(false)
    }
  }

  const handleBackToList = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    dispatch(clearCurrentDeal())
    switchDeal(null)
  }

  const canSendMessages = ['aberto', 'negociando'].includes(dealStatus)

  const getStatusStyle = (status) => {
    const styles = {
      aberto: 'bg-amber-100 text-amber-700',
      negociando: 'bg-blue-100 text-blue-700',
      aceito: 'bg-emerald-100 text-emerald-700',
      concluido: 'bg-emerald-100 text-emerald-700',
      rejeitado: 'bg-red-100 text-red-700',
      cancelado: 'bg-orange-100 text-orange-700',
      arquivado: 'bg-gray-100 text-gray-500',
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
      cancelado: 'Cancelado',
      arquivado: 'Arquivado',
    }
    return labels[status] || status
  }

  // Filter deals by tab (arquivados nao aparecem)
  const getDealsForTab = (tab) => {
    const allDeals = (deals || []).filter(d => d.status !== 'arquivado')
    switch (tab) {
      case 'pendentes':
        return allDeals.filter(d => ['aberto', 'negociando'].includes(d.status))
      case 'contatos':
        return allDeals.filter(d => d.status === 'aceito')
      case 'finalizado':
        return allDeals.filter(d => ['concluido', 'rejeitado', 'cancelado'].includes(d.status))
      default:
        return allDeals
    }
  }

  const filteredDeals = getDealsForTab(activeTab).filter(deal => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    const serviceName = (deal.service?.title || deal.service?.titulo || '').toLowerCase()
    const companyName = (deal.company?.nome_fantasia || '').toLowerCase()
    const clientName = (deal.client?.name || '').toLowerCase()
    return serviceName.includes(searchLower) || companyName.includes(searchLower) || clientName.includes(searchLower)
  })

  // Count for each tab (arquivados nao contam)
  const nonArchivedDeals = (deals || []).filter(d => d.status !== 'arquivado')
  const tabCounts = {
    pendentes: nonArchivedDeals.filter(d => ['aberto', 'negociando'].includes(d.status)).length,
    contatos: nonArchivedDeals.filter(d => d.status === 'aceito').length,
    finalizado: nonArchivedDeals.filter(d => ['concluido', 'rejeitado', 'cancelado'].includes(d.status)).length,
  }

  if (!isOpen) return null

  // Minimized state - just show a floating button
  if (minimized) {
    return (
      <button
        onClick={maximizeChat}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-full shadow-2xl hover:shadow-slate-500/25 hover:scale-105 transition-all flex items-center justify-center"
      >
        <MessageSquare className="w-6 h-6" />
        {deals?.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {deals.length}
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[420px] h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {activeDealId && (
            <button
              onClick={handleBackToList}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <span className="font-semibold">
              {activeDealId ? 'Conversa' : 'Mensagens'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={minimizeChat}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Minimizar"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={closeChat}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {!activeDealId ? (
        // Deal List View
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar conversas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {[
              { id: 'pendentes', label: 'Pendentes', icon: '🟡' },
              { id: 'contatos', label: 'Contatos', icon: '🟢' },
              { id: 'finalizado', label: 'Finalizado', icon: '✓' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 text-xs font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-slate-900 bg-slate-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <span>{tab.icon}</span>
                  {tab.label}
                  {tabCounts[tab.id] > 0 && (
                    <span className={`min-w-[18px] h-[18px] text-[10px] rounded-full flex items-center justify-center ${
                      activeTab === tab.id
                        ? 'bg-slate-800 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {tabCounts[tab.id]}
                    </span>
                  )}
                </span>
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800" />
                )}
              </button>
            ))}
          </div>

          {/* Deals List */}
          <div className="flex-1 overflow-y-auto">
            {filteredDeals.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">
                  {activeTab === 'pendentes' && 'Nenhuma negociacao pendente'}
                  {activeTab === 'contatos' && 'Nenhum contato liberado'}
                  {activeTab === 'finalizado' && 'Nenhuma negociacao finalizada'}
                </h3>
                <p className="text-sm text-gray-500">
                  {activeTab === 'pendentes' && 'Negociacoes em andamento aparecerao aqui'}
                  {activeTab === 'contatos' && 'Contatos aceitos aparecerao aqui'}
                  {activeTab === 'finalizado' && 'Negociacoes concluidas aparecerao aqui'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredDeals.map((deal) => {
                  const otherParty = user?.type === 'empresa'
                    ? { name: deal.client?.name || 'Cliente', type: 'cliente' }
                    : { name: deal.company?.nome_fantasia || 'Empresa', type: 'empresa' }
                  const logoUrl = deal.company?.logo_url || null

                  return (
                    <button
                      key={deal.id}
                      onClick={() => switchDeal(deal.id)}
                      className="w-full p-4 hover:bg-gray-50 transition-colors text-left flex items-center gap-3"
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        {user?.type === 'empresa' ? (
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-500" />
                          </div>
                        ) : logoUrl ? (
                          <img src={logoUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center text-white font-bold">
                            {(otherParty.name || 'E').charAt(0)}
                          </div>
                        )}
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                          ['aberto', 'negociando'].includes(deal.status) ? 'bg-emerald-500' : 'bg-gray-400'
                        }`} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <h4 className="font-medium text-gray-900 truncate text-sm">
                            {otherParty.name}
                          </h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusStyle(deal.status)}`}>
                            {getStatusLabel(deal.status)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {deal.service?.title || deal.service?.titulo || 'Servico'}
                        </p>
                        {deal.last_message && (
                          <p className="text-xs text-gray-400 truncate mt-1">
                            {deal.last_message}
                          </p>
                        )}
                      </div>

                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        // Chat View
        <div className="flex-1 flex flex-col overflow-hidden">
          {loadingDetail && !currentDeal ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-slate-600 animate-spin" />
            </div>
          ) : !currentDeal ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-500">Conversa nao encontrada</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-3 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {user?.type === 'empresa' ? (
                        <User className="w-5 h-5" />
                      ) : (
                        (currentDeal?.company?.nome_fantasia || 'E').charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-gray-900 truncate text-sm">
                        {user?.type === 'empresa' ? (
                          isAnonymous ? currentDeal?.anon_handle_b : (currentDeal?.client?.user?.name || 'Cliente')
                        ) : (
                          isAnonymous ? currentDeal?.anon_handle_a : (currentDeal?.company?.nome_fantasia || 'Empresa')
                        )}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">
                        {currentDeal?.service?.title || 'Servico'}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusStyle(dealStatus)}`}>
                    {getStatusLabel(dealStatus)}
                  </span>
                </div>
              </div>

              {/* Action Bar - Botoes e dados de contato */}
              <DealActionBar
                dealStatus={dealStatus}
                userType={user?.type}
                isAnonymous={isAnonymous}
                contactInfo={currentDeal?.contact_info}
                onAccept={() => handleStatusChange('aceito')}
                onReject={() => handleStatusChange('rejeitado')}
                onComplete={() => handleStatusChange('concluido')}
                onCancel={() => handleStatusChange('cancelado')}
                onDelete={handleDeleteDeal}
                loading={actionLoading}
              />

              {/* Review Banner - Show for completed deals for clients */}
              {dealStatus === 'concluido' && user?.type === 'cliente' && !hasReviewed && (
                <div className="mx-3 mt-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Star className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-amber-800 text-sm">Como foi sua experiencia?</p>
                        <p className="text-xs text-amber-600">Avalie o atendimento da empresa</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setReviewModalOpen(true)}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all flex items-center gap-1.5 flex-shrink-0 shadow-sm"
                    >
                      <Star className="w-4 h-4" />
                      Avaliar
                    </button>
                  </div>
                </div>
              )}

              {/* Reviewed notice */}
              {dealStatus === 'concluido' && user?.type === 'cliente' && hasReviewed && (
                <div className="mx-3 mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-700 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Obrigado pela sua avaliacao!</span>
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <div className="space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      Nenhuma mensagem. Inicie a conversa!
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.is_mine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                            message.is_system
                              ? 'bg-gray-200 text-gray-600 text-center w-full text-xs rounded-lg'
                              : message.is_mine
                              ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-white'
                              : 'bg-white text-gray-900 shadow-sm border border-gray-100'
                          }`}
                        >
                          {!message.is_system && !message.is_mine && (
                            <p className="text-xs font-medium mb-1 text-slate-600">
                              {message.sender_name}
                            </p>
                          )}
                          <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.is_mine ? 'text-white/70' : 'text-gray-400'
                          }`}>
                            {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input */}
              {canSendMessages ? (
                <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={sending}
                      maxLength={1000}
                      className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:bg-white focus:border focus:border-slate-300"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-full flex items-center justify-center hover:shadow-lg hover:shadow-slate-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {sending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-3 border-t border-gray-200 bg-gray-100 text-center text-gray-500 text-sm">
                  {dealStatus === 'aceito' && 'Negociacao aceita. Use os contatos acima.'}
                  {dealStatus === 'concluido' && 'Negociacao concluida.'}
                  {dealStatus === 'rejeitado' && 'Negociacao encerrada.'}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        deal={currentDeal}
        onSuccess={() => setHasReviewed(true)}
      />
    </div>
  )
}
