import { isFullPage } from "@notionhq/client";
import { escapeTableCell, extractRichText } from "@/utils/markdown";
import type { FullPageObject, GetPageResponse, PageProperty } from "./schema";

/**
 * Converts a Notion page to Markdown
 */
export function convertPageToMarkdown(page: GetPageResponse): string {
  if (!isFullPage(page)) return "";
  let markdown = "";

  // Extract title (from properties)
  const title = extractPageTitle(page);
  if (title) {
    markdown += `# ${title}\n\n`;
  }

  // Display page properties as a Markdown table
  markdown += convertPropertiesToMarkdown(page.properties);

  // Include additional information if there are child blocks
  markdown +=
    "\n\n> This page contains child blocks. You can retrieve them using `retrieveBlockChildren`.\n";
  markdown += `> Block ID: \`${page.id}\`\n`;

  // Add link to view the page in Notion
  if (page.url) {
    markdown += `\n[View in Notion](${page.url})\n`;
  }

  return markdown;
}

/**
 * Extracts page title
 */
function extractPageTitle(page: FullPageObject): string {
  if (!page || !page.properties) return "";

  // Look for the title property
  for (const [_, prop] of Object.entries(page.properties)) {
    if (prop.type === "title" && Array.isArray(prop.title)) {
      return extractRichText(prop.title);
    }
  }

  return "";
}

/**
 * Converts page properties to Markdown
 */
function convertPropertiesToMarkdown(
  properties: Record<string, PageProperty>
): string {
  if (!properties) return "";

  let markdown = "## Properties\n\n";

  // Display properties as a key-value table
  markdown += "| Property | Value |\n";
  markdown += "|------------|----|\n";

  for (const [propName, property] of Object.entries(properties)) {
    let propValue = "";

    // Extract value based on property type
    switch (property.type) {
      case "title":
        propValue = extractRichText(property.title || []);
        break;
      case "rich_text":
        propValue = extractRichText(property.rich_text || []);
        break;
      case "number":
        propValue = property.number?.toString() || "";
        break;
      case "select":
        propValue = property.select?.name || "";
        break;
      case "multi_select":
        propValue = (property.multi_select || [])
          .map((item: any) => item.name)
          .join(", ");
        break;
      case "date":
        const start = property.date?.start || "";
        const end = property.date?.end ? ` → ${property.date.end}` : "";
        propValue = start + end;
        break;
      case "people":
        propValue = (property.people || [])
          .map((person: any) => person.name || person.id)
          .join(", ");
        break;
      case "files":
        propValue = (property.files || [])
          .map(
            (file: any) =>
              `[${file.name || "Attachment"}](${file.file?.url || file.external?.url || "#"
              })`
          )
          .join(", ");
        break;
      case "checkbox":
        propValue = property.checkbox ? "✓" : "✗";
        break;
      case "url":
        propValue = property.url || "";
        break;
      case "email":
        propValue = property.email || "";
        break;
      case "phone_number":
        propValue = property.phone_number || "";
        break;
      case "formula":
        propValue =
          property.formula.type === 'number' && property.formula.number ? property.formula.number.toString() :
            property.formula.type === 'boolean' && property.formula.boolean ? property.formula.boolean.toString() :
              property.formula.type === 'date' && property.formula.date ? property.formula.date.start :
                property.formula.type === 'string' && property.formula.string ? property.formula.string :
                  "";
        break;
      case "status":
        propValue = property.status?.name || "";
        break;
      case "relation":
        propValue = (property.relation || [])
          .map((relation: any) => `\`${relation.id}\``)
          .join(", ");
        break;
      case "rollup":
        if (property.rollup.type === "array") {
          propValue = JSON.stringify(property.rollup.array || []);
        } else if (property.rollup.type === "number") {
          propValue = property.rollup.number?.toString() ?? "";
        } else if (property.rollup.type === "date") {
          propValue = property.rollup.date?.start ?? "";
        } else {
          propValue = "";
        }
        break;
      case "created_by":
        propValue = property.created_by.id
        break;
      case "created_time":
        propValue = property.created_time || "";
        break;
      case "last_edited_by":
        propValue = property.last_edited_by.id
        break;
      case "last_edited_time":
        propValue = property.last_edited_time || "";
        break;
      default:
        propValue = "(Unsupported property type)";
    }

    markdown += `| ${escapeTableCell(propName)} | ${escapeTableCell(
      propValue
    )} |\n`;
  }

  return markdown;
}