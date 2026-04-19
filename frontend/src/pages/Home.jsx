import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search, MapPin, Star, ChevronRight, Building2, Wrench,
  Paintbrush, Shield, Sparkles, Zap, Leaf, Phone, CheckCircle,
  Users, Award, Clock, ArrowRight, TrendingUp, MessageCircle, Trophy
} from 'lucide-react'
import api from '../services/api'
import PublicHeader from '../components/layout/PublicHeader'
import PublicFooter from '../components/layout/PublicFooter'

export default function Home() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [location, setLocation] = useState('')
  const [featuredCompanies, setFeaturedCompanies] = useState([])
  const [topRatedCompanies, setTopRatedCompanies] = useState([])
  const [mostActiveCompanies, setMostActiveCompanies] = useState([])
  const [categories, setCategories] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [featuredRes, topRatedRes, mostActiveRes, categoriesRes, statsRes] = await Promise.all([
        api.get('/public/companies', { params: { limit: 4, featured: true } }).catch(() => ({ data: { data: [] } })),
        api.get('/public/companies', { params: { limit: 4, sort: 'rating' } }).catch(() => ({ data: { data: [] } })),
        api.get('/public/companies', { params: { limit: 4, sort: 'deals' } }).catch(() => ({ data: { data: [] } })),
        api.get('/public/categories').catch(() => ({ data: { data: [] } })),
        api.get('/public/stats').catch(() => ({ data: { data: {} } }))
      ])
      setFeaturedCompanies(featuredRes.data.data || [])
      setTopRatedCompanies(topRatedRes.data.data || [])
      setMostActiveCompanies(mostActiveRes.data.data || [])
      setCategories(categoriesRes.data.data || [])
      setStats(statsRes.data.data || {})
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchTerm) params.set('q', searchTerm)
    if (location) params.set('cidade', location)
    navigate(`/empresas?${params.toString()}`)
  }

  const defaultCategories = [
    { id: 1, name: 'Manutencao Predial', slug: 'manutencao', icon: 'wrench', count: 45 },
    { id: 2, name: 'Pintura', slug: 'pintura', icon: 'paintbrush', count: 32 },
    { id: 3, name: 'Seguranca', slug: 'seguranca', icon: 'shield', count: 28 },
    { id: 4, name: 'Limpeza', slug: 'limpeza', icon: 'sparkles', count: 51 },
    { id: 5, name: 'Jardinagem', slug: 'jardinagem', icon: 'leaf', count: 23 },
    { id: 6, name: 'Eletrica', slug: 'eletrica', icon: 'zap', count: 38 },
  ]

  const displayCategories = categories.length > 0
    ? categories.filter(c => !c.parent_id).slice(0, 6)
    : defaultCategories

  const getCategoryIcon = (iconName) => {
    const icons = {
      wrench: Wrench,
      paintbrush: Paintbrush,
      shield: Shield,
      sparkles: Sparkles,
      leaf: Leaf,
      zap: Zap,
      building: Building2,
    }
    return icons[iconName] || Building2
  }

  // Mock data for rankings
  const mockFeatured = [
    { id: 1, nome_fantasia: 'FixTudo Manutencoes', cidade: 'Sao Paulo', estado: 'SP', rating: 4.8, total_reviews: 127, total_deals: 89, services: ['Manutencao', 'Reparos'], featured: true },
    { id: 2, nome_fantasia: 'CleanPro Limpeza', cidade: 'Sao Paulo', estado: 'SP', rating: 4.9, total_reviews: 89, total_deals: 67, services: ['Limpeza', 'Conservacao'], featured: true },
    { id: 3, nome_fantasia: 'Seguranca Total', cidade: 'Campinas', estado: 'SP', rating: 4.7, total_reviews: 64, total_deals: 45, services: ['Portaria', 'Monitoramento'], featured: true },
    { id: 4, nome_fantasia: 'Verde Jardins', cidade: 'Santos', estado: 'SP', rating: 4.6, total_reviews: 43, total_deals: 32, services: ['Jardinagem', 'Paisagismo'], featured: true },
  ]

  const mockTopRated = [
    { id: 5, nome_fantasia: 'Elite Pinturas', cidade: 'Sao Paulo', estado: 'SP', rating: 5.0, total_reviews: 156, total_deals: 78, services: ['Pintura', 'Textura'] },
    { id: 6, nome_fantasia: 'Master Eletrica', cidade: 'Guarulhos', estado: 'SP', rating: 4.9, total_reviews: 98, total_deals: 54, services: ['Eletrica', 'Instalacoes'] },
    { id: 2, nome_fantasia: 'CleanPro Limpeza', cidade: 'Sao Paulo', estado: 'SP', rating: 4.9, total_reviews: 89, total_deals: 67, services: ['Limpeza', 'Conservacao'] },
    { id: 1, nome_fantasia: 'FixTudo Manutencoes', cidade: 'Sao Paulo', estado: 'SP', rating: 4.8, total_reviews: 127, total_deals: 89, services: ['Manutencao', 'Reparos'] },
  ]

  const mockMostActive = [
    { id: 7, nome_fantasia: 'Servicos Gerais SP', cidade: 'Sao Paulo', estado: 'SP', rating: 4.5, total_reviews: 234, total_deals: 156, services: ['Diversos', 'Manutencao'] },
    { id: 1, nome_fantasia: 'FixTudo Manutencoes', cidade: 'Sao Paulo', estado: 'SP', rating: 4.8, total_reviews: 127, total_deals: 89, services: ['Manutencao', 'Reparos'] },
    { id: 5, nome_fantasia: 'Elite Pinturas', cidade: 'Sao Paulo', estado: 'SP', rating: 5.0, total_reviews: 156, total_deals: 78, services: ['Pintura', 'Textura'] },
    { id: 2, nome_fantasia: 'CleanPro Limpeza', cidade: 'Sao Paulo', estado: 'SP', rating: 4.9, total_reviews: 89, total_deals: 67, services: ['Limpeza', 'Conservacao'] },
  ]

  const displayFeatured = featuredCompanies.length > 0 ? featuredCompanies : mockFeatured
  const displayTopRated = topRatedCompanies.length > 0 ? topRatedCompanies : mockTopRated
  const displayMostActive = mostActiveCompanies.length > 0 ? mostActiveCompanies : mockMostActive

  // Company Card Component
  const CompanyCard = ({ company, rank, badge }) => {
    const getBadgeStyle = () => {
      switch (badge) {
        case 'destaque':
          return 'bg-amber-500 text-white'
        case 'rating':
          return 'bg-yellow-500 text-white'
        case 'deals':
          return 'bg-green-500 text-white'
        default:
          return 'bg-primary-500 text-white'
      }
    }

    const getBadgeIcon = () => {
      switch (badge) {
        case 'destaque':
          return <Trophy className="w-3 h-3" />
        case 'rating':
          return <Star className="w-3 h-3" />
        case 'deals':
          return <TrendingUp className="w-3 h-3" />
        default:
          return null
      }
    }

    return (
      <Link
        to={`/empresa/${company.slug || company.id}`}
        className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group relative"
      >
        {/* Rank badge */}
        <div className={`absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${getBadgeStyle()}`}>
          {getBadgeIcon()}
          <span>#{rank}</span>
        </div>

        {/* Company header */}
        <div className="h-24 bg-gradient-to-br from-primary-500 to-primary-700 relative">
          <div className="absolute -bottom-8 left-4">
            <div className="w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-600">
                {(company.nome_fantasia || company.name || 'E').charAt(0)}
              </span>
            </div>
          </div>
        </div>

        {/* Company info */}
        <div className="pt-12 pb-5 px-4">
          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
            {company.nome_fantasia || company.name}
          </h3>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5" />
            {company.cidade}, {company.estado}
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-3 mt-3">
            {/* Rating */}
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-sm font-semibold text-amber-700">
                {company.rating || company.average_rating || '4.5'}
              </span>
            </div>
            {/* Reviews count */}
            <span className="text-xs text-gray-500">
              {company.total_reviews || company.reviews_count || 0} avaliacoes
            </span>
          </div>

          {/* Deals indicator for "most active" */}
          {badge === 'deals' && (
            <div className="flex items-center gap-1 mt-2 text-green-600">
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">{company.total_deals || 0} negociacoes</span>
            </div>
          )}

          {/* Services tags */}
          <div className="flex flex-wrap gap-1 mt-3">
            {(company.services || company.categories || ['Servicos']).slice(0, 2).map((service, idx) => (
              <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                {typeof service === 'string' ? service : service.name}
              </span>
            ))}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicHeader />

      {/* Hero with Search */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Encontre os melhores prestadores de servico
            </h1>
            <p className="text-lg text-primary-100 max-w-2xl mx-auto">
              Mais de {stats.total_companies || 150}+ empresas verificadas prontas para atender voce
            </p>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-2xl p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="O que voce precisa? Ex: Eletricista, Pintor, Limpeza..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-gray-900 placeholder-gray-500 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>
              <div className="sm:w-48 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cidade"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-gray-900 placeholder-gray-500 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/30"
              >
                Buscar
              </button>
            </div>
          </form>

          {/* Quick stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-10 text-primary-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Empresas verificadas</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              <span>Avaliacoes reais</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>100% gratuito</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Categorias populares</h2>
            <Link to="/empresas" className="text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
              Ver todas <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {displayCategories.map((category) => {
              const Icon = getCategoryIcon(category.icon)
              return (
                <Link
                  key={category.id}
                  to={`/empresas?categoria=${category.slug}`}
                  className="group flex flex-col items-center p-6 bg-gray-50 rounded-2xl hover:bg-primary-50 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:bg-primary-100 group-hover:scale-110 transition-all">
                    <Icon className="w-7 h-7 text-primary-600" />
                  </div>
                  <span className="font-medium text-gray-900 text-center text-sm group-hover:text-primary-700">
                    {category.name}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    {category.companies_count || category.count || 0} empresas
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Companies - Destaque */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-xl">
                <Trophy className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Empresas em Destaque</h2>
                <p className="text-gray-600 mt-0.5">Parceiros premium da plataforma</p>
              </div>
            </div>
            <Link to="/empresas?featured=true" className="text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
              Ver todas <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayFeatured.map((company, index) => (
              <CompanyCard key={company.id} company={company} rank={index + 1} badge="destaque" />
            ))}
          </div>
        </div>
      </section>

      {/* Top Rated - Melhores Avaliadas */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-xl">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Melhores Avaliadas</h2>
                <p className="text-gray-600 mt-0.5">Empresas com as melhores notas dos clientes</p>
              </div>
            </div>
            <Link to="/empresas?sort=rating" className="text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
              Ver ranking <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayTopRated.map((company, index) => (
              <CompanyCard key={company.id} company={company} rank={index + 1} badge="rating" />
            ))}
          </div>
        </div>
      </section>

      {/* Most Active - Mais Negociacoes */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Mais Negociacoes</h2>
                <p className="text-gray-600 mt-0.5">Empresas mais ativas na plataforma</p>
              </div>
            </div>
            <Link to="/empresas?sort=deals" className="text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
              Ver ranking <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayMostActive.map((company, index) => (
              <CompanyCard key={company.id} company={company} rank={index + 1} badge="deals" />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/empresas"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              Ver todas as empresas
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works - Simplified */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">Como funciona</h2>

          <div className="grid sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Busque</h3>
              <p className="text-gray-600 text-sm">
                Encontre empresas pelo servico que precisa ou navegue pelas categorias
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">2. Compare</h3>
              <p className="text-gray-600 text-sm">
                Veja avaliacoes, portfolios e informacoes de cada empresa
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Contrate</h3>
              <p className="text-gray-600 text-sm">
                Entre em contato diretamente com a empresa escolhida
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-12 bg-primary-600">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white">{stats.total_companies || 150}+</div>
              <div className="text-primary-200 text-sm mt-1">Empresas cadastradas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{stats.total_services || 300}+</div>
              <div className="text-primary-200 text-sm mt-1">Servicos disponiveis</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{stats.total_reviews || 500}+</div>
              <div className="text-primary-200 text-sm mt-1">Avaliacoes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">98%</div>
              <div className="text-primary-200 text-sm mt-1">Satisfacao</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA for companies */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-gray-100">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full mb-4">
                  Para empresas
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Cadastre sua empresa gratuitamente
                </h2>
                <p className="text-gray-600 mb-6">
                  Aumente sua visibilidade e conquiste novos clientes.
                  Milhares de pessoas buscam servicos todos os dias.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Cadastro 100% gratuito
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Perfil completo com portfolio
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Receba contatos de clientes
                  </li>
                </ul>
              </div>
              <div className="flex-shrink-0">
                <Link
                  to="/register/empresa"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-lg"
                >
                  Cadastrar minha empresa
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
