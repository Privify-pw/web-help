import { useState } from 'react';
import { HelpProvider, HelpModal, useHelp } from '@privify-pw/web-help';

// Define help content manifest
const contentManifest = {
  'getting-started': `---
title: Getting Started
category: Basics
tags:
  - beginner
  - introduction
---

# Getting Started

Welcome to the application! Here are some tips and guidance for getting started.

## Quick Start

1. Click the **Help** button to open help content
2. Browse through different help topics
3. Use the search feature to find specific information

## Features

- **Contextual Help**: Get help relevant to where you are in the app
- **Search**: Find help articles quickly
- **Bookmarks**: Save important articles for later

> **Tip**: You can press \`?\` to quickly open the help system from anywhere in the app.
`,
};

function Main() {
  const { openArticle, currentArticle, isLoading } = useHelp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenHelp = async () => {
    await openArticle('getting-started');
    setIsModalOpen(true);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>My App</h1>
      <p>This is a basic example demonstrating the web-help library.</p>
      
      <button 
        onClick={handleOpenHelp}
        style={{
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          cursor: 'pointer',
          backgroundColor: '#0066cc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
        }}
      >
        Help
      </button>

      <HelpModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentArticle?.title || 'Help'}
      >
        {isLoading ? (
          <p>Loading...</p>
        ) : currentArticle ? (
          <div dangerouslySetInnerHTML={{ __html: currentArticle.renderedContent || currentArticle.content }} />
        ) : (
          <p>No help content available.</p>
        )}
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
