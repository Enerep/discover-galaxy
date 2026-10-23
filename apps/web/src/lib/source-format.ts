import type { Source } from './types.ts';

export function sourceAuthor(source: Source): string {
  if (source.kind === 'database_record') return source.provider ?? 'Database';
  const first = source.authors[0];
  if (!first) return 'Author not recorded';
  return source.authors.length === 1 ? first : `${first.split(' ').at(-1)} et al.`;
}

export function sourceCitation(source: Source): string {
  return `${sourceAuthor(source)}${source.year ? ` · ${source.year}` : ''}`;
}
