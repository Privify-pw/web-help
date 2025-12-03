/**
 * Cookie Storage Adapter for the Web Help Component Library
 * @module @privify-pw/web-help/storage/cookie
 */

import type { StorageAdapter, CookieOptions } from '../types/storage';

/**
 * Default cookie options.
 */
const defaultCookieOptions: CookieOptions = {
  expires: 365,
  path: '/',
  sameSite: 'lax',
};

/**
 * Create a cookie storage adapter with optional prefix and options.
 * @param prefix - Prefix for all cookie names
 * @param options - Cookie options
 * @returns Storage adapter using cookies
 */
export function createCookieAdapter(
  prefix = 'help_',
  options: CookieOptions = {}
): StorageAdapter {
  const mergedOptions = { ...defaultCookieOptions, ...options };
  const getKey = (key: string) => `${prefix}${key}`;

  const getCookie = (name: string): string | null => {
    try {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        return parts.pop()?.split(';').shift() ?? null;
      }
      return null;
    } catch {
      return null;
    }
  };

  const setCookie = (name: string, value: string, opts: CookieOptions): void => {
    try {
      let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

      if (opts.expires) {
        const date = new Date();
        date.setTime(date.getTime() + opts.expires * 24 * 60 * 60 * 1000);
        cookieString += `; expires=${date.toUTCString()}`;
      }

      if (opts.path) {
        cookieString += `; path=${opts.path}`;
      }

      if (opts.domain) {
        cookieString += `; domain=${opts.domain}`;
      }

      if (opts.secure) {
        cookieString += '; secure';
      }

      if (opts.sameSite) {
        cookieString += `; samesite=${opts.sameSite}`;
      }

      document.cookie = cookieString;
    } catch (error) {
      console.error('Failed to set cookie:', error);
    }
  };

  const deleteCookie = (name: string, opts: CookieOptions): void => {
    try {
      let cookieString = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

      if (opts.path) {
        cookieString += `; path=${opts.path}`;
      }

      if (opts.domain) {
        cookieString += `; domain=${opts.domain}`;
      }

      document.cookie = cookieString;
    } catch (error) {
      console.error('Failed to delete cookie:', error);
    }
  };

  const getAllCookieNames = (): string[] => {
    try {
      const cookies = document.cookie.split(';');
      return cookies
        .map((cookie) => cookie.trim().split('=')[0])
        .filter((name) => name.startsWith(prefix));
    } catch {
      return [];
    }
  };

  return {
    get<T>(key: string): T | null {
      try {
        const value = getCookie(getKey(key));
        if (value === null) return null;
        return JSON.parse(decodeURIComponent(value)) as T;
      } catch {
        return null;
      }
    },

    set<T>(key: string, value: T): void {
      setCookie(getKey(key), JSON.stringify(value), mergedOptions);
    },

    remove(key: string): void {
      deleteCookie(getKey(key), mergedOptions);
    },

    clear(): void {
      const cookieNames = getAllCookieNames();
      cookieNames.forEach((name) => deleteCookie(name, mergedOptions));
    },

    has(key: string): boolean {
      return getCookie(getKey(key)) !== null;
    },

    keys(): string[] {
      return getAllCookieNames().map((name) => name.slice(prefix.length));
    },
  };
}
