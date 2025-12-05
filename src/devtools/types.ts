/**
 * Developer Tools Types for @piikeep/web-help
 * @module @piikeep/web-help/devtools
 */

// ============================================================================
// CLI Types
// ============================================================================

/**
 * CLI command names available for scaffolding
 */
export type CLICommand = 'init' | 'add-article' | 'validate' | 'migrate' | 'generate-config';

/**
 * Options for the init command
 */
export interface InitOptions {
  /** Directory to initialize help content in */
  contentDir?: string;
  /** Content formats to support */
  formats?: ('md' | 'mdx' | 'json' | 'csv')[];
  /** Whether to include example content */
  includeExamples?: boolean;
  /** Storage type to configure */
  storageType?: 'localStorage' | 'sessionStorage' | 'cookies' | 'memory';
  /** Whether to generate TypeScript config */
  typescript?: boolean;
}

/**
 * Options for the add-article command
 */
export interface AddArticleOptions {
  /** Article title */
  title: string;
  /** Article slug (auto-generated from title if not provided) */
  slug?: string;
  /** Category for the article */
  category?: string;
  /** Tags for the article */
  tags?: string[];
  /** Content format */
  format?: 'md' | 'mdx' | 'json';
  /** Template to use */
  template?: 'basic' | 'tutorial' | 'reference' | 'faq';
  /** Directory to create the article in */
  outputDir?: string;
}

/**
 * Result of a CLI command execution
 */
export interface CLIResult {
  /** Whether the command succeeded */
  success: boolean;
  /** Message describing the result */
  message: string;
  /** Files created or modified */
  files?: string[];
  /** Warnings encountered */
  warnings?: string[];
  /** Errors encountered */
  errors?: string[];
}

// ============================================================================
// Config Generator Types
// ============================================================================

/**
 * Options for generating a help configuration file
 */
export interface ConfigGeneratorOptions {
  /** Project name */
  projectName?: string;
  /** Content directory path */
  contentPath?: string;
  /** Content formats to support */
  formats?: ('md' | 'mdx' | 'json' | 'csv')[];
  /** Storage configuration */
  storage?: {
    type: 'localStorage' | 'sessionStorage' | 'cookies' | 'memory' | 'custom';
    prefix?: string;
  };
  /** Search configuration */
  search?: {
    enabled: boolean;
    type?: 'client' | 'custom';
    threshold?: number;
  };
  /** Media configuration */
  media?: {
    lazyLoad?: boolean;
    lightbox?: boolean;
    cdnBaseUrl?: string;
  };
  /** Navigation configuration */
  navigation?: {
    showTOC?: boolean;
    showBreadcrumbs?: boolean;
    showPagination?: boolean;
  };
  /** Output format */
  outputFormat?: 'typescript' | 'javascript';
}

/**
 * Generated configuration result
 */
export interface GeneratedConfig {
  /** The generated configuration content */
  content: string;
  /** The filename for the config */
  filename: string;
  /** Any warnings about the configuration */
  warnings?: string[];
}

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Types of validation that can be performed
 */
export type ValidationType =
  | 'structure'
  | 'frontmatter'
  | 'links'
  | 'images'
  | 'all';

/**
 * Options for content validation
 */
export interface ValidationOptions {
  /** Directory containing content to validate */
  contentDir: string;
  /** Types of validation to perform */
  validationTypes?: ValidationType[];
  /** Whether to fix auto-fixable issues */
  fix?: boolean;
  /** File patterns to include */
  include?: string[];
  /** File patterns to exclude */
  exclude?: string[];
  /** Whether to validate external links */
  validateExternalLinks?: boolean;
  /** Custom frontmatter schema */
  frontmatterSchema?: FrontmatterSchema;
}

/**
 * Schema definition for frontmatter validation
 */
export interface FrontmatterSchema {
  /** Required fields */
  required?: string[];
  /** Optional fields with their types */
  optional?: Record<string, FrontmatterFieldType>;
  /** Custom validation rules */
  customRules?: FrontmatterRule[];
}

/**
 * Field types for frontmatter
 */
export type FrontmatterFieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'array'
  | 'object';

/**
 * Custom frontmatter validation rule
 */
export interface FrontmatterRule {
  /** Rule name */
  name: string;
  /** Field to validate */
  field: string;
  /** Validation function */
  validate: (value: unknown) => boolean;
  /** Error message if validation fails */
  message: string;
}

/**
 * Severity levels for validation issues
 */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/**
 * A single validation issue
 */
