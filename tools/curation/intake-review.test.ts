import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { normalizeAnnotationResponse } from './biomedical-intake.ts';
import type { GeneIdentity, Provider } from './biomedical-intake.ts';
import { buildOpenAlexRequest, normalizeOpenAlexResponse } from './openalex-intake.ts';
import { renderIntakeReview, reviewIntakePackets } from './intake-review.ts';
import type { PacketInput } from './intake-review.ts';
import type { Snapshot } from '../../apps/web/src/lib/types.ts';

const snapshotBytes = await readFile('data/alzheimers/dataset.json');
const snapshot = JSON.parse(snapshotBytes.toString()) as Snapshot;
const hash = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
const identity: GeneIdentity = { symbol: 'APOE', ensembl: 'ENSG00000130203', uniprot: 'P02649' };
const at = '2026-11-14T00:00:00Z';
const encode = (value: unknown) => Buffer.from(JSON.stringify(value));
// Invented provider records exercise code only; never add these fixtures to the graph.
const raw = {
  uniprot: { primaryAccession: identity.uniprot, organism: { taxonId: 9606 }, genes: [{ geneName: { value: identity.symbol } }],
    entryType: 'UniProtKB reviewed (Swiss-Prot)', proteinDescription: { recommendedName: { fullName: { value: 'SYNTHETIC protein name' } } },
    entryAudit: { entryVersion: 1, lastAnnotationUpdateDate: '2026-01-01' }, uniProtKBCrossReferences: [{ database: 'Ensembl', properties: [{ key: 'GeneId', value: identity.ensembl }] }] },
  reactome: [{ stId: 'R-HSA-9029569', stIdVersion: 'R-HSA-9029569.2', speciesName: 'Homo sapiens', schemaClass: 'Pathway', displayName: 'SYNTHETIC mapping' }],
  opentargets: { data: { meta: { dataVersion: { year: '26', month: '09', iteration: null } }, target: { id: identity.ensembl, approvedSymbol: identity.symbol,
    associatedDiseases: { count: 25, rows: [{ disease: { id: 'MONDO_0004975', name: 'SYNTHETIC disease' }, score: .3, datasourceScores: [{ id: 'synthetic-source', score: .4 }] }] } } } },
};
const annotation = (provider: Provider) => normalizeAnnotationResponse(encode(raw[provider]), { provider, identity, processedAt: at });
const input = (packet: unknown, name = 'synthetic-packet.json'): PacketInput => ({ name, bytes: encode(packet) });
const review = (packets: PacketInput[], previous: PacketInput[] = [], graph = snapshot) => reviewIntakePackets({ packets, previous, snapshot: graph });
const literature = () => normalizeOpenAlexResponse({ meta: { count: 8 }, results: [{ id: 'https://openalex.org/W2013111251',
  ids: { doi: 'https://doi.org/10.1074/jbc.m407963200', pmid: 'https://pubmed.ncbi.nlm.nih.gov/15269217/' },
  doi: 'https://doi.org/10.1074/jbc.m407963200', title: 'SYNTHETIC metadata', publication_year: 2004, publication_date: '2004-07-21',
  type: 'article', is_retracted: false, updated_date: '2026-11-14T00:00:00Z' }] },
{ query: 'SYNTHETIC query', processedAt: at, requestUrl: buildOpenAlexRequest('SYNTHETIC query', 5) });

