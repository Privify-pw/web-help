/**
 * Content Validation Tools for @piikeep/web-help
 * Validates help content structure, frontmatter, links, and images
 * @module @piikeep/web-help/devtools/validation
 */

import type {
  ValidationOptions,
  ValidationResult,
  ValidationIssue,
  ValidationType,
  FrontmatterSchema,
} from './types';

// ============================================================================
// Default Schemas
// ============================================================================

/**
 * Default frontmatter schema for help articles
 */
export const DEFAULT_FRONTMATTER_SCHEMA: FrontmatterSchema = {
  required: ['title'],
  optional: {
    description: 'string',
    category: 'string',
    tags: 'array',
    author: 'string',
    createdAt: 'date',
    updatedAt: 'date',
    order: 'number',
    draft: 'boolean',
    slug: 'string',
    related: 'array',
  },
};

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates frontmatter content against a schema
 * 
 * @param frontmatter - Parsed frontmatter object
 * @param schema - Schema to validate against
 * @param filename - Source filename for error reporting
 * @returns Array of validation issues
 */
export function validateFrontmatter(
  frontmatter: Record<string, unknown>,
  schema: FrontmatterSchema = DEFAULT_FRONTMATTER_SCHEMA,
  filename: string
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Check required fields
  if (schema.required) {
    for (const field of schema.required) {
      if (!(field in frontmatter) || frontmatter[field] === undefined || frontmatter[field] === '') {
        issues.push({
          file: filename,
          severity: 'error',
          type: 'frontmatter',
          message: `Missing required frontmatter field: ${field}`,
          suggestion: `Add '${field}:' to your frontmatter`,
          fixable: false,
        });
      }
    }
  }

  // Validate field types
  if (schema.optional) {
    for (const [field, expectedType] of Object.entries(schema.optional)) {
      if (field in frontmatter && frontmatter[field] !== undefined) {
        const value = frontmatter[field];
        const isValid = validateFieldType(value, expectedType);
        
        if (!isValid) {
          issues.push({
            file: filename,
            severity: 'warning',
            type: 'frontmatter',
            message: `Field '${field}' should be of type ${expectedType}, got ${typeof value}`,
            suggestion: `Convert '${field}' to ${expectedType}`,
            fixable: true,
          });
        }
      }
    }
  }

  // Run custom rules
  if (schema.customRules) {
    for (const rule of schema.customRules) {
      if (rule.field in frontmatter) {
        if (!rule.validate(frontmatter[rule.field])) {
          issues.push({
            file: filename,
            severity: 'error',
            type: 'frontmatter',
            message: rule.message,
            fixable: false,
          });
        }
      }
    }
  }

  return issues;
}

/**
 * Validates if a value matches the expected type
 */
function validateFieldType(value: unknown, expectedType: string): boolean {
  switch (expectedType) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number';
    case 'boolean':
      return typeof value === 'boolean';
    case 'array':
      return Array.isArray(value);
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    case 'date':
      if (typeof value === 'string') {
        const date = new Date(value);
        return !isNaN(date.getTime());
      }
      return value instanceof Date;
    default:
      return true;
  }
}

/**
 * Validates markdown content structure
 * 
 * @param content - Markdown content
 * @param filename - Source filename
 * @returns Array of validation issues
 */
export function validateStructure(content: string, filename: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const lines = content.split('\n');

  let h1Count = 0;
  let prevHeadingLevel = 0;
  let lineNumber = 0;

  // Skip frontmatter
  let inFrontmatter = false;
  for (const line of lines) {
    lineNumber++;
    
    if (line.trim() === '---') {
      inFrontmatter = !inFrontmatter;
      continue;
    }
    
    if (inFrontmatter) continue;

    // Check for headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      
      if (level === 1) {
        h1Count++;
      }

      // Check for heading level jumps (e.g., h1 to h3)
      if (prevHeadingLevel > 0 && level > prevHeadingLevel + 1) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'warning',
          type: 'structure',
          message: `Heading level jump from h${prevHeadingLevel} to h${level}`,
          suggestion: `Use h${prevHeadingLevel + 1} instead`,
          fixable: true,
        });
      }
      
      prevHeadingLevel = level;
    }

    // Check for empty links
    const emptyLinkMatch = line.match(/\[([^\]]*)\]\(\s*\)/g);
    if (emptyLinkMatch) {
      issues.push({
        file: filename,
        line: lineNumber,
        severity: 'error',
        type: 'links',
        message: 'Empty link found',
        suggestion: 'Add a URL or remove the link',
        fixable: false,
      });
    }

    // Check for TODO/FIXME comments
    if (/\b(TODO|FIXME|XXX|HACK)\b/i.test(line)) {
      issues.push({
        file: filename,
        line: lineNumber,
        severity: 'info',
        type: 'structure',
        message: 'Found TODO/FIXME comment',
        suggestion: 'Address the comment before publishing',
        fixable: false,
      });
    }
  }

  // Check for multiple h1 headings
  if (h1Count > 1) {
    issues.push({
      file: filename,
      severity: 'warning',
      type: 'structure',
      message: `Document has ${h1Count} h1 headings, should have only one`,
      suggestion: 'Use h2 or lower for subsequent headings',
      fixable: false,
    });
  }

  // Check if document has any content
  const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---/, '').trim();
  if (contentWithoutFrontmatter.length === 0) {
    issues.push({
      file: filename,
      severity: 'error',
      type: 'structure',
      message: 'Document has no content after frontmatter',
      suggestion: 'Add content to the document',
      fixable: false,
    });
  }

  return issues;
}

