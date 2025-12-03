/**
 * useHelpNavigation Hook for the Web Help Component Library
 * @module @privify-pw/web-help/hooks/useHelpNavigation
 */

import { useCallback, useMemo } from 'react';
import { useHelpContext, useHelpState } from '../context/HelpContext';
import type { NavigationState, BreadcrumbItem, HelpCategory } from '../types/content';

/**
 * Return type for useHelpNavigation hook.
 */
export interface UseHelpNavigationReturn {
  /** Current navigation state */
  navigation: NavigationState;
  /** Go to previous article */
  goToPrev: () => Promise<void>;
  /** Go to next article */
  goToNext: () => Promise<void>;
  /** Whether there is a previous article */
  hasPrev: boolean;
  /** Whether there is a next article */
  hasNext: boolean;
  /** Get breadcrumb trail for current article */
  getBreadcrumbs: () => BreadcrumbItem[];
  /** Get available categories */
  categories: HelpCategory[];
  /** Navigate to a category */
  goToCategory: (categoryId: string) => void;
}

/**
 * Hook for navigation functionality.
 */
export function useHelpNavigation(): UseHelpNavigationReturn {
  const { navigateToArticle, contentLoader } = useHelpContext();
  const state = useHelpState();

  const hasPrev = !!state.navigation.prev;
  const hasNext = !!state.navigation.next;

  const goToPrev = useCallback(async () => {
    if (state.navigation.prev) {
      await navigateToArticle(state.navigation.prev.id);
    }
  }, [navigateToArticle, state.navigation.prev]);

  const goToNext = useCallback(async () => {
    if (state.navigation.next) {
      await navigateToArticle(state.navigation.next.id);
    }
  }, [navigateToArticle, state.navigation.next]);

  const getBreadcrumbs = useCallback((): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [];
    const article = state.currentArticle;

    if (!article) return breadcrumbs;

    // Add home
    breadcrumbs.push({ label: 'Home', path: '/', id: 'home' });

    // Add category if exists
    if (article.metadata.category) {
      const category = contentLoader.getCategory(article.metadata.category);
      if (category) {
        breadcrumbs.push({
          label: category.name,
          path: `/category/${category.id}`,
          id: category.id,
        });
      }
    }

    // Add current article
    breadcrumbs.push({
      label: article.title,
      id: article.id,
      current: true,
    });

    return breadcrumbs;
  }, [state.currentArticle, contentLoader]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const goToCategory = useCallback((_categoryId: string) => {
    // Category navigation would be handled by the app's routing
    // This is a hook that developers can use to trigger their own navigation
  }, []);

  const categories = useMemo(() => {
    return contentLoader.getCategories();
  }, [contentLoader]);

  return {
    navigation: state.navigation,
    goToPrev,
    goToNext,
    hasPrev,
    hasNext,
    getBreadcrumbs,
    categories,
    goToCategory,
  };
}
