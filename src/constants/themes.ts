export type ThemeId = 'neon' | 'retro' | 'ocean' | 'sunset' | 'minimal'

export const THEMES: { id: ThemeId; label: string }[] = [
  { id: 'neon', label: 'Neon' },
  { id: 'retro', label: 'Retro' },
  { id: 'ocean', label: 'Ocean' },
  { id: 'sunset', label: 'Sunset' },
  { id: 'minimal', label: 'Minimal' },
]

export const DEFAULT_THEME: ThemeId = 'neon'

export const THEME_STORAGE_KEY = 'tetris-theme'

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && THEMES.some((theme) => theme.id === value)
}
