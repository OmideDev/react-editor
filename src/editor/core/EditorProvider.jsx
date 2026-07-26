import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { EditorTheme } from './EditorTheme'
import { editorNodes } from './EditorNodes'
import { handleEditorError } from './EditorErrorBoundary'

const defaultConfig = {
  namespace: 'OmidEditor',
  theme: EditorTheme,
  onError: handleEditorError,
  nodes: editorNodes,
}

/**
 * Wraps LexicalComposer so consumers (and Editor) share one editor context.
 * Pass `initialConfig` to override namespace, theme, nodes, editable, etc.
 */
export function EditorProvider({ children, initialConfig = {} }) {
  const config = {
    ...defaultConfig,
    ...initialConfig,
    theme: initialConfig.theme ?? defaultConfig.theme,
    onError: initialConfig.onError ?? defaultConfig.onError,
    nodes: initialConfig.nodes ?? defaultConfig.nodes,
  }

  return (
    <LexicalComposer initialConfig={config}>
      {children}
    </LexicalComposer>
  )
}
