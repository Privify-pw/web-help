/**
 * @privify-pw/web-help - React Web Help Component Library
 * 
 * A comprehensive, headless help system for React applications.
 * Built with TypeScript and designed for maximum flexibility.
 * 
 * @packageDocumentation
 */

// ============================================================================
// Core Types
// ============================================================================
export type {
  // Content types
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
  // Configuration types
  HelpConfig,
  ContentConfig,
  ContentFormat,
  StorageConfig,
  SearchConfig,
  MediaConfig,
  ImageConfig,
  VideoConfig,
  CodeConfig,
  NavigationConfig,
  HelpCallbacks,
  // Storage types
  StorageAdapter,
  UserPreferences,
  ReadingHistoryEntry,
  UserSettings,
  // Parser types
  ContentParser,
  ParseResult,
  ParserOptions,
  // Search types
  SearchAdapter,
  SearchOptions,
  SearchState,
  // Component types
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
} from './core/types';

// ============================================================================
// Context & Providers
// ============================================================================
export {
  HelpProvider,
  useHelpContext,
  useHelpState,
  UserPreferencesProvider,
  useUserPreferences,
} from './core/context';

// ============================================================================
// Hooks
// ============================================================================
export {
  useHelp,
  useHelpNavigation,
  useHelpSearch,
  useHelpShortcuts,
  useBookmarks,
  presetShortcuts,
} from './core/hooks';

// ============================================================================
// Storage Adapters
// ============================================================================
export {
  createLocalStorageAdapter,
  createSessionStorageAdapter,
  createCookieAdapter,
  createMemoryAdapter,
} from './core/storage';

// ============================================================================
// Content Loaders & Parsers
// ============================================================================
export {
  createMarkdownParser,
  StaticContentLoader,
  createStaticLoader,
} from './core/loaders';

// ============================================================================
// Core Components (Headless)
// ============================================================================
export {
  // Layout
  HelpPage,
  HelpContent,
  HelpNavigation,
  // Navigation
  HelpTOC,
  HelpBreadcrumbs,
  HelpPagination,
  HelpSearch,
  // Display modes
  HelpModal,
  HelpSidebar,
} from './core/components';

// ============================================================================
// Feature Components
// ============================================================================
// Media
export {
  HelpImage,
  HelpVideo,
  HelpDownload,
} from './components/media';

export type {
  HelpImageProps,
  HelpVideoProps,
  VideoProvider,
  HelpDownloadProps,
  DownloadType,
} from './components/media';

// Code
export {
  HelpCodeBlock,
  HelpInlineCode,
} from './components/code';

export type {
  HelpCodeBlockProps,
  HelpInlineCodeProps,
} from './components/code';

// Visual
export {
  HelpCallout,
  HelpAccordion,
  HelpTabs,
  HelpSteps,
} from './components/visual';

export type {
  HelpCalloutProps,
  CalloutType,
  HelpAccordionProps,
  AccordionItem,
  HelpTabsProps,
  TabItem,
  HelpStepsProps,
  StepItem,
} from './components/visual';

// Feedback
export {
  HelpRating,
  HelpFeedback,
  HelpComments,
  HelpBookmark,
} from './components/feedback';

export type {
  HelpRatingProps,
  HelpFeedbackProps,
  FeedbackValue,
  HelpCommentsProps,
  CommentItem,
  HelpBookmarkProps,
} from './components/feedback';

// Legacy export for backwards compatibility
export type { HelpMetadata } from './types/help-metadata';
