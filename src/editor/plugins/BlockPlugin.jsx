import { useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $setBlocksType } from '@lexical/selection'
import {
  $getNearestNodeOfType,
  $insertNodeToNearestRoot,
  mergeRegister,
} from '@lexical/utils'
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
} from 'lexical'
import {
  $createQuoteNode,
  $isQuoteNode,
  QuoteNode,
} from '../nodes/QuoteNode'
import {
  $createDividerNode,
  DividerNode,
} from '../nodes/DividerNode'

export const INSERT_QUOTE_COMMAND = createCommand('INSERT_QUOTE_COMMAND')
export const INSERT_DIVIDER_COMMAND = createCommand('INSERT_DIVIDER_COMMAND')

/**
 * Registers quote toggle and divider insert commands.
 */
export function BlockPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!editor.hasNodes([QuoteNode, DividerNode])) {
      console.error(
        'BlockPlugin: QuoteNode and/or DividerNode are not registered in the editor config.',
      )
    }

    return mergeRegister(
      editor.registerCommand(
        INSERT_QUOTE_COMMAND,
        () => {
          const selection = $getSelection()
          if (!$isRangeSelection(selection)) {
            return false
          }

          if ($isInQuote()) {
            $setBlocksType(selection, () => $createParagraphNode())
          } else {
            $setBlocksType(selection, () => $createQuoteNode())
          }

          return true
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(
        INSERT_DIVIDER_COMMAND,
        () => {
          const selection = $getSelection()
          if (!$isRangeSelection(selection)) {
            return false
          }

          $insertNodeToNearestRoot($createDividerNode())
          return true
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    )
  }, [editor])

  return null
}

/**
 * Whether the current selection is inside a quote block.
 * Must be called inside an editor read/update.
 */
export function $isInQuote() {
  const selection = $getSelection()
  if (!$isRangeSelection(selection)) {
    return false
  }

  const anchorNode = selection.anchor.getNode()
  const quote =
    $getNearestNodeOfType(anchorNode, QuoteNode) ??
    ($isQuoteNode(anchorNode) ? anchorNode : null)

  return $isQuoteNode(quote)
}
