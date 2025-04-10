import { Client } from '@notionhq/client'
import { loadEnv } from './env'

/**
 * Creates a Notion client instance using environment variables
 * 
 * @returns Configured Notion client instance or throws an error if environment variables are invalid
 */
export function createNotionClient(): Client {
  const envResult = loadEnv()
  
  if (!envResult.success) {
    throw new Error(`Failed to create Notion client: ${envResult.error}`)
  }
  
  return new Client({
    auth: envResult.data.NOTION_API_KEY,
    ...(envResult.data.NOTION_VERSION ? { notionVersion: envResult.data.NOTION_VERSION } : {})
  })
}

/**
 * Creates a Notion client instance or returns an error message
 * 
 * @returns An object containing either a client or an error message
 */
export function safeCreateNotionClient(): { client: Client } | { error: string } {
  const envResult = loadEnv()
  
  if (!envResult.success) {
    return { error: envResult.error }
  }
  
  const client = new Client({
    auth: envResult.data.NOTION_API_KEY,
    ...(envResult.data.NOTION_VERSION ? { notionVersion: envResult.data.NOTION_VERSION } : {})
  })
  
  return { client }
}

// Create a default client instance for convenience - will throw if environment is invalid
export const notionClient = createNotionClient()
