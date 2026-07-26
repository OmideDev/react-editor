import { ListPlugin as LexicalListPlugin } from '@lexical/react/LexicalListPlugin'
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin'
import {
  $isListItemNode,
  $isListNode,
  ListItemNode,
  ListNode,
} from '@lexical/list'
import { $getNearestNodeOfType } from '@lexical/utils'
import { $getSelection, $isRangeSelection } from 'lexical'

/**
 * Enables bullet, numbered, and check lists.
 * Wraps Lexical ListPlugin + CheckListPlugin for the package API.
 */
export function ListPlugin({
  hasStrictIndent = false,
  shouldPreserveNumbering = false,
  disableTakeFocusOnClick,
} = {}) {
  return (
    <>
      <LexicalListPlugin
        hasStrictIndent={hasStrictIndent}
        shouldPreserveNumbering={shouldPreserveNumbering}
      />
      <CheckListPlugin disableTakeFocusOnClick={disableTakeFocusOnClick} />
    </>
  )
}

/**
 * Returns the list type for the current selection: 'bullet' | 'number' | 'check' | null.
 * Must be called inside an editor read/update.
 */
export function $getListType() {
  const selection = $getSelection()
  if (!$isRangeSelection(selection)) {
    return null
  }

  const anchorNode = selection.anchor.getNode()
  const listItem =
    $getNearestNodeOfType(anchorNode, ListItemNode) ??
    ($isListItemNode(anchorNode) ? anchorNode : null)

  if (!listItem) {
    return null
  }

  const parent = listItem.getParent()
  if ($isListNode(parent)) {
    return parent.getListType()
  }

  // Nested list: climb to the nearest ListNode
  const listNode = $getNearestNodeOfType(anchorNode, ListNode)
  return $isListNode(listNode) ? listNode.getListType() : null
}
