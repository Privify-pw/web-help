/**
 * HelpImage Component for the Web Help Component Library
 * @module @privify-pw/web-help/components/media/HelpImage
 * 
 * Headless component for rendering images with lazy loading and lightbox support.
 */

import { forwardRef, useState, useCallback, useRef, useEffect } from 'react';
import type { BaseComponentProps } from '../../core/types/components';

/**
 * Props for HelpImage component.
 */
export interface HelpImageProps extends BaseComponentProps {
  /** Image source URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Image title */
  title?: string;
  /** Loading strategy */
  loading?: 'lazy' | 'eager';
  /** Enable lightbox/zoom functionality */
  lightbox?: boolean;
  /** Width of the image */
  width?: number | string;
  /** Height of the image */
  height?: number | string;
  /** Caption to display */
  caption?: string;
  /** Called when image is clicked (if not using lightbox) */
  onClick?: () => void;
  /** Called when lightbox is opened */
  onLightboxOpen?: () => void;
  /** Called when lightbox is closed */
  onLightboxClose?: () => void;
}

/**
 * HelpImage is a headless component for rendering images.
 */
export const HelpImage = forwardRef<HTMLElement, HelpImageProps>(function HelpImage(
  {
    src,
    alt,
    title,
    loading = 'lazy',
    lightbox = false,
    width,
    height,
    caption,
    onClick,
    onLightboxOpen,
    onLightboxClose,
    className = '',
    ...props
  },
  ref
) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Handle image load
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
  }, []);

  // Handle image error
  const handleError = useCallback(() => {
    setIsLoaded(true);
    setHasError(true);
  }, []);

  // Handle click
  const handleClick = useCallback(() => {
    if (lightbox) {
      setIsLightboxOpen(true);
      onLightboxOpen?.();
    }
    onClick?.();
  }, [lightbox, onClick, onLightboxOpen]);

  // Handle lightbox close
  const handleLightboxClose = useCallback(() => {
    setIsLightboxOpen(false);
    onLightboxClose?.();
  }, [onLightboxClose]);

  // Handle escape key for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleLightboxClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, handleLightboxClose]);

  const imageElement = (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      title={title}
      loading={loading}
      width={width}
      height={height}
      className="help-image-img"
      data-loaded={isLoaded}
      data-error={hasError}
      onLoad={handleLoad}
      onError={handleError}
    />
  );

  return (
    <>
      <figure
        ref={ref as React.Ref<HTMLElement>}
        className={`help-image ${className}`.trim()}
        data-component="image"
        data-lightbox={lightbox}
        data-loaded={isLoaded}
        data-error={hasError}
        {...props}
      >
        {lightbox ? (
          <button
            type="button"
            className="help-image-button"
            onClick={handleClick}
            aria-label={`View ${alt} in fullscreen`}
          >
            {imageElement}
          </button>
        ) : (
          imageElement
        )}
        {caption && <figcaption className="help-image-caption">{caption}</figcaption>}
      </figure>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          className="help-image-lightbox"
          data-component="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Fullscreen view of ${alt}`}
          onClick={handleLightboxClose}
        >
          <button
            type="button"
            className="help-image-lightbox-close"
            onClick={handleLightboxClose}
            aria-label="Close fullscreen view"
          >
            ×
          </button>
          <img
            src={src}
            alt={alt}
            title={title}
            className="help-image-lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
});

HelpImage.displayName = 'HelpImage';
