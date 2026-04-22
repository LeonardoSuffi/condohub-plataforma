import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { updateProfile, logout } from '../store/slices/authSlice'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Shield,
  Bell,
  Eye,
  User,
  Key,
  LogOut,
  CheckCircle,
  Settings as SettingsIcon,
  ChevronRight,
  Lightbulb,
  Lock,
  Mail,
  Calendar,
  Monitor,
  Smartphone,
  Globe,
  Download,
  Trash2,
  AlertTriangle,
  Save
} from 'lucide-react'

export default function Settings() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, loading } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState('account')

  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm()
  const newPassword = watch('password')

  const onPasswordChange = async (data) => {
    if (data.password !== data.password_confirmation) {
      toast.error('As senhas nao coincidem')
      return
    }

    const result = await dispatch(updateProfile({
      password: data.password,
      password_confirmation: data.password_confirmation
    }))

    if (updateProfile.fulfilled.match(result)) {
      toast.success('Senha alterada com sucesso!')
      reset()
    }
  }

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap()
    } catch (_error) {
      // Silently ignore - navigate to login regardless
    }
    navigate('/login', { replace: true })
  }

  const tabs = [
    { id: 'account', name: 'Conta', icon: User },
    { id: 'security', name: 'Seguranca', icon: Shield },
    { id: 'notifications', name: 'Notificacoes', icon: Bell },
    { id: 'privacy', name: 'Privacidade', icon: Eye },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Animated Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-violet-500/30 via-purple-500/20 to-transparent rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: '4s' }}
          />
          <div
            className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-blue-500/20 via-indigo-500/10 to-transparent rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: '5s', animationDelay: '1s' }}
          />
        </div>

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <SettingsIcon className="w-6 h-6 text-white" />
                </div>
                <div className="px-3 py-1 bg-violet-500/20 backdrop-blur-sm rounded-full border border-violet-400/30">
                  <span className="text-violet-300 text-sm font-medium capitalize">
                    {user?.type === 'empresa' ? 'Conta Empresa' : user?.type === 'cliente' ? 'Conta Cliente' : 'Administrador'}
                  </span>
                </div>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                Configuracoes
              </h1>
              <p className="text-slate-400 text-lg">
                Gerencie suas preferencias e configuracoes de conta
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Email</p>
                  <p className="text-white font-medium">Verificado</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">2FA</p>
                  <p className="text-white font-medium">Desativado</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Sessoes</p>
                  <p className="text-white font-medium">1 ativa</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Membro desde</p>
                  <p className="text-white font-medium">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR', {
                      month: 'short',
                      year: 'numeric'
                    }) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 space-y-1 sticky top-24">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.name}</span>
                    {activeTab === tab.id && (
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    )}
                  </button>
                )
              })}

              <div className="border-t border-gray-100 pt-3 mt-3">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sair da conta</span>
                </button>
              </div>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-6">
            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-violet-600" />
                    Informacoes da Conta
                  </h3>

                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                          <Mail className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">E-mail</p>
                          <p className="text-sm text-gray-500">{user?.email}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Verificado
                      </span>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Tipo de conta</p>
                        <p className="text-sm text-gray-500 capitalize">
                          {user?.type === 'empresa' ? 'Empresa' : user?.type === 'cliente' ? 'Cliente' : 'Administrador'}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Membro desde</p>
                        <p className="text-sm text-gray-500">
                          {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          }) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tips Card */}
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-violet-100 p-6">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-violet-600" />
                    Dicas
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                      <span>Mantenha seu email atualizado para receber notificacoes importantes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                      <span>Complete seu perfil para melhorar sua visibilidade na plataforma</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Key className="w-5 h-5 text-violet-600" />
                    Alterar Senha
                  </h3>

                  <form onSubmit={handleSubmit(onPasswordChange)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nova senha
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 ${
                            errors.password ? 'border-red-300' : 'border-gray-200'
                          }`}
                          placeholder="Digite sua nova senha"
                          {...register('password', {
                            required: 'Senha obrigatoria',
                            minLength: { value: 8, message: 'Minimo 8 caracteres' }
                          })}
                        />
                      </div>
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmar nova senha
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 ${
                            errors.password_confirmation ? 'border-red-300' : 'border-gray-200'
                          }`}
                          placeholder="Confirme sua nova senha"
                          {...register('password_confirmation', {
                            required: 'Confirmacao obrigatoria',
                            validate: value => value === newPassword || 'As senhas nao coincidem'
                          })}
                        />
                      </div>
                      {errors.password_confirmation && (
                        <p className="mt-1 text-sm text-red-600">{errors.password_confirmation.message}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium rounded-xl hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg shadow-violet-500/25"
                    >
                      <Save className="w-5 h-5" />
                      {loading ? 'Alterando...' : 'Alterar Senha'}
                    </button>
                  </form>
                </div>

                {/* 2FA Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-violet-600" />
                    Autenticacao em Dois Fatores (2FA)
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Adicione uma camada extra de seguranca a sua conta usando autenticacao em dois fatores.
                  </p>
                  <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
                    <Smartphone className="w-5 h-5" />
                    Configurar 2FA
                  </button>
                </div>

                {/* Active Sessions */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-violet-600" />
                    Sessoes Ativas
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Este dispositivo</p>
                        <p className="text-sm text-gray-500">Sessao atual - Ativa agora</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                      Atual
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-violet-600" />
                    Preferencias de Notificacao
                  </h3>

                  <div className="space-y-4">
                    {[
                      { id: 'deals', label: 'Novas negociacoes', desc: 'Receba avisos quando houver novas propostas', default: true, icon: '🤝' },
                      { id: 'messages', label: 'Mensagens no chat', desc: 'Notificacoes de novas mensagens', default: true, icon: '💬' },
                      { id: 'status', label: 'Status de negociacoes', desc: 'Mudancas de status das suas negociacoes', default: true, icon: '📊' },
                      { id: 'promo', label: 'E-mails promocionais', desc: 'Novidades e ofertas especiais', default: false, icon: '📧' },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl shadow-sm">
                            {item.icon}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.label}</p>
                            <p className="text-sm text-gray-500">{item.desc}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked={item.default} className="sr-only peer" />
                          <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-violet-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600 shadow-inner"></div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <button className="mt-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25">
                    <Save className="w-5 h-5" />
                    Salvar Preferencias
                  </button>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-violet-600" />
                    Configuracoes de Privacidade
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                          <Globe className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Perfil visivel no ranking</p>
                          <p className="text-sm text-gray-500">Permitir que sua empresa apareca nas listagens publicas</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-violet-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600 shadow-inner"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <SettingsIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Compartilhar dados anonimos</p>
                          <p className="text-sm text-gray-500">Ajude a melhorar a plataforma com dados anonimizados</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-violet-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600 shadow-inner"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* LGPD Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-violet-600" />
                    Seus Dados (LGPD)
                  </h3>
                  <p className="text-gray-500 text-sm mb-6">
                    Voce tem controle total sobre seus dados. Exporte uma copia ou solicite a exclusao da sua conta.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25">
                      <Download className="w-5 h-5" />
                      Exportar Dados
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors">
                      <Trash2 className="w-5 h-5" />
                      Excluir Conta
                    </button>
                  </div>
                </div>

                {/* Warning Card */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-6">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    Atencao
                  </h3>
                  <p className="text-sm text-gray-600">
                    A exclusao da conta e permanente e nao pode ser desfeita. Todos os seus dados, incluindo negociacoes e historico, serao removidos.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
