import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ExternalLink, Link2, Trash2, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { isValidUrl, normalizeUrl } from '../utils/url'
import { useTheme } from '../hooks/useTheme'

/**
 * Popover for inserting, editing, and removing links.
 */
export function LinkPopover({
  open,
  onOpenChange,
  anchorRef,
  url: initialUrl = '',
  openInNewTab: initialOpenInNewTab = true,
  isLink = false,
  onApply,
  onRemove,
}) {
  const [url, setUrl] = useState(initialUrl)
  const [openInNewTab, setOpenInNewTab] = useState(initialOpenInNewTab)
  const [error, setError] = useState('')
  const [menuStyle, setMenuStyle] = useState(null)
  const menuRef = useRef(null)
  const inputRef = useRef(null)
  const dialogId = useId()
  const { style: themeStyle } = useTheme()

  useEffect(() => {
    if (!open) return
    setUrl(initialUrl || '')
    setOpenInNewTab(initialOpenInNewTab)
    setError('')
  }, [open, initialUrl, initialOpenInNewTab])

  useLayoutEffect(() => {
    if (!open || !anchorRef?.current) {
      setMenuStyle(null)
      return undefined
    }

    const updatePosition = () => {
      const rect = anchorRef.current.getBoundingClientRect()
      const menuWidth = Math.min(320, window.innerWidth - 16)
      const viewportPadding = 8
      let left = rect.left

      if (left + menuWidth > window.innerWidth - viewportPadding) {
        left = Math.max(
          viewportPadding,
          window.innerWidth - menuWidth - viewportPadding,
        )
      }

      setMenuStyle({
        position: 'fixed',
        top: rect.bottom + 6,
        left,
        zIndex: 60,
        width: menuWidth,
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, anchorRef])

  useEffect(() => {
    if (!open) return undefined

    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    })

    const onPointerDown = (event) => {
      const inAnchor = anchorRef?.current?.contains(event.target)
      const inMenu = menuRef.current?.contains(event.target)
      if (!inAnchor && !inMenu) {
        onOpenChange?.(false)
      }
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onOpenChange?.(false)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, anchorRef, onOpenChange])

  if (!open || !menuStyle) {
    return null
  }

  const apply = () => {
    const normalized = normalizeUrl(url)

    if (!normalized) {
      setError('URL is required')
      return
    }

    if (!isValidUrl(normalized)) {
      setError('Enter a valid http://, https://, or mailto: URL')
      return
    }

    setError('')
    onApply?.({ url: normalized, openInNewTab })
    onOpenChange?.(false)
  }

  const remove = () => {
    onRemove?.()
    onOpenChange?.(false)
  }

  return createPortal(
    <div
      ref={menuRef}
      id={dialogId}
      role="dialog"
      aria-label={isLink ? 'Edit link' : 'Insert link'}
      style={{ ...menuStyle, ...themeStyle }}
      className="omid-popover-surface rounded-xl p-3"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
          {isLink ? 'Edit link' : 'Insert link'}
        </p>
        <button
          type="button"
          aria-label="Close"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onOpenChange?.(false)}
          className={cn(
            'inline-flex h-7 w-7 items-center justify-center rounded-md',
            'text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800',
            'dark:hover:bg-slate-800 dark:hover:text-slate-100',
          )}
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      <label className="mb-1 block text-[11px] font-medium text-slate-500 dark:text-slate-400">
        URL
      </label>
      <input
        ref={inputRef}
        type="url"
        value={url}
        spellCheck={false}
        placeholder="https://example.com"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${dialogId}-error` : undefined}
        onMouseDown={(event) => event.preventDefault()}
        onChange={(event) => {
          setUrl(event.target.value)
          if (error) setError('')
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            apply()
          }
        }}
        className={cn(
          'h-9 w-full rounded-lg border bg-white px-3 text-sm text-slate-800 outline-none',
          'placeholder:text-slate-400',
          'focus:ring-2 focus:ring-slate-200',
          'dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-slate-700',
          error
            ? 'border-red-400 focus:border-red-400'
            : 'border-slate-200 focus:border-slate-400 dark:border-slate-600',
        )}
      />

      {error ? (
        <p
          id={`${dialogId}-error`}
          className="mt-1.5 text-[11px] text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
        <input
          type="checkbox"
          checked={openInNewTab}
          onMouseDown={(event) => event.preventDefault()}
          onChange={(event) => setOpenInNewTab(event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
        />
        <span className="inline-flex items-center gap-1.5">
          <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
          Open in new tab
        </span>
      </label>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={apply}
          className={cn(
            'inline-flex h-9 flex-1 items-center justify-center rounded-lg px-3',
            'bg-slate-900 text-sm font-medium text-white',
            'hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white',
          )}
        >
          Apply
        </button>

        {isLink ? (
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={remove}
            className={cn(
              'inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3',
              'border border-slate-200 text-sm font-medium text-slate-700',
              'hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800',
            )}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Remove
          </button>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
