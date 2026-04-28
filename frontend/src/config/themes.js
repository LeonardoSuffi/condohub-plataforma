/**
 * Temas pre-definidos da plataforma
 * Cada tema define cores em formato HSL para facil manipulacao
 */

export const THEMES = {
  blue: {
    id: 'blue',
    name: 'Azul Profissional',
    description: 'Tema padrao, transmite confianca e profissionalismo',
    colors: {
      primary: { h: 217, s: 91, l: 60 },      // #3b82f6
      primaryDark: { h: 217, s: 91, l: 50 },
      secondary: { h: 210, s: 40, l: 96 },
      accent: { h: 186, s: 94, l: 50 },        // cyan
    },
    gradient: 'from-blue-600 to-blue-800',
    preview: '#3b82f6',
  },
  green: {
    id: 'green',
    name: 'Verde Natureza',
    description: 'Transmite crescimento, sustentabilidade e harmonia',
    colors: {
      primary: { h: 142, s: 76, l: 36 },       // #16a34a
      primaryDark: { h: 142, s: 76, l: 30 },
      secondary: { h: 140, s: 40, l: 96 },
      accent: { h: 160, s: 84, l: 39 },        // emerald
    },
    gradient: 'from-green-600 to-emerald-700',
    preview: '#16a34a',
  },
  purple: {
    id: 'purple',
    name: 'Roxo Premium',
    description: 'Elegante e sofisticado, ideal para servicos premium',
    colors: {
      primary: { h: 262, s: 83, l: 58 },       // #8b5cf6
      primaryDark: { h: 262, s: 83, l: 48 },
      secondary: { h: 260, s: 40, l: 96 },
      accent: { h: 280, s: 87, l: 65 },        // violet
    },
    gradient: 'from-purple-600 to-violet-700',
    preview: '#8b5cf6',
  },
  orange: {
    id: 'orange',
    name: 'Laranja Energia',
    description: 'Vibrante e energetico, chama atencao',
    colors: {
      primary: { h: 25, s: 95, l: 53 },        // #f97316
      primaryDark: { h: 25, s: 95, l: 43 },
      secondary: { h: 30, s: 40, l: 96 },
      accent: { h: 38, s: 92, l: 50 },         // amber
    },
    gradient: 'from-orange-500 to-amber-600',
    preview: '#f97316',
  },
  teal: {
    id: 'teal',
    name: 'Teal Moderno',
    description: 'Moderno e equilibrado, une seriedade com frescor',
    colors: {
      primary: { h: 173, s: 80, l: 40 },       // #14b8a6
      primaryDark: { h: 173, s: 80, l: 32 },
      secondary: { h: 170, s: 40, l: 96 },
      accent: { h: 186, s: 94, l: 50 },        // cyan
    },
    gradient: 'from-teal-500 to-cyan-600',
    preview: '#14b8a6',
  },
  rose: {
    id: 'rose',
    name: 'Rose Elegante',
    description: 'Sofisticado e acolhedor, ideal para servicos pessoais',
    colors: {
      primary: { h: 350, s: 89, l: 60 },       // #f43f5e
      primaryDark: { h: 350, s: 89, l: 50 },
      secondary: { h: 350, s: 40, l: 96 },
      accent: { h: 330, s: 81, l: 60 },        // pink
    },
    gradient: 'from-rose-500 to-pink-600',
    preview: '#f43f5e',
  },
  slate: {
    id: 'slate',
    name: 'Cinza Executivo',
    description: 'Classico e corporativo, transmite seriedade',
    colors: {
      primary: { h: 215, s: 28, l: 35 },       // #475569
      primaryDark: { h: 215, s: 28, l: 25 },
      secondary: { h: 215, s: 20, l: 95 },
      accent: { h: 200, s: 18, l: 46 },
    },
    gradient: 'from-slate-700 to-slate-900',
    preview: '#475569',
  },
  indigo: {
    id: 'indigo',
    name: 'Indigo Corporativo',
    description: 'Profissional e inovador, perfeito para tech',
    colors: {
      primary: { h: 239, s: 84, l: 67 },       // #6366f1
      primaryDark: { h: 239, s: 84, l: 57 },
      secondary: { h: 240, s: 40, l: 96 },
      accent: { h: 217, s: 91, l: 60 },        // blue
    },
    gradient: 'from-indigo-500 to-blue-600',
    preview: '#6366f1',
  },
}

/**
 * Aplica um tema atualizando as CSS variables
 */
export function applyTheme(themeId) {
  const theme = THEMES[themeId] || THEMES.blue
  const root = document.documentElement

  const { primary, primaryDark, secondary, accent } = theme.colors

  // Cores primarias
  root.style.setProperty('--primary', `${primary.h} ${primary.s}% ${primary.l}%`)
  root.style.setProperty('--primary-foreground', '210 40% 98%')

  // Ring e focus
  root.style.setProperty('--ring', `${primary.h} ${primary.s}% ${primary.l}%`)

  // Accent
  root.style.setProperty('--accent', `${accent.h} ${accent.s}% ${accent.l}%`)
  root.style.setProperty('--accent-foreground', `${primary.h} ${primary.s}% 10%`)

  // Sidebar (usa cor primaria mais escura)
  root.style.setProperty('--sidebar-primary', `${primaryDark.h} ${primaryDark.s}% ${primaryDark.l}%`)
  root.style.setProperty('--sidebar-primary-foreground', '0 0% 100%')
  root.style.setProperty('--sidebar-accent', `${primary.h} ${primary.s}% 90%`)
  root.style.setProperty('--sidebar-accent-foreground', `${primary.h} ${primary.s}% 20%`)

  // Salvar tema atual no localStorage
  localStorage.setItem('platform_theme', themeId)
}

/**
 * Obter tema atual do localStorage
 */
export function getCurrentTheme() {
  return localStorage.getItem('platform_theme') || 'blue'
}

export default THEMES
