import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes with tailwind-merge for deduplication
 *
 * @param {...(string|object|array)} inputs - Class names or conditional class objects
 * @returns {string} Merged class string
 *
 * @example
 * cn("px-4 py-2", condition && "bg-primary", { "text-white": isActive })
 * cn("p-4", className) // Merges component prop with base classes
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency to Brazilian Real (BRL)
 * @param {number} value - The value to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Format date to Brazilian format (DD/MM/YYYY)
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  if (!date) return ''
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
}

/**
 * Format date with time to Brazilian format (DD/MM/YYYY HH:mm)
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date and time string
 */
export function formatDateTime(date) {
  if (!date) return ''
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(date))
}

/**
 * Truncate text with ellipsis
 * @param {string} text - The text to truncate
 * @param {number} length - Maximum length before truncation
 * @returns {string} Truncated text
 */
export function truncate(text, length = 50) {
  if (!text) return ''
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

/**
 * Generate initials from a name
 * @param {string} name - Full name
 * @returns {string} Initials (max 2 characters)
 */
export function getInitials(name) {
  if (!name) return ''
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/**
 * Delay execution (useful for debouncing)
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after delay
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Get full URL for storage assets
 * @param {string} path - Storage path
 * @returns {string|null} Full URL or null
 */
export function getStorageUrl(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}/storage${cleanPath.replace('/storage', '')}`
}

/**
 * Get cover image URL from service
 * @param {object} service - Service object
 * @returns {string|null} Cover image URL
 */
export function getServiceCoverImage(service) {
  if (!service) return null
  if (service.cover_image) return getStorageUrl(service.cover_image)
  if (service.images?.length > 0) {
    const cover = service.images.find(img => img.is_cover) || service.images[0]
    return cover?.url ? getStorageUrl(cover.url) : null
  }
  return null
}

/**
 * Status configurations for deals
 */
export const dealStatusConfig = {
  aberto: { label: 'Aberto', color: 'bg-blue-100 text-blue-700' },
  negociando: { label: 'Em Negociacao', color: 'bg-yellow-100 text-yellow-700' },
  aceito: { label: 'Aceito', color: 'bg-green-100 text-green-700' },
  concluido: { label: 'Concluido', color: 'bg-emerald-100 text-emerald-700' },
  rejeitado: { label: 'Rejeitado', color: 'bg-red-100 text-red-700' },
}
