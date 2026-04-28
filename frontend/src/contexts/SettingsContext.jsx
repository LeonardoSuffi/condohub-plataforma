import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import { THEMES, applyTheme, getCurrentTheme } from '../config/themes'

const SettingsContext = createContext(null)

// Valores padrao caso a API falhe
const DEFAULT_SETTINGS = {
  branding: {
    app_name: 'ServicePro',
    tagline: 'O marketplace de servicos',
    logo_path: null,
    favicon_path: null,
  },
  theme: {
    selected_theme: 'blue',
  },
  home: {
    hero_badge: 'Marketplace #1 de Servicos',
    hero_title: 'Encontre os melhores profissionais',
    hero_subtitle: 'Conectamos voce aos melhores prestadores de servicos.',
    hero_cta_primary: 'Explorar Servicos',
    hero_cta_secondary: 'Sou Prestador',
    cta_title: 'Pronto para encontrar o profissional ideal?',
    cta_subtitle: 'Junte-se a milhares de clientes satisfeitos.',
    cta_button: 'Comecar Agora',
  },
  footer: {
    company_description: 'A plataforma que conecta voce aos melhores prestadores.',
    copyright_text: 'Todos os direitos reservados.',
  },
  seo: {
    meta_title: 'ServicePro - Marketplace de Servicos',
    meta_description: 'Encontre os melhores profissionais para seu condominio.',
  },
  contact: {
    email: 'contato@servicepro.com.br',
    phone: '(11) 99999-9999',
  },
  social: {},
  dashboard_cliente: {
    sections: [
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
    ],
  },
  dashboard_empresa: {
    sections: [
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
    ],
  },
  dashboard_cards: {
    sizes: {
      small: { width: 240, showCover: false, showRating: true, showLocation: false },
      medium: { width: 288, showCover: true, showRating: true, showLocation: true },
      large: { width: 320, showCover: true, showRating: true, showLocation: true },
    },
  },
  reports: {
    default_period: '30',
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
  },
  ranking: {
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
  },
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadSettings = useCallback(async () => {
    try {
      const response = await api.get('/settings/public')
      const data = response.data.data

      // Merge com defaults para garantir que todas as chaves existam
      const merged = {
        branding: { ...DEFAULT_SETTINGS.branding, ...data.branding },
        theme: { ...DEFAULT_SETTINGS.theme, ...data.theme },
        home: { ...DEFAULT_SETTINGS.home, ...data.home },
        footer: { ...DEFAULT_SETTINGS.footer, ...data.footer },
        seo: { ...DEFAULT_SETTINGS.seo, ...data.seo },
        contact: { ...DEFAULT_SETTINGS.contact, ...data.contact },
        social: { ...DEFAULT_SETTINGS.social, ...data.social },
        dashboard_cliente: data.dashboard_cliente?.sections
          ? { sections: data.dashboard_cliente.sections }
          : DEFAULT_SETTINGS.dashboard_cliente,
        dashboard_empresa: data.dashboard_empresa?.sections
          ? { sections: data.dashboard_empresa.sections }
          : DEFAULT_SETTINGS.dashboard_empresa,
        dashboard_cards: data.dashboard_cards?.sizes
          ? { sizes: data.dashboard_cards.sizes }
          : DEFAULT_SETTINGS.dashboard_cards,
        reports: {
          ...DEFAULT_SETTINGS.reports,
          ...data.reports,
          charts: data.reports?.charts || DEFAULT_SETTINGS.reports.charts,
          metrics: data.reports?.metrics || DEFAULT_SETTINGS.reports.metrics,
        },
        ranking: {
          ...DEFAULT_SETTINGS.ranking,
          ...data.ranking,
          scoring: data.ranking?.scoring || DEFAULT_SETTINGS.ranking.scoring,
          benefits: data.ranking?.benefits || DEFAULT_SETTINGS.ranking.benefits,
          tips: data.ranking?.tips || DEFAULT_SETTINGS.ranking.tips,
        },
      }

      setSettings(merged)
      setError(null)

      // Aplicar tema
      const themeId = merged.theme.selected_theme || 'blue'
      applyTheme(themeId)

      // Atualizar titulo da pagina
      if (merged.seo.meta_title) {
        document.title = merged.seo.meta_title
      }

      // Atualizar favicon
      if (merged.branding.favicon_path) {
        updateFavicon(merged.branding.favicon_path)
      }

      // Atualizar meta description
      if (merged.seo.meta_description) {
        updateMetaDescription(merged.seo.meta_description)
      }

    } catch (err) {
      console.error('Erro ao carregar settings:', err)
      setError(err)
      // Usar defaults e aplicar tema padrao
      applyTheme('blue')
    } finally {
      setLoading(false)
    }
  }, [])

  // Carregar settings ao montar
  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  // Funcao para atualizar favicon dinamicamente
  const updateFavicon = (path) => {
    if (!path) return

    let link = document.querySelector("link[rel~='icon']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }

    // Construir URL completa
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    link.href = `${baseUrl}/storage/${path}`
  }

  // Funcao para atualizar meta description
  const updateMetaDescription = (description) => {
    let meta = document.querySelector("meta[name='description']")
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = description
  }

  // Obter URL completa do logo
  const getLogoUrl = useCallback(() => {
    if (!settings.branding.logo_path) return null
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    return `${baseUrl}/storage/${settings.branding.logo_path}`
  }, [settings.branding.logo_path])

  // Obter tema atual
  const getTheme = useCallback(() => {
    const themeId = settings.theme.selected_theme || 'blue'
    return THEMES[themeId] || THEMES.blue
  }, [settings.theme.selected_theme])

  // Funcao para recarregar settings (usado apos admin salvar)
  const refreshSettings = useCallback(async () => {
    setLoading(true)
    await loadSettings()
  }, [loadSettings])

  // Obter secoes do dashboard ordenadas e filtradas
  const getDashboardSections = useCallback((userType) => {
    const key = userType === 'empresa' ? 'dashboard_empresa' : 'dashboard_cliente'
    const sections = settings[key]?.sections || DEFAULT_SETTINGS[key].sections
    return sections
      .filter(s => s.visible)
      .sort((a, b) => a.order - b.order)
  }, [settings])

  // Verificar se uma secao esta visivel
  const isSectionVisible = useCallback((userType, sectionId) => {
    const key = userType === 'empresa' ? 'dashboard_empresa' : 'dashboard_cliente'
    const sections = settings[key]?.sections || DEFAULT_SETTINGS[key].sections
    const section = sections.find(s => s.id === sectionId)
    return section?.visible ?? true
  }, [settings])

  // Obter configuracao de uma secao especifica
  const getSectionConfig = useCallback((userType, sectionId) => {
    const key = userType === 'empresa' ? 'dashboard_empresa' : 'dashboard_cliente'
    const sections = settings[key]?.sections || DEFAULT_SETTINGS[key].sections
    return sections.find(s => s.id === sectionId) || { visible: true, items: 10, cardSize: 'medium' }
  }, [settings])

  // Obter configuracao de tamanho de card
  const getCardSizeConfig = useCallback((size) => {
    const sizes = settings.dashboard_cards?.sizes || DEFAULT_SETTINGS.dashboard_cards.sizes
    return sizes[size] || sizes.medium
  }, [settings])

  // Obter configuracao de relatorios
  const getReportsConfig = useCallback(() => {
    return settings.reports || DEFAULT_SETTINGS.reports
  }, [settings])

  // Verificar se um grafico esta visivel
  const isChartVisible = useCallback((chartId) => {
    const charts = settings.reports?.charts || DEFAULT_SETTINGS.reports.charts
    const chart = charts.find(c => c.id === chartId)
    return chart?.visible ?? true
  }, [settings])

  // Verificar se uma metrica esta visivel
  const isMetricVisible = useCallback((metricId) => {
    const metrics = settings.reports?.metrics || DEFAULT_SETTINGS.reports.metrics
    const metric = metrics.find(m => m.id === metricId)
    return metric?.visible ?? true
  }, [settings])

  // Obter configuracao de ranking
  const getRankingConfig = useCallback(() => {
    return settings.ranking || DEFAULT_SETTINGS.ranking
  }, [settings])

  // Verificar se um beneficio esta visivel
  const isBenefitVisible = useCallback((benefitId) => {
    const benefits = settings.ranking?.benefits || DEFAULT_SETTINGS.ranking.benefits
    const benefit = benefits.find(b => b.id === benefitId)
    return benefit?.visible ?? true
  }, [settings])

  // Verificar se uma dica esta visivel
  const isTipVisible = useCallback((tipId) => {
    const tips = settings.ranking?.tips || DEFAULT_SETTINGS.ranking.tips
    const tip = tips.find(t => t.id === tipId)
    return tip?.visible ?? true
  }, [settings])

  const value = {
    settings,
    loading,
    error,
    refreshSettings,
    getLogoUrl,
    getTheme,
    themes: THEMES,
    getDashboardSections,
    isSectionVisible,
    getSectionConfig,
    getCardSizeConfig,
    getReportsConfig,
    isChartVisible,
    isMetricVisible,
    getRankingConfig,
    isBenefitVisible,
    isTipVisible,
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings deve ser usado dentro de SettingsProvider')
  }
  return context
}

export default SettingsContext
