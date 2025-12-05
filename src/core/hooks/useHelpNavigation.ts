/**
 * useHelpNavigation Hook for the Web Help Component Library
 * @module @piikeep-pw/web-help/hooks/useHelpNavigation
 */

import { useCallback, useMemo } from 'react';
import { useHelpActions, useHelpState } from '../context/HelpContext';
import type {
  NavigationState,
  BreadcrumbItem,
  HelpCategory,
} from '../types/content';

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
  /**
   * Navigate to a category. This is a no-op by default and should be
   * overridden by the consuming application to handle category navigation.
   */
  goToCategory: (categoryId: string) => void;
}

/**
 * Hook for navigation functionality.
 *
 * Uses the split context pattern for optimal performance:
 * - Actions (navigateToArticle) come from useHelpActions (stable, won't cause re-renders)
 * - State (navigation) comes from useHelpState (reactive, will cause re-renders when navigation changes)
 * - goToPrev/goToNext use getState() to access current navigation without adding state dependencies
 */
export function useHelpNavigation(): UseHelpNavigationReturn {
  const { navigateToArticle, contentLoader, getState } = useHelpActions();
  const state = useHelpState();

  const hasPrev = !!state.navigation.prev;
  const hasNext = !!state.navigation.next;

  // Use getState() to access current navigation without adding state.navigation to dependencies
  // This makes goToPrev stable (referentially equal between renders)
  const goToPrev = useCallback(async () => {
    const nav = getState().navigation;
    if (nav.prev) {
      await navigateToArticle(nav.prev.id);
    }
  }, [navigateToArticle, getState]);

  // Use getState() to access current navigation without adding state.navigation to dependencies
  // This makes goToNext stable (referentially equal between renders)
  const goToNext = useCallback(async () => {
    const nav = getState().navigation;
    if (nav.next) {
      await navigateToArticle(nav.next.id);
    }
  }, [navigateToArticle, getState]);

  const getBreadcrumbs = useCallback((): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [];
    const article = getState().currentArticle;

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
  }, [getState, contentLoader]);

  /**
   * Navigate to a category. By default, this is a no-op as category navigation
   * should be handled by the consuming application's routing system.
   * Override this behavior by implementing your own navigation logic.
   */
  const goToCategory = useCallback((categoryId: string) => {
    // Category navigation is intentionally left as a no-op.
    // This function provides a hook point for developers to implement
    // their own category navigation logic based on their routing setup.
    void categoryId;
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
