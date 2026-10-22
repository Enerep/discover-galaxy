import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { loadDataset } from '../../apps/web/src/lib/dataset.ts';
import { loadCandidateCoverage, renderCandidateCoverage } from './candidate-coverage.ts';

const snapshot = loadDataset(JSON.parse(await readFile(new URL('../../data/alzheimers/dataset.json', import.meta.url), 'utf8')));
const packet = loadCandidateCoverage(JSON.parse(await readFile(new URL('../../data/alzheimers/candidate-coverage.json', import.meta.url), 'utf8')), snapshot);

test('candidate coverage is deterministic, preserves the pending baseline and cannot mutate the graph', () => {
  const before = JSON.stringify({ snapshot, packet });
  const output = renderCandidateCoverage(packet, snapshot);
  assert.equal(output, renderCandidateCoverage(structuredClone(packet), structuredClone(snapshot)));
  assert.equal(JSON.stringify({ snapshot, packet }), before);
  for (const claim of snapshot.claims) {
    assert.ok(output.includes(claim.id));
    assert.match(output.split('\n').find((line) => line.startsWith(`| ${claim.id} |`))!, /\| draft \| draft \| No \|$/);
  }
  assert.match(output, /not a systematic search or an OpenAlex API import/);
  assert.match(output, /Source counts are not independent-study counts/);
  assert.match(output, /not novel hypotheses or classified contradictions/);
});

test('a coverage plan cannot grant scientific, reuse or graph approval or retain unrequested article content', () => {
  for (const [key, value] of [['review_status', 'approved'], ['graph_status', 'in_graph']] as const) {
    const changed = structuredClone(packet);
    Object.assign(changed.candidates[0], { [key]: value });
    assert.throws(() => loadCandidateCoverage(changed, snapshot), /cannot grant human review|cannot promote candidates/);
  }
  const reuse = structuredClone(packet);
  Object.assign(reuse.candidates[0].reuse, { permission_status: 'permitted' });
  assert.throws(() => loadCandidateCoverage(reuse, snapshot), /cannot grant source reuse approval/);
  for (const key of ['abstract', 'full_text', 'human_reviewed', 'confidence', 'evidence_strength']) {
    const changed = structuredClone(packet);
    Object.assign(changed.candidates[0], { [key]: 'untrusted extra content' });
    assert.throws(() => loadCandidateCoverage(changed, snapshot), /unexpected or missing fields/);
  }
});

test('baseline, candidate and biological-anchor references must resolve and unused sources cannot hide in the packet', () => {
  const changedVersion = structuredClone(packet);
  changedVersion.dataset_version = 'synthetic-different-snapshot';
  assert.throws(() => loadCandidateCoverage(changedVersion, snapshot), /different snapshot/);
  for (const [field, value, message] of [
    ['existing_claim_ids', 'claim-synthetic-missing', /Unknown baseline claim/],
    ['candidate_ids', 'candidate-synthetic-missing', /Unresolved candidate/],
    ['anchor_entity_ids', 'paper-corder-1993', /Unknown biological anchor/],
  ] as const) {
    const changed = structuredClone(packet);
    changed.questions[0][field] = [value];
    assert.throws(() => loadCandidateCoverage(changed, snapshot), message);
  }
  const unused = structuredClone(packet);
  unused.questions.forEach((question) => { question.candidate_ids = question.candidate_ids.filter((id) => id !== unused.candidates[0].id); });
  assert.throws(() => loadCandidateCoverage(unused, snapshot), /Every candidate needs a reading question/);
});

