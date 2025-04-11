// src/tools/pages/schema.ts
import { z } from "zod"

// Schema for retrieving a page by its ID
export const retrievePageSchema = {
  name: "notion-retrieve-page",
  description: "Retrieve a Notion page by its ID",
  parameters: z.object({
    page_id: z.string().describe("ID of the page to retrieve"),
    // Optional filter to include or exclude specific properties
    filter_properties: z.object({
      // Either include or exclude specific properties
      include: z.array(z.string()).optional().describe("List of property names to include"),
      exclude: z.array(z.string()).optional().describe("List of property names to exclude"),
    }).optional().describe("A set of page property value IDs to include or exclude associated with the page. Use this param to limit the response to a specific page property value or values. To retrieve multiple properties, specify each page property ID."),
  }),
}

// Rich text object schema for block content
export const richTextObject = z.object({
  type: z.enum(["text", "mention", "equation"]).describe("Type of rich text object"),
  text: z.object({
    content: z.string().describe("Text content"),
    link: z.object({
      type: z.literal("url"),
      url: z.string().url()
    }).nullable().optional().describe("Optional link for text")
  }).optional(),
  annotations: z.object({
    bold: z.boolean().optional(),
    italic: z.boolean().optional(),
    strikethrough: z.boolean().optional(),
    underline: z.boolean().optional(),
    code: z.boolean().optional(),
    color: z.enum([
      "default", "gray", "brown", "orange", "yellow",
      "green", "blue", "purple", "pink", "red"
    ]).optional()
  }).optional().describe("Text formatting options"),
  mention: z.object({
    type: z.enum(["user", "page", "database", "date", "link_preview"]),
    // Additional mention properties would be defined here based on type
  }).optional().describe("Mention data when type is 'mention'"),
  equation: z.object({
    expression: z.string()
  }).optional().describe("LaTeX expression when type is 'equation'"),
  plain_text: z.string().optional().describe("Plain text representation"),
  href: z.string().nullable().optional().describe("URL if text is a link")
})

// File object schema for file, image, video, etc.
export const fileObject = z.object({
  type: z.enum(["external", "file"]),
  external: z.object({
    url: z.string().url()
  }).optional().describe("External file URL"),
  file: z.object({
    url: z.string().url(),
    expiry_time: z.string().optional()
  }).optional().describe("Uploaded file information")
})

