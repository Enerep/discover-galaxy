import type { Claim, Entity, EntityType, Evidence, Snapshot } from './types.ts';
import { validateDataset } from './validate.ts';

export function loadDataset(input: unknown): Snapshot {
  const result = validateDataset(input);
  if (!result.valid) throw new Error(`Unable to load knowledge dataset: ${result.errors.join('; ')}`);
  return input as Snapshot;
}

export function normalizeSearch(value: string): string {
  return value.normalize('NFKD').replace(/\p{Diacritic}/gu, '').toLowerCase()
    .replace(/[\u2018\u2019\u02bc'`]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

/** Search identifies curated records; it never invents entities or resolves ambiguous aliases. */
export function searchEntities(snapshot: Snapshot, query: string, type: EntityType | 'all' = 'all'): Entity[] {
  const terms = normalizeSearch(query).split(' ').filter(Boolean);
  return snapshot.entities.filter((entity) => {
    if (type !== 'all' && entity.type !== type) return false;
    const haystack = normalizeSearch([
      entity.label, entity.id, ...entity.aliases,
      ...entity.external_ids.flatMap(({ namespace, value }) => [value, `${namespace} ${value}`]),
    ].join(' '));
    return terms.every((term) => haystack.includes(term));
  });
}

export function getEntityClaims(snapshot: Snapshot, entityId: string): Claim[] {
  const entity = snapshot.entities.find(({ id }) => id === entityId);
  if (entity?.type === 'paper') {
    const claimIds = new Set(snapshot.evidence.filter(({ source_id }) => source_id === entity.source_id).map(({ claim_id }) => claim_id));
    return snapshot.claims.filter(({ id }) => claimIds.has(id));
  }
  return snapshot.claims.filter(({ subject_id, object_id }) => subject_id === entityId || object_id === entityId);
}

export function getClaimEvidence(snapshot: Snapshot, claimId: string): Evidence[] {
  return snapshot.evidence.filter(({ claim_id }) => claim_id === claimId);
}
