import { ArrowLeftRight } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { useEditorDirection } from '../../context/DirectionControlContext'
import { ToolbarTooltip } from './ToolbarTooltip'

/**
 * Visible LTR / RTL toggle for the editor toolbar.
 */
export function DirectionButton({ className }) {
  const { isRTL, toggleDirection } = useEditorDirection()
  const label = isRTL ? 'RTL' : 'LTR'
  const tip = isRTL
    ? 'جهت: راست‌چین — کلیک برای چپ‌چین'
    : 'Direction: LTR — click for RTL'

  return (
    <ToolbarTooltip label={tip}>
      <button
        type="button"
        aria-label={tip}
        aria-pressed={isRTL}
        title={tip}
        onMouseDown={(event) => event.preventDefault()}
        onClick={toggleDirection}
        className={cn(
          'omid-toolbar-btn omid-direction-btn inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-lg px-2',
          'text-[11px] font-semibold tracking-wide',
          'text-[color:var(--editor-muted)] transition-all duration-150 ease-out',
          'hover:bg-[color:var(--editor-hover)] hover:text-[color:var(--editor-text)]',
          'active:scale-95',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--editor-focus-ring)]',
          isRTL &&
            'bg-[color:var(--editor-active)] text-[color:var(--editor-active-text)] hover:bg-[color:var(--editor-active)] hover:text-[color:var(--editor-active-text)]',
          className,
        )}
      >
        <ArrowLeftRight className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden="true" />
        <span>{label}</span>
      </button>
    </ToolbarTooltip>
  )
}
