---
title: React WebHelp component library
created: 03/12/2025
updated: 03/12/2025
status: in-development
uses: React, Typescript, Vite, TailwindCSS
---

# React WebHelp Component Library

## Purpose

This react component is a comprehensive help system for any react project.
The component currently has tailwind installed and configured but must support any style framework that the developer is using.
The component currently uses vite but must support any bundler the user is using.

## Overview

This react component is a comprehensive help system for any react project.
The component currently has tailwind installed and configured but must support any style framework that the developer is using.
The component currently uses vite but must support any bundler the user is using.

## Best Practises

To create a successful online help documentation system, use clear and concise language, incorporate visuals like screenshots and diagrams, and maintain consistency in formatting and terminology. It's also crucial to organize content for easy navigation, keep information up-to-date, and actively solicit user feedback.

### Content and writing

- Write clearly and concisely: Use straightforward language and avoid jargon. Keep content short and to the point.
  -Understand your audience: Tailor the content to your users' needs and knowledge level.
- Include visuals: Use screenshots, diagrams, flowcharts, and videos to help clarify complex topics.
- Provide examples: Include interactive examples and exercises to help users learn and practice.

### Structure and organization

- Make it easy to navigate: Use a clear table of contents, sidebars, or other organizational tools so users can find information quickly.
- Standardize formats: Create templates and style guides for consistency in both appearance and terminology.
- Keep it relevant: Ensure the documentation covers both simple and complex topics to serve all user levels.

### Maintenance and updates

- Update regularly: Schedule regular reviews to ensure content remains current and relevant as products change.
- Solicit and use feedback: Actively seek input from users to identify gaps and areas for improvement.
- Archive outdated information: Periodically move old, unhelpful content to an archive instead of deleting it.
- Collaboration and access
- Use a centralized platform: Host all documentation in one place to create a single source of truth.
- Encourage collaboration: Promote a culture where team members can contribute to and review documentation.
- Track changes: Implement version control to keep a record of all changes made.
- Manage access: Use a system to control who can view or edit sensitive information.

## Open Questions

### 1. Content Management & Collaboration

- How will documentation be authored and maintained? (Local files, Git-based workflow, CMS integration?)
- Answer: Initially local files in probablly markdown or similar format. As long as no dangeroushtml code is required. I would also be open to having a content editor as a utility or seperate component. The developer could then hook the application into which ever content solution they have. I would suggest we build different sub packages for different integrations and allow the developer to choose. Probably support csv, json, and markdown in the begining.

- Should there be version control/change tracking built into the help system UI?
- Answer: We should cater for that as part of the content editor utility

- How should user feedback be collected and displayed? (Comments, ratings, "Was this helpful?", GitHub issues integration?)
- Answer: Have those as configurable features that are exposed through onComment(), onRate() type callbacks. Have the display components for rating and capturing comments but let the developer handle the actual comments and ratings, etc.

- Should there be an admin/editor mode for content contributors?
- Answer: I believe it would be a good idea to have that type of function.

### 2. Content Format & Media Support

- Primary content format: Markdown, MDX, or both?
- Answer: Both

- Should we support embedding: Videos (YouTube, Vimeo), interactive demos/sandboxes (CodeSandbox, StackBlitz), diagrams (Mermaid, PlantUML)?
- Answer: Have components for each of those that the developer can use and provide content to

- Image handling: Local vs CDN, lazy loading, zoom/lightbox functionality?
- Answer: Could this be a configurable thing that allows the developer to decide?
- **Clarification**: Yes, all image handling will be configurable through component props:

  - `loading="lazy|eager"` for lazy loading control
  - `lightbox={true/false}` for zoom functionality
  - `cdn={cdnConfig}` for optional CDN integration
  - `optimization={config}` for image optimization settings

- Should there be support for downloadable resources (PDFs, templates, code samples)?
- Answer: Yes

### 3. Navigation & Information Architecture

- How should content be organized? (Categories, tags, hierarchical structure, or combination?)
- Answer: Allow for all and let the developer configure which options they want to use.

- Should there be a global search with autocomplete/suggestions?
- Answer: Yes

- Navigation features: TOC with auto-generated anchors, breadcrumbs, prev/next pagination, related articles?
- Answer: Yes

