import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDealDetail, fetchMessages, sendMessage, updateDealStatus, clearCurrentDeal } from '../../store/slices/dealsSlice'
import { Send, ArrowLeft, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ChatView() {
  const { dealId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentDeal, messages, dealStatus, isAnonymous, loadingDetail, loadingMessages } = useSelector((state) => state.deals)
  const { user } = useSelector((state) => state.auth)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const pollingRef = useRef(null)
  const mountedRef = useRef(true)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    mountedRef.current = true

    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(fetchDealDetail(dealId)).unwrap(),
          dispatch(fetchMessages({ dealId })).unwrap()
        ])
      } catch (error) {
        if (mountedRef.current) {
          toast.error('Erro ao carregar conversa')
          navigate('/deals')
        }
      }
    }

    loadData()

    pollingRef.current = setInterval(() => {
      if (mountedRef.current) {
        dispatch(fetchMessages({ dealId }))
      }
    }, 5000)

    return () => {
      mountedRef.current = false
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
      dispatch(clearCurrentDeal())
    }
  }, [dispatch, dealId, navigate])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    const content = newMessage.trim()
    if (!content || sending) return

    setSending(true)
    setNewMessage('')

    try {
      await dispatch(sendMessage({ dealId, content })).unwrap()
      dispatch(fetchMessages({ dealId }))
    } catch (error) {
      if (mountedRef.current) {
        toast.error(error || 'Erro ao enviar mensagem')
        setNewMessage(content)
      }
    } finally {
      if (mountedRef.current) {
        setSending(false)
      }
    }
  }

  const handleStatusChange = async (newStatus) => {
    const confirmMessage = newStatus === 'aceito'
      ? 'Ao aceitar, seus dados de contato serao liberados para o cliente. Confirma?'
      : 'Tem certeza que deseja rejeitar esta negociacao?'

    if (!window.confirm(confirmMessage)) return

    try {
      await dispatch(updateDealStatus({ id: dealId, status: newStatus })).unwrap()
      toast.success(`Negociacao ${newStatus === 'aceito' ? 'aceita' : 'rejeitada'}!`)
      if (newStatus === 'rejeitado') {
        navigate('/deals')
      }
    } catch (error) {
      toast.error(error || 'Erro ao atualizar status')
    }
  }

  const canSendMessages = ['aberto', 'negociando'].includes(dealStatus)
  const canAcceptReject = user?.type === 'empresa' && dealStatus === 'negociando'

  const getStatusStyle = (status) => {
    const styles = {
      aberto: 'bg-yellow-100 text-yellow-700',
      negociando: 'bg-blue-100 text-blue-700',
      aceito: 'bg-green-100 text-green-700',
      concluido: 'bg-green-100 text-green-700',
      rejeitado: 'bg-red-100 text-red-700',
    }
    return styles[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusLabel = (status) => {
    const labels = {
      aberto: 'Aberto',
      negociando: 'Em Negociacao',
      aceito: 'Aceito',
      concluido: 'Concluido',
      rejeitado: 'Rejeitado',
    }
    return labels[status] || status
  }

  if (loadingDetail && !currentDeal) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
        <div className="bg-white rounded-lg shadow h-96 animate-pulse" />
        <div className="bg-white rounded-lg shadow p-4 animate-pulse">
          <div className="h-12 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  if (!loadingDetail && !currentDeal) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">Negociacao nao encontrada</p>
        <button
          onClick={() => navigate('/deals')}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para negociacoes
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex justify-between items-center">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-gray-900 truncate">
              {currentDeal?.service?.title || 'Negociacao'}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {user?.type === 'empresa' ? (
                <>Com: {isAnonymous ? currentDeal?.anon_handle_b : (currentDeal?.client?.user?.name || 'Cliente')}</>
              ) : (
                <>Com: {isAnonymous ? currentDeal?.anon_handle_a : (currentDeal?.company?.nome_fantasia || 'Empresa')}</>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusStyle(dealStatus)}`}>
              {getStatusLabel(dealStatus)}
            </span>
            {canAcceptReject && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusChange('aceito')}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  Aceitar
                </button>
                <button
                  onClick={() => handleStatusChange('rejeitado')}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Rejeitar
                </button>
              </div>
            )}
          </div>
        </div>

        {isAnonymous && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg text-amber-800 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            Esta conversa e anonima. Os dados de contato serao liberados apos a empresa aceitar a negociacao.
          </div>
        )}

        {!isAnonymous && dealStatus === 'aceito' && (
          <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-lg text-green-800 text-sm flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            Negociacao aceita! Agora voces podem trocar dados de contato diretamente.
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 bg-white rounded-lg shadow overflow-hidden mb-4">
        <div className="p-4 h-full overflow-y-auto">
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                Nenhuma mensagem ainda. Comece a conversa!
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.is_mine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      message.is_system
                        ? 'bg-gray-100 text-gray-600 text-center w-full text-sm rounded-lg'
                        : message.is_mine
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {!message.is_system && !message.is_mine && (
                      <p className="text-xs font-medium mb-1 opacity-70">
                        {message.sender_name}
                      </p>
                    )}
                    <p className="break-words">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.is_mine ? 'opacity-70' : 'opacity-50'
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
      </div>

      {/* Input */}
      {canSendMessages ? (
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            className="flex-1 h-12 px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="h-12 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Enviar
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500 text-sm">
          {dealStatus === 'aceito' && 'Negociacao aceita. Continue a conversa por outros meios.'}
          {dealStatus === 'concluido' && 'Esta negociacao foi concluida.'}
          {dealStatus === 'rejeitado' && 'Esta negociacao foi encerrada.'}
        </div>
      )}
    </div>
  )
}
