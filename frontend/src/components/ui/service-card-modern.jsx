import * as React from "react"
import { Link } from "react-router-dom"
import { MapPin, Star, Clock, Eye, ArrowRight, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"

const ServiceCardModern = React.forwardRef(
  ({ service, onClick, className, ...props }, ref) => {
    const handleClick = () => {
      if (onClick) {
        onClick(service.id)
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "group glass rounded-xl border border-white/5 overflow-hidden hover:border-primary-500/30 hover:shadow-glow-sm transition-all duration-300 cursor-pointer",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {/* Image / Placeholder */}
        <div className="relative h-40 bg-gradient-to-br from-neutral-800 to-neutral-900 overflow-hidden">
          {service.cover_image ? (
            <img
              src={service.cover_image}
              alt={service.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-violet/5 group-hover:from-primary-500/10 group-hover:to-accent-violet/10 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="w-8 h-8 text-white/40 group-hover:text-primary-400 transition-colors" />
                </div>
              </div>
            </>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-transparent to-transparent" />

          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span className="text-xs font-medium text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
              {service.category?.name || 'Servico'}
            </span>
          </div>

          {/* Status / Featured badge */}
          {service.is_featured && (
            <div className="absolute top-3 right-3">
              <span className="text-xs font-medium text-primary-400 bg-primary-500/20 backdrop-blur-sm px-2.5 py-1 rounded-full border border-primary-500/30 flex items-center gap-1">
                <Star className="w-3 h-3" />
                Destaque
              </span>
            </div>
          )}

          {/* Company info overlay */}
          {service.company && (
            <div className="absolute bottom-3 left-3 right-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/10 backdrop-blur rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {service.company.logo_url ? (
                    <img src={service.company.logo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-white/60">
                      {(service.company.nome_fantasia || service.company.name)?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-sm text-white/90 truncate">
                  {service.company.nome_fantasia || service.company.name}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3 className="font-semibold text-white line-clamp-1 group-hover:text-primary-400 transition-colors">
            {service.title}
          </h3>

          {/* Description */}
          {service.description && (
            <p className="text-sm text-neutral-500 line-clamp-2">
              {service.description}
            </p>
          )}

          {/* Meta info */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center gap-3 text-xs text-neutral-500">
              {service.company?.cidade && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {service.company.cidade}
                </span>
              )}
              {service.views_count > 0 && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {service.views_count}
                </span>
              )}
            </div>
            <span className="font-semibold text-white">
              {service.price_range || 'Sob consulta'}
            </span>
          </div>
        </div>

        {/* Hover overlay with action */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary-600/90 via-primary-600/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6 pointer-events-none">
          <span className="flex items-center gap-2 text-white font-medium">
            Ver detalhes
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    )
  }
)
ServiceCardModern.displayName = "ServiceCardModern"

// Skeleton variant for loading state
const ServiceCardSkeleton = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "glass rounded-xl border border-white/5 overflow-hidden animate-pulse",
          className
        )}
        {...props}
      >
        {/* Image placeholder */}
        <div className="h-40 bg-neutral-800" />

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title skeleton */}
          <div className="h-5 bg-neutral-800 rounded-lg w-3/4" />

          {/* Description skeleton */}
          <div className="space-y-2">
            <div className="h-3 bg-neutral-800 rounded w-full" />
            <div className="h-3 bg-neutral-800 rounded w-2/3" />
          </div>

          {/* Meta skeleton */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="h-3 bg-neutral-800 rounded w-20" />
            <div className="h-4 bg-neutral-800 rounded w-16" />
          </div>
        </div>
      </div>
    )
  }
)
ServiceCardSkeleton.displayName = "ServiceCardSkeleton"

// Compact variant for smaller spaces
const ServiceCardCompact = React.forwardRef(
  ({ service, onClick, className, ...props }, ref) => {
    const handleClick = () => {
      if (onClick) {
        onClick(service.id)
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "group glass rounded-xl border border-white/5 p-4 hover:border-primary-500/30 hover:shadow-glow-sm transition-all duration-300 cursor-pointer",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        <div className="flex items-start gap-4">
          {/* Icon / Image */}
          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500/20 transition-colors">
            {service.cover_image ? (
              <img src={service.cover_image} alt="" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <Briefcase className="w-6 h-6 text-neutral-400 group-hover:text-primary-400 transition-colors" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-white truncate group-hover:text-primary-400 transition-colors">
                  {service.title}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {service.category?.name}
                </p>
              </div>
              <span className="text-sm font-medium text-white whitespace-nowrap">
                {service.price_range || 'Consulte'}
              </span>
            </div>

            {service.company && (
              <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500">
                <MapPin className="w-3 h-3" />
                <span>{service.company.cidade}, {service.company.estado}</span>
              </div>
            )}
          </div>

          <ArrowRight className="w-5 h-5 text-neutral-600 group-hover:text-primary-400 flex-shrink-0 transition-colors" />
        </div>
      </div>
    )
  }
)
ServiceCardCompact.displayName = "ServiceCardCompact"

export { ServiceCardModern, ServiceCardSkeleton, ServiceCardCompact }
