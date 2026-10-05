/**
 * Normalize user input into a URL string (adds https:// for bare domains).
 * Trims ends only — does not strip or rewrite whitespace inside the value.
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
 * True when the string still contains unencoded whitespace after trim.
 * Percent-encoded sequences like %20 are allowed; raw spaces/tabs/newlines are not.
 */
function hasUnencodedWhitespace(value) {
  return /\s/.test(value)
}

/**
 * Validates http(s) and mailto URLs for link insertion.
 * Rejects values with unencoded whitespace so contaminated mobile input
 * (e.g. UI labels appended to the URL) cannot be saved as href.
 */
export function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false

  const value = url.trim()
  if (!value) return false

  // new URL() accepts and percent-encodes raw spaces — reject those explicitly.
  if (hasUnencodedWhitespace(value)) return false

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
