import { useState } from 'react'
import { Plus, Trash2, Globe, Link2, AtSign, Video, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export const PLATFORMS = {
  website: { name: 'Website', icon: Globe, placeholder: 'https://seusite.com.br' },
  instagram: { name: 'Instagram', icon: AtSign, placeholder: 'https://instagram.com/usuario' },
  facebook: { name: 'Facebook', icon: Share2, placeholder: 'https://facebook.com/pagina' },
  linkedin: { name: 'LinkedIn', icon: Link2, placeholder: 'https://linkedin.com/company/empresa' },
  twitter: { name: 'Twitter/X', icon: AtSign, placeholder: 'https://twitter.com/usuario' },
  youtube: { name: 'YouTube', icon: Video, placeholder: 'https://youtube.com/@canal' },
}

export function SocialLinksEditor({ links = [], onChange, maxLinks = 6 }) {
  const [newPlatform, setNewPlatform] = useState('')
  const [newUrl, setNewUrl] = useState('')

  const handleAdd = () => {
    if (!newPlatform || !newUrl) return
    if (links.length >= maxLinks) return

    const newLinks = [...links, { platform: newPlatform, url: newUrl }]
    onChange?.(newLinks)
    setNewPlatform('')
    setNewUrl('')
  }

  const handleRemove = (index) => {
    const newLinks = links.filter((_, i) => i !== index)
    onChange?.(newLinks)
  }

  const availablePlatforms = Object.keys(PLATFORMS).filter(
    (p) => !links.some((l) => l.platform === p)
  )

  return (
    <div className="space-y-4">
      {/* Lista de links existentes */}
      {links.length > 0 && (
        <div className="space-y-2">
          {links.map((link, index) => {
            const platform = PLATFORMS[link.platform]
            const Icon = platform?.icon || Globe
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <Icon className="w-5 h-5 text-gray-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {platform?.name || link.platform}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{link.url}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Adicionar novo link */}
      {links.length < maxLinks && availablePlatforms.length > 0 && (
        <div className="p-4 border border-dashed border-gray-200 rounded-lg space-y-3">
          <p className="text-sm font-medium text-gray-700">Adicionar rede social</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={newPlatform}
              onChange={(e) => setNewPlatform(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 bg-white"
            >
              <option value="">Selecione...</option>
              {availablePlatforms.map((key) => (
                <option key={key} value={key}>
                  {PLATFORMS[key].name}
                </option>
              ))}
            </select>
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder={newPlatform ? PLATFORMS[newPlatform]?.placeholder : 'URL'}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!newPlatform || !newUrl}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </div>
        </div>
      )}

      {links.length >= maxLinks && (
        <p className="text-sm text-gray-500">
          Limite de {maxLinks} redes sociais atingido.
        </p>
      )}
    </div>
  )
}

export function SocialLinksDisplay({ links = [] }) {
  if (!links || links.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link, index) => {
        const platform = PLATFORMS[link.platform]
        const Icon = platform?.icon || Globe
        return (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            title={platform?.name || link.platform}
          >
            <Icon className="w-5 h-5 text-gray-600" />
          </a>
        )
      })}
    </div>
  )
}

export default SocialLinksEditor
