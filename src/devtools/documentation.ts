/**
 * Documentation Generation Utilities for @piikeep/web-help
 * Tools for generating API documentation from TypeScript source
 * @module @piikeep/web-help/devtools/documentation
 */

import type {
  DocGeneratorOptions,
  APIDocumentation,
} from './types';

// ============================================================================
// Documentation Extraction
// ============================================================================

/**
 * Regular expressions for parsing TypeScript/JSDoc
 */
const PATTERNS = {
  // Match JSDoc comment blocks
  jsdoc: /\/\*\*\s*([\s\S]*?)\s*\*\//g,
  
  // Match @tag annotations
  jsdocTag: /@(\w+)\s*(?:\{([^}]*)\})?\s*([^\n@]*)?/g,
  
  // Match function/component declarations
  functionDecl: /export\s+(?:const|function)\s+(\w+)\s*(?:<[^>]*>)?\s*(?:=\s*)?(?:\([^)]*\)|\([^)]*\)\s*=>)/g,
  
  // Match interface declarations
  interfaceDecl: /export\s+(?:interface|type)\s+(\w+)\s*(?:<[^>]*>)?\s*[={]/g,
  
  // Match React FC/component patterns
  reactComponent: /export\s+(?:const|function)\s+(\w+)\s*:\s*(?:React\.)?FC/,
  
  // Match hook patterns
  hookPattern: /^use[A-Z]/,
};

/**
 * Parses a JSDoc comment block into structured data
 * 
 * @param comment - Raw JSDoc comment content
 * @returns Parsed documentation data
 */
export function parseJSDoc(comment: string): {
  description: string;
  tags: Record<string, string[]>;
  params: Array<{ name: string; type?: string; description?: string }>;
  returns?: { type?: string; description?: string };
  examples: string[];
} {
  const tags: Record<string, string[]> = {};
  const params: Array<{ name: string; type?: string; description?: string }> = [];
  const examples: string[] = [];
  let returns: { type?: string; description?: string } | undefined;
  
  // Clean up the comment
  const cleanComment = comment
    .replace(/^\s*\*\s?/gm, '')
    .trim();
  
  // Extract description (text before first @tag)
  const descMatch = cleanComment.match(/^([\s\S]*?)(?=@\w+|$)/);
  const description = descMatch ? descMatch[1].trim() : '';
  
  // Extract tags
  let tagMatch;
  const tagRegex = /@(\w+)\s*(?:\{([^}]*)\})?\s*(\S+)?\s*-?\s*([^\n@]*)?/g;
  
  while ((tagMatch = tagRegex.exec(cleanComment)) !== null) {
    const [, tagName, type, name, desc] = tagMatch;
    
    switch (tagName) {
      case 'param':
        params.push({
          name: name || '',
          type: type,
          description: desc?.trim(),
        });
        break;
      case 'returns':
      case 'return':
        returns = {
          type: type,
          description: (name ? name + ' ' : '') + (desc || '').trim(),
        };
        break;
      case 'example': {
        // Collect example content
        const exampleStart = cleanComment.indexOf(tagMatch[0]);
        const nextTagMatch = cleanComment.slice(exampleStart + tagMatch[0].length).match(/@\w+/);
        const exampleEnd = nextTagMatch 
          ? exampleStart + tagMatch[0].length + nextTagMatch.index!
          : cleanComment.length;
        const exampleContent = cleanComment
          .slice(exampleStart + '@example'.length, exampleEnd)
          .trim();
        if (exampleContent) {
          examples.push(exampleContent);
        }
        break;
      }
      default:
        if (!tags[tagName]) {
          tags[tagName] = [];
        }
        tags[tagName].push((type ? `{${type}} ` : '') + (name || '') + (desc ? ' ' + desc : '').trim());
    }
  }
  
  return { description, tags, params, returns, examples };
}

/**
 * Extracts documentation from TypeScript source code
 * 
 * @param sourceCode - TypeScript source code
 * @param sourceFile - Source file path
 * @returns Array of extracted API documentation
 */
