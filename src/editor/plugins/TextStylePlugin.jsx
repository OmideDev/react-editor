import { useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $getSelectionStyleValueForProperty,
  $patchStyleText,
} from '@lexical/selection'
import { mergeRegister } from '@lexical/utils'
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
} from 'lexical'

export const SET_TEXT_COLOR_COMMAND = createCommand('SET_TEXT_COLOR_COMMAND')
export const SET_HIGHLIGHT_COMMAND = createCommand('SET_HIGHLIGHT_COMMAND')
export const SET_BACKGROUND_COLOR_COMMAND = createCommand(
  'SET_BACKGROUND_COLOR_COMMAND',
)

/**
 * Applies inline color / background styles via Lexical selection APIs.
 * Pass `null` (or empty string) to clear a style.
 */
export function TextStylePlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        SET_TEXT_COLOR_COMMAND,
        (color) => {
          const selection = $getSelection()
          if (!$isRangeSelection(selection)) {
            return false
          }

          $patchStyleText(selection, {
            color: color || null,
          })
          return true
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(
        SET_HIGHLIGHT_COMMAND,
        (color) => {
          const selection = $getSelection()
          if (!$isRangeSelection(selection)) {
            return false
          }

          $patchStyleText(selection, {
            'background-color': color || null,
          })
          return true
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(
        SET_BACKGROUND_COLOR_COMMAND,
        (color) => {
          const selection = $getSelection()
          if (!$isRangeSelection(selection)) {
            return false
          }

          $patchStyleText(selection, {
            'background-color': color || null,
          })
          return true
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    )
  }, [editor])

  return null
}

/**
 * Reads current text / background styles from the selection.
 * Must be called inside an editor read/update.
 */
export function $getTextStyles() {
  const selection = $getSelection()
  if (!$isRangeSelection(selection)) {
    return {
      color: '',
      backgroundColor: '',
    }
  }

  return {
    color: $getSelectionStyleValueForProperty(selection, 'color', ''),
    backgroundColor: $getSelectionStyleValueForProperty(
      selection,
      'background-color',
      '',
    ),
  }
}