test('offline review is deterministic, immutable and separate from original experimental findings', () => {
  const packets = [input(annotation('reactome'), 'reactome.json'), input(annotation('uniprot'), 'uniprot.json'), input(annotation('opentargets'), 'opentargets.json'), input(literature(), 'openalex.json')];
  const before = JSON.stringify({ snapshot, packets });
  const report = reviewIntakePackets({ packets, snapshot, snapshotBytes });
  assert.equal(JSON.stringify({ snapshot, packets }), before);
  assert.deepEqual(report, reviewIntakePackets({ packets: [...packets].reverse(), snapshot, snapshotBytes }));
  assert.equal(report.status, 'unreviewed'); assert.equal(report.promotion, 'not_in_graph');
  assert.equal(report.snapshot.input_sha256, hash(snapshotBytes));
  assert.equal(report.snapshot.dataset_version, snapshot.dataset_version);
  assert.ok(report.packets.every((p) => p.records.every((r) => r.change === 'not_compared')));
  assert.equal(report.packets.find((p) => p.provider === 'uniprot')!.records[0].graph_matches.claim_ids[0], 'claim-apoe-encodes');
  assert.deepEqual(report.packets.find((p) => p.provider === 'reactome')!.records[0].graph_matches.claim_ids, ['claim-apoe-cholesterol-pathway']);
  const aggregate = report.packets.find((p) => p.provider === 'opentargets')!;
  assert.deepEqual(aggregate.records[0].graph_matches.claim_ids, ['claim-apoe-opentargets-association']);
  assert.ok(!aggregate.records[0].graph_matches.claim_ids.some((id) => id.includes('e4-risk')));
  assert.deepEqual(report.packets.find((p) => p.provider === 'OpenAlex')!.records[0].graph_matches.source_ids, ['source-wahrle-2004']);
  assert.equal(renderIntakeReview(report), renderIntakeReview(report));
});

test('packet file hashes never masquerade as original response digests or retrieval provenance', () => {
  const packet = literature();
  assert.equal(packet.response_sha256, null);
  const compact = input(packet), spaced = { name: compact.name, bytes: Buffer.from(JSON.stringify(packet, null, 2)) };
  const a = review([compact]).packets[0], b = review([spaced]).packets[0];
  assert.notEqual(a.input_sha256, b.input_sha256);
  assert.equal(a.provenance.response_sha256, null);
  assert.equal(a.provenance.retrieved_at, null);
  assert.equal(a.provenance.data_origin, 'offline_input');
  assert.equal(review([compact]).snapshot.input_sha256, null);
  assert.deepEqual(a.records, b.records);
  assert.throws(() => reviewIntakePackets({ packets: [compact], snapshot, snapshotBytes: encode({ ...snapshot, dataset_version: 'wrong' }) }));
});

test('provenance changes remain separate from record content and preserve string release components', () => {
  const prior = annotation('opentargets'), current = structuredClone(prior);
  current.processed_at = '2026-11-14T01:00:00Z'; current.response_sha256 = 'a'.repeat(64);
  current.provider_version = { year: '26', month: '10', iteration: '01' }; current.provider_release = '26.10.01';
  const report = review([input(current)], [input(prior)]).packets[0];
  assert.equal(report.records[0].change, 'unchanged'); assert.deepEqual(report.records[0].fields, []);
  assert.ok(report.metadata_changes.some(({ field }) => field === 'provider_version'));
  assert.deepEqual(report.provenance.provider_version, { year: '26', month: '10', iteration: '01' });
  assert.equal(report.previous_input_sha256, hash(encode(prior)));
  const withScore = structuredClone(current);
  if (withScore.records[0].kind === 'disease_association') withScore.records[0].overall_association_score = 0.4123456789;
  const changed = review([input(withScore)], [input(prior)]).packets[0].records[0];
  assert.equal(changed.change, 'changed');
  assert.deepEqual(changed.fields, [{ field: 'overall_association_score', before: .3, after: .4123456789 }]);
});

test('missing bounded-page results are not returned, never deletions or proof of absence', () => {
  const prior = annotation('reactome');
  const current = normalizeAnnotationResponse(encode([{ stId: 'R-HSA-900000002', speciesName: 'Homo sapiens', schemaClass: 'Pathway', displayName: 'SYNTHETIC other mapping' }]), { provider: 'reactome', identity, processedAt: at });
  const report = review([input(current)], [input(prior)]).packets[0];
  assert.equal(report.records[0].change, 'added');
  assert.equal(report.not_returned[0].change, 'not_returned');
  assert.equal(report.not_returned[0].key, 'pathway_mapping:P02649:R-HSA-9029569');
  assert.match(renderIntakeReview(review([input(current)], [input(prior)])), /not deleted/u);
});

