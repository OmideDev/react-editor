import { useCallback, useEffect, useRef, useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import { mergeRegister } from '@lexical/utils'
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
} from 'lexical'
import { AlignCenter, AlignLeft, AlignRight } from 'lucide-react'
import { cn } from '../../lib/utils'
import {
  clampImageWidth,
  MAX_IMAGE_WIDTH,
  MIN_IMAGE_WIDTH,
} from '../utils/image'
import { $isImageNode, DELETE_IMAGE_COMMAND, normalizeImageAlign } from './ImageNode'

const ALIGN_OPTIONS = [
  { value: 'left', icon: AlignLeft, label: 'Align left' },
  { value: 'center', icon: AlignCenter, label: 'Align center' },
  { value: 'right', icon: AlignRight, label: 'Align right' },
]

/**
 * Decorative React UI for ImageNode: selection, resize, caption, alignment.
 */
export function ImageComponent({
  src,
  altText,
  width,
  height,
  caption,
  align: alignProp = 'left',
  nodeKey,
}) {
  const [editor] = useLexicalComposerContext()
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey)
  const [isResizing, setIsResizing] = useState(false)
  const [localCaption, setLocalCaption] = useState(caption || '')
  const align = normalizeImageAlign(alignProp)
  const imageRef = useRef(null)
  const containerRef = useRef(null)
  const aspectRatioRef = useRef(1)

  useEffect(() => {
    setLocalCaption(caption || '')
  }, [caption])

  useEffect(() => {
    if (typeof width === 'number' && typeof height === 'number' && height > 0) {
      aspectRatioRef.current = width / height
    }
  }, [width, height])

  const onDelete = useCallback(
    (event) => {
      if (isResizing) return false

      if (isSelected && $isNodeSelection($getSelection())) {
        event.preventDefault()
        return editor.dispatchCommand(DELETE_IMAGE_COMMAND, nodeKey)
      }

      return false
    },
    [editor, isResizing, isSelected, nodeKey],
  )

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        CLICK_COMMAND,
        (event) => {
          const target = event.target
          if (
            target === imageRef.current ||
            imageRef.current?.contains(target) ||
            containerRef.current?.contains(target)
          ) {
            if (event.shiftKey) {
              setSelected(!isSelected)
            } else {
              clearSelection()
              setSelected(true)
            }
            return true
          }
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW,
      ),
    )
  }, [clearSelection, editor, isSelected, onDelete, setSelected])

  const updateSize = useCallback(
    (nextWidth) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey)
        if (!$isImageNode(node)) return

        const maxWidth = Math.min(
          MAX_IMAGE_WIDTH,
          containerRef.current?.parentElement?.clientWidth || MAX_IMAGE_WIDTH,
        )
        const clampedWidth = clampImageWidth(nextWidth, maxWidth)
        const nextHeight = Math.round(clampedWidth / aspectRatioRef.current)
        node.setWidthAndHeight(clampedWidth, nextHeight)
      })
    },
    [editor, nodeKey],
  )

  const setAlign = useCallback(
    (nextAlign) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey)
        if ($isImageNode(node)) {
          node.setAlign(nextAlign)
        }
      })
    },
    [editor, nodeKey],
  )

  const onResizeStart = useCallback(
    (event, direction) => {
      event.preventDefault()
      event.stopPropagation()

      const startX = event.clientX
      const startWidth =
        typeof width === 'number'
          ? width
          : imageRef.current?.getBoundingClientRect().width || MIN_IMAGE_WIDTH

      if (imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect()
        if (rect.height > 0) {
          aspectRatioRef.current = rect.width / rect.height
        }
      }

      setIsResizing(true)
      clearSelection()
      setSelected(true)

      const onMove = (moveEvent) => {
        const delta =
          direction === 'left'
            ? startX - moveEvent.clientX
            : moveEvent.clientX - startX
        updateSize(startWidth + delta)
      }

      const onUp = () => {
        setIsResizing(false)
        document.removeEventListener('pointermove', onMove)
        document.removeEventListener('pointerup', onUp)
      }

      document.addEventListener('pointermove', onMove)
      document.addEventListener('pointerup', onUp)
    },
    [clearSelection, setSelected, updateSize, width],
  )

  const commitCaption = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isImageNode(node)) {
        node.setCaption(localCaption)
      }
    })
  }

  const displayWidth = width === 'inherit' ? undefined : width
  const displayHeight = height === 'inherit' ? undefined : height
  const showControls = isSelected || isResizing

  return (
    <span
      className={cn(
        'omid-editor-image-align block w-full',
        align === 'left' && 'omid-editor-image-align-left',
        align === 'center' && 'omid-editor-image-align-center',
        align === 'right' && 'omid-editor-image-align-right',
      )}
      data-align={align}
    >
      <span
        ref={containerRef}
        draggable={false}
        className={cn(
          'omid-editor-image-wrapper group relative my-3 inline-block max-w-full',
          showControls && 'omid-editor-image-selected',
        )}
      >
        {showControls ? (
          <span
            role="toolbar"
            aria-label="Image alignment"
            className="omid-editor-image-align-toolbar"
            onMouseDown={(event) => event.preventDefault()}
          >
            {ALIGN_OPTIONS.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                type="button"
                aria-label={label}
                aria-pressed={align === value}
                title={label}
                className={cn(
                  'omid-editor-image-align-btn',
                  align === value && 'is-active',
                )}
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  setAlign(value)
                }}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            ))}
          </span>
        ) : null}

        <img
          ref={imageRef}
          src={src}
          alt={altText}
          width={displayWidth}
          height={displayHeight}
          draggable={false}
          className={cn(
            'omid-editor-image-media block h-auto max-w-full rounded-xl object-cover',
            'border border-slate-200 bg-slate-50 dark:border-slate-700',
          )}
          style={{
            width: displayWidth ? `${displayWidth}px` : '100%',
            maxWidth: '100%',
            height: 'auto',
          }}
        />

        {showControls ? (
          <>
            <span
              role="presentation"
              onPointerDown={(event) => onResizeStart(event, 'left')}
              className="omid-editor-image-handle omid-editor-image-handle-left"
            />
            <span
              role="presentation"
              onPointerDown={(event) => onResizeStart(event, 'right')}
              className="omid-editor-image-handle omid-editor-image-handle-right"
            />
          </>
        ) : null}

        <input
          type="text"
          value={localCaption}
          placeholder="Add a caption (optional)"
          aria-label="Image caption"
          onMouseDown={(event) => event.stopPropagation()}
          onChange={(event) => setLocalCaption(event.target.value)}
          onBlur={commitCaption}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              event.currentTarget.blur()
            }
          }}
          className={cn(
            'omid-editor-image-caption mt-2 w-full rounded-lg border border-transparent bg-transparent px-1 py-1',
            'text-center text-sm text-slate-600 outline-none',
            'placeholder:text-slate-400',
            'focus:border-slate-200 focus:bg-white dark:text-slate-300',
            'dark:focus:border-slate-600 dark:focus:bg-slate-900',
          )}
        />
      </span>
    </span>
  )
}
