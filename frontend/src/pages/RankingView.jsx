import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import api from '../services/api'

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
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-gray-500">Carregando...</div>
      </div>
    )
  }

  const getMedalEmoji = (position) => {
    if (position === 1) return '🥇'
    if (position === 2) return '🥈'
    if (position === 3) return '🥉'
    return `#${position}`
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Ranking</h1>
        <span className="badge badge-info">Ciclo: {data?.cycle}</span>
      </div>

      {/* User Position */}
      {data?.user_position && (
        <div className="card bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-primary-200 text-sm">Sua Posição</p>
              <p className="text-4xl font-bold">{getMedalEmoji(data.user_position.position)}</p>
            </div>
            <div className="text-right">
              <p className="text-primary-200 text-sm">Pontuação</p>
              <p className="text-3xl font-bold">
                {parseFloat(data.user_position.score).toLocaleString('pt-BR')} pts
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-primary-500 grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-primary-200 text-sm">Deals Concluídos</p>
              <p className="text-xl font-bold">{data.user_position.deals_completed}</p>
            </div>
            <div>
              <p className="text-primary-200 text-sm">Valor Total</p>
              <p className="text-xl font-bold">
                R$ {parseFloat(data.user_position.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ranking List */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Top Empresas</h2>
        {data?.rankings?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhuma empresa no ranking ainda</p>
        ) : (
          <div className="space-y-3">
            {data?.rankings?.map((ranking, index) => (
              <div
                key={ranking.id}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  ranking.user_id === user?.id ? 'bg-primary-50 border-2 border-primary-500' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold w-12 text-center">
                    {getMedalEmoji(ranking.position)}
                  </div>
                  <div>
                    <p className="font-medium">
                      {ranking.user?.company_profile?.nome_fantasia ||
                       ranking.user?.company_profile?.razao_social ||
                       'Empresa'}
                      {ranking.user?.company_profile?.verified && (
                        <span className="ml-2 text-green-600 text-sm">✓</span>
                      )}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {ranking.deals_completed} serviços concluídos
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary-600">
                    {parseFloat(ranking.score).toLocaleString('pt-BR')} pts
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="card bg-gray-50">
        <h3 className="font-semibold mb-2">Como funciona o ranking?</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Cada R$ 1,00 em serviços concluídos = 0.1 pontos</li>
          <li>• Cada deal concluído = 10 pontos de bônus</li>
          <li>• O ranking é resetado a cada semestre</li>
          <li>• Apenas planos com ranking habilitado participam</li>
        </ul>
      </div>
    </div>
  )
}
