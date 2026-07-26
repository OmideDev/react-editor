/**
 * Normalize user input into a URL string (adds https:// for bare domains).
 */
export function normalizeUrl(url) {
  if (!url || typeof url !== 'string') return ''

  const trimmed = url.trim()
  if (!trimmed) return ''

  if (/^(https?:\/\/|mailto:)/i.test(trimmed)) {
    return trimmed
  }

  if (trimmed.includes('@') && !trimmed.includes(' ')) {
    return `mailto:${trimmed}`
  }

  if (/^[^\s/]+\.[^\s]+/.test(trimmed)) {
    return `https://${trimmed}`
  }

  return trimmed
}

/**
 * Validates http(s) and mailto URLs.
 */
export function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false

  const value = url.trim()

  if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(value)) {
    return true
  }

  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}
