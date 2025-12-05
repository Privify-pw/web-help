# Search Adapters

@piikeep/web-help provides flexible search functionality through search adapters. You can use the built-in adapters or create your own custom implementation.

## Built-in Adapters

### FuseSearchAdapter (Recommended)

Uses [fuse.js](https://fusejs.io/) for advanced fuzzy search with highlighting and scoring.

```typescript
import { HelpProvider, FuseSearchAdapter } from '@piikeep/web-help';

const searchAdapter = new FuseSearchAdapter();

function App() {
  return (
    <HelpProvider
      config={{
        search: {
          adapter: searchAdapter,
        },
      }}
    >
      {/* Your app */}
    </HelpProvider>
  );
}
```

**Features:**

- Fuzzy matching with configurable threshold
- Advanced scoring algorithm
- Match highlighting
- Prefix matching bonus
- Weighted search keys (title > tags > category > content)

**Best for:** Most applications, especially with medium to large documentation sets

### SimpleSearchAdapter

Lightweight search with no dependencies, using simple string matching.

```typescript
import { HelpProvider, SimpleSearchAdapter } from '@piikeep/web-help';

const searchAdapter = new SimpleSearchAdapter();

function App() {
  return (
    <HelpProvider
      config={{
        search: {
          adapter: searchAdapter,
        },
      }}
    >
      {/* Your app */}
    </HelpProvider>
  );
}
```

**Features:**

- Zero dependencies
- Simple string matching
- Basic scoring
- Fast and lightweight

**Best for:** Small documentation sets, minimal bundle size requirements

## Using Search Components

### HelpSearch Component

```typescript
import { HelpSearch } from '@piikeep/web-help';

function SearchBar() {
  return (
    <HelpSearch
      placeholder='Search documentation...'
      showRecent={true}
      debounceMs={300}
      onResultSelect={(result) => {
        console.log('Selected:', result);
        // Navigate to article
      }}
    />
  );
}
```

### useHelpSearch Hook

```typescript
import { useHelpSearch } from '@piikeep/web-help';

function CustomSearch() {
  const { query, setQuery, results, isSearching, search } = useHelpSearch({
    debounceMs: 300,
    maxResults: 10,
    minQueryLength: 2,
  });

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder='Search...'
      />
      {isSearching && <p>Searching...</p>}
      <ul>
        {results.map((result) => (
          <li key={result.articleId}>
            <h3>{result.title}</h3>
            <p>{result.snippet}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Advanced Search Options

Both adapters support advanced search options:

```typescript
const results = await searchAdapter.search('react hooks', {
  limit: 20,
  category: 'guides',
  tags: ['advanced', 'react'],
  sortBy: 'relevance', // 'relevance' | 'date' | 'title'
  sortDirection: 'desc', // 'asc' | 'desc'
  includeScore: true,
  includeHighlights: true,
});
```

## Custom Search Adapter

You can create a custom search adapter for server-side search, Algolia, ElasticSearch, etc.

```typescript
import type {
  SearchAdapter,
  SearchOptions,
  HelpSearchResult,
  ContentIndex,
} from '@piikeep/web-help';

export class AlgoliaSearchAdapter implements SearchAdapter {
  name = 'algolia';
  private client: any; // Your Algolia client

  async initialize(content: ContentIndex[]): Promise<void> {
    // Optional: Index content in Algolia
    // Or rely on server-side indexing
  }

  async search(
    query: string,
    options: SearchOptions = {},
  ): Promise<HelpSearchResult[]> {
    const { hits } = await this.client.search(query, {
      hitsPerPage: options.limit ?? 10,
      filters: options.category ? `category:${options.category}` : undefined,
    });

    return hits.map((hit: any) => ({
      articleId: hit.objectID,
      title: hit.title,
      score: hit._score,
      snippet: hit._snippetResult?.content?.value,
      category: hit.category,
      tags: hit.tags,
    }));
  }

  async add(content: ContentIndex): Promise<void> {
    await this.client.saveObject(content);
  }

  async update(content: ContentIndex): Promise<void> {
    await this.client.partialUpdateObject(content);
  }

  async remove(id: string): Promise<void> {
    await this.client.deleteObject(id);
  }

  async clear(): Promise<void> {
    await this.client.clearObjects();
  }
}
```

### Using Custom Adapter

```typescript
import { HelpProvider } from '@piikeep/web-help';
import { AlgoliaSearchAdapter } from './AlgoliaSearchAdapter';

const searchAdapter = new AlgoliaSearchAdapter();

function App() {
  return (
    <HelpProvider
      config={{
        search: {
          adapter: searchAdapter,
        },
      }}
    >
      {/* Your app */}
    </HelpProvider>
  );
}
```

## Performance Considerations

### Client-side Search

**Pros:**

- No server required
- Instant results
- Works offline

**Cons:**

- Limited to ~500-1000 articles
- Larger initial bundle

**Bundle sizes:**

- `SimpleSearchAdapter`: ~2KB
- `FuseSearchAdapter`: ~12KB (fuse.js included)

### Server-side Search

**Pros:**

- Unlimited content size
- Advanced features (typo tolerance, analytics)
- Smaller client bundle

**Cons:**

- Requires backend
- Network latency
- No offline support

### Recommendations

- **< 100 articles**: Use `SimpleSearchAdapter`
- **100-500 articles**: Use `FuseSearchAdapter`
- **> 500 articles**: Use custom server-side adapter (Algolia, ElasticSearch, etc.)

## Search Result Filtering

Filter results by category or tags:

```typescript
import { useHelpSearch } from '@piikeep/web-help';

function FilteredSearch() {
  const { search } = useHelpSearch();

  const handleSearch = async (query: string) => {
    const results = await search(query);

    // Client-side filtering (if not using adapter options)
    const filtered = results.filter((result) => result.category === 'guides');

    return filtered;
  };

  // Or use adapter options for better performance
  const handleSearchWithOptions = async (query: string) => {
    const adapter = new FuseSearchAdapter();
    const results = await adapter.search(query, {
      category: 'guides',
      tags: ['beginner'],
    });

    return results;
  };
}
```

## Recent Searches

Recent searches are automatically tracked and stored using the configured storage adapter:

```typescript
import { useUserPreferences } from '@piikeep/web-help';

function RecentSearches() {
  const { getRecentSearches, clearRecentSearches } = useUserPreferences();

  const recentSearches = getRecentSearches();

  return (
    <div>
      <h3>Recent Searches</h3>
      <ul>
        {recentSearches.map((search) => (
          <li key={search}>{search}</li>
        ))}
      </ul>
      <button onClick={clearRecentSearches}>Clear</button>
    </div>
  );
}
```

## TypeScript Types

```typescript
import type {
  SearchAdapter,
  SearchOptions,
  SearchState,
  HelpSearchResult,
  SearchHighlight,
} from '@piikeep/web-help';

// SearchAdapter interface
interface SearchAdapter {
  name: string;
  initialize(content: ContentIndex[]): Promise<void>;
  search(query: string, options?: SearchOptions): Promise<HelpSearchResult[]>;
  add?(content: ContentIndex): Promise<void>;
  update?(content: ContentIndex): Promise<void>;
  remove?(id: string): Promise<void>;
  clear?(): Promise<void>;
}

// Search options
interface SearchOptions {
  limit?: number;
  category?: string;
  tags?: string[];
  includeScore?: boolean;
  includeHighlights?: boolean;
  threshold?: number;
  sortBy?: 'relevance' | 'date' | 'title';
  sortDirection?: 'asc' | 'desc';
}

// Search result
interface HelpSearchResult {
  articleId: string;
  title: string;
  score?: number;
  snippet?: string;
  category?: string;
  tags?: string[];
  matches?: any; // fuse.js match data
}
```
