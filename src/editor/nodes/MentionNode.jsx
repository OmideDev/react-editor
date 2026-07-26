import { $applyNodeReplacement, DecoratorNode } from 'lexical'

/**
 * Inline mention chip (@username).
 */
export class MentionNode extends DecoratorNode {
  __mentionId
  __username
  __name

  static getType() {
    return 'mention'
  }

  static clone(node) {
    return new MentionNode(
      {
        id: node.__mentionId,
        username: node.__username,
        name: node.__name,
      },
      node.__key,
    )
  }

  constructor({ id, username, name }, key) {
    super(key)
    this.__mentionId = id
    this.__username = username
    this.__name = name || username
  }

  createDOM(config) {
    const el = document.createElement('span')
    el.className = config.theme?.mention || 'omid-editor-mention'
    el.setAttribute('data-mention', this.__username)
    el.setAttribute('data-mention-id', String(this.__mentionId))
    return el
  }

  updateDOM() {
    return false
  }

  decorate() {
    return (
      <span className="omid-editor-mention" contentEditable={false}>
        @{this.__username}
      </span>
    )
  }

  static importJSON(serialized) {
    return $createMentionNode({
      id: serialized.id,
      username: serialized.username,
      name: serialized.name,
    })
  }

  exportJSON() {
    return {
      type: 'mention',
      version: 1,
      id: this.__mentionId,
      username: this.__username,
      name: this.__name,
    }
  }

  exportDOM() {
    const el = document.createElement('span')
    el.setAttribute('data-mention', this.__username)
    el.setAttribute('data-mention-id', String(this.__mentionId))
    el.className = 'omid-editor-mention'
    el.textContent = `@${this.__username}`
    return { element: el }
  }

  isInline() {
    return true
  }

  isKeyboardSelectable() {
    return true
  }

  getTextContent() {
    return `@${this.__username}`
  }

  getMention() {
    return {
      id: this.__mentionId,
      username: this.__username,
      name: this.__name,
    }
  }
}

export function $createMentionNode(mention) {
  return $applyNodeReplacement(new MentionNode(mention))
}

export function $isMentionNode(node) {
  return node instanceof MentionNode
}
