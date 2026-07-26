import { useEffect, useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getRoot, $getSelection, $isRangeSelection } from 'lexical'

/**
 * Soft character limit: trims overflow after updates that exceed maxCharacters.
 */
export function CharacterLimitPlugin({ maxCharacters }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (typeof maxCharacters !== 'number' || maxCharacters <= 0) {
      return undefined
    }

    return editor.registerTextContentListener((text) => {
      if (text.length <= maxCharacters) return

      editor.update(
        () => {
          const selection = $getSelection()
          if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
            return
          }

          const overflow = text.length - maxCharacters
          const anchor = selection.anchor
          if (anchor.type !== 'text' || anchor.offset < overflow) return

          const node = anchor.getNode()
          selection.setTextNodeRange(
            node,
            anchor.offset - overflow,
            node,
            anchor.offset,
          )
          selection.removeText()
        },
        { tag: 'character-limit' },
      )
    })
  }, [editor, maxCharacters])

  return null
}

export function useCharacterCount() {
  const [editor] = useLexicalComposerContext()
  const [count, setCount] = useState(0)

  useEffect(() => {
    const update = () => {
      editor.getEditorState().read(() => {
        setCount($getRoot().getTextContent().length)
      })
    }
    update()
    return editor.registerUpdateListener(update)
  }, [editor])

  return count
}
