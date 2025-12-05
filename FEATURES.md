# Feature Tracking

This document tracks all planned features for the @piikeep/web-help component library.

## Phase 1A: Core Foundation (MVP - Dedicated Page Mode)

| Feature # | Title                                    | Status      | Description                                             |
| --------- | ---------------------------------------- | ----------- | ------------------------------------------------------- |
| #8        | TypeScript type system and interfaces    | ✅ Complete | Content interfaces, configuration types, parser plugins |
| #9        | Markdown parser with frontmatter support | ✅ Complete | YAML metadata, extended syntax, plugin architecture     |
| #10       | Basic content loader (static files)      | ✅ Complete | Static file loader, caching, error handling             |
| #11       | Core context and state management        | ✅ Complete | HelpContext, content state, user preferences            |
| #12       | Dedicated page component (headless)      | ✅ Complete | HelpPage, HelpContent, HelpNavigation components        |

## Phase 1B: Navigation & Search

| Feature # | Title                        | Status      | Description                              |
| --------- | ---------------------------- | ----------- | ---------------------------------------- |
| #13       | Table of contents component  | ✅ Complete | Auto-generated from headings             |
| #14       | Breadcrumb navigation        | ✅ Complete | Hierarchical navigation                  |
| #15       | Prev/Next pagination         | ✅ Complete | Navigation with metadata                 |
| #16       | Client-side search (fuse.js) | ✅ Complete | Autocomplete, recent searches, filtering |
| #17       | Search adapter interface     | ✅ Complete | Custom search implementation support     |

## Phase 1C: Media & Rich Content

| Feature # | Title                             | Status      | Description                          |
| --------- | --------------------------------- | ----------- | ------------------------------------ |
| #18       | Image component with lazy loading | ✅ Complete | Lazy load, lightbox, CDN support     |
| #19       | Video embed component             | ✅ Complete | YouTube, Vimeo, custom video support |
| #20       | Code syntax highlighting          | ✅ Complete | Lazy-loaded, copy, line numbers      |
| #21       | Callout/alert components          | ✅ Complete | Info, warning, tip, danger callouts  |
| #22       | Download/attachment support       | ✅ Complete | PDFs, templates, code samples        |

## Phase 2A: User Engagement & Feedback

| Feature # | Title                     | Status      | Description                                  |
| --------- | ------------------------- | ----------- | -------------------------------------------- |
| #23       | Rating component          | ✅ Complete | onRate callback, customizable display        |
| #24       | Feedback widget           | ✅ Complete | "Was this helpful?" with onFeedback callback |
| #25       | Comment display component | ✅ Complete | Display and submit comments via callback     |
| #26       | Bookmarks functionality   | ✅ Complete | Toggle bookmarks with storage adapter        |
| #27       | Reading history tracking  | ✅ Complete | Track and display reading history            |

## Phase 2B: Additional Display Modes

| Feature # | Title                        | Status      | Description                                  |
| --------- | ---------------------------- | ----------- | -------------------------------------------- |
| #28       | Modal display component      | ✅ Complete | Modal overlay with focus management          |
| #29       | Sidebar display component    | ✅ Complete | Left/right sidebar panel                     |
| #30       | Keyboard shortcuts system    | ✅ Complete | useHelpShortcuts hook, configurable bindings |
| #31       | Context-sensitive help hooks | ✅ Complete | Hooks for contextual help integration        |

## Phase 3A: Advanced Content Formats

| Feature # | Title                      | Status      | Description                         |
| --------- | -------------------------- | ----------- | ----------------------------------- |
| #32       | MDX parser                 | ✅ Complete | MDX support with React components   |
| #33       | JSON content loader        | ✅ Complete | Load content from JSON files        |
| #34       | CSV content loader         | ✅ Complete | Load content from CSV files         |
| #35       | Content format detection   | ✅ Complete | Auto-detect based on file extension |
| #36       | Multi-format documentation | ✅ Complete | Support mixed format content        |

## Phase 3B: Content Editor Utility

| Feature # | Title                        | Status      | Description                             |
| --------- | ---------------------------- | ----------- | --------------------------------------- |
| #37       | Content editor component     | ✅ Complete | Full editor with save/publish callbacks |
| #38       | Markdown editor with preview | ✅ Complete | WYSIWYG markdown editing                |
| #39       | Metadata editor              | ✅ Complete | Form for editing article metadata       |
| #40       | Asset upload interface       | ✅ Complete | Upload and manage images/files          |
| #41       | Editor internationalization  | ✅ Complete | Multi-language support via i18n         |

## Phase 4: Advanced Features

| Feature # | Title                       | Status      | Description                         |
| --------- | --------------------------- | ----------- | ----------------------------------- |
| #42       | Diagram support (Mermaid)   | ✅ Complete | Mermaid, PlantUML integration       |
| #43       | Interactive sandbox         | ✅ Complete | CodeSandbox/StackBlitz embeds       |
| #44       | Analytics hooks             | ✅ Complete | Track views, searches, interactions |
| #45       | A11y audit and enhancements | ✅ Complete | WCAG 2.1 AA compliance              |
| #46       | PWA/offline support         | ✅ Complete | Service worker, content caching     |

## Phase 5: Developer Experience

| Feature # | Title                       | Status     | Description                          |
| --------- | --------------------------- | ---------- | ------------------------------------ |
| #47       | CLI for scaffolding         | 🔲 Planned | init, add-article, validate commands |
| #48       | TypeScript config generator | 🔲 Planned | Generate help.config.ts              |
| #49       | Content validation tools    | 🔲 Planned | Validate content structure and links |
| #50       | Migration utilities         | 🔲 Planned | Migrate from other help systems      |
| #51       | Comprehensive documentation | 🔲 Planned | API reference, guides, examples      |

## Phase 6: Enterprise Features (v1.0.0)

| Feature # | Title                             | Status     | Description                                        |
| --------- | --------------------------------- | ---------- | -------------------------------------------------- |
| #52       | Analytics adapter system          | 🔲 Planned | Pluggable analytics (Supabase, GA, Mixpanel)       |
| #53       | Static manifest generation CLI    | 🔲 Planned | Generate JSON manifests from markdown              |
| #54       | Router adapter system             | 🔲 Planned | Framework-agnostic routing (React Router, Next.js) |
| #55       | Related documents algorithm       | 🔲 Planned | Smart doc recommendations (category, tags, ML)     |
| #56       | Multi-portal context management   | 🔲 Planned | Multiple help portals with isolated configs        |
| #57       | Enhanced TOC generator            | 🔲 Planned | Active heading tracking, smooth scroll, nesting    |
| #58       | Markdown link transformer         | 🔲 Planned | Intelligent link handling, validation, analytics   |
| #59       | Advanced search functionality     | 🔲 Planned | Fuzzy/semantic search, filters, highlighting       |
| #60       | Frontmatter management tools      | 🔲 Planned | CLI tools for frontmatter validation, fixing       |
| #61       | Documentation analytics dashboard | 🔲 Planned | View stats, popular docs, search analytics         |

## Status Legend

- 🔲 Planned - Feature is documented and planned
- 🚧 In Progress - Feature is currently being implemented
- ✅ Complete - Feature is implemented and tested
- ⏸️ On Hold - Feature is paused
- ❌ Cancelled - Feature will not be implemented
