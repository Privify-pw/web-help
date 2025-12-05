/**
 * HelpPage Component for the Web Help Component Library
 * @module @piikeep-pw/web-help/components/HelpPage
 *
 * Headless component for rendering a help page layout.
 */

import { forwardRef, useEffect, useMemo } from 'react';
import type { HelpPageProps } from '../types/components';
import type { NavigationItem } from '../types/components';
import { useHelpActions, useHelpState } from '../context/HelpContext';
import { HelpContent } from './HelpContent';
import { HelpNavigation } from './HelpNavigation';
import { HelpBreadcrumbs } from './navigation/HelpBreadcrumbs';
import { HelpPagination } from './navigation/HelpPagination';
import { HelpTOC } from './navigation/HelpTOC';
import { HelpSearch } from './navigation/HelpSearch';

/**
 * Helper function to strip the first H1 from rendered HTML if it matches the article title.
 * This prevents duplicate titles when markdown content includes an H1 heading.
 */
function stripDuplicateTitle(html: string, title: string): string {
  // Match the first H1 tag with any class or id attributes
  const h1Pattern = /<h1[^>]*>([^<]+)<\/h1>/i;
  const match = html.match(h1Pattern);

  if (match && match[1].trim() === title.trim()) {
    // Remove the first H1 tag if it matches the title
    return html.replace(h1Pattern, '').trim();
  }

  return html;
}

/**
 * HelpPage is a headless container component for rendering help articles.
 * It provides semantic class names and data attributes for styling.
 *
 * Uses the split context pattern for optimal performance:
 * - Actions (loadArticle, navigateToArticle) come from useHelpActions (stable)
 * - State comes from useHelpState (reactive)
 */
export const HelpPage = forwardRef<HTMLDivElement, HelpPageProps>(
  function HelpPage(
    {
      article,
      articleId,
      renderHeader,
      renderFooter,
      renderSidebar,
      showNavigation = true,
      showSearch = true,
      showTOC = true,
      showBreadcrumbs = true,
      showPagination = true,
      className = '',
      children,
      ...props
    },
    ref,
  ) {
    const { loadArticle, navigateToArticle, contentLoader } = useHelpActions();
    const state = useHelpState();

    // Auto-build navigation from categories
    const navigationItems = useMemo((): NavigationItem[] => {
      const categories = state.categories || [];

      const items = categories
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((category) => {
          const categoryArticles = contentLoader
            .getAllArticles()
            .filter((art) => art.metadata?.category === category.id)
            .sort(
              (a, b) => (a.metadata?.order ?? 0) - (b.metadata?.order ?? 0),
            );

          return {
            id: category.id,
            label: category.name,
            isCategory: true,
            children: categoryArticles.map((art) => ({
              id: art.id,
              label: art.title,
              path: `#${art.id}`,
            })),
          };
        });

      return items;
    }, [state.categories, contentLoader]);

    // Load article if articleId provided
    // loadArticle is now stable (from useHelpActions) so this won't cause infinite loops
    useEffect(() => {
      if (articleId && !article) {
        loadArticle(articleId);
      }
    }, [articleId, article, loadArticle]);

    const currentArticle = article ?? state.currentArticle;
    const isLoading = state.isLoading;
    const error = state.error;

    // Render loading state
    if (isLoading) {
      return (
        <div
          ref={ref}
          className={`help-page help-page-loading ${className}`.trim()}
          data-state='loading'
          {...props}
        >
          <div className='help-page-loader' aria-live='polite'>
            Loading...
          </div>
        </div>
      );
    }

    // Render error state
    if (error) {
      return (
        <div
          ref={ref}
          className={`help-page help-page-error ${className}`.trim()}
          data-state='error'
          role='alert'
          {...props}
        >
          <div className='help-page-error-message'>{error.message}</div>
        </div>
      );
    }

    // Render empty state
    if (!currentArticle) {
      return (
        <div
          ref={ref}
          className={`help-page help-page-empty ${className}`.trim()}
          data-state='empty'
          {...props}
        >
          {children ?? (
            <div className='help-page-empty-message'>No article selected</div>
          )}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={`help-page ${className}`.trim()}
        data-state='ready'
        data-article-id={currentArticle.id}
        {...props}
      >
        {/* Sidebar */}
        {(renderSidebar || showNavigation) && (
          <aside className='help-page-sidebar' data-component='sidebar'>
            {renderSidebar ? (
              renderSidebar(currentArticle)
            ) : (
              <div className='help-sidebar-content'>
                {showSearch && (
                  <HelpSearch
                    onResultSelect={(result) =>
                      navigateToArticle(result.articleId)
                    }
                    placeholder='Search documentation...'
                  />
                )}
                {showNavigation && (
                  <HelpNavigation
                    items={navigationItems}
                    activeId={currentArticle.id}
                    onItemSelect={navigateToArticle}
                    collapsible
                  />
                )}
              </div>
            )}
          </aside>
        )}

        {/* Main content area */}
        <main className='help-page-main'>
          {/* Header */}
          {renderHeader ? (
            <header className='help-page-header' data-component='header'>
              {renderHeader(currentArticle)}
            </header>
          ) : (
            <header className='help-page-header' data-component='header'>
              {showBreadcrumbs && <HelpBreadcrumbs />}
              <h1 className='help-page-title'>{currentArticle.title}</h1>
              {currentArticle.description && (
                <p className='help-page-description'>
                  {currentArticle.description}
                </p>
              )}
            </header>
          )}

          {/* Article content */}
          <article className='help-page-article' data-component='article'>
            {currentArticle.renderedContent ? (
              <HelpContent
                content={stripDuplicateTitle(
                  currentArticle.renderedContent,
                  currentArticle.title,
                )}
              />
            ) : (
              <HelpContent content={currentArticle.content} />
            )}
          </article>

          {/* Footer */}
          {renderFooter ? (
            <footer className='help-page-footer' data-component='footer'>
              {renderFooter(currentArticle)}
            </footer>
          ) : (
            <footer className='help-page-footer' data-component='footer'>
              {currentArticle.metadata.updatedAt && (
                <p className='help-page-updated'>
                  Last updated:{' '}
                  {new Date(
                    currentArticle.metadata.updatedAt,
                  ).toLocaleDateString()}
                </p>
              )}
              {showPagination && <HelpPagination />}
              {showTOC && <HelpTOC />}
            </footer>
          )}
        </main>
      </div>
    );
  },
);

HelpPage.displayName = 'HelpPage';
