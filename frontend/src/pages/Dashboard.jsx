import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../services/api'
import { setUser } from '../store/slices/authSlice'
import {
  Search,
  ChevronRight,
  Building2,
  MessageSquare,
  MapPin,
  Briefcase,
  Users,
  TrendingUp,
  ArrowRight,
  Plus,
  Trophy,
  Star,
  Settings,
  Bell,
  CheckCircle,
  Clock,
  Eye,
} from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [categories, setCategories] = useState([])
  const [companies, setCompanies] = useState([])
  const [recentDeals, setRecentDeals] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const requests = [
        api.get('/public/categories').catch(() => ({ data: { data: [] } })),
        api.get('/public/companies', { params: { per_page: 6, featured: true } }).catch(() => ({ data: { data: [] } })),
        api.get('/deals', { params: { per_page: 5 } }).catch(() => ({ data: { data: [] } })),
        api.get('/users/me').catch(() => ({ data: { data: null } })),
      ]

      const [catRes, compRes, dealsRes, userRes] = await Promise.all(requests)

      setCategories(catRes.data.data || [])
      setCompanies(compRes.data.data || [])
      setRecentDeals(dealsRes.data.data || [])

      if (userRes.data?.data) {
        dispatch(setUser(userRes.data.data))
      }

      // Calculate stats from deals
      const deals = dealsRes.data.data || []
      setStats({
        total_deals: dealsRes.data?.meta?.total || deals.length,
        pending_deals: deals.filter(d => d.status === 'pending').length,
        active_deals: deals.filter(d => ['active', 'in_progress'].includes(d.status)).length,
        completed_deals: deals.filter(d => d.status === 'completed').length,
      })
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/empresas?q=${searchTerm}`)
  }

  const parentCategories = categories.filter(c => !c.parent_id)

  const getDealStatusBadge = (status) => {
    const styles = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendente' },
      active: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Ativo' },
      in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Em Andamento' },
      completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Concluido' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelado' },
    }
    const style = styles[status] || styles.pending
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-primary-200 text-sm mb-1">
                {user?.type === 'empresa' ? 'Area do Parceiro' :
                 user?.type === 'admin' ? 'Painel Administrativo' :
                 'Area do Cliente'}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Ola, {user?.name?.split(' ')[0]}!
              </h1>
              <p className="text-primary-100 mt-1">
                {user?.type === 'empresa' ? 'Gerencie suas negociacoes e servicos' :
                 user?.type === 'admin' ? 'Gerencie a plataforma' :
                 'Encontre os melhores profissionais para seu condominio'}
              </p>
            </div>

            {/* Quick Action */}
            {user?.type === 'cliente' && (
              <Link
                to="/empresas"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-lg"
              >
                <Search className="w-5 h-5" />
                Buscar Empresas
              </Link>
            )}
            {user?.type === 'empresa' && (
              <Link
                to="/my-services/new"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Cadastrar Servico
              </Link>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 bg-gray-50">
          <div className="px-4 py-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total_deals || 0}</div>
            <div className="text-sm text-gray-500">Total Negociacoes</div>
          </div>
          <div className="px-4 py-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending_deals || 0}</div>
            <div className="text-sm text-gray-500">Pendentes</div>
          </div>
          <div className="px-4 py-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.active_deals || 0}</div>
            <div className="text-sm text-gray-500">Em Andamento</div>
          </div>
          <div className="px-4 py-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed_deals || 0}</div>
            <div className="text-sm text-gray-500">Concluidos</div>
          </div>
        </div>
      </div>

      {/* Search for Cliente */}
      {user?.type === 'cliente' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">O que voce precisa?</h2>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar servicos... Ex: Eletricista, Pintor, Limpeza..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-gray-900 placeholder-gray-500 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
            >
              Buscar
            </button>
          </form>

          {/* Quick categories */}
          {parentCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {parentCategories.slice(0, 6).map((category) => (
                <Link
                  key={category.id}
                  to={`/empresas?categoria=${category.slug}`}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-full hover:bg-primary-100 hover:text-primary-700 transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recent Deals */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Negociacoes Recentes</h2>
          <Link to="/deals" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
            Ver todas <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {recentDeals.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {recentDeals.map((deal) => (
              <Link
                key={deal.id}
                to={`/chat/${deal.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 truncate">
                      {deal.service?.title || deal.title || 'Negociacao'}
                    </h3>
                    {getDealStatusBadge(deal.status)}
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-0.5">
                    {user?.type === 'empresa'
                      ? `Cliente: ${deal.client?.name || 'Aguardando aprovacao'}`
                      : `Empresa: ${deal.company?.nome_fantasia || deal.company?.name || 'N/A'}`
                    }
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm text-gray-500">
                    {deal.created_at ? new Date(deal.created_at).toLocaleDateString('pt-BR') : ''}
                  </p>
                  {deal.unread_messages > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-primary-600 text-white text-xs rounded-full mt-1">
                      {deal.unread_messages}
                    </span>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-900 font-medium mb-1">Nenhuma negociacao</h3>
            <p className="text-gray-500 text-sm mb-4">
              {user?.type === 'cliente'
                ? 'Comece buscando empresas para seus servicos'
                : 'Aguarde contato de clientes interessados'
              }
            </p>
            {user?.type === 'cliente' && (
              <Link
                to="/empresas"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Search className="w-4 h-4" />
                Buscar Empresas
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Featured Companies for Cliente */}
      {user?.type === 'cliente' && companies.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Empresas em Destaque</h2>
            <Link to="/empresas" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              Ver todas <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {companies.slice(0, 3).map((company) => (
              <Link
                key={company.id}
                to={`/empresa/${company.slug || company.id}`}
                className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                  {company.logo_url ? (
                    <img src={company.logo_url} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span className="text-lg font-bold text-primary-600">
                      {(company.nome_fantasia || company.name)?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                    {company.nome_fantasia || company.name}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">{company.segmento || 'Servicos'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {company.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="text-sm font-medium text-gray-700">{company.rating}</span>
                      </div>
                    )}
                    {company.cidade && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {company.cidade}
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 flex-shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions for Empresa */}
      {user?.type === 'empresa' && (
        <div className="grid sm:grid-cols-3 gap-4">
          <Link
            to="/my-services"
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-primary-300 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
              <Briefcase className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Meus Servicos</h3>
            <p className="text-sm text-gray-500">Gerencie seus servicos cadastrados</p>
          </Link>

          <Link
            to="/deals"
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-primary-300 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Negociacoes</h3>
            <p className="text-sm text-gray-500">Veja e responda clientes</p>
          </Link>

          <Link
            to="/ranking"
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-primary-300 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-200 transition-colors">
              <Trophy className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Ranking</h3>
            <p className="text-sm text-gray-500">Veja sua posicao no ranking</p>
          </Link>
        </div>
      )}

      {/* Quick Actions for Admin */}
      {user?.type === 'admin' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/users"
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-primary-300 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Usuarios</h3>
            <p className="text-sm text-gray-500">Gerenciar usuarios</p>
          </Link>

          <Link
            to="/admin/categories"
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-primary-300 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Categorias</h3>
            <p className="text-sm text-gray-500">Gerenciar categorias</p>
          </Link>

          <Link
            to="/admin/plans"
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-primary-300 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-200 transition-colors">
              <Trophy className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Planos</h3>
            <p className="text-sm text-gray-500">Gerenciar planos</p>
          </Link>

          <Link
            to="/admin/banners"
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-primary-300 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Banners</h3>
            <p className="text-sm text-gray-500">Gerenciar banners</p>
          </Link>
        </div>
      )}
    </div>
  )
}
