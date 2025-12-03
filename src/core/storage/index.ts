/**
 * Storage Adapters Index for the Web Help Component Library
 * @module @privify-pw/web-help/storage
 */

export { createLocalStorageAdapter } from './localStorage';
export { createSessionStorageAdapter } from './sessionStorage';
export { createCookieAdapter } from './cookie';
export { createMemoryAdapter } from './memory';

// Re-export types
export type { StorageAdapter, UserPreferences, ReadingHistoryEntry, UserSettings, CookieOptions } from '../types/storage';
