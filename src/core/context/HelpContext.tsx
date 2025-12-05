/**
 * Help Context for the Web Help Component Library
 * @module @piikeep-pw/web-help/context/HelpContext
 *
 * This module implements a split context pattern to prevent infinite re-render loops.
 * The state context (HelpStateContext) holds reactive state that changes frequently.
 * The actions context (HelpActionsContext) holds stable action functions that don't change.
 *
 * Components that only need actions won't re-render when state changes.
 */

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  type ReactNode,
} from 'react';
import type {
  HelpConfig,
  HelpCallbacks,
  HelpArticle,
  HelpCategory,
  NavigationState,
  ContentIndex,
} from '../types';
import type { StorageAdapter } from '../types/storage';
import type { SearchAdapter } from '../types/search';
import { createLocalStorageAdapter } from '../storage/localStorage';
import { StaticContentLoader, createMarkdownParser } from '../loaders';

/**
 * Help state interface.
 */
export interface HelpState {
  /** Current article being viewed */
  currentArticle: HelpArticle | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Navigation state */
  navigation: NavigationState;
  /** Whether the help system is initialized */
  initialized: boolean;
  /** Available categories */
  categories: HelpCategory[];
  /** Search query */
  searchQuery: string;
  /** Is search active */
  isSearching: boolean;
}

/**
 * Help actions interface - stable action functions.
 */
export interface HelpActions {
  /** Navigate to an article */
  navigateToArticle: (articleId: string) => Promise<void>;
  /** Load an article */
  loadArticle: (articleId: string) => Promise<HelpArticle | null>;
  /** Register content */
  registerContent: (manifest: Record<string, string>) => Promise<void>;
  /** Get content index for search */
  getContentIndex: () => ContentIndex[];
  /** Set search query */
  setSearchQuery: (query: string) => void;
  /** Configuration */
  config: HelpConfig;
  /** Callbacks (accessed via ref for stability) */
  callbacks: HelpCallbacks;
  /** Storage adapter */
  storage: StorageAdapter;
  /** Content loader */
  contentLoader: StaticContentLoader;
  /** Search adapter (if configured) */
  searchAdapter?: SearchAdapter;
  /** Get current state (for use in callbacks without adding state dependency) */
  getState: () => HelpState;
}

/**
 * Help reducer actions.
 */
type HelpAction =
  | { type: 'SET_ARTICLE'; payload: HelpArticle | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | null }
  | { type: 'SET_NAVIGATION'; payload: NavigationState }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_CATEGORIES'; payload: HelpCategory[] }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SEARCHING'; payload: boolean };

/**
 * Initial help state.
 */
const initialState: HelpState = {
  currentArticle: null,
  isLoading: false,
  error: null,
  navigation: {},
  initialized: false,
  categories: [],
  searchQuery: '',
  isSearching: false,
};

/**
 * Help reducer.
 */
function helpReducer(state: HelpState, action: HelpAction): HelpState {
  switch (action.type) {
    case 'SET_ARTICLE':
      return { ...state, currentArticle: action.payload, error: null };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_NAVIGATION':
      return { ...state, navigation: action.payload };
    case 'SET_INITIALIZED':
      return { ...state, initialized: action.payload };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_SEARCHING':
      return { ...state, isSearching: action.payload };
    default:
      return state;
  }
}

/**
 * Help context value interface (combined for backward compatibility).
 */
export interface HelpContextValue {
  /** Current state */
  state: HelpState;
  /** Configuration */
  config: HelpConfig;
  /** Callbacks */
  callbacks: HelpCallbacks;
  /** Storage adapter */
  storage: StorageAdapter;
  /** Content loader */
  contentLoader: StaticContentLoader;
  /** Search adapter (if configured) */
  searchAdapter?: SearchAdapter;
  /** Navigate to an article */
  navigateToArticle: (articleId: string) => Promise<void>;
  /** Load an article */
  loadArticle: (articleId: string) => Promise<HelpArticle | null>;
  /** Register content */
  registerContent: (manifest: Record<string, string>) => Promise<void>;
  /** Get content index for search */
  getContentIndex: () => ContentIndex[];
  /** Set search query */
  setSearchQuery: (query: string) => void;
  /** Get current state (for use in callbacks without adding state dependency) */
  getState: () => HelpState;
}

