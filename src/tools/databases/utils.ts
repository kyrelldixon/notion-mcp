import { escapeTableCell, extractRichText } from "@/utils/markdown";
import type { GetDatabaseResponse, QueryDatabaseResponse } from "./schema";
import { isFullDatabase } from "@notionhq/client";

export function convertListDatabasesToMarkdown(response: QueryDatabaseResponse) {
  const convertedDatabases = response.results.map(db => convertDatabaseToMarkdown(db as GetDatabaseResponse));

  return `# Search Results (Databases)\n\n${convertedDatabases.join("\n\n")}`;
}

export function convertDatabaseToMarkdown(database: GetDatabaseResponse): string {
  if (!database || !isFullDatabase(database)) return "";

  let markdown = "";

  // Extract database title
  const title = extractRichText(database.title);
  if (title) {
    markdown += `# ${title} (Database)\n\n`;
  }

  // Add description if available
  const description = extractRichText(database.description);
  if (description) {
    markdown += `${description}\n\n`;
  }

  // Display database property schema
  if (database.properties) {
    markdown += "## Properties\n\n";
    markdown += "| Property Name | Type | Details |\n";
    markdown += "|------------|------|------|\n";

    Object.entries(database.properties).forEach(([key, prop]) => {
      const propName = prop.name || key;

      // Additional information based on property type
      let details = "";
      switch (prop.type) {
        case "select":
          details = `Options: ${prop.select.options.map((o: any) => o.name).join(", ")}`;
          break;
        case "multi_select":
          details = `Options: ${prop.multi_select.options.map((o: any) => o.name).join(", ")}`;
          break;
        case "relation":
          details = `Related DB: ${prop.relation?.database_id || ""}`;
          break;
        case "formula":
          details = `Formula: ${prop.formula?.expression || ""}`;
          break;
        case "rollup":
          details = `Rollup: ${prop.rollup?.function || ""}`;
          break;
        case "created_by":
        case "last_edited_by":
          details = "User reference";
          break;
        case "created_time":
        case "last_edited_time":
          details = "Timestamp";
          break;
        case "date":
          details = "Date or date range";
          break;
        case "email":
          details = "Email address";
          break;
        case "files":
          details = "File attachments";
          break;
        case "number":
          details = `Format: ${prop.number?.format || "plain number"}`;
          break;
        case "people":
          details = "People reference";
          break;
        case "phone_number":
          details = "Phone number";
          break;
        case "rich_text":
          details = "Formatted text";
          break;
        case "status":
          details = `Options: ${prop.status.options.map((o: any) => o.name).join(", ")}`;
          break;
        case "title":
          details = "Database title";
          break;
        case "url":
          details = "URL link";
          break;
        case "checkbox":
          details = "Boolean value";
          break;
      }

      markdown += `| ${escapeTableCell(
        propName
      )} | ${prop.type} | ${escapeTableCell(details)} |\n`;
    });

    markdown += "\n";
  }

  // Add link to view the database in Notion
  if (database.url) {
    markdown += `\n[View in Notion](${database.url})\n`;
  }

  return markdown;
}