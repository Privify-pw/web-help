/**
 * Component Types for the Web Help Component Library
 * @module @privify-pw/web-help/types/components
 */

import type { ReactNode } from 'react';
import type { HelpArticle, TOCEntry, BreadcrumbItem, NavigationState, HelpSearchResult } from './content';
import type { HelpConfig, HelpCallbacks } from './config';

/**
 * Base props for all headless components.
 * Provides semantic class names and data attributes for styling.
 */
export interface BaseComponentProps {
  /** Additional CSS class name */
  className?: string;
  /** Custom data attributes */
  'data-testid'?: string;
  /** Style attribute */
  style?: React.CSSProperties;
}

/**
 * Props for the HelpProvider component.
 */
export interface HelpProviderProps {
  /** Configuration for the help system */
  config?: HelpConfig;
  /** Callbacks for user interactions */
  callbacks?: HelpCallbacks;
  /** Children to render */
  children: ReactNode;
}

/**
 * Props for the HelpPage component.
 */
export interface HelpPageProps extends BaseComponentProps {
  /** Article to display */
  article?: HelpArticle;
  /** Article ID to load (if article not provided) */
  articleId?: string;
  /** Render custom header */
  renderHeader?: (article: HelpArticle) => ReactNode;
  /** Render custom footer */
  renderFooter?: (article: HelpArticle) => ReactNode;
  /** Render custom sidebar */
  renderSidebar?: (article: HelpArticle) => ReactNode;
  /** Show table of contents */
  showTOC?: boolean;
  /** Show breadcrumbs */
  showBreadcrumbs?: boolean;
  /** Show pagination */
  showPagination?: boolean;
  /** Children to render when no article */
  children?: ReactNode;
}

/**
 * Props for the HelpContent component.
 */
export interface HelpContentProps extends BaseComponentProps {
  /** Rendered HTML content */
  content: string;
  /** Render custom component for code blocks */
  renderCodeBlock?: (code: string, language?: string) => ReactNode;
  /** Render custom component for images */
  renderImage?: (src: string, alt?: string, title?: string) => ReactNode;
  /** Render custom component for links */
  renderLink?: (href: string, text: string) => ReactNode;
}

/**
 * Props for the HelpNavigation component.
 */
export interface HelpNavigationProps extends BaseComponentProps {
  /** Navigation items */
  items?: NavigationItem[];
  /** Current active item ID */
  activeId?: string;
  /** Called when an item is selected */
  onItemSelect?: (id: string) => void;
  /** Whether the navigation is collapsible */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
}

/**
 * Navigation item.
 */
export interface NavigationItem {
  /** Item ID */
  id: string;
  /** Item label */
  label: string;
  /** Path/URL for the item */
  path?: string;
  /** Icon for the item */
  icon?: ReactNode;
  /** Child items */
  children?: NavigationItem[];
  /** Whether the item is a category */
  isCategory?: boolean;
}

/**
 * Props for the HelpTOC component.
 */
export interface HelpTOCProps extends BaseComponentProps {
  /** TOC entries */
  entries?: TOCEntry[];
  /** Current active heading ID */
  activeId?: string;
  /** Called when a heading is clicked */
  onHeadingClick?: (id: string) => void;
  /** Maximum depth to display */
  maxDepth?: number;
  /** Title for the TOC section */
  title?: ReactNode;
}

/**
 * Props for the HelpBreadcrumbs component.
 */
export interface HelpBreadcrumbsProps extends BaseComponentProps {
  /** Breadcrumb items */
  items?: BreadcrumbItem[];
  /** Custom separator between items */
  separator?: ReactNode;
  /** Called when a breadcrumb is clicked */
  onItemClick?: (item: BreadcrumbItem) => void;
  /** Render custom breadcrumb item */
  renderItem?: (item: BreadcrumbItem, isLast: boolean) => ReactNode;
}

/**
 * Props for the HelpPagination component.
 */
export interface HelpPaginationProps extends BaseComponentProps {
  /** Navigation state with prev/next info */
  navigation?: NavigationState;
  /** Called when prev is clicked */
  onPrev?: () => void;
  /** Called when next is clicked */
  onNext?: () => void;
  /** Render custom prev button */
  renderPrev?: (prev: NavigationState['prev']) => ReactNode;
  /** Render custom next button */
  renderNext?: (next: NavigationState['next']) => ReactNode;
}

/**
 * Props for the HelpSearch component.
 */
export interface HelpSearchProps extends BaseComponentProps {
  /** Placeholder text */
  placeholder?: string;
  /** Called when search is performed */
  onSearch?: (query: string) => void;
  /** Called when a result is selected */
  onResultSelect?: (result: HelpSearchResult) => void;
  /** Render custom result item */
  renderResult?: (result: HelpSearchResult) => ReactNode;
  /** Show recent searches */
  showRecent?: boolean;
  /** Debounce delay in ms */
  debounceMs?: number;
  /** Auto-focus the search input */
  autoFocus?: boolean;
}

/**
 * Props for the HelpModal component.
 */
export interface HelpModalProps extends BaseComponentProps {
  /** Whether the modal is open */
  open: boolean;
  /** Called when the modal should close */
  onClose: () => void;
  /** Modal title */
  title?: ReactNode;
  /** Modal content */
  children: ReactNode;
  /** Close on backdrop click */
  closeOnBackdrop?: boolean;
  /** Close on escape key */
  closeOnEscape?: boolean;
  /** Render custom close button */
  renderCloseButton?: () => ReactNode;
}

/**
 * Props for the HelpSidebar component.
 */
export interface HelpSidebarProps extends BaseComponentProps {
  /** Whether the sidebar is open */
  open: boolean;
  /** Called when the sidebar should close */
  onClose?: () => void;
  /** Sidebar position */
  position?: 'left' | 'right';
  /** Sidebar content */
  children: ReactNode;
  /** Sidebar width */
  width?: string | number;
  /** Show overlay when open */
  overlay?: boolean;
}
