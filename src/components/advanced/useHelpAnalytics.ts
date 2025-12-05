/**
 * Analytics Hooks for the Web Help Component Library
 * @module @piikeep-pw/web-help/hooks/useHelpAnalytics
 *
 * Provides hooks for tracking user interactions with help content,
 * including views, searches, ratings, and engagement metrics.
 */

import { useCallback, useEffect, useRef, useMemo } from 'react';

/**
 * Analytics event types.
 */
export type AnalyticsEventType =
  | 'page_view'
  | 'article_view'
  | 'search'
  | 'search_result_click'
  | 'rating'
  | 'feedback'
  | 'bookmark'
  | 'link_click'
  | 'toc_click'
  | 'navigation'
  | 'modal_open'
  | 'modal_close'
  | 'sidebar_toggle'
  | 'copy_code'
  | 'download'
  | 'video_play'
  | 'image_view'
  | 'time_on_page'
  | 'scroll_depth';

/**
 * Analytics event data.
 */
export interface AnalyticsEvent {
  /** Event type */
  type: AnalyticsEventType;
  /** Timestamp */
  timestamp: number;
  /** Article ID if applicable */
  articleId?: string;
  /** Search query if applicable */
  query?: string;
  /** Additional event data */
  data?: Record<string, unknown>;
  /** Session ID */
  sessionId: string;
  /** User ID if available */
  userId?: string;
}

/**
 * Analytics configuration.
 */
export interface AnalyticsConfig {
  /** Whether analytics is enabled */
  enabled?: boolean;
  /** Custom event handler */
  onEvent?: (event: AnalyticsEvent) => void | Promise<void>;
  /** Batch events before sending */
  batchEvents?: boolean;
  /** Batch interval in milliseconds */
  batchInterval?: number;
  /** Maximum events in a batch */
  maxBatchSize?: number;
  /** Track scroll depth */
  trackScrollDepth?: boolean;
  /** Track time on page */
  trackTimeOnPage?: boolean;
  /** Custom session ID */
  sessionId?: string;
  /** Custom user ID */
  userId?: string;
  /** Debug mode */
  debug?: boolean;
}

/**
 * Analytics state.
 */
export interface AnalyticsState {
  /** Session ID */
  sessionId: string;
  /** Events in current batch */
  eventQueue: AnalyticsEvent[];
  /** Total events tracked */
  eventCount: number;
  /** Session start time */
  sessionStart: number;
  /** Current page view start */
  pageViewStart?: number;
  /** Scroll depth reached */
  maxScrollDepth: number;
}

/**
 * Analytics hook return value.
 */
export interface UseHelpAnalyticsReturn {
  /** Track a custom event */
  trackEvent: (
    type: AnalyticsEventType,
    data?: Record<string, unknown>,
  ) => void;
  /** Track page/article view */
  trackPageView: (articleId?: string) => void;
  /** Track search */
  trackSearch: (query: string, resultsCount: number) => void;
  /** Track search result click */
  trackSearchResultClick: (
    query: string,
    articleId: string,
    position: number,
  ) => void;
  /** Track rating */
  trackRating: (articleId: string, rating: number) => void;
  /** Track feedback */
  trackFeedback: (
    articleId: string,
    helpful: boolean,
    comment?: string,
  ) => void;
  /** Track bookmark */
  trackBookmark: (articleId: string, bookmarked: boolean) => void;
  /** Track link click */
  trackLinkClick: (articleId: string, url: string, isExternal: boolean) => void;
  /** Track navigation */
  trackNavigation: (from: string | null, to: string) => void;
  /** Get session analytics */
  getSessionStats: () => SessionStats;
  /** Flush pending events */
  flush: () => Promise<void>;
}

/**
 * Session statistics.
 */
export interface SessionStats {
  sessionId: string;
  sessionDuration: number;
  eventCount: number;
  pageViews: number;
  searches: number;
  maxScrollDepth: number;
}

/**
 * Generate a unique session ID.
 */
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Default analytics configuration.
 */
const defaultConfig: Required<AnalyticsConfig> = {
  enabled: true,
  onEvent: () => {},
  batchEvents: false,
  batchInterval: 5000,
  maxBatchSize: 50,
  trackScrollDepth: true,
  trackTimeOnPage: true,
  sessionId: '',
  userId: '',
  debug: false,
};

/**
 * Hook for tracking help system analytics.
 */
