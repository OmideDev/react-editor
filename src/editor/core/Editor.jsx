import { useCallback, useMemo, useState } from 'react'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { Toolbar } from '../components/Toolbar'
import { MobileToolbar } from '../components/MobileToolbar'
import { LoadingOverlay } from '../components/LoadingOverlay'
import { EditorStats } from '../components/EditorStats'
import { MediaLibrary } from '../components/MediaLibrary'
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
import { AutoSavePlugin } from '../hooks/useAutoSave'
import { EditorProvider } from './EditorProvider'
import { EditorErrorBoundary } from './EditorErrorBoundary'
import { ThemeProvider } from '../theme/ThemeProvider'
import { DirectionControlProvider, useEditorDirection } from '../context/DirectionControlContext'
import { EditorUploadProvider } from '../context/EditorUploadContext'
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

function EditorSurface({
  className,
  contentClassName,
  placeholder,
  toolbar,
  mobileToolbar = true,
  value,
  onChange,
  onJSONChange,
  onHTMLChange,
  loading = false,
  loadingLabel = 'Loading…',
  autoSave,
  mentions = [],
  maxCharacters,
  video = true,
  files = true,
  showStats = true,
}) {
  const { style: themeStyle, resolved, isDark } = useTheme()
  const { direction: resolvedDirection, isRTL } = useEditorDirection()
  const [mediaOpen, setMediaOpen] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)

  const placeholderText = resolvePlaceholder(placeholder, isRTL)

  const handleSaveStatus = useCallback((next) => {
    setSaveStatus(next)
  }, [])

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
        <div className="omid-toolbar-desktop hidden sm:block">
          {toolbar ?? <Toolbar />}
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

      {showStats !== false ? (
        <EditorStats maxCharacters={maxCharacters} />
      ) : null}

      {toolbar !== false && mobileToolbar !== false ? (
        <div className="omid-toolbar-mobile sm:hidden">
          {typeof mobileToolbar === 'object' ? (
            mobileToolbar
          ) : (
            <MobileToolbar sticky="bottom" />
          )}
        </div>
      ) : null}

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
      <SlashCommandPlugin onOpenImageUploader={() => setMediaOpen(true)} />
      <MentionPlugin mentions={mentions} enabled={mentions?.length > 0} />
      <TablePlugin />
      <VideoPlugin enabled={video !== false} />
      <FilePlugin enabled={files !== false} />
      <CharacterLimitPlugin maxCharacters={maxCharacters} />
      <AutoSavePlugin autoSave={autoSave} onStatusChange={handleSaveStatus} />
      <EditorValuePlugin
        value={value}
        onChange={onChange}
        onJSONChange={onJSONChange}
        onHTMLChange={onHTMLChange}
      />
      <MediaLibraryBridge open={mediaOpen} onOpenChange={setMediaOpen} />
    </div>
  )
}

/**
 * Self-contained rich text editor shell.
 */
export function Editor({
  className,
  contentClassName,
  placeholder,
  initialConfig,
  toolbar,
  mobileToolbar,
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
  video = true,
  files = true,
  showStats = true,
  onImageUpload,
  onFileUpload,
}) {
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
        >
          <DirectionControlProvider direction={direction}>
            <EditorSurface
              className={className}
              contentClassName={contentClassName}
              placeholder={placeholder}
              toolbar={toolbar}
              mobileToolbar={mobileToolbar}
              value={value}
              onChange={onChange}
              onJSONChange={onJSONChange}
              onHTMLChange={onHTMLChange}
              loading={loading}
              loadingLabel={loadingLabel}
              autoSave={autoSave}
              mentions={mentions}
              maxCharacters={maxCharacters}
              video={video}
              files={files}
              showStats={showStats}
            />
          </DirectionControlProvider>
        </EditorUploadProvider>
      </EditorProvider>
    </ThemeProvider>
  )
}
