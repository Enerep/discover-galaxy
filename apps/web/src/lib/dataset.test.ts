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
  for (const key of ['apoe', 'abca1', 'trem2', 'tyrobp', 'nr1h2', 'nr1h3', 'rxra', 'marco', 'scara5', 'apob']) {
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
  assert.ok(data.conflicts.every(({ review }) => review.status === 'draft' && review.human_reviewed === false));
  assert.equal(data.hypotheses.length, 0);
});

test('reference-derived coverage keeps gene-set membership separate from protein states and paper findings', async () => {
  const snapshot = loadDataset(JSON.parse(await readFile(new URL('../../../../data/alzheimers/dataset.json', import.meta.url), 'utf8')));
  const seed = JSON.parse(await readFile(new URL('../../../../data/annotations/coverage-seed.json', import.meta.url), 'utf8'));
  for (const row of seed.genes) {
    const key = row.symbol.toLowerCase();
    const gene = snapshot.entities.find(({ id }) => id === `gene-${key}`)!;
    const protein = snapshot.entities.find(({ id }) => id === `protein-${key}`)!;
    assert.ok(gene.external_ids.some(({ namespace, value }) => namespace === 'HGNC' && value === row.hgnc_id));
    assert.ok(protein.external_ids.some(({ namespace, value }) => namespace === 'UniProt' && value === row.uniprot_accession));
    const membership = snapshot.claims.find(({ id }) => id === `claim-${key}-scavenger-gene-set`)!;
    assert.equal(membership.subject_id, gene.id);
    assert.equal(membership.context.annotation_level, 'gene');
    assert.equal(membership.object_id, 'pathway-scavenger-receptors');
    const evidence = getClaimEvidence(snapshot, membership.id)[0];
    assert.equal(evidence.study_context.normalized_reference_sha256, seed.reactome_normalized_sha256);
    assert.equal(evidence.study_context.protein_form, null);
    assert.equal(snapshot.sources.find(({ id }) => id === evidence.source_id)?.kind, 'database_record');
    assert.ok(!getEntityClaims(snapshot, protein.id).some(({ predicate }) => predicate === 'participates_in'));
    assert.ok(getEntityClaims(snapshot, gene.id).every((claim) => getClaimEvidence(snapshot, claim.id).every((e) => snapshot.sources.find(({ id }) => id === e.source_id)?.kind === 'database_record')));
    assert.equal(membership.review.status, 'draft');
    assert.equal(membership.review.human_reviewed, false);
  }
  assert.equal(snapshot.claims.filter(({ predicate }) => predicate === 'associated_with').length, 4);
  assert.equal(snapshot.entities.filter(({ type }) => type === 'paper').length, 8);
});

test('scavenger evidence connects typed genes and proteins to APOE without promoting RNA results into AD-risk claims', async () => {
  const data = loadDataset(JSON.parse(await readFile(new URL('../../../../data/alzheimers/dataset.json', import.meta.url), 'utf8')));
  const pathway = data.entities.find(({ id }) => id === 'pathway-scavenger-receptors')!;
  assert.deepEqual(pathway.external_ids, [{ namespace: 'Reactome', value: 'R-HSA-2173782' }]);
  const members = getEntityClaims(data, pathway.id);
  assert.deepEqual(members.map(({ subject_id }) => subject_id).sort(), ['gene-col1a1', 'gene-col1a2', 'gene-col3a1', 'gene-saa1', 'protein-apob', 'protein-apoe', 'protein-marco', 'protein-scara5']);
  for (const symbol of ['MARCO', 'SCARA5', 'APOB']) {
    const gene = searchEntities(data, symbol, 'gene').find(({ label }) => label === symbol)!;
    assert.ok(gene);
    assert.ok(getEntityClaims(data, gene.id).every(({ predicate }) => predicate === 'encodes'));
    const identity = data.evidence.find(({ claim_id }) => claim_id === `claim-${symbol.toLowerCase()}-encodes`)!;
    assert.equal(identity.source_id, 'source-hgnc-scavenger-identities');
  }
  for (const receptor of ['marco', 'scara5']) {
    const annotation = members.find(({ subject_id }) => subject_id === `protein-${receptor}`)!;
    assert.equal(annotation.context.inferred_from, 'Mus musculus reaction');
    assert.ok(annotation.limitations.some((text) => text.includes('not direct experimental evidence in human brain')));
  }
  assert.equal(data.claims.filter(({ predicate }) => predicate === 'associated_with').length, 4);
  assert.equal(data.hypotheses.length, 0);
});

