import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, Pipette, X } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { isSameColor } from '../../utils/colors'
import { useTheme } from '../../hooks/useTheme'

/**
 * Accessible color popover with palette grid + custom hex input.
 */
export function ColorPicker({
  icon: Icon,
  label,
  colors = [],
  value = '',
  onChange,
  onClear,
  className,
  disabled = false,
  indicator = 'underline',
}) {
  const [open, setOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState(null)
  const [customColor, setCustomColor] = useState('#2563eb')
  const rootRef = useRef(null)
  const menuRef = useRef(null)
  const listId = useId()
  const hasColor = Boolean(value)
  const { style: themeStyle } = useTheme()

  useLayoutEffect(() => {
    if (!open || !rootRef.current) {
      setMenuStyle(null)
      return undefined
    }

    const updatePosition = () => {
      const rect = rootRef.current.getBoundingClientRect()
      const menuWidth = 220
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

  useEffect(() => {
    if (value && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) {
      setCustomColor(value)
    }
  }, [value])

  const selectColor = (next) => {
    onChange?.(next)
    setOpen(false)
  }

  const clearColor = () => {
    onClear?.()
    setOpen(false)
  }

  const applyCustom = () => {
    if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(customColor)) {
      return
    }
    selectColor(customColor)
  }

  return (
    <div ref={rootRef} className={cn('relative shrink-0', className)}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={label}
        title={label}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'omid-toolbar-btn group relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
          'text-[color:var(--editor-muted)] transition-all duration-150',
          'hover:bg-[color:var(--editor-hover)] hover:text-[color:var(--editor-text)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--editor-focus-ring)]',
          'disabled:pointer-events-none disabled:opacity-40',
          'active:scale-95',
          open && 'bg-[color:var(--editor-hover)] text-[color:var(--editor-text)]',
          hasColor && 'text-[color:var(--editor-text)]',
        )}
      >
        {Icon ? <Icon className="h-4 w-4" aria-hidden="true" strokeWidth={2} /> : null}

        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute rounded-full',
            indicator === 'dot' &&
              'bottom-1 right-1 h-1.5 w-1.5 ring-1 ring-[color:var(--editor-bg)]',
            indicator === 'underline' &&
              'bottom-1 left-1/2 h-0.5 w-3.5 -translate-x-1/2 rounded-sm',
          )}
          style={{
            backgroundColor: hasColor ? value : 'transparent',
            boxShadow: hasColor
              ? undefined
              : 'inset 0 0 0 1px var(--editor-border)',
          }}
        />
      </button>

      {open && menuStyle
        ? createPortal(
            <div
              ref={menuRef}
              id={listId}
              role="dialog"
              aria-label={label}
              style={{ ...menuStyle, ...themeStyle }}
              className="omid-popover-surface rounded-xl p-3"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {label}
                </p>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={clearColor}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium',
                    'text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800',
                    'dark:hover:bg-slate-800 dark:hover:text-slate-100',
                  )}
                  aria-label={`Remove ${label.toLowerCase()}`}
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                  Remove
                </button>
              </div>

              <div
                role="listbox"
                aria-label={`${label} palette`}
                className="grid grid-cols-4 gap-2"
              >
                {colors.map((swatch) => {
                  const selected = isSameColor(value, swatch.value)

                  return (
                    <button
                      key={`${swatch.name}-${swatch.value}`}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      aria-label={swatch.name}
                      title={swatch.name}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectColor(swatch.value)}
                      className={cn(
                        'relative h-8 w-full rounded-lg border border-slate-200 shadow-sm transition',
                        'hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400',
                        'dark:border-slate-600 dark:focus-visible:ring-slate-500',
                        selected && 'ring-2 ring-slate-900 ring-offset-1 dark:ring-white',
                      )}
                      style={{ backgroundColor: swatch.value }}
                    >
                      {selected ? (
                        <Check
                          className={cn(
                            'absolute inset-0 m-auto h-3.5 w-3.5',
                            isLightColor(swatch.value)
                              ? 'text-slate-900'
                              : 'text-white',
                          )}
                          aria-hidden="true"
                          strokeWidth={2.5}
                        />
                      ) : null}
                    </button>
                  )
                })}
              </div>

              <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  <Pipette className="h-3 w-3" aria-hidden="true" />
                  Custom color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={expandHex(customColor)}
                    aria-label="Pick custom color"
                    onMouseDown={(event) => event.preventDefault()}
                    onChange={(event) => {
                      setCustomColor(event.target.value)
                      onChange?.(event.target.value)
                    }}
                    className="h-8 w-10 cursor-pointer overflow-hidden rounded-md border border-slate-200 bg-transparent p-0 dark:border-slate-600"
                  />
                  <input
                    type="text"
                    value={customColor}
                    spellCheck={false}
                    aria-label="Custom hex color"
                    onMouseDown={(event) => event.preventDefault()}
                    onChange={(event) => setCustomColor(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        applyCustom()
                      }
                    }}
                    className={cn(
                      'h-8 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-2',
                      'font-mono text-xs text-slate-800 outline-none',
                      'focus:border-slate-400 focus:ring-2 focus:ring-slate-200',
                      'dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100',
                      'dark:focus:border-slate-400 dark:focus:ring-slate-700',
                    )}
                    placeholder="#2563eb"
                  />
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={applyCustom}
                    className={cn(
                      'h-8 shrink-0 rounded-md bg-slate-900 px-2.5 text-xs font-medium text-white',
                      'hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white',
                    )}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}

function expandHex(color) {
  if (!color) return '#000000'
  const match = color.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (!match) return '#000000'
  const hex = match[1]
  if (hex.length === 3) {
    return `#${hex
      .split('')
      .map((char) => char + char)
      .join('')}`
  }
  return `#${hex}`
}

function isLightColor(color) {
  const hex = expandHex(color).slice(1)
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 160
}
