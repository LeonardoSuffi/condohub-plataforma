import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '@/services/api'
import AdaptiveLayout from '@/components/layout/AdaptiveLayout'
import ContactModal from '@/components/modals/ContactModal'
import { STORAGE_URL } from '@/lib/config'
import {
  Building2,
  MapPin,
  CheckCircle,
  Briefcase,
  Calendar,
  ArrowLeft,
  ArrowRight,
  ImageIcon,
  Star,
  Eye,
  Phone,
  Mail,
  Globe,
  Clock,
  Shield,
  Award,
  Users,
  ThumbsUp,
  MessageSquare,
  ChevronRight,
  Sparkles,
} from 'lucide-react'

export default function CompanyProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modal de contato
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState(null)

  const storageUrl = STORAGE_URL

  useEffect(() => {
    loadCompany()
  }, [id])

  const loadCompany = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get(`/public/companies/${id}`)
      setCompany(response.data.data)
    } catch (err) {
      setError('Empresa nao encontrada')
    } finally {
      setLoading(false)
    }
  }

  const handleViewService = (service) => {
    // Ao clicar no card do servico, abre o modal de contato com o servico selecionado
    handleContactClick(service)
  }

  const handleContactClick = (service = null) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/empresa/${id}` } })
      return
    }
    // Empresas nao podem solicitar orcamento de outras empresas
    if (user?.type === 'empresa') {
      return
    }
    setSelectedService(service)
    setContactModalOpen(true)
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <AdaptiveLayout>
        <div className="min-h-screen bg-gray-50">
          {/* Hero skeleton */}
          <div className="h-80 bg-gradient-to-br from-slate-800 to-slate-900 animate-pulse" />
          <div className="max-w-6xl mx-auto px-4 -mt-20">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 bg-gray-200 rounded-2xl animate-pulse" />
                <div className="flex-1 space-y-3">
                  <div className="h-8 bg-gray-200 rounded w-64 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdaptiveLayout>
    )
  }

  if (error || !company) {
    return (
      <AdaptiveLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Empresa nao encontrada</h2>
            <p className="text-gray-500 mb-8">A empresa que voce procura nao existe ou foi removida.</p>
            <button
              onClick={() => navigate('/empresas')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-900 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Ver outras empresas
            </button>
          </div>
        </div>
      </AdaptiveLayout>
    )
  }

  const logoUrl = company.logo_url ? `${storageUrl}/${company.logo_url}` : null
  const coverUrl = company.cover_path ? `${storageUrl}/${company.cover_path}` : null
  const totalViews = company.services?.reduce((acc, s) => acc + (s.views_count || 0), 0) || 0
  const memberSince = company.created_at
    ? new Date(company.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : null

  return (
    <AdaptiveLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section with Cover Image */}
        <div className="relative h-72 sm:h-80 lg:h-96 overflow-hidden">
          {/* Cover Image or Background gradient */}
          {coverUrl ? (
            <>
              <img
                src={coverUrl}
                alt={`${company.nome_fantasia} - Capa`}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-black" />
              {/* Decorative elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
              </div>
            </>
          )}

          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          </div>

          {/* Back button */}
          <div className="absolute top-6 left-6 z-10">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 bg-black/30 backdrop-blur-sm text-white rounded-lg hover:bg-black/50 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Voltar</span>
            </button>
          </div>

          {/* Verified badge on hero */}
          {company.verified && (
            <div className="absolute top-6 right-6 z-10">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/90 backdrop-blur-sm text-white rounded-full text-sm font-medium">
                <Shield className="h-4 w-4" />
                Empresa Verificada
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Card */}
          <div className="relative -mt-32 sm:-mt-28 mb-8">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Logo */}
                  <div className="flex-shrink-0">
                    <div className="w-28 h-28 sm:w-36 sm:h-36 bg-white rounded-2xl shadow-lg border-4 border-white flex items-center justify-center overflow-hidden mx-auto sm:mx-0">
                      {logoUrl ? (
                        <img src={logoUrl} alt={company.nome_fantasia} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                          <span className="text-4xl font-bold text-slate-600">
                            {getInitials(company.nome_fantasia)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                          {company.nome_fantasia}
                        </h1>

                        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 text-gray-500 mb-4">
                          {company.segmento && (
                            <span className="flex items-center gap-1.5 text-sm">
                              <Briefcase className="h-4 w-4" />
                              {company.segmento}
                            </span>
                          )}
                          {(company.cidade || company.estado) && (
                            <span className="flex items-center gap-1.5 text-sm">
                              <MapPin className="h-4 w-4" />
                              {[company.cidade, company.estado].filter(Boolean).join(', ')}
                            </span>
                          )}
                        </div>

                        {/* Rating */}
                        <div className="flex items-center justify-center sm:justify-start gap-4">
                          {company.average_rating ? (
                            <>
                              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-lg">
                                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                                <span className="text-lg font-bold text-amber-700">{parseFloat(company.average_rating).toFixed(1)}</span>
                              </div>
                              <span className="text-sm text-gray-500">
                                {company.reviews_count || 0} avaliacoes
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-500 px-3 py-1.5 bg-gray-50 rounded-lg">
                              Sem avaliacoes ainda
                            </span>
                          )}
                        </div>
                      </div>

                      {/* CTA Button */}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={handleContactClick}
                          className="px-6 py-3 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Solicitar Orcamento
                        </button>
                        {!isAuthenticated && (
                          <p className="text-xs text-gray-400 text-center">Faca login para contatar</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-gray-100">
                <div className="p-4 sm:p-6 text-center border-r border-b sm:border-b-0 border-gray-100">
                  <div className="flex items-center justify-center gap-2 text-2xl sm:text-3xl font-bold text-slate-800">
                    <Briefcase className="h-5 w-5 text-slate-400" />
                    {company.services_count || 0}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Servicos</p>
                </div>
                <div className="p-4 sm:p-6 text-center border-b sm:border-b-0 sm:border-r border-gray-100">
                  <div className="flex items-center justify-center gap-2 text-2xl sm:text-3xl font-bold text-emerald-600">
                    <ThumbsUp className="h-5 w-5 text-emerald-400" />
                    {company.deals_completed_count || 0}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Realizados</p>
                </div>
                <div className="p-4 sm:p-6 text-center border-r border-gray-100">
                  <div className="flex items-center justify-center gap-2 text-2xl sm:text-3xl font-bold text-slate-800">
                    <Eye className="h-5 w-5 text-slate-400" />
                    {totalViews}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Visualizacoes</p>
                </div>
                <div className="p-4 sm:p-6 text-center">
                  <div className="flex items-center justify-center gap-2 text-2xl sm:text-3xl font-bold text-slate-800">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    {memberSince ? new Date(company.created_at).getFullYear() : '-'}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Na plataforma</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8 pb-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              {company.descricao && (
                <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-slate-600" />
                    Sobre a Empresa
                  </h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {company.descricao}
                  </p>
                </div>
              )}

              {/* Services */}
              <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-slate-600" />
                    Servicos Oferecidos
                  </h2>
                  {company.services?.length > 3 && (
                    <span className="text-sm text-gray-500">
                      {company.services.length} servicos
                    </span>
                  )}
                </div>

                {company.services && company.services.length > 0 ? (
                  <div className="space-y-4">
                    {company.services.map((service, index) => {
                      const coverImage = service.cover_image ? `${storageUrl}/${service.cover_image}` : null

                      return (
                        <div
                          key={service.id}
                          onClick={() => handleViewService(service)}
                          className="group flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-slate-50 hover:shadow-md transition-all duration-300"
                        >
                          {/* Image */}
                          <div className="w-full sm:w-40 h-32 sm:h-28 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-slate-200 to-slate-300">
                            {coverImage ? (
                              <img src={coverImage} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="h-8 w-8 text-slate-400" />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900 group-hover:text-slate-700 transition-colors">
                                {service.title}
                              </h3>
                              {service.featured && (
                                <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                                  <Star className="h-3 w-3" />
                                  Destaque
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                              {service.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-3">
                              {service.category && (
                                <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                                  {service.category.name}
                                </span>
                              )}
                              <span className="text-sm font-semibold text-slate-800">
                                {service.price_range ? `R$ ${service.price_range}` : 'Sob consulta'}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <Eye className="h-3.5 w-3.5" />
                                {service.views_count || 0}
                              </span>
                              <div className="ml-auto flex items-center gap-2">
                                {isAuthenticated && user?.type !== 'empresa' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleContactClick(service)
                                    }}
                                    className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                                  >
                                    <MessageSquare className="h-3.5 w-3.5" />
                                    Solicitar
                                  </button>
                                )}
                                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="w-7 h-7 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum servico cadastrado</h3>
                    <p className="text-gray-500">Esta empresa ainda nao cadastrou servicos</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Trust Card */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-500" />
                  Confianca e Seguranca
                </h3>
                <div className="space-y-3">
                  {company.verified && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                      </div>
                      <span className="text-gray-600">Empresa verificada</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Award className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-gray-600">Pagamento seguro</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Users className="h-4 w-4 text-amber-600" />
                    </div>
                    <span className="text-gray-600">Suporte ao cliente</span>
                  </div>
                  {memberSince && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Clock className="h-4 w-4 text-slate-600" />
                      </div>
                      <span className="text-gray-600">Membro desde {memberSince}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Card */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-sm p-6 text-white">
                <h3 className="font-semibold mb-4">Precisa de um orcamento?</h3>
                <p className="text-slate-300 text-sm mb-6">
                  Entre em contato com {company.nome_fantasia} para solicitar um orcamento personalizado.
                </p>
                <button
                  onClick={handleContactClick}
                  className="w-full px-4 py-3 bg-white text-slate-800 font-semibold rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Entrar em Contato
                </button>
              </div>

              {/* Quick Info */}
              {(company.website || company.telefone) && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Informacoes</h3>
                  <div className="space-y-3">
                    {company.telefone && (
                      <a href={`tel:${company.telefone}`} className="flex items-center gap-3 text-sm text-gray-600 hover:text-slate-800 transition-colors">
                        <Phone className="h-4 w-4" />
                        {company.telefone}
                      </a>
                    )}
                    {company.website && (
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-600 hover:text-slate-800 transition-colors">
                        <Globe className="h-4 w-4" />
                        Visitar site
                      </a>
                    )}
                    {company.email && (
                      <a href={`mailto:${company.email}`} className="flex items-center gap-3 text-sm text-gray-600 hover:text-slate-800 transition-colors">
                        <Mail className="h-4 w-4" />
                        {company.email}
                      </a>
                    )}
                    {(company.cidade || company.estado) && (
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {[company.cidade, company.estado].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Contato */}
      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => {
          setContactModalOpen(false)
          setSelectedService(null)
        }}
        company={company}
        services={company?.services || []}
        selectedService={selectedService}
      />
    </AdaptiveLayout>
  )
}
