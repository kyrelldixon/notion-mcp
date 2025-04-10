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

// Type inference for the parameters
export type RetrievePageParams = z.infer<typeof retrievePageSchema.parameters>
