import type { Claim, Snapshot, Source } from './types.ts';

export function sourceAuthor(source: Source): string {
  if (source.kind === 'database_record') return source.provider ?? 'Database';
  const first = source.authors[0];
  if (!first) return 'Author not recorded';
  return source.authors.length === 1 ? first : `${first.split(' ').at(-1)} et al.`;
}

export function sourceCitation(source: Source): string {
  return `${sourceAuthor(source)}${source.year ? ` · ${source.year}` : ''}`;
}

export function findingLabel(snapshot: Snapshot, claim: Claim): string {
  if (typeof claim.context.binding_condition === 'string') {
    const sourceIds = new Set(snapshot.evidence.filter(({ claim_id }) => claim_id === claim.id).map(({ source_id }) => source_id));
    const sources = snapshot.sources.filter(({ id, kind }) => sourceIds.has(id) && kind === 'publication');
    if (sources.length === 1) return `${sourceCitation(sources[0])} · ${claim.context.binding_condition}`;
  }
  const subject = snapshot.entities.find(({ id }) => id === claim.subject_id);
  const object = snapshot.entities.find(({ id }) => id === claim.object_id);
  return String(claim.context.variant ?? `${subject?.label ?? claim.subject_id} · ${claim.predicate.replaceAll('_', ' ')} · ${object?.label ?? claim.object_id}`);
}
