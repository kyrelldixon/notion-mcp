import { z } from 'zod'

// Colors available in Notion
const colorEnum = z.enum([
  'default', 'gray', 'brown', 'orange', 'yellow', 'green', 'blue',
  'purple', 'pink', 'red', 'gray_background', 'brown_background',
  'orange_background', 'yellow_background', 'green_background',
  'blue_background', 'purple_background', 'pink_background', 'red_background'
]).describe('Color styling for the text')

// Annotations object schema
const annotationsSchema = z.object({
  bold: z.boolean().default(false).describe('Whether the text is bolded'),
  italic: z.boolean().default(false).describe('Whether the text is italicized'),
  strikethrough: z.boolean().default(false).describe('Whether the text is struck through'),
  underline: z.boolean().default(false).describe('Whether the text is underlined'),
  code: z.boolean().default(false).describe('Whether the text is code style'),
  color: colorEnum.default('default').describe('Color of the text')
}).describe('Styling options for rich text')

// Link object schema for text type
const linkSchema = z.object({
  type: z.literal('url'),
  url: z.string().url().describe('URL for the link')
}).describe('Link information for text content')

// Text type schema
const textSchema = z.object({
  type: z.literal('text'),
  text: z.object({
    content: z.string().describe('The actual text content'),
    link: z.union([linkSchema, z.null()]).optional().describe('Optional link information')
  }),
  annotations: annotationsSchema.optional(),
  plain_text: z.string().optional().describe('Plain text without annotations'),
  href: z.union([z.string().url(), z.null()]).optional().describe('URL of any link in this text')
}).describe('Text content with optional styling and links')

// Equation type schema
const equationSchema = z.object({
  type: z.literal('equation'),
  equation: z.object({
    expression: z.string().describe('LaTeX expression for the equation')
  }),
  annotations: annotationsSchema.optional(),
  plain_text: z.string().optional().describe('Plain text representation of the equation'),
  href: z.union([z.string().url(), z.null()]).optional()
}).describe('LaTeX equation content')

// User mention schema
const userMentionSchema = z.object({
  type: z.literal('user'),
  user: z.object({
    object: z.literal('user'),
    id: z.string().describe('ID of the mentioned user')
  })
}).describe('User mention in rich text')

// Page mention schema
const pageMentionSchema = z.object({
  type: z.literal('page'),
  page: z.object({
    id: z.string().describe('ID of the mentioned page')
  })
}).describe('Page mention in rich text')

// Database mention schema
const databaseMentionSchema = z.object({
  type: z.literal('database'),
  database: z.object({
    id: z.string().describe('ID of the mentioned database')
  })
}).describe('Database mention in rich text')

// Date mention schema
const dateMentionSchema = z.object({
  type: z.literal('date'),
  date: z.object({
    start: z.string().describe('Start date in ISO 8601 format'),
    end: z.string().nullable().describe('Optional end date in ISO 8601 format')
  })
}).describe('Date mention in rich text')

// Link preview mention schema
const linkPreviewMentionSchema = z.object({
  type: z.literal('link_preview'),
  link_preview: z.object({
    url: z.string().url().describe('URL of the link preview')
  })
}).describe('Link preview mention in rich text')

// Template mention schema for dates
const templateMentionDateSchema = z.object({
  type: z.literal('template_mention'),
  template_mention: z.object({
    type: z.literal('template_mention_date'),
    template_mention_date: z.enum(['today', 'now']).describe('Type of date template mention')
  })
}).describe('Template mention for dates')

// Template mention schema for users
const templateMentionUserSchema = z.object({
  type: z.literal('template_mention'),
  template_mention: z.object({
    type: z.literal('template_mention_user'),
    template_mention_user: z.literal('me').describe('User template mention (always "me")')
  })
}).describe('Template mention for users')

// Combined mention schema
const mentionSchema = z.object({
  type: z.literal('mention'),
  mention: z.union([
    userMentionSchema,
    pageMentionSchema,
    databaseMentionSchema,
    dateMentionSchema,
    linkPreviewMentionSchema,
    templateMentionDateSchema,
    templateMentionUserSchema
  ]),
  annotations: annotationsSchema.optional(),
  plain_text: z.string().optional().describe('Plain text representation of the mention'),
  href: z.union([z.string().url(), z.null()]).optional()
}).describe('Mention content with various types')

// Combined rich text schema that can be any of the types
export const richTextSchema = z.union([
  textSchema,
  equationSchema,
  mentionSchema
]).describe('Rich text object containing formatted content, mentions, or equations')

// Schema for an array of rich text objects, used in blocks
export const richTextArraySchema = z.array(richTextSchema)
  .describe('Array of rich text objects for block content')