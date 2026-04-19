import * as React from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

const StarRating = React.forwardRef(
  ({
    value = 0,
    onChange,
    max = 5,
    size = "md",
    readonly = false,
    showValue = false,
    className,
    ...props
  }, ref) => {
    const [hoverValue, setHoverValue] = React.useState(0)

    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
      xl: "w-8 h-8",
    }

    const gapClasses = {
      sm: "gap-0.5",
      md: "gap-1",
      lg: "gap-1.5",
      xl: "gap-2",
    }

    const handleClick = (rating) => {
      if (!readonly && onChange) {
        onChange(rating)
      }
    }

    const handleMouseEnter = (rating) => {
      if (!readonly) {
        setHoverValue(rating)
      }
    }

    const handleMouseLeave = () => {
      setHoverValue(0)
    }

    const displayValue = hoverValue || value

    return (
      <div
        ref={ref}
        className={cn("flex items-center", gapClasses[size], className)}
        {...props}
      >
        <div
          className={cn("flex", gapClasses[size])}
          onMouseLeave={handleMouseLeave}
        >
          {Array.from({ length: max }, (_, i) => {
            const rating = i + 1
            const isFilled = rating <= displayValue
            const isHalf = rating - 0.5 === displayValue

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleClick(rating)}
                onMouseEnter={() => handleMouseEnter(rating)}
                disabled={readonly}
                className={cn(
                  "transition-all duration-150",
                  !readonly && "cursor-pointer hover:scale-110",
                  readonly && "cursor-default"
                )}
              >
                <Star
                  className={cn(
                    sizeClasses[size],
                    "transition-colors duration-150",
                    isFilled
                      ? "fill-warning text-warning"
                      : "fill-transparent text-muted-foreground/40"
                  )}
                />
              </button>
            )
          })}
        </div>
        {showValue && (
          <span className="text-sm font-medium text-foreground ml-2">
            {value.toFixed(1)}
          </span>
        )}
      </div>
    )
  }
)
StarRating.displayName = "StarRating"

// Componente compacto para exibicao
const StarRatingDisplay = React.forwardRef(
  ({ value = 0, count, size = "sm", className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-1.5", className)}
        {...props}
      >
        <Star className={cn(
          size === "sm" ? "w-4 h-4" : "w-5 h-5",
          "fill-warning text-warning"
        )} />
        <span className="font-medium text-foreground">{value.toFixed(1)}</span>
        {count !== undefined && (
          <span className="text-muted-foreground text-sm">({count})</span>
        )}
      </div>
    )
  }
)
StarRatingDisplay.displayName = "StarRatingDisplay"

export { StarRating, StarRatingDisplay }
