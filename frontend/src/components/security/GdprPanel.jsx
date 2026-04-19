import * as React from "react"
import { Download, Trash2, Shield, AlertTriangle, CheckCircle, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

const GdprPanel = React.forwardRef(
  ({
    consents = {},
    onExportData,
    onDeleteAccount,
    isExporting = false,
    isDeleting = false,
    className,
    ...props
  }, ref) => {
    const [deletePassword, setDeletePassword] = React.useState("")
    const [deleteConfirmation, setDeleteConfirmation] = React.useState("")
    const [deleteStep, setDeleteStep] = React.useState(1)
    const [error, setError] = React.useState("")

    const handleExport = async () => {
      await onExportData?.()
    }

    const handleDelete = async () => {
      setError("")
      if (deleteConfirmation !== "EXCLUIR") {
        setError('Digite "EXCLUIR" para confirmar')
        return
      }
      if (!deletePassword) {
        setError("Digite sua senha")
        return
      }

      const result = await onDeleteAccount?.(deletePassword, deleteConfirmation)
      if (!result) {
        setError("Senha incorreta")
      }
    }

    const resetDeleteDialog = () => {
      setDeletePassword("")
      setDeleteConfirmation("")
      setDeleteStep(1)
      setError("")
    }

    return (
      <div ref={ref} className={cn("space-y-6", className)} {...props}>
        {/* Exportar dados */}
        <GlassCard variant="default" padding="md">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">
                  Exportar meus dados
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Baixe uma copia de todos os seus dados pessoais em formato JSON
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Inclui: dados de perfil, negociacoes, avaliacoes e atividades
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? (
                "Exportando..."
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Exportar
                </>
              )}
            </Button>
          </div>
        </GlassCard>

        {/* Consentimentos */}
        <GlassCard variant="default" padding="md">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-success/10 text-success">
              <Shield className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">
                Seus consentimentos
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Confira os termos que voce aceitou
              </p>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <div>
                    <p className="text-sm text-foreground">Termos de Uso</p>
                    <p className="text-xs text-muted-foreground">
                      Aceito ao criar a conta
                    </p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>

                <div className="flex items-center justify-between py-2 border-b border-border">
                  <div>
                    <p className="text-sm text-foreground">Politica de Privacidade</p>
                    <p className="text-xs text-muted-foreground">
                      {consents.gdpr_consent_at
                        ? `Aceito em ${new Date(consents.gdpr_consent_at).toLocaleDateString("pt-BR")}`
                        : "Aceito ao criar a conta"}
                    </p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Excluir conta */}
        <GlassCard variant="default" padding="md" className="border-destructive/30">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-destructive/10 text-destructive">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">
                  Excluir minha conta
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Remove permanentemente todos os seus dados da plataforma
                </p>
                <div className="flex items-start gap-2 mt-3 p-3 bg-destructive/10 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">
                    Esta acao e irreversivel. Todos os seus dados, incluindo
                    perfil, negociacoes e avaliacoes serao excluidos.
                  </p>
                </div>
              </div>
            </div>

            <AlertDialog onOpenChange={resetDeleteDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  Excluir conta
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-destructive">
                    Tem certeza que deseja excluir sua conta?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acao e permanente e nao pode ser desfeita. Todos os
                    seus dados serao removidos.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="delete-password">Confirme sua senha</Label>
                    <Input
                      id="delete-password"
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Sua senha"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="delete-confirmation">
                      Digite "EXCLUIR" para confirmar
                    </Label>
                    <Input
                      id="delete-confirmation"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value.toUpperCase())}
                      placeholder="EXCLUIR"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault()
                      handleDelete()
                    }}
                    disabled={isDeleting || deleteConfirmation !== "EXCLUIR" || !deletePassword}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? "Excluindo..." : "Excluir minha conta"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </GlassCard>
      </div>
    )
  }
)
GdprPanel.displayName = "GdprPanel"

export { GdprPanel }
