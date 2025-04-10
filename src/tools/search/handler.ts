// src/tools/search/handler.ts
import type { SearchParameters } from "@notionhq/client/build/src/api-endpoints"
import { notionClient } from "@/services/notion"
import { handleNotionError } from "@/utils/error-handling"
import { type SearchParams } from "./schema"

/**
 * Handler for searching Notion content
 * @param args Parameters for searching Notion content
 * @returns JSON string with the search results
 */
export async function searchHandler(args: SearchParams) {
  try {
    const { query, filter, sort, start_cursor, page_size } = args

    // Build the search parameters
    const searchParams: SearchParameters = {
      query
    }

    // Add optional parameters if provided
    if (filter) searchParams.filter = filter
    if (sort) searchParams.sort = sort
    if (start_cursor) searchParams.start_cursor = start_cursor
    if (page_size) searchParams.page_size = page_size

    // Execute the search
    const response = await notionClient.search(searchParams)

    // Format the response for better readability
    return JSON.stringify({
      results: response.results,
      next_cursor: response.next_cursor,
      has_more: response.has_more,
      result_count: response.results.length,
      object_types: response.results.reduce((types, result) => {
        const type = result.object
        types[type] = (types[type] || 0) + 1
        return types
      }, {} as Record<string, number>)
    }, null, 2)
  } catch (error: unknown) {
    handleNotionError(error, `Search (query: ${args.query})`)
  }
}
