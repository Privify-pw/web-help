/**
 * HelpDownload Component for the Web Help Component Library
 * @module @privify-pw/web-help/components/media/HelpDownload
 * 
 * Headless component for downloadable resources.
 */

import { forwardRef, useCallback } from 'react';
import type { BaseComponentProps } from '../../core/types/components';

/**
 * Download file type.
 */
export type DownloadType = 'pdf' | 'code' | 'template' | 'image' | 'document' | 'other';

/**
 * Props for HelpDownload component.
 */
export interface HelpDownloadProps extends BaseComponentProps {
  /** Download URL */
  href: string;
  /** Download filename (optional, uses URL filename if not provided) */
  filename?: string;
  /** File type for styling/icons */
  type?: DownloadType;
  /** Display title/label */
  title: string;
  /** Description of the download */
  description?: string;
  /** File size (for display) */
  fileSize?: string;
  /** Called before download starts */
  onDownload?: () => void;
  /** Whether to open in new tab instead of download */
  openInNewTab?: boolean;
  /** Children to render (overrides default content) */
  children?: React.ReactNode;
}

/**
 * Get icon for file type.
 */
function getFileIcon(type: DownloadType): string {
  switch (type) {
    case 'pdf':
      return '📄';
    case 'code':
      return '📝';
    case 'template':
      return '📋';
    case 'image':
      return '🖼️';
    case 'document':
      return '📃';
    default:
      return '📁';
  }
}

/**
 * HelpDownload is a headless component for downloadable resources.
 */
export const HelpDownload = forwardRef<HTMLAnchorElement, HelpDownloadProps>(function HelpDownload(
  {
    href,
    filename,
    type = 'other',
    title,
    description,
    fileSize,
    onDownload,
    openInNewTab = false,
    children,
    className = '',
    ...props
  },
  ref
) {
  const handleClick = useCallback(() => {
    onDownload?.();
  }, [onDownload]);

  const downloadFilename = filename ?? href.split('/').pop() ?? 'download';

  return (
    <a
      ref={ref}
      href={href}
      download={openInNewTab ? undefined : downloadFilename}
      target={openInNewTab ? '_blank' : undefined}
      rel={openInNewTab ? 'noopener noreferrer' : undefined}
      className={`help-download ${className}`.trim()}
      data-component="download"
      data-type={type}
      onClick={handleClick}
      {...props}
    >
      {children ?? (
        <>
          <span className="help-download-icon" aria-hidden="true">
            {getFileIcon(type)}
          </span>
          <span className="help-download-content">
            <span className="help-download-title">{title}</span>
            {description && (
              <span className="help-download-description">{description}</span>
            )}
            {fileSize && (
              <span className="help-download-size">{fileSize}</span>
            )}
          </span>
          <span className="help-download-action" aria-hidden="true">
            ⬇
          </span>
        </>
      )}
    </a>
  );
});

HelpDownload.displayName = 'HelpDownload';
