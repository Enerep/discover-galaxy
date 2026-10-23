import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { loadDataset } from './dataset.ts';
import { buildResearchBrief, createResearchBrief, includeBriefComparison, MAX_PINNED_FINDINGS, parseResearchBrief, updateResearchBrief } from './research-brief.ts';

const snapshot = loadDataset(JSON.parse(await readFile(new URL('../../../../data/alzheimers/dataset.json', import.meta.url), 'utf8')));
const FIRST = 'claim-trem2-r47h-apoe-binding';
const SECOND = 'claim-lessard-trem2-r47h-apoe3-binding';
const NOW = '2026-10-23T12:00:00.000Z';
const blank = () => createResearchBrief(snapshot, NOW);

test('a research draft restores bounded user notes and ordered references without changing the scientific snapshot', () => {
  const before = JSON.stringify(snapshot);
  let brief = updateResearchBrief(snapshot, blank(), { type: 'edit', field: 'question', value: 'Synthetic user question for a workflow test' }, NOW);
  brief = updateResearchBrief(snapshot, brief, { type: 'pin', claimIds: [FIRST, FIRST, SECOND] }, NOW);
  assert.deepEqual(brief.pinned_claim_ids, [FIRST, SECOND]);
  assert.deepEqual(parseResearchBrief(JSON.stringify(brief)), brief);
  assert.equal(JSON.stringify(snapshot), before);
  assert.equal(snapshot.hypotheses.length, 0);
});

test('untrusted storage cannot add approval/source fields, excessive text, duplicate references or a dangling comparison', () => {
  for (const value of [null, [], { ...blank(), human_reviewed: true }, { ...blank(), question: 'x'.repeat(401) },
    { ...blank(), pinned_claim_ids: [FIRST, FIRST] }, { ...blank(), comparison_claim_ids: [FIRST, SECOND] },
    { ...blank(), updated_at: 'not-a-date' }, { ...blank(), schema_version: 2 }]) {
    assert.throws(() => parseResearchBrief(JSON.stringify(value)));
  }
  assert.throws(() => parseResearchBrief(' '.repeat(48_001)));
  assert.throws(() => updateResearchBrief(snapshot, blank(), { type: 'edit', field: '__proto__' as 'question', value: 'untrusted' }));
});

test('adding a comparison is atomic and removing its finding removes the pair without losing user notes', () => {
  const original = { ...blank(), explanation: 'Synthetic workflow note' };
  const compared = includeBriefComparison(snapshot, original, [FIRST, SECOND], NOW);
  assert.deepEqual(original.pinned_claim_ids, []);
  assert.deepEqual(compared.pinned_claim_ids, [FIRST, SECOND]);
  assert.deepEqual(compared.comparison_claim_ids, [FIRST, SECOND]);
  const removed = updateResearchBrief(snapshot, compared, { type: 'unpin', claimId: FIRST }, NOW);
  assert.equal(removed.comparison_claim_ids, null);
  assert.deepEqual(removed.pinned_claim_ids, [SECOND]);
  assert.equal(removed.explanation, original.explanation);
  assert.throws(() => includeBriefComparison(snapshot, original, [FIRST, FIRST]), /two different/);
  assert.throws(() => includeBriefComparison(snapshot, original, [FIRST, 'missing']), /current dataset/);
  const full = updateResearchBrief(snapshot, blank(), { type: 'pin', claimIds: snapshot.claims.slice(0, MAX_PINNED_FINDINGS).map(({ id }) => id) }, NOW);
  assert.throws(() => includeBriefComparison(snapshot, full, [FIRST, SECOND]), /hold 12/);
  assert.equal(full.pinned_claim_ids.length, MAX_PINNED_FINDINGS);
  assert.equal(full.comparison_claim_ids, null);
});

