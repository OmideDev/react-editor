import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ImagePlus, Upload, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useTheme } from '../hooks/useTheme'
import { useEditorUpload } from '../context/EditorUploadContext'
import {
  ACCEPTED_IMAGE_TYPES,
  clampImageWidth,
  DEFAULT_IMAGE_WIDTH,
  isAcceptedImageFile,
  loadImageDimensions,
  MAX_IMAGE_WIDTH,
  readImageAsDataURL,
} from '../utils/image'

/**
 * Modal uploader: file picker, drag/drop, paste preview, then insert.
 */
export function ImageUploader({ open, onOpenChange, onInsert, onUpload }) {
  const [preview, setPreview] = useState(null)
  const [altText, setAltText] = useState('')
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const dialogRef = useRef(null)
  const dialogId = useId()
  const { style: themeStyle } = useTheme()
  const uploadCtx = useEditorUpload()
  const uploadHandler = onUpload || uploadCtx.onImageUpload

  const reset = useCallback(() => {
    setPreview(null)
    setAltText('')
    setError('')
    setDragging(false)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!open) {
      reset()
      return undefined
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onOpenChange?.(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onOpenChange, reset])

  useEffect(() => {
    if (!open) return undefined

    const onPaste = async (event) => {
      const items = Array.from(event.clipboardData?.items || [])
      const imageItem = items.find((item) => item.type.startsWith('image/'))
      if (!imageItem) return

      const file = imageItem.getAsFile()
      if (!file) return

      event.preventDefault()
      await handleFile(file)
    }

    document.addEventListener('paste', onPaste)
    return () => document.removeEventListener('paste', onPaste)
  }, [open])

  const handleFile = async (file) => {
    if (!isAcceptedImageFile(file)) {
      setError('Only JPG, JPEG, PNG, and WebP images are supported.')
      return
    }

    setLoading(true)
    setError('')

    try {
      let src
      if (typeof uploadHandler === 'function') {
        src = await uploadHandler(file)
        if (!src || typeof src !== 'string') {
          throw new Error('onImageUpload must return a Promise<string> URL.')
        }
      } else {
        src = await readImageAsDataURL(file)
      }

      const dims = await loadImageDimensions(src)
      const width = clampImageWidth(
        Math.min(dims.width, DEFAULT_IMAGE_WIDTH),
        MAX_IMAGE_WIDTH,
      )
      const height = Math.round((width / dims.width) * dims.height)

      setPreview({
        src,
        width,
        height,
        name: file.name,
      })
      setAltText(file.name.replace(/\.[^.]+$/, '') || 'Image')
    } catch (err) {
      setError(err.message || 'Failed to process image.')
      setPreview(null)
    } finally {
      setLoading(false)
    }
  }

  const onDrop = async (event) => {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) {
      await handleFile(file)
    }
  }

  const insert = () => {
    if (!preview) {
      setError('Choose an image first.')
      return
    }

    onInsert?.({
      src: preview.src,
      altText: altText.trim() || 'Image',
      width: preview.width,
      height: preview.height,
      caption: '',
    })
    onOpenChange?.(false)
  }

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-900/40 p-3 sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onOpenChange?.(false)
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${dialogId}-title`}
        className={cn(
          'omid-popover-surface w-full max-w-lg overflow-hidden rounded-2xl',
        )}
        style={themeStyle}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <h2
            id={`${dialogId}-title`}
            className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100"
          >
            <ImagePlus className="h-4 w-4" aria-hidden="true" />
            Insert image
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={() => onOpenChange?.(false)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div
            onDragEnter={(event) => {
              event.preventDefault()
              setDragging(true)
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => {
              event.preventDefault()
              setDragging(false)
            }}
            onDrop={onDrop}
            className={cn(
              'flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition',
              dragging
                ? 'border-slate-900 bg-slate-50 dark:border-slate-100 dark:bg-slate-800'
                : 'border-slate-200 hover:border-slate-400 dark:border-slate-700',
            )}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                inputRef.current?.click()
              }
            }}
          >
            <Upload className="mb-2 h-8 w-8 text-slate-400" aria-hidden="true" />
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
              Drag & drop, click to browse, or paste
            </p>
            <p className="mt-1 text-xs text-slate-500">
              JPG, JPEG, PNG, or WebP
            </p>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void handleFile(file)
                event.target.value = ''
              }}
            />
          </div>

          {loading ? (
            <p className="text-center text-sm text-slate-500">Processing…</p>
          ) : null}

          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}

          {preview ? (
            <div className="space-y-3">
              <img
                src={preview.src}
                alt={altText || 'Preview'}
                className="mx-auto max-h-56 w-auto max-w-full rounded-xl border border-slate-200 object-contain dark:border-slate-700"
              />
              <label className="block text-xs font-medium text-slate-500">
                Alt text
                <input
                  type="text"
                  value={altText}
                  onChange={(event) => setAltText(event.target.value)}
                  className={cn(
                    'mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none',
                    'focus:border-slate-400 focus:ring-2 focus:ring-slate-200',
                    'dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100',
                  )}
                  placeholder="Describe the image"
                />
              </label>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-4 py-3 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onOpenChange?.(false)}
            className="h-9 rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!preview || loading}
            onClick={insert}
            className={cn(
              'h-9 rounded-lg bg-slate-900 px-3 text-sm font-medium text-white',
              'hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40',
              'dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white',
            )}
          >
            Insert image
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
