import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '@/services/api'
import { cn, getInitials, getStorageUrl, formatDate } from '@/lib/utils'
import {
  Building2,
  MapPin,
  CheckCircle,
  Briefcase,
  Calendar,
  ArrowLeft,
  ImageIcon,
  ChevronRight,
  Star,
  Eye,
} from 'lucide-react'
import PublicHeader from '@/components/layout/PublicHeader'
import PublicFooter from '@/components/layout/PublicFooter'
import { GradientButton } from '@/components/ui/gradient-button'

export default function CompanyProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  const handleViewService = (serviceId) => {
    if (isAuthenticated) {
      navigate(`/services/${serviceId}`)
    } else {
      navigate('/login', { state: { from: `/services/${serviceId}` } })
    }
  }

  if (loading) {
    return <CompanyProfileSkeleton />
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <PublicHeader />
        <div className="flex-1 flex items-center justify-center px-4 py-16 pt-24">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Empresa nao encontrada</h2>
            <p className="text-gray-500 mb-8">A empresa que voce procura nao existe ou foi removida.</p>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
          </div>
        </div>
        <PublicFooter />
      </div>
    )
  }

  const logoUrl = company.logo_url ? getStorageUrl(company.logo_url) : null

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicHeader />

      {/* Cover */}
      <div className="relative h-48 md:h-64 overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800" />
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-white/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-white/5 rounded-full blur-[128px]" />
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-20 md:-mt-28 pb-12 w-full">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row md:items-end gap-6 mb-10">
          {/* Avatar */}
          <div className="relative">
            <div className="h-28 w-28 md:h-36 md:w-36 rounded-2xl bg-white border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt={company.nome_fantasia} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl md:text-4xl font-bold text-primary-600">
                  {getInitials(company.nome_fantasia)}
                </span>
              )}
            </div>
            {company.verified && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{company.nome_fantasia}</h1>
              {company.verified && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 border border-green-200 rounded-full text-sm text-green-700">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Verificado
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-gray-500">
              {company.segmento && (
                <span className="flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4" />
                  {company.segmento}
                </span>
              )}
              {(company.cidade || company.estado) && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {[company.cidade, company.estado].filter(Boolean).join(', ')}
                </span>
              )}
              {company.created_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Desde {new Date(company.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard
            value={company.services_count || 0}
            label="Servicos Ativos"
            color="primary"
          />
          <StatCard
            value={company.deals_completed_count || 0}
            label="Servicos Realizados"
            color="emerald"
          />
          <StatCard
            value={company.services?.reduce((acc, s) => acc + (s.views_count || 0), 0) || 0}
            label="Visualizacoes"
            color="blue"
          />
          <StatCard
            value={company.average_rating || '4.8'}
            label="Avaliacao"
            icon={<Star className="h-5 w-5 text-amber-500 fill-amber-500" />}
          />
        </div>

        {/* About */}
        {company.descricao && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sobre a Empresa</h2>
            <p className="text-gray-600 whitespace-pre-line leading-relaxed">
              {company.descricao}
            </p>
          </div>
        )}

        {/* Services */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Servicos Oferecidos</h2>
            {company.services?.length > 6 && (
              <button className="flex items-center gap-1 text-primary-600 font-medium hover:text-primary-700 transition-colors">
                Ver todos
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>

          {company.services && company.services.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {company.services.slice(0, 6).map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onClick={() => handleViewService(service.id)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum servico cadastrado</h3>
              <p className="text-gray-500">Esta empresa ainda nao cadastrou servicos</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700" />

          <div className="relative py-10 px-8 text-center">
            <h3 className="text-xl font-bold text-white mb-3">
              Interessado nos servicos de {company.nome_fantasia}?
            </h3>
            <p className="text-primary-100 mb-6">
              Entre em contato atraves de um dos servicos acima para solicitar um orcamento
            </p>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 font-medium rounded-xl hover:bg-gray-100 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para busca
            </button>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}

function StatCard({ value, label, color = 'primary', icon }) {
  const colorClasses = {
    primary: 'text-primary-600',
    emerald: 'text-emerald-600',
    blue: 'text-blue-600',
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
      <div className={cn('text-2xl md:text-3xl font-bold flex items-center justify-center gap-1.5', colorClasses[color] || 'text-gray-900')}>
        {icon}
        {value}
      </div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  )
}

function ServiceCard({ service, onClick }) {
  const coverImage = service.cover_image ? getStorageUrl(service.cover_image) : null

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md hover:border-primary-200 transition-all duration-300 group"
      onClick={onClick}
    >
      {/* Cover Image */}
      <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt={service.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-10 w-10 text-gray-400" />
          </div>
        )}

        {service.featured && (
          <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 bg-primary-600 rounded-full text-xs font-medium text-white">
            <Star className="h-3 w-3" />
            Destaque
          </div>
        )}

        {service.images_count > 0 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 bg-black/60 rounded-full text-xs text-white">
            <ImageIcon className="h-3 w-3" />
            {service.images_count}
          </div>
        )}

        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="px-4 py-2 bg-white rounded-lg text-gray-900 text-sm font-medium shadow-lg">
            Ver Detalhes
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 line-clamp-1 mb-2 group-hover:text-primary-600 transition-colors">
          {service.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
          {service.description}
        </p>

        <div className="flex items-center justify-between">
          {service.category && (
            <span className="text-xs font-medium text-primary-700 bg-primary-100 px-2.5 py-1 rounded">
              {service.category.name}
            </span>
          )}
          <span className="text-sm font-semibold text-gray-900">
            {service.price_range ? `R$ ${service.price_range}` : 'Sob consulta'}
          </span>
        </div>

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {service.views_count || 0}
          </span>
          {service.region && <span>{service.region}</span>}
        </div>
      </div>
    </div>
  )
}

function CompanyProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      {/* Cover */}
      <div className="h-48 md:h-64 bg-gradient-to-br from-primary-600 to-primary-700 pt-16" />

      <div className="max-w-5xl mx-auto px-4 -mt-20 md:-mt-28 pb-12">
        {/* Header */}
        <div className="flex items-end gap-6 mb-10">
          <div className="h-28 w-28 md:h-36 md:w-36 rounded-2xl bg-white border-4 border-white shadow-xl animate-pulse" />
          <div className="flex-1 space-y-3">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-xl shadow-sm animate-pulse" />
          ))}
        </div>

        {/* About */}
        <div className="h-48 bg-white rounded-2xl shadow-sm mb-10 animate-pulse" />

        {/* Services */}
        <div className="grid md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-72 bg-white rounded-xl shadow-sm animate-pulse" />
          ))}
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
