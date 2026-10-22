import { getClaimEvidence } from './dataset.ts';
import type { Claim, Context, Entity, Evidence, Review, Snapshot, Source } from './types.ts';

export type ContextValue = Context[string] | null;
export interface ComparisonStudyValue {
  evidenceId: string;
  sourceId: string;
  value: ContextValue;
}
export interface ComparisonContextCell {
  claimValue: ContextValue;
  studies: ComparisonStudyValue[];
}
export interface ComparisonContextRow {
  key: string;
  label: string;
  status: 'different' | 'matching' | 'missing';
  left: ComparisonContextCell;
  right: ComparisonContextCell;
}
export interface ComparisonColumn {
  claim: Claim;
  subject: Entity;
  object: Entity;
  evidence: { evidence: Evidence; source: Source }[];
  sources: Source[];
  limitations: string[];
}
export interface EvidenceComparison {
  columns: [ComparisonColumn, ComparisonColumn];
  contextRows: ComparisonContextRow[];
  scopeStatus: 'different recorded scope' | 'matching recorded fields' | 'insufficient context';
  sharedSources: { leftSourceId: string; rightSourceId: string; matchedBy: string[] }[];
  prompts: string[];
  notices: string[];
}

const DIMENSIONS = ['organism', 'variant', 'intervention', 'outcome', 'study_design', 'population', 'tissue', 'sample_size'];
const LABELS: Record<string, string> = {
  organism: 'Organism', variant: 'Variant', intervention: 'Intervention', outcome: 'Outcome',
  study_design: 'Study design', population: 'Population', tissue: 'Tissue', sample_size: 'Sample size',
};

function recorded(value: ContextValue): boolean {
  if (value === null) return false;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value === 'string') return value.trim().length > 0;
  return value.length > 0 && value.every((part) => part.trim().length > 0);
}

function column(snapshot: Snapshot, claimId: string): ComparisonColumn {
  const claim = snapshot.claims.find(({ id }) => id === claimId);
  if (!claim) throw new Error('Choose a finding that exists in this dataset.');
  const subject = snapshot.entities.find(({ id }) => id === claim.subject_id);
  const object = snapshot.entities.find(({ id }) => id === claim.object_id);
  if (!subject || !object) throw new Error('This finding has an unresolved entity reference.');
  const records = getClaimEvidence(snapshot, claim.id);
  if (!records.length || claim.evidence_ids.length !== records.length
    || records.some(({ id }) => !claim.evidence_ids.includes(id))) {
    throw new Error('This finding has incomplete evidence references.');
  }
  const evidence = records.map((item) => {
    const source = snapshot.sources.find(({ id }) => id === item.source_id);
    if (!source) throw new Error('This finding has an unresolved source reference.');
    try {
      const protocol = new URL(source.url).protocol;
      if (protocol !== 'https:' && protocol !== 'http:') throw new Error();
    } catch { throw new Error('This finding has an invalid source link.'); }
    return { evidence: item, source };
  });
  return {
    claim, subject, object, evidence,
    sources: [...new Map(evidence.map(({ source }) => [source.id, source])).values()],
    limitations: [...new Set([...claim.limitations, ...records.flatMap(({ limitations }) => limitations)])],
  };
}

function cell(item: ComparisonColumn, key: string): ComparisonContextCell {
  return {
    claimValue: item.claim.context[key] ?? null,
    studies: item.evidence.map(({ evidence }) => ({
      evidenceId: evidence.id, sourceId: evidence.source_id, value: evidence.study_context[key] ?? null,
    })),
  };
}

function rowStatus(left: ComparisonContextCell, right: ComparisonContextCell): ComparisonContextRow['status'] {
  // Claim summaries never fill in missing study-specific context, and samples are not pooled.
  const a = left.studies.map(({ value }) => value);
  const b = right.studies.map(({ value }) => value);
  if (!a.length || !b.length || [...a, ...b].some((value) => !recorded(value))) return 'missing';
  const first = [...new Set(a.map((value) => JSON.stringify(value)))].sort();
  const second = [...new Set(b.map((value) => JSON.stringify(value)))].sort();
  if (recorded(left.claimValue) && recorded(right.claimValue)
    && JSON.stringify(left.claimValue) !== JSON.stringify(right.claimValue)) return 'different';
  return JSON.stringify(first) === JSON.stringify(second) ? 'matching' : 'different';
}

