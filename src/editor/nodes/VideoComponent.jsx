import { useCallback, useEffect, useRef, useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getNodeByKey } from 'lexical'
import { Trash2, Replace } from 'lucide-react'
import { cn } from '../../lib/utils'
import { $isVideoNode } from './VideoNode'
import { parseVideoUrl } from '../utils/video'

export function VideoComponent({
  nodeKey,
  src,
  url,
  provider,
}) {
  const [editor] = useLexicalComposerContext()
  const [selected, setSelected] = useState(false)
  const [replacing, setReplacing] = useState(false)
  const [replaceUrl, setReplaceUrl] = useState('')
  const rootRef = useRef(null)

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = window.getSelection()
        // Selection tracking via node click is enough for UI chrome.
      })
    })
  }, [editor])

  const remove = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isVideoNode(node)) node.remove()
    })
  }, [editor, nodeKey])

  const replace = useCallback(() => {
    const parsed = parseVideoUrl(replaceUrl)
    if (!parsed) return
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isVideoNode(node)) {
        node.setSrc(parsed.src)
        node.setUrl(parsed.url)
        node.setProvider(parsed.provider)
      }
    })
    setReplacing(false)
    setReplaceUrl('')
  }, [editor, nodeKey, replaceUrl])

  return (
    <div
      ref={rootRef}
      className={cn(
        'omid-editor-video-block group relative my-3 w-full overflow-hidden rounded-xl',
        'border border-[color:var(--editor-border)] bg-[color:var(--editor-surface)]',
        selected && 'ring-2 ring-[color:var(--editor-active)]',
      )}
      onClick={() => setSelected(true)}
      contentEditable={false}
    >
      <div className="omid-editor-video-frame relative w-full" style={{ paddingTop: '56.25%' }}>
        <iframe
          title={`${provider} video`}
          src={src}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate text-xs text-[color:var(--editor-muted)] hover:underline"
        >
          {url}
        </a>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            className="omid-editor-video-btn"
            aria-label="Replace video"
            onClick={(e) => {
              e.stopPropagation()
              setReplacing((v) => !v)
            }}
          >
            <Replace className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="omid-editor-video-btn"
            aria-label="Remove video"
            onClick={(e) => {
              e.stopPropagation()
              remove()
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {replacing ? (
        <div className="flex gap-2 border-t border-[color:var(--editor-border)] px-3 py-2">
          <input
            value={replaceUrl}
            onChange={(e) => setReplaceUrl(e.target.value)}
            placeholder="Paste YouTube or Vimeo URL"
            className="min-w-0 flex-1 rounded-lg border border-[color:var(--editor-border)] bg-[color:var(--editor-bg)] px-2 py-1.5 text-xs outline-none"
          />
          <button
            type="button"
            onClick={replace}
            className="rounded-lg bg-[color:var(--editor-active)] px-2.5 py-1.5 text-xs font-medium text-[color:var(--editor-active-text)]"
          >
            Replace
          </button>
        </div>
      ) : null}
    </div>
  )
}
