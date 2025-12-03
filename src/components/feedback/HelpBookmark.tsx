/**
 * HelpBookmark Component for the Web Help Component Library
 * @module @privify-pw/web-help/components/feedback/HelpBookmark
 * 
 * Headless component for bookmarking articles.
 */

import { forwardRef, useCallback } from 'react';
import type { BaseComponentProps } from '../../core/types/components';

/**
 * Props for HelpBookmark component.
 */
export interface HelpBookmarkProps extends BaseComponentProps {
  /** Article ID */
  articleId: string;
  /** Whether the article is bookmarked */
  isBookmarked?: boolean;
  /** Called when bookmark is toggled */
  onToggle?: (articleId: string, bookmarked: boolean) => void;
  /** Bookmark button text when not bookmarked */
  addText?: string;
  /** Bookmark button text when bookmarked */
  removeText?: string;
  /** Size of the button */
  size?: 'small' | 'medium' | 'large';
  /** Render custom button content */
  renderContent?: (isBookmarked: boolean) => React.ReactNode;
}

/**
 * HelpBookmark is a headless component for bookmarking articles.
 */
export const HelpBookmark = forwardRef<HTMLButtonElement, HelpBookmarkProps>(function HelpBookmark(
  {
    articleId,
    isBookmarked = false,
    onToggle,
    addText = 'Bookmark',
    removeText = 'Remove bookmark',
    size = 'medium',
    renderContent,
    className = '',
    ...props
  },
  ref
) {
  const handleClick = useCallback(() => {
    onToggle?.(articleId, !isBookmarked);
  }, [articleId, isBookmarked, onToggle]);

  const label = isBookmarked ? removeText : addText;

  return (
    <button
      ref={ref}
      type="button"
      className={`help-bookmark ${className}`.trim()}
      data-component="bookmark"
      data-bookmarked={isBookmarked}
      data-size={size}
      onClick={handleClick}
      aria-pressed={isBookmarked}
      aria-label={label}
      {...props}
    >
      {renderContent ? (
        renderContent(isBookmarked)
      ) : (
        <>
          <span className="help-bookmark-icon" aria-hidden="true">
            {isBookmarked ? '★' : '☆'}
          </span>
          <span className="help-bookmark-text">{label}</span>
        </>
      )}
    </button>
  );
});

HelpBookmark.displayName = 'HelpBookmark';
