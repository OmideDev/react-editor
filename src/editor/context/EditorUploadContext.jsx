import { createContext, useContext, useMemo } from 'react'

const defaultValue = {
  onImageUpload: null,
  onFileUpload: null,
  onOpenMediaLibrary: null,
}

export const EditorUploadContext = createContext(defaultValue)

/**
 * Provides configurable image/file upload handlers and external media library hook.
 *
 * Keep these paths separate:
 * - onImageUpload(file) → direct upload (toolbar / drag-drop / paste)
 * - onOpenMediaLibrary() → host opens its own picker; insert via ref.insertImage
 */
export function EditorUploadProvider({
  onImageUpload,
  onFileUpload,
  onOpenMediaLibrary,
  children,
}) {
  const value = useMemo(
    () => ({
      onImageUpload: onImageUpload ?? null,
      onFileUpload: onFileUpload ?? null,
      onOpenMediaLibrary: onOpenMediaLibrary ?? null,
    }),
    [onImageUpload, onFileUpload, onOpenMediaLibrary],
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
