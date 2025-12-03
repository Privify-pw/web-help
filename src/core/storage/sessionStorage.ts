/**
 * SessionStorage Adapter for the Web Help Component Library
 * @module @privify-pw/web-help/storage/sessionStorage
 */

import type { StorageAdapter } from '../types/storage';

/**
 * Create a sessionStorage adapter with optional prefix.
 * @param prefix - Prefix for all storage keys
 * @returns Storage adapter using sessionStorage
 */
export function createSessionStorageAdapter(prefix = 'help_'): StorageAdapter {
  const getKey = (key: string) => `${prefix}${key}`;

  return {
    get<T>(key: string): T | null {
      try {
        const item = sessionStorage.getItem(getKey(key));
        if (item === null) return null;
        return JSON.parse(item) as T;
      } catch {
        return null;
      }
    },

    set<T>(key: string, value: T): void {
      try {
        sessionStorage.setItem(getKey(key), JSON.stringify(value));
      } catch (error) {
        console.error('Failed to save to sessionStorage:', error);
      }
    },

    remove(key: string): void {
      try {
        sessionStorage.removeItem(getKey(key));
      } catch (error) {
        console.error('Failed to remove from sessionStorage:', error);
      }
    },

    clear(): void {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && key.startsWith(prefix)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => sessionStorage.removeItem(key));
      } catch (error) {
        console.error('Failed to clear sessionStorage:', error);
      }
    },

    has(key: string): boolean {
      try {
        return sessionStorage.getItem(getKey(key)) !== null;
      } catch {
        return false;
      }
    },

    keys(): string[] {
      try {
        const result: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && key.startsWith(prefix)) {
            result.push(key.slice(prefix.length));
          }
        }
        return result;
      } catch {
        return [];
      }
    },
  };
}
