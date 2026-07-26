import { useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  COMMAND_PRIORITY_NORMAL,
  FORMAT_TEXT_COMMAND,
  KEY_DOWN_COMMAND,
} from 'lexical'
import { mergeRegister } from '@lexical/utils'

/**
 * Registers keyboard shortcuts for common text formats.
 * Toolbar actions dispatch FORMAT_TEXT_COMMAND via useEditorCommands.
 */
export function TextFormattingPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        KEY_DOWN_COMMAND,
        (event) => {
          const { metaKey, ctrlKey, key } = event
          if (!(metaKey || ctrlKey) || event.altKey) {
            return false
          }

          const lower = key.toLowerCase()

          if (lower === 'b') {
            event.preventDefault()
            return editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
          }

          if (lower === 'i') {
            event.preventDefault()
            return editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
          }

          if (lower === 'u') {
            event.preventDefault()
            return editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
          }

          // Ctrl/Cmd+Shift+X → strikethrough
          if (lower === 'x' && event.shiftKey) {
            event.preventDefault()
            return editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
          }

          return false
        },
        COMMAND_PRIORITY_NORMAL,
      ),
    )
  }, [editor])

  return null
}
