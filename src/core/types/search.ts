/**
 * Search Types for the Web Help Component Library
 * @module @privify-pw/web-help/types/search
 */

import type { HelpSearchResult, ContentIndex } from './content';

/**
 * Search adapter interface for implementing custom search backends.
 */
export interface SearchAdapter {
  /** Adapter name */
  name: string;
  
  /**
   * Initialize the search index with content.
   * @param content - Array of content to index
   */
  initialize(content: ContentIndex[]): Promise<void>;
  
  /**
   * Search for content.
   * @param query - Search query
   * @param options - Search options
   * @returns Array of search results
   */
  search(query: string, options?: SearchOptions): Promise<HelpSearchResult[]>;
  
  /**
   * Add content to the index.
   * @param content - Content to add
   */
  add?(content: ContentIndex): Promise<void>;
  
  /**
   * Update content in the index.
   * @param content - Content to update
   */
  update?(content: ContentIndex): Promise<void>;
  
  /**
   * Remove content from the index.
   * @param id - Content ID to remove
   */
  remove?(id: string): Promise<void>;
  
  /**
   * Clear the entire index.
   */
  clear?(): Promise<void>;
}

/**
 * Search options.
 */
export interface SearchOptions {
  /** Maximum number of results */
  limit?: number;
  /** Filter by category */
  category?: string;
  /** Filter by tags */
  tags?: string[];
  /** Include score in results */
  includeScore?: boolean;
  /** Include match highlights */
  includeHighlights?: boolean;
  /** Fuzzy matching threshold */
  threshold?: number;
  /** Sort by field */
  sortBy?: 'relevance' | 'date' | 'title';
  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
}

/**
 * Search state for the UI.
 */
export interface SearchState {
  /** Current search query */
  query: string;
  /** Search results */
  results: HelpSearchResult[];
  /** Whether a search is in progress */
  isSearching: boolean;
  /** Error if search failed */
  error?: Error;
  /** Total number of results */
  totalResults?: number;
  /** Current page (for pagination) */
  page?: number;
  /** Recent search queries */
  recentSearches?: string[];
}

/**
 * Search suggestion.
 */
export interface SearchSuggestion {
  /** Suggestion text */
  text: string;
  /** Type of suggestion */
  type: 'query' | 'article' | 'category' | 'tag';
  /** Associated ID (for article/category/tag) */
  id?: string;
  /** Match highlight positions */
  highlights?: [number, number][];
}
