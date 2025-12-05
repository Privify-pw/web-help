/**
 * Migration Utilities for @piikeep/web-help
 * Tools to migrate content from other help/documentation systems
 * @module @piikeep/web-help/devtools/migration
 */

import type {
  MigrationOptions,
  MigrationResult,
  MigrationMapping,
  MigrationSource,
} from './types';
import { slugify } from './cli';

// ============================================================================
// Source System Configurations
// ============================================================================

/**
 * Configuration for different source systems
 */
const SOURCE_CONFIGS: Record<MigrationSource, {
  name: string;
  description: string;
  filePatterns: string[];
  frontmatterMapping: Record<string, string>;
}> = {
  docusaurus: {
    name: 'Docusaurus',
    description: 'Migrate from Docusaurus documentation',
    filePatterns: ['*.md', '*.mdx'],
    frontmatterMapping: {
      id: 'slug',
      sidebar_label: 'title',
      sidebar_position: 'order',
      keywords: 'tags',
    },
  },
  gitbook: {
    name: 'GitBook',
    description: 'Migrate from GitBook documentation',
    filePatterns: ['*.md'],
    frontmatterMapping: {
      description: 'description',
    },
  },
  readme: {
    name: 'ReadMe.io',
    description: 'Migrate from ReadMe.io documentation',
    filePatterns: ['*.md'],
    frontmatterMapping: {
      excerpt: 'description',
      categorySlug: 'category',
    },
  },
  confluence: {
    name: 'Confluence',
    description: 'Migrate from Confluence (exported HTML/markdown)',
    filePatterns: ['*.md', '*.html'],
    frontmatterMapping: {
      space: 'category',
      labels: 'tags',
    },
  },
  notion: {
    name: 'Notion',
    description: 'Migrate from Notion exported markdown',
    filePatterns: ['*.md'],
    frontmatterMapping: {},
  },
  vuepress: {
    name: 'VuePress',
    description: 'Migrate from VuePress documentation',
    filePatterns: ['*.md'],
    frontmatterMapping: {
      sidebar: 'order',
      prev: 'related',
      next: 'related',
    },
  },
  jekyll: {
    name: 'Jekyll',
    description: 'Migrate from Jekyll documentation',
    filePatterns: ['*.md', '*.markdown'],
    frontmatterMapping: {
      layout: '_layout',
      permalink: 'slug',
      date: 'createdAt',
      last_modified_at: 'updatedAt',
    },
  },
  custom: {
    name: 'Custom',
    description: 'Custom migration with user-defined mappings',
    filePatterns: ['*.md', '*.mdx', '*.json'],
    frontmatterMapping: {},
  },
};

// ============================================================================
// Frontmatter Transformation
// ============================================================================

/**
 * Transforms frontmatter from source system format to web-help format
 * 
 * @param frontmatter - Original frontmatter object
 * @param source - Source system type
 * @param customMappings - Custom field mappings
 * @returns Transformed frontmatter
 */
export function transformFrontmatter(
  frontmatter: Record<string, unknown>,
  source: MigrationSource,
  customMappings: Record<string, string> = {}
): Record<string, unknown> {
  const config = SOURCE_CONFIGS[source];
  const mappings = { ...config.frontmatterMapping, ...customMappings };
  
  const result: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(frontmatter)) {
    if (key.startsWith('_')) continue; // Skip internal fields
    
    const mappedKey = mappings[key] || key;
    
    // Skip if mapping starts with _ (marked for removal)
    if (mappedKey.startsWith('_')) continue;
    
    result[mappedKey] = value;
  }

  // Ensure required fields exist
  if (!result.title && frontmatter.title) {
    result.title = frontmatter.title;
  }

  // Add migration metadata
  result._migratedFrom = source;
  result._migratedAt = new Date().toISOString();

  return result;
}

/**
 * Transforms content from source system format
 * 
 * @param content - Original content
 * @param source - Source system type
 * @returns Transformed content
 */
