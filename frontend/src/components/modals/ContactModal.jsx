import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createDeal } from '@/store/slices/dealsSlice'
import { useChat } from '@/contexts/ChatContext'
import { STORAGE_URL } from '@/lib/config'
import toast from 'react-hot-toast'
import {
  X,
  MessageSquare,
  Shield,
  Send,
  Loader2,
  Briefcase,
  CheckCircle,
  ArrowRight,
  Building2,
  Clock,
  Lock,
  Zap,
} from 'lucide-react'

export default function ContactModal({
  isOpen,
  onClose,
  company,
  services = [],
  selectedService = null,
}) {
  const dispatch = useDispatch()
  const { openChat } = useChat()
  const { loading } = useSelector((state) => state.deals)

  const [serviceId, setServiceId] = useState('')
  const [message, setMessage] = useState('')

  const storageUrl = STORAGE_URL
  const logoUrl = company?.logo_url || null

  useEffect(() => {
    if (isOpen) {
      setServiceId(selectedService?.id?.toString() || '')
      setMessage('')
    }
  }, [isOpen, selectedService])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!serviceId) {
      toast.error('Selecione um servico')
      return
    }

    try {
      const result = await dispatch(
        createDeal({
          service_id: parseInt(serviceId),
          mensagem_inicial: message.trim() || null,
        })
      ).unwrap()

      toast.success('Solicitacao enviada com sucesso!')
      onClose()

      if (result?.id) {
        openChat(result.id)
      } else {
        openChat()
      }
    } catch (error) {
      toast.error(error || 'Erro ao enviar solicitacao')
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl transform transition-all overflow-hidden">

          {/* Header with gradient */}
          <div className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 p-6 pb-16">
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header content */}
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center border border-white/20">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Solicitar Orcamento
                </h2>
                <p className="text-slate-300 text-sm">Inicie uma negociacao segura</p>
              </div>
            </div>
          </div>

          {/* Company card overlapping header */}
          <div className="relative px-6 -mt-10">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
              <div className="flex items-center gap-4">
                {/* Company logo */}
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-200">
                  {logoUrl ? (
                    <img src={logoUrl} alt={company?.nome_fantasia} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-slate-400" />
                    </div>
                  )}
                </div>

                {/* Company info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {company?.nome_fantasia}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    {company?.verified && (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Verificada
                      </span>
                    )}
                    {company?.cidade && (
                      <span className="text-xs text-gray-500">
                        {company.cidade}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">

            {/* Service Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Servico de interesse
              </label>
              {selectedService ? (
                <div className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {selectedService.titulo || selectedService.title}
                      </p>
                      {(selectedService.preco_minimo || selectedService.price_range) && (
                        <p className="text-sm text-slate-600 mt-0.5">
                          {selectedService.price_range || `A partir de R$ ${parseFloat(selectedService.preco_minimo).toLocaleString('pt-BR')}`}
                        </p>
                      )}
                    </div>
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  </div>
                </div>
              ) : (
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-400 transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="">Selecione um servico...</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.titulo || service.title}
                      {service.preco_minimo &&
                        ` - R$ ${parseFloat(service.preco_minimo).toLocaleString('pt-BR')}`}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Mensagem inicial
                <span className="text-gray-400 font-normal ml-1">(opcional)</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Descreva o que voce precisa, prazos, detalhes do projeto..."
                rows={3}
                maxLength={1000}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-400 transition-all resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-400">
                  Seja especifico para receber um orcamento mais preciso
                </p>
                <p className="text-xs text-gray-400">
                  {message.length}/1000
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Lock, label: 'Dados protegidos', color: 'text-slate-600' },
                { icon: Shield, label: 'Chat anonimo', color: 'text-emerald-600' },
                { icon: Zap, label: 'Resposta rapida', color: 'text-amber-600' },
              ].map((feature, idx) => (
                <div key={idx} className="text-center p-3 bg-gray-50 rounded-xl">
                  <feature.icon className={`w-5 h-5 mx-auto mb-1.5 ${feature.color}`} />
                  <p className="text-xs font-medium text-gray-600">{feature.label}</p>
                </div>
              ))}
            </div>

            {/* How it works - Compact */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs font-semibold text-slate-700 mb-3 uppercase tracking-wide">Como funciona</p>
              <div className="flex items-center justify-between">
                {[
                  { step: '1', label: 'Envie' },
                  { step: '2', label: 'Converse' },
                  { step: '3', label: 'Feche' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {item.step}
                      </div>
                      <span className="text-xs text-slate-600 mt-1.5 font-medium">{item.label}</span>
                    </div>
                    {idx < 2 && (
                      <ArrowRight className="w-4 h-4 text-slate-300 mx-3" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center gap-3 p-6 pt-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-5 py-3 text-gray-700 font-semibold bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !serviceId}
              className="flex-1 px-5 py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white font-semibold rounded-xl hover:from-slate-900 hover:to-black disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
