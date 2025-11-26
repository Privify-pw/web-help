import type { HelpMetadata } from '@/types';

export const parseMarkdown = (
  text: string,
): { content: string; metadata: HelpMetadata } => {
  const metadataRegex = /---\n([\s\S]*?)\n---/;
  const metadataMatch = text.match(metadataRegex);

  const metadata: HelpMetadata = {
    id: '',
    title: '',
    category: '',
    tags: [],
  };

  let content = text;

  if (metadataMatch) {
    const metadataString = metadataMatch[1];
    const metadataLines = metadataString.split('\n');

    metadataLines.forEach((line) => {
      const [key, ...rest] = line.split(':');
      const value = rest.join(':').trim();

      switch (key.trim()) {
        case 'id':
          metadata.id = value;
          break;
        case 'title':
          metadata.title = value;
          break;
        case 'description':
          metadata.description = value;
          break;
        case 'version':
          metadata.version = value;
          break;
        case 'order':
          metadata.order = Number(value);
          break;
        case 'prevDoc':
          metadata.prevDoc = value;
          break;
        case 'nextDoc':
          metadata.nextDoc = value;
          break;
        case 'createdAt':
          metadata.createdAt = value;
          break;
        case 'updatedAt':
          metadata.updatedAt = value;
          break;
        case 'category':
          metadata.category = value;
          break;
        case 'tags':
          metadata.tags = value.split(',').map((tag) => tag.trim());
          break;
      }
    });

    content = text.replace(metadataRegex, '').trim();
  }

  return { content, metadata };
};
