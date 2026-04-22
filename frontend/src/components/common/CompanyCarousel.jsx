import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { STORAGE_URL } from '../../lib/config'
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Star,
  Briefcase,
  CheckCircle,
  Shield,
  Sparkles,
  Clock,
  TrendingUp,
  Award,
  ArrowRight,
} from 'lucide-react'

const iconMap = {
  star: Star,
  clock: Clock,
  trending: TrendingUp,
  award: Award,
  shield: Shield,
  sparkles: Sparkles,
}

export default function CompanyCarousel({
  title,
  subtitle,
  companies = [],
  icon = 'star',
  accentColor = 'slate',
  showBadge = null,
  badgeText = '',
  viewAllLink = '/empresas',
  emptyMessage = 'Nenhuma empresa encontrada',
  layout = 'carousel', // 'carousel' ou 'grid'
  maxItems = 20,
  autoScroll = true,
  scrollSpeed = 30, // pixels per second
}) {
  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const storageUrl = STORAGE_URL

  const IconComponent = iconMap[icon] || Star

  const colorClasses = {
    slate: {
      icon: 'bg-slate-100 text-slate-600',
      badge: 'bg-slate-100 text-slate-700',
      button: 'bg-slate-800 text-white hover:bg-slate-900',
    },
    amber: {
      icon: 'bg-amber-100 text-amber-600',
      badge: 'bg-amber-100 text-amber-700',
      button: 'bg-amber-500 text-white hover:bg-amber-600',
    },
    emerald: {
      icon: 'bg-emerald-100 text-emerald-600',
      badge: 'bg-emerald-100 text-emerald-700',
      button: 'bg-emerald-500 text-white hover:bg-emerald-600',
    },
    blue: {
      icon: 'bg-blue-100 text-blue-600',
      badge: 'bg-blue-100 text-blue-700',
      button: 'bg-blue-500 text-white hover:bg-blue-600',
    },
    purple: {
      icon: 'bg-purple-100 text-purple-600',
      badge: 'bg-purple-100 text-purple-700',
      button: 'bg-purple-500 text-white hover:bg-purple-600',
    },
  }

  const colors = colorClasses[accentColor] || colorClasses.slate

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
      setTimeout(checkScroll, 300)
    }
  }

  if (companies.length === 0) {
    return null
  }

  const displayCompanies = companies.slice(0, maxItems)

  // Grid Layout
  if (layout === 'grid') {
    return (
      <div className="mb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors.icon} shadow-sm`}>
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              {subtitle && <p className="text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <Link
            to={viewAllLink}
            className={`hidden sm:flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${colors.button}`}
          >
            Ver todas
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {displayCompanies.map((company, index) => (
            <CompanyCard
              key={company.id}
              company={company}
              storageUrl={storageUrl}
              showBadge={showBadge}
              badgeText={badgeText}
              index={index}
              accentColor={accentColor}
              compact
            />
          ))}
        </div>

        {/* Mobile view all */}
        <div className="mt-6 text-center sm:hidden">
          <Link
            to={viewAllLink}
            className={`inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl transition-colors ${colors.button}`}
          >
            Ver todas as empresas
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  // Infinite Scroll Carousel Layout
  if (autoScroll && displayCompanies.length > 3) {
    // Calcula a duracao baseada na quantidade de items e velocidade
    const itemWidth = 308 // largura do card (288px) + gap (20px)
    const totalWidth = displayCompanies.length * itemWidth
    const duration = totalWidth / scrollSpeed

    return (
      <div className="mb-8">
        {/* Header - Centered */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors.icon} shadow-sm`}>
                <IconComponent className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                {subtitle && <p className="text-gray-500 mt-0.5">{subtitle}</p>}
              </div>
            </div>
            <Link
              to={viewAllLink}
              className={`hidden sm:flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${colors.button}`}
            >
              Ver todas
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Infinite Scroll Container - Full Width */}
        <div className="overflow-hidden w-full">
          <div
            className="flex gap-5 animate-scroll pl-4"
            style={{
              '--scroll-duration': `${duration}s`,
              width: 'max-content',
            }}
          >
            {/* First set of cards */}
            {displayCompanies.map((company, index) => (
              <CompanyCard
                key={`first-${company.id}`}
                company={company}
                storageUrl={storageUrl}
                showBadge={showBadge}
                badgeText={badgeText}
                index={index}
                accentColor={accentColor}
              />
            ))}
            {/* Duplicated set for seamless loop */}
            {displayCompanies.map((company, index) => (
              <CompanyCard
                key={`second-${company.id}`}
                company={company}
                storageUrl={storageUrl}
                showBadge={showBadge}
                badgeText={badgeText}
                index={index}
                accentColor={accentColor}
              />
            ))}
          </div>
        </div>

        {/* Mobile view all - Centered */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 text-center sm:hidden">
          <Link
            to={viewAllLink}
            className={`inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl transition-colors ${colors.button}`}
          >
            Ver todas as empresas
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <style>{`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .animate-scroll {
            animation: scroll var(--scroll-duration, 30s) linear infinite;
          }
          .animate-scroll:hover {
            animation-play-state: paused;
          }
        `}</style>
      </div>
    )
  }

  // Manual Carousel Layout (fallback for few items)
  return (
    <div className="mb-8">
      {/* Header - Centered */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors.icon} shadow-sm`}>
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              {subtitle && <p className="text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Scroll buttons */}
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`p-2.5 rounded-xl border transition-all duration-200 ${
                canScrollLeft
                  ? 'border-gray-200 hover:bg-gray-100 hover:border-gray-300 text-gray-600'
                  : 'border-gray-100 text-gray-300 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`p-2.5 rounded-xl border transition-all duration-200 ${
                canScrollRight
                  ? 'border-gray-200 hover:bg-gray-100 hover:border-gray-300 text-gray-600'
                  : 'border-gray-100 text-gray-300 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <Link
              to={viewAllLink}
              className={`hidden sm:flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${colors.button}`}
            >
              Ver todas
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Carousel - Full Width */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 pl-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {displayCompanies.map((company, index) => (
          <CompanyCard
            key={company.id}
            company={company}
            storageUrl={storageUrl}
            showBadge={showBadge}
            badgeText={badgeText}
            index={index}
            accentColor={accentColor}
          />
        ))}
        {/* Spacer at the end */}
        <div className="flex-shrink-0 w-4" />
      </div>

      {/* Mobile view all - Centered */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 text-center sm:hidden">
        <Link
          to={viewAllLink}
          className={`inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl transition-colors ${colors.button}`}
        >
          Ver todas as empresas
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

function CompanyCard({ company, storageUrl, showBadge, badgeText, index, accentColor, compact = false }) {
  const logoUrl = company.logo_url ? `${storageUrl}/${company.logo_url}` : null
  const rating = company.average_rating ? parseFloat(company.average_rating).toFixed(1) : null
  const completedServices = company.deals_completed_count || 0
  const servicesList = company.services_list || []
  const reviewsCount = company.reviews_count || 0

  const gradients = [
    'from-slate-700 via-slate-800 to-slate-900',
    'from-blue-700 via-blue-800 to-blue-900',
    'from-emerald-700 via-emerald-800 to-emerald-900',
    'from-purple-700 via-purple-800 to-purple-900',
    'from-amber-700 via-amber-800 to-amber-900',
    'from-rose-700 via-rose-800 to-rose-900',
    'from-cyan-700 via-cyan-800 to-cyan-900',
    'from-indigo-700 via-indigo-800 to-indigo-900',
  ]

  const gradient = gradients[index % gradients.length]

  if (compact) {
    return (
      <Link
        to={`/empresa/${company.slug || company.id}`}
        className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 hover:-translate-y-1"
      >
        {/* Header with gradient */}
        <div className={`h-20 bg-gradient-to-br ${gradient} relative`}>
          {/* Badges */}
          {showBadge === 'new' && (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-emerald-500 text-white rounded-full text-xs font-semibold">
              <Sparkles className="w-3 h-3" />
              Novo
            </div>
          )}
          {showBadge === 'top' && (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-amber-500 text-white rounded-full text-xs font-semibold">
              <Award className="w-3 h-3" />
              Top
            </div>
          )}
          {showBadge === 'verified' && company.verified && (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-blue-500 text-white rounded-full text-xs font-semibold">
              <Shield className="w-3 h-3" />
            </div>
          )}
          {company.verified && showBadge !== 'verified' && (
            <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/90 text-white rounded-full text-xs">
              <Shield className="w-3 h-3" />
            </div>
          )}

          {/* Logo */}
          <div className="absolute -bottom-6 left-3">
            <div className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center overflow-hidden border-2 border-white">
              {logoUrl ? (
                <img src={logoUrl} alt={company.nome_fantasia} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <span className="text-lg font-bold text-slate-600">
                    {(company.nome_fantasia || 'E').charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-8 px-3 pb-3">
          <h3 className="font-bold text-gray-900 group-hover:text-slate-700 transition-colors line-clamp-1 text-sm">
            {company.nome_fantasia}
          </h3>

          {/* Location */}
          {company.cidade && (
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {company.cidade}
            </p>
          )}

          {/* Rating */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
            {rating ? (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 rounded-md">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span className="font-bold text-amber-700 text-xs">{rating}</span>
              </div>
            ) : (
              <span className="text-xs text-gray-400">Sem aval.</span>
            )}
            {rating && <span className="text-xs text-gray-400">{reviewsCount} aval.</span>}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={`/empresa/${company.slug || company.id}`}
      className="group flex-shrink-0 w-72 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 snap-start hover:-translate-y-1"
    >
      {/* Header with gradient */}
      <div className={`h-24 bg-gradient-to-br ${gradient} relative`}>
        {/* Badges */}
        {showBadge === 'new' && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-emerald-500 text-white rounded-full text-xs font-semibold shadow-lg">
            <Sparkles className="w-3 h-3" />
            Novo
          </div>
        )}
        {showBadge === 'top' && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-white rounded-full text-xs font-semibold shadow-lg">
            <Award className="w-3 h-3" />
            Top
          </div>
        )}
        {showBadge === 'verified' && company.verified && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-blue-500 text-white rounded-full text-xs font-semibold shadow-lg">
            <Shield className="w-3 h-3" />
            Verificado
          </div>
        )}
        {company.verified && showBadge !== 'verified' && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-emerald-500/90 text-white rounded-full text-xs font-medium">
            <Shield className="w-3 h-3" />
          </div>
        )}

        {/* Logo */}
        <div className="absolute -bottom-8 left-4">
          <div className="w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center overflow-hidden border-4 border-white group-hover:scale-105 transition-transform duration-300">
            {logoUrl ? (
              <img src={logoUrl} alt={company.nome_fantasia} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <span className="text-xl font-bold text-slate-600">
                  {(company.nome_fantasia || 'E').charAt(0)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-12 px-4 pb-4">
        <h3 className="font-bold text-gray-900 group-hover:text-slate-700 transition-colors line-clamp-1 mb-1">
          {company.nome_fantasia}
        </h3>

        {/* Location */}
        {company.cidade && (
          <p className="text-sm text-gray-400 flex items-center gap-1 mb-2">
            <MapPin className="w-3.5 h-3.5" />
            {company.cidade}, {company.estado}
          </p>
        )}

        {/* Services Tags */}
        <div className="flex flex-wrap gap-1 mb-3 min-h-[28px]">
          {servicesList.slice(0, 2).map((service, idx) => (
            <span
              key={idx}
              className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
            >
              {service}
            </span>
          ))}
          {servicesList.length > 2 && (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">
              +{servicesList.length - 2}
            </span>
          )}
        </div>

        {/* Rating and Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            {rating ? (
              <>
                <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-lg">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="font-bold text-amber-700 text-sm">{rating}</span>
                </div>
                {reviewsCount > 0 && (
                  <span className="text-xs text-gray-400">({reviewsCount})</span>
                )}
              </>
            ) : (
              <span className="text-xs text-gray-400">Sem avaliacoes</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              {company.services_count || 0}
            </span>
            {completedServices > 0 && (
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                {completedServices}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
