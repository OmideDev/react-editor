import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link2, Trash2, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { isValidUrl, normalizeUrl } from '../utils/url'
import { useTheme } from '../hooks/useTheme'

const POPOVER_GAP = 6
const VIEWPORT_PADDING = 8
/** Fallback height before the menu has measured itself. */
const ESTIMATED_MENU_HEIGHT = 220

/**
 * Keep the link popover inside the visible viewport (incl. mobile keyboard).
 * Prefer below the anchor; flip above when there is not enough space below.
 */
function getPopoverPosition(anchorRect, menuHeight, menuWidth) {
  const viewportWidth =
    window.visualViewport?.width ?? document.documentElement.clientWidth
  const viewportHeight =
    window.visualViewport?.height ?? document.documentElement.clientHeight
  const offsetTop = window.visualViewport?.offsetTop ?? 0
  const offsetLeft = window.visualViewport?.offsetLeft ?? 0

  const width = Math.min(menuWidth, viewportWidth - VIEWPORT_PADDING * 2)
  let left = anchorRect.left

  if (left + width > offsetLeft + viewportWidth - VIEWPORT_PADDING) {
    left = Math.max(
      offsetLeft + VIEWPORT_PADDING,
      offsetLeft + viewportWidth - width - VIEWPORT_PADDING,
    )
  } else {
    left = Math.max(offsetLeft + VIEWPORT_PADDING, left)
  }

  const spaceBelow = offsetTop + viewportHeight - anchorRect.bottom - POPOVER_GAP
  const spaceAbove = anchorRect.top - offsetTop - POPOVER_GAP
  const placeBelow =
    spaceBelow >= menuHeight || spaceBelow >= spaceAbove

  let top = placeBelow
    ? anchorRect.bottom + POPOVER_GAP
    : anchorRect.top - menuHeight - POPOVER_GAP

  const minTop = offsetTop + VIEWPORT_PADDING
  const maxTop = offsetTop + viewportHeight - menuHeight - VIEWPORT_PADDING
  top = Math.min(Math.max(top, minTop), Math.max(minTop, maxTop))

  return {
    position: 'fixed',
    top,
    left,
    zIndex: 60,
    width,
  }
}

/**
 * Popover for inserting, editing, and removing links.
 */
export function LinkPopover({
  open,
  onOpenChange,
  anchorRef,
  url: initialUrl = '',
  isLink = false,
  onApply,
  onRemove,
}) {
  const [url, setUrl] = useState(initialUrl)
  const [error, setError] = useState('')
  const [menuStyle, setMenuStyle] = useState(null)
  const menuRef = useRef(null)
  const inputRef = useRef(null)
  /** Last URL committed by real typing/paste — never chrome control labels. */
  const committedUrlRef = useRef(initialUrl || '')
  /** Ignore input mutations caused by tapping Apply on mobile. */
  const ignoreInputMutationRef = useRef(false)
  const dialogId = useId()
  const { style: themeStyle } = useTheme()

  useEffect(() => {
    if (!open) return
    const next = initialUrl || ''
    committedUrlRef.current = next
    setUrl(next)
    setError('')
    ignoreInputMutationRef.current = false
  }, [open, initialUrl])

  useLayoutEffect(() => {
    if (!open || !anchorRef?.current) {
      setMenuStyle(null)
      return undefined
    }

    const updatePosition = () => {
      const rect = anchorRef.current?.getBoundingClientRect()
      if (!rect) return

      const menuWidth = Math.min(320, window.innerWidth - 16)
      const menuHeight =
        menuRef.current?.offsetHeight || ESTIMATED_MENU_HEIGHT

      setMenuStyle(getPopoverPosition(rect, menuHeight, menuWidth))
    }

    updatePosition()
    const frame = requestAnimationFrame(updatePosition)

    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    window.visualViewport?.addEventListener('resize', updatePosition)
    window.visualViewport?.addEventListener('scroll', updatePosition)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
      window.visualViewport?.removeEventListener('resize', updatePosition)
      window.visualViewport?.removeEventListener('scroll', updatePosition)
    }
  }, [open, anchorRef, error, isLink])

  useEffect(() => {
    if (!open) return undefined

    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true })
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

  const commitUrl = (value) => {
    committedUrlRef.current = value
    setUrl(value)
  }

  /**
   * Mobile WebViews can append the label/text of the tapped control into the
   * still-focused URL input. Snapshot the URL first, then blur + ignore
   * subsequent input events through the click/toggle turn.
   */
  const freezeUrlForChrome = () => {
    if (!ignoreInputMutationRef.current && inputRef.current) {
      committedUrlRef.current = inputRef.current.value
      setUrl(inputRef.current.value)
    }

    ignoreInputMutationRef.current = true
    inputRef.current?.blur()

    window.setTimeout(() => {
      ignoreInputMutationRef.current = false
      if (inputRef.current?.value !== committedUrlRef.current) {
        setUrl(committedUrlRef.current)
      }
    }, 300)
  }

  const beginChromeInteraction = (event) => {
    event.preventDefault()
    freezeUrlForChrome()
  }

  const apply = () => {
    // Always use the committed URL — never the live DOM value after a mobile
    // tap that may have appended checkbox/button labels into the field.
    const raw = committedUrlRef.current
    const normalized = normalizeUrl(raw)

    if (raw !== url) {
      setUrl(raw)
    }

    if (!normalized) {
      setError('URL is required')
      return
    }

    if (!isValidUrl(normalized)) {
      setError('Enter a valid http://, https://, or mailto: URL')
      return
    }

    setError('')
    // Links open in the same tab by default (no "Open in new tab" UI on iOS).
    onApply?.({ url: normalized, openInNewTab: false })
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
          onPointerDown={beginChromeInteraction}
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

      <label
        htmlFor={`${dialogId}-url`}
        className="mb-1 block text-[11px] font-medium text-slate-500 dark:text-slate-400"
      >
        URL
      </label>
      <input
        ref={inputRef}
        id={`${dialogId}-url`}
        name="omid-editor-link-url"
        type="text"
        inputMode="url"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        enterKeyHint="done"
        value={url}
        placeholder="https://example.com"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${dialogId}-error` : undefined}
        onBeforeInput={(event) => {
          if (ignoreInputMutationRef.current) {
            event.preventDefault()
          }
        }}
        onChange={(event) => {
          if (ignoreInputMutationRef.current) {
            // Revert mobile chrome-label pollution (e.g. Apply button text).
            setUrl(committedUrlRef.current)
            return
          }
          commitUrl(event.target.value)
          if (error) setError('')
        }}
        onPaste={(event) => {
          event.preventDefault()
          const text = event.clipboardData?.getData('text/plain') ?? ''
          // Use the first line only — product URLs are single-line; avoids
          // accidental multi-line clipboard junk. Does not strip UI phrases.
          const pasted = text.split(/\r?\n/)[0]?.trim() ?? ''
          ignoreInputMutationRef.current = false
          commitUrl(pasted)
          if (error) setError('')
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            if (inputRef.current) {
              committedUrlRef.current = inputRef.current.value
            }
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

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onPointerDown={beginChromeInteraction}
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
            onPointerDown={beginChromeInteraction}
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
