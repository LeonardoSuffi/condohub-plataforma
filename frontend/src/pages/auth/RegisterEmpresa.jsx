import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { registerEmpresa, clearError } from '../../store/slices/authSlice'
import { useEffect, useState, useCallback } from 'react'
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
  Globe,
  Check,
  Camera,
  MessageCircle,
  AtSign,
  Users,
  Link2,
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
import { SocialLinksEditor } from '@/components/integrations'
import { GlassCard } from '@/components/ui/glass-card'
import { cn } from '@/lib/utils'

const STEPS = [
  { title: 'Conta', icon: User },
  { title: 'Empresa', icon: Building2 },
  { title: 'Endereco', icon: MapPin },
  { title: 'Redes', icon: Globe },
  { title: 'Confirmar', icon: Check },
]

const SEGMENTOS = [
  { value: 'Manutenção Predial', label: 'Manutencao Predial' },
  { value: 'Limpeza', label: 'Limpeza' },
  { value: 'Segurança', label: 'Seguranca' },
  { value: 'Jardinagem', label: 'Jardinagem' },
  { value: 'Elevadores', label: 'Elevadores' },
  { value: 'Administração', label: 'Administracao' },
  { value: 'Elétrica', label: 'Eletrica' },
  { value: 'Hidráulica', label: 'Hidraulica' },
  { value: 'Pintura', label: 'Pintura' },
  { value: 'Dedetização', label: 'Dedetizacao' },
  { value: 'Outros', label: 'Outros' },
]

export default function RegisterEmpresa() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state) => state.auth)

  const [currentStep, setCurrentStep] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [socialLinks, setSocialLinks] = useState([])
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
      cnpj: '',
      razao_social: '',
      nome_fantasia: '',
      segmento: '',
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

  const validateStep = async (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return await trigger(['name', 'email', 'password', 'password_confirmation'])
      case 1:
        return await trigger(['cnpj', 'razao_social', 'segmento'])
      case 2:
        return await trigger(['cep', 'logradouro', 'numero', 'bairro', 'cidade', 'estado'])
      case 3:
        return true // Social links are optional
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
    const formData = {
      ...data,
      social_links: socialLinks,
    }

    const result = await dispatch(registerEmpresa(formData))
    if (registerEmpresa.fulfilled.match(result)) {
      toast.success('Empresa cadastrada com sucesso!')
      navigate('/dashboard')
    }
  }

  const stepsWithValidation = STEPS.map((step, index) => ({
    ...step,
    validate: () => validateStep(index),
  }))

  return (
    <div className="min-h-screen py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
            <Building2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Cadastrar Empresa</h1>
        </div>
        <p className="text-muted-foreground">
          Divulgue seus servicos para milhares de clientes
        </p>
      </div>

      <RegisterWizard
        steps={stepsWithValidation}
        currentStep={currentStep}
        onStepChange={handleStepChange}
        onSubmit={onSubmit}
        isSubmitting={loading}
        submitText="Finalizar Cadastro"
      >
        {/* Step 1: Dados da Conta */}
        <WizardStep
          isActive={currentStep === 0}
          title="Dados da Conta"
          description="Informacoes de acesso a plataforma"
          icon={User}
        >
          <div className="space-y-4">
            {/* Nome do Responsável */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Responsavel *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  className={cn("pl-10", errors.name && "border-destructive")}
                  placeholder="Nome completo do responsavel"
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
                  placeholder="empresa@email.com"
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

        {/* Step 2: Dados da Empresa */}
        <WizardStep
          isActive={currentStep === 1}
          title="Dados da Empresa"
          description="Informacoes sobre sua empresa"
          icon={Building2}
        >
          <div className="space-y-4">
            {/* CNPJ */}
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ *</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="cnpj"
                  type="text"
                  className={cn("pl-10", errors.cnpj && "border-destructive")}
                  placeholder="00.000.000/0000-00"
                  {...register('cnpj', {
                    required: 'CNPJ e obrigatorio',
                    minLength: { value: 18, message: 'CNPJ incompleto' },
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

            {/* Razão Social */}
            <div className="space-y-2">
              <Label htmlFor="razao_social">Razao Social *</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="razao_social"
                  type="text"
                  className={cn("pl-10", errors.razao_social && "border-destructive")}
                  placeholder="Razao social da empresa"
                  {...register('razao_social', { required: 'Razao social e obrigatoria' })}
                />
              </div>
              {errors.razao_social && (
                <p className="text-sm text-destructive">{errors.razao_social.message}</p>
              )}
            </div>

            {/* Nome Fantasia */}
            <div className="space-y-2">
              <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="nome_fantasia"
                  type="text"
                  className="pl-10"
                  placeholder="Nome fantasia (opcional)"
                  {...register('nome_fantasia')}
                />
              </div>
            </div>

            {/* Segmento */}
            <div className="space-y-2">
              <Label htmlFor="segmento">Segmento *</Label>
              <Select
                value={allValues.segmento}
                onValueChange={(value) => setValue('segmento', value, { shouldValidate: true })}
              >
                <SelectTrigger className={cn(errors.segmento && "border-destructive")}>
                  <Briefcase className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Selecione o segmento" />
                </SelectTrigger>
                <SelectContent>
                  {SEGMENTOS.map((seg) => (
                    <SelectItem key={seg.value} value={seg.value}>
                      {seg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" {...register('segmento', { required: 'Segmento e obrigatorio' })} />
              {errors.segmento && (
                <p className="text-sm text-destructive">{errors.segmento.message}</p>
              )}
            </div>

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

        {/* Step 3: Endereço */}
        <WizardStep
          isActive={currentStep === 2}
          title="Endereco"
          description="Localizacao da empresa"
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
                  placeholder="Sala, Andar, etc."
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

        {/* Step 4: Redes Sociais */}
        <WizardStep
          isActive={currentStep === 3}
          title="Redes Sociais"
          description="Adicione suas redes sociais (opcional)"
          icon={Globe}
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Adicione links para suas redes sociais para aumentar a credibilidade do seu perfil.
            </p>
            <SocialLinksEditor
              links={socialLinks}
              onChange={setSocialLinks}
              maxLinks={6}
            />
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

            {/* Dados da Empresa */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Empresa
              </h3>
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <p className="text-sm"><span className="text-muted-foreground">CNPJ:</span> {allValues.cnpj}</p>
                <p className="text-sm"><span className="text-muted-foreground">Razao Social:</span> {allValues.razao_social}</p>
                {allValues.nome_fantasia && (
                  <p className="text-sm"><span className="text-muted-foreground">Nome Fantasia:</span> {allValues.nome_fantasia}</p>
                )}
                <p className="text-sm"><span className="text-muted-foreground">Segmento:</span> {allValues.segmento}</p>
                {allValues.telefone && (
                  <p className="text-sm"><span className="text-muted-foreground">Telefone:</span> {allValues.telefone}</p>
                )}
              </div>
            </div>

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

            {/* Redes Sociais */}
            {socialLinks.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Redes Sociais
                </h3>
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  {socialLinks.map((link, index) => (
                    <p key={index} className="text-sm">
                      <span className="text-muted-foreground capitalize">{link.platform}:</span> {link.url}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Termos */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-sm text-muted-foreground">
                Ao clicar em "Finalizar Cadastro", voce concorda com nossos{' '}
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
          Precisa contratar servicos?{' '}
          <Link to="/register/cliente" className="text-primary hover:underline font-medium">
            Cadastre-se como Cliente
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