/**
 * State context - changes frequently, causes re-renders.
 */
const HelpStateContext = createContext<HelpState | null>(null);

/**
 * Actions context - stable, doesn't cause re-renders.
 */
const HelpActionsContext = createContext<HelpActions | null>(null);

/**
 * Combined context for backward compatibility.
 * @deprecated Use useHelpState() and useHelpActions() instead for better performance.
 */
const HelpContext = createContext<HelpContextValue | null>(null);

/**
 * Help provider props.
 */
export interface HelpProviderProps {
  /** Configuration */
  config?: HelpConfig;
  /** Callbacks */
  callbacks?: HelpCallbacks;
  /** Custom storage adapter */
  storageAdapter?: StorageAdapter;
  /** Custom search adapter */
  searchAdapter?: SearchAdapter;
  /** Content manifest (article ID -> content) */
  contentManifest?: Record<string, string>;
  /** Auto-navigate to first article on initialization (default: true) */
  autoNavigate?: boolean;
  /** Children */
  children: ReactNode;
}

/**
 * Help provider component.
 *
 * Uses a split context pattern to prevent infinite re-render loops:
 * - HelpStateContext: Contains reactive state (will cause re-renders when state changes)
 * - HelpActionsContext: Contains stable action functions (won't cause re-renders)
 */
