import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const glassCardVariants = cva(
  "rounded-xl border transition-all duration-300",
  {
    variants: {
      variant: {
        default: "glass",
        elevated: "glass shadow-glass",
        subtle: "glass-subtle",
        solid: "bg-card border-border",
        bordered: "glass border-primary/20",
      },
      padding: {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
      hover: {
        none: "",
        lift: "hover:-translate-y-1 hover:shadow-glass-lg",
        glow: "hover:shadow-glow",
        scale: "hover:scale-[1.02]",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
      hover: "none",
    },
  }
)

const GlassCard = React.forwardRef(
  ({ className, variant, padding, hover, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(glassCardVariants({ variant, padding, hover }), className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
GlassCard.displayName = "GlassCard"

const GlassCardHeader = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 pb-4", className)}
      {...props}
    />
  )
)
GlassCardHeader.displayName = "GlassCardHeader"

const GlassCardTitle = React.forwardRef(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-xl font-semibold leading-none tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  )
)
GlassCardTitle.displayName = "GlassCardTitle"

const GlassCardDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
)
GlassCardDescription.displayName = "GlassCardDescription"

const GlassCardContent = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  )
)
GlassCardContent.displayName = "GlassCardContent"

const GlassCardFooter = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center pt-4", className)}
      {...props}
    />
  )
)
GlassCardFooter.displayName = "GlassCardFooter"

// Stat Card Variant
const GlassStatCard = React.forwardRef(
  ({ className, icon: Icon, value, label, trend, trendValue, color = "primary", ...props }, ref) => {
    const colorClasses = {
      primary: "text-primary bg-primary/10",
      cyan: "text-accent-cyan bg-accent-cyan/10",
      violet: "text-accent-violet bg-accent-violet/10",
      success: "text-success bg-success/10",
      warning: "text-warning bg-warning/10",
    }

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
            <p className="text-3xl font-bold text-foreground">{value}</p>
            <p className="text-sm text-muted-foreground mt-1">{label}</p>
            {trend && (
              <p className={cn(
                "text-xs mt-2 flex items-center gap-1",
                trend === "up" ? "text-success" : "text-destructive"
              )}>
                {trend === "up" ? "+" : "-"}{trendValue}
                <span className="text-muted-foreground">vs mes anterior</span>
              </p>
            )}
          </div>
          {Icon && (
            <div className={cn("p-3 rounded-xl", colorClasses[color])}>
              <Icon className="w-6 h-6" />
            </div>
          )}
        </div>
      </GlassCard>
    )
  }
)
GlassStatCard.displayName = "GlassStatCard"

export {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
  GlassCardFooter,
  GlassStatCard,
  glassCardVariants,
}