- Should there be a "quick start" or "getting started" template/wizard?
- Answer: Yes

### 4. User Experience Features

- Display modes: Modal, sidebar, dedicated page, inline contextual tooltips, or all?
- Answer: We will allow for all of those as configuration that the developer can do (maybe seperate components). We can start with dedicated page and then expand from there

- Keyboard shortcuts for accessing help (e.g., Cmd+K for search)?
- Answer: Allow through developer configuration

- User personalization: Bookmarks, reading history, favorites, progress tracking?
- Answer: Yes, by exposing functionality that the developer can use to manage the storage etc. of those. We can have localstorage, sessionstorage, cookies, and developer defined as options initially.

- Accessibility requirements: WCAG level? Screen reader optimization? High contrast mode?
- Answer: Yes to all

- Should there be an offline mode or PWA support?
- Answer: Yes

### 5. Internationalization & Localization

- Multi-language support needed? If yes, which languages initially?
- Answer: The component for displaying help will have no hard coded display strings. That will be up to the developer to define. For the editor we should support multiple languages

- Should locale be auto-detected or user-selectable?
- Answer: Developer configured and passed to the component by the developer.

- How should translated content be organized? (Separate files, database, i18n service?)
- Answer: For the editor we can use i18n.

- RTL language support needed?
- Answer: Not at this point

### 6. Styling & Theming Strategy

- Preferred approach for maximum flexibility:

  - Headless/unstyled components (bring your own styles)
  - Answer: Headless

  - CSS variables for theming
  - Answer: We can expose options per display component but ultimatly the developer should style. We should however provide classes that they can use for styling appropriate components.

  - Multiple preset themes (Tailwind, Bootstrap, Material, etc.)
  - Answer: Bring your own style

  - Or combination of headless + optional presets?

- Should themes support: Light/dark mode, color scheme customization, typography scales, spacing systems?
- Answer: Would this be required if we are headless?
- **Clarification**: For headless components, we won't enforce theming but will provide:
  - Semantic class names for developer styling (e.g., `help-content`, `help-sidebar`)
  - Data attributes for state (e.g., `data-theme="dark"`, `data-expanded="true"`)
  - Optional CSS variable definitions developers can use as a starting point
  - This allows developers to implement their own light/dark mode using their preferred method

### 7. Performance & Scalability

- Expected documentation size? (Number of articles/pages)
- Answer: This is only a component that will be used in a react app... this should not be a factor

- Bundle size constraints? (Target max size for initial load)
- Answer: Use industry standards for component packages
- **Industry Standard Targets**:

  - Core package: < 30KB gzipped (comparable to react-router-dom ~25KB)
  - With basic features: < 50KB gzipped
  - Full featured: < 100KB gzipped
  - Each parser/feature as optional import to enable tree-shaking

- Should content be code-split by category/section?
- Answer: Use industry standards
- **Implementation**:

  - Components will be tree-shakeable (import only what you use)
  - Content parsers loaded on-demand
  - Route-based code splitting for dedicated page mode
  - Dynamic imports for heavy features (syntax highlighting, diagrams)

- Search implementation: Client-side (for smaller docs) vs. server-side/API (for large docs)?
- Answer: As this is a component, what would you suggest?
- **Recommendation**: Provide both with adapter pattern:

  - Client-side by default using lightweight search (fuse.js < 10KB gzipped)
  - Expose search adapter interface for custom implementations
  - Developers can plug in server-side search, Algolia, ElasticSearch, etc.
  - Auto-warn if content size > 500 articles with client-side search
  - Example adapters provided for common solutions

- Should there be lazy-loading for media and off-screen content?
- Answer: what is your suggestion.
- **Recommendation**: Smart lazy-loading by default, all configurable:
  - Images: `loading="lazy"` by default with Intersection Observer fallback
  - Code blocks: Lazy load syntax highlighter on first render
  - Videos: Load on interaction (click-to-play)
  - Long articles: Virtual scrolling for performance
  - All controllable via component props for developer override

### 8. Developer Experience & Integration

- Preferred content source: Static files bundled with app, dynamic API, or both?
- Answer: Content is the reponsibility of the developer, but when the application packages it should allow for content to change without rebuilding or static. Configured by the developer.

