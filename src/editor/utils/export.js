import { $generateHtmlFromNodes } from '@lexical/html'

/**
 * Export the full Lexical editor state as JSON.
 * @param {import('lexical').LexicalEditor} editor
 * @returns {object} SerializedEditorState
 */
export function exportJSON(editor) {
  if (!editor) {
    throw new Error('exportJSON: editor instance is required')
  }

  return editor.getEditorState().toJSON()
}

/**
 * Export the editor contents as an HTML string.
 * @param {import('lexical').LexicalEditor} editor
 * @returns {string}
 */
export function exportHTML(editor) {
  if (!editor) {
    throw new Error('exportHTML: editor instance is required')
  }

  let html = ''

  editor.getEditorState().read(() => {
    html = $generateHtmlFromNodes(editor, null)
  })

  return html
}

/**
 * Convenience helper returning both formats.
 * @param {import('lexical').LexicalEditor} editor
 * @returns {{ json: object, html: string }}
 */
export function exportEditorValue(editor) {
  return {
    json: exportJSON(editor),
    html: exportHTML(editor),
  }
}
