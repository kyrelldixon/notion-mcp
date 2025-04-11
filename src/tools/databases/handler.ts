// src/tools/databases/handler.ts 
import { notionClient } from "@/services/notion";
import { handleNotionError } from "@/utils/error-handling";
import type { QueryDatabaseParameters, CreateDatabaseParameters, UpdateDatabaseParameters } from "./schema";
import { convertListDatabasesToMarkdown } from "./utils";

export async function queryDatabaseHandler(args: QueryDatabaseParameters) {
  try {
    const { database_id, filter, sorts, start_cursor, page_size } = args;

    // Execute the query
    const response = await notionClient.databases.query({
      database_id,
      filter,
      sorts,
      start_cursor,
      page_size
    });

    if (args.format === "markdown") {
      return convertListDatabasesToMarkdown(response);
    }

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
export async function createDatabaseHandler(args: CreateDatabaseParameters) {
  try {
    const { parent_page_id, title, properties } = args;

    // Execute the database creation
    const response = await notionClient.databases.create({
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
    });

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

/**
 * Updates an existing database's title, description, or properties
 * 
 * @param args - Parameters for database update
 * @returns JSON string with the updated database information
 */
export async function updateDatabaseHandler(args: UpdateDatabaseParameters) {
  try {
    // Execute the database update
    const response = await notionClient.databases.update({
      database_id: args.database_id,
      title: args.title ? [
        {
          type: "text",
          text: {
            content: args.title
          }
        }
      ] : undefined,
      description: args.description ? [
        {
          type: "text",
          text: {
            content: args.description
          }
        }
      ] : undefined,
      properties: args.properties ? args.properties : undefined
    });

    // Return the updated database information
    // Format the response for better readability
    // Use a properly typed object with optional properties
    type FormattedResponse = {
      id: string;
      properties: { name: string; type: string }[];
      title?: string;
      description?: string;
    };

    const formattedResponse: FormattedResponse = {
      id: response.id,
      properties: Object.keys(response.properties).map(key => ({
        name: key,
        type: response.properties[key]?.type || 'unknown'
      }))
    };

    // Add title if available in the response
    if ('title' in response && Array.isArray(response.title)) {
      formattedResponse.title = response.title.map((t: any) => t.plain_text).join('');
    }

    // Add description if available in the response
    if ('description' in response && Array.isArray(response.description)) {
      formattedResponse.description = response.description.map((d: any) => d.plain_text).join('');
    }

    return JSON.stringify(formattedResponse, null, 2);
  } catch (error: unknown) {
    handleNotionError(error, `Database update (id: ${args.database_id})`);
  }
}