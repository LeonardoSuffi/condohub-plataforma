import * as React from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { GlassCard } from "@/components/ui/glass-card"

const MetricCard = React.forwardRef(
  ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    trendValue,
    trendLabel = "vs periodo anterior",
    color = "primary",
    size = "md",
    className,
    ...props
  }, ref) => {
    const colorClasses = {
      primary: {
        icon: "bg-primary/10 text-primary",
        trend: {
          up: "text-success",
          down: "text-destructive",
          neutral: "text-muted-foreground",
        },
      },
      cyan: {
        icon: "bg-accent-cyan/10 text-accent-cyan",
        trend: {
          up: "text-success",
          down: "text-destructive",
          neutral: "text-muted-foreground",
        },
      },
      violet: {
        icon: "bg-accent-violet/10 text-accent-violet",
        trend: {
          up: "text-success",
          down: "text-destructive",
          neutral: "text-muted-foreground",
        },
      },
      success: {
        icon: "bg-success/10 text-success",
        trend: {
          up: "text-success",
          down: "text-destructive",
          neutral: "text-muted-foreground",
        },
      },
      warning: {
        icon: "bg-warning/10 text-warning",
        trend: {
          up: "text-success",
          down: "text-destructive",
          neutral: "text-muted-foreground",
        },
      },
    }

    const sizeClasses = {
      sm: {
        value: "text-2xl",
        title: "text-xs",
        icon: "p-2",
        iconSize: "w-4 h-4",
      },
      md: {
        value: "text-3xl",
        title: "text-sm",
        icon: "p-3",
        iconSize: "w-5 h-5",
      },
      lg: {
        value: "text-4xl",
        title: "text-base",
        icon: "p-4",
        iconSize: "w-6 h-6",
      },
    }

    const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus

    return (
      <GlassCard
        ref={ref}
        variant="default"
        padding="md"
        hover="lift"
        className={cn("", className)}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={cn(
              "font-bold text-foreground",
              sizeClasses[size].value
            )}>
              {value}
            </p>
            <p className={cn(
              "text-muted-foreground mt-1",
              sizeClasses[size].title
            )}>
              {title}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground/70 mt-0.5">
                {subtitle}
              </p>
            )}
            {trend && trendValue !== undefined && (
              <div className={cn(
                "flex items-center gap-1 mt-2 text-xs",
                colorClasses[color].trend[trend]
              )}>
                <TrendIcon className="w-3 h-3" />
                <span>
                  {trend === "up" ? "+" : trend === "down" ? "-" : ""}
                  {trendValue}
                </span>
                <span className="text-muted-foreground">{trendLabel}</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn(
              "rounded-xl",
              sizeClasses[size].icon,
              colorClasses[color].icon
            )}>
              <Icon className={sizeClasses[size].iconSize} />
            </div>
          )}
        </div>
      </GlassCard>
    )
  }
)
MetricCard.displayName = "MetricCard"

export { MetricCard }
