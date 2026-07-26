import { createContext, useContext, useMemo } from 'react'

const defaultValue = {
  onImageUpload: null,
  onFileUpload: null,
}

export const EditorUploadContext = createContext(defaultValue)

/**
 * Provides configurable image/file upload handlers to editor UI.
 */
export function EditorUploadProvider({
  onImageUpload,
  onFileUpload,
  children,
}) {
  const value = useMemo(
    () => ({
      onImageUpload: onImageUpload ?? null,
      onFileUpload: onFileUpload ?? null,
    }),
    [onImageUpload, onFileUpload],
  )

  return (
    <EditorUploadContext.Provider value={value}>
      {children}
    </EditorUploadContext.Provider>
  )
}

export function useEditorUpload() {
  return useContext(EditorUploadContext)
}
