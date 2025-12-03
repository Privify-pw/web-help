/**
 * Configuration Types for the Web Help Component Library
 * @module @privify-pw/web-help/types/config
 */

import type { StorageAdapter } from './storage';
import type { ContentParser } from './parser';
import type { SearchAdapter } from './search';
import type { HelpArticle, HelpSearchResult } from './content';

/**
 * Global configuration for the help system.
 * This is typically defined in a help.config.ts file.
 */
export interface HelpConfig {
  /** Content source configuration */
  content?: ContentConfig;
  /** Storage configuration for user preferences */
  storage?: StorageConfig;
  /** Search configuration */
  search?: SearchConfig;
  /** Media handling configuration */
  media?: MediaConfig;
  /** Navigation configuration */
  navigation?: NavigationConfig;
  /** Debug mode */
  debug?: boolean;
}

/**
 * Content source configuration.
 */
export interface ContentConfig {
  /** Content source type */
  source?: 'static' | 'api' | 'custom';
  /** Path to content files (for static source) */
  path?: string;
  /** API endpoint (for api source) */
  apiEndpoint?: string;
  /** Supported content formats */
  formats?: ContentFormat[];
  /** Custom content loader */
  loader?: ContentLoaderFunction;
  /** Content parsers */
  parsers?: ContentParser[];
  /** Cache configuration */
  cache?: CacheConfig;
}

/**
 * Supported content formats.
 */
export type ContentFormat = 'md' | 'mdx' | 'json' | 'csv' | 'html';

/**
 * Custom content loader function type.
 */
export type ContentLoaderFunction = (
  articleId: string,
  options?: Record<string, unknown>
) => Promise<HelpArticle | null>;

/**
 * Cache configuration.
 */
export interface CacheConfig {
  /** Enable caching */
  enabled?: boolean;
  /** Cache TTL in milliseconds */
  ttl?: number;
  /** Maximum cache size */
  maxSize?: number;
}

/**
 * Storage configuration for user preferences.
 */
export interface StorageConfig {
  /** Storage type */
  type?: 'localStorage' | 'sessionStorage' | 'cookie' | 'custom';
  /** Key prefix for stored data */
  prefix?: string;
  /** Custom storage adapter */
  adapter?: StorageAdapter;
}

/**
 * Search configuration.
 */
export interface SearchConfig {
  /** Search type */
  type?: 'client' | 'server' | 'custom';
  /** Custom search adapter */
  adapter?: SearchAdapter;
  /** Client-side search options (for fuse.js) */
  options?: ClientSearchOptions;
  /** Maximum results to return */
  maxResults?: number;
  /** Enable recent searches tracking */
  trackRecent?: boolean;
  /** Maximum recent searches to store */
  maxRecentSearches?: number;
}

/**
 * Client-side search options (fuse.js compatible).
 */
export interface ClientSearchOptions {
  /** Fuzzy matching threshold (0.0 = exact, 1.0 = match anything) */
  threshold?: number;
  /** Keys to search */
  keys?: (string | { name: string; weight: number })[];
  /** Include score in results */
  includeScore?: boolean;
  /** Include matches in results */
  includeMatches?: boolean;
  /** Minimum characters before searching */
  minMatchCharLength?: number;
  /** Enable extended search syntax */
  useExtendedSearch?: boolean;
}

/**
 * Media handling configuration.
 */
export interface MediaConfig {
  /** Image configuration */
  images?: ImageConfig;
  /** Video configuration */
  videos?: VideoConfig;
  /** Code blocks configuration */
  code?: CodeConfig;
}

/**
 * Image configuration.
 */
export interface ImageConfig {
  /** Default loading behavior */
  loading?: 'lazy' | 'eager';
  /** Enable lightbox functionality */
  lightbox?: boolean;
  /** CDN configuration */
  cdn?: CDNConfig;
  /** Image optimization settings */
  optimization?: ImageOptimizationConfig;
}

/**
 * CDN configuration.
 */
export interface CDNConfig {
  /** CDN base URL */
  baseUrl?: string;
  /** URL transformation function */
  transform?: (url: string) => string;
}

/**
 * Image optimization configuration.
 */
export interface ImageOptimizationConfig {
  /** Enable optimization */
  enabled?: boolean;
  /** Quality (1-100) */
  quality?: number;
  /** Max width for images */
  maxWidth?: number;
}

/**
 * Video configuration.
 */
export interface VideoConfig {
  /** Enable lazy loading */
  lazyLoad?: boolean;
  /** Supported providers */
  providers?: VideoProvider[];
  /** Auto-play setting */
  autoplay?: boolean;
}

/**
 * Video providers.
 */
export type VideoProvider = 'youtube' | 'vimeo' | 'custom';

/**
 * Code block configuration.
 */
export interface CodeConfig {
  /** Default language */
  defaultLanguage?: string;
  /** Show line numbers by default */
  lineNumbers?: boolean;
  /** Enable copy to clipboard */
  copyButton?: boolean;
  /** Highlight theme */
  theme?: string;
}

/**
 * Navigation configuration.
 */
export interface NavigationConfig {
  /** Enable table of contents */
  toc?: boolean;
  /** Enable breadcrumbs */
  breadcrumbs?: boolean;
  /** Enable prev/next pagination */
  pagination?: boolean;
  /** Enable related articles */
  relatedArticles?: boolean;
  /** TOC depth (heading levels to include) */
  tocDepth?: number;
}

/**
 * Callback signatures for user interaction.
 */
export interface HelpCallbacks {
  /** Called when user rates an article */
  onRate?: (articleId: string, rating: number) => void | Promise<void>;
  /** Called when user submits feedback */
  onFeedback?: (articleId: string, helpful: boolean, comment?: string) => void | Promise<void>;
  /** Called when user submits a comment */
  onComment?: (articleId: string, comment: string) => void | Promise<void>;
  /** Called when user toggles a bookmark */
  onBookmark?: (articleId: string, bookmarked: boolean) => void | Promise<void>;
  /** Called when an article is viewed */
  onArticleView?: (articleId: string) => void | Promise<void>;
  /** Called when user performs a search */
  onSearch?: (query: string, results: HelpSearchResult[]) => void | Promise<void>;
  /** Called when navigation occurs */
  onNavigate?: (fromId: string | null, toId: string) => void | Promise<void>;
  /** Called on error */
  onError?: (error: Error, context?: string) => void | Promise<void>;
}
