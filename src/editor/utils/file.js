export const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
    '.docx',
  ],
  'application/zip': ['.zip'],
  'application/x-zip-compressed': ['.zip'],
  'text/plain': ['.txt'],
}

export const ACCEPTED_FILE_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.zip',
  '.txt',
]

export const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function isAcceptedFile(file) {
  if (!file) return false
  const name = (file.name || '').toLowerCase()
  const byExt = ACCEPTED_FILE_EXTENSIONS.some((ext) => name.endsWith(ext))
  const byType = Boolean(ACCEPTED_FILE_TYPES[file.type])
  return byExt || byType
}

export function formatFileSize(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export function getFileExtension(name = '') {
  const idx = name.lastIndexOf('.')
  return idx >= 0 ? name.slice(idx).toLowerCase() : ''
}
