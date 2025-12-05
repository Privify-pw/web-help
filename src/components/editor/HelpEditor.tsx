/**
 * Content Editor Component for the Web Help Component Library
 * @module @piikeep-pw/web-help/components/editor/HelpEditor
 *
 * A headless content editor component that provides markdown editing
 * with live preview, metadata management, and save/publish callbacks.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import type {
  HelpArticle,
  HelpArticleMetadata,
} from '../../core/types/content';

/**
 * Props for the HelpEditor component.
 */
export interface HelpEditorProps {
  /** Initial article to edit (optional for new articles) */
  article?: HelpArticle;
  /** Called when content is saved as draft */
  onSave?: (article: HelpArticle) => void | Promise<void>;
  /** Called when content is published */
  onPublish?: (article: HelpArticle) => void | Promise<void>;
  /** Called when editor is closed/cancelled */
  onCancel?: () => void;
  /** Called when content changes */
  onChange?: (content: string, metadata: HelpArticleMetadata) => void;
  /** Render the preview (required for custom preview rendering) */
  renderPreview?: (content: string) => React.ReactNode;
  /** Labels for internationalization */
  labels?: HelpEditorLabels;
  /** Whether the editor is in read-only mode */
  readOnly?: boolean;
  /** Auto-save interval in milliseconds (0 to disable) */
  autoSaveInterval?: number;
  /** Additional CSS class name */
  className?: string;
  /** Children to render in custom positions */
  children?: React.ReactNode;
}

/**
 * Labels for editor internationalization.
 */
export interface HelpEditorLabels {
  /** Title for editor */
  title?: string;
  /** Content input label */
  contentLabel?: string;
  /** Preview tab label */
  previewLabel?: string;
  /** Edit tab label */
  editLabel?: string;
  /** Save button label */
  saveLabel?: string;
  /** Publish button label */
  publishLabel?: string;
  /** Cancel button label */
  cancelLabel?: string;
  /** Metadata section label */
  metadataLabel?: string;
  /** Auto-saved message */
  autoSavedMessage?: string;
  /** Unsaved changes warning */
  unsavedWarning?: string;
}

/**
 * Default labels for the editor.
 */
const defaultLabels: Required<HelpEditorLabels> = {
  title: 'Edit Article',
  contentLabel: 'Content',
  previewLabel: 'Preview',
  editLabel: 'Edit',
  saveLabel: 'Save Draft',
  publishLabel: 'Publish',
  cancelLabel: 'Cancel',
  metadataLabel: 'Metadata',
  autoSavedMessage: 'Auto-saved',
  unsavedWarning: 'You have unsaved changes. Are you sure you want to leave?',
};

/**
 * Editor state exposed to render props.
 */
export interface HelpEditorState {
  /** Current content */
  content: string;
  /** Current metadata */
  metadata: HelpArticleMetadata;
  /** Current active tab (edit or preview) */
  activeTab: 'edit' | 'preview';
  /** Whether there are unsaved changes */
  isDirty: boolean;
  /** Whether saving is in progress */
  isSaving: boolean;
  /** Last save timestamp */
  lastSaved?: Date;
  /** Any error message */
  error?: string;
}

/**
 * HelpEditor component - A headless markdown editor with live preview.
 */
