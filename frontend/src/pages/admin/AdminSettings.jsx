import { useEffect, useState, useCallback } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { useSettings } from '../../contexts/SettingsContext'
import {
  Settings,
  Home,
  FileText,
  Search,
  Phone,
  Share2,
  Upload,
  X,
  Save,
  Image as ImageIcon,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Sparkles,
  Layers,
  LayoutDashboard,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Users,
  Building2,
  BarChart3,
  Star,
  Trophy,
  TrendingUp,
  Shield,
  MessageSquare,
  Megaphone,
  Award,
  Wrench,
  Check,
  Loader2,
  ChevronRight,
  Palette,
  Type,
  Hash,
  PieChart,
  LineChart,
  Target,
  Gift,
  Lightbulb,
  DollarSign,
  Calendar,
  Clock,
} from 'lucide-react'

// Default dashboard sections
const DEFAULT_CLIENTE_SECTIONS = [
  { id: 'hero', title: 'Hero Section', visible: true, order: 1 },
  { id: 'categories', title: 'Barra de Categorias', visible: true, order: 2 },
  { id: 'user_stats', title: 'Estatisticas do Usuario', visible: true, order: 3 },
  { id: 'featured', title: 'Empresas em Destaque', visible: true, order: 4, items: 15, cardSize: 'medium' },
  { id: 'top_rated_new', title: 'Melhores Avaliadas e Novas', visible: true, order: 5, items: 5 },
  { id: 'most_hired', title: 'Mais Contratadas', visible: true, order: 6, items: 15, cardSize: 'medium' },
  { id: 'verified', title: 'Empresas Verificadas', visible: true, order: 7, items: 8, cardSize: 'compact' },
  { id: 'nearby', title: 'Perto de Voce', visible: true, order: 8, items: 15, cardSize: 'medium' },
  { id: 'recent_deals', title: 'Negociacoes Recentes', visible: true, order: 9, items: 5 },
  { id: 'cta_banner', title: 'Banner CTA', visible: true, order: 10 },
  { id: 'trust_bar', title: 'Barra de Confianca', visible: true, order: 11 },
]

const DEFAULT_EMPRESA_SECTIONS = [
  { id: 'hero', title: 'Hero Section', visible: true, order: 1 },
  { id: 'categories', title: 'Barra de Categorias', visible: true, order: 2 },
  { id: 'user_stats', title: 'Estatisticas do Usuario', visible: true, order: 3 },
  { id: 'tools', title: 'Ferramentas Rapidas', visible: true, order: 4 },
  { id: 'featured', title: 'Empresas em Destaque', visible: true, order: 5, items: 15, cardSize: 'medium' },
  { id: 'top_rated_new', title: 'Melhores Avaliadas e Novas', visible: true, order: 6, items: 5 },
  { id: 'most_hired', title: 'Mais Contratadas', visible: true, order: 7, items: 15, cardSize: 'medium' },
  { id: 'verified', title: 'Empresas Verificadas', visible: true, order: 8, items: 8, cardSize: 'compact' },
  { id: 'nearby', title: 'Perto de Voce', visible: true, order: 9, items: 15, cardSize: 'medium' },
  { id: 'recent_deals', title: 'Negociacoes Recentes', visible: true, order: 10, items: 5 },
  { id: 'trust_bar', title: 'Barra de Confianca', visible: true, order: 11 },
]

const SECTION_ICONS = {
  hero: Sparkles,
  categories: Layers,
  user_stats: BarChart3,
  featured: Star,
  top_rated_new: Trophy,
  most_hired: TrendingUp,
  verified: Shield,
  nearby: MapPin,
  recent_deals: MessageSquare,
  cta_banner: Megaphone,
  trust_bar: Award,
  tools: Wrench,
}

// Default reports configuration
const DEFAULT_REPORTS_CONFIG = {
  default_period: '30',
  available_periods: ['7', '30', '90', '180', '365'],
  charts: [
    { id: 'deals_timeline', title: 'Evolucao de Negociacoes', type: 'area', visible: true },
    { id: 'deals_status', title: 'Status das Negociacoes', type: 'donut', visible: true },
    { id: 'top_services', title: 'Servicos Mais Solicitados', type: 'bar', visible: true },
    { id: 'reviews_timeline', title: 'Evolucao de Avaliacoes', type: 'area', visible: true },
  ],
  metrics: [
    { id: 'total_deals', title: 'Total de Negociacoes', visible: true },
    { id: 'conversion_rate', title: 'Taxa de Conversao', visible: true },
    { id: 'avg_rating', title: 'Media de Avaliacoes', visible: true },
    { id: 'completed_services', title: 'Servicos Concluidos', visible: true },
  ],
  show_insights: true,
  show_export: true,
}

