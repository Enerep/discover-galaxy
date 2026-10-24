import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { buildAnnotationRequest, fetchAnnotations, MAX_BYTES, normalizeAnnotationResponse, validateIdentity } from './biomedical-intake.ts';
import type { GeneIdentity, Provider } from './biomedical-intake.ts';

// Every provider payload in these tests is authored synthetic data, never production evidence.
const identity: GeneIdentity = { symbol: 'SYNTHETIC1', ensembl: 'ENSG00000000001', uniprot: 'P00001' };
const processedAt = '2026-10-24T00:00:00Z';
const fixtures = {
  uniprot: { primaryAccession: identity.uniprot, organism: { taxonId: 9606 }, genes: [{ geneName: { value: identity.symbol } }],
    entryType: 'UniProtKB reviewed (Swiss-Prot)', proteinDescription: { recommendedName: { fullName: { value: 'SYNTHETIC protein name' } } },
    entryAudit: { entryVersion: 1, lastAnnotationUpdateDate: '2026-01-01' }, uniProtKBCrossReferences: [{ database: 'Ensembl', properties: [{ key: 'GeneId', value: `${identity.ensembl}.2` }] }],
    sequence: { value: 'DO_NOT_RETAIN_SEQUENCE' }, comments: [{ text: 'DO_NOT_RETAIN_FUNCTION_PROSE' }], api_key: 'DO_NOT_RETAIN_SECRET' },
  reactome: [{ stId: 'R-HSA-900000001', stIdVersion: 'R-HSA-900000001.2', speciesName: 'Homo sapiens', schemaClass: 'Pathway', displayName: 'SYNTHETIC mapping', summation: 'DO_NOT_RETAIN_TEXT' }],
  opentargets: { data: { meta: { dataVersion: { year: 26, month: 10, iteration: null } }, target: { id: identity.ensembl, approvedSymbol: identity.symbol,
    associatedDiseases: { count: 25, rows: [{ disease: { id: 'EFO_900000001', name: 'SYNTHETIC disease' }, score: .3, datasourceScores: [{ id: 'synthetic-source', score: .4 }], abstract: 'DO_NOT_RETAIN_ABSTRACT' }] } } } },
};
const bytes = (value: unknown) => Buffer.from(JSON.stringify(value));
const normalize = (provider: Provider, value: unknown = fixtures[provider]) => normalizeAnnotationResponse(bytes(value), { provider, identity, processedAt });

test('fixed provider requests bind exact human identities and limit direct associations to one page', () => {
  assert.match(buildAnnotationRequest('uniprot', identity).url, /P00001\.json$/u);
  assert.match(buildAnnotationRequest('reactome', identity).url, /UniProt\/P00001\/pathways\?species=9606$/u);
  const request = buildAnnotationRequest('opentargets', identity);
  assert.equal(request.method, 'POST');
  const payload = JSON.parse(request.body!);
  assert.deepEqual(payload.variables, { id: identity.ensembl });
  assert.ok(payload.query.includes('enableIndirect: false') && payload.query.includes('index: 0, size: 20'));
  for (const patch of [{ symbol: undefined }, { symbol: 1 }, { symbol: 'APOE?key=secret' }, { ensembl: 'ENSG00000000001.2' }, { uniprot: 'P00001-2' }, { uniprot: 'https://evil.invalid/' }]) {
    assert.throws(() => validateIdentity({ ...identity, ...patch } as GeneIdentity));
  }
  assert.throws(() => buildAnnotationRequest('other' as Provider, identity));
});

