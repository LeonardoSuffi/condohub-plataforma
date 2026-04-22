import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { STORAGE_URL } from '@/lib/config'
import {
  Search,
  MapPin,
  Star,
  Building2,
  X,
  Grid,
  List,
  Filter,
  ChevronRight,
  Briefcase,
  Award,
  Sparkles,
  ArrowRight,
  Lightbulb,
  Shield,
  TrendingUp,
} from 'lucide-react'
import api from '@/services/api'
import PublicHeader from '@/components/layout/PublicHeader'
import PublicFooter from '@/components/layout/PublicFooter'

export default function CompanyList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [companies, setCompanies] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('relevante')
  const { isAuthenticated, user, initialized } = useSelector((state) => state.auth)
  const isLoggedIn = initialized && isAuthenticated && user

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    categoria: searchParams.get('categoria') || '',
    cidade: searchParams.get('cidade') || '',
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.q) params.set('q', filters.q)
    if (filters.categoria) params.set('categoria', filters.categoria)
    if (filters.cidade) params.set('cidade', filters.cidade)
    setSearchParams(params)
  }, [filters])

  const loadData = async () => {
    try {
      setLoading(true)
      const [companiesRes, categoriesRes] = await Promise.all([
        api.get('/public/companies', { params: filters }).catch(() => ({ data: { data: { data: [] } } })),
        api.get('/public/categories').catch(() => ({ data: { data: [] } }))
      ])
      const companiesData = companiesRes.data.data?.data || companiesRes.data.data || []
      setCompanies(companiesData)
      setCategories(categoriesRes.data.data?.filter(c => !c.parent_id) || [])
    } catch (_error) {
      // Silently handle error loading data
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    loadData()
  }

  const clearFilters = () => {
    setFilters({ q: '', categoria: '', cidade: '' })
  }

  const hasActiveFilters = filters.categoria || filters.cidade

  const defaultCategories = [
    { id: 1, name: 'Manutencao', slug: 'manutencao' },
    { id: 2, name: 'Pintura', slug: 'pintura' },
    { id: 3, name: 'Seguranca', slug: 'seguranca' },
    { id: 4, name: 'Limpeza', slug: 'limpeza' },
    { id: 5, name: 'Jardinagem', slug: 'jardinagem' },
    { id: 6, name: 'Eletrica', slug: 'eletrica' },
  ]

  const displayCategories = categories.length > 0 ? categories : defaultCategories
  const displayCompanies = companies

  const storageUrl = STORAGE_URL

  // Stats
  const totalCompanies = displayCompanies.length
  const avgRating = displayCompanies.length > 0
    ? (displayCompanies.reduce((acc, c) => acc + parseFloat(c.average_rating || 5), 0) / displayCompanies.length).toFixed(1)
    : '5.0'
  const totalServices = displayCompanies.reduce((acc, c) => acc + (c.services_count || 0), 0)

  return (
    <>
      <PublicHeader />
      <div className="min-h-screen bg-gray-50 pt-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Animated Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/30 via-indigo-500/20 to-transparent rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: '4s' }}
          />
          <div
            className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-violet-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: '5s', animationDelay: '1s' }}
          />
        </div>

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 backdrop-blur-sm rounded-full border border-blue-400/30 mb-6">
              <Building2 className="w-4 h-4 text-blue-300" />
              <span className="text-blue-300 text-sm font-medium">
                {totalCompanies} empresas cadastradas
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Encontre a Empresa <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Ideal</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Conecte-se com as melhores empresas de servicos para seu condominio
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2 border border-white/10">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou servico..."
                    value={filters.q}
                    onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-white rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                  />
                </div>
                <div className="sm:w-48 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cidade"
                    value={filters.cidade}
                    onChange={(e) => setFilters({ ...filters, cidade: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-white rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  <span className="hidden sm:inline">Buscar</span>
                </button>
              </div>
            </div>
          </form>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Empresas</p>
                  <p className="text-xl font-bold text-white">{totalCompanies}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Avaliacao Media</p>
                  <p className="text-xl font-bold text-white">{avgRating}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Servicos</p>
                  <p className="text-xl font-bold text-white">{totalServices}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center">
                  <Award className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Categorias</p>
                  <p className="text-xl font-bold text-white">{displayCategories.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1 space-y-6">
            {/* Categories */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-blue-600" />
                Categorias
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setFilters({ ...filters, categoria: '' })}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all ${
                    !filters.categoria
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="font-medium">Todas</span>
                  {!filters.categoria && <ChevronRight className="w-4 h-4" />}
                </button>
                {displayCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setFilters({ ...filters, categoria: cat.slug })
                      loadData()
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all ${
                      filters.categoria === cat.slug
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="font-medium">{cat.name}</span>
                    {filters.categoria === cat.slug && <ChevronRight className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-blue-600" />
                Dicas
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Verifique as avaliacoes antes de contratar</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Compare orcamentos de diferentes empresas</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Prefira empresas com mais servicos concluidos</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Main Column - Companies */}
          <div className="lg:col-span-3 space-y-6">
            {/* Toolbar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-900">{displayCompanies.length}</span> empresas
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                      Limpar filtros
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 bg-gray-100 border-0 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="relevante">Mais relevantes</option>
                    <option value="avaliacao">Melhor avaliados</option>
                    <option value="servicos">Mais servicos</option>
                  </select>
                </div>
              </div>

              {/* Active filters pills */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  {filters.categoria && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {filters.categoria}
                      <button onClick={() => setFilters({ ...filters, categoria: '' })} className="hover:text-blue-900">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  )}
                  {filters.cidade && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      <MapPin className="w-3.5 h-3.5" />
                      {filters.cidade}
                      <button onClick={() => setFilters({ ...filters, cidade: '' })} className="hover:text-blue-900">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Companies Grid/List */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="mt-4 text-gray-500">Buscando empresas...</p>
              </div>
            ) : displayCompanies.length > 0 ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
                {displayCompanies.map((company) => (
                  <CompanyCard key={company.id} company={company} viewMode={viewMode} storageUrl={storageUrl} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma empresa encontrada</h3>
                <p className="text-gray-500 mb-6">Tente ajustar os filtros ou buscar por outro termo</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
                >
                  Limpar filtros
                </button>
              </div>
            )}

            {/* CTA Banner - only show when not logged in */}
            {!isLoggedIn && (
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute -top-20 -right-20 w-[300px] h-[300px] bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-2xl" />
                </div>
                <div className="relative text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3">
                    Tem uma empresa de servicos?
                  </h2>
                  <p className="text-slate-400 mb-6 max-w-md mx-auto">
                    Cadastre-se gratuitamente e seja encontrado por milhares de condominios
                  </p>
                  <Link
                    to="/register/empresa"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-800 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    Cadastrar minha empresa
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
    </>
  )
}

function CompanyCard({ company, viewMode, storageUrl }) {
  const rating = company.average_rating ? parseFloat(company.average_rating).toFixed(1) : null
  const servicesCount = company.services_count || 0
  const logoUrl = company.logo_url || null
  const coverUrl = company.cover_url || null

  if (viewMode === 'list') {
    return (
      <Link
        to={`/empresa/${company.slug || company.id}`}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300 group flex"
      >
        {/* Cover/Logo Section */}
        <div className="w-32 h-full flex-shrink-0 relative bg-gradient-to-br from-gray-100 to-gray-200">
          {coverUrl ? (
            <img src={coverUrl} alt="" className="w-full h-full object-cover" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
          <div className="absolute bottom-3 left-3">
            <div className="w-12 h-12 bg-white rounded-xl shadow-lg overflow-hidden border-2 border-white">
              {logoUrl ? (
                <img src={logoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold">
                  {(company.nome_fantasia || 'E').charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 p-5 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                  {company.nome_fantasia}
                </h3>
                {company.verified && (
                  <Shield className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                )}
              </div>
              {company.cidade && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {company.cidade}{company.estado ? `, ${company.estado}` : ''}
                </p>
              )}
            </div>
            {rating && (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 rounded-lg flex-shrink-0">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-bold text-amber-700">{rating}</span>
              </div>
            )}
          </div>

          {/* Services tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {(company.services_list || []).slice(0, 3).map((service, idx) => (
              <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                {service}
              </span>
            ))}
            {(company.services_list || []).length > 3 && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">
                +{company.services_list.length - 3}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                {servicesCount} servicos
              </span>
              {company.deals_completed_count > 0 && (
                <span className="flex items-center gap-1 text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                  {company.deals_completed_count} concluidos
                </span>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </Link>
    )
  }

  // Grid view - same layout as Dashboard CompanyCardModern
  return (
    <Link
      to={`/empresa/${company.slug || company.id}`}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 hover:-translate-y-1 group relative"
    >
      {/* Header with Cover Image */}
      <div className="h-24 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden rounded-t-2xl">
        {coverUrl && (
          <img src={coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
        {coverUrl && <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />}

        {/* Badges */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {rating && (
            <div className="flex items-center gap-1 px-2 py-1 bg-black/30 backdrop-blur-sm rounded-lg">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-white text-sm font-medium">{rating}</span>
            </div>
          )}
        </div>

        {company.verified && (
          <div className="absolute top-3 left-3 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
            <Shield className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Logo - fora do container com overflow */}
      <div className="absolute top-[4.5rem] left-4 z-10">
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

      {/* Content */}
      <div className="pt-10 px-4 pb-4">
        <h3 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
          {company.nome_fantasia}
        </h3>
        {company.cidade && (
          <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" />
            {company.cidade}{company.estado ? `, ${company.estado}` : ''}
          </p>
        )}

        {/* Services tags */}
        {(company.services_list || []).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {company.services_list.slice(0, 2).map((service, idx) => (
              <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                {service}
              </span>
            ))}
            {company.services_list.length > 2 && (
              <span className="text-xs text-gray-400">+{company.services_list.length - 2}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">{servicesCount} servicos</span>
          {company.deals_completed_count > 0 && (
            <span className="text-xs text-emerald-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {company.deals_completed_count}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
