import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { login, clearError } from '../../store/slices/authSlice'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Eye, EyeOff, User, Building2, Loader2 } from 'lucide-react'
import { GradientButton } from '@/components/ui/gradient-button'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state) => state.auth)
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const onSubmit = async (data) => {
    const result = await dispatch(login(data))
    if (login.fulfilled.match(result)) {
      toast.success('Login realizado com sucesso!')
      navigate('/dashboard')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Entrar</h1>
        <p className="text-neutral-400">Acesse sua conta para continuar</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">E-mail</label>
          <input
            type="email"
            className={`w-full px-4 py-3 bg-white/5 border ${errors.email ? 'border-red-500/50' : 'border-white/10'} rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500/50 focus:bg-white/10 transition-all`}
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
            <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">Senha</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className={`w-full px-4 py-3 pr-12 bg-white/5 border ${errors.password ? 'border-red-500/50' : 'border-white/10'} rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500/50 focus:bg-white/10 transition-all`}
              placeholder="Sua senha"
              {...register('password', { required: 'Informe sua senha' })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-2 text-sm text-red-400">{errors.password.message}</p>
          )}
        </div>

        {/* Forgot password */}
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-neutral-400 hover:text-primary-400 transition-colors">
            Esqueceu a senha?
          </Link>
        </div>

        {/* Submit */}
        <GradientButton
          type="submit"
          disabled={loading}
          loading={loading}
          className="w-full"
          size="lg"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </GradientButton>
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"/>
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-transparent text-sm text-neutral-500">ou cadastre-se</span>
        </div>
      </div>

      {/* Register options */}
      <div className="space-y-3">
        <Link
          to="/register/cliente"
          className="flex items-center justify-center gap-3 w-full py-3 bg-white/5 border border-white/10 text-neutral-300 font-medium rounded-xl hover:bg-white/10 hover:border-white/20 hover:text-white transition-all duration-300"
        >
          <User className="w-5 h-5 text-primary-400" />
          Sou Cliente
        </Link>
        <Link
          to="/register/empresa"
          className="flex items-center justify-center gap-3 w-full py-3 bg-white/5 border border-white/10 text-neutral-300 font-medium rounded-xl hover:bg-white/10 hover:border-white/20 hover:text-white transition-all duration-300"
        >
          <Building2 className="w-5 h-5 text-accent-cyan" />
          Sou Empresa
        </Link>
      </div>
    </div>
  )
}
