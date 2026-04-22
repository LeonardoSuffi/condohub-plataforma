import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { login, clearError } from '../../store/slices/authSlice'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Eye, EyeOff, User, Building2, Loader2 } from 'lucide-react'

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
          <Link
            to="/forgot-password"
            className="text-sm text-slate-700 hover:text-slate-900 font-medium"
          >
            Esqueceu a senha?
          </Link>
        </div>

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
  )
}
