import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../services/api'
import { setUser } from '../store/slices/authSlice'

export default function Dashboard() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dismissedBanner, setDismissedBanner] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [dealsRes, ordersRes, userRes] = await Promise.all([
        api.get('/deals', { params: { per_page: 5 } }),
        api.get('/orders', { params: { per_page: 5 } }),
        api.get('/users/me'),
      ])

      setStats({
        deals: dealsRes.data,
        orders: ordersRes.data,
      })

      // Update user with profile completion data
      if (userRes.data?.data) {
        dispatch(setUser(userRes.data.data))
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusConfig = (status) => {
    const config = {
      aberto: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
      negociando: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
      aceito: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
      concluido: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
      rejeitado: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
      pendente: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
      aprovado: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    }
    return config[status] || { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500 text-sm">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  const dealsCount = stats?.deals?.meta?.total || stats?.deals?.data?.length || 0
  const ordersCount = stats?.orders?.meta?.total || stats?.orders?.data?.length || 0

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gray-900 rounded-2xl p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
              <span>Bom dia</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
              Ola, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-gray-400 max-w-lg">
              {user?.type === 'empresa' && 'Gerencie seus servicos, acompanhe negociacoes e cresca seu negocio na plataforma.'}
              {user?.type === 'cliente' && 'Encontre os melhores prestadores de servicos para seu condominio com seguranca.'}
              {user?.type === 'admin' && 'Acompanhe todas as atividades e gerencie a plataforma de forma centralizada.'}
            </p>
          </div>

          <div className="flex gap-3">
            {user?.type === 'cliente' && (
              <Link
                to="/services"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                Buscar servicos
              </Link>
            )}
            {user?.type === 'empresa' && (
              <Link
                to="/my-services/new"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Cadastrar servico
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Profile Completion Banner */}
      {user?.profile_completion && user.profile_completion.percentage < 100 && !dismissedBanner && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 relative">
          <button
            onClick={() => setDismissedBanner(true)}
            className="absolute top-4 right-4 text-amber-400 hover:text-amber-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Complete seu perfil</h3>
                  <p className="text-sm text-amber-700">Quanto mais completo, mais resultados!</p>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4">
                Perfis completos tem ate 3x mais chances de fechar negocios. Quanto mais informacoes, mais confianca voce transmite!
              </p>

              {/* Progress Bar */}
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-amber-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${user.profile_completion.percentage}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-amber-700 min-w-[3rem]">
                  {user.profile_completion.percentage}%
                </span>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                {user.profile_completion.completed} de {user.profile_completion.total} campos preenchidos
              </p>
            </div>

            <Link
              to="/profile"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              Completar perfil
            </Link>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
              </svg>
            </div>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">Ativo</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{dealsCount}</p>
          <p className="text-sm text-gray-500 mt-1">Negociacoes</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">Ativo</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{ordersCount}</p>
          <p className="text-sm text-gray-500 mt-1">Ordens</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {user?.type === 'empresa' ? 'Prestador' : user?.type === 'cliente' ? 'Sindico' : 'Admin'}
          </p>
          <p className="text-sm text-gray-500 mt-1">Tipo de conta</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <p className="text-lg font-bold text-gray-900">Ativo</p>
          </div>
          <p className="text-sm text-gray-500 mt-1">Status da conta</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Acesso Rapido</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {user?.type === 'cliente' && (
            <>
              <Link to="/services" className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </div>
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-gray-400 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Buscar Servicos</h3>
                <p className="text-sm text-gray-500">Encontre prestadores qualificados</p>
              </Link>

              <Link to="/deals" className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                    </svg>
                  </div>
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-gray-400 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Negociacoes</h3>
                <p className="text-sm text-gray-500">Acompanhe suas conversas</p>
              </Link>

              <Link to="/orders" className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                    </svg>
                  </div>
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-gray-400 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Minhas Ordens</h3>
                <p className="text-sm text-gray-500">Acompanhe o status dos pedidos</p>
              </Link>
            </>
          )}

          {user?.type === 'empresa' && (
            <>
              <Link to="/my-services" className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                    </svg>
                  </div>
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-gray-400 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Meus Servicos</h3>
                <p className="text-sm text-gray-500">Gerencie seu catalogo</p>
              </Link>

              <Link to="/deals" className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                    </svg>
                  </div>
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-gray-400 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Propostas</h3>
                <p className="text-sm text-gray-500">Veja solicitacoes recebidas</p>
              </Link>

              <Link to="/ranking" className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                    </svg>
                  </div>
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-gray-400 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Ranking</h3>
                <p className="text-sm text-gray-500">Veja sua posicao no mercado</p>
              </Link>
            </>
          )}

          {user?.type === 'admin' && (
            <>
              <Link to="/admin/users" className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                  </div>
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-gray-400 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Usuarios</h3>
                <p className="text-sm text-gray-500">Gerenciar contas</p>
              </Link>

              <Link to="/admin/orders" className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                    </svg>
                  </div>
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-gray-400 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Ordens</h3>
                <p className="text-sm text-gray-500">Aprovar e gerenciar</p>
              </Link>

              <Link to="/admin/plans" className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                    </svg>
                  </div>
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-gray-400 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Planos</h3>
                <p className="text-sm text-gray-500">Configurar assinaturas</p>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Deals */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Negociacoes Recentes</h3>
            </div>
            <Link to="/deals" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Ver todas
            </Link>
          </div>
          <div>
            {stats?.deals?.data?.length > 0 ? (
              stats.deals.data.slice(0, 4).map((deal, index) => {
                const statusConfig = getStatusConfig(deal.status)
                return (
                  <Link
                    key={deal.id}
                    to={`/chat/${deal.id}`}
                    className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${
                      index < stats.deals.data.slice(0, 4).length - 1 ? 'border-b border-gray-50' : ''
                    }`}
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-semibold text-gray-600">
                      {(deal.service?.title || 'S').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {deal.service?.title || 'Servico'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.type === 'empresa' ? deal.anon_handle_b : deal.anon_handle_a}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusConfig.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                      <span className={`text-xs font-medium ${statusConfig.text}`}>{deal.status}</span>
                    </div>
                  </Link>
                )
              })
            ) : (
              <div className="py-12 px-6 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900">Nenhuma negociacao</p>
                <p className="text-xs text-gray-500 mt-1">Suas conversas aparecerao aqui</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Ordens Recentes</h3>
            </div>
            <Link to="/orders" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Ver todas
            </Link>
          </div>
          <div>
            {stats?.orders?.data?.length > 0 ? (
              stats.orders.data.slice(0, 4).map((order, index) => {
                const statusConfig = getStatusConfig(order.status)
                return (
                  <div
                    key={order.id}
                    className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${
                      index < stats.orders.data.slice(0, 4).length - 1 ? 'border-b border-gray-50' : ''
                    }`}
                  >
                    <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-xs font-bold text-white">
                      #{order.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        Ordem #{order.id}
                      </p>
                      <p className="text-xs text-gray-500">
                        R$ {parseFloat(order.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusConfig.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                      <span className={`text-xs font-medium ${statusConfig.text}`}>{order.status}</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="py-12 px-6 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900">Nenhuma ordem</p>
                <p className="text-xs text-gray-500 mt-1">Suas ordens aparecerao aqui</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
