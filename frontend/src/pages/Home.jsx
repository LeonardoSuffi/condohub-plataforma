import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../services/api'

export default function Home() {
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const [categories, setCategories] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [catRes, servRes] = await Promise.all([
        api.get('/public/categories'),
        api.get('/public/services', { params: { featured: 1, per_page: 8 } })
      ])
      setCategories(catRes.data.data || [])
      setServices(servRes.data.data || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (isAuthenticated) {
      navigate(`/services?search=${searchTerm}&category=${selectedCategory}`)
    } else {
      navigate('/login', { state: { from: `/services?search=${searchTerm}&category=${selectedCategory}` } })
    }
  }

  const handleViewService = (serviceId) => {
    if (isAuthenticated) {
      navigate(`/services/${serviceId}`)
    } else {
      navigate('/login', { state: { from: `/services/${serviceId}` } })
    }
  }

  const handleExploreCategory = (categorySlug) => {
    if (isAuthenticated) {
      navigate(`/services?category=${categorySlug}`)
    } else {
      navigate('/login', { state: { from: `/services?category=${categorySlug}` } })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold text-gray-900">CondoHub</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#como-funciona" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                Como Funciona
              </a>
              <a href="#categorias" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                Categorias
              </a>
              <a href="#servicos" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                Servicos
              </a>
            </nav>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Acessar Painel
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-700 text-sm font-medium hover:text-gray-900 transition-colors"
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Cadastrar
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Encontre os melhores
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                prestadores de servicos
              </span>
              para seu condominio
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Conectamos sindicos e administradoras aos melhores profissionais do mercado.
              Negocie com seguranca e transparencia.
            </p>

            {/* Search Box */}
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl p-2 shadow-2xl shadow-black/20 flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Buscar servicos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-gray-900 placeholder-gray-400 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-4 text-gray-700 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 min-w-[180px]"
                >
                  <option value="">Todas categorias</option>
                  {categories.filter(c => !c.parent_id).map((cat) => (
                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="px-8 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors whitespace-nowrap"
                >
                  Buscar
                </button>
              </div>
            </form>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white">500+</div>
                <div className="text-gray-400 text-sm mt-1">Empresas Cadastradas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white">2.000+</div>
                <div className="text-gray-400 text-sm mt-1">Servicos Disponiveis</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white">1.500+</div>
                <div className="text-gray-400 text-sm mt-1">Condominios Atendidos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white">98%</div>
                <div className="text-gray-400 text-sm mt-1">Satisfacao</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="como-funciona" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Como Funciona</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Em poucos passos voce encontra o prestador ideal para seu condominio
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="text-sm font-semibold text-blue-600 mb-2">Passo 1</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Pesquise</h3>
              <p className="text-gray-600">
                Busque por categoria, regiao ou tipo de servico. Encontre exatamente o que seu condominio precisa.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="text-sm font-semibold text-emerald-600 mb-2">Passo 2</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Negocie</h3>
              <p className="text-gray-600">
                Converse de forma anonima com as empresas. Seus dados ficam protegidos ate voce aceitar a proposta.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-sm font-semibold text-amber-600 mb-2">Passo 3</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Contrate</h3>
              <p className="text-gray-600">
                Aceite a melhor proposta e tenha acesso aos dados de contato. Simples, seguro e transparente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categorias" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Categorias de Servicos</h2>
            <p className="text-lg text-gray-600">Explore por categoria e encontre o servico ideal</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.filter(c => !c.parent_id).map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleExploreCategory(category.slug)}
                  className="group bg-white border border-gray-200 rounded-xl p-6 text-center hover:border-gray-900 hover:shadow-lg transition-all"
                >
                  <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-900 transition-colors">
                    <CategoryIcon name={category.icon} className="w-7 h-7 text-gray-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{category.name}</h3>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Services */}
      <section id="servicos" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Servicos em Destaque</h2>
              <p className="text-lg text-gray-600">Os servicos mais procurados da plataforma</p>
            </div>
            <button
              onClick={() => isAuthenticated ? navigate('/services') : navigate('/login')}
              className="mt-4 sm:mt-0 text-gray-900 font-semibold hover:underline flex items-center gap-1"
            >
              Ver todos
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : services.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-2xl font-bold text-gray-400">
                        {service.title?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {service.category?.name}
                      </span>
                      {service.featured && (
                        <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded">
                          Destaque
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{service.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900">
                        {service.price_range || 'Sob consulta'}
                      </span>
                      <button
                        onClick={() => handleViewService(service.id)}
                        className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        Ver mais
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Nenhum servico em destaque no momento
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Pronto para encontrar o servico ideal?
          </h2>
          <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
            Cadastre-se gratuitamente e comece a negociar com os melhores prestadores de servicos para seu condominio.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register/cliente"
              className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Sou Sindico / Administradora
            </Link>
            <Link
              to="/register/empresa"
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
            >
              Sou Prestador de Servicos
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-gray-900 font-bold text-lg">C</span>
                </div>
                <span className="text-xl font-bold text-white">CondoHub</span>
              </div>
              <p className="text-gray-400 text-sm">
                A plataforma que conecta condominios aos melhores prestadores de servicos.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Plataforma</h4>
              <ul className="space-y-2">
                <li><a href="#como-funciona" className="text-gray-400 hover:text-white text-sm transition-colors">Como Funciona</a></li>
                <li><a href="#categorias" className="text-gray-400 hover:text-white text-sm transition-colors">Categorias</a></li>
                <li><a href="#servicos" className="text-gray-400 hover:text-white text-sm transition-colors">Servicos</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Cadastre-se</h4>
              <ul className="space-y-2">
                <li><Link to="/register/cliente" className="text-gray-400 hover:text-white text-sm transition-colors">Sindico</Link></li>
                <li><Link to="/register/empresa" className="text-gray-400 hover:text-white text-sm transition-colors">Empresa</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Contato</h4>
              <ul className="space-y-2">
                <li><span className="text-gray-400 text-sm">contato@condohub.com.br</span></li>
                <li><span className="text-gray-400 text-sm">(11) 99999-9999</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              © 2024 CondoHub. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Category Icon Component
function CategoryIcon({ name, className }) {
  const icons = {
    tools: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
      </svg>
    ),
    broom: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
    shield: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    leaf: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.115 5.19l.319 1.913A6 6 0 008.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.723-.723a8.7 8.7 0 002.288-4.042 1.087 1.087 0 00-.358-1.099l-1.33-1.108c-.251-.21-.582-.299-.905-.245l-1.17.195a1.125 1.125 0 01-.98-.314l-.295-.295a1.125 1.125 0 010-1.591l.13-.132a1.125 1.125 0 011.3-.21l.603.302a.809.809 0 001.086-1.086L14.25 7.5l1.256-.837a4.5 4.5 0 001.528-1.732l.146-.292M6.115 5.19A9 9 0 1017.18 4.64M6.115 5.19A8.965 8.965 0 0112 3c1.929 0 3.716.607 5.18 1.64" />
      </svg>
    ),
    briefcase: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
      </svg>
    ),
    cpu: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
      </svg>
    ),
  }

  return icons[name] || icons.tools
}
