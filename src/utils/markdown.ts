import type { RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints"

/**
 * Extracts plain text from a Notion rich text array
 */
export function extractRichText(richTextArray: RichTextItemResponse[]): string {
  if (!richTextArray || !Array.isArray(richTextArray)) return "";

  return richTextArray
    .map((item) => {
      let text = item.plain_text || "";

      // Process annotations
      if (item.annotations) {
        const { bold, italic, strikethrough, code } = item.annotations;

        if (code) text = `\`${text}\``;
        if (bold) text = `**${text}**`;
        if (italic) text = `*${text}*`;
        if (strikethrough) text = `~~${text}~~`;
      }

      // Process links
      if (item.href) {
        text = `[${text}](${item.href})`;
      }

      return text;
    })
    .join("");
}

/**
 * Escapes characters that need special handling in Markdown table cells
 */
export function escapeTableCell(text: string): string {
  if (!text) return "";
  return text.replace(/\|/g, "\\|").replace(/\n/g, " ").replace(/\+/g, "\\+");
}