test('Cheng findings preserve modified ligand/domain scope, one paper identity and unresolved replicate independence', async () => {
  const data = loadDataset(JSON.parse(await readFile(new URL('../../../../data/alzheimers/dataset.json', import.meta.url), 'utf8')));
  const claims = getEntityClaims(data, 'paper-cheng-2021');
  assert.equal(claims.length, 2);
  for (const claim of claims) {
    assert.equal(claim.predicate, 'interacts_with');
    assert.equal(claim.object_id, 'protein-apob');
    assert.ok(claim.statement.includes('acetylated and oxidized apoB'));
    assert.ok(claim.context.protein_form?.toString().includes('SRCR domain fused to GFP'));
    assert.equal(claim.context.experimental_system, 'Cell-free protein assay');
    assert.equal(claim.review.status, 'draft');
    assert.equal(claim.review.human_reviewed, false);
    const evidence = getClaimEvidence(data, claim.id)[0];
    assert.equal(evidence.source_id, 'source-cheng-2021');
    assert.ok(evidence.locator.includes('Figure 7G–H'));
    assert.equal(evidence.study_context.experiments_reported, 3);
    assert.equal(evidence.study_context.assay_replicates, null);
    assert.equal(evidence.study_context.sample_size, null);
    assert.equal(evidence.study_context.ligand_isoform, null);
    assert.ok(evidence.study_context.replicate_unit?.toString().includes('independence are not resolved'));
  }
  const source = data.sources.find(({ id }) => id === 'source-cheng-2021')!;
  assert.ok(source.identifiers.some(({ namespace, value }) => namespace === 'PMID' && value === '34252459'));
  assert.equal(source.publication_status.status, 'not_checked');
  assert.equal(source.reuse.permission_status, 'pending_review');
  assert.ok(source.reuse.attribution.includes('CC BY-NC-ND 4.0'));
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

test('binding assays keep protein endpoints, one paper identity and replicate units separate from human associations', async () => {
  const data = loadDataset(JSON.parse(await readFile(new URL('../../../../data/alzheimers/dataset.json', import.meta.url), 'utf8')));
  const ids = ['claim-trem2-apoe-binding', 'claim-trem2-r47h-apoe-binding'];
  const records = ids.flatMap((id) => {
    const claim = data.claims.find((item) => item.id === id)!;
    assert.equal(claim.subject_id, 'protein-trem2');
    assert.equal(claim.object_id, 'protein-apoe');
    assert.equal(claim.predicate, 'interacts_with');
    assert.equal(claim.context.experimental_system, 'Cell-free protein assay');
    assert.equal(claim.review.status, 'draft');
    assert.equal(claim.review.human_reviewed, false);
    return getClaimEvidence(data, id);
  });
  assert.equal(records.length, 2);
  assert.deepEqual([...new Set(records.map(({ source_id }) => source_id))], ['source-atagi-2015']);
  for (const record of records) {
    assert.equal(record.study_context.sample_size, null);
    assert.equal(record.study_context.assay_replicates, 3);
    assert.equal(typeof record.study_context.replicate_unit, 'string');
    assert.match(record.locator, /caption/);
    assert.match(record.review.rationale, /not reviewed/);
  }
  const source = data.sources.find(({ id }) => id === records[0].source_id)!;
  assert.equal(source.url, 'https://pubmed.ncbi.nlm.nih.gov/26374899/');
  assert.equal(source.publication_status.status, 'not_checked');
  assert.equal(source.reuse.permission_status, 'pending_review');
  assert.deepEqual(getEntityClaims(data, 'paper-atagi-2015').map(({ id }) => id), ids);
  assert.equal(data.claims.filter(({ predicate }) => predicate === 'associated_with').length, 4);
});

test('two publication records with one study identifier cannot appear as independent sources', () => {
  const snapshot = syntheticFixture();
  snapshot.sources[0]!.identifiers = [{ namespace: 'test', value: 'synthetic-publication' }];
  snapshot.sources.push({ ...snapshot.sources[0]!, id: 'test-duplicate-publication' });
  assert.ok(validateDataset(snapshot).errors.some((error) => error.includes('publication identity duplicates')));
});

test('a recorded correction or retraction requires its actual notice link and check date', () => {
  const data = syntheticFixture();
  for (const status of ['corrected', 'retracted'] as const) {
    data.sources[0].publication_status = { status, checked_at: '2026-10-23', notice_url: null };
    assert.ok(validateDataset(data).errors.some((error) => error.includes('requires a notice URL')));
    data.sources[0].publication_status.notice_url = 'https://example.org/synthetic-notice';
    assert.equal(validateDataset(data).valid, true);
    data.sources[0].publication_status.checked_at = null;
    assert.equal(validateDataset(data).valid, false);
  }
});

test('the second binding publication preserves plasma preparation, technical wells and its recorded correction', async () => {
  const data = loadDataset(JSON.parse(await readFile(new URL('../../../../data/alzheimers/dataset.json', import.meta.url), 'utf8')));
  const source = data.sources.find(({ id }) => id === 'source-bailey-2015')!;
  assert.equal(source.url, 'https://pubmed.ncbi.nlm.nih.gov/26374897/');
  assert.deepEqual(source.publication_status, { status: 'corrected', checked_at: '2026-10-23', notice_url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4646256/' });
  assert.equal(source.reuse.permission_status, 'pending_review');
  const evidence = data.evidence.filter(({ source_id }) => source_id === source.id);
  assert.equal(evidence.length, 2);
  for (const item of evidence) {
    const claim = data.claims.find(({ id }) => id === item.claim_id)!;
    assert.equal(claim.subject_id, 'protein-trem2');
    assert.equal(claim.object_id, 'protein-apoe');
    assert.equal(item.study_context.organism, 'Homo sapiens');
    assert.equal(item.study_context.assay, 'ELISA');
    assert.match(String(item.study_context.ligand_preparation), /plasma-derived APOE; isoform not identified/);
    assert.equal(item.study_context.assay_replicates, 3);
    assert.equal(item.study_context.sample_size, null);
    assert.match(String(item.study_context.replicate_unit), /Triplicate wells/);
    assert.match(item.locator, /Figure 5[CD]/);
    assert.equal(item.review.human_reviewed, false);
    assert.equal(claim.review.status, 'draft');
  }
  const variant = evidence.find(({ claim_id }) => claim_id === 'claim-bailey-trem2-r47h-apoe-binding')!;
  assert.equal(variant.study_context.experiments_reported, 2);
  assert.equal(data.claims.filter(({ predicate }) => predicate === 'associated_with').length, 4);
  assert.ok(data.conflicts.every(({ review }) => review.status === 'draft' && review.human_reviewed === false));
  assert.equal(data.hypotheses.length, 0);
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

test('a study-context comparison cites evidence for every compared claim and cannot create scientific approval', async () => {
  const data = loadDataset(JSON.parse(await readFile(new URL('../../../../data/alzheimers/dataset.json', import.meta.url), 'utf8')));
  assert.equal(data.conflicts.length, 1);
  const note = data.conflicts[0];
  assert.equal(note.id, 'conflict-r47h-binding-context');
  assert.deepEqual(note.claim_ids, ['claim-trem2-r47h-apoe-binding', 'claim-lessard-trem2-r47h-apoe3-binding']);
  for (const id of note.claim_ids) assert.ok(note.evidence_ids.some((eid) => data.evidence.find((item) => item.id === eid)?.claim_id === id));
  assert.equal(note.review.status, 'draft');
  assert.equal(note.review.human_reviewed, false);
  assert.match(note.comparison, /no statistically significant/);
  assert.ok(note.context_differences.some((value) => value.includes('not an equivalence test')));
  const lessard = getClaimEvidence(data, 'claim-lessard-trem2-r47h-apoe3-binding')[0];
  assert.equal(lessard.relation, 'supports'); // Supports its own scoped finding, not a blanket refutation.
  assert.equal(lessard.study_context.ligand_concentrations, 5);
  assert.equal(lessard.study_context.assay_replicates, null);
  assert.equal(lessard.study_context.experiments_reported, null);
  assert.equal(lessard.study_context.sample_size, null);
  const broken = structuredClone(data);
  broken.conflicts[0].claim_ids.push('claim-apoe-e4-risk');
  assert.ok(validateDataset(broken).errors.some((error) => error.includes('needs cited evidence in the comparison')));
  const source = data.sources.find(({ id }) => id === lessard.source_id)!;
  assert.equal(source.reuse.permission_status, 'permitted');
  assert.equal(source.publication_status.status, 'not_checked');
  assert.equal(validateDataset(data, { release: true }).valid, false);
});
