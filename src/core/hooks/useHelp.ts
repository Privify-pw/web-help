/**
 * useHelp Hook for the Web Help Component Library
 * @module @privify-pw/web-help/hooks/useHelp
 */

import { useCallback } from 'react';
import { useHelpContext, useHelpState } from '../context/HelpContext';
import type { HelpArticle } from '../types/content';

/**
 * Return type for useHelp hook.
 */
export interface UseHelpReturn {
  /** Current article */
  currentArticle: HelpArticle | null;
  /** Whether content is loading */
  isLoading: boolean;
  /** Error if any */
  error: Error | null;
  /** Whether help system is initialized */
  isInitialized: boolean;
  /** Navigate to an article by ID */
  openArticle: (articleId: string) => Promise<void>;
  /** Close current article */
  closeArticle: () => void;
  /** Register content from manifest */
  registerContent: (manifest: Record<string, string>) => Promise<void>;
  /** Get all articles */
  getAllArticles: () => HelpArticle[];
}

/**
 * Main hook for interacting with the help system.
 */
export function useHelp(): UseHelpReturn {
  const { navigateToArticle, registerContent, contentLoader } = useHelpContext();
  const state = useHelpState();

  const openArticle = useCallback(
    async (articleId: string) => {
      await navigateToArticle(articleId);
    },
    [navigateToArticle]
  );

  const closeArticle = useCallback(() => {
    // This would typically be handled by state management
    // For now, just navigate away or hide
  }, []);

  const getAllArticles = useCallback(() => {
    return contentLoader.getAllArticles();
  }, [contentLoader]);

  return {
    currentArticle: state.currentArticle,
    isLoading: state.isLoading,
    error: state.error,
    isInitialized: state.initialized,
    openArticle,
    closeArticle,
    registerContent,
    getAllArticles,
  };
}
