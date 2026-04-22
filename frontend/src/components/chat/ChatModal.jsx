import { useEffect, useState, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useChat } from '@/contexts/ChatContext'
import { fetchDeals, fetchDealDetail, fetchMessages, sendMessage, updateDealStatus, clearCurrentDeal } from '@/store/slices/dealsSlice'
import { STORAGE_URL } from '@/lib/config'
import ReviewModal from '@/components/reviews/ReviewModal'
import toast from 'react-hot-toast'
import {
  X,
  Minus,
  Send,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Loader2,
  MessageSquare,
  Building2,
  User,
  Clock,
  Shield,
  ChevronRight,
  Search,
  MoreVertical,
  Phone,
  Mail,
  Check,
  XCircle,
  Star,
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
  const [showActions, setShowActions] = useState(false)
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
    const confirmMessage = newStatus === 'aceito'
      ? 'Ao aceitar, seus dados de contato serao liberados para o cliente. Confirma?'
      : 'Tem certeza que deseja rejeitar esta negociacao?'

    if (!window.confirm(confirmMessage)) return

    try {
      await dispatch(updateDealStatus({ id: activeDealId, status: newStatus })).unwrap()
      toast.success(`Negociacao ${newStatus === 'aceito' ? 'aceita' : 'rejeitada'}!`)
      if (newStatus === 'rejeitado') {
        switchDeal(null)
      }
      dispatch(fetchDeals({ per_page: 50 }))
    } catch (error) {
      toast.error(error || 'Erro ao atualizar status')
    }
    setShowActions(false)
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
  const canAcceptReject = user?.type === 'empresa' && dealStatus === 'negociando'

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

  const filteredDeals = (deals || []).filter(deal => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    const serviceName = (deal.service?.title || deal.service?.titulo || '').toLowerCase()
    const companyName = (deal.company?.nome_fantasia || '').toLowerCase()
    const clientName = (deal.client?.name || '').toLowerCase()
    return serviceName.includes(searchLower) || companyName.includes(searchLower) || clientName.includes(searchLower)
  })

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

          {/* Deals List */}
          <div className="flex-1 overflow-y-auto">
            {filteredDeals.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">Nenhuma conversa</h3>
                <p className="text-sm text-gray-500">
                  Suas negociacoes aparecerao aqui
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredDeals.map((deal) => {
                  const otherParty = user?.type === 'empresa'
                    ? { name: deal.client?.name || 'Cliente', type: 'cliente' }
                    : { name: deal.company?.nome_fantasia || 'Empresa', type: 'empresa' }
                  const logoUrl = deal.company?.logo_url ? `${storageUrl}/${deal.company.logo_url}` : null

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
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusStyle(dealStatus)}`}>
                      {getStatusLabel(dealStatus)}
                    </span>
                    {canAcceptReject && (
                      <div className="relative">
                        <button
                          onClick={() => setShowActions(!showActions)}
                          className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                        {showActions && (
                          <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 w-40 z-10">
                            <button
                              onClick={() => handleStatusChange('aceito')}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-emerald-600"
                            >
                              <Check className="w-4 h-4" />
                              Aceitar
                            </button>
                            <button
                              onClick={() => handleStatusChange('rejeitado')}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                            >
                              <XCircle className="w-4 h-4" />
                              Rejeitar
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Anonymous notice */}
                {isAnonymous && (
                  <div className="mt-2 p-2 bg-amber-50 rounded-lg text-amber-700 text-xs flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Conversa anonima. Dados liberados apos aceite.</span>
                  </div>
                )}

                {/* Accepted notice with contact info */}
                {!isAnonymous && dealStatus === 'aceito' && (
                  <div className="mt-2 p-2 bg-emerald-50 rounded-lg text-emerald-700 text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="font-medium">Negociacao aceita!</span>
                    </div>
                    {user?.type !== 'empresa' && currentDeal?.company && (
                      <div className="ml-5 space-y-1 text-emerald-600">
                        {currentDeal.company.telefone && (
                          <a href={`tel:${currentDeal.company.telefone}`} className="flex items-center gap-1 hover:underline">
                            <Phone className="w-3 h-3" />
                            {currentDeal.company.telefone}
                          </a>
                        )}
                        {currentDeal.company.email && (
                          <a href={`mailto:${currentDeal.company.email}`} className="flex items-center gap-1 hover:underline">
                            <Mail className="w-3 h-3" />
                            {currentDeal.company.email}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

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