export const HelpEditor: React.FC<HelpEditorProps> = ({
  article,
  onSave,
  onPublish,
  onCancel,
  onChange,
  renderPreview,
  labels: customLabels,
  readOnly = false,
  autoSaveInterval = 0,
  className,
  children,
}) => {
  const labels = { ...defaultLabels, ...customLabels };

  // State
  const [content, setContent] = useState(article?.content ?? '');
  const [metadata, setMetadata] = useState<HelpArticleMetadata>(
    article?.metadata ?? {},
  );
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | undefined>();
  const [error, setError] = useState<string | undefined>();

  // Refs
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  // Build article from current state
  const buildArticle = useCallback((): HelpArticle => {
    return {
      id: article?.id ?? generateId(),
      title: article?.title ?? extractTitle(content),
      description: article?.description,
      content,
      metadata,
    };
  }, [article, content, metadata]);

  // Handle content change
  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      setContent(newContent);
      setIsDirty(true);
      setError(undefined);
      onChange?.(newContent, metadata);
    },
    [metadata, onChange],
  );

  // Handle metadata change
  const handleMetadataChange = useCallback(
    (newMetadata: HelpArticleMetadata) => {
      setMetadata(newMetadata);
      setIsDirty(true);
      setError(undefined);
      onChange?.(content, newMetadata);
    },
    [content, onChange],
  );

  // Handle save
  const handleSave = useCallback(async () => {
    if (readOnly || isSaving) return;

    setIsSaving(true);
    setError(undefined);

    try {
      const articleToSave = buildArticle();
      await onSave?.(articleToSave);
      setIsDirty(false);
      setLastSaved(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  }, [readOnly, isSaving, buildArticle, onSave]);

  // Handle publish
  const handlePublish = useCallback(async () => {
    if (readOnly || isSaving) return;

    setIsSaving(true);
    setError(undefined);

    try {
      const articleToPublish = {
        ...buildArticle(),
        metadata: { ...metadata, published: true },
      };
      await onPublish?.(articleToPublish);
      setIsDirty(false);
      setLastSaved(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish');
    } finally {
      setIsSaving(false);
    }
  }, [readOnly, isSaving, buildArticle, metadata, onPublish]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (isDirty && !window.confirm(labels.unsavedWarning)) {
      return;
    }
    onCancel?.();
  }, [isDirty, labels.unsavedWarning, onCancel]);

  // Auto-save effect
  useEffect(() => {
    if (autoSaveInterval > 0 && isDirty && !readOnly) {
      autoSaveTimerRef.current = setTimeout(() => {
        handleSave();
      }, autoSaveInterval);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [autoSaveInterval, isDirty, readOnly, handleSave]);

  // Warn about unsaved changes on unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Editor state for render props
  const editorState: HelpEditorState = {
    content,
    metadata,
    activeTab,
    isDirty,
    isSaving,
    lastSaved,
    error,
  };

  return (
    <div
      className={`help-editor ${className ?? ''}`}
      data-dirty={isDirty}
      data-saving={isSaving}
      data-readonly={readOnly}
    >
      {/* Header */}
      <div className='help-editor-header'>
        <h2 className='help-editor-title'>{labels.title}</h2>

        {/* Status indicators */}
        <div className='help-editor-status'>
          {isDirty && <span className='help-editor-dirty-indicator'>●</span>}
          {lastSaved && (
            <span className='help-editor-saved-time'>
              {labels.autoSavedMessage} {formatTime(lastSaved)}
            </span>
          )}
          {error && <span className='help-editor-error'>{error}</span>}
        </div>
      </div>

      {/* Tabs */}
      <div className='help-editor-tabs' role='tablist'>
        <button
          className={`help-editor-tab ${
            activeTab === 'edit' ? 'help-editor-tab-active' : ''
          }`}
          role='tab'
          aria-selected={activeTab === 'edit'}
          onClick={() => setActiveTab('edit')}
          disabled={readOnly}
        >
          {labels.editLabel}
        </button>
        <button
          className={`help-editor-tab ${
            activeTab === 'preview' ? 'help-editor-tab-active' : ''
          }`}
          role='tab'
          aria-selected={activeTab === 'preview'}
          onClick={() => setActiveTab('preview')}
        >
          {labels.previewLabel}
        </button>
      </div>

      {/* Content area */}
      <div className='help-editor-content' role='tabpanel'>
        {activeTab === 'edit' ? (
          <div className='help-editor-edit-panel'>
            <label htmlFor='help-editor-textarea' className='help-editor-label'>
              {labels.contentLabel}
            </label>
            <textarea
              id='help-editor-textarea'
              ref={contentRef}
              className='help-editor-textarea'
              value={content}
              onChange={handleContentChange}
              disabled={readOnly}
              placeholder='Enter markdown content...'
              aria-label={labels.contentLabel}
            />
          </div>
        ) : (
          <div className='help-editor-preview-panel'>
            {renderPreview ? (
              renderPreview(content)
            ) : (
              <div
                className='help-editor-preview-content'
                dangerouslySetInnerHTML={{
                  __html: simpleMarkdownToHtml(content),
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Metadata section - placeholder for MetadataEditor integration */}
      <div className='help-editor-metadata'>
        <h3 className='help-editor-metadata-title'>{labels.metadataLabel}</h3>
        <HelpMetadataEditor
          metadata={metadata}
          onChange={handleMetadataChange}
          readOnly={readOnly}
        />
      </div>

      {/* Actions */}
      <div className='help-editor-actions'>
        {onCancel && (
          <button
            type='button'
            className='help-editor-button help-editor-button-cancel'
            onClick={handleCancel}
          >
            {labels.cancelLabel}
          </button>
        )}
        {onSave && (
          <button
            type='button'
            className='help-editor-button help-editor-button-save'
            onClick={handleSave}
            disabled={readOnly || isSaving || !isDirty}
          >
            {isSaving ? '...' : labels.saveLabel}
          </button>
        )}
        {onPublish && (
          <button
            type='button'
            className='help-editor-button help-editor-button-publish'
            onClick={handlePublish}
            disabled={readOnly || isSaving}
          >
            {labels.publishLabel}
          </button>
        )}
      </div>

      {/* Render children with state context */}
      {typeof children === 'function'
        ? (children as (state: HelpEditorState) => React.ReactNode)(editorState)
        : children}
    </div>
  );
};

/**
 * Props for metadata editor.
 */
interface HelpMetadataEditorInternalProps {
  metadata: HelpArticleMetadata;
  onChange: (metadata: HelpArticleMetadata) => void;
  readOnly?: boolean;
}

/**
 * Internal metadata editor component.
 */
const HelpMetadataEditor: React.FC<HelpMetadataEditorInternalProps> = ({
  metadata,
  onChange,
  readOnly,
}) => {
  const handleFieldChange = (
    field: keyof HelpArticleMetadata,
    value: unknown,
  ) => {
    onChange({ ...metadata, [field]: value });
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    handleFieldChange('tags', tags);
  };

  return (
    <div className='help-metadata-editor'>
      <div className='help-metadata-field'>
        <label htmlFor='metadata-category' className='help-metadata-label'>
          Category
        </label>
        <input
          id='metadata-category'
          type='text'
          className='help-metadata-input'
          value={metadata.category ?? ''}
          onChange={(e) => handleFieldChange('category', e.target.value)}
          disabled={readOnly}
        />
      </div>

      <div className='help-metadata-field'>
        <label htmlFor='metadata-tags' className='help-metadata-label'>
          Tags (comma-separated)
        </label>
        <input
          id='metadata-tags'
          type='text'
          className='help-metadata-input'
          value={metadata.tags?.join(', ') ?? ''}
          onChange={handleTagsChange}
          disabled={readOnly}
        />
      </div>

      <div className='help-metadata-field'>
        <label htmlFor='metadata-author' className='help-metadata-label'>
          Author
        </label>
        <input
          id='metadata-author'
          type='text'
          className='help-metadata-input'
          value={metadata.author ?? ''}
          onChange={(e) => handleFieldChange('author', e.target.value)}
          disabled={readOnly}
        />
      </div>

      <div className='help-metadata-field'>
        <label htmlFor='metadata-order' className='help-metadata-label'>
          Order
        </label>
        <input
          id='metadata-order'
          type='number'
          className='help-metadata-input'
          value={metadata.order ?? ''}
          onChange={(e) =>
            handleFieldChange(
              'order',
              e.target.value ? parseInt(e.target.value, 10) : undefined,
            )
          }
          disabled={readOnly}
        />
      </div>

      <div className='help-metadata-field help-metadata-field-checkbox'>
        <label htmlFor='metadata-published' className='help-metadata-label'>
          <input
            id='metadata-published'
            type='checkbox'
            className='help-metadata-checkbox'
            checked={metadata.published ?? true}
            onChange={(e) => handleFieldChange('published', e.target.checked)}
            disabled={readOnly}
          />
          Published
        </label>
      </div>
    </div>
  );
};

/**
 * Generate a simple ID.
 */
function generateId(): string {
  return `article-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Extract title from markdown content.
 */
function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1] : 'Untitled';
}

/**
 * Format time for display.
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString();
}

/**
 * Simple markdown to HTML conversion for preview.
 * This is a minimal fallback - developers should provide renderPreview for full support.
 */
function simpleMarkdownToHtml(markdown: string): string {
  return (
    markdown
      // Headings
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Code
      .replace(/`(.+?)`/g, '<code>$1</code>')
      // Links
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
      // Paragraphs
      .replace(/\n\n/g, '</p><p>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>')
  );
}

export default HelpEditor;
