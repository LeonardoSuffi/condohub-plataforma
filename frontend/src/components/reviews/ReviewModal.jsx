import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createReview } from '@/store/slices/reviewsSlice'
import StarRating from './StarRating'
import toast from 'react-hot-toast'
import {
  X,
  Star,
  Send,
  Loader2,
  CheckCircle,
  Building2,
} from 'lucide-react'

export default function ReviewModal({
  isOpen,
  onClose,
  deal,
  onSuccess,
}) {
  const dispatch = useDispatch()
  const { submitting } = useSelector((state) => state.reviews)

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  if (!isOpen || !deal) return null

  const companyName = deal.company?.nome_fantasia || deal.company_name || 'Empresa'
  const serviceName = deal.service?.title || deal.service?.titulo || deal.service_name || 'Servico'

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (rating === 0) {
      toast.error('Selecione uma avaliacao de 1 a 5 estrelas')
      return
    }

    try {
      await dispatch(
        createReview({
          deal_id: deal.id,
          company_id: deal.company_id || deal.company?.id,
          rating,
          comment: comment.trim() || null,
        })
      ).unwrap()

      toast.success('Avaliacao enviada com sucesso!')
      setRating(0)
      setComment('')
      onClose()
      if (onSuccess) onSuccess()
    } catch (error) {
      toast.error(error || 'Erro ao enviar avaliacao')
    }
  }

  const getRatingLabel = (value) => {
    const labels = {
      1: 'Muito ruim',
      2: 'Ruim',
      3: 'Regular',
      4: 'Bom',
      5: 'Excelente',
    }
    return labels[value] || ''
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
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl transform transition-all overflow-hidden">

          {/* Header */}
          <div className="relative bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 p-6 pb-12">
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-yellow-300/20 rounded-full blur-xl" />
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
              <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center border border-white/30">
                <Star className="w-7 h-7 text-white fill-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Avaliar Empresa
                </h2>
                <p className="text-amber-100 text-sm">Como foi sua experiencia?</p>
              </div>
            </div>
          </div>

          {/* Company card overlapping header */}
          <div className="relative px-6 -mt-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {companyName}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {serviceName}
                  </p>
                </div>
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              </div>
            </div>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">

            {/* Rating */}
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 mb-4">
                Selecione sua avaliacao
              </p>
              <div className="flex justify-center mb-2">
                <StarRating
                  rating={rating}
                  onRatingChange={setRating}
                  size="lg"
                />
              </div>
              {rating > 0 && (
                <p className="text-sm font-medium text-amber-600">
                  {getRatingLabel(rating)}
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentario
                <span className="text-gray-400 font-normal ml-1">(opcional)</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Conte como foi sua experiencia com esta empresa..."
                rows={4}
                maxLength={2000}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all resize-none"
              />
              <div className="flex items-center justify-end mt-2">
                <p className="text-xs text-gray-400">
                  {comment.length}/2000
                </p>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <p className="text-xs text-amber-800 font-medium mb-2">Dicas para uma boa avaliacao:</p>
              <ul className="text-xs text-amber-700 space-y-1">
                <li>- Seja objetivo e honesto</li>
                <li>- Mencione pontos positivos e negativos</li>
                <li>- Descreva a qualidade do servico prestado</li>
              </ul>
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center gap-3 p-6 pt-0">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-5 py-3 text-gray-700 font-semibold bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || rating === 0}
              className="flex-1 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar Avaliacao
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