function identities(source: Source): string[] {
  return source.identifiers.flatMap(({ namespace, value }) => {
    const name = namespace.trim().toLowerCase();
    if (name === 'pmid' || name === 'pubmed') return [`PMID:${value.trim().replace(/^0+(?=\d)/u, '')}`];
    if (name === 'doi') return [`DOI:${value.trim().toLowerCase().replace(/^(?:https?:\/\/(?:dx\.)?doi\.org\/|doi:\s*)/u, '')}`];
    return [];
  });
}

function humanReviewed(review: Review): boolean {
  return review.status === 'approved' && review.human_reviewed === true;
}

function humanReviewFlag(review: Review): string {
  return review.human_reviewed === true ? 'true' : review.human_reviewed === false ? 'false' : 'Not recorded';
}

/** Compare recorded scope, never agreement, causality, independence, or evidence strength. */
export function buildEvidenceComparison(snapshot: Snapshot, firstClaimId: string, secondClaimId: string): EvidenceComparison {
  if (firstClaimId === secondClaimId) throw new Error('Choose two different findings to compare.');
  const columns: EvidenceComparison['columns'] = [column(snapshot, firstClaimId), column(snapshot, secondClaimId)];
  const keys = new Set(columns.flatMap(({ claim, evidence }) => [
    ...Object.keys(claim.context), ...evidence.flatMap(({ evidence: item }) => Object.keys(item.study_context)),
  ]));
  const extras = [...keys].filter((key) => !DIMENSIONS.includes(key)).sort();
  const contextRows = [...DIMENSIONS, ...extras].map((key): ComparisonContextRow => {
    const left = cell(columns[0], key); const right = cell(columns[1], key);
    const label = LABELS[key] ?? key.replaceAll('_', ' ').replace(/^./u, (letter) => letter.toUpperCase());
    return { key, label, left, right, status: rowStatus(left, right) };
  });
  const distinctClaims = columns[0].claim.subject_id !== columns[1].claim.subject_id
    || columns[0].claim.object_id !== columns[1].claim.object_id || columns[0].claim.predicate !== columns[1].claim.predicate;
  const scopeStatus = distinctClaims || contextRows.some(({ status }) => status === 'different')
    ? 'different recorded scope' : contextRows.some(({ status }) => status === 'missing')
      ? 'insufficient context' : 'matching recorded fields';
  const sharedSources = columns[0].sources.flatMap((left) => columns[1].sources.flatMap((right) => {
    const rightIdentities = new Set(identities(right));
    const matchedBy = [...new Set([
      ...(left.id === right.id ? ['source ID'] : []), ...identities(left).filter((id) => rightIdentities.has(id)),
    ])];
    return matchedBy.length ? [{ leftSourceId: left.id, rightSourceId: right.id, matchedBy }] : [];
  }));
  const different = new Set(contextRows.filter(({ status }) => status === 'different').map(({ key }) => key));
  const missing = contextRows.filter(({ status }) => status === 'missing').map(({ label }) => label.toLowerCase());
  const prompts = [
    ...(different.has('variant') ? ['Check whether the recorded variants address the same biological question before interpreting the findings together.'] : []),
    ...(different.has('population') ? ['Check population definitions and any reused participants in the original sources.'] : []),
    ...(['organism', 'study_design', 'intervention', 'outcome'].some((key) => different.has(key))
      ? ['Check whether organisms, study designs, interventions, and endpoints allow a meaningful comparison.'] : []),
    ...(missing.length ? [`Find the unrecorded study context in the original sources: ${missing.join(', ')}.`] : []),
    sharedSources.length ? 'Inspect the shared source records before treating the findings as separate observations.'
      : 'Check cohort overlap and study independence in the original papers; different citations alone do not establish replication.',
  ];
  return {
    columns, contextRows, scopeStatus, sharedSources, prompts,
    notices: [
      'Context labels compare recorded fields only; they do not determine whether findings agree or conflict.',
      'Matching text does not establish comparable studies, pooled cohorts, independent replication, or research novelty.',
      ...(columns.some(({ claim, evidence }) => !humanReviewed(claim.review) || evidence.some(({ evidence: item }) => !humanReviewed(item.review)))
        ? ['Scientific review is pending for one or both selected findings.'] : []),
    ],
  };
}

