import { useEffect, useState } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import {
  Plus,
  CreditCard,
  Check,
  X,
  Edit3,
  Star,
  Zap,
  Crown,
  RefreshCw,
  Users,
  Briefcase,
  TrendingUp,
  AlertTriangle,
  Trash2,
} from 'lucide-react'

export default function AdminPlans() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [planToDelete, setPlanToDelete] = useState(null)
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
    active: true,
  })
  const [newFeature, setNewFeature] = useState('')

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/plans')
      setPlans(response.data.data)
    } catch (_error) {
      toast.error('Erro ao carregar planos')
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
    } catch (_error) {
      toast.error('Erro ao salvar plano')
    }
  }

  const handleDelete = async () => {
    if (!planToDelete) return
    try {
      await api.delete(`/admin/plans/${planToDelete.id}`)
      toast.success('Plano excluido!')
      setShowDeleteModal(false)
      setPlanToDelete(null)
      loadPlans()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao excluir plano')
    }
  }

  const togglePlanActive = async (plan) => {
    try {
      await api.put(`/admin/plans/${plan.id}`, { active: !plan.active })
      toast.success(`Plano ${!plan.active ? 'ativado' : 'desativado'}!`)
      loadPlans()
    } catch (_error) {
      toast.error('Erro ao atualizar plano')
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
        active: plan.active,
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
        active: true,
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingPlan(null)
    setNewFeature('')
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0)
  }

  const getPlanGradient = (index) => {
    const gradients = [
      'from-blue-600 to-cyan-500',
      'from-purple-600 to-pink-500',
      'from-amber-500 to-orange-500',
      'from-emerald-600 to-teal-500',
    ]
    return gradients[index % gradients.length]
  }

  const getPlanIcon = (index) => {
    const icons = [Star, Zap, Crown, Briefcase]
    return icons[index % icons.length]
  }

  const stats = {
    total: plans.length,
    active: plans.filter(p => p.active).length,
    totalSubscribers: plans.reduce((acc, p) => acc + (p.subscribers_count || 0), 0),
    revenue: plans.reduce((acc, p) => acc + ((p.price || 0) * (p.subscribers_count || 0)), 0),
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header - Full Width */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-transparent rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: '4s' }}
          />
          <div
            className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-violet-500/20 via-fuchsia-500/10 to-transparent rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: '5s', animationDelay: '1s' }}
          />
        </div>

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
                <CreditCard className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-white/90">Monetizacao da Plataforma</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Gerenciar <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Planos</span>
              </h1>
              <p className="text-slate-300 max-w-lg">
                Configure os planos de assinatura e precos da plataforma.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => openModal()}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Plus className="w-5 h-5" />
                Novo Plano
              </button>
              <button
                onClick={() => loadPlans()}
                className="flex items-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all"
                title="Atualizar lista"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            {[
              { value: stats.total, label: 'Planos', icon: CreditCard, color: 'from-purple-500 to-pink-500' },
              { value: stats.active, label: 'Ativos', icon: Check, color: 'from-green-500 to-emerald-500' },
              { value: stats.totalSubscribers, label: 'Assinantes', icon: Users, color: 'from-blue-500 to-cyan-500' },
              { value: formatCurrency(stats.revenue), label: 'Receita', icon: TrendingUp, color: 'from-amber-500 to-orange-500' },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center flex-shrink-0`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-slate-400">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-4">
              {/* Revenue Summary */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Receita Estimada
                  </h3>
                </div>
                <div className="p-4">
                  <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.revenue)}</p>
                  <p className="text-sm text-gray-500 mt-1">Mensal recorrente</p>
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Planos ativos</span>
                      <span className="font-semibold text-gray-900">{stats.active}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Assinantes</span>
                      <span className="font-semibold text-gray-900">{stats.totalSubscribers}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100 p-4">
                <h4 className="text-xs font-semibold text-purple-800 uppercase tracking-wider mb-3">Acoes Rapidas</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => openModal()}
                    className="w-full flex items-center gap-2 px-3 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Novo Plano
                  </button>
                </div>
              </div>

              {/* Plan Types Legend */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Recursos</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span className="text-gray-600">Ranking habilitado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-purple-500" />
                    <span className="text-gray-600">Destaque habilitado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-600">Assinantes ativos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Area */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin mx-auto" />
                  <p className="mt-4 text-gray-500">Carregando planos...</p>
                </div>
              </div>
            ) : plans.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 text-center py-20">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <CreditCard className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum plano cadastrado</h3>
                <p className="text-gray-400 mb-6">Crie seu primeiro plano de assinatura</p>
                <button
                  onClick={() => openModal()}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Criar Plano
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
            {plans.map((plan, index) => {
              const gradient = getPlanGradient(index)
              const Icon = getPlanIcon(index)
              return (
                <div key={plan.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden group hover:shadow-lg transition-all">
                  {/* Plan Header */}
                  <div className={`bg-gradient-to-r ${gradient} p-6 text-white relative overflow-hidden`}>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          plan.active ? 'bg-white/20 text-white' : 'bg-red-500/80 text-white'
                        }`}>
                          {plan.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                      <p className="text-white/80 text-sm">{plan.billing_cycle}</p>

                      <div className="mt-4">
                        <span className="text-4xl font-bold">{formatCurrency(plan.price)}</span>
                        <span className="text-white/70 text-sm ml-1">/{plan.billing_cycle}</span>
                      </div>
                    </div>
                  </div>

                  {/* Plan Features */}
                  <div className="p-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Recursos inclusos:</h4>
                    <ul className="space-y-2 mb-6">
                      {plan.features?.slice(0, 5).map((feature, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                      {(plan.features?.length || 0) > 5 && (
                        <li className="text-sm text-gray-400">
                          +{plan.features.length - 5} mais recursos
                        </li>
                      )}
                    </ul>

                    {/* Plan Limits */}
                    <div className="grid grid-cols-2 gap-3 py-4 border-t border-gray-100">
                      <div className="text-center p-3 bg-gray-50 rounded-xl">
                        <p className="text-2xl font-bold text-gray-900">{plan.max_interactions}</p>
                        <p className="text-xs text-gray-500">Interacoes/mes</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-xl">
                        <p className="text-2xl font-bold text-gray-900">{plan.max_services}</p>
                        <p className="text-xs text-gray-500">Servicos</p>
                      </div>
                    </div>

                    {/* Plan Badges */}
                    <div className="flex flex-wrap gap-2 py-4 border-t border-gray-100">
                      {plan.ranking_enabled && (
                        <span className="px-3 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Ranking
                        </span>
                      )}
                      {plan.featured_enabled && (
                        <span className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          Destaque
                        </span>
                      )}
                      {plan.subscribers_count > 0 && (
                        <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {plan.subscribers_count} assinantes
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => openModal(plan)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => togglePlanActive(plan)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                          plan.active
                            ? 'text-amber-700 bg-amber-100 hover:bg-amber-200'
                            : 'text-green-700 bg-green-100 hover:bg-green-200'
                        }`}
                      >
                        {plan.active ? 'Desativar' : 'Ativar'}
                      </button>
                      <button
                        onClick={() => { setPlanToDelete(plan); setShowDeleteModal(true) }}
                        className="p-2.5 text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                        title="Excluir plano"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {editingPlan ? 'Editar Plano' : 'Novo Plano'}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Plano *</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Plano Premium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preco (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="99.90"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ciclo de Cobranca</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max. Interacoes/mes</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                    value={formData.max_interactions}
                    onChange={(e) => setFormData({ ...formData, max_interactions: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max. Servicos</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                    value={formData.max_services}
                    onChange={(e) => setFormData({ ...formData, max_services: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Funcionalidades</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                    placeholder="Adicionar funcionalidade..."
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-4 py-3 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors font-medium"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                {formData.features.length > 0 && (
                  <ul className="space-y-2 max-h-40 overflow-y-auto">
                    {formData.features.map((feature, index) => (
                      <li key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                        <span className="text-sm text-gray-700 flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          {feature}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="p-1 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    checked={formData.ranking_enabled}
                    onChange={(e) => setFormData({ ...formData, ranking_enabled: e.target.checked })}
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700 block">Ranking</span>
                    <span className="text-xs text-gray-500">Aparecer no ranking</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    checked={formData.featured_enabled}
                    onChange={(e) => setFormData({ ...formData, featured_enabled: e.target.checked })}
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700 block">Destaque</span>
                    <span className="text-xs text-gray-500">Servicos em destaque</span>
                  </div>
                </label>
              </div>

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
                <div>
                  <span className="text-sm font-medium text-gray-700 block">Plano Ativo</span>
                  <span className="text-xs text-gray-500">Disponivel para novos assinantes</span>
                </div>
              </label>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all"
                >
                  {editingPlan ? 'Salvar Alteracoes' : 'Criar Plano'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && planToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Excluir Plano</h3>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir o plano <strong>"{planToDelete.name}"</strong>?
              {planToDelete.subscribers_count > 0 && (
                <span className="block mt-2 text-red-600 font-medium">
                  Atencao: Este plano possui {planToDelete.subscribers_count} assinante(s) ativo(s).
                </span>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
