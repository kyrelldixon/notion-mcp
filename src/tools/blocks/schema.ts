import { z } from "zod"
import type { isFullBlock } from "@notionhq/client";
import { notionClient } from "@/services/notion"
import type { Narrowed } from "@/utils/types";

export type ListBlockChildrenResponse = Awaited<ReturnType<typeof notionClient.blocks.children.list>>
export type FullOrPartialBlockObjectResponse = Awaited<ReturnType<typeof notionClient.blocks.retrieve>>
export type FullBlock = Narrowed<typeof isFullBlock>;

// Schema for retrieving block children
export const retrieveBlockChildrenSchema = {
  name: "notion-retrieve-block-children",
  description: "Retrieve all children blocks of a block",
  parameters: z.object({
    format: z.enum(["json", "markdown"]).optional().default("json").describe("Format of the response. Default is 'json'."),
    block_id: z.string().describe("ID of the block to retrieve children for. This could also be a page ID"),
    page_size: z.number().min(1).max(100).optional().describe("Number of blocks to return per page (default: 100, max: 100)"),
    start_cursor: z.string().optional().describe("Cursor to start from for pagination")
  }),
}

// Type inference for parameters
export type RetrieveBlockChildrenParams = z.infer<typeof retrieveBlockChildrenSchema.parameters>
