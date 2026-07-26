import {
  $applyNodeReplacement,
  createCommand,
  DecoratorNode,
} from 'lexical'
import { FileComponent } from './FileComponent'

export const INSERT_FILE_COMMAND = createCommand('INSERT_FILE_COMMAND')

export class FileNode extends DecoratorNode {
  __name
  __size
  __mimeType
  __src

  static getType() {
    return 'file'
  }

  static clone(node) {
    return new FileNode(
      node.__name,
      node.__size,
      node.__mimeType,
      node.__src,
      node.__key,
    )
  }

  constructor(name, size = 0, mimeType = '', src = '', key) {
    super(key)
    this.__name = name
    this.__size = size
    this.__mimeType = mimeType
    this.__src = src
  }

  createDOM(config) {
    const div = document.createElement('div')
    div.className = config.theme?.file || 'omid-editor-file'
    return div
  }

  updateDOM() {
    return false
  }

  decorate() {
    return (
      <FileComponent
        nodeKey={this.getKey()}
        name={this.__name}
        size={this.__size}
        mimeType={this.__mimeType}
        src={this.__src}
      />
    )
  }

  static importJSON(serialized) {
    return $createFileNode(serialized)
  }

  exportJSON() {
    return {
      type: 'file',
      version: 1,
      name: this.__name,
      size: this.__size,
      mimeType: this.__mimeType,
      src: this.__src,
    }
  }

  exportDOM() {
    const a = document.createElement('a')
    a.href = this.__src
    a.download = this.__name
    a.textContent = this.__name
    a.setAttribute('data-omid-file', 'true')
    return { element: a }
  }

  isInline() {
    return false
  }
}

export function $createFileNode({
  name,
  size = 0,
  mimeType = '',
  src = '',
}) {
  return $applyNodeReplacement(new FileNode(name, size, mimeType, src))
}

export function $isFileNode(node) {
  return node instanceof FileNode
}
