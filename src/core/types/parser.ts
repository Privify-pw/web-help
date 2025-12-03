/**
 * Parser Plugin Types for the Web Help Component Library
 * @module @privify-pw/web-help/types/parser
 */

import type { HelpArticleMetadata, TOCEntry } from './content';

/**
 * Content parser interface for transforming raw content into rendered HTML.
 */
export interface ContentParser {
  /** Parser name/identifier */
  name: string;
  /** File extensions this parser handles */
  extensions: string[];
  /** Parse content and return a help article */
  parse: (content: string, options?: ParserOptions) => Promise<ParseResult>;
  /** Check if the parser can handle the given content/file */
  canParse?: (content: string, filename?: string) => boolean;
}

/**
 * Options passed to the parser.
 */
export interface ParserOptions {
  /** File path/name for context */
  filename?: string;
  /** Base path for resolving relative URLs */
  basePath?: string;
  /** Parser-specific options */
  [key: string]: unknown;
}

/**
 * Result of parsing content.
 */
export interface ParseResult {
  /** Rendered HTML content */
  html: string;
  /** Extracted metadata from frontmatter */
  metadata: HelpArticleMetadata;
  /** Generated table of contents */
  toc?: TOCEntry[];
  /** Extracted assets (images, downloads, etc.) */
  assets?: AssetReference[];
  /** Any warnings during parsing */
  warnings?: string[];
}

/**
 * Reference to an asset in the content.
 */
export interface AssetReference {
  /** Asset type */
  type: 'image' | 'video' | 'download' | 'embed';
  /** Original URL in content */
  originalUrl: string;
  /** Resolved URL */
  resolvedUrl?: string;
  /** Alt text (for images) */
  alt?: string;
  /** Title */
  title?: string;
}

/**
 * Frontmatter parser result.
 */
export interface FrontmatterResult {
  /** Extracted metadata */
  metadata: HelpArticleMetadata;
  /** Content without frontmatter */
  content: string;
}

/**
 * Markdown parser plugin for extending markdown processing.
 */
export interface MarkdownPlugin {
  /** Plugin name */
  name: string;
  /** Transform the markdown before parsing */
  preTransform?: (markdown: string) => string;
  /** Transform the HTML after parsing */
  postTransform?: (html: string) => string;
  /** Custom renderer for specific elements */
  renderer?: MarkdownRenderer;
}

/**
 * Custom markdown renderer.
 */
export interface MarkdownRenderer {
  /** Render code blocks */
  code?: (code: string, language?: string) => string;
  /** Render images */
  image?: (href: string, title: string | null, alt: string) => string;
  /** Render links */
  link?: (href: string, title: string | null, text: string) => string;
  /** Render headings */
  heading?: (text: string, level: number, raw: string) => string;
  /** Render blockquotes */
  blockquote?: (quote: string) => string;
  /** Render tables */
  table?: (header: string, body: string) => string;
}

/**
 * Content validation result.
 */
export interface ValidationResult {
  /** Whether the content is valid */
  valid: boolean;
  /** Validation errors */
  errors?: ValidationError[];
  /** Validation warnings */
  warnings?: ValidationWarning[];
}

/**
 * Validation error.
 */
export interface ValidationError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Line number where error occurred */
  line?: number;
  /** Column number where error occurred */
  column?: number;
}

/**
 * Validation warning.
 */
export interface ValidationWarning {
  /** Warning code */
  code: string;
  /** Warning message */
  message: string;
  /** Line number where warning occurred */
  line?: number;
}
