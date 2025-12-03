/**
 * HelpSearch Component for the Web Help Component Library
 * @module @privify-pw/web-help/components/navigation/HelpSearch
 * 
 * Headless component for search functionality.
 */

import { forwardRef, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { HelpSearchProps } from '../../types/components';
import type { HelpSearchResult } from '../../types/content';
import { useHelpSearch } from '../../hooks/useHelpSearch';
import { useUserPreferences } from '../../context/UserPreferencesContext';

/**
 * HelpSearch is a headless component for search functionality.
 */
export const HelpSearch = forwardRef<HTMLDivElement, HelpSearchProps>(function HelpSearch(
  {
    placeholder = 'Search...',
    onSearch,
    onResultSelect,
    renderResult,
    showRecent = true,
    debounceMs = 300,
    autoFocus = false,
    className = '',
    ...props
  },
  ref
) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const { query, setQuery, results, isSearching, clear } = useHelpSearch({
    debounceMs,
  });

  const { getRecentSearches, addRecentSearch } = useUserPreferences();
  const recentSearches = useMemo(
    () => (showRecent ? getRecentSearches() : []),
    [showRecent, getRecentSearches]
  );

  // Handle input change
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setQuery(value);
      setIsOpen(true);
      setHighlightedIndex(-1);
      onSearch?.(value);
    },
    [setQuery, onSearch]
  );

  // Handle result selection
  const handleResultSelect = useCallback(
    (result: HelpSearchResult) => {
      addRecentSearch(query);
      setIsOpen(false);
      clear();
      onResultSelect?.(result);
    },
    [query, addRecentSearch, clear, onResultSelect]
  );

  // Handle recent search selection
  const handleRecentSelect = useCallback(
    (search: string) => {
      setQuery(search);
      setIsOpen(true);
      onSearch?.(search);
    },
    [setQuery, onSearch]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const totalItems = results.length + (showRecent && !query ? recentSearches.length : 0);

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
          break;
        case 'Enter':
          event.preventDefault();
          if (highlightedIndex >= 0) {
            if (query && results[highlightedIndex]) {
              handleResultSelect(results[highlightedIndex]);
            } else if (!query && recentSearches[highlightedIndex]) {
              handleRecentSelect(recentSearches[highlightedIndex]);
            }
          }
          break;
        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          inputRef.current?.blur();
          break;
      }
    },
    [results, recentSearches, highlightedIndex, query, showRecent, handleResultSelect, handleRecentSelect]
  );

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Handle blur (with delay for click events)
  const handleBlur = useCallback(() => {
    setTimeout(() => {
      setIsOpen(false);
    }, 200);
  }, []);

  // Auto-focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Render a search result
  const defaultRenderResult = (result: HelpSearchResult, index: number): React.ReactNode => (
    <li
      key={result.articleId}
      className="help-search-result"
      data-highlighted={index === highlightedIndex}
      role="option"
      aria-selected={index === highlightedIndex}
    >
      <button
        type="button"
        className="help-search-result-button"
        onClick={() => handleResultSelect(result)}
        onMouseEnter={() => setHighlightedIndex(index)}
      >
        <span className="help-search-result-title">{result.title}</span>
        {result.snippet && (
          <span className="help-search-result-snippet">{result.snippet}</span>
        )}
        {result.category && (
          <span className="help-search-result-category">{result.category}</span>
        )}
      </button>
    </li>
  );

  const showResults = isOpen && query && (results.length > 0 || isSearching);
  const showRecentSearches = isOpen && !query && showRecent && recentSearches.length > 0;
  const showDropdown = showResults || showRecentSearches;

  return (
    <div
      ref={ref}
      className={`help-search ${className}`.trim()}
      data-component="search"
      data-open={showDropdown}
      data-searching={isSearching}
      {...props}
    >
      <div className="help-search-input-wrapper">
        <input
          ref={inputRef}
          type="search"
          className="help-search-input"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-label="Search help"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls="help-search-listbox"
          role="combobox"
        />
        {isSearching && (
          <span className="help-search-loading" aria-hidden="true">
            ...
          </span>
        )}
      </div>

      {showDropdown && (
        <div className="help-search-dropdown">
          <ul
            ref={listRef}
            id="help-search-listbox"
            className="help-search-list"
            role="listbox"
          >
            {showResults &&
              results.map((result, index) =>
                renderResult ? renderResult(result) : defaultRenderResult(result, index)
              )}
            {showRecentSearches && (
              <>
                <li className="help-search-recent-header" role="presentation">
                  Recent searches
                </li>
                {recentSearches.map((search, index) => (
                  <li
                    key={search}
                    className="help-search-recent-item"
                    data-highlighted={index === highlightedIndex}
                    role="option"
                    aria-selected={index === highlightedIndex}
                  >
                    <button
                      type="button"
                      className="help-search-recent-button"
                      onClick={() => handleRecentSelect(search)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      {search}
                    </button>
                  </li>
                ))}
              </>
            )}
            {isSearching && (
              <li className="help-search-loading-item" role="presentation">
                Searching...
              </li>
            )}
            {!isSearching && query && results.length === 0 && (
              <li className="help-search-no-results" role="presentation">
                No results found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
});

HelpSearch.displayName = 'HelpSearch';
