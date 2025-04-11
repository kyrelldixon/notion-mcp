import type { ListBlockChildrenResponse, FullOrPartialBlockObjectResponse as BlockObjectResponse } from "@/tools/blocks";
import { escapeTableCell, extractRichText } from "@/utils/markdown";
import { isFullBlock } from "@notionhq/client";

export function convertBlockChildrenToMarkdown(response: ListBlockChildrenResponse): string {
  const convertedBlocks = response.results.map(item => convertBlockToMarkdown(item));

  let markdown = `# Block Contents\n\n${convertedBlocks.join("\n\n")}`;

  // Include pagination info if available
  if (response.has_more) {
    markdown +=
      "\n\u003e More results available. Use `start_cursor` parameter with the next request.\n";
    if (response.next_cursor) {
      markdown += `\u003e Next cursor: \`${response.next_cursor}\`\n`;
    }
  }

  return markdown;
}

export function convertBlockToMarkdown(block: BlockObjectResponse): string {
  if (!block) return "";

  if (!isFullBlock(block)) {
    return `\`\`\`json\n${JSON.stringify(block, null, 2)}\n\`\`\``;
  }

  switch (block.type) {
    case "paragraph":
      return extractRichText(block.paragraph.rich_text);

    case "heading_1":
      return `# ${extractRichText(block.heading_1.rich_text)}`;

    case "heading_2":
      return `## ${extractRichText(block.heading_2.rich_text)}`;

    case "heading_3":
      return `### ${extractRichText(block.heading_3.rich_text)}`;

    case "bulleted_list_item":
      return `- ${extractRichText(block.bulleted_list_item.rich_text)}`;

    case "numbered_list_item":
      return `1. ${extractRichText(block.numbered_list_item.rich_text)}`;

    case "to_do":
      const checked = block.to_do.checked ? "x" : " ";
      return `- [${checked}] ${extractRichText(block.to_do.rich_text)}`;

    case "toggle":
      return `<details>\n<summary>${extractRichText(
        block.toggle.rich_text
      )}</summary>\n\n*Additional API request is needed to display child blocks*\n\n</details>`;

    case "child_page":
      return `📄 **Child Page**: ${block.child_page.title}`;

    case "image":
      const imageUrl = block.image.type === 'external' ? block.image.external.url : block.image.file.url;
      const imageCaption = extractRichText(block.image.caption);
      return `![${imageCaption}](${imageUrl})`;

    case "divider":
      return "---";

    case "quote":
      return `> ${extractRichText(block.quote.rich_text)}`;

    case "code":
      const codeLanguage = block.code.language || "plaintext";
      const codeContent = extractRichText(block.code.rich_text);
      return `\`\`\`${codeLanguage}\n${codeContent}\n\`\`\``;

    case "callout":
      const calloutIcon = block.callout.icon?.type === 'emoji' ? block.callout.icon.emoji : '';
      const calloutText = extractRichText(block.callout.rich_text);
      return `> ${calloutIcon} ${calloutText}`;

    case "bookmark":
      const bookmarkUrl = block.bookmark.url || "";
      const bookmarkCaption =
        extractRichText(block.bookmark.caption || []) || bookmarkUrl;
      return `[${bookmarkCaption}](${bookmarkUrl})`;

    case "table":
      return `*Table data (${block.table.table_width || 0
        } columns) - Additional API request is needed to display details*`;

    case "child_database":
      return `📊 **Embedded Database**: \`${block.id}\``;

    case "breadcrumb":
      return `[breadcrumb navigation]`;

    case "embed":
      const embedUrl = block.embed.url || "";
      return `<iframe src="${embedUrl}" frameborder="0"></iframe>`;

    case "equation":
      const formulaText = block.equation.expression || "";
      return `$$${formulaText}$$`;

    case "file":
      const fileUrl =
        block.file.type === "external"
          ? block.file.external.url
          : block.file.file?.url;
      const fileName = block.file.name;
      return `📎 [${fileName}](${fileUrl})`;

    case "link_preview":
      const previewUrl = block.link_preview.url || "";
      return `🔗 [Preview](${previewUrl})`;

    case "link_to_page":
      let linkText = "Link to page";
      let linkId = "";
      if (block.link_to_page.type === 'page_id') {
        linkId = block.link_to_page.page_id;
        linkText = "Link to page";
      } else if (block.link_to_page.type === 'database_id') {
        linkId = block.link_to_page.database_id;
        linkText = "Link to database";
      }
      return `🔗 **${linkText}**: \`${linkId}\``;

    case "pdf":
      const pdfUrl =
        block.pdf.type === "external"
          ? block.pdf.external?.url
          : block.pdf.file?.url;
      const pdfCaption = extractRichText(block.pdf.caption);
      return `📄 [${pdfCaption}](${pdfUrl})`;

    case "synced_block":
      const syncedFrom = block.synced_block.synced_from
        ? `\`${block.synced_block.synced_from.block_id}\``
        : "original";
      return `*Synced Block (${syncedFrom}) - Additional API request is needed to display content*`;

    case "table_of_contents":
      return `[TOC]`;

    case "table_row":
      if (!block.table_row.cells || !Array.isArray(block.table_row.cells)) {
        return "*Empty table row*";
      }
      return `| ${block.table_row.cells
        .map((cell: any) => escapeTableCell(extractRichText(cell)))
        .join(" | ")} |`;

    case "template":
      return `*Template Block: ${extractRichText(
        block.template.rich_text || []
      )}*`;

    case "video":
      const videoUrl =
        block.video.type === "external"
          ? block.video.external?.url
          : block.video.file?.url;
      const videoCaption =
        extractRichText(block.video.caption);
      return `🎬 [${videoCaption}](${videoUrl})`;

    case "unsupported":
      return `*Unsupported block*`;

    default:
      return `*Unsupported block type: ${block.type}*`;
  }
}
