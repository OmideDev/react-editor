import { useRef, useState } from 'react'
import { Link2 } from 'lucide-react'
import { useEditorCommands } from '../../hooks/useEditorCommands'
import { LinkPopover } from '../LinkPopover'
import { ToolbarButton } from './ToolbarButton'

/**
 * Toolbar control that opens the link popover.
 */
export function LinkButton({ className }) {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef(null)
  const {
    isLink,
    linkUrl,
    applyLink,
    removeLink,
  } = useEditorCommands()

  return (
    <div ref={anchorRef} className="relative shrink-0">
      <ToolbarButton
        icon={Link2}
        label="Link"
        active={open || isLink}
        onClick={() => setOpen((prev) => !prev)}
        className={className}
        aria-haspopup="dialog"
        aria-expanded={open}
      />
      <LinkPopover
        open={open}
        onOpenChange={setOpen}
        anchorRef={anchorRef}
        url={linkUrl}
        isLink={isLink}
        onApply={applyLink}
        onRemove={removeLink}
      />
    </div>
  )
}