test('saved provider responses stay unreviewed, hashed and outside graph promotion without fabricated retrieval', () => {
  for (const provider of ['uniprot', 'reactome', 'opentargets'] as const) {
    const packet = normalize(provider);
    assert.equal(packet.data_origin, 'offline_input');
    assert.equal(packet.request_provenance, 'declared_for_offline_input');
    assert.equal(packet.retrieved_at, null);
    assert.equal(packet.immutable_release, null);
    assert.equal(packet.status, 'unreviewed');
    assert.equal(packet.promotion, 'not_in_graph');
    assert.equal(packet.response_sha256, createHash('sha256').update(bytes(fixtures[provider])).digest('hex'));
    assert.ok(!JSON.stringify(packet).includes('DO_NOT_RETAIN'));
    assert.ok(!('claims' in packet) && !('human_reviewed' in packet));
  }
  const protein = normalize('uniprot');
  assert.equal(protein.provider_release, null);
  assert.equal(protein.records[0].kind, 'protein_identity');
  if (protein.records[0].kind === 'protein_identity') assert.equal(protein.records[0].ensembl_cross_reference_verified, true);
  assert.equal(normalize('reactome').coverage.total_reported, null);
  assert.equal(normalize('reactome').coverage.truncated, null);
  const associations = normalize('opentargets');
  assert.equal(associations.provider_release, '26.10');
  assert.equal(associations.coverage.truncated, true);
  assert.equal(associations.coverage.retained, 1);
  if (associations.records[0].kind === 'disease_association') {
    assert.equal(associations.records[0].overall_association_score, .3);
    assert.deepEqual(associations.records[0].datasource_scores, [{ id: 'synthetic-source', score: .4 }]);
  }
});

test('identity, species, schema and duplicate mapping disagreements fail rather than repairing or merging', () => {
  for (const patch of [{ primaryAccession: 'P00002' }, { organism: { taxonId: 10090 } }, { genes: [{ geneName: { value: 'WRONG' } }] }, { entryAudit: { entryVersion: 1, lastAnnotationUpdateDate: '2026-02-30' } }]) {
    assert.throws(() => normalize('uniprot', { ...fixtures.uniprot, ...patch }));
  }
  const wrongEnsembl = structuredClone(fixtures.uniprot);
  wrongEnsembl.uniProtKBCrossReferences[0].properties[0].value = 'ENSG00000000002';
  assert.throws(() => normalize('uniprot', wrongEnsembl));
  for (const patch of [{ stId: 'R-MMU-900000001' }, { schemaClass: 'Reaction' }, { speciesName: 'Mus musculus' }, { stIdVersion: 'R-HSA-900000002.2' }]) {
    assert.throws(() => normalize('reactome', [{ ...fixtures.reactome[0], ...patch }]));
  }
  assert.throws(() => normalize('reactome', [...fixtures.reactome, ...fixtures.reactome]));
  assert.equal(normalize('reactome', []).records.length, 0);
});

test('GraphQL errors, partial pages, mismatched targets and invalid scores never turn into evidence', () => {
  assert.throws(() => normalize('opentargets', { ...fixtures.opentargets, errors: [{ message: 'DO_NOT_PRINT_SECRET' }] }), (error: Error) => !error.message.includes('DO_NOT_PRINT_SECRET'));
  for (const patch of [{ id: 'ENSG00000000002' }, { approvedSymbol: 'WRONG' }, { associatedDiseases: { count: 0, rows: fixtures.opentargets.data.target.associatedDiseases.rows } }]) {
    const response = structuredClone(fixtures.opentargets);
    Object.assign(response.data.target, patch);
    assert.throws(() => normalize('opentargets', response));
  }
  for (const patch of [{ score: -1 }, { score: 1.1 }, { score: '.5' }, { disease: { id: 'https://evil.invalid/', name: 'Synthetic' } }]) {
    const response = structuredClone(fixtures.opentargets);
    Object.assign(response.data.target.associatedDiseases.rows[0], patch);
    assert.throws(() => normalize('opentargets', response));
  }
  const duplicate = structuredClone(fixtures.opentargets);
  duplicate.data.target.associatedDiseases.rows.push(duplicate.data.target.associatedDiseases.rows[0]);
  assert.throws(() => normalize('opentargets', duplicate));
});

