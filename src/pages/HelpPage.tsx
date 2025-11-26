/**
import React, { useState, useEffect } from 'react';
import {
  useParams,
  useNavigate,
  useSearchParams,
  Link,
} from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft,
  Search,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Home,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronBreadcrumb,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface HelpMetadata {
  title: string;
  description?: string;
  version?: string;
  lastUpdated?: string;
  order?: number;
  prevDoc?: string;
  nextDoc?: string;
}

interface HelpPageProps {
  portal: 'app' | 'company' | 'admin';
}

export const HelpPage: React.FC<HelpPageProps> = ({ portal }) => {
  const { document } = useParams<{ document: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [content, setContent] = useState<string>('');
  const [metadata, setMetadata] = useState<HelpMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [currentDoc, setCurrentDoc] = useState(document || 'index');
  const [history, setHistory] = useState<Array<{ doc: string; title: string }>>(
    []
  );
  const [searchResults, setSearchResults] = useState<
    Array<{
      doc: string;
      title: string;
      excerpt: string;
    }>
  >([]);

  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) {
      setSearchQuery(urlSearch);
      performSearch(urlSearch);
    } else {
      setSearchResults([]);
      setCurrentDoc(document || 'index');
    }
  }, [searchParams, document]);

  useEffect(() => {
    if (searchResults.length === 0) {
      loadDocument();
      trackPageView();
    }
  }, [currentDoc, portal, searchResults]);

  const handleDocumentNavigation = (docName: string, docTitle?: string) => {
    if (currentDoc !== 'index') {
      setHistory(prev => [
        ...prev,
        { doc: currentDoc, title: metadata?.title || currentDoc },
      ]);
    }
    setCurrentDoc(docName);
    navigate(`/${portal}/help/${docName}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (history.length > 0) {
      const previous = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setCurrentDoc(previous.doc);
      navigate(`/${portal}/help/${previous.doc}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const loadDocument = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/docs/guides/${portal}/${currentDoc}.md`);

      if (!response.ok) {
        throw new Error('Document not found');
      }

      const text = await response.text();

      // Check if the response is HTML instead of markdown (happens when file doesn't exist)
      if (
        text.trim().startsWith('<!DOCTYPE') ||
        text.trim().startsWith('<html')
      ) {
        throw new Error(
          'Document not found - received HTML instead of markdown'
        );
      }

      const { content: markdownContent, metadata: parsedMetadata } =
        parseMarkdownWithMetadata(text);

      setContent(markdownContent);
      setMetadata(parsedMetadata);
    } catch (error) {
      console.error('Failed to load help document:', error);
      setContent(
        '# Document Not Found\n\nThe requested help document could not be found. Please return to the [Help Home](/' +
          portal +
          '/help) to browse available guides.'
      );
      setMetadata({ title: 'Document Not Found' });
      toast.error('Help document not found');
    } finally {
      setLoading(false);
    }
  };

  const parseMarkdownWithMetadata = (
    text: string
  ): { content: string; metadata: HelpMetadata } => {
    // Extract frontmatter (YAML metadata between --- markers)
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = text.match(frontmatterRegex);

    if (!match) {
      return {
        content: text,
        metadata: { title: 'Help Documentation' },
      };
    }

    const [, frontmatter, content] = match;
    const metadata: HelpMetadata = { title: 'Help Documentation' };

    // Parse simple YAML frontmatter
    frontmatter.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      if (key && value) {
        const trimmedKey = key.trim();
        (metadata as any)[trimmedKey] = value;
      }
    });

    return { content, metadata };
  };

  const trackPageView = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('help_page_views').insert({
        user_id: user.id,
        portal,
        document: currentDoc,
      });
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  };

  const handleRating = async (helpful: boolean) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to rate this document');
        return;
      }

      await supabase.from('help_page_ratings').upsert(
        {
          user_id: user.id,
          portal,
          document: currentDoc,
          helpful,
        },
        {
          onConflict: 'user_id,portal,document',
        }
      );

      toast.success(
        helpful
          ? 'Thanks for your feedback!'
          : "Thanks, we'll work on improving this"
      );
    } catch (error) {
      console.error('Failed to submit rating:', error);
      toast.error('Failed to submit rating');
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to submit feedback');
        return;
      }

      await supabase.from('help_page_feedback').insert({
        user_id: user.id,
        portal,
        document: currentDoc,
        feedback: feedbackText,
      });

      toast.success('Feedback submitted successfully');
      setFeedbackText('');
      setShowFeedback(false);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast.error('Failed to submit feedback');
    }
  };

  const stripMarkdown = (text: string): string => {
    return (
      text
        // Remove headers
        .replace(/#{1,6}\s+/g, '')
        // Remove bold/italic
        .replace(/(\*\*|__)(.*?)\1/g, '$2')
        .replace(/(\*|_)(.*?)\1/g, '$2')
        // Remove links
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
        // Remove inline code
        .replace(/`([^`]+)`/g, '$1')
        // Remove list markers
        .replace(/^\s*[-*+]\s+/gm, '')
        .replace(/^\s*\d+\.\s+/gm, '')
        // Remove blockquotes
        .replace(/^\s*>\s+/gm, '')
        // Clean up extra spaces
        .replace(/\s+/g, ' ')
        .trim()
    );
  };

  const performSearch = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    const results: Array<{ doc: string; title: string; excerpt: string }> = [];

    const guides = {
      company: [
        'contract-create',
        'contract-fields',
        'contract-invitations',
        'contract-analytics',
        'divisions-manage',
        'divisions-settings',
        'users-manage',
        'users-roles',
        'requests-create',
        'requests-submissions',
        'requests-analytics',
      ],
      admin: ['getting-started', 'user-management'],
      app: [
        'data-manage',
        'data-categories',
        'security-encryption',
        'security-biometric',
        'data-verification',
        'data-export',
        'sharing-respond',
      ],
    };

    const docsToSearch = guides[portal] || [];
    const searchLower = query.toLowerCase();

    for (const doc of docsToSearch) {
      try {
        const response = await fetch(`/docs/guides/${portal}/${doc}.md`);
        if (response.ok) {
          const text = await response.text();
          const { content: markdownContent, metadata: parsedMetadata } =
            parseMarkdownWithMetadata(text);

          const contentLower = markdownContent.toLowerCase();
          const titleLower = parsedMetadata.title.toLowerCase();

          if (
            contentLower.includes(searchLower) ||
            titleLower.includes(searchLower)
          ) {
            const index = contentLower.indexOf(searchLower);
            const start = Math.max(0, index - 100);
            const end = Math.min(markdownContent.length, index + 200);
            let excerpt = markdownContent.substring(start, end).trim();

            if (start > 0) excerpt = '...' + excerpt;
            if (end < markdownContent.length) excerpt = excerpt + '...';

            // Strip markdown syntax from excerpt
            excerpt = stripMarkdown(excerpt);

            results.push({
              doc,
              title: parsedMetadata.title,
              excerpt:
                excerpt ||
                stripMarkdown(markdownContent.substring(0, 200)) + '...',
            });
          }
        }
      } catch (error) {
        console.error(`Failed to search document ${doc}:`, error);
      }
    }

    setSearchResults(results);
    setLoading(false);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    navigate(`/${portal}/help?search=${encodeURIComponent(searchQuery)}`);
  };

  const generateTableOfContents = () => {
    const headings: { level: number; text: string; id: string }[] = [];
    const lines = content.split('\n');

    lines.forEach(line => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2];
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        headings.push({ level, text, id });
      }
    });

    return headings;
  };

  const toc = generateTableOfContents();

  if (loading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-muted-foreground'>
          Loading help documentation...
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      <header className='sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex flex-col gap-3'>
            <div className='flex items-center justify-between gap-4'>
              <div className='flex items-center gap-2'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => navigate(`/${portal}`)}
                >
                  <ArrowLeft className='h-4 w-4 mr-2' />
                  Back to{' '}
                  {portal === 'app'
                    ? 'App'
                    : portal === 'company'
                      ? 'Company'
                      : 'Admin'}
                </Button>
              </div>
              <div className='flex items-center gap-2 flex-1 max-w-md'>
                <Input
                  placeholder='Search help documentation...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className='flex-1'
                />
                <Button size='sm' onClick={handleSearch}>
                  <Search className='h-4 w-4' />
                </Button>
              </div>
            </div>

            <div className='flex items-center gap-2 text-sm'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  setHistory([]);
                  setCurrentDoc('index');
                  navigate(`/${portal}/help`);
                }}
                className='h-8 px-2'
              >
                <Home className='h-4 w-4 mr-1' />
                Help Home
              </Button>

              {history.length > 0 && (
                <>
                  <ChevronBreadcrumb className='h-4 w-4 text-muted-foreground' />
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleBack}
                    className='h-8 px-2 text-muted-foreground hover:text-foreground'
                  >
                    {history[history.length - 1].title}
                  </Button>
                </>
              )}

              {currentDoc !== 'index' && (
                <>
                  <ChevronBreadcrumb className='h-4 w-4 text-muted-foreground' />
                  <span className='text-foreground font-medium px-2'>
                    {metadata?.title || currentDoc}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className='container mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-8'>
          
          <aside className='hidden lg:block'>
            <div className='sticky top-24'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-sm'>On This Page</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className='h-[calc(100vh-200px)]'>
                    <nav className='space-y-1'>
                      {toc.map((heading, index) => (
                        <a
                          key={index}
                          href={`#${heading.id}`}
                          className='block text-sm text-muted-foreground hover:text-foreground transition-colors'
                          style={{
                            paddingLeft: `${(heading.level - 1) * 12}px`,
                          }}
                        >
                          {heading.text}
                        </a>
                      ))}
                    </nav>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </aside>

          
          <main className='space-y-8'>
            
            {searchResults.length > 0 && (
              <div className='space-y-4'>
                <h1 className='text-4xl font-bold text-foreground'>
                  Search Results for "{searchQuery}"
                </h1>
                <p className='text-muted-foreground'>
                  Found {searchResults.length} result
                  {searchResults.length !== 1 ? 's' : ''}
                </p>

                <div className='space-y-4'>
                  {searchResults.map(result => (
                    <Card
                      key={result.doc}
                      className='cursor-pointer hover:border-primary transition-colors'
                      onClick={() => {
                        setSearchQuery('');
                        navigate(`/${portal}/help/${result.doc}`);
                      }}
                    >
                      <CardHeader>
                        <CardTitle className='text-xl'>
                          {result.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className='text-sm text-muted-foreground'>
                          {result.excerpt}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            
            {metadata && searchResults.length === 0 && (
              <div className='space-y-2'>
                <h1 className='text-4xl font-bold text-foreground'>
                  {metadata.title}
                </h1>
                {metadata.description && (
                  <p className='text-lg text-muted-foreground'>
                    {metadata.description}
                  </p>
                )}
                <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                  {metadata.version && <span>Version: {metadata.version}</span>}
                  {metadata.lastUpdated && (
                    <span>Last updated: {metadata.lastUpdated}</span>
                  )}
                </div>
              </div>
            )}

            
            {searchResults.length === 0 && (
              <Card>
                <CardContent className='prose prose-slate dark:prose-invert max-w-none p-8'>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                    components={{
                      h1: ({ node, children, ...props }) => {
                        const text = String(children);
                        const id = text
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-');
                        return (
                          <h1 id={id} {...props}>
                            {children}
                          </h1>
                        );
                      },
                      h2: ({ node, children, ...props }) => {
                        const text = String(children);
                        const id = text
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-');
                        return (
                          <h2 id={id} {...props}>
                            {children}
                          </h2>
                        );
                      },
                      h3: ({ node, children, ...props }) => {
                        const text = String(children);
                        const id = text
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-');
                        return (
                          <h3 id={id} {...props}>
                            {children}
                          </h3>
                        );
                      },
                      h4: ({ node, children, ...props }) => {
                        const text = String(children);
                        const id = text
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-');
                        return (
                          <h4 id={id} {...props}>
                            {children}
                          </h4>
                        );
                      },
                      h5: ({ node, children, ...props }) => {
                        const text = String(children);
                        const id = text
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-');
                        return (
                          <h5 id={id} {...props}>
                            {children}
                          </h5>
                        );
                      },
                      h6: ({ node, children, ...props }) => {
                        const text = String(children);
                        const id = text
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-');
                        return (
                          <h6 id={id} {...props}>
                            {children}
                          </h6>
                        );
                      },
                      a: ({ node, href, children, ...props }) => {
                        // Check if it's a help document link (relative path)
                        if (
                          href &&
                          !href.startsWith('http') &&
                          !href.startsWith('#') &&
                          !href.startsWith('/')
                        ) {
                          const handleClick = (e: React.MouseEvent) => {
                            e.preventDefault();
                            const docName = href.replace('.md', '');
                            handleDocumentNavigation(docName);
                          };
                          return (
                            <a
                              href={href}
                              onClick={handleClick}
                              className='text-primary hover:underline cursor-pointer'
                            >
                              {children}
                            </a>
                          );
                        }
                        // Check if it's a hash link (anchor within page)
                        if (href && href.startsWith('#')) {
                          return (
                            <a
                              href={href}
                              className='text-primary hover:underline'
                              {...props}
                            >
                              {children}
                            </a>
                          );
                        }
                        // Check if it's an absolute internal link (starts with /)
                        if (href && href.startsWith('/')) {
                          return (
                            <Link
                              to={href}
                              className='text-primary hover:underline'
                            >
                              {children}
                            </Link>
                          );
                        }
                        // External links
                        return (
                          <a
                            href={href}
                            className='text-primary hover:underline'
                            {...props}
                          >
                            {children}
                          </a>
                        );
                      },
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                </CardContent>
              </Card>
            )}

            
            {searchResults.length === 0 &&
              metadata &&
              (metadata.prevDoc || metadata.nextDoc) && (
                <div className='flex justify-between gap-4'>
                  {metadata.prevDoc ? (
                    <Button
                      variant='outline'
                      onClick={() =>
                        navigate(`/${portal}/help/${metadata.prevDoc}`)
                      }
                    >
                      <ChevronLeft className='h-4 w-4 mr-2' />
                      Previous
                    </Button>
                  ) : (
                    <div />
                  )}
                  {metadata.nextDoc && (
                    <Button
                      variant='outline'
                      onClick={() =>
                        navigate(`/${portal}/help/${metadata.nextDoc}`)
                      }
                    >
                      Next
                      <ChevronRight className='h-4 w-4 ml-2' />
                    </Button>
                  )}
                </div>
              )}

            
            {searchResults.length === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Was this helpful?</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-center gap-4'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleRating(true)}
                    >
                      <ThumbsUp className='h-4 w-4 mr-2' />
                      Yes
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleRating(false)}
                    >
                      <ThumbsDown className='h-4 w-4 mr-2' />
                      No
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setShowFeedback(!showFeedback)}
                    >
                      <MessageSquare className='h-4 w-4 mr-2' />
                      Leave Feedback
                    </Button>
                  </div>

                  {showFeedback && (
                    <div className='space-y-2'>
                      <Input
                        placeholder='Tell us how we can improve this documentation...'
                        value={feedbackText}
                        onChange={e => setFeedbackText(e.target.value)}
                      />
                      <Button size='sm' onClick={handleFeedbackSubmit}>
                        Submit Feedback
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
**/