test('prior comparisons require exact provider, identity and request scope', () => {
  assert.throws(() => review([input(annotation('uniprot'))], [input(annotation('reactome'))]), /exact request scope/u);
  const previous = literature(), next = structuredClone(previous);
  next.query = 'SYNTHETIC changed query'; next.request_url = buildOpenAlexRequest(next.query, 5).href;
  assert.throws(() => review([input(next)], [input(previous)]), /exact request scope/u);
  next.query = previous.query; next.request_url = buildOpenAlexRequest(next.query, 10).href;
  assert.throws(() => review([input(next)], [input(previous)]), /exact request scope/u);
  assert.throws(() => review([input(previous), input(previous)]), /Duplicate packet/u);
});

test('source-score order is not a changed association and release component types are preserved', () => {
  const before = annotation('opentargets');
  if (before.records[0].kind === 'disease_association') before.records[0].datasource_scores.push({ id: 'another-synthetic-source', score: .8 });
  const after = structuredClone(before);
  if (after.records[0].kind === 'disease_association') after.records[0].datasource_scores.reverse();
  after.provider_version = { year: '26', month: 9, iteration: null };
  const result = review([input(after)], [input(before)]).packets[0];
  assert.equal(result.records[0].change, 'unchanged');
  assert.ok(result.metadata_changes.some(({ field }) => field === 'provider_version'));
  assert.deepEqual(result.provenance.provider_version, { year: '26', month: 9, iteration: null });
});

test('legacy, composite, raw, malformed, over-limit and approval-bearing packets fail closed', () => {
  for (const value of [{ schema_version: 'biomedical-annotations-1' }, { schema_version: 'openalex-candidates-0.1.0' },
    { schema_version: 'source-checked-intake-batch-1', packets: [] }, raw.uniprot, null]) assert.throws(() => review([input(value)]));
  const base = annotation('uniprot');
  for (const patch of [{ response_sha256: null }, { retrieved_at: at }, { status: 'approved' }, { human_reviewed: true },
    { request: { url: 'https://evil.invalid/?secret=DO_NOT_PRINT', method: 'GET', body: null } }, { coverage: { ...base.coverage, retained: 2 } },
    { provider_release: '2026_bad' }, { reuse: { ...base.reuse, attribution: 'forged' } }, { processed_at: '2026-02-30T00:00:00Z' }]) {
    assert.throws(() => review([input({ ...base, ...patch })]), (error: Error) => !error.message.includes('DO_NOT_PRINT'));
  }
  assert.throws(() => review([{ name: 'bad', bytes: Buffer.from([255]) }]), /valid UTF-8 JSON/u);
  assert.throws(() => review([{ name: 'oversized', bytes: Buffer.alloc(5 * 1024 * 1024 + 1) }]), /5 MiB/u);
  assert.throws(() => review([])); assert.throws(() => review(Array.from({ length: 17 }, () => input(base))));
});

test('identity/species/endpoint disagreements and normalized extra record fields are not repaired', () => {
  const packet = annotation('uniprot');
  for (const patch of [{ accession: 'P00001' }, { taxonomy_id: 10090 }, { gene_symbol: 'OTHER' }, { secret: 'DO_NOT_RETAIN' }]) {
    const changed = structuredClone(packet); Object.assign(changed.records[0], patch);
    assert.throws(() => review([input(changed)]));
  }
  const otherIdentity = { symbol: 'SYNTHETIC1', ensembl: 'ENSG00000000001', uniprot: 'P00001' };
  const other = normalizeAnnotationResponse(encode([{ stId: 'R-HSA-9029569', speciesName: 'Homo sapiens', schemaClass: 'Pathway', displayName: 'SYNTHETIC mapping' }]), { provider: 'reactome', identity: otherIdentity, processedAt: at });
  const result = review([input(other)]).packets[0].records[0];
  assert.equal(result.graph_matches.status, 'not_represented');
  assert.deepEqual(result.graph_matches.claim_ids, []);
});

test('Reactome does not borrow gene-level annotations and metadata never becomes empirical support', () => {
  const identity = { symbol: 'COL1A1', ensembl: 'ENSG00000108821', uniprot: 'P02452' };
  const packet = normalizeAnnotationResponse(encode([{ stId: 'R-HSA-2173782', speciesName: 'Homo sapiens', schemaClass: 'Pathway', displayName: 'SYNTHETIC mapping' }]), { provider: 'reactome', identity, processedAt: at });
  assert.equal(review([input(packet)]).packets[0].records[0].graph_matches.status, 'not_represented');
  assert.deepEqual(review([input(packet)]).packets[0].records[0].graph_matches.claim_ids, []);
  const text = renderIntakeReview(review([input(literature())]));
  assert.match(text, /literature/u); assert.match(text, /No graph records or review attestations/u);
});

