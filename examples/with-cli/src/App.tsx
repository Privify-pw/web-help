import { useState } from 'react';
import {
  HelpProvider,
  HelpModal,
  HelpNavigation,
  HelpContent,
  HelpBreadcrumbs,
  HelpCallout,
  HelpAccordion,
  HelpTabs,
  useHelp,
  type NavigationItem,
} from '@piikeep-pw/web-help';
import { useTheme } from './ThemeContext';

// Define comprehensive help content manifest
const contentManifest = {
  'getting-started': `---
title: Getting Started
category: Basics
tags:
  - beginner
  - introduction
---

# Getting Started

Welcome to our application! This guide will help you get up and running quickly.

## Overview

Our help system provides contextual assistance throughout the application. You can access help in several ways:

- Click the **Help** button in the navigation
- Press \`?\` anywhere in the app
- Use the search feature to find specific topics

## Key Features

- **Contextual Help**: Relevant help based on your current location
- **Full-Text Search**: Find articles quickly
- **Dark Mode Support**: Easy on the eyes at night
- **Bookmarks**: Save important articles for quick access

> **Pro Tip**: Enable keyboard shortcuts in settings for faster navigation!
`,
  installation: `---
title: Installation
category: Basics
tags:
  - setup
  - npm
---

# Installation

Follow these steps to install the application.

## Prerequisites

Before you begin, ensure you have:

- Node.js 18 or higher
- npm or yarn package manager
- A modern web browser

## Quick Install

\`\`\`bash
npm install @piikeep-pw/web-help
\`\`\`

## Configuration

After installation, you can configure the help system in your app:

\`\`\`tsx
import { HelpProvider } from '@piikeep-pw/web-help';

function App() {
  return (
    <HelpProvider config={{ /* your config */ }}>
      <YourApp />
    </HelpProvider>
  );
}
\`\`\`
`,
  features: `---
title: Features Overview
category: Features
tags:
  - overview
  - capabilities
---

# Features Overview

Discover all the powerful features available in our application.

## Core Features

### Help Modal
Display help content in a modal overlay. Perfect for contextual help without leaving your current task.

### Sidebar Mode
Show help alongside your content. Great for tutorials and guides.

### Search
Full-text search across all help articles with highlighting.

## Advanced Features

### Bookmarks
Save your favorite articles for quick access later.

### Reading History
Track what you've read and pick up where you left off.

### Keyboard Shortcuts
Navigate the help system efficiently with keyboard shortcuts.
`,
  theming: `---
title: Theming Guide
category: Customization
tags:
  - theme
  - dark-mode
  - styling
---

# Theming Guide

Learn how to customize the look and feel of the help system.

## Light and Dark Mode

The help system fully supports both light and dark themes. Use CSS variables to customize colors:

\`\`\`css
:root {
  --help-bg: #ffffff;
  --help-text: #333333;
  --help-primary: #0066cc;
}

[data-theme="dark"] {
  --help-bg: #1a1a2e;
  --help-text: #e0e0e0;
  --help-primary: #4da6ff;
}
\`\`\`

## Custom Components

All components are headless and can be styled completely:

- Use the provided CSS classes as hooks
- Override styles with higher specificity
- Replace components entirely with your own

## Best Practices

1. Use CSS variables for consistency
2. Test both themes thoroughly
3. Ensure sufficient color contrast
4. Consider reduced motion preferences
`,
};

// Navigation items
const navigationItems: NavigationItem[] = [
  {
    id: 'basics',
    label: 'Basics',
    icon: '📚',
    isCategory: true,
    children: [
      { id: 'getting-started', label: 'Getting Started', icon: '🚀' },
      { id: 'installation', label: 'Installation', icon: '📦' },
    ],
  },
  {
    id: 'features',
    label: 'Features',
    icon: '⭐',
  },
  {
    id: 'customization',
    label: 'Customization',
    icon: '🎨',
    isCategory: true,
    children: [{ id: 'theming', label: 'Theming Guide', icon: '🌗' }],
  },
];

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className='theme-toggle'
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}

