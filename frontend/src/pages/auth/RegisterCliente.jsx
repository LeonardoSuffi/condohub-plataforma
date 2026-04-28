import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { registerCliente, clearError } from '../../store/slices/authSlice'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  FileText,
  Loader2,
  Building2,
  Lock,
  CheckCircle,
  ArrowLeft,
  UserPlus
} from 'lucide-react'

export default function RegisterCliente() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state) => state.auth)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
  })

  const password = watch('password')

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const formatCPF = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .slice(0, 14)
  }

  const formatPhone = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15)
  }

  const validateCPF = (cpf) => {
    const cleaned = cpf.replace(/\D/g, '')
    if (cleaned.length !== 11) return 'CPF deve ter 11 digitos'

    if (/^(\d)\1{10}$/.test(cleaned)) return 'CPF invalido'

    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned[i]) * (10 - i)
    }
    let remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cleaned[9])) return 'CPF invalido'

    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned[i]) * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cleaned[10])) return 'CPF invalido'

    return true
  }

  const onSubmit = async (data) => {
    const result = await dispatch(registerCliente(data))
    if (registerCliente.fulfilled.match(result)) {
      toast.success('Cadastro realizado com sucesso!')
      navigate('/dashboard')
    }
  }

  return (
    <div>
      {/* Back to login */}
      <Link
        to="/login"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium mb-6 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Voltar ao login
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Criar Conta</h1>
        <p className="text-gray-500 mt-1">Preencha seus dados para comecar</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome Completo
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <User className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              className={`w-full pl-12 pr-4 py-3 border ${errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-slate-500 focus:border-slate-500'} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
              placeholder="Seu nome completo"
              {...register('name', {
                required: 'Nome e obrigatorio',
                minLength: { value: 3, message: 'Nome deve ter pelo menos 3 caracteres' }
              })}
            />
          </div>
          {errors.name && (
            <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            E-mail
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Mail className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="email"
              className={`w-full pl-12 pr-4 py-3 border ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-slate-500 focus:border-slate-500'} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
              placeholder="seu@email.com"
              {...register('email', {
                required: 'E-mail e obrigatorio',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'E-mail invalido'
                }
              })}
            />
          </div>
          {errors.email && (
            <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* CPF e Telefone em grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* CPF */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CPF
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <FileText className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                className={`w-full pl-12 pr-4 py-3 border ${errors.cpf ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-slate-500 focus:border-slate-500'} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
                placeholder="000.000.000-00"
                maxLength={14}
                {...register('cpf', {
                  required: 'CPF e obrigatorio',
                  validate: validateCPF
                })}
                onChange={(e) => {
                  e.target.value = formatCPF(e.target.value)
                }}
              />
            </div>
            {errors.cpf && (
              <p className="mt-2 text-sm text-red-600">{errors.cpf.message}</p>
            )}
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Phone className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                className={`w-full pl-12 pr-4 py-3 border ${errors.telefone ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-slate-500 focus:border-slate-500'} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
                placeholder="(00) 00000-0000"
                maxLength={15}
                {...register('telefone', {
                  required: 'Telefone e obrigatorio',
                  minLength: { value: 14, message: 'Telefone incompleto' }
                })}
                onChange={(e) => {
                  e.target.value = formatPhone(e.target.value)
                }}
              />
            </div>
            {errors.telefone && (
              <p className="mt-2 text-sm text-red-600">{errors.telefone.message}</p>
            )}
          </div>
        </div>

        {/* Senha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Senha
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
                required: 'Senha e obrigatoria',
                minLength: { value: 8, message: 'Senha deve ter no minimo 8 caracteres' },
                validate: {
                  hasUppercase: (value) => /[A-Z]/.test(value) || 'Senha deve ter pelo menos 1 letra maiuscula',
                  hasLowercase: (value) => /[a-z]/.test(value) || 'Senha deve ter pelo menos 1 letra minuscula',
                  hasNumber: (value) => /\d/.test(value) || 'Senha deve ter pelo menos 1 numero',
                  hasSpecial: (value) => /[^A-Za-z\d]/.test(value) || 'Senha deve ter pelo menos 1 caractere especial'
                }
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Confirmar Senha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirmar Senha
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Lock className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              className={`w-full pl-12 pr-12 py-3 border ${errors.password_confirmation ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-slate-500 focus:border-slate-500'} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
              placeholder="Confirme sua senha"
              {...register('password_confirmation', {
                required: 'Confirme sua senha',
                validate: (value) => value === password || 'As senhas nao coincidem'
              })}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password_confirmation && (
            <p className="mt-2 text-sm text-red-600">{errors.password_confirmation.message}</p>
          )}
        </div>

        {/* Password strength indicator */}
        <div className="p-4 bg-slate-50 rounded-xl">
          <p className="text-sm font-medium text-gray-700 mb-2">A senha deve conter:</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li className={`flex items-center gap-2 ${password?.length >= 8 ? 'text-emerald-600' : ''}`}>
              <CheckCircle className={`w-4 h-4 ${password?.length >= 8 ? 'text-emerald-500' : 'text-gray-300'}`} />
              Minimo 8 caracteres
            </li>
            <li className={`flex items-center gap-2 ${/[A-Z]/.test(password || '') ? 'text-emerald-600' : ''}`}>
              <CheckCircle className={`w-4 h-4 ${/[A-Z]/.test(password || '') ? 'text-emerald-500' : 'text-gray-300'}`} />
              1 letra maiuscula
            </li>
            <li className={`flex items-center gap-2 ${/[a-z]/.test(password || '') ? 'text-emerald-600' : ''}`}>
              <CheckCircle className={`w-4 h-4 ${/[a-z]/.test(password || '') ? 'text-emerald-500' : 'text-gray-300'}`} />
              1 letra minuscula
            </li>
            <li className={`flex items-center gap-2 ${/\d/.test(password || '') ? 'text-emerald-600' : ''}`}>
              <CheckCircle className={`w-4 h-4 ${/\d/.test(password || '') ? 'text-emerald-500' : 'text-gray-300'}`} />
              1 numero
            </li>
            <li className={`flex items-center gap-2 ${/[^A-Za-z\d]/.test(password || '') ? 'text-emerald-600' : ''}`}>
              <CheckCircle className={`w-4 h-4 ${/[^A-Za-z\d]/.test(password || '') ? 'text-emerald-500' : 'text-gray-300'}`} />
              1 caractere especial (@, #, $, etc)
            </li>
          </ul>
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
              Criando conta...
            </>
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              Criar Conta
            </>
          )}
        </button>

        {/* Termos */}
        <p className="text-xs text-gray-500 text-center">
          Ao criar sua conta, voce concorda com nossos{' '}
          <Link to="/terms" className="text-slate-700 hover:underline">Termos de Uso</Link>
          {' '}e{' '}
          <Link to="/privacy" className="text-slate-700 hover:underline">Politica de Privacidade</Link>
        </p>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-white text-sm text-gray-500">ou</span>
        </div>
      </div>

      {/* Register as Empresa */}
      <Link
        to="/register/empresa"
        className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
      >
        <Building2 className="w-5 h-5" />
        Cadastrar como Empresa
      </Link>

      {/* Login link */}
      <p className="mt-6 text-center text-sm text-gray-500">
        Ja tem uma conta?{' '}
        <Link to="/login" className="text-slate-700 hover:text-slate-900 font-medium">
          Entrar
        </Link>
      </p>
    </div>
  )
}
