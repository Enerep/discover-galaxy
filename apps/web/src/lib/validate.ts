import { ENTITY_TYPES } from './types.ts';
import type { EntityType, Review, Snapshot } from './types.ts';

export interface ValidationResult { valid: boolean; errors: string[]; warnings: string[] }
type ObjectValue = Record<string, unknown>;
const predicates = ['associated_with', 'encodes', 'participates_in', 'interacts_with', 'targets'];
const relations = ['supports', 'refutes', 'mixed', 'unclear'];

/** Structural checks cannot certify scientific accuracy, human review, or redistribution rights. */
export function validateDataset(input: unknown, { release = false }: { release?: boolean } = {}): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const fail = (path: string, message: string) => { errors.push(`${path}: ${message}`); };
  const object = (value: unknown, path: string): ObjectValue | null => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      fail(path, 'expected an object'); return null;
    }
    return value as ObjectValue;
  };
  const text = (value: unknown, path: string, nullable = false) => {
    if (nullable && value === null) return;
    if (typeof value !== 'string' || !value.trim()) fail(path, 'expected a nonempty string');
  };
  const enumeration = (value: unknown, choices: readonly string[], path: string) => {
    if (typeof value !== 'string' || !choices.includes(value)) fail(path, `expected one of ${choices.join(', ')}`);
  };
  const date = (value: unknown, path: string, nullable = false) => {
    if (nullable && value === null) return;
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value) ||
      !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value.slice(0, 10)) fail(path, 'expected a valid ISO date');
  };
  const url = (value: unknown, path: string, nullable = false) => {
    if (nullable && value === null) return;
    try {
      const parsed = new URL(typeof value === 'string' ? value : '');
      if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new Error();
    } catch { fail(path, 'expected an HTTPS URL without credentials'); }
  };
  const array = (value: unknown, path: string, check: (item: unknown, path: string) => void, minimum = 0) => {
    if (!Array.isArray(value)) { fail(path, 'expected an array'); return; }
    if (value.length < minimum) fail(path, `expected at least ${minimum} item(s)`);
    value.forEach((item, index) => check(item, `${path}[${index}]`));
  };
  const strings = (value: unknown, path: string, minimum = 0) => array(value, path, (item, p) => text(item, p), minimum);
  const identifiers = (value: unknown, path: string, minimum = 0) => array(value, path, (item, p) => {
    const record = object(item, p); if (!record) return;
    text(record.namespace, `${p}.namespace`); text(record.value, `${p}.value`);
  }, minimum);
  const context = (value: unknown, path: string) => {
    const record = object(value, path); if (!record) return;
    if (!Object.keys(record).length) fail(path, 'must document study context or explicit unknowns');
    Object.entries(record).forEach(([key, item]) => {
      if (item === null || (typeof item === 'number' && Number.isFinite(item))) return;
      if (typeof item === 'string') { text(item, `${path}.${key}`); return; }
      if (Array.isArray(item)) { strings(item, `${path}.${key}`); return; }
      fail(`${path}.${key}`, 'expected text, a finite number, null, or a text array');
    });
  };
  const review = (value: unknown, path: string) => {
    const record = object(value, path); if (!record) return;
    enumeration(record.status, ['draft', 'approved'], `${path}.status`);
    text(record.reviewer, `${path}.reviewer`, true); date(record.date, `${path}.date`, true);
    text(record.rationale, `${path}.rationale`);
    if (record.human_reviewed !== undefined && typeof record.human_reviewed !== 'boolean') fail(`${path}.human_reviewed`, 'expected a boolean');
    if (record.status === 'approved' && (!record.reviewer || !record.date)) fail(path, 'approved records require an identified reviewer and date');
  };
  const data = object(input, 'dataset');
  const result = () => ({ valid: errors.length === 0, errors, warnings });
  if (!data) return result();
  enumeration(data.schema_version, ['0.1.0'], 'schema_version');
  enumeration(data.release_status, ['development', 'released'], 'release_status');
  text(data.dataset_version, 'dataset_version'); date(data.created_at, 'created_at');
  const scope = object(data.scope, 'scope');
  if (scope) {
    text(scope.disease, 'scope.disease'); text(scope.inclusion_criteria, 'scope.inclusion_criteria'); strings(scope.limitations, 'scope.limitations', 1);
  }
  array(data.upstream_releases, 'upstream_releases', (item, p) => {
    const record = object(item, p); if (!record) return;
    text(record.provider, `${p}.provider`); text(record.release, `${p}.release`, true);
    date(record.accessed_at, `${p}.accessed_at`); url(record.source_url, `${p}.source_url`);
    url(record.reuse_terms_url, `${p}.reuse_terms_url`); text(record.attribution, `${p}.attribution`);
  }, 1);
  array(data.entities, 'entities', (item, p) => {
    const record = object(item, p); if (!record) return;
    text(record.id, `${p}.id`); enumeration(record.type, ENTITY_TYPES, `${p}.type`);
    text(record.label, `${p}.label`); strings(record.aliases, `${p}.aliases`);
    identifiers(record.external_ids, `${p}.external_ids`, record.type === 'paper' ? 0 : 1);
    if (record.description !== undefined) text(record.description, `${p}.description`);
    strings(record.description_claim_ids, `${p}.description_claim_ids`);
    strings(record.provenance_source_ids, `${p}.provenance_source_ids`, 1);
    if (record.type === 'paper' || record.source_id !== undefined) text(record.source_id, `${p}.source_id`);
  }, 1);
  array(data.claims, 'claims', (item, p) => {
    const record = object(item, p); if (!record) return;
    ['id', 'subject_id', 'object_id', 'statement', 'summary'].forEach((key) => text(record[key], `${p}.${key}`));
    enumeration(record.predicate, predicates, `${p}.predicate`); context(record.context, `${p}.context`);
    strings(record.evidence_ids, `${p}.evidence_ids`, 1); strings(record.limitations, `${p}.limitations`, 1); review(record.review, `${p}.review`);
  }, 1);
  array(data.evidence, 'evidence', (item, p) => {
    const record = object(item, p); if (!record) return;
    ['id', 'claim_id', 'source_id', 'finding', 'locator'].forEach((key) => text(record[key], `${p}.${key}`));
    enumeration(record.relation, relations, `${p}.relation`); strings(record.upstream_source_ids, `${p}.upstream_source_ids`);
    context(record.study_context, `${p}.study_context`); strings(record.limitations, `${p}.limitations`, 1); review(record.review, `${p}.review`);
    if (record.source_metrics !== undefined) array(record.source_metrics, `${p}.source_metrics`, (metric, m) => {
      const value = object(metric, m); if (!value) return;
      ['name', 'provider', 'release'].forEach((key) => text(value[key], `${m}.${key}`));
      if (typeof value.value !== 'number' || !Number.isFinite(value.value)) fail(`${m}.value`, 'expected a finite number');
    });
  }, 1);
  array(data.sources, 'sources', (item, p) => {
    const record = object(item, p); if (!record) return;
    ['id', 'title'].forEach((key) => text(record[key], `${p}.${key}`));
    enumeration(record.kind, ['publication', 'database_record'], `${p}.kind`); url(record.url, `${p}.url`);
    identifiers(record.identifiers, `${p}.identifiers`); strings(record.authors, `${p}.authors`); date(record.retrieved_at, `${p}.retrieved_at`);
    if (record.year !== null && (typeof record.year !== 'number' || !Number.isInteger(record.year) || record.year < 1500 || record.year > 2200)) fail(`${p}.year`, 'expected a publication year or null');
    if (record.kind === 'publication') text(record.publication_type, `${p}.publication_type`);
    else if (record.publication_type !== undefined) text(record.publication_type, `${p}.publication_type`, true);
    if (record.provider !== undefined) text(record.provider, `${p}.provider`, true);
    if (record.release !== undefined) text(record.release, `${p}.release`, true);
    if (record.kind === 'database_record') { text(record.provider, `${p}.provider`); text(record.release, `${p}.release`); }
    const reuse = object(record.reuse, `${p}.reuse`);
    if (reuse) {
      url(reuse.terms_url, `${p}.reuse.terms_url`); text(reuse.attribution, `${p}.reuse.attribution`);
      text(reuse.retained_content, `${p}.reuse.retained_content`); date(reuse.date_checked, `${p}.reuse.date_checked`, true);
      enumeration(reuse.permission_status, ['pending_review', 'permitted'], `${p}.reuse.permission_status`);
    }
    const status = object(record.publication_status, `${p}.publication_status`);
    if (status) {
      enumeration(status.status, ['not_checked', 'no_notice_found', 'corrected', 'retracted'], `${p}.publication_status.status`);
      date(status.checked_at, `${p}.publication_status.checked_at`, true); url(status.notice_url, `${p}.publication_status.notice_url`, true);
      if (status.status !== 'not_checked' && !status.checked_at) fail(`${p}.publication_status`, 'checked status requires a check date');
      if ((status.status === 'corrected' || status.status === 'retracted') && !status.notice_url) fail(`${p}.publication_status`, 'a correction or retraction requires a notice URL');
    }
  }, 1);
  array(data.conflicts, 'conflicts', (item, p) => {
    const record = object(item, p); if (!record) return;
    ['id', 'label', 'comparison'].forEach((key) => text(record[key], `${p}.${key}`));
    strings(record.claim_ids, `${p}.claim_ids`, 1); strings(record.evidence_ids, `${p}.evidence_ids`, 2);
    strings(record.context_differences, `${p}.context_differences`); review(record.review, `${p}.review`);
  });
  array(data.hypotheses, 'hypotheses', (item, p) => {
    const record = object(item, p); if (!record) return;
    ['id', 'question', 'suggested_test', 'dataset_version'].forEach((key) => text(record[key], `${p}.${key}`));
    strings(record.basis_claim_ids, `${p}.basis_claim_ids`, 1); strings(record.basis_evidence_ids, `${p}.basis_evidence_ids`, 1);
    strings(record.assumptions, `${p}.assumptions`, 1); strings(record.limitations, `${p}.limitations`, 1);
    enumeration(record.origin, ['curated', 'ai_generated'], `${p}.origin`); review(record.review, `${p}.review`);
  });
  // Deep reference checks operate only on records that passed structural checks.
  if (errors.length) return result();
  const snapshot = data as unknown as Snapshot;
  const isRelease = release || snapshot.release_status === 'released';
  const entityMap = new Map(snapshot.entities.map((record) => [record.id, record]));
  const claimMap = new Map(snapshot.claims.map((record) => [record.id, record]));
  const evidenceMap = new Map(snapshot.evidence.map((record) => [record.id, record]));
  const sourceMap = new Map(snapshot.sources.map((record) => [record.id, record]));
  const allIds = new Set<string>();
  for (const collection of ['entities', 'claims', 'evidence', 'sources', 'conflicts', 'hypotheses'] as const) {
    snapshot[collection].forEach((record) => {
      if (allIds.has(record.id)) fail(collection, `duplicate ID ${record.id}`);
      allIds.add(record.id);
    });
  }
  const references = (ids: string[], map: Map<string, unknown>, path: string) => {
    if (new Set(ids).size !== ids.length) fail(path, 'contains duplicate references');
    ids.forEach((id) => { if (!map.has(id)) fail(path, `unresolved reference ${id}`); });
  };
  const checkReview = (value: Review, id: string) => {
    if (isRelease && (value.status !== 'approved' || value.human_reviewed !== true)) fail(id, 'public release requires approved human scientific review');
  };
  const projectedSources = new Set<string>();
  const externalIdentities = new Map<string, string>();
  snapshot.entities.forEach((entity) => {
    references(entity.provenance_source_ids, sourceMap, `${entity.id}.provenance_source_ids`);
    references(entity.description_claim_ids, claimMap, `${entity.id}.description_claim_ids`);
    entity.external_ids.forEach(({ namespace, value }) => {
      const key = `${entity.type}:${namespace.toLowerCase()}:${value.toLowerCase()}`;
      const previous = externalIdentities.get(key);
      if (previous) fail(entity.id, `external identity duplicates ${previous}: ${namespace}:${value}`);
      externalIdentities.set(key, entity.id);
    });
    if (entity.description && !entity.description_claim_ids.length) {
      const message = `${entity.id}: description has no claim-linked scientific review`;
      if (isRelease) errors.push(message); else warnings.push(message);
    }
    if (entity.type === 'paper') {
      if (sourceMap.get(entity.source_id!)?.kind !== 'publication') fail(entity.id, 'paper must project a publication source');
      if (projectedSources.has(entity.source_id!)) fail(entity.id, 'publication is projected as more than one paper entity');
      projectedSources.add(entity.source_id!);
    }
  });
  snapshot.claims.forEach((claim) => {
    references([claim.subject_id, claim.object_id], entityMap, `${claim.id}.endpoints`);
    references(claim.evidence_ids, evidenceMap, `${claim.id}.evidence_ids`);
    checkReview(claim.review, claim.id);
    const left = entityMap.get(claim.subject_id)?.type;
    const right = entityMap.get(claim.object_id)?.type;
    if (left && right && !validEndpoints(claim.predicate, left, right)) fail(claim.id, `invalid endpoint types for ${claim.predicate}: ${left} / ${right}`);
    claim.evidence_ids.forEach((id) => {
      if (evidenceMap.has(id) && evidenceMap.get(id)!.claim_id !== claim.id) fail(claim.id, `evidence backlink mismatch ${id}`);
    });
  });
  snapshot.evidence.forEach((evidence) => {
    references([evidence.claim_id], claimMap, `${evidence.id}.claim_id`);
    references([evidence.source_id], sourceMap, `${evidence.id}.source_id`);
    references(evidence.upstream_source_ids, sourceMap, `${evidence.id}.upstream_source_ids`);
    if (claimMap.has(evidence.claim_id) && !claimMap.get(evidence.claim_id)!.evidence_ids.includes(evidence.id)) fail(evidence.id, 'claim does not link back to this evidence');
    evidence.upstream_source_ids.forEach((id) => { if (sourceMap.has(id) && sourceMap.get(id)!.kind !== 'database_record') fail(evidence.id, `upstream source ${id} must be a database record`); });
    if (isRelease && evidence.relation === 'supports' && sourceMap.get(evidence.source_id)?.publication_status.status === 'retracted') fail(evidence.id, 'retracted source cannot provide active support');
    checkReview(evidence.review, evidence.id);
  });
  const publicationIdentities = new Map<string, string>();
  snapshot.sources.forEach((source) => {
    if (source.kind === 'publication') source.identifiers.forEach(({ namespace, value }) => {
      const key = `${namespace.toLowerCase()}:${value.toLowerCase()}`;
      const previous = publicationIdentities.get(key);
      if (previous) fail(source.id, `publication identity duplicates ${previous}: ${namespace}:${value}`);
      publicationIdentities.set(key, source.id);
    });
    if (isRelease && source.reuse.permission_status !== 'permitted') fail(source.id, 'reuse terms require review before public release');
    if (isRelease && !source.reuse.date_checked) fail(source.id, 'reuse review requires a recorded check date before public release');
    if (isRelease && source.kind === 'publication' && source.publication_status.status === 'not_checked') fail(source.id, 'publication status must be checked before public release');
  });
  snapshot.conflicts.forEach((conflict) => {
    references(conflict.claim_ids, claimMap, `${conflict.id}.claim_ids`); references(conflict.evidence_ids, evidenceMap, `${conflict.id}.evidence_ids`); checkReview(conflict.review, conflict.id);
    conflict.evidence_ids.forEach((id) => { if (evidenceMap.has(id) && !conflict.claim_ids.includes(evidenceMap.get(id)!.claim_id)) fail(conflict.id, `compared evidence ${id} must address a compared claim`); });
  });
  snapshot.hypotheses.forEach((hypothesis) => {
    references(hypothesis.basis_claim_ids, claimMap, `${hypothesis.id}.basis_claim_ids`); references(hypothesis.basis_evidence_ids, evidenceMap, `${hypothesis.id}.basis_evidence_ids`); checkReview(hypothesis.review, hypothesis.id);
    hypothesis.basis_evidence_ids.forEach((id) => { if (evidenceMap.has(id) && !hypothesis.basis_claim_ids.includes(evidenceMap.get(id)!.claim_id)) fail(hypothesis.id, `basis evidence ${id} must address a basis claim`); });
    if (hypothesis.dataset_version !== snapshot.dataset_version) fail(hypothesis.id, 'hypothesis basis must name the current dataset version');
  });
  if (isRelease && (snapshot.entities.length < 20 || snapshot.entities.length > 50)) fail('entities', 'MVP public release must contain 20–50 displayed entities');
  if (!isRelease) {
    warnings.unshift('Development snapshot: draft scientific records; see the recorded source checks and limitations.');
    const drafts = [...snapshot.claims, ...snapshot.evidence, ...snapshot.conflicts, ...snapshot.hypotheses].filter(({ review }) => review.status === 'draft').length;
    if (drafts) warnings.push(`${drafts} scientific records retain draft status.`);
    if (snapshot.sources.some(({ reuse }) => reuse.permission_status === 'pending_review')) warnings.push('Source reuse terms await review; no full-text publication content is licensed by this dataset.');
    if (snapshot.sources.some(({ publication_status }) => publication_status.status === 'not_checked')) warnings.push('Retraction and correction status has not been independently checked for every source.');
  }
  return result();
}

function validEndpoints(predicate: string, left: EntityType, right: EntityType): boolean {
  const molecular = (type: EntityType) => type === 'gene' || type === 'protein';
  if (predicate === 'associated_with') return left !== 'paper' && right !== 'paper' && (left === 'disease' || right === 'disease');
  if (predicate === 'encodes') return left === 'gene' && right === 'protein';
  if (predicate === 'participates_in') return molecular(left) && right === 'pathway';
  if (predicate === 'interacts_with') return molecular(left) && molecular(right);
  if (predicate === 'targets') return left === 'drug' && molecular(right);
  return false;
}
