import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { buildOpenAlexRequest, DEFAULT_QUERY, fetchOpenAlexCandidates, normalizeOpenAlexResponse } from './openalex-intake.ts';

const fixture = JSON.parse(await readFile(new URL('./fixtures/openalex-response.json', import.meta.url), 'utf8'));
const context = { query: DEFAULT_QUERY, processedAt: '2026-10-22T00:00:00Z', requestUrl: buildOpenAlexRequest() };

test('candidate metadata preserves nullable fields and stays separate from graph evidence', () => {
  const packet = normalizeOpenAlexResponse(fixture, context);
  assert.equal(packet.data_origin, 'offline_input');
  assert.equal(packet.request_provenance, 'declared_for_offline_input');
  assert.equal(packet.processed_at, context.processedAt);
  assert.equal(packet.retrieved_at, null);
  assert.equal(packet.immutable_release, null);
  assert.equal(packet.status, 'unreviewed');
  assert.equal(packet.promotion, 'not_in_graph');
  assert.equal(packet.candidates.length, 2);
  const missing = packet.candidates.find(({ title }) => title === null)!;
  assert.equal(missing.doi_url, null);
  assert.equal(missing.pubmed_url, null);
  assert.equal(missing.publication_year, null);
  assert.equal(missing.provider_is_retracted, null);
  assert.equal(missing.independent_publication_check, 'not_checked');
  assert.ok(!('claims' in packet));
  assert.ok(!('reviewer' in missing));
});

test('duplicate identifiers do not become independent candidates and retain retraction disagreements', () => {
  const packet = normalizeOpenAlexResponse(fixture, context);
  const repeated = packet.candidates[0];
  assert.equal(repeated.candidate_id, 'openalex:W900000000000001');
  assert.equal(repeated.source_record_ids.length, 2);
  assert.equal(repeated.provider_is_retracted, true);
  assert.deepEqual(repeated.provider_retraction_reports.map(({ value }) => value), [false, true]);
  assert.ok(repeated.review_flags.includes('different_provider_retraction_flags'));
  assert.equal(packet.duplicate_records.length, 1);
  assert.equal(packet.duplicate_records[0].record.provider_is_retracted, true);
  assert.match(packet.limitations.join(' '), /does not establish cohort independence/);
  const shuffled = { ...fixture, results: [...fixture.results].reverse() };
  assert.deepEqual(normalizeOpenAlexResponse(shuffled, context).candidates, packet.candidates);
});

test('only allowlisted metadata survives; request secrets and untrusted payload fields are discarded', () => {
  const requestUrl = new URL(context.requestUrl);
  requestUrl.searchParams.set('api_key', 'synthetic-secret-never-log');
  requestUrl.searchParams.set('token', 'synthetic-token-never-log');
  const raw = structuredClone(fixture);
  raw.results[0].api_key = 'payload-secret-never-retain';
  raw.results[0].supports = 'APOE causes a cure';
  const encoded = JSON.stringify(normalizeOpenAlexResponse(raw, { ...context, requestUrl }));
  for (const excluded of ['synthetic-secret', 'synthetic-token', 'payload-secret', 'DO_NOT_RETAIN_ABSTRACT', 'DO_NOT_RETAIN_FULLTEXT', 'APOE causes a cure']) assert.ok(!encoded.includes(excluded));
  assert.ok(!new URL(JSON.parse(encoded).request_url).searchParams.has('api_key'));
});

test('identifier aliases link transitively without producing extra candidate studies', () => {
  const raw = structuredClone(fixture);
  raw.results[1].doi = 'https://doi.org/10.5555/discovery-galaxy-synthetic-b';
  raw.results[1].ids.doi = raw.results[1].doi;
  raw.results[2] = { ...structuredClone(raw.results[0]), doi: raw.results[1].doi, ids: { doi: raw.results[1].doi } };
  const packet = normalizeOpenAlexResponse(raw, context);
  assert.equal(packet.candidates.length, 1);
  assert.equal(packet.candidates[0].candidate_id, 'openalex:W900000000000001');
  assert.equal(packet.duplicate_records.length, 2);
});

