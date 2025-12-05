/**
 * Search Adapters for the Web Help Component Library
 * @module @piikeep-pw/web-help/loaders/searchAdapters
 */

import Fuse from 'fuse.js';
import type { SearchAdapter, SearchOptions } from '../types/search';
import type { HelpSearchResult, ContentIndex } from '../types/content';

/**
 * Fuse.js-based search adapter for client-side search.
 */
export class FuseSearchAdapter implements SearchAdapter {
  name = 'fuse';
  private fuse: Fuse<ContentIndex> | null = null;
  private content: ContentIndex[] = [];

  /**
   * Initialize the search index.
   */
  async initialize(content: ContentIndex[]): Promise<void> {
    this.content = content;
    this.fuse = new Fuse(content, {
      keys: [
        { name: 'title', weight: 3 },
        { name: 'content', weight: 1 },
        { name: 'tags', weight: 2 },
        { name: 'category', weight: 1.5 },
      ],
      threshold: 0.3,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
    });
  }

  /**
   * Search for content.
   */
  async search(
    query: string,
    options: SearchOptions = {},
  ): Promise<HelpSearchResult[]> {
    if (!this.fuse) {
      throw new Error('Search adapter not initialized');
    }

    let fuseResults = this.fuse.search(query, {
      limit: options.limit ?? 10,
    });

    // Filter by category if specified
    if (options.category) {
      fuseResults = fuseResults.filter(
        (result) => result.item.category === options.category,
      );
    }

    // Filter by tags if specified
    if (options.tags && options.tags.length > 0) {
      fuseResults = fuseResults.filter((result) =>
        options.tags!.some((tag) => result.item.tags?.includes(tag)),
      );
    }

    // Convert to HelpSearchResult
    const results: HelpSearchResult[] = fuseResults.map((result) => ({
      articleId: result.item.id,
      title: result.item.title,
      score: result.score ?? 0,
      snippet: this.extractSnippet(result.item.content, query),
      category: result.item.category,
      tags: result.item.tags,
      matches: options.includeHighlights ? result.matches : undefined,
    }));

    // Sort results
    if (options.sortBy) {
      this.sortResults(results, options.sortBy, options.sortDirection ?? 'asc');
    }

    return results;
  }

  /**
   * Add content to the index.
   */
  async add(content: ContentIndex): Promise<void> {
    this.content.push(content);
    await this.initialize(this.content);
  }

  /**
   * Update content in the index.
   */
  async update(content: ContentIndex): Promise<void> {
    const index = this.content.findIndex((item) => item.id === content.id);
    if (index !== -1) {
      this.content[index] = content;
      await this.initialize(this.content);
    }
  }

  /**
   * Remove content from the index.
   */
  async remove(id: string): Promise<void> {
    this.content = this.content.filter((item) => item.id !== id);
    await this.initialize(this.content);
  }

  /**
   * Clear the entire index.
   */
  async clear(): Promise<void> {
    this.content = [];
    this.fuse = null;
  }

  /**
   * Extract a snippet around the matched query.
   */
  private extractSnippet(
    content: string,
    query: string,
    contextLength = 100,
  ): string {
    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const matchIndex = lowerContent.indexOf(lowerQuery);

    if (matchIndex === -1) {
      // No match, return beginning
      return (
        content.substring(0, contextLength * 2) +
        (content.length > contextLength * 2 ? '...' : '')
      );
    }

    const start = Math.max(0, matchIndex - contextLength);
    const end = Math.min(
      content.length,
      matchIndex + query.length + contextLength,
    );

    let snippet = content.substring(start, end);

    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';

    return snippet;
  }

  /**
   * Sort search results.
   */
  private sortResults(
    results: HelpSearchResult[],
    sortBy: 'relevance' | 'date' | 'title',
    direction: 'asc' | 'desc',
  ): void {
    results.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'relevance':
          comparison = (a.score ?? 0) - (b.score ?? 0);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          // Date sorting would require date field in results
          comparison = 0;
          break;
      }

      return direction === 'asc' ? comparison : -comparison;
    });
  }
}

/**
 * Simple client-side search adapter (no dependencies).
 */
export class SimpleSearchAdapter implements SearchAdapter {
  name = 'simple';
  private content: ContentIndex[] = [];

  /**
   * Initialize the search index.
   */
  async initialize(content: ContentIndex[]): Promise<void> {
    this.content = content;
  }

  /**
   * Search for content using simple string matching.
   */
  async search(
    query: string,
    options: SearchOptions = {},
  ): Promise<HelpSearchResult[]> {
    const queryLower = query.toLowerCase();
    const scored: Array<{ item: ContentIndex; score: number }> = [];

    for (const item of this.content) {
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

      // Apply filters
      if (options.category && item.category !== options.category) {
        matched = false;
      }

      if (
        options.tags &&
        options.tags.length > 0 &&
        !options.tags.some((tag) => item.tags?.includes(tag))
      ) {
        matched = false;
      }

      if (matched) {
        scored.push({ item, score });
      }
    }

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // Convert to search results
    const results = scored
      .slice(0, options.limit ?? 10)
      .map(({ item, score }) => ({
        articleId: item.id,
        title: item.title,
        score,
        snippet: this.extractSnippet(item.content, queryLower),
        category: item.category,
        tags: item.tags,
      }));

    // Apply sorting if specified
    if (options.sortBy && options.sortBy !== 'relevance') {
      this.sortResults(results, options.sortBy, options.sortDirection ?? 'asc');
    }

    return results;
  }

  /**
   * Add content to the index.
   */
  async add(content: ContentIndex): Promise<void> {
    this.content.push(content);
  }

  /**
   * Update content in the index.
   */
  async update(content: ContentIndex): Promise<void> {
    const index = this.content.findIndex((item) => item.id === content.id);
    if (index !== -1) {
      this.content[index] = content;
    }
  }

  /**
   * Remove content from the index.
   */
  async remove(id: string): Promise<void> {
    this.content = this.content.filter((item) => item.id !== id);
  }

  /**
   * Clear the entire index.
   */
  async clear(): Promise<void> {
    this.content = [];
  }

  /**
   * Extract a snippet around the matched query.
   */
  private extractSnippet(
    content: string,
    query: string,
    contextLength = 100,
  ): string {
    const lowerContent = content.toLowerCase();
    const matchIndex = lowerContent.indexOf(query);

    if (matchIndex === -1) {
      return (
        content.substring(0, contextLength * 2) +
        (content.length > contextLength * 2 ? '...' : '')
      );
    }

    const start = Math.max(0, matchIndex - contextLength);
    const end = Math.min(
      content.length,
      matchIndex + query.length + contextLength,
    );

    let snippet = content.substring(start, end);

    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';

    return snippet;
  }

  /**
   * Sort search results.
   */
  private sortResults(
    results: HelpSearchResult[],
    sortBy: 'relevance' | 'date' | 'title',
    direction: 'asc' | 'desc',
  ): void {
    results.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'relevance':
        case 'date':
          comparison = (a.score ?? 0) - (b.score ?? 0);
          break;
      }

      return direction === 'asc' ? comparison : -comparison;
    });
  }
}
