import { cn } from '../../../lib/utils'
import { ToolbarTooltip } from './ToolbarTooltip'

/**
 * Accessible toolbar button with Floating UI tooltip, active/disabled states.
 */
export function ToolbarButton({
  icon: Icon,
  label,
  active = false,
  onClick,
  disabled = false,
  className,
  ...props
}) {
  return (
    <ToolbarTooltip label={label} disabled={disabled}>
      <button
        type="button"
        aria-label={label}
        aria-pressed={active}
        disabled={disabled}
        onClick={onClick}
        onMouseDown={(event) => event.preventDefault()}
        className={cn(
          'omid-toolbar-btn inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[length:var(--editor-control-radius,0.5rem)]',
          'text-[color:var(--editor-muted)] transition-all duration-150 ease-out',
          'hover:bg-[color:var(--editor-hover)] hover:text-[color:var(--editor-text)]',
          'active:scale-95',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--editor-focus-ring)]',
          'disabled:pointer-events-none disabled:opacity-40',
          active &&
            'bg-[color:var(--editor-active)] text-[color:var(--editor-active-text)] hover:bg-[color:var(--editor-active)] hover:text-[color:var(--editor-active-text)]',
          className,
        )}
        {...props}
      >
        {Icon ? (
          <Icon className="h-4 w-4" aria-hidden="true" strokeWidth={2} />
        ) : null}
      </button>
    </ToolbarTooltip>
  )
}
