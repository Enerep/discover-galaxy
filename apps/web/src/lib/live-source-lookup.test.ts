import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fetchLiveSource, getLiveLookupIdentity, LIVE_PROVIDERS } from './live-source-lookup.ts';
import type { LiveProvider } from './live-source-lookup.ts';
import type { Entity } from './types.ts';
import type { GeneIdentity } from '../../../../shared/source-intake/biomedical.ts';
import { MAX_BYTES, OFFLINE_PROVENANCE_LIMITATION } from '../../../../shared/source-intake/biomedical.ts';

const apoe: GeneIdentity = { symbol: 'APOE', ensembl: 'ENSG00000130203', uniprot: 'P02649' };
const abca1: GeneIdentity = { symbol: 'ABCA1', ensembl: 'ENSG00000165029', uniprot: 'O95477' };
const entities: Entity[] = JSON.parse(await readFile(new URL('../../../../data/alzheimers/dataset.json', import.meta.url), 'utf8')).entities;
const literature = JSON.parse(await readFile(new URL('../../../../tools/curation/fixtures/openalex-response.json', import.meta.url), 'utf8'));
const entity = (id: string) => entities.find((item) => item.id === id)!;
const raw = (value: unknown) => new TextEncoder().encode(`${JSON.stringify(value, null, 2)}\n`);
const response = (value: unknown, headers: Record<string, string> = {}) => new Response(raw(value), { headers });

// Authored synthetic provider payloads use the public lookup identity only to
// exercise joins. Their names, versions and scores are not scientific records.
function fixtures(identity = apoe) {
  return {
    uniprot: {
      primaryAccession: identity.uniprot, organism: { taxonId: 9606 },
      genes: [{ geneName: { value: identity.symbol } }], entryType: 'UniProtKB reviewed (Swiss-Prot)',
      proteinDescription: { recommendedName: { fullName: { value: 'SYNTHETIC protein fixture' } } },
      entryAudit: { entryVersion: 123, lastAnnotationUpdateDate: '2026-01-01' },
      uniProtKBCrossReferences: [{ database: 'Ensembl', properties: [{ key: 'GeneId', value: `${identity.ensembl}.7` }] }],
      sequence: { value: 'DO_NOT_RETAIN_SEQUENCE' }, api_key: 'DO_NOT_RETAIN_SECRET',
    },
    reactome: [{ stId: 'R-HSA-900000001', stIdVersion: 'R-HSA-900000001.3', speciesName: 'Homo sapiens', schemaClass: 'Pathway', displayName: 'SYNTHETIC pathway fixture', summation: 'DO_NOT_RETAIN_TEXT' }],
    opentargets: { data: { meta: { dataVersion: { year: '26', month: '04', iteration: '1' } }, target: {
      id: identity.ensembl, approvedSymbol: identity.symbol,
      associatedDiseases: { count: 25, rows: [{ disease: { id: 'EFO_900000001', name: 'SYNTHETIC disease fixture' }, score: .3, datasourceScores: [{ id: 'synthetic-source', score: .4 }], abstract: 'DO_NOT_RETAIN_ABSTRACT' }] },
    } } },
    openalex: literature,
  };
}

test('live identity lookup is confined to four exact curated human records and returns fresh public IDs', () => {
  for (const [id, expected] of [['gene-apoe', apoe], ['protein-apoe', apoe], ['gene-abca1', abca1], ['protein-abca1', abca1]] as const) {
    assert.deepEqual(getLiveLookupIdentity(entity(id)), expected);
  }
  assert.equal(entities.filter((item) => getLiveLookupIdentity(item)).length, 4);
  const source = entity('gene-apoe');
  for (const patch of [
    { id: 'gene-apoe-uploaded' }, { taxonomy_id: 10090 }, { taxonomy_id: undefined },
    { type: 'paper' as const }, { label: 'apoe' },
    { external_ids: source.external_ids.filter(({ namespace }) => namespace !== 'Ensembl') },
    { external_ids: source.external_ids.map((id) => id.namespace === 'Ensembl' ? { ...id, value: abca1.ensembl } : id) },
    { external_ids: [...source.external_ids, { namespace: 'NCBIGene', value: '348' }] },
  ]) assert.equal(getLiveLookupIdentity({ ...source, ...patch }), null);
  assert.equal(getLiveLookupIdentity({ ...entity('protein-apoe'), external_ids: [{ namespace: 'UniProt', value: abca1.uniprot }] }), null);
  const copied = getLiveLookupIdentity(source)!;
  copied.symbol = 'MUTATED';
  assert.deepEqual(getLiveLookupIdentity(source), apoe);
});

