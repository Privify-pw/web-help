/**
 * HelpCallout Component for the Web Help Component Library
 * @module @privify-pw/web-help/components/visual/HelpCallout
 * 
 * Headless component for callout/alert boxes.
 */

import { forwardRef } from 'react';
import type { BaseComponentProps } from '../../core/types/components';

/**
 * Callout type.
 */
export type CalloutType = 'info' | 'warning' | 'tip' | 'danger' | 'note' | 'success';

/**
 * Props for HelpCallout component.
 */
export interface HelpCalloutProps extends BaseComponentProps {
  /** Callout type */
  type?: CalloutType;
  /** Title text */
  title?: string;
  /** Icon to display (overrides default) */
  icon?: React.ReactNode;
  /** Content */
  children: React.ReactNode;
  /** Whether the callout can be dismissed */
  dismissible?: boolean;
  /** Called when dismissed */
  onDismiss?: () => void;
}

/**
 * Get default icon for callout type.
 */
function getDefaultIcon(type: CalloutType): string {
  switch (type) {
    case 'info':
      return 'ℹ️';
    case 'warning':
      return '⚠️';
    case 'tip':
      return '💡';
    case 'danger':
      return '🚨';
    case 'note':
      return '📝';
    case 'success':
      return '✅';
    default:
      return 'ℹ️';
  }
}

/**
 * Get ARIA role for callout type.
 */
function getAriaRole(type: CalloutType): string {
  switch (type) {
    case 'warning':
    case 'danger':
      return 'alert';
    default:
      return 'note';
  }
}

/**
 * HelpCallout is a headless component for callout/alert boxes.
 */
export const HelpCallout = forwardRef<HTMLDivElement, HelpCalloutProps>(function HelpCallout(
  {
    type = 'info',
    title,
    icon,
    children,
    dismissible = false,
    onDismiss,
    className = '',
    ...props
  },
  ref
) {
  return (
    <aside
      ref={ref}
      className={`help-callout help-callout-${type} ${className}`.trim()}
      data-component="callout"
      data-type={type}
      role={getAriaRole(type)}
      {...props}
    >
      <div className="help-callout-icon" aria-hidden="true">
        {icon ?? getDefaultIcon(type)}
      </div>
      <div className="help-callout-content">
        {title && <div className="help-callout-title">{title}</div>}
        <div className="help-callout-body">{children}</div>
      </div>
      {dismissible && (
        <button
          type="button"
          className="help-callout-dismiss"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </aside>
  );
});

HelpCallout.displayName = 'HelpCallout';