// Schema for supported block types
const blockContent = z.discriminatedUnion("type", [
  // Text blocks
  z.object({
    type: z.literal("paragraph"),
    paragraph: z.object({
      rich_text: z.array(richTextObject).describe("Rich text in the paragraph")
    })
  }),
  z.object({
    type: z.literal("heading_1"),
    heading_1: z.object({
      rich_text: z.array(richTextObject).describe("Rich text in the heading")
    })
  }),
  z.object({
    type: z.literal("heading_2"),
    heading_2: z.object({
      rich_text: z.array(richTextObject).describe("Rich text in the heading")
    })
  }),
  z.object({
    type: z.literal("heading_3"),
    heading_3: z.object({
      rich_text: z.array(richTextObject).describe("Rich text in the heading")
    })
  }),
  z.object({
    type: z.literal("bulleted_list_item"),
    bulleted_list_item: z.object({
      rich_text: z.array(richTextObject).describe("Rich text in the list item")
    })
  }),
  z.object({
    type: z.literal("numbered_list_item"),
    numbered_list_item: z.object({
      rich_text: z.array(richTextObject).describe("Rich text in the list item")
    })
  }),
  z.object({
    type: z.literal("to_do"),
    to_do: z.object({
      rich_text: z.array(richTextObject).describe("Rich text in the to-do item"),
      checked: z.boolean().optional().describe("Whether the to-do is checked")
    })
  }),
  z.object({
    type: z.literal("toggle"),
    toggle: z.object({
      rich_text: z.array(richTextObject).describe("Rich text in the toggle")
    })
  }),
  z.object({
    type: z.literal("code"),
    code: z.object({
      rich_text: z.array(richTextObject).describe("Rich text containing the code"),
      language: z.string().describe("Programming language of the code block"),
      caption: z.array(richTextObject).optional().describe("Optional caption for the code block")
    })
  }),
  z.object({
    type: z.literal("callout"),
    callout: z.object({
      rich_text: z.array(richTextObject).describe("Rich text in the callout"),
      icon: z.object({
        emoji: z.string().optional(),
        external: z.object({
          url: z.string().url()
        }).optional()
      }).optional().describe("Icon for the callout")
    })
  }),
  z.object({
    type: z.literal("quote"),
    quote: z.object({
      rich_text: z.array(richTextObject).describe("Rich text in the quote")
    })
  }),

  // Simple blocks
  z.object({
    type: z.literal("divider"),
    divider: z.object({}).describe("Divider block")
  }),
  z.object({
    type: z.literal("table_of_contents"),
    table_of_contents: z.object({}).describe("Table of contents block")
  }),
  z.object({
    type: z.literal("breadcrumb"),
    breadcrumb: z.object({}).describe("Breadcrumb navigation block")
  }),

  // Media blocks
  z.object({
    type: z.literal("image"),
    image: fileObject.extend({
      caption: z.array(richTextObject).optional().describe("Optional caption")
    })
  }),
  z.object({
    type: z.literal("video"),
    video: fileObject.extend({
      caption: z.array(richTextObject).optional().describe("Optional caption")
    })
  }),
  z.object({
    type: z.literal("audio"),
    audio: fileObject.extend({
      caption: z.array(richTextObject).optional().describe("Optional caption")
    })
  }),
  z.object({
    type: z.literal("file"),
    file: fileObject.extend({
      caption: z.array(richTextObject).optional().describe("Optional caption")
    })
  }),
  z.object({
    type: z.literal("pdf"),
    pdf: fileObject.extend({
      caption: z.array(richTextObject).optional().describe("Optional caption")
    })
  }),

  // Embed blocks
  z.object({
    type: z.literal("bookmark"),
    bookmark: z.object({
      url: z.string().url().describe("URL of the bookmark"),
      caption: z.array(richTextObject).optional().describe("Optional caption")
    })
  }),
  z.object({
    type: z.literal("embed"),
    embed: z.object({
      url: z.string().url().describe("URL to embed"),
      caption: z.array(richTextObject).optional().describe("Optional caption")
    })
  }),

  // Equation block
  z.object({
    type: z.literal("equation"),
    equation: z.object({
      expression: z.string().describe("LaTeX expression for the equation")
    })
  }),

  // Link blocks
  z.object({
    type: z.literal("link_to_page"),
    link_to_page: z.object({
      type: z.enum(["page_id", "database_id"]),
      page_id: z.string().optional().describe("ID of the linked page"),
      database_id: z.string().optional().describe("ID of the linked database")
    })
  }),

  // Synced block
  z.object({
    type: z.literal("synced_block"),
    synced_block: z.object({
      synced_from: z.object({
        type: z.literal("block_id"),
        block_id: z.string()
      }).nullable().describe("Block ID this syncs from, or null for original block")
    })
  }),

  // Template block
  z.object({
    type: z.literal("template"),
    template: z.object({
      rich_text: z.array(richTextObject).describe("Rich text for the template"),
      children: z.array(z.any()).optional().describe("Template child blocks")
    })
  }),

  // Layout blocks
  z.object({
    type: z.literal("column_list"),
    column_list: z.object({}).describe("Parent container for columns")
  }),
  z.object({
    type: z.literal("column"),
    column: z.object({}).describe("Column container for blocks")
  }),

  // Table blocks
  z.object({
    type: z.literal("table"),
    table: z.object({
      table_width: z.number().describe("Number of columns in the table"),
      has_column_header: z.boolean().optional().describe("Whether the first row is a header"),
      has_row_header: z.boolean().optional().describe("Whether the first column is a header"),
      children: z.array(z.object({
        type: z.literal("table_row"),
        table_row: z.object({
          cells: z.array(z.array(richTextObject)).describe("Cells in this row")
        })
      })).optional().describe("Table rows and cells")
    })
  }),

  // Database blocks
  z.object({
    type: z.literal("child_database"),
    child_database: z.object({
      title: z.string().describe("Title of the database")
    })
  }),
])

