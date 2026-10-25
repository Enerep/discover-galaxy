import { getEntityClaims, searchEntities } from './dataset.ts';
import type { Claim, EntityType, Snapshot } from './types.ts';

export interface GraphScope {
  selectedId: string;
  selectedClaimId: string | null;
  mode: 'focus' | 'overview';
  expanded: boolean;
  query: string;
  filter: EntityType | 'all';
}

/** A display projection only: every original finding remains in the inspector. */
export function buildExplorerGraph(snapshot: Snapshot, scope: GraphScope) {
  const filtered = !!scope.query.trim() || scope.filter !== 'all';
  const related = getEntityClaims(snapshot, scope.selectedId);
  let claims = related;
  const ids = new Set<string>([scope.selectedId]);
  const addEndpoints = (records: Claim[]) => {
    for (const claim of records) { ids.add(claim.subject_id); ids.add(claim.object_id); }
  };
  if (filtered) {
    const matches = searchEntities(snapshot, scope.query, scope.filter);
    ids.clear();
    for (const entity of matches) ids.add(entity.id);
    if (scope.query.trim() && scope.filter === 'all') {
      addEndpoints(matches.flatMap(({ id }) => getEntityClaims(snapshot, id)));
    }
    claims = snapshot.claims.filter(({ subject_id, object_id }) => ids.has(subject_id) && ids.has(object_id));
  } else if (scope.mode === 'overview') {
    for (const entity of snapshot.entities) ids.add(entity.id);
    // The complete library stays visible, with only the selection's connections drawn.
  } else {
    addEndpoints(related);
    if (scope.expanded) {
      const centers = new Set(ids);
      claims = snapshot.claims.filter(({ subject_id, object_id }) => centers.has(subject_id) || centers.has(object_id));
      addEndpoints(claims);
    }
  }

  // Several findings can concern the same pair. Draw one line, retaining the
  // selected finding as its action; do not merge or reclassify scientific records.
  const pairs = new Map<string, Claim>();
  for (const claim of claims) {
    const key = [claim.subject_id, claim.object_id].sort().join('|');
    if (!pairs.has(key) || claim.id === scope.selectedClaimId) pairs.set(key, claim);
  }
  const citationPairs = new Map<string, { paperId: string; entityId: string; claimId: string }>();
  for (const paper of snapshot.entities.filter(({ type, id }) => type === 'paper' && ids.has(id))) {
    if (paper.id !== scope.selectedId && !filtered) continue;
    for (const evidence of snapshot.evidence.filter(({ source_id }) => source_id === paper.source_id)) {
      const claim = claims.find(({ id }) => id === evidence.claim_id);
      if (!claim || !ids.has(claim.subject_id)) continue;
      const key = `${paper.id}|${claim.subject_id}`;
      if (!citationPairs.has(key) || claim.id === scope.selectedClaimId) {
        citationPairs.set(key, { paperId: paper.id, entityId: claim.subject_id, claimId: claim.id });
      }
    }
  }
  const entities = snapshot.entities.filter(({ id }) => ids.has(id));
  const directIds = new Set([scope.selectedId, ...related.flatMap(({ subject_id, object_id }) => [subject_id, object_id])]);
  const canExpand = snapshot.claims.some(({ subject_id, object_id }) =>
    (directIds.has(subject_id) && !directIds.has(object_id)) || (directIds.has(object_id) && !directIds.has(subject_id)));
  return {
    ids, entities, claims: [...pairs.values()], citationLinks: [...citationPairs.values()], canExpand,
    focused: !filtered && scope.mode === 'focus', directIds,
  };
}
