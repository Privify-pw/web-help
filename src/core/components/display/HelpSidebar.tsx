/**
 * HelpSidebar Component for the Web Help Component Library
 * @module @privify-pw/web-help/components/display/HelpSidebar
 * 
 * Headless component for sidebar display mode.
 */

import { forwardRef, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { HelpSidebarProps } from '../../types/components';

/**
 * HelpSidebar is a headless component for displaying help in a sidebar panel.
 */
export const HelpSidebar = forwardRef<HTMLDivElement, HelpSidebarProps>(function HelpSidebar(
  {
    open,
    onClose,
    position = 'right',
    children,
    width = '320px',
    overlay = true,
    className = '',
    ...props
  },
  ref
) {
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Handle escape key
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Focus management
  useEffect(() => {
    if (open) {
      // Save current focus
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the sidebar
      setTimeout(() => {
        sidebarRef.current?.focus();
      }, 0);

      // Prevent body scroll when overlay is shown
      if (overlay) {
        document.body.style.overflow = 'hidden';
      }
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
  }, [open, overlay]);

  // Handle overlay click
  const handleOverlayClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === event.currentTarget) {
        onClose?.();
      }
    },
    [onClose]
  );

  // Handle close
  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  if (!open) return null;

  const widthValue = typeof width === 'number' ? `${width}px` : width;

  const sidebarContent = (
    <div
      className={`help-sidebar-wrapper ${className}`.trim()}
      data-component="sidebar-wrapper"
      data-position={position}
      data-overlay={overlay}
    >
      {/* Overlay */}
      {overlay && (
        <div
          className="help-sidebar-overlay"
          data-component="sidebar-overlay"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <div
        ref={(node) => {
          // Handle both refs
          sidebarRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className="help-sidebar"
        data-component="sidebar"
        data-position={position}
        role="complementary"
        aria-label="Help sidebar"
        tabIndex={-1}
        style={{ width: widthValue }}
        {...props}
      >
        <header className="help-sidebar-header">
          {onClose && (
            <button
              type="button"
              className="help-sidebar-close"
              onClick={handleClose}
              aria-label="Close sidebar"
            >
              ×
            </button>
          )}
        </header>
        <div className="help-sidebar-content">{children}</div>
      </div>
    </div>
  );

  // Render to portal for overlay mode, or inline
  if (overlay) {
    return createPortal(sidebarContent, document.body);
  }

  return sidebarContent;
});

HelpSidebar.displayName = 'HelpSidebar';
