/**
 * useHelpSearch Hook for the Web Help Component Library
 * @module @privify-pw/web-help/hooks/useHelpSearch
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useHelpContext } from '../context/HelpContext';
import type { HelpSearchResult, ContentIndex } from '../types/content';

/**
 * Options for useHelpSearch hook.
 */
export interface UseHelpSearchOptions {
  /** Debounce delay in ms */
  debounceMs?: number;
  /** Maximum results to return */
  maxResults?: number;
  /** Minimum query length to trigger search */
  minQueryLength?: number;
  /** Fuzzy matching threshold (0-1) */
  threshold?: number;
}

/**
 * Return type for useHelpSearch hook.
 */
export interface UseHelpSearchReturn {
  /** Current search query */
  query: string;
  /** Set the search query */
  setQuery: (query: string) => void;
  /** Search results */
  results: HelpSearchResult[];
  /** Whether search is in progress */
  isSearching: boolean;
  /** Clear search */
  clear: () => void;
  /** Perform search immediately */
  search: (query: string) => Promise<HelpSearchResult[]>;
  /** Total result count */
  totalResults: number;
}

/**
 * Default search options.
 */
const defaultOptions: Required<UseHelpSearchOptions> = {
  debounceMs: 300,
  maxResults: 10,
  minQueryLength: 2,
  threshold: 0.3,
};

/**
 * Simple client-side search implementation.
 * This can be replaced with fuse.js or a server-side search adapter.
 */
function performClientSearch(
  query: string,
  index: ContentIndex[],
  options: Required<UseHelpSearchOptions>
): HelpSearchResult[] {
  if (!query || query.length < options.minQueryLength) {
    return [];
  }

  const queryLower = query.toLowerCase();
  const scored: Array<{ item: ContentIndex; score: number }> = [];

  for (const item of index) {
    let score = 0;
    let matched = false;

    // Title match (highest weight)
    if (item.title.toLowerCase().includes(queryLower)) {
      score += 10;
      matched = true;
      if (item.title.toLowerCase().startsWith(queryLower)) {
        score += 5; // Bonus for prefix match
      }
    }

    // Content match
    if (item.content.toLowerCase().includes(queryLower)) {
      score += 5;
      matched = true;
    }

    // Tag match
    if (item.tags?.some((tag) => tag.toLowerCase().includes(queryLower))) {
      score += 3;
      matched = true;
    }

    // Category match
    if (item.category?.toLowerCase().includes(queryLower)) {
      score += 2;
      matched = true;
    }

    if (matched) {
      scored.push({ item, score });
    }
  }

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Convert to search results
  return scored.slice(0, options.maxResults).map(({ item, score }) => ({
    articleId: item.id,
    title: item.title,
    score,
    snippet: extractSnippet(item.content, queryLower),
    category: item.category,
    tags: item.tags,
  }));
}

/**
 * Extract a snippet around the matched query.
 */
function extractSnippet(content: string, query: string, contextLength = 100): string {
  const lowerContent = content.toLowerCase();
  const matchIndex = lowerContent.indexOf(query);

  if (matchIndex === -1) {
    // No match, return beginning
    return content.substring(0, contextLength * 2) + (content.length > contextLength * 2 ? '...' : '');
  }

  const start = Math.max(0, matchIndex - contextLength);
  const end = Math.min(content.length, matchIndex + query.length + contextLength);

  let snippet = content.substring(start, end);

  if (start > 0) snippet = '...' + snippet;
  if (end < content.length) snippet = snippet + '...';

  return snippet;
}

/**
 * Hook for search functionality.
 */
export function useHelpSearch(options?: UseHelpSearchOptions): UseHelpSearchReturn {
  const { getContentIndex, callbacks } = useHelpContext();

  const [query, setQueryState] = useState('');
  const [results, setResults] = useState<HelpSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Memoize options
  const mergedOptions = useMemo(() => ({ ...defaultOptions, ...options }), [options]);

  // Memoize the content index
  const contentIndex = useMemo(() => getContentIndex(), [getContentIndex]);

  // Perform search
  const performSearch = useCallback(
    async (searchQuery: string): Promise<HelpSearchResult[]> => {
      if (!searchQuery || searchQuery.length < mergedOptions.minQueryLength) {
        return [];
      }

      setIsSearching(true);
      try {
        // Use client-side search
        const searchResults = performClientSearch(searchQuery, contentIndex, mergedOptions);
        
        // Call callback
        callbacks.onSearch?.(searchQuery, searchResults);
        
        return searchResults;
      } finally {
        setIsSearching(false);
      }
    },
    [contentIndex, mergedOptions, callbacks]
  );

  // Debounced search effect
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query || query.length < mergedOptions.minQueryLength) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const searchResults = await performSearch(query);
      setResults(searchResults);
    }, mergedOptions.debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, mergedOptions.debounceMs, mergedOptions.minQueryLength, performSearch]);

  // Set query
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
  }, []);

  // Clear search
  const clear = useCallback(() => {
    setQueryState('');
    setResults([]);
  }, []);

  // Manual search
  const search = useCallback(
    async (searchQuery: string): Promise<HelpSearchResult[]> => {
      setQueryState(searchQuery);
      const searchResults = await performSearch(searchQuery);
      setResults(searchResults);
      return searchResults;
    },
    [performSearch]
  );

  return {
    query,
    setQuery,
    results,
    isSearching,
    clear,
    search,
    totalResults: results.length,
  };
}
