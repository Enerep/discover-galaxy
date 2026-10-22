import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { loadDataset } from './dataset.ts';
import { buildComparisonBrief, buildEvidenceComparison } from './compare-evidence.ts';

const snapshot = loadDataset(JSON.parse(await readFile(new URL('../../../../data/alzheimers/dataset.json', import.meta.url), 'utf8')));
const FIRST = 'claim-apoe-e4-risk';
const SECOND = 'claim-apoe-e2-risk';

test('APOE findings retain different genotype scope without declaring a scientific conflict', () => {
  const before = JSON.stringify(snapshot);
  const comparison = buildEvidenceComparison(snapshot, FIRST, SECOND);
  assert.equal(comparison.scopeStatus, 'different recorded scope');
  const variant = comparison.contextRows.find(({ key }) => key === 'variant')!;
  assert.equal(variant.status, 'different');
  assert.match(String(variant.left.claimValue), /ε4/);
  assert.match(String(variant.right.claimValue), /ε2\/ε3/);
  assert.equal(comparison.sharedSources.length, 0);
  assert.ok(comparison.notices.some((notice) => notice.includes('do not determine whether findings agree or conflict')));
  assert.ok(comparison.prompts.some((prompt) => prompt.includes('different citations alone do not establish replication')));
  assert.equal(JSON.stringify(snapshot), before);
});

test('different recorded claim scope remains visible even when study-specific genotype text matches', () => {
  // Isolated inconsistent-record fixture checks the distinction shown by the UI.
  const fixture = structuredClone(snapshot);
  const first = fixture.evidence.find(({ claim_id }) => claim_id === FIRST)!;
  const second = fixture.evidence.find(({ claim_id }) => claim_id === SECOND)!;
  second.study_context.variant = first.study_context.variant;
  const row = buildEvidenceComparison(fixture, FIRST, SECOND).contextRows.find(({ key }) => key === 'variant')!;
  assert.equal(row.left.studies[0].value, row.right.studies[0].value);
  assert.notEqual(row.left.claimValue, row.right.claimValue);
  assert.match(String(row.left.claimValue), /ε4/);
  assert.match(String(row.right.claimValue), /ε2\/ε3/);
  assert.equal(row.status, 'different');
});

test('study contexts preserve source-specific numbers and unknowns without filling gaps or pooling', () => {
  const comparison = buildEvidenceComparison(snapshot, 'claim-trem2-r47h-risk', 'claim-abca1-n1800h-risk');
  const samples = comparison.contextRows.find(({ key }) => key === 'sample_size')!;
  assert.equal(samples.left.studies[0].value, null);
  assert.equal(samples.right.studies[0].value, 92726);
  assert.equal(samples.left.claimValue, null);
  const discovery = comparison.contextRows.find(({ key }) => key === 'sequenced_discovery_individuals')!;
  assert.equal(discovery.left.studies[0].value, 2261);
  assert.equal(discovery.right.studies[0].value, null);
  assert.equal(discovery.status, 'missing');
  const tissue = comparison.contextRows.find(({ key }) => key === 'tissue')!;
  assert.equal(tissue.status, 'missing');
  assert.equal(tissue.left.studies[0].value, null);
  assert.equal(tissue.right.studies[0].value, null);
  assert.equal(comparison.columns[0].evidence[0].source.publication_status.status, 'not_checked');
  assert.equal(comparison.columns[0].evidence[0].source.reuse.permission_status, 'pending_review');
  assert.equal(comparison.columns[0].claim.review.reviewer, null);
});

test('a shared source ID or publication identity is visible rather than independent support', () => {
  // Deliberately duplicated source metadata is an isolated adapter edge case, not graph data.
  const fixture = structuredClone(snapshot);
  const firstEvidence = fixture.evidence.find(({ claim_id }) => claim_id === FIRST)!;
  const secondEvidence = fixture.evidence.find(({ claim_id }) => claim_id === SECOND)!;
  const firstSource = fixture.sources.find(({ id }) => id === firstEvidence.source_id)!;
  const secondSource = fixture.sources.find(({ id }) => id === secondEvidence.source_id)!;
  secondSource.identifiers = firstSource.identifiers.map(({ namespace, value }) => ({
    namespace, value: namespace === 'DOI' ? `https://doi.org/${value.toUpperCase()}` : value,
  }));
  const byIdentity = buildEvidenceComparison(fixture, FIRST, SECOND);
  assert.equal(byIdentity.sharedSources.length, 1);
  assert.ok(byIdentity.sharedSources[0].matchedBy.some((value) => value.startsWith('PMID:')));
  assert.ok(byIdentity.sharedSources[0].matchedBy.some((value) => value.startsWith('DOI:')));
  assert.ok(byIdentity.prompts.some((prompt) => prompt.includes('separate observations')));
  secondEvidence.source_id = firstEvidence.source_id;
  assert.ok(buildEvidenceComparison(fixture, FIRST, SECOND).sharedSources[0].matchedBy.includes('source ID'));
});

