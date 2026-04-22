import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { updateProfile, clearError, setUser } from '../store/slices/authSlice'
import api from '../services/api'
import toast from 'react-hot-toast'
import { STORAGE_URL } from '../lib/config'
import {
  Camera,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Building2,
  MessageSquare,
  Edit3,
  Check,
  X,
  Award,
  ChevronRight,
  Loader2,
  Briefcase,
  Clock,
  CheckCircle,
  TrendingUp,
  Star,
  Shield,
  User,
  Settings,
  FileText,
  ExternalLink,
  ArrowUpRight,
  Zap,
  Target,
  Users,
  AlertCircle,
  ImageIcon,
  Upload,
} from 'lucide-react'

export default function Profile() {
  const dispatch = useDispatch()
  const { user, loading, error, initialized } = useSelector((state) => state.auth)
  const [isEditing, setIsEditing] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [stats, setStats] = useState({})
  const [recentDeals, setRecentDeals] = useState([])
  const [loadingStats, setLoadingStats] = useState(true)
  const photoInputRef = useRef(null)
  const coverInputRef = useRef(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nome_fantasia: '',
    segmento: '',
    telefone: '',
    cidade: '',
    estado: '',
    descricao: '',
  })

  useEffect(() => {
    if (user) {
      loadProfileData()
    }
  }, [user])

  useEffect(() => {
    if (user) {
      const data = {
        name: user.name || '',
        email: user.email || '',
      }

      if (user.type === 'empresa' && user.company_profile) {
        data.nome_fantasia = user.company_profile.nome_fantasia || ''
        data.segmento = user.company_profile.segmento || ''
        data.telefone = user.company_profile.telefone || ''
        data.cidade = user.company_profile.cidade || ''
        data.estado = user.company_profile.estado || ''
        data.descricao = user.company_profile.descricao || ''
      } else if (user.type === 'cliente' && user.client_profile) {
        data.telefone = user.client_profile.telefone || ''
      }

      setFormData(data)
    }
  }, [user])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const loadProfileData = async () => {
    setLoadingStats(true)
    try {
      const dealsRes = await api.get('/deals', { params: { per_page: 100 } })
      const deals = dealsRes.data?.data || []

      setStats({
        totalDeals: deals.length,
        dealsAbertos: deals.filter(d => d.status === 'aberto' || d.status === 'pending').length,
        dealsNegociando: deals.filter(d => d.status === 'negociando' || d.status === 'in_progress').length,
        dealsAceitos: deals.filter(d => d.status === 'aceito' || d.status === 'concluido' || d.status === 'completed').length,
      })

      setRecentDeals(deals.slice(0, 5))
    } catch (_error) {
      // Silently handle error loading stats
    } finally {
      setLoadingStats(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(updateProfile(formData))
    if (updateProfile.fulfilled.match(result)) {
      toast.success('Perfil atualizado com sucesso!')
      setIsEditing(false)
    }
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('A imagem deve ter no maximo 2MB')
      return
    }

    setUploadingPhoto(true)
    const formDataObj = new FormData()
    formDataObj.append('foto', file)

    try {
      const response = await api.post('/users/me/foto', formDataObj)
      toast.success('Foto atualizada!')
      dispatch(setUser({
        ...user,
        foto_path: response.data.data.foto_path
      }))
    } catch (error) {
      toast.error('Erro ao enviar foto')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem de capa deve ter no maximo 5MB')
      return
    }

    setUploadingCover(true)
    const formDataObj = new FormData()
    formDataObj.append('cover', file)

    try {
      const response = await api.post('/users/me/cover', formDataObj)
      toast.success('Capa atualizada!')
      // Update the profile with the new cover
      const updatedProfile = isEmpresa
        ? { ...user.company_profile, cover_path: response.data.data.cover_path }
        : { ...user.client_profile, cover_path: response.data.data.cover_path }

      dispatch(setUser({
        ...user,
        [isEmpresa ? 'company_profile' : 'client_profile']: updatedProfile
      }))
    } catch (error) {
      toast.error('Erro ao enviar capa')
    } finally {
      setUploadingCover(false)
    }
  }

  const handleRemoveCover = async () => {
    if (!profile?.cover_path) return

    try {
      await api.delete('/users/me/cover')
      toast.success('Capa removida!')
      const updatedProfile = isEmpresa
        ? { ...user.company_profile, cover_path: null }
        : { ...user.client_profile, cover_path: null }

      dispatch(setUser({
        ...user,
        [isEmpresa ? 'company_profile' : 'client_profile']: updatedProfile
      }))
    } catch (error) {
      toast.error('Erro ao remover capa')
    }
  }

  const storageUrl = STORAGE_URL
  const isEmpresa = user?.type === 'empresa'
  const profile = isEmpresa ? user?.company_profile : user?.client_profile
  const coverUrl = profile?.cover_path ? `${storageUrl}/${profile.cover_path}` : null

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const getStatusStyle = (status) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-700',
      aberto: 'bg-amber-100 text-amber-700',
      negociando: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-blue-100 text-blue-700',
      aceito: 'bg-emerald-100 text-emerald-700',
      concluido: 'bg-emerald-100 text-emerald-700',
      completed: 'bg-emerald-100 text-emerald-700',
    }
    return styles[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pendente',
      aberto: 'Aberto',
      negociando: 'Negociando',
      in_progress: 'Em Andamento',
      aceito: 'Aceito',
      concluido: 'Concluido',
      completed: 'Concluido',
    }
    return labels[status] || status
  }

  // Guard: espera o user estar carregado
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-[3px] border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header - Full Width with Cover Image */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Cover Image */}
        {coverUrl ? (
          <div className="absolute inset-0">
            <img
              src={coverUrl}
              alt="Capa"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-slate-900/30" />
          </div>
        ) : (
          <>
            {/* Animated Background Orbs (fallback when no cover) */}
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
          </>
        )}

        {/* Cover Edit Button */}
        {isEmpresa && (
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
            />
            <button
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
              className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-sm text-white text-sm font-medium rounded-xl hover:bg-black/60 transition-all border border-white/20"
            >
              {uploadingCover ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              {coverUrl ? 'Alterar Capa' : 'Adicionar Capa'}
            </button>
            {coverUrl && (
              <button
                onClick={handleRemoveCover}
                className="p-2 bg-black/40 backdrop-blur-sm text-white rounded-xl hover:bg-red-500/80 transition-all border border-white/20"
                title="Remover capa"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

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
          <div className="flex flex-col lg:flex-row lg:items-center gap-8">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 sm:w-36 sm:h-36 bg-white rounded-2xl shadow-2xl border-4 border-white/20 overflow-hidden">
                {user?.foto_path ? (
                  <img src={`${storageUrl}/${user.foto_path}`} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                    <span className="text-white text-4xl sm:text-5xl font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white hover:shadow-lg hover:shadow-emerald-500/30 transition-all shadow-lg border-2 border-white"
              >
                {uploadingPhoto ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </button>
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>

            {/* User Info */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
                  {isEmpresa ? (
                    <Briefcase className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <User className="w-4 h-4 text-blue-400" />
                  )}
                  <span className="text-sm font-medium text-white/90">
                    {isEmpresa ? 'Conta Empresa' : 'Conta Cliente'}
                  </span>
                </div>
                {isEmpresa && profile?.verified && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 backdrop-blur-xl rounded-full border border-emerald-500/30">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-300">Verificado</span>
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  {isEmpresa ? (profile?.nome_fantasia || user?.name) : user?.name}
                </h1>
                <p className="text-slate-300 mt-1 flex items-center gap-2">
                  {isEmpresa && profile?.segmento && (
                    <span>{profile.segmento}</span>
                  )}
                  {(profile?.cidade || profile?.estado) && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {[profile?.cidade, profile?.estado].filter(Boolean).join(', ')}
                    </span>
                  )}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="group flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                  Editar Perfil
                </button>
                <Link
                  to="/settings"
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm text-white font-medium rounded-xl border border-white/20 hover:bg-white/20 transition-all"
                >
                  <Settings className="w-4 h-4" />
                  Configuracoes
                </Link>
              </div>
            </div>

            {/* Plan Badge - Desktop */}
            {isEmpresa && (
              <div className="hidden lg:block">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 min-w-[220px]">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-amber-400" />
                    <span className="text-sm font-medium text-white/70">Seu Plano</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {user?.active_subscription?.plan?.name || 'Gratuito'}
                  </p>
                  <p className="text-sm text-white/60 mt-1">
                    {user?.active_subscription?.ends_at
                      ? `Ate ${formatDate(user.active_subscription.ends_at)}`
                      : 'Plano ativo'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
            {[
              { label: 'Negociacoes', value: stats.totalDeals || 0, icon: MessageSquare, color: 'from-slate-500 to-slate-600' },
              { label: 'Abertas', value: stats.dealsAbertos || 0, icon: Clock, color: 'from-amber-500 to-orange-500' },
              { label: 'Em Andamento', value: stats.dealsNegociando || 0, icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
              { label: 'Concluidas', value: stats.dealsAceitos || 0, icon: CheckCircle, color: 'from-emerald-500 to-teal-500' },
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
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Edit Form Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">Informacoes do Perfil</h2>
                    <p className="text-sm text-gray-500">Gerencie seus dados pessoais</p>
                  </div>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    Editar
                  </button>
                )}
              </div>

              <div className="p-6">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                      </div>
                    </div>

                    {isEmpresa && (
                      <>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nome Fantasia</label>
                            <input
                              type="text"
                              name="nome_fantasia"
                              value={formData.nome_fantasia}
                              onChange={handleChange}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Segmento</label>
                            <input
                              type="text"
                              name="segmento"
                              value={formData.segmento}
                              onChange={handleChange}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            />
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                            <input
                              type="text"
                              name="cidade"
                              value={formData.cidade}
                              onChange={handleChange}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                            <input
                              type="text"
                              name="estado"
                              value={formData.estado}
                              onChange={handleChange}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                      <input
                        type="tel"
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                    </div>

                    {isEmpresa && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Descricao</label>
                        <textarea
                          name="descricao"
                          value={formData.descricao}
                          onChange={handleChange}
                          rows={4}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                        />
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 transition-all"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        Salvar Alteracoes
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-3 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-1">
                    <ProfileInfoRow icon={Mail} label="E-mail" value={user?.email} />
                    <ProfileInfoRow icon={Phone} label="Telefone" value={profile?.telefone || 'Nao informado'} />
                    {isEmpresa && (
                      <>
                        <ProfileInfoRow icon={Building2} label="CNPJ" value={profile?.cnpj || 'Nao informado'} />
                        <ProfileInfoRow icon={MapPin} label="Localizacao" value={[profile?.cidade, profile?.estado].filter(Boolean).join(', ') || 'Nao informado'} />
                        <ProfileInfoRow icon={Calendar} label="Membro desde" value={formatDate(user?.created_at)} />
                      </>
                    )}
                    {isEmpresa && profile?.descricao && (
                      <div className="pt-4 mt-4 border-t border-gray-100">
                        <p className="text-sm font-medium text-gray-500 mb-2">Sobre</p>
                        <p className="text-gray-700 leading-relaxed">{profile.descricao}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Links for Empresa */}
            {isEmpresa && (
              <div className="grid sm:grid-cols-2 gap-4">
                <Link
                  to="/my-services"
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg hover:border-gray-200 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Meus Servicos</h3>
                        <p className="text-sm text-gray-500">Gerencie seu catalogo</p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                </Link>
                <Link
                  to="/deals"
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg hover:border-gray-200 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Negociacoes</h3>
                        <p className="text-sm text-gray-500">Acompanhe propostas</p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Plan Card - Mobile */}
            {isEmpresa && (
              <div className="lg:hidden bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span className="font-medium text-sm text-slate-300">Seu Plano</span>
                </div>
                <p className="text-2xl font-bold">
                  {user?.active_subscription?.plan?.name || 'Gratuito'}
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  {user?.active_subscription?.ends_at
                    ? `Valido ate ${formatDate(user.active_subscription.ends_at)}`
                    : 'Plano ativo'}
                </p>
                <Link
                  to="/settings"
                  className="mt-4 flex items-center justify-center gap-2 py-3 bg-white text-slate-800 font-semibold rounded-xl hover:bg-slate-100 transition-colors text-sm"
                >
                  Gerenciar Plano
                </Link>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Atividade Recente</h3>
                    <p className="text-sm text-gray-500">Ultimas negociacoes</p>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {loadingStats ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                  </div>
                ) : recentDeals.length > 0 ? (
                  <>
                    {recentDeals.slice(0, 4).map((deal) => (
                      <Link
                        key={deal.id}
                        to={`/chat/${deal.id}`}
                        className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-5 h-5 text-slate-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {deal.service?.titulo || 'Negociacao'}
                          </p>
                          <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 font-medium ${getStatusStyle(deal.status)}`}>
                            {getStatusLabel(deal.status)}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </Link>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-12 px-6">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="font-medium text-gray-900 mb-1">Nenhuma atividade</p>
                    <p className="text-sm text-gray-500">Suas negociacoes aparecerao aqui</p>
                  </div>
                )}
              </div>
              {recentDeals.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-100">
                  <Link
                    to="/deals"
                    className="flex items-center justify-center gap-2 text-sm text-slate-700 font-semibold hover:text-slate-900 transition-colors"
                  >
                    Ver todas negociacoes
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>

            {/* Tips Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-900">Dica</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {isEmpresa
                  ? 'Complete seu perfil e adicione fotos aos seus servicos para atrair mais clientes e aumentar suas chances de fechar negocios.'
                  : 'Explore as categorias e encontre os melhores profissionais para suas necessidades. Avalie os servicos recebidos para ajudar outros usuarios.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Component for profile info rows
function ProfileInfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-gray-500" />
        </div>
        <span className="text-gray-500">{label}</span>
      </div>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}
