/**
 * HelpPagination Component for the Web Help Component Library
 * @module @privify-pw/web-help/components/navigation/HelpPagination
 * 
 * Headless component for prev/next navigation.
 */

import { forwardRef, useCallback } from 'react';
import type { HelpPaginationProps } from '../../types/components';

/**
 * HelpPagination is a headless component for prev/next article navigation.
 */
export const HelpPagination = forwardRef<HTMLElement, HelpPaginationProps>(function HelpPagination(
  {
    navigation,
    onPrev,
    onNext,
    renderPrev,
    renderNext,
    className = '',
    ...props
  },
  ref
) {
  const handlePrevClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      onPrev?.();
    },
    [onPrev]
  );

  const handleNextClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      onNext?.();
    },
    [onNext]
  );

  const hasPrev = !!navigation?.prev;
  const hasNext = !!navigation?.next;

  if (!hasPrev && !hasNext) {
    return null;
  }

  return (
    <nav
      ref={ref}
      className={`help-pagination ${className}`.trim()}
      data-component="pagination"
      aria-label="Article navigation"
      {...props}
    >
      <div className="help-pagination-prev" data-has-prev={hasPrev}>
        {hasPrev && (
          renderPrev ? (
            renderPrev(navigation?.prev)
          ) : (
            <a
              href={navigation?.prev?.path ?? '#'}
              className="help-pagination-link help-pagination-link-prev"
              onClick={handlePrevClick}
              rel="prev"
            >
              <span className="help-pagination-direction" aria-hidden="true">
                ←
              </span>
              <span className="help-pagination-meta">
                <span className="help-pagination-label">Previous</span>
                <span className="help-pagination-title">{navigation?.prev?.title}</span>
              </span>
            </a>
          )
        )}
      </div>
      <div className="help-pagination-next" data-has-next={hasNext}>
        {hasNext && (
          renderNext ? (
            renderNext(navigation?.next)
          ) : (
            <a
              href={navigation?.next?.path ?? '#'}
              className="help-pagination-link help-pagination-link-next"
              onClick={handleNextClick}
              rel="next"
            >
              <span className="help-pagination-meta">
                <span className="help-pagination-label">Next</span>
                <span className="help-pagination-title">{navigation?.next?.title}</span>
              </span>
              <span className="help-pagination-direction" aria-hidden="true">
                →
              </span>
            </a>
          )
        )}
      </div>
    </nav>
  );
});

HelpPagination.displayName = 'HelpPagination';
