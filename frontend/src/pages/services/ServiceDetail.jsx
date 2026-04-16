import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchServiceDetail, clearCurrentService } from '../../store/slices/servicesSlice'
import { createDeal } from '../../store/slices/dealsSlice'
import toast from 'react-hot-toast'

export default function ServiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentService } = useSelector((state) => state.services)
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    dispatch(fetchServiceDetail(id))
    return () => {
      dispatch(clearCurrentService())
    }
  }, [dispatch, id])

  const handleStartNegotiation = async () => {
    setLoading(true)
    try {
      const result = await dispatch(createDeal({
        service_id: parseInt(id),
        mensagem_inicial: message || null,
      }))

      if (createDeal.fulfilled.match(result)) {
        toast.success('Negociação iniciada com sucesso!')
        navigate(`/chat/${result.payload.id}`)
      } else {
        toast.error(result.payload || 'Erro ao iniciar negociação')
      }
    } catch (error) {
      toast.error('Erro ao iniciar negociação')
    } finally {
      setLoading(false)
      setShowModal(false)
    }
  }

  if (!currentService) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-gray-500">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex justify-between items-start">
          <div>
            {currentService.featured && (
              <span className="badge badge-warning mb-2">Destaque</span>
            )}
            <h1 className="text-2xl font-bold">{currentService.title}</h1>
            <p className="text-gray-500 mt-1">{currentService.category?.name}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary-600">
              R$ {currentService.price_range}
            </p>
            <p className="text-sm text-gray-500">Faixa de preço</p>
          </div>
        </div>
      </div>

      {/* Company Info */}
      <div className="card">
        <h2 className="font-semibold mb-4">Sobre a Empresa</h2>
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-2xl">
            🏢
          </div>
          <div className="ml-4">
            <p className="font-medium">
              {currentService.company?.nome_fantasia || 'Empresa'}
              {currentService.company?.verified && (
                <span className="ml-2 text-green-600 text-sm">✓ Verificada</span>
              )}
            </p>
            <p className="text-gray-500 text-sm">
              Segmento: {currentService.company?.segmento}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="card">
        <h2 className="font-semibold mb-4">Descrição do Serviço</h2>
        <p className="text-gray-600 whitespace-pre-line">
          {currentService.description}
        </p>
      </div>

      {/* Details */}
      <div className="card">
        <h2 className="font-semibold mb-4">Detalhes</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 text-sm">Região de Atuação</p>
            <p className="font-medium">{currentService.region}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Visualizações</p>
            <p className="font-medium">{currentService.views_count}</p>
          </div>
        </div>

        {currentService.tags?.length > 0 && (
          <div className="mt-4">
            <p className="text-gray-500 text-sm mb-2">Tags</p>
            <div className="flex flex-wrap gap-2">
              {currentService.tags.map((tag, index) => (
                <span key={index} className="badge badge-info">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action */}
      <div className="card">
        <button
          onClick={() => setShowModal(true)}
          className="w-full btn-primary py-3 text-lg"
        >
          Tenho Interesse
        </button>
        <p className="text-center text-gray-500 text-sm mt-2">
          Seus dados ficarão anônimos até a empresa aceitar a negociação
        </p>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Iniciar Negociação</h3>
            <p className="text-gray-600 mb-4">
              Envie uma mensagem inicial para a empresa. Seus dados pessoais
              ficarão ocultos até que a empresa aceite a negociação.
            </p>
            <textarea
              className="input mb-4"
              rows={4}
              placeholder="Descreva sua necessidade... (opcional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="flex gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 btn-secondary"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleStartNegotiation}
                className="flex-1 btn-primary"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
