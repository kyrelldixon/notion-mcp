// src/tools/pages/handler.ts
import type { GetPageParameters, CreatePageParameters } from "@notionhq/client/build/src/api-endpoints"
import { notionClient } from "@/services/notion"
import { handleNotionError } from "@/utils/error-handling"
import type { RetrievePageParams, CreatePageParams, CreateDatabaseItemParams } from "./schema"
import { UserError } from "fastmcp"

/**
 * Handler for retrieving a Notion page by its ID
 * @param args Parameters for retrieving a page
 * @returns JSON string with the page data
 */
export async function retrievePageHandler(args: RetrievePageParams): Promise<string> {
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

/**
 * Handler for creating a new standalone Notion page with a page parent
 * @param args Parameters for creating a standalone page
 * @returns JSON string with the created page data
 */
export async function createPageHandler(args: CreatePageParams): Promise<string> {
  try {
    const { page_id, title, children } = args
    
    // Build the create page parameters with proper type casting for the Notion API
    const createParams: CreatePageParameters = {
      parent: {
        page_id
      },
      properties: {
        title: {
          title: [{
            text: {
              content: title
            }
          }]
        }
      }
    }

    // Add children blocks if provided
    if (children && children.length > 0) {
      createParams.children = children as any
    }

    // Create the page
    const response = await notionClient.pages.create(createParams)

    // Format the response for better readability
    const formattedResponse: Record<string, unknown> = {
      id: response.id
    }

    // Add additional properties if they exist
    if ('created_time' in response) formattedResponse.created_time = response.created_time
    if ('last_edited_time' in response) formattedResponse.last_edited_time = response.last_edited_time
    if ('url' in response) formattedResponse.url = response.url
    if ('parent' in response) formattedResponse.parent = response.parent
    if ('properties' in response) formattedResponse.properties = response.properties

    return JSON.stringify(formattedResponse, null, 2)
  } catch (error: unknown) {
    handleNotionError(error, 'Page creation')
  }
}

/**
 * Handler for creating a new item in a Notion database
 * @param args Parameters for creating a database item
 * @returns JSON string with the created database item data
 */
export async function createDatabaseItemHandler(args: CreateDatabaseItemParams): Promise<string> {
  try {
    const { database_id, properties, children } = args
    
    // Build the create page parameters
    const createParams = {
      parent: {
        database_id
      },
      properties: {} as any,
      children: children as any
    }

    // Properties are required when creating a page in a database
    if (!properties || Object.keys(properties).length === 0) {
      throw new UserError('Properties are required when creating an item in a database')
    }

    // For database items, we can pass the properties directly with type assertion
    // The schema is already designed to match Notion's API expectations
    createParams.properties = properties as any
    
    // Add children blocks if provided
    if (children && children.length > 0) {
      createParams.children = children as any
    }

    // Create the database item
    const response = await notionClient.pages.create(createParams)
    
    // Format the response for better readability
    const formattedResponse: Record<string, unknown> = {
      id: response.id
    }
    
    // Add additional properties if they exist
    if ('created_time' in response) formattedResponse.created_time = response.created_time
    if ('last_edited_time' in response) formattedResponse.last_edited_time = response.last_edited_time
    if ('url' in response) formattedResponse.url = response.url
    if ('parent' in response) formattedResponse.parent = response.parent
    if ('properties' in response) formattedResponse.properties = response.properties
    if ('icon' in response) formattedResponse.icon = response.icon
    if ('cover' in response) formattedResponse.cover = response.cover
    
    return JSON.stringify(formattedResponse, null, 2)
  } catch (error: unknown) {
    handleNotionError(error, 'Database item creation')
    return ''
  }
}
