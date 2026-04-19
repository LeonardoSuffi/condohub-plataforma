import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDealDetail, fetchMessages, sendMessage, updateDealStatus, clearCurrentDeal } from '../../store/slices/dealsSlice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="h-[calc(100vh-14rem)] flex flex-col gap-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="flex-1 w-full rounded-lg" />
          <Skeleton className="h-14 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  // Not found state
  if (!loadingDetail && !currentDeal) {
    return (
      <Card className="max-w-md mx-auto mt-8 mx-4">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Negociacao nao encontrada</p>
          <Button variant="outline" onClick={() => navigate('/deals')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para negociacoes
          </Button>
        </CardContent>
      </Card>
    )
  }

  const getStatusBadge = () => {
    const variants = {
      aberto: { label: 'Aberto', variant: 'secondary' },
      negociando: { label: 'Em Negociacao', variant: 'warning' },
      aceito: { label: 'Aceito', variant: 'success' },
      concluido: { label: 'Concluido', variant: 'success' },
      rejeitado: { label: 'Rejeitado', variant: 'destructive' },
    }
    return variants[dealStatus] || { label: dealStatus, variant: 'secondary' }
  }

  const statusBadge = getStatusBadge()

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="h-[calc(100vh-14rem)] flex flex-col">
        {/* Header */}
        <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-foreground truncate">
                {currentDeal?.service?.title || 'Negociacao'}
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                {user?.type === 'empresa' ? (
                  <>Com: {isAnonymous ? currentDeal?.anon_handle_b : (currentDeal?.client?.user?.name || 'Cliente')}</>
                ) : (
                  <>Com: {isAnonymous ? currentDeal?.anon_handle_a : (currentDeal?.company?.nome_fantasia || 'Empresa')}</>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3 ml-4">
              <Badge variant={
                dealStatus === 'aceito' || dealStatus === 'concluido' ? 'default' :
                dealStatus === 'negociando' ? 'secondary' :
                dealStatus === 'rejeitado' ? 'destructive' : 'outline'
              }>
                {statusBadge.label}
              </Badge>
              {canAcceptReject && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange('aceito')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Aceitar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleStatusChange('rejeitado')}
                  >
                    Rejeitar
                  </Button>
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
        </CardContent>
      </Card>

      {/* Messages */}
      <Card className="flex-1 overflow-hidden mb-4">
        <CardContent className="p-4 h-full overflow-y-auto">
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
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
                        ? 'bg-muted text-muted-foreground text-center w-full text-sm rounded-lg'
                        : message.is_mine
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
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
        </CardContent>
      </Card>

      {/* Input */}
      {canSendMessages ? (
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <Input
            type="text"
            className="flex-1 h-12"
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
            maxLength={1000}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="h-12 px-6"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar
              </>
            )}
          </Button>
        </form>
      ) : (
        <Card className="bg-muted">
          <CardContent className="p-4 text-center text-muted-foreground text-sm">
            {dealStatus === 'aceito' && 'Negociacao aceita. Continue a conversa por outros meios.'}
            {dealStatus === 'concluido' && 'Esta negociacao foi concluida.'}
            {dealStatus === 'rejeitado' && 'Esta negociacao foi encerrada.'}
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  )
}
