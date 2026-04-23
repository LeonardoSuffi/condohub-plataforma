import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import api from '@/services/api'
import AdaptiveLayout from '@/components/layout/AdaptiveLayout'
import ContactModal from '@/components/modals/ContactModal'
import ReviewCard from '@/components/reviews/ReviewCard'
import StarRating from '@/components/reviews/StarRating'
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
  TrendingUp,
  Zap,
  Share2,
  Heart,
  ExternalLink,
  Loader2,
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

  // Reviews
  const [reviews, setReviews] = useState([])
  const [reviewStats, setReviewStats] = useState(null)
  const [loadingReviews, setLoadingReviews] = useState(true)
  const [reviewsPage, setReviewsPage] = useState(1)
  const [reviewsPagination, setReviewsPagination] = useState(null)
  const [respondingReviewId, setRespondingReviewId] = useState(null)

  // Image error states
  const [logoError, setLogoError] = useState(false)
  const [coverError, setCoverError] = useState(false)

  // Check if current user owns this company
  const isOwner = isAuthenticated && user?.type === 'empresa' && company?.user_id === user?.id

  const storageUrl = STORAGE_URL

  useEffect(() => {
    loadCompany()
  }, [id])

  const loadCompany = async () => {
    try {
      setLoading(true)
      setError(null)
      setLogoError(false)
      setCoverError(false)
      const response = await api.get(`/public/companies/${id}`)
      setCompany(response.data.data)
    } catch (err) {
      setError('Empresa nao encontrada')
    } finally {
      setLoading(false)
    }
  }

  const loadReviews = async (page = 1) => {
    if (!company?.id) return

    try {
      setLoadingReviews(true)
      const response = await api.get(`/public/companies/${company.id}/reviews?page=${page}`)
      setReviews(response.data.data?.data || [])
      setReviewStats(response.data.stats)
      setReviewsPagination(response.data.data)
      setReviewsPage(page)
    } catch (err) {
      console.error('Failed to load reviews:', err)
    } finally {
      setLoadingReviews(false)
    }
  }

  // Load reviews when company is loaded
  useEffect(() => {
    if (company?.id) {
      loadReviews()
    }
  }, [company?.id])

  const handleRespondToReview = async (reviewId, responseText) => {
    setRespondingReviewId(reviewId)
    try {
      await api.post(`/reviews/${reviewId}/respond`, {
        response: responseText
      })
      toast.success('Resposta enviada com sucesso!')
      // Reload reviews to show the response
      await loadReviews(reviewsPage)
    } catch (err) {
      console.error('Failed to respond to review:', err)
      toast.error('Erro ao enviar resposta')
    } finally {
      setRespondingReviewId(null)
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
          {/* Hero skeleton - Full Width */}
          <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
            <div className="h-[450px] bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
              {/* Animated background */}
              <div className="absolute inset-0">
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
              </div>

              {/* Content skeleton */}
              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white/10 rounded-2xl animate-pulse" />
                  <div className="flex-1 space-y-4 text-center sm:text-left">
                    <div className="h-6 bg-white/10 rounded-full w-32 mx-auto sm:mx-0 animate-pulse" />
                    <div className="h-10 bg-white/10 rounded-xl w-64 mx-auto sm:mx-0 animate-pulse" />
                    <div className="h-4 bg-white/10 rounded w-48 mx-auto sm:mx-0 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Stats skeleton */}
              <div className="absolute bottom-0 left-0 right-0 translate-y-1/2 max-w-6xl mx-auto px-4">
                <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
                        <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
                        <div className="h-3 bg-gray-100 rounded w-20 animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content skeleton */}
          <div className="max-w-6xl mx-auto px-4 pt-32 pb-12">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-40 animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" />
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 h-48 animate-pulse" />
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

  const logoUrl = company.logo_url || null
  const coverUrl = company.cover_url || null
  const totalViews = company.services?.reduce((acc, s) => acc + (s.views_count || 0), 0) || 0
  const memberSince = company.created_at
    ? new Date(company.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : null

  return (
    <AdaptiveLayout>
      <div className="min-h-screen bg-gray-50">
        {/* ========== HERO SECTION - FULL WIDTH ========== */}
        <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden">
          {/* Background */}
          {coverUrl && !coverError ? (
            <>
              <img
                src={coverUrl}
                alt={`${company.nome_fantasia} - Capa`}
                className="absolute inset-0 w-full h-full object-cover"
                onError={() => setCoverError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-900/95" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
          )}

          {/* Animated Orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/30 via-indigo-500/20 to-transparent rounded-full blur-3xl animate-pulse"
              style={{ animationDuration: '4s' }}
            />
            <div
              className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-transparent rounded-full blur-3xl animate-pulse"
              style={{ animationDuration: '5s', animationDelay: '1s' }}
            />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/10 via-transparent to-cyan-500/10 rounded-full blur-3xl"
            />
          </div>

          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          />

          {/* Top Navigation Bar */}
          <div className="relative z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 transition-all border border-white/10"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Voltar</span>
                </button>

                <div className="flex items-center gap-3">
                  {company.verified && (
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/90 backdrop-blur-md text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/25">
                      <Shield className="h-4 w-4" />
                      <span className="hidden sm:inline">Verificada</span>
                    </div>
                  )}
                  <button
                    onClick={async () => {
                      const shareData = {
                        title: company.nome_fantasia,
                        text: `Confira ${company.nome_fantasia} no ServicePro!`,
                        url: window.location.href
                      }

                      try {
                        if (navigator.share && navigator.canShare?.(shareData)) {
                          await navigator.share(shareData)
                        } else {
                          await navigator.clipboard.writeText(window.location.href)
                          toast.success('Link copiado para a area de transferencia!')
                        }
                      } catch (err) {
                        if (err.name !== 'AbortError') {
                          await navigator.clipboard.writeText(window.location.href)
                          toast.success('Link copiado para a area de transferencia!')
                        }
                      }
                    }}
                    className="p-2.5 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 transition-all border border-white/10"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-8">
            <div className="flex flex-col lg:flex-row lg:items-end gap-8">
              {/* Logo & Company Info */}
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 flex-1">
                {/* Logo */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-3xl blur opacity-40 group-hover:opacity-60 transition-opacity" />
                  <div className="relative w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden ring-4 ring-white/20">
                    {logoUrl && !logoError ? (
                      <img
                        src={logoUrl}
                        alt={company.nome_fantasia}
                        className="w-full h-full object-cover"
                        onError={() => setLogoError(true)}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                        <span className="text-5xl font-bold text-slate-600">
                          {getInitials(company.nome_fantasia)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Company Details */}
                <div className="text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
                    {company.segmento && (
                      <span className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white/90 rounded-full text-sm font-medium border border-white/10">
                        {company.segmento}
                      </span>
                    )}
                    {company.average_rating && (
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 backdrop-blur-sm text-amber-300 rounded-full text-sm font-semibold border border-amber-400/20">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        {parseFloat(company.average_rating).toFixed(1)}
                      </span>
                    )}
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight">
                    {company.nome_fantasia}
                  </h1>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-white/70">
                    {(company.cidade || company.estado) && (
                      <span className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4" />
                        {[company.cidade, company.estado].filter(Boolean).join(', ')}
                      </span>
                    )}
                    {memberSince && (
                      <span className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        Desde {memberSince}
                      </span>
                    )}
                    {company.reviews_count > 0 && (
                      <span className="flex items-center gap-2 text-sm">
                        <MessageSquare className="h-4 w-4" />
                        {company.reviews_count} avaliacoes
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="flex flex-col items-center lg:items-end gap-4">
                <button
                  onClick={handleContactClick}
                  className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-2xl shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-[1.02] flex items-center gap-3"
                >
                  <MessageSquare className="h-5 w-5" />
                  Solicitar Orcamento
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                {!isAuthenticated && (
                  <p className="text-sm text-white/50">Faca login para contatar</p>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Stats Bar - OUTSIDE hero, overlapping */}
        <div className="relative z-30 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-100">
              <div className="p-6 text-center group hover:bg-gray-50 transition-colors">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mb-3 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{company.services_count || 0}</div>
                <p className="text-sm text-gray-500 font-medium">Servicos</p>
              </div>
              <div className="p-6 text-center group hover:bg-gray-50 transition-colors">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl mb-3 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                  <ThumbsUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-emerald-600">{company.deals_completed_count || 0}</div>
                <p className="text-sm text-gray-500 font-medium">Realizados</p>
              </div>
              <div className="p-6 text-center group hover:bg-gray-50 transition-colors">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl mb-3 shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{totalViews}</div>
                <p className="text-sm text-gray-500 font-medium">Visualizacoes</p>
              </div>
              <div className="p-6 text-center group hover:bg-gray-50 transition-colors">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl mb-3 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {company.average_rating ? parseFloat(company.average_rating).toFixed(1) : '-'}
                </div>
                <p className="text-sm text-gray-500 font-medium">Avaliacao</p>
              </div>
            </div>
          </div>
        </div>

        {/* ========== MAIN CONTENT ========== */}
        <div className="pt-12 pb-12">
          {/* Content Grid */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-8">
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

              {/* Reviews Section */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Star className="h-6 w-6 text-amber-400 fill-amber-400" />
                    Avaliacoes
                    {reviewStats?.total > 0 && (
                      <span className="text-sm font-normal text-gray-500">
                        ({reviewStats.total})
                      </span>
                    )}
                  </h2>
                </div>
              </div>

              <div className="p-6">
                {loadingReviews ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : reviewStats?.total > 0 ? (
                  <div className="space-y-6">
                    {/* Stats Overview */}
                    <div className="flex flex-col md:flex-row gap-6 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
                      {/* Average Rating */}
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="text-5xl font-bold text-gray-900 mb-2">
                          {reviewStats.average?.toFixed(1) || '0.0'}
                        </div>
                        <StarRating rating={reviewStats.average || 0} readonly size="md" />
                        <p className="text-sm text-gray-500 mt-2">
                          {reviewStats.total} {reviewStats.total === 1 ? 'avaliacao' : 'avaliacoes'}
                        </p>
                      </div>

                      {/* Rating Distribution */}
                      <div className="flex-1">
                        <div className="space-y-2">
                          {[5, 4, 3, 2, 1].map((stars) => {
                            const count = reviewStats.distribution?.[stars] || 0
                            const percentage = reviewStats.total > 0
                              ? Math.round((count / reviewStats.total) * 100)
                              : 0

                            return (
                              <div key={stars} className="flex items-center gap-3">
                                <div className="flex items-center gap-1 w-12">
                                  <span className="text-sm font-medium text-gray-700">{stars}</span>
                                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                </div>
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-amber-400 rounded-full transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="text-sm text-gray-500 w-10 text-right">
                                  {count}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <ReviewCard
                          key={review.id}
                          review={{
                            ...review,
                            client_name: review.client?.user?.name || 'Cliente',
                          }}
                          showResponse={true}
                          canRespond={isOwner && !review.response}
                          onRespond={handleRespondToReview}
                          responding={respondingReviewId === review.id}
                        />
                      ))}
                    </div>

                    {/* Pagination */}
                    {reviewsPagination?.last_page > 1 && (
                      <div className="flex items-center justify-center gap-2 pt-4">
                        <button
                          onClick={() => loadReviews(reviewsPage - 1)}
                          disabled={reviewsPage === 1}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Anterior
                        </button>
                        <span className="text-sm text-gray-500">
                          Pagina {reviewsPage} de {reviewsPagination.last_page}
                        </span>
                        <button
                          onClick={() => loadReviews(reviewsPage + 1)}
                          disabled={reviewsPage === reviewsPagination.last_page}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Proxima
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-7 h-7 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma avaliacao ainda</h3>
                    <p className="text-gray-500">Seja o primeiro a avaliar esta empresa</p>
                  </div>
                )}
              </div>
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