export function useHelpAnalytics(
  config?: AnalyticsConfig,
): UseHelpAnalyticsReturn {
  const mergedConfig = useMemo(
    () => ({ ...defaultConfig, ...config }),
    [config],
  );

  // State refs (to avoid re-renders)
  const stateRef = useRef<AnalyticsState | null>(null);
  if (stateRef.current === null) {
    stateRef.current = {
      sessionId: mergedConfig.sessionId || generateSessionId(),
      eventQueue: [],
      eventCount: 0,
      sessionStart: Date.now(),
      maxScrollDepth: 0,
    };
  }

  const statsRef = useRef({
    pageViews: 0,
    searches: 0,
  });

  const batchTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  // Debug logging
  const logDebug = useCallback(
    (message: string, data?: unknown) => {
      if (mergedConfig.debug) {
        console.log(`[HelpAnalytics] ${message}`, data ?? '');
      }
    },
    [mergedConfig.debug],
  );

  // Create event
  const createEvent = useCallback(
    (
      type: AnalyticsEventType,
      data?: Record<string, unknown>,
    ): AnalyticsEvent => {
      return {
        type,
        timestamp: Date.now(),
        data,
        sessionId: stateRef.current!.sessionId,
        userId: mergedConfig.userId || undefined,
      };
    },
    [mergedConfig.userId],
  );

  // Flush queued events
  const flushEvents = useCallback(async () => {
    const events = [...stateRef.current!.eventQueue];
    stateRef.current!.eventQueue = [];

    if (events.length === 0) return;

    logDebug(`Flushing ${events.length} events`);

    for (const event of events) {
      await mergedConfig.onEvent(event);
    }
  }, [mergedConfig, logDebug]);

  // Process event (send or queue)
  const processEvent = useCallback(
    async (event: AnalyticsEvent) => {
      if (!mergedConfig.enabled) return;

      stateRef.current!.eventCount++;
      logDebug(`Event: ${event.type}`, event);

      if (mergedConfig.batchEvents) {
        stateRef.current!.eventQueue.push(event);

        if (stateRef.current!.eventQueue.length >= mergedConfig.maxBatchSize) {
          await flushEvents();
        }
      } else {
        await mergedConfig.onEvent(event);
      }
    },
    [mergedConfig, logDebug, flushEvents],
  );

  // Track generic event
  const trackEvent = useCallback(
    (type: AnalyticsEventType, data?: Record<string, unknown>) => {
      const event = createEvent(type, data);
      processEvent(event);
    },
    [createEvent, processEvent],
  );

  // Track page view
  const trackPageView = useCallback(
    (articleId?: string) => {
      // Track time on previous page
      if (mergedConfig.trackTimeOnPage && stateRef.current!.pageViewStart) {
        const timeOnPage = Date.now() - stateRef.current!.pageViewStart;
        trackEvent('time_on_page', {
          duration: timeOnPage,
          scrollDepth: stateRef.current!.maxScrollDepth,
        });
      }

      // Reset for new page
      stateRef.current!.pageViewStart = Date.now();
      stateRef.current!.maxScrollDepth = 0;
      statsRef.current.pageViews++;

      trackEvent(articleId ? 'article_view' : 'page_view', { articleId });
    },
    [mergedConfig.trackTimeOnPage, trackEvent],
  );

  // Track search
  const trackSearch = useCallback(
    (query: string, resultsCount: number) => {
      statsRef.current.searches++;
      trackEvent('search', { query, resultsCount });
    },
    [trackEvent],
  );

  // Track search result click
  const trackSearchResultClick = useCallback(
    (query: string, articleId: string, position: number) => {
      trackEvent('search_result_click', { query, articleId, position });
    },
    [trackEvent],
  );

  // Track rating
  const trackRating = useCallback(
    (articleId: string, rating: number) => {
      trackEvent('rating', { articleId, rating });
    },
    [trackEvent],
  );

  // Track feedback
  const trackFeedback = useCallback(
    (articleId: string, helpful: boolean, comment?: string) => {
      trackEvent('feedback', { articleId, helpful, hasComment: !!comment });
    },
    [trackEvent],
  );

  // Track bookmark
  const trackBookmark = useCallback(
    (articleId: string, bookmarked: boolean) => {
      trackEvent('bookmark', { articleId, bookmarked });
    },
    [trackEvent],
  );

  // Track link click
  const trackLinkClick = useCallback(
    (articleId: string, url: string, isExternal: boolean) => {
      trackEvent('link_click', { articleId, url, isExternal });
    },
    [trackEvent],
  );

  // Track navigation
  const trackNavigation = useCallback(
    (from: string | null, to: string) => {
      trackEvent('navigation', { from, to });
    },
    [trackEvent],
  );

  // Get session stats
  const getSessionStats = useCallback((): SessionStats => {
    return {
      sessionId: stateRef.current!.sessionId,
      sessionDuration: Date.now() - stateRef.current!.sessionStart,
      eventCount: stateRef.current!.eventCount,
      pageViews: statsRef.current.pageViews,
      searches: statsRef.current.searches,
      maxScrollDepth: stateRef.current!.maxScrollDepth,
    };
  }, []);

  // Scroll depth tracking
  useEffect(() => {
    if (!mergedConfig.trackScrollDepth || typeof window === 'undefined') return;

    const handleScroll = () => {
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollTop = window.scrollY;
      const depth =
        scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;

      if (depth > stateRef.current!.maxScrollDepth) {
        stateRef.current!.maxScrollDepth = depth;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mergedConfig.trackScrollDepth]);

  // Batch timer
  useEffect(() => {
    if (!mergedConfig.batchEvents || !mergedConfig.enabled) return;

    batchTimerRef.current = setInterval(() => {
      flushEvents();
    }, mergedConfig.batchInterval);

    return () => {
      if (batchTimerRef.current) {
        clearInterval(batchTimerRef.current);
      }
    };
  }, [
    mergedConfig.batchEvents,
    mergedConfig.batchInterval,
    mergedConfig.enabled,
    flushEvents,
  ]);

  // Flush on unload
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeUnload = () => {
      // Track final time on page
      if (mergedConfig.trackTimeOnPage && stateRef.current!.pageViewStart) {
        const timeOnPage = Date.now() - stateRef.current!.pageViewStart;
        trackEvent('time_on_page', {
          duration: timeOnPage,
          scrollDepth: stateRef.current!.maxScrollDepth,
          isFinal: true,
        });
      }

      // Events remain in queue for consumer to handle via config callbacks
      // sendBeacon can be used by the consumer's onEvent handler
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [mergedConfig.trackTimeOnPage, trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackSearch,
    trackSearchResultClick,
    trackRating,
    trackFeedback,
    trackBookmark,
    trackLinkClick,
    trackNavigation,
    getSessionStats,
    flush: flushEvents,
  };
}

export default useHelpAnalytics;
