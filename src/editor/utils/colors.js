export const TEXT_COLORS = [
  { name: 'Black', value: '#0f172a' },
  { name: 'Gray', value: '#64748b' },
  { name: 'Red', value: '#dc2626' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Yellow', value: '#ca8a04' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Purple', value: '#9333ea' },
]

export const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: '#fef08a' },
  { name: 'Green', value: '#bbf7d0' },
  { name: 'Blue', value: '#bfdbfe' },
  { name: 'Pink', value: '#fbcfe8' },
]

export const BACKGROUND_COLORS = [
  { name: 'Black', value: '#0f172a' },
  { name: 'Gray', value: '#e2e8f0' },
  { name: 'Red', value: '#fecaca' },
  { name: 'Orange', value: '#fed7aa' },
  { name: 'Yellow', value: '#fef08a' },
  { name: 'Green', value: '#bbf7d0' },
  { name: 'Blue', value: '#bfdbfe' },
  { name: 'Purple', value: '#e9d5ff' },
]

export const DEFAULT_TEXT_COLOR = '#0f172a'
export const DEFAULT_HIGHLIGHT_COLOR = ''
export const DEFAULT_BACKGROUND_COLOR = ''

/**
 * Normalize color strings for comparison (lowercase, trimmed).
 */
export function normalizeColor(color) {
  if (!color || typeof color !== 'string') return ''
  return color.trim().toLowerCase()
}

/**
 * Returns true when `color` matches a palette entry (hex or named).
 */
export function isSameColor(a, b) {
  return normalizeColor(a) === normalizeColor(b)
}
