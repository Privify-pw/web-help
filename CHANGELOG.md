# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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
