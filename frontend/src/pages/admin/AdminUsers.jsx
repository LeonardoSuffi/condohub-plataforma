import { useEffect, useState } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ type: '', search: '' })

  useEffect(() => {
    loadUsers()
  }, [filter.type])

  const loadUsers = async () => {
    try {
      const params = { type: filter.type || undefined }
      const response = await api.get('/admin/users', { params })
      setUsers(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar usuarios:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    loadUsers()
  }

  const handleVerify = async (userId, verified) => {
    try {
      await api.patch(`/admin/users/${userId}/verify`, { verified })
      toast.success(verified ? 'Empresa verificada!' : 'Verificacao removida')
      loadUsers()
    } catch (error) {
      toast.error('Erro ao atualizar verificacao')
    }
  }

  const handleBlock = async (userId, blocked) => {
    try {
      await api.patch(`/admin/users/${userId}`, { blocked })
      toast.success(blocked ? 'Usuario bloqueado' : 'Usuario desbloqueado')
      loadUsers()
    } catch (error) {
      toast.error('Erro ao atualizar usuario')
    }
  }

  const getTypeBadge = (type) => {
    const styles = {
      empresa: 'bg-blue-100 text-blue-700',
      cliente: 'bg-green-100 text-green-700',
      admin: 'bg-purple-100 text-purple-700',
    }
    return styles[type] || 'bg-gray-100 text-gray-700'
  }

  const filteredUsers = users.filter(user => {
    if (!filter.search) return true
    const searchLower = filter.search.toLowerCase()
    return user.name.toLowerCase().includes(searchLower) ||
           user.email.toLowerCase().includes(searchLower)
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Usuarios</h1>
        <p className="text-gray-500 mt-1">Administre usuarios e verifique empresas</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex gap-4 flex-wrap">
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          >
            <option value="">Todos os tipos</option>
            <option value="empresa">Empresas</option>
            <option value="cliente">Clientes</option>
            <option value="admin">Admins</option>
          </select>
          <input
            type="text"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
            placeholder="Buscar por nome ou email..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          />
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            <p className="text-gray-500">Nenhum usuario encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="text-center py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="text-center py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          {user.company_profile && (
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              {user.company_profile.nome_fantasia || user.company_profile.razao_social}
                              {user.company_profile.verified && (
                                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{user.email}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeBadge(user.type)}`}>
                        {user.type === 'empresa' ? 'Empresa' : user.type === 'cliente' ? 'Cliente' : 'Admin'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {user.deleted_at ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                          Bloqueado
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                          Ativo
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex gap-2 justify-end">
                        {user.type === 'empresa' && user.company_profile && (
                          <button
                            onClick={() => handleVerify(user.id, !user.company_profile.verified)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                              user.company_profile.verified
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {user.company_profile.verified ? 'Remover verificacao' : 'Verificar'}
                          </button>
                        )}
                        <button
                          onClick={() => handleBlock(user.id, !user.deleted_at)}
                          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                            user.deleted_at
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {user.deleted_at ? 'Desbloquear' : 'Bloquear'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