export function extractDocumentation(
  sourceCode: string,
  sourceFile: string
): APIDocumentation[] {
  const docs: APIDocumentation[] = [];
  const lines = sourceCode.split('\n');
  
  // Find all JSDoc comments and their following declarations
  let currentJSDoc: string | null = null;
  let inJSDoc = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Track JSDoc blocks
    if (line.includes('/**')) {
      inJSDoc = true;
      currentJSDoc = '';
    }
    
    if (inJSDoc) {
      currentJSDoc += line + '\n';
    }
    
    if (line.includes('*/') && inJSDoc) {
      inJSDoc = false;
      continue;
    }
    
    // Check for export declaration after JSDoc
    if (currentJSDoc && !inJSDoc) {
      // Check for function/const export
      const funcMatch = line.match(/export\s+(?:const|function)\s+(\w+)/);
      const interfaceMatch = line.match(/export\s+(?:interface|type)\s+(\w+)/);
      
      if (funcMatch) {
        const name = funcMatch[1];
        const parsed = parseJSDoc(currentJSDoc);
        
        // Determine type
        let docType: APIDocumentation['type'] = 'function';
        if (PATTERNS.hookPattern.test(name)) {
          docType = 'hook';
        } else if (line.includes('React.FC') || line.includes(': FC')) {
          docType = 'component';
        }
        
        docs.push({
          name,
          type: docType,
          description: parsed.description,
          props: parsed.params.map(p => ({
            name: p.name,
            type: p.type || 'unknown',
            required: !p.name.includes('?'),
            description: p.description,
          })),
          returns: parsed.returns?.type ? {
            type: parsed.returns.type,
            description: parsed.returns.description,
          } : undefined,
          examples: parsed.examples,
          sourceFile,
          line: i + 1,
        });
        
        currentJSDoc = null;
      } else if (interfaceMatch) {
        const name = interfaceMatch[1];
        const parsed = parseJSDoc(currentJSDoc);
        
        docs.push({
          name,
          type: line.includes('interface') ? 'interface' : 'type',
          description: parsed.description,
          examples: parsed.examples,
          sourceFile,
          line: i + 1,
        });
        
        currentJSDoc = null;
      } else if (!line.trim() || line.trim().startsWith('//')) {
        // Keep JSDoc for next non-empty line
      } else {
        // No matching export found, discard JSDoc
        currentJSDoc = null;
      }
    }
  }
  
  return docs;
}

/**
 * Generates markdown documentation from API documentation
 * 
 * @param docs - Array of API documentation objects
 * @param options - Generation options
 * @returns Markdown content
 */
export function generateMarkdownDocs(
  docs: APIDocumentation[],
  options: { includeExamples?: boolean; groupByType?: boolean } = {}
): string {
  const { includeExamples = true, groupByType = true } = options;
  const lines: string[] = [];
  
  lines.push('# API Reference');
  lines.push('');
  lines.push('> Auto-generated documentation for @piikeep/web-help');
  lines.push('');
  
  if (groupByType) {
    // Group by type
    const grouped = new Map<string, APIDocumentation[]>();
    
    for (const doc of docs) {
      const existing = grouped.get(doc.type) || [];
      existing.push(doc);
      grouped.set(doc.type, existing);
    }
    
    const typeOrder = ['component', 'hook', 'function', 'interface', 'type'];
    const typeLabels: Record<string, string> = {
      component: 'Components',
      hook: 'Hooks',
      function: 'Functions',
      interface: 'Interfaces',
      type: 'Types',
    };
    
    for (const type of typeOrder) {
      const items = grouped.get(type);
      if (!items || items.length === 0) continue;
      
      lines.push(`## ${typeLabels[type] || type}`);
      lines.push('');
      
      for (const doc of items) {
        lines.push(...generateDocSection(doc, includeExamples));
      }
    }
  } else {
    // Sort alphabetically
    const sorted = [...docs].sort((a, b) => a.name.localeCompare(b.name));
    
    for (const doc of sorted) {
      lines.push(...generateDocSection(doc, includeExamples));
    }
  }
  
  return lines.join('\n');
}

/**
 * Generates a documentation section for a single API item
 */