test('four live transports send only fixed public requests, hash exact bytes and retain honest provenance', async () => {
  const payloads = fixtures();
  const input = { ...apoe, comparison: 'DO_NOT_TRANSMIT_COMPARISON', rows: [{ gene: 'DO_NOT_TRANSMIT_UPLOAD' }], apiKey: 'DO_NOT_TRANSMIT_KEY' };
  const before = JSON.stringify(input);
  for (const provider of LIVE_PROVIDERS) {
    const calls: { url: string; init: RequestInit }[] = [];
    const result = await fetchLiveSource(provider, input, { fetcher: async (url, init) => {
      calls.push({ url: String(url), init: init! });
      return response(payloads[provider], provider === 'uniprot' ? { 'x-uniprot-release': '2026_04' } : {});
    } });
    assert.equal(calls.length, 1, 'A lookup never silently retries or follows another result page.');
    const request = calls[0];
    assert.equal(request.init.credentials, 'omit');
    assert.equal(request.init.referrerPolicy, 'no-referrer');
    assert.equal(request.init.mode, 'cors');
    assert.equal(request.init.cache, 'no-store');
    assert.equal(request.init.redirect, 'error');
    assert.ok(request.init.signal instanceof AbortSignal);
    const headers = new Headers(request.init.headers);
    assert.equal(headers.get('Accept'), 'application/json');
    assert.equal(headers.get('Authorization'), null);
    assert.equal(headers.get('Cookie'), null);
    assert.ok(!JSON.stringify(request).includes('DO_NOT_TRANSMIT'));
    if (provider === 'uniprot') assert.equal(request.url, 'https://rest.uniprot.org/uniprotkb/P02649.json');
    if (provider === 'reactome') assert.equal(request.url, 'https://reactome.org/ContentService/data/mapping/UniProt/P02649/pathways?species=9606');
    if (provider === 'opentargets') {
      assert.equal(request.url, 'https://api.platform.opentargets.org/api/v4/graphql');
      assert.equal(request.init.method, 'POST');
      assert.equal(headers.get('Content-Type'), 'application/json');
      const body = JSON.parse(String(request.init.body));
      assert.deepEqual(body.variables, { id: apoe.ensembl });
      assert.match(body.query, /enableIndirect: false/);
      assert.match(body.query, /index: 0, size: 20/);
    } else {
      assert.equal(request.init.method, 'GET');
      assert.equal(request.init.body, undefined);
    }
    if (provider === 'openalex') {
      const url = new URL(request.url);
      assert.equal(url.origin + url.pathname, 'https://api.openalex.org/works');
      assert.equal(url.searchParams.get('search.title_and_abstract'), 'Alzheimer AND APOE');
      assert.equal(url.searchParams.get('per_page'), '5');
      assert.equal(url.searchParams.get('page'), '1');
      assert.deepEqual([...url.searchParams.keys()].sort(), ['page', 'per_page', 'search.title_and_abstract', 'select']);
    }
    const packet = result.packet;
    assert.equal(result.provider, provider);
    assert.equal(packet.response_sha256, createHash('sha256').update(raw(payloads[provider])).digest('hex'));
    assert.equal(packet.data_origin, 'live_api_response');
    assert.equal(packet.request_provenance, 'issued_by_adapter');
    assert.ok(packet.retrieved_at && Number.isFinite(Date.parse(packet.retrieved_at)));
    assert.ok(Date.parse(packet.retrieved_at!) <= Date.parse(packet.processed_at));
    assert.equal(packet.immutable_release, null);
    assert.equal(packet.status, 'unreviewed');
    assert.equal(packet.promotion, 'not_in_graph');
    assert.ok(!JSON.stringify(packet).includes('DO_NOT_RETAIN'));
    assert.ok(!('human_reviewed' in packet) && !('claims' in packet));
    if (result.provider === 'openalex') {
      assert.equal(result.packet.metadata_license, 'CC0-1.0');
      assert.equal(result.packet.candidates.length, 2);
      assert.equal(result.packet.duplicate_records.length, 1);
      assert.equal(result.packet.candidates[0].provider_is_retracted, true);
      assert.equal(result.packet.candidates[0].independent_publication_check, 'not_checked');
      assert.equal(result.packet.candidates[1].title, null);
    } else {
      assert.ok(!result.packet.limitations.includes(OFFLINE_PROVENANCE_LIMITATION));
      assert.equal(result.packet.reuse.license, provider === 'uniprot' ? 'CC-BY-4.0' : 'CC0-1.0');
      if (provider === 'uniprot') assert.equal(result.packet.provider_release, '2026_04');
      if (provider === 'reactome') assert.equal(result.packet.provider_release, null);
      if (provider === 'opentargets') {
        assert.deepEqual(result.packet.provider_version, { year: '26', month: '04', iteration: '1' });
        assert.equal(result.packet.provider_release, '26.04.1');
        assert.deepEqual([result.packet.coverage.total_reported, result.packet.coverage.retained, result.packet.coverage.truncated], [25, 1, true]);
      }
    }
  }
  assert.equal(JSON.stringify(input), before);
});

