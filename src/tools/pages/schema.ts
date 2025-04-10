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

// Schema for creating a new page
export const createPageSchema = {
  name: "notion-create-page",
  description: "Create a new page in Notion",
  parameters: z.object({
    // Parent information - either a database or page (workspace pages cannot be created via API)
    parent: z.union([
      z.object({
        type: z.literal("database_id").describe("Create a page in a database"),
        database_id: z.string().describe("ID of the database to create the page in")
      }),
      z.object({
        type: z.literal("page_id").describe("Create a subpage under an existing page"),
        page_id: z.string().describe("ID of the parent page")
      })
    ]).describe("The parent page or database where this page will be created"),
    
    // Page properties - required for database pages, required for page parents but only title is valid
    properties: z.record(z.string(), z.any()).describe("The values of the page's properties. If the parent is a database, then the schema must match the parent database's properties. If the parent is a page, then the only valid object key is title."),
    
    // Page children blocks - optional
    children: z.array(
      z.object({
        type: z.string().describe("Block type (e.g., 'paragraph', 'heading_1', 'bulleted_list_item', etc.)"),
        content: z.string().describe("Text content for the block")
      })
    ).optional().describe("The content to be rendered on the new page, represented as an array of block objects.")
  }),
}

// Type inference for the parameters
export type RetrievePageParams = z.infer<typeof retrievePageSchema.parameters>
export type CreatePageParams = z.infer<typeof createPageSchema.parameters>
