/**
 * Core Index for the Web Help Component Library
 * @module @privify-pw/web-help/core
 */

// Types - export all types
export * from './types';

// Context - explicitly export to avoid conflicts
export {
  HelpProvider,
  useHelpContext,
  useHelpState,
  type HelpState,
  type HelpContextValue,
} from './context/HelpContext';

export {
  UserPreferencesProvider,
  useUserPreferences,
  type UserPreferencesProviderProps,
  type UserPreferencesContextValue,
} from './context/UserPreferencesContext';

// Hooks
export * from './hooks';

// Storage
export * from './storage';

// Loaders
export * from './loaders';

// Components
export * from './components';
