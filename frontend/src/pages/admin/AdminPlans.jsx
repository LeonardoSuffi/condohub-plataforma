import { useEffect, useState } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminPlans() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    billing_cycle: 'mensal',
    features: [],
    max_interactions: 10,
    max_services: 5,
    ranking_enabled: false,
    featured_enabled: false,
    priority: 0,
  })
  const [newFeature, setNewFeature] = useState('')

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      const response = await api.get('/admin/plans')
      setPlans(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar planos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingPlan) {
        await api.put(`/admin/plans/${editingPlan.id}`, formData)
        toast.success('Plano atualizado!')
      } else {
        await api.post('/admin/plans', formData)
        toast.success('Plano criado!')
      }
      closeModal()
      loadPlans()
    } catch (error) {
      toast.error('Erro ao salvar plano')
    }
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({ ...formData, features: [...formData.features, newFeature.trim()] })
      setNewFeature('')
    }
  }

  const removeFeature = (index) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    })
  }

  const openModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan)
      setFormData({
        name: plan.name,
        price: plan.price,
        billing_cycle: plan.billing_cycle,
        features: plan.features || [],
        max_interactions: plan.max_interactions,
        max_services: plan.max_services,
        ranking_enabled: plan.ranking_enabled,
        featured_enabled: plan.featured_enabled,
        priority: plan.priority,
      })
    } else {
      setEditingPlan(null)
      setFormData({
        name: '',
        price: '',
        billing_cycle: 'mensal',
        features: [],
        max_interactions: 10,
        max_services: 5,
        ranking_enabled: false,
        featured_enabled: false,
        priority: 0,
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingPlan(null)
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Planos</h1>
          <p className="text-gray-500 mt-1">Crie e edite planos de assinatura</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo Plano
        </button>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
          </svg>
          <p className="text-gray-500">Nenhum plano cadastrado</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                    plan.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {plan.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <button
                  onClick={() => openModal(plan)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Editar
                </button>
              </div>

              <p className="text-3xl font-bold text-gray-900 mb-4">
                {formatCurrency(plan.price)}
                <span className="text-sm text-gray-500 font-normal">/{plan.billing_cycle}</span>
              </p>

              <ul className="space-y-2 mb-4">
                {plan.features?.map((feature, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="text-xs text-gray-500 space-y-1 pt-4 border-t border-gray-100">
                <p>Max. Interacoes: {plan.max_interactions}</p>
                <p>Max. Servicos: {plan.max_services}</p>
                <p>Ranking: {plan.ranking_enabled ? 'Sim' : 'Nao'}</p>
                <p>Destaque: {plan.featured_enabled ? 'Sim' : 'Nao'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingPlan ? 'Editar Plano' : 'Novo Plano'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preco</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciclo</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
                    value={formData.billing_cycle}
                    onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value })}
                  >
                    <option value="mensal">Mensal</option>
                    <option value="trimestral">Trimestral</option>
                    <option value="semestral">Semestral</option>
                    <option value="anual">Anual</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max. Interacoes</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
                    value={formData.max_interactions}
                    onChange={(e) => setFormData({ ...formData, max_interactions: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max. Servicos</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
                    value={formData.max_services}
                    onChange={(e) => setFormData({ ...formData, max_services: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Funcionalidades</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
                    placeholder="Adicionar funcionalidade..."
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    +
                  </button>
                </div>
                <ul className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <li key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                      <span className="text-sm text-gray-700">{feature}</span>
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                    checked={formData.ranking_enabled}
                    onChange={(e) => setFormData({ ...formData, ranking_enabled: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700">Ranking Habilitado</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                    checked={formData.featured_enabled}
                    onChange={(e) => setFormData({ ...formData, featured_enabled: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700">Destaque Habilitado</span>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
