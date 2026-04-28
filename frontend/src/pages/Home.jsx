import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Search, Star, ChevronRight, Building2, Wrench,
  Paintbrush, Shield, Sparkles, Zap, Leaf, CheckCircle,
  ArrowRight, Users, TrendingUp, Award, LayoutDashboard, MessageSquare
} from 'lucide-react'
import PublicHeader from '../components/layout/PublicHeader'
import PublicFooter from '../components/layout/PublicFooter'
import { useSettings } from '../contexts/SettingsContext'
import api from '../services/api'

export default function Home() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const { isAuthenticated, user, initialized } = useSelector((state) => state.auth)
  const { settings } = useSettings()
  const isLoggedIn = initialized && isAuthenticated

  const [platformStats, setPlatformStats] = useState({
    total_companies: 0,
    total_clients: 0,
    total_deals: 0,
    completed_deals: 0,
  })

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await api.get('/public/stats')
        const data = response.data?.data || response.data || {}
        setPlatformStats({
          total_companies: data.total_companies || 0,
          total_clients: data.total_clients || 0,
          total_deals: data.total_deals || 0,
          completed_deals: data.completed_deals || 0,
        })
      } catch (_error) {
        // Use default zeros on error
      }
    }
    loadStats()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/empresas?q=${searchTerm}`)
  }

  const stats = [
    { value: platformStats.total_companies, label: 'Empresas Cadastradas', icon: Building2 },
    { value: platformStats.total_clients, label: 'Clientes Ativos', icon: Users },
    { value: platformStats.completed_deals, label: 'Servicos Realizados', icon: TrendingUp },
    { value: platformStats.total_deals, label: 'Total Negociacoes', icon: MessageSquare },
  ]

  const categories = [
    { name: 'Manutencao', icon: Wrench, color: 'bg-slate-700' },
    { name: 'Limpeza', icon: Sparkles, color: 'bg-emerald-600' },
    { name: 'Seguranca', icon: Shield, color: 'bg-red-600' },
    { name: 'Pintura', icon: Paintbrush, color: 'bg-orange-600' },
    { name: 'Jardinagem', icon: Leaf, color: 'bg-green-600' },
    { name: 'Eletrica', icon: Zap, color: 'bg-amber-600' },
  ]

  const testimonials = [
    { name: 'Carlos Silva', role: 'Empresario', company: 'Tech Solutions', text: 'Encontrei o eletricista perfeito em menos de 1 hora. Servico excelente!', avatar: 'CS' },
    { name: 'Ana Paula', role: 'Gerente', company: 'Loja Central', text: 'A plataforma facilitou muito encontrar profissionais qualificados.', avatar: 'AP' },
    { name: 'Roberto Lima', role: 'Autonomo', company: 'Consultor', text: 'Ja contratamos mais de 10 servicos pela plataforma. Recomendo!', avatar: 'RL' },
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicHeader />

      {/* Hero Section */}
      <section className="pt-20 lg:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-80px)] py-12 lg:py-20">
            {/* Left - Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Award className="w-4 h-4" />
                {settings?.home?.hero_badge || 'Marketplace #1 de Servicos'}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] mb-6">
                {settings?.home?.hero_title || 'Encontre os melhores profissionais para seu projeto'}
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {settings?.home?.hero_subtitle || 'Conectamos voce aos prestadores de servicos mais qualificados do mercado. Rapido, seguro e 100% gratuito.'}
              </p>

              {/* Search Box */}
              <form onSubmit={handleSearch} className="mb-8">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="O que voce precisa? Ex: Eletricista, Pintor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 text-gray-900 placeholder-gray-400 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-8 py-4 bg-gradient-to-r from-slate-800 to-slate-900 text-white font-semibold rounded-xl hover:from-slate-900 hover:to-black transition-all flex items-center gap-2"
                  >
                    Buscar
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </form>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Empresas verificadas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Sem taxas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Suporte 24/7</span>
                </div>
              </div>
            </div>

            {/* Right - Stats Cards */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className={`bg-white rounded-2xl p-6 border border-gray-100 shadow-lg shadow-gray-100/50 ${
                      index === 1 ? 'translate-y-4' : ''
                    } ${index === 3 ? 'translate-y-4' : ''}`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                      index === 0 ? 'bg-slate-100 text-slate-700' :
                      index === 1 ? 'bg-green-100 text-green-600' :
                      index === 2 ? 'bg-purple-100 text-purple-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Floating badge */}
              {platformStats.total_companies > 0 && (
                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-4 shadow-lg border border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Plataforma Ativa</div>
                    <div className="text-xs text-gray-500">{platformStats.total_companies} empresas</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Logos Section */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 mb-8">Empresas que confiam no ServicePro</p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-60">
            {['Grupo Lello', 'CBRE', 'Cushman', 'JLL', 'Brookfield', 'Cyrela'].map((name) => (
              <div key={name} className="text-xl font-bold text-gray-400">{name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categorias" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Servicos para todas as necessidades
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Encontre profissionais qualificados em diversas categorias
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={`/empresas?categoria=${category.name.toLowerCase()}`}
                className="group p-6 bg-white border border-gray-200 rounded-2xl hover:border-slate-400 hover:shadow-xl hover:shadow-slate-100/50 transition-all text-center"
              >
                <div className={`w-14 h-14 ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <category.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/empresas"
              className="inline-flex items-center gap-2 text-slate-800 font-semibold hover:text-slate-900 transition-colors"
            >
              Ver todas as categorias
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="como-funciona" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Simples, rapido e sem burocracia
              </h2>
              <p className="text-xl text-gray-600 mb-10">
                Em apenas 3 passos voce encontra o profissional ideal para seu projeto.
              </p>

              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Busque o servico</h3>
                    <p className="text-gray-600">Digite o que precisa ou navegue pelas categorias disponiveis.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Compare empresas</h3>
                    <p className="text-gray-600">Veja avaliacoes, portfolios e precos de cada prestador.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Contrate com seguranca</h3>
                    <p className="text-gray-600">Entre em contato e feche negocio direto com a empresa.</p>
                  </div>
                </div>
              </div>

              <Link
                to="/empresas"
                className="inline-flex items-center gap-2 mt-10 px-6 py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white font-semibold rounded-xl hover:from-slate-900 hover:to-black transition-all"
              >
                Comecar agora
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="relative">
              <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-gray-200/50 border border-gray-100">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                    <Wrench className="w-7 h-7 text-slate-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Exemplo de Empresa</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>Avaliacoes verificadas</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tempo de resposta</span>
                    <span className="font-medium text-gray-900">~2 horas</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Servicos realizados</span>
                    <span className="font-medium text-gray-900">234</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Cliente desde</span>
                    <span className="font-medium text-gray-900">2022</span>
                  </div>
                </div>
                <Link
                  to="/empresas"
                  className="block w-full mt-6 py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white font-semibold rounded-xl hover:from-slate-900 hover:to-black transition-all text-center"
                >
                  Solicitar orcamento
                </Link>
              </div>

              {/* Decorative elements */}
              <div className="absolute -z-10 top-8 -right-8 w-full h-full bg-slate-200 rounded-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-xl text-gray-600">
              Milhares de clientes ja usam o ServicePro
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-slate-700 to-slate-900 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role} - {testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-primary/90 to-primary/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {isLoggedIn ? (
            <>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Encontre o profissional ideal agora
              </h2>
              <p className="text-xl text-white/80 mb-10">
                Explore nossa lista de empresas verificadas e solicite orcamentos
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/empresas"
                  className="px-8 py-4 bg-white text-primary font-semibold rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Encontrar Empresas
                </Link>
                <Link
                  to="/dashboard"
                  className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/30 flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Meu Painel
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                {settings?.home?.cta_title || 'Pronto para encontrar o profissional ideal?'}
              </h2>
              <p className="text-xl text-white/80 mb-10">
                {settings?.home?.cta_subtitle || (platformStats.total_clients > 0
                  ? `Junte-se a ${platformStats.total_clients} clientes que ja usam a plataforma`
                  : 'Cadastre-se gratuitamente e encontre profissionais qualificados')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register/cliente"
                  className="px-8 py-4 bg-white text-primary font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  {settings?.home?.cta_button || 'Comecar Agora'}
                </Link>
                <Link
                  to="/register/empresa"
                  className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/30"
                >
                  {settings?.home?.hero_cta_secondary || 'Sou Prestador'}
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
