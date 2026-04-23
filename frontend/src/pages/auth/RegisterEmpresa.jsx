import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { registerEmpresa, clearError } from '../../store/slices/authSlice'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Building2,
  FileText,
  Briefcase,
  MapPin,
  Loader2,
  Lock,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight
} from 'lucide-react'

const STEPS = [
  { id: 1, title: 'Conta', icon: User },
  { id: 2, title: 'Empresa', icon: Building2 },
  { id: 3, title: 'Endereco', icon: MapPin },
  { id: 4, title: 'Confirmar', icon: Check },
]

const SEGMENTOS = [
  'Manutencao Predial',
  'Limpeza',
  'Seguranca',
  'Jardinagem',
  'Elevadores',
  'Administracao',
  'Eletrica',
  'Hidraulica',
  'Pintura',
  'Dedetizacao',
  'Outros',
]

export default function RegisterEmpresa() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state) => state.auth)

  const [currentStep, setCurrentStep] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    setValue,
    getValues,
  } = useForm({
    mode: 'onChange',
  })

  const password = watch('password')
  const allValues = watch()

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const formatCNPJ = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18)
  }

  const formatPhone = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15)
  }

  const formatCEP = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{5})(\d)/, '$1-$2')
      .slice(0, 9)
  }

  const fetchAddressByCEP = async (cep) => {
    const cleanCEP = cep.replace(/\D/g, '')
    if (cleanCEP.length !== 8) return

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
      const data = await response.json()
      if (!data.erro) {
        setValue('logradouro', data.logradouro || '')
        setValue('bairro', data.bairro || '')
        setValue('cidade', data.localidade || '')
        setValue('estado', data.uf || '')
      }
    } catch (err) {
      // Silently fail
    }
  }

  const validateStep = async (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return await trigger(['name', 'email', 'password', 'password_confirmation'])
      case 1:
        return await trigger(['cnpj', 'razao_social', 'segmento'])
      case 2:
        return await trigger(['cep', 'logradouro', 'numero', 'bairro', 'cidade', 'estado'])
      case 3:
        return true
      default:
        return true
    }
  }

  const handleNext = async () => {
    const isValid = await validateStep(currentStep)
    if (isValid && currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = async () => {
    const data = getValues()
    const result = await dispatch(registerEmpresa(data))
    if (registerEmpresa.fulfilled.match(result)) {
      toast.success('Empresa cadastrada com sucesso!')
      navigate('/dashboard')
    }
  }

  const inputClass = (hasError) => `
    w-full pl-12 pr-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400
    focus:outline-none focus:ring-2 transition-colors
    ${hasError
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300 focus:ring-slate-500 focus:border-slate-500'
    }
  `

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cadastrar Empresa</h1>
        <p className="text-gray-500 mt-1">Divulgue seus servicos para milhares de clientes</p>
      </div>

      {/* Steps indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon
            const isActive = index === currentStep
            const isCompleted = index < currentStep

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${isActive ? 'text-emerald-600' : 'text-gray-500'}`}>
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-full h-0.5 mx-2 ${isCompleted ? 'bg-emerald-400' : 'bg-gray-200'}`} style={{ minWidth: '30px' }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Dados da Conta */}
        {currentStep === 0 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Responsavel</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className={inputClass(errors.name)}
                  placeholder="Nome completo do responsavel"
                  {...register('name', { required: 'Nome e obrigatorio' })}
                />
              </div>
              {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  className={inputClass(errors.email)}
                  placeholder="empresa@email.com"
                  {...register('email', {
                    required: 'E-mail e obrigatorio',
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'E-mail invalido' }
                  })}
                />
              </div>
              {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
                  placeholder="Minimo 8 caracteres"
                  {...register('password', {
                    required: 'Senha e obrigatoria',
                    minLength: { value: 8, message: 'Minimo 8 caracteres' }
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
              {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Senha</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
                  placeholder="Confirme sua senha"
                  {...register('password_confirmation', {
                    required: 'Confirme a senha',
                    validate: (value) => value === password || 'Senhas nao conferem'
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
              {errors.password_confirmation && <p className="mt-2 text-sm text-red-600">{errors.password_confirmation.message}</p>}
            </div>

            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm font-medium text-gray-700 mb-2">A senha deve conter:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className={`flex items-center gap-2 ${password?.length >= 8 ? 'text-emerald-600' : ''}`}>
                  <CheckCircle className={`w-4 h-4 ${password?.length >= 8 ? 'text-emerald-500' : 'text-gray-300'}`} />
                  Minimo 8 caracteres
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 2: Dados da Empresa */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CNPJ</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className={inputClass(errors.cnpj)}
                  placeholder="00.000.000/0000-00"
                  {...register('cnpj', {
                    required: 'CNPJ e obrigatorio',
                    minLength: { value: 18, message: 'CNPJ incompleto' }
                  })}
                  onChange={(e) => { e.target.value = formatCNPJ(e.target.value) }}
                />
              </div>
              {errors.cnpj && <p className="mt-2 text-sm text-red-600">{errors.cnpj.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Razao Social</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Building2 className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className={inputClass(errors.razao_social)}
                  placeholder="Razao social da empresa"
                  {...register('razao_social', { required: 'Razao social e obrigatoria' })}
                />
              </div>
              {errors.razao_social && <p className="mt-2 text-sm text-red-600">{errors.razao_social.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome Fantasia <span className="text-gray-400">(opcional)</span></label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Building2 className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className={inputClass(false)}
                  placeholder="Nome fantasia"
                  {...register('nome_fantasia')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Segmento</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                </div>
                <select
                  className={`${inputClass(errors.segmento)} appearance-none cursor-pointer`}
                  {...register('segmento', { required: 'Segmento e obrigatorio' })}
                >
                  <option value="">Selecione o segmento</option>
                  {SEGMENTOS.map((seg) => (
                    <option key={seg} value={seg}>{seg}</option>
                  ))}
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rotate-90" />
              </div>
              {errors.segmento && <p className="mt-2 text-sm text-red-600">{errors.segmento.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefone <span className="text-gray-400">(opcional)</span></label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Phone className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className={inputClass(false)}
                  placeholder="(00) 00000-0000"
                  {...register('telefone')}
                  onChange={(e) => { e.target.value = formatPhone(e.target.value) }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Endereco */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CEP</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className={inputClass(errors.cep)}
                  placeholder="00000-000"
                  {...register('cep', { required: 'CEP e obrigatorio' })}
                  onChange={(e) => {
                    e.target.value = formatCEP(e.target.value)
                    if (e.target.value.length === 9) {
                      fetchAddressByCEP(e.target.value)
                    }
                  }}
                />
              </div>
              {errors.cep && <p className="mt-2 text-sm text-red-600">{errors.cep.message}</p>}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Logradouro</label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${errors.logradouro ? 'border-red-300' : 'border-gray-300 focus:ring-slate-500'}`}
                  placeholder="Rua, Avenida, etc."
                  {...register('logradouro', { required: 'Logradouro e obrigatorio' })}
                />
                {errors.logradouro && <p className="mt-2 text-sm text-red-600">{errors.logradouro.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Numero</label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${errors.numero ? 'border-red-300' : 'border-gray-300 focus:ring-slate-500'}`}
                  placeholder="123"
                  {...register('numero', { required: 'Numero e obrigatorio' })}
                />
                {errors.numero && <p className="mt-2 text-sm text-red-600">{errors.numero.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Complemento <span className="text-gray-400">(opcional)</span></label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-colors"
                placeholder="Sala, Andar, etc."
                {...register('complemento')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bairro</label>
              <input
                type="text"
                className={`w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${errors.bairro ? 'border-red-300' : 'border-gray-300 focus:ring-slate-500'}`}
                placeholder="Bairro"
                {...register('bairro', { required: 'Bairro e obrigatorio' })}
              />
              {errors.bairro && <p className="mt-2 text-sm text-red-600">{errors.bairro.message}</p>}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${errors.cidade ? 'border-red-300' : 'border-gray-300 focus:ring-slate-500'}`}
                  placeholder="Cidade"
                  {...register('cidade', { required: 'Cidade e obrigatoria' })}
                />
                {errors.cidade && <p className="mt-2 text-sm text-red-600">{errors.cidade.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${errors.estado ? 'border-red-300' : 'border-gray-300 focus:ring-slate-500'}`}
                  placeholder="UF"
                  maxLength={2}
                  {...register('estado', { required: 'Estado e obrigatorio' })}
                />
                {errors.estado && <p className="mt-2 text-sm text-red-600">{errors.estado.message}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Confirmacao */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 bg-slate-50 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" /> Conta
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="text-gray-500">Nome:</span> {allValues.name}</p>
                <p><span className="text-gray-500">E-mail:</span> {allValues.email}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Empresa
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="text-gray-500">CNPJ:</span> {allValues.cnpj}</p>
                <p><span className="text-gray-500">Razao Social:</span> {allValues.razao_social}</p>
                {allValues.nome_fantasia && <p><span className="text-gray-500">Nome Fantasia:</span> {allValues.nome_fantasia}</p>}
                <p><span className="text-gray-500">Segmento:</span> {allValues.segmento}</p>
                {allValues.telefone && <p><span className="text-gray-500">Telefone:</span> {allValues.telefone}</p>}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Endereco
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{allValues.logradouro}, {allValues.numero}{allValues.complemento && ` - ${allValues.complemento}`}</p>
                <p>{allValues.bairro} - {allValues.cidade}/{allValues.estado}</p>
                <p><span className="text-gray-500">CEP:</span> {allValues.cep}</p>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <p className="text-sm text-emerald-800">
                Ao clicar em "Finalizar Cadastro", voce concorda com nossos{' '}
                <Link to="/terms" className="text-emerald-700 hover:underline font-medium">Termos de Uso</Link>
                {' '}e{' '}
                <Link to="/privacy" className="text-emerald-700 hover:underline font-medium">Politica de Privacidade</Link>.
              </p>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-8">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
          )}

          {currentStep < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/20"
            >
              Proximo
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-slate-800 to-slate-900 text-white font-semibold py-3 rounded-xl hover:from-slate-900 hover:to-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Finalizar Cadastro
                </>
              )}
            </button>
          )}
        </div>
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

      {/* Register as Cliente */}
      <Link
        to="/register/cliente"
        className="flex items-center justify-center gap-2 w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-colors"
      >
        <User className="w-5 h-5 text-slate-700" />
        Cadastrar como Cliente
      </Link>

      {/* Login link */}
      <p className="mt-6 text-center text-sm text-gray-500">
        Ja tem uma conta?{' '}
        <Link to="/login" className="text-slate-700 hover:text-slate-900 font-medium">
          Entrar
        </Link>
      </p>

      {/* Animation styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
