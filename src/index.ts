import { FastMCP } from 'fastmcp';
import { config } from './config';

async function main() {
  // Create server instance
  const server = new FastMCP({
    name: config.server.name,
    version: config.server.version,
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
