import { cn } from '@/lib/utils'

export function StatsCard({
  icon: Icon,
  label,
  value,
  variant = 'default',
  className,
}) {
  const variants = {
    default: 'bg-white/10 backdrop-blur',
    solid: 'bg-white border border-gray-200',
  }

  const textColors = {
    default: 'text-white',
    solid: 'text-foreground',
  }

  const labelColors = {
    default: 'text-gray-300',
    solid: 'text-muted-foreground',
  }

  return (
    <div className={cn(variants[variant], 'rounded-xl p-4', className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={cn(
            'p-2 rounded-lg',
            variant === 'default' ? 'bg-white/10' : 'bg-primary/10'
          )}>
            <Icon className={cn(
              'w-5 h-5',
              variant === 'default' ? 'text-white' : 'text-primary'
            )} />
          </div>
        )}
        <div>
          <div className={cn('text-2xl font-bold', textColors[variant])}>
            {value}
          </div>
          <div className={cn('text-sm', labelColors[variant])}>
            {label}
          </div>
        </div>
      </div>
    </div>
  )
}

export function StatsGrid({ children, className }) {
  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-4 gap-4', className)}>
      {children}
    </div>
  )
}
