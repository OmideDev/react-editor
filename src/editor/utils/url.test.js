import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { isValidUrl, normalizeUrl } from './url.js'

describe('normalizeUrl', () => {
  it('trims surrounding whitespace only', () => {
    assert.equal(normalizeUrl('  https://example.com  '), 'https://example.com')
  })

  it('adds https:// for bare domains', () => {
    assert.equal(normalizeUrl('example.com/path'), 'https://example.com/path')
  })

  it('preserves http(s) and mailto schemes', () => {
    assert.equal(normalizeUrl('http://example.com'), 'http://example.com')
    assert.equal(normalizeUrl('mailto:a@b.com'), 'mailto:a@b.com')
  })

  it('does not strip internal whitespace (validation rejects later)', () => {
    assert.equal(
      normalizeUrl('https://example.com/test Open in new tab Apply'),
      'https://example.com/test Open in new tab Apply',
    )
  })
})

describe('isValidUrl — valid', () => {
  const valid = [
    'https://example.com',
    'http://example.com',
    'https://example.com/products?id=123',
    'https://example.com/search?q=hello%20world',
    'https://example.com/لگ-بگ',
    'https://example.com/%D9%84%DA%AF-%D8%A8%DA%AF',
    'https://zigzagmod.ir/productList/لگ-بگ-lululemon',
    'mailto:user@example.com',
  ]

  for (const url of valid) {
    it(`accepts ${url}`, () => {
      assert.equal(isValidUrl(url), true)
    })
  }

  it('accepts trimmed valid URLs', () => {
    assert.equal(isValidUrl('  https://example.com/path  '), true)
  })
})

describe('isValidUrl — invalid (contaminated / whitespace)', () => {
  const invalid = [
    'https://example.com/test Open in new tab Apply',
    'https://example.com/test Apply',
    'https://example.com/test Open in new tab',
    'https://example.com/test   extra',
    'https://example.com/test\tApply',
    'https://example.com/test\nApply',
    'https://zigzagmod.ir/productList/لگ-بگ-lululemon Open in new tab Apply',
    '',
    '   ',
    'not a url',
    'javascript:alert(1)',
    'ftp://example.com',
  ]

  for (const url of invalid) {
    it(`rejects ${JSON.stringify(url)}`, () => {
      assert.equal(isValidUrl(url), false)
    })
  }
})

describe('link apply pipeline', () => {
  function prepare(raw) {
    const normalized = normalizeUrl(raw)
    if (!isValidUrl(normalized)) return null
    return normalized
  }

  it('keeps clean URLs for apply', () => {
    assert.equal(
      prepare('https://example.com/لگ-بگ'),
      'https://example.com/لگ-بگ',
    )
    assert.equal(
      prepare('https://example.com/search?q=hello%20world'),
      'https://example.com/search?q=hello%20world',
    )
  })

  it('blocks contaminated mobile UI suffixes before apply', () => {
    assert.equal(
      prepare(
        'https://zigzagmod.ir/productList/لگ-بگ-lululemon Open in new tab Apply',
      ),
      null,
    )
    assert.equal(prepare('https://example.com/test Apply'), null)
  })

  it('does not rewrite percent-encoded spaces', () => {
    assert.equal(
      prepare('https://example.com/search?q=hello%20world'),
      'https://example.com/search?q=hello%20world',
    )
  })
})
