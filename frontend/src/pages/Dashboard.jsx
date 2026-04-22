import { useSelector } from 'react-redux'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import api from '../services/api'
import CompanyCarousel from '../components/common/CompanyCarousel'
import { STORAGE_URL } from '../lib/config'
import {
  Search,
  ChevronRight,
  Building2,
  MessageSquare,
  Briefcase,
  Users,
  Trophy,
  Star,
  BarChart3,
  Tag,
  CreditCard,
  Image,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Shield,
  Clock,
  TrendingUp,
  Zap,
  ArrowUpRight,
  Play,
  MapPin,
  Award,
  Flame,
  Heart,
  ThumbsUp,
} from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useSelector((state) => state.auth)
  const [categories, setCategories] = useState([])
  const [recentDeals, setRecentDeals] = useState([])
  const [stats, setStats] = useState({})
  const [platformStats, setPlatformStats] = useState({
    total_companies: 0,
    total_clients: 0,
    total_deals: 0,
    completed_deals: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Diferentes listas de empresas
  const [featuredCompanies, setFeaturedCompanies] = useState([])
  const [topRatedCompanies, setTopRatedCompanies] = useState([])
  const [newCompanies, setNewCompanies] = useState([])
  const [mostHiredCompanies, setMostHiredCompanies] = useState([])
  const [verifiedCompanies, setVerifiedCompanies] = useState([])
  const [nearbyCompanies, setNearbyCompanies] = useState([])
  const [companiesByCategory, setCompaniesByCategory] = useState({})

  // Recarrega dados quando a pagina e acessada (location.key muda a cada navegacao)
  useEffect(() => {
    setLoading(true)
    loadData()
  }, [location.key])

  // Helper function to fetch with retry
  const fetchWithRetry = async (url, params = {}, retries = 2) => {
    for (let i = 0; i <= retries; i++) {
      try {
        const response = await api.get(url, { params })
        return response
      } catch (error) {
        if (i === retries) {
          return { data: { data: [] } }
        }
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)))
      }
    }
    return { data: { data: [] } }
  }

  const loadData = async () => {
    try {
      const [catRes, dealsRes, platformStatsRes] = await Promise.all([
        fetchWithRetry('/public/categories'),
        fetchWithRetry('/deals', { per_page: 5 }),
        fetchWithRetry('/public/stats'),
      ])

      // Platform stats for hero section
      const pStats = platformStatsRes.data?.data || platformStatsRes.data || {}
      setPlatformStats({
        total_companies: pStats.total_companies || 0,
        total_clients: pStats.total_clients || 0,
        total_deals: pStats.total_deals || 0,
        completed_deals: pStats.completed_deals || 0,
      })

      const categoriesData = catRes.data?.data || catRes.data || []
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])

      const dealsData = dealsRes.data?.data || dealsRes.data || []
      setRecentDeals(Array.isArray(dealsData) ? dealsData : [])

      const deals = Array.isArray(dealsData) ? dealsData : []
      setStats({
        total_deals: dealsRes.data?.meta?.total || deals.length,
        pending_deals: deals.filter(d => d.status === 'pending' || d.status === 'aberto').length,
        active_deals: deals.filter(d => ['active', 'in_progress', 'negociando'].includes(d.status)).length,
        completed_deals: deals.filter(d => d.status === 'completed' || d.status === 'concluido').length,
      })

      // Load companies with retry
      const [
        featuredRes,
        topRatedRes,
        newRes,
        mostHiredRes,
        verifiedRes,
      ] = await Promise.all([
        fetchWithRetry('/public/companies', { per_page: 20, order_by: 'deals' }),
        fetchWithRetry('/public/companies', { per_page: 20, order_by: 'rating' }),
        fetchWithRetry('/public/companies', { per_page: 20, order_by: 'created_at' }),
        fetchWithRetry('/public/companies', { per_page: 20, order_by: 'services' }),
        fetchWithRetry('/public/companies', { per_page: 20, verified_only: true }),
      ])

      const featured = extractCompanies(featuredRes)
      const topRated = extractCompanies(topRatedRes)
      const newOnes = extractCompanies(newRes)
      const mostHired = extractCompanies(mostHiredRes)
      const verified = extractCompanies(verifiedRes)

      setFeaturedCompanies(featured)
      setTopRatedCompanies(topRated)
      setNewCompanies(newOnes)
      setMostHiredCompanies(mostHired)
      setVerifiedCompanies(verified)

      if (user?.cidade || user?.profile?.cidade) {
        const cidade = user?.cidade || user?.profile?.cidade
        const nearbyRes = await fetchWithRetry('/public/companies', { per_page: 20, cidade })
        setNearbyCompanies(extractCompanies(nearbyRes))
      }

      const parentCats = (Array.isArray(categoriesData) ? categoriesData : []).filter(c => !c.parent_id).slice(0, 3)
      const categoryPromises = parentCats.map(async cat => {
        const res = await fetchWithRetry('/public/companies', { per_page: 20, category_id: cat.id })
        return { category: cat, companies: extractCompanies(res) }
      })

      const categoryResults = await Promise.all(categoryPromises)
      const byCategory = {}
      categoryResults.forEach(({ category, companies }) => {
        if (companies.length > 0) {
          byCategory[category.id] = { category, companies }
        }
      })
      setCompaniesByCategory(byCategory)

    } catch (_error) {
      // Silently handle loading errors
    } finally {
      setLoading(false)
    }
  }

  const extractCompanies = (response) => {
    // Handle various API response structures
    if (!response || !response.data) return []

    const data = response.data

    // Case 1: { data: { data: [...] } } - paginated with nested data
    if (data.data && Array.isArray(data.data.data)) {
      return data.data.data
    }

    // Case 2: { data: { data: [...] } } - where data.data is the array
    if (data.data && Array.isArray(data.data)) {
      return data.data
    }

    // Case 3: { data: [...] } - direct array
    if (Array.isArray(data)) {
      return data
    }

    // Case 4: { data: { items: [...] } } or similar
    if (data.data && data.data.items && Array.isArray(data.data.items)) {
      return data.data.items
    }

    // Case 5: Paginated response { data: [...], meta: {...} }
    if (data.data && !Array.isArray(data.data) && typeof data.data === 'object') {
      // Check if it's a pagination object with the array inside
      const possibleArrays = Object.values(data.data).filter(v => Array.isArray(v))
      if (possibleArrays.length > 0) {
        return possibleArrays[0]
      }
    }

    return []
  }

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/empresas?q=${searchTerm}`)
  }

  const parentCategories = categories.filter(c => !c.parent_id)

  const getStatusStyle = (status) => {
    const styles = {
      pending: 'bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20',
      aberto: 'bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20',
      negociando: 'bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20',
      in_progress: 'bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20',
      completed: 'bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20',
      concluido: 'bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20',
    }
    return styles[status] || 'bg-gray-500/10 text-gray-600 ring-1 ring-gray-500/20'
  }

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pendente',
      aberto: 'Aberto',
      negociando: 'Negociando',
      in_progress: 'Em Andamento',
      completed: 'Concluido',
      concluido: 'Concluido',
    }
    return labels[status] || status
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-[3px] border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Carregando...</p>
        </div>
      </div>
    )
  }

  if (user?.type === 'admin') {
    return <AdminDashboard stats={stats} />
  }

  const isEmpresa = user?.type === 'empresa'
  // Check all company lists to determine if there are any companies
  const totalCompanies = featuredCompanies.length + topRatedCompanies.length + newCompanies.length + mostHiredCompanies.length + verifiedCompanies.length
  const storageUrl = STORAGE_URL

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-violet-500/30 via-blue-500/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        </div>

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-medium text-white/90">
                  {isEmpresa ? `Bem-vindo, ${user?.name?.split(' ')[0]}` : 'Plataforma #1 de Servicos'}
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
                  {isEmpresa ? (
                    <>Gerencie seus <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">servicos</span> e cresca</>
                  ) : (
                    <>Encontre os <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">melhores</span> profissionais</>
                  )}
                </h1>
                <p className="text-lg text-slate-300 max-w-lg leading-relaxed">
                  {isEmpresa
                    ? 'Acompanhe negociacoes, gerencie servicos e expanda seu negocio na maior plataforma do setor.'
                    : 'Empresas verificadas, avaliacoes reais e orcamentos sem compromisso. Tudo em um so lugar.'}
                </p>
              </div>

              <form onSubmit={handleSearch} className="relative">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-violet-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                    <div className="relative flex items-center">
                      <Search className="absolute left-5 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="O que voce precisa? Ex: Pintura, Eletrica..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-5 bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-400 rounded-2xl border-0 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-2xl shadow-black/20"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="group relative px-8 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Buscar
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </div>
              </form>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                {[
                  { icon: CheckCircle, text: `${platformStats.total_companies} empresas`, color: 'text-emerald-400' },
                  { icon: Star, text: 'Avaliacoes reais', color: 'text-amber-400' },
                  { icon: Shield, text: '100% seguro', color: 'text-blue-400' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-white/70">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <span className="text-sm font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative">
                <div className="grid grid-cols-2 gap-5">
                  {[
                    { value: platformStats.total_companies, label: 'Empresas Cadastradas', icon: Building2, color: 'from-slate-500 to-slate-600' },
                    { value: platformStats.total_clients, label: 'Clientes Ativos', icon: Users, color: 'from-emerald-500 to-teal-500' },
                    { value: platformStats.completed_deals, label: 'Servicos Realizados', icon: TrendingUp, color: 'from-violet-500 to-purple-500' },
                    { value: platformStats.total_deals, label: 'Total Negociacoes', icon: MessageSquare, color: 'from-amber-500 to-orange-500' },
                  ].map((stat, idx) => (
                    <div
                      key={idx}
                      className={`group bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 ${idx % 2 === 1 ? 'translate-y-6' : ''}`}
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                      <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {platformStats.total_companies > 0 && (
                  <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-5 shadow-xl border border-gray-100 flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">Plataforma Ativa</div>
                      <div className="text-xs text-gray-500">{platformStats.total_companies} empresas cadastradas</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Professional Layout */}
      <main>
        {/* Categories Bar */}
        {parentCategories.length > 0 && (
          <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
                <span className="text-sm font-medium text-gray-400 whitespace-nowrap mr-2">Categorias:</span>
                {parentCategories.slice(0, 8).map((category) => (
                  <Link
                    key={category.id}
                    to={`/empresas?categoria=${category.slug}`}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-900 hover:text-white rounded-full whitespace-nowrap transition-all duration-200"
                  >
                    {category.name}
                  </Link>
                ))}
                <Link
                  to="/empresas"
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-full whitespace-nowrap flex items-center gap-1.5 hover:bg-gray-800 transition-colors"
                >
                  Ver todas
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* User Stats Bar (for logged users) */}
        {(stats.total_deals > 0 || isEmpresa) && (
          <div className="bg-gradient-to-r from-gray-900 to-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-8">
                  {[
                    { label: 'Total', value: stats.total_deals || 0, icon: MessageSquare },
                    { label: 'Pendentes', value: stats.pending_deals || 0, icon: Clock },
                    { label: 'Em Andamento', value: stats.active_deals || 0, icon: Play },
                    { label: 'Concluidos', value: stats.completed_deals || 0, icon: CheckCircle },
                  ].map((stat, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <stat.icon className="w-5 h-5 text-gray-400" />
                      <div>
                        <span className="text-xl font-bold text-white">{stat.value}</span>
                        <span className="text-sm text-gray-400 ml-2 hidden sm:inline">{stat.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  to="/deals"
                  className="text-sm font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                >
                  Ver detalhes
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Featured Companies - Infinite Scroll */}
        {featuredCompanies.length > 0 && (
          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Empresas em Destaque</h2>
                    <p className="text-gray-500">Profissionais mais requisitados da plataforma</p>
                  </div>
                </div>
                <Link
                  to="/empresas?order_by=deals"
                  className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Ver todas
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Infinite Scroll Carousel */}
            <div className="overflow-hidden">
              <div
                className="flex gap-6 animate-scroll-slow"
                style={{ width: 'max-content' }}
              >
                {[...featuredCompanies.slice(0, 15), ...featuredCompanies.slice(0, 15)].map((company, idx) => (
                  <CompanyCardModern key={`featured-${idx}`} company={company} storageUrl={storageUrl} badge="top" />
                ))}
              </div>
            </div>

            <style>{`
              @keyframes scroll-slow {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .animate-scroll-slow {
                animation: scroll-slow 60s linear infinite;
              }
              .animate-scroll-slow:hover {
                animation-play-state: paused;
              }
            `}</style>
          </section>
        )}

        {/* Two Column Grid - Best Rated + New Companies */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Best Rated */}
              {topRatedCompanies.length > 0 && (
                <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                        <Star className="w-5 h-5 text-amber-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Melhores Avaliadas</h3>
                    </div>
                    <Link to="/empresas?order_by=rating" className="text-sm text-gray-500 hover:text-gray-900 font-medium">
                      Ver mais
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {topRatedCompanies.slice(0, 5).map((company, idx) => (
                      <CompanyListItem key={company.id} company={company} storageUrl={storageUrl} rank={idx + 1} />
                    ))}
                  </div>
                </div>
              )}

              {/* New Companies */}
              {newCompanies.length > 0 && (
                <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-emerald-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Recem Chegadas</h3>
                    </div>
                    <Link to="/empresas?order_by=created_at" className="text-sm text-gray-500 hover:text-gray-900 font-medium">
                      Ver mais
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {newCompanies.slice(0, 5).map((company) => (
                      <CompanyListItem key={company.id} company={company} storageUrl={storageUrl} isNew />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Most Hired - Infinite Scroll */}
        {mostHiredCompanies.length > 0 && (
          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Mais Contratadas</h2>
                    <p className="text-gray-500">Empresas com mais servicos realizados</p>
                  </div>
                </div>
                <Link
                  to="/empresas?order_by=services"
                  className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Ver todas
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="overflow-hidden">
              <div
                className="flex gap-6 animate-scroll-medium"
                style={{ width: 'max-content' }}
              >
                {[...mostHiredCompanies.slice(0, 15), ...mostHiredCompanies.slice(0, 15)].map((company, idx) => (
                  <CompanyCardModern key={`hired-${idx}`} company={company} storageUrl={storageUrl} badge="trending" />
                ))}
              </div>
            </div>

            <style>{`
              @keyframes scroll-medium {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .animate-scroll-medium {
                animation: scroll-medium 50s linear infinite;
              }
              .animate-scroll-medium:hover {
                animation-play-state: paused;
              }
            `}</style>
          </section>
        )}

        {/* Verified Companies Grid */}
        {verifiedCompanies.length > 0 && (
          <section className="py-12 bg-gradient-to-br from-emerald-50 to-teal-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Empresas Verificadas</h2>
                    <p className="text-gray-500">Selo de confianca e qualidade garantida</p>
                  </div>
                </div>
                <Link
                  to="/empresas?verified_only=true"
                  className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  Ver todas
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {verifiedCompanies.slice(0, 8).map((company) => (
                  <CompanyCardCompact key={company.id} company={company} storageUrl={storageUrl} verified />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Nearby Companies */}
        {nearbyCompanies.length > 0 && (
          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Perto de Voce</h2>
                    <p className="text-gray-500">Empresas em {user?.cidade || user?.profile?.cidade || 'sua regiao'}</p>
                  </div>
                </div>
                <Link
                  to={`/empresas?cidade=${user?.cidade || user?.profile?.cidade || ''}`}
                  className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Ver todas
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="overflow-hidden">
              <div
                className="flex gap-6 animate-scroll-fast"
                style={{ width: 'max-content' }}
              >
                {[...nearbyCompanies.slice(0, 15), ...nearbyCompanies.slice(0, 15)].map((company, idx) => (
                  <CompanyCardModern key={`nearby-${idx}`} company={company} storageUrl={storageUrl} />
                ))}
              </div>
            </div>

            <style>{`
              @keyframes scroll-fast {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .animate-scroll-fast {
                animation: scroll-fast 45s linear infinite;
              }
              .animate-scroll-fast:hover {
                animation-play-state: paused;
              }
            `}</style>
          </section>
        )}

        {/* Recent Deals */}
        {recentDeals.length > 0 && (
          <section className="py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Negociacoes Recentes</h2>
                    <p className="text-gray-500">Acompanhe suas conversas e propostas</p>
                  </div>
                </div>
                <Link
                  to="/deals"
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 text-sm font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Ver todas
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {recentDeals.slice(0, 5).map((deal, idx) => (
                  <Link
                    key={deal.id}
                    to={`/chat/${deal.id}`}
                    className={`flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors ${idx !== recentDeals.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {deal.service?.titulo || deal.service?.title || 'Negociacao'}
                      </h4>
                      <p className="text-sm text-gray-500 truncate">
                        {isEmpresa ? `Cliente: ${deal.client?.name || 'Aguardando'}` : deal.company?.nome_fantasia || 'Empresa'}
                      </p>
                    </div>
                    <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${getStatusStyle(deal.status)}`}>
                      {getStatusLabel(deal.status)}
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Tools for Empresa */}
        {isEmpresa && (
          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Ferramentas</h2>
                  <p className="text-gray-500">Acesso rapido as principais funcionalidades</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { to: '/my-services', icon: Briefcase, title: 'Meus Servicos', desc: 'Gerencie seu catalogo', color: 'from-slate-500 to-slate-700' },
                  { to: '/deals', icon: MessageSquare, title: 'Negociacoes', desc: 'Responda clientes', color: 'from-emerald-500 to-teal-600' },
                  { to: '/ranking', icon: Trophy, title: 'Ranking', desc: 'Sua posicao', color: 'from-amber-500 to-orange-600' },
                  { to: '/finance', icon: BarChart3, title: 'Financeiro', desc: 'Acompanhe ganhos', color: 'from-blue-500 to-cyan-600' },
                ].map((item, idx) => (
                  <Link
                    key={idx}
                    to={item.to}
                    className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                    <ArrowUpRight className="absolute top-6 right-6 w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Banner */}
        {!isEmpresa && (
          <section className="py-12 bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="text-center lg:text-left">
                  <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">Precisa de ajuda para escolher?</h3>
                  <p className="text-gray-400">Nossa equipe pode ajudar a encontrar o profissional ideal.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/empresas"
                    className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                  >
                    Explorar Empresas
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/register/empresa"
                    className="px-8 py-4 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                  >
                    Cadastrar Empresa
                    <Building2 className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Trust Bar */}
        <section className="py-8 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16 text-gray-400">
              {[
                { icon: Shield, text: 'Pagamento Seguro' },
                { icon: ThumbsUp, text: 'Satisfacao Garantida' },
                { icon: Clock, text: 'Suporte 24/7' },
                { icon: Award, text: 'Empresas Verificadas' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Empty State */}
        {totalCompanies === 0 && (
          <section className="py-20 bg-gray-50">
            <div className="max-w-md mx-auto text-center px-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhuma empresa cadastrada</h3>
              <p className="text-gray-500 mb-8">Em breve teremos empresas disponiveis. Seja o primeiro!</p>
              <Link
                to="/register/empresa"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
              >
                Cadastrar minha empresa
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

// Modern Company Card Component
function CompanyCardModern({ company, storageUrl, badge }) {
  const logoUrl = company.logo_url || null
  const coverUrl = company.cover_url || null
  const rating = company.average_rating ? parseFloat(company.average_rating).toFixed(1) : null

  return (
    <Link
      to={`/empresa/${company.slug || company.id}`}
      className="flex-shrink-0 w-72 bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="h-24 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
        {coverUrl && (
          <img src={coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
        {coverUrl && <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />}
        {badge === 'top' && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-amber-500 text-white rounded-full text-xs font-semibold">
            <Award className="w-3 h-3" />
            Top
          </div>
        )}
        {badge === 'trending' && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded-full text-xs font-semibold">
            <TrendingUp className="w-3 h-3" />
          </div>
        )}
        {company.verified && (
          <div className="absolute top-3 left-3 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
            <Shield className="w-3 h-3 text-white" />
          </div>
        )}
        <div className="absolute -bottom-6 left-4">
          <div className="w-14 h-14 bg-white rounded-xl border-2 border-white shadow-lg overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt={company.nome_fantasia} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-lg">
                {(company.nome_fantasia || 'E').charAt(0)}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="pt-10 px-4 pb-4">
        <h3 className="font-bold text-gray-900 truncate">{company.nome_fantasia}</h3>
        {company.cidade && (
          <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" />
            {company.cidade}
          </p>
        )}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          {rating ? (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="font-bold text-gray-900">{rating}</span>
            </div>
          ) : (
            <span className="text-xs text-gray-400">Sem avaliacoes</span>
          )}
          <span className="text-xs text-gray-400">{company.services_count || 0} servicos</span>
        </div>
      </div>
    </Link>
  )
}

// Compact Company Card for Grid
function CompanyCardCompact({ company, storageUrl, verified }) {
  const logoUrl = company.logo_url || null
  const coverUrl = company.cover_url || null
  const rating = company.average_rating ? parseFloat(company.average_rating).toFixed(1) : null

  return (
    <Link
      to={`/empresa/${company.slug || company.id}`}
      className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-300"
    >
      {/* Mini cover */}
      {coverUrl && (
        <div className="h-16 overflow-hidden">
          <img src={coverUrl} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className={`w-12 h-12 bg-gray-100 rounded-xl overflow-hidden ${coverUrl ? '-mt-8 border-2 border-white shadow-lg' : ''}`}>
              {logoUrl ? (
                <img src={logoUrl} alt={company.nome_fantasia} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold">
                  {(company.nome_fantasia || 'E').charAt(0)}
                </div>
              )}
            </div>
            {verified && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                <Shield className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-gray-900 truncate text-sm group-hover:text-emerald-600 transition-colors">
              {company.nome_fantasia}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              {rating ? (
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-medium text-gray-700">{rating}</span>
                </div>
              ) : (
                <span className="text-xs text-gray-400">Sem avaliacoes</span>
              )}
              {company.cidade && (
                <span className="text-xs text-gray-400 truncate">{company.cidade}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

// List Item Component for Sidebar Lists
function CompanyListItem({ company, storageUrl, rank, isNew }) {
  const logoUrl = company.logo_url || null
  const rating = company.average_rating ? parseFloat(company.average_rating).toFixed(1) : null

  return (
    <Link
      to={`/empresa/${company.slug || company.id}`}
      className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
    >
      {rank && (
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
          rank === 1 ? 'bg-amber-100 text-amber-700' :
          rank === 2 ? 'bg-gray-100 text-gray-600' :
          rank === 3 ? 'bg-orange-100 text-orange-700' :
          'bg-gray-50 text-gray-500'
        }`}>
          {rank}
        </div>
      )}
      <div className="w-10 h-10 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
        {logoUrl ? (
          <img src={logoUrl} alt={company.nome_fantasia} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-sm">
            {(company.nome_fantasia || 'E').charAt(0)}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 truncate text-sm group-hover:text-gray-700">
          {company.nome_fantasia}
        </h4>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {rating ? (
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>{rating}</span>
            </div>
          ) : (
            <span className="text-gray-400">Sem avaliacoes</span>
          )}
          {company.cidade && <span>{company.cidade}</span>}
        </div>
      </div>
      {isNew && (
        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
          Novo
        </span>
      )}
      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
    </Link>
  )
}

// Admin Dashboard
function AdminDashboard({ stats }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-1">Painel Administrativo</h1>
          <p className="text-gray-400">Gerencie a plataforma ServicePro</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { value: stats.total_deals || 0, label: 'Total Negociacoes', color: 'text-gray-900' },
            { value: stats.pending_deals || 0, label: 'Pendentes', color: 'text-amber-500' },
            { value: stats.active_deals || 0, label: 'Em Andamento', color: 'text-blue-500' },
            { value: stats.completed_deals || 0, label: 'Concluidos', color: 'text-emerald-500' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 border border-gray-100">
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { to: '/admin/users', icon: Users, title: 'Usuarios', desc: 'Gerenciar usuarios', color: 'from-slate-500 to-slate-600' },
            { to: '/admin/categories', icon: Tag, title: 'Categorias', desc: 'Gerenciar categorias', color: 'from-violet-500 to-purple-500' },
            { to: '/admin/plans', icon: CreditCard, title: 'Planos', desc: 'Gerenciar planos', color: 'from-amber-500 to-orange-500' },
            { to: '/admin/banners', icon: Image, title: 'Banners', desc: 'Gerenciar banners', color: 'from-emerald-500 to-teal-500' },
            { to: '/admin/finance', icon: BarChart3, title: 'Financeiro', desc: 'Relatorios', color: 'from-blue-500 to-cyan-500' },
          ].map((item, idx) => (
            <Link
              key={idx}
              to={item.to}
              className="group bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
