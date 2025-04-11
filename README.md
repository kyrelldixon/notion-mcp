# Notion MCP Server

A Model Context Protocol (MCP) server for the Notion API that enables AI assistants to interact with Notion workspaces programmatically. This server provides a standardized interface for LLMs to access and manipulate Notion content, including databases, pages, and blocks.

## What is MCP?

The Model Context Protocol (MCP) is a standardized protocol for connecting Large Language Models (LLMs) with external tools, data sources, and APIs. It allows AI assistants like Claude to access functionality and data in a secure, standardized way. This Notion MCP server implements the protocol to provide AI assistants with access to your Notion workspace.

## Project Purpose

This project serves as a bridge between AI assistants and Notion workspaces, allowing AI tools to:

- Query and search databases
- Retrieve and create pages
- Update page properties and content 
- Create and update databases
- (Coming soon) Manage blocks and their content

By implementing the MCP protocol for Notion, this server enables AI assistants to help users manage their Notion workspaces more effectively.

## Features

The Notion MCP server implements the following capabilities:

### Database Operations
- Query databases with filtering and sorting
- Create new databases with custom properties
- Update existing database schema and properties
- Search across databases

### Page Operations
- Create pages with properties and content
- Retrieve page content and metadata
- Update page properties
- Search across pages

### Block Operations (Coming Soon)
- Retrieve block children
- Append new blocks to pages
- Update block content
- Delete blocks

## Setup

### Prerequisites
- [Bun](https://bun.sh) v1.2.9 or higher
- A Notion integration token with appropriate permissions
- Notion pages/databases shared with your integration

### Creating a Notion Integration

1. Visit the [Notion Your Integrations page](https://www.notion.so/profile/integrations)
2. Click "New Integration"
3. Name your integration and select appropriate permissions (e.g., "Read content", "Update content")
4. Copy the "Internal Integration Token" - this will be your `NOTION_API_KEY`

### Sharing Notion Content with Your Integration

1. Open the page or database you want the integration to access in Notion
2. Click the "···" button in the top right corner
3. Click the "Connections" button, and select the integration you created

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kyrelldixon/notion-mcp.git
   cd notion-mcp
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Create a `.env` file in the project root with your Notion API token:
   ```
   NOTION_API_KEY=your_notion_integration_token
   ```

4. Build and run the server:
   ```bash
   bun run src/index.ts
   ```

### Configuring Claude Desktop

To use this MCP server with Claude Desktop, add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "notion": {
      "command": "bun",
      "args": ["run", "src/index.ts"],
      "cwd": "/absolute/path/to/notion-mcp",
      "env": {
        "NOTION_API_KEY": "your-integration-token"
      }
    }
  }
}
```

## Available Tools

The Notion MCP server provides the following tools to AI assistants:

### Database Tools

1. `queryDatabase`
   - Query a Notion database with filters and sorting
   - Required parameters: `database_id`
   - Optional parameters: `filter`, `sorts`, `page_size`, `start_cursor`

2. `createDatabase`
   - Create a new database in Notion
   - Required parameters: `parent`, `title`, `properties`

3. `updateDatabase`
   - Update a database's properties or schema
   - Required parameters: `database_id`
   - Optional parameters: `title`, `description`, `properties`

### Page Tools

1. `retrievePage`
   - Get a page's content and properties
   - Required parameters: `page_id`

2. `createPage`
   - Create a new page in Notion
   - Required parameters: `parent`, `properties`
   - Optional parameters: `children`

3. `updatePageProperties`
   - Update a page's properties
   - Required parameters: `page_id`, `properties`

### Search Tools

1. `search`
   - Search across Notion workspace by title
   - Optional parameters: `query`, `filter`, `sort`, `page_size`, `start_cursor`

## Troubleshooting

If you encounter permission errors:

1. Ensure your Notion integration has the required permissions
2. Verify that the integration is invited to the relevant pages or databases
3. Confirm your token is correctly set in the `.env` file or configuration

## Project Structure

```
notion-mcp/
├── src/
│   ├── services/
│   │   └── notion.ts             # Notion client service  
│   ├── config.ts                 # Application configuration
│   ├── env.ts                    # t3-env schema 
│   ├── index.ts                  # Server entry point
│   ├── utils/
│   │   └── error-handling.ts     # Error handling utilities
│   └── tools/
│       ├── index.ts              # Export all tools
│       ├── databases/            # Database-related tools
│       │   ├── handler.ts        # Handlers for database operations
│       │   ├── index.ts          # Export database tools
│       │   └── schema.ts         # Zod schemas for database operations
│       └── pages/                # Page-related tools
│           ├── handler.ts        # Handlers for page operations
│           ├── index.ts          # Export page tools
│           └── schema.ts         # Zod schemas for page operations
├── tsconfig.json
├── package.json  
├── todos.md
├── README.md
└── bun.lock
```

## License

[MIT](LICENSE)
