import { forwardRef, useCallback, useMemo, useState } from 'react'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { Toolbar } from '../components/Toolbar'
import { MobileToolbar } from '../components/MobileToolbar'
import { LoadingOverlay } from '../components/LoadingOverlay'
import { EditorStats } from '../components/EditorStats'
import { MediaLibrary } from '../components/MediaLibrary'
import { ImageUploader } from '../components/ImageUploader'
import { TextFormattingPlugin } from '../plugins/TextFormattingPlugin'
import { HeadingPlugin } from '../plugins/HeadingPlugin'
import { ListPlugin } from '../plugins/ListPlugin'
import { TextStylePlugin } from '../plugins/TextStylePlugin'
import { BlockPlugin } from '../plugins/BlockPlugin'
import { LinkPlugin } from '../plugins/LinkPlugin'
import { ImagePlugin } from '../plugins/ImagePlugin'
import { HistoryPlugin } from '../plugins/HistoryPlugin'
import { EditingExperiencePlugin } from '../plugins/EditingExperiencePlugin'
import { EditorValuePlugin } from '../plugins/EditorValuePlugin'
import { SlashCommandPlugin } from '../plugins/SlashCommandPlugin'
import { MarkdownShortcutPlugin } from '../plugins/MarkdownShortcutPlugin'
import { MentionPlugin } from '../plugins/MentionPlugin'
import { TablePlugin } from '../plugins/TablePlugin'
import { VideoPlugin } from '../plugins/VideoPlugin'
import { FilePlugin } from '../plugins/FilePlugin'
import { CodePlugin } from '../plugins/CodePlugin'
import { CharacterLimitPlugin } from '../plugins/CharacterLimitPlugin'
import { EditorApiPlugin } from '../plugins/EditorApiPlugin'
import { AutoSavePlugin } from '../hooks/useAutoSave'
import { EditorProvider } from './EditorProvider'
import { EditorErrorBoundary } from './EditorErrorBoundary'
import { ThemeProvider } from '../theme/ThemeProvider'
import { DirectionControlProvider, useEditorDirection } from '../context/DirectionControlContext'
import { EditorUploadProvider, useEditorUpload } from '../context/EditorUploadContext'
import {
  EditorFeaturesProvider,
  useEditorFeatures,
} from '../context/EditorFeaturesContext'
import { useTheme } from '../hooks/useTheme'
import { getInitialEditorState } from '../utils/import'
import { INSERT_IMAGE_COMMAND } from '../nodes/ImageNode'
import { cn } from '../../lib/utils'
import '../styles/editor.css'

function Placeholder({ text }) {
  return <div className="omid-editor-placeholder">{text}</div>
}

function resolvePlaceholder(placeholder, isRTL) {
  // Explicit custom placeholder from consumer
  if (
    typeof placeholder === 'string' &&
    placeholder.length > 0 &&
    placeholder !== 'Write...' &&
    placeholder !== 'Write' &&
    placeholder !== 'بنویسید…' &&
    placeholder !== 'بنویسید'
  ) {
    return placeholder
  }
  return isRTL ? 'بنویسید' : 'Write'
}

function SaveIndicator({ status }) {
  if (!status || status.status === 'idle') return null

  let label = ''
  if (status.saving) label = 'Saving…'
  else if (status.saved) label = 'Saved'
  else if (status.error) label = status.error || 'Save failed'

  return (
    <div
      className={cn(
        'pointer-events-none absolute right-3 top-3 z-30 rounded-full px-2.5 py-1 text-[11px] font-medium shadow-sm',
        'bg-[color:var(--editor-popover)] text-[color:var(--editor-muted)]',
        'border border-[color:var(--editor-border)]',
        'animate-[omid-fade-in_150ms_ease]',
        status.error && 'text-[color:var(--editor-danger)]',
        status.saved && 'text-emerald-600',
      )}
      aria-live="polite"
    >
      {label}
    </div>
  )
}

function MediaLibraryBridge({ open, onOpenChange }) {
  const [editor] = useLexicalComposerContext()

  return (
    <MediaLibrary
      open={open}
      onOpenChange={onOpenChange}
      onInsert={(payload) => {
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, payload)
      }}
    />
  )
}

function ImageUploaderBridge({ open, onOpenChange }) {
  const [editor] = useLexicalComposerContext()

  return (
    <ImageUploader
      open={open}
      onOpenChange={onOpenChange}
      onInsert={(payload) => {
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, payload)
        onOpenChange?.(false)
      }}
    />
  )
}

