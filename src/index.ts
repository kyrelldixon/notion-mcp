import { FastMCP } from 'fastmcp';
import { config } from './config';
import { queryDatabaseSchema, queryDatabaseHandler, createDatabaseSchema, createDatabaseHandler, updateDatabaseSchema, updateDatabaseHandler } from './tools/databases';
import { retrievePageSchema, retrievePageHandler, createPageSchema, createPageHandler, createDatabaseItemSchema, createDatabaseItemHandler, updatePagePropertiesSchema, updatePagePropertiesHandler } from './tools/pages';
import { searchSchema, searchHandler } from './tools/search';

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

  server.addTool({
    name: createDatabaseSchema.name,
    description: createDatabaseSchema.description,
    parameters: createDatabaseSchema.parameters,
    execute: createDatabaseHandler,
  });

  server.addTool({
    name: updateDatabaseSchema.name,
    description: updateDatabaseSchema.description,
    parameters: updateDatabaseSchema.parameters,
    execute: updateDatabaseHandler,
  });

  // Register page tools
  server.addTool({
    name: retrievePageSchema.name,
    description: retrievePageSchema.description,
    parameters: retrievePageSchema.parameters,
    execute: retrievePageHandler,
  });
  
  server.addTool({
    name: createPageSchema.name,
    description: createPageSchema.description,
    parameters: createPageSchema.parameters,
    execute: createPageHandler,
  });

  server.addTool({
    name: createDatabaseItemSchema.name,
    description: createDatabaseItemSchema.description,
    parameters: createDatabaseItemSchema.parameters,
    execute: createDatabaseItemHandler,
  });

  server.addTool({
    name: updatePagePropertiesSchema.name,
    description: updatePagePropertiesSchema.description,
    parameters: updatePagePropertiesSchema.parameters,
    execute: updatePagePropertiesHandler,
  });

  // Register search tool
  server.addTool({
    name: searchSchema.name,
    description: searchSchema.description,
    parameters: searchSchema.parameters,
    execute: searchHandler,
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
