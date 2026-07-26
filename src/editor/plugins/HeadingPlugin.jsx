import { useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $createHeadingNode,
  $isHeadingNode,
  HeadingNode,
} from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import { $getNearestNodeOfType, mergeRegister } from '@lexical/utils'
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
} from 'lexical'

export const SET_HEADING_COMMAND = createCommand('SET_HEADING_COMMAND')

const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])

/**
 * Registers heading block conversion.
 * Note: Lexical's FORMAT_ELEMENT_COMMAND is for alignment (left/center/right),
 * not headings — headings use $setBlocksType + HeadingNode via SET_HEADING_COMMAND.
 */
export function HeadingPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!editor.hasNodes([HeadingNode])) {
      console.error(
        'HeadingPlugin: HeadingNode is not registered in the editor config.',
      )
    }

    return mergeRegister(
      editor.registerCommand(
        SET_HEADING_COMMAND,
        (tag) => {
          const selection = $getSelection()
          if (!$isRangeSelection(selection)) {
            return false
          }

          if (tag === 'paragraph') {
            $setBlocksType(selection, () => $createParagraphNode())
            return true
          }

          if (!HEADING_TAGS.has(tag)) {
            return false
          }

          $setBlocksType(selection, () => $createHeadingNode(tag))
          return true
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    )
  }, [editor])

  return null
}

/**
 * Reads the current block type for the selection (paragraph | h1–h6).
 * Must be called inside an editor read/update.
 */
export function $getBlockType() {
  const selection = $getSelection()
  if (!$isRangeSelection(selection)) {
    return 'paragraph'
  }

  const anchorNode = selection.anchor.getNode()
  const heading = $getNearestNodeOfType(anchorNode, HeadingNode)

  if ($isHeadingNode(heading)) {
    return heading.getTag()
  }

  return 'paragraph'
}
