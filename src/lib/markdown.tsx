import { promises as fs } from "node:fs";
import path from "node:path";
import { Fragment, type ReactNode } from "react";

const CASE_STUDIES_DIR = path.join(
  process.cwd(),
  "public",
  "projects-case_studies"
);

/** Read a case-study markdown file from the public directory at build time. */
export async function loadCaseStudyMarkdown(file: string): Promise<string> {
  // Guard against path traversal — only a bare filename is allowed.
  const safe = path.basename(file);
  return fs.readFile(path.join(CASE_STUDIES_DIR, safe), "utf8");
}

/**
 * Replace client-identifying names with neutral descriptors so case studies
 * can be published without naming the client. Order matters (longer/branded
 * phrases first). Generic product/tech terms (Databricks, etc.) are kept.
 */
const CLIENT_SCRUBS: [RegExp, string][] = [
  [/\bUK Power Networks\b/g, "the network operator"],
  [/\bUKPN\b/g, "the network operator"],
  [/\bVirgin Atlantic\b/g, "the airline"],
  [/\bGreene Genie\b/g, "the assistant"],
  [/\bGreene King\b/g, "the company"],
  [/\bNorthumbrian Water\b/g, "the utility"],
  [/\bCivitas\b/gi, "the platform"],
  [/\bIntelex\b/g, "the incident system"],
  [/\bSalesforce\b/gi, "the CRM"],
];

export function scrubClientNames(md: string): string {
  return CLIENT_SCRUBS.reduce((text, [re, repl]) => text.replace(re, repl), md);
}

/**
 * Build a single continuous "about the project" body from a case study:
 * keep the Business Overview + How It Works content, drop the deep technical
 * reference (Part Three), drop the H1 title, and remove the "Part One/Two/…"
 * divider headings so it reads as one overview. Client names are scrubbed.
 */
export function extractClientFacingMarkdown(md: string): string {
  const partThreeIdx = md.search(/^##\s+Part Three\b/m);
  let body = partThreeIdx === -1 ? md : md.slice(0, partThreeIdx);
  // Drop the top-level H1 title line.
  body = body.replace(/^#\s+.*$/m, "");
  // Drop the "## Part One — …" / "## Part Two — …" divider headings entirely
  // so the remaining paragraphs flow as one continuous overview.
  body = body.replace(/^##\s+Part\s+\w+\b.*$/gim, "");
  return scrubClientNames(body.trim());
}

/** Inline formatting: **bold** and `code`. Order-safe, no raw HTML. */
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const regex = /(\*\*([^*]+)\*\*|`([^`]+)`)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    if (match[2] !== undefined) {
      nodes.push(<strong key={key++}>{match[2]}</strong>);
    } else if (match[3] !== undefined) {
      nodes.push(
        <code
          key={key++}
          className="bg-paper-2 text-accent font-mono"
          style={{
            borderRadius: "var(--radius-control)",
            paddingInline: "0.35em",
            fontSize: "0.85em",
          }}
        >
          {match[3]}
        </code>
      );
    }
    last = regex.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/**
 * Render the small markdown subset these case studies use (##/### headings,
 * paragraphs) into styled React elements. Blank-line separated; each non-empty
 * non-heading line becomes a paragraph (these files store one paragraph per
 * very long line).
 */
export function renderMarkdown(md: string): ReactNode {
  const lines = md.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let key = 0;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    if (line.startsWith("### ")) {
      blocks.push(
        <h3
          key={key++}
          className="text-md"
          style={{
            marginBlockStart: "var(--space-xl)",
            marginBlockEnd: "var(--space-sm)",
          }}
        >
          {renderInline(line.slice(4))}
        </h3>
      );
    } else if (line.startsWith("## ")) {
      // Ink, not accent: accenting every document heading floods the page with
      // the highlighter colour and leaves nothing for it to actually mark.
      blocks.push(
        <h2
          key={key++}
          className="text-lg md:text-xl"
          style={{
            marginBlockStart: "var(--space-2xl)",
            marginBlockEnd: "var(--space-md)",
          }}
        >
          {renderInline(line.slice(3))}
        </h2>
      );
    } else {
      blocks.push(
        <p
          key={key++}
          className="text-muted text-base"
          style={{ marginBlockEnd: "var(--space-md)" }}
        >
          {renderInline(line)}
        </p>
      );
    }
  }

  return <Fragment>{blocks}</Fragment>;
}
