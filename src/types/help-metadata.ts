export interface HelpMetadata {
  id: string;
  title: string;
  description?: string;
  version?: string;
  order?: number;
  prevDoc?: string;
  nextDoc?: string;
  createdAt?: string;
  updatedAt?: string;
  category: string;
  tags: string[];
}
