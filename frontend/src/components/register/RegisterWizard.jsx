import * as React from "react"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { WizardProgress } from "./WizardProgress"
import { WizardStep } from "./WizardStep"

const RegisterWizard = React.forwardRef(
  ({
    steps = [],
    currentStep = 0,
    onStepChange,
    onSubmit,
    isSubmitting = false,
    submitText = "Finalizar Cadastro",
    className,
    children,
    ...props
  }, ref) => {
    const [validSteps, setValidSteps] = React.useState([])

    const canGoNext = currentStep < steps.length - 1
    const canGoBack = currentStep > 0
    const isLastStep = currentStep === steps.length - 1

    const handleNext = async () => {
      const stepValid = await validateCurrentStep()
      if (stepValid && canGoNext) {
        onStepChange?.(currentStep + 1)
      }
    }

    const handleBack = () => {
      if (canGoBack) {
        onStepChange?.(currentStep - 1)
      }
    }

    const handleSubmit = async (e) => {
      e?.preventDefault()
      const stepValid = await validateCurrentStep()
      if (stepValid) {
        onSubmit?.()
      }
    }

    const validateCurrentStep = async () => {
      const step = steps[currentStep]
      if (step?.validate) {
        const isValid = await step.validate()
        if (isValid) {
          setValidSteps(prev => [...new Set([...prev, currentStep])])
        }
        return isValid
      }
      setValidSteps(prev => [...new Set([...prev, currentStep])])
      return true
    }

    return (
      <div
        ref={ref}
        className={cn("w-full max-w-2xl mx-auto", className)}
        {...props}
      >
        {/* Progress */}
        <WizardProgress
          steps={steps}
          currentStep={currentStep}
          className="mb-6 sm:mb-12"
        />

        {/* Card container */}
        <GlassCard variant="default" padding="lg" className="relative">
          {/* Steps content */}
          <form onSubmit={handleSubmit}>
            {children}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                disabled={!canGoBack || isSubmitting}
                className={cn(!canGoBack && "invisible")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>

              {isLastStep ? (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[160px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    submitText
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                >
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </form>
        </GlassCard>
      </div>
    )
  }
)
RegisterWizard.displayName = "RegisterWizard"

export { RegisterWizard }
