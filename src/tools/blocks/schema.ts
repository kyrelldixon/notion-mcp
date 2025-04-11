// src/tools/blocks/schema.ts
import { z } from "zod"

// Import the rich text object and file object schema from pages
import { richTextObject, fileObject } from "@/tools/pages/schema"

// Forward declaration for blockSchema to fix circular dependencies
type BlockSchema = z.ZodType<any, any, any>
let blockSchema: BlockSchema

// Base block schema with common properties for all block types
export const baseBlockSchema = z.object({
  object: z.literal("block").describe("Always 'block'"),
  id: z.string().describe("Block ID - unique identifier for the block"),
  parent: z.object({
    type: z.enum(["page_id", "block_id", "database_id"]),
    page_id: z.string().optional().describe("ID of parent page when type is page_id"),
    block_id: z.string().optional().describe("ID of parent block when type is block_id"),
    database_id: z.string().optional().describe("ID of parent database when type is database_id"),
  }).describe("Parent object containing information about the block's parent"),
  created_time: z.string().describe("ISO 8601 date time when this block was created"),
  created_by: z.object({
    object: z.literal("user"),
    id: z.string()
  }).describe("User who created this block"),
  last_edited_time: z.string().describe("ISO 8601 date time when this block was last updated"),
  last_edited_by: z.object({
    object: z.literal("user"),
    id: z.string()
  }).describe("User who last edited this block"),
  archived: z.boolean().describe("Whether the block is archived (deleted)"),
  has_children: z.boolean().describe("Whether the block has children blocks"),
})

// Color type for blocks that support colors
const colorType = z.enum([
  "default", "gray", "brown", "orange", "yellow", "green", "blue", "purple",
  "pink", "red", "gray_background", "brown_background", "orange_background",
  "yellow_background", "green_background", "blue_background", "purple_background",
  "pink_background", "red_background"
]).describe("Color of the block")

// Paragraph block schema
export const paragraphBlockSchema = baseBlockSchema.extend({
  type: z.literal("paragraph").describe("Type of block - paragraph"),
  paragraph: z.object({
    rich_text: z.array(richTextObject).describe("Rich text in the paragraph"),
    color: colorType.default("default").describe("Color of the paragraph text"),
    children: z.array(z.lazy(() => blockSchema as any)).optional().describe("Child blocks")
  }).describe("Paragraph block content")
})

// Heading block schemas (h1, h2, h3)
export const heading1BlockSchema = baseBlockSchema.extend({
  type: z.literal("heading_1").describe("Type of block - heading 1"),
  heading_1: z.object({
    rich_text: z.array(richTextObject).describe("Rich text in the heading"),
    color: colorType.default("default").describe("Color of the heading text"),
    is_toggleable: z.boolean().default(false).describe("Whether the heading can be toggled to show/hide content")
  }).describe("Heading 1 block content")
})

export const heading2BlockSchema = baseBlockSchema.extend({
  type: z.literal("heading_2").describe("Type of block - heading 2"),
  heading_2: z.object({
    rich_text: z.array(richTextObject).describe("Rich text in the heading"),
    color: colorType.default("default").describe("Color of the heading text"),
    is_toggleable: z.boolean().default(false).describe("Whether the heading can be toggled to show/hide content")
  }).describe("Heading 2 block content")
})

export const heading3BlockSchema = baseBlockSchema.extend({
  type: z.literal("heading_3").describe("Type of block - heading 3"),
  heading_3: z.object({
    rich_text: z.array(richTextObject).describe("Rich text in the heading"),
    color: colorType.default("default").describe("Color of the heading text"),
    is_toggleable: z.boolean().default(false).describe("Whether the heading can be toggled to show/hide content")
  }).describe("Heading 3 block content")
})

// List block schemas (bulleted, numbered, to-do)
export const bulletedListItemBlockSchema = baseBlockSchema.extend({
  type: z.literal("bulleted_list_item").describe("Type of block - bulleted list item"),
  bulleted_list_item: z.object({
    rich_text: z.array(richTextObject).describe("Rich text in the list item"),
    color: colorType.default("default").describe("Color of the list item text"),
    children: z.array(z.lazy(() => blockSchema as any)).optional().describe("Child blocks")
  }).describe("Bulleted list item block content")
})

export const numberedListItemBlockSchema = baseBlockSchema.extend({
  type: z.literal("numbered_list_item").describe("Type of block - numbered list item"),
  numbered_list_item: z.object({
    rich_text: z.array(richTextObject).describe("Rich text in the list item"),
    color: colorType.default("default").describe("Color of the list item text"),
    children: z.array(z.lazy(() => blockSchema as any)).optional().describe("Child blocks")
  }).describe("Numbered list item block content")
})

export const todoBlockSchema = baseBlockSchema.extend({
  type: z.literal("to_do").describe("Type of block - to-do item"),
  to_do: z.object({
    rich_text: z.array(richTextObject).describe("Rich text in the to-do item"),
    color: colorType.default("default").describe("Color of the to-do item text"),
    checked: z.boolean().default(false).describe("Whether the to-do is checked"),
    children: z.array(z.lazy(() => blockSchema as any)).optional().describe("Child blocks")
  }).describe("To-do block content")
})