function EditorSurface({
  className,
  contentClassName,
  placeholder,
  toolbar,
  mobileToolbar = true,
  toolbarExtra,
  value,
  onChange,
  onJSONChange,
  onHTMLChange,
  loading = false,
  loadingLabel = 'Loading…',
  autoSave,
  mentions = [],
  maxCharacters,
  apiRef,
  onReady,
}) {
  const { style: themeStyle, resolved, isDark } = useTheme()
  const { direction: resolvedDirection, isRTL } = useEditorDirection()
  const features = useEditorFeatures()
  const { onOpenMediaLibrary } = useEditorUpload()
  const [mediaOpen, setMediaOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)

  const placeholderText = resolvePlaceholder(placeholder, isRTL)
  const hasExternalLibrary = typeof onOpenMediaLibrary === 'function'
  const showInternalLibrary = features.mediaLibrary && !hasExternalLibrary

  const handleSaveStatus = useCallback((next) => {
    setSaveStatus(next)
  }, [])

  const handleOpenImageFromSlash = useCallback(() => {
    if (hasExternalLibrary) {
      onOpenMediaLibrary()
      return
    }
    if (showInternalLibrary) {
      setMediaOpen(true)
      return
    }
    if (features.imageUpload) {
      setUploadOpen(true)
    }
  }, [
    features.imageUpload,
    hasExternalLibrary,
    onOpenMediaLibrary,
    showInternalLibrary,
  ])

  return (
    <div
      className={cn(
        'omid-editor-container relative',
        isRTL && 'omid-editor-dir-rtl',
        !isRTL && 'omid-editor-dir-ltr',
        className,
      )}
      dir={resolvedDirection}
      data-direction={resolvedDirection}
      data-omid-theme={resolved.name}
      data-omid-mode={isDark ? 'dark' : 'light'}
      style={themeStyle}
    >
      {toolbar !== false ? (
        <div className="omid-toolbar-desktop omid-toolbar-sticky-top hidden sm:block">
          {toolbar ?? <Toolbar toolbarExtra={toolbarExtra} />}
        </div>
      ) : null}

      <div className="omid-editor-inner relative flex-1">
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className={cn('omid-editor-input', contentClassName)}
              aria-placeholder={placeholderText}
              placeholder={<Placeholder text={placeholderText} />}
            />
          }
          placeholder={null}
          ErrorBoundary={EditorErrorBoundary}
        />
        <LoadingOverlay loading={loading} label={loadingLabel} />
        <SaveIndicator status={saveStatus} />
      </div>

      {features.stats !== false ? (
        <EditorStats maxCharacters={maxCharacters} />
      ) : null}

      {toolbar !== false && mobileToolbar !== false ? (
        <div className="omid-toolbar-mobile omid-toolbar-sticky-bottom sm:hidden">
          {typeof mobileToolbar === 'object' ? (
            mobileToolbar
          ) : (
            <MobileToolbar sticky="bottom" toolbarExtra={toolbarExtra} />
          )}
        </div>
      ) : null}

      <EditorApiPlugin apiRef={apiRef} onReady={onReady} />
      <TextFormattingPlugin />
      <HeadingPlugin />
      <ListPlugin />
      <TextStylePlugin />
      <BlockPlugin />
      <LinkPlugin />
      <ImagePlugin />
      <HistoryPlugin />
      <EditingExperiencePlugin />
      <CodePlugin />
      <MarkdownShortcutPlugin />
      {features.slashCommands !== false ? (
        <SlashCommandPlugin onOpenImageUploader={handleOpenImageFromSlash} />
      ) : null}
      <MentionPlugin
        mentions={mentions}
        enabled={features.mentions !== false && mentions?.length > 0}
      />
      {features.table !== false ? <TablePlugin /> : null}
      <VideoPlugin enabled={features.video !== false} />
      <FilePlugin enabled={features.files !== false} />
      <CharacterLimitPlugin maxCharacters={maxCharacters} />
      <AutoSavePlugin autoSave={autoSave} onStatusChange={handleSaveStatus} />
      <EditorValuePlugin
        value={value}
        onChange={onChange}
        onJSONChange={onJSONChange}
        onHTMLChange={onHTMLChange}
      />
      {showInternalLibrary ? (
        <MediaLibraryBridge open={mediaOpen} onOpenChange={setMediaOpen} />
      ) : null}
      {features.imageUpload ? (
        <ImageUploaderBridge open={uploadOpen} onOpenChange={setUploadOpen} />
      ) : null}
    </div>
  )
}

/**
 * Self-contained rich text editor shell.
 *
 * Media ownership stays with the host:
 * - onImageUpload(file) → direct upload
 * - onOpenMediaLibrary() → open external picker
 * - ref.insertImage({ url, alt }) → insert selection result
 */
export const Editor = forwardRef(function Editor(
  {
    className,
    contentClassName,
    placeholder,
    initialConfig,
    toolbar,
    mobileToolbar,
    toolbarExtra,
    value,
    onChange,
    onJSONChange,
    onHTMLChange,
    theme = 'light',
    direction = 'ltr',
    loading = false,
    loadingLabel,
    autoSave,
    mentions,
    maxCharacters,
    features,
    video = true,
    files = true,
    showStats = true,
    onImageUpload,
    onFileUpload,
    onOpenMediaLibrary,
    onReady,
  },
  ref,
) {
  const initialEditorState = useMemo(
    () => getInitialEditorState(value) ?? initialConfig?.editorState,
    // Intentionally mount-only for LexicalComposer initial state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const mergedConfig = useMemo(
    () => ({
      ...initialConfig,
      ...(initialEditorState ? { editorState: initialEditorState } : null),
    }),
    [initialConfig, initialEditorState],
  )

  return (
    <ThemeProvider theme={theme}>
      <EditorProvider initialConfig={mergedConfig}>
        <EditorUploadProvider
          onImageUpload={onImageUpload}
          onFileUpload={onFileUpload}
          onOpenMediaLibrary={onOpenMediaLibrary}
        >
          <EditorFeaturesProvider
            features={features}
            onOpenMediaLibrary={onOpenMediaLibrary}
            video={video}
            files={files}
            showStats={showStats}
          >
            <DirectionControlProvider direction={direction}>
              <EditorSurface
                className={className}
                contentClassName={contentClassName}
                placeholder={placeholder}
                toolbar={toolbar}
                mobileToolbar={mobileToolbar}
                toolbarExtra={toolbarExtra}
                value={value}
                onChange={onChange}
                onJSONChange={onJSONChange}
                onHTMLChange={onHTMLChange}
                loading={loading}
                loadingLabel={loadingLabel}
                autoSave={autoSave}
                mentions={mentions}
                maxCharacters={maxCharacters}
                apiRef={ref}
                onReady={onReady}
              />
            </DirectionControlProvider>
          </EditorFeaturesProvider>
        </EditorUploadProvider>
      </EditorProvider>
    </ThemeProvider>
  )
})
