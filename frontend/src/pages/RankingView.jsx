import { useEffect, useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import api from '../services/api'
import { useSettings } from '../contexts/SettingsContext'
import {
  Trophy,
  Star,
  TrendingUp,
  Users,
  Award,
  Crown,
  Medal,
  Target,
  Zap,
  ChevronUp,
  ChevronDown,
  Minus,
  CheckCircle,
  DollarSign,
  Calendar,
  Flame,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react'

export default function RankingView() {
  const { user } = useSelector((state) => state.auth)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { getRankingConfig, isBenefitVisible, isTipVisible } = useSettings()

  const rankingConfig = useMemo(() => getRankingConfig(), [getRankingConfig])
  const scoring = rankingConfig.scoring || {}
  const showPodium = rankingConfig.show_podium !== false
  const showHowItWorks = rankingConfig.show_how_it_works !== false
  const showBenefits = rankingConfig.show_benefits !== false
  const showTips = rankingConfig.show_tips !== false
  const resetPeriod = rankingConfig.reset_period || 'semestral'

  // Get visible benefits and tips from config
  const visibleBenefits = (rankingConfig.benefits || []).filter(b => b.visible)
  const visibleTips = (rankingConfig.tips || []).filter(t => t.visible)

  useEffect(() => {
    loadRanking()
  }, [])

  const loadRanking = async () => {
    try {
      const response = await api.get('/ranking')
      setData(response.data.data)
    } catch (_error) {
      // Set mock data for demo
      setData({
        cycle: 'Abril 2026',
        user_position: {
          position: 5,
          previous_position: 7,
          score: 1250,
          deals_completed: 12,
          total_value: 15000
        },
        rankings: [
          { id: 1, position: 1, previous_position: 1, user_id: 10, score: 5000, deals_completed: 45, user: { company_profile: { nome_fantasia: 'Elite Servicos', verified: true } } },
          { id: 2, position: 2, previous_position: 3, user_id: 11, score: 4200, deals_completed: 38, user: { company_profile: { nome_fantasia: 'Master Manutencoes', verified: true } } },
          { id: 3, position: 3, previous_position: 2, user_id: 12, score: 3800, deals_completed: 32, user: { company_profile: { nome_fantasia: 'CleanPro Limpeza', verified: false } } },
          { id: 4, position: 4, previous_position: 4, user_id: 13, score: 2100, deals_completed: 18, user: { company_profile: { nome_fantasia: 'Seguranca Total', verified: true } } },
          { id: 5, position: 5, previous_position: 7, user_id: user?.id, score: 1250, deals_completed: 12, user: { company_profile: { nome_fantasia: user?.company_profile?.nome_fantasia || 'Sua Empresa' } } },
          { id: 6, position: 6, previous_position: 5, user_id: 14, score: 1100, deals_completed: 10, user: { company_profile: { nome_fantasia: 'Eletrica Express', verified: true } } },
          { id: 7, position: 7, previous_position: 8, user_id: 15, score: 950, deals_completed: 8, user: { company_profile: { nome_fantasia: 'Pintura Prime', verified: false } } },
          { id: 8, position: 8, previous_position: 6, user_id: 16, score: 800, deals_completed: 7, user: { company_profile: { nome_fantasia: 'Jardim Verde', verified: true } } },
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  const getMedalIcon = (position) => {
    if (position === 1) return <Crown className="w-7 h-7 text-amber-400" />
    if (position === 2) return <Medal className="w-6 h-6 text-gray-300" />
    if (position === 3) return <Medal className="w-6 h-6 text-amber-600" />
    return null
  }

  const getPositionChange = (current, previous) => {
    if (!previous) return { icon: Minus, color: 'text-gray-400', text: '' }
    if (current < previous) return { icon: ChevronUp, color: 'text-emerald-500', text: `+${previous - current}` }
    if (current > previous) return { icon: ChevronDown, color: 'text-red-500', text: `-${current - previous}` }
    return { icon: Minus, color: 'text-gray-400', text: '' }
  }

  const userPosition = data?.user_position
  const positionChange = userPosition ? getPositionChange(userPosition.position, userPosition.previous_position) : null

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-[3px] border-gray-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Carregando ranking...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header - Full Width */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-amber-500/30 via-orange-500/20 to-transparent rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: '4s' }}
          />
          <div
            className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-yellow-500/20 via-amber-500/10 to-transparent rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: '5s', animationDelay: '1s' }}
          />
        </div>

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Left - Title */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-white/90">Ranking de Empresas</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Top <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Empresas</span>
              </h1>
              <p className="text-slate-300 max-w-lg">
                Acompanhe sua posicao e destaque-se entre as melhores empresas da plataforma.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 backdrop-blur-sm rounded-xl border border-amber-500/30">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-300">Ciclo: {data?.cycle || 'Atual'}</span>
              </div>
            </div>

            {/* Right - User Position Card */}
            {userPosition && (
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 min-w-[320px]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-white/60">Sua Posicao</span>
                  {positionChange && positionChange.text && (
                    <div className={`flex items-center gap-1 ${positionChange.color}`}>
                      <positionChange.icon className="w-4 h-4" />
                      <span className="text-sm font-bold">{positionChange.text}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <span className="text-2xl font-bold text-white">#{userPosition.position}</span>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">
                      {parseFloat(userPosition.score).toLocaleString('pt-BR')}
                    </p>
                    <p className="text-sm text-white/60">pontos totais</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{userPosition.deals_completed}</p>
                    <p className="text-xs text-white/60">Servicos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">
                      R$ {parseFloat(userPosition.total_value / 1000).toFixed(0)}k
                    </p>
                    <p className="text-xs text-white/60">Faturado</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
            {[
              { label: 'Sua Posicao', value: `#${userPosition?.position || '-'}`, icon: Trophy, color: 'from-amber-500 to-orange-500' },
              { label: 'Pontuacao', value: userPosition?.score?.toLocaleString('pt-BR') || '0', icon: Star, color: 'from-yellow-500 to-amber-500' },
              { label: 'Servicos', value: userPosition?.deals_completed || 0, icon: CheckCircle, color: 'from-emerald-500 to-teal-500' },
              { label: 'Faturamento', value: `R$ ${((userPosition?.total_value || 0) / 1000).toFixed(0)}k`, icon: DollarSign, color: 'from-violet-500 to-purple-500' },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center flex-shrink-0`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-slate-400">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Ranking List - Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Top 3 Podium */}
            {/* Podium - Top 3 */}
            {showPodium && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">Podio</h2>
                    <p className="text-sm text-gray-500">Top 3 empresas do ciclo</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-end justify-center gap-4">
                  {/* 2nd Place */}
                  {data?.rankings?.[1] && (
                    <PodiumCard
                      ranking={data.rankings[1]}
                      position={2}
                      user={user}
                      height="h-32"
                      bgColor="from-gray-200 to-gray-300"
                      textColor="text-gray-600"
                    />
                  )}

                  {/* 1st Place */}
                  {data?.rankings?.[0] && (
                    <PodiumCard
                      ranking={data.rankings[0]}
                      position={1}
                      user={user}
                      height="h-40"
                      bgColor="from-amber-400 to-orange-500"
                      textColor="text-amber-600"
                      isFirst
                    />
                  )}

                  {/* 3rd Place */}
                  {data?.rankings?.[2] && (
                    <PodiumCard
                      ranking={data.rankings[2]}
                      position={3}
                      user={user}
                      height="h-24"
                      bgColor="from-amber-600 to-amber-700"
                      textColor="text-amber-700"
                    />
                  )}
                </div>
              </div>
            </div>
            )}

            {/* Full Ranking List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">Ranking Completo</h2>
                    <p className="text-sm text-gray-500">Todas as empresas classificadas</p>
                  </div>
                </div>
              </div>

              {data?.rankings?.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="font-medium text-gray-900 mb-1">Nenhuma empresa no ranking</p>
                  <p className="text-sm text-gray-500">O ranking sera atualizado em breve</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {data?.rankings?.map((ranking) => (
                    <RankingRow
                      key={ranking.id}
                      ranking={ranking}
                      user={user}
                      getPositionChange={getPositionChange}
                      getMedalIcon={getMedalIcon}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* How it Works */}
            {showHowItWorks && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Como funciona?</h3>
                    <p className="text-sm text-gray-500">Sistema de pontuacao</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { icon: DollarSign, color: 'bg-emerald-100 text-emerald-600', text: `R$ 1,00 em servicos = ${scoring.revenue_multiplier || 0.1} pts` },
                  { icon: CheckCircle, color: 'bg-blue-100 text-blue-600', text: `Deal concluido = +${scoring.deal_completed_points || 10} pts` },
                  { icon: Star, color: 'bg-amber-100 text-amber-600', text: `Avaliacao 5 estrelas = +${scoring.five_star_review_points || 5} pts` },
                  { icon: Calendar, color: 'bg-violet-100 text-violet-600', text: `Reset ${resetPeriod} do ranking` },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg ${item.color} flex items-center justify-center flex-shrink-0`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm text-gray-600">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            )}

            {/* Benefits */}
            {showBenefits && visibleBenefits.length > 0 && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-900">Beneficios do Top 10</h3>
              </div>
              <ul className="space-y-3">
                {visibleBenefits.map((benefit) => (
                  <li key={benefit.id} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    {benefit.title}
                  </li>
                ))}
              </ul>
            </div>
            )}

            {/* Tips */}
            {showTips && visibleTips.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-900">Dicas</h3>
              </div>
              <ul className="space-y-2">
                {visibleTips.map((tip) => (
                  <li key={tip.id} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    {tip.text}
                  </li>
                ))}
              </ul>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Podium Card Component
function PodiumCard({ ranking, position, user, height, bgColor, textColor, isFirst }) {
  const isCurrentUser = ranking.user_id === user?.id

  return (
    <div className="flex flex-col items-center">
      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${bgColor} flex items-center justify-center shadow-lg mb-2 ${isFirst ? 'ring-4 ring-amber-300 ring-offset-2' : ''}`}>
        {position === 1 ? (
          <Crown className="w-8 h-8 text-white" />
        ) : (
          <span className="text-xl font-bold text-white">{position}</span>
        )}
      </div>
      <div className={`${height} w-24 bg-gradient-to-t ${bgColor} rounded-t-xl flex flex-col items-center justify-end pb-3`}>
        <p className="text-white font-bold text-lg">#{position}</p>
      </div>
      <div className="mt-3 text-center">
        <p className={`font-semibold text-sm ${isCurrentUser ? 'text-blue-600' : 'text-gray-900'} truncate max-w-[100px]`}>
          {ranking.user?.company_profile?.nome_fantasia || 'Empresa'}
          {isCurrentUser && <span className="text-xs text-blue-500 block">(Voce)</span>}
        </p>
        <p className={`text-xs ${textColor} font-medium`}>
          {parseFloat(ranking.score).toLocaleString('pt-BR')} pts
        </p>
      </div>
    </div>
  )
}

// Ranking Row Component
function RankingRow({ ranking, user, getPositionChange, getMedalIcon }) {
  const isCurrentUser = ranking.user_id === user?.id
  const positionChange = getPositionChange(ranking.position, ranking.previous_position)
  const medalIcon = getMedalIcon(ranking.position)

  return (
    <div className={`flex items-center justify-between p-5 hover:bg-gray-50 transition-colors ${
      isCurrentUser ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : ''
    }`}>
      <div className="flex items-center gap-4">
        {/* Position */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
          ranking.position === 1 ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
          ranking.position === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
          ranking.position === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-700' :
          'bg-gray-100'
        }`}>
          {medalIcon || (
            <span className={`text-lg font-bold ${ranking.position <= 3 ? 'text-white' : 'text-gray-500'}`}>
              {ranking.position}
            </span>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900">
              {ranking.user?.company_profile?.nome_fantasia ||
               ranking.user?.company_profile?.razao_social ||
               'Empresa'}
            </p>
            {ranking.user?.company_profile?.verified && (
              <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
              </div>
            )}
            {isCurrentUser && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                Voce
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {ranking.deals_completed} servicos concluidos
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Position Change */}
        {positionChange.text && (
          <div className={`flex items-center gap-1 ${positionChange.color}`}>
            <positionChange.icon className="w-4 h-4" />
            <span className="text-sm font-bold">{positionChange.text}</span>
          </div>
        )}

        {/* Score */}
        <div className="text-right">
          <p className="text-xl font-bold text-gray-900">
            {parseFloat(ranking.score).toLocaleString('pt-BR')}
          </p>
          <p className="text-xs text-gray-500">pontos</p>
        </div>
      </div>
    </div>
  )
}
