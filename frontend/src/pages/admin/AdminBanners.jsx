import { useEffect, useState } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Plus, Image as ImageIcon, X } from 'lucide-react'

export default function AdminBanners() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    position: 'topo',
    type: 'comercial',
    order: 0,
  })
  const [imageFile, setImageFile] = useState(null)

  useEffect(() => {
    loadBanners()
  }, [])

  const loadBanners = async () => {
    try {
      const response = await api.get('/admin/banners')
      setBanners(response.data.data)
    } catch (_error) {
      // Silently handle error loading banners
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = new FormData()
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          data.append(key, formData[key])
        }
      })
      if (imageFile) {
        data.append('image', imageFile)
      }

      if (editingBanner) {
        await api.post(`/admin/banners/${editingBanner.id}?_method=PUT`, data)
        toast.success('Banner atualizado!')
      } else {
        await api.post('/admin/banners', data)
        toast.success('Banner criado!')
      }
      closeModal()
      loadBanners()
    } catch (error) {
      toast.error('Erro ao salvar banner')
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja excluir este banner?')) {
      try {
        await api.delete(`/admin/banners/${id}`)
        toast.success('Banner excluido!')
        loadBanners()
      } catch (error) {
        toast.error('Erro ao excluir')
      }
    }
  }

  const openModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner)
      setFormData({
        title: banner.title,
        description: banner.description || '',
        link: banner.link || '',
        position: banner.position,
        type: banner.type,
        order: banner.order,
      })
    } else {
      setEditingBanner(null)
      setFormData({
        title: '',
        description: '',
        link: '',
        position: 'topo',
        type: 'comercial',
        order: 0,
      })
    }
    setImageFile(null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingBanner(null)
    setImageFile(null)
  }

  const getPositionStyle = (position) => {
    const styles = {
      topo: 'bg-blue-100 text-blue-700',
      lateral: 'bg-purple-100 text-purple-700',
      rodape: 'bg-gray-100 text-gray-700',
      modal: 'bg-orange-100 text-orange-700',
    }
    return styles[position] || 'bg-gray-100 text-gray-700'
  }

  const getTypeStyle = (type) => {
    const styles = {
      comercial: 'bg-yellow-100 text-yellow-700',
      admin: 'bg-red-100 text-red-700',
      promocional: 'bg-green-100 text-green-700',
    }
    return styles[type] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciar Banners</h1>
            <p className="text-gray-500 text-sm mt-1">Crie e gerencie banners publicitarios</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Banner
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white rounded-lg shadow text-center py-12">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum banner cadastrado</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-lg shadow p-4 flex gap-4">
              <div className="w-32 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                {banner.image_path && (
                  <img
                    src={`/storage/${banner.image_path}`}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{banner.title}</h3>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    banner.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {banner.active ? 'Ativo' : 'Inativo'}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPositionStyle(banner.position)}`}>
                    {banner.position}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getTypeStyle(banner.type)}`}>
                    {banner.type}
                  </span>
                </div>
                <p className="text-gray-500 text-sm">{banner.description}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Cliques: {banner.clicks} | Visualizacoes: {banner.views} |
                  CTR: {banner.views > 0 ? ((banner.clicks / banner.views) * 100).toFixed(2) : 0}%
                </p>
              </div>
              <div className="flex gap-2 items-start">
                <button
                  onClick={() => openModal(banner)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={closeModal} />
          <div className="relative bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingBanner ? 'Editar Banner' : 'Novo Banner'}
              </h3>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titulo</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descricao</label>
                <textarea
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link (URL)</label>
                <input
                  type="url"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagem {!editingBanner && '*'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  required={!editingBanner}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Posicao</label>
                  <select
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  >
                    <option value="topo">Topo</option>
                    <option value="lateral">Lateral</option>
                    <option value="rodape">Rodape</option>
                    <option value="modal">Modal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="comercial">Comercial</option>
                    <option value="admin">Admin</option>
                    <option value="promocional">Promocional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ordem</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
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
