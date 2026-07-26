import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Check,
  ChevronDown,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Pilcrow,
} from 'lucide-react'
import { cn } from '../../../lib/utils'
import { useTheme } from '../../hooks/useTheme'

const HEADING_OPTIONS = [
  { value: 'paragraph', label: 'Paragraph', shortLabel: 'P', icon: Pilcrow },
  { value: 'h1', label: 'Heading 1', shortLabel: 'H1', icon: Heading1 },
  { value: 'h2', label: 'Heading 2', shortLabel: 'H2', icon: Heading2 },
  { value: 'h3', label: 'Heading 3', shortLabel: 'H3', icon: Heading3 },
  { value: 'h4', label: 'Heading 4', shortLabel: 'H4', icon: Heading4 },
  { value: 'h5', label: 'Heading 5', shortLabel: 'H5', icon: Heading5 },
  { value: 'h6', label: 'Heading 6', shortLabel: 'H6', icon: Heading6 },
]

/**
 * Dropdown to switch the current block between paragraph and H1–H6.
 */
export function HeadingSelector({
  value = 'paragraph',
  onChange,
  className,
  disabled = false,
}) {
  const [open, setOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState(null)
  const rootRef = useRef(null)
  const menuRef = useRef(null)
  const listId = useId()
  const { style: themeStyle } = useTheme()
  const current =
    HEADING_OPTIONS.find((option) => option.value === value) ??
    HEADING_OPTIONS[0]
  const CurrentIcon = current.icon

  useLayoutEffect(() => {
    if (!open || !rootRef.current) {
      setMenuStyle(null)
      return undefined
    }

    const updatePosition = () => {
      const rect = rootRef.current.getBoundingClientRect()
      setMenuStyle({
        position: 'fixed',
        top: rect.bottom + 6,
        left: rect.left,
        zIndex: 60,
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return undefined

    const onPointerDown = (event) => {
      const inTrigger = rootRef.current?.contains(event.target)
      const inMenu = menuRef.current?.contains(event.target)
      if (!inTrigger && !inMenu) {
        setOpen(false)
      }
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const select = (nextValue) => {
    onChange?.(nextValue)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className={cn('relative shrink-0', className)}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`Block type: ${current.label}`}
        title={current.label}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'group inline-flex h-8 items-center gap-1 rounded-lg px-2',
          'text-slate-600 transition-colors duration-150',
          'hover:bg-slate-100 hover:text-slate-900',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1',
          'disabled:pointer-events-none disabled:opacity-40',
          'dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
          'dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-900',
          open && 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white',
        )}
      >
        <CurrentIcon className="h-4 w-4" aria-hidden="true" strokeWidth={2} />
        <span className="hidden text-xs font-semibold tracking-wide sm:inline">
          {current.shortLabel}
        </span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 opacity-60 transition-transform',
            open && 'rotate-180',
          )}
          aria-hidden="true"
          strokeWidth={2}
        />
      </button>

      {open && menuStyle
        ? createPortal(
            <ul
              ref={menuRef}
              id={listId}
              role="listbox"
              aria-label="Heading level"
              style={{ ...menuStyle, ...themeStyle }}
              className="omid-popover-surface min-w-[11rem] overflow-hidden rounded-xl py-1"
            >
              {HEADING_OPTIONS.map((option) => {
                const Icon = option.icon
                const selected = option.value === value

                return (
                  <li key={option.value} role="option" aria-selected={selected}>
                    <button
                      type="button"
                      onClick={() => select(option.value)}
                      className={cn(
                        'flex w-full items-center gap-2 px-3 py-2 text-left text-sm',
                        'text-slate-700 transition-colors',
                        'hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
                        selected &&
                          'bg-slate-50 font-medium dark:bg-slate-800/80',
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="flex-1">{option.label}</span>
                      {selected ? (
                        <Check className="h-3.5 w-3.5 text-slate-900 dark:text-white" />
                      ) : null}
                    </button>
                  </li>
                )
              })}
            </ul>,
            document.body,
          )
        : null}
    </div>
  )
}