- Configuration approach: TypeScript config file, JSON, or React component props?
- Answer: React component props for individual components and typescript config file for global configuration options

- Should there be a CLI for scaffolding/initialization?
- Answer: Yes

- Need example integrations for: Next.js, Remix, Vite, Create React App, others?
- Answer: Future phase

- Should there be TypeScript-first development with full type safety?
- Answer: Yes

### Additional Notes

- Not all functions need to be implemented right now. A phased approach is required
- Log feature issues in github for every feature that will be implemented either as part of the initial build or as future features.
- A changelog must be maintained from the start

## Architecture Decisions

Based on the answers above, here are the core architectural decisions:

### 1. **Headless Component Library**

- Zero styling opinions in core components
- Semantic class names and data attributes for styling hooks
- Composition pattern for maximum flexibility
- Bring-your-own-styles approach

### 2. **Content Source Flexibility**

- Support Markdown, MDX, JSON, CSV initially
- Pluggable parser architecture
- Content can be static (bundled) or dynamic (API/CMS)
- Developer responsible for content management strategy

### 3. **Configuration Strategy**

- Global config via TypeScript config file
- Per-component config via React props
- Callback-based integration (onComment, onRate, onSearch, etc.)
- Developer handles storage, authentication, analytics

### 4. **Bundle Strategy**

- Tree-shakeable exports (import only what you use)
- Core < 30KB gzipped
- Features as optional packages
- Lazy-loading by default where appropriate

### 5. **Storage Abstraction**

- Provide adapters for localStorage, sessionStorage, cookies
- Developer can implement custom storage
- No backend dependencies

### 6. **Display Modes Priority**

- **Phase 1**: Dedicated page mode
- **Phase 2**: Modal and sidebar modes
- **Phase 3**: Inline tooltips and contextual help

### 7. **Sub-packages Strategy**

- `@privify-pw/web-help` - Core headless components
- `@privify-pw/web-help-parsers-markdown` - Markdown parser
- `@privify-pw/web-help-parsers-mdx` - MDX parser
- `@privify-pw/web-help-search` - Client-side search
- `@privify-pw/web-help-editor` - Content editor utility (future)
- `@privify-pw/web-help-cli` - CLI tools

## Implementation Plan

**Note**: This is a phased approach. Each feature will be tracked as a GitHub issue. A changelog will be maintained from the start.

### Phase 1A: Core Foundation (MVP - Dedicated Page Mode)

**Goal**: Build minimal viable headless component library for dedicated page display

**GitHub Issues to Create**:

- #1: TypeScript type system and interfaces
- #2: Markdown parser with frontmatter support
- #3: Basic content loader (static files)
- #4: Core context and state management
- #5: Dedicated page component (headless)

**Deliverables**:

1. **Type System** (`src/core/types/`)

   - Content interfaces (HelpArticle, HelpMetadata, HelpConfig)
   - Configuration types (global and component-level)
   - Parser plugin interfaces
   - Storage adapter interfaces
   - Callback signatures (onRate, onComment, onFeedback, etc.)

2. **Markdown Parser** (`@privify-pw/web-help-parsers-markdown`)

   - Frontmatter parsing (yaml metadata)
   - Extended markdown syntax (tables, code blocks, etc.)
   - Plugin architecture for custom syntax
   - Image, video, and asset reference handling

3. **Content Loader** (`src/core/loaders/`)

   - Static file loader
   - Content registry and caching
   - Error handling and validation
   - Content indexing for search

4. **State Management** (`src/core/context/`)

   - HelpContext for global state
   - Content state (current article, navigation)
   - User preferences state (bookmarks, history)
   - Storage adapter integration

5. **Display Components** (`src/core/components/`)
   - `<HelpPage>` - Main container (headless)
   - `<HelpContent>` - Content renderer
   - `<HelpNavigation>` - Basic navigation
   - All with semantic class names and data attributes

**Configuration**:

```typescript
// help.config.ts
export default {
  content: {
    source: 'static', // or 'api'
    path: './content',
    formats: ['md'],
  },
  storage: {
    type: 'localStorage', // sessionStorage, cookies, custom
    prefix: 'help_',
  },
};
```

