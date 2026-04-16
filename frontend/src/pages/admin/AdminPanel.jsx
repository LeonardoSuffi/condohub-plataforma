import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

export default function AdminPanel() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await api.get('/admin/finance')
      setStats(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar estatisticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
        <p className="text-gray-500 mt-1">Visao geral da plataforma</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Receita Total</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats?.revenue?.total)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Comissoes</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats?.revenue?.from_commissions)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Assinaturas</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats?.revenue?.from_subscriptions)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total de Ordens</p>
              <p className="text-xl font-bold text-gray-900">{stats?.orders?.total || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Summary */}
      {stats?.orders && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Status das Ordens</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
              <p className="text-2xl font-bold text-yellow-600">{stats.orders.pending}</p>
              <p className="text-sm text-gray-600 mt-1">Pendentes</p>
            </div>
            <div className="text-center p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-2xl font-bold text-blue-600">{stats.orders.approved}</p>
              <p className="text-sm text-gray-600 mt-1">Aprovadas</p>
            </div>
            <div className="text-center p-4 bg-green-50 border border-green-100 rounded-xl">
              <p className="text-2xl font-bold text-green-600">{stats.orders.completed}</p>
              <p className="text-sm text-gray-600 mt-1">Concluidas</p>
            </div>
            <div className="text-center p-4 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-2xl font-bold text-red-600">{stats.orders.rejected}</p>
              <p className="text-sm text-gray-600 mt-1">Rejeitadas</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acesso Rapido</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link to="/admin/users" className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-gray-900 group-hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Usuarios</h3>
            <p className="text-sm text-gray-500 mt-1">Gerenciar usuarios</p>
          </Link>

          <Link to="/admin/orders" className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-gray-900 group-hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Ordens</h3>
            <p className="text-sm text-gray-500 mt-1">Aprovar ordens</p>
          </Link>

          <Link to="/admin/plans" className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-gray-900 group-hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Planos</h3>
            <p className="text-sm text-gray-500 mt-1">Gerenciar planos</p>
          </Link>

          <Link to="/admin/finance" className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-gray-900 group-hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Financeiro</h3>
            <p className="text-sm text-gray-500 mt-1">Ver transacoes</p>
          </Link>

          <Link to="/admin/banners" className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-gray-900 group-hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Banners</h3>
            <p className="text-sm text-gray-500 mt-1">Gerenciar banners</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