export function transformContent(
  content: string,
  source: MigrationSource
): { content: string; warnings: string[] } {
  const warnings: string[] = [];
  let transformedContent = content;

  switch (source) {
    case 'docusaurus':
      // Handle Docusaurus-specific syntax
      // Convert admonitions: :::note to callouts
      transformedContent = transformedContent.replace(
        /:::(note|tip|info|warning|danger|caution)\s*(.*?)\n([\s\S]*?):::/g,
        (_, type, title, content) => {
          const calloutType = type === 'caution' ? 'warning' : type;
          return `> **${calloutType.toUpperCase()}${title ? ': ' + title : ''}**\n> ${content.trim().replace(/\n/g, '\n> ')}`;
        }
      );
      
      // Convert import statements to comments
      if (/^import\s+/m.test(transformedContent)) {
        warnings.push('Contains import statements that may need manual review');
        transformedContent = transformedContent.replace(
          /^import\s+.*$/gm,
          (match) => `{/* ${match} */}`
        );
      }
      break;

    case 'vuepress':
      // Handle VuePress-specific syntax
      // Convert custom containers
      transformedContent = transformedContent.replace(
        /:::\s*(tip|warning|danger|details)\s*(.*?)\n([\s\S]*?):::/g,
        (_, type, title, content) => {
          return `> **${type.toUpperCase()}${title ? ': ' + title : ''}**\n> ${content.trim().replace(/\n/g, '\n> ')}`;
        }
      );
      
      // Convert Vue components to comments
      if (/<[A-Z][a-zA-Z]*/.test(transformedContent)) {
        warnings.push('Contains Vue components that need manual conversion');
      }
      break;

    case 'confluence':
      // Handle Confluence-specific macros
      transformedContent = transformedContent.replace(
        /{panel(?::title=([^}]*))?}([\s\S]*?){panel}/g,
        (_, title, content) => {
          return `> **${title || 'Note'}**\n> ${content.trim().replace(/\n/g, '\n> ')}`;
        }
      );
      
      // Convert {code} blocks
      transformedContent = transformedContent.replace(
        /{code(?::language=([^}]*))?}([\s\S]*?){code}/g,
        (_, lang, content) => {
          return `\`\`\`${lang || ''}\n${content.trim()}\n\`\`\``;
        }
      );
      break;

    case 'notion':
      // Handle Notion-specific elements
      // Convert callout blocks (if exported as special format)
      transformedContent = transformedContent.replace(
        /💡\s*(.*)/g,
        '> **TIP**: $1'
      );
      transformedContent = transformedContent.replace(
        /⚠️\s*(.*)/g,
        '> **WARNING**: $1'
      );
      break;

    case 'jekyll':
      // Handle Jekyll-specific syntax
      // Convert Liquid includes
      if (/\{%\s*include\s+/.test(transformedContent)) {
        warnings.push('Contains Liquid includes that need manual conversion');
        transformedContent = transformedContent.replace(
          /\{%\s*include\s+([^\s%]+)\s*%\}/g,
          '<!-- Include: $1 -->'
        );
      }
      
      // Convert highlight blocks
      transformedContent = transformedContent.replace(
        /\{%\s*highlight\s+(\w+)\s*%\}([\s\S]*?)\{%\s*endhighlight\s*%\}/g,
        '```$1\n$2```'
      );
      break;

    default:
      // No transformation needed for other sources
      break;
  }

  return { content: transformedContent, warnings };
}

/**
 * Generates a slug from a filename
 */
export function filenameToSlug(filename: string): string {
  // Remove extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  // Remove date prefix if present (e.g., 2024-01-01-title.md)
  const withoutDate = nameWithoutExt.replace(/^\d{4}-\d{2}-\d{2}-/, '');
  return slugify(withoutDate);
}

/**
 * Creates a migration plan for content files
 * 
 * @param files - Array of source files with path and content
 * @param options - Migration options
 * @returns Migration plan with mappings
 */
