import { FastMCP } from 'fastmcp'
import { loadEnv } from './utils/env'

/**
 * Main entry point for the Notion MCP server
 * This file initializes the FastMCP server and registers all tools
 */

/**
 * Main function to initialize and start the MCP server
 */
function main() {
  // Load environment variables
  const envResult = loadEnv()
  
  // Handle environment loading errors
  if (!envResult.success) {
    console.error('Failed to start server:')
    console.error(envResult.error)
    process.exit(1)
    return
  }

  // Initialize the FastMCP server
  const server = new FastMCP({
    name: 'Notion MCP',
    version: '1.0.0',
  })

  // Register tools here
  // Example: server.addTool({ ... })

  // Start the server with stdio transport
  server.start({ transportType: 'stdio' })
  
  // Log successful startup
  console.log(`Notion MCP server started with log level: ${envResult.data.LOG_LEVEL}`)
}

// Execute the main function
main()
