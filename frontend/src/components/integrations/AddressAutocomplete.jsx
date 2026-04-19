import * as React from "react"
import { MapPin, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import api from "@/services/api"

const AddressAutocomplete = React.forwardRef(
  ({
    onAddressFound,
    defaultValues = {},
    showFields = true,
    className,
    ...props
  }, ref) => {
    const [cep, setCep] = React.useState(defaultValues.cep || "")
    const [address, setAddress] = React.useState({
      logradouro: defaultValues.logradouro || "",
      bairro: defaultValues.bairro || "",
      cidade: defaultValues.cidade || "",
      estado: defaultValues.estado || "",
    })
    const [status, setStatus] = React.useState("idle") // idle, loading, success, error
    const [errorMessage, setErrorMessage] = React.useState("")

    const formatCep = (value) => {
      const numbers = value.replace(/\D/g, "")
      if (numbers.length <= 5) return numbers
      return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`
    }

    const handleCepChange = async (e) => {
      const formatted = formatCep(e.target.value)
      setCep(formatted)

      const numbers = formatted.replace(/\D/g, "")
      if (numbers.length === 8) {
        await fetchAddress(numbers)
      }
    }

    const fetchAddress = async (cepNumbers) => {
      setStatus("loading")
      setErrorMessage("")

      try {
        const response = await api.get(`/cep/${cepNumbers}`)
        const data = response.data.data

        const newAddress = {
          logradouro: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.cidade || "",
          estado: data.estado || "",
        }

        setAddress(newAddress)
        setStatus("success")

        onAddressFound?.({
          cep: formatCep(cepNumbers),
          ...newAddress,
        })
      } catch (error) {
        setStatus("error")
        setErrorMessage("CEP nao encontrado")
        setAddress({
          logradouro: "",
          bairro: "",
          cidade: "",
          estado: "",
        })
      }
    }

    const handleFieldChange = (field, value) => {
      const newAddress = { ...address, [field]: value }
      setAddress(newAddress)
      onAddressFound?.({ cep, ...newAddress })
    }

    const getStatusIcon = () => {
      switch (status) {
        case "loading":
          return <Loader2 className="w-4 h-4 animate-spin text-primary" />
        case "success":
          return <CheckCircle className="w-4 h-4 text-success" />
        case "error":
          return <AlertCircle className="w-4 h-4 text-destructive" />
        default:
          return <MapPin className="w-4 h-4 text-muted-foreground" />
      }
    }

    return (
      <div ref={ref} className={cn("space-y-4", className)} {...props}>
        {/* CEP Input */}
        <div className="space-y-2">
          <Label htmlFor="cep">CEP</Label>
          <div className="relative">
            <Input
              id="cep"
              value={cep}
              onChange={handleCepChange}
              placeholder="00000-000"
              maxLength={9}
              className="pr-10"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {getStatusIcon()}
            </div>
          </div>
          {status === "error" && errorMessage && (
            <p className="text-sm text-destructive">{errorMessage}</p>
          )}
        </div>

        {/* Address Fields */}
        {showFields && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="logradouro">Endereco</Label>
              <Input
                id="logradouro"
                value={address.logradouro}
                onChange={(e) => handleFieldChange("logradouro", e.target.value)}
                placeholder="Rua, Avenida..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bairro">Bairro</Label>
              <Input
                id="bairro"
                value={address.bairro}
                onChange={(e) => handleFieldChange("bairro", e.target.value)}
                placeholder="Bairro"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={address.cidade}
                onChange={(e) => handleFieldChange("cidade", e.target.value)}
                placeholder="Cidade"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Input
                id="estado"
                value={address.estado}
                onChange={(e) => handleFieldChange("estado", e.target.value)}
                placeholder="UF"
                maxLength={2}
              />
            </div>
          </div>
        )}
      </div>
    )
  }
)
AddressAutocomplete.displayName = "AddressAutocomplete"

export { AddressAutocomplete }
