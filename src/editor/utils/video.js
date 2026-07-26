/**
 * YouTube / Vimeo / generic iframe URL helpers.
 */

const YOUTUBE_RE =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i
const VIMEO_RE = /(?:vimeo\.com\/)(?:video\/)?(\d+)/i
const GENERIC_IFRAME_RE =
  /^https?:\/\/.+/i

export function parseVideoUrl(url = '') {
  const trimmed = String(url).trim()
  if (!trimmed) return null

  let match = trimmed.match(YOUTUBE_RE)
  if (match) {
    return {
      provider: 'youtube',
      id: match[1],
      src: `https://www.youtube.com/embed/${match[1]}`,
      url: trimmed,
    }
  }

  match = trimmed.match(VIMEO_RE)
  if (match) {
    return {
      provider: 'vimeo',
      id: match[1],
      src: `https://player.vimeo.com/video/${match[1]}`,
      url: trimmed,
    }
  }

  // Generic iframe embed — only for known embed paths / explicit embed URLs
  if (
    GENERIC_IFRAME_RE.test(trimmed) &&
    (/\/embed(\/|$|\?)/i.test(trimmed) ||
      /player\./i.test(trimmed) ||
      trimmed.includes('iframe=1'))
  ) {
    return {
      provider: 'iframe',
      id: trimmed,
      src: trimmed,
      url: trimmed,
    }
  }

  return null
}

export function isVideoUrl(url) {
  return Boolean(parseVideoUrl(url))
}
