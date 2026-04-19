import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchCurrentUser, updateProfile, clearError, setUser } from '../store/slices/authSlice'
import PlanSelectionModal from '../components/PlanSelectionModal'
import { GlassCard, GlassStatCard } from '../components/ui/glass-card'
import { StarRatingDisplay, ReviewCard, ReviewStats } from '../components/reviews'
import { PortfolioGallery, PortfolioUpload } from '../components/portfolio'
import { MetricCard } from '../components/metrics'
import { SocialLinksDisplay } from '../components/integrations'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import api from '../services/api'
import toast from 'react-hot-toast'
import {
  Camera,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Globe,
  Building2,
  Briefcase,
  Star,
  MessageSquare,
  ShoppingCart,
  TrendingUp,
  Edit3,
  Check,
  X,
  Shield,
  Award,
  Users,
  FileText,
  ExternalLink,
  Image,
  BarChart3,
  Plus,
  Loader2,
} from 'lucide-react'

export default function Profile() {
  const dispatch = useDispatch()
  const { user, loading, error } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState('sobre')
  const [isEditing, setIsEditing] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [stats, setStats] = useState(null)
  const [recentDeals, setRecentDeals] = useState([])
  const [services, setServices] = useState([])
  const [portfolio, setPortfolio] = useState([])
  const [reviews, setReviews] = useState({ data: [], stats: {} })
  const [loadingStats, setLoadingStats] = useState(true)
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false)
  const photoInputRef = useRef(null)
  const logoInputRef = useRef(null)
  const coverInputRef = useRef(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nome_fantasia: '',
    segmento: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    descricao: '',
    website: '',
    nome_condominio: '',
    endereco_condominio: '',
    num_unidades: '',
  })

  useEffect(() => {
    loadProfileData()
  }, [])

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
        data.endereco = user.company_profile.endereco || ''
        data.cidade = user.company_profile.cidade || ''
        data.estado = user.company_profile.estado || ''
        data.cep = user.company_profile.cep || ''
        data.descricao = user.company_profile.descricao || ''
        data.website = user.company_profile.website || ''
      } else if (user.type === 'cliente' && user.client_profile) {
        data.telefone = user.client_profile.telefone || ''
        data.nome_condominio = user.client_profile.nome_condominio || ''
        data.endereco_condominio = user.client_profile.endereco_condominio || ''
        data.cidade = user.client_profile.cidade || ''
        data.estado = user.client_profile.estado || ''
        data.cep = user.client_profile.cep || ''
        data.num_unidades = user.client_profile.num_unidades || ''
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
      const requests = [
        api.get('/deals', { params: { per_page: 100 } }),
      ]

      // Empresa: carregar servicos, portfolio e avaliacoes
      if (user?.type === 'empresa') {
        requests.push(
          api.get('/my-services').catch(() => ({ data: { data: [] } })),
          api.get('/portfolio').catch(() => ({ data: { data: [] } })),
          api.get('/reviews/received').catch(() => ({ data: { data: [], stats: {} } }))
        )
      }

      // Cliente: carregar avaliacoes dadas
      if (user?.type === 'cliente') {
        requests.push(
          api.get('/reviews/given').catch(() => ({ data: { data: [] } }))
        )
      }

      const responses = await Promise.all(requests)
      const [dealsRes, ...rest] = responses

      const deals = dealsRes.data?.data || []

      const totalDeals = deals.length
      const dealsAbertos = deals.filter(d => d.status === 'aberto').length
      const dealsNegociando = deals.filter(d => d.status === 'negociando').length
      const dealsAceitos = deals.filter(d => d.status === 'aceito' || d.status === 'concluido').length
      const dealsConcluidos = deals.filter(d => d.status === 'concluido')
      const faturamentoTotal = dealsConcluidos.reduce((sum, d) => sum + parseFloat(d.order?.value || d.value || 0), 0)

      setStats({
        totalDeals,
        dealsAbertos,
        dealsNegociando,
        dealsAceitos,
        faturamentoTotal,
        taxaConversao: totalDeals > 0 ? Math.round((dealsAceitos / totalDeals) * 100) : 0,
      })

      setRecentDeals(deals.slice(0, 5))

      if (user?.type === 'empresa' && rest.length >= 3) {
        setServices(rest[0].data?.data || [])
        setPortfolio(rest[1].data?.data || [])
        setReviews({
          data: rest[2].data?.data?.data || rest[2].data?.data || [],
          stats: rest[2].data?.stats || {},
        })
      }

      if (user?.type === 'cliente' && rest.length >= 1) {
        setReviews({
          data: rest[0].data?.data?.data || rest[0].data?.data || [],
          stats: {},
        })
      }
    } catch (error) {
      console.error('Erro ao carregar estatisticas:', error)
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
      dispatch(fetchCurrentUser())
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
    const formData = new FormData()
    formData.append('foto', file)

    try {
      const response = await api.post('/users/me/foto', formData)
      toast.success('Foto atualizada!')
      dispatch(setUser({
        ...user,
        foto_path: response.data.data.foto_path
      }))
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || 'Erro ao enviar foto')
      }
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('A imagem deve ter no maximo 2MB')
      return
    }

    setUploadingLogo(true)
    const formDataObj = new FormData()
    formDataObj.append('logo', file)

    try {
      const response = await api.post('/users/me/logo', formDataObj)
      toast.success('Logo atualizada!')
      dispatch(setUser({
        ...user,
        company_profile: {
          ...user.company_profile,
          logo_path: response.data.data.logo_path
        }
      }))
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error('Erro ao enviar logo')
      }
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no maximo 5MB')
      return
    }

    setUploadingCover(true)
    const formDataObj = new FormData()
    formDataObj.append('cover', file)

    try {
      const response = await api.post('/users/me/cover', formDataObj)
      toast.success('Capa atualizada!')
      const profileKey = user.type === 'empresa' ? 'company_profile' : 'client_profile'
      dispatch(setUser({
        ...user,
        [profileKey]: {
          ...user[profileKey],
          cover_path: response.data.data.cover_path
        }
      }))
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error('Erro ao enviar capa')
      }
    } finally {
      setUploadingCover(false)
    }
  }

  const handlePortfolioUpload = async (formData) => {
    setUploadingPortfolio(true)
    try {
      await api.post('/portfolio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Item adicionado ao portfolio!')
      loadProfileData()
    } catch (error) {
      toast.error('Erro ao adicionar item')
    } finally {
      setUploadingPortfolio(false)
    }
  }

  const handleReviewRespond = async (reviewId, response) => {
    try {
      await api.post(`/reviews/${reviewId}/respond`, { response })
      toast.success('Resposta enviada!')
      loadProfileData()
    } catch (error) {
      toast.error('Erro ao enviar resposta')
    }
  }

  const completion = user?.profile_completion || { percentage: 0 }
  const storageUrl = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage'
  const isEmpresa = user?.type === 'empresa'
  const isCliente = user?.type === 'cliente'
  const profile = isEmpresa ? user?.company_profile : user?.client_profile

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const getStatusColor = (status) => {
    const colors = {
      aberto: 'bg-primary/20 text-primary border-primary/30',
      negociando: 'bg-warning/20 text-warning border-warning/30',
      aceito: 'bg-success/20 text-success border-success/30',
      concluido: 'bg-success/20 text-success border-success/30',
      rejeitado: 'bg-destructive/20 text-destructive border-destructive/30',
    }
    return colors[status] || 'bg-muted text-muted-foreground'
  }

  const tabs = isEmpresa
    ? [
        { id: 'sobre', label: 'Sobre', icon: FileText },
        { id: 'portfolio', label: 'Portfolio', icon: Image },
        { id: 'avaliacoes', label: 'Avaliacoes', icon: Star },
        { id: 'servicos', label: 'Servicos', icon: Briefcase },
        { id: 'metricas', label: 'Metricas', icon: BarChart3 },
      ]
    : [
        { id: 'sobre', label: 'Sobre', icon: FileText },
        { id: 'negociacoes', label: 'Negociacoes', icon: MessageSquare },
        { id: 'avaliacoes', label: 'Minhas Avaliacoes', icon: Star },
      ]

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Image */}
      <div className="relative h-48 sm:h-56 lg:h-72 bg-gradient-to-r from-background via-primary/10 to-accent-violet/10">
        {profile?.cover_path && (
          <img
            src={`${storageUrl}/${profile.cover_path}`}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        {/* Cover Upload Button */}
        <button
          onClick={() => coverInputRef.current?.click()}
          disabled={uploadingCover}
          className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 glass text-foreground text-sm font-medium rounded-lg hover:bg-primary/10 transition-colors"
        >
          {uploadingCover ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
          Editar capa
        </button>
        <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
      </div>

      {/* Profile Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-20 sm:-mt-28 pb-6">
          <GlassCard variant="elevated" padding="lg">
            <div className="sm:flex sm:items-end sm:gap-6">
              {/* Avatar */}
              <div className="relative -mt-24 sm:-mt-32 mb-4 sm:mb-0">
                <div className="w-32 h-32 sm:w-40 sm:h-40 glass rounded-full border-4 border-background shadow-glass-lg overflow-hidden">
                  {user?.foto_path ? (
                    <img src={`${storageUrl}/${user.foto_path}`} alt="" className="w-full h-full object-cover" />
                  ) : isEmpresa && profile?.logo_path ? (
                    <img src={`${storageUrl}/${profile.logo_path}`} alt="" className="w-full h-full object-contain p-4" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-accent-violet flex items-center justify-center">
                      <span className="text-white text-4xl sm:text-5xl font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute bottom-2 right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg"
                >
                  {uploadingPhoto ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                </button>
                <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    {isEmpresa ? (profile?.nome_fantasia || profile?.razao_social || user?.name) : user?.name}
                  </h1>
                  {isEmpresa && profile?.verified && (
                    <Badge variant="outline" className="gap-1 border-primary/30 text-primary">
                      <Shield className="w-3.5 h-3.5" />
                      Verificado
                    </Badge>
                  )}
                  {user?.active_subscription?.plan && (
                    <Badge className="gap-1 bg-warning/20 text-warning border-warning/30">
                      <Award className="w-3.5 h-3.5" />
                      {user.active_subscription.plan.name}
                    </Badge>
                  )}
                </div>

                <p className="text-muted-foreground mb-3">
                  {isEmpresa ? profile?.segmento : (isCliente ? `${profile?.tipo?.charAt(0).toUpperCase()}${profile?.tipo?.slice(1)}` : user?.type)}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {(profile?.cidade || profile?.estado) && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {[profile?.cidade, profile?.estado].filter(Boolean).join(', ')}
                    </span>
                  )}
                  {user?.created_at && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      Membro desde {formatDate(user.created_at)}
                    </span>
                  )}
                  {isEmpresa && reviews.stats?.average > 0 && (
                    <StarRatingDisplay
                      value={reviews.stats.average}
                      count={reviews.stats.total}
                    />
                  )}
                </div>

                {/* Social Links */}
                {profile?.social_links?.length > 0 && (
                  <div className="mt-4">
                    <SocialLinksDisplay links={profile.social_links} />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 sm:mt-0 flex gap-2">
                <Button onClick={() => setIsEditing(true)}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Editar Perfil
                </Button>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{stats?.totalDeals || 0}</div>
                  <div className="text-sm text-muted-foreground">Negociacoes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">{stats?.dealsAceitos || 0}</div>
                  <div className="text-sm text-muted-foreground">Fechados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats?.taxaConversao || 0}%</div>
                  <div className="text-sm text-muted-foreground">Conversao</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {isEmpresa ? (portfolio?.length || 0) : (stats?.totalOrders || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">{isEmpresa ? 'Portfolio' : 'Pedidos'}</div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="pb-12">
          <TabsList className="glass w-full justify-start overflow-x-auto mb-6">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab: Sobre */}
          <TabsContent value="sobre">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* About Card */}
                <GlassCard>
                  <h2 className="text-lg font-semibold text-foreground mb-4">Sobre</h2>
                  {isEditing ? (
                    <textarea
                      name="descricao"
                      value={formData.descricao}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Escreva uma descricao sobre voce ou sua empresa..."
                      className="w-full px-4 py-3 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-foreground placeholder:text-muted-foreground"
                    />
                  ) : (
                    <p className="text-muted-foreground leading-relaxed">
                      {profile?.descricao || 'Nenhuma descricao adicionada ainda.'}
                    </p>
                  )}
                </GlassCard>

                {/* Contact Info */}
                <GlassCard>
                  <h2 className="text-lg font-semibold text-foreground mb-4">Informacoes de Contato</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">E-mail</p>
                        {isEditing ? (
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-1 px-3 py-2 bg-background/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        ) : (
                          <p className="font-medium text-foreground">{user?.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Telefone</p>
                        {isEditing ? (
                          <input
                            type="tel"
                            name="telefone"
                            value={formData.telefone}
                            onChange={handleChange}
                            placeholder="(00) 00000-0000"
                            className="mt-1 px-3 py-2 bg-background/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        ) : (
                          <p className="font-medium text-foreground">{profile?.telefone || 'Nao informado'}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Endereco</p>
                        {isEditing ? (
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <input
                              type="text"
                              name="cidade"
                              value={formData.cidade}
                              onChange={handleChange}
                              placeholder="Cidade"
                              className="px-3 py-2 bg-background/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <input
                              type="text"
                              name="estado"
                              value={formData.estado}
                              onChange={handleChange}
                              placeholder="Estado"
                              className="px-3 py-2 bg-background/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                        ) : (
                          <p className="font-medium text-foreground">
                            {[profile?.endereco, profile?.cidade, profile?.estado].filter(Boolean).join(', ') || 'Nao informado'}
                          </p>
                        )}
                      </div>
                    </div>

                    {isEmpresa && (
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">CNPJ</p>
                          <p className="font-medium text-foreground">{profile?.cnpj || 'Nao informado'}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex gap-3 mt-6 pt-6 border-t border-border">
                      <Button onClick={handleSubmit} disabled={loading}>
                        <Check className="w-4 h-4 mr-2" />
                        Salvar
                      </Button>
                      <Button variant="ghost" onClick={() => setIsEditing(false)}>
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  )}
                </GlassCard>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Profile Completion */}
                {completion.percentage < 100 && (
                  <GlassCard>
                    <h3 className="font-semibold text-foreground mb-3">Complete seu perfil</h3>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium text-foreground">{completion.percentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent-violet rounded-full transition-all"
                          style={{ width: `${completion.percentage}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Perfis completos tem mais chances de fechar negocios!
                    </p>
                  </GlassCard>
                )}

                {/* Plan Card */}
                {isEmpresa && (
                  <GlassCard variant="bordered" className="border-primary/30 bg-gradient-to-br from-primary/10 to-accent-violet/10">
                    <div className="flex items-center gap-3 mb-4">
                      <Award className="w-6 h-6 text-warning" />
                      <h3 className="font-semibold text-foreground">Seu Plano</h3>
                    </div>
                    <p className="text-2xl font-bold text-foreground mb-1">
                      {user?.active_subscription?.plan?.name || 'Gratuito'}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {user?.active_subscription?.ends_at
                        ? `Valido ate ${formatDate(user.active_subscription.ends_at)}`
                        : 'Plano ativo'}
                    </p>
                    <Button
                      onClick={() => setShowPlanModal(true)}
                      className="w-full"
                    >
                      Fazer Upgrade
                    </Button>
                  </GlassCard>
                )}

                {/* Quick Stats */}
                <GlassCard>
                  <h3 className="font-semibold text-foreground mb-4">Estatisticas</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Em andamento
                      </span>
                      <span className="font-semibold text-foreground">{stats?.dealsNegociando || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Fechados este mes
                      </span>
                      <span className="font-semibold text-success">{stats?.dealsAceitos || 0}</span>
                    </div>
                    {isEmpresa && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Faturamento
                        </span>
                        <span className="font-semibold text-foreground">{formatCurrency(stats?.faturamentoTotal || 0)}</span>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Portfolio (Empresa) */}
          {isEmpresa && (
            <TabsContent value="portfolio">
              <div className="space-y-6">
                <PortfolioUpload
                  services={services}
                  onUpload={handlePortfolioUpload}
                  isUploading={uploadingPortfolio}
                />
                <PortfolioGallery items={portfolio} columns={3} />
              </div>
            </TabsContent>
          )}

          {/* Tab: Avaliacoes */}
          <TabsContent value="avaliacoes">
            <div className="space-y-6">
              {isEmpresa && reviews.stats && (
                <ReviewStats stats={reviews.stats} />
              )}
              <div className="space-y-4">
                {reviews.data?.length > 0 ? (
                  reviews.data.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      showActions={isEmpresa}
                      onRespond={handleReviewRespond}
                    />
                  ))
                ) : (
                  <GlassCard className="text-center py-12">
                    <Star className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">
                      {isEmpresa ? 'Nenhuma avaliacao recebida ainda' : 'Voce ainda nao fez nenhuma avaliacao'}
                    </p>
                  </GlassCard>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Tab: Servicos (Empresa) */}
          {isEmpresa && (
            <TabsContent value="servicos">
              <GlassCard>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-foreground">Meus Servicos</h2>
                  <Link to="/my-services/new">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Servico
                    </Button>
                  </Link>
                </div>
                {services.length === 0 ? (
                  <div className="py-12 text-center">
                    <Briefcase className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum servico cadastrado</h3>
                    <p className="text-muted-foreground mb-4">Cadastre seus servicos para receber negociacoes</p>
                    <Link to="/my-services/new">
                      <Button>Cadastrar Servico</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {services.map((service) => (
                      <Link
                        key={service.id}
                        to={`/services/${service.id}`}
                        className="flex items-center gap-4 py-4 hover:bg-primary/5 -mx-6 px-6 transition-colors"
                      >
                        <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          {service.cover_image ? (
                            <img src={`${storageUrl}/${service.cover_image}`} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Briefcase className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground truncate">{service.titulo}</h3>
                          <p className="text-sm text-muted-foreground truncate">{service.category?.name}</p>
                        </div>
                        <Badge variant={service.status === 'ativo' ? 'default' : 'secondary'}>
                          {service.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </GlassCard>
            </TabsContent>
          )}

          {/* Tab: Metricas (Empresa) */}
          {isEmpresa && (
            <TabsContent value="metricas">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <MetricCard
                  title="Total de Negociacoes"
                  value={stats?.totalDeals || 0}
                  icon={MessageSquare}
                  color="primary"
                />
                <MetricCard
                  title="Taxa de Conversao"
                  value={`${stats?.taxaConversao || 0}%`}
                  icon={TrendingUp}
                  color="cyan"
                />
                <MetricCard
                  title="Faturamento Total"
                  value={formatCurrency(stats?.faturamentoTotal || 0)}
                  icon={ShoppingCart}
                  color="success"
                />
                <MetricCard
                  title="Avaliacao Media"
                  value={reviews.stats?.average?.toFixed(1) || '0.0'}
                  subtitle={`${reviews.stats?.total || 0} avaliacoes`}
                  icon={Star}
                  color="warning"
                />
              </div>

              <GlassCard>
                <h3 className="text-lg font-semibold text-foreground mb-4">Resumo do Periodo</h3>
                <p className="text-muted-foreground">
                  Graficos detalhados estarao disponiveis em breve.
                </p>
              </GlassCard>
            </TabsContent>
          )}

          {/* Tab: Negociacoes (Cliente) */}
          {isCliente && (
            <TabsContent value="negociacoes">
              <GlassCard>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-foreground">Negociacoes Recentes</h2>
                  <Link to="/deals" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                    Ver todas <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
                {recentDeals.length === 0 ? (
                  <div className="py-12 text-center">
                    <MessageSquare className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma negociacao</h3>
                    <p className="text-muted-foreground">Suas negociacoes aparecerao aqui</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {recentDeals.map((deal) => (
                      <Link
                        key={deal.id}
                        to={`/chat/${deal.id}`}
                        className="flex items-center gap-4 py-4 hover:bg-primary/5 -mx-6 px-6 transition-colors"
                      >
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground truncate">{deal.service?.titulo || 'Servico'}</h3>
                          <p className="text-sm text-muted-foreground">{deal.company?.nome_fantasia}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(deal.status)}>{deal.status}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">{formatDate(deal.created_at)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </GlassCard>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Plan Modal */}
      {showPlanModal && (
        <PlanSelectionModal
          currentPlan={user?.active_subscription?.plan}
          onClose={() => setShowPlanModal(false)}
          onSelect={(plan) => {
            toast.success(`Plano ${plan.name} selecionado!`)
            setShowPlanModal(false)
          }}
        />
      )}
    </div>
  )
}
