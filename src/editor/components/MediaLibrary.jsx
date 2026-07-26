import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Image as ImageIcon,
  Search,
  Trash2,
  Upload,
  X,
  Check,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useTheme } from '../hooks/useTheme'
import { useEditorUpload } from '../context/EditorUploadContext'
import {
  addMediaFromFile,
  deleteMedia,
  listMedia,
  updateMedia,
} from '../utils/mediaStore'
import {
  clampImageWidth,
  DEFAULT_IMAGE_WIDTH,
  loadImageDimensions,
  MAX_IMAGE_WIDTH,
} from '../utils/image'
import { formatFileSize } from '../utils/file'

/**
 * WordPress-style media library (frontend).
 * Stores images in localStorage until a server API is wired via onImageUpload.
 */
export function MediaLibrary({ open, onOpenChange, onInsert }) {
  const { style: themeStyle } = useTheme()
  const { onImageUpload } = useEditorUpload()
  const dialogId = useId()
  const inputRef = useRef(null)

  const [tab, setTab] = useState('library') // library | upload
  const [query, setQuery] = useState('')
  const [items, setItems] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState(false)

  const refresh = useCallback(() => {
    setItems(listMedia({ type: 'image', query }))
  }, [query])

  useEffect(() => {
    if (!open) return undefined
    refresh()
    setError('')
    setSelectedId(null)
    setTab('library')

    const onKey = (e) => {
      if (e.key === 'Escape') onOpenChange?.(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onOpenChange, refresh])

  useEffect(() => {
    if (open) refresh()
  }, [open, query, refresh])

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) || null,
    [items, selectedId],
  )

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || [])
    if (!files.length) return

    setLoading(true)
    setError('')
    try {
      let last = null
      for (const file of files) {
        last = await addMediaFromFile(file, { onUpload: onImageUpload })
      }
      refresh()
      setTab('library')
      if (last) setSelectedId(last.id)
    } catch (err) {
      setError(err.message || 'Upload failed.')
    } finally {
      setLoading(false)
    }
  }

  const insertSelected = async () => {
    if (!selected?.src) {
      setError('Select an image first.')
      return
    }

    setLoading(true)
    setError('')
    try {
      let width = selected.width
      let height = selected.height

      if (!width || !height) {
        const dims = await loadImageDimensions(selected.src)
        width = clampImageWidth(
          Math.min(dims.width, DEFAULT_IMAGE_WIDTH),
          MAX_IMAGE_WIDTH,
        )
        height = Math.round((width / dims.width) * dims.height)
        updateMedia(selected.id, { width, height })
      }

      onInsert?.({
        src: selected.src,
        altText: selected.alt || selected.name || 'Image',
        width,
        height,
        caption: '',
      })
      onOpenChange?.(false)
    } catch (err) {
      setError(err.message || 'Could not insert image.')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-900/45 p-0 sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onOpenChange?.(false)
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${dialogId}-title`}
        style={themeStyle}
        className={cn(
          'omid-media-library omid-popover-surface flex h-[min(92vh,720px)] w-full max-w-5xl flex-col overflow-hidden',
          'rounded-t-2xl sm:rounded-2xl',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[color:var(--editor-border)] px-4 py-3">
          <div>
            <h2
              id={`${dialogId}-title`}
              className="text-sm font-semibold text-[color:var(--editor-text)]"
            >
              Media Library
            </h2>
            <p className="text-[11px] text-[color:var(--editor-muted)]">
              Choose or upload images
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            className="omid-editor-video-btn"
            onClick={() => onOpenChange?.(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[color:var(--editor-border)] px-3 pt-2">
          {[
            { id: 'library', label: 'Library' },
            { id: 'upload', label: 'Upload' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'rounded-t-lg px-3 py-2 text-xs font-medium transition-colors',
                tab === t.id
                  ? 'bg-[color:var(--editor-hover)] text-[color:var(--editor-text)]'
                  : 'text-[color:var(--editor-muted)] hover:text-[color:var(--editor-text)]',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
          {/* Main panel */}
          <div className="min-h-0 min-w-0 flex-1 overflow-auto p-3 sm:p-4">
            {tab === 'library' ? (
              <>
                <div className="relative mb-3">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[color:var(--editor-muted)]" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search media…"
                    className="w-full rounded-lg border border-[color:var(--editor-border)] bg-[color:var(--editor-bg)] py-2 pl-8 pr-3 text-xs outline-none focus:ring-2 focus:ring-[color:var(--editor-focus-ring)]"
                  />
                </div>

                {items.length === 0 ? (
                  <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
                    <ImageIcon className="h-8 w-8 text-[color:var(--editor-muted)]" />
                    <p className="text-sm text-[color:var(--editor-muted)]">
                      No images yet
                    </p>
                    <button
                      type="button"
                      className="text-xs font-medium text-[color:var(--editor-text)] underline"
                      onClick={() => setTab('upload')}
                    >
                      Upload your first image
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                    {items.map((item) => {
                      const active = item.id === selectedId
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedId(item.id)}
                          className={cn(
                            'group relative aspect-square overflow-hidden rounded-lg border bg-[color:var(--editor-surface)]',
                            active
                              ? 'border-[color:var(--editor-active)] ring-2 ring-[color:var(--editor-active)]'
                              : 'border-[color:var(--editor-border)] hover:border-[color:var(--editor-muted)]',
                          )}
                        >
                          <img
                            src={item.src}
                            alt={item.alt || item.name}
                            className="h-full w-full object-cover"
                          />
                          {active ? (
                            <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--editor-active)] text-[color:var(--editor-active-text)]">
                              <Check className="h-3 w-3" />
                            </span>
                          ) : null}
                        </button>
                      )
                    })}
                  </div>
                )}
              </>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragging(false)
                  handleFiles(e.dataTransfer.files)
                }}
                onClick={() => inputRef.current?.click()}
                className={cn(
                  'flex h-full min-h-56 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-4 text-center transition-colors',
                  dragging
                    ? 'border-[color:var(--editor-active)] bg-[color:var(--editor-hover)]'
                    : 'border-[color:var(--editor-border)]',
                )}
              >
                <Upload className="h-7 w-7 text-[color:var(--editor-muted)]" />
                <div>
                  <p className="text-sm font-medium text-[color:var(--editor-text)]">
                    Drop images here or click to browse
                  </p>
                  <p className="mt-1 text-xs text-[color:var(--editor-muted)]">
                    JPG, PNG, WebP — saved in browser until you connect an API
                  </p>
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    handleFiles(e.target.files)
                    e.target.value = ''
                  }}
                />
              </div>
            )}
          </div>

          {/* Details sidebar */}
          <aside className="w-full shrink-0 border-t border-[color:var(--editor-border)] bg-[color:var(--editor-surface)] sm:w-64 sm:border-l sm:border-t-0">
            <div className="p-3 sm:p-4">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--editor-muted)]">
                Attachment details
              </p>

              {selected ? (
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-lg border border-[color:var(--editor-border)]">
                    <img
                      src={selected.src}
                      alt={selected.alt || selected.name}
                      className="max-h-36 w-full object-contain bg-[color:var(--editor-bg)]"
                    />
                  </div>

                  <label className="block space-y-1">
                    <span className="text-[11px] text-[color:var(--editor-muted)]">
                      Title
                    </span>
                    <input
                      value={selected.name || ''}
                      onChange={(e) => {
                        updateMedia(selected.id, { name: e.target.value })
                        refresh()
                      }}
                      className="w-full rounded-md border border-[color:var(--editor-border)] bg-[color:var(--editor-bg)] px-2 py-1.5 text-xs outline-none"
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="text-[11px] text-[color:var(--editor-muted)]">
                      Alt text
                    </span>
                    <input
                      value={selected.alt || ''}
                      onChange={(e) => {
                        updateMedia(selected.id, { alt: e.target.value })
                        refresh()
                      }}
                      className="w-full rounded-md border border-[color:var(--editor-border)] bg-[color:var(--editor-bg)] px-2 py-1.5 text-xs outline-none"
                    />
                  </label>

                  <p className="text-[11px] text-[color:var(--editor-muted)]">
                    {selected.mimeType || 'image'}
                    {selected.size ? ` · ${formatFileSize(selected.size)}` : ''}
                  </p>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 text-xs text-[color:var(--editor-danger)] hover:underline"
                    onClick={() => {
                      deleteMedia(selected.id)
                      setSelectedId(null)
                      refresh()
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete permanently
                  </button>
                </div>
              ) : (
                <p className="text-xs text-[color:var(--editor-muted)]">
                  Select an image to see details.
                </p>
              )}
            </div>
          </aside>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-[color:var(--editor-border)] px-4 py-3">
          <p className="text-[11px] text-[color:var(--editor-danger)]">
            {error || (loading ? 'Working…' : '')}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-[color:var(--editor-muted)] hover:bg-[color:var(--editor-hover)]"
              onClick={() => onOpenChange?.(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selected || loading}
              className="rounded-lg bg-[color:var(--editor-active)] px-3 py-1.5 text-xs font-medium text-[color:var(--editor-active-text)] disabled:opacity-40"
              onClick={insertSelected}
            >
              Insert into editor
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