// Default ranking configuration
const DEFAULT_RANKING_CONFIG = {
  scoring: {
    revenue_multiplier: 0.1,
    deal_completed_points: 10,
    five_star_review_points: 5,
  },
  benefits: [
    { id: 'featured_search', title: 'Destaque nas buscas', description: 'Apareca em primeiro nas pesquisas', visible: true },
    { id: 'badge', title: 'Badge Top Performer', description: 'Selo exclusivo no perfil', visible: true },
    { id: 'priority_leads', title: 'Leads prioritarios', description: 'Receba leads qualificados primeiro', visible: true },
    { id: 'campaign_exposure', title: 'Exposicao em campanhas', description: 'Destaque em campanhas da plataforma', visible: true },
  ],
  tips: [
    { id: 'update_profile', text: 'Mantenha seu perfil atualizado', visible: true },
    { id: 'quick_response', text: 'Responda rapidamente as solicitacoes', visible: true },
    { id: 'quality_service', text: 'Entregue servicos de qualidade', visible: true },
  ],
  show_podium: true,
  show_how_it_works: true,
  show_benefits: true,
  show_tips: true,
  reset_period: 'semestral',
}

const CHART_ICONS = {
  deals_timeline: LineChart,
  deals_status: PieChart,
  top_services: BarChart3,
  reviews_timeline: Star,
}

