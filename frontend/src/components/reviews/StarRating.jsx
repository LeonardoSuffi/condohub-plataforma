import { useState } from 'react'
import { Star } from 'lucide-react'

export default function StarRating({
  rating = 0,
  onRatingChange,
  readonly = false,
  size = 'md',
  showValue = false,
}) {
  const [hoverRating, setHoverRating] = useState(0)

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  const starSize = sizes[size] || sizes.md

  const handleClick = (value) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value)
    }
  }

  const handleMouseEnter = (value) => {
    if (!readonly) {
      setHoverRating(value)
    }
  }

  const handleMouseLeave = () => {
    setHoverRating(0)
  }

  const displayRating = hoverRating || rating

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((value) => {
        const isFilled = value <= displayRating
        const isHalf = !isFilled && value - 0.5 <= displayRating

        return (
          <button
            key={value}
            type="button"
            onClick={() => handleClick(value)}
            onMouseEnter={() => handleMouseEnter(value)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform focus:outline-none disabled:opacity-100`}
          >
            <Star
              className={`${starSize} ${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : isHalf
                  ? 'fill-amber-400/50 text-amber-400'
                  : 'fill-transparent text-gray-300'
              } transition-colors`}
            />
          </button>
        )
      })}
      {showValue && rating > 0 && (
        <span className="ml-2 text-sm font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
