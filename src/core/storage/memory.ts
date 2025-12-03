/**
 * Memory Storage Adapter for the Web Help Component Library
 * @module @privify-pw/web-help/storage/memory
 * 
 * Useful for testing or SSR environments where browser storage is not available.
 */

import type { StorageAdapter } from '../types/storage';

/**
 * Create an in-memory storage adapter with optional prefix.
 * Data is not persisted between page reloads.
 * @param prefix - Prefix for all storage keys
 * @returns Storage adapter using in-memory map
 */
export function createMemoryAdapter(prefix = 'help_'): StorageAdapter {
  const storage = new Map<string, unknown>();
  const getKey = (key: string) => `${prefix}${key}`;

  return {
    get<T>(key: string): T | null {
      const value = storage.get(getKey(key));
      if (value === undefined) return null;
      return value as T;
    },

    set<T>(key: string, value: T): void {
      storage.set(getKey(key), value);
    },

    remove(key: string): void {
      storage.delete(getKey(key));
    },

    clear(): void {
      const keysToRemove: string[] = [];
      storage.forEach((_, key) => {
        if (key.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      });
      keysToRemove.forEach((key) => storage.delete(key));
    },

    has(key: string): boolean {
      return storage.has(getKey(key));
    },

    keys(): string[] {
      const result: string[] = [];
      storage.forEach((_, key) => {
        if (key.startsWith(prefix)) {
          result.push(key.slice(prefix.length));
        }
      });
      return result;
    },
  };
}
