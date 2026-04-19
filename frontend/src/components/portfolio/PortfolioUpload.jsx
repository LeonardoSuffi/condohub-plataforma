import * as React from "react"
import { Upload, X, Image as ImageIcon, GripVertical, Star, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const PortfolioUpload = React.forwardRef(
  ({
    services = [],
    onUpload,
    isUploading = false,
    className,
    ...props
  }, ref) => {
    const [dragActive, setDragActive] = React.useState(false)
    const [preview, setPreview] = React.useState(null)
    const [file, setFile] = React.useState(null)
    const [formData, setFormData] = React.useState({
      title: "",
      description: "",
      service_id: "",
      featured: false,
    })

    const inputRef = React.useRef(null)

    const handleDrag = (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true)
      } else if (e.type === "dragleave") {
        setDragActive(false)
      }
    }

    const handleDrop = (e) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0])
      }
    }

    const handleChange = (e) => {
      e.preventDefault()
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0])
      }
    }

    const handleFile = (file) => {
      if (!file.type.startsWith("image/")) {
        alert("Por favor, selecione uma imagem")
        return
      }

      setFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }

    const clearFile = () => {
      setFile(null)
      setPreview(null)
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    }

    const handleSubmit = async (e) => {
      e.preventDefault()

      if (!file || !formData.title.trim()) return

      const data = new FormData()
      data.append("image", file)
      data.append("title", formData.title)
      data.append("description", formData.description)
      if (formData.service_id) {
        data.append("service_id", formData.service_id)
      }
      data.append("featured", formData.featured)

      await onUpload?.(data)

      // Reset form
      clearFile()
      setFormData({
        title: "",
        description: "",
        service_id: "",
        featured: false,
      })
    }

    return (
      <GlassCard
        ref={ref}
        variant="default"
        padding="md"
        className={cn("", className)}
        {...props}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Drop zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
              dragActive
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50 hover:bg-primary/5",
              preview && "p-4"
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />

            {preview ? (
              <div className="relative inline-block">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 rounded-lg mx-auto"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    clearFile()
                  }}
                  className="absolute -top-2 -right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 rounded-full bg-primary/10">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    Arraste uma imagem ou clique para selecionar
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    PNG, JPG ou WEBP ate 5MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Form fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Titulo *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Ex: Reforma completa do salao de festas"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service">Servico relacionado</Label>
              <Select
                value={formData.service_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, service_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um servico (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={String(service.id)}>
                      {service.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descricao</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Descreva o trabalho realizado..."
              rows={3}
            />
          </div>

          {/* Featured toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) =>
                setFormData({ ...formData, featured: e.target.checked })
              }
              className="rounded border-border text-primary focus:ring-primary"
            />
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-warning" />
              <span className="text-sm text-foreground">Marcar como destaque</span>
            </div>
          </label>

          {/* Submit */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!file || !formData.title.trim() || isUploading}
            >
              {isUploading ? "Enviando..." : "Adicionar ao Portfolio"}
            </Button>
          </div>
        </form>
      </GlassCard>
    )
  }
)
PortfolioUpload.displayName = "PortfolioUpload"

export { PortfolioUpload }
