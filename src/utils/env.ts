import { z } from 'zod'

/**
 * Schema for validating environment variables
 */
export const EnvSchema = z.object({
  // Notion API credentials
  NOTION_API_KEY: z.string().min(1).describe('Notion API key for authentication'),
  
  // Server configuration
  PORT: z.coerce.number().default(3000).describe('Port for the server to listen on'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info')
    .describe('Log level for the application'),
  
  // Optional Notion version
  NOTION_VERSION: z.string().optional().describe('Notion API version to use')
})

/**
 * Type definition for environment variables
 */
export type Env = z.infer<typeof EnvSchema>

/**
 * Result type for environment loading
 */
export type EnvResult = 
  | { success: true; data: Env }
  | { success: false; error: string }

/**
 * Formats an error message for missing environment variables
 */
function formatMissingVarsError(missingVars: string[]): string {
  return `Missing required environment variables: ${missingVars.join(', ')}\nPlease check your .env file and make sure all required variables are set`
}

/**
 * Loads and validates environment variables without side effects
 * @returns Result object with either the validated env or an error message
 */
export function loadEnv(): EnvResult {
  try {
    const env = EnvSchema.parse({
      NOTION_API_KEY: process.env.NOTION_API_KEY,
      PORT: process.env.PORT,
      LOG_LEVEL: process.env.LOG_LEVEL,
      NOTION_VERSION: process.env.NOTION_VERSION
    })
    
    return { success: true, data: env }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .filter(err => err.code === 'invalid_type' && err.received === 'undefined')
        .map(err => err.path.join('.'))
      
      if (missingVars.length > 0) {
        return { 
          success: false, 
          error: formatMissingVarsError(missingVars)
        }
      } else {
        return { 
          success: false, 
          error: `Environment validation error: ${JSON.stringify(error.errors)}`
        }
      }
    } else {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return { 
        success: false, 
        error: `Failed to load environment variables: ${errorMessage}`
      }
    }
  }
}
