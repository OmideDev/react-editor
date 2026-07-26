import { canUseDOM } from './dom'
import { isAcceptedImageFile, readImageAsDataURL } from './image'

const STORAGE_KEY = 'omid-editor-media-library'

/**
 * Frontend media library store (localStorage).
 * Ready to swap for a server API later via the same shape.
 */

function readAll() {
  if (!canUseDOM) return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(items) {
  if (!canUseDOM) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Quota / private mode — ignore.
  }
}

export function listMedia({ type = 'image', query = '' } = {}) {
  const q = query.trim().toLowerCase()
  return readAll()
    .filter((item) => !type || item.type === type)
    .filter((item) => {
      if (!q) return true
      return (
        item.name?.toLowerCase().includes(q) ||
        item.alt?.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

export function getMedia(id) {
  return readAll().find((item) => item.id === id) || null
}

export async function addMediaFromFile(file, { onUpload } = {}) {
  if (!isAcceptedImageFile(file)) {
    throw new Error('Only JPG, PNG, and WebP images are supported.')
  }

  let src
  if (typeof onUpload === 'function') {
    src = await onUpload(file)
    if (!src || typeof src !== 'string') {
      throw new Error('Upload handler must return a URL string.')
    }
  } else {
    src = await readImageAsDataURL(file)
  }

  const item = {
    id: `media_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type: 'image',
    name: file.name,
    alt: file.name.replace(/\.[^.]+$/, '') || 'Image',
    mimeType: file.type,
    size: file.size,
    src,
    width: null,
    height: null,
    createdAt: Date.now(),
  }

  const next = [item, ...readAll()]
  writeAll(next)
  return item
}

export function updateMedia(id, patch) {
  const items = readAll()
  const index = items.findIndex((item) => item.id === id)
  if (index === -1) return null
  items[index] = { ...items[index], ...patch, id }
  writeAll(items)
  return items[index]
}

export function deleteMedia(id) {
  const items = readAll().filter((item) => item.id !== id)
  writeAll(items)
  return true
}

export function clearMedia() {
  writeAll([])
}
