import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FileUp, Upload, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useTheme } from '../hooks/useTheme'
import { useEditorUpload } from '../context/EditorUploadContext'
import {
  ACCEPTED_FILE_EXTENSIONS,
  DEFAULT_MAX_FILE_SIZE,
  formatFileSize,
  isAcceptedFile,
  readFileAsDataURL,
} from '../utils/file'

/**
 * Modal file uploader with drag/drop, progress, and size validation.
 *
 * @param {(file: File) => Promise<{ name?: string, size?: number, mimeType?: string, src: string }|string>} [onUpload]
 */
export function FileUploader({
  open,
  onOpenChange,
  onInsert,
  onUpload,
  maxSize = DEFAULT_MAX_FILE_SIZE,
}) {
  const { style: themeStyle } = useTheme()
  const uploadCtx = useEditorUpload()
  const uploadHandler = onUpload || uploadCtx.onFileUpload
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const dialogRef = useRef(null)
  const dialogId = useId()

  const reset = useCallback(() => {
    setPreview(null)
    setError('')
    setDragging(false)
    setProgress(0)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!open) {
      reset()
      return undefined
    }

    const onKey = (e) => {
      if (e.key === 'Escape') onOpenChange?.(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onOpenChange, reset])

  const processFile = useCallback(
    async (file) => {
      setError('')
      if (!isAcceptedFile(file)) {
        setError(`Unsupported type. Use: ${ACCEPTED_FILE_EXTENSIONS.join(', ')}`)
        return
      }
      if (file.size > maxSize) {
        setError(`File too large. Max ${formatFileSize(maxSize)}.`)
        return
      }

      setLoading(true)
      setProgress(12)
      try {
        const tick = window.setInterval(() => {
          setProgress((p) => Math.min(p + 18, 85))
        }, 120)

        let info
        if (typeof uploadHandler === 'function') {
          const result = await uploadHandler(file)
          if (typeof result === 'string') {
            info = {
              name: file.name,
              size: file.size,
              mimeType: file.type,
              src: result,
            }
          } else if (result?.src) {
            info = {
              name: result.name || file.name,
              size: result.size ?? file.size,
              mimeType: result.mimeType || file.type,
              src: result.src,
            }
          } else {
            throw new Error(
              'onFileUpload must return Promise<string | FileInfo>.',
            )
          }
        } else {
          const src = await readFileAsDataURL(file)
          info = {
            name: file.name,
            size: file.size,
            mimeType: file.type,
            src,
          }
        }

        window.clearInterval(tick)
        setProgress(100)
        setPreview(info)
      } catch (err) {
        setError(err.message || 'Failed to read file.')
      } finally {
        setLoading(false)
      }
    },
    [maxSize, uploadHandler],
  )

  const onDrop = useCallback(
    (event) => {
      event.preventDefault()
      setDragging(false)
      const file = event.dataTransfer?.files?.[0]
      if (file) processFile(file)
    },
    [processFile],
  )

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-900/40 p-3 sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onOpenChange?.(false)
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${dialogId}-title`}
        className="omid-popover-surface w-full max-w-lg overflow-hidden rounded-2xl"
        style={themeStyle}
      >
        <div className="flex items-center justify-between border-b border-[color:var(--editor-border)] px-4 py-3">
          <h2
            id={`${dialogId}-title`}
            className="flex items-center gap-2 text-sm font-semibold text-[color:var(--editor-text)]"
          >
            <FileUp className="h-4 w-4" />
            Upload file
          </h2>
          <button
            type="button"
            aria-label="Close"
            className="omid-editor-video-btn"
            onClick={() => onOpenChange?.(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 p-4">
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center transition-colors',
              dragging
                ? 'border-[color:var(--editor-active)] bg-[color:var(--editor-hover)]'
                : 'border-[color:var(--editor-border)]',
            )}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-6 w-6 text-[color:var(--editor-muted)]" />
            <p className="text-sm text-[color:var(--editor-text)]">
              Drag & drop or click to browse
            </p>
            <p className="text-xs text-[color:var(--editor-muted)]">
              PDF, DOC, DOCX, ZIP, TXT · max {formatFileSize(maxSize)}
            </p>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept={ACCEPTED_FILE_EXTENSIONS.join(',')}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) processFile(file)
                e.target.value = ''
              }}
            />
          </div>

          {loading || progress > 0 ? (
            <div className="space-y-1">
              <div className="h-1.5 overflow-hidden rounded-full bg-[color:var(--editor-hover)]">
                <div
                  className="h-full rounded-full bg-[color:var(--editor-active)] transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[11px] text-[color:var(--editor-muted)]">
                {loading ? `Uploading… ${progress}%` : progress === 100 ? 'Ready' : ''}
              </p>
            </div>
          ) : null}

          {error ? (
            <p className="text-xs text-[color:var(--editor-danger)]">{error}</p>
          ) : null}

          {preview ? (
            <div className="rounded-xl border border-[color:var(--editor-border)] bg-[color:var(--editor-surface)] px-3 py-2.5">
              <p className="truncate text-sm font-medium text-[color:var(--editor-text)]">
                {preview.name}
              </p>
              <p className="text-xs text-[color:var(--editor-muted)]">
                {formatFileSize(preview.size)}
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-[color:var(--editor-border)] px-4 py-3">
          <button
            type="button"
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-[color:var(--editor-muted)] hover:bg-[color:var(--editor-hover)]"
            onClick={() => onOpenChange?.(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!preview}
            className="rounded-lg bg-[color:var(--editor-active)] px-3 py-1.5 text-xs font-medium text-[color:var(--editor-active-text)] disabled:opacity-40"
            onClick={() => {
              if (!preview) return
              onInsert?.(preview)
              onOpenChange?.(false)
            }}
          >
            Insert file
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