// Schema for property values based on type
// Property value schemas for different property types
const propertyValueSchema = z.record(z.string(), z.union([
  // Title property (required for pages with page_id parent)
  z.object({
    title: z.array(richTextObject)
  }),

  // Rich text property
  z.object({
    rich_text: z.array(richTextObject)
  }),

  // Number property
  z.object({
    number: z.number().nullable()
  }),

  // Select property
  z.object({
    select: z.object({
      name: z.string(),
      id: z.string().optional(),
      color: z.string().optional()
    }).nullable()
  }),

  // Multi-select property
  z.object({
    multi_select: z.array(z.object({
      name: z.string(),
      id: z.string().optional(),
      color: z.string().optional()
    }))
  }),

  // Date property
  z.object({
    date: z.object({
      start: z.string().optional().describe("A date string in ISO 8601 format"),
      end: z.string().optional().describe("Optional end date for date ranges")
    }).nullable().describe("Date property value")
  }),

  // People property
  z.object({
    people: z.array(z.object({
      id: z.string()
    }))
  }),

  // Files property
  z.object({
    files: z.array(z.object({
      name: z.string(),
      type: z.enum(["external", "file"]),
      external: z.object({
        url: z.string().url()
      }).optional(),
      file: z.object({
        url: z.string().url(),
        expiry_time: z.string()
      }).optional()
    }))
  }),

  // Checkbox property
  z.object({
    checkbox: z.boolean()
  }),

  // URL property
  z.object({
    url: z.string().nullable()
  }),

  // Email property
  z.object({
    email: z.string().nullable()
  }),

  // Phone number property
  z.object({
    phone_number: z.string().nullable()
  }),

  // Relation property
  z.object({
    relation: z.array(z.object({
      id: z.string()
    }))
  }),

  // Formula property
  z.object({
    formula: z.object({
      type: z.enum(["string", "number", "boolean", "date"]),
      string: z.string().optional(),
      number: z.number().optional(),
      boolean: z.boolean().optional(),
      date: z.object({
        start: z.string().optional().describe("A date string in ISO 8601 format"),
        end: z.string().optional().describe("Optional end date for date ranges")
      }).optional().describe("Date property value")
    })
  }),

  // Unique ID property
  z.object({
    unique_id: z.object({
      number: z.number(),
      prefix: z.string().optional()
    })
  }),

  // Status property
  z.object({
    status: z.object({
      name: z.string(),
      id: z.string().optional(),
      color: z.string().optional()
    }).nullable()
  }),

  // Created time property
  z.object({
    created_time: z.string()
  }),

  // Created by property
  z.object({
    created_by: z.object({
      id: z.string(),
      object: z.literal("user")
    })
  }),

  // Last edited time property
  z.object({
    last_edited_time: z.string()
  }),

  // Last edited by property
  z.object({
    last_edited_by: z.object({
      id: z.string(),
      object: z.literal("user")
    })
  }),

  // Rollup property
  z.object({
    rollup: z.object({
      type: z.enum(["number", "date", "array"]),
      number: z.number().optional(),
      date: z.object({
        start: z.string().optional().describe("A date string in ISO 8601 format"),
        end: z.string().optional().describe("Optional end date for date ranges")
      }).optional().describe("Date property value"),
      array: z.array(z.any()).optional(),
      function: z.enum([
        "count", "count_values", "empty", "not_empty", "unique",
        "show_original", "show_unique", "sum", "average", "median",
        "min", "max", "range", "earliest_date", "latest_date",
        "date_range", "checked", "unchecked", "percent_checked",
        "percent_unchecked"
      ])
    })
  }),
]))

// Schema for creating a new standalone page (with a page parent)
export const createPageSchema = {
  name: "notion-create-page",
  description: "Create a new standalone page in Notion with a page parent",
  parameters: z.object({
    // Parent page information
    page_id: z.string().describe("ID of the parent page"),
    title: z.string().describe("The title of the page"),
    // Page children blocks - optional
    children: z.array(blockContent).optional().describe("The content to be rendered on the new page, represented as an array of block objects."),
  }),
}

// Schema for creating a new database item (page in a database)
export const createDatabaseItemSchema = {
  name: "notion-create-database-item",
  description: "Create a new item in a Notion database",
  parameters: z.object({
    // Parent database information
    database_id: z.string().describe("ID of the database to create the item in"),
    
    // Database item properties - must match the database schema
    properties: propertyValueSchema.describe("The values of the database item's properties. The schema must match the parent database's properties."),
    
    // Page children blocks - optional
    children: z.array(blockContent).optional().describe("The content to be rendered on the new database item, represented as an array of block objects."),
  }),
}

// Schema for updating page properties
export const updatePagePropertiesSchema = {
  name: "notion-update-page-properties",
  description: "Update properties of an existing Notion page",
  parameters: z.object({
    page_id: z.string().describe("ID of the page to update"),
    properties: propertyValueSchema.describe("The properties to update. Only specified properties will be updated.")
  }),
}

// Type inference for the parameters
export type RetrievePageParams = z.infer<typeof retrievePageSchema.parameters>
export type CreatePageParams = z.infer<typeof createPageSchema.parameters>
export type CreateDatabaseItemParams = z.infer<typeof createDatabaseItemSchema.parameters>
export type UpdatePagePropertiesParams = z.infer<typeof updatePagePropertiesSchema.parameters>
