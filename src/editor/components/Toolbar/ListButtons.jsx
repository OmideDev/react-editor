import { CheckSquare, List, ListOrdered } from 'lucide-react'
import { useEditorCommands } from '../../hooks/useEditorCommands'
import { ToolbarButton } from './ToolbarButton'

/**
 * Bullet / numbered / checklist toolbar controls with Lexical toggle + active state.
 */
export function ListButtons() {
  const {
    isBulletList,
    isNumberList,
    isCheckList,
    toggleBulletList,
    toggleNumberList,
    toggleCheckList,
  } = useEditorCommands()

  return (
    <>
      <ToolbarButton
        icon={List}
        label="Bullet list"
        active={isBulletList}
        onClick={toggleBulletList}
      />
      <ToolbarButton
        icon={ListOrdered}
        label="Numbered list"
        active={isNumberList}
        onClick={toggleNumberList}
      />
      <ToolbarButton
        icon={CheckSquare}
        label="Checklist"
        active={isCheckList}
        onClick={toggleCheckList}
      />
    </>
  )
}
