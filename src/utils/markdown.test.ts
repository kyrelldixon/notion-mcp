import { describe, test, expect } from 'bun:test'
import { extractRichText, escapeTableCell } from '@/utils/markdown'
import type { RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints"

describe.only('extractRichText', () => {
  test('should return empty string for empty array', () => {
    expect(extractRichText([])).toBe('')
  })

  test('should return empty string for null/undefined input', () => {
    // @ts-expect-error: Testing invalid input handling
    expect(extractRichText(null)).toBe('')
    // @ts-expect-error: Testing invalid input handling
    expect(extractRichText(undefined)).toBe('')
  })

  test('should extract plain text from rich text array', () => {
    const richText: RichTextItemResponse[] = [
      {
        type: 'text',
        text: { content: 'Hello', link: null },
        annotations: {
          bold: false,
          italic: false,
          strikethrough: false,
          underline: false,
          code: false,
          color: 'default'
        },
        plain_text: 'Hello',
        href: null
      },
      {
        type: 'text',
        text: { content: 'World', link: null },
        annotations: {
          bold: false,
          italic: false,
          strikethrough: false,
          underline: false,
          code: false,
          color: 'default'
        },
        plain_text: 'World',
        href: null
      }
    ]

    expect(extractRichText(richText)).toBe('HelloWorld')
  })

  test('should apply bold formatting', () => {
    const richText: RichTextItemResponse[] = [
      {
        type: 'text',
        text: { content: 'Bold', link: null },
        annotations: {
          bold: true,
          italic: false,
          strikethrough: false,
          underline: false,
          code: false,
          color: 'default'
        },
        plain_text: 'Bold',
        href: null
      }
    ]

    expect(extractRichText(richText)).toBe('**Bold**')
  })

  test('should apply italic formatting', () => {
    const richText: RichTextItemResponse[] = [
      {
        type: 'text',
        text: { content: 'Italic', link: null },
        annotations: {
          bold: false,
          italic: true,
          strikethrough: false,
          underline: false,
          code: false,
          color: 'default'
        },
        plain_text: 'Italic',
        href: null
      }
    ]

    expect(extractRichText(richText)).toBe('*Italic*')
  })

  test('should apply code formatting', () => {
    const richText: RichTextItemResponse[] = [
      {
        type: 'text',
        text: { content: 'Code', link: null },
        annotations: {
          bold: false,
          italic: false,
          strikethrough: false,
          underline: false,
          code: true,
          color: 'default'
        },
        plain_text: 'Code',
        href: null
      }
    ]

    expect(extractRichText(richText)).toBe('`Code`')
  })

  test('should apply strikethrough formatting', () => {
    const richText: RichTextItemResponse[] = [
      {
        type: 'text',
        text: { content: 'Strike', link: null },
        annotations: {
          bold: false,
          italic: false,
          strikethrough: true,
          underline: false,
          code: false,
          color: 'default'
        },
        plain_text: 'Strike',
        href: null
      }
    ]

    expect(extractRichText(richText)).toBe('~~Strike~~')
  })

  test('should apply multiple formatting options', () => {
    const richText: RichTextItemResponse[] = [
      {
        type: 'text',
        text: { content: 'Multi', link: null },
        annotations: {
          bold: true,
          italic: true,
          strikethrough: false,
          underline: false,
          code: false,
          color: 'default'
        },
        plain_text: 'Multi',
        href: null
      }
    ]

    expect(extractRichText(richText)).toBe('***Multi***')
  })

  test('should render hyperlinks', () => {
    const richText: RichTextItemResponse[] = [
      {
        type: 'text',
        text: { content: 'Link', link: { url: 'https://example.com' } },
        annotations: {
          bold: false,
          italic: false,
          strikethrough: false,
          underline: false,
          code: false,
          color: 'default'
        },
        plain_text: 'Link',
        href: 'https://example.com'
      }
    ]

    expect(extractRichText(richText)).toBe('[Link](https://example.com)')
  })

  test('should combine multiple formatting with hyperlinks', () => {
    const richText: RichTextItemResponse[] = [
      {
        type: 'text',
        text: { content: 'Bold Link', link: { url: 'https://example.com' } },
        annotations: {
          bold: true,
          italic: false,
          strikethrough: false,
          underline: false,
          code: false,
          color: 'default'
        },
        plain_text: 'Bold Link',
        href: 'https://example.com'
      }
    ]

    expect(extractRichText(richText)).toBe('[**Bold Link**](https://example.com)')
  })
})

describe('escapeTableCell', () => {
  test('should return empty string for null/undefined input', () => {
    expect(escapeTableCell('')).toBe('')
    // @ts-expect-error: Testing invalid input handling
    expect(escapeTableCell(null)).toBe('')
    // @ts-expect-error: Testing invalid input handling
    expect(escapeTableCell(undefined)).toBe('')
  })

  test('should escape pipe characters', () => {
    expect(escapeTableCell('Text|with|pipes')).toBe('Text\\|with\\|pipes')
  })

  test('should replace newlines with spaces', () => {
    expect(escapeTableCell('Line 1\nLine 2')).toBe('Line 1 Line 2')
  })

  test('should escape plus signs', () => {
    expect(escapeTableCell('1+2+3')).toBe('1\\+2\\+3')
  })

  test('should handle combined cases', () => {
    expect(escapeTableCell('Column 1|Column 2\nRow 1+Row 2')).toBe('Column 1\\|Column 2 Row 1\\+Row 2')
  })
})
