// src/tools/databases/schema.ts
import { z } from "zod";

// Define database property types for database creation and updates
const titlePropertySchema = z.object({
  title: z.object({})
}).describe("Title property (required for all databases)")

const richTextPropertySchema = z.object({
  rich_text: z.object({})
}).describe("Rich text property")

const numberPropertySchema = z.object({
  number: z.object({
    format: z.enum(["number", "number_with_commas", "percent", "dollar", "euro", "pound", "yen", "ruble", "rupee", "won", "yuan"]).optional()
  })
}).describe("Number property with optional formatting")

const selectPropertySchema = z.object({
  select: z.object({
    options: z.array(z.object({
      name: z.string().describe("Option name"),
      color: z.enum(["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]).optional().describe("Option color")
    })).optional().describe("Predefined select options")
  })
}).describe("Select property with optional predefined options")

const multiSelectPropertySchema = z.object({
  multi_select: z.object({
    options: z.array(z.object({
      name: z.string().describe("Option name"),
      color: z.enum(["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]).optional().describe("Option color")
    })).optional().describe("Predefined multi-select options")
  })
}).describe("Multi-select property with optional predefined options")

const datePropertySchema = z.object({
  date: z.object({})
}).describe("Date property")

const peoplePropertySchema = z.object({
  people: z.object({})
}).describe("People property")

const filesPropertySchema = z.object({
  files: z.object({})
}).describe("Files property")

const checkboxPropertySchema = z.object({
  checkbox: z.object({})
}).describe("Checkbox property")

const urlPropertySchema = z.object({
  url: z.object({})
}).describe("URL property")

const emailPropertySchema = z.object({
  email: z.object({})
}).describe("Email property")

const phoneNumberPropertySchema = z.object({
  phone_number: z.object({})
}).describe("Phone number property")

const databasePropertySchema = z.record(
  z.string().describe("Property name"),
  z.union([
    titlePropertySchema,
    richTextPropertySchema,
    numberPropertySchema,
    selectPropertySchema,
    multiSelectPropertySchema,
    datePropertySchema,
    peoplePropertySchema,
    filesPropertySchema,
    checkboxPropertySchema,
    urlPropertySchema,
    emailPropertySchema,
    phoneNumberPropertySchema
  ]).describe("Property configuration")
).describe("Database properties configuration")

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

// Database creation tool schema
export const createDatabaseSchema = {
  name: "notion-create-database",
  description: "Create a new database as a child of a specified parent page",
  parameters: z.object({
    parent_page_id: z.string().describe("ID of the parent page where the database will be created"),
    title: z.string().describe("Title of the database"),
    properties: databasePropertySchema.refine(
      (props) => {
        // Ensure there's exactly one title property
        const titleProps = Object.entries(props).filter(([_, value]) => 'title' in value);
        return titleProps.length === 1;
      },
      {
        message: "Database must have exactly one title property"
      }
    ).describe("Properties schema for the database"),
    icon: z.object({
      emoji: z.string().describe("Emoji character for the icon")
    }).optional().describe("Optional emoji icon for the database"),
    cover: z.object({
      type: z.enum(["external"]),
      external: z.object({
        url: z.string().url()
      })
    }).optional().describe("Optional external cover image for the database")
  }),
};

// Database update tool schema
export const updateDatabaseSchema = {
  name: "notion-update-database",
  description: "Update an existing database's title, description, or properties",
  parameters: z.object({
    database_id: z.string().describe("ID of the database to update"),
    title: z.string().optional().describe("New title for the database"),
    description: z.array(
      z.object({
        type: z.literal("text"),
        text: z.object({
          content: z.string().describe("Text content for the description")
        })
      })
    ).optional().describe("Rich text array for database description"),
    properties: z.record(
      z.string().describe("Property name"),
      z.union([
        // To remove a property, set it to null
        z.null(),
        // Or provide a property configuration
        z.union([
          titlePropertySchema,
          richTextPropertySchema,
          numberPropertySchema,
          datePropertySchema,
          peoplePropertySchema,
          filesPropertySchema,
          checkboxPropertySchema,
          urlPropertySchema,
          emailPropertySchema,
          phoneNumberPropertySchema,
          multiSelectPropertySchema
        ])
      ])
    ).optional().describe("Properties to update or remove (set to null to remove)"),
  }),
};