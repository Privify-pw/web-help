/**
 * HelpTOC Component for the Web Help Component Library
 * @module @privify-pw/web-help/components/navigation/HelpTOC
 * 
 * Headless component for rendering table of contents.
 */

import { forwardRef, useCallback } from 'react';
import type { HelpTOCProps } from '../../types/components';
import type { TOCEntry } from '../../types/content';

/**
 * HelpTOC is a headless component for rendering a table of contents.
 */
export const HelpTOC = forwardRef<HTMLElement, HelpTOCProps>(function HelpTOC(
  {
    entries = [],
    activeId,
    onHeadingClick,
    maxDepth = 3,
    title,
    className = '',
    ...props
  },
  ref
) {
  const handleClick = useCallback(
    (id: string, event: React.MouseEvent) => {
      event.preventDefault();
      onHeadingClick?.(id);
      
      // Scroll to heading
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    },
    [onHeadingClick]
  );

  const renderEntry = (entry: TOCEntry, depth = 1): React.ReactNode => {
    if (depth > maxDepth) return null;

    const isActive = entry.id === activeId;

    return (
      <li
        key={entry.id}
        className={`help-toc-item help-toc-item-level-${entry.level}`}
        data-active={isActive}
      >
        <a
          href={`#${entry.id}`}
          className="help-toc-link"
          onClick={(e) => handleClick(entry.id, e)}
          aria-current={isActive ? 'location' : undefined}
        >
          {entry.text}
        </a>
        {entry.children && entry.children.length > 0 && (
          <ul className="help-toc-children">
            {entry.children.map((child) => renderEntry(child, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  if (entries.length === 0) {
    return null;
  }

  return (
    <nav
      ref={ref}
      className={`help-toc ${className}`.trim()}
      data-component="toc"
      aria-label="Table of contents"
      {...props}
    >
      {title && <div className="help-toc-title">{title}</div>}
      <ul className="help-toc-list">
        {entries.map((entry) => renderEntry(entry))}
      </ul>
    </nav>
  );
});

HelpTOC.displayName = 'HelpTOC';
