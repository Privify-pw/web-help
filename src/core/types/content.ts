/**
 * Content Types for the Web Help Component Library
 * @module @privify-pw/web-help/types/content
 */

/**
 * Represents a help article with its content and metadata.
 */
export interface HelpArticle {
  /** Unique identifier for the article */
  id: string;
  /** Article title */
  title: string;
  /** Brief description or summary */
  description?: string;
  /** Raw content (markdown, MDX, etc.) */
  content: string;
  /** Parsed/rendered HTML content */
  renderedContent?: string;
  /** Article metadata */
  metadata: HelpArticleMetadata;
}

/**
 * Metadata associated with a help article.
 */
export interface HelpArticleMetadata {
  /** Article version */
  version?: string;
  /** Display order within category */
  order?: number;
  /** Previous article ID for navigation */
  prevArticle?: string;
  /** Next article ID for navigation */
  nextArticle?: string;
  /** Creation timestamp (ISO 8601) */
  createdAt?: string;
  /** Last update timestamp (ISO 8601) */
  updatedAt?: string;
  /** Category the article belongs to */
  category?: string;
  /** Tags for organization and search */
  tags?: string[];
  /** Author information */
  author?: string;
  /** Related article IDs */
  relatedArticles?: string[];
  /** Slug for URL */
  slug?: string;
  /** Whether the article is published */
  published?: boolean;
  /** Custom metadata fields */
  custom?: Record<string, unknown>;
}

/**
 * Represents a category of help articles.
 */
export interface HelpCategory {
  /** Unique identifier for the category */
  id: string;
  /** Category name */
  name: string;
  /** Category description */
  description?: string;
  /** Display order */
  order?: number;
  /** Parent category ID for nested categories */
  parentId?: string;
  /** Icon or image for the category */
  icon?: string;
  /** Number of articles in this category */
  articleCount?: number;
}

/**
 * Represents a tag for organizing content.
 */
export interface HelpTag {
  /** Unique identifier for the tag */
  id: string;
  /** Tag name/label */
  name: string;
  /** Tag color (for UI) */
  color?: string;
  /** Number of articles with this tag */
  articleCount?: number;
}

/**
 * Table of contents entry generated from article headings.
 */
export interface TOCEntry {
  /** Heading ID (anchor) */
  id: string;
  /** Heading text */
  text: string;
  /** Heading level (1-6) */
  level: number;
  /** Nested entries */
  children?: TOCEntry[];
}

/**
 * Search result item.
 */
export interface HelpSearchResult {
  /** Article ID */
  articleId: string;
  /** Article title */
  title: string;
  /** Search relevance score */
  score: number;
  /** Matched content snippet */
  snippet?: string;
  /** Category of the article */
  category?: string;
  /** Tags of the article */
  tags?: string[];
  /** Matching highlights */
  highlights?: SearchHighlight[];
}

/**
 * Search highlight information.
 */
export interface SearchHighlight {
  /** Field that matched */
  field: string;
  /** Matched text with highlighting */
  matchedText: string;
  /** Match indices */
  indices?: [number, number][];
}

/**
 * Content index for search.
 */
export interface ContentIndex {
  /** Article ID */
  id: string;
  /** Article title */
  title: string;
  /** Article content (plain text for search) */
  content: string;
  /** Category */
  category?: string;
  /** Tags */
  tags?: string[];
  /** Keywords extracted from content */
  keywords?: string[];
}

/**
 * Breadcrumb navigation item.
 */
export interface BreadcrumbItem {
  /** Label to display */
  label: string;
  /** Navigation path/URL */
  path?: string;
  /** Article or category ID */
  id?: string;
  /** Whether this is the current page */
  current?: boolean;
}

/**
 * Navigation state for prev/next.
 */
export interface NavigationState {
  /** Current article ID */
  currentArticle?: string;
  /** Previous article */
  prev?: {
    id: string;
    title: string;
    path?: string;
  };
  /** Next article */
  next?: {
    id: string;
    title: string;
    path?: string;
  };
  /** Breadcrumb trail */
  breadcrumbs?: BreadcrumbItem[];
}