export function HelpProvider({
  config = {},
  callbacks = {},
  storageAdapter,
  searchAdapter,
  contentManifest,
  autoNavigate = true,
  children,
}: HelpProviderProps) {
  const [state, dispatch] = useReducer(helpReducer, initialState);

  // Keep a ref to the latest state to allow callbacks to access current state
  // without adding state to their dependencies
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Use ref to store latest config without causing re-renders
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Use ref to store latest callbacks without causing re-renders
  const callbacksRef = useRef(callbacks);
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  // Initialize storage adapter ONCE
  const storage = useRef<StorageAdapter>();
  if (!storage.current) {
    storage.current =
      storageAdapter ??
      createLocalStorageAdapter(config.storage?.prefix ?? 'help_');
  }

  // Initialize content loader ONCE
  const contentLoaderRef = useRef<StaticContentLoader>();
  if (!contentLoaderRef.current) {
    const loader = new StaticContentLoader(config.content);
    loader.registerParser(createMarkdownParser());
    contentLoaderRef.current = loader;
  }
  const contentLoader = contentLoaderRef.current;

  // Get current state - stable function that reads from ref
  const getState = useCallback(() => stateRef.current, []);

  // Load article function - stable, uses refs for callbacks
  const loadArticle = useCallback(
    async (articleId: string): Promise<HelpArticle | null> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const article = await contentLoader.loadArticle(articleId);
        if (article) {
          dispatch({ type: 'SET_ARTICLE', payload: article });
          callbacksRef.current.onArticleView?.(articleId);
        }
        return article;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        dispatch({ type: 'SET_ERROR', payload: err });
        callbacksRef.current.onError?.(err, 'loadArticle');
        return null;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [contentLoader],
  );

  // Navigate to article - stable, uses stateRef for current article
  const navigateToArticle = useCallback(
    async (articleId: string): Promise<void> => {
      // Use stateRef to get current article without adding to dependencies
      const fromId = stateRef.current.currentArticle?.id ?? null;
      const article = await loadArticle(articleId);

      if (article) {
        // Update navigation state
        const allArticles = contentLoader.getAllArticles();
        const currentIndex = allArticles.findIndex((a) => a.id === articleId);

        const navigation: NavigationState = {
          currentArticle: articleId,
          prev:
            currentIndex > 0
              ? {
                  id: allArticles[currentIndex - 1].id,
                  title: allArticles[currentIndex - 1].title,
                }
              : undefined,
          next:
            currentIndex < allArticles.length - 1
              ? {
                  id: allArticles[currentIndex + 1].id,
                  title: allArticles[currentIndex + 1].title,
                }
              : undefined,
        };

        dispatch({ type: 'SET_NAVIGATION', payload: navigation });
        callbacksRef.current.onNavigate?.(fromId, articleId);
      }
    },
    [loadArticle, contentLoader],
  );

  // Register content - stable
  const registerContent = useCallback(
    async (manifest: Record<string, string>): Promise<void> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        await contentLoader.loadFromManifest(manifest);
        dispatch({
          type: 'SET_CATEGORIES',
          payload: contentLoader.getCategories(),
        });
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        dispatch({ type: 'SET_ERROR', payload: err });
        callbacksRef.current.onError?.(err, 'registerContent');
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [contentLoader],
  );

  // Get content index - stable
  const getContentIndex = useCallback(() => {
    return contentLoader.getContentIndex();
  }, [contentLoader]);

  // Set search query - stable
  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, []);

  // Load content manifest ONCE on mount
  useEffect(() => {
    if (!contentManifest) {
      dispatch({ type: 'SET_INITIALIZED', payload: true });
      return;
    }

    const loadContent = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        await contentLoader.loadFromManifest(contentManifest);
        const categories = contentLoader.getCategories();
        dispatch({
          type: 'SET_CATEGORIES',
          payload: categories,
        });
        dispatch({ type: 'SET_INITIALIZED', payload: true });

        // Load first article if autoNavigate is enabled
        if (autoNavigate) {
          const allArticles = contentLoader.getAllArticles();
          if (allArticles.length > 0) {
            const firstArticle = await contentLoader.loadArticle(
              allArticles[0].id,
            );
            if (firstArticle) {
              dispatch({ type: 'SET_ARTICLE', payload: firstArticle });

              const navigation: NavigationState = {
                currentArticle: allArticles[0].id,
                prev: undefined,
                next:
                  allArticles.length > 1
                    ? { id: allArticles[1].id, title: allArticles[1].title }
                    : undefined,
              };

              dispatch({ type: 'SET_NAVIGATION', payload: navigation });
              callbacksRef.current.onArticleView?.(allArticles[0].id);
            }
          }
        }
      } catch (error) {
        console.error('Error loading manifest:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error : new Error(String(error)),
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    loadContent();
    // Dependencies: contentLoader and contentManifest determine what content to load
    // autoNavigate controls initial navigation behavior
    // This effect intentionally runs when these values change
  }, [contentLoader, contentManifest, autoNavigate]);

  // Actions context value - memoized and STABLE (no state dependency)
  const actions: HelpActions = useMemo(
    () => ({
      navigateToArticle,
      loadArticle,
      registerContent,
      getContentIndex,
      setSearchQuery,
      getState,
      config: configRef.current,
      callbacks: callbacksRef.current,
      storage: storage.current!,
      contentLoader,
      searchAdapter,
    }),
    [
      navigateToArticle,
      loadArticle,
      registerContent,
      getContentIndex,
      setSearchQuery,
      getState,
      contentLoader,
      searchAdapter,
    ],
  );

  // Combined context value for backward compatibility
  const combinedValue: HelpContextValue = useMemo(
    () => ({
      state,
      ...actions,
    }),
    [state, actions],
  );

  return (
    <HelpStateContext.Provider value={state}>
      <HelpActionsContext.Provider value={actions}>
        <HelpContext.Provider value={combinedValue}>
          {children}
        </HelpContext.Provider>
      </HelpActionsContext.Provider>
    </HelpStateContext.Provider>
  );
}

/**
 * Hook to access the help context (combined state + actions).
 * @throws Error if used outside of HelpProvider
 * @deprecated For better performance, use useHelpState() for state and useHelpActions() for actions.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useHelpContext(): HelpContextValue {
  const context = useContext(HelpContext);
  if (!context) {
    throw new Error('useHelpContext must be used within a HelpProvider');
  }
  return context;
}

/**
 * Hook to access help state (reactive - will cause re-renders on state changes).
 * Use this when you need to read state values.
 * @throws Error if used outside of HelpProvider
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useHelpState(): HelpState {
  const state = useContext(HelpStateContext);
  if (!state) {
    throw new Error('useHelpState must be used within a HelpProvider');
  }
  return state;
}

/**
 * Hook to access help actions (stable - won't cause re-renders).
 * Use this when you only need to call actions without reading state.
 * @throws Error if used outside of HelpProvider
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useHelpActions(): HelpActions {
  const actions = useContext(HelpActionsContext);
  if (!actions) {
    throw new Error('useHelpActions must be used within a HelpProvider');
  }
  return actions;
}
