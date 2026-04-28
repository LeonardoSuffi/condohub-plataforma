import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { login, clearError } from '../../store/slices/authSlice'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import {
  Eye,
  EyeOff,
  User,
  Building2,
  Loader2,
  ArrowLeft,
  Mail,
  CheckCircle,
  KeyRound
} from 'lucide-react'
import ReCaptcha from '../../components/auth/ReCaptcha'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, requiresCaptcha } = useSelector((state) => state.auth)
  const [showPassword, setShowPassword] = useState(false)
  const [view, setView] = useState('login') // 'login' | 'forgot' | 'success'
  const [forgotLoading, setForgotLoading] = useState(false)
  const [sentEmail, setSentEmail] = useState('')
  const [captchaToken, setCaptchaToken] = useState(null)
  const [showCaptcha, setShowCaptcha] = useState(false)

  // Show CAPTCHA when required by backend
  useEffect(() => {
    if (requiresCaptcha) {
      setShowCaptcha(true)
    }
  }, [requiresCaptcha])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: resetForm
  } = useForm()

  const {
    register: registerForgot,
    handleSubmit: handleForgotSubmit,
    formState: { errors: forgotErrors },
    reset: resetForgotForm
  } = useForm()

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const onSubmit = async (data) => {
    // Include captcha token if CAPTCHA is shown
    if (showCaptcha && !captchaToken) {
      toast.error('Complete a verificacao de seguranca')
      return
    }

    const credentials = showCaptcha
      ? { ...data, captcha_token: captchaToken }
      : data

    const result = await dispatch(login(credentials))
    if (login.fulfilled.match(result)) {
      toast.success('Login realizado com sucesso!')
      setShowCaptcha(false)
      setCaptchaToken(null)
      navigate('/dashboard')
    }
  }

  const onForgotSubmit = async (data) => {
    setForgotLoading(true)
    try {
      await api.post('/forgot-password', { email: data.forgotEmail })
      setSentEmail(data.forgotEmail)
      setView('success')
      resetForgotForm()
    } catch (err) {
      const message = err.response?.data?.message || 'Erro ao enviar email de recuperacao'
      toast.error(message)
    } finally {
      setForgotLoading(false)
    }
  }

  const handleBackToLogin = () => {
    setView('login')
    resetForgotForm()
  }

  const handleGoToForgot = () => {
    setView('forgot')
    resetForm()
  }

  return (
    <div className="relative overflow-hidden">
      {/* Container com transicao */}
      <div
        className="transition-all duration-500 ease-in-out"
        style={{
          transform: view === 'login' ? 'translateX(0)' : 'translateX(-100%)',
          opacity: view === 'login' ? 1 : 0,
          position: view === 'login' ? 'relative' : 'absolute',
          width: '100%',
          pointerEvents: view === 'login' ? 'auto' : 'none'
        }}
      >
        {/* LOGIN FORM */}
        <div>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Entrar</h1>
            <p className="text-gray-500 mt-1">Acesse sua conta para continuar</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <input
                type="email"
                className={`w-full px-4 py-3 border ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-slate-500 focus:border-slate-500'} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
                placeholder="seu@email.com"
                {...register('email', {
                  required: 'Informe seu e-mail',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'E-mail invalido'
                  }
                })}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full px-4 py-3 pr-12 border ${errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-slate-500 focus:border-slate-500'} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
                  placeholder="Sua senha"
                  {...register('password', { required: 'Informe sua senha' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleGoToForgot}
                className="text-sm text-slate-700 hover:text-slate-900 font-medium transition-colors"
              >
                Esqueceu a senha?
              </button>
            </div>

            {/* CAPTCHA - shown after failed attempts */}
            {showCaptcha && (
              <ReCaptcha
                onVerify={setCaptchaToken}
                error={null}
              />
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-slate-800 to-slate-900 text-white font-semibold py-3 rounded-xl hover:from-slate-900 hover:to-black focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-sm text-gray-500">ou cadastre-se como</span>
            </div>
          </div>

          {/* Register options */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/register/cliente"
              className="flex items-center justify-center gap-2 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              <User className="w-5 h-5 text-slate-700" />
              Cliente
            </Link>
            <Link
              to="/register/empresa"
              className="flex items-center justify-center gap-2 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              <Building2 className="w-5 h-5 text-green-600" />
              Empresa
            </Link>
          </div>
        </div>
      </div>

      {/* FORGOT PASSWORD FORM */}
      <div
        className="transition-all duration-500 ease-in-out"
        style={{
          transform: view === 'forgot' ? 'translateX(0)' : 'translateX(100%)',
          opacity: view === 'forgot' ? 1 : 0,
          position: view === 'forgot' ? 'relative' : 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          pointerEvents: view === 'forgot' ? 'auto' : 'none'
        }}
      >
        <div>
          {/* Back button */}
          <button
            type="button"
            onClick={handleBackToLogin}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium mb-6 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar ao login
          </button>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Recuperar senha</h1>
            <p className="text-gray-500 mt-1">
              Informe seu e-mail e enviaremos um link para redefinir sua senha
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleForgotSubmit(onForgotSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail cadastrado
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  className={`w-full pl-12 pr-4 py-3 border ${forgotErrors.forgotEmail ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-slate-500 focus:border-slate-500'} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
                  placeholder="seu@email.com"
                  {...registerForgot('forgotEmail', {
                    required: 'Informe seu e-mail',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'E-mail invalido'
                    }
                  })}
                />
              </div>
              {forgotErrors.forgotEmail && (
                <p className="mt-2 text-sm text-red-600">{forgotErrors.forgotEmail.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={forgotLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-slate-800 to-slate-900 text-white font-semibold py-3 rounded-xl hover:from-slate-900 hover:to-black focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {forgotLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Enviar link de recuperacao
                </>
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-slate-50 rounded-xl">
            <p className="text-sm text-gray-600">
              <strong className="text-gray-700">Dica:</strong> Verifique tambem sua caixa de spam caso nao encontre o e-mail na caixa de entrada.
            </p>
          </div>
        </div>
      </div>

      {/* SUCCESS STATE */}
      <div
        className="transition-all duration-500 ease-in-out"
        style={{
          transform: view === 'success' ? 'translateX(0)' : 'translateX(100%)',
          opacity: view === 'success' ? 1 : 0,
          position: view === 'success' ? 'relative' : 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          pointerEvents: view === 'success' ? 'auto' : 'none'
        }}
      >
        <div className="text-center py-8">
          {/* Header */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">E-mail enviado!</h1>
          <p className="text-gray-500 mb-6">
            Enviamos um link de recuperacao para:
          </p>

          {/* Email display */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl mb-8">
            <Mail className="w-4 h-4 text-slate-600" />
            <span className="font-medium text-slate-800">{sentEmail}</span>
          </div>

          {/* Instructions */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-left">
            <p className="text-sm text-amber-800">
              <strong>Proximo passo:</strong> Acesse seu e-mail e clique no link de recuperacao. O link expira em 60 minutos.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleBackToLogin}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-slate-800 to-slate-900 text-white font-semibold py-3 rounded-xl hover:from-slate-900 hover:to-black focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar ao login
            </button>

            <button
              type="button"
              onClick={() => setView('forgot')}
              className="w-full text-sm text-gray-600 hover:text-gray-900 font-medium py-2 transition-colors"
            >
              Nao recebeu? Tentar novamente
            </button>
          </div>
        </div>
      </div>

      {/* Custom animation */}
      <style>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
