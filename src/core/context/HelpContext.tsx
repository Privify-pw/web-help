/**
 * Help Context for the Web Help Component Library
 * @module @privify-pw/web-help/context/HelpContext
 */

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
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
 * Help actions.
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
 * Help context value interface.
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
}

/**
 * Help context.
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
  /** Children */
  children: ReactNode;
}

/**
 * Help provider component.
 */
export function HelpProvider({
  config = {},
  callbacks = {},
  storageAdapter,
  searchAdapter,
  contentManifest,
  children,
}: HelpProviderProps) {
  const [state, dispatch] = useReducer(helpReducer, initialState);

  // Initialize storage adapter
  const storage = useMemo(() => {
    if (storageAdapter) return storageAdapter;
    const prefix = config.storage?.prefix ?? 'help_';
    return createLocalStorageAdapter(prefix);
  }, [storageAdapter, config.storage?.prefix]);

  // Initialize content loader
  const contentLoader = useMemo(() => {
    const loader = new StaticContentLoader(config.content);
    loader.registerParser(createMarkdownParser());
    return loader;
  }, [config.content]);

  // Load content manifest on mount
  useEffect(() => {
    if (contentManifest) {
      const loadContent = async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
          await contentLoader.loadFromManifest(contentManifest);
          dispatch({ type: 'SET_CATEGORIES', payload: contentLoader.getCategories() });
          dispatch({ type: 'SET_INITIALIZED', payload: true });
        } catch (error) {
          dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error : new Error(String(error)) });
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      };
      loadContent();
    } else {
      dispatch({ type: 'SET_INITIALIZED', payload: true });
    }
  }, [contentManifest, contentLoader]);

  // Load article function
  const loadArticle = useCallback(
    async (articleId: string): Promise<HelpArticle | null> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const article = await contentLoader.loadArticle(articleId);
        if (article) {
          dispatch({ type: 'SET_ARTICLE', payload: article });
          callbacks.onArticleView?.(articleId);
        }
        return article;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        dispatch({ type: 'SET_ERROR', payload: err });
        callbacks.onError?.(err, 'loadArticle');
        return null;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [contentLoader, callbacks]
  );

  // Navigate to article
  const navigateToArticle = useCallback(
    async (articleId: string): Promise<void> => {
      const fromId = state.currentArticle?.id ?? null;
      const article = await loadArticle(articleId);
      
      if (article) {
        // Update navigation state
        const allArticles = contentLoader.getAllArticles();
        const currentIndex = allArticles.findIndex((a) => a.id === articleId);
        
        const navigation: NavigationState = {
          currentArticle: articleId,
          prev: currentIndex > 0
            ? {
                id: allArticles[currentIndex - 1].id,
                title: allArticles[currentIndex - 1].title,
              }
            : undefined,
          next: currentIndex < allArticles.length - 1
            ? {
                id: allArticles[currentIndex + 1].id,
                title: allArticles[currentIndex + 1].title,
              }
            : undefined,
        };
        
        dispatch({ type: 'SET_NAVIGATION', payload: navigation });
        callbacks.onNavigate?.(fromId, articleId);
      }
    },
    [loadArticle, contentLoader, callbacks, state.currentArticle?.id]
  );

  // Register content
  const registerContent = useCallback(
    async (manifest: Record<string, string>): Promise<void> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        await contentLoader.loadFromManifest(manifest);
        dispatch({ type: 'SET_CATEGORIES', payload: contentLoader.getCategories() });
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        dispatch({ type: 'SET_ERROR', payload: err });
        callbacks.onError?.(err, 'registerContent');
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [contentLoader, callbacks]
  );

  // Get content index
  const getContentIndex = useCallback(() => {
    return contentLoader.getContentIndex();
  }, [contentLoader]);

  // Set search query
  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, []);

  const value: HelpContextValue = {
    state,
    config,
    callbacks,
    storage,
    contentLoader,
    searchAdapter,
    navigateToArticle,
    loadArticle,
    registerContent,
    getContentIndex,
    setSearchQuery,
  };

  return <HelpContext.Provider value={value}>{children}</HelpContext.Provider>;
}

/**
 * Hook to access the help context.
 * @throws Error if used outside of HelpProvider
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
 * Hook to access help state.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useHelpState(): HelpState {
  const { state } = useHelpContext();
  return state;
}
