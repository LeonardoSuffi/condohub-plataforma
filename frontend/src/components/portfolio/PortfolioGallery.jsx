import * as React from "react"
import { X, ChevronLeft, ChevronRight, ZoomIn, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const PortfolioGallery = React.forwardRef(
  ({
    items = [],
    columns = 3,
    showTitles = true,
    enableLightbox = true,
    className,
    ...props
  }, ref) => {
    const [lightboxOpen, setLightboxOpen] = React.useState(false)
    const [currentIndex, setCurrentIndex] = React.useState(0)

    const openLightbox = (index) => {
      if (enableLightbox) {
        setCurrentIndex(index)
        setLightboxOpen(true)
      }
    }

    const closeLightbox = () => {
      setLightboxOpen(false)
    }

    const goToPrevious = () => {
      setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1))
    }

    const goToNext = () => {
      setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1))
    }

    // Keyboard navigation
    React.useEffect(() => {
      const handleKeyDown = (e) => {
        if (!lightboxOpen) return

        if (e.key === "Escape") closeLightbox()
        if (e.key === "ArrowLeft") goToPrevious()
        if (e.key === "ArrowRight") goToNext()
      }

      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }, [lightboxOpen])

    const gridClasses = {
      2: "grid-cols-2",
      3: "grid-cols-2 md:grid-cols-3",
      4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    }

    if (items.length === 0) {
      return (
        <GlassCard ref={ref} className={cn("", className)} {...props}>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <ImageIcon className="w-12 h-12 mb-3 opacity-50" />
            <p>Nenhum item no portfolio</p>
          </div>
        </GlassCard>
      )
    }

    return (
      <>
        <div
          ref={ref}
          className={cn(
            "grid gap-4",
            gridClasses[columns] || gridClasses[3],
            className
          )}
          {...props}
        >
          {items.map((item, index) => (
            <PortfolioItem
              key={item.id}
              item={item}
              showTitle={showTitles}
              onClick={() => openLightbox(index)}
            />
          ))}
        </div>

        {/* Lightbox */}
        {lightboxOpen && (
          <PortfolioLightbox
            items={items}
            currentIndex={currentIndex}
            onClose={closeLightbox}
            onPrevious={goToPrevious}
            onNext={goToNext}
          />
        )}
      </>
    )
  }
)
PortfolioGallery.displayName = "PortfolioGallery"

// Item individual do portfolio
const PortfolioItem = React.forwardRef(
  ({ item, showTitle = true, onClick, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          "group relative rounded-xl overflow-hidden cursor-pointer",
          "aspect-square",
          className
        )}
        {...props}
      >
        {/* Imagem */}
        <img
          src={item.image_url}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
              <ZoomIn className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Info no bottom */}
          {showTitle && (
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h4 className="font-medium text-white truncate">{item.title}</h4>
              {item.service && (
                <p className="text-sm text-white/70 truncate">{item.service.titulo}</p>
              )}
            </div>
          )}
        </div>

        {/* Badge de destaque */}
        {item.featured && (
          <Badge
            className="absolute top-3 right-3 bg-primary text-primary-foreground"
          >
            Destaque
          </Badge>
        )}
      </div>
    )
  }
)
PortfolioItem.displayName = "PortfolioItem"

// Lightbox
const PortfolioLightbox = ({
  items,
  currentIndex,
  onClose,
  onPrevious,
  onNext,
}) => {
  const currentItem = items[currentIndex]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Image container */}
        <div className="relative">
          <img
            src={currentItem.image_url}
            alt={currentItem.title}
            className="w-full max-h-[80vh] object-contain rounded-lg"
          />

          {/* Navigation */}
          {items.length > 1 && (
            <>
              <button
                onClick={onPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={onNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Info */}
        <div className="mt-4 text-center">
          <h3 className="text-xl font-semibold text-white">
            {currentItem.title}
          </h3>
          {currentItem.description && (
            <p className="mt-2 text-white/70 max-w-2xl mx-auto">
              {currentItem.description}
            </p>
          )}
          <p className="mt-3 text-sm text-white/50">
            {currentIndex + 1} de {items.length}
          </p>
        </div>
      </div>
    </div>
  )
}

export { PortfolioGallery, PortfolioItem }
