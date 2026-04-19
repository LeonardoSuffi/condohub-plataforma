import * as React from "react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  MapPin,
  Clock,
  LogOut,
  ShieldCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const SessionsList = React.forwardRef(
  ({
    sessions = [],
    onRevoke,
    onRevokeAll,
    isLoading = false,
    className,
    ...props
  }, ref) => {
    const getDeviceIcon = (deviceType) => {
      switch (deviceType) {
        case "mobile":
          return Smartphone
        case "tablet":
          return Tablet
        default:
          return Monitor
      }
    }

    const formatDate = (date) => {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: ptBR,
      })
    }

    const otherSessions = sessions.filter((s) => !s.is_current)

    return (
      <div ref={ref} className={cn("space-y-4", className)} {...props}>
        {/* Header com acao de revogar todas */}
        {otherSessions.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {sessions.length} {sessions.length === 1 ? "sessao ativa" : "sessoes ativas"}
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <LogOut className="w-4 h-4 mr-2" />
                  Encerrar outras sessoes
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Encerrar outras sessoes?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Isso ira desconectar todos os outros dispositivos. Voce
                    permanecera conectado apenas neste dispositivo.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={onRevokeAll}>
                    Encerrar todas
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {/* Lista de sessoes */}
        <div className="space-y-3">
          {sessions.map((session) => {
            const DeviceIcon = getDeviceIcon(session.device_type)

            return (
              <GlassCard
                key={session.id}
                variant={session.is_current ? "bordered" : "default"}
                padding="md"
                className={cn(
                  "relative",
                  session.is_current && "border-primary/30"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Icone do dispositivo */}
                    <div
                      className={cn(
                        "p-3 rounded-xl",
                        session.is_current
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <DeviceIcon className="w-6 h-6" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground">
                          {session.device_name || "Dispositivo desconhecido"}
                        </span>
                        {session.is_current && (
                          <Badge variant="default" className="text-xs gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            Este dispositivo
                          </Badge>
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5" />
                          {session.browser} em {session.platform}
                        </span>
                        {session.ip_address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {session.ip_address}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(session.last_active_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Acao de revogar */}
                  {!session.is_current && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <LogOut className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Encerrar sessao?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Isso ira desconectar o dispositivo "{session.device_name}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onRevoke?.(session.id)}
                          >
                            Encerrar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </GlassCard>
            )
          })}
        </div>

        {/* Estado vazio */}
        {sessions.length === 0 && !isLoading && (
          <GlassCard padding="lg" className="text-center">
            <Monitor className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Nenhuma sessao ativa</p>
          </GlassCard>
        )}
      </div>
    )
  }
)
SessionsList.displayName = "SessionsList"

export { SessionsList }
