/**
 * Core Types Index for the Web Help Component Library
 * @module @privify-pw/web-help/types
 */

// Content types
export type {
  HelpArticle,
  HelpArticleMetadata,
  HelpCategory,
  HelpTag,
  TOCEntry,
  HelpSearchResult,
  SearchHighlight,
  ContentIndex,
  BreadcrumbItem,
  NavigationState,
} from './content';

// Configuration types
export type {
  HelpConfig,
  ContentConfig,
  ContentFormat,
  ContentLoaderFunction,
  CacheConfig,
  StorageConfig,
  SearchConfig,
  ClientSearchOptions,
  MediaConfig,
  ImageConfig,
  CDNConfig,
  ImageOptimizationConfig,
  VideoConfig,
  VideoProvider,
  CodeConfig,
  NavigationConfig,
  HelpCallbacks,
} from './config';

// Storage types
export type {
  StorageAdapter,
  UserPreferences,
  ReadingHistoryEntry,
  UserSettings,
  CookieOptions,
} from './storage';

// Parser types
export type {
  ContentParser,
  ParserOptions,
  ParseResult,
  AssetReference,
  FrontmatterResult,
  MarkdownPlugin,
  MarkdownRenderer,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from './parser';

// Search types
export type {
  SearchAdapter,
  SearchOptions,
  SearchState,
  SearchSuggestion,
} from './search';

// Component types
export type {
  BaseComponentProps,
  HelpProviderProps,
  HelpPageProps,
  HelpContentProps,
  HelpNavigationProps,
  NavigationItem,
  HelpTOCProps,
  HelpBreadcrumbsProps,
  HelpPaginationProps,
  HelpSearchProps,
  HelpModalProps,
  HelpSidebarProps,
} from './components';
