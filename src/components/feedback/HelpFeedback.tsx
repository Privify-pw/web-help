/**
 * HelpFeedback Component for the Web Help Component Library
 * @module @privify-pw/web-help/components/feedback/HelpFeedback
 * 
 * Headless component for "Was this helpful?" feedback.
 */

import { forwardRef, useState, useCallback } from 'react';
import type { BaseComponentProps } from '../../core/types/components';

/**
 * Feedback value.
 */
export type FeedbackValue = 'yes' | 'no' | null;

/**
 * Props for HelpFeedback component.
 */
export interface HelpFeedbackProps extends BaseComponentProps {
  /** Article ID for the feedback */
  articleId: string;
  /** Called when feedback is submitted */
  onFeedback?: (articleId: string, helpful: boolean, comment?: string) => void;
  /** Question text */
  question?: string;
  /** Yes button text */
  yesText?: string;
  /** No button text */
  noText?: string;
  /** Show comment input after feedback */
  showCommentInput?: boolean;
  /** Comment placeholder */
  commentPlaceholder?: string;
  /** Submit button text */
  submitText?: string;
  /** Thank you message */
  thankYouMessage?: string;
  /** Current feedback state */
  value?: FeedbackValue;
  /** Render custom buttons */
  renderButtons?: (
    onYes: () => void,
    onNo: () => void,
    value: FeedbackValue
  ) => React.ReactNode;
}

/**
 * HelpFeedback is a headless component for "Was this helpful?" feedback.
 */
export const HelpFeedback = forwardRef<HTMLDivElement, HelpFeedbackProps>(function HelpFeedback(
  {
    articleId,
    onFeedback,
    question = 'Was this article helpful?',
    yesText = 'Yes',
    noText = 'No',
    showCommentInput = true,
    commentPlaceholder = 'Tell us more (optional)',
    submitText = 'Submit',
    thankYouMessage = 'Thank you for your feedback!',
    value: controlledValue,
    renderButtons,
    className = '',
    ...props
  },
  ref
) {
  const [internalValue, setInternalValue] = useState<FeedbackValue>(null);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const value = controlledValue ?? internalValue;
  const isControlled = controlledValue !== undefined;

  const handleYes = useCallback(() => {
    if (!isControlled) {
      setInternalValue('yes');
    }
    if (!showCommentInput) {
      onFeedback?.(articleId, true);
      setIsSubmitted(true);
    }
  }, [isControlled, showCommentInput, onFeedback, articleId]);

  const handleNo = useCallback(() => {
    if (!isControlled) {
      setInternalValue('no');
    }
    if (!showCommentInput) {
      onFeedback?.(articleId, false);
      setIsSubmitted(true);
    }
  }, [isControlled, showCommentInput, onFeedback, articleId]);

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (value) {
        onFeedback?.(articleId, value === 'yes', comment || undefined);
        setIsSubmitted(true);
      }
    },
    [value, articleId, comment, onFeedback]
  );

  // Show thank you message after submission
  if (isSubmitted) {
    return (
      <div
        ref={ref}
        className={`help-feedback help-feedback-submitted ${className}`.trim()}
        data-component="feedback"
        data-submitted="true"
        {...props}
      >
        <p className="help-feedback-thanks">{thankYouMessage}</p>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`help-feedback ${className}`.trim()}
      data-component="feedback"
      data-value={value}
      {...props}
    >
      <p className="help-feedback-question">{question}</p>

      {renderButtons ? (
        renderButtons(handleYes, handleNo, value)
      ) : (
        <div className="help-feedback-buttons" role="group" aria-label="Feedback options">
          <button
            type="button"
            className="help-feedback-button help-feedback-yes"
            onClick={handleYes}
            aria-pressed={value === 'yes'}
            data-selected={value === 'yes'}
          >
            <span className="help-feedback-icon" aria-hidden="true">👍</span>
            <span className="help-feedback-text">{yesText}</span>
          </button>
          <button
            type="button"
            className="help-feedback-button help-feedback-no"
            onClick={handleNo}
            aria-pressed={value === 'no'}
            data-selected={value === 'no'}
          >
            <span className="help-feedback-icon" aria-hidden="true">👎</span>
            <span className="help-feedback-text">{noText}</span>
          </button>
        </div>
      )}

      {/* Comment form */}
      {showCommentInput && value && (
        <form className="help-feedback-form" onSubmit={handleSubmit}>
          <textarea
            className="help-feedback-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={commentPlaceholder}
            rows={3}
            aria-label="Additional feedback"
          />
          <button type="submit" className="help-feedback-submit">
            {submitText}
          </button>
        </form>
      )}
    </div>
  );
});

HelpFeedback.displayName = 'HelpFeedback';
