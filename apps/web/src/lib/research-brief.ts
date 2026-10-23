import type { Snapshot } from './types.ts';
import { buildComparisonBrief, buildFindingBrief } from './compare-evidence.ts';

export const BRIEF_STORAGE_KEY = 'discovery-galaxy:research-brief:v1';
export const MAX_PINNED_FINDINGS = 12;
export const BRIEF_FIELD_LIMITS = { question: 400, explanation: 6000, assumptions: 4000, experiment: 6000 } as const;
export type BriefField = keyof typeof BRIEF_FIELD_LIMITS;
export interface ResearchBrief {
  schema_version: 1;
  dataset_version: string;
  updated_at: string;
  question: string;
  explanation: string;
  assumptions: string;
  experiment: string;
  pinned_claim_ids: string[];
  comparison_claim_ids: [string, string] | null;
}
export type BriefAction =
  | { type: 'edit'; field: BriefField; value: string }
  | { type: 'pin'; claimIds: string[] }
  | { type: 'unpin'; claimId: string }
  | { type: 'compare'; claimIds: [string, string] | null }
  | { type: 'refresh' };

export function createResearchBrief(snapshot: Snapshot, now = new Date().toISOString()): ResearchBrief {
  return { schema_version: 1, dataset_version: snapshot.dataset_version, updated_at: now,
    question: '', explanation: '', assumptions: '', experiment: '', pinned_claim_ids: [], comparison_claim_ids: null };
}

/** Untrusted local storage contains references and user text, never scientific attestations. */
export function parseResearchBrief(raw: string): ResearchBrief {
  if (raw.length > 48_000) throw new Error('The saved brief is too large.');
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid saved brief.');
  const item = value as Record<string, unknown>;
  const fields = ['schema_version', 'dataset_version', 'updated_at', ...Object.keys(BRIEF_FIELD_LIMITS), 'pinned_claim_ids', 'comparison_claim_ids'];
  const id = (value: unknown): value is string => typeof value === 'string' && /^claim-[a-z0-9-]{1,100}$/u.test(value);
  if (Object.keys(item).length !== fields.length || Object.keys(item).some((key) => !fields.includes(key))
    || item.schema_version !== 1 || typeof item.dataset_version !== 'string' || !item.dataset_version.trim() || item.dataset_version.length > 160
    || typeof item.updated_at !== 'string' || !Number.isFinite(Date.parse(item.updated_at))
    || new Date(item.updated_at).toISOString() !== item.updated_at
    || Object.entries(BRIEF_FIELD_LIMITS).some(([key, limit]) => typeof item[key] !== 'string' || (item[key] as string).length > limit)
    || !Array.isArray(item.pinned_claim_ids) || item.pinned_claim_ids.length > MAX_PINNED_FINDINGS
    || !item.pinned_claim_ids.every(id) || new Set(item.pinned_claim_ids).size !== item.pinned_claim_ids.length) {
    throw new Error('Invalid saved brief.');
  }
  const pair = item.comparison_claim_ids;
  if (pair !== null && (!Array.isArray(pair) || pair.length !== 2 || !pair.every(id) || pair[0] === pair[1]
    || pair.some((value) => !(item.pinned_claim_ids as string[]).includes(value)))) throw new Error('Invalid saved comparison.');
  // Reconstruct the allowlisted shape; stored source/review fields cannot enter the graph.
  return { schema_version: 1, dataset_version: item.dataset_version, updated_at: item.updated_at,
    question: item.question as string, explanation: item.explanation as string, assumptions: item.assumptions as string,
    experiment: item.experiment as string, pinned_claim_ids: [...item.pinned_claim_ids] as string[],
    comparison_claim_ids: pair === null ? null : [...pair as string[]] as [string, string] };
}

