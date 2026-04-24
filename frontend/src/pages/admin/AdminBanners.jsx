import { useEffect, useState } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import {
  Plus,
  Image as ImageIcon,
  X,
  Edit3,
  Trash2,
  Eye,
  MousePointer,
  BarChart3,
  RefreshCw,
  Upload,
  Link as LinkIcon,
  Layout,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
} from 'lucide-react'

export default function AdminBanners() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [bannerToDelete, setBannerToDelete] = useState(null)
  const [editingBanner, setEditingBanner] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    position: 'topo',
    type: 'comercial',
    order: 0,
    active: true,
  })
  const [imageFile, setImageFile] = useState(null)

  useEffect(() => {
    loadBanners()
  }, [])

  const loadBanners = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/banners')
      setBanners(response.data.data)
    } catch (_error) {
      toast.error('Erro ao carregar banners')
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
    } catch (_error) {
      toast.error('Erro ao salvar banner')
    }
  }

  const handleDelete = async () => {
    if (!bannerToDelete) return
    try {
      await api.delete(`/admin/banners/${bannerToDelete.id}`)
      toast.success('Banner excluido!')
      setShowDeleteModal(false)
      setBannerToDelete(null)
      loadBanners()
    } catch (_error) {
      toast.error('Erro ao excluir banner')
    }
  }

  const toggleBannerActive = async (banner) => {
    try {
      const data = new FormData()
      data.append('active', !banner.active ? '1' : '0')
      await api.post(`/admin/banners/${banner.id}?_method=PUT`, data)
      toast.success(`Banner ${!banner.active ? 'ativado' : 'desativado'}!`)
      loadBanners()
    } catch (_error) {
      toast.error('Erro ao atualizar banner')
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
        active: banner.active,
      })
      if (banner.image_path) {
        setPreviewUrl(`/storage/${banner.image_path}`)
      }
    } else {
      setEditingBanner(null)
      setFormData({
        title: '',
        description: '',
        link: '',
        position: 'topo',
        type: 'comercial',
        order: 0,
        active: true,
      })
      setPreviewUrl(null)
    }
    setImageFile(null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingBanner(null)
    setImageFile(null)
    setPreviewUrl(null)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
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
      comercial: 'bg-amber-100 text-amber-700',
      admin: 'bg-red-100 text-red-700',
      promocional: 'bg-green-100 text-green-700',
    }
    return styles[type] || 'bg-gray-100 text-gray-700'
  }

  const getPositionLabel = (position) => {
    const labels = { topo: 'Topo', lateral: 'Lateral', rodape: 'Rodape', modal: 'Modal' }
    return labels[position] || position
  }

  const getTypeLabel = (type) => {
    const labels = { comercial: 'Comercial', admin: 'Admin', promocional: 'Promocional' }
    return labels[type] || type
  }

  const stats = {
    total: banners.length,
    active: banners.filter(b => b.active).length,
    totalClicks: banners.reduce((acc, b) => acc + (b.clicks || 0), 0),
    totalViews: banners.reduce((acc, b) => acc + (b.views || 0), 0),
  }

  const avgCTR = stats.totalViews > 0 ? ((stats.totalClicks / stats.totalViews) * 100).toFixed(2) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header - Full Width */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-amber-500/30 via-orange-500/20 to-transparent rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: '4s' }}
          />
          <div
            className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-yellow-500/20 via-red-500/10 to-transparent rounded-full blur-3xl animate-pulse"
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
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-white/90">Marketing e Publicidade</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Gerenciar <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Banners</span>
              </h1>
              <p className="text-slate-300 max-w-lg">
                Crie e gerencie banners publicitarios. Acompanhe cliques e conversao.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => openModal()}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-2xl hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Plus className="w-5 h-5" />
                Novo Banner
              </button>
              <button
                onClick={() => loadBanners()}
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
              { value: stats.total, label: 'Banners', icon: Layout, color: 'from-amber-500 to-orange-500' },
              { value: stats.totalViews.toLocaleString(), label: 'Visualizacoes', icon: Eye, color: 'from-green-500 to-emerald-500' },
              { value: stats.totalClicks.toLocaleString(), label: 'Cliques', icon: MousePointer, color: 'from-blue-500 to-cyan-500' },
              { value: `${avgCTR}%`, label: 'CTR', icon: BarChart3, color: 'from-purple-500 to-pink-500' },
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

          {/* Sidebar */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-4">
              {/* Performance Overview */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Performance
                  </h3>
                </div>
                <div className="p-4">
                  <div className="text-center mb-4">
                    <p className="text-4xl font-bold text-gray-900">{avgCTR}%</p>
                    <p className="text-sm text-gray-500">Taxa de Cliques (CTR)</p>
                  </div>
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Visualizacoes</span>
                      <span className="font-semibold text-gray-900">{stats.totalViews.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Cliques</span>
                      <span className="font-semibold text-gray-900">{stats.totalClicks.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Ativos</span>
                      <span className="font-semibold text-green-600">{stats.active}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-4">
                <h4 className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-3">Acoes</h4>
                <button
                  onClick={() => openModal()}
                  className="w-full flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-xl hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Novo Banner
                </button>
              </div>

              {/* Position Legend */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Posicoes</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-blue-500" />
                    <span className="text-gray-600">Topo da pagina</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-purple-500" />
                    <span className="text-gray-600">Lateral</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-gray-500" />
                    <span className="text-gray-600">Rodape</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-orange-500" />
                    <span className="text-gray-600">Modal popup</span>
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
                  <div className="w-12 h-12 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin mx-auto" />
                  <p className="mt-4 text-gray-500">Carregando banners...</p>
                </div>
              </div>
            ) : banners.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 text-center py-20">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <ImageIcon className="w-10 h-10 text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum banner cadastrado</h3>
                <p className="text-gray-400 mb-6">Crie seu primeiro banner publicitario</p>
                <button
                  onClick={() => openModal()}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Criar Banner
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
            {banners.map((banner) => (
              <div key={banner.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden group hover:shadow-lg transition-all">
                {/* Banner Preview */}
                <div className="relative h-44 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  {banner.image_path ? (
                    <img
                      src={`/storage/${banner.image_path}`}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-300" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      banner.active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {banner.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  {/* Position & Type Badges */}
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-lg backdrop-blur-sm ${getPositionStyle(banner.position)}`}>
                      {getPositionLabel(banner.position)}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-lg backdrop-blur-sm ${getTypeStyle(banner.type)}`}>
                      {getTypeLabel(banner.type)}
                    </span>
                  </div>
                </div>

                {/* Banner Info */}
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">{banner.title}</h3>
                  {banner.description && (
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{banner.description}</p>
                  )}

                  {banner.link && (
                    <a
                      href={banner.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mb-4"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Ver link
                    </a>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 py-4 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{(banner.views || 0).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Views</p>
                    </div>
                    <div className="text-center border-x border-gray-100">
                      <p className="text-lg font-bold text-gray-900">{(banner.clicks || 0).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Cliques</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">
                        {banner.views > 0 ? ((banner.clicks / banner.views) * 100).toFixed(1) : 0}%
                      </p>
                      <p className="text-xs text-gray-500">CTR</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => openModal(banner)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => toggleBannerActive(banner)}
                      className={`p-2.5 rounded-xl transition-colors ${
                        banner.active
                          ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                          : 'text-green-600 bg-green-50 hover:bg-green-100'
                      }`}
                      title={banner.active ? 'Desativar' : 'Ativar'}
                    >
                      {banner.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => { setBannerToDelete(banner); setShowDeleteModal(true) }}
                      className="p-2.5 text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
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
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {editingBanner ? 'Editar Banner' : 'Novo Banner'}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem do Banner {!editingBanner && '*'}
                </label>
                <div className="relative">
                  {previewUrl ? (
                    <div className="relative h-40 bg-gray-100 rounded-xl overflow-hidden">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => { setPreviewUrl(null); setImageFile(null) }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-amber-500 transition-colors bg-gray-50">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Clique para fazer upload</span>
                      <span className="text-xs text-gray-400 mt-1">PNG, JPG ate 2MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                        required={!editingBanner}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titulo *</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Black Friday - 50% OFF"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descricao</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descricao opcional do banner"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link (URL)</label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="https://exemplo.com/promocao"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Posicao</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="comercial">Comercial</option>
                    <option value="admin">Admin</option>
                    <option value="promocional">Promocional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ordem</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
                <div>
                  <span className="text-sm font-medium text-gray-700 block">Banner Ativo</span>
                  <span className="text-xs text-gray-500">Exibir banner na plataforma</span>
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
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all"
                >
                  {editingBanner ? 'Salvar Alteracoes' : 'Criar Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && bannerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Excluir Banner</h3>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir o banner <strong>"{bannerToDelete.title}"</strong>? Esta acao nao pode ser desfeita.
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
