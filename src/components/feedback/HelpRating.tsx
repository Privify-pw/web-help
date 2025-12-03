/**
 * HelpRating Component for the Web Help Component Library
 * @module @privify-pw/web-help/components/feedback/HelpRating
 * 
 * Headless component for article ratings.
 */

import { forwardRef, useState, useCallback } from 'react';
import type { BaseComponentProps } from '../../core/types/components';

/**
 * Props for HelpRating component.
 */
export interface HelpRatingProps extends BaseComponentProps {
  /** Current rating value (1-5) */
  value?: number;
  /** Maximum rating value */
  max?: number;
  /** Article ID for the rating */
  articleId: string;
  /** Called when rating changes */
  onRate?: (articleId: string, rating: number) => void;
  /** Whether the rating is readonly */
  readOnly?: boolean;
  /** Size of rating icons */
  size?: 'small' | 'medium' | 'large';
  /** Custom render for rating icons */
  renderIcon?: (filled: boolean, hovered: boolean, index: number) => React.ReactNode;
  /** Label for accessibility */
  label?: string;
}

/**
 * Default star icon renderer.
 */
function defaultRenderIcon(filled: boolean, hovered: boolean): React.ReactNode {
  if (filled || hovered) {
    return '★';
  }
  return '☆';
}

/**
 * HelpRating is a headless component for article ratings.
 */
export const HelpRating = forwardRef<HTMLDivElement, HelpRatingProps>(function HelpRating(
  {
    value = 0,
    max = 5,
    articleId,
    onRate,
    readOnly = false,
    size = 'medium',
    renderIcon = defaultRenderIcon,
    label = 'Rate this article',
    className = '',
    ...props
  },
  ref
) {
  const [hoverValue, setHoverValue] = useState<number>(0);

  const handleClick = useCallback(
    (rating: number) => {
      if (!readOnly) {
        onRate?.(articleId, rating);
      }
    },
    [readOnly, onRate, articleId]
  );

  const handleMouseEnter = useCallback(
    (rating: number) => {
      if (!readOnly) {
        setHoverValue(rating);
      }
    },
    [readOnly]
  );

  const handleMouseLeave = useCallback(() => {
    setHoverValue(0);
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, rating: number) => {
      if (readOnly) return;

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleClick(rating);
      }
    },
    [readOnly, handleClick]
  );

  const displayValue = hoverValue || value;

  return (
    <div
      ref={ref}
      className={`help-rating ${className}`.trim()}
      data-component="rating"
      data-size={size}
      data-readonly={readOnly}
      data-value={value}
      role="radiogroup"
      aria-label={label}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {Array.from({ length: max }, (_, index) => {
        const rating = index + 1;
        const filled = rating <= displayValue;
        const hovered = rating <= hoverValue;

        return (
          <button
            key={rating}
            type="button"
            className="help-rating-star"
            onClick={() => handleClick(rating)}
            onMouseEnter={() => handleMouseEnter(rating)}
            onKeyDown={(e) => handleKeyDown(e, rating)}
            disabled={readOnly}
            role="radio"
            aria-checked={rating === value}
            aria-label={`${rating} star${rating !== 1 ? 's' : ''}`}
            data-filled={filled}
            data-hovered={hovered}
            tabIndex={rating === value || (value === 0 && rating === 1) ? 0 : -1}
          >
            {renderIcon(filled, hovered, index)}
          </button>
        );
      })}
    </div>
  );
});

HelpRating.displayName = 'HelpRating';
