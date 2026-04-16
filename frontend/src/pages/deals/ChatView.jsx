import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDealDetail, fetchMessages, sendMessage, updateDealStatus, clearCurrentDeal } from '../../store/slices/dealsSlice'
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

  // Scroll to bottom helper
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Load deal and messages
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

    // Start polling for messages every 5 seconds
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

  // Scroll to bottom when messages change
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
      // Refresh messages after sending
      dispatch(fetchMessages({ dealId }))
    } catch (error) {
      if (mountedRef.current) {
        toast.error(error || 'Erro ao enviar mensagem')
        setNewMessage(content) // Restore message on error
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

  // Loading state
  if (loadingDetail && !currentDeal) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-gray-500 text-sm">Carregando conversa...</p>
        </div>
      </div>
    )
  }

  // Not found state
  if (!loadingDetail && !currentDeal) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Negociacao nao encontrada</p>
        <button
          onClick={() => navigate('/deals')}
          className="mt-4 text-gray-900 hover:underline"
        >
          Voltar para negociacoes
        </button>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
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
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
              dealStatus === 'aceito' || dealStatus === 'concluido'
                ? 'bg-green-100 text-green-700'
                : dealStatus === 'negociando'
                ? 'bg-yellow-100 text-yellow-700'
                : dealStatus === 'rejeitado'
                ? 'bg-red-100 text-red-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {dealStatus === 'aberto' && 'Aberto'}
              {dealStatus === 'negociando' && 'Em Negociacao'}
              {dealStatus === 'aceito' && 'Aceito'}
              {dealStatus === 'concluido' && 'Concluido'}
              {dealStatus === 'rejeitado' && 'Rejeitado'}
            </span>
            {canAcceptReject && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusChange('aceito')}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Aceitar
                </button>
                <button
                  onClick={() => handleStatusChange('rejeitado')}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Rejeitar
                </button>
              </div>
            )}
          </div>
        </div>

        {isAnonymous && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg text-amber-800 text-sm">
            Esta conversa e anonima. Os dados de contato serao liberados apos a empresa aceitar a negociacao.
          </div>
        )}

        {!isAnonymous && dealStatus === 'aceito' && (
          <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-lg text-green-800 text-sm">
            Negociacao aceita! Agora voces podem trocar dados de contato diretamente.
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-y-auto mb-4 p-4">
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
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {!message.is_system && !message.is_mine && (
                    <p className="text-xs font-medium mb-1 text-gray-500">
                      {message.sender_name}
                    </p>
                  )}
                  <p className="break-words">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.is_mine ? 'text-gray-400' : 'text-gray-400'
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
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition-colors"
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Enviar'
            )}
          </button>
        </form>
      ) : (
        <div className="text-center text-gray-500 py-4 bg-gray-50 rounded-lg text-sm">
          {dealStatus === 'aceito' && 'Negociacao aceita. Continue a conversa por outros meios.'}
          {dealStatus === 'concluido' && 'Esta negociacao foi concluida.'}
          {dealStatus === 'rejeitado' && 'Esta negociacao foi encerrada.'}
        </div>
      )}
    </div>
  )
}
