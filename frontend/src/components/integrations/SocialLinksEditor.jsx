import * as React from "react"
import {
  Camera,
  Users,
  Briefcase,
  AtSign,
  Video,
  Music,
  MessageCircle,
  Globe,
  Plus,
  Trash2,
  GripVertical,
  Link2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const PLATFORMS = [
  { id: "instagram", label: "Instagram", icon: Camera, placeholder: "https://instagram.com/seu_perfil" },
  { id: "facebook", label: "Facebook", icon: Users, placeholder: "https://facebook.com/sua_pagina" },
  { id: "linkedin", label: "LinkedIn", icon: Briefcase, placeholder: "https://linkedin.com/in/seu_perfil" },
  { id: "twitter", label: "Twitter/X", icon: AtSign, placeholder: "https://twitter.com/seu_usuario" },
  { id: "youtube", label: "YouTube", icon: Video, placeholder: "https://youtube.com/@seu_canal" },
  { id: "tiktok", label: "TikTok", icon: Music, placeholder: "https://tiktok.com/@seu_perfil" },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, placeholder: "55119XXXXXXXX" },
  { id: "website", label: "Website", icon: Globe, placeholder: "https://seusite.com.br" },
]

const SocialLinksEditor = React.forwardRef(
  ({
    links = [],
    onChange,
    maxLinks = 8,
    className,
    ...props
  }, ref) => {
    const [localLinks, setLocalLinks] = React.useState(
      links.length > 0 ? links : []
    )

    const availablePlatforms = PLATFORMS.filter(
      (p) => !localLinks.some((l) => l.platform === p.id)
    )

    const addLink = () => {
      if (localLinks.length >= maxLinks) return
      if (availablePlatforms.length === 0) return

      const newLinks = [
        ...localLinks,
        { platform: availablePlatforms[0].id, url: "", order: localLinks.length },
      ]
      setLocalLinks(newLinks)
      onChange?.(newLinks)
    }

    const updateLink = (index, field, value) => {
      const newLinks = [...localLinks]
      newLinks[index] = { ...newLinks[index], [field]: value }
      setLocalLinks(newLinks)
      onChange?.(newLinks)
    }

    const removeLink = (index) => {
      const newLinks = localLinks.filter((_, i) => i !== index)
      setLocalLinks(newLinks)
      onChange?.(newLinks)
    }

    const formatWhatsAppUrl = (phone) => {
      const numbers = phone.replace(/\D/g, "")
      return `https://wa.me/${numbers}`
    }

    const getPlatformConfig = (platformId) => {
      return PLATFORMS.find((p) => p.id === platformId)
    }

    return (
      <div ref={ref} className={cn("space-y-4", className)} {...props}>
        {/* Links existentes */}
        {localLinks.map((link, index) => {
          const platform = getPlatformConfig(link.platform)
          const Icon = platform?.icon || Globe

          return (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
            >
              {/* Drag handle (visual only for now) */}
              <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />

              {/* Platform icon */}
              <div className="p-2 rounded-lg bg-background">
                <Icon className="w-4 h-4 text-primary" />
              </div>

              {/* Platform select */}
              <Select
                value={link.platform}
                onValueChange={(value) => updateLink(index, "platform", value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.filter(
                    (p) =>
                      p.id === link.platform ||
                      !localLinks.some((l) => l.platform === p.id)
                  ).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* URL input */}
              <Input
                value={link.url}
                onChange={(e) => updateLink(index, "url", e.target.value)}
                placeholder={platform?.placeholder}
                className="flex-1"
              />

              {/* Remove button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeLink(index)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )
        })}

        {/* Add button */}
        {localLinks.length < maxLinks && availablePlatforms.length > 0 && (
          <Button
            variant="outline"
            onClick={addLink}
            className="w-full border-dashed"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar rede social
          </Button>
        )}

        {/* Limite atingido */}
        {localLinks.length >= maxLinks && (
          <p className="text-sm text-muted-foreground text-center">
            Limite de {maxLinks} redes sociais atingido
          </p>
        )}
      </div>
    )
  }
)
SocialLinksEditor.displayName = "SocialLinksEditor"

// Componente de exibicao
const SocialLinksDisplay = React.forwardRef(
  ({ links = [], size = "md", className, ...props }, ref) => {
    const sizeClasses = {
      sm: "p-1.5",
      md: "p-2",
      lg: "p-3",
    }

    const iconSizes = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    }

    if (links.length === 0) return null

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-2", className)}
        {...props}
      >
        {links.map((link, index) => {
          const platform = PLATFORMS.find((p) => p.id === link.platform)
          const Icon = platform?.icon || Globe

          let url = link.url
          if (link.platform === "whatsapp" && !url.startsWith("http")) {
            url = `https://wa.me/${url.replace(/\D/g, "")}`
          }

          return (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "rounded-lg bg-muted/50 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors",
                sizeClasses[size]
              )}
              title={platform?.label}
            >
              <Icon className={iconSizes[size]} />
            </a>
          )
        })}
      </div>
    )
  }
)
SocialLinksDisplay.displayName = "SocialLinksDisplay"

export { SocialLinksEditor, SocialLinksDisplay, PLATFORMS }
