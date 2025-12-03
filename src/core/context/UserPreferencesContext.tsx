/**
 * User Preferences Context for the Web Help Component Library
 * @module @privify-pw/web-help/context/UserPreferencesContext
 */

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { UserPreferences, ReadingHistoryEntry, UserSettings, StorageAdapter } from '../types/storage';
import { useHelpContext } from './HelpContext';

/**
 * User preferences context value.
 */
export interface UserPreferencesContextValue {
  /** Current preferences */
  preferences: UserPreferences;
  /** Add a bookmark */
  addBookmark: (articleId: string) => void;
  /** Remove a bookmark */
  removeBookmark: (articleId: string) => void;
  /** Toggle a bookmark */
  toggleBookmark: (articleId: string) => boolean;
  /** Check if an article is bookmarked */
  isBookmarked: (articleId: string) => boolean;
  /** Get all bookmarks */
  getBookmarks: () => string[];
  /** Add to reading history */
  addToHistory: (entry: Omit<ReadingHistoryEntry, 'timestamp'>) => void;
  /** Get reading history */
  getHistory: (limit?: number) => ReadingHistoryEntry[];
  /** Clear reading history */
  clearHistory: () => void;
  /** Update reading progress */
  updateProgress: (articleId: string, progress: number) => void;
  /** Get reading progress */
  getProgress: (articleId: string) => number;
  /** Add a recent search */
  addRecentSearch: (query: string) => void;
  /** Get recent searches */
  getRecentSearches: () => string[];
  /** Clear recent searches */
  clearRecentSearches: () => void;
  /** Update user settings */
  updateSettings: (settings: Partial<UserSettings>) => void;
  /** Get user settings */
  getSettings: () => UserSettings;
}

/**
 * Storage keys for user preferences.
 */
const STORAGE_KEYS = {
  BOOKMARKS: 'bookmarks',
  HISTORY: 'history',
  PROGRESS: 'progress',
  RECENT_SEARCHES: 'recent_searches',
  SETTINGS: 'settings',
} as const;

/**
 * Default max history entries.
 */
const MAX_HISTORY_ENTRIES = 50;

/**
 * Default max recent searches.
 */
const MAX_RECENT_SEARCHES = 10;

/**
 * User preferences context.
 */
const UserPreferencesContext = createContext<UserPreferencesContextValue | null>(null);

/**
 * Helper to read from storage.
 */
function readFromStorage<T>(storage: StorageAdapter, key: string, defaultValue: T): T {
  const value = storage.get<T>(key);
  return value ?? defaultValue;
}

/**
 * User preferences provider props.
 */
export interface UserPreferencesProviderProps {
  children: ReactNode;
}

/**
 * User preferences provider component.
 */
