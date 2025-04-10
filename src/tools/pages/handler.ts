// src/tools/pages/handler.ts
import type { GetPageParameters, CreatePageParameters } from "@notionhq/client/build/src/api-endpoints"
import { notionClient } from "@/services/notion"
import { handleNotionError } from "@/utils/error-handling"
import { type RetrievePageParams, type CreatePageParams } from "./schema"

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

/**
 * Handler for creating a new Notion page
 * @param args Parameters for creating a page
 * @returns JSON string with the created page data
 */
export async function createPageHandler(args: CreatePageParams) {
  try {
    const { parent, properties, children } = args
    
    // Build the create page parameters
    const createParams: CreatePageParameters = {
      parent: {} as any, // Will be properly set below
      properties: properties // Properties are required for both database and page parents
    }
    
    // Set the parent based on the type
    if ('database_id' in parent) {
      createParams.parent = {
        database_id: parent.database_id
      }
      
      // Properties are required when creating a page in a database
      if (!properties || Object.keys(properties).length === 0) {
        throw new Error('Properties are required when creating a page in a database')
      }
    } else if ('page_id' in parent) {
      createParams.parent = {
        page_id: parent.page_id
      }
      
      // For page parents, only title is valid in properties
      if (!properties || !('title' in properties)) {
        throw new Error('Title property is required when creating a page as a subpage')
      }
    }
    
    // Add children blocks if provided
    if (children && children.length > 0) {
      createParams.children = children.map((block: { type: string; content: string }) => {
        // Map the simplified content model to Notion's block structure
        switch (block.type) {
          case 'paragraph':
            return {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [{
                  type: 'text',
                  text: { content: block.content }
                }]
              }
            }
          case 'heading_1':
            return {
              object: 'block',
              type: 'heading_1',
              heading_1: {
                rich_text: [{
                  type: 'text',
                  text: { content: block.content }
                }]
              }
            }
          case 'heading_2':
            return {
              object: 'block',
              type: 'heading_2',
              heading_2: {
                rich_text: [{
                  type: 'text',
                  text: { content: block.content }
                }]
              }
            }
          case 'heading_3':
            return {
              object: 'block',
              type: 'heading_3',
              heading_3: {
                rich_text: [{
                  type: 'text',
                  text: { content: block.content }
                }]
              }
            }
          case 'bulleted_list_item':
            return {
              object: 'block',
              type: 'bulleted_list_item',
              bulleted_list_item: {
                rich_text: [{
                  type: 'text',
                  text: { content: block.content }
                }]
              }
            }
          case 'numbered_list_item':
            return {
              object: 'block',
              type: 'numbered_list_item',
              numbered_list_item: {
                rich_text: [{
                  type: 'text',
                  text: { content: block.content }
                }]
              }
            }
          case 'to_do':
            return {
              object: 'block',
              type: 'to_do',
              to_do: {
                rich_text: [{
                  type: 'text',
                  text: { content: block.content }
                }],
                checked: false
              }
            }
          case 'quote':
            return {
              object: 'block',
              type: 'quote',
              quote: {
                rich_text: [{
                  type: 'text',
                  text: { content: block.content }
                }]
              }
            }
          case 'divider':
            return {
              object: 'block',
              type: 'divider',
              divider: {}
            }
          default:
            // Default to paragraph if type is not recognized
            return {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [{
                  type: 'text',
                  text: { content: block.content }
                }]
              }
            }
        }
      })
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
