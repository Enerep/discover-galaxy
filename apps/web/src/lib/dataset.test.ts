import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { getClaimEvidence, getEntityClaims, loadDataset, searchEntities } from './dataset.ts';
import type { Snapshot } from './types.ts';
import { validateDataset } from './validate.ts';

/** Intentionally synthetic structural fixture. Never imported by application code. */
function syntheticFixture(): Snapshot {
  const review = { status: 'draft' as const, reviewer: null, date: null, rationale: 'Synthetic fixture; no scientific meaning.' };
  return {
    schema_version: '0.1.0', dataset_version: 'synthetic-test-only', release_status: 'development', created_at: '2026-10-20',
    scope: { disease: 'Synthetic condition', inclusion_criteria: 'Structural tests only', limitations: ['Not scientific data.'] },
    upstream_releases: [{ provider: 'Synthetic provider', release: null, accessed_at: '2026-10-20', source_url: 'https://example.org/source', reuse_terms_url: 'https://example.org/terms', attribution: 'Synthetic fixture' }],
    entities: [
      { id: 'test-condition', type: 'disease', label: 'Synthetic Alzheimer’s example', aliases: ['Synthetic Alzheimer disease'], external_ids: [{ namespace: 'test', value: 'condition' }], description_claim_ids: [], provenance_source_ids: ['test-source'] },
      { id: 'test-gene', type: 'gene', label: 'Synthetic APOE example', aliases: ['Synthetic apolipoprotéin E'], external_ids: [{ namespace: 'test', value: 'gene-001' }], description_claim_ids: [], provenance_source_ids: ['test-source'] },
      { id: 'test-paper', type: 'paper', label: 'Synthetic test paper', aliases: [], external_ids: [], description_claim_ids: [], provenance_source_ids: ['test-source'], source_id: 'test-source' },
    ],
    claims: [{ id: 'test-claim', subject_id: 'test-gene', object_id: 'test-condition', predicate: 'associated_with', statement: 'Synthetic assertion for structural testing only.', context: { organism: null }, evidence_ids: ['test-evidence'], summary: 'No scientific meaning.', limitations: ['Synthetic.'], review: { ...review } }],
    evidence: [{ id: 'test-evidence', claim_id: 'test-claim', source_id: 'test-source', upstream_source_ids: [], relation: 'unclear', finding: 'Synthetic finding.', locator: 'Synthetic section', study_context: { design: 'synthetic' }, limitations: ['Not a real study.'], review: { ...review } }],
    sources: [{ id: 'test-source', kind: 'publication', title: 'SYNTHETIC fixture, not scientific evidence', url: 'https://example.org/synthetic', identifiers: [], publication_type: 'other', authors: [], year: null, retrieved_at: '2026-10-20', reuse: { terms_url: 'https://example.org/terms', attribution: 'Synthetic fixture', retained_content: 'Structural test content only.', date_checked: null, permission_status: 'pending_review' }, publication_status: { status: 'not_checked', checked_at: null, notice_url: null } }],
    conflicts: [], hypotheses: [],
  };
}

test('development data remains usable without being mistaken for a public scientific release', () => {
  const snapshot = syntheticFixture();
  const development = validateDataset(snapshot);
  assert.equal(development.valid, true);
  assert.ok(development.warnings.some((warning) => warning.includes('retain draft status')));
  const release = validateDataset(snapshot, { release: true });
  assert.equal(release.valid, false);
  assert.ok(release.errors.some((error) => error.includes('approved human scientific review')));
  assert.ok(release.errors.some((error) => error.includes('20–50')));
  assert.ok(release.errors.some((error) => error.includes('reuse terms')));
});

test('marking an envelope released cannot bypass review gates through default validation', () => {
  const snapshot = syntheticFixture();
  snapshot.release_status = 'released';
  assert.equal(validateDataset(snapshot).valid, false);
  assert.throws(() => loadDataset(snapshot), /Unable to load/);
});

test('citation and reciprocal evidence integrity are mandatory even during development', () => {
  const snapshot = syntheticFixture();
  snapshot.evidence[0]!.source_id = 'missing-source';
  assert.ok(validateDataset(snapshot).errors.some((error) => error.includes('unresolved reference missing-source')));
  snapshot.evidence[0]!.source_id = 'test-source';
  snapshot.evidence[0]!.claim_id = 'missing-claim';
  assert.ok(validateDataset(snapshot).errors.some((error) => error.includes('backlink mismatch')));
  snapshot.evidence[0]!.claim_id = 'test-claim';
  snapshot.claims[0]!.evidence_ids = [];
  assert.equal(validateDataset(snapshot).valid, false);
});

test('untrusted or malformed data produces errors without throwing', () => {
  for (const input of [null, [], 'bad', {}, { entities: [null], claims: ['bad'], sources: [{}] }]) {
    assert.doesNotThrow(() => validateDataset(input));
    assert.equal(validateDataset(input).valid, false);
  }
  const snapshot = syntheticFixture();
  snapshot.sources[0]!.url = 'javascript:alert(1)';
  assert.ok(validateDataset(snapshot).errors.some((error) => error.includes('HTTPS')));
  snapshot.sources[0]!.url = 'https://example.org/synthetic';
  snapshot.created_at = '2026-02-30';
  assert.ok(validateDataset(snapshot).errors.some((error) => error.includes('valid ISO date')));
});

