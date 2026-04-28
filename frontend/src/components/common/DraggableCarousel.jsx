import { useRef, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function DraggableCarousel({
  children,
  autoScroll = true,
  autoScrollSpeed = 0.5, // pixels per frame
  className = '',
}) {
  const trackRef = useRef(null)
  const containerRef = useRef(null)

  // Refs for drag state (no re-renders)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const currentX = useRef(0)
  const velocity = useRef(0)
  const lastX = useRef(0)
  const lastTime = useRef(0)
  const animationId = useRef(null)
  const isPaused = useRef(false)
  const autoScrollPosition = useRef(0)
  const trackWidth = useRef(0)

  // Get track width
  const updateTrackWidth = useCallback(() => {
    if (trackRef.current) {
      trackWidth.current = trackRef.current.scrollWidth / 2
    }
  }, [])

  // Apply transform
  const applyTransform = useCallback((x) => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${x}px)`
    }
  }, [])

  // Mouse/Touch handlers
  const handleDragStart = useCallback((clientX) => {
    isDragging.current = true
    isPaused.current = true
    startX.current = clientX - currentX.current
    lastX.current = clientX
    lastTime.current = performance.now()
    velocity.current = 0

    if (trackRef.current) {
      trackRef.current.style.transition = 'none'
    }
  }, [])

  const handleDragMove = useCallback((clientX) => {
    if (!isDragging.current) return

    const now = performance.now()
    const dt = now - lastTime.current

    if (dt > 0) {
      velocity.current = (clientX - lastX.current) / dt * 16
    }

    lastX.current = clientX
    lastTime.current = now

    currentX.current = clientX - startX.current
    applyTransform(currentX.current)
  }, [applyTransform])

  const handleDragEnd = useCallback(() => {
    if (!isDragging.current) return
    isDragging.current = false

    // Apply momentum
    const momentum = velocity.current * 10

    if (Math.abs(momentum) > 5) {
      currentX.current += momentum

      if (trackRef.current) {
        trackRef.current.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        applyTransform(currentX.current)
      }
    }

    // Normalize position for infinite scroll
    if (trackWidth.current > 0) {
      while (currentX.current > 0) {
        currentX.current -= trackWidth.current
      }
      while (currentX.current < -trackWidth.current) {
        currentX.current += trackWidth.current
      }
    }

    // Resume auto-scroll after delay
    setTimeout(() => {
      isPaused.current = false
      autoScrollPosition.current = currentX.current
    }, 2000)
  }, [applyTransform])

  // Mouse events
  const onMouseDown = useCallback((e) => {
    e.preventDefault()
    handleDragStart(e.clientX)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [handleDragStart])

  const onMouseMove = useCallback((e) => {
    handleDragMove(e.clientX)
  }, [handleDragMove])

  const onMouseUp = useCallback(() => {
    handleDragEnd()
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }, [handleDragEnd, onMouseMove])

  // Touch events
  const onTouchStart = useCallback((e) => {
    handleDragStart(e.touches[0].clientX)
  }, [handleDragStart])

  const onTouchMove = useCallback((e) => {
    handleDragMove(e.touches[0].clientX)
  }, [handleDragMove])

  const onTouchEnd = useCallback(() => {
    handleDragEnd()
  }, [handleDragEnd])

  // Arrow navigation
  const scrollBy = useCallback((amount) => {
    isPaused.current = true
    currentX.current += amount

    if (trackRef.current) {
      trackRef.current.style.transition = 'transform 0.4s ease-out'
      applyTransform(currentX.current)
    }

    setTimeout(() => {
      isPaused.current = false
      autoScrollPosition.current = currentX.current
    }, 2000)
  }, [applyTransform])

  // Auto-scroll animation
  useEffect(() => {
    if (!autoScroll) return

    updateTrackWidth()

    const animate = () => {
      if (!isPaused.current && !isDragging.current && trackWidth.current > 0) {
        autoScrollPosition.current -= autoScrollSpeed

        // Reset position for seamless loop
        if (autoScrollPosition.current <= -trackWidth.current) {
          autoScrollPosition.current += trackWidth.current
        }

        currentX.current = autoScrollPosition.current

        if (trackRef.current) {
          trackRef.current.style.transition = 'none'
          applyTransform(autoScrollPosition.current)
        }
      }

      animationId.current = requestAnimationFrame(animate)
    }

    animationId.current = requestAnimationFrame(animate)

    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current)
      }
    }
  }, [autoScroll, autoScrollSpeed, applyTransform, updateTrackWidth])

  // Update track width on resize
  useEffect(() => {
    updateTrackWidth()
    window.addEventListener('resize', updateTrackWidth)
    return () => window.removeEventListener('resize', updateTrackWidth)
  }, [updateTrackWidth])

  // Pause on hover
  const onMouseEnter = useCallback(() => {
    isPaused.current = true
  }, [])

  const onMouseLeave = useCallback(() => {
    if (!isDragging.current) {
      isPaused.current = false
    }
  }, [])

  return (
    <div className={`relative group ${className}`}>
      {/* Navigation Arrows */}
      <button
        onClick={() => scrollBy(300)}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/95 backdrop-blur rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
        aria-label="Previous"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={() => scrollBy(-300)}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/95 backdrop-blur rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
        aria-label="Next"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Gradient Edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      {/* Carousel Container */}
      <div
        ref={containerRef}
        className="overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          ref={trackRef}
          className="flex gap-6 px-4 py-2 will-change-transform"
          style={{ touchAction: 'pan-y' }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
