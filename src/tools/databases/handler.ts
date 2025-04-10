// src/tools/databases/handler.ts
import { z } from "zod";
import type { QueryDatabaseParameters } from "@notionhq/client/build/src/api-endpoints";
import { notionClient } from "@/services/notion";
import { handleNotionError } from "@/utils/error-handling";
import { queryDatabaseSchema } from "./schema";

export async function queryDatabaseHandler(
  args: z.infer<typeof queryDatabaseSchema.parameters>
) {
  try {
    const { database_id, filter, sorts, start_cursor, page_size } = args;

    // Build the query parameters
    const queryParams: QueryDatabaseParameters = {
      database_id,
    };

    if (filter) queryParams.filter = filter;
    if (sorts) queryParams.sorts = sorts;
    if (start_cursor) queryParams.start_cursor = start_cursor;
    if (page_size) queryParams.page_size = page_size;

    // Execute the query
    const response = await notionClient.databases.query(queryParams);

    // Format the response for better readability in MCP
    return JSON.stringify({
      results: response.results,
      next_cursor: response.next_cursor,
      has_more: response.has_more,
      result_count: response.results.length,
    }, null, 2);
  } catch (error: unknown) {
    handleNotionError(error, `Database query (${args.database_id})`);
  }
}