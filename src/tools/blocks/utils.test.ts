import { describe, test, expect, spyOn, beforeEach, afterEach } from 'bun:test'
import { convertBlockChildrenToMarkdown, convertBlockToMarkdown } from '@/tools/blocks/utils'
import type { ListBlockChildrenResponse, FullOrPartialBlockObjectResponse } from '@/tools/blocks'
import * as markdown from '@/utils/markdown'

describe('convertBlockChildrenToMarkdown', () => {
  test('should include pagination info if available', () => {
    const response: ListBlockChildrenResponse = {
      results: [
        {
          id: 'block1',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ plain_text: 'Test', type: 'text', text: { content: 'Test' } }]
          }
        } as any
      ],
      has_more: true,
      next_cursor: 'abc123',
      object: 'list',
      type: 'block',
      block: {} as any
    }

    const result = convertBlockChildrenToMarkdown(response)

    expect(result).toContain('> More results available')
    expect(result).toContain('> Next cursor: `abc123`')
  })
})

describe('convertBlockToMarkdown', () => {
  let extractRichTextSpy: ReturnType<typeof spyOn>
  let escapeTableCellSpy: ReturnType<typeof spyOn>

  beforeEach(() => {
    // Setup spies before each test
    extractRichTextSpy = spyOn(markdown, 'extractRichText').mockImplementation(() => 'mocked rich text')
    escapeTableCellSpy = spyOn(markdown, 'escapeTableCell').mockImplementation((text) => text)
  })

  afterEach(() => {
    // Clean up spies after each test
    extractRichTextSpy.mockRestore()
    escapeTableCellSpy.mockRestore()
  })

  test('should handle empty or null block', () => {
    // @ts-expect-error Testing null input handling
    expect(convertBlockToMarkdown(null)).toBe('')
    // @ts-expect-error Testing undefined input handling
    expect(convertBlockToMarkdown(undefined)).toBe('')
  })

  test('should handle non-full blocks', () => {
    const block = {
      id: 'block1',
      type: 'paragraph'
    } as FullOrPartialBlockObjectResponse

    const result = convertBlockToMarkdown(block)

    expect(result).toContain('```json')
  })

  test('should convert paragraph', () => {
    const block = {
      id: 'block1',
      type: 'paragraph',
      paragraph: {
        rich_text: [{ plain_text: 'Test', type: 'text', text: { content: 'Test' } }]
      },
      object: 'block',
    } as any

    convertBlockToMarkdown(block)

    expect(extractRichTextSpy).toHaveBeenCalledWith(block.paragraph.rich_text)
  })

  test('should convert heading_1', () => {
    const block = {
      id: 'block1',
      type: 'heading_1',
      heading_1: {
        rich_text: [{ plain_text: 'Heading', type: 'text', text: { content: 'Heading' } }]
      },
      object: 'block',
    } as any

    const result = convertBlockToMarkdown(block)

    expect(result).toContain('# mocked rich text')
  })

  test('should convert heading_2', () => {
    const block = {
      id: 'block1',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ plain_text: 'Heading', type: 'text', text: { content: 'Heading' } }]
      },
      object: 'block',
    } as any

    const result = convertBlockToMarkdown(block)

    expect(result).toContain('## mocked rich text')
  })

  test('should convert heading_3', () => {
    const block = {
      id: 'block1',
      type: 'heading_3',
      heading_3: {
        rich_text: [{ plain_text: 'Heading', type: 'text', text: { content: 'Heading' } }]
      },
      object: 'block',
    } as any

    const result = convertBlockToMarkdown(block)

    expect(result).toContain('### mocked rich text')
  })

  test('should convert bulleted_list_item', () => {
    const block = {
      id: 'block1',
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [{ plain_text: 'Item', type: 'text', text: { content: 'Item' } }]
      },
      object: 'block',
    } as any

    const result = convertBlockToMarkdown(block)

    expect(result).toContain('- mocked rich text')
  })

  test('should convert numbered_list_item', () => {
    const block = {
      id: 'block1',
      type: 'numbered_list_item',
      numbered_list_item: {
        rich_text: [{ plain_text: 'Item', type: 'text', text: { content: 'Item' } }]
      },
      object: 'block',
    } as any

    const result = convertBlockToMarkdown(block)

    expect(result).toContain('1. mocked rich text')
  })

  test('should convert to_do item unchecked', () => {
    const block = {
      id: 'block1',
      type: 'to_do',
      to_do: {
        rich_text: [{ plain_text: 'Task', type: 'text', text: { content: 'Task' } }],
        checked: false
      },
      object: 'block',
    } as any

    const result = convertBlockToMarkdown(block)

    expect(result).toContain('- [ ] mocked rich text')
  })

  test('should convert to_do item checked', () => {
    const block = {
      id: 'block1',
      type: 'to_do',
      to_do: {
        rich_text: [{ plain_text: 'Task', type: 'text', text: { content: 'Task' } }],
        checked: true
      },
      object: 'block',
    } as any

    const result = convertBlockToMarkdown(block)

    expect(result).toContain('- [x] mocked rich text')
  })

  test('should convert toggle', () => {
    const block = {
      id: 'block1',
      type: 'toggle',
      toggle: {
        rich_text: [{ plain_text: 'Toggle', type: 'text', text: { content: 'Toggle' } }]
      },
      object: 'block',
    } as any

    const result = convertBlockToMarkdown(block)

    expect(result).toContain('<details>')
    expect(result).toContain('<summary>mocked rich text</summary>')
  })

  test('should convert child_page', () => {
    const block = {
      id: 'block1',
      type: 'child_page',
      child_page: {
        title: 'Page Title'
      },
      object: 'block',
    } as any

    const result = convertBlockToMarkdown(block)

    expect(result).toContain('**Child Page**: Page Title')
  })

  test('should convert image with external url', () => {
    const block = {
      id: 'block1',
      type: 'image',
      image: {
        type: 'external',
        external: { url: 'https://example.com/image.jpg' },
        caption: [{ plain_text: 'Caption', type: 'text', text: { content: 'Caption' } }]
      },
      object: 'block',
    } as any

    const result = convertBlockToMarkdown(block)

    expect(result).toContain('![mocked rich text](https://example.com/image.jpg)')
  })

  test('should convert image with file url', () => {
    const block = {
      id: 'block1',
      type: 'image',
      image: {
        type: 'file',
        file: { url: 'https://notion.so/image.jpg' },
        caption: [{ plain_text: 'Caption', type: 'text', text: { content: 'Caption' } }]
      },
      object: 'block',
    } as any

    const result = convertBlockToMarkdown(block)

    expect(result).toContain('![mocked rich text](https://notion.so/image.jpg)')
  })

  test('should convert divider', () => {
    const block = {
      id: 'block1',
      type: 'divider',
      divider: {},
      object: 'block',
    } as any

    const result = convertBlockToMarkdown(block)

    expect(result).toBe('---')
  })

  test('should convert quote', () => {
    const block = {
      id: 'block1',
      type: 'quote',
      quote: {
        rich_text: [{ plain_text: 'Quote', type: 'text', text: { content: 'Quote' } }]
      },
      object: 'block',
    } as any

    const result = convertBlockToMarkdown(block)

    expect(result).toContain('> mocked rich text')
  })

  test('should convert code', () => {
    const block = {
      id: 'block1',
      type: 'code',
      code: {
        rich_text: [{ plain_text: 'Code', type: 'text', text: { content: 'Code' } }],
        language: 'javascript'
      },
      object: 'block',
    } as any

    const result = convertBlockToMarkdown(block)

    expect(result).toContain('```javascript')
    expect(result).toContain('mocked rich text')
    expect(result).toContain('```')
  })

  test('should convert table_row', () => {
    const block = {
      id: 'block1',
      type: 'table_row',
      table_row: {
        cells: [
          [{ plain_text: 'Cell 1', type: 'text', text: { content: 'Cell 1' } }],
          [{ plain_text: 'Cell 2', type: 'text', text: { content: 'Cell 2' } }]
        ]
      },
      object: 'block',
    } as any

    convertBlockToMarkdown(block)

    expect(extractRichTextSpy).toHaveBeenCalledTimes(2)
    expect(escapeTableCellSpy).toHaveBeenCalledTimes(2)
  })
})