/**
 * Extracts and validates links from content
 * 
 * @param content - Markdown content
 * @param filename - Source filename
 * @param allFiles - List of all content files for internal link validation
 * @returns Array of validation issues
 */
export function validateLinks(
  content: string,
  filename: string,
  allFiles: string[] = []
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const lines = content.split('\n');

  // Regular expression for markdown links
  const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
  
  let lineNumber = 0;
  let inFrontmatter = false;

  for (const line of lines) {
    lineNumber++;
    
    if (line.trim() === '---') {
      inFrontmatter = !inFrontmatter;
      continue;
    }
    
    if (inFrontmatter) continue;

    let match;
    while ((match = linkRegex.exec(line)) !== null) {
      const [, linkText, url] = match;
      
      // Check for empty link text
      if (!linkText.trim()) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'warning',
          type: 'links',
          message: `Link has empty text: ${url}`,
          suggestion: 'Add descriptive link text',
          fixable: false,
        });
      }

      // Check internal links
      if (url.startsWith('./') || url.startsWith('../') || (!url.startsWith('http') && !url.startsWith('#') && !url.startsWith('mailto:'))) {
        // Normalize the path
        const normalizedUrl = url.split('#')[0].split('?')[0];
        
        if (normalizedUrl && allFiles.length > 0) {
          // Check if internal link target exists
          const targetExists = allFiles.some(f => 
            f.endsWith(normalizedUrl) || 
            f.endsWith(normalizedUrl + '.md') ||
            f.endsWith(normalizedUrl + '.mdx')
          );
          
          if (!targetExists && normalizedUrl !== '') {
            issues.push({
              file: filename,
              line: lineNumber,
              severity: 'warning',
              type: 'links',
              message: `Internal link may be broken: ${url}`,
              suggestion: 'Verify the link target exists',
              fixable: false,
            });
          }
        }
      }

      // Check for placeholder URLs
      if (url === '#' || url === 'TODO' || url === 'TBD') {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'warning',
          type: 'links',
          message: `Placeholder link found: ${url}`,
          suggestion: 'Replace with actual URL',
          fixable: false,
        });
      }
    }
  }

  return issues;
}

/**
 * Validates image references in content
 * 
 * @param content - Markdown content
 * @param filename - Source filename
 * @param imageFiles - List of available image files
 * @returns Array of validation issues
 */
export function validateImages(
  content: string,
  filename: string,
  imageFiles: string[] = []
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const lines = content.split('\n');

  // Regular expression for markdown images
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  
  let lineNumber = 0;
  let inFrontmatter = false;

  for (const line of lines) {
    lineNumber++;
    
    if (line.trim() === '---') {
      inFrontmatter = !inFrontmatter;
      continue;
    }
    
    if (inFrontmatter) continue;

    let match;
    while ((match = imageRegex.exec(line)) !== null) {
      const [, altText, src] = match;
      
      // Check for missing alt text (accessibility)
      if (!altText.trim()) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'warning',
          type: 'images',
          message: `Image missing alt text: ${src}`,
          suggestion: 'Add descriptive alt text for accessibility',
          fixable: false,
        });
      }

      // Check local images
      if (!src.startsWith('http') && !src.startsWith('data:')) {
        const normalizedSrc = src.split('?')[0];
        
        if (imageFiles.length > 0) {
          const imageExists = imageFiles.some(f => f.endsWith(normalizedSrc));
          
          if (!imageExists) {
            issues.push({
              file: filename,
              line: lineNumber,
              severity: 'warning',
              type: 'images',
              message: `Image file may not exist: ${src}`,
              suggestion: 'Verify the image file exists',
              fixable: false,
            });
          }
        }
      }
    }
  }

  return issues;
}

