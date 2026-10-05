import { LinkPlugin as LexicalLinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ClickableLinkPlugin } from '@lexical/react/LexicalClickableLinkPlugin'
import { $isLinkNode, $isAutoLinkNode } from '@lexical/link'
import { $findMatchingParent } from '@lexical/utils'
import { $getSelection, $isRangeSelection } from 'lexical'
import { isValidUrl } from '../utils/url'

/**
 * Enables Lexical LinkNode + clickable links with URL validation.
 */
export function LinkPlugin() {
  return (
    <>
      <LexicalLinkPlugin validateUrl={isValidUrl} />
      <ClickableLinkPlugin newTab />
    </>
  )
}

/**
 * Returns the nearest LinkNode for the current selection, or null.
 * Must be called inside an editor read/update.
 */
export function $getSelectedLink() {
  const selection = $getSelection()
  if (!$isRangeSelection(selection)) {
    return null
  }

  const node = selection.anchor.getNode()
  const linkParent = $findMatchingParent(
    node,
    (parent) => $isLinkNode(parent) || $isAutoLinkNode(parent),
  )

  if ($isLinkNode(linkParent) || $isAutoLinkNode(linkParent)) {
    return linkParent
  }

  if ($isLinkNode(node) || $isAutoLinkNode(node)) {
    return node
  }

  return null
}

/**
 * Snapshot of the selected link for toolbar UI.
 */
export function $getLinkData() {
  const link = $getSelectedLink()
  if (!link) {
    return {
      isLink: false,
      url: '',
      openInNewTab: false,
    }
  }

  const target = link.getTarget()

  return {
    isLink: true,
    url: link.getURL(),
    openInNewTab: target === '_blank',
  }
}