test('live transport makes one bounded request, captures actual completion and preserves provider release', async () => {
  for (const provider of ['uniprot', 'reactome', 'opentargets'] as const) {
    let calls = 0;
    const packet = await fetchAnnotations(provider, identity, async (input, init) => {
      calls += 1;
      assert.equal(String(input), buildAnnotationRequest(provider, identity).url);
      assert.equal(init?.redirect, 'error');
      assert.equal(init?.method, provider === 'opentargets' ? 'POST' : 'GET');
      return new Response(bytes(fixtures[provider]), { headers: { 'x-uniprot-release': '2026_05' } });
    });
    assert.equal(calls, 1);
    assert.equal(packet.data_origin, 'live_api_response');
    assert.equal(packet.request_provenance, 'issued_by_adapter');
    assert.equal(packet.retrieved_at, packet.processed_at);
    assert.equal(packet.status, 'unreviewed');
    if (provider === 'uniprot') assert.equal(packet.provider_release, '2026_05');
  }
});

test('transport failures, HTTP errors, oversized streams and timeouts produce no secret-bearing packet', async () => {
  for (const status of [403, 429, 500]) {
    let calls = 0;
    await assert.rejects(fetchAnnotations('uniprot', identity, async () => { calls += 1; return new Response('DO_NOT_PRINT_SECRET', { status }); }), new RegExp(`HTTP ${status}`));
    assert.equal(calls, 1, 'Do not retry or evade provider/network limits.');
  }
  await assert.rejects(fetchAnnotations('uniprot', identity, async () => { throw new Error('DO_NOT_PRINT_SECRET'); }), (error: Error) => !error.message.includes('DO_NOT_PRINT_SECRET'));
  await assert.rejects(fetchAnnotations('uniprot', identity, async () => new Response('', { headers: { 'content-length': String(MAX_BYTES + 1) } })), /5 MiB/);
  const stream = new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(MAX_BYTES)); controller.enqueue(new Uint8Array(1)); controller.close(); } });
  await assert.rejects(fetchAnnotations('uniprot', identity, async () => new Response(stream)), /5 MiB/);
  await assert.rejects(fetchAnnotations('uniprot', identity, async (_url, init) => new Promise((_resolve, reject) => {
    init!.signal!.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
  }), 5), /timed out/);
  assert.throws(() => normalizeAnnotationResponse(new Uint8Array([255]), { provider: 'uniprot', identity, processedAt }), /UTF-8/);
  assert.throws(() => normalizeAnnotationResponse(new Uint8Array(MAX_BYTES + 1), { provider: 'uniprot', identity, processedAt }), /5 MiB/);
});

test('the real seed reproduces exact approved identifiers and gene-level memberships without changing analysis references', async () => {
  const seed = JSON.parse(await readFile(new URL('../../data/annotations/coverage-seed.json', import.meta.url), 'utf8'));
  const referenceBytes = await readFile(new URL('../../data/reference/reactome-pathways.json', import.meta.url));
  assert.equal(createHash('sha256').update(referenceBytes).digest('hex'), seed.reactome_normalized_sha256);
  const reference = JSON.parse(referenceBytes.toString());
  const pathway = reference.pathways.find((row: { id: string }) => row.id === 'R-HSA-2173782');
  const hgnc = JSON.parse(await readFile(new URL('../../data/reference/hgnc-ensembl.json', import.meta.url), 'utf8'));
  assert.deepEqual(seed.genes.map((gene: { symbol: string }) => gene.symbol), ['COL1A1', 'COL1A2', 'COL3A1', 'SAA1']);
  for (const gene of seed.genes) {
    assert.ok(hgnc.genes.some((row: string[]) => row[0] === gene.hgnc_id && row[1] === gene.symbol && row[2] === gene.ensembl_gene_id));
    assert.ok(pathway.genes.includes(gene.symbol));
    assert.equal(gene.pathway_membership.level, 'gene_set_annotation');
    assert.equal(gene.pathway_membership.id, pathway.id);
  }
  assert.equal(seed.retrieved_at, null);
  assert.equal(seed.data_origin, 'pinned_reference_extract');
  assert.equal(seed.scientific_review, 'not_performed_by_generator');
  assert.ok(!('claims' in seed) && !('human_reviewed' in seed));
  const result = spawnSync('python3', ['tools/curation/prepare-annotation-seed.py', '--check'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});
