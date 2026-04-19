import { cn } from '@/lib/utils'

export function PageHeader({
  title,
  description,
  children,
  className,
  variant = 'default'
}) {
  const variants = {
    default: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
    light: 'bg-gradient-to-r from-primary/10 via-primary/5 to-background',
    dark: 'bg-gradient-to-br from-neutral-900 via-neutral-900/80 to-neutral-950 pt-24',
  }

  const textColors = {
    default: { title: 'text-white', description: 'text-gray-300' },
    light: { title: 'text-foreground', description: 'text-muted-foreground' },
    dark: { title: 'text-white', description: 'text-neutral-400' },
  }

  const colors = textColors[variant] || textColors.default

  return (
    <section className={cn(variants[variant], 'py-12', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className={cn('text-3xl font-bold mb-2', colors.title)}>
          {title}
        </h1>
        {description && (
          <p className={colors.description}>
            {description}
          </p>
        )}
        {children}
      </div>
    </section>
  )
}

export function PageContent({ children, className }) {
  return (
    <section className={cn('py-8', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  )
}

export function PageFilters({ children, className }) {
  return (
    <section className={cn(
      'bg-card border-b border-border sticky top-16 z-40',
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-14 overflow-x-auto gap-2">
          {children}
        </div>
      </div>
    </section>
  )
}
