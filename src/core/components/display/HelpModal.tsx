/**
 * HelpModal Component for the Web Help Component Library
 * @module @privify-pw/web-help/components/display/HelpModal
 * 
 * Headless component for modal display mode.
 */

import { forwardRef, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { HelpModalProps } from '../../types/components';

/**
 * HelpModal is a headless component for displaying help in a modal overlay.
 */
export const HelpModal = forwardRef<HTMLDivElement, HelpModalProps>(function HelpModal(
  {
    open,
    onClose,
    title,
    children,
    closeOnBackdrop = true,
    closeOnEscape = true,
    renderCloseButton,
    className = '',
    ...props
  },
  ref
) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Handle escape key
  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, closeOnEscape, onClose]);

  // Focus management
  useEffect(() => {
    if (open) {
      // Save current focus
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the modal
      setTimeout(() => {
        modalRef.current?.focus();
      }, 0);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = '';

      // Restore previous focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      if (closeOnBackdrop && event.target === event.currentTarget) {
        onClose();
      }
    },
    [closeOnBackdrop, onClose]
  );

  // Handle close button click
  const handleCloseClick = useCallback(() => {
    onClose();
  }, [onClose]);

  // Trap focus within modal
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }, []);

  if (!open) return null;

  const modalContent = (
    <div
      className={`help-modal-backdrop ${className}`.trim()}
      data-component="modal-backdrop"
      onClick={handleBackdropClick}
      aria-hidden="true"
    >
      <div
        ref={(node) => {
          // Handle both refs
          (modalRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className="help-modal"
        data-component="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'help-modal-title' : undefined}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        <header className="help-modal-header">
          {title && (
            <h2 id="help-modal-title" className="help-modal-title">
              {title}
            </h2>
          )}
          {renderCloseButton ? (
            renderCloseButton()
          ) : (
            <button
              type="button"
              className="help-modal-close"
              onClick={handleCloseClick}
              aria-label="Close modal"
            >
              ×
            </button>
          )}
        </header>
        <div className="help-modal-content">{children}</div>
      </div>
    </div>
  );

  // Render to portal
  return createPortal(modalContent, document.body);
});

HelpModal.displayName = 'HelpModal';
