import { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMyServices, createService, updateService, deleteService, fetchCategories } from '../../store/slices/servicesSlice'
import api from '../../services/api'
import toast from 'react-hot-toast'
import {
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  X,
  Upload,
  Star,
  Eye,
  MessageSquare,
  MoreVertical,
  Check,
  Briefcase,
  TrendingUp,
  Zap,
  Search,
  Filter,
  Grid3X3,
  List,
  ChevronRight,
  MapPin,
  Tag,
  DollarSign,
  Clock,
  ArrowUpRight,
  Sparkles,
  Camera,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function MyServices() {
  const dispatch = useDispatch()
  const { myServices, categories, loading } = useSelector((state) => state.services)
  const [showModal, setShowModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const [serviceToDelete, setServiceToDelete] = useState(null)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    region: '',
    price_range: '',
    tags: [],
    estimated_time: '',
    includes: '',
  })
  const [tagInput, setTagInput] = useState('')
  const [pendingImages, setPendingImages] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const fileInputRef = useRef(null)
  const formImageInputRef = useRef(null)

  useEffect(() => {
    dispatch(fetchMyServices())
    dispatch(fetchCategories())
  }, [dispatch])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Filter services
  const filteredServices = myServices.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || service.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Stats
  const stats = {
    total: myServices.length,
    active: myServices.filter(s => s.status === 'ativo').length,
    inactive: myServices.filter(s => s.status !== 'ativo').length,
    views: myServices.reduce((acc, s) => acc + (s.views_count || 0), 0),
    deals: myServices.reduce((acc, s) => acc + (s.deals_count || 0), 0),
    featured: myServices.filter(s => s.featured).length,
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingService) {
        await dispatch(updateService({ id: editingService.id, data: formData })).unwrap()
        // Upload pending images for existing service
        if (pendingImages.length > 0) {
          await uploadPendingImages(editingService.id)
        }
        toast.success('Servico atualizado!')
      } else {
        const result = await dispatch(createService(formData)).unwrap()
        // Upload pending images for new service
        if (pendingImages.length > 0 && result?.id) {
          await uploadPendingImages(result.id)
          toast.success('Servico criado com imagens!')
        } else {
          toast.success('Servico criado!')
        }
      }
      closeModal()
    } catch (error) {
      toast.error(error || 'Erro ao salvar servico')
    }
  }

  const uploadPendingImages = async (serviceId) => {
    if (pendingImages.length === 0) return

    const uploadFormData = new FormData()
    pendingImages.forEach(file => {
      uploadFormData.append('images[]', file)
    })

    try {
      await api.post(`/services/${serviceId}/images`, uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      dispatch(fetchMyServices())
    } catch (error) {
      toast.error('Erro ao enviar algumas imagens')
    }
  }

  const handleFormImageSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Limit to 10 images total
    const remainingSlots = 10 - pendingImages.length
    const filesToAdd = files.slice(0, remainingSlots)

    setPendingImages(prev => [...prev, ...filesToAdd])

    // Create preview URLs
    filesToAdd.forEach(file => {
      const url = URL.createObjectURL(file)
      setPreviewUrls(prev => [...prev, url])
    })

    if (formImageInputRef.current) {
      formImageInputRef.current.value = ''
    }
  }

  const removePendingImage = (index) => {
    setPendingImages(prev => prev.filter((_, i) => i !== index))
    URL.revokeObjectURL(previewUrls[index])
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleDelete = async () => {
    if (!serviceToDelete) return
    try {
      await dispatch(deleteService(serviceToDelete.id)).unwrap()
      toast.success('Servico excluido!')
      setShowDeleteModal(false)
      setServiceToDelete(null)
    } catch (error) {
      toast.error(error || 'Erro ao excluir')
    }
  }

  const confirmDelete = (service) => {
    setServiceToDelete(service)
    setShowDeleteModal(true)
  }

  const openModal = (service = null) => {
    // Clear pending images
    previewUrls.forEach(url => URL.revokeObjectURL(url))
    setPendingImages([])
    setPreviewUrls([])

    if (service) {
      setEditingService(service)
      setFormData({
        title: service.title,
        description: service.description,
        category_id: String(service.category_id),
        region: service.region,
        price_range: service.price_range,
        tags: service.tags || [],
        estimated_time: service.estimated_time || '',
        includes: service.includes || '',
      })
    } else {
      setEditingService(null)
      setFormData({
        title: '',
        description: '',
        category_id: '',
        region: '',
        price_range: '',
        tags: [],
        estimated_time: '',
        includes: '',
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingService(null)
    // Clear pending images
    previewUrls.forEach(url => URL.revokeObjectURL(url))
    setPendingImages([])
    setPreviewUrls([])
  }

  const openImageModal = (service) => {
    setSelectedService(service)
    setShowImageModal(true)
  }

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] })
      }
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    })
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0 || !selectedService) return

    const uploadFormData = new FormData()
    files.forEach(file => {
      uploadFormData.append('images[]', file)
    })

    setUploadingImages(true)
    try {
      await api.post(`/services/${selectedService.id}/images`, uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success(`${files.length} imagem(ns) enviada(s)!`)
      dispatch(fetchMyServices())

      const updatedServices = await dispatch(fetchMyServices()).unwrap()
      const updated = updatedServices.data.find(s => s.id === selectedService.id)
      if (updated) setSelectedService(updated)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao enviar imagens')
    } finally {
      setUploadingImages(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteImage = async (imageId) => {
    if (!selectedService) return
    try {
      await api.delete(`/services/${selectedService.id}/images/${imageId}`)
      toast.success('Imagem removida!')
      dispatch(fetchMyServices())

      const updatedServices = await dispatch(fetchMyServices()).unwrap()
      const updated = updatedServices.data.find(s => s.id === selectedService.id)
      if (updated) setSelectedService(updated)
    } catch (error) {
      toast.error('Erro ao remover imagem')
    }
  }

  const handleSetCover = async (imageId) => {
    if (!selectedService) return
    try {
      await api.patch(`/services/${selectedService.id}/images/${imageId}/cover`)
      toast.success('Imagem de capa atualizada!')
      dispatch(fetchMyServices())

      const updatedServices = await dispatch(fetchMyServices()).unwrap()
      const updated = updatedServices.data.find(s => s.id === selectedService.id)
      if (updated) setSelectedService(updated)
    } catch (error) {
      toast.error('Erro ao definir capa')
    }
  }

  const toggleStatus = async (service) => {
    try {
      await dispatch(updateService({
        id: service.id,
        data: { status: service.status === 'ativo' ? 'inativo' : 'ativo' }
      })).unwrap()
      toast.success(`Servico ${service.status === 'ativo' ? 'desativado' : 'ativado'}!`)
    } catch (error) {
      toast.error('Erro ao alterar status')
    }
  }

  const getCoverImage = (service) => {
    if (!service.images || service.images.length === 0) return null
    const cover = service.images.find(img => img.is_cover) || service.images[0]
    return cover?.url || (cover?.path ? `${API_BASE}/storage/${cover.path}` : null)
  }

  const getImageUrl = (image) => {
    return image?.url || (image?.path ? `${API_BASE}/storage/${image.path}` : null)
  }

  const toggleDropdown = (e, serviceId) => {
    e.stopPropagation()
    setActiveDropdown(activeDropdown === serviceId ? null : serviceId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header - Full Width */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-violet-500/30 via-blue-500/20 to-transparent rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: '4s' }}
          />
          <div
            className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-transparent rounded-full blur-3xl animate-pulse"
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
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-white/90">Gestao de Servicos</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Meus <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Servicos</span>
              </h1>
              <p className="text-slate-300 max-w-lg">
                Gerencie seus servicos, adicione fotos e atraia mais clientes para seu negocio.
              </p>
            </div>

            <button
              onClick={() => openModal()}
              className="group relative px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3 self-start lg:self-center"
            >
              <Plus className="w-5 h-5" />
              <span>Novo Servico</span>
              <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
            {[
              { label: 'Total', value: stats.total, icon: Briefcase, color: 'from-slate-500 to-slate-600' },
              { label: 'Ativos', value: stats.active, icon: CheckCircle, color: 'from-emerald-500 to-teal-500' },
              { label: 'Inativos', value: stats.inactive, icon: AlertCircle, color: 'from-gray-500 to-gray-600' },
              { label: 'Visualizacoes', value: stats.views, icon: Eye, color: 'from-blue-500 to-cyan-500' },
              { label: 'Negociacoes', value: stats.deals, icon: MessageSquare, color: 'from-violet-500 to-purple-500' },
              { label: 'Destaques', value: stats.featured, icon: Star, color: 'from-amber-500 to-orange-500' },
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
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar servicos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              >
                <option value="all">Todos</option>
                <option value="ativo">Ativos</option>
                <option value="inativo">Inativos</option>
              </select>
              <div className="flex items-center bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid/List */}
        {loading ? (
          <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse border border-gray-100">
                <div className="h-48 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-gray-200 rounded-lg w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 py-20">
            <div className="text-center max-w-md mx-auto px-4">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchTerm || filterStatus !== 'all' ? 'Nenhum servico encontrado' : 'Nenhum servico cadastrado'}
              </h3>
              <p className="text-gray-500 mb-8">
                {searchTerm || filterStatus !== 'all'
                  ? 'Tente ajustar os filtros ou termo de busca.'
                  : 'Cadastre seus servicos e adicione fotos para atrair mais clientes.'}
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <button
                  onClick={() => openModal()}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
                >
                  <Plus className="h-5 w-5" />
                  Cadastrar Primeiro Servico
                </button>
              )}
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service) => (
              <ServiceCardGrid
                key={service.id}
                service={service}
                getCoverImage={getCoverImage}
                openImageModal={openImageModal}
                openModal={openModal}
                toggleDropdown={toggleDropdown}
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
                toggleStatus={toggleStatus}
                confirmDelete={confirmDelete}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredServices.map((service) => (
              <ServiceCardList
                key={service.id}
                service={service}
                getCoverImage={getCoverImage}
                openImageModal={openImageModal}
                openModal={openModal}
                toggleStatus={toggleStatus}
                confirmDelete={confirmDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Service Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
              <div className="sticky top-0 bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    {editingService ? <Edit2 className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {editingService ? 'Editar Servico' : 'Novo Servico'}
                  </h3>
                </div>
                <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X className="h-5 w-5 text-white/70" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-80px)]">
                {/* Image Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Camera className="w-4 h-4 inline mr-1" />
                    Fotos do Servico
                  </label>
                  <div
                    className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-emerald-400 hover:bg-gray-50 transition-all"
                    onClick={() => formImageInputRef.current?.click()}
                  >
                    <input
                      ref={formImageInputRef}
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      className="hidden"
                      onChange={handleFormImageSelect}
                    />
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Clique para adicionar fotos</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG ou WEBP. Maximo 5MB cada.</p>
                  </div>

                  {/* Preview of pending images */}
                  {previewUrls.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative group rounded-lg overflow-hidden bg-gray-100">
                          <img src={url} alt="" className="w-full h-16 object-cover" />
                          <button
                            type="button"
                            onClick={() => removePendingImage(index)}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Show existing images if editing */}
                  {editingService?.images?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-2">Imagens existentes ({editingService.images.length})</p>
                      <div className="grid grid-cols-4 gap-2">
                        {editingService.images.slice(0, 4).map((img) => (
                          <div key={img.id} className="relative rounded-lg overflow-hidden bg-gray-100">
                            <img src={getImageUrl(img)} alt="" className="w-full h-16 object-cover" />
                            {img.is_cover && (
                              <div className="absolute top-1 left-1">
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                              </div>
                            )}
                          </div>
                        ))}
                        {editingService.images.length > 4 && (
                          <div className="flex items-center justify-center h-16 bg-gray-100 rounded-lg text-xs text-gray-500">
                            +{editingService.images.length - 4}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => { closeModal(); openImageModal(editingService); }}
                        className="text-sm text-emerald-600 hover:text-emerald-700 mt-2"
                      >
                        Gerenciar todas as fotos
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titulo do Servico *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Manutencao Eletrica Residencial"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descricao *
                  </label>
                  <textarea
                    placeholder="Descreva seu servico em detalhes: o que inclui, diferenciais, experiencia..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map((cat) => (
                      <optgroup key={cat.id} label={cat.name}>
                        {cat.children?.map((child) => (
                          <option key={child.id} value={String(child.id)}>
                            {child.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Regiao *
                    </label>
                    <input
                      type="text"
                      placeholder="Sao Paulo - SP"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Faixa de Preco *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 500-1500 ou A partir de 200"
                      value={formData.price_range}
                      onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Tempo Estimado
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 2-3 dias, 1 semana"
                      value={formData.estimated_time}
                      onChange={(e) => setFormData({ ...formData, estimated_time: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      O que inclui
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Material, mao de obra"
                      value={formData.includes}
                      onChange={(e) => setFormData({ ...formData, includes: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="w-4 h-4 inline mr-1" />
                    Tags (Enter para adicionar)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: eletrica, residencial, urgente"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-full"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-emerald-900 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
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
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    {pendingImages.length > 0 && <ImageIcon className="w-4 h-4" />}
                    {editingService ? 'Salvar' : 'Criar Servico'}
                    {pendingImages.length > 0 && <span className="text-emerald-100">({pendingImages.length} fotos)</span>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Image Management Modal */}
      {showImageModal && selectedService && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowImageModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="sticky top-0 bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Fotos do Servico</h3>
                    <p className="text-sm text-white/60 truncate max-w-[250px]">{selectedService?.title}</p>
                  </div>
                </div>
                <button onClick={() => setShowImageModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X className="h-5 w-5 text-white/70" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                {/* Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                    uploadingImages
                      ? 'border-emerald-400 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-400 hover:bg-gray-50'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploadingImages}
                  />
                  {uploadingImages ? (
                    <div className="space-y-3">
                      <div className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-sm font-medium text-emerald-600">Enviando imagens...</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Upload className="h-8 w-8 text-emerald-600" />
                      </div>
                      <p className="font-semibold text-gray-900 mb-1">Clique ou arraste imagens</p>
                      <p className="text-sm text-gray-500">
                        JPG, PNG ou WEBP. Maximo 5MB. Ate 10 imagens.
                      </p>
                    </>
                  )}
                </div>

                {/* Images Grid */}
                {selectedService?.images && selectedService.images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                    {selectedService.images.map((image) => (
                      <div key={image.id} className="relative group rounded-2xl overflow-hidden bg-gray-100">
                        <img
                          src={getImageUrl(image)}
                          alt={image.original_name || 'Imagem do servico'}
                          className="w-full h-36 object-cover"
                        />

                        {image.is_cover && (
                          <div className="absolute top-2 left-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full shadow-lg">
                              <Star className="h-3 w-3 fill-current" />
                              Capa
                            </span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                          {!image.is_cover && (
                            <button
                              onClick={() => handleSetCover(image.id)}
                              className="p-2.5 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
                              title="Definir como capa"
                            >
                              <Star className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteImage(image.id)}
                            className="p-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-lg"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">Nenhuma imagem adicionada</p>
                    <p className="text-sm">Adicione fotos para destacar seu servico</p>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setShowImageModal(false)}
                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteModal && serviceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Excluir Servico</h3>
            <p className="text-gray-500 text-center mb-6">
              Tem certeza que deseja excluir <span className="font-semibold text-gray-900">"{serviceToDelete?.title}"</span>?
              Esta acao nao pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors"
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

// Service Card - Grid View
function ServiceCardGrid({
  service,
  getCoverImage,
  openImageModal,
  openModal,
  toggleDropdown,
  activeDropdown,
  setActiveDropdown,
  toggleStatus,
  confirmDelete
}) {
  const coverImage = getCoverImage(service)
  const imagesCount = service.images?.length || 0

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl hover:border-gray-200 transition-all duration-300">
      {/* Image/Cover */}
      <div
        className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 cursor-pointer overflow-hidden"
        onClick={() => openImageModal(service)}
      >
        {coverImage ? (
          <img
            src={coverImage}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <Camera className="h-12 w-12 mb-2" />
            <span className="text-sm font-medium">Adicionar fotos</span>
          </div>
        )}

        {imagesCount > 0 && (
          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs px-2.5 py-1.5 rounded-full flex items-center gap-1.5">
            <ImageIcon className="h-3.5 w-3.5" />
            {imagesCount}
          </div>
        )}

        <div className="absolute top-3 right-3 flex items-center gap-2">
          {service.featured && (
            <span className="px-2.5 py-1 text-xs font-semibold bg-amber-500 text-white rounded-full flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" />
              Destaque
            </span>
          )}
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
            service.status === 'ativo'
              ? 'bg-emerald-500 text-white'
              : 'bg-gray-500 text-white'
          }`}>
            {service.status === 'ativo' ? 'Ativo' : 'Inativo'}
          </span>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-end justify-center pb-4 gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); openImageModal(service) }}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-gray-900 text-sm font-medium rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
          >
            <Camera className="h-4 w-4" />
            Fotos
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openModal(service) }}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-gray-900 text-sm font-medium rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
          >
            <Edit2 className="h-4 w-4" />
            Editar
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-bold text-gray-900 line-clamp-1 text-lg">{service.title}</h3>
          <div className="relative flex-shrink-0">
            <button
              onClick={(e) => toggleDropdown(e, service.id)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="h-5 w-5 text-gray-400" />
            </button>
            {activeDropdown === service.id && (
              <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-xl z-10 overflow-hidden">
                <button
                  onClick={() => { openModal(service); setActiveDropdown(null) }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={() => { openImageModal(service); setActiveDropdown(null) }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                  Gerenciar Fotos
                </button>
                <button
                  onClick={() => { toggleStatus(service); setActiveDropdown(null) }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {service.status === 'ativo' ? (
                    <><X className="h-4 w-4" />Desativar</>
                  ) : (
                    <><Check className="h-4 w-4" />Ativar</>
                  )}
                </button>
                <hr className="my-1" />
                <button
                  onClick={() => { confirmDelete(service); setActiveDropdown(null) }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
          {service.description}
        </p>

        {service.category && (
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
              {service.category.name}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-gray-500">
            <MapPin className="h-4 w-4" />
            {service.region}
          </span>
          <span className="font-bold text-emerald-600">
            R$ {service.price_range}
          </span>
        </div>

        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-gray-500">
            <Eye className="h-4 w-4" />
            <span className="text-sm font-medium">{service.views_count || 0}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500">
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm font-medium">{service.deals_count || 0}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Service Card - List View
function ServiceCardList({
  service,
  getCoverImage,
  openImageModal,
  openModal,
  toggleStatus,
  confirmDelete
}) {
  const coverImage = getCoverImage(service)
  const imagesCount = service.images?.length || 0

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all">
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div
          className="relative w-full sm:w-48 h-40 sm:h-auto bg-gradient-to-br from-gray-100 to-gray-200 cursor-pointer flex-shrink-0"
          onClick={() => openImageModal(service)}
        >
          {coverImage ? (
            <img
              src={coverImage}
              alt={service.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
              <Camera className="h-8 w-8 mb-1" />
              <span className="text-xs">Adicionar foto</span>
            </div>
          )}
          {imagesCount > 0 && (
            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <ImageIcon className="h-3 w-3" />
              {imagesCount}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-gray-900 truncate">{service.title}</h3>
                {service.featured && (
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">{service.description}</p>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                {service.category && (
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                    {service.category.name}
                  </span>
                )}
                <span className="flex items-center gap-1 text-gray-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {service.region}
                </span>
                <span className="font-bold text-emerald-600">R$ {service.price_range}</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                service.status === 'ativo'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {service.status === 'ativo' ? 'Ativo' : 'Inativo'}
              </span>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {service.views_count || 0}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {service.deals_count || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => openModal(service)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Edit2 className="h-4 w-4" />
              Editar
            </button>
            <button
              onClick={() => openImageModal(service)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Camera className="h-4 w-4" />
              Fotos
            </button>
            <button
              onClick={() => toggleStatus(service)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {service.status === 'ativo' ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
              {service.status === 'ativo' ? 'Desativar' : 'Ativar'}
            </button>
            <button
              onClick={() => confirmDelete(service)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-auto"
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
