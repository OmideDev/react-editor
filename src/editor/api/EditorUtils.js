import {
  exportJSON,
  exportHTML,
  exportEditorValue,
} from '../utils/export'
import {
  importJSON,
  importHTML,
  importEditorValue,
  resolveEditorValue,
  getInitialEditorState,
} from '../utils/import'
import { parseVideoUrl, isVideoUrl } from '../utils/video'
import {
  countWords,
  countCharacters,
  estimateReadingTimeMinutes,
} from '../utils/stats'
import { canUseDOM } from '../utils/dom'

/**
 * Public utility API for import/export and helpers.
 */
export const EditorUtils = {
  exportJSON,
  exportHTML,
  exportEditorValue,
  importJSON,
  importHTML,
  importEditorValue,
  resolveEditorValue,
  getInitialEditorState,
  parseVideoUrl,
  isVideoUrl,
  countWords,
  countCharacters,
  estimateReadingTimeMinutes,
  canUseDOM,
}

export {
  exportJSON,
  exportHTML,
  exportEditorValue,
  importJSON,
  importHTML,
  importEditorValue,
  resolveEditorValue,
  getInitialEditorState,
  parseVideoUrl,
  isVideoUrl,
  countWords,
  countCharacters,
  estimateReadingTimeMinutes,
  canUseDOM,
}