test('unsupported providers, arbitrary identities, malformed timeouts and pre-abort cannot send requests', async () => {
  let calls = 0;
  const fetcher: typeof fetch = async () => { calls += 1; return response(fixtures().uniprot); };
  await assert.rejects(fetchLiveSource('https://evil.invalid' as LiveProvider, apoe, { fetcher }), /supported live source/);
  for (const input of [{ ...apoe, symbol: 'apoe' }, { ...apoe, ensembl: abca1.ensembl }, { ...apoe, uniprot: 'https://evil.invalid' }, { symbol: 'TREM2', ensembl: 'ENSG00000095970', uniprot: 'Q9NZC2' }]) {
    await assert.rejects(fetchLiveSource('uniprot', input, { fetcher }), /curated human APOE and ABCA1/);
  }
  for (const timeoutMs of [0, -1, 15_001, .1, NaN, Infinity]) await assert.rejects(fetchLiveSource('uniprot', apoe, { fetcher, timeoutMs }), /timeout/);
  const controller = new AbortController(); controller.abort();
  await assert.rejects(fetchLiveSource('uniprot', apoe, { fetcher, signal: controller.signal }), { name: 'AbortError' });
  assert.equal(calls, 0);
});

test('identity, organism, partial GraphQL data and untrusted identifier URLs cannot become live records', async () => {
  const source = fixtures();
  const badResponses: [LiveProvider, unknown][] = [
    ['uniprot', { ...source.uniprot, primaryAccession: abca1.uniprot }],
    ['uniprot', { ...source.uniprot, organism: { taxonId: 10090 } }],
    ['uniprot', { ...source.uniprot, genes: [{ geneName: { value: 'ABCA1' } }] }],
    ['uniprot', { ...source.uniprot, uniProtKBCrossReferences: [{ database: 'Ensembl', properties: [{ key: 'GeneId', value: abca1.ensembl }] }] }],
    ['reactome', [{ ...source.reactome[0], stId: 'R-MMU-900000001', speciesName: 'Mus musculus' }]],
    ['reactome', [source.reactome[0], source.reactome[0]]],
    ['opentargets', { ...source.opentargets, errors: [{ message: 'DO_NOT_EXPOSE_PROVIDER_ERROR' }] }],
    ['opentargets', { data: { ...source.opentargets.data, target: { ...source.opentargets.data.target, id: abca1.ensembl } } }],
    ['openalex', { meta: { count: 1 }, results: [{ id: 'https://evil.invalid/W1' }] }],
  ];
  for (const [provider, payload] of badResponses) {
    await assert.rejects(fetchLiveSource(provider, apoe, { fetcher: async () => response(payload) }), (error: Error) => {
      assert.ok(!error.message.includes('DO_NOT_EXPOSE'));
      return true;
    });
  }
  await assert.rejects(fetchLiveSource('uniprot', apoe, { fetcher: async () => response(source.uniprot, { 'x-uniprot-release': 'secret<script>' }) }), /release header/);
  const missingRelease = await fetchLiveSource('uniprot', apoe, { fetcher: async () => response(source.uniprot) });
  if (missingRelease.provider !== 'openalex') assert.equal(missingRelease.packet.provider_release, null, 'An unexposed release remains unknown.');
});

