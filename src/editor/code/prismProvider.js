/**
 * Internal Prism provider + Lexical code highlighter.
 *
 * Avoids `@lexical/code` / `@lexical/code-prism` — those import
 * `prismjs/components/*` as ESM and throw `Prism is not defined` in Vite.
 *
 * Uses prismjs default build (markup, css, clike, javascript) + code-core.
 */

import {
  $createCodeHighlightNode,
  $isCodeHighlightNode,
  $isCodeNode,
  $plainifyCodeContent,
  CodeHighlightNode,
  CodeNode,
  DEFAULT_CODE_LANGUAGE,
  registerCodeIndentation,
} from '@lexical/code-core'
import { mergeRegister } from '@lexical/utils'
import {
  $createLineBreakNode,
  $createTabNode,
  $createTextNode,
  $getNodeByKey,
  $isLineBreakNode,
  $isTextNode,
  $onUpdate,
  TextNode,
  tokenizeRawText,
} from 'lexical'

let prismPromise = null
let prismInstance = null

export async function loadPrism() {
  if (prismInstance) return prismInstance
  if (prismPromise) return prismPromise

  prismPromise = import('prismjs')
    .then((mod) => {
      const Prism = mod.default || mod
      if (Prism.languages?.javascript) {
        Prism.languages.js = Prism.languages.javascript
      }
      if (Prism.languages?.markup) {
        Prism.languages.html = Prism.languages.markup
        Prism.languages.xml = Prism.languages.markup
        Prism.languages.svg = Prism.languages.markup
      }
      prismInstance = Prism
      return Prism
    })
    .catch((error) => {
      prismPromise = null
      throw error
    })

  return prismPromise
}

function $mapTokensToLexicalStructure(tokens, type) {
  const nodes = []

  for (const token of tokens) {
    if (typeof token === 'string') {
      tokenizeRawText(token, {
        linebreak: () => nodes.push($createLineBreakNode()),
        tab: () => nodes.push($createTabNode()),
        text: (part) => nodes.push($createCodeHighlightNode(part, type)),
      })
      continue
    }

    const { content, alias } = token
    const nextType =
      token.type === 'prefix' && typeof alias === 'string'
        ? alias
        : token.type === 'unchanged'
          ? undefined
          : token.type

    if (typeof content === 'string') {
      nodes.push(...$mapTokensToLexicalStructure([content], nextType))
    } else if (Array.isArray(content)) {
      nodes.push(...$mapTokensToLexicalStructure(content, nextType))
    }
  }

  return nodes
}

export function createOmidPrismTokenizer(Prism) {
  return {
    defaultLanguage: DEFAULT_CODE_LANGUAGE || 'javascript',

    tokenize(code, language) {
      const lang = language || this.defaultLanguage || 'javascript'
      const grammar =
        Prism.languages[lang] ||
        Prism.languages.javascript ||
        Prism.languages.markup

      if (!grammar) return [code]
      return Prism.tokenize(code, grammar)
    },

    $tokenize(codeNode, language) {
      const lang = language || this.defaultLanguage
      if (lang === null) {
        return $plainifyCodeContent(codeNode.getTextContent())
      }
      const tokens = this.tokenize(codeNode.getTextContent(), lang)
      return $mapTokensToLexicalStructure(tokens)
    },
  }
}

function updateCodeGutter(node, editor) {
  const codeElement = editor.getElementByKey(node.getKey())
  if (codeElement === null) return

  const children = node.getChildren()
  let gutter = '1'
  let count = 1
  for (let i = 0; i < children.length; i += 1) {
    if ($isLineBreakNode(children[i])) {
      count += 1
      gutter += `\n${count}`
    }
  }
  codeElement.setAttribute('data-gutter', gutter)
}

function sameHighlightChildren(current, next) {
  if (current.length !== next.length) return false
  for (let i = 0; i < current.length; i += 1) {
    const a = current[i]
    const b = next[i]
    const equal =
      ($isCodeHighlightNode(a) &&
        $isCodeHighlightNode(b) &&
        a.__text === b.__text &&
        a.__highlightType === b.__highlightType) ||
      ($isLineBreakNode(a) && $isLineBreakNode(b)) ||
      (a.getType?.() === 'tab' && b.getType?.() === 'tab')
    if (!equal) return false
  }
  return true
}

function $codeNodeTransform(editor, tokenizer, transformState, node) {
  const { nodesCurrentlyHighlighting } = transformState
  const nodeKey = node.getKey()

  if (node.getLanguage() === undefined && tokenizer.defaultLanguage !== null) {
    node.setLanguage(tokenizer.defaultLanguage)
  }

  if (nodesCurrentlyHighlighting.has(nodeKey)) return
  nodesCurrentlyHighlighting.add(nodeKey)

  if (!transformState.didTransform) {
    transformState.didTransform = true
    $onUpdate(() => {
      transformState.didTransform = false
      nodesCurrentlyHighlighting.clear()
    })
  }

  const currentNode = $getNodeByKey(nodeKey)
  if (!$isCodeNode(currentNode) || !currentNode.isAttached()) return

  const language =
    currentNode.getLanguage() || tokenizer.defaultLanguage || undefined
  const highlightNodes = tokenizer.$tokenize(currentNode, language)
  const prev = currentNode.getChildren()

  if (sameHighlightChildren(prev, highlightNodes)) return

  // Replace all children atomically when highlighting changes.
  for (const child of [...prev]) {
    child.remove()
  }
  currentNode.append(...highlightNodes)
}

function $textNodeTransform(editor, tokenizer, transformState, node) {
  const parentNode = node.getParent()
  if ($isCodeNode(parentNode)) {
    $codeNodeTransform(editor, tokenizer, transformState, parentNode)
  } else if ($isCodeHighlightNode(node)) {
    node.replace($createTextNode(node.__text))
  }
}

/**
 * Register highlighting + indentation without loading @lexical/code-prism.
 */
export function registerOmidCodeHighlighting(editor, tokenizer) {
  if (!editor.hasNodes([CodeNode, CodeHighlightNode])) {
    throw new Error(
      'CodePlugin: CodeNode or CodeHighlightNode is not registered.',
    )
  }

  const transformState = {
    didTransform: false,
    nodesCurrentlyHighlighting: new Set(),
  }

  const registrations = [
    editor.registerNodeTransform(CodeNode, (node) =>
      $codeNodeTransform(editor, tokenizer, transformState, node),
    ),
    editor.registerNodeTransform(TextNode, (node) => {
      if ($isTextNode(node)) {
        $textNodeTransform(editor, tokenizer, transformState, node)
      }
    }),
    editor.registerNodeTransform(CodeHighlightNode, (node) =>
      $textNodeTransform(editor, tokenizer, transformState, node),
    ),
    registerCodeIndentation(editor),
  ]

  if (editor._headless !== true) {
    registrations.push(
      editor.registerMutationListener(
        CodeNode,
        (mutations) => {
          editor.getEditorState().read(() => {
            for (const [key, type] of mutations) {
              if (type === 'destroyed') continue
              const node = $getNodeByKey(key)
              if (node !== null) updateCodeGutter(node, editor)
            }
          })
        },
        { skipInitialization: false },
      ),
    )
  }

  return mergeRegister(...registrations)
}
