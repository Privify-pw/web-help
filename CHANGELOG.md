# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.2] - 2025-12-05

### Enabled CLI

- Introduced a command-line interface (CLI) for help content management
- CLI supports content import, export, validation, and format conversion (Markdown, MDX, JSON, CSV)
- Added CLI commands for content indexing and search adapter testing
- CLI built with TypeScript and integrated into the package as `web-help-cli`
- Updated documentation with CLI usage examples and command reference
- Improved developer workflow for bulk content operations and automation
- Ensured CLI adheres to headless and pluggable architecture principles

## [0.2.1] - 2025-12-05

### Enabled TypeScript Support

- Migrated all source files to TypeScript (.ts and .tsx)
- Enabled strict type checking across the codebase
- Updated ESLint configuration for TypeScript support
- Exported types alongside implementations for all components and hooks
- Refactored legacy type exports to use `type` instead of `interface` where possible
- Ensured all React components are functional and typed
- Improved type safety for context, hooks, and storage adapters
- Updated documentation to reflect TypeScript-first architecture

## [0.2.0] - 2025-12-05

### Phase 1B: Navigation & Search - Enhancements

- **FuseSearchAdapter**: Integrated fuse.js for enhanced client-side search with better fuzzy matching, scoring, and highlighting
- **SimpleSearchAdapter**: Lightweight search adapter with no dependencies for basic search functionality
- Search adapter architecture supporting custom search implementations (Algolia, ElasticSearch, etc.)
- Advanced search filtering by category and tags
- Search result sorting options (relevance, date, title)
- Match highlighting support in search results
- Enhanced `useHelpSearch` hook to support search adapters
- Improved search result snippet extraction
- Better keyboard navigation in HelpSearch component
- Recent searches tracking in UserPreferencesContext

**Technical Details:**

- Installed `fuse.js` (v7.0.0) for client-side search
- Added search adapter interface in `types/search.ts`
- Created `loaders/searchAdapters.ts` with FuseSearchAdapter and SimpleSearchAdapter implementations
- Export search adapters from `core/loaders/index.ts`

### Completed phase 3 and 4

#### Phase 3A: Advanced Content Formats

- MDX parser with React component extraction and placeholder rendering
- JSON content loader with structured content blocks support
- CSV content loader with table and list rendering options
- ContentFormatDetector for automatic format detection based on content analysis
- Multi-format support through pluggable parser architecture

#### Phase 3B: Content Editor Utility

- HelpEditor component with live markdown preview
- HelpMetadataEditor component with full field support
- HelpAssetUpload component with drag-and-drop support
- Editor internationalization with built-in translations for 7 languages (en, es, de, fr, pt, zh, ja)
- getEditorLabels and addEditorTranslation utilities for i18n

#### Phase 4: Advanced Features

- HelpDiagram component for Mermaid and PlantUML diagrams
- HelpSandbox component for CodeSandbox, StackBlitz, CodePen, JSFiddle, and Replit embeds
- useHelpAnalytics hook for comprehensive analytics tracking
- Accessibility utilities: useFocusTrap, useLiveAnnouncer, useSkipLink hooks
- Accessibility components: SkipLink, VisuallyHidden, FocusRing
- WCAG 2.1 AA compliance helpers: getContrastRatio, meetsContrastRequirements
- PWA utilities: usePWA, useOfflineContent hooks
- Service worker helpers: registerHelpServiceWorker, generateServiceWorkerScript

## [0.1.2] - 2025-12-04

### Modified HTTML rendering

1. Installed html-react-parser package (13 new dependencies added)
2. Updated HelpContent component:
   - Removed dangerouslySetInnerHTML
   - Implemented safe HTML parsing with html-react-parser
   - Added custom renderer support for code blocks, images, and links
   - Properly typed all DOM node handling
3. Updated type definitions in components.ts:
   - Changed renderer props to use object syntax: { code, language }, { src, alt }, { href, children }
   - This provides better type safety and clearer API

#### Benefits

- ✅ No XSS vulnerabilities - HTML is parsed to React elements, not inserted as raw HTML
- ✅ Custom component rendering - Full control over code blocks, images, and links
- ✅ Type-safe - All TypeScript errors resolved
- ✅ Smaller bundle - More efficient than alternatives like react-markdown
- ✅ Headless philosophy - Maintains your component architecture

## [0.1.1] - 2025-12-04

### Ensured company name is correct

- Changed all occurances of Privify to PIIKeep. Privify was the org name when we started the project. The correct branded name is PIIKeep

## [0.1.0] - 2025-12-03

### Features Added

#### Phase 1A: Core Foundation

- TypeScript type system with comprehensive interfaces for content, config, storage, parser, search, and components
- Markdown parser with frontmatter support using `marked` and `gray-matter`
- Static content loader with caching and content registry
- HelpContext and UserPreferencesContext for state management
- Core headless components: HelpPage, HelpContent, HelpNavigation
- Storage adapters: localStorage, sessionStorage, cookie, memory

#### Phase 1B: Navigation & Search

- HelpTOC component for auto-generated table of contents
- HelpBreadcrumbs component for hierarchical navigation
- HelpPagination component for prev/next navigation
- HelpSearch component with autocomplete and recent searches
- useHelpSearch hook with client-side search
- useHelpNavigation hook for navigation state

#### Phase 1C: Media & Rich Content

- HelpImage component with lazy loading and lightbox support
- HelpVideo component for YouTube, Vimeo, and custom video embeds
- HelpDownload component for downloadable resources
- HelpCodeBlock component with copy functionality
- HelpInlineCode component for inline code
- HelpCallout component for info/warning/tip/danger alerts
- HelpAccordion component for expandable sections
- HelpTabs component for tabbed content
- HelpSteps component for step-by-step guides

#### Phase 2A: User Engagement & Feedback

- HelpRating component with customizable star rating
- HelpFeedback component for "Was this helpful?" feedback
- HelpComments component for displaying and submitting comments
- HelpBookmark component for bookmarking articles
- useBookmarks hook for bookmark management
- Reading history tracking in UserPreferencesContext

#### Phase 2B: Additional Display Modes

- HelpModal component with focus management and portal rendering
- HelpSidebar component for left/right sidebar panels
- useHelpShortcuts hook for keyboard shortcuts
- presetShortcuts for common shortcuts (Cmd+K, Escape, arrows)

### Infrastructure

- FEATURES.md for comprehensive feature tracking
- CHANGELOG.md for version history

## [0.0.1] - 2025-12-03

### Added

- Project initialization
- TypeScript configuration
- Vite build configuration
- ESLint configuration
- Basic README documentation
