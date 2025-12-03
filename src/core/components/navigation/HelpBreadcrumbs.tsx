/**
 * HelpBreadcrumbs Component for the Web Help Component Library
 * @module @privify-pw/web-help/components/navigation/HelpBreadcrumbs
 * 
 * Headless component for rendering breadcrumb navigation.
 */

import { forwardRef, useCallback } from 'react';
import type { HelpBreadcrumbsProps } from '../../types/components';
import type { BreadcrumbItem } from '../../types/content';

/**
 * HelpBreadcrumbs is a headless component for rendering breadcrumb navigation.
 */
export const HelpBreadcrumbs = forwardRef<HTMLElement, HelpBreadcrumbsProps>(function HelpBreadcrumbs(
  {
    items = [],
    separator = '/',
    onItemClick,
    renderItem,
    className = '',
    ...props
  },
  ref
) {
  const handleClick = useCallback(
    (item: BreadcrumbItem, event: React.MouseEvent) => {
      if (item.current) {
        event.preventDefault();
        return;
      }
      onItemClick?.(item);
    },
    [onItemClick]
  );

  const defaultRenderItem = (item: BreadcrumbItem, isLast: boolean): React.ReactNode => {
    if (isLast || item.current) {
      return (
        <span className="help-breadcrumb-text" aria-current="page">
          {item.label}
        </span>
      );
    }

    return (
      <a
        href={item.path ?? '#'}
        className="help-breadcrumb-link"
        onClick={(e) => handleClick(item, e)}
      >
        {item.label}
      </a>
    );
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      ref={ref}
      className={`help-breadcrumbs ${className}`.trim()}
      data-component="breadcrumbs"
      aria-label="Breadcrumb"
      {...props}
    >
      <ol className="help-breadcrumbs-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li
              key={item.id ?? item.label}
              className="help-breadcrumb-item"
              data-current={isLast || item.current}
            >
              {renderItem ? renderItem(item, isLast) : defaultRenderItem(item, isLast)}
              {!isLast && (
                <span className="help-breadcrumb-separator" aria-hidden="true">
                  {separator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});

HelpBreadcrumbs.displayName = 'HelpBreadcrumbs';
