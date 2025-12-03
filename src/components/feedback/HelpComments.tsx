/**
 * HelpComments Component for the Web Help Component Library
 * @module @privify-pw/web-help/components/feedback/HelpComments
 * 
 * Headless component for displaying and submitting comments.
 */

import { forwardRef, useState, useCallback } from 'react';
import type { BaseComponentProps } from '../../core/types/components';

/**
 * Comment item.
 */
export interface CommentItem {
  /** Unique comment ID */
  id: string;
  /** Comment author name */
  author: string;
  /** Comment content */
  content: string;
  /** Timestamp */
  timestamp: string;
  /** Author avatar URL */
  avatar?: string;
}

/**
 * Props for HelpComments component.
 */
export interface HelpCommentsProps extends BaseComponentProps {
  /** Article ID */
  articleId: string;
  /** Existing comments */
  comments?: CommentItem[];
  /** Called when a comment is submitted */
  onComment?: (articleId: string, comment: string) => void;
  /** Whether to show the comment form */
  showForm?: boolean;
  /** Comment input placeholder */
  placeholder?: string;
  /** Submit button text */
  submitText?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Title for the comments section */
  title?: string;
  /** Whether comments are loading */
  isLoading?: boolean;
  /** Render custom comment */
  renderComment?: (comment: CommentItem) => React.ReactNode;
}

/**
 * Format relative time.
 */
function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

/**
 * HelpComments is a headless component for comments.
 */
export const HelpComments = forwardRef<HTMLDivElement, HelpCommentsProps>(function HelpComments(
  {
    articleId,
    comments = [],
    onComment,
    showForm = true,
    placeholder = 'Add a comment...',
    submitText = 'Submit',
    emptyMessage = 'No comments yet. Be the first to comment!',
    title = 'Comments',
    isLoading = false,
    renderComment,
    className = '',
    ...props
  },
  ref
) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!newComment.trim()) return;

      setIsSubmitting(true);
      try {
        await onComment?.(articleId, newComment.trim());
        setNewComment('');
      } finally {
        setIsSubmitting(false);
      }
    },
    [articleId, newComment, onComment]
  );

  const defaultRenderComment = (comment: CommentItem): React.ReactNode => (
    <div className="help-comment" data-id={comment.id}>
      <div className="help-comment-header">
        {comment.avatar && (
          <img
            src={comment.avatar}
            alt={`${comment.author}'s avatar`}
            className="help-comment-avatar"
          />
        )}
        <span className="help-comment-author">{comment.author}</span>
        <time className="help-comment-time" dateTime={comment.timestamp}>
          {formatRelativeTime(comment.timestamp)}
        </time>
      </div>
      <div className="help-comment-content">{comment.content}</div>
    </div>
  );

  return (
    <div
      ref={ref}
      className={`help-comments ${className}`.trim()}
      data-component="comments"
      data-loading={isLoading}
      {...props}
    >
      {/* Title */}
      {title && (
        <h3 className="help-comments-title">
          {title}
          {comments.length > 0 && (
            <span className="help-comments-count">({comments.length})</span>
          )}
        </h3>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="help-comments-loading" aria-live="polite">
          Loading comments...
        </div>
      )}

      {/* Comment list */}
      {!isLoading && (
        <div className="help-comments-list">
          {comments.length === 0 ? (
            <p className="help-comments-empty">{emptyMessage}</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id}>
                {renderComment ? renderComment(comment) : defaultRenderComment(comment)}
              </div>
            ))
          )}
        </div>
      )}

      {/* Comment form */}
      {showForm && (
        <form className="help-comments-form" onSubmit={handleSubmit}>
          <textarea
            className="help-comments-input"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={placeholder}
            rows={3}
            aria-label="New comment"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className="help-comments-submit"
            disabled={isSubmitting || !newComment.trim()}
          >
            {isSubmitting ? 'Submitting...' : submitText}
          </button>
        </form>
      )}
    </div>
  );
});

HelpComments.displayName = 'HelpComments';
