import { Minus, Quote } from 'lucide-react'
import { useEditorCommands } from '../../hooks/useEditorCommands'
import { ToolbarButton } from './ToolbarButton'

/**
 * Quote + divider toolbar controls.
 */
export function BlockButtons() {
  const { isQuote, toggleQuote, insertDivider } = useEditorCommands()

  return (
    <>
      <ToolbarButton
        icon={Quote}
        label="Quote"
        active={isQuote}
        onClick={toggleQuote}
      />
      <ToolbarButton
        icon={Minus}
        label="Divider"
        onClick={insertDivider}
      />
    </>
  )
}
