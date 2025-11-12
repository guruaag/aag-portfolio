/**
 * Color Theme System
 * 5 predefined themes with accent + background colors
 */

export const themes = {
  'ivory-charcoal': {
    name: 'Ivory & Charcoal',
    background: '#FAF9F6',
    surface: '#F5F5F0',
    text: '#2C2C2C',
    textSecondary: '#666666',
    accent: '#2C2C2C',
    accentLight: '#4A4A4A',
    border: '#E0E0E0'
  },
  'sand-brown': {
    name: 'Sand & Brown',
    background: '#F5F1E8',
    surface: '#F0EBE0',
    text: '#5C4033',
    textSecondary: '#8B6F47',
    accent: '#8B4513',
    accentLight: '#A0522D',
    border: '#D4C4B0'
  },
  'cream-maroon': {
    name: 'Cream & Maroon',
    background: '#FFF8F0',
    surface: '#F5F0E8',
    text: '#4A1E1E',
    textSecondary: '#6B2C2C',
    accent: '#800020',
    accentLight: '#A52A2A',
    border: '#E8D4C4'
  },
  'grey-blue': {
    name: 'Light Grey & Deep Blue',
    background: '#F5F5F5',
    surface: '#E8E8E8',
    text: '#1A1A2E',
    textSecondary: '#4A5568',
    accent: '#1E3A8A',
    accentLight: '#3B82F6',
    border: '#CBD5E0'
  },
  'beige-green': {
    name: 'Beige & Forest Green',
    background: '#F5F5DC',
    surface: '#F0F0E0',
    text: '#2D5016',
    textSecondary: '#4A6741',
    accent: '#228B22',
    accentLight: '#32CD32',
    border: '#C4D4B0'
  }
}

/**
 * Apply theme to document
 */
export function applyTheme(themeKey) {
  const theme = themes[themeKey] || themes['ivory-charcoal']
  
  const root = document.documentElement
  root.style.setProperty('--theme-bg', theme.background)
  root.style.setProperty('--theme-surface', theme.surface)
  root.style.setProperty('--theme-text', theme.text)
  root.style.setProperty('--theme-text-secondary', theme.textSecondary)
  root.style.setProperty('--theme-accent', theme.accent)
  root.style.setProperty('--theme-accent-light', theme.accentLight)
  root.style.setProperty('--theme-border', theme.border)
  
  // Update meta theme-color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme.background)
  }
  
  localStorage.setItem('siteTheme', themeKey)
}

/**
 * Get current theme
 */
export function getCurrentTheme() {
  return localStorage.getItem('siteTheme') || 'ivory-charcoal'
}

/**
 * Initialize theme on load
 */
export function initTheme() {
  const savedTheme = getCurrentTheme()
  applyTheme(savedTheme)
}

