/**
 * @piikeep/web-help - React Web Help Component Library
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
  createJsonParser,
  createCsvParser,
  createMdxParser,
  StaticContentLoader,
  createStaticLoader,
  ContentFormatDetector,
  createFormatDetector,
  FuseSearchAdapter,
  SimpleSearchAdapter,
} from './core/loaders';

export type {
  JsonHelpContent,
  JsonContentBlock,
  CsvParserOptions,
  MdxParserOptions,
  ExtractedComponent,
  FormatDetectionResult,
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
export { HelpImage, HelpVideo, HelpDownload } from './components/media';

export type {
  HelpImageProps,
  HelpVideoProps,
  VideoProvider,
  HelpDownloadProps,
  DownloadType,
} from './components/media';

// Code
export { HelpCodeBlock, HelpInlineCode } from './components/code';

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

// Editor
export {
  HelpEditor,
  HelpMetadataEditor,
  HelpAssetUpload,
  getAssetTypeFromMime,
  getEditorLabels,
  addEditorTranslation,
  getSupportedLocales,
  isLocaleSupported,
  allFields,
  defaultFields,
} from './components/editor';

export type {
  HelpEditorProps,
  HelpEditorLabels,
  HelpEditorState,
  HelpMetadataEditorProps,
  HelpMetadataLabels,
  MetadataField,
  FieldRenderer,
  FieldRendererProps,
  MetadataValidation,
  HelpAssetUploadProps,
  HelpAssetUploadLabels,
  Asset,
  UploadResult,
  EditorI18nLabels,
  SupportedLocale,
} from './components/editor';

// Advanced Components
export {
  // Diagrams
  HelpDiagram,
  detectDiagramType,
  // Sandbox
  HelpSandbox,
  extractSandboxId,
  // Analytics
  useHelpAnalytics,
  // Accessibility
  useAccessibilityPreferences,
  useFocusTrap,
  useLiveAnnouncer,
  useSkipLink,
  SkipLink,
  VisuallyHidden,
  FocusRing,
  getFocusableElements,
  isFocusable,
  generateA11yId,
  ariaAttributes,
  getContrastRatio,
  meetsContrastRequirements,
  // PWA
  usePWA,
  useOfflineContent,
  registerHelpServiceWorker,
  unregisterHelpServiceWorker,
  generateServiceWorkerScript,
} from './components/advanced';

export type {
  // Diagrams
  HelpDiagramProps,
  HelpDiagramLabels,
  // Sandbox
  HelpSandboxProps,
  HelpSandboxLabels,
  SandboxProvider,
  // Analytics
  AnalyticsEventType,
  AnalyticsEvent,
  AnalyticsConfig,
  AnalyticsState,
  UseHelpAnalyticsReturn,
  SessionStats,
  // Accessibility
  AccessibilityPreferences,
  SkipLinkProps,
  VisuallyHiddenProps,
  FocusRingProps,
  // PWA
  PWAConfig,
  PWAStatus,
  CacheUsage,
  CacheItem,
} from './components/advanced';

// Legacy export for backwards compatibility
export type { HelpMetadata } from './types/help-metadata';
