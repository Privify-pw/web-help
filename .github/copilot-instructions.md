# Copilot Instructions for @privify-pw/web-help

## Project Overview

This is a comprehensive, headless help system component library for React applications. The library provides TypeScript-first components and hooks to add contextual help, tooltips, and guided help flows to React apps.

## Technology Stack

- **Framework**: React 18/19 with TypeScript
- **Build Tool**: Vite
- **Linting**: ESLint with TypeScript support
- **Content Parsing**: Markdown with gray-matter for frontmatter, marked for rendering

## Development Commands

```bash
npm install      # Install dependencies
npm run dev      # Start development server
npm run build    # Build for production (tsc -b && vite build)
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Architecture

### Headless Component Library

- All components are headless (unstyled) for maximum flexibility
- Components provide semantic class names and data attributes for styling hooks
- Developers bring their own styles (Tailwind, CSS-in-JS, etc.)

### Directory Structure

```
src/
├── core/           # Core functionality
│   ├── components/ # Headless UI components (HelpPage, HelpContent, HelpNavigation, etc.)
│   ├── context/    # React contexts (HelpContext, UserPreferencesContext)
│   ├── hooks/      # React hooks (useHelp, useHelpNavigation, useHelpSearch, etc.)
│   ├── types/      # TypeScript type definitions
│   ├── storage/    # Storage adapters (localStorage, sessionStorage, cookies)
│   └── loaders/    # Content loaders and parsers
├── components/     # Feature components
│   ├── media/      # HelpImage, HelpVideo, HelpDownload
│   ├── code/       # HelpCodeBlock, HelpInlineCode
│   ├── visual/     # HelpCallout, HelpAccordion, HelpTabs, HelpSteps
│   └── feedback/   # HelpRating, HelpFeedback, HelpComments, HelpBookmark
├── types/          # Legacy type exports
└── index.ts        # Main library exports
```

## Code Style Guidelines

- Use TypeScript with strict type checking
- Export types alongside implementations
- Use `type` exports for TypeScript types (not interfaces where possible)
- Follow React hooks conventions
- Components should be functional components
- Use composition patterns over prop drilling
- Provide semantic class names for styling (e.g., `help-content`, `help-sidebar`)
- Use data attributes for state (e.g., `data-expanded="true"`)

## Component Patterns

### Context Pattern

```tsx
export const HelpProvider: React.FC<HelpProviderProps> = ({ children, config }) => {
  // State management
  return (
    <HelpContext.Provider value={contextValue}>
      {children}
    </HelpContext.Provider>
  );
};
```

### Hook Pattern

```tsx
export function useHelp() {
  const context = useHelpContext();
  // Derive additional state or methods
  return { ...context, additionalMethods };
}
```

### Headless Component Pattern

```tsx
export const HelpContent: React.FC<HelpContentProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={`help-content ${className ?? ''}`}
      data-loading={isLoading}
      {...props}
    >
      {children}
    </div>
  );
};
```

## Testing

This project does not currently have a test infrastructure. When adding tests:

- Use React Testing Library for component tests
- Use Jest or Vitest for unit tests
- Test hooks using `renderHook` from `@testing-library/react`

## Bundle Size Targets

- Core package: < 30KB gzipped
- With basic features: < 50KB gzipped
- Full featured: < 100KB gzipped
- Use tree-shaking and lazy loading for optional features

## Key Design Decisions

1. **Content Source Flexibility**: Support Markdown, MDX, JSON, CSV with pluggable parser architecture
2. **Configuration Strategy**: Global config via TypeScript, per-component config via React props
3. **Storage Abstraction**: Provide adapters for localStorage, sessionStorage, cookies with custom adapter support
4. **Callback-based Integration**: Use callbacks (onComment, onRate, onSearch) for developer integration

## Documentation

- `docs/web-help.md` contains detailed architecture decisions and implementation plans
- `README.md` contains usage examples and getting started guide
- `FEATURES.md` contains feature documentation
- `CHANGELOG.md` tracks version history