export default function AdminSettings() {
  const { refreshSettings } = useSettings()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState(null)
  const [activeSection, setActiveSection] = useState('branding')
  const [dashboardTab, setDashboardTab] = useState('cliente')

  // Upload states
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [faviconFile, setFaviconFile] = useState(null)
  const [faviconPreview, setFaviconPreview] = useState(null)
  const [ogImageFile, setOgImageFile] = useState(null)
  const [ogImagePreview, setOgImagePreview] = useState(null)

  const menuItems = [
    { id: 'branding', label: 'Identidade', icon: Palette, description: 'Logo, nome e cores' },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Layout e secoes' },
    { id: 'reports', label: 'Relatorios', icon: BarChart3, description: 'Graficos e metricas' },
    { id: 'ranking', label: 'Ranking', icon: Trophy, description: 'Pontuacao e beneficios' },
    { id: 'home', label: 'Pagina Inicial', icon: Home, description: 'Hero e CTA' },
    { id: 'seo', label: 'SEO', icon: Search, description: 'Meta tags e OG' },
    { id: 'contact', label: 'Contato', icon: Phone, description: 'Email e telefone' },
    { id: 'social', label: 'Redes Sociais', icon: Share2, description: 'Links sociais' },
    { id: 'footer', label: 'Rodape', icon: FileText, description: 'Textos do footer' },
  ]

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/settings')
      setSettings(response.data.data)

      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      if (response.data.data.branding?.logo_path) {
        setLogoPreview(`${baseUrl}/storage/${response.data.data.branding.logo_path}`)
      }
      if (response.data.data.branding?.favicon_path) {
        setFaviconPreview(`${baseUrl}/storage/${response.data.data.branding.favicon_path}`)
      }
      if (response.data.data.seo?.og_image_path) {
        setOgImagePreview(`${baseUrl}/storage/${response.data.data.seo.og_image_path}`)
      }
    } catch (_error) {
      toast.error('Erro ao carregar configuracoes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const handleSave = async () => {
    try {
      setSaving(true)

      if (logoFile) {
        const formData = new FormData()
        formData.append('logo', logoFile)
        await api.post('/admin/settings/logo', formData)
      }

      if (faviconFile) {
        const formData = new FormData()
        formData.append('favicon', faviconFile)
        await api.post('/admin/settings/favicon', formData)
      }

      if (ogImageFile) {
        const formData = new FormData()
        formData.append('og_image', ogImageFile)
        await api.post('/admin/settings/og-image', formData)
      }

      await api.put('/admin/settings', settings)

      toast.success('Configuracoes salvas!')

      setLogoFile(null)
      setFaviconFile(null)
      setOgImageFile(null)

      await refreshSettings()
      await loadSettings()

    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (group, key, value) => {
    setSettings(prev => ({
      ...prev,
      [group]: {
        ...prev[group],
        [key]: value
      }
    }))
  }

  const handleImageUpload = (type, file) => {
    if (!file) return
    const preview = URL.createObjectURL(file)
    if (type === 'logo') {
      setLogoFile(file)
      setLogoPreview(preview)
    } else if (type === 'favicon') {
      setFaviconFile(file)
      setFaviconPreview(preview)
    } else if (type === 'og_image') {
      setOgImageFile(file)
      setOgImagePreview(preview)
    }
  }

  const handleRemoveImage = async (type) => {
    try {
      if (type === 'logo') {
        await api.delete('/admin/settings/logo')
        setLogoFile(null)
        setLogoPreview(null)
      } else if (type === 'favicon') {
        await api.delete('/admin/settings/favicon')
        setFaviconFile(null)
        setFaviconPreview(null)
      }
      await refreshSettings()
      await loadSettings()
      toast.success('Imagem removida')
    } catch (_error) {
      toast.error('Erro ao remover imagem')
    }
  }

  const getDashboardSections = (type) => {
    const sections = settings?.[`dashboard_${type}`]?.sections
    if (sections && Array.isArray(sections) && sections.length > 0) {
      return sections
    }
    return type === 'empresa' ? DEFAULT_EMPRESA_SECTIONS : DEFAULT_CLIENTE_SECTIONS
  }

  const handleSectionVisibility = (dashboardType, sectionId) => {
    const key = `dashboard_${dashboardType}`
    const sections = getDashboardSections(dashboardType)
    const updatedSections = sections.map(section =>
      section.id === sectionId ? { ...section, visible: !section.visible } : section
    )
    updateSetting(key, 'sections', updatedSections)
  }

  const handleSectionOrder = (dashboardType, sectionId, direction) => {
    const key = `dashboard_${dashboardType}`
    const sections = [...getDashboardSections(dashboardType)]
    const index = sections.findIndex(s => s.id === sectionId)

    if (direction === 'up' && index > 0) {
      [sections[index], sections[index - 1]] = [sections[index - 1], sections[index]]
    } else if (direction === 'down' && index < sections.length - 1) {
      [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]]
    }

    const reorderedSections = sections.map((s, i) => ({ ...s, order: i + 1 }))
    updateSetting(key, 'sections', reorderedSections)
  }

  const handleSectionItems = (dashboardType, sectionId, items) => {
    const key = `dashboard_${dashboardType}`
    const sections = getDashboardSections(dashboardType)
    const updatedSections = sections.map(section =>
      section.id === sectionId ? { ...section, items: parseInt(items) } : section
    )
    updateSetting(key, 'sections', updatedSections)
  }

  const handleCardSize = (dashboardType, sectionId, cardSize) => {
    const key = `dashboard_${dashboardType}`
    const sections = getDashboardSections(dashboardType)
    const updatedSections = sections.map(section =>
      section.id === sectionId ? { ...section, cardSize } : section
    )
    updateSetting(key, 'sections', updatedSections)
  }

  // Reports helpers
  const getReportsConfig = () => {
    return settings?.reports || DEFAULT_REPORTS_CONFIG
  }

  const handleReportsChartVisibility = (chartId) => {
    const config = getReportsConfig()
    const charts = (config.charts || DEFAULT_REPORTS_CONFIG.charts).map(chart =>
      chart.id === chartId ? { ...chart, visible: !chart.visible } : chart
    )
    updateSetting('reports', 'charts', charts)
  }

  const handleReportsMetricVisibility = (metricId) => {
    const config = getReportsConfig()
    const metrics = (config.metrics || DEFAULT_REPORTS_CONFIG.metrics).map(metric =>
      metric.id === metricId ? { ...metric, visible: !metric.visible } : metric
    )
    updateSetting('reports', 'metrics', metrics)
  }

  // Ranking helpers
  const getRankingConfig = () => {
    return settings?.ranking || DEFAULT_RANKING_CONFIG
  }

  const handleRankingBenefitVisibility = (benefitId) => {
    const config = getRankingConfig()
    const benefits = (config.benefits || DEFAULT_RANKING_CONFIG.benefits).map(benefit =>
      benefit.id === benefitId ? { ...benefit, visible: !benefit.visible } : benefit
    )
    updateSetting('ranking', 'benefits', benefits)
  }

  const handleRankingTipVisibility = (tipId) => {
    const config = getRankingConfig()
    const tips = (config.tips || DEFAULT_RANKING_CONFIG.tips).map(tip =>
      tip.id === tipId ? { ...tip, visible: !tip.visible } : tip
    )
    updateSetting('ranking', 'tips', tips)
  }

  const handleRankingScoringChange = (key, value) => {
    const config = getRankingConfig()
    const scoring = { ...(config.scoring || DEFAULT_RANKING_CONFIG.scoring), [key]: parseFloat(value) }
    updateSetting('ranking', 'scoring', scoring)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gray-900 flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Configuracoes</h1>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {menuItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${
                    activeSection === item.id
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  } ${index !== 0 ? 'border-t border-gray-100' : ''}`}
                >
                  <item.icon className={`w-5 h-5 ${activeSection === item.id ? 'text-white' : 'text-gray-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${activeSection === item.id ? 'text-white' : 'text-gray-900'}`}>
                      {item.label}
                    </div>
                    <div className={`text-xs truncate ${activeSection === item.id ? 'text-gray-300' : 'text-gray-400'}`}>
                      {item.description}
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${activeSection === item.id ? 'text-gray-300' : 'text-gray-300'}`} />
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Branding Section */}
            {activeSection === 'branding' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-semibold text-gray-900">Logo e Favicon</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Imagens da identidade visual</p>
                  </div>
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Logo */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Logo</label>
                        {logoPreview ? (
                          <div className="relative h-32 bg-gray-50 rounded-lg border-2 border-gray-200 flex items-center justify-center group">
                            <img src={logoPreview} alt="Logo" className="max-h-24 max-w-full object-contain" />
                            <button
                              onClick={() => handleRemoveImage('logo')}
                              className="absolute top-2 right-2 p-1.5 bg-white border border-gray-200 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-colors">
                            <Upload className="w-6 h-6 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">Upload logo</span>
                            <span className="text-xs text-gray-400 mt-1">PNG, JPG, SVG</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload('logo', e.target.files[0])} />
                          </label>
                        )}
                      </div>

                      {/* Favicon */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Favicon</label>
                        {faviconPreview ? (
                          <div className="relative h-32 bg-gray-50 rounded-lg border-2 border-gray-200 flex items-center justify-center group">
                            <img src={faviconPreview} alt="Favicon" className="h-12 w-12 object-contain" />
                            <button
                              onClick={() => handleRemoveImage('favicon')}
                              className="absolute top-2 right-2 p-1.5 bg-white border border-gray-200 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-colors">
                            <ImageIcon className="w-6 h-6 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">Upload favicon</span>
                            <span className="text-xs text-gray-400 mt-1">ICO, PNG</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload('favicon', e.target.files[0])} />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-semibold text-gray-900">Textos</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Nome e slogan da plataforma</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Plataforma</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        value={settings?.branding?.app_name || ''}
                        onChange={(e) => updateSetting('branding', 'app_name', e.target.value)}
                        placeholder="ServicePro"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        value={settings?.branding?.tagline || ''}
                        onChange={(e) => updateSetting('branding', 'tagline', e.target.value)}
                        placeholder="O marketplace de servicos"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Dashboard Section */}
            {activeSection === 'dashboard' && (
              <div className="space-y-6">
                {/* Dashboard Type Toggle */}
                <div className="bg-white rounded-xl border border-gray-200">
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">Layout do Dashboard</h2>
                      <p className="text-sm text-gray-500 mt-0.5">Configure as secoes visiveis e a ordem</p>
                    </div>
                    <div className="flex items-center p-1 bg-gray-100 rounded-lg">
                      <button
                        onClick={() => setDashboardTab('cliente')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          dashboardTab === 'cliente' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <Users className="w-4 h-4" />
                        Cliente
                      </button>
                      <button
                        onClick={() => setDashboardTab('empresa')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          dashboardTab === 'empresa' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <Building2 className="w-4 h-4" />
                        Empresa
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sections List */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Secoes</span>
                    <span className="text-xs text-gray-400">
                      {getDashboardSections(dashboardTab).filter(s => s.visible).length} ativas
                    </span>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {getDashboardSections(dashboardTab)
                      .sort((a, b) => a.order - b.order)
                      .map((section, index) => {
                        const Icon = SECTION_ICONS[section.id] || Layers
                        const isFirst = index === 0
                        const isLast = index === getDashboardSections(dashboardTab).length - 1

                        return (
                          <div
                            key={section.id}
                            className={`px-6 py-4 ${!section.visible ? 'bg-gray-50' : ''}`}
                          >
                            <div className="flex items-center gap-4">
                              {/* Order Controls */}
                              <div className="flex flex-col">
                                <button
                                  onClick={() => handleSectionOrder(dashboardTab, section.id, 'up')}
                                  disabled={isFirst}
                                  className={`p-1 rounded ${isFirst ? 'text-gray-200' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                                >
                                  <ChevronUp className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleSectionOrder(dashboardTab, section.id, 'down')}
                                  disabled={isLast}
                                  className={`p-1 rounded ${isLast ? 'text-gray-200' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Icon & Title */}
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${section.visible ? 'bg-gray-900' : 'bg-gray-200'}`}>
                                <Icon className={`w-5 h-5 ${section.visible ? 'text-white' : 'text-gray-400'}`} />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className={`text-sm font-medium ${section.visible ? 'text-gray-900' : 'text-gray-400'}`}>
                                  {section.title}
                                </div>
                                {(section.items || section.cardSize) && (
                                  <div className="flex items-center gap-2 mt-1">
                                    {section.items && (
                                      <span className="text-xs text-gray-400">{section.items} itens</span>
                                    )}
                                    {section.cardSize && (
                                      <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                                        {section.cardSize === 'small' ? 'P' : section.cardSize === 'medium' ? 'M' : section.cardSize === 'large' ? 'G' : 'C'}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Config Options */}
                              {section.items !== undefined && section.visible && (
                                <select
                                  value={section.items}
                                  onChange={(e) => handleSectionItems(dashboardTab, section.id, e.target.value)}
                                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                >
                                  {[3, 5, 8, 10, 15, 20].map(n => (
                                    <option key={n} value={n}>{n} itens</option>
                                  ))}
                                </select>
                              )}

                              {section.cardSize !== undefined && section.visible && (
                                <select
                                  value={section.cardSize}
                                  onChange={(e) => handleCardSize(dashboardTab, section.id, e.target.value)}
                                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                >
                                  <option value="small">Pequeno</option>
                                  <option value="medium">Medio</option>
                                  <option value="large">Grande</option>
                                  <option value="compact">Compacto</option>
                                </select>
                              )}

                              {/* Visibility Toggle */}
                              <button
                                onClick={() => handleSectionVisibility(dashboardTab, section.id)}
                                className={`p-2 rounded-lg transition-colors ${
                                  section.visible
                                    ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                                    : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                                }`}
                              >
                                {section.visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* Reports Section */}
            {activeSection === 'reports' && (
              <div className="space-y-6">
                {/* Period Configuration */}
                <div className="bg-white rounded-xl border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-semibold text-gray-900">Configuracao Geral</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Periodo padrao e opcoes de exportacao</p>
                  </div>
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Calendar className="w-4 h-4 inline mr-1.5 text-gray-400" />
                          Periodo Padrao
                        </label>
                        <select
                          value={getReportsConfig().default_period || '30'}
                          onChange={(e) => updateSetting('reports', 'default_period', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        >
                          <option value="7">Ultimos 7 dias</option>
                          <option value="30">Ultimos 30 dias</option>
                          <option value="90">Ultimos 90 dias</option>
                          <option value="180">Ultimos 6 meses</option>
                          <option value="365">Ultimo ano</option>
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">Opcoes</label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={getReportsConfig().show_insights !== false}
                            onChange={(e) => updateSetting('reports', 'show_insights', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                          />
                          <span className="text-sm text-gray-700">Mostrar insights automaticos</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={getReportsConfig().show_export !== false}
                            onChange={(e) => updateSetting('reports', 'show_export', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                          />
                          <span className="text-sm text-gray-700">Permitir exportacao (PDF, CSV, Excel)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts Configuration */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">Graficos</h2>
                      <p className="text-sm text-gray-500 mt-0.5">Selecione quais graficos exibir</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {(getReportsConfig().charts || DEFAULT_REPORTS_CONFIG.charts).filter(c => c.visible).length} ativos
                    </span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {(getReportsConfig().charts || DEFAULT_REPORTS_CONFIG.charts).map(chart => {
                      const Icon = CHART_ICONS[chart.id] || PieChart
                      return (
                        <div key={chart.id} className={`px-6 py-4 flex items-center gap-4 ${!chart.visible ? 'bg-gray-50' : ''}`}>
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${chart.visible ? 'bg-gray-900' : 'bg-gray-200'}`}>
                            <Icon className={`w-5 h-5 ${chart.visible ? 'text-white' : 'text-gray-400'}`} />
                          </div>
                          <div className="flex-1">
                            <div className={`text-sm font-medium ${chart.visible ? 'text-gray-900' : 'text-gray-400'}`}>
                              {chart.title}
                            </div>
                            <div className="text-xs text-gray-400">Tipo: {chart.type}</div>
                          </div>
                          <button
                            onClick={() => handleReportsChartVisibility(chart.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              chart.visible
                                ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                                : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            {chart.visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Metrics Configuration */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">Metricas</h2>
                      <p className="text-sm text-gray-500 mt-0.5">Cards de estatisticas principais</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {(getReportsConfig().metrics || DEFAULT_REPORTS_CONFIG.metrics).filter(m => m.visible).length} ativos
                    </span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {(getReportsConfig().metrics || DEFAULT_REPORTS_CONFIG.metrics).map(metric => (
                      <div key={metric.id} className={`px-6 py-4 flex items-center gap-4 ${!metric.visible ? 'bg-gray-50' : ''}`}>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${metric.visible ? 'bg-gray-900' : 'bg-gray-200'}`}>
                          <Target className={`w-5 h-5 ${metric.visible ? 'text-white' : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${metric.visible ? 'text-gray-900' : 'text-gray-400'}`}>
                            {metric.title}
                          </div>
                        </div>
                        <button
                          onClick={() => handleReportsMetricVisibility(metric.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            metric.visible
                              ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                              : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {metric.visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Ranking Section */}
            {activeSection === 'ranking' && (
              <div className="space-y-6">
                {/* Scoring System */}
                <div className="bg-white rounded-xl border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-semibold text-gray-900">Sistema de Pontuacao</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Configure como os pontos sao calculados</p>
                  </div>
                  <div className="p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <DollarSign className="w-4 h-4 inline mr-1.5 text-gray-400" />
                          Multiplicador por R$1
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                          value={getRankingConfig().scoring?.revenue_multiplier || 0.1}
                          onChange={(e) => handleRankingScoringChange('revenue_multiplier', e.target.value)}
                        />
                        <p className="text-xs text-gray-400 mt-1.5">Pontos por R$1 em servicos</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Check className="w-4 h-4 inline mr-1.5 text-gray-400" />
                          Pontos por Negociacao
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                          value={getRankingConfig().scoring?.deal_completed_points || 10}
                          onChange={(e) => handleRankingScoringChange('deal_completed_points', e.target.value)}
                        />
                        <p className="text-xs text-gray-400 mt-1.5">Por negociacao concluida</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Star className="w-4 h-4 inline mr-1.5 text-gray-400" />
                          Pontos por 5 Estrelas
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                          value={getRankingConfig().scoring?.five_star_review_points || 5}
                          onChange={(e) => handleRankingScoringChange('five_star_review_points', e.target.value)}
                        />
                        <p className="text-xs text-gray-400 mt-1.5">Por avaliacao 5 estrelas</p>
                      </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Clock className="w-4 h-4 inline mr-1.5 text-gray-400" />
                            Periodo de Reset
                          </label>
                          <select
                            value={getRankingConfig().reset_period || 'semestral'}
                            onChange={(e) => updateSetting('ranking', 'reset_period', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                          >
                            <option value="mensal">Mensal</option>
                            <option value="trimestral">Trimestral</option>
                            <option value="semestral">Semestral</option>
                            <option value="anual">Anual</option>
                          </select>
                        </div>
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700">Exibicao</label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={getRankingConfig().show_podium !== false}
                              onChange={(e) => updateSetting('ranking', 'show_podium', e.target.checked)}
                              className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                            />
                            <span className="text-sm text-gray-700">Mostrar podio (Top 3)</span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={getRankingConfig().show_how_it_works !== false}
                              onChange={(e) => updateSetting('ranking', 'show_how_it_works', e.target.checked)}
                              className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                            />
                            <span className="text-sm text-gray-700">Mostrar "Como Funciona"</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Benefits Configuration */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">Beneficios do Top 10</h2>
                      <p className="text-sm text-gray-500 mt-0.5">Vantagens exibidas para os usuarios</p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={getRankingConfig().show_benefits !== false}
                        onChange={(e) => updateSetting('ranking', 'show_benefits', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                      <span className="text-xs text-gray-500">Exibir secao</span>
                    </label>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {(getRankingConfig().benefits || DEFAULT_RANKING_CONFIG.benefits).map(benefit => (
                      <div key={benefit.id} className={`px-6 py-4 flex items-center gap-4 ${!benefit.visible ? 'bg-gray-50' : ''}`}>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${benefit.visible ? 'bg-amber-500' : 'bg-gray-200'}`}>
                          <Gift className={`w-5 h-5 ${benefit.visible ? 'text-white' : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${benefit.visible ? 'text-gray-900' : 'text-gray-400'}`}>
                            {benefit.title}
                          </div>
                          <div className="text-xs text-gray-400">{benefit.description}</div>
                        </div>
                        <button
                          onClick={() => handleRankingBenefitVisibility(benefit.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            benefit.visible
                              ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                              : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {benefit.visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips Configuration */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">Dicas</h2>
                      <p className="text-sm text-gray-500 mt-0.5">Sugestoes para melhorar no ranking</p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={getRankingConfig().show_tips !== false}
                        onChange={(e) => updateSetting('ranking', 'show_tips', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                      <span className="text-xs text-gray-500">Exibir secao</span>
                    </label>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {(getRankingConfig().tips || DEFAULT_RANKING_CONFIG.tips).map(tip => (
                      <div key={tip.id} className={`px-6 py-4 flex items-center gap-4 ${!tip.visible ? 'bg-gray-50' : ''}`}>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tip.visible ? 'bg-blue-500' : 'bg-gray-200'}`}>
                          <Lightbulb className={`w-5 h-5 ${tip.visible ? 'text-white' : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${tip.visible ? 'text-gray-900' : 'text-gray-400'}`}>
                            {tip.text}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRankingTipVisibility(tip.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            tip.visible
                              ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                              : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {tip.visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Home Section */}
            {activeSection === 'home' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-semibold text-gray-900">Secao Hero</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Texto principal da pagina inicial</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Badge</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        value={settings?.home?.hero_badge || ''}
                        onChange={(e) => updateSetting('home', 'hero_badge', e.target.value)}
                        placeholder="Marketplace #1 de Servicos"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Titulo</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        value={settings?.home?.hero_title || ''}
                        onChange={(e) => updateSetting('home', 'hero_title', e.target.value)}
                        placeholder="Encontre os melhores profissionais"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subtitulo</label>
                      <textarea
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                        rows={2}
                        value={settings?.home?.hero_subtitle || ''}
                        onChange={(e) => updateSetting('home', 'hero_subtitle', e.target.value)}
                        placeholder="Conectamos voce aos melhores prestadores de servicos"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Botao Primario</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          value={settings?.home?.hero_cta_primary || ''}
                          onChange={(e) => updateSetting('home', 'hero_cta_primary', e.target.value)}
                          placeholder="Explorar Servicos"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Botao Secundario</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          value={settings?.home?.hero_cta_secondary || ''}
                          onChange={(e) => updateSetting('home', 'hero_cta_secondary', e.target.value)}
                          placeholder="Sou Prestador"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-semibold text-gray-900">Secao CTA</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Call-to-action final</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Titulo</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        value={settings?.home?.cta_title || ''}
                        onChange={(e) => updateSetting('home', 'cta_title', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subtitulo</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        value={settings?.home?.cta_subtitle || ''}
                        onChange={(e) => updateSetting('home', 'cta_subtitle', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Texto do Botao</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        value={settings?.home?.cta_button || ''}
                        onChange={(e) => updateSetting('home', 'cta_button', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SEO Section */}
            {activeSection === 'seo' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-semibold text-gray-900">Meta Tags</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Otimizacao para mecanismos de busca</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        value={settings?.seo?.meta_title || ''}
                        onChange={(e) => updateSetting('seo', 'meta_title', e.target.value)}
                        placeholder="ServicePro - Marketplace de Servicos"
                      />
                      <p className="text-xs text-gray-400 mt-1.5">Titulo exibido na aba do navegador</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                      <textarea
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                        rows={3}
                        value={settings?.seo?.meta_description || ''}
                        onChange={(e) => updateSetting('seo', 'meta_description', e.target.value)}
                        placeholder="Encontre os melhores profissionais para seu condominio"
                      />
                      <p className="text-xs text-gray-400 mt-1.5">Descricao nos resultados de busca (max 160 caracteres)</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-semibold text-gray-900">Open Graph</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Imagem para compartilhamento em redes sociais</p>
                  </div>
                  <div className="p-6">
                    {ogImagePreview ? (
                      <div className="relative aspect-[1200/630] bg-gray-50 rounded-lg border-2 border-gray-200 overflow-hidden group">
                        <img src={ogImagePreview} alt="OG" className="w-full h-full object-cover" />
                        <button
                          onClick={() => { setOgImageFile(null); setOgImagePreview(null) }}
                          className="absolute top-3 right-3 p-2 bg-white border border-gray-200 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center aspect-[1200/630] border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-colors">
                        <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Upload imagem OG</span>
                        <span className="text-xs text-gray-400 mt-1">1200x630px recomendado</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload('og_image', e.target.files[0])} />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Contact Section */}
            {activeSection === 'contact' && (
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="text-base font-semibold text-gray-900">Informacoes de Contato</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Dados para contato com a empresa</p>
                </div>
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-1.5 text-gray-400" />
                        Email
                      </label>
                      <input
                        type="email"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        value={settings?.contact?.email || ''}
                        onChange={(e) => updateSetting('contact', 'email', e.target.value)}
                        placeholder="contato@empresa.com.br"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-1.5 text-gray-400" />
                        Telefone
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        value={settings?.contact?.phone || ''}
                        onChange={(e) => updateSetting('contact', 'phone', e.target.value)}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MessageCircle className="w-4 h-4 inline mr-1.5 text-gray-400" />
                        WhatsApp
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        value={settings?.contact?.whatsapp || ''}
                        onChange={(e) => updateSetting('contact', 'whatsapp', e.target.value)}
                        placeholder="5511999999999"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 inline mr-1.5 text-gray-400" />
                        Endereco
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        value={settings?.contact?.address || ''}
                        onChange={(e) => updateSetting('contact', 'address', e.target.value)}
                        placeholder="Sao Paulo, SP"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Social Section */}
            {activeSection === 'social' && (
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="text-base font-semibold text-gray-900">Redes Sociais</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Links para as redes sociais</p>
                </div>
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/empresa' },
                      { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/empresa' },
                      { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/empresa' },
                      { key: 'twitter', label: 'Twitter / X', placeholder: 'https://twitter.com/empresa' },
                      { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@empresa' },
                      { key: 'website', label: 'Website', placeholder: 'https://empresa.com.br' },
                    ].map(social => (
                      <div key={social.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{social.label}</label>
                        <input
                          type="url"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          value={settings?.social?.[social.key] || ''}
                          onChange={(e) => updateSetting('social', social.key, e.target.value)}
                          placeholder={social.placeholder}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Footer Section */}
            {activeSection === 'footer' && (
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="text-base font-semibold text-gray-900">Rodape</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Textos exibidos no footer</p>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descricao da Empresa</label>
                    <textarea
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                      rows={3}
                      value={settings?.footer?.company_description || ''}
                      onChange={(e) => updateSetting('footer', 'company_description', e.target.value)}
                      placeholder="A plataforma que conecta voce aos melhores prestadores"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Texto de Copyright</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      value={settings?.footer?.copyright_text || ''}
                      onChange={(e) => updateSetting('footer', 'copyright_text', e.target.value)}
                      placeholder="Todos os direitos reservados"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