test('duplicate identities, invalid biological endpoints, and missing publication locators fail', () => {
  const snapshot = syntheticFixture();
  snapshot.entities.push({ ...snapshot.entities[0]! });
  assert.ok(validateDataset(snapshot).errors.some((error) => error.includes('duplicate ID')));
  snapshot.entities.pop();
  snapshot.claims[0]!.subject_id = 'test-paper';
  assert.ok(validateDataset(snapshot).errors.some((error) => error.includes('invalid endpoint types')));
  snapshot.evidence[0]!.locator = '';
  assert.ok(validateDataset(snapshot).errors.some((error) => error.includes('locator')));
});

test('alias search normalizes accents and apostrophes without merging distinct records', () => {
  const snapshot = loadDataset(syntheticFixture());
  assert.deepEqual(searchEntities(snapshot, "alzheimer's").map(({ id }) => id), ['test-condition']);
  assert.deepEqual(searchEntities(snapshot, 'apolipoprotein E').map(({ id }) => id), ['test-gene']);
  assert.deepEqual(searchEntities(snapshot, 'test gene-001').map(({ id }) => id), ['test-gene']);
  assert.deepEqual(searchEntities(snapshot, 'APOE', 'disease'), []);
  assert.deepEqual(searchEntities(snapshot, 'unknown'), []);
  assert.equal(searchEntities(snapshot, '').length, 3);
});

test('paper projections expose cited claims without creating biological relationships', () => {
  const snapshot = syntheticFixture();
  assert.deepEqual(getEntityClaims(snapshot, 'test-paper').map(({ id }) => id), ['test-claim']);
  assert.deepEqual(getEntityClaims(snapshot, 'test-gene').map(({ id }) => id), ['test-claim']);
  assert.deepEqual(getClaimEvidence(snapshot, 'test-claim').map(({ source_id }) => source_id), ['test-source']);
  assert.deepEqual(getEntityClaims(snapshot, 'unknown'), []);
});

test('the source-checked snapshot preserves typed pathway journeys and remains a development draft', async () => {
  const snapshot: unknown = JSON.parse(await readFile(new URL('../../../../data/alzheimers/dataset.json', import.meta.url), 'utf8'));
  assert.equal(validateDataset(snapshot).valid, true);
  assert.equal(validateDataset(snapshot, { release: true }).valid, false);
  const data = loadDataset(snapshot);
  assert(data.entities.length >= 20 && data.entities.length <= 50);
  for (const key of ['apoe', 'abca1', 'trem2', 'tyrobp', 'nr1h2', 'nr1h3', 'rxra']) {
    const gene = data.entities.find(({ id }) => id === `gene-${key}`)!;
    const protein = data.entities.find(({ id }) => id === `protein-${key}`)!;
    assert.equal(gene.type, 'gene');
    assert.equal(protein.type, 'protein');
    const encoding = data.claims.find(({ subject_id, object_id, predicate }) => subject_id === gene.id && object_id === protein.id && predicate === 'encodes')!;
    assert(encoding);
    const pathwayClaims = getEntityClaims(data, protein.id).filter(({ predicate }) => predicate === 'participates_in');
    assert(pathwayClaims.length > 0);
    for (const claim of pathwayClaims) {
      assert.equal(data.entities.find(({ id }) => id === claim.object_id)?.type, 'pathway');
      const evidence = getClaimEvidence(data, claim.id);
      assert.equal(evidence.length, 1);
      assert.equal(data.sources.find(({ id }) => id === evidence[0].source_id)?.kind, 'database_record');
      assert.equal(claim.context.assertion_type, 'curated database annotation');
      assert.equal(claim.context.organism, 'Homo sapiens');
      assert.equal(claim.review.status, 'draft');
      assert.notEqual(claim.review.human_reviewed, true);
    }
  }
  assert.equal(data.claims.filter(({ predicate }) => predicate === 'associated_with').length, 4);
  assert.equal(data.conflicts.length, 0);
  assert.equal(data.hypotheses.length, 0);
});

test('optional metadata cannot smuggle malformed values past the typed adapter', () => {
  const snapshot = syntheticFixture();
  const source = snapshot.sources[0]! as unknown as Record<string, unknown>;
  source.provider = 42;
  assert.equal(validateDataset(snapshot).valid, false);
  source.provider = null;
  source.publication_type = [];
  assert.equal(validateDataset(snapshot).valid, false);
});

test('two publication records with one study identifier cannot appear as independent sources', () => {
  const snapshot = syntheticFixture();
  snapshot.sources[0]!.identifiers = [{ namespace: 'test', value: 'synthetic-publication' }];
  snapshot.sources.push({ ...snapshot.sources[0]!, id: 'test-duplicate-publication' });
  assert.ok(validateDataset(snapshot).errors.some((error) => error.includes('publication identity duplicates')));
});

test('a release can pass only with explicit review, provenance, rights and size requirements', () => {
  const snapshot = syntheticFixture();
  snapshot.release_status = 'released';
  const approved = { status: 'approved' as const, reviewer: 'SYNTHETIC test reviewer', date: '2026-10-20', rationale: 'Synthetic release-gate test only.', human_reviewed: true };
  snapshot.claims[0]!.review = { ...approved };
  snapshot.evidence[0]!.review = { ...approved };
  snapshot.sources[0]!.reuse.permission_status = 'permitted';
  snapshot.sources[0]!.reuse.date_checked = '2026-10-20';
  snapshot.sources[0]!.publication_status = { status: 'no_notice_found', checked_at: '2026-10-20', notice_url: null };
  for (let index = 0; snapshot.entities.length < 20; index++) snapshot.entities.push({ ...snapshot.entities[1]!, id: `synthetic-extra-${index}`, external_ids: [{ namespace: 'test', value: `synthetic-${index}` }] });
  assert.deepEqual(validateDataset(snapshot).errors, []);
  snapshot.evidence[0]!.review.human_reviewed = false;
  assert.equal(validateDataset(snapshot).valid, false);
});