test('OpenAlex duplicates retain aliases and retraction differences without extra experiments', async () => {
  const fixture = JSON.parse(await readFile(new URL('./fixtures/openalex-response.json', import.meta.url), 'utf8'));
  const packet = normalizeOpenAlexResponse(fixture, { query: 'SYNTHETIC duplicates', processedAt: at, requestUrl: buildOpenAlexRequest('SYNTHETIC duplicates') });
  const result = review([input(packet)]).packets[0];
  assert.equal(result.records.length, 2); assert.equal(result.duplicate_metadata.length, 1);
  const record = result.records.find(({ record }) => 'candidate_id' in record && record.review_flags.includes('different_provider_retraction_flags'))!;
  assert.ok(record);
  const bad = structuredClone(packet); bad.candidates[0].status = 'approved' as 'unreviewed';
  assert.throws(() => review([input(bad)]));
  const secret = structuredClone(packet); secret.request_url += '&api_key=DO_NOT_PRINT';
  assert.throws(() => review([input(secret)]), (error: Error) => !error.message.includes('DO_NOT_PRINT'));
});

test('a stable OpenAlex work acquiring DOI and PMID is changed metadata rather than a new candidate', () => {
  const before = literature();
  before.candidates[0].doi_url = null; before.candidates[0].pubmed_url = null;
  const after = structuredClone(before);
  after.candidates[0].doi_url = 'https://doi.org/10.1074/jbc.m407963200';
  after.candidates[0].pubmed_url = 'https://pubmed.ncbi.nlm.nih.gov/15269217/';
  const result = review([input(after)], [input(before)]).packets[0];
  assert.equal(result.records.length, 1); assert.equal(result.not_returned.length, 0);
  assert.equal(result.records[0].key, 'literature:openalex:W2013111251');
  assert.equal(result.records[0].change, 'changed');
  assert.deepEqual(result.records[0].fields, [
    { field: 'doi_url', before: null, after: 'https://doi.org/10.1074/jbc.m407963200' },
    { field: 'pubmed_url', before: null, after: 'https://pubmed.ncbi.nlm.nih.gov/15269217/' },
  ]);
});

test('duplicate metadata content changes retain old/new values even when the candidate and duplicate count are unchanged', async () => {
  const fixture = JSON.parse(await readFile(new URL('./fixtures/openalex-response.json', import.meta.url), 'utf8'));
  const context = { query: 'SYNTHETIC duplicates', processedAt: at, requestUrl: buildOpenAlexRequest('SYNTHETIC duplicates') };
  const before = normalizeOpenAlexResponse(fixture, context);
  const changed = structuredClone(fixture); changed.results[1].title = 'SYNTHETIC revised duplicate title';
  const after = normalizeOpenAlexResponse(changed, context);
  const report = review([input(after)], [input(before)]), result = report.packets[0];
  assert.ok(result.records.every(({ change }) => change === 'unchanged'));
  assert.deepEqual(result.metadata_changes, []);
  assert.equal(result.duplicate_metadata.length, 1); assert.equal(result.previous_duplicate_metadata!.length, 1);
  assert.equal(result.previous_duplicate_metadata![0].record.title, 'Synthetic duplicate metadata fixture A');
  assert.equal(result.duplicate_metadata[0].record.title, 'SYNTHETIC revised duplicate title');
  assert.deepEqual(result.duplicate_metadata_changes, [{ field: 'duplicate_records', before: before.duplicate_records, after: after.duplicate_records }]);
  const markdown = renderIntakeReview(report);
  assert.match(markdown, /not additional experiments/u);
  assert.match(markdown, /Synthetic duplicate metadata fixture A/u);
  assert.match(markdown, /SYNTHETIC revised duplicate title/u);
  const fewer = structuredClone(fixture); fewer.results.splice(1, 1);
  const missing = review([input(normalizeOpenAlexResponse(fewer, context))], [input(before)]);
  assert.deepEqual(missing.packets[0].duplicate_metadata, []);
  assert.equal(missing.packets[0].previous_duplicate_metadata!.length, 1);
  assert.equal(missing.packets[0].duplicate_metadata_changes.length, 1);
  assert.match(renderIntakeReview(missing), /not evidence that a provider record was deleted/u);
});

