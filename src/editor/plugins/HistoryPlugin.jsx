import { useEffect, useMemo } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  createEmptyHistoryState,
  registerHistory,
} from '@lexical/history'
import { mergeRegister } from '@lexical/utils'
import {
  COMMAND_PRIORITY_NORMAL,
  KEY_DOWN_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from 'lexical'

/**
 * Undo/redo history via @lexical/history.
 * Uses createEmptyHistoryState + registerHistory (Lexical's history API).
 * Keyboard: Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z / Ctrl/Cmd+Y redo.
 */
export function HistoryPlugin({ delay = 1000, externalHistoryState }) {
  const [editor] = useLexicalComposerContext()
  const historyState = useMemo(
    () => externalHistoryState ?? createEmptyHistoryState(),
    [externalHistoryState],
  )

  useEffect(() => {
    return mergeRegister(
      registerHistory(editor, historyState, delay),
      editor.registerCommand(
        KEY_DOWN_COMMAND,
        (event) => {
          const { key, metaKey, ctrlKey, shiftKey, altKey } = event
          if (!(metaKey || ctrlKey) || altKey) {
            return false
          }

          const lower = key.toLowerCase()

          if (lower === 'z' && !shiftKey) {
            event.preventDefault()
            return editor.dispatchCommand(UNDO_COMMAND, undefined)
          }

          if ((lower === 'z' && shiftKey) || lower === 'y') {
            event.preventDefault()
            return editor.dispatchCommand(REDO_COMMAND, undefined)
          }

          return false
        },
        COMMAND_PRIORITY_NORMAL,
      ),
    )
  }, [delay, editor, historyState])

  return null
}

export { createEmptyHistoryState, registerHistory }
export { UNDO_COMMAND, REDO_COMMAND }
