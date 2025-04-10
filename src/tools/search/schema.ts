// src/tools/search/schema.ts
import { z } from "zod"

// Schema for searching Notion content
export const searchSchema = {
  name: "notion-search",
  description: "Search all pages and databases in a Notion workspace",
  parameters: z.object({
    query: z.string().describe("The text to search for"),
    
    // Optional filter to narrow down search results by object type
    filter: z.object({
      value: z.enum(["page", "database"]),
      property: z.literal("object")
    }).optional().describe("Filter results by object type (page or database)"),
    
    // Optional sort direction for search results
    sort: z.object({
      direction: z.enum(["ascending", "descending"]),
      timestamp: z.literal("last_edited_time")
    }).optional().describe("Sort results by last edited time"),
    
    // Pagination parameters
    start_cursor: z.string().optional().describe("Pagination cursor from a previous response"),
    page_size: z.number().min(1).max(100).optional().describe("Number of results per page (1-100)")
  }),
}

// Type inference for the parameters
export type SearchParams = z.infer<typeof searchSchema.parameters>
