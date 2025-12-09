"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";

export function CopyMarkdownButton() {
  const [copied, setCopied] = useState(false);

  const convertToMarkdown = () => {
    const main = document.querySelector("main");
    if (!main) return "";

    let markdown = "";
    
    // First, handle mermaid diagrams
    const mermaidDivs = main.querySelectorAll("[data-mermaid-source]");
    mermaidDivs.forEach((div) => {
      const source = div.getAttribute("data-mermaid-source");
      if (source) {
        markdown += `\`\`\`mermaid\n${source}\n\`\`\`\n\n`;
      }
    });

    const elements = main.querySelectorAll("h1, h2, h3, h4, p, pre, code, ul, ol, li, blockquote, table, tr, th, td, a, strong, em");

    elements.forEach((el) => {
      const tag = el.tagName.toLowerCase();
      const text = el.textContent?.trim() || "";

      // Skip if already processed as part of parent
      if (el.closest("pre") && tag !== "pre") return;
      if (el.closest("code") && tag !== "code" && !el.closest("pre")) return;
      // Skip if inside mermaid container
      if (el.closest("[data-mermaid-source]")) return;

      switch (tag) {
        case "h1":
          markdown += `# ${text}\n\n`;
          break;
        case "h2":
          markdown += `## ${text}\n\n`;
          break;
        case "h3":
          markdown += `### ${text}\n\n`;
          break;
        case "h4":
          markdown += `#### ${text}\n\n`;
          break;
        case "p":
          if (!el.closest("li")) {
            markdown += `${text}\n\n`;
          }
          break;
        case "pre":
          const codeBlock = el.querySelector("code");
          const code = codeBlock?.textContent || text;
          const language = codeBlock?.className.match(/language-(\w+)/)?.[1] || "";
          markdown += `\`\`\`${language}\n${code}\n\`\`\`\n\n`;
          break;
        case "code":
          if (!el.closest("pre")) {
            markdown += `\`${text}\``;
          }
          break;
        case "blockquote":
          markdown += `> ${text}\n\n`;
          break;
        case "strong":
          markdown += `**${text}**`;
          break;
        case "em":
          markdown += `*${text}*`;
          break;
        case "a":
          const href = (el as HTMLAnchorElement).href;
          markdown += `[${text}](${href})`;
          break;
      }
    });

    return markdown.trim();
  };

  const handleCopy = async () => {
    const markdown = convertToMarkdown();
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 h-9 px-4 rounded-md border border-slate-200 bg-white text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-colors"
      aria-label="Copy page as markdown"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-green-600" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          <span>Copy as Markdown</span>
        </>
      )}
    </button>
  );
}