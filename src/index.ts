import { FastMCP } from 'fastmcp'

/**
 * Main entry point for the Notion MCP server
 * This file initializes the FastMCP server and registers all tools
 */

// Initialize the FastMCP server
const server = new FastMCP({
  name: 'Notion MCP',
  version: '1.0.0',
})

// Start the server with stdio transport
server.start({ transportType: 'stdio' })