export function UserPreferencesProvider({ children }: UserPreferencesProviderProps) {
  const { storage, callbacks } = useHelpContext();

  // Read current preferences from storage
  const preferences = useMemo((): UserPreferences => ({
    bookmarks: readFromStorage<string[]>(storage, STORAGE_KEYS.BOOKMARKS, []),
    history: readFromStorage<ReadingHistoryEntry[]>(storage, STORAGE_KEYS.HISTORY, []),
    readingProgress: readFromStorage<Record<string, number>>(storage, STORAGE_KEYS.PROGRESS, {}),
    recentSearches: readFromStorage<string[]>(storage, STORAGE_KEYS.RECENT_SEARCHES, []),
    settings: readFromStorage<UserSettings>(storage, STORAGE_KEYS.SETTINGS, {}),
  }), [storage]);

  // Bookmark functions
  const addBookmark = useCallback((articleId: string) => {
    const bookmarks = readFromStorage<string[]>(storage, STORAGE_KEYS.BOOKMARKS, []);
    if (!bookmarks.includes(articleId)) {
      const newBookmarks = [...bookmarks, articleId];
      storage.set(STORAGE_KEYS.BOOKMARKS, newBookmarks);
      callbacks.onBookmark?.(articleId, true);
    }
  }, [storage, callbacks]);

  const removeBookmark = useCallback((articleId: string) => {
    const bookmarks = readFromStorage<string[]>(storage, STORAGE_KEYS.BOOKMARKS, []);
    const newBookmarks = bookmarks.filter((id) => id !== articleId);
    storage.set(STORAGE_KEYS.BOOKMARKS, newBookmarks);
    callbacks.onBookmark?.(articleId, false);
  }, [storage, callbacks]);

  const toggleBookmark = useCallback((articleId: string): boolean => {
    const bookmarks = readFromStorage<string[]>(storage, STORAGE_KEYS.BOOKMARKS, []);
    const isCurrentlyBookmarked = bookmarks.includes(articleId);
    
    if (isCurrentlyBookmarked) {
      removeBookmark(articleId);
      return false;
    } else {
      addBookmark(articleId);
      return true;
    }
  }, [storage, addBookmark, removeBookmark]);

  const isBookmarked = useCallback((articleId: string): boolean => {
    const bookmarks = readFromStorage<string[]>(storage, STORAGE_KEYS.BOOKMARKS, []);
    return bookmarks.includes(articleId);
  }, [storage]);

  const getBookmarks = useCallback((): string[] => {
    return readFromStorage<string[]>(storage, STORAGE_KEYS.BOOKMARKS, []);
  }, [storage]);

  // History functions
  const addToHistory = useCallback((entry: Omit<ReadingHistoryEntry, 'timestamp'>) => {
    const history = readFromStorage<ReadingHistoryEntry[]>(storage, STORAGE_KEYS.HISTORY, []);
    
    // Remove existing entry for this article
    const filteredHistory = history.filter((h) => h.articleId !== entry.articleId);
    
    // Add new entry at the beginning
    const newEntry: ReadingHistoryEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };
    
    const newHistory = [newEntry, ...filteredHistory].slice(0, MAX_HISTORY_ENTRIES);
    storage.set(STORAGE_KEYS.HISTORY, newHistory);
  }, [storage]);

  const getHistory = useCallback((limit?: number): ReadingHistoryEntry[] => {
    const history = readFromStorage<ReadingHistoryEntry[]>(storage, STORAGE_KEYS.HISTORY, []);
    return limit ? history.slice(0, limit) : history;
  }, [storage]);

  const clearHistory = useCallback(() => {
    storage.set(STORAGE_KEYS.HISTORY, []);
  }, [storage]);

  // Reading progress functions
  const updateProgress = useCallback((articleId: string, progress: number) => {
    const progressMap = readFromStorage<Record<string, number>>(storage, STORAGE_KEYS.PROGRESS, {});
    progressMap[articleId] = Math.min(100, Math.max(0, progress));
    storage.set(STORAGE_KEYS.PROGRESS, progressMap);
  }, [storage]);

  const getProgress = useCallback((articleId: string): number => {
    const progressMap = readFromStorage<Record<string, number>>(storage, STORAGE_KEYS.PROGRESS, {});
    return progressMap[articleId] ?? 0;
  }, [storage]);

  // Recent searches functions
  const addRecentSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    
    const searches = readFromStorage<string[]>(storage, STORAGE_KEYS.RECENT_SEARCHES, []);
    
    // Remove duplicate and add at the beginning
    const filtered = searches.filter((s) => s.toLowerCase() !== query.toLowerCase());
    const newSearches = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    
    storage.set(STORAGE_KEYS.RECENT_SEARCHES, newSearches);
  }, [storage]);

  const getRecentSearches = useCallback((): string[] => {
    return readFromStorage<string[]>(storage, STORAGE_KEYS.RECENT_SEARCHES, []);
  }, [storage]);

  const clearRecentSearches = useCallback(() => {
    storage.set(STORAGE_KEYS.RECENT_SEARCHES, []);
  }, [storage]);

  // Settings functions
  const updateSettings = useCallback((settings: Partial<UserSettings>) => {
    const currentSettings = readFromStorage<UserSettings>(storage, STORAGE_KEYS.SETTINGS, {});
    const newSettings = { ...currentSettings, ...settings };
    storage.set(STORAGE_KEYS.SETTINGS, newSettings);
  }, [storage]);

  const getSettings = useCallback((): UserSettings => {
    return readFromStorage<UserSettings>(storage, STORAGE_KEYS.SETTINGS, {});
  }, [storage]);

  const value: UserPreferencesContextValue = {
    preferences,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isBookmarked,
    getBookmarks,
    addToHistory,
    getHistory,
    clearHistory,
    updateProgress,
    getProgress,
    addRecentSearch,
    getRecentSearches,
    clearRecentSearches,
    updateSettings,
    getSettings,
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

/**
 * Hook to access user preferences.
 * @throws Error if used outside of UserPreferencesProvider
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useUserPreferences(): UserPreferencesContextValue {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
}