**Success Criteria**:

- Core bundle < 30KB gzipped
- TypeScript full type safety
- Can render markdown content in dedicated page
- Semantic HTML output for styling

---

### Phase 1B: Navigation & Search

**Goal**: Make content discoverable and navigable

**GitHub Issues to Create**:

- #6: Table of contents component
- #7: Breadcrumb navigation
- #8: Prev/Next pagination
- #9: Client-side search with fuse.js
- #10: Search adapter interface

**Deliverables**:

1. **Navigation Components** (`src/core/components/navigation/`)

   - `<HelpTOC>` - Auto-generated from headings
   - `<HelpBreadcrumbs>` - Hierarchical navigation
   - `<HelpPagination>` - Prev/Next with metadata
   - All keyboard accessible

2. **Search System** (`@privify-pw/web-help-search`)

   - Client-side search (fuse.js integration)
   - Search adapter interface for custom implementations
   - `<HelpSearch>` component with autocomplete
   - Recent searches tracking
   - Category/tag filtering

3. **Content Organization**
   - Category and tag system
   - Hierarchical structure support
   - Related articles algorithm
   - Search indexing

**Configuration**:

```typescript
{
  search: {
    type: 'client', // or 'custom'
    adapter: customSearchAdapter, // optional
    options: {
      threshold: 0.3,
      keys: ['title', 'content', 'tags']
    }
  }
}
```

---

### Phase 1C: Media & Rich Content

**Goal**: Support visuals and rich media per best practices

**GitHub Issues to Create**:

- #11: Image component with lazy loading
- #12: Video embed component (YouTube, Vimeo)
- #13: Code syntax highlighting
- #14: Callout/alert components
- #15: Download/attachment support

**Deliverables**:

1. **Media Components** (`src/core/components/media/`)

   - `<HelpImage loading="lazy|eager" lightbox={bool} cdn={config}/>`
   - `<HelpVideo source="youtube|vimeo|custom" lazyLoad={bool}/>`
   - `<HelpDownload href="..." type="pdf|code|template"/>`

2. **Code Display** (`src/core/components/code/`)

   - Syntax highlighting (lazy-loaded)
   - Copy to clipboard functionality
   - Line numbers and highlighting
   - Language detection

3. **Visual Components** (`src/core/components/visual/`)
   - `<HelpCallout type="info|warning|tip|danger"/>`
   - `<HelpAccordion>` - Expandable sections
   - `<HelpTabs>` - Tabbed content
   - `<HelpSteps>` - Step-by-step guides

**Configuration**:

```typescript
{
  media: {
    images: {
      loading: 'lazy', // default
      cdn: { baseUrl: 'https://cdn.example.com' }
    },
    videos: {
      lazyLoad: true,
      providers: ['youtube', 'vimeo']
    }
  }
}
```

---

### Phase 2A: User Engagement & Feedback

**Goal**: Enable user interaction through callbacks

**GitHub Issues to Create**:

- #16: Rating component
- #17: Feedback widget ("Was this helpful?")
- #18: Comment display component
- #19: Bookmarks functionality
- #20: Reading history tracking

**Deliverables**:

1. **Feedback Components** (`src/features/feedback/`)

   - `<HelpRating onRate={(articleId, rating) => {}} />`
   - `<HelpFeedback onFeedback={(articleId, helpful) => {}} />`
   - `<HelpComments comments={[]} onComment={(articleId, comment) => {}} />`
   - Developer handles backend integration

2. **User Preferences** (`src/features/user/`)

   - `<HelpBookmark onToggle={(articleId) => {}} />`
   - History tracking with storage adapter
   - Reading progress for long articles
   - User notes component

3. **Storage Adapters** (`src/core/storage/`)
   - LocalStorage adapter
   - SessionStorage adapter
   - Cookie adapter
   - Custom adapter interface

**Usage Example**:

```typescript
<HelpRating
  articleId='intro'
  onRate={(id, rating) => {
    // Developer implements backend call
    api.submitRating(id, rating);
  }}
/>
```

---

### Phase 2B: Additional Display Modes

**Goal**: Support modal and sidebar modes

**GitHub Issues to Create**:

- #21: Modal display component
- #22: Sidebar display component
- #23: Keyboard shortcuts system
- #24: Context-sensitive help hooks

