/**
 * HelpNavigation Component for the Web Help Component Library
 * @module @privify-pw/web-help/components/HelpNavigation
 * 
 * Headless component for rendering navigation menu.
 */

import { forwardRef, useState, useCallback } from 'react';
import type { HelpNavigationProps, NavigationItem } from '../types/components';

/**
 * HelpNavigation is a headless component for rendering a navigation menu.
 */
export const HelpNavigation = forwardRef<HTMLElement, HelpNavigationProps>(function HelpNavigation(
  {
    items = [],
    activeId,
    onItemSelect,
    collapsible = true,
    defaultCollapsed = false,
    className = '',
    ...props
  },
  ref
) {
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(() => {
    if (defaultCollapsed) {
      return new Set(items.filter((i) => i.children?.length).map((i) => i.id));
    }
    return new Set();
  });

  const toggleCollapsed = useCallback((id: string) => {
    setCollapsedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleItemClick = useCallback(
    (item: NavigationItem) => {
      if (item.children?.length && collapsible) {
        toggleCollapsed(item.id);
      }
      onItemSelect?.(item.id);
    },
    [collapsible, toggleCollapsed, onItemSelect]
  );

  const renderItem = (item: NavigationItem, depth = 0): React.ReactNode => {
    const isActive = item.id === activeId;
    const isCollapsed = collapsedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <li
        key={item.id}
        className={`help-nav-item help-nav-item-level-${depth}`}
        data-id={item.id}
        data-active={isActive}
        data-category={item.isCategory}
        data-collapsed={hasChildren ? isCollapsed : undefined}
      >
        <button
          type="button"
          className="help-nav-button"
          onClick={() => handleItemClick(item)}
          aria-current={isActive ? 'page' : undefined}
          aria-expanded={hasChildren ? !isCollapsed : undefined}
        >
          {item.icon && <span className="help-nav-icon">{item.icon}</span>}
          <span className="help-nav-label">{item.label}</span>
          {hasChildren && (
            <span className="help-nav-chevron" aria-hidden="true">
              {isCollapsed ? '▶' : '▼'}
            </span>
          )}
        </button>
        {hasChildren && !isCollapsed && (
          <ul className="help-nav-children" role="group">
            {item.children!.map((child) => renderItem(child, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <nav
      ref={ref}
      className={`help-navigation ${className}`.trim()}
      data-component="navigation"
      aria-label="Help navigation"
      {...props}
    >
      <ul className="help-nav-list" role="tree">
        {items.map((item) => renderItem(item))}
      </ul>
    </nav>
  );
});

HelpNavigation.displayName = 'HelpNavigation';
