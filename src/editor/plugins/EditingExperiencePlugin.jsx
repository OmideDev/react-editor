import { useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { BLUR_COMMAND, COMMAND_PRIORITY_LOW, FOCUS_COMMAND } from 'lexical'
import { mergeRegister } from '@lexical/utils'

/**
 * Improves focus/selection UX: keeps editor chrome in sync with focus state.
 */
export function EditingExperiencePlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    const rootElement = editor.getRootElement()
    const container = rootElement?.closest('.omid-editor-container')

    return mergeRegister(
      editor.registerCommand(
        FOCUS_COMMAND,
        () => {
          container?.classList.add('omid-editor-focused')
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        BLUR_COMMAND,
        () => {
          container?.classList.remove('omid-editor-focused')
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerRootListener((root) => {
        if (!root) return undefined

        const onMouseDown = (event) => {
          // Clicking padding / empty chrome focuses the editor without stealing selection.
          if (event.target === root) {
            editor.focus()
          }
        }

        root.addEventListener('mousedown', onMouseDown)
        return () => root.removeEventListener('mousedown', onMouseDown)
      }),
    )
  }, [editor])

  return null
}
