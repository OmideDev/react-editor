import {
  $applyNodeReplacement,
  $getNodeByKey,
  createCommand,
  DecoratorNode,
} from 'lexical'
import { ImageComponent } from './ImageComponent'

export const INSERT_IMAGE_COMMAND = createCommand('INSERT_IMAGE_COMMAND')
export const DELETE_IMAGE_COMMAND = createCommand('DELETE_IMAGE_COMMAND')

function $convertImageElement(domNode) {
  if (domNode instanceof HTMLImageElement) {
    const { src, alt, width, height } = domNode
    if (!src) return null

    return {
      node: $createImageNode({
        src,
        altText: alt || '',
        width: width || 'inherit',
        height: height || 'inherit',
      }),
    }
  }

  return null
}

export class ImageNode extends DecoratorNode {
  __src
  __altText
  __width
  __height
  __caption

  static getType() {
    return 'image'
  }

  static clone(node) {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__width,
      node.__height,
      node.__caption,
      node.__key,
    )
  }

  constructor(
    src,
    altText = '',
    width = 'inherit',
    height = 'inherit',
    caption = '',
    key,
  ) {
    super(key)
    this.__src = src
    this.__altText = altText
    this.__width = width
    this.__height = height
    this.__caption = caption
  }

  createDOM(config) {
    const span = document.createElement('span')
    const theme = config.theme
    const className = theme.image
    if (className) {
      span.className = className
    }
    return span
  }

  updateDOM() {
    return false
  }

  static importDOM() {
    return {
      img: () => ({
        conversion: $convertImageElement,
        priority: 0,
      }),
    }
  }

  exportDOM() {
    const img = document.createElement('img')
    img.setAttribute('src', this.__src)
    img.setAttribute('alt', this.__altText)

    if (this.__width !== 'inherit') {
      img.setAttribute('width', String(this.__width))
    }
    if (this.__height !== 'inherit') {
      img.setAttribute('height', String(this.__height))
    }

    if (this.__caption) {
      const figure = document.createElement('figure')
      const figcaption = document.createElement('figcaption')
      figcaption.textContent = this.__caption
      figure.append(img, figcaption)
      return { element: figure }
    }

    return { element: img }
  }

  static importJSON(serializedNode) {
    return $createImageNode({
      src: serializedNode.src,
      altText: serializedNode.altText,
      width: serializedNode.width,
      height: serializedNode.height,
      caption: serializedNode.caption,
    }).updateFromJSON(serializedNode)
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
      caption: this.__caption,
      type: 'image',
      version: 1,
    }
  }

  getSrc() {
    return this.__src
  }

  getAltText() {
    return this.__altText
  }

  getWidth() {
    return this.__width
  }

  getHeight() {
    return this.__height
  }

  getCaption() {
    return this.__caption
  }

  setAltText(altText) {
    const writable = this.getWritable()
    writable.__altText = altText
  }

  setWidthAndHeight(width, height) {
    const writable = this.getWritable()
    writable.__width = width
    writable.__height = height
  }

  setCaption(caption) {
    const writable = this.getWritable()
    writable.__caption = caption
  }

  setSrc(src) {
    const writable = this.getWritable()
    writable.__src = src
  }

  decorate() {
    return (
      <ImageComponent
        src={this.__src}
        altText={this.__altText}
        width={this.__width}
        height={this.__height}
        caption={this.__caption}
        nodeKey={this.getKey()}
      />
    )
  }

  isInline() {
    return false
  }

  isKeyboardSelectable() {
    return true
  }
}

export function $createImageNode({
  src,
  altText = '',
  width = 'inherit',
  height = 'inherit',
  caption = '',
}) {
  return $applyNodeReplacement(
    new ImageNode(src, altText, width, height, caption),
  )
}

export function $isImageNode(node) {
  return node instanceof ImageNode
}

export function $getImageNodeByKey(key) {
  const node = $getNodeByKey(key)
  return $isImageNode(node) ? node : null
}
