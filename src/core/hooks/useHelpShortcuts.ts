/**
 * useHelpShortcuts Hook for the Web Help Component Library
 * @module @privify-pw/web-help/hooks/useHelpShortcuts
 */

import { useEffect, useCallback, useRef } from 'react';

/**
 * Keyboard shortcut configuration.
 */
export interface ShortcutConfig {
  /** Key to bind (e.g., 'k', 'Escape', 'ArrowLeft') */
  key: string;
  /** Require Ctrl/Cmd key */
  ctrlOrCmd?: boolean;
  /** Require Shift key */
  shift?: boolean;
  /** Require Alt key */
  alt?: boolean;
  /** Callback when shortcut is triggered */
  handler: (event: KeyboardEvent) => void;
  /** Description for accessibility */
  description?: string;
  /** Whether the shortcut is enabled */
  enabled?: boolean;
}

/**
 * Options for useHelpShortcuts hook.
 */
export interface UseHelpShortcutsOptions {
  /** Shortcuts configuration */
  shortcuts: ShortcutConfig[];
  /** Whether shortcuts are globally enabled */
  enabled?: boolean;
  /** Element to attach listeners to (defaults to document) */
  target?: HTMLElement | Document | null;
}

/**
 * Return type for useHelpShortcuts hook.
 */
export interface UseHelpShortcutsReturn {
  /** List of registered shortcuts */
  shortcuts: ShortcutConfig[];
  /** Enable a specific shortcut */
  enableShortcut: (key: string) => void;
  /** Disable a specific shortcut */
  disableShortcut: (key: string) => void;
  /** Check if a shortcut is enabled */
  isEnabled: (key: string) => boolean;
}

/**
 * Check if the current platform is Mac.
 */
function isMac(): boolean {
  return typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);
}

/**
 * Check if a keyboard event matches a shortcut config.
 */
function matchesShortcut(event: KeyboardEvent, config: ShortcutConfig): boolean {
  // Check key
  if (event.key.toLowerCase() !== config.key.toLowerCase()) {
    return false;
  }

  // Check modifiers
  const ctrlOrCmd = isMac() ? event.metaKey : event.ctrlKey;
  if (config.ctrlOrCmd && !ctrlOrCmd) return false;
  if (!config.ctrlOrCmd && ctrlOrCmd) return false;

  if (config.shift && !event.shiftKey) return false;
  if (!config.shift && event.shiftKey) return false;

  if (config.alt && !event.altKey) return false;
  if (!config.alt && event.altKey) return false;

  return true;
}

/**
 * Hook for keyboard shortcuts.
 */
export function useHelpShortcuts(options: UseHelpShortcutsOptions): UseHelpShortcutsReturn {
  const { shortcuts, enabled = true, target } = options;
  const shortcutsRef = useRef<Map<string, ShortcutConfig>>(new Map());

  // Initialize shortcuts map
  useEffect(() => {
    shortcutsRef.current.clear();
    for (const shortcut of shortcuts) {
      shortcutsRef.current.set(shortcut.key.toLowerCase(), shortcut);
    }
  }, [shortcuts]);

  // Handle keyboard events
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        // Allow Escape key even in inputs
        if (event.key !== 'Escape') return;
      }

      for (const shortcut of shortcutsRef.current.values()) {
        if (shortcut.enabled !== false && matchesShortcut(event, shortcut)) {
          event.preventDefault();
          shortcut.handler(event);
          return;
        }
      }
    };

    const eventTarget = target ?? document;
    eventTarget.addEventListener('keydown', handleKeyDown as EventListener);

    return () => {
      eventTarget.removeEventListener('keydown', handleKeyDown as EventListener);
    };
  }, [enabled, target]);

  const enableShortcut = useCallback((key: string) => {
    const shortcut = shortcutsRef.current.get(key.toLowerCase());
    if (shortcut) {
      shortcut.enabled = true;
    }
  }, []);

  const disableShortcut = useCallback((key: string) => {
    const shortcut = shortcutsRef.current.get(key.toLowerCase());
    if (shortcut) {
      shortcut.enabled = false;
    }
  }, []);

  const isEnabled = useCallback((key: string): boolean => {
    const shortcut = shortcutsRef.current.get(key.toLowerCase());
    return shortcut?.enabled !== false;
  }, []);

  return {
    shortcuts,
    enableShortcut,
    disableShortcut,
    isEnabled,
  };
}

/**
 * Preset shortcut configurations.
 */
export const presetShortcuts = {
  /**
   * Create a "Cmd/Ctrl + K" shortcut for search.
   */
  searchShortcut: (handler: () => void): ShortcutConfig => ({
    key: 'k',
    ctrlOrCmd: true,
    handler: () => handler(),
    description: 'Open search',
  }),

  /**
   * Create an Escape shortcut for closing.
   */
  escapeShortcut: (handler: () => void): ShortcutConfig => ({
    key: 'Escape',
    handler: () => handler(),
    description: 'Close',
  }),

  /**
   * Create arrow key navigation shortcuts.
   */
  navigationShortcuts: (onPrev: () => void, onNext: () => void): ShortcutConfig[] => [
    {
      key: 'ArrowLeft',
      handler: () => onPrev(),
      description: 'Previous article',
    },
    {
      key: 'ArrowRight',
      handler: () => onNext(),
      description: 'Next article',
    },
  ],
};
