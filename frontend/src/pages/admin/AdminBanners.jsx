import { useEffect, useState } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'

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
    } catch (error) {
      console.error('Erro ao carregar banners:', error)
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
        await api.post(`/admin/banners/${editingBanner.id}?_method=PUT`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Banner atualizado!')
      } else {
        await api.post('/admin/banners', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
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
        toast.success('Banner excluído!')
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gerenciar Banners</h1>
        <button onClick={() => openModal()} className="btn-primary">
          + Novo Banner
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : banners.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">Nenhum banner cadastrado</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {banners.map((banner) => (
            <div key={banner.id} className="card flex gap-4">
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
                  <h3 className="font-semibold">{banner.title}</h3>
                  <span className={`badge ${banner.active ? 'badge-success' : 'badge-danger'}`}>
                    {banner.active ? 'Ativo' : 'Inativo'}
                  </span>
                  <span className="badge badge-info">{banner.position}</span>
                  <span className="badge badge-warning">{banner.type}</span>
                </div>
                <p className="text-gray-500 text-sm">{banner.description}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Cliques: {banner.clicks} | Visualizações: {banner.views} |
                  CTR: {banner.views > 0 ? ((banner.clicks / banner.views) * 100).toFixed(2) : 0}%
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openModal(banner)} className="btn-secondary text-sm">
                  Editar
                </button>
                <button onClick={() => handleDelete(banner.id)} className="btn-danger text-sm">
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-semibold mb-4">
              {editingBanner ? 'Editar Banner' : 'Novo Banner'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Título</label>
                <input
                  type="text"
                  className="input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Descrição</label>
                <textarea
                  className="input"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Link (URL)</label>
                <input
                  type="url"
                  className="input"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Imagem {!editingBanner && '*'}</label>
                <input
                  type="file"
                  accept="image/*"
                  className="input"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  required={!editingBanner}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Posição</label>
                  <select
                    className="input"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  >
                    <option value="topo">Topo</option>
                    <option value="lateral">Lateral</option>
                    <option value="rodape">Rodapé</option>
                    <option value="modal">Modal</option>
                  </select>
                </div>
                <div>
                  <label className="label">Tipo</label>
                  <select
                    className="input"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="comercial">Comercial</option>
                    <option value="admin">Admin</option>
                    <option value="promocional">Promocional</option>
                  </select>
                </div>
                <div>
                  <label className="label">Ordem</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={closeModal} className="flex-1 btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 btn-primary">
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
