/**
 * HelpTabs Component for the Web Help Component Library
 * @module @privify-pw/web-help/components/visual/HelpTabs
 * 
 * Headless component for tabbed content.
 */

import { forwardRef, useState, useCallback, useId, useRef } from 'react';
import type { BaseComponentProps } from '../../core/types/components';

/**
 * Tab item.
 */
export interface TabItem {
  /** Unique ID for the tab */
  id: string;
  /** Tab label */
  label: React.ReactNode;
  /** Tab content */
  content: React.ReactNode;
  /** Whether this tab is disabled */
  disabled?: boolean;
  /** Icon for the tab */
  icon?: React.ReactNode;
}

/**
 * Props for HelpTabs component.
 */
export interface HelpTabsProps extends BaseComponentProps {
  /** Tab items */
  items: TabItem[];
  /** Default active tab ID */
  defaultActiveId?: string;
  /** Controlled active tab */
  activeId?: string;
  /** Called when active tab changes */
  onActiveChange?: (tabId: string) => void;
  /** Tab orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Render custom tab */
  renderTab?: (item: TabItem, isActive: boolean) => React.ReactNode;
}

/**
 * HelpTabs is a headless component for tabbed content.
 */
export const HelpTabs = forwardRef<HTMLDivElement, HelpTabsProps>(function HelpTabs(
  {
    items,
    defaultActiveId,
    activeId: controlledActiveId,
    onActiveChange,
    orientation = 'horizontal',
    renderTab,
    className = '',
    ...props
  },
  ref
) {
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const defaultId = defaultActiveId ?? items.find((i) => !i.disabled)?.id ?? items[0]?.id;
  const [internalActiveId, setInternalActiveId] = useState<string>(defaultId ?? '');

  const activeId = controlledActiveId ?? internalActiveId;
  const isControlled = controlledActiveId !== undefined;

  const handleTabClick = useCallback(
    (tabId: string) => {
      if (!isControlled) {
        setInternalActiveId(tabId);
      }
      onActiveChange?.(tabId);
    },
    [isControlled, onActiveChange]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, currentIndex: number) => {
      const enabledTabs = items.filter((i) => !i.disabled);
      const currentEnabledIndex = enabledTabs.findIndex((i) => i.id === items[currentIndex].id);

      let nextIndex = -1;

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          nextIndex = (currentEnabledIndex + 1) % enabledTabs.length;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          nextIndex = (currentEnabledIndex - 1 + enabledTabs.length) % enabledTabs.length;
          break;
        case 'Home':
          event.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          event.preventDefault();
          nextIndex = enabledTabs.length - 1;
          break;
        default:
          return;
      }

      if (nextIndex >= 0 && enabledTabs[nextIndex]) {
        const nextTabId = enabledTabs[nextIndex].id;
        const originalIndex = items.findIndex((i) => i.id === nextTabId);
        tabRefs.current[originalIndex]?.focus();
        handleTabClick(nextTabId);
      }
    },
    [items, handleTabClick]
  );

  return (
    <div
      ref={ref}
      className={`help-tabs ${className}`.trim()}
      data-component="tabs"
      data-orientation={orientation}
      {...props}
    >
      {/* Tab list */}
      <div
        className="help-tabs-list"
        role="tablist"
        aria-orientation={orientation}
      >
        {items.map((item, index) => {
          const isActive = item.id === activeId;
          const tabId = `${baseId}-tab-${index}`;
          const panelId = `${baseId}-panel-${index}`;

          return renderTab ? (
            <button
              key={item.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              id={tabId}
              className="help-tabs-tab"
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              disabled={item.disabled}
              onClick={() => !item.disabled && handleTabClick(item.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              data-active={isActive}
              data-disabled={item.disabled}
            >
              {renderTab(item, isActive)}
            </button>
          ) : (
            <button
              key={item.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              id={tabId}
              className="help-tabs-tab"
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              disabled={item.disabled}
              onClick={() => !item.disabled && handleTabClick(item.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              data-active={isActive}
              data-disabled={item.disabled}
            >
              {item.icon && <span className="help-tabs-tab-icon">{item.icon}</span>}
              <span className="help-tabs-tab-label">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab panels */}
      <div className="help-tabs-panels">
        {items.map((item, index) => {
          const isActive = item.id === activeId;
          const tabId = `${baseId}-tab-${index}`;
          const panelId = `${baseId}-panel-${index}`;

          return (
            <div
              key={item.id}
              id={panelId}
              className="help-tabs-panel"
              role="tabpanel"
              aria-labelledby={tabId}
              tabIndex={0}
              hidden={!isActive}
              data-active={isActive}
            >
              {item.content}
            </div>
          );
        })}
      </div>
    </div>
  );
});

HelpTabs.displayName = 'HelpTabs';
