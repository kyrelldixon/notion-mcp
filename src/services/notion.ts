// src/services/notion.ts
import { Client } from '@notionhq/client';
import { config } from '@/config';

export const notionClient = new Client({
  auth: config.notion.token,
  logLevel: config.notion.logLevel,
});