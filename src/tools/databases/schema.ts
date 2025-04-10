// src/tools/databases/schema.ts
import { z } from "zod";

// Define property filter types for different data types
const textFilterConditionSchema = z.object({
  equals: z.string().optional(),
  does_not_equal: z.string().optional(),
  contains: z.string().optional(),
  does_not_contain: z.string().optional(),
  starts_with: z.string().optional(),
  ends_with: z.string().optional(),
  is_empty: z.boolean().optional(),
  is_not_empty: z.boolean().optional(),
}).partial().refine(obj => Object.keys(obj).length > 0, {
  message: "At least one filter condition is required"
});

const numberFilterConditionSchema = z.object({
  equals: z.number().optional(),
  does_not_equal: z.number().optional(),
  greater_than: z.number().optional(),
  less_than: z.number().optional(),
  greater_than_or_equal_to: z.number().optional(),
  less_than_or_equal_to: z.number().optional(),
  is_empty: z.boolean().optional(),
  is_not_empty: z.boolean().optional(),
}).partial().refine(obj => Object.keys(obj).length > 0, {
  message: "At least one filter condition is required"
});

const checkboxFilterConditionSchema = z.object({
  equals: z.boolean().optional(),
  does_not_equal: z.boolean().optional(),
}).partial().refine(obj => Object.keys(obj).length > 0, {
  message: "At least one filter condition is required"
});

const selectFilterConditionSchema = z.object({
  equals: z.string().optional(),
  does_not_equal: z.string().optional(),
  is_empty: z.boolean().optional(),
  is_not_empty: z.boolean().optional(),
}).partial().refine(obj => Object.keys(obj).length > 0, {
  message: "At least one filter condition is required"
});

const multiSelectFilterConditionSchema = z.object({
  contains: z.string().optional(),
  does_not_contain: z.string().optional(),
  is_empty: z.boolean().optional(),
  is_not_empty: z.boolean().optional(),
}).partial().refine(obj => Object.keys(obj).length > 0, {
  message: "At least one filter condition is required"
});

const dateFilterConditionSchema = z.object({
  equals: z.string().optional(),
  before: z.string().optional(),
  after: z.string().optional(),
  on_or_before: z.string().optional(),
  on_or_after: z.string().optional(),
  past_week: z.object({}).optional(),
  past_month: z.object({}).optional(),
  past_year: z.object({}).optional(),
  next_week: z.object({}).optional(),
  next_month: z.object({}).optional(),
  next_year: z.object({}).optional(),
  is_empty: z.boolean().optional(),
  is_not_empty: z.boolean().optional(),
}).partial().refine(obj => Object.keys(obj).length > 0, {
  message: "At least one filter condition is required"
});

const relationFilterConditionSchema = z.object({
  contains: z.string().optional(),
  does_not_contain: z.string().optional(),
  is_empty: z.boolean().optional(),
  is_not_empty: z.boolean().optional(),
}).partial().refine(obj => Object.keys(obj).length > 0, {
  message: "At least one filter condition is required"
});

const formulaFilterSchema = z.union([
  z.object({ string: z.any() }),
  z.object({ checkbox: z.any() }),
  z.object({ number: z.any() }),
  z.object({ date: z.any() })
]);

// Define base property filter schema
const propertyFilterSchema = z.object({
  property: z.string(),
}).and(
  z.union([
    z.object({ rich_text: textFilterConditionSchema }),
    z.object({ number: numberFilterConditionSchema }),
    z.object({ checkbox: checkboxFilterConditionSchema }),
    z.object({ select: selectFilterConditionSchema }),
    z.object({ multi_select: multiSelectFilterConditionSchema }),
    z.object({ date: dateFilterConditionSchema }),
    z.object({ relation: relationFilterConditionSchema }),
    z.object({ formula: formulaFilterSchema }),
  ])
);

// Use a type assertion for the recursive structures
const filterSchema: z.ZodType<any> = z.lazy(() =>
  z.union([
    propertyFilterSchema,
    z.object({
      and: z.array(filterSchema).optional(),
      or: z.array(filterSchema).optional(),
    }).refine(obj => obj.and !== undefined || obj.or !== undefined, {
      message: "Either 'and' or 'or' must be provided"
    })
  ])
);

// Use a union type for sorts to ensure either property OR timestamp is provided
const sortSchema = z.union([
  // Property-based sorting
  z.object({
    property: z.string(),
    direction: z.enum(["ascending", "descending"])
  }),
  // Timestamp-based sorting
  z.object({
    timestamp: z.enum(["created_time", "last_edited_time"]),
    direction: z.enum(["ascending", "descending"])
  })
]);

// Main database query tool schema
export const queryDatabaseSchema = {
  name: "notion-query-database",
  description: "Query a Notion database with optional filters and sorting",
  parameters: z.object({
    database_id: z.string().describe("ID of the database to query"),
    filter: filterSchema.optional().describe("Optional filter criteria"),
    sorts: z.array(sortSchema).optional().describe("Optional sorting criteria"),
    start_cursor: z.string().optional().describe("Pagination cursor"),
    page_size: z.number().min(1).max(100).optional().describe("Number of results per page (1-100)")
  }),
};