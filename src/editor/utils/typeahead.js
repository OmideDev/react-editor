/**
 * Shared utilities for slash / mention floating menus.
 */

export function getTextUpToCursor(selection) {
  const anchor = selection.anchor
  if (anchor.type !== 'text') return { text: '', offset: 0, node: null }

  const node = anchor.getNode()
  const text = node.getTextContent().slice(0, anchor.offset)
  return { text, offset: anchor.offset, node }
}

/**
 * Find trigger match: last `/` or `@` not preceded by a word char.
 */
export function matchTrigger(text, trigger) {
  const escaped = trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(?:^|\\s)${escaped}([^\\s${escaped}]*)$`)
  const match = text.match(regex)
  if (!match) return null

  const query = match[1] ?? ''
  const matchLength = match[0].length - (match[0].startsWith(trigger) ? 0 : 1)
  // Full match includes leading whitespace sometimes — compute start index of trigger
  const triggerIndex = text.lastIndexOf(trigger)
  if (triggerIndex === -1) return null

  // Ensure trigger is at start or after whitespace
  if (triggerIndex > 0 && !/\s/.test(text[triggerIndex - 1])) {
    return null
  }

  return {
    query,
    triggerIndex,
    replaceLength: text.length - triggerIndex,
    matchLength,
  }
}

export function filterByQuery(items, query, getText) {
  const q = (query || '').trim().toLowerCase()
  if (!q) return items
  return items.filter((item) => getText(item).toLowerCase().includes(q))
}

export function clampIndex(index, length) {
  if (length <= 0) return 0
  if (index < 0) return length - 1
  if (index >= length) return 0
  return index
}
