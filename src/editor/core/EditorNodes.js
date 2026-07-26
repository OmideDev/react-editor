import { HeadingNode } from '@lexical/rich-text'
import { ListItemNode, ListNode } from '@lexical/list'
import { LinkNode } from '@lexical/link'
import { CodeNode, CodeHighlightNode } from '@lexical/code-core'
import { QuoteNode } from '../nodes/QuoteNode'
import { DividerNode } from '../nodes/DividerNode'
import { ImageNode } from '../nodes/ImageNode'
import { TableNode } from '../nodes/TableNode'
import { TableRowNode } from '../nodes/TableRowNode'
import { TableCellNode } from '../nodes/TableCellNode'
import { MentionNode } from '../nodes/MentionNode'
import { VideoNode } from '../nodes/VideoNode'
import { FileNode } from '../nodes/FileNode'

/**
 * Default Lexical nodes for Omid Editor.
 * Consumers can append more via EditorProvider `initialConfig.nodes`.
 */
export const editorNodes = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  DividerNode,
  LinkNode,
  ImageNode,
  CodeNode,
  CodeHighlightNode,
  TableNode,
  TableRowNode,
  TableCellNode,
  MentionNode,
  VideoNode,
  FileNode,
]