/**
 * Main validation function that runs all validations
 * 
 * @param files - Array of file objects with path and content
 * @param options - Validation options
 * @returns Validation result with all issues
 * 
 * @example
 * ```typescript
 * const result = validateContent([
 *   { path: 'getting-started.md', content: '...' },
 *   { path: 'api-reference.md', content: '...' },
 * ], {
 *   validationTypes: ['structure', 'frontmatter', 'links'],
 * });
 * 
 * if (!result.valid) {
 *   console.log('Validation errors:', result.issues);
 * }
 * ```
 */
export function validateContent(
  files: Array<{ path: string; content: string; frontmatter?: Record<string, unknown> }>,
  options: Partial<ValidationOptions> = {}
): ValidationResult {
  const {
    validationTypes = ['all'],
    frontmatterSchema = DEFAULT_FRONTMATTER_SCHEMA,
  } = options;

  const allIssues: ValidationIssue[] = [];
  const allFilePaths = files.map(f => f.path);
  const shouldValidate = (type: ValidationType) => 
    validationTypes.includes('all') || validationTypes.includes(type);

  for (const file of files) {
    // Validate frontmatter
    if (shouldValidate('frontmatter') && file.frontmatter) {
      const frontmatterIssues = validateFrontmatter(
        file.frontmatter,
        frontmatterSchema,
        file.path
      );
      allIssues.push(...frontmatterIssues);
    }

    // Validate structure
    if (shouldValidate('structure')) {
      const structureIssues = validateStructure(file.content, file.path);
      allIssues.push(...structureIssues);
    }

    // Validate links
    if (shouldValidate('links')) {
      const linkIssues = validateLinks(file.content, file.path, allFilePaths);
      allIssues.push(...linkIssues);
    }

    // Validate images
    if (shouldValidate('images')) {
      const imageIssues = validateImages(file.content, file.path);
      allIssues.push(...imageIssues);
    }
  }

  // Calculate summary
  const summary = {
    errors: allIssues.filter(i => i.severity === 'error').length,
    warnings: allIssues.filter(i => i.severity === 'warning').length,
    info: allIssues.filter(i => i.severity === 'info').length,
  };

  return {
    valid: summary.errors === 0,
    filesValidated: files.length,
    issues: allIssues,
    summary,
  };
}

/**
 * Creates a formatted report from validation results
 */
export function formatValidationReport(result: ValidationResult): string {
  const lines: string[] = [];
  
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('                    Content Validation Report                    ');
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('');
  lines.push(`Files validated: ${result.filesValidated}`);
  lines.push(`Status: ${result.valid ? '✓ PASSED' : '✗ FAILED'}`);
  lines.push('');
  lines.push('Summary:');
  lines.push(`  ✗ Errors:   ${result.summary.errors}`);
  lines.push(`  ⚠ Warnings: ${result.summary.warnings}`);
  lines.push(`  ℹ Info:     ${result.summary.info}`);
  lines.push('');

  if (result.issues.length > 0) {
    lines.push('Issues:');
    lines.push('───────────────────────────────────────────────────────────────');
    
    // Group by file
    const byFile = new Map<string, ValidationIssue[]>();
    for (const issue of result.issues) {
      const existing = byFile.get(issue.file) || [];
      existing.push(issue);
      byFile.set(issue.file, existing);
    }

    for (const [file, issues] of byFile) {
      lines.push('');
      lines.push(`📄 ${file}`);
      
      for (const issue of issues) {
        const icon = issue.severity === 'error' ? '✗' : issue.severity === 'warning' ? '⚠' : 'ℹ';
        const line = issue.line ? `:${issue.line}` : '';
        lines.push(`  ${icon} [${issue.type}]${line}: ${issue.message}`);
        if (issue.suggestion) {
          lines.push(`    └─ Suggestion: ${issue.suggestion}`);
        }
      }
    }
  }

  lines.push('');
  lines.push('═══════════════════════════════════════════════════════════════');

  return lines.join('\n');
}

// ============================================================================
// Exports
// ============================================================================

export const validation = {
  validateContent,
  validateFrontmatter,
  validateStructure,
  validateLinks,
  validateImages,
  formatValidationReport,
  DEFAULT_FRONTMATTER_SCHEMA,
};

export default validation;
