/**
 * Markdown Parser for the Web Help Component Library
 * @module @privify-pw/web-help/loaders/markdownParser
 */

import { Marked, type Tokens } from 'marked';
import matter from 'gray-matter';
import type { ContentParser, ParseResult, ParserOptions, AssetReference } from '../types/parser';
import type { HelpArticleMetadata, TOCEntry } from '../types/content';

/**
 * Default marked options for security and proper rendering.
 */
const defaultMarkedOptions = {
  gfm: true, // GitHub flavored markdown
  breaks: false, // Don't convert line breaks to <br>
};

/**
 * Create a markdown parser with optional configuration.
 * @returns Content parser for markdown files
 */
export function createMarkdownParser(): ContentParser {
  return {
    name: 'markdown',
    extensions: ['md', 'markdown'],

    canParse(content: string, filename?: string): boolean {
      if (filename) {
        const ext = filename.split('.').pop()?.toLowerCase();
        return ext === 'md' || ext === 'markdown';
      }
      // Check for frontmatter or common markdown patterns
      return content.trim().startsWith('---') || /^#\s/.test(content.trim());
    },

    async parse(content: string, options?: ParserOptions): Promise<ParseResult> {
      // Parse frontmatter
      const { data: frontmatter, content: markdownContent } = matter(content);

      // Extract metadata from frontmatter
      const metadata = extractMetadata(frontmatter, options);

      // Create marked instance and collect assets/TOC
      const assets: AssetReference[] = [];
      const tocEntries: TOCEntry[] = [];
      const warnings: string[] = [];

      const marked = new Marked({
        ...defaultMarkedOptions,
        hooks: {
          postprocess(html) {
            return html;
          },
        },
      });

      // Custom renderer to collect TOC and assets
      marked.use({
        renderer: {
          heading({ tokens, depth }: Tokens.Heading): string {
            const text = this.parser.parseInline(tokens);
            const id = generateHeadingId(text);
            
            tocEntries.push({
              id,
              text,
              level: depth,
            });

            return `<h${depth} id="${id}" class="help-heading help-heading-${depth}">${text}</h${depth}>`;
          },

          image({ href, title, text }: Tokens.Image): string {
            assets.push({
              type: 'image',
              originalUrl: href,
              alt: text,
              title: title ?? undefined,
            });

            const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
            return `<img src="${escapeHtml(href)}" alt="${escapeHtml(text)}"${titleAttr} class="help-image" loading="lazy" />`;
          },

          link({ href, title, tokens }: Tokens.Link): string {
            const text = this.parser.parseInline(tokens);
            const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
            const isExternal = href.startsWith('http://') || href.startsWith('https://');
            const externalAttrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
            
            return `<a href="${escapeHtml(href)}"${titleAttr}${externalAttrs} class="help-link${isExternal ? ' help-link-external' : ''}">${text}</a>`;
          },

          code({ text, lang }: Tokens.Code): string {
            const languageClass = lang ? ` language-${escapeHtml(lang)}` : '';
            return `<pre class="help-code-block${languageClass}"><code class="help-code${languageClass}">${escapeHtml(text)}</code></pre>`;
          },

          codespan({ text }: Tokens.Codespan): string {
            return `<code class="help-inline-code">${escapeHtml(text)}</code>`;
          },

          blockquote({ tokens }: Tokens.Blockquote): string {
            const body = this.parser.parse(tokens);
            return `<blockquote class="help-blockquote">${body}</blockquote>`;
          },

          table({ header, rows }: Tokens.Table): string {
            const headerHtml = header
              .map((cell) => `<th class="help-table-header">${this.parser.parseInline(cell.tokens)}</th>`)
              .join('');
            
            const bodyHtml = rows
              .map((row) => {
                const cells = row
                  .map((cell) => `<td class="help-table-cell">${this.parser.parseInline(cell.tokens)}</td>`)
                  .join('');
                return `<tr class="help-table-row">${cells}</tr>`;
              })
              .join('');

            return `<table class="help-table"><thead class="help-table-head"><tr>${headerHtml}</tr></thead><tbody class="help-table-body">${bodyHtml}</tbody></table>`;
          },

          list({ ordered, start, items }: Tokens.List): string {
            const tag = ordered ? 'ol' : 'ul';
            const startAttr = ordered && start !== 1 ? ` start="${start}"` : '';
            const itemsHtml = items
              .map((item) => {
                const checkbox = item.checked !== undefined
                  ? `<input type="checkbox" ${item.checked ? 'checked' : ''} disabled class="help-checkbox" />`
                  : '';
                return `<li class="help-list-item${item.checked !== undefined ? ' help-list-item-task' : ''}">${checkbox}${this.parser.parse(item.tokens)}</li>`;
              })
              .join('');
            
            return `<${tag}${startAttr} class="help-list help-list-${ordered ? 'ordered' : 'unordered'}">${itemsHtml}</${tag}>`;
          },

          paragraph({ tokens }: Tokens.Paragraph): string {
            return `<p class="help-paragraph">${this.parser.parseInline(tokens)}</p>`;
          },

          hr(): string {
            return '<hr class="help-divider" />';
          },
        },
      });

      // Parse markdown to HTML
      const html = await marked.parse(markdownContent);

      // Build nested TOC structure
      const toc = buildTOCTree(tocEntries);

      return {
        html,
        metadata,
        toc,
        assets,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    },
  };
}

/**
 * Extract metadata from frontmatter.
 */
function extractMetadata(
  frontmatter: Record<string, unknown>,
  options?: ParserOptions
): HelpArticleMetadata {
  return {
    version: asString(frontmatter.version),
    order: asNumber(frontmatter.order),
    prevArticle: asString(frontmatter.prevArticle) || asString(frontmatter.prev),
    nextArticle: asString(frontmatter.nextArticle) || asString(frontmatter.next),
    createdAt: asString(frontmatter.createdAt) || asString(frontmatter.created) || asString(frontmatter.date),
    updatedAt: asString(frontmatter.updatedAt) || asString(frontmatter.updated),
    category: asString(frontmatter.category),
    tags: asStringArray(frontmatter.tags),
    author: asString(frontmatter.author),
    relatedArticles: asStringArray(frontmatter.relatedArticles) || asStringArray(frontmatter.related),
    slug: asString(frontmatter.slug) || (options?.filename ? generateSlug(options.filename) : undefined),
    published: asBoolean(frontmatter.published) ?? true,
    custom: extractCustomMetadata(frontmatter),
  };
}

/**
 * Extract custom metadata fields not in the standard set.
 */
function extractCustomMetadata(frontmatter: Record<string, unknown>): Record<string, unknown> | undefined {
  const standardKeys = new Set([
    'version', 'order', 'prevArticle', 'prev', 'nextArticle', 'next',
    'createdAt', 'created', 'date', 'updatedAt', 'updated',
    'category', 'tags', 'author', 'relatedArticles', 'related',
    'slug', 'published', 'title', 'description',
  ]);

  const custom: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(frontmatter)) {
    if (!standardKeys.has(key)) {
      custom[key] = value;
    }
  }

  return Object.keys(custom).length > 0 ? custom : undefined;
}

