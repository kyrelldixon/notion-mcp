// src/tools/blocks/handler.ts
import { notionClient } from "@/services/notion"
import { handleNotionError } from "@/utils/error-handling"
import type { RetrieveBlockChildrenParams } from "./schema"

/**
 * Retrieves children blocks of a specified block
 * @param params Parameters for retrieving block children
 * @returns JSON string containing block children and pagination info
 */
export async function retrieveBlockChildrenHandler(params: RetrieveBlockChildrenParams): Promise<string> {
  try {
    const { block_id, page_size, start_cursor } = params

    const response = await notionClient.blocks.children.list({
      block_id,
      page_size,
      start_cursor: start_cursor || undefined,
    })

    return JSON.stringify({
      results: response.results,
      next_cursor: response.next_cursor,
      has_more: response.has_more,
    })
  } catch (error: unknown) {
    handleNotionError(error, `Block children retrieval (${params.block_id})`)
  }
}
