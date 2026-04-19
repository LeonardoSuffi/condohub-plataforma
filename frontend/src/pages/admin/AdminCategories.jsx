import { useEffect, useState } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'

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
  const [editingCategory, setEditingCategory] = useState(null)
  const [expandedCategories, setExpandedCategories] = useState({})
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
      const response = await api.get('/admin/categories')
      setCategories(response.data.data)
      // Expand all categories by default
      const expanded = {}
      response.data.data.forEach(cat => {
        expanded[cat.id] = true
      })
      setExpandedCategories(expanded)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
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

  const handleDelete = async (category) => {
    const hasServices = category.services_count > 0
    const hasChildren = category.children?.length > 0

    if (hasServices) {
      toast.error(`Nao e possivel excluir. Existem ${category.services_count} servico(s) vinculado(s).`)
      return
    }

    if (hasChildren) {
      toast.error(`Nao e possivel excluir. Existem ${category.children.length} subcategoria(s) vinculada(s).`)
      return
    }

    if (confirm(`Tem certeza que deseja excluir "${category.name}"?`)) {
      try {
        await api.delete(`/admin/categories/${category.id}`)
        toast.success('Categoria excluida!')
        loadCategories()
      } catch (error) {
        const message = error.response?.data?.message || 'Erro ao excluir'
        toast.error(message)
      }
    }
  }

  const toggleActive = async (category) => {
    try {
      await api.put(`/admin/categories/${category.id}`, {
        active: !category.active
      })
      toast.success(`Categoria ${!category.active ? 'ativada' : 'desativada'}!`)
      loadCategories()
    } catch (error) {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Gerenciar Categorias</h1>
          <p className="text-gray-500 text-sm mt-1">
            Organize as categorias e subcategorias de servicos
          </p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          + Nova Categoria
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : categories.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">Nenhuma categoria cadastrada</p>
          <button onClick={() => openModal()} className="btn-primary mt-4">
            Criar primeira categoria
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="card">
              {/* Parent Category */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleExpand(category.id)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                >
                  {category.children?.length > 0 ? (
                    <svg className={`w-5 h-5 transition-transform ${expandedCategories[category.id] ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  ) : (
                    <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                  )}
                </button>

                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {category.icon ? (
                    <span className="text-gray-600 text-sm font-medium">{category.icon.slice(0, 2)}</span>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{category.name}</h3>
                    <span className={`badge ${category.active ? 'badge-success' : 'badge-danger'}`}>
                      {category.active ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">
                    {category.children?.length || 0} subcategorias | {getTotalServices(category)} servicos
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(null, category.id)}
                    className="btn-secondary text-sm"
                    title="Adicionar subcategoria"
                  >
                    + Sub
                  </button>
                  <button
                    onClick={() => toggleActive(category)}
                    className={`text-sm px-3 py-1.5 rounded ${category.active ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                  >
                    {category.active ? 'Desativar' : 'Ativar'}
                  </button>
                  <button onClick={() => openModal(category)} className="btn-secondary text-sm">
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(category)}
                    className="btn-danger text-sm"
                    disabled={getTotalServices(category) > 0 || (category.children?.length || 0) > 0}
                  >
                    Excluir
                  </button>
                </div>
              </div>

              {/* Subcategories */}
              {expandedCategories[category.id] && category.children?.length > 0 && (
                <div className="mt-4 ml-12 border-l-2 border-gray-100 pl-4 space-y-2">
                  {category.children.map((child) => (
                    <div key={child.id} className="flex items-center gap-4 py-2 px-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-white rounded flex items-center justify-center flex-shrink-0 border">
                        {child.icon ? (
                          <span className="text-gray-500 text-xs font-medium">{child.icon.slice(0, 2)}</span>
                        ) : (
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{child.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${child.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {child.active ? 'Ativa' : 'Inativa'}
                          </span>
                        </div>
                        <span className="text-gray-400 text-xs">{child.services_count || 0} servicos</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleActive(child)}
                          className={`text-xs px-2 py-1 rounded ${child.active ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                        >
                          {child.active ? 'Desativar' : 'Ativar'}
                        </button>
                        <button onClick={() => openModal(child)} className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(child)}
                          className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                          disabled={(child.services_count || 0) > 0}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingCategory ? 'Editar Categoria' : formData.parent_id ? 'Nova Subcategoria' : 'Nova Categoria'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Nome *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Manutencao Predial"
                  required
                />
              </div>

              <div>
                <label className="label">Categoria Pai (deixe vazio para categoria principal)</label>
                <select
                  className="input"
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
              </div>

              <div>
                <label className="label">Icone</label>
                <select
                  className="input"
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
                  <p className="text-sm text-gray-500 mt-1">Icone selecionado: {formData.icon}</p>
                )}
              </div>

              <div>
                <label className="label">Descricao</label>
                <textarea
                  className="input"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descricao opcional da categoria"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Ordem</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    min="0"
                  />
                  <p className="text-xs text-gray-400 mt-1">Menor numero aparece primeiro</p>
                </div>
                <div>
                  <label className="label">Status</label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="active"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="active" className="text-sm text-gray-700">
                      Categoria ativa
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  {editingCategory ? 'Salvar Alteracoes' : 'Criar Categoria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
