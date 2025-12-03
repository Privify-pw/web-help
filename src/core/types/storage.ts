/**
 * Storage Adapter Types for the Web Help Component Library
 * @module @privify-pw/web-help/types/storage
 */

/**
 * Storage adapter interface for persisting user preferences.
 * Implementations can use localStorage, sessionStorage, cookies, or custom backends.
 */
export interface StorageAdapter {
  /**
   * Get a value from storage.
   * @param key - Storage key
   * @returns The stored value or null if not found
   */
  get<T>(key: string): T | null;

  /**
   * Set a value in storage.
   * @param key - Storage key
   * @param value - Value to store
   */
  set<T>(key: string, value: T): void;

  /**
   * Remove a value from storage.
   * @param key - Storage key
   */
  remove(key: string): void;

  /**
   * Clear all values with the configured prefix.
   */
  clear(): void;

  /**
   * Check if a key exists in storage.
   * @param key - Storage key
   */
  has(key: string): boolean;

  /**
   * Get all keys in storage with the configured prefix.
   */
  keys(): string[];
}

/**
 * User preferences stored in storage.
 */
export interface UserPreferences {
  /** Bookmarked article IDs */
  bookmarks?: string[];
  /** Reading history (article IDs with timestamps) */
  history?: ReadingHistoryEntry[];
  /** User's preferred settings */
  settings?: UserSettings;
  /** Recently searched terms */
  recentSearches?: string[];
  /** Reading progress for articles */
  readingProgress?: Record<string, number>;
}

/**
 * Reading history entry.
 */
export interface ReadingHistoryEntry {
  /** Article ID */
  articleId: string;
  /** Timestamp when the article was viewed */
  timestamp: string;
  /** Reading progress (0-100) */
  progress?: number;
  /** Article title (for display without loading article) */
  title?: string;
}

/**
 * User settings.
 */
export interface UserSettings {
  /** Preferred theme */
  theme?: 'light' | 'dark' | 'system';
  /** Font size preference */
  fontSize?: 'small' | 'medium' | 'large';
  /** Enable keyboard shortcuts */
  keyboardShortcuts?: boolean;
  /** Other custom settings */
  custom?: Record<string, unknown>;
}

/**
 * Cookie options for cookie storage adapter.
 */
export interface CookieOptions {
  /** Cookie expiration in days */
  expires?: number;
  /** Cookie path */
  path?: string;
  /** Cookie domain */
  domain?: string;
  /** Secure flag */
  secure?: boolean;
  /** SameSite attribute */
  sameSite?: 'strict' | 'lax' | 'none';
}
