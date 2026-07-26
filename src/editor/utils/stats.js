/**
 * Character / reading-time helpers.
 */

export function countWords(text = '') {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).filter(Boolean).length
}

export function countCharacters(text = '', { excludeSpaces = false } = {}) {
  if (!excludeSpaces) return text.length
  return text.replace(/\s/g, '').length
}

/** Average adult reading speed ≈ 200 wpm. */
export function estimateReadingTimeMinutes(text = '', wpm = 200) {
  const words = countWords(text)
  if (words === 0) return 0
  return Math.max(1, Math.ceil(words / wpm))
}
