/**
 * useBookmarks Hook for the Web Help Component Library
 * @module @privify-pw/web-help/hooks/useBookmarks
 */

import { useCallback, useMemo } from 'react';
import { useUserPreferences } from '../context/UserPreferencesContext';

/**
 * Return type for useBookmarks hook.
 */
export interface UseBookmarksReturn {
  /** List of bookmarked article IDs */
  bookmarks: string[];
  /** Add a bookmark */
  add: (articleId: string) => void;
  /** Remove a bookmark */
  remove: (articleId: string) => void;
  /** Toggle a bookmark */
  toggle: (articleId: string) => boolean;
  /** Check if an article is bookmarked */
  isBookmarked: (articleId: string) => boolean;
  /** Number of bookmarks */
  count: number;
}

/**
 * Hook for managing bookmarks.
 */
export function useBookmarks(): UseBookmarksReturn {
  const {
    getBookmarks,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isBookmarked,
  } = useUserPreferences();

  const bookmarks = useMemo(() => getBookmarks(), [getBookmarks]);

  const add = useCallback(
    (articleId: string) => {
      addBookmark(articleId);
    },
    [addBookmark]
  );

  const remove = useCallback(
    (articleId: string) => {
      removeBookmark(articleId);
    },
    [removeBookmark]
  );

  const toggle = useCallback(
    (articleId: string): boolean => {
      return toggleBookmark(articleId);
    },
    [toggleBookmark]
  );

  const checkIsBookmarked = useCallback(
    (articleId: string): boolean => {
      return isBookmarked(articleId);
    },
    [isBookmarked]
  );

  return {
    bookmarks,
    add,
    remove,
    toggle,
    isBookmarked: checkIsBookmarked,
    count: bookmarks.length,
  };
}