export interface ValidationIssue {
  /** File where the issue was found */
  file: string;
  /** Line number (if applicable) */
  line?: number;
  /** Column number (if applicable) */
  column?: number;
  /** Issue severity */
  severity: ValidationSeverity;
  /** Issue type */
  type: ValidationType;
  /** Issue message */
  message: string;
  /** Suggested fix (if available) */
  suggestion?: string;
  /** Whether the issue is auto-fixable */
  fixable?: boolean;
}

/**
 * Result of content validation
 */
export interface ValidationResult {
  /** Whether validation passed (no errors) */
  valid: boolean;
  /** Total number of files validated */
  filesValidated: number;
  /** List of issues found */
  issues: ValidationIssue[];
  /** Summary by severity */
  summary: {
    errors: number;
    warnings: number;
    info: number;
  };
  /** Files that were fixed (if fix option was enabled) */
  fixedFiles?: string[];
}

// ============================================================================
// Migration Types
// ============================================================================

/**
 * Supported source systems for migration
 */
export type MigrationSource =
  | 'docusaurus'
  | 'gitbook'
  | 'readme'
  | 'confluence'
  | 'notion'
  | 'vuepress'
  | 'jekyll'
  | 'custom';

/**
 * Options for migrating content from another system
 */
export interface MigrationOptions {
  /** Source system type */
  source: MigrationSource;
  /** Source directory or URL */
  sourcePath: string;
  /** Target directory for migrated content */
  targetDir: string;
  /** Target content format */
  targetFormat?: 'md' | 'mdx' | 'json';
  /** Whether to preserve original structure */
  preserveStructure?: boolean;
  /** Whether to download and migrate images */
  migrateImages?: boolean;
  /** Image output directory */
  imageDir?: string;
  /** Custom field mappings for frontmatter */
  fieldMappings?: Record<string, string>;
  /** Whether to run in dry-run mode */
  dryRun?: boolean;
}

/**
 * A single migration mapping
 */
export interface MigrationMapping {
  /** Source file path */
  source: string;
  /** Target file path */
  target: string;
  /** Whether migration was successful */
  success: boolean;
  /** Any issues encountered */
  issues?: string[];
}

/**
 * Result of a migration operation
 */
export interface MigrationResult {
  /** Whether migration completed successfully */
  success: boolean;
  /** Number of files migrated */
  filesMigrated: number;
  /** Number of files failed */
  filesFailed: number;
  /** List of file mappings */
  mappings: MigrationMapping[];
  /** Images migrated (if applicable) */
  imagesMigrated?: number;
  /** Warnings encountered */
  warnings?: string[];
  /** Errors encountered */
  errors?: string[];
}

// ============================================================================
// Documentation Types
// ============================================================================

/**
 * Options for generating documentation
 */
export interface DocGeneratorOptions {
  /** Source directory containing TypeScript files */
  sourceDir: string;
  /** Output directory for generated docs */
  outputDir: string;
  /** Documentation format */
  format?: 'markdown' | 'html' | 'json';
  /** Whether to include private members */
  includePrivate?: boolean;
  /** Whether to include examples */
  includeExamples?: boolean;
  /** Custom template path */
  templatePath?: string;
}

/**
 * Extracted API documentation for a component or function
 */
export interface APIDocumentation {
  /** Name of the component/function */
  name: string;
  /** Type (component, hook, function, type) */
  type: 'component' | 'hook' | 'function' | 'type' | 'interface';
  /** Description from JSDoc */
  description?: string;
  /** Props/parameters */
  props?: PropDocumentation[];
  /** Return type information */
  returns?: {
    type: string;
    description?: string;
  };
  /** Usage examples */
  examples?: string[];
  /** Related items */
  related?: string[];
  /** Source file */
  sourceFile: string;
  /** Line number */
  line?: number;
}

/**
 * Documentation for a prop/parameter
 */
export interface PropDocumentation {
  /** Prop name */
  name: string;
  /** Prop type */
  type: string;
  /** Whether the prop is required */
  required: boolean;
  /** Default value */
  defaultValue?: string;
  /** Description */
  description?: string;
}

// ============================================================================
// Template Types
// ============================================================================

/**
 * Article template types
 */
export type ArticleTemplate = 'basic' | 'tutorial' | 'reference' | 'faq' | 'troubleshooting';

/**
 * Template content structure
 */
export interface TemplateContent {
  /** Template name */
  name: ArticleTemplate;
  /** Template description */
  description: string;
  /** Frontmatter template */
  frontmatter: Record<string, unknown>;
  /** Content template (markdown) */
  content: string;
}