// Code block schema
export const codeBlockSchema = baseBlockSchema.extend({
  type: z.literal("code").describe("Type of block - code"),
  code: z.object({
    rich_text: z.array(richTextObject).describe("Rich text containing the code"),
    caption: z.array(richTextObject).optional().describe("Optional caption for the code block"),
    language: z.enum([
      "abap", "arduino", "bash", "basic", "c", "clojure", "coffeescript",
      "c++", "c#", "css", "dart", "diff", "docker", "elixir", "elm", "erlang",
      "flow", "fortran", "f#", "gherkin", "glsl", "go", "graphql", "groovy",
      "haskell", "html", "java", "javascript", "json", "julia", "kotlin", "latex",
      "less", "lisp", "livescript", "lua", "makefile", "markdown", "markup", "matlab",
      "mermaid", "nix", "objective-c", "ocaml", "pascal", "perl", "php", "plain text",
      "powershell", "prolog", "protobuf", "python", "r", "reason", "ruby", "rust",
      "sass", "scala", "scheme", "scss", "shell", "sql", "swift", "typescript",
      "vb.net", "verilog", "vhdl", "visual basic", "webassembly", "xml", "yaml",
      "other"
    ]).describe("Programming language of the code block")
  }).describe("Code block content")
})

// Quote block schema
export const quoteBlockSchema = baseBlockSchema.extend({
  type: z.literal("quote").describe("Type of block - quote"),
  quote: z.object({
    rich_text: z.array(richTextObject).describe("Rich text in the quote"),
    color: colorType.default("default").describe("Color of the quote text"),
    children: z.array(z.lazy(() => blockSchema as any)).optional().describe("Child blocks")
  }).describe("Quote block content")
})

// Callout block schema
export const calloutBlockSchema = baseBlockSchema.extend({
  type: z.literal("callout").describe("Type of block - callout"),
  callout: z.object({
    rich_text: z.array(richTextObject).describe("Rich text in the callout"),
    icon: z.object({
      type: z.enum(["emoji", "external", "file"]),
      emoji: z.string().optional().describe("Emoji character used as icon"),
      external: z.object({
        url: z.string().url()
      }).optional().describe("External file URL for the icon"),
      file: z.object({
        url: z.string().url(),
        expiry_time: z.string().optional()
      }).optional().describe("Uploaded file information for the icon")
    }).describe("Icon of the callout"),
    color: colorType.default("default").describe("Color of the callout"),
    children: z.array(z.lazy(() => blockSchema as any)).optional().describe("Child blocks")
  }).describe("Callout block content")
})

// Divider block schema
export const dividerBlockSchema = baseBlockSchema.extend({
  type: z.literal("divider").describe("Type of block - divider"),
  divider: z.object({}).describe("Divider block has no additional properties")
})

// Image block schema
export const imageBlockSchema = baseBlockSchema.extend({
  type: z.literal("image").describe("Type of block - image"),
  image: fileObject.extend({
    caption: z.array(richTextObject).optional().describe("Optional caption for the image")
  }).describe("Image block content")
})

// Combined block schema with discriminated union of all block types
blockSchema = z.discriminatedUnion("type", [
  paragraphBlockSchema,
  heading1BlockSchema,
  heading2BlockSchema,
  heading3BlockSchema,
  bulletedListItemBlockSchema,
  numberedListItemBlockSchema,
  todoBlockSchema,
  codeBlockSchema,
  quoteBlockSchema,
  calloutBlockSchema,
  dividerBlockSchema,
  imageBlockSchema,
])

// Export blockSchema after initialization
export { blockSchema }

// Type inference
export type Block = z.infer<typeof blockSchema>
export type ParagraphBlock = z.infer<typeof paragraphBlockSchema>
export type Heading1Block = z.infer<typeof heading1BlockSchema>
export type Heading2Block = z.infer<typeof heading2BlockSchema>
export type Heading3Block = z.infer<typeof heading3BlockSchema>
export type BulletedListItemBlock = z.infer<typeof bulletedListItemBlockSchema>
export type NumberedListItemBlock = z.infer<typeof numberedListItemBlockSchema>
export type TodoBlock = z.infer<typeof todoBlockSchema>
export type CodeBlock = z.infer<typeof codeBlockSchema>
export type QuoteBlock = z.infer<typeof quoteBlockSchema>
export type CalloutBlock = z.infer<typeof calloutBlockSchema>
export type DividerBlock = z.infer<typeof dividerBlockSchema>
export type ImageBlock = z.infer<typeof imageBlockSchema>

// Schema for retrieving block children
export const retrieveBlockChildrenSchema = {
  name: "notion-retrieve-block-children",
  description: "Retrieve all children blocks of a block",
  parameters: z.object({
    block_id: z.string().describe("ID of the block to retrieve children for. This could also be a page ID"),
    page_size: z.number().min(1).max(100).optional().describe("Number of blocks to return per page (default: 100, max: 100)"),
    start_cursor: z.string().optional().describe("Cursor to start from for pagination")
  }),
}

// Type inference for parameters
export type RetrieveBlockChildrenParams = z.infer<typeof retrieveBlockChildrenSchema.parameters>
