import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import api from '../services/api'
import { Trophy, Star, TrendingUp, Users, Award } from 'lucide-react'

export default function RankingView() {
  const { user } = useSelector((state) => state.auth)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRanking()
  }, [])

  const loadRanking = async () => {
    try {
      const response = await api.get('/ranking')
      setData(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar ranking:', error)
      // Set mock data for demo
      setData({
        cycle: 'Abril 2026',
        user_position: {
          position: 5,
          score: 1250,
          deals_completed: 12,
          total_value: 15000
        },
        rankings: [
          { id: 1, position: 1, user_id: 10, score: 5000, deals_completed: 45, user: { company_profile: { nome_fantasia: 'Elite Servicos', verified: true } } },
          { id: 2, position: 2, user_id: 11, score: 4200, deals_completed: 38, user: { company_profile: { nome_fantasia: 'Master Manutencoes', verified: true } } },
          { id: 3, position: 3, user_id: 12, score: 3800, deals_completed: 32, user: { company_profile: { nome_fantasia: 'CleanPro Limpeza', verified: false } } },
          { id: 4, position: 4, user_id: 13, score: 2100, deals_completed: 18, user: { company_profile: { nome_fantasia: 'Seguranca Total' } } },
          { id: 5, position: 5, user_id: user?.id, score: 1250, deals_completed: 12, user: { company_profile: { nome_fantasia: user?.company_profile?.nome_fantasia || 'Sua Empresa' } } },
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  const getMedalIcon = (position) => {
    if (position === 1) return <Trophy className="w-8 h-8 text-yellow-500" />
    if (position === 2) return <Award className="w-7 h-7 text-gray-400" />
    if (position === 3) return <Award className="w-6 h-6 text-amber-700" />
    return <span className="text-lg font-bold text-gray-500">#{position}</span>
  }

  const getPositionStyle = (position) => {
    if (position === 1) return 'bg-yellow-50 border-yellow-200'
    if (position === 2) return 'bg-gray-50 border-gray-200'
    if (position === 3) return 'bg-amber-50 border-amber-200'
    return 'bg-white border-gray-100'
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ranking de Empresas</h1>
          <p className="text-gray-500 mt-1">Veja sua posicao entre as melhores empresas</p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700">
          Ciclo: {data?.cycle || 'Atual'}
        </span>
      </div>

      {/* User Position Card */}
      {data?.user_position && (
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-primary-200 text-sm mb-1">Sua Posicao</p>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  {getMedalIcon(data.user_position.position)}
                </div>
                <div>
                  <p className="text-4xl font-bold">#{data.user_position.position}</p>
                  <p className="text-primary-200 text-sm">no ranking geral</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-primary-200 text-sm mb-1">Pontuacao Total</p>
              <p className="text-4xl font-bold">
                {parseFloat(data.user_position.score).toLocaleString('pt-BR')}
              </p>
              <p className="text-primary-200 text-sm">pontos</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
            <div className="text-center">
              <p className="text-3xl font-bold">{data.user_position.deals_completed}</p>
              <p className="text-primary-200 text-sm">Servicos Concluidos</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">
                R$ {parseFloat(data.user_position.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
              </p>
              <p className="text-primary-200 text-sm">Valor Total</p>
            </div>
          </div>
        </div>
      )}

      {/* Ranking List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            Top Empresas
          </h2>
        </div>

        {data?.rankings?.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma empresa no ranking ainda</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data?.rankings?.map((ranking) => {
              const isCurrentUser = ranking.user_id === user?.id

              return (
                <div
                  key={ranking.id}
                  className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                    isCurrentUser ? 'bg-primary-50 border-l-4 border-l-primary-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getPositionStyle(ranking.position)} border`}>
                      {getMedalIcon(ranking.position)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        {ranking.user?.company_profile?.nome_fantasia ||
                         ranking.user?.company_profile?.razao_social ||
                         'Empresa'}
                        {ranking.user?.company_profile?.verified && (
                          <span className="inline-flex items-center justify-center w-5 h-5 bg-green-100 rounded-full">
                            <Star className="w-3 h-3 text-green-600 fill-green-600" />
                          </span>
                        )}
                        {isCurrentUser && (
                          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                            Voce
                          </span>
                        )}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {ranking.deals_completed} servicos concluidos
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary-600">
                      {parseFloat(ranking.score).toLocaleString('pt-BR')}
                    </p>
                    <p className="text-gray-500 text-sm">pontos</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-primary-600" />
          Como funciona o ranking?
        </h3>
        <ul className="text-sm text-gray-600 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-primary-600">•</span>
            Cada R$ 1,00 em servicos concluidos = 0.1 pontos
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600">•</span>
            Cada deal concluido = 10 pontos de bonus
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600">•</span>
            O ranking e resetado a cada semestre
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600">•</span>
            Empresas em destaque ganham mais visibilidade
          </li>
        </ul>
      </div>
    </div>
  )
}
