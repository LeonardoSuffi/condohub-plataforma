import { useState } from 'react'
import StarRating from './StarRating'
import {
  User,
  CheckCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
} from 'lucide-react'

export default function ReviewCard({
  review,
  showResponse = true,
  canRespond = false,
  onRespond,
  responding = false,
}) {
  const [expanded, setExpanded] = useState(false)
  const [responseText, setResponseText] = useState('')
  const [showResponseForm, setShowResponseForm] = useState(false)

  const clientName = review.client?.name || review.client_name || 'Cliente'
  const date = new Date(review.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  const handleRespond = () => {
    if (responseText.trim() && onRespond) {
      onRespond(review.id, responseText.trim())
      setResponseText('')
      setShowResponseForm(false)
    }
  }

  const commentLength = review.comment?.length || 0
  const shouldTruncate = commentLength > 200

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-medium text-slate-600">
            {getInitials(clientName)}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-gray-900 truncate">
              {clientName}
            </p>
            {review.is_verified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                <CheckCircle className="w-3 h-3" />
                Verificada
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <StarRating rating={review.rating} readonly size="sm" />
            <span className="text-xs text-gray-400">{date}</span>
          </div>
        </div>
      </div>

      {/* Comment */}
      {review.comment && (
        <div className="mb-3">
          <p className={`text-sm text-gray-600 leading-relaxed ${shouldTruncate && !expanded ? 'line-clamp-3' : ''}`}>
            {review.comment}
          </p>
          {shouldTruncate && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1 text-sm text-slate-600 hover:text-slate-800 font-medium flex items-center gap-1"
            >
              {expanded ? (
                <>
                  Ver menos <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  Ver mais <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Response */}
      {showResponse && review.response && (
        <div className="bg-slate-50 rounded-lg p-3 border-l-2 border-slate-300">
          <p className="text-xs font-medium text-slate-500 mb-1">
            Resposta da empresa
          </p>
          <p className="text-sm text-slate-700">
            {review.response}
          </p>
          {review.responded_at && (
            <p className="text-xs text-slate-400 mt-2">
              {new Date(review.responded_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          )}
        </div>
      )}

      {/* Respond Button */}
      {canRespond && !review.response && !showResponseForm && (
        <button
          onClick={() => setShowResponseForm(true)}
          className="mt-3 flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
        >
          <MessageSquare className="w-4 h-4" />
          Responder
        </button>
      )}

      {/* Response Form */}
      {showResponseForm && (
        <div className="mt-3 space-y-3">
          <textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder="Escreva sua resposta..."
            rows={3}
            maxLength={1000}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-400 transition-all resize-none"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => {
                setShowResponseForm(false)
                setResponseText('')
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleRespond}
              disabled={!responseText.trim() || responding}
              className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {responding ? (
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
      )}
    </div>
  )
}
