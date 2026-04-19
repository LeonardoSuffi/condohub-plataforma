import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const gradientButtonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 text-white shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5",
        cyan: "bg-gradient-to-r from-cyan-600 to-cyan-400 text-white shadow-glow-cyan hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:-translate-y-0.5",
        violet: "bg-gradient-to-r from-violet-600 to-violet-400 text-white shadow-glow-violet hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:-translate-y-0.5",
        success: "bg-gradient-to-r from-emerald-600 to-emerald-400 text-white shadow-glow-success hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-0.5",
        cta: "bg-gradient-to-r from-primary-600 to-violet-600 text-white shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5",
        ghost: "border border-primary/30 text-primary bg-transparent hover:bg-primary/10 hover:border-primary hover:shadow-glow-sm",
        outline: "border-2 border-white/20 text-white bg-transparent hover:bg-white/10 hover:border-white/40",
      },
      size: {
        sm: "h-9 px-4 text-sm rounded-lg",
        md: "h-11 px-6 text-base rounded-xl",
        lg: "h-14 px-8 text-lg rounded-xl",
        xl: "h-16 px-10 text-xl rounded-2xl",
        icon: "h-11 w-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

const GradientButton = React.forwardRef(
  ({ className, variant, size, asChild = false, loading = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    // When asChild is true, just pass the className to the child
    if (asChild) {
      return (
        <Comp
          className={cn(gradientButtonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Comp>
      )
    }

    // Regular button with effects
    return (
      <button
        className={cn(gradientButtonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {/* Shine effect overlay */}
        <span className="absolute inset-0 overflow-hidden rounded-[inherit]">
          <span className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </span>

        {/* Content */}
        <span className="relative flex items-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {children}
        </span>
      </button>
    )
  }
)
GradientButton.displayName = "GradientButton"

// Icon Button with Glow
const GlowIconButton = React.forwardRef(
  ({ className, color = "primary", children, ...props }, ref) => {
    const colorClasses = {
      primary: "bg-primary/10 text-primary hover:bg-primary/20 hover:shadow-glow-sm",
      cyan: "bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 hover:shadow-glow-cyan",
      violet: "bg-accent-violet/10 text-accent-violet hover:bg-accent-violet/20 hover:shadow-glow-violet",
    }

    return (
      <button
        ref={ref}
        className={cn(
          "p-3 rounded-xl transition-all duration-300",
          colorClasses[color],
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
GlowIconButton.displayName = "GlowIconButton"

export { GradientButton, GlowIconButton, gradientButtonVariants }
