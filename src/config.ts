// src/config.ts
import { LogLevel } from '@notionhq/client';
import { env } from './env';

export const config = {
  notion: {
    token: env.NOTION_API_TOKEN,
    logLevel: env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.ERROR,
  },
  server: {
    name: 'Notion MCP Server',
    version: '1.0.0',
  },
} as const;