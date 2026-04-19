import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { updateProfile, clearError, logout } from '../store/slices/authSlice'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '@/services/api'
import {
  Shield,
  Bell,
  Eye,
  User,
  Key,
  Smartphone,
  Monitor,
  Lock,
  Download,
  Trash2,
  LogOut,
  Loader2,
  ShieldCheck,
  ShieldOff,
  AlertTriangle,
  CheckCircle,
  Copy,
  RefreshCw,
  Globe,
  MapPin,
  Clock,
  FileText,
  ChevronRight,
} from 'lucide-react'
import { TwoFactorSetup } from '@/components/security/TwoFactorSetup'
import { SessionsList } from '@/components/security/SessionsList'
import { GdprPanel } from '@/components/security/GdprPanel'
import { cn } from '@/lib/utils'

export default function Settings() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, loading } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState('security')

  // 2FA State
  const [twoFactorStatus, setTwoFactorStatus] = useState({ enabled: false, backup_codes_remaining: 0 })
  const [loadingTwoFactor, setLoadingTwoFactor] = useState(false)

  // Sessions State
  const [sessions, setSessions] = useState([])
  const [loadingSessions, setLoadingSessions] = useState(false)

  // GDPR State
  const [consents, setConsents] = useState({})
  const [loadingGdpr, setLoadingGdpr] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm()
  const newPassword = watch('password')

  useEffect(() => {
    if (activeTab === 'security') {
      load2FAStatus()
      loadSessions()
    } else if (activeTab === 'privacy') {
      loadConsents()
    }
  }, [activeTab])

  // ==========================================
  // 2FA Functions
  // ==========================================
  const load2FAStatus = async () => {
    try {
      setLoadingTwoFactor(true)
      const response = await api.get('/security/2fa/status')
      setTwoFactorStatus(response.data)
    } catch (error) {
      console.error('Error loading 2FA status:', error)
    } finally {
      setLoadingTwoFactor(false)
    }
  }

  const handle2FAEnable = async () => {
    try {
      const response = await api.post('/security/2fa/enable')
      return response.data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao iniciar configuracao do 2FA')
      return null
    }
  }

  const handle2FAVerify = async (code) => {
    try {
      const response = await api.post('/security/2fa/verify', { code })
      toast.success('2FA ativado com sucesso!')
      load2FAStatus()
      return response.data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Codigo invalido')
      return null
    }
  }

  const handle2FADisable = async (code, password) => {
    try {
      await api.post('/security/2fa/disable', { code, password })
      toast.success('2FA desativado')
      load2FAStatus()
      return true
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao desativar 2FA')
      return false
    }
  }

  const handleRegenerateBackupCodes = async () => {
    const code = prompt('Digite seu codigo 2FA atual:')
    if (!code) return

    try {
      const response = await api.post('/security/2fa/backup-codes', { code })
      toast.success('Novos codigos de backup gerados')
      return response.data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Codigo invalido')
      return null
    }
  }

  // ==========================================
  // Sessions Functions
  // ==========================================
  const loadSessions = async () => {
    try {
      setLoadingSessions(true)
      const response = await api.get('/security/sessions')
      setSessions(response.data.data || [])
    } catch (error) {
      console.error('Error loading sessions:', error)
    } finally {
      setLoadingSessions(false)
    }
  }

  const handleRevokeSession = async (sessionId) => {
    try {
      await api.delete(`/security/sessions/${sessionId}`)
      toast.success('Sessao encerrada')
      loadSessions()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao encerrar sessao')
    }
  }

  const handleRevokeAllSessions = async () => {
    try {
      await api.post('/security/sessions/revoke-all')
      toast.success('Todas as outras sessoes foram encerradas')
      loadSessions()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao encerrar sessoes')
    }
  }

  // ==========================================
  // GDPR Functions
  // ==========================================
  const loadConsents = async () => {
    try {
      setLoadingGdpr(true)
      const response = await api.get('/gdpr/consents')
      setConsents(response.data.data || {})
    } catch (error) {
      console.error('Error loading consents:', error)
    } finally {
      setLoadingGdpr(false)
    }
  }

  const handleExportData = async () => {
    try {
      setIsExporting(true)
      const response = await api.get('/gdpr/download', { responseType: 'blob' })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `meus_dados_${new Date().toISOString().split('T')[0]}.json`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('Dados exportados com sucesso!')
    } catch (error) {
      toast.error('Erro ao exportar dados')
    } finally {
      setIsExporting(false)
    }
  }

  const handleDeleteAccount = async (password, confirmation) => {
    try {
      setIsDeleting(true)
      await api.post('/gdpr/delete-account', { password, confirmation })
      toast.success('Conta excluida')
      dispatch(logout())
      navigate('/login')
      return true
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao excluir conta')
      return false
    } finally {
      setIsDeleting(false)
    }
  }

  // ==========================================
  // Password Change
  // ==========================================
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

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const tabs = [
    { id: 'security', name: 'Seguranca', icon: Shield },
    { id: 'notifications', name: 'Notificacoes', icon: Bell },
    { id: 'privacy', name: 'Privacidade', icon: Eye },
    { id: 'account', name: 'Conta', icon: User },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Configuracoes</h1>
        <p className="text-muted-foreground mt-1">Gerencie suas preferencias e configuracoes</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="bg-card border border-border rounded-xl p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {/* Security Tab */}
          {activeTab === 'security' && (
            <>
              {/* 2FA Section */}
              <TwoFactorSetup
                status={twoFactorStatus}
                onEnable={handle2FAEnable}
                onVerify={handle2FAVerify}
                onDisable={handle2FADisable}
                onRegenerateBackupCodes={handleRegenerateBackupCodes}
                isLoading={loadingTwoFactor}
              />

              {/* Password Change */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary" />
                  Alterar Senha
                </h3>

                <form onSubmit={handleSubmit(onPasswordChange)} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nova senha
                    </label>
                    <input
                      type="password"
                      className={cn(
                        "w-full px-4 py-3 border rounded-xl bg-background focus:border-primary focus:ring-1 focus:ring-primary transition-colors",
                        errors.password ? "border-destructive" : "border-input"
                      )}
                      placeholder="Digite sua nova senha"
                      {...register('password', {
                        required: 'Senha obrigatoria',
                        minLength: { value: 8, message: 'Minimo 8 caracteres' }
                      })}
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Confirmar nova senha
                    </label>
                    <input
                      type="password"
                      className={cn(
                        "w-full px-4 py-3 border rounded-xl bg-background focus:border-primary focus:ring-1 focus:ring-primary transition-colors",
                        errors.password_confirmation ? "border-destructive" : "border-input"
                      )}
                      placeholder="Confirme sua nova senha"
                      {...register('password_confirmation', {
                        required: 'Confirmacao obrigatoria',
                        validate: value => value === newPassword || 'As senhas nao coincidem'
                      })}
                    />
                    {errors.password_confirmation && (
                      <p className="mt-1 text-sm text-destructive">{errors.password_confirmation.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Alterando...' : 'Alterar Senha'}
                  </button>
                </form>
              </div>

              {/* Sessions */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-primary" />
                  Sessoes Ativas
                </h3>

                {loadingSessions ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <SessionsList
                    sessions={sessions}
                    onRevoke={handleRevokeSession}
                    onRevokeAll={handleRevokeAllSessions}
                    isLoading={loadingSessions}
                  />
                )}
              </div>
            </>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Preferencias de Notificacao
              </h3>

              <div className="space-y-6">
                {[
                  { id: 'deals', label: 'Novas negociacoes', desc: 'Receba avisos quando houver novas propostas', default: true },
                  { id: 'messages', label: 'Mensagens no chat', desc: 'Notificacoes de novas mensagens', default: true },
                  { id: 'status', label: 'Status de negociacoes', desc: 'Mudancas de status das suas negociacoes', default: true },
                  { id: 'promo', label: 'E-mails promocionais', desc: 'Novidades e ofertas especiais', default: false },
                  { id: 'system', label: 'Lembretes do sistema', desc: 'Renovacao de plano, vencimentos, etc.', default: true },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={item.default} className="sr-only peer" />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>

              <button className="mt-8 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors">
                Salvar Preferencias
              </button>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <>
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Configuracoes de Privacidade
                </h3>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Perfil visivel no ranking</p>
                      <p className="text-sm text-muted-foreground">Permitir que sua empresa apareca nas listagens publicas</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Compartilhar dados anonimos</p>
                      <p className="text-sm text-muted-foreground">Ajude a melhorar a plataforma com dados anonimizados</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* GDPR Panel */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Seus Dados (LGPD)
                </h3>

                <GdprPanel
                  consents={consents}
                  onExportData={handleExportData}
                  onDeleteAccount={handleDeleteAccount}
                  isExporting={isExporting}
                  isDeleting={isDeleting}
                />
              </div>
            </>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Informacoes da Conta
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">E-mail da conta</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                    <span className="px-3 py-1 bg-success/10 text-success text-xs font-medium rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Verificado
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Tipo de conta</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.type === 'empresa' ? 'Empresa' : user?.type === 'cliente' ? 'Cliente' : 'Administrador'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Membro desde</p>
                      <p className="text-sm text-muted-foreground">
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

              <div className="mt-8 pt-6 border-t border-border">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-destructive/30 text-destructive font-medium rounded-xl hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Sair da conta
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