**Deliverables**:

1. **Display Mode Components** (`src/core/components/display/`)

   - `<HelpModal>` - Modal overlay
   - `<HelpSidebar position="left|right">` - Sidebar panel
   - Portal support for rendering
   - Escape to close, focus management

2. **Keyboard Shortcuts** (`src/core/hooks/`)
   - `useHelpShortcuts(config)` hook
   - Configurable key bindings
   - Cmd/Ctrl+K for search by default
   - Accessibility announcements

---

### Phase 3A: Advanced Content Formats

**Goal**: Support MDX, JSON, CSV content

**GitHub Issues to Create**:

- #25: MDX parser
- #26: JSON content loader
- #27: CSV content loader
- #28: Content format detection
- #29: Multi-format documentation

**Deliverables**:

1. **Additional Parsers**

   - `@privify-pw/web-help-parsers-mdx` - MDX support
   - JSON content loader
   - CSV content loader
   - Auto-detection based on file extension

2. **Interactive Content** (MDX)
   - Embed React components in content
   - Interactive demos
   - Live code examples

---

### Phase 3B: Content Editor Utility

**Goal**: Provide optional content management UI

**GitHub Issues to Create**:

- #30: Content editor component
- #31: Markdown editor with preview
- #32: Metadata editor
- #33: Asset upload interface
- #34: Editor internationalization

**Deliverables**:

1. **Editor Package** (`@privify-pw/web-help-editor`)

   - WYSIWYG markdown editor
   - Live preview
   - Metadata form
   - Asset management
   - Multi-language support via i18n

2. **Integration Hooks**
   - `onSave`, `onPublish`, `onDelete` callbacks
   - Developer handles persistence
   - Version control hooks

---

### Phase 4: Advanced Features

**GitHub Issues to Create**:

- #35: Diagram support (Mermaid)
- #36: Interactive sandbox integration
- #37: Analytics hooks
- #38: A11y audit and enhancements
- #39: PWA/offline support

**Deliverables**:

1. **Diagrams & Advanced Media**

   - Mermaid diagram support
   - PlantUML integration
   - CodeSandbox/StackBlitz embeds

2. **Accessibility Enhancements**

   - WCAG 2.1 AA compliance audit
   - Screen reader testing
   - High contrast mode support
   - Focus trap management

3. **Progressive Web App**
   - Service worker for offline content
   - Content caching strategy
   - Update notifications

---

### Phase 5: Developer Experience

**GitHub Issues to Create**:

- #40: CLI for scaffolding
- #41: TypeScript config generator
- #42: Content validation tools
- #43: Migration utilities
- #44: Comprehensive documentation

**Deliverables**:

1. **CLI Tool** (`@privify-pw/web-help-cli`)

   ```bash
   npx @privify-pw/web-help init
   npx @privify-pw/web-help add-article "Getting Started"
   npx @privify-pw/web-help validate
   ```

2. **Documentation**

   - API reference (auto-generated from TypeScript)
   - Integration guides
   - Migration guides
   - Best practices
   - Example projects

3. **Development Tools**
   - Debug mode with warnings
   - Content validation
   - Broken link checker
   - Performance profiler

### Recommended Package Structure

