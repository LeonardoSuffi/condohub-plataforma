import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const WizardProgress = React.forwardRef(
  ({ steps = [], currentStep = 0, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("w-full", className)}
        {...props}
      >
        {/* Mobile: Simple progress bar */}
        <div className="sm:hidden mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Etapa {currentStep + 1} de {steps.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {steps[currentStep]?.title}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Desktop: Step indicators */}
        <div className="hidden sm:flex items-center justify-center mb-8">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep
            const isCurrent = index === currentStep
            const isUpcoming = index > currentStep

            return (
              <React.Fragment key={index}>
                {/* Step circle */}
                <div className="flex flex-col items-center relative">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                      isCompleted && "bg-primary text-primary-foreground",
                      isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                      isUpcoming && "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <div className="absolute top-12 whitespace-nowrap">
                    <span
                      className={cn(
                        "text-xs font-medium transition-colors",
                        isCurrent ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                </div>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-12 lg:w-20 h-0.5 mx-2 transition-colors duration-300",
                      index < currentStep ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    )
  }
)
WizardProgress.displayName = "WizardProgress"

export { WizardProgress }
