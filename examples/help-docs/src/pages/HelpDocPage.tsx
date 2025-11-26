import React, { useState } from 'react';
import { parseMarkdown } from '@privify-pw/web-help/src/services/parse-markdown';
import type { HelpMetadata } from '@privify-pw/web-help/src/types/help-metadata';

const HelpDocPage: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [metadata, setMetadata] = useState<HelpMetadata | null>(null);

  const loadDocument = async () => {
    try {
      const response = await fetch(`/public/getting-started.md`);

      if (!response.ok) {
        throw new Error('Document not found');
      }

      const text = await response.text();
      // console.log('Fetched document text:', text);

      // Check if the response is HTML instead of markdown (happens when file doesn't exist)
      if (
        text.trim().startsWith('<!DOCTYPE') ||
        text.trim().startsWith('<html')
      ) {
        throw new Error(
          'Document not found - received HTML instead of markdown',
        );
      }

      const { content: markdownContent, metadata: parsedMetadata } =
        parseMarkdown(text);

      setContent(markdownContent);
      setMetadata(parsedMetadata);
      console.log('Loaded document content:', content);
      console.log('Loaded document metadata:', metadata);
    } catch (error) {
      console.error('Failed to load help document:', error);
      setContent(
        '# Document Not Found\n\nThe requested help document could not be found. Please return to the [Help Home](/help) to browse available guides.',
      );
      setMetadata({ title: 'Document Not Found' });
    }
  };

  React.useEffect(() => {
    loadDocument();
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        fontFamily: 'sans-serif',
      }}
    >
      <header
        style={{
          padding: '1rem',
          background: '#f5f5f5',
          borderBottom: '1px solid #ddd',
        }}
      >
        <h1>Help Documentation</h1>
      </header>
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
          padding: '2rem',
        }}
      >
        <nav
          style={{
            width: '200px',
            marginRight: '2rem',
            background: '#fafafa',
            borderRight: '1px solid #eee',
            padding: '1rem',
          }}
        >
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>
              <a href='#intro'>Introduction</a>
            </li>
            <li>
              <a href='#usage'>Usage</a>
            </li>
            <li>
              <a href='#faq'>FAQ</a>
            </li>
          </ul>
        </nav>
        <section
          style={{
            flex: 1,
            background: '#fff',
            padding: '1rem',
            borderRadius: '4px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <h2 id='intro'>
            {metadata && (
              <div style={{ marginTop: '2rem', fontStyle: 'italic' }}>
                <strong>{metadata.title}</strong>
              </div>
            )}
          </h2>
          {metadata && metadata.description ? (
            <p>{metadata.description}</p>
          ) : (
            <p>No description available.</p>
          )}

          {metadata && metadata.version ? (
            <p style={{ fontStyle: 'italic', fontSize: '0.9em' }} id='faq'>
              Version: {metadata.version}
            </p>
          ) : (
            <p>No version information available.</p>
          )}
        </section>
      </main>
      <footer
        style={{
          padding: '1rem',
          background: '#f5f5f5',
          borderTop: '1px solid #ddd',
          textAlign: 'center',
        }}
      >
        &copy; {new Date().getFullYear()} HelpDocs Inc.
      </footer>
    </div>
  );
};

export default HelpDocPage;
