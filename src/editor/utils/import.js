import { $generateNodesFromDOM } from '@lexical/html'
import { $getRoot, $insertNodes } from 'lexical'
import { canUseDOM } from './dom'

/**
 * Detect whether a value is Lexical JSON, HTML, or empty.
 */
export function resolveEditorValue(value) {
  if (value == null || value === '') {
    return { type: 'empty', data: null }
  }

  if (typeof value === 'object') {
    if (value.root) {
      return { type: 'json', data: value }
    }
    if (value.json?.root) {
      return { type: 'json', data: value.json }
    }
    if (typeof value.html === 'string') {
      return { type: 'html', data: value.html }
    }
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) {
      return { type: 'empty', data: null }
    }

    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (parsed?.root) {
          return { type: 'json', data: parsed }
        }
      } catch {
        // Fall through to HTML.
      }
    }

    return { type: 'html', data: value }
  }

  return { type: 'empty', data: null }
}

/**
 * Load a serialized Lexical editor state JSON into the editor.
 * @param {import('lexical').LexicalEditor} editor
 * @param {object|string} json
 */
export function importJSON(editor, json) {
  if (!editor) {
    throw new Error('importJSON: editor instance is required')
  }

  if (json == null || json === '') {
    return
  }

  const payload = typeof json === 'string' ? json : JSON.stringify(json)
  const editorState = editor.parseEditorState(payload)
  editor.setEditorState(editorState)
}

/**
 * Convert an HTML string into editor content.
 * @param {import('lexical').LexicalEditor} editor
 * @param {string} html
 */
export function importHTML(editor, html) {
  if (!editor) {
    throw new Error('importHTML: editor instance is required')
  }

  if (!canUseDOM) {
    throw new Error('importHTML: requires a browser environment')
  }

  const source = typeof html === 'string' ? html : ''

  editor.update(() => {
    const parser = new DOMParser()
    const dom = parser.parseFromString(source || '<p></p>', 'text/html')
    const nodes = $generateNodesFromDOM(editor, dom)
    const root = $getRoot()
    root.clear()

    if (nodes.length > 0) {
      $insertNodes(nodes)
    }
  })
}

/**
 * Import either JSON or HTML based on value shape.
 * @returns {boolean} whether content was applied
 */
export function importEditorValue(editor, value) {
  const resolved = resolveEditorValue(value)

  if (resolved.type === 'json') {
    importJSON(editor, resolved.data)
    return true
  }

  if (resolved.type === 'html') {
    importHTML(editor, resolved.data)
    return true
  }

  return false
}

/**
 * Build an initial `editorState` string for LexicalComposer when value is JSON.
 * HTML values cannot be set via initialConfig and need a first-mount import.
 */
export function getInitialEditorState(value) {
  const resolved = resolveEditorValue(value)

  if (resolved.type === 'json') {
    return JSON.stringify(resolved.data)
  }

  return undefined
}
