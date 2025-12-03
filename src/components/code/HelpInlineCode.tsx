/**
 * HelpInlineCode Component for the Web Help Component Library
 * @module @privify-pw/web-help/components/code/HelpInlineCode
 * 
 * Headless component for rendering inline code.
 */

import { forwardRef } from 'react';
import type { BaseComponentProps } from '../../core/types/components';

/**
 * Props for HelpInlineCode component.
 */
export interface HelpInlineCodeProps extends BaseComponentProps {
  /** Code content */
  children: React.ReactNode;
  /** Language hint for styling */
  language?: string;
}

/**
 * HelpInlineCode is a headless component for rendering inline code.
 */
export const HelpInlineCode = forwardRef<HTMLElement, HelpInlineCodeProps>(function HelpInlineCode(
  { children, language, className = '', ...props },
  ref
) {
  return (
    <code
      ref={ref}
      className={`help-inline-code ${className}`.trim()}
      data-component="inline-code"
      data-language={language}
      {...props}
    >
      {children}
    </code>
  );
});

HelpInlineCode.displayName = 'HelpInlineCode';
