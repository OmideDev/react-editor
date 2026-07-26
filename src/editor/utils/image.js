import { canUseDOM } from './dom'

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]

export const ACCEPTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

export const MIN_IMAGE_WIDTH = 96
export const MAX_IMAGE_WIDTH = 960
export const DEFAULT_IMAGE_WIDTH = 480

export function isAcceptedImageFile(file) {
  if (!file) return false

  if (ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return true
  }

  const name = file.name?.toLowerCase() ?? ''
  return ACCEPTED_IMAGE_EXTENSIONS.some((ext) => name.endsWith(ext))
}

export function readImageAsDataURL(file) {
  return new Promise((resolve, reject) => {
    if (!canUseDOM) {
      reject(new Error('Image reading is only available in the browser.'))
      return
    }

    if (!isAcceptedImageFile(file)) {
      reject(new Error('Only JPG, PNG, and WebP images are supported.'))
      return
    }

    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Failed to read image file.'))
    reader.readAsDataURL(file)
  })
}

export function loadImageDimensions(src) {
  return new Promise((resolve, reject) => {
    if (!canUseDOM) {
      reject(new Error('Image loading is only available in the browser.'))
      return
    }

    const image = new Image()
    image.onload = () => {
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      })
    }
    image.onerror = () => reject(new Error('Failed to load image.'))
    image.src = src
  })
}

export function clampImageWidth(width, maxWidth = MAX_IMAGE_WIDTH) {
  const max = Math.max(MIN_IMAGE_WIDTH, maxWidth)
  return Math.min(max, Math.max(MIN_IMAGE_WIDTH, Math.round(width)))
}
