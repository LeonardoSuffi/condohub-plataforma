import { useState } from 'react'
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
} from 'lucide-react'
import ConfirmationModal from './ConfirmationModal'

/**
 * Barra de acoes para gerenciamento de deals
 * Mostra botoes proeminentes e dados de contato
 */
export default function DealActionBar({
  dealStatus,
  userType,
  isAnonymous,
  contactInfo,
  onAccept,
  onReject,
  onComplete,
  loading = false,
}) {
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    action: null,
  })

  const isEmpresa = userType === 'empresa'
  const canAcceptReject = isEmpresa && dealStatus === 'negociando'
  const canComplete = dealStatus === 'aceito'
  const showContactInfo = !isAnonymous && (dealStatus === 'aceito' || dealStatus === 'concluido')

  const openConfirmModal = (action) => {
    setConfirmModal({ isOpen: true, action })
  }

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, action: null })
  }

  const handleConfirm = async () => {
    const { action } = confirmModal
    if (action === 'accept') await onAccept()
    else if (action === 'reject') await onReject()
    else if (action === 'complete') await onComplete()
  }

  const getModalConfig = () => {
    switch (confirmModal.action) {
      case 'accept':
        return {
          title: 'Aceitar Negociacao',
          description: 'Ao aceitar, seus dados de contato serao liberados para o cliente e voce podera ver os dados dele para entrar em contato.',
          confirmText: 'Aceitar Negociacao',
          variant: 'success',
        }
      case 'reject':
        return {
          title: 'Rejeitar Negociacao',
          description: 'Tem certeza que deseja rejeitar esta negociacao? Esta acao nao pode ser desfeita.',
          confirmText: 'Rejeitar',
          variant: 'danger',
        }
      case 'complete':
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

  // Se nao tem nada para mostrar, retorna null
  if (!isAnonymous && !canAcceptReject && !canComplete && !showContactInfo) {
    return null
  }

  return (
    <div className="border-b border-gray-100 bg-gray-50/80 p-3 space-y-3">
      {/* Card de Contatos */}
      {showContactInfo && contactInfo && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="font-semibold text-emerald-800">
              {isEmpresa ? 'Dados do Cliente' : 'Dados da Empresa'}
            </span>
          </div>
          <div className="space-y-2.5 text-sm">
            {/* Nome */}
            {(contactInfo.name || contactInfo.nome_fantasia) && (
              <div className="flex items-center gap-2.5 text-gray-700">
                {isEmpresa ? (
                  <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                ) : (
                  <Building2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
                )}
                <span className="font-medium">{contactInfo.name || contactInfo.nome_fantasia}</span>
              </div>
            )}
            {/* Email */}
            {contactInfo.email && (
              <a
                href={`mailto:${contactInfo.email}`}
                className="flex items-center gap-2.5 text-emerald-700 hover:text-emerald-800 hover:underline transition-colors"
              >
                <Mail className="w-4 h-4 flex-shrink-0" />
                {contactInfo.email}
              </a>
            )}
            {/* Telefone */}
            {contactInfo.telefone && (
              <a
                href={`tel:${contactInfo.telefone.replace(/\D/g, '')}`}
                className="flex items-center gap-2.5 text-emerald-700 hover:text-emerald-800 hover:underline transition-colors"
              >
                <Phone className="w-4 h-4 flex-shrink-0" />
                {contactInfo.telefone}
              </a>
            )}
            {/* Localizacao */}
            {(contactInfo.cidade || contactInfo.estado) && (
              <div className="flex items-center gap-2.5 text-gray-600">
                <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                {[contactInfo.cidade, contactInfo.estado].filter(Boolean).join(' - ')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Aviso de Chat Anonimo */}
      {isAnonymous && (
        <div className="flex items-center gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <Shield className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span className="text-sm text-amber-700">
            Conversa anonima. Dados de contato liberados apos aceite.
          </span>
        </div>
      )}

      {/* Botoes de Acao */}
      {(canAcceptReject || canComplete) && (
        <div className="flex items-center gap-2">
          {canAcceptReject && (
            <>
              <button
                onClick={() => openConfirmModal('accept')}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Aceitar
                  </>
                )}
              </button>
              <button
                onClick={() => openConfirmModal('reject')}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-500/25 hover:from-red-600 hover:to-rose-600 transition-all disabled:opacity-50"
              >
                <X className="w-5 h-5" />
                Rejeitar
              </button>
            </>
          )}

          {canComplete && (
            <button
              onClick={() => openConfirmModal('complete')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Marcar como Concluido
                </>
              )}
            </button>
          )}
        </div>
      )}

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
