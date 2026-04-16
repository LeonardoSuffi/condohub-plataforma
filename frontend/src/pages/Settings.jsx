import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { updateProfile, clearError, logout } from '../store/slices/authSlice'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Settings() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, loading } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState('security')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm()
  const newPassword = watch('password')

  const onPasswordChange = async (data) => {
    if (data.password !== data.password_confirmation) {
      toast.error('As senhas nao coincidem')
      return
    }

    const result = await dispatch(updateProfile({ password: data.password, password_confirmation: data.password_confirmation }))
    if (updateProfile.fulfilled.match(result)) {
      toast.success('Senha alterada com sucesso!')
      reset()
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const tabs = [
    { id: 'security', name: 'Seguranca', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    )},
    { id: 'notifications', name: 'Notificacoes', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    )},
    { id: 'privacy', name: 'Privacidade', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
      </svg>
    )},
    { id: 'account', name: 'Conta', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )},
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Configuracoes</h1>
        <p className="text-gray-500 mt-1">Gerencie suas preferencias e configuracoes</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="bg-white border border-gray-200 rounded-xl p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Alterar Senha</h3>

              <form onSubmit={handleSubmit(onPasswordChange)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nova senha</label>
                  <input
                    type="password"
                    className={`w-full px-4 py-3 border rounded-lg bg-white focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors ${
                      errors.password ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="Digite sua nova senha"
                    {...register('password', {
                      required: 'Senha obrigatoria',
                      minLength: { value: 8, message: 'Minimo 8 caracteres' }
                    })}
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar nova senha</label>
                  <input
                    type="password"
                    className={`w-full px-4 py-3 border rounded-lg bg-white focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors ${
                      errors.password_confirmation ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="Confirme sua nova senha"
                    {...register('password_confirmation', {
                      required: 'Confirmacao obrigatoria',
                      validate: value => value === newPassword || 'As senhas nao coincidem'
                    })}
                  />
                  {errors.password_confirmation && <p className="mt-1 text-sm text-red-600">{errors.password_confirmation.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Alterando...' : 'Alterar Senha'}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <h4 className="font-medium text-gray-900 mb-4">Sessoes Ativas</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Este dispositivo</p>
                        <p className="text-sm text-gray-500">Sessao atual</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Ativo</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="mt-4 w-full px-4 py-3 border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors"
                >
                  Encerrar todas as sessoes
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Preferencias de Notificacao</h3>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Novas negociacoes</p>
                    <p className="text-sm text-gray-500">Receba avisos quando houver novas propostas</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Mensagens no chat</p>
                    <p className="text-sm text-gray-500">Notificacoes de novas mensagens</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Atualizacoes de ordens</p>
                    <p className="text-sm text-gray-500">Mudancas de status das suas ordens</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">E-mails promocionais</p>
                    <p className="text-sm text-gray-500">Novidades e ofertas especiais</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Lembretes do sistema</p>
                    <p className="text-sm text-gray-500">Renovacao de plano, vencimentos, etc.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                  </label>
                </div>
              </div>

              <button className="mt-8 px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors">
                Salvar Preferencias
              </button>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Configuracoes de Privacidade</h3>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Perfil visivel no ranking</p>
                    <p className="text-sm text-gray-500">Permitir que sua empresa apareca nas listagens publicas</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Compartilhar dados anonimos</p>
                    <p className="text-sm text-gray-500">Ajude a melhorar a plataforma com dados anonimizados</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                  </label>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <h4 className="font-medium text-gray-900 mb-4">Seus Dados</h4>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      <span className="font-medium text-gray-700">Exportar meus dados</span>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Gerenciar Conta</h3>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">E-mail da conta</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Verificado</span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Tipo de conta</p>
                      <p className="text-sm text-gray-500">
                        {user?.type === 'empresa' ? 'Empresa' : user?.type === 'cliente' ? 'Sindico' : 'Administrador'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <h4 className="font-medium text-red-600 mb-4">Zona de Perigo</h4>

                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Excluir conta</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Uma vez excluida, todos os seus dados serao permanentemente removidos. Esta acao nao pode ser desfeita.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="mt-4 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Excluir minha conta
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Excluir conta</h3>
                <p className="text-sm text-gray-500">Esta acao e irreversivel</p>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir sua conta? Todos os seus dados, incluindo historico de negociacoes,
              ordens e mensagens serao permanentemente removidos.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
