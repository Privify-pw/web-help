import { useState, useEffect, useMemo } from 'react';
import {
  HelpProvider,
  createMarkdownParser,
  createJsonParser,
  createCsvParser,
  createMdxParser,
  createFormatDetector,
  type ContentParser,
  type ParseResult,
  type FormatDetectionResult,
  type CsvParserOptions,
} from '@privify-pw/web-help';

// Sample content in different formats
const sampleContent = {
  markdown: `---
title: Markdown Content Example
category: Documentation
tags:
  - markdown
  - example
author: Help Team
---

# Markdown Content Example

This is an example of **Markdown** content with frontmatter metadata.

## Features

- Rich text formatting
- Code blocks with syntax highlighting
- Lists and tables
- Links and images

### Code Example

\`\`\`typescript
import { HelpProvider } from '@privify-pw/web-help';

function App() {
  return (
    <HelpProvider>
      <YourApp />
    </HelpProvider>
  );
}
\`\`\`

> **Note**: Markdown is great for documentation because it's easy to read and write.

## Table Example

| Feature | Supported |
|---------|-----------|
| Headings | ✅ |
| Lists | ✅ |
| Code | ✅ |
| Tables | ✅ |
`,

  json: `{
  "title": "JSON Content Example",
  "description": "Help content defined in JSON format",
  "content": [
    {
      "type": "heading",
      "content": "JSON Content Example",
      "level": 1
    },
    {
      "type": "paragraph",
      "content": "This example demonstrates how help content can be defined using JSON format with structured content blocks."
    },
    {
      "type": "heading",
      "content": "Features",
      "level": 2
    },
    {
      "type": "list",
      "items": [
        "Structured content blocks",
        "Type-safe content definition",
        "Easy to generate programmatically",
        "Great for API-driven content"
      ]
    },
    {
      "type": "heading",
      "content": "Code Example",
      "level": 2
    },
    {
      "type": "code",
      "content": "const jsonContent = {\\n  title: 'My Article',\\n  content: [...]\\n};",
      "language": "typescript"
    },
    {
      "type": "callout",
      "content": "JSON content is perfect for dynamic content generation!",
      "calloutType": "tip"
    },
    {
      "type": "heading",
      "content": "Block Types",
      "level": 2
    },
    {
      "type": "paragraph",
      "content": "Supported block types include: heading, paragraph, code, image, list, blockquote, callout, and html."
    }
  ],
  "metadata": {
    "category": "API",
    "tags": ["json", "api", "structured"],
    "author": "Content Team"
  }
}`,

  csv: `Title,Description,Category,Status,Priority
Getting Started,Introduction to the platform,Basics,Published,High
Installation Guide,How to install the software,Setup,Published,High
Configuration,Configuring your environment,Setup,Draft,Medium
API Reference,Complete API documentation,Development,Published,High
Troubleshooting,Common issues and solutions,Support,Published,Medium
Best Practices,Recommended patterns,Development,Draft,Low
Security Guide,Security considerations,Security,Published,High
Migration Guide,Upgrading from v1 to v2,Upgrade,Published,Medium`,

  mdx: `---
title: MDX Content Example
category: Advanced
tags:
  - mdx
  - react
  - components
author: Advanced Team
---

import { useState } from 'react';
import { HelpCallout, HelpTabs } from '@privify-pw/web-help';

# MDX Content Example

This example shows **MDX** content with embedded React components.

## Interactive Components

MDX allows you to use React components directly in your markdown:

<HelpCallout type="info" title="What is MDX?">
  MDX is a format that lets you seamlessly write JSX in your Markdown documents.
</HelpCallout>

## Tabs Example

<HelpTabs items={[
  { id: 'npm', label: 'npm', content: 'npm install @privify-pw/web-help' },
  { id: 'yarn', label: 'yarn', content: 'yarn add @privify-pw/web-help' },
  { id: 'pnpm', label: 'pnpm', content: 'pnpm add @privify-pw/web-help' }
]} />

## Benefits of MDX

1. **Interactive documentation** - Add live examples
2. **Component reuse** - Use your design system components
3. **Type safety** - Full TypeScript support

<HelpCallout type="tip" title="Pro Tip">
  You can import and use any React component in your MDX files!
</HelpCallout>

### Code Example

\`\`\`tsx
// MDX allows component usage
<HelpCallout type="warning">
  This is a warning callout!
</HelpCallout>
\`\`\`

The parser extracts components and can render them as placeholders or with custom component mappings.
`,
};

type ContentFormat = 'markdown' | 'json' | 'csv' | 'mdx';