test('a changed dataset preserves notes and unavailable references but requires explicit refresh before exporting', () => {
  const old = { ...blank(), dataset_version: 'older-synthetic-snapshot', question: 'Synthetic question', explanation: 'Keep this note', pinned_claim_ids: [FIRST] };
  const restored = parseResearchBrief(JSON.stringify(old));
  assert.equal(restored.explanation, old.explanation);
  assert.throws(() => buildResearchBrief(snapshot, restored), /Refresh/);
  assert.throws(() => updateResearchBrief(snapshot, restored, { type: 'pin', claimIds: [SECOND] }), /Refresh/);
  const refreshed = updateResearchBrief(snapshot, restored, { type: 'refresh' }, NOW);
  assert.equal(refreshed.dataset_version, snapshot.dataset_version);
  assert.ok(buildResearchBrief(snapshot, refreshed).includes(old.explanation));
  const unavailable = parseResearchBrief(JSON.stringify({ ...old, pinned_claim_ids: ['claim-synthetic-unavailable'] }));
  assert.deepEqual(unavailable.pinned_claim_ids, ['claim-synthetic-unavailable']);
  assert.throws(() => updateResearchBrief(snapshot, unavailable, { type: 'refresh' }), /Remove unavailable/);
});

test('a single pinned finding exports its complete evidence, source context and notice without a comparison', () => {
  const brief = { ...blank(), question: 'Synthetic user question', pinned_claim_ids: ['claim-bailey-trem2-r47h-apoe-binding'] };
  const markdown = buildResearchBrief(snapshot, brief);
  for (const text of ['26374897', 'Figure 5', 'Publication status: corrected', 'Publication notice: https://pmc.ncbi.nlm.nih.gov/articles/PMC4646256/',
    'Triplicate wells', 'human reviewed: false', 'Evidence limitations', snapshot.dataset_version]) assert.ok(markdown.includes(text), text);
  assert.ok(!markdown.includes('Included comparison'));
  assert.equal(brief.pinned_claim_ids.length, 1);
});

test('the full research export keeps authored reasoning separate, includes the exact comparison and cites every pin', () => {
  const before = JSON.stringify(snapshot);
  let brief = includeBriefComparison(snapshot, blank(), [FIRST, SECOND], NOW);
  brief = updateResearchBrief(snapshot, brief, { type: 'pin', claimIds: ['claim-apoe-e4-risk'] }, NOW);
  brief = { ...brief, question: 'Synthetic question', explanation: '# Fake heading\n[Claim](javascript:example)', assumptions: 'Synthetic assumption', experiment: 'Synthetic proposed experiment' };
  const text = buildResearchBrief(snapshot, brief);
  for (const value of ['Your explanation', '> \\# Fake heading', '> \\[Claim\\]', 'not findings or scientific approval', 'Novelty and experimental feasibility have not been established',
    'Included comparison', 'Different R47H binding results', 'not an equivalence test', 'ligand concentrations: 5',
    'https://pubmed.ncbi.nlm.nih.gov/26374899/', 'https://link.springer.com/article/10.15252/emmm.201809027', 'https://pubmed.ncbi.nlm.nih.gov/8346443/',
    'Note review: draft; human reviewed: false', 'Source check:']) assert.ok(text.includes(value), value);
  for (const id of brief.pinned_claim_ids) assert.ok(text.includes(`Claim ID: ${id}`), id);
  assert.ok(text.indexOf('## Pinned findings') > text.indexOf('## Included comparison'));
  assert.ok(text.indexOf('Claim ID: claim-apoe-e4-risk') > text.indexOf('## Pinned findings'));
  assert.equal(JSON.stringify(snapshot), before);
  assert.equal(buildResearchBrief(snapshot, brief), text);
});

test('export cannot silently omit unavailable findings or produce an uncited or blank research brief', () => {
  assert.throws(() => buildResearchBrief(snapshot, blank()), /research question/);
  assert.throws(() => buildResearchBrief(snapshot, { ...blank(), question: 'Synthetic' }), /Pin a finding/);
  assert.throws(() => buildResearchBrief(snapshot, { ...blank(), question: 'Synthetic', pinned_claim_ids: ['claim-synthetic-unavailable'] }), /Remove unavailable/);
});
