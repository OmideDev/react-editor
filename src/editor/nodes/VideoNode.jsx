import {
  $applyNodeReplacement,
  $getNodeByKey,
  createCommand,
  DecoratorNode,
} from 'lexical'
import { VideoComponent } from './VideoComponent'

export const INSERT_VIDEO_COMMAND = createCommand('INSERT_VIDEO_COMMAND')

export class VideoNode extends DecoratorNode {
  __src
  __url
  __provider

  static getType() {
    return 'video'
  }

  static clone(node) {
    return new VideoNode(
      node.__src,
      node.__url,
      node.__provider,
      node.__key,
    )
  }

  constructor(src, url = '', provider = 'youtube', key) {
    super(key)
    this.__src = src
    this.__url = url
    this.__provider = provider
  }

  createDOM(config) {
    const div = document.createElement('div')
    div.className = config.theme?.video || 'omid-editor-video'
    return div
  }

  updateDOM() {
    return false
  }

  decorate() {
    return (
      <VideoComponent
        nodeKey={this.getKey()}
        src={this.__src}
        url={this.__url}
        provider={this.__provider}
      />
    )
  }

  static importJSON(serialized) {
    return $createVideoNode(serialized)
  }

  exportJSON() {
    return {
      type: 'video',
      version: 1,
      src: this.__src,
      url: this.__url,
      provider: this.__provider,
    }
  }

  exportDOM() {
    const figure = document.createElement('figure')
    figure.setAttribute('data-omid-video', this.__provider)
    const a = document.createElement('a')
    a.href = this.__url || this.__src
    a.textContent = this.__url || this.__src
    figure.appendChild(a)
    return { element: figure }
  }

  isInline() {
    return false
  }

  setSrc(src) {
    const writable = this.getWritable()
    writable.__src = src
  }

  setUrl(url) {
    const writable = this.getWritable()
    writable.__url = url
  }

  setProvider(provider) {
    const writable = this.getWritable()
    writable.__provider = provider
  }
}

export function $createVideoNode({ src, url = '', provider = 'youtube' }) {
  return $applyNodeReplacement(new VideoNode(src, url, provider))
}

export function $isVideoNode(node) {
  return node instanceof VideoNode
}

export function $getVideoNodeByKey(key) {
  const node = $getNodeByKey(key)
  return $isVideoNode(node) ? node : null
}
