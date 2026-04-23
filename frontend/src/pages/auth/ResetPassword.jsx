import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import {
  Eye,
  EyeOff,
  Loader2,
  KeyRound,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Lock
} from 'lucide-react'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: email || ''
    }
  })

  const password = watch('password')

  useEffect(() => {
    if (!token || !email) {
      toast.error('Link de recuperacao invalido')
      navigate('/login')
    }
  }, [token, email, navigate])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await api.post('/reset-password', {
        token,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation
      })
      setSuccess(true)
    } catch (err) {
      const message = err.response?.data?.message || 'Erro ao redefinir senha'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // Success state
  if (success) {
    return (
      <div className="text-center py-8">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Senha redefinida!</h1>
        <p className="text-gray-500 mb-8">
          Sua senha foi alterada com sucesso. Agora voce pode fazer login com sua nova senha.
        </p>

        {/* Action */}
        <button
          onClick={() => navigate('/login')}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-slate-800 to-slate-900 text-white font-semibold py-3 rounded-xl hover:from-slate-900 hover:to-black focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all"
        >
          Fazer login
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    )
  }

  // Invalid token state
  if (!token || !email) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Link invalido</h1>
        <p className="text-gray-500 mb-8">
          Este link de recuperacao e invalido ou expirou.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-slate-800 to-slate-900 text-white font-semibold py-3 rounded-xl hover:from-slate-900 hover:to-black focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all"
        >
          Voltar ao login
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Nova senha</h1>
        <p className="text-gray-500 mt-1">
          Crie uma nova senha para sua conta
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email (readonly) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            E-mail
          </label>
          <input
            type="email"
            readOnly
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-500 bg-gray-50 cursor-not-allowed"
            {...register('email')}
          />
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nova senha
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Lock className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              className={`w-full pl-12 pr-12 py-3 border ${errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-slate-500 focus:border-slate-500'} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
              placeholder="Minimo 8 caracteres"
              {...register('password', {
                required: 'Informe a nova senha',
                minLength: {
                  value: 8,
                  message: 'A senha deve ter no minimo 8 caracteres'
                }
              })}
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

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirmar nova senha
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Lock className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              className={`w-full pl-12 pr-12 py-3 border ${errors.password_confirmation ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-slate-500 focus:border-slate-500'} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
              placeholder="Repita a nova senha"
              {...register('password_confirmation', {
                required: 'Confirme a nova senha',
                validate: value =>
                  value === password || 'As senhas nao coincidem'
              })}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password_confirmation && (
            <p className="mt-2 text-sm text-red-600">{errors.password_confirmation.message}</p>
          )}
        </div>

        {/* Password requirements */}
        <div className="p-4 bg-slate-50 rounded-xl">
          <p className="text-sm font-medium text-gray-700 mb-2">A senha deve conter:</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li className={`flex items-center gap-2 ${password?.length >= 8 ? 'text-emerald-600' : ''}`}>
              <CheckCircle className={`w-4 h-4 ${password?.length >= 8 ? 'text-emerald-500' : 'text-gray-300'}`} />
              Minimo 8 caracteres
            </li>
          </ul>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Redefinindo...
            </>
          ) : (
            <>
              <KeyRound className="w-5 h-5" />
              Redefinir senha
            </>
          )}
        </button>
      </form>
    </div>
  )
}