function HelpSidebarContent({ onClose }: { onClose: () => void }) {
  const { openArticle, currentArticle, isLoading, getAllArticles } = useHelp();
  const [activeNavId, setActiveNavId] = useState<string>('getting-started');

  const handleNavSelect = async (id: string) => {
    // Check if this is an article ID
    const articles = getAllArticles();
    const article = articles.find((a) => a.id === id);
    if (article) {
      setActiveNavId(id);
      await openArticle(id);
    }
  };

  // Build breadcrumb path
  const breadcrumbItems = currentArticle
    ? [
        { id: 'home', label: 'Help', href: '#' },
        ...(currentArticle.metadata.category
          ? [{ id: 'cat', label: currentArticle.metadata.category, href: '#' }]
          : []),
        { id: currentArticle.id, label: currentArticle.title, href: '#' },
      ]
    : [];

  return (
    <div className='help-sidebar-layout'>
      <header className='help-header'>
        <h2 className='help-title'>📖 Help Center</h2>
        <div className='help-header-actions'>
          <ThemeToggle />
          <button
            className='close-btn'
            onClick={onClose}
            aria-label='Close help'
          >
            ✕
          </button>
        </div>
      </header>

      <div className='help-layout'>
        <aside className='help-nav-sidebar'>
          <HelpNavigation
            items={navigationItems}
            activeId={activeNavId}
            onItemSelect={handleNavSelect}
          />
        </aside>

        <main className='help-main-content'>
          {breadcrumbItems.length > 0 && (
            <HelpBreadcrumbs items={breadcrumbItems} />
          )}

          {isLoading ? (
            <div className='help-loading'>Loading...</div>
          ) : currentArticle ? (
            <>
              <HelpContent content={currentArticle.content} />

              {/* Demo components */}
              <section className='help-demo-section'>
                <h2>Component Examples</h2>

                <HelpCallout type='tip' title='Pro Tip'>
                  You can use these components to enhance your help content!
                </HelpCallout>

                <HelpCallout type='warning' title='Note'>
                  Make sure to test in both light and dark modes.
                </HelpCallout>

                <HelpAccordion
                  items={[
                    {
                      id: 'faq-1',
                      title: 'How do I customize the theme?',
                      content:
                        'Use CSS variables to customize colors and styles. Check the theming guide for details.',
                    },
                    {
                      id: 'faq-2',
                      title: 'Can I use my own components?',
                      content:
                        'Yes! All components are headless and can be replaced with your own implementations.',
                    },
                  ]}
                />

                <HelpTabs
                  items={[
                    {
                      id: 'react',
                      label: 'React',
                      content: <code>npm install @piikeep-pw/web-help</code>,
                    },
                    {
                      id: 'yarn',
                      label: 'Yarn',
                      content: <code>yarn add @piikeep-pw/web-help</code>,
                    },
                  ]}
                />
              </section>
            </>
          ) : (
            <div className='help-welcome'>
              <h2>Welcome to the Help Center</h2>
              <p>
                Select a topic from the navigation or search for specific
                content.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Main() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <div className='app'>
      <header className='app-header'>
        <h1>Styled Example App</h1>
        <div className='header-actions'>
          <ThemeToggle />
          <button className='help-button' onClick={() => setIsHelpOpen(true)}>
            ❓ Help
          </button>
        </div>
      </header>

      <main className='app-main'>
        <div className='app-content'>
          <h2>Welcome</h2>
          <p>
            This example demonstrates the <code>@piikeep-pw/web-help</code>{' '}
            library with full dark and light mode support.
          </p>

          <h3>Features Demonstrated</h3>
          <ul>
            <li>🌗 Dark and Light mode toggle</li>
            <li>📖 Help modal with navigation</li>
            <li>🔍 Search functionality</li>
            <li>📚 Navigation sidebar</li>
            <li>🍞 Breadcrumb navigation</li>
            <li>💡 Callout components</li>
            <li>📁 Accordion components</li>
            <li>📑 Tab components</li>
          </ul>

          <button className='cta-button' onClick={() => setIsHelpOpen(true)}>
            Open Help Center
          </button>
        </div>
      </main>

      <HelpModal open={isHelpOpen} onClose={() => setIsHelpOpen(false)}>
        <HelpSidebarContent onClose={() => setIsHelpOpen(false)} />
      </HelpModal>
    </div>
  );
}

function App() {
  return (
    <HelpProvider contentManifest={contentManifest}>
      <Main />
    </HelpProvider>
  );
}

export default App;