export function createMigrationPlan(
  files: Array<{ path: string; content: string; frontmatter?: Record<string, unknown> }>,
  options: MigrationOptions
): {
  mappings: MigrationMapping[];
  warnings: string[];
} {
  const {
    targetDir,
    targetFormat = 'md',
    preserveStructure = true,
  } = options;

  const mappings: MigrationMapping[] = [];
  const warnings: string[] = [];

  for (const file of files) {
    // Determine target path
    let targetPath: string;
    
    if (preserveStructure) {
      // Keep original directory structure
      const relativePath = file.path.replace(/^.*?\//, '');
      targetPath = `${targetDir}/${relativePath}`;
    } else {
      // Flatten structure using slug
      const slug = file.frontmatter?.slug as string || filenameToSlug(file.path);
      targetPath = `${targetDir}/${slug}.${targetFormat}`;
    }

    // Change extension if needed
    targetPath = targetPath.replace(/\.(md|mdx|markdown)$/, `.${targetFormat}`);

    mappings.push({
      source: file.path,
      target: targetPath,
      success: true,
    });
  }

  return { mappings, warnings };
}

/**
 * Migrates a single file's content
 * 
 * @param file - Source file object
 * @param options - Migration options
 * @returns Migrated content
 */
export function migrateFile(
  file: { path: string; content: string; frontmatter?: Record<string, unknown> },
  options: MigrationOptions
): {
  content: string;
  frontmatter: Record<string, unknown>;
  warnings: string[];
} {
  const {
    source,
    fieldMappings = {},
  } = options;

  const warnings: string[] = [];

  // Transform frontmatter
  const newFrontmatter = file.frontmatter
    ? transformFrontmatter(file.frontmatter, source, fieldMappings)
    : { title: filenameToSlug(file.path) };

  // Transform content
  const { content: newContent, warnings: contentWarnings } = transformContent(
    file.content,
    source
  );
  warnings.push(...contentWarnings);

  // Generate frontmatter YAML
  const frontmatterLines = ['---'];
  for (const [key, value] of Object.entries(newFrontmatter)) {
    if (key.startsWith('_')) continue; // Skip internal fields in output
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        frontmatterLines.push(`${key}: []`);
      } else {
        frontmatterLines.push(`${key}:`);
        value.forEach(item => frontmatterLines.push(`  - ${item}`));
      }
    } else if (typeof value === 'object' && value !== null) {
      frontmatterLines.push(`${key}:`);
      for (const [subKey, subValue] of Object.entries(value)) {
        frontmatterLines.push(`  ${subKey}: ${subValue}`);
      }
    } else {
      frontmatterLines.push(`${key}: ${value}`);
    }
  }
  frontmatterLines.push('---');

  const fullContent = frontmatterLines.join('\n') + '\n\n' + newContent;

  return {
    content: fullContent,
    frontmatter: newFrontmatter,
    warnings,
  };
}

/**
 * Performs a migration operation (returns transformed content, does not write files)
 * 
 * @param files - Array of source files
 * @param options - Migration options
 * @returns Migration result with transformed content
 * 
 * @example
 * ```typescript
 * const result = migrate([
 *   { path: 'docs/intro.md', content: '...', frontmatter: {...} },
 * ], {
 *   source: 'docusaurus',
 *   sourcePath: './docs',
 *   targetDir: './help-content',
 * });
 * 
 * // Use result.mappings to get source->target mappings
 * // Write transformed files using your preferred method
 * ```
 */
export function migrate(
  files: Array<{ path: string; content: string; frontmatter?: Record<string, unknown> }>,
  options: MigrationOptions
): MigrationResult & { transformedFiles: Array<{ path: string; content: string }> } {
  const allWarnings: string[] = [];
  const allErrors: string[] = [];
  const transformedFiles: Array<{ path: string; content: string }> = [];
  const mappings: MigrationMapping[] = [];

  let filesMigrated = 0;
  let filesFailed = 0;

  // Create migration plan
  const plan = createMigrationPlan(files, options);
  allWarnings.push(...plan.warnings);

  // Process each file
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const mapping = plan.mappings[i];

    try {
      const result = migrateFile(file, options);
      allWarnings.push(...result.warnings.map(w => `${file.path}: ${w}`));
      
      transformedFiles.push({
        path: mapping.target,
        content: result.content,
      });

      mapping.success = true;
      filesMigrated++;
    } catch (error) {
      mapping.success = false;
      mapping.issues = [(error as Error).message];
      allErrors.push(`${file.path}: ${(error as Error).message}`);
      filesFailed++;
    }

    mappings.push(mapping);
  }

  return {
    success: filesFailed === 0,
    filesMigrated,
    filesFailed,
    mappings,
    warnings: allWarnings.length > 0 ? allWarnings : undefined,
    errors: allErrors.length > 0 ? allErrors : undefined,
    transformedFiles,
  };
}

/**
 * Gets information about a supported migration source
 */
export function getMigrationSourceInfo(source: MigrationSource): {
  name: string;
  description: string;
  filePatterns: string[];
  supportedMappings: string[];
} {
  const config = SOURCE_CONFIGS[source];
  return {
    name: config.name,
    description: config.description,
    filePatterns: config.filePatterns,
    supportedMappings: Object.keys(config.frontmatterMapping),
  };
}

/**
 * Gets all supported migration sources
 */
export function getSupportedSources(): Array<{
  source: MigrationSource;
  name: string;
  description: string;
}> {
  return Object.entries(SOURCE_CONFIGS).map(([source, config]) => ({
    source: source as MigrationSource,
    name: config.name,
    description: config.description,
  }));
}

// ============================================================================
// Exports
// ============================================================================

export const migration = {
  migrate,
  migrateFile,
  createMigrationPlan,
  transformFrontmatter,
  transformContent,
  filenameToSlug,
  getMigrationSourceInfo,
  getSupportedSources,
};

export default migration;
