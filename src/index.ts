import { FastMCP } from 'fastmcp';
import { config } from './config';
import { queryDatabaseSchema, queryDatabaseHandler } from './tools/databases';
import { retrievePageSchema, retrievePageHandler } from './tools/pages';

async function main() {
  // Create server instance
  const server = new FastMCP({
    name: config.server.name,
    version: config.server.version,
  });

  // Register database tools
  server.addTool({
    name: queryDatabaseSchema.name,
    description: queryDatabaseSchema.description,
    parameters: queryDatabaseSchema.parameters,
    execute: queryDatabaseHandler,
  });

  // Register page tools
  server.addTool({
    name: retrievePageSchema.name,
    description: retrievePageSchema.description,
    parameters: retrievePageSchema.parameters,
    execute: retrievePageHandler,
  });

  // Start the server
  await server.start({
    transportType: "stdio"
  });
}

// Start the server
main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