export function updateResearchBrief(snapshot: Snapshot, brief: ResearchBrief, action: BriefAction, now = new Date().toISOString()): ResearchBrief {
  const next: ResearchBrief = { ...brief, pinned_claim_ids: [...brief.pinned_claim_ids], comparison_claim_ids: brief.comparison_claim_ids ? [...brief.comparison_claim_ids] : null };
  if (action.type === 'edit') {
    if (!Object.hasOwn(BRIEF_FIELD_LIMITS, action.field) || typeof action.value !== 'string' || action.value.length > BRIEF_FIELD_LIMITS[action.field]) throw new Error('This note exceeds the field limit.');
    next[action.field] = action.value;
  } else if (action.type === 'unpin') {
    next.pinned_claim_ids = next.pinned_claim_ids.filter((id) => id !== action.claimId);
    if (next.comparison_claim_ids?.includes(action.claimId)) next.comparison_claim_ids = null;
  } else if (action.type === 'refresh') {
    if (next.pinned_claim_ids.some((id) => !snapshot.claims.some((claim) => claim.id === id))) throw new Error('Remove unavailable findings before refreshing the evidence.');
    next.dataset_version = snapshot.dataset_version;
  } else {
    if (brief.dataset_version !== snapshot.dataset_version) throw new Error('Refresh this brief’s evidence before adding findings or a comparison.');
    const ids = action.type === 'pin' ? action.claimIds : action.claimIds ?? [];
    if (ids.some((id) => !snapshot.claims.some((claim) => claim.id === id))) throw new Error('Choose findings in the current dataset.');
    if (action.type === 'pin') {
      next.pinned_claim_ids = [...new Set([...next.pinned_claim_ids, ...ids])];
      if (next.pinned_claim_ids.length > MAX_PINNED_FINDINGS) throw new Error(`A brief can hold ${MAX_PINNED_FINDINGS} findings.`);
    } else {
      if (action.claimIds && (action.claimIds[0] === action.claimIds[1] || action.claimIds.some((id) => !next.pinned_claim_ids.includes(id)))) throw new Error('Choose two different pinned findings.');
      next.comparison_claim_ids = action.claimIds ? [...action.claimIds] : null;
    }
  }
  return { ...next, updated_at: now };
}

/** Both pins are added atomically; a failed addition cannot leave a partial comparison. */
export function includeBriefComparison(snapshot: Snapshot, brief: ResearchBrief, pair: [string, string], now = new Date().toISOString()): ResearchBrief {
  return updateResearchBrief(snapshot, updateResearchBrief(snapshot, brief, { type: 'pin', claimIds: pair }, now), { type: 'compare', claimIds: pair }, now);
}

function userText(value: string): string {
  if (!value.trim()) return '> Not provided.';
  return value.replace(/\r\n?/gu, '\n').split('\n')
    .map((line) => `> ${line.replace(/[\\`*_\[\]<>|#!]/gu, '\\$&')}`).join('\n');
}

/** User-authored reasoning stays separate from source-backed evidence and its review record. */
export function buildResearchBrief(snapshot: Snapshot, brief: ResearchBrief): string {
  parseResearchBrief(JSON.stringify(brief));
  if (brief.dataset_version !== snapshot.dataset_version) throw new Error('Refresh the brief’s evidence before exporting.');
  if (!brief.question.trim()) throw new Error('Add your research question.');
  if (!brief.pinned_claim_ids.length) throw new Error('Pin a finding to include its sources.');
  if (brief.pinned_claim_ids.some((id) => !snapshot.claims.some((claim) => claim.id === id))) throw new Error('Remove unavailable findings before exporting.');
  const lines = ['# Discovery Galaxy — research brief', '',
    'Researcher-entered draft. The question, explanation, assumptions and experiment are user notes, not findings or scientific approval. Novelty and experimental feasibility have not been established.', '',
    `Dataset: ${snapshot.dataset_version}`, `Last edit: ${brief.updated_at}`, '',
    '## Research question', '', userText(brief.question), '',
    '## Your explanation', '', userText(brief.explanation), '', '## Your assumptions', '', userText(brief.assumptions), '',
    '## Your proposed experiment', '', userText(brief.experiment), '',
    '## Evidence index', '', ...brief.pinned_claim_ids.map((id, index) => `${index + 1}. ${id}`), ''];
  const pair = brief.comparison_claim_ids;
  if (pair) {
    // The existing complete comparison preserves citations, context notes, unknowns and notice links.
    const comparison = buildComparisonBrief(snapshot, ...pair).split('\n')
      .map((line, index) => index === 0 ? '## Included comparison' : line.replace(/^(#{1,5}) /u, '#$1 ')).join('\n');
    lines.push(comparison, '');
  }
  const otherPins = brief.pinned_claim_ids.filter((id) => !pair?.includes(id));
  if (otherPins.length) lines.push('## Pinned findings', '');
  for (const id of otherPins) {
    lines.push(buildFindingBrief(snapshot, id).replace(/^(#{2,5}) /gmu, '#$1 '), '');
  }
  return lines.join('\n');
}
