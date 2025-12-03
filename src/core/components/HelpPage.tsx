/**
 * HelpPage Component for the Web Help Component Library
 * @module @privify-pw/web-help/components/HelpPage
 * 
 * Headless component for rendering a help page layout.
 */

import { forwardRef, useEffect } from 'react';
import type { HelpPageProps } from '../types/components';
import { useHelpContext } from '../context/HelpContext';
import { HelpContent } from './HelpContent';

/**
 * HelpPage is a headless container component for rendering help articles.
 * It provides semantic class names and data attributes for styling.
 */
export const HelpPage = forwardRef<HTMLDivElement, HelpPageProps>(function HelpPage(
  {
    article,
    articleId,
    renderHeader,
    renderFooter,
    renderSidebar,
    showTOC = true,
    showBreadcrumbs = true,
    showPagination = true,
    className = '',
    children,
    ...props
  },
  ref
) {
  const { loadArticle, state } = useHelpContext();

  // Load article if articleId provided
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
        data-state="loading"
        {...props}
      >
        <div className="help-page-loader" aria-live="polite">
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
        data-state="error"
        role="alert"
        {...props}
      >
        <div className="help-page-error-message">
          {error.message}
        </div>
      </div>
    );
  }

  // Render empty state
  if (!currentArticle) {
    return (
      <div
        ref={ref}
        className={`help-page help-page-empty ${className}`.trim()}
        data-state="empty"
        {...props}
      >
        {children ?? (
          <div className="help-page-empty-message">
            No article selected
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`help-page ${className}`.trim()}
      data-state="ready"
      data-article-id={currentArticle.id}
      {...props}
    >
      {/* Sidebar */}
      {renderSidebar && (
        <aside className="help-page-sidebar" data-component="sidebar">
          {renderSidebar(currentArticle)}
        </aside>
      )}

      {/* Main content area */}
      <main className="help-page-main">
        {/* Header */}
        {renderHeader ? (
          <header className="help-page-header" data-component="header">
            {renderHeader(currentArticle)}
          </header>
        ) : (
          <header className="help-page-header" data-component="header">
            <h1 className="help-page-title">{currentArticle.title}</h1>
            {currentArticle.description && (
              <p className="help-page-description">{currentArticle.description}</p>
            )}
          </header>
        )}

        {/* Breadcrumbs slot */}
        {showBreadcrumbs && (
          <nav className="help-page-breadcrumbs-slot" data-component="breadcrumbs" aria-label="Breadcrumb">
            {/* Breadcrumbs component should be rendered here by consumer */}
          </nav>
        )}

        {/* Article content */}
        <article className="help-page-article" data-component="article">
          {currentArticle.renderedContent ? (
            <HelpContent content={currentArticle.renderedContent} />
          ) : (
            <HelpContent content={currentArticle.content} />
          )}
        </article>

        {/* Table of contents slot */}
        {showTOC && (
          <nav className="help-page-toc-slot" data-component="toc" aria-label="Table of contents">
            {/* TOC component should be rendered here by consumer */}
          </nav>
        )}

        {/* Footer */}
        {renderFooter ? (
          <footer className="help-page-footer" data-component="footer">
            {renderFooter(currentArticle)}
          </footer>
        ) : (
          <footer className="help-page-footer" data-component="footer">
            {currentArticle.metadata.updatedAt && (
              <p className="help-page-updated">
                Last updated: {new Date(currentArticle.metadata.updatedAt).toLocaleDateString()}
              </p>
            )}
          </footer>
        )}

        {/* Pagination slot */}
        {showPagination && (
          <nav className="help-page-pagination-slot" data-component="pagination" aria-label="Article navigation">
            {/* Pagination component should be rendered here by consumer */}
          </nav>
        )}
      </main>
    </div>
  );
});

HelpPage.displayName = 'HelpPage';