function markdown(value: ContextValue): string {
  const result = !recorded(value) ? 'Not recorded' : Array.isArray(value) ? value.join('; ') : String(value);
  return result.replace(/[\\`*_\[\]<>|]/gu, '\\$&').replace(/\r?\n/gu, ' ');
}

/** Portable reading brief with source-specific context; no generated scientific conclusion. */
export function buildComparisonBrief(snapshot: Snapshot, firstClaimId: string, secondClaimId: string): string {
  const comparison = buildEvidenceComparison(snapshot, firstClaimId, secondClaimId);
  const lines = ['# Discovery Galaxy — evidence comparison', '',
    'Draft comparison aid: recorded context and reading prompts, not a verdict on agreement, conflict, causation, independence, or novelty.', '',
    `Dataset: ${markdown(snapshot.dataset_version)}`, `Snapshot status: ${markdown(snapshot.release_status)}`, '',
    `Recorded scope: ${comparison.scopeStatus}`, '', ...comparison.notices.map((notice) => `- ${notice}`), ''];
  for (const item of comparison.columns) {
    lines.push(`## ${markdown(item.subject.label)} → ${markdown(item.object.label)}`, '',
      `Claim ID: ${markdown(item.claim.id)}`, '', markdown(item.claim.statement), '', markdown(item.claim.summary), '',
      `Claim review: ${markdown(item.claim.review.status)}; human reviewed: ${humanReviewFlag(item.claim.review)}; reviewer: ${markdown(item.claim.review.reviewer)}; date: ${markdown(item.claim.review.date)}.`, '',
      '### Claim context', '', ...Object.entries(item.claim.context).map(([key, value]) => `- ${markdown(key.replaceAll('_', ' '))}: ${markdown(value)}`), '');
    for (const { evidence, source } of item.evidence) {
      lines.push(`### ${markdown(source.title)}`, '', source.url, '',
        `Source: ${markdown(source.id)}; year: ${markdown(source.year)}; identifiers: ${markdown(source.identifiers.map(({ namespace, value }) => `${namespace}: ${value}`))}.`, '',
        `Evidence: ${markdown(evidence.id)}; relation to its own claim: ${markdown(evidence.relation)}.`, '',
        markdown(evidence.finding), '', `Inspected location: ${markdown(evidence.locator)}`, '',
        'Study-specific context:', '', ...Object.entries(evidence.study_context).map(([key, value]) => `- ${markdown(key.replaceAll('_', ' '))}: ${markdown(value)}`), '',
        `Evidence review: ${markdown(evidence.review.status)}; human reviewed: ${humanReviewFlag(evidence.review)}; reviewer: ${markdown(evidence.review.reviewer)}; date: ${markdown(evidence.review.date)}.`,
        `Reuse status: ${markdown(source.reuse.permission_status)}; checked: ${markdown(source.reuse.date_checked)}.`,
        `Publication status: ${markdown(source.publication_status.status)}; checked: ${markdown(source.publication_status.checked_at)}.`, '',
        'Evidence limitations:', '', ...evidence.limitations.map((value) => `- ${markdown(value)}`), '');
    }
    lines.push('### Claim limitations', '', ...item.claim.limitations.map((value) => `- ${markdown(value)}`), '');
  }
  lines.push('## Questions to check in the sources', '', ...comparison.prompts.map((prompt) => `- ${prompt}`), '',
    'Shared citation identities:', '', ...(comparison.sharedSources.length
      ? comparison.sharedSources.map(({ leftSourceId, rightSourceId, matchedBy }) => `- ${markdown(leftSourceId)} / ${markdown(rightSourceId)}: ${markdown(matchedBy)}`)
      : ['- No overlap found in the recorded source IDs, PMIDs, or DOIs; study independence has not been assessed.']), '');
  return lines.join('\n');
}
