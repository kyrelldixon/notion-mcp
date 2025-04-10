// src/env.ts
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    // Notion API configuration
    NOTION_API_TOKEN: z.string().min(1, "Notion API token is required"),

    // Server configuration
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    // Optional: additional configuration for your application
    LOG_LEVEL: z
      // use string so any case is accepted ex. info, Info, INFO
      .string()
      // transform to uppercase
      .transform((val) => val.toUpperCase())
      // validate against allowed values
      .pipe(z.enum(["DEBUG", "INFO", "WARN", "ERROR"]))
      .default("INFO")
  },

  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});