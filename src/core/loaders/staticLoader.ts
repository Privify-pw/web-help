/**
 * Static Content Loader for the Web Help Component Library
 * @module @privify-pw/web-help/loaders/staticLoader
 */

import type { HelpArticle, HelpCategory, ContentIndex } from '../types/content';
import type { ContentConfig, CacheConfig } from '../types/config';
import type { ContentParser, ParseResult } from '../types/parser';

/**
 * Content registry for caching loaded articles.
 */
interface ContentRegistry {
  articles: Map<string, HelpArticle>;
  categories: Map<string, HelpCategory>;
  index: ContentIndex[];
  lastUpdated: number;
}

/**
 * Static content loader for loading help articles from static files.
 */
export class StaticContentLoader {
  private registry: ContentRegistry;
  private parsers: Map<string, ContentParser>;
  private config: ContentConfig;
  private cacheConfig: CacheConfig;

  constructor(config: ContentConfig = {}) {
    this.config = config;
    this.cacheConfig = config.cache ?? { enabled: true, ttl: 5 * 60 * 1000 }; // 5 min default
    this.registry = {
      articles: new Map(),
      categories: new Map(),
      index: [],
      lastUpdated: 0,
    };
    this.parsers = new Map();
  }

  /**
   * Register a content parser.
   * @param parser - Parser to register
   */
  registerParser(parser: ContentParser): void {
    for (const ext of parser.extensions) {
      this.parsers.set(ext, parser);
    }
  }

  /**
   * Get a parser for the given file extension.
   * @param extension - File extension
   * @returns Content parser or undefined
   */
  getParser(extension: string): ContentParser | undefined {
    return this.parsers.get(extension.toLowerCase().replace('.', ''));
  }

  /**
   * Load an article by ID.
   * @param articleId - Article ID
   * @returns Help article or null if not found
   */
  async loadArticle(articleId: string): Promise<HelpArticle | null> {
    // Check cache first
    if (this.isCacheValid()) {
      const cached = this.registry.articles.get(articleId);
      if (cached) return cached;
    }

    // If custom loader is provided, use it
    if (this.config.loader) {
      const article = await this.config.loader(articleId);
      if (article) {
        this.registry.articles.set(articleId, article);
      }
      return article;
    }

    return null;
  }

  /**
   * Load and parse content from a raw string.
   * @param content - Raw content string
   * @param filename - Filename for parser detection
   * @param articleId - Article ID
   * @returns Parsed help article or null
   */
  async parseContent(
    content: string,
    filename: string,
    articleId: string
  ): Promise<HelpArticle | null> {
    const extension = filename.split('.').pop() ?? '';
    const parser = this.getParser(extension);

    if (!parser) {
      console.warn(`No parser registered for extension: ${extension}`);
      return null;
    }

    try {
      const result = await parser.parse(content, { filename });
      const article = this.createArticleFromResult(articleId, filename, content, result);
      
      // Cache the article
      this.registry.articles.set(articleId, article);
      this.updateIndex(article);
      
      return article;
    } catch (error) {
      console.error(`Failed to parse content: ${filename}`, error);
      return null;
    }
  }

  /**
   * Create a HelpArticle from a parse result.
   */
  private createArticleFromResult(
    id: string,
    filename: string,
    rawContent: string,
    result: ParseResult
  ): HelpArticle {
    // Extract title from first heading or filename
    let title = id;
    const titleMatch = rawContent.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      title = titleMatch[1];
    }

    // Extract description from frontmatter or first paragraph
    let description: string | undefined;
    const descMatch = result.html.match(/<p[^>]*>([^<]+)<\/p>/);
    if (descMatch) {
      description = descMatch[1].substring(0, 160);
    }

    return {
      id,
      title,
      description,
      content: rawContent,
      renderedContent: result.html,
      metadata: {
        ...result.metadata,
        slug: result.metadata.slug ?? this.generateSlug(filename),
      },
    };
  }

  /**
   * Generate a slug from filename.
   */
  private generateSlug(filename: string): string {
    return filename
      .replace(/\.[^/.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Update the search index with an article.
   */
  private updateIndex(article: HelpArticle): void {
    const existingIndex = this.registry.index.findIndex((i) => i.id === article.id);
    const indexEntry: ContentIndex = {
      id: article.id,
      title: article.title,
      content: this.stripHtml(article.renderedContent ?? article.content),
      category: article.metadata.category,
      tags: article.metadata.tags,
    };

    if (existingIndex >= 0) {
      this.registry.index[existingIndex] = indexEntry;
    } else {
      this.registry.index.push(indexEntry);
    }
  }

  /**
   * Strip HTML tags from content for search indexing.
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Check if the cache is still valid.
   */
  private isCacheValid(): boolean {
    if (!this.cacheConfig.enabled) return false;
    const ttl = this.cacheConfig.ttl ?? 5 * 60 * 1000;
    return Date.now() - this.registry.lastUpdated < ttl;
  }

  /**
   * Get all cached articles.
   */
  getAllArticles(): HelpArticle[] {
    return Array.from(this.registry.articles.values());
  }

  /**
   * Get the content index for search.
   */
  getContentIndex(): ContentIndex[] {
    return this.registry.index;
  }

  /**
   * Register a category.
   */
  registerCategory(category: HelpCategory): void {
    this.registry.categories.set(category.id, category);
  }

  /**
   * Get all categories.
   */
  getCategories(): HelpCategory[] {
    return Array.from(this.registry.categories.values());
  }

  /**
   * Get a category by ID.
   */
  getCategory(id: string): HelpCategory | undefined {
    return this.registry.categories.get(id);
  }

  /**
   * Clear the cache.
   */
  clearCache(): void {
    this.registry.articles.clear();
    this.registry.categories.clear();
    this.registry.index = [];
    this.registry.lastUpdated = 0;
  }

  /**
   * Load articles from a content manifest.
   * @param manifest - Object mapping article IDs to their content
   */
  async loadFromManifest(manifest: Record<string, string>): Promise<void> {
    for (const [id, content] of Object.entries(manifest)) {
      await this.parseContent(content, `${id}.md`, id);
    }
    this.registry.lastUpdated = Date.now();
  }
}

/**
 * Create a static content loader with default configuration.
 */
export function createStaticLoader(config?: ContentConfig): StaticContentLoader {
  return new StaticContentLoader(config);
}
