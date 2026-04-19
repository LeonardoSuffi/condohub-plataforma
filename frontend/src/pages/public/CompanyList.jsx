import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Search, MapPin, Star, Filter, ChevronDown, Building2, X,
  Wrench, Paintbrush, Shield, Sparkles, Zap, Leaf, Grid, List
} from 'lucide-react'
import api from '@/services/api'
import PublicHeader from '@/components/layout/PublicHeader'
import PublicFooter from '@/components/layout/PublicFooter'

export default function CompanyList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [companies, setCompanies] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('grid')

  // Filters state
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    categoria: searchParams.get('categoria') || '',
    cidade: searchParams.get('cidade') || '',
    rating: searchParams.get('rating') || '',
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Update URL when filters change
    const params = new URLSearchParams()
    if (filters.q) params.set('q', filters.q)
    if (filters.categoria) params.set('categoria', filters.categoria)
    if (filters.cidade) params.set('cidade', filters.cidade)
    if (filters.rating) params.set('rating', filters.rating)
    setSearchParams(params)
  }, [filters])

  const loadData = async () => {
    try {
      setLoading(true)
      const [companiesRes, categoriesRes] = await Promise.all([
        api.get('/public/companies', { params: filters }).catch(() => ({ data: { data: [] } })),
        api.get('/public/categories').catch(() => ({ data: { data: [] } }))
      ])
      setCompanies(companiesRes.data.data || [])
      setCategories(categoriesRes.data.data?.filter(c => !c.parent_id) || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    loadData()
  }

  const clearFilters = () => {
    setFilters({ q: '', categoria: '', cidade: '', rating: '' })
  }

  const hasActiveFilters = filters.categoria || filters.cidade || filters.rating

  // Default categories for display
  const defaultCategories = [
    { id: 1, name: 'Manutencao', slug: 'manutencao', icon: 'wrench' },
    { id: 2, name: 'Pintura', slug: 'pintura', icon: 'paintbrush' },
    { id: 3, name: 'Seguranca', slug: 'seguranca', icon: 'shield' },
    { id: 4, name: 'Limpeza', slug: 'limpeza', icon: 'sparkles' },
    { id: 5, name: 'Jardinagem', slug: 'jardinagem', icon: 'leaf' },
    { id: 6, name: 'Eletrica', slug: 'eletrica', icon: 'zap' },
  ]

  const displayCategories = categories.length > 0 ? categories : defaultCategories

  // Mock companies for display
  const mockCompanies = [
    { id: 1, nome_fantasia: 'FixTudo Manutencoes', cidade: 'Sao Paulo', estado: 'SP', rating: 4.8, total_reviews: 127, description: 'Especialistas em manutencao predial com mais de 10 anos de experiencia.', services: ['Manutencao', 'Reparos', 'Instalacoes'] },
    { id: 2, nome_fantasia: 'CleanPro Limpeza', cidade: 'Sao Paulo', estado: 'SP', rating: 4.9, total_reviews: 89, description: 'Limpeza profissional para condominios e empresas.', services: ['Limpeza', 'Conservacao'] },
    { id: 3, nome_fantasia: 'Seguranca Total', cidade: 'Campinas', estado: 'SP', rating: 4.7, total_reviews: 64, description: 'Solucoes completas em seguranca patrimonial.', services: ['Portaria', 'Monitoramento', 'CFTV'] },
    { id: 4, nome_fantasia: 'Verde Jardins', cidade: 'Santos', estado: 'SP', rating: 4.6, total_reviews: 43, description: 'Paisagismo e manutencao de areas verdes.', services: ['Jardinagem', 'Paisagismo'] },
    { id: 5, nome_fantasia: 'Eletro Master', cidade: 'Sao Paulo', estado: 'SP', rating: 4.8, total_reviews: 95, description: 'Instalacoes eletricas residenciais e comerciais.', services: ['Eletrica', 'Instalacoes'] },
    { id: 6, nome_fantasia: 'PintaFacil', cidade: 'Guarulhos', estado: 'SP', rating: 4.5, total_reviews: 56, description: 'Pintura predial e residencial de alta qualidade.', services: ['Pintura', 'Textura'] },
  ]

  const displayCompanies = companies.length > 0 ? companies : mockCompanies

  const getCategoryIcon = (iconName) => {
    const icons = { wrench: Wrench, paintbrush: Paintbrush, shield: Shield, sparkles: Sparkles, leaf: Leaf, zap: Zap }
    return icons[iconName] || Building2
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicHeader />

      {/* Header with search */}
      <section className="bg-white border-b border-gray-200 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            Encontre empresas
          </h1>

          {/* Search form */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou servico..."
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                className="w-full pl-12 pr-4 py-3 text-gray-900 placeholder-gray-500 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div className="sm:w-48 relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cidade"
                value={filters.cidade}
                onChange={(e) => setFilters({ ...filters, cidade: e.target.value })}
                className="w-full pl-12 pr-4 py-3 text-gray-900 placeholder-gray-500 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
            >
              Buscar
            </button>
          </form>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mt-6">
            <button
              onClick={() => setFilters({ ...filters, categoria: '' })}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !filters.categoria
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            {displayCategories.slice(0, 6).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilters({ ...filters, categoria: cat.slug })}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filters.categoria === cat.slug
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">{displayCompanies.length}</span> empresas encontradas
            </p>
            <div className="flex items-center gap-3">
              {/* View mode toggle */}
              <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Sort dropdown */}
              <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-primary-500">
                <option>Mais relevantes</option>
                <option>Melhor avaliados</option>
                <option>Mais avaliacoes</option>
              </select>
            </div>
          </div>

          {/* Active filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-sm text-gray-500">Filtros ativos:</span>
              {filters.categoria && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                  {filters.categoria}
                  <button onClick={() => setFilters({ ...filters, categoria: '' })}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              {filters.cidade && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                  {filters.cidade}
                  <button onClick={() => setFilters({ ...filters, cidade: '' })}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Limpar todos
              </button>
            </div>
          )}

          {/* Companies grid/list */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : displayCompanies.length > 0 ? (
            <div className={`grid gap-6 ${
              viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
            }`}>
              {displayCompanies.map((company) => (
                <Link
                  key={company.id}
                  to={`/empresa/${company.slug || company.id}`}
                  className={`bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                >
                  {/* Company header/avatar */}
                  <div className={`bg-gradient-to-br from-primary-500 to-primary-700 relative ${
                    viewMode === 'list' ? 'w-32 flex-shrink-0 flex items-center justify-center' : 'h-28'
                  }`}>
                    <div className={`bg-white rounded-xl shadow-lg flex items-center justify-center ${
                      viewMode === 'list' ? 'w-16 h-16' : 'w-16 h-16 absolute -bottom-8 left-4'
                    }`}>
                      <span className="text-2xl font-bold text-primary-600">
                        {(company.nome_fantasia || company.name || 'E').charAt(0)}
                      </span>
                    </div>
                  </div>

                  {/* Company info */}
                  <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : 'pt-12'}`}>
                    <h3 className="font-semibold text-gray-900 text-lg group-hover:text-primary-600 transition-colors">
                      {company.nome_fantasia || company.name}
                    </h3>

                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {company.cidade}, {company.estado}
                    </p>

                    {viewMode === 'list' && company.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {company.description || company.sobre}
                      </p>
                    )}

                    {/* Rating */}
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="text-sm font-semibold text-amber-700">
                          {company.rating || company.average_rating || '4.5'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        ({company.total_reviews || company.reviews_count || 0} avaliacoes)
                      </span>
                    </div>

                    {/* Services tags */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {(company.services || company.categories || ['Servicos']).slice(0, 3).map((service, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                          {typeof service === 'string' ? service : service.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma empresa encontrada</h3>
              <p className="text-gray-600 mb-6">Tente ajustar os filtros ou buscar por outro termo</p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-primary-600 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Tem uma empresa de servicos?
          </h2>
          <p className="text-primary-100 mb-6">
            Cadastre-se gratuitamente e seja encontrado por milhares de clientes
          </p>
          <Link
            to="/register/empresa"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
          >
            Cadastrar minha empresa
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
