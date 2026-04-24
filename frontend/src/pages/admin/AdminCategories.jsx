import { useEffect, useState } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import {
  Plus,
  ChevronRight,
  Tag,
  X,
  Layers,
  FolderTree,
  Search,
  RefreshCw,
  Edit3,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Check,
  AlertTriangle,
  Grid3X3,
} from 'lucide-react'

const ICONS = [
  'building', 'wrench', 'sparkles', 'leaf', 'shield', 'laptop', 'briefcase',
  'calendar', 'truck', 'heart', 'graduation-cap', 'car', 'home', 'zap',
  'droplet', 'paintbrush', 'layers', 'grid', 'wind', 'flame', 'sun',
  'video', 'bell', 'fingerprint', 'eye', 'headphones', 'network', 'code',
  'smartphone', 'monitor', 'calculator', 'scale', 'users', 'megaphone',
  'chart-bar', 'utensils', 'gift', 'camera', 'music', 'package', 'box',
  'bike', 'warehouse', 'stethoscope', 'activity', 'dumbbell', 'apple',
  'book-open', 'globe', 'pencil', 'scissors', 'flower', 'bug'
]

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)
  const [expandedCategories, setExpandedCategories] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    parent_id: '',
    icon: '',
    description: '',
    order: 0,
    active: true,
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/categories')
      setCategories(response.data.data)
      const expanded = {}
      response.data.data.forEach(cat => {
        expanded[cat.id] = true
      })
      setExpandedCategories(expanded)
    } catch (_error) {
      toast.error('Erro ao carregar categorias')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        parent_id: formData.parent_id || null,
        order: parseInt(formData.order) || 0,
      }

      if (editingCategory) {
        await api.put(`/admin/categories/${editingCategory.id}`, data)
        toast.success('Categoria atualizada!')
      } else {
        await api.post('/admin/categories', data)
        toast.success('Categoria criada!')
      }
      closeModal()
      loadCategories()
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao salvar categoria'
      toast.error(message)
    }
  }

  const confirmDelete = (category) => {
    setCategoryToDelete(category)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    if (!categoryToDelete) return

    const hasServices = categoryToDelete.services_count > 0
    const hasChildren = categoryToDelete.children?.length > 0

    if (hasServices) {
      toast.error(`Nao e possivel excluir. Existem ${categoryToDelete.services_count} servico(s) vinculado(s).`)
      setShowDeleteModal(false)
      return
    }

    if (hasChildren) {
      toast.error(`Nao e possivel excluir. Existem ${categoryToDelete.children.length} subcategoria(s) vinculada(s).`)
      setShowDeleteModal(false)
      return
    }

    try {
      await api.delete(`/admin/categories/${categoryToDelete.id}`)
      toast.success('Categoria excluida!')
      loadCategories()
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao excluir'
      toast.error(message)
    } finally {
      setShowDeleteModal(false)
      setCategoryToDelete(null)
    }
  }

  const toggleActive = async (category) => {
    try {
      await api.put(`/admin/categories/${category.id}`, {
        active: !category.active
      })
      toast.success(`Categoria ${!category.active ? 'ativada' : 'desativada'}!`)
      loadCategories()
    } catch (_error) {
      toast.error('Erro ao atualizar status')
    }
  }

  const openModal = (category = null, parentId = null) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        parent_id: category.parent_id || '',
        icon: category.icon || '',
        description: category.description || '',
        order: category.order || 0,
        active: category.active,
      })
    } else {
      setEditingCategory(null)
      setFormData({
        name: '',
        parent_id: parentId || '',
        icon: '',
        description: '',
        order: 0,
        active: true,
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingCategory(null)
  }

  const toggleExpand = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  const getTotalServices = (category) => {
    let total = category.services_count || 0
    if (category.children) {
      category.children.forEach(child => {
        total += child.services_count || 0
      })
    }
    return total
  }

  const filteredCategories = categories.filter(cat => {
    if (!searchTerm) return true
    const matchesParent = cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesChildren = cat.children?.some(child =>
      child.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    return matchesParent || matchesChildren
  })

  const stats = {
    total: categories.length,
    subcategories: categories.reduce((acc, cat) => acc + (cat.children?.length || 0), 0),
    active: categories.filter(c => c.active).length + categories.reduce((acc, cat) =>
      acc + (cat.children?.filter(c => c.active).length || 0), 0),
    services: categories.reduce((acc, cat) => acc + getTotalServices(cat), 0),
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header - Full Width */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-emerald-500/30 via-teal-500/20 to-transparent rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: '4s' }}
          />
          <div
            className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-500/20 via-green-500/10 to-transparent rounded-full blur-3xl animate-pulse"
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
                <Layers className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-white/90">Organizacao do Sistema</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Gerenciar <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Categorias</span>
              </h1>
              <p className="text-slate-300 max-w-lg">
                Organize as categorias e subcategorias de servicos da plataforma.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => openModal()}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-2xl hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Plus className="w-5 h-5" />
                Nova Categoria
              </button>
              <button
                onClick={() => loadCategories()}
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
              { value: stats.total, label: 'Principais', icon: Layers, color: 'from-emerald-500 to-teal-500' },
              { value: stats.subcategories, label: 'Subcategorias', icon: FolderTree, color: 'from-cyan-500 to-blue-500' },
              { value: stats.active, label: 'Ativas', icon: Check, color: 'from-green-500 to-emerald-500' },
              { value: stats.services, label: 'Servicos', icon: Grid3X3, color: 'from-amber-500 to-orange-500' },
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
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
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

          {/* Sidebar - Quick Nav */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-4">
              {/* Search */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                  />
                </div>
              </div>

              {/* Quick Jump */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-900">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <FolderTree className="w-4 h-4 text-emerald-400" />
                    Navegacao Rapida
                  </h3>
                </div>
                <div className="p-2 max-h-[400px] overflow-y-auto">
                  {categories.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">Sem categorias</p>
                  ) : (
                    <div className="space-y-1">
                      {categories.map((cat) => (
                        <div key={cat.id}>
                          <button
                            onClick={() => {
                              document.getElementById(`cat-${cat.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                              setExpandedCategories(prev => ({ ...prev, [cat.id]: true }))
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded-lg hover:bg-emerald-50 transition-colors group"
                          >
                            <span className={`w-2 h-2 rounded-full ${cat.active ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                            <span className="flex-1 truncate text-gray-700 group-hover:text-emerald-700">{cat.name}</span>
                            <span className="text-xs text-gray-400">{cat.children?.length || 0}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Legend */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-4">
                <h4 className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-3">Legenda</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-gray-600">Categoria ativa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-gray-300" />
                    <span className="text-gray-600">Categoria inativa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-amber-400" />
                    <span className="text-gray-600">Com servicos</span>
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
                  <div className="w-12 h-12 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin mx-auto" />
                  <p className="mt-4 text-gray-500">Carregando categorias...</p>
                </div>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 text-center py-20">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Tag className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {searchTerm ? 'Nenhum resultado' : 'Nenhuma categoria'}
                </h3>
                <p className="text-gray-400 mb-6">
                  {searchTerm ? 'Tente uma busca diferente' : 'Comece criando sua primeira categoria de servicos'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => openModal()}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Criar Categoria
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredCategories.map((category, catIndex) => (
                  <div
                    key={category.id}
                    id={`cat-${category.id}`}
                    className="group"
                  >
                    {/* Category Card */}
                    <div className={`bg-white rounded-2xl border-2 transition-all duration-300 ${
                      category.active
                        ? 'border-gray-200 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/10'
                        : 'border-gray-200 opacity-75'
                    }`}>
                      {/* Category Header */}
                      <div className="p-6">
                        <div className="flex items-start gap-5">
                          {/* Category Number/Icon */}
                          <div className="relative">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl ${
                              category.active
                                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30'
                                : 'bg-gray-400'
                            }`}>
                              {category.icon ? category.icon.slice(0, 2).toUpperCase() : (catIndex + 1).toString().padStart(2, '0')}
                            </div>
                            {category.active && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
                            )}
                          </div>

                          {/* Category Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                              {!category.active && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-500 rounded-md">
                                  Inativa
                                </span>
                              )}
                            </div>
                            {category.description && (
                              <p className="text-gray-500 text-sm mb-3">{category.description}</p>
                            )}

                            {/* Stats Row */}
                            <div className="flex items-center gap-6 text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                  <FolderTree className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-900">{category.children?.length || 0}</span>
                                  <span className="text-gray-500 ml-1">subs</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                  <Layers className="w-4 h-4 text-amber-600" />
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-900">{getTotalServices(category)}</span>
                                  <span className="text-gray-500 ml-1">servicos</span>
                                </div>
                              </div>
                              {getTotalServices(category) > 0 && (
                                <div className="flex-1 max-w-32">
                                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                                      style={{ width: `${Math.min((getTotalServices(category) / 50) * 100, 100)}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openModal(null, category.id)}
                              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-xl hover:bg-emerald-100 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              <span className="hidden sm:inline">Sub</span>
                            </button>
                            <button
                              onClick={() => toggleActive(category)}
                              className={`p-2.5 rounded-xl transition-colors ${
                                category.active
                                  ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                              }`}
                              title={category.active ? 'Desativar' : 'Ativar'}
                            >
                              {category.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                            </button>
                            <button
                              onClick={() => openModal(category)}
                              className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                              <Edit3 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => confirmDelete(category)}
                              className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              disabled={getTotalServices(category) > 0 || (category.children?.length || 0) > 0}
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                            {category.children?.length > 0 && (
                              <button
                                onClick={() => toggleExpand(category.id)}
                                className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors ml-2"
                              >
                                <ChevronRight className={`w-5 h-5 transition-transform duration-200 ${expandedCategories[category.id] ? 'rotate-90' : ''}`} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Subcategories */}
                      {expandedCategories[category.id] && category.children?.length > 0 && (
                        <div className="border-t border-gray-100">
                          <div className="p-4 bg-gradient-to-b from-gray-50 to-white">
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {category.children.map((child) => (
                                <div
                                  key={child.id}
                                  className={`relative p-4 rounded-xl border-2 transition-all ${
                                    child.active
                                      ? 'bg-white border-gray-200 hover:border-emerald-200 hover:shadow-md'
                                      : 'bg-gray-50 border-gray-200 opacity-60'
                                  }`}
                                >
                                  {/* Status Indicator */}
                                  <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${child.active ? 'bg-emerald-500' : 'bg-gray-300'}`} />

                                  <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                      child.active
                                        ? 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700'
                                        : 'bg-gray-200 text-gray-400'
                                    }`}>
                                      {child.icon ? (
                                        <span className="text-xs font-bold">{child.icon.slice(0, 2).toUpperCase()}</span>
                                      ) : (
                                        <Tag className="w-4 h-4" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-gray-900 text-sm truncate">{child.name}</h4>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-xs px-2 py-0.5 rounded-md ${
                                          child.services_count > 0
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'bg-gray-100 text-gray-500'
                                        }`}>
                                          {child.services_count || 0} servicos
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
                                    <button
                                      onClick={() => toggleActive(child)}
                                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                        child.active
                                          ? 'text-amber-600 hover:bg-amber-50'
                                          : 'text-emerald-600 hover:bg-emerald-50'
                                      }`}
                                    >
                                      {child.active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                                      {child.active ? 'Desativar' : 'Ativar'}
                                    </button>
                                    <button
                                      onClick={() => openModal(child)}
                                      className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                      Editar
                                    </button>
                                    <button
                                      onClick={() => confirmDelete(child)}
                                      className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                                      disabled={(child.services_count || 0) > 0}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      Excluir
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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
                {editingCategory ? 'Editar Categoria' : formData.parent_id ? 'Nova Subcategoria' : 'Nova Categoria'}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Manutencao Predial"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoria Pai</label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                  value={formData.parent_id}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                >
                  <option value="">-- Categoria Principal --</option>
                  {categories.map((cat) => (
                    <option
                      key={cat.id}
                      value={cat.id}
                      disabled={editingCategory && cat.id === editingCategory.id}
                    >
                      {cat.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Deixe vazio para criar uma categoria principal</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icone</label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                >
                  <option value="">-- Selecione um icone --</option>
                  {ICONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
                {formData.icon && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <span className="text-emerald-600 text-sm font-bold">{formData.icon.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <span className="text-sm text-gray-500">Icone: {formData.icon}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descricao</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descricao opcional da categoria"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ordem</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    min="0"
                  />
                  <p className="text-xs text-gray-400 mt-1">Menor numero aparece primeiro</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <label className="flex items-center gap-3 mt-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-700">Categoria ativa</span>
                  </label>
                </div>
              </div>

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
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-medium rounded-xl hover:from-emerald-700 hover:to-teal-600 transition-all"
                >
                  {editingCategory ? 'Salvar Alteracoes' : 'Criar Categoria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Excluir Categoria</h3>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir a categoria <strong>"{categoryToDelete.name}"</strong>? Esta acao nao pode ser desfeita.
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
