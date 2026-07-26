import { useCallback, useEffect, useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from '@lexical/list'
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from 'lexical'
import { $getBlockType, SET_HEADING_COMMAND } from '../plugins/HeadingPlugin'
import { $getListType } from '../plugins/ListPlugin'
import {
  $getTextStyles,
  SET_BACKGROUND_COLOR_COMMAND,
  SET_HIGHLIGHT_COMMAND,
  SET_TEXT_COLOR_COMMAND,
} from '../plugins/TextStylePlugin'
import {
  $isInQuote,
  INSERT_DIVIDER_COMMAND,
  INSERT_QUOTE_COMMAND,
} from '../plugins/BlockPlugin'
import { $getLinkData } from '../plugins/LinkPlugin'
import { TOGGLE_LINK_COMMAND } from '@lexical/link'

const initialFormats = {
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
}

/**
 * Shared Lexical command helpers + live selection format state for the toolbar.
 */
export function useEditorCommands() {
  const [editor] = useLexicalComposerContext()
  const [formats, setFormats] = useState(initialFormats)
  const [blockType, setBlockType] = useState('paragraph')
  const [listType, setListType] = useState(null)
  const [textColor, setTextColorState] = useState('')
  const [backgroundColor, setBackgroundColorState] = useState('')
  const [isQuote, setIsQuote] = useState(false)
  const [linkState, setLinkState] = useState({
    isLink: false,
    url: '',
    openInNewTab: true,
  })

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection()

        if (!$isRangeSelection(selection)) {
          setFormats(initialFormats)
          setBlockType('paragraph')
          setListType(null)
          setTextColorState('')
          setBackgroundColorState('')
          setIsQuote(false)
          setLinkState({ isLink: false, url: '', openInNewTab: true })
          return
        }

        setFormats({
          bold: selection.hasFormat('bold'),
          italic: selection.hasFormat('italic'),
          underline: selection.hasFormat('underline'),
          strikethrough: selection.hasFormat('strikethrough'),
        })
        setListType($getListType())
        setBlockType($getBlockType())
        setIsQuote($isInQuote())
        setLinkState($getLinkData())

        const styles = $getTextStyles()
        setTextColorState(styles.color)
        setBackgroundColorState(styles.backgroundColor)
      })
    })
  }, [editor])

  const toggleBold = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
  }, [editor])

  const toggleItalic = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
  }, [editor])

  const toggleUnderline = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
  }, [editor])

  const toggleStrike = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
  }, [editor])

  const setHeading = useCallback(
    (tag) => {
      editor.dispatchCommand(SET_HEADING_COMMAND, tag)
    },
    [editor],
  )

  const toggleBulletList = useCallback(() => {
    if (listType === 'bullet') {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
    } else {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
    }
  }, [editor, listType])

  const toggleNumberList = useCallback(() => {
    if (listType === 'number') {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
    } else {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
    }
  }, [editor, listType])

  const toggleCheckList = useCallback(() => {
    if (listType === 'check') {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
    } else {
      editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)
    }
  }, [editor, listType])

  const setTextColor = useCallback(
    (color) => {
      editor.dispatchCommand(SET_TEXT_COLOR_COMMAND, color || null)
    },
    [editor],
  )

  const setHighlight = useCallback(
    (color) => {
      editor.dispatchCommand(SET_HIGHLIGHT_COMMAND, color || null)
    },
    [editor],
  )

  const setBackgroundColor = useCallback(
    (color) => {
      editor.dispatchCommand(SET_BACKGROUND_COLOR_COMMAND, color || null)
    },
    [editor],
  )

  const clearTextColor = useCallback(() => {
    editor.dispatchCommand(SET_TEXT_COLOR_COMMAND, null)
  }, [editor])

  const clearHighlight = useCallback(() => {
    editor.dispatchCommand(SET_HIGHLIGHT_COMMAND, null)
  }, [editor])

  const clearBackgroundColor = useCallback(() => {
    editor.dispatchCommand(SET_BACKGROUND_COLOR_COMMAND, null)
  }, [editor])

  const toggleQuote = useCallback(() => {
    editor.dispatchCommand(INSERT_QUOTE_COMMAND, undefined)
  }, [editor])

  const insertDivider = useCallback(() => {
    editor.dispatchCommand(INSERT_DIVIDER_COMMAND, undefined)
  }, [editor])

  const applyLink = useCallback(
    ({ url, openInNewTab = true }) => {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
        url,
        target: openInNewTab ? '_blank' : null,
        rel: openInNewTab ? 'noopener noreferrer' : null,
      })
    },
    [editor],
  )

  const removeLink = useCallback(() => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
  }, [editor])

  const undo = useCallback(() => {
    editor.dispatchCommand(UNDO_COMMAND, undefined)
  }, [editor])

  const redo = useCallback(() => {
    editor.dispatchCommand(REDO_COMMAND, undefined)
  }, [editor])

  return {
    editor,
    blockType,
    listType,
    textColor,
    backgroundColor,
    highlightColor: backgroundColor,
    isBold: formats.bold,
    isItalic: formats.italic,
    isUnderline: formats.underline,
    isStrike: formats.strikethrough,
    isBulletList: listType === 'bullet',
    isNumberList: listType === 'number',
    isCheckList: listType === 'check',
    isQuote,
    isLink: linkState.isLink,
    linkUrl: linkState.url,
    linkOpenInNewTab: linkState.openInNewTab,
    toggleBold,
    toggleItalic,
    toggleUnderline,
    toggleStrike,
    setHeading,
    toggleBulletList,
    toggleNumberList,
    toggleCheckList,
    setTextColor,
    setHighlight,
    setBackgroundColor,
    clearTextColor,
    clearHighlight,
    clearBackgroundColor,
    toggleQuote,
    insertDivider,
    applyLink,
    removeLink,
    undo,
    redo,
  }
}