function generateDocSection(doc: APIDocumentation, includeExamples: boolean): string[] {
  const lines: string[] = [];
  
  lines.push(`### ${doc.name}`);
  lines.push('');
  
  if (doc.description) {
    lines.push(doc.description);
    lines.push('');
  }
  
  // Source location
  lines.push(`*Defined in: \`${doc.sourceFile}:${doc.line}\`*`);
  lines.push('');
  
  // Props/Parameters
  if (doc.props && doc.props.length > 0) {
    lines.push('#### Parameters');
    lines.push('');
    lines.push('| Name | Type | Required | Description |');
    lines.push('|------|------|----------|-------------|');
    
    for (const prop of doc.props) {
      const required = prop.required ? 'Yes' : 'No';
      const desc = prop.description || '-';
      lines.push(`| \`${prop.name}\` | \`${prop.type}\` | ${required} | ${desc} |`);
    }
    lines.push('');
  }
  
  // Return value
  if (doc.returns) {
    lines.push('#### Returns');
    lines.push('');
    if (doc.returns.type) {
      lines.push(`\`${doc.returns.type}\``);
    }
    if (doc.returns.description) {
      lines.push('');
      lines.push(doc.returns.description);
    }
    lines.push('');
  }
  
  // Examples
  if (includeExamples && doc.examples && doc.examples.length > 0) {
    lines.push('#### Example');
    lines.push('');
    for (const example of doc.examples) {
      // Check if example already has code fence
      if (example.startsWith('```')) {
        lines.push(example);
      } else {
        lines.push('```tsx');
        lines.push(example);
        lines.push('```');
      }
      lines.push('');
    }
  }
  
  lines.push('---');
  lines.push('');
  
  return lines;
}

/**
 * Generates a JSON representation of the API documentation
 */
export function generateJSONDocs(docs: APIDocumentation[]): string {
  return JSON.stringify(docs, null, 2);
}

/**
 * Creates a documentation index/table of contents
 */
export function generateTableOfContents(docs: APIDocumentation[]): string {
  const lines: string[] = [];
  
  lines.push('# Table of Contents');
  lines.push('');
  
  // Group by type
  const grouped = new Map<string, APIDocumentation[]>();
  
  for (const doc of docs) {
    const existing = grouped.get(doc.type) || [];
    existing.push(doc);
    grouped.set(doc.type, existing);
  }
  
  const typeOrder = ['component', 'hook', 'function', 'interface', 'type'];
  const typeLabels: Record<string, string> = {
    component: 'Components',
    hook: 'Hooks',
    function: 'Functions',
    interface: 'Interfaces',
    type: 'Types',
  };
  
  for (const type of typeOrder) {
    const items = grouped.get(type);
    if (!items || items.length === 0) continue;
    
    lines.push(`## ${typeLabels[type] || type}`);
    lines.push('');
    
    for (const doc of items.sort((a, b) => a.name.localeCompare(b.name))) {
      const desc = doc.description ? ` - ${doc.description.split('\n')[0]}` : '';
      lines.push(`- [${doc.name}](#${doc.name.toLowerCase()})${desc}`);
    }
    lines.push('');
  }
  
  return lines.join('\n');
}

/**
 * Generates complete documentation for a set of source files
 * 
 * @param files - Array of source files with path and content
 * @param options - Generation options
 * @returns Generated documentation
 * 
 * @example
 * ```typescript
 * const result = generateDocs([
 *   { path: 'HelpPage.tsx', content: '...' },
 *   { path: 'useHelp.ts', content: '...' },
 * ], {
 *   format: 'markdown',
 *   includeExamples: true,
 * });
 * ```
 */
export function generateDocs(
  files: Array<{ path: string; content: string }>,
  options: Partial<DocGeneratorOptions> = {}
): {
  documentation: APIDocumentation[];
  markdown: string;
  tableOfContents: string;
  json: string;
} {
  const {
    includeExamples = true,
  } = options;

  // Extract documentation from all files
  const allDocs: APIDocumentation[] = [];
  
  for (const file of files) {
    const docs = extractDocumentation(file.content, file.path);
    allDocs.push(...docs);
  }
  
  return {
    documentation: allDocs,
    markdown: generateMarkdownDocs(allDocs, { includeExamples }),
    tableOfContents: generateTableOfContents(allDocs),
    json: generateJSONDocs(allDocs),
  };
}

// ============================================================================
// Exports
// ============================================================================

export const documentation = {
  parseJSDoc,
  extractDocumentation,
  generateMarkdownDocs,
  generateJSONDocs,
  generateTableOfContents,
  generateDocs,
};

export default documentation;
