import { useState, useRef, useEffect } from 'react'
import {
  Check,
  X,
  CheckCircle2,
  Shield,
  Mail,
  Phone,
  User,
  MapPin,
  Loader2,
  Building2,
  Trash2,
  XCircle,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Archive,
  Flag,
} from 'lucide-react'
import ConfirmationModal from './ConfirmationModal'

/**
 * Barra de acoes profissional para gerenciamento de deals
 */
export default function DealActionBar({
  dealStatus,
  userType,
  isAnonymous,
  contactInfo,
  onAccept,
  onReject,
  onComplete,
  onCancel,
  onDelete,
  loading = false,
}) {
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null })
  const [showContacts, setShowContacts] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  const isEmpresa = userType === 'empresa'
  const isCliente = userType === 'cliente'

  const canAcceptReject = isEmpresa && dealStatus === 'negociando'
  const canCancel = isCliente && ['aberto', 'negociando'].includes(dealStatus)
  const canComplete = dealStatus === 'aceito'
  const showContactInfo = !isAnonymous && (dealStatus === 'aceito' || dealStatus === 'concluido')

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const openConfirmModal = (action) => {
    setShowMenu(false)
    setConfirmModal({ isOpen: true, action })
  }
  const closeConfirmModal = () => setConfirmModal({ isOpen: false, action: null })

  const handleConfirm = async () => {
    const { action } = confirmModal
    try {
      if (action === 'accept') await onAccept?.()
      else if (action === 'reject') await onReject?.()
      else if (action === 'complete') await onComplete?.()
      else if (action === 'cancel') await onCancel?.()
      else if (action === 'delete') await onDelete?.()
      closeConfirmModal()
    } catch (error) {
      // Error handled by parent
    }
  }

  const getModalConfig = () => {
    switch (confirmModal.action) {
      case 'accept':
        return {
          title: 'Aceitar Negociacao',
          description: 'Seus dados de contato serao liberados para o cliente.',
          confirmText: 'Aceitar',
          variant: 'success',
        }
      case 'reject':
        return {
          title: 'Rejeitar Negociacao',
          description: 'Tem certeza? Esta acao nao pode ser desfeita.',
          confirmText: 'Rejeitar',
          variant: 'danger',
        }
      case 'cancel':
        return {
          title: 'Cancelar Solicitacao',
          description: 'A empresa sera notificada do cancelamento.',
          confirmText: 'Cancelar',
          variant: 'warning',
        }
      case 'complete':
        return {
          title: 'Concluir Negociacao',
          description: 'Confirma que o servico foi realizado?',
          confirmText: 'Concluir',
          variant: 'success',
        }
      case 'delete':
        return {
          title: 'Excluir Conversa',
          description: 'Esta conversa sera removida permanentemente da sua lista.',
          confirmText: 'Excluir',
          variant: 'danger',
        }
      default:
        return {}
    }
  }

  const hasMainActions = canAcceptReject || canCancel || canComplete

  return (
    <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-3 py-2">
      {/* Aviso anonimo */}
      {isAnonymous && dealStatus === 'negociando' && (
        <div className="flex items-center gap-2 text-xs text-amber-600 mb-2">
          <Shield className="w-3.5 h-3.5" />
          <span>Chat anonimo - dados liberados apos aceite</span>
        </div>
      )}

      {/* Card de Contatos - Colapsavel */}
      {showContactInfo && contactInfo && (
        <div className="mb-2">
          <button
            onClick={() => setShowContacts(!showContacts)}
            className="w-full flex items-center justify-between text-xs font-medium text-emerald-700 hover:text-emerald-800 py-1"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isEmpresa ? 'Dados do Cliente' : 'Dados da Empresa'}
            </span>
            {showContacts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showContacts && (
            <div className="mt-1 p-2 bg-emerald-50 rounded-lg border border-emerald-100 space-y-1">
              {(contactInfo.name || contactInfo.nome_fantasia) && (
                <div className="flex items-center gap-2 text-xs text-gray-700">
                  {isEmpresa ? <User className="w-3 h-3 text-gray-400" /> : <Building2 className="w-3 h-3 text-gray-400" />}
                  <span className="font-medium">{contactInfo.name || contactInfo.nome_fantasia}</span>
                </div>
              )}
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {contactInfo.email && (
                  <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-1 text-xs text-emerald-600 hover:underline">
                    <Mail className="w-3 h-3" />
                    {contactInfo.email}
                  </a>
                )}
                {contactInfo.telefone && (
                  <a href={`tel:${contactInfo.telefone.replace(/\D/g, '')}`} className="flex items-center gap-1 text-xs text-emerald-600 hover:underline">
                    <Phone className="w-3 h-3" />
                    {contactInfo.telefone}
                  </a>
                )}
                {(contactInfo.cidade || contactInfo.estado) && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    {[contactInfo.cidade, contactInfo.estado].filter(Boolean).join(' - ')}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Barra de Acoes */}
      <div className="flex items-center gap-2">
        {/* Botoes Principais */}
        {canAcceptReject && (
          <>
            <button
              onClick={() => openConfirmModal('accept')}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Aceitar
            </button>
            <button
              onClick={() => openConfirmModal('reject')}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Rejeitar
            </button>
          </>
        )}

        {canCancel && (
          <button
            onClick={() => openConfirmModal('cancel')}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Cancelar Solicitacao
          </button>
        )}

        {canComplete && (
          <button
            onClick={() => openConfirmModal('complete')}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Concluir Negociacao
          </button>
        )}

        {/* Spacer se nao tem acoes principais */}
        {!hasMainActions && <div className="flex-1" />}

        {/* Menu de Opcoes */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Mais opcoes"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <button
                onClick={() => openConfirmModal('delete')}
                disabled={loading}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Excluir conversa
              </button>
            </div>
          )}
        </div>
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
