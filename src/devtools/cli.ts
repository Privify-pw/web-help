/**
 * CLI Scaffolding Tools for @piikeep/web-help
 * Provides programmatic CLI functionality for initializing and managing help content
 * @module @piikeep/web-help/devtools/cli
 */

import type {
  InitOptions,
  AddArticleOptions,
  CLIResult,
  ArticleTemplate,
  TemplateContent,
} from './types';

// ============================================================================
// Templates
// ============================================================================

const ARTICLE_TEMPLATES: Record<ArticleTemplate, TemplateContent> = {
  basic: {
    name: 'basic',
    description: 'A simple article template with minimal structure',
    frontmatter: {
      title: '',
      description: '',
      category: 'general',
      tags: [],
      author: '',
      createdAt: '',
      updatedAt: '',
    },
    content: `# {{title}}

{{description}}

## Overview

Add your content here.

## Details

Provide detailed information about the topic.

## Related Topics

- [Link to related topic 1](#)
- [Link to related topic 2](#)
`,
  },
  tutorial: {
    name: 'tutorial',
    description: 'Step-by-step tutorial template',
    frontmatter: {
      title: '',
      description: '',
      category: 'tutorials',
      tags: ['tutorial'],
      difficulty: 'beginner',
      estimatedTime: '10 minutes',
      prerequisites: [],
      author: '',
      createdAt: '',
      updatedAt: '',
    },
    content: `# {{title}}

{{description}}

## Prerequisites

Before you begin, make sure you have:

- Prerequisite 1
- Prerequisite 2

## What You'll Learn

By the end of this tutorial, you will be able to:

- Learning outcome 1
- Learning outcome 2

## Step 1: Getting Started

Description of the first step.

\`\`\`typescript
// Example code
\`\`\`

## Step 2: Next Steps

Description of the second step.

## Step 3: Final Steps

Description of the final step.

## Summary

Recap what was covered in this tutorial.

## Next Steps

- [Next tutorial](#)
- [Related documentation](#)
`,
  },
  reference: {
    name: 'reference',
    description: 'API reference documentation template',
    frontmatter: {
      title: '',
      description: '',
      category: 'reference',
      tags: ['api', 'reference'],
      version: '1.0.0',
      author: '',
      createdAt: '',
      updatedAt: '',
    },
    content: `# {{title}}

{{description}}

## Syntax

\`\`\`typescript
// Syntax example
\`\`\`

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| param1 | string | Yes | Description of param1 |
| param2 | number | No | Description of param2 |

## Return Value

Description of the return value.

## Examples

### Basic Usage

\`\`\`typescript
// Basic example
\`\`\`

### Advanced Usage

\`\`\`typescript
// Advanced example
\`\`\`

## Notes

- Important note 1
- Important note 2

## See Also

- [Related API](#)
- [Related Guide](#)
`,
  },
  faq: {
    name: 'faq',
    description: 'Frequently asked questions template',
    frontmatter: {
      title: '',
      description: '',
      category: 'faq',
      tags: ['faq', 'help'],
      author: '',
      createdAt: '',
      updatedAt: '',
    },
    content: `# {{title}}

{{description}}

## General Questions

### Question 1?

Answer to question 1.

### Question 2?

Answer to question 2.

## Technical Questions

### Technical Question 1?

Answer with code example:

\`\`\`typescript
// Example code
\`\`\`

### Technical Question 2?

Detailed technical answer.

## Troubleshooting

### Common Issue 1

**Problem**: Description of the problem.

**Solution**: Steps to resolve the issue.

### Common Issue 2

**Problem**: Description of the problem.

**Solution**: Steps to resolve the issue.

## Still Need Help?

If you can't find the answer you're looking for:

- [Contact Support](#)
- [Community Forums](#)
`,
  },
  troubleshooting: {
    name: 'troubleshooting',
    description: 'Troubleshooting guide template',
    frontmatter: {
      title: '',
      description: '',
      category: 'troubleshooting',
      tags: ['troubleshooting', 'help'],
      author: '',
      createdAt: '',
      updatedAt: '',
    },
    content: `# {{title}}

{{description}}

## Common Issues

### Issue: Problem Description

**Symptoms**:
- Symptom 1
- Symptom 2

**Cause**: Explanation of what causes this issue.

**Solution**:
1. Step 1 to fix
2. Step 2 to fix
3. Step 3 to fix

**Prevention**: How to prevent this issue in the future.

---

### Issue: Another Problem

**Symptoms**:
- Symptom 1

**Cause**: Explanation.

**Solution**:
1. Fix step 1

## Diagnostic Steps

### Checking Logs

\`\`\`bash
# Command to check logs
\`\`\`

### Verifying Configuration

Steps to verify your configuration is correct.

## Getting Help

If these solutions don't resolve your issue:

1. Check our [FAQ](#)
2. Search [existing issues](#)
3. [Contact support](#)
`,
  },
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Converts a title to a URL-friendly slug
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Gets the current date in ISO format
 */
function getISODate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Generates frontmatter YAML from an object
 */
function generateFrontmatter(data: Record<string, unknown>): string {
  const lines = ['---'];
  
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${key}: []`);
      } else {
        lines.push(`${key}:`);
        value.forEach(item => lines.push(`  - ${item}`));
      }
    } else if (typeof value === 'object') {
      lines.push(`${key}:`);
      for (const [subKey, subValue] of Object.entries(value as Record<string, unknown>)) {
        lines.push(`  ${subKey}: ${subValue}`);
      }
    } else {
      lines.push(`${key}: ${value}`);
    }
  }
  
  lines.push('---');
  return lines.join('\n');
}

// ============================================================================
// CLI Functions
// ============================================================================

/**
 * Generates initialization files for a new help content project
 * Returns the file contents that would be created (for use in browser environments)
 * 
 * @param options - Initialization options
 * @returns Result containing file contents to be created
 */
export function generateInitFiles(options: InitOptions = {}): {
  files: Array<{ path: string; content: string }>;
  result: CLIResult;
} {
  const {
    contentDir = './help-content',
    formats = ['md'],
    includeExamples = true,
    storageType = 'localStorage',
    typescript = true,
  } = options;

  const files: Array<{ path: string; content: string }> = [];
  const warnings: string[] = [];

  // Generate help.config.ts or help.config.js
  const configExt = typescript ? 'ts' : 'js';
  const configContent = typescript
    ? `import type { HelpConfig } from '@piikeep/web-help';

const helpConfig: HelpConfig = {
  content: {
    source: 'static',
    basePath: '${contentDir}',
    formats: ${JSON.stringify(formats)},
  },
  storage: {
    type: '${storageType}',
    prefix: 'help_',
  },
  search: {
    enabled: true,
    type: 'client',
    options: {
      threshold: 0.3,
      keys: ['title', 'content', 'tags', 'description'],
    },
  },
  navigation: {
    showTOC: true,
    showBreadcrumbs: true,
    showPagination: true,
  },
};

export default helpConfig;
`
    : `/** @type {import('@piikeep/web-help').HelpConfig} */
const helpConfig = {
  content: {
    source: 'static',
    basePath: '${contentDir}',
    formats: ${JSON.stringify(formats)},
  },
  storage: {
    type: '${storageType}',
    prefix: 'help_',
  },
  search: {
    enabled: true,
    type: 'client',
    options: {
      threshold: 0.3,
      keys: ['title', 'content', 'tags', 'description'],
    },
  },
  navigation: {
    showTOC: true,
    showBreadcrumbs: true,
    showPagination: true,
  },
};

module.exports = helpConfig;
`;

  files.push({
    path: `help.config.${configExt}`,
    content: configContent,
  });

  // Create content directory structure
  files.push({
    path: `${contentDir}/.gitkeep`,
    content: '',
  });

  files.push({
    path: `${contentDir}/images/.gitkeep`,
    content: '',
  });

  // Create example content if requested
  if (includeExamples) {
    const gettingStartedContent = `---
title: Getting Started
description: Learn how to get started with our application
category: getting-started
tags:
  - introduction
  - quickstart
order: 1
createdAt: ${getISODate()}
updatedAt: ${getISODate()}
---

# Getting Started

Welcome to the documentation! This guide will help you get up and running quickly.

## Prerequisites

Before you begin, make sure you have:

- Node.js 18 or later
- npm or yarn package manager

## Installation

Install the package using npm:

\`\`\`bash
npm install @piikeep/web-help
\`\`\`

Or using yarn:

\`\`\`bash
yarn add @piikeep/web-help
\`\`\`

## Quick Start

1. Import the components you need
2. Wrap your app with the HelpProvider
3. Add help components where needed

\`\`\`tsx
import { HelpProvider, HelpPage } from '@piikeep/web-help';

function App() {
  return (
    <HelpProvider config={helpConfig}>
      <HelpPage />
    </HelpProvider>
  );
}
\`\`\`

## Next Steps

- [Configuration Guide](./configuration.md)
- [API Reference](./api-reference.md)
`;

    files.push({
      path: `${contentDir}/getting-started.md`,
      content: gettingStartedContent,
    });

    // Add an index/manifest file
    const manifestContent = `{
  "title": "Help Documentation",
  "description": "Documentation for the application",
  "version": "1.0.0",
  "categories": [
    {
      "id": "getting-started",
      "title": "Getting Started",
      "order": 1
    },
    {
      "id": "guides",
      "title": "Guides",
      "order": 2
    },
    {
      "id": "reference",
      "title": "API Reference",
      "order": 3
    }
  ]
}
`;

    files.push({
      path: `${contentDir}/manifest.json`,
      content: manifestContent,
    });
  }

  return {
    files,
    result: {
      success: true,
      message: `Generated ${files.length} files for help content initialization`,
      files: files.map(f => f.path),
      warnings: warnings.length > 0 ? warnings : undefined,
    },
  };
}

