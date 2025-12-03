/**
 * HelpCodeBlock Component for the Web Help Component Library
 * @module @privify-pw/web-help/components/code/HelpCodeBlock
 * 
 * Headless component for rendering code blocks with copy functionality.
 */

import { forwardRef, useState, useCallback, useMemo } from 'react';
import type { BaseComponentProps } from '../../core/types/components';

/**
 * Props for HelpCodeBlock component.
 */
export interface HelpCodeBlockProps extends BaseComponentProps {
  /** Code content */
  code: string;
  /** Programming language */
  language?: string;
  /** Show line numbers */
  lineNumbers?: boolean;
  /** Starting line number */
  startLineNumber?: number;
  /** Lines to highlight (array of line numbers or ranges like "1-3") */
  highlightLines?: (number | string)[];
  /** Show copy button */
  showCopy?: boolean;
  /** Title/filename for the code block */
  title?: string;
  /** Called when code is copied */
  onCopy?: (code: string) => void;
  /** Custom copy button text */
  copyText?: string;
  /** Custom copied confirmation text */
  copiedText?: string;
  /** Duration to show copied state (ms) */
  copiedDuration?: number;
}

/**
 * Parse highlight lines from mixed format.
 */
function parseHighlightLines(highlights: (number | string)[]): Set<number> {
  const lines = new Set<number>();
  
  for (const item of highlights) {
    if (typeof item === 'number') {
      lines.add(item);
    } else if (typeof item === 'string') {
      const range = item.split('-').map(Number);
      if (range.length === 2 && !isNaN(range[0]) && !isNaN(range[1])) {
        for (let i = range[0]; i <= range[1]; i++) {
          lines.add(i);
        }
      } else if (!isNaN(Number(item))) {
        lines.add(Number(item));
      }
    }
  }
  
  return lines;
}

/**
 * HelpCodeBlock is a headless component for rendering code blocks.
 */
export const HelpCodeBlock = forwardRef<HTMLDivElement, HelpCodeBlockProps>(function HelpCodeBlock(
  {
    code,
    language,
    lineNumbers = false,
    startLineNumber = 1,
    highlightLines = [],
    showCopy = true,
    title,
    onCopy,
    copyText = 'Copy',
    copiedText = 'Copied!',
    copiedDuration = 2000,
    className = '',
    ...props
  },
  ref
) {
  const [isCopied, setIsCopied] = useState(false);

  // Parse code lines
  const lines = useMemo(() => code.split('\n'), [code]);
  const highlightedLines = useMemo(
    () => parseHighlightLines(highlightLines),
    [highlightLines]
  );

  // Handle copy
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      onCopy?.(code);
      
      setTimeout(() => {
        setIsCopied(false);
      }, copiedDuration);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  }, [code, copiedDuration, onCopy]);

  return (
    <div
      ref={ref}
      className={`help-code-block ${className}`.trim()}
      data-component="code-block"
      data-language={language}
      data-line-numbers={lineNumbers}
      {...props}
    >
      {/* Header */}
      {(title || showCopy) && (
        <div className="help-code-header">
          {title && <span className="help-code-title">{title}</span>}
          {language && <span className="help-code-language">{language}</span>}
          {showCopy && (
            <button
              type="button"
              className="help-code-copy"
              onClick={handleCopy}
              aria-label={isCopied ? copiedText : `${copyText} code`}
              data-copied={isCopied}
            >
              {isCopied ? copiedText : copyText}
            </button>
          )}
        </div>
      )}

      {/* Code content */}
      <pre className="help-code-pre">
        <code className={`help-code ${language ? `language-${language}` : ''}`}>
          {lineNumbers ? (
            <table className="help-code-table">
              <tbody>
                {lines.map((line, index) => {
                  const lineNumber = startLineNumber + index;
                  const isHighlighted = highlightedLines.has(lineNumber);
                  
                  return (
                    <tr
                      key={lineNumber}
                      className="help-code-line"
                      data-line={lineNumber}
                      data-highlighted={isHighlighted}
                    >
                      <td className="help-code-line-number" aria-hidden="true">
                        {lineNumber}
                      </td>
                      <td className="help-code-line-content">{line}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            code
          )}
        </code>
      </pre>
    </div>
  );
});

HelpCodeBlock.displayName = 'HelpCodeBlock';