test('invalid envelopes, bounds, identifiers, dates and provider shapes fail closed', () => {
  for (const response of [null, [], { results: [] }, { meta: { count: -1 }, results: [] }, { meta: { count: 0 }, results: fixture.results }]) assert.throws(() => normalizeOpenAlexResponse(response, context));
  for (const patch of [
    { id: 'javascript:alert(1)' }, { id: 'https://example.invalid/W123' },
    { doi: 'https://doi.org/10.5555/a?api_key=secret' }, { ids: { pmid: 'https://example.invalid/1' } },
    { publication_date: '2026-02-30' }, { is_retracted: 'false' }, { title: { injected: true } }, { ids: [] },
  ]) {
    const raw = structuredClone(fixture);
    Object.assign(raw.results[0], patch);
    assert.throws(() => normalizeOpenAlexResponse(raw, context));
  }
  assert.throws(() => normalizeOpenAlexResponse(fixture, { ...context, requestUrl: buildOpenAlexRequest(DEFAULT_QUERY, 1) }));
  for (const limit of [0, 51, 2.5]) assert.throws(() => buildOpenAlexRequest(DEFAULT_QUERY, limit));
  assert.throws(() => buildOpenAlexRequest('x'.repeat(513)));
  assert.throws(() => normalizeOpenAlexResponse(fixture, { ...context, requestUrl: 'https://example.invalid/works' }));
  assert.throws(() => normalizeOpenAlexResponse(fixture, { ...context, requestUrl: 'https://api.openalex.org/works?page=2' }));
});

test('fetch uses one bounded request and bearer auth without persisting credentials', async () => {
  let calls = 0;
  const packet = await fetchOpenAlexCandidates({ apiKey: 'synthetic-test-bearer' }, async (input, init) => {
    calls += 1;
    assert.equal(new URL(String(input)).searchParams.get('page'), '1');
    assert.equal(new URL(String(input)).searchParams.has('api_key'), false);
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer synthetic-test-bearer');
    assert.equal(init?.redirect, 'error');
    return new Response(JSON.stringify(fixture));
  });
  assert.equal(calls, 1);
  assert.equal(packet.data_origin, 'live_api_response');
  assert.equal(packet.request_provenance, 'issued_by_adapter');
  assert.equal(packet.retrieved_at, packet.processed_at);
  assert.ok(packet.retrieved_at !== null && Number.isFinite(Date.parse(packet.retrieved_at)));
  assert.ok(!JSON.stringify(packet).includes('synthetic-test-bearer'));
});

test('fetch failures never echo response bodies, transport details, or credentials', async () => {
  await assert.rejects(fetchOpenAlexCandidates({}, async () => new Response('secret-response-body', { status: 429 })), /HTTP 429; no response content/);
  await assert.rejects(fetchOpenAlexCandidates({}, async () => { throw new Error('https://api.openalex.org/?api_key=secret'); }), (error: Error) => !error.message.includes('secret') && /network access/.test(error.message));
  await assert.rejects(fetchOpenAlexCandidates({}, async () => new Response('secret-invalid-json')), (error: Error) => !error.message.includes('secret') && /valid UTF-8 JSON/.test(error.message));
  await assert.rejects(fetchOpenAlexCandidates({}, async () => new Response('{}', { headers: { 'content-length': String(5 * 1024 * 1024 + 1) } })), /5 MiB/);
  await assert.rejects(fetchOpenAlexCandidates({}, async () => new Response(new Uint8Array(5 * 1024 * 1024 + 1))), /5 MiB/);
  await assert.rejects(fetchOpenAlexCandidates({ timeoutMs: 10 }, async (_input, init) => new Promise((_resolve, reject) => { init!.signal!.addEventListener('abort', () => reject(new Error('secret-transport-details')), { once: true }); })), /timed out/);
});
