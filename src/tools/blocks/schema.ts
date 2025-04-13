import { z } from "zod"
import type { isFullBlock } from "@notionhq/client"
import { notionClient } from "@/services/notion"
import type { Narrowed } from "@/utils/types"
import { blockSchema } from "@/tools/blocks/schema/block"

export type ListBlockChildrenResponse = Awaited<ReturnType<typeof notionClient.blocks.children.list>>
export type FullOrPartialBlockObjectResponse = Awaited<ReturnType<typeof notionClient.blocks.retrieve>>
export type FullBlockObject = Narrowed<typeof isFullBlock>
export type AppendBlockChildrenResponse = Awaited<ReturnType<typeof notionClient.blocks.children.append>>

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

// Schema for appending blocks to a parent block
export const appendBlockChildrenSchema = {
  name: "notion-append-block-children",
  description: "Append new children blocks to a parent block",
  parameters: z.object({
    block_id: z.string().describe("Identifier for a block. Also accepts a page ID."),
    children: z.array(blockSchema).min(1).max(100).describe("Array of block objects to append as children. Maximum 100 blocks per request"),
    after: z.string().optional().describe("ID of the block to append after. If not specified, blocks are appended to the bottom of the parent block")
  }),
}

// Type inference for parameters
export type RetrieveBlockChildrenParams = z.infer<typeof retrieveBlockChildrenSchema.parameters>
export type AppendBlockChildrenParams = z.infer<typeof appendBlockChildrenSchema.parameters>