/**
 * Generates content for a new help article
 * 
 * @param options - Options for the new article
 * @returns Generated article content and metadata
 */
export function generateArticle(options: AddArticleOptions): {
  path: string;
  content: string;
  result: CLIResult;
} {
  const {
    title,
    slug = slugify(title),
    category = 'general',
    tags = [],
    format = 'md',
    template = 'basic',
    outputDir = './help-content',
  } = options;

  const templateData = ARTICLE_TEMPLATES[template];
  const date = getISODate();

  // Build frontmatter
  const frontmatter: Record<string, unknown> = {
    ...templateData.frontmatter,
    title,
    description: `Documentation for ${title}`,
    category,
    tags,
    createdAt: date,
    updatedAt: date,
  };

  // Process content template
  const content = templateData.content
    .replace(/\{\{title\}\}/g, title)
    .replace(/\{\{description\}\}/g, frontmatter.description as string);

  // Generate full article content
  const fullContent = generateFrontmatter(frontmatter) + '\n' + content;

  const filePath = `${outputDir}/${slug}.${format}`;

  return {
    path: filePath,
    content: fullContent,
    result: {
      success: true,
      message: `Generated article: ${title}`,
      files: [filePath],
    },
  };
}

/**
 * Gets available article templates
 * 
 * @returns Array of available templates with descriptions
 */
export function getArticleTemplates(): Array<{
  name: ArticleTemplate;
  description: string;
}> {
  return Object.values(ARTICLE_TEMPLATES).map(t => ({
    name: t.name,
    description: t.description,
  }));
}

/**
 * Gets a specific article template
 * 
 * @param templateName - Name of the template to retrieve
 * @returns Template content or undefined if not found
 */
export function getArticleTemplate(templateName: ArticleTemplate): TemplateContent | undefined {
  return ARTICLE_TEMPLATES[templateName];
}

// ============================================================================
// Exports
// ============================================================================

export const cli = {
  generateInitFiles,
  generateArticle,
  getArticleTemplates,
  getArticleTemplate,
  slugify,
};

export default cli;
