import * as React from "react"
import { Shield, ShieldCheck, ShieldOff, Copy, CheckCircle, AlertTriangle, Key } from "lucide-react"
import { cn } from "@/lib/utils"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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

const TwoFactorSetup = React.forwardRef(
  ({
    status = { enabled: false, backup_codes_remaining: 0 },
    onEnable,
    onVerify,
    onDisable,
    onRegenerateBackupCodes,
    isLoading = false,
    className,
    ...props
  }, ref) => {
    const [step, setStep] = React.useState("idle") // idle, qrcode, verify, backup, disable
    const [qrData, setQrData] = React.useState(null)
    const [verifyCode, setVerifyCode] = React.useState("")
    const [disableCode, setDisableCode] = React.useState("")
    const [disablePassword, setDisablePassword] = React.useState("")
    const [backupCodes, setBackupCodes] = React.useState([])
    const [copiedCodes, setCopiedCodes] = React.useState(false)
    const [error, setError] = React.useState("")

    const handleEnable = async () => {
      setError("")
      const result = await onEnable?.()
      if (result?.secret) {
        setQrData(result)
        setStep("qrcode")
      }
    }

    const handleVerify = async () => {
      setError("")
      if (verifyCode.length !== 6) {
        setError("O codigo deve ter 6 digitos")
        return
      }

      const result = await onVerify?.(verifyCode)
      if (result?.backup_codes) {
        setBackupCodes(result.backup_codes)
        setStep("backup")
        setVerifyCode("")
      } else {
        setError("Codigo invalido")
      }
    }

    const handleDisable = async () => {
      setError("")
      const result = await onDisable?.(disableCode, disablePassword)
      if (result === true) {
        setStep("idle")
        setDisableCode("")
        setDisablePassword("")
      } else {
        setError("Codigo ou senha invalidos")
      }
    }

    const copyBackupCodes = () => {
      const text = backupCodes.join("\n")
      navigator.clipboard.writeText(text)
      setCopiedCodes(true)
      setTimeout(() => setCopiedCodes(false), 2000)
    }

    const closeSetup = () => {
      setStep("idle")
      setQrData(null)
      setVerifyCode("")
      setBackupCodes([])
      setError("")
    }

    return (
      <GlassCard
        ref={ref}
        variant="default"
        padding="md"
        className={cn("", className)}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "p-3 rounded-xl",
                status.enabled
                  ? "bg-success/10 text-success"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {status.enabled ? (
                <ShieldCheck className="w-6 h-6" />
              ) : (
                <Shield className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-foreground">
                Autenticacao de dois fatores
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Adicione uma camada extra de seguranca a sua conta
              </p>
              {status.enabled && (
                <div className="flex items-center gap-3 mt-3">
                  <Badge variant="outline" className="text-success border-success/30">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Ativado
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {status.backup_codes_remaining} codigos de backup restantes
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {status.enabled ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep("regenerate")}
                >
                  <Key className="w-4 h-4 mr-2" />
                  Novos codigos
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setStep("disable")}
                >
                  <ShieldOff className="w-4 h-4 mr-2" />
                  Desativar
                </Button>
              </>
            ) : (
              <Button onClick={handleEnable} disabled={isLoading}>
                <Shield className="w-4 h-4 mr-2" />
                Ativar 2FA
              </Button>
            )}
          </div>
        </div>

        {/* Dialog de configuracao */}
        <Dialog open={step === "qrcode" || step === "verify"} onOpenChange={closeSetup}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Configurar autenticacao de dois fatores</DialogTitle>
              <DialogDescription>
                Escaneie o QR code com seu aplicativo autenticador (Google Authenticator, Authy, etc.)
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* QR Code */}
              {qrData?.qr_code_url && (
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData.qr_code_url)}`}
                    alt="QR Code"
                    className="w-48 h-48"
                  />
                </div>
              )}

              {/* Codigo manual */}
              {qrData?.secret && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Ou insira manualmente:
                  </p>
                  <code className="px-3 py-2 bg-muted rounded text-sm font-mono">
                    {qrData.secret}
                  </code>
                </div>
              )}

              {/* Input de verificacao */}
              <div className="space-y-2">
                <Label htmlFor="verify-code">Codigo de verificacao</Label>
                <Input
                  id="verify-code"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="text-center text-2xl tracking-widest"
                  maxLength={6}
                />
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={closeSetup}>
                Cancelar
              </Button>
              <Button
                onClick={handleVerify}
                disabled={verifyCode.length !== 6 || isLoading}
              >
                Verificar e Ativar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de codigos de backup */}
        <Dialog open={step === "backup"} onOpenChange={closeSetup}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-success">
                <CheckCircle className="w-5 h-5" />
                2FA Ativado com Sucesso!
              </DialogTitle>
              <DialogDescription>
                Guarde estes codigos de backup em um lugar seguro. Eles podem ser
                usados para acessar sua conta caso perca acesso ao autenticador.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg">
                {backupCodes.map((code, index) => (
                  <code
                    key={index}
                    className="px-2 py-1 bg-background rounded text-sm font-mono text-center"
                  >
                    {code}
                  </code>
                ))}
              </div>

              <div className="flex items-start gap-2 p-3 bg-warning/10 text-warning rounded-lg">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm">
                  Cada codigo so pode ser usado uma vez. Guarde-os em seguranca!
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={copyBackupCodes}>
                {copiedCodes ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar codigos
                  </>
                )}
              </Button>
              <Button onClick={closeSetup}>Concluir</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de desativar */}
        <Dialog open={step === "disable"} onOpenChange={closeSetup}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Desativar autenticacao de dois fatores</DialogTitle>
              <DialogDescription>
                Para desativar o 2FA, insira um codigo do seu autenticador e sua senha.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="disable-code">Codigo 2FA</Label>
                <Input
                  id="disable-code"
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value)}
                  placeholder="000000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="disable-password">Senha da conta</Label>
                <Input
                  id="disable-password"
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  placeholder="Sua senha"
                />
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={closeSetup}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDisable}
                disabled={!disableCode || !disablePassword || isLoading}
              >
                Desativar 2FA
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </GlassCard>
    )
  }
)
TwoFactorSetup.displayName = "TwoFactorSetup"

export { TwoFactorSetup }
