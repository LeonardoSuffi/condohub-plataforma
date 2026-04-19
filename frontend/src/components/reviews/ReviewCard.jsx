import * as React from "react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CheckCircle, MessageCircle, MoreVertical, Flag, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { GlassCard } from "@/components/ui/glass-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StarRating } from "./StarRating"

const ReviewCard = React.forwardRef(
  ({
    review,
    variant = "default", // default, compact, detailed
    showActions = false,
    onRespond,
    onHide,
    onReport,
    className,
    ...props
  }, ref) => {
    const [showResponseForm, setShowResponseForm] = React.useState(false)
    const [responseText, setResponseText] = React.useState("")

    const getInitials = (name) => {
      return name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?"
    }

    const formatDate = (date) => {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: ptBR,
      })
    }

    const handleSubmitResponse = () => {
      if (responseText.trim() && onRespond) {
        onRespond(review.id, responseText)
        setShowResponseForm(false)
        setResponseText("")
      }
    }

    return (
      <GlassCard
        ref={ref}
        variant="default"
        padding="md"
        className={cn("", className)}
        {...props}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.client?.user?.foto_path} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(review.client?.user?.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  {review.client?.user?.name || "Usuario"}
                </span>
                {review.is_verified && (
                  <Badge variant="outline" className="text-xs gap-1 text-success border-success/30">
                    <CheckCircle className="w-3 h-3" />
                    Verificado
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDate(review.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StarRating value={review.rating} readonly size="sm" />

            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!review.response && (
                    <DropdownMenuItem onClick={() => setShowResponseForm(true)}>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Responder
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onHide?.(review.id)}>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Ocultar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onReport?.(review.id)}
                    className="text-destructive"
                  >
                    <Flag className="mr-2 h-4 w-4" />
                    Reportar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Comentario */}
        {review.comment && (
          <p className="mt-4 text-foreground/90">
            {review.comment}
          </p>
        )}

        {/* Deal/Servico relacionado */}
        {review.deal && (
          <div className="mt-3">
            <Badge variant="secondary" className="text-xs">
              {review.deal.titulo}
            </Badge>
          </div>
        )}

        {/* Resposta da empresa */}
        {review.response && (
          <div className="mt-4 pl-4 border-l-2 border-primary/30 bg-primary/5 rounded-r-lg p-3">
            <p className="text-sm font-medium text-primary mb-1">
              Resposta da empresa
            </p>
            <p className="text-sm text-foreground/80">
              {review.response}
            </p>
            {review.responded_at && (
              <p className="text-xs text-muted-foreground mt-2">
                {formatDate(review.responded_at)}
              </p>
            )}
          </div>
        )}

        {/* Formulario de resposta */}
        {showResponseForm && !review.response && (
          <div className="mt-4 space-y-3">
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Escreva sua resposta..."
              className="w-full min-h-[100px] p-3 rounded-lg border border-border bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowResponseForm(false)
                  setResponseText("")
                }}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitResponse}
                disabled={!responseText.trim()}
              >
                Enviar Resposta
              </Button>
            </div>
          </div>
        )}
      </GlassCard>
    )
  }
)
ReviewCard.displayName = "ReviewCard"

export { ReviewCard }