test('duplicate publication identities and papers already in the graph fail instead of becoming extra evidence', () => {
  const publications = packet.candidates.filter(({ kind }) => kind === 'primary_publication');
  assert(publications.length >= 2);
  for (const field of ['pmid', 'doi'] as const) {
    const changed = structuredClone(packet);
    const first = changed.candidates.find(({ id }) => id === publications[0].id)!;
    const second = changed.candidates.find(({ id }) => id === publications[1].id)!;
    second.identifiers[field] = first.identifiers[field]!.toUpperCase();
    assert.throws(() => loadCandidateCoverage(changed, snapshot), /Duplicate publication or database identity/);
  }
  const existing = snapshot.sources.flatMap(({ identifiers }) => identifiers).find(({ namespace }) => namespace.toLowerCase() === 'pmid')!;
  const changed = structuredClone(packet);
  changed.candidates[0].identifiers.pmid = existing.value;
  assert.throws(() => loadCandidateCoverage(changed, snapshot), /already exists in the snapshot/);
  const duplicateId = structuredClone(packet);
  duplicateId.candidates[1].id = duplicateId.candidates[0].id;
  assert.throws(() => loadCandidateCoverage(duplicateId, snapshot), /invalid or duplicated/);
});

test('unknown context, publication checks, release provenance and actual inspection limits survive the reading brief', () => {
  const output = renderCandidateCoverage(packet, snapshot);
  for (const source of packet.candidates) {
    assert.ok(output.includes(source.url));
    assert.ok(output.includes(source.inspection.url));
    assert.ok(output.includes(source.inspection.locator));
    assert.ok(output.includes(source.inspection.accessed_at));
    assert.ok(output.includes(source.reuse.terms_url));
    assert.ok(output.includes(source.id));
  }
  assert.equal((output.match(/\*\*Sample size:\*\* Not extracted/g) ?? []).length, packet.candidates.length);
  assert.equal((output.match(/access date is not a release/g) ?? []).length, packet.candidates.length);
  assert.match(output, /absence of a notice has not been established/);
  assert.match(output, /indexed_excerpt/);
  assert.match(output, /unknown fields are not negative findings/i);
  assert.match(output, /distinct DOIs do not establish independent replication/);
});

test('malformed dates, identifiers, non-human pathway records and credential-bearing URLs fail closed', () => {
  for (const mutate of [
    (copy: typeof packet) => { copy.prepared_at = '2026-02-30'; },
    (copy: typeof packet) => { copy.candidates[0].inspection.accessed_at = '2026-10-23'; },
    (copy: typeof packet) => { copy.candidates[0].url = 'https://reader:secret@example.org/paper'; },
    (copy: typeof packet) => { copy.candidates[0].inspection.url = 'https://example.org/paper?api_key=synthetic'; },
    (copy: typeof packet) => { copy.candidates[0].identifiers.doi = 'not-a-doi'; },
    (copy: typeof packet) => {
      // Synthetic invalid record, isolated from the six real publication candidates.
      Object.assign(copy.candidates[0], { kind: 'pathway_record', identifiers: { reactome: 'R-MMU-2424491' },
        url: 'https://reactome.org/content/detail/R-MMU-2424491', year: null, provider: 'Reactome', publication_status: 'not_applicable' });
    },
    (copy: typeof packet) => { copy.candidates[0].reuse.observed_terms = 'Undated permission assertion'; },
  ]) {
    const changed = structuredClone(packet);
    mutate(changed);
    assert.throws(() => loadCandidateCoverage(changed, snapshot));
  }
});

test('an approved development label without an explicit human-review flag remains unreviewed in the baseline table', () => {
  // Synthetic review fields are confined to this test copy, never the dataset.
  const changed = structuredClone(snapshot);
  const claim = changed.claims[0];
  const review = { status: 'approved' as const, reviewer: 'Synthetic reviewer (test only)', date: '2026-10-22', rationale: 'Isolated test fixture; no scientific attestation.' };
  claim.review = review;
  changed.evidence.filter(({ claim_id }) => claim_id === claim.id).forEach((evidence) => { evidence.review = { ...review }; });
  const output = renderCandidateCoverage(packet, changed);
  assert.match(output.split('\n').find((line) => line.startsWith(`| ${claim.id} |`))!, /\| approved \| approved \| No \|$/);
});
