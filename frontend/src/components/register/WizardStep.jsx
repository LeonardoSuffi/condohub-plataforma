import * as React from "react"
import { cn } from "@/lib/utils"
import { GlassCard } from "@/components/ui/glass-card"

const WizardStep = React.forwardRef(
  ({
    title,
    description,
    icon: Icon,
    children,
    isActive = false,
    className,
    ...props
  }, ref) => {
    if (!isActive) return null

    return (
      <div
        ref={ref}
        className={cn(
          "animate-in fade-in-50 slide-in-from-right-5 duration-300",
          className
        )}
        {...props}
      >
        {/* Step header */}
        {(title || description) && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              {Icon && (
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Icon className="w-5 h-5" />
                </div>
              )}
              {title && (
                <h2 className="text-xl font-semibold text-foreground">
                  {title}
                </h2>
              )}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground ml-12">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Step content */}
        <div className="space-y-4">
          {children}
        </div>
      </div>
    )
  }
)
WizardStep.displayName = "WizardStep"

export { WizardStep }
