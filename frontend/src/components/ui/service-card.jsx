import { Link } from 'react-router-dom'
import { MapPin, Star, CheckCircle, Image as ImageIcon } from 'lucide-react'
import { cn, getServiceCoverImage } from '@/lib/utils'
import { Badge } from './badge'

export function ServiceCard({ service, className }) {
  const coverImage = getServiceCoverImage(service)

  return (
    <Link
      to={`/services/${service.id}`}
      className={cn(
        'bg-white rounded-xl border border-gray-200 overflow-hidden',
        'hover:shadow-lg transition-shadow group block',
        className
      )}
    >
      {/* Image */}
      <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 relative">
        {coverImage ? (
          <img
            src={coverImage}
            alt={service.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm">
              <span className="text-xl font-bold text-gray-400">
                {service.title?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {service.featured && (
          <Badge className="absolute top-3 left-3 gap-1" variant="secondary">
            <Star className="w-3 h-3" />
            Destaque
          </Badge>
        )}

        {service.images_count > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <ImageIcon className="w-3 h-3" />
            {service.images_count}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {service.category && (
          <Badge variant="outline" className="mb-2 text-xs">
            {service.category.name}
          </Badge>
        )}

        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {service.title}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {service.description}
        </p>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {service.region || 'Brasil'}
          </span>
          <span className="font-semibold text-foreground">
            {service.price_range ? `R$ ${service.price_range}` : 'Sob consulta'}
          </span>
        </div>

        {service.company?.verified && (
          <div className="flex items-center gap-1 text-green-600 text-xs mt-3 pt-3 border-t border-gray-100">
            <CheckCircle className="w-4 h-4" />
            Empresa Verificada
          </div>
        )}
      </div>
    </Link>
  )
}

export function ServiceCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="h-40 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  )
}
