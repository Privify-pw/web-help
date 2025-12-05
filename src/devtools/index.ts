/**
 * Developer Experience Tools for @piikeep/web-help
 * 
 * This module provides CLI scaffolding, configuration generation,
 * content validation, migration utilities, and documentation tools.
 * 
 * @module @piikeep/web-help/devtools
 * 
 * @example
 * ```typescript
 * import {
 *   cli,
 *   configGenerator,
 *   validation,
 *   migration,
 *   documentation,
 * } from '@piikeep/web-help';
 * 
 * // Generate initialization files
 * const initResult = cli.generateInitFiles({
 *   contentDir: './help',
 *   formats: ['md', 'mdx'],
 * });
 * 
 * // Generate a new article
 * const article = cli.generateArticle({
 *   title: 'Getting Started',
 *   template: 'tutorial',
 * });
 * 
 * // Generate configuration
 * const config = configGenerator.generateConfig({
 *   projectName: 'my-docs',
 * });
 * 
 * // Validate content
 * const validationResult = validation.validateContent(files);
 * 
 * // Migrate from another system
 * const migrationResult = migration.migrate(files, {
 *   source: 'docusaurus',
 *   targetDir: './help-content',
 * });
 * ```
 */

// ============================================================================
// CLI Tools
// ============================================================================
export {
  cli,
  generateInitFiles,
  generateArticle,
  getArticleTemplates,
  getArticleTemplate,
  slugify,
} from './cli';

// ============================================================================
// Config Generator
// ============================================================================
export {
  configGenerator,
  generateConfig,
  generateMinimalConfig,
  validateConfigOptions,
} from './configGenerator';

// ============================================================================
// Validation Tools
// ============================================================================
export {
  validation,
  validateContent,
  validateFrontmatter,
  validateStructure,
  validateLinks,
  validateImages,
  formatValidationReport,
  DEFAULT_FRONTMATTER_SCHEMA,
} from './validation';

// ============================================================================
// Migration Utilities
// ============================================================================
export {
  migration,
  migrate,
  migrateFile,
  createMigrationPlan,
  transformFrontmatter,
  transformContent,
  filenameToSlug,
  getMigrationSourceInfo,
  getSupportedSources,
} from './migration';

// ============================================================================
// Documentation Tools
// ============================================================================
export {
  documentation,
  parseJSDoc,
  extractDocumentation,
  generateMarkdownDocs,
  generateJSONDocs,
  generateTableOfContents,
  generateDocs,
} from './documentation';

// ============================================================================
// Types
// ============================================================================
export type {
  // CLI Types
  CLICommand,
  InitOptions,
  AddArticleOptions,
  CLIResult,
  ArticleTemplate,
  TemplateContent,
  // Config Types
  ConfigGeneratorOptions,
  GeneratedConfig,
  // Validation Types
  ValidationType,
  ValidationOptions,
  FrontmatterSchema,
  FrontmatterFieldType,
  FrontmatterRule,
  ValidationSeverity,
  ValidationIssue,
  ValidationResult,
  // Migration Types
  MigrationSource,
  MigrationOptions,
  MigrationMapping,
  MigrationResult,
  // Documentation Types
  DocGeneratorOptions,
  APIDocumentation,
  PropDocumentation,
} from './types';