/**
 * Generate a URL-friendly slug from a filename.
 */
function generateSlug(filename: string): string {
  return filename
    .replace(/\.[^/.]+$/, '') // Remove extension
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Generate a heading ID from text.
 */
function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Build a nested TOC tree from flat entries.
 */
function buildTOCTree(entries: TOCEntry[]): TOCEntry[] {
  if (entries.length === 0) return [];

  const result: TOCEntry[] = [];
  const stack: { entry: TOCEntry; level: number }[] = [];

  for (const entry of entries) {
    const tocEntry: TOCEntry = { ...entry, children: [] };

    // Find parent
    while (stack.length > 0 && stack[stack.length - 1].level >= entry.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      result.push(tocEntry);
    } else {
      const parent = stack[stack.length - 1].entry;
      if (!parent.children) parent.children = [];
      parent.children.push(tocEntry);
    }

    stack.push({ entry: tocEntry, level: entry.level });
  }

  // Clean up empty children arrays
  const cleanChildren = (entries: TOCEntry[]): TOCEntry[] => {
    return entries.map((e) => ({
      ...e,
      children: e.children && e.children.length > 0 ? cleanChildren(e.children) : undefined,
    }));
  };

  return cleanChildren(result);
}

/**
 * Escape HTML special characters.
 */
function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}

// Type guard helpers
function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function asStringArray(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    return value.filter((v) => typeof v === 'string') as string[];
  }
  return undefined;
}
