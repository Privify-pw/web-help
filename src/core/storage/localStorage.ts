/**
 * LocalStorage Adapter for the Web Help Component Library
 * @module @privify-pw/web-help/storage/localStorage
 */

import type { StorageAdapter } from '../types/storage';

/**
 * Create a localStorage adapter with optional prefix.
 * @param prefix - Prefix for all storage keys
 * @returns Storage adapter using localStorage
 */
export function createLocalStorageAdapter(prefix = 'help_'): StorageAdapter {
  const getKey = (key: string) => `${prefix}${key}`;

  return {
    get<T>(key: string): T | null {
      try {
        const item = localStorage.getItem(getKey(key));
        if (item === null) return null;
        return JSON.parse(item) as T;
      } catch {
        return null;
      }
    },

    set<T>(key: string, value: T): void {
      try {
        localStorage.setItem(getKey(key), JSON.stringify(value));
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    },

    remove(key: string): void {
      try {
        localStorage.removeItem(getKey(key));
      } catch (error) {
        console.error('Failed to remove from localStorage:', error);
      }
    },

    clear(): void {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(prefix)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => localStorage.removeItem(key));
      } catch (error) {
        console.error('Failed to clear localStorage:', error);
      }
    },

    has(key: string): boolean {
      try {
        return localStorage.getItem(getKey(key)) !== null;
      } catch {
        return false;
      }
    },

    keys(): string[] {
      try {
        const result: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
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
