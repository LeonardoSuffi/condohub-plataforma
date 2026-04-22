import { useState } from 'react'
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  X,
  Loader2,
} from 'lucide-react'

/**
 * Modal de confirmacao profissional
 * Substitui window.confirm() por uma UI elegante
 */
export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'warning',
  children,
}) {
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      // Error handled by parent
    } finally {
      setLoading(false)
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose()
    }
  }

  const variantStyles = {
    success: {
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      buttonBg: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600',
      Icon: CheckCircle,
    },
    danger: {
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      buttonBg: 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600',
      Icon: XCircle,
    },
    warning: {
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      buttonBg: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
      Icon: AlertTriangle,
    },
  }

  const styles = variantStyles[variant] || variantStyles.warning
  const IconComponent = styles.Icon

  return (
    <div
      className="fixed inset-0 z-[60] overflow-y-auto"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity" />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl transform transition-all animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="p-6 text-center">
            {/* Icon */}
            <div className={`w-16 h-16 ${styles.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <IconComponent className={`w-8 h-8 ${styles.iconColor}`} />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {title}
            </h3>

            {/* Description */}
            <p className="text-gray-500 mb-6">
              {description}
            </p>

            {/* Additional content */}
            {children}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 p-6 pt-0">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-5 py-3 text-gray-700 font-semibold bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={`flex-1 px-5 py-3 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${styles.buttonBg} disabled:opacity-50 shadow-lg`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processando...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
