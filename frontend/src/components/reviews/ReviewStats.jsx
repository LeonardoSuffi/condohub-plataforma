import * as React from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { GlassCard } from "@/components/ui/glass-card"

const ReviewStats = React.forwardRef(
  ({ stats, className, ...props }, ref) => {
    const { average = 0, total = 0, distribution = {} } = stats || {}

    // Calcular porcentagens
    const getPercentage = (count) => {
      if (total === 0) return 0
      return Math.round((count / total) * 100)
    }

    return (
      <GlassCard
        ref={ref}
        variant="default"
        padding="md"
        className={cn("", className)}
        {...props}
      >
        <div className="flex flex-col md:flex-row gap-6">
          {/* Media geral */}
          <div className="flex flex-col items-center justify-center md:min-w-[140px]">
            <span className="text-5xl font-bold text-foreground">
              {average.toFixed(1)}
            </span>
            <div className="flex gap-1 mt-2">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-5 h-5",
                    i < Math.round(average)
                      ? "fill-warning text-warning"
                      : "fill-transparent text-muted-foreground/40"
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground mt-2">
              {total} {total === 1 ? "avaliacao" : "avaliacoes"}
            </span>
          </div>

          {/* Distribuicao */}
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = distribution[rating] || 0
              const percentage = getPercentage(count)

              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-sm text-foreground">{rating}</span>
                    <Star className="w-4 h-4 fill-warning text-warning" />
                  </div>
                  <div className="flex-1">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-warning rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </GlassCard>
    )
  }
)
ReviewStats.displayName = "ReviewStats"

export { ReviewStats }
