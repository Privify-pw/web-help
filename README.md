# PIIKeep Web Help

A small TypeScript React component library and utilities to add contextual help to React apps. Built with Vite, ESLint, and TypeScript. Intended to provide a provider, UI components and hooks to show contextual help, tooltips, and guided help flows.

## Features

- TypeScript-first React components and hooks
- Lightweight, framework-agnostic styles (customizable)
- Integrates with existing component libraries
- Vite-based development server and build

## Install

For local development (this repo):

```bash
npm install
```

To publish/use as a package, add as a dependency:

```bash
npm install @piikeep/web-help
# or
yarn add @piikeep/web-help
```

## Usage

Example usage in a React + TypeScript app:

```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { HelpProvider, HelpTrigger, useHelp } from 'web-help';

function App() {
  return (
    <HelpProvider>
      <Main />
    </HelpProvider>
  );
}

function Main() {
  const { openHelp } = useHelp();

  return (
    <>
      <h1>My App</h1>
      <button onClick={() => openHelp('getting-started')}>Help</button>
      <HelpTrigger id='getting-started'>
        <p>Tips and guidance for getting started...</p>
      </HelpTrigger>
    </>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
```

(Adjust imports and API names to match your library exports.)

## Development

Run the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Lint the code:

```bash
npm run lint
```

## Project structure (example)

- src/ — source components and hooks
- dist/ — build output (after `npm run build`)
- public/ — static assets
- package.json — scripts and dependencies
- tsconfig.json — TypeScript config
- .eslintrc.\* — ESLint config

## Contributing

- Open an issue for feature requests or bugs.
- Fork, make changes on a feature branch, run lint/build, and submit a PR.
- Follow existing code style and add unit tests for new features.

## Security Considerations

This library uses `gray-matter` for parsing frontmatter in markdown files. Gray-matter uses `eval` internally for YAML parsing. This is safe when:

- Processing trusted markdown content from your own codebase
- Using the CLI tools to generate content
- Not parsing user-submitted markdown in production

For user-generated content, implement server-side validation and sanitization.

## License

MIT — see LICENSE file.

## Author

Charles de Jager <charles.de.jager@piikeep.pw>
