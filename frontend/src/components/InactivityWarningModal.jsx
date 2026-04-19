import { Clock, LogOut, RefreshCw } from 'lucide-react'

/**
 * Modal de aviso de inatividade
 * Exibido quando o usuário está prestes a ser desconectado por inatividade
 */
export default function InactivityWarningModal({
  isOpen,
  remainingTime,
  onExtend,
  onLogout,
}) {
  if (!isOpen) return null

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-in zoom-in-95 duration-200">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
          Sessao prestes a expirar
        </h2>

        {/* Description */}
        <p className="text-gray-600 text-center mb-4">
          Sua sessao sera encerrada por inatividade em:
        </p>

        {/* Countdown */}
        <div className="text-center mb-6">
          <span className="text-4xl font-bold text-red-600">
            {formatTime(remainingTime)}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-red-500 transition-all duration-1000 ease-linear"
            style={{
              width: `${(remainingTime / 300) * 100}%`, // 300 = 5 minutos em segundos
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onLogout}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair agora
          </button>
          <button
            onClick={onExtend}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Continuar
          </button>
        </div>

        {/* Hint */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Por seguranca, sessoes inativas sao encerradas automaticamente
        </p>
      </div>
    </div>
  )
}