```text
@privify-pw/web-help/                    # Core package
├── src/
│   ├── core/
│   │   ├── components/                  # Headless UI components
│   │   │   ├── HelpPage.tsx
│   │   │   ├── HelpContent.tsx
│   │   │   ├── HelpNavigation.tsx
│   │   │   ├── HelpTOC.tsx
│   │   │   ├── HelpBreadcrumbs.tsx
│   │   │   ├── HelpPagination.tsx
│   │   │   ├── HelpModal.tsx
│   │   │   ├── HelpSidebar.tsx
│   │   │   └── index.ts
│   │   ├── context/                     # State management
│   │   │   ├── HelpContext.tsx
│   │   │   ├── ContentContext.tsx
│   │   │   ├── UserPreferencesContext.tsx
│   │   │   └── index.ts
│   │   ├── hooks/                       # React hooks
│   │   │   ├── useHelp.ts
│   │   │   ├── useHelpNavigation.ts
│   │   │   ├── useHelpSearch.ts
│   │   │   ├── useHelpShortcuts.ts
│   │   │   ├── useBookmarks.ts
│   │   │   └── index.ts
│   │   ├── types/                       # TypeScript definitions
│   │   │   ├── content.ts
│   │   │   ├── config.ts
│   │   │   ├── storage.ts
│   │   │   ├── parser.ts
│   │   │   └── index.ts
│   │   ├── storage/                     # Storage adapters
│   │   │   ├── localStorage.ts
│   │   │   ├── sessionStorage.ts
│   │   │   ├── cookie.ts
│   │   │   ├── adapter.interface.ts
│   │   │   └── index.ts
│   │   ├── loaders/                     # Content loaders
│   │   │   ├── staticLoader.ts
│   │   │   ├── apiLoader.ts
│   │   │   ├── loader.interface.ts
│   │   │   └── index.ts
│   │   └── utils/                       # Core utilities
│   │       ├── contentIndex.ts
│   │       ├── validation.ts
│   │       └── index.ts
│   ├── components/                      # Feature components
│   │   ├── media/
│   │   │   ├── HelpImage.tsx
│   │   │   ├── HelpVideo.tsx
│   │   │   ├── HelpDownload.tsx
│   │   │   └── index.ts
│   │   ├── code/
│   │   │   ├── HelpCodeBlock.tsx
│   │   │   ├── HelpInlineCode.tsx
│   │   │   └── index.ts
│   │   ├── visual/
│   │   │   ├── HelpCallout.tsx
│   │   │   ├── HelpAccordion.tsx
│   │   │   ├── HelpTabs.tsx
│   │   │   ├── HelpSteps.tsx
│   │   │   └── index.ts
│   │   └── feedback/
│   │       ├── HelpRating.tsx
│   │       ├── HelpFeedback.tsx
│   │       ├── HelpComments.tsx
│   │       ├── HelpBookmark.tsx
│   │       └── index.ts
│   ├── index.ts                         # Main exports
│   └── config.ts                        # Default config
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md

@privify-pw/web-help-parsers-markdown/   # Markdown parser package
├── src/
│   ├── parser.ts
│   ├── frontmatter.ts
│   ├── plugins/
│   │   ├── tables.ts
│   │   ├── codeBlocks.ts
│   │   ├── images.ts
│   │   └── index.ts
│   └── index.ts
└── package.json

@privify-pw/web-help-parsers-mdx/        # MDX parser package
├── src/
│   ├── parser.ts
│   ├── components.ts
│   └── index.ts
└── package.json

@privify-pw/web-help-search/             # Search package
├── src/
│   ├── client/                          # Client-side search
│   │   ├── fuseSearch.ts
│   │   └── index.ts
│   ├── adapters/                        # Search adapters
│   │   ├── adapter.interface.ts
│   │   ├── algolia.example.ts
│   │   └── index.ts
│   ├── components/
│   │   ├── HelpSearch.tsx
│   │   ├── HelpSearchResults.tsx
│   │   └── index.ts
│   └── index.ts
└── package.json

@privify-pw/web-help-editor/             # Content editor (future)
├── src/
│   ├── components/
│   │   ├── Editor.tsx
│   │   ├── Preview.tsx
│   │   ├── MetadataForm.tsx
│   │   └── index.ts
│   ├── i18n/
│   │   ├── en.json
│   │   ├── es.json
│   │   └── index.ts
│   └── index.ts
└── package.json

@privify-pw/web-help-cli/                # CLI tools
├── src/
│   ├── commands/
│   │   ├── init.ts
│   │   ├── add.ts
│   │   ├── validate.ts
│   │   └── index.ts
│   ├── templates/
│   │   ├── article.md
│   │   ├── config.ts
│   │   └── index.ts
│   └── index.ts
├── bin/
│   └── cli.js
└── package.json
```

### Success Metrics

- **User Experience**: Time to find information, search success rate, feedback scores
- **Content Quality**: Coverage completeness, update frequency, accuracy
- **Developer Adoption**: Integration ease, bundle size impact, customization flexibility
- **Performance**: Load time, search speed, navigation responsiveness
- **Accessibility**: WCAG compliance, screen reader compatibility, keyboard navigation