function App() {
  const [selectedFormat, setSelectedFormat] = useState<ContentFormat>('markdown');
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [detectionResults, setDetectionResults] = useState<FormatDetectionResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csvRenderAsTable, setCsvRenderAsTable] = useState(true);

  // Create parsers using the pluggable parser architecture
  const parsers = useMemo(() => {
    return {
      markdown: createMarkdownParser(),
      json: createJsonParser(),
      csv: createCsvParser(),
      mdx: createMdxParser(),
    };
  }, []);

  // Create format detector with all parsers
  const formatDetector = useMemo(() => {
    return createFormatDetector([
      parsers.markdown,
      parsers.json,
      parsers.csv,
      parsers.mdx,
    ]);
  }, [parsers]);

  // Parse content whenever format changes
  useEffect(() => {
    const parseContent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const content = sampleContent[selectedFormat];
        const parser = parsers[selectedFormat];

        // Run format detection
        const detected = formatDetector.detectAllFormats(content);
        setDetectionResults(detected);

        // Parse the content with appropriate options
        let options: CsvParserOptions | undefined;
        if (selectedFormat === 'csv') {
          options = {
            renderAsTable: csvRenderAsTable,
            hasHeader: true,
          };
        }

        const result = await parser.parse(content, options);
        setParseResult(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Parse error');
        setParseResult(null);
      } finally {
        setIsLoading(false);
      }
    };

    parseContent();
  }, [selectedFormat, parsers, formatDetector, csvRenderAsTable]);

  const currentContent = sampleContent[selectedFormat];

  return (
    <HelpProvider>
      <div className="app">
        <header className="app-header">
          <h1>📄 Multi-Format Content Example</h1>
          <p>
            Demonstrating MDX, JSON, CSV parsers, ContentFormatDetector, and pluggable parser architecture
          </p>
        </header>

        {/* Format Selector */}
        <div className="format-selector">
          {(Object.keys(sampleContent) as ContentFormat[]).map((format) => (
            <button
              key={format}
              className={`format-button ${selectedFormat === format ? 'active' : ''}`}
              onClick={() => setSelectedFormat(format)}
            >
              {format.toUpperCase()}
            </button>
          ))}
        </div>

        {/* CSV Rendering Options */}
        {selectedFormat === 'csv' && (
          <div className="rendering-options">
            <label className="rendering-option">
              <input
                type="radio"
                name="csvRender"
                checked={csvRenderAsTable}
                onChange={() => setCsvRenderAsTable(true)}
              />
              Render as Table
            </label>
            <label className="rendering-option">
              <input
                type="radio"
                name="csvRender"
                checked={!csvRenderAsTable}
                onChange={() => setCsvRenderAsTable(false)}
              />
              Render as List
            </label>
          </div>
        )}

        {/* Format Detection Results */}
        <div className="detection-panel">
          <h2>🔍 Auto-detected Formats (ContentFormatDetector)</h2>
          <div className="detection-results">
            {detectionResults.map((result, index) => (
              <div key={index} className="detection-result">
                <span className="detection-format">{result.format.toUpperCase()}</span>
                <span
                  className={`detection-confidence ${
                    result.confidence >= 0.8 ? 'high' : result.confidence >= 0.5 ? 'medium' : 'low'
                  }`}
                >
                  {(result.confidence * 100).toFixed(0)}% confidence
                </span>
                {result.parserName && (
                  <span className="detection-parser">({result.parserName} parser)</span>
                )}
              </div>
            ))}
            {detectionResults.length === 0 && (
              <span>No formats detected</span>
            )}
          </div>
        </div>

        {/* Content Display */}
        <div className="content-panel">
          {/* Source Panel */}
          <div className="panel">
            <div className="panel-header">
              📝 Source ({selectedFormat.toUpperCase()})
            </div>
            <div className="panel-content">
              <pre className="source-code">{currentContent}</pre>
            </div>
          </div>

          {/* Rendered Panel */}
          <div className="panel">
            <div className="panel-header">
              👁️ Rendered Output
            </div>
            <div className="panel-content">
              {isLoading && <div className="loading">Parsing content...</div>}
              {error && <div className="error">Error: {error}</div>}
              {!isLoading && !error && parseResult && (
                <div
                  className="rendered-content"
                  dangerouslySetInnerHTML={{ __html: parseResult.html }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Metadata Section */}
        {parseResult?.metadata && Object.keys(parseResult.metadata).length > 0 && (
          <div className="metadata-section">
            <h2>📋 Parsed Metadata</h2>
            <div className="metadata-grid">
              {Object.entries(parseResult.metadata).map(([key, value]) => {
                if (value === undefined || value === null) return null;
                return (
                  <div key={key} className="metadata-item">
                    <div className="metadata-label">{key}</div>
                    <div className="metadata-value">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TOC Section */}
        {parseResult?.toc && parseResult.toc.length > 0 && (
          <div className="metadata-section">
            <h2>📑 Table of Contents</h2>
            <TocTree entries={parseResult.toc} />
          </div>
        )}

        {/* Parser Info */}
        <div className="metadata-section">
          <h2>⚙️ Pluggable Parser Architecture</h2>
          <p>
            This example demonstrates the pluggable parser architecture. Each parser implements
            the <code>ContentParser</code> interface:
          </p>
          <pre className="source-code">{`interface ContentParser {
  name: string;
  extensions: string[];
  canParse(content: string, filename?: string): boolean;
  parse(content: string, options?: ParserOptions): Promise<ParseResult>;
}`}</pre>
          <p>
            Available parsers: <strong>Markdown</strong>, <strong>JSON</strong>, <strong>CSV</strong>, <strong>MDX</strong>
          </p>
          <p>
            The <code>ContentFormatDetector</code> can automatically detect content format
            based on file extension or content analysis, and return the appropriate parser.
          </p>
        </div>
      </div>
    </HelpProvider>
  );
}

// TOC Tree Component
function TocTree({ entries, level = 0 }: { entries: { id: string; text: string; level: number; children?: typeof entries }[]; level?: number }) {
  return (
    <ul style={{ paddingLeft: level > 0 ? '1.5rem' : '0', listStyle: level > 0 ? 'circle' : 'disc' }}>
      {entries.map((entry) => (
        <li key={entry.id}>
          <a href={`#${entry.id}`}>{entry.text}</a>
          {entry.children && entry.children.length > 0 && (
            <TocTree entries={entry.children} level={level + 1} />
          )}
        </li>
      ))}
    </ul>
  );
}

export default App;
