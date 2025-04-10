// src/tools/databases/handler.ts
import { z } from "zod";
import type { QueryDatabaseParameters, CreateDatabaseParameters } from "@notionhq/client/build/src/api-endpoints";
import { notionClient } from "@/services/notion";
import { handleNotionError } from "@/utils/error-handling";
import { queryDatabaseSchema, createDatabaseSchema } from "./schema";

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

/**
 * Creates a new database as a child of a specified parent page
 * 
 * @param args - Parameters for database creation
 * @returns JSON string with the created database information
 */
export async function createDatabaseHandler(
  args: z.infer<typeof createDatabaseSchema.parameters>
) {
  try {
    const { parent_page_id, title, properties, icon, cover } = args;

    // Build the create database parameters
    const createParams: CreateDatabaseParameters = {
      parent: {
        type: "page_id",
        page_id: parent_page_id
      },
      title: [
        {
          type: "text",
          text: {
            content: title
          }
        }
      ],
      properties
    };

    // Add optional parameters if provided
    if (icon) {
      createParams.icon = {
        type: "emoji",
        emoji: icon.emoji as any // Cast to any to resolve type issue with EmojiRequest
      };
    }
    if (cover) createParams.cover = cover;

    // Execute the database creation
    const response = await notionClient.databases.create(createParams);

    // Return the created database information
    return JSON.stringify({
      id: response.id,
      title: title,
      properties: Object.keys(response.properties).map(key => ({
        name: key,
        type: response.properties[key]?.type || 'unknown'
      }))
    }, null, 2);
  } catch (error: unknown) {
    handleNotionError(error, `Database creation (parent: ${args.parent_page_id})`);
  }
}