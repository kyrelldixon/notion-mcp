// src/tools/pages/handler.ts
import type { GetPageParameters } from "@notionhq/client/build/src/api-endpoints"
import { notionClient } from "@/services/notion"
import { handleNotionError } from "@/utils/error-handling"
import { type RetrievePageParams } from "./schema"

/**
 * Handler for retrieving a Notion page by its ID
 * @param args Parameters for retrieving a page
 * @returns JSON string with the page data
 */
export async function retrievePageHandler(args: RetrievePageParams) {
  try {
    const { page_id, filter_properties } = args

    // Build the query parameters
    const queryParams: GetPageParameters = {
      page_id,
    }

    // Filter properties if specified
    if (filter_properties) {
      // According to Notion API docs, filter_properties can be either a string array of property IDs to include
      // or an object with property_ids (string array) and omit (boolean) for properties to exclude
      if (filter_properties.include && filter_properties.include.length > 0) {
        // Include specific properties
        queryParams.filter_properties = filter_properties.include
      } else if (filter_properties.exclude && filter_properties.exclude.length > 0) {
        // Exclude specific properties - using type assertion to match Notion API expectations
        queryParams.filter_properties = {
          property_ids: filter_properties.exclude,
          omit: true
        } as unknown as string[]
      }
    }

    // Execute the query
    const response = await notionClient.pages.retrieve(queryParams)

    // Format the response for better readability in MCP
    // Since the response type can vary, we'll use a more generic approach
    const formattedResponse: Record<string, unknown> = {
      id: response.id
    }

    // Add additional properties if they exist
    if ('created_time' in response) formattedResponse.created_time = response.created_time
    if ('last_edited_time' in response) formattedResponse.last_edited_time = response.last_edited_time
    if ('archived' in response) formattedResponse.archived = response.archived
    if ('properties' in response) formattedResponse.properties = response.properties
    if ('url' in response) formattedResponse.url = response.url
    if ('parent' in response) formattedResponse.parent = response.parent

    return JSON.stringify(formattedResponse, null, 2)
  } catch (error: unknown) {
    handleNotionError(error, `Page retrieval (${args.page_id})`)
  }
}
