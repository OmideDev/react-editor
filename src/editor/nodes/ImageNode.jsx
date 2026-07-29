import {
  $applyNodeReplacement,
  $getNodeByKey,
  createCommand,
  DecoratorNode,
} from 'lexical'
import { ImageComponent } from './ImageComponent'

export const INSERT_IMAGE_COMMAND = createCommand('INSERT_IMAGE_COMMAND')
export const DELETE_IMAGE_COMMAND = createCommand('DELETE_IMAGE_COMMAND')

/** @typedef {'left' | 'center' | 'right'} ImageAlign */

export const IMAGE_ALIGNS = /** @type {const} */ (['left', 'center', 'right'])

/**
 * @param {unknown} value
 * @returns {ImageAlign}
 */
export function normalizeImageAlign(value) {
  if (value === 'center' || value === 'right' || value === 'left') return value
  return 'left'
}

function $convertImageElement(domNode) {
  if (domNode instanceof HTMLImageElement) {
    const { src, alt, width, height } = domNode
    if (!src) return null

    const parent = domNode.parentElement
    const alignFromStyle =
      parent?.style?.textAlign ||
      domNode.getAttribute('data-align') ||
      parent?.getAttribute?.('data-align')

    return {
      node: $createImageNode({
        src,
        altText: alt || '',
        width: width || 'inherit',
        height: height || 'inherit',
        align: normalizeImageAlign(alignFromStyle),
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
  __align

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
      node.__align,
      node.__key,
    )
  }

  constructor(
    src,
    altText = '',
    width = 'inherit',
    height = 'inherit',
    caption = '',
    align = 'left',
    key,
  ) {
    super(key)
    this.__src = src
    this.__altText = altText
    this.__width = width
    this.__height = height
    this.__caption = caption
    this.__align = normalizeImageAlign(align)
  }

  createDOM(config) {
    const span = document.createElement('span')
    const theme = config.theme
    const className = theme.image
    if (className) {
      span.className = className
    }
    span.setAttribute('data-align', this.__align)
    return span
  }

  updateDOM(prevNode, dom) {
    if (prevNode.__align !== this.__align) {
      dom.setAttribute('data-align', this.__align)
    }
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
    img.setAttribute('data-align', this.__align)

    if (this.__width !== 'inherit') {
      img.setAttribute('width', String(this.__width))
    }
    if (this.__height !== 'inherit') {
      img.setAttribute('height', String(this.__height))
    }

    const wrap = document.createElement(this.__caption ? 'figure' : 'div')
    wrap.setAttribute('data-omid-image', 'true')
    wrap.setAttribute('data-align', this.__align)
    wrap.style.textAlign = this.__align
    wrap.appendChild(img)

    if (this.__caption) {
      const figcaption = document.createElement('figcaption')
      figcaption.textContent = this.__caption
      wrap.appendChild(figcaption)
    }

    return { element: wrap }
  }

  static importJSON(serializedNode) {
    return $createImageNode({
      src: serializedNode.src,
      altText: serializedNode.altText,
      width: serializedNode.width,
      height: serializedNode.height,
      caption: serializedNode.caption,
      align: serializedNode.align,
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
      align: this.__align,
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

  getAlign() {
    return this.__align
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

  setAlign(align) {
    const writable = this.getWritable()
    writable.__align = normalizeImageAlign(align)
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
        align={this.__align}
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
  align = 'left',
}) {
  return $applyNodeReplacement(
    new ImageNode(src, altText, width, height, caption, align),
  )
}

export function $isImageNode(node) {
  return node instanceof ImageNode
}

export function $getImageNodeByKey(key) {
  const node = $getNodeByKey(key)
  return $isImageNode(node) ? node : null
}