test('matching recorded fields remain literal and missing study context cannot become a match', () => {
  // Synthetic scoped variants exercise comparison labels; they never enter the public snapshot.
  const fixture = structuredClone(snapshot);
  const first = fixture.evidence.find(({ claim_id }) => claim_id === FIRST)!;
  const second = fixture.evidence.find(({ claim_id }) => claim_id === SECOND)!;
  const complete = { organism: 'Homo sapiens', variant: 'recorded variant', intervention: 'none tested', outcome: 'Recorded endpoint', study_design: 'Recorded design', population: 'Recorded population', tissue: 'Recorded tissue', sample_size: 42 };
  fixture.claims.find(({ id }) => id === FIRST)!.context = { ...complete };
  fixture.claims.find(({ id }) => id === SECOND)!.context = { ...complete };
  first.study_context = { ...complete };
  second.study_context = { ...complete };
  assert.equal(buildEvidenceComparison(fixture, FIRST, SECOND).scopeStatus, 'matching recorded fields');
  second.study_context.outcome = 'recorded endpoint';
  assert.equal(buildEvidenceComparison(fixture, FIRST, SECOND).contextRows.find(({ key }) => key === 'outcome')!.status, 'different');
  second.study_context.organism = 'Mus musculus';
  assert.equal(buildEvidenceComparison(fixture, FIRST, SECOND).scopeStatus, 'different recorded scope');
  second.study_context = { ...complete, tissue: null };
  assert.equal(buildEvidenceComparison(fixture, FIRST, SECOND).scopeStatus, 'insufficient context');
  assert.equal(buildEvidenceComparison(fixture, FIRST, SECOND).contextRows.find(({ key }) => key === 'tissue')!.status, 'missing');
});

test('multiple evidence records keep their source contexts separate and do not sum samples', () => {
  const fixture = structuredClone(snapshot);
  const original = fixture.evidence.find(({ claim_id }) => claim_id === FIRST)!;
  const additional = structuredClone(original);
  additional.id = 'synthetic-evidence-for-comparison-test';
  additional.study_context = { ...additional.study_context, sample_size: 99, population: 'Synthetic second population' };
  fixture.evidence.push(additional);
  fixture.claims.find(({ id }) => id === FIRST)!.evidence_ids.push(additional.id);
  const row = buildEvidenceComparison(fixture, FIRST, SECOND).contextRows.find(({ key }) => key === 'sample_size')!;
  assert.equal(row.left.studies.length, 2);
  assert.equal(row.left.studies[1].value, 99);
  assert.equal(row.left.studies[1].evidenceId, additional.id);
  assert.equal(row.status, 'missing');
});

test('invalid or duplicate selections and unresolved evidence/source links fail explicitly', () => {
  assert.throws(() => buildEvidenceComparison(snapshot, FIRST, FIRST), /two different findings/);
  assert.throws(() => buildEvidenceComparison(snapshot, '__proto__', SECOND), /exists in this dataset/);
  const fixture = structuredClone(snapshot);
  fixture.evidence.find(({ claim_id }) => claim_id === FIRST)!.source_id = 'missing-source';
  assert.throws(() => buildEvidenceComparison(fixture, FIRST, SECOND), /unresolved source/);
  fixture.evidence = fixture.evidence.filter(({ claim_id }) => claim_id !== FIRST);
  assert.throws(() => buildEvidenceComparison(fixture, FIRST, SECOND), /incomplete evidence/);
  const unsafe = structuredClone(snapshot);
  const evidence = unsafe.evidence.find(({ claim_id }) => claim_id === FIRST)!;
  unsafe.sources.find(({ id }) => id === evidence.source_id)!.url = 'javascript:alert(1)';
  assert.throws(() => buildEvidenceComparison(unsafe, FIRST, SECOND), /invalid source link/);
});

test('a portable comparison brief keeps statements, citations, unknowns, and actual pending review fields', () => {
  const brief = buildComparisonBrief(snapshot, FIRST, SECOND);
  assert.match(brief, /Draft comparison aid/);
  assert.ok(brief.includes(snapshot.dataset_version));
  assert.ok(brief.includes(snapshot.claims.find(({ id }) => id === FIRST)!.statement));
  assert.match(brief, /https:\/\/pubmed.ncbi.nlm.nih.gov\/8346443\//);
  assert.match(brief, /https:\/\/pubmed.ncbi.nlm.nih.gov\/7920638\//);
  assert.match(brief, /Claim review: draft; human reviewed: Not recorded; reviewer: Not recorded; date: Not recorded/);
  assert.match(brief, /not\\_checked/);
  assert.match(brief, /pending\\_review/);
  assert.match(brief, /study independence has not been assessed/);
  assert.ok(brief.includes('Case and family totals are not combined because participant overlap was not assessed.'));
  assert.equal(brief, buildComparisonBrief(snapshot, FIRST, SECOND));
});

test('approved development records without explicit human review remain pending in comparisons and briefs', () => {
  // Synthetic attestations exercise presentation rules only; the source snapshot is unchanged.
  const fixture = structuredClone(snapshot);
  const claims = fixture.claims.filter(({ id }) => id === FIRST || id === SECOND);
  const evidence = fixture.evidence.filter(({ claim_id }) => claim_id === FIRST || claim_id === SECOND);
  for (const record of [...claims, ...evidence]) {
    record.review = { status: 'approved', human_reviewed: false, reviewer: 'Synthetic test reviewer', date: '2026-10-22', rationale: 'Isolated unit-test record, not a scientific review.' };
  }
  const accepted = loadDataset(fixture);
  const pending = buildEvidenceComparison(accepted, FIRST, SECOND);
  assert.ok(pending.notices.some((notice) => notice.includes('draft source status')));
  const brief = buildComparisonBrief(accepted, FIRST, SECOND);
  assert.match(brief, /Claim review: approved; human reviewed: false/);
  assert.match(brief, /Evidence review: approved; human reviewed: false/);
  assert.match(brief, /draft source status/);
  for (const record of [...claims, ...evidence]) record.review.human_reviewed = true;
  assert.ok(!buildEvidenceComparison(loadDataset(fixture), FIRST, SECOND).notices.some((notice) => notice.includes('draft source status')));
  assert.match(buildComparisonBrief(fixture, FIRST, SECOND), /Claim review: approved; human reviewed: true/);
  assert.match(buildComparisonBrief(fixture, FIRST, SECOND), /Evidence review: approved; human reviewed: true/);
});
