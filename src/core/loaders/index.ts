/**
 * Loaders Index for the Web Help Component Library
 * @module @piikeep-pw/web-help/loaders
 */

// Parsers
export { createMarkdownParser } from './markdownParser';
export { createJsonParser } from './jsonParser';
export { createCsvParser } from './csvParser';
export { createMdxParser } from './mdxParser';

// Loaders
export { StaticContentLoader, createStaticLoader } from './staticLoader';

// Format Detection
export {
  ContentFormatDetector,
  createFormatDetector,
} from './contentFormatDetector';

// Search Adapters
export { FuseSearchAdapter, SimpleSearchAdapter } from './searchAdapters';

// Re-export types
export type {
  ContentParser,
  ParseResult,
  ParserOptions,
  FrontmatterResult,
} from '../types/parser';
export type { JsonHelpContent, JsonContentBlock } from './jsonParser';
export type { CsvParserOptions } from './csvParser';
export type { MdxParserOptions, ExtractedComponent } from './mdxParser';
export type { FormatDetectionResult } from './contentFormatDetector';
