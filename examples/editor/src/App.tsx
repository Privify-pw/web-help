import { useState, useCallback } from 'react';
import {
  HelpProvider,
  HelpEditor,
  createMarkdownParser,
  type HelpArticle,
} from '@privify-pw/web-help';

// Sample article content
const sampleArticle: HelpArticle = {
  id: 'sample-article',
  title: 'Getting Started',
  content: `---
title: Getting Started
category: Basics
tags:
  - introduction
  - beginner
---

# Getting Started

Welcome to the help editor! This example demonstrates how to use the **HelpEditor** component.

## Features

- Markdown editing with live preview
- Metadata management (category, tags, author)
- Save and publish callbacks
- Auto-save support

## Usage

\`\`\`tsx
import { HelpEditor } from '@privify-pw/web-help';

<HelpEditor
  article={article}
  onSave={handleSave}
  onPublish={handlePublish}
/>
\`\`\`

### Tips

1. Use the **Edit** tab to write content
2. Switch to **Preview** to see the rendered output
3. Update metadata in the bottom section
4. Click **Save Draft** or **Publish** when ready

> **Note**: Changes are tracked automatically. You'll be warned before leaving with unsaved changes.
`,
  metadata: {
    category: 'Basics',
    tags: ['introduction', 'beginner'],
    author: 'Help Team',
    published: false,
  },
};

// Create markdown parser for preview rendering
const markdownParser = createMarkdownParser();

function App() {
  const [savedArticles, setSavedArticles] = useState<HelpArticle[]>([]);
  const [currentArticle, setCurrentArticle] = useState<HelpArticle | undefined>(sampleArticle);
  const [editorKey, setEditorKey] = useState(0);

  // Handle save
  const handleSave = useCallback(async (article: HelpArticle) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    setSavedArticles((prev) => {
      const existing = prev.findIndex((a) => a.id === article.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...article, metadata: { ...article.metadata, updatedAt: new Date().toISOString() } };
        return updated;
      }
      return [...prev, { ...article, metadata: { ...article.metadata, createdAt: new Date().toISOString() } }];
    });
    
    console.log('Saved article:', article);
  }, []);

  // Handle publish
  const handlePublish = useCallback(async (article: HelpArticle) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const publishedArticle = {
      ...article,
      metadata: { ...article.metadata, published: true, updatedAt: new Date().toISOString() },
    };
    
    setSavedArticles((prev) => {
      const existing = prev.findIndex((a) => a.id === article.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = publishedArticle;
        return updated;
      }
      return [...prev, publishedArticle];
    });
    
    console.log('Published article:', publishedArticle);
  }, []);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setCurrentArticle(undefined);
  }, []);

  // Render preview using markdown parser
  const renderPreview = useCallback(async (content: string) => {
    try {
      const result = await markdownParser.parse(content);
      return <div dangerouslySetInnerHTML={{ __html: result.html }} />;
    } catch {
      return <div>Error parsing content</div>;
    }
  }, []);

  // Preview renderer that returns React node
  const previewRenderer = useCallback((content: string) => {
    return <PreviewContent content={content} />;
  }, []);

  // Edit saved article
  const handleEdit = useCallback((article: HelpArticle) => {
    setCurrentArticle(article);
    setEditorKey((prev) => prev + 1);
  }, []);

  // Delete saved article
  const handleDelete = useCallback((id: string) => {
    setSavedArticles((prev) => prev.filter((a) => a.id !== id));
    if (currentArticle?.id === id) {
      setCurrentArticle(undefined);
    }
  }, [currentArticle]);

  // Create new article
  const handleNew = useCallback(() => {
    setCurrentArticle({
      id: `article-${Date.now()}`,
      title: 'New Article',
      content: `---
title: New Article
category: General
---

# New Article

Start writing your content here...
`,
      metadata: {
        category: 'General',
        published: false,
      },
    });
    setEditorKey((prev) => prev + 1);
  }, []);

  return (
    <HelpProvider>
      <div className="app">
        <header className="app-header">
          <h1>📝 Help Editor Example</h1>
          <button
            onClick={handleNew}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            + New Article
          </button>
        </header>

        {currentArticle && (
          <HelpEditor
            key={editorKey}
            article={currentArticle}
            onSave={handleSave}
            onPublish={handlePublish}
            onCancel={handleCancel}
            renderPreview={previewRenderer}
            autoSaveInterval={30000}
            labels={{
              title: currentArticle.title || 'Edit Article',
            }}
          />
        )}

        {!currentArticle && (
          <div className="empty-state">
            <p>No article selected. Click "New Article" or edit a saved article below.</p>
          </div>
        )}

        <div className="saved-articles">
          <h2>📚 Saved Articles</h2>
          {savedArticles.length === 0 ? (
            <p className="empty-state">No saved articles yet. Create and save an article to see it here.</p>
          ) : (
            <ul className="saved-articles-list">
              {savedArticles.map((article) => (
                <li key={article.id} className="saved-article-item">
                  <div>
                    <span className="saved-article-title">{article.title}</span>
                    <div className="saved-article-meta">
                      {article.metadata.category && <span>{article.metadata.category}</span>}
                      {article.metadata.published ? ' • Published' : ' • Draft'}
                    </div>
                  </div>
                  <div className="saved-article-actions">
                    <button onClick={() => handleEdit(article)}>Edit</button>
                    <button onClick={() => handleDelete(article.id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </HelpProvider>
  );
}

// Component for async preview rendering
function PreviewContent({ content }: { content: string }) {
  const [html, setHtml] = useState<string>('');
  const [error, setError] = useState<string>('');

  useState(() => {
    markdownParser
      .parse(content)
      .then((result) => setHtml(result.html))
      .catch((err) => setError(err.message));
  });

  if (error) {
    return <div className="help-editor-preview-error">{error}</div>;
  }

  return (
    <div
      className="help-editor-preview-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default App;
