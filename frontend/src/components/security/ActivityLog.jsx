import * as React from "react"
import { formatDistanceToNow, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  LogIn,
  LogOut,
  Key,
  User,
  Shield,
  ShieldOff,
  Image,
  FileText,
  Star,
  Briefcase,
  Download,
  Trash2,
  Globe,
  Clock,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const ActivityLog = React.forwardRef(
  ({
    activities = [],
    showMore = true,
    initialCount = 10,
    isLoading = false,
    className,
    ...props
  }, ref) => {
    const [showAll, setShowAll] = React.useState(false)

    const displayedActivities = showAll
      ? activities
      : activities.slice(0, initialCount)

    const getActivityIcon = (action) => {
      const icons = {
        login: LogIn,
        logout: LogOut,
        logout_all: LogOut,
        password_change: Key,
        password_reset: Key,
        profile_update: User,
        photo_upload: Image,
        logo_upload: Image,
        "2fa_enable": Shield,
        "2fa_disable": ShieldOff,
        service_create: Briefcase,
        service_update: Briefcase,
        service_delete: Briefcase,
        deal_create: FileText,
        deal_update: FileText,
        order_create: FileText,
        review_create: Star,
        gdpr_export: Download,
        account_delete_request: Trash2,
      }
      return icons[action] || Globe
    }

    const getActivityColor = (action) => {
      if (["login"].includes(action)) return "text-success bg-success/10"
      if (["logout", "logout_all"].includes(action)) return "text-warning bg-warning/10"
      if (["password_change", "password_reset", "2fa_enable", "2fa_disable"].includes(action))
        return "text-primary bg-primary/10"
      if (["account_delete_request"].includes(action)) return "text-destructive bg-destructive/10"
      return "text-muted-foreground bg-muted"
    }

    const formatDate = (date) => {
      const d = new Date(date)
      const now = new Date()
      const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        return formatDistanceToNow(d, { addSuffix: true, locale: ptBR })
      } else if (diffDays < 7) {
        return format(d, "EEEE 'as' HH:mm", { locale: ptBR })
      } else {
        return format(d, "dd/MM/yyyy 'as' HH:mm", { locale: ptBR })
      }
    }

    // Agrupar por data
    const groupedActivities = displayedActivities.reduce((groups, activity) => {
      const date = format(new Date(activity.created_at), "yyyy-MM-dd")
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(activity)
      return groups
    }, {})

    const formatGroupDate = (dateStr) => {
      const date = new Date(dateStr)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      if (format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) {
        return "Hoje"
      } else if (format(date, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd")) {
        return "Ontem"
      } else {
        return format(date, "dd 'de' MMMM", { locale: ptBR })
      }
    }

    return (
      <div ref={ref} className={cn("space-y-6", className)} {...props}>
        {Object.entries(groupedActivities).map(([date, dateActivities]) => (
          <div key={date} className="space-y-3">
            {/* Data do grupo */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">
                {formatGroupDate(date)}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Atividades do dia */}
            <div className="space-y-2 ml-1">
              {dateActivities.map((activity) => {
                const Icon = getActivityIcon(activity.action)
                const colorClass = getActivityColor(activity.action)

                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 py-2"
                  >
                    {/* Icone */}
                    <div className={cn("p-2 rounded-lg shrink-0", colorClass)}>
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Conteudo */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">
                        {activity.action_label}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(activity.created_at)}
                        </span>
                        {activity.ip_address && (
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {activity.ip_address}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Botao ver mais */}
        {showMore && activities.length > initialCount && !showAll && (
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setShowAll(true)}
          >
            Ver mais
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        )}

        {/* Estado vazio */}
        {activities.length === 0 && !isLoading && (
          <GlassCard padding="lg" className="text-center">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Nenhuma atividade registrada</p>
          </GlassCard>
        )}
      </div>
    )
  }
)
ActivityLog.displayName = "ActivityLog"

export { ActivityLog }