test('a changed OpenAlex group representative requires explicit reconciliation instead of guessing correspondence', async () => {
  const fixture = JSON.parse(await readFile(new URL('./fixtures/openalex-response.json', import.meta.url), 'utf8'));
  const context = { query: 'SYNTHETIC duplicates', processedAt: at, requestUrl: buildOpenAlexRequest('SYNTHETIC duplicates') };
  const before = normalizeOpenAlexResponse(fixture, context);
  const changed = structuredClone(fixture);
  changed.results.splice(0, 1);
  const after = normalizeOpenAlexResponse(changed, context);
  assert.throws(() => review([input(after)], [input(before)]), /candidate grouping changed/u);
  assert.equal(review([input(after)]).packets.length, 1, 'The changed packet remains independently reviewable.');
});

test('publication identifiers matching different sources are ambiguous rather than merged into another study', () => {
  const packet = literature();
  packet.candidates[0].pubmed_url = 'https://pubmed.ncbi.nlm.nih.gov/16207707/';
  const result = review([input(packet)]).packets[0].records[0].graph_matches;
  assert.equal(result.status, 'ambiguous');
  assert.deepEqual(result.source_ids, ['source-hirsch-reinshagen-2005', 'source-wahrle-2004']);
  assert.deepEqual(result.claim_ids, []);
});

test('review cannot trigger a network request from normalized content', () => {
  const original = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('A review must not make a request.'); };
  try { assert.equal(review([input(annotation('uniprot')), input(literature())]).packets.length, 2); }
  finally { globalThis.fetch = original; }
});

test('Markdown escapes provider text instead of emitting active HTML or injected headings', () => {
  const packet = annotation('uniprot');
  if (packet.records[0].kind === 'protein_identity') packet.records[0].protein_name = '<script>alert(1)</script> [fake](https://evil.invalid) **bold**';
  const result = renderIntakeReview(review([input(packet)]));
  assert.ok(!result.includes('<script>')); assert.ok(!result.includes('[fake](https://evil.invalid)'));
  assert.ok(result.includes('&lt;script&gt;'));
});

test('CLI produces deterministic stdout only and rejects malicious input without leaking it or writing a graph', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'intake-review-test-'));
  try {
    const file = join(dir, 'synthetic.json'); await writeFile(file, encode(annotation('uniprot')));
    const run = (args: string[]) => spawnSync(process.execPath, ['--experimental-strip-types', 'tools/curation/intake-review.ts', ...args], { encoding: 'utf8', timeout: 10_000 });
    const args = ['--packet', file, '--format', 'json'];
    const a = run(args), b = run(args);
    assert.equal(a.status, 0); assert.equal(b.status, 0); assert.equal(a.stdout, b.stdout);
    assert.equal(a.stderr, ''); assert.equal(JSON.parse(a.stdout).status, 'unreviewed');
    await writeFile(file, encode({ ...annotation('uniprot'), secret: 'DO_NOT_PRINT' }));
    const bad = run(args); assert.equal(bad.status, 1); assert.equal(bad.stdout, ''); assert.ok(!bad.stderr.includes('DO_NOT_PRINT'));
    const missing = run(['--packet', join(dir, 'SECRET_PATH'), '--format', 'json']);
    assert.equal(missing.status, 1); assert.ok(!missing.stderr.includes('SECRET_PATH'));
    assert.equal(run(['--packet', dir]).status, 1);
    if (process.platform !== 'win32') {
      const pipe = join(dir, 'not-a-file');
      assert.equal(spawnSync('mkfifo', [pipe]).status, 0);
      const nonregular = run(['--packet', pipe]);
      assert.equal(nonregular.status, 1, 'Opening a named pipe must fail instead of blocking for a writer.');
      assert.equal(nonregular.stdout, '');
    }
    assert.equal(hash(await readFile('data/alzheimers/dataset.json')), hash(snapshotBytes));
  } finally { await rm(dir, { recursive: true, force: true }); }
});
