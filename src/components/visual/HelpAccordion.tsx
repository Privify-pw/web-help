/**
 * HelpAccordion Component for the Web Help Component Library
 * @module @privify-pw/web-help/components/visual/HelpAccordion
 * 
 * Headless component for expandable/collapsible sections.
 */

import { forwardRef, useState, useCallback, useId } from 'react';
import type { BaseComponentProps } from '../../core/types/components';

/**
 * Accordion item.
 */
export interface AccordionItem {
  /** Unique ID for the item */
  id: string;
  /** Title to display */
  title: React.ReactNode;
  /** Content when expanded */
  content: React.ReactNode;
  /** Whether this item is disabled */
  disabled?: boolean;
}

/**
 * Props for HelpAccordion component.
 */
export interface HelpAccordionProps extends BaseComponentProps {
  /** Accordion items */
  items: AccordionItem[];
  /** Allow multiple items to be expanded */
  multiple?: boolean;
  /** Default expanded item IDs */
  defaultExpanded?: string[];
  /** Controlled expanded items */
  expanded?: string[];
  /** Called when expanded items change */
  onExpandedChange?: (expandedIds: string[]) => void;
  /** Render custom trigger */
  renderTrigger?: (item: AccordionItem, isExpanded: boolean) => React.ReactNode;
}

/**
 * HelpAccordion is a headless component for expandable sections.
 */
export const HelpAccordion = forwardRef<HTMLDivElement, HelpAccordionProps>(function HelpAccordion(
  {
    items,
    multiple = false,
    defaultExpanded = [],
    expanded: controlledExpanded,
    onExpandedChange,
    renderTrigger,
    className = '',
    ...props
  },
  ref
) {
  const baseId = useId();
  const [internalExpanded, setInternalExpanded] = useState<string[]>(defaultExpanded);

  const expanded = controlledExpanded ?? internalExpanded;
  const isControlled = controlledExpanded !== undefined;

  const toggleItem = useCallback(
    (itemId: string) => {
      const newExpanded = expanded.includes(itemId)
        ? expanded.filter((id) => id !== itemId)
        : multiple
        ? [...expanded, itemId]
        : [itemId];

      if (!isControlled) {
        setInternalExpanded(newExpanded);
      }
      onExpandedChange?.(newExpanded);
    },
    [expanded, multiple, isControlled, onExpandedChange]
  );

  return (
    <div
      ref={ref}
      className={`help-accordion ${className}`.trim()}
      data-component="accordion"
      data-multiple={multiple}
      {...props}
    >
      {items.map((item, index) => {
        const isExpanded = expanded.includes(item.id);
        const triggerId = `${baseId}-trigger-${index}`;
        const contentId = `${baseId}-content-${index}`;

        return (
          <div
            key={item.id}
            className="help-accordion-item"
            data-expanded={isExpanded}
            data-disabled={item.disabled}
          >
            <h3 className="help-accordion-header">
              {renderTrigger ? (
                <button
                  type="button"
                  id={triggerId}
                  className="help-accordion-trigger"
                  onClick={() => !item.disabled && toggleItem(item.id)}
                  aria-expanded={isExpanded}
                  aria-controls={contentId}
                  disabled={item.disabled}
                >
                  {renderTrigger(item, isExpanded)}
                </button>
              ) : (
                <button
                  type="button"
                  id={triggerId}
                  className="help-accordion-trigger"
                  onClick={() => !item.disabled && toggleItem(item.id)}
                  aria-expanded={isExpanded}
                  aria-controls={contentId}
                  disabled={item.disabled}
                >
                  <span className="help-accordion-title">{item.title}</span>
                  <span className="help-accordion-chevron" aria-hidden="true">
                    {isExpanded ? '▼' : '▶'}
                  </span>
                </button>
              )}
            </h3>
            <div
              id={contentId}
              className="help-accordion-panel"
              role="region"
              aria-labelledby={triggerId}
              hidden={!isExpanded}
            >
              <div className="help-accordion-content">{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

HelpAccordion.displayName = 'HelpAccordion';
