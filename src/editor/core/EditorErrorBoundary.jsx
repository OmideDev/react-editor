import { Component } from 'react'

/**
 * Error boundary compatible with Lexical RichTextPlugin's ErrorBoundary prop.
 * Expects `{ children, onError }` where onError receives an Error.
 */
export class EditorErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    this.props.onError?.(error instanceof Error ? error : new Error(String(error)))
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="omid-editor-error" role="alert">
          Something went wrong while rendering the editor.
        </div>
      )
    }

    return this.props.children
  }
}

export function handleEditorError(error) {
  // Shared Lexical onError handler — keeps Composer + boundary behavior aligned.
  console.error('[OmidEditor]', error)
}
