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
  Building2,
  FileText,
  MapPin,
  Check,
  Home,
  Users,
  Briefcase,
} from 'lucide-react'
import { RegisterWizard, WizardStep } from '@/components/register'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AddressAutocomplete } from '@/components/integrations'
import { GlassCard } from '@/components/ui/glass-card'
import { cn } from '@/lib/utils'

const STEPS = [
  { title: 'Conta', icon: User },
  { title: 'Tipo', icon: Users },
  { title: 'Condominio', icon: Building2 },
  { title: 'Endereco', icon: MapPin },
  { title: 'Confirmar', icon: Check },
]

const TIPOS_CLIENTE = [
  { value: 'sindico', label: 'Sindico', description: 'Responsavel pelo condominio' },
  { value: 'administradora', label: 'Administradora', description: 'Empresa administradora de condominios' },
  { value: 'condominio', label: 'Condominio', description: 'Pessoa juridica do condominio' },
]

export default function RegisterCliente() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state) => state.auth)

  const [currentStep, setCurrentStep] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [addressData, setAddressData] = useState(null)

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
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      tipo: '',
      cpf: '',
      cnpj: '',
      nome_condominio: '',
      unidades: '',
      telefone: '',
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
    },
  })

  const password = watch('password')
  const tipo = watch('tipo')
  const allValues = watch()

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

  const validateStep = async (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return await trigger(['name', 'email', 'password', 'password_confirmation'])
      case 1:
        const tipoValid = await trigger(['tipo'])
        if (!tipoValid) return false
        if (tipo === 'sindico') {
          return await trigger(['cpf'])
        } else if (tipo === 'administradora') {
          return await trigger(['cnpj'])
        }
        return true
      case 2:
        return true // Condominium data is optional
      case 3:
        return await trigger(['cep', 'logradouro', 'numero', 'bairro', 'cidade', 'estado'])
      case 4:
        return true
      default:
        return true
    }
  }

  const handleStepChange = async (newStep) => {
    if (newStep > currentStep) {
      const isValid = await validateStep(currentStep)
      if (!isValid) return
    }
    setCurrentStep(newStep)
  }

  const handleAddressSelect = (address) => {
    setAddressData(address)
    setValue('cep', address.cep || '')
    setValue('logradouro', address.logradouro || '')
    setValue('bairro', address.bairro || '')
    setValue('cidade', address.cidade || '')
    setValue('estado', address.estado || '')
  }

  const onSubmit = async () => {
    const data = getValues()

    const result = await dispatch(registerCliente(data))
    if (registerCliente.fulfilled.match(result)) {
      toast.success('Cadastro realizado com sucesso!')
      navigate('/dashboard')
    }
  }

  const stepsWithValidation = STEPS.map((step, index) => ({
    ...step,
    validate: () => validateStep(index),
  }))

  const getTipoLabel = () => {
    return TIPOS_CLIENTE.find((t) => t.value === tipo)?.label || tipo
  }

  return (
    <div className="min-h-screen py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
            <User className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Criar Conta - Cliente</h1>
        </div>
        <p className="text-muted-foreground">
          Encontre os melhores servicos para seu condominio
        </p>
      </div>

      <RegisterWizard
        steps={stepsWithValidation}
        currentStep={currentStep}
        onStepChange={handleStepChange}
        onSubmit={onSubmit}
        isSubmitting={loading}
        submitText="Criar Conta"
      >
        {/* Step 1: Dados da Conta */}
        <WizardStep
          isActive={currentStep === 0}
          title="Dados da Conta"
          description="Informacoes de acesso a plataforma"
          icon={User}
        >
          <div className="space-y-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  className={cn("pl-10", errors.name && "border-destructive")}
                  placeholder="Seu nome completo"
                  {...register('name', { required: 'Nome e obrigatorio' })}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  className={cn("pl-10", errors.email && "border-destructive")}
                  placeholder="seu@email.com"
                  {...register('email', {
                    required: 'E-mail e obrigatorio',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'E-mail invalido',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={cn("pr-10", errors.password && "border-destructive")}
                  placeholder="Minimo 8 caracteres"
                  {...register('password', {
                    required: 'Senha e obrigatoria',
                    minLength: { value: 8, message: 'Minimo 8 caracteres' },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Confirmar Senha *</Label>
              <div className="relative">
                <Input
                  id="password_confirmation"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={cn("pr-10", errors.password_confirmation && "border-destructive")}
                  placeholder="Confirme sua senha"
                  {...register('password_confirmation', {
                    required: 'Confirme a senha',
                    validate: (value) => value === password || 'Senhas nao conferem',
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="text-sm text-destructive">{errors.password_confirmation.message}</p>
              )}
            </div>
          </div>
        </WizardStep>

        {/* Step 2: Tipo de Cliente */}
        <WizardStep
          isActive={currentStep === 1}
          title="Tipo de Cliente"
          description="Selecione seu perfil e documentacao"
          icon={Users}
        >
          <div className="space-y-6">
            {/* Tipo Selection */}
            <div className="space-y-3">
              <Label>Voce e *</Label>
              <div className="grid gap-3">
                {TIPOS_CLIENTE.map((tipoOption) => (
                  <div
                    key={tipoOption.value}
                    onClick={() => setValue('tipo', tipoOption.value, { shouldValidate: true })}
                    className={cn(
                      "p-4 rounded-lg border-2 cursor-pointer transition-all",
                      tipo === tipoOption.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                          tipo === tipoOption.value
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        )}
                      >
                        {tipo === tipoOption.value && (
                          <Check className="w-3 h-3 text-primary-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{tipoOption.label}</p>
                        <p className="text-sm text-muted-foreground">{tipoOption.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <input type="hidden" {...register('tipo', { required: 'Selecione o tipo de cliente' })} />
              {errors.tipo && (
                <p className="text-sm text-destructive">{errors.tipo.message}</p>
              )}
            </div>

            {/* CPF - para sindico */}
            {tipo === 'sindico' && (
              <div className="space-y-2 animate-in fade-in-50 slide-in-from-top-2">
                <Label htmlFor="cpf">CPF *</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="cpf"
                    type="text"
                    className={cn("pl-10", errors.cpf && "border-destructive")}
                    placeholder="000.000.000-00"
                    {...register('cpf', {
                      required: tipo === 'sindico' ? 'CPF e obrigatorio para sindicos' : false,
                    })}
                    onChange={(e) => {
                      e.target.value = formatCPF(e.target.value)
                    }}
                  />
                </div>
                {errors.cpf && (
                  <p className="text-sm text-destructive">{errors.cpf.message}</p>
                )}
              </div>
            )}

            {/* CNPJ - para administradora */}
            {tipo === 'administradora' && (
              <div className="space-y-2 animate-in fade-in-50 slide-in-from-top-2">
                <Label htmlFor="cnpj">CNPJ *</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="cnpj"
                    type="text"
                    className={cn("pl-10", errors.cnpj && "border-destructive")}
                    placeholder="00.000.000/0000-00"
                    {...register('cnpj', {
                      required: tipo === 'administradora' ? 'CNPJ e obrigatorio para administradoras' : false,
                    })}
                    onChange={(e) => {
                      e.target.value = formatCNPJ(e.target.value)
                    }}
                  />
                </div>
                {errors.cnpj && (
                  <p className="text-sm text-destructive">{errors.cnpj.message}</p>
                )}
              </div>
            )}

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="telefone"
                  type="text"
                  className="pl-10"
                  placeholder="(00) 00000-0000"
                  {...register('telefone')}
                  onChange={(e) => {
                    e.target.value = formatPhone(e.target.value)
                  }}
                />
              </div>
            </div>
          </div>
        </WizardStep>

        {/* Step 3: Dados do Condomínio */}
        <WizardStep
          isActive={currentStep === 2}
          title="Dados do Condominio"
          description="Informacoes sobre o condominio (opcional)"
          icon={Building2}
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Essas informacoes ajudam a personalizar as recomendacoes de servicos.
            </p>

            {/* Nome do Condomínio */}
            <div className="space-y-2">
              <Label htmlFor="nome_condominio">Nome do Condominio</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="nome_condominio"
                  type="text"
                  className="pl-10"
                  placeholder="Ex: Residencial das Flores"
                  {...register('nome_condominio')}
                />
              </div>
            </div>

            {/* Número de Unidades */}
            <div className="space-y-2">
              <Label htmlFor="unidades">Numero de Unidades</Label>
              <div className="relative">
                <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="unidades"
                  type="number"
                  className="pl-10"
                  placeholder="Ex: 120"
                  {...register('unidades')}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Quantidade total de apartamentos ou unidades
              </p>
            </div>
          </div>
        </WizardStep>

        {/* Step 4: Endereço */}
        <WizardStep
          isActive={currentStep === 3}
          title="Endereco"
          description="Localizacao do condominio"
          icon={MapPin}
        >
          <div className="space-y-4">
            <AddressAutocomplete
              onAddressSelect={handleAddressSelect}
              className="mb-4"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Logradouro */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="logradouro">Logradouro *</Label>
                <Input
                  id="logradouro"
                  type="text"
                  className={cn(errors.logradouro && "border-destructive")}
                  placeholder="Rua, Avenida, etc."
                  {...register('logradouro', { required: 'Logradouro e obrigatorio' })}
                />
                {errors.logradouro && (
                  <p className="text-sm text-destructive">{errors.logradouro.message}</p>
                )}
              </div>

              {/* Número */}
              <div className="space-y-2">
                <Label htmlFor="numero">Numero *</Label>
                <Input
                  id="numero"
                  type="text"
                  className={cn(errors.numero && "border-destructive")}
                  placeholder="123"
                  {...register('numero', { required: 'Numero e obrigatorio' })}
                />
                {errors.numero && (
                  <p className="text-sm text-destructive">{errors.numero.message}</p>
                )}
              </div>

              {/* Complemento */}
              <div className="space-y-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  type="text"
                  placeholder="Bloco, Torre, etc."
                  {...register('complemento')}
                />
              </div>

              {/* Bairro */}
              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro *</Label>
                <Input
                  id="bairro"
                  type="text"
                  className={cn(errors.bairro && "border-destructive")}
                  placeholder="Bairro"
                  {...register('bairro', { required: 'Bairro e obrigatorio' })}
                />
                {errors.bairro && (
                  <p className="text-sm text-destructive">{errors.bairro.message}</p>
                )}
              </div>

              {/* Cidade */}
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade *</Label>
                <Input
                  id="cidade"
                  type="text"
                  className={cn(errors.cidade && "border-destructive")}
                  placeholder="Cidade"
                  {...register('cidade', { required: 'Cidade e obrigatoria' })}
                />
                {errors.cidade && (
                  <p className="text-sm text-destructive">{errors.cidade.message}</p>
                )}
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <Label htmlFor="estado">Estado *</Label>
                <Input
                  id="estado"
                  type="text"
                  className={cn(errors.estado && "border-destructive")}
                  placeholder="UF"
                  maxLength={2}
                  {...register('estado', { required: 'Estado e obrigatorio' })}
                />
                {errors.estado && (
                  <p className="text-sm text-destructive">{errors.estado.message}</p>
                )}
              </div>
            </div>
          </div>
        </WizardStep>

        {/* Step 5: Confirmação */}
        <WizardStep
          isActive={currentStep === 4}
          title="Confirmar Dados"
          description="Revise suas informacoes antes de finalizar"
          icon={Check}
        >
          <div className="space-y-6">
            {/* Dados da Conta */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Conta
              </h3>
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <p className="text-sm"><span className="text-muted-foreground">Nome:</span> {allValues.name}</p>
                <p className="text-sm"><span className="text-muted-foreground">E-mail:</span> {allValues.email}</p>
              </div>
            </div>

            {/* Tipo e Documentos */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Perfil
              </h3>
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <p className="text-sm"><span className="text-muted-foreground">Tipo:</span> {getTipoLabel()}</p>
                {allValues.cpf && (
                  <p className="text-sm"><span className="text-muted-foreground">CPF:</span> {allValues.cpf}</p>
                )}
                {allValues.cnpj && (
                  <p className="text-sm"><span className="text-muted-foreground">CNPJ:</span> {allValues.cnpj}</p>
                )}
                {allValues.telefone && (
                  <p className="text-sm"><span className="text-muted-foreground">Telefone:</span> {allValues.telefone}</p>
                )}
              </div>
            </div>

            {/* Condomínio */}
            {(allValues.nome_condominio || allValues.unidades) && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Condominio
                </h3>
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  {allValues.nome_condominio && (
                    <p className="text-sm"><span className="text-muted-foreground">Nome:</span> {allValues.nome_condominio}</p>
                  )}
                  {allValues.unidades && (
                    <p className="text-sm"><span className="text-muted-foreground">Unidades:</span> {allValues.unidades}</p>
                  )}
                </div>
              </div>
            )}

            {/* Endereço */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Endereco
              </h3>
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <p className="text-sm">
                  {allValues.logradouro}, {allValues.numero}
                  {allValues.complemento && ` - ${allValues.complemento}`}
                </p>
                <p className="text-sm">
                  {allValues.bairro} - {allValues.cidade}/{allValues.estado}
                </p>
                <p className="text-sm"><span className="text-muted-foreground">CEP:</span> {allValues.cep}</p>
              </div>
            </div>

            {/* Termos */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-sm text-muted-foreground">
                Ao clicar em "Criar Conta", voce concorda com nossos{' '}
                <Link to="/terms" className="text-primary hover:underline">
                  Termos de Uso
                </Link>{' '}
                e{' '}
                <Link to="/privacy" className="text-primary hover:underline">
                  Politica de Privacidade
                </Link>
                .
              </p>
            </div>
          </div>
        </WizardStep>
      </RegisterWizard>

      {/* Footer Links */}
      <div className="mt-8 text-center space-y-4">
        <div className="text-muted-foreground">
          E uma empresa prestadora de servicos?{' '}
          <Link to="/register/empresa" className="text-primary hover:underline font-medium">
            Cadastre-se como Empresa
          </Link>
        </div>
        <div className="text-muted-foreground">
          Ja tem conta?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Entrar
          </Link>
        </div>
      </div>
    </div>
  )
}
