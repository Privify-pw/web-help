/**
 * HelpVideo Component for the Web Help Component Library
 * @module @privify-pw/web-help/components/media/HelpVideo
 * 
 * Headless component for rendering video embeds.
 */

import { forwardRef, useState, useCallback, useMemo } from 'react';
import type { BaseComponentProps } from '../../core/types/components';

/**
 * Video provider type.
 */
export type VideoProvider = 'youtube' | 'vimeo' | 'custom';

/**
 * Props for HelpVideo component.
 */
export interface HelpVideoProps extends BaseComponentProps {
  /** Video source URL or ID */
  src: string;
  /** Video provider */
  provider?: VideoProvider;
  /** Video title for accessibility */
  title: string;
  /** Whether to lazy load the video */
  lazyLoad?: boolean;
  /** Aspect ratio (e.g., "16/9") */
  aspectRatio?: string;
  /** Width of the video */
  width?: number | string;
  /** Height of the video */
  height?: number | string;
  /** Show video controls */
  controls?: boolean;
  /** Allow fullscreen */
  allowFullscreen?: boolean;
  /** Custom thumbnail URL */
  thumbnail?: string;
  /** Called when video starts playing */
  onPlay?: () => void;
}

/**
 * Extract video ID from URL for known providers.
 */
function extractVideoId(src: string, provider: VideoProvider): string {
  if (provider === 'youtube') {
    // Handle various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/,
      /^([^&?/]+)$/, // Just the ID
    ];
    for (const pattern of patterns) {
      const match = src.match(pattern);
      if (match) return match[1];
    }
  } else if (provider === 'vimeo') {
    // Handle various Vimeo URL formats
    const patterns = [
      /(?:vimeo\.com\/)(\d+)/,
      /^(\d+)$/, // Just the ID
    ];
    for (const pattern of patterns) {
      const match = src.match(pattern);
      if (match) return match[1];
    }
  }
  return src;
}

/**
 * Generate embed URL for provider.
 */
function getEmbedUrl(videoId: string, provider: VideoProvider): string {
  switch (provider) {
    case 'youtube':
      return `https://www.youtube.com/embed/${videoId}`;
    case 'vimeo':
      return `https://player.vimeo.com/video/${videoId}`;
    default:
      return videoId;
  }
}

/**
 * Generate thumbnail URL for provider.
 */
function getThumbnailUrl(videoId: string, provider: VideoProvider): string | null {
  switch (provider) {
    case 'youtube':
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    case 'vimeo':
      // Vimeo requires API call for thumbnails, return null
      return null;
    default:
      return null;
  }
}

/**
 * HelpVideo is a headless component for rendering video embeds.
 */
export const HelpVideo = forwardRef<HTMLDivElement, HelpVideoProps>(function HelpVideo(
  {
    src,
    provider = 'custom',
    title,
    lazyLoad = true,
    aspectRatio = '16/9',
    width,
    height,
    controls = true,
    allowFullscreen = true,
    thumbnail,
    onPlay,
    className = '',
    ...props
  },
  ref
) {
  const [isPlaying, setIsPlaying] = useState(!lazyLoad);

  const videoId = useMemo(() => extractVideoId(src, provider), [src, provider]);
  const embedUrl = useMemo(() => getEmbedUrl(videoId, provider), [videoId, provider]);
  const thumbnailUrl = thumbnail ?? (lazyLoad ? getThumbnailUrl(videoId, provider) : null);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    onPlay?.();
  }, [onPlay]);

  // Calculate aspect ratio for CSS
  const aspectRatioStyle = useMemo(() => {
    const [w, h] = aspectRatio.split('/').map(Number);
    if (w && h) {
      return { paddingBottom: `${(h / w) * 100}%` };
    }
    return { paddingBottom: '56.25%' }; // Default 16:9
  }, [aspectRatio]);

  return (
    <div
      ref={ref}
      className={`help-video ${className}`.trim()}
      data-component="video"
      data-provider={provider}
      data-playing={isPlaying}
      data-lazy={lazyLoad}
      style={{ width, height }}
      {...props}
    >
      <div className="help-video-wrapper" style={aspectRatioStyle}>
        {!isPlaying && lazyLoad ? (
          <button
            type="button"
            className="help-video-placeholder"
            onClick={handlePlay}
            aria-label={`Play video: ${title}`}
          >
            {thumbnailUrl && (
              <img
                src={thumbnailUrl}
                alt={`Thumbnail for ${title}`}
                className="help-video-thumbnail"
                loading="lazy"
              />
            )}
            <span className="help-video-play-button" aria-hidden="true">
              ▶
            </span>
          </button>
        ) : provider === 'custom' ? (
          <video
            className="help-video-player"
            src={src}
            title={title}
            controls={controls}
            playsInline
          >
            <track kind="captions" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <iframe
            className="help-video-iframe"
            src={embedUrl}
            title={title}
            allow={`accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture${allowFullscreen ? '; fullscreen' : ''}`}
            allowFullScreen={allowFullscreen}
            loading={lazyLoad ? 'lazy' : 'eager'}
          />
        )}
      </div>
    </div>
  );
});

HelpVideo.displayName = 'HelpVideo';