test('HTTP failure bodies are canceled, errors stay bounded and there is no automatic retry', async () => {
  for (const status of [403, 429, 503]) {
    let canceled = false; let calls = 0;
    const stream = new ReadableStream<Uint8Array>({ cancel() { canceled = true; } });
    await assert.rejects(fetchLiveSource('reactome', apoe, { fetcher: async () => { calls += 1; return new Response(stream, { status }); } }), new RegExp(`HTTP ${status}`));
    assert.equal(canceled, true);
    assert.equal(calls, 1);
  }
  await assert.rejects(fetchLiveSource('uniprot', apoe, { fetcher: async () => { throw new Error('DO_NOT_EXPOSE_SECRET https://evil.invalid/?key=secret'); } }), (error: Error) => {
    assert.match(error.message, /unavailable/);
    assert.ok(!error.message.includes('DO_NOT_EXPOSE') && !error.message.includes('evil.invalid'));
    return true;
  });
});

test('response byte limits cancel advertised and streamed overflow before retaining a packet', async () => {
  let advertisedCanceled = false;
  const advertised = new ReadableStream<Uint8Array>({ cancel() { advertisedCanceled = true; } });
  await assert.rejects(fetchLiveSource('uniprot', apoe, { fetcher: async () => new Response(advertised, { headers: { 'Content-Length': String(MAX_BYTES + 1) } }) }), /5 MiB/);
  assert.equal(advertisedCanceled, true);
  let streamedCanceled = false;
  const streamed = new ReadableStream<Uint8Array>({
    start(controller) { controller.enqueue(new Uint8Array(MAX_BYTES)); controller.enqueue(new Uint8Array(1)); },
    cancel() { streamedCanceled = true; },
  });
  await assert.rejects(fetchLiveSource('uniprot', apoe, { fetcher: async () => new Response(streamed) }), /5 MiB/);
  assert.equal(streamedCanceled, true);
  await assert.rejects(fetchLiveSource('uniprot', apoe, { fetcher: async () => new Response(null) }), /body is missing/);
  await assert.rejects(fetchLiveSource('uniprot', apoe, { fetcher: async () => new Response(new Uint8Array([255])) }), /UTF-8 JSON/);
});

test('deadline and parent cancellation stop a stalled body without returning a late packet', async () => {
  let deadlineCanceled = false;
  const stalled = new ReadableStream<Uint8Array>({ cancel() { deadlineCanceled = true; } });
  await assert.rejects(fetchLiveSource('uniprot', apoe, { timeoutMs: 10, fetcher: async () => new Response(stalled) }), /timed out/);
  assert.equal(deadlineCanceled, true);
  const controller = new AbortController();
  let parentCanceled = false;
  const second = new ReadableStream<Uint8Array>({ cancel() { parentCanceled = true; } });
  const pending = fetchLiveSource('uniprot', apoe, { signal: controller.signal, fetcher: async () => new Response(second) });
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  controller.abort();
  await assert.rejects(pending, { name: 'AbortError' });
  assert.equal(parentCanceled, true);
});

test('a failed provider does not discard independent successful provider packets', async () => {
  const source = fixtures(abca1);
  const outcomes = await Promise.allSettled(LIVE_PROVIDERS.map((provider) => fetchLiveSource(provider, abca1, { fetcher: async () => provider === 'reactome' ? new Response(null, { status: 403 }) : response(source[provider]) })));
  assert.deepEqual(outcomes.map(({ status }) => status), ['fulfilled', 'rejected', 'fulfilled', 'fulfilled']);
  for (const result of outcomes) if (result.status === 'fulfilled') assert.equal(result.value.packet.data_origin, 'live_api_response');
});
