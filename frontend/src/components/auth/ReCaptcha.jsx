import ReCAPTCHA from 'react-google-recaptcha'
import { useRef, forwardRef, useImperativeHandle } from 'react'
import { AlertTriangle, ShieldCheck } from 'lucide-react'

// Site key para reCAPTCHA v2 checkbox
// Em producao, use variaveis de ambiente
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'

// Nota: A chave acima e a chave de TESTE do Google que sempre passa
// Para producao, registre em: https://www.google.com/recaptcha/admin

const ReCaptchaComponent = forwardRef(({ onVerify, onExpire, error }, ref) => {
  const recaptchaRef = useRef(null)

  useImperativeHandle(ref, () => ({
    reset: () => {
      recaptchaRef.current?.reset()
    }
  }))

  const handleChange = (token) => {
    if (token) {
      onVerify(token)
    }
  }

  const handleExpired = () => {
    onVerify(null)
    if (onExpire) onExpire()
  }

  const handleError = () => {
    onVerify(null)
  }

  return (
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-5 h-5 text-amber-600" />
        <span className="text-sm font-medium text-amber-800">
          Verificacao de seguranca necessaria
        </span>
      </div>

      <div className="flex justify-center">
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={RECAPTCHA_SITE_KEY}
          onChange={handleChange}
          onExpired={handleExpired}
          onErrored={handleError}
          hl="pt-BR"
        />
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600 text-center">{error}</p>
      )}
    </div>
  )
})

ReCaptchaComponent.displayName = 'ReCaptcha'

export default ReCaptchaComponent
