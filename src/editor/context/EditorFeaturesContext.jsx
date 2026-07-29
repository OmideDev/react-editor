import { createContext, useContext, useMemo } from 'react'
import { DEFAULT_FEATURES, resolveFeatures } from '../utils/features'

const EditorFeaturesContext = createContext(DEFAULT_FEATURES)

/**
 * Provides resolved feature flags to toolbar / plugins.
 */
export function EditorFeaturesProvider({
  features,
  onOpenMediaLibrary,
  video,
  files,
  showStats,
  children,
}) {
  const value = useMemo(
    () =>
      resolveFeatures(features, {
        onOpenMediaLibrary,
        video,
        files,
        showStats,
      }),
    [features, onOpenMediaLibrary, video, files, showStats],
  )

  return (
    <EditorFeaturesContext.Provider value={value}>
      {children}
    </EditorFeaturesContext.Provider>
  )
}

export function useEditorFeatures() {
  return useContext(EditorFeaturesContext)
}
