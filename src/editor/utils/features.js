/**
 * Default feature flags. The editor stays generic: host apps turn
 * capabilities on/off and wire their own media layer via callbacks.
 */
export const DEFAULT_FEATURES = {
  mediaLibrary: true,
  imageUpload: true,
  files: true,
  video: true,
  emoji: true,
  slashCommands: true,
  stats: true,
  mentions: true,
  table: true,
}

/**
 * Merge consumer `features` with legacy boolean props and media callbacks.
 *
 * When `onOpenMediaLibrary` is provided, the built-in localStorage library
 * defaults to off unless explicitly re-enabled with `features.mediaLibrary`.
 */
export function resolveFeatures(features = {}, options = {}) {
  const {
    onOpenMediaLibrary = null,
    video,
    files,
    showStats,
  } = options

  const hasExternalLibrary = typeof onOpenMediaLibrary === 'function'

  const mediaLibrary =
    features.mediaLibrary !== undefined
      ? Boolean(features.mediaLibrary)
      : hasExternalLibrary
        ? false
        : DEFAULT_FEATURES.mediaLibrary

  return {
    mediaLibrary,
    imageUpload:
      features.imageUpload !== undefined
        ? Boolean(features.imageUpload)
        : DEFAULT_FEATURES.imageUpload,
    files:
      features.files !== undefined
        ? Boolean(features.files)
        : files !== undefined
          ? Boolean(files)
          : DEFAULT_FEATURES.files,
    video:
      features.video !== undefined
        ? Boolean(features.video)
        : video !== undefined
          ? Boolean(video)
          : DEFAULT_FEATURES.video,
    emoji:
      features.emoji !== undefined
        ? Boolean(features.emoji)
        : DEFAULT_FEATURES.emoji,
    slashCommands:
      features.slashCommands !== undefined
        ? Boolean(features.slashCommands)
        : DEFAULT_FEATURES.slashCommands,
    stats:
      features.stats !== undefined
        ? Boolean(features.stats)
        : showStats !== undefined
          ? Boolean(showStats)
          : DEFAULT_FEATURES.stats,
    mentions:
      features.mentions !== undefined
        ? Boolean(features.mentions)
        : DEFAULT_FEATURES.mentions,
    table:
      features.table !== undefined
        ? Boolean(features.table)
        : DEFAULT_FEATURES.table,
  }
}
