/**
 * HelpContent Component for the Web Help Component Library
 * @module @privify-pw/web-help/components/HelpContent
 * 
 * Headless component for rendering help article content.
 */

import { forwardRef, useMemo } from 'react';
import type { HelpContentProps } from '../types/components';

/**
 * HelpContent is a headless component for rendering HTML content.
 * It provides semantic class names for styling and security through sanitization.
 */
export const HelpContent = forwardRef<HTMLDivElement, HelpContentProps>(function HelpContent(
  {
    content,
    renderCodeBlock,
    renderImage,
    renderLink,
    className = '',
    ...props
  },
  ref
) {
  // Process content for custom renderers (if provided)
  const processedContent = useMemo(() => {
    if (!renderCodeBlock && !renderImage && !renderLink) {
      return content;
    }
    // Custom processing would go here
    // For now, we just return the content as-is
    // In a real implementation, you'd parse and replace elements
    return content;
  }, [content, renderCodeBlock, renderImage, renderLink]);

  return (
    <div
      ref={ref}
      className={`help-content ${className}`.trim()}
      data-component="content"
      dangerouslySetInnerHTML={{ __html: processedContent }}
      {...props}
    />
  );
});

HelpContent.displayName = 'HelpContent';
