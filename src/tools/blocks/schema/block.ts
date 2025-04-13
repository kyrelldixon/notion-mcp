import { z } from 'zod'
import { richTextArraySchema } from './rich-text'

// Basic paragraph block schema
const paragraphBlockSchema = z.object({
  type: z.literal('paragraph'),
  paragraph: z.object({
    rich_text: richTextArraySchema
      .describe('Rich text in the paragraph')
  })
}).describe('Paragraph block type')

// Heading 1 block schema
const heading1BlockSchema = z.object({
  type: z.literal('heading_1'),
  heading_1: z.object({
    rich_text: richTextArraySchema
      .describe('Rich text in the heading')
  })
}).describe('Heading 1 block type')

// Heading 2 block schema
const heading2BlockSchema = z.object({
  type: z.literal('heading_2'),
  heading_2: z.object({
    rich_text: richTextArraySchema
      .describe('Rich text in the heading')
  })
}).describe('Heading 2 block type')

// Heading 3 block schema
const heading3BlockSchema = z.object({
  type: z.literal('heading_3'),
  heading_3: z.object({
    rich_text: richTextArraySchema
      .describe('Rich text in the heading')
  })
}).describe('Heading 3 block type')

// Bulleted list item block schema
const bulletedListItemBlockSchema = z.object({
  type: z.literal('bulleted_list_item'),
  bulleted_list_item: z.object({
    rich_text: richTextArraySchema
      .describe('Rich text in the bulleted list item')
  })
}).describe('Bulleted list item block type')

// Numbered list item block schema
const numberedListItemBlockSchema = z.object({
  type: z.literal('numbered_list_item'),
  numbered_list_item: z.object({
    rich_text: richTextArraySchema
      .describe('Rich text in the numbered list item')
  })
}).describe('Numbered list item block type')

// To-do block schema
const todoBlockSchema = z.object({
  type: z.literal('to_do'),
  to_do: z.object({
    rich_text: richTextArraySchema
      .describe('Rich text in the to-do item'),
    checked: z.boolean().optional()
      .describe('Whether the to-do is checked')
  })
}).describe('To-do block type')

// Toggle block schema
const toggleBlockSchema = z.object({
  type: z.literal('toggle'),
  toggle: z.object({
    rich_text: richTextArraySchema
      .describe('Rich text in the toggle')
  })
}).describe('Toggle block type')

// Code block schema
const codeBlockSchema = z.object({
  type: z.literal('code'),
  code: z.object({
    rich_text: richTextArraySchema
      .describe('Rich text containing the code'),
    language: z.string()
      .describe('Programming language of the code block'),
    caption: richTextArraySchema.optional()
      .describe('Optional caption for the code block')
  })
}).describe('Code block type')

// Quote block schema
const quoteBlockSchema = z.object({
  type: z.literal('quote'),
  quote: z.object({
    rich_text: richTextArraySchema
      .describe('Rich text in the quote')
  })
}).describe('Quote block type')

// Callout block schema
const calloutBlockSchema = z.object({
  type: z.literal('callout'),
  callout: z.object({
    rich_text: richTextArraySchema
      .describe('Rich text in the callout'),
    icon: z.union([
      z.object({
        emoji: z.string().describe('Emoji icon')
      }),
      z.object({
        external: z.object({
          url: z.string().url().describe('URL of external icon')
        })
      })
    ]).optional().describe('Icon for the callout')
  })
}).describe('Callout block type')

// Divider block schema
const dividerBlockSchema = z.object({
  type: z.literal('divider'),
  divider: z.object({}).describe('Divider block')
}).describe('Divider block type')

// Table of contents block schema
const tableOfContentsBlockSchema = z.object({
  type: z.literal('table_of_contents'),
  table_of_contents: z.object({}).describe('Table of contents block')
}).describe('Table of contents block type')

// Breadcrumb block schema
const breadcrumbBlockSchema = z.object({
  type: z.literal('breadcrumb'),
  breadcrumb: z.object({}).describe('Breadcrumb navigation block')
}).describe('Breadcrumb block type')

// External file schema for media blocks
const externalFileSchema = z.object({
  type: z.literal('external'),
  external: z.object({
    url: z.string().url().describe('URL of the external file')
  })
}).describe('External file reference')

// Uploaded file schema for media blocks
const uploadedFileSchema = z.object({
  type: z.literal('file'),
  file: z.object({
    url: z.string().url().describe('URL of the uploaded file'),
    expiry_time: z.string().optional().describe('Expiration time of the file URL')
  })
}).describe('Uploaded file reference')

// Combined file schema
const fileSchema = z.union([
  externalFileSchema,
  uploadedFileSchema
]).describe('File reference (external or uploaded)')

// Image block schema
const imageBlockSchema = z.object({
  type: z.literal('image'),
  image: z.object({
    type: z.enum(['external', 'file']),
    external: z.object({
      url: z.string().url()
    }).optional(),
    file: z.object({
      url: z.string().url(),
      expiry_time: z.string().optional()
    }).optional(),
    caption: richTextArraySchema.optional()
      .describe('Optional caption for the image')
  })
}).describe('Image block type')

// Bookmark block schema
const bookmarkBlockSchema = z.object({
  type: z.literal('bookmark'),
  bookmark: z.object({
    url: z.string().url().describe('URL of the bookmark'),
    caption: richTextArraySchema.optional()
      .describe('Optional caption for the bookmark')
  })
}).describe('Bookmark block type')

// Equation block schema
const equationBlockSchema = z.object({
  type: z.literal('equation'),
  equation: z.object({
    expression: z.string().describe('LaTeX expression for the equation')
  })
}).describe('Equation block type')

// Combined block schema for all supported block types
export const blockSchema = z.union([
  paragraphBlockSchema,
  heading1BlockSchema,
  heading2BlockSchema,
  heading3BlockSchema,
  bulletedListItemBlockSchema,
  numberedListItemBlockSchema,
  todoBlockSchema,
  toggleBlockSchema,
  codeBlockSchema,
  quoteBlockSchema,
  calloutBlockSchema,
  dividerBlockSchema,
  tableOfContentsBlockSchema,
  breadcrumbBlockSchema,
  imageBlockSchema,
  bookmarkBlockSchema,
  equationBlockSchema
]).describe('Block object representing a specific type of content')

export type Block = z.infer<typeof blockSchema>
