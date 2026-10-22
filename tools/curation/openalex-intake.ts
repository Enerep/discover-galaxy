import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const DEFAULT_QUERY = 'Alzheimer AND (APOE OR ABCA1 OR TREM2)';
const SELECT = 'id,ids,doi,title,publication_year,publication_date,type,is_retracted,updated_date';
const MAX_BYTES = 5 * 1024 * 1024;
type DataOrigin = 'offline_input' | 'live_api_response';
type RetractionFlag = boolean | null;

interface WorkMetadata {
  openalex_id: string;
  doi_url: string | null;
  pubmed_url: string | null;
  title: string | null;
  publication_year: number | null;
  publication_date: string | null;
  work_type: string | null;
  provider_is_retracted: RetractionFlag;
  provider_updated_at: string | null;
}

export interface CandidateIntakePacket {
  schema_version: 'openalex-candidates-0.1.0';
  data_origin: DataOrigin;
  request_provenance: 'declared_for_offline_input' | 'issued_by_adapter';
  provider: 'OpenAlex';
  immutable_release: null;
  processed_at: string;
  retrieved_at: string | null;
  query: string;
  request_url: string;
  metadata_license: 'CC0-1.0';
  metadata_terms_url: string;
  attribution: string;
  status: 'unreviewed';
  promotion: 'not_in_graph';
  provider_result_count: number;
  candidates: (WorkMetadata & {
    candidate_id: string;
    source_record_ids: string[];
    provider_retraction_reports: { openalex_id: string; value: RetractionFlag }[];
    review_flags: string[];
    independent_publication_check: 'not_checked';
    status: 'unreviewed';
    promotion: 'not_in_graph';
  })[];
  duplicate_records: { matches_candidate_id: string; record: WorkMetadata }[];
  limitations: string[];
}

class IntakeError extends Error {}
function fail(message: string): never { throw new IntakeError(message); }
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);

function queryText(value: string): string {
  if (typeof value !== 'string' || !value.trim() || value.length > 512 || /[\u0000-\u001f\u007f]/u.test(value)) fail('Query must contain 1–512 characters without control characters.');
  return value.trim();
}

function limitNumber(value: number): number {
  if (!Number.isInteger(value) || value < 1 || value > 50) fail('Limit must be an integer from 1 to 50.');
  return value;
}

export function buildOpenAlexRequest(query = DEFAULT_QUERY, limit = 20): URL {
  const url = new URL('https://api.openalex.org/works');
  url.searchParams.set('search.title_and_abstract', queryText(query));
  url.searchParams.set('per_page', String(limitNumber(limit)));
  url.searchParams.set('page', '1');
  url.searchParams.set('select', SELECT);
  return url;
}

function cleanText(value: unknown, name: string, max = 2048): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string' || value.length > max || /[\u0000-\u001f\u007f]/u.test(value)) fail(`OpenAlex ${name} is malformed.`);
  return value.trim() || null;
}

function safeUrl(value: string, hosts: string[]): URL {
  let url: URL;
  try { url = new URL(value); } catch { return fail('OpenAlex identifier URL is malformed.'); }
  if (!['https:', 'http:'].includes(url.protocol) || !hosts.includes(url.hostname) || url.username || url.password || url.port || url.search || url.hash) fail('OpenAlex identifier URL is not an allowed canonical address.');
  return url;
}

function openAlexId(value: unknown): string {
  if (typeof value !== 'string') fail('OpenAlex work ID is missing or malformed.');
  const url = safeUrl(value, ['openalex.org']);
  const match = /^\/(?:works\/)?(W\d+)$/.exec(url.pathname);
  if (!match) fail('OpenAlex work ID is missing or malformed.');
  return `https://openalex.org/${match[1]}`;
}

function doiUrl(value: unknown): string | null {
  const text = cleanText(value, 'DOI', 1024);
  if (!text) return null;
  const url = safeUrl(text.startsWith('10.') ? `https://doi.org/${text}` : text, ['doi.org']);
  let doi: string;
  try { doi = decodeURIComponent(url.pathname.slice(1)); } catch { return fail('OpenAlex DOI has invalid escaping.'); }
  if (!/^10\.\d{4,9}\/\S+$/u.test(doi) || /[\u0000-\u001f\u007f]/u.test(doi)) fail('OpenAlex DOI is malformed.');
  const canonical = new URL('https://doi.org');
  canonical.pathname = `/${doi.toLowerCase()}`;
  return canonical.href;
}

function pubmedUrl(value: unknown): string | null {
  const text = cleanText(value, 'PubMed ID', 512);
  if (!text) return null;
  const url = safeUrl(text, ['pubmed.ncbi.nlm.nih.gov', 'www.ncbi.nlm.nih.gov']);
  const match = (url.hostname === 'pubmed.ncbi.nlm.nih.gov' ? /^\/(\d+)\/?$/ : /^\/pubmed\/(\d+)\/?$/).exec(url.pathname);
  if (!match) fail('OpenAlex PubMed ID is malformed.');
  return `https://pubmed.ncbi.nlm.nih.gov/${match[1]}/`;
}

function dateOnly(value: unknown): string | null {
  const text = cleanText(value, 'publication date', 10);
  if (!text) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || !Number.isFinite(Date.parse(`${text}T00:00:00Z`)) || new Date(`${text}T00:00:00Z`).toISOString().slice(0, 10) !== text) fail('OpenAlex publication date is malformed.');
  return text;
}

function timestamp(value: unknown, name: string): string | null {
  const text = cleanText(value, name, 40);
  if (!text) return null;
  // OpenAlex has historically returned UTC values with and without a trailing Z.
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|\+00:00)?$/.test(text)
    || !Number.isFinite(Date.parse(/[Z+]\d*:?\d*$/.test(text) ? text : `${text}Z`))) fail(`OpenAlex ${name} is malformed.`);
  dateOnly(text.slice(0, 10));
  return text;
}

function normalizeWork(value: unknown): WorkMetadata {
  if (!object(value)) fail('OpenAlex results must contain work objects.');
  if (value.ids !== undefined && value.ids !== null && !object(value.ids)) fail('OpenAlex external identifiers are malformed.');
  const ids = object(value.ids) ? value.ids : {};
  const id = openAlexId(value.id);
  if (ids.openalex !== undefined && openAlexId(ids.openalex) !== id) fail('OpenAlex work identifiers disagree.');
  const doi = doiUrl(value.doi);
  const alternateDoi = doiUrl(ids.doi);
  if (doi && alternateDoi && doi !== alternateDoi) fail('OpenAlex DOI fields disagree.');
  const year = value.publication_year;
  if (year !== undefined && year !== null && (typeof year !== 'number' || !Number.isInteger(year) || year < 1 || year > 9999)) fail('OpenAlex publication year is malformed.');
  const type = cleanText(value.type, 'work type', 80);
  if (type && !/^[a-z][a-z0-9-]*$/.test(type)) fail('OpenAlex work type is malformed.');
  if (value.is_retracted !== undefined && value.is_retracted !== null && typeof value.is_retracted !== 'boolean') fail('OpenAlex retraction flag is malformed.');
  return {
    openalex_id: id, doi_url: doi ?? alternateDoi, pubmed_url: pubmedUrl(ids.pmid),
    title: cleanText(value.title, 'title'), publication_year: (year as number | null) ?? null,
    publication_date: dateOnly(value.publication_date), work_type: type,
    provider_is_retracted: value.is_retracted as RetractionFlag ?? null,
    provider_updated_at: timestamp(value.updated_date, 'updated timestamp'),
  };
}

export function normalizeOpenAlexResponse(response: unknown, options: {
  query: string; processedAt: string; requestUrl: string | URL; dataOrigin?: DataOrigin;
}): CandidateIntakePacket {
  const query = queryText(options.query);
  let requested: URL;
  try { requested = new URL(options.requestUrl); } catch { return fail('The declared request URL is malformed.'); }
  if (requested.origin !== 'https://api.openalex.org' || requested.pathname !== '/works' || requested.username || requested.password || requested.hash) fail('The declared request must target the OpenAlex works endpoint.');
  if (requested.searchParams.has('page') && requested.searchParams.get('page') !== '1') fail('Only the first OpenAlex result page is accepted.');
  const limit = limitNumber(Number(requested.searchParams.get('per_page') ?? 20));
  const processedAt = timestamp(options.processedAt, 'processing timestamp');
  if (!processedAt || !options.processedAt.endsWith('Z')) fail('Processing time must be a recorded UTC timestamp.');
  if (options.dataOrigin !== undefined && !['offline_input', 'live_api_response'].includes(options.dataOrigin)) fail('Invalid data origin.');
  if (!object(response) || !object(response.meta) || !Array.isArray(response.results) || response.results.length > limit) fail('OpenAlex returned an invalid or over-limit results envelope.');
  if (typeof response.meta.count !== 'number' || !Number.isSafeInteger(response.meta.count) || response.meta.count < response.results.length) fail('OpenAlex result count is malformed.');
  if (response.meta.page !== undefined && response.meta.page !== 1) fail('Only the first OpenAlex result page is accepted.');
  const records = response.results.map(normalizeWork);
  // Group identifier aliases transitively; a duplicate DOI never becomes another study.
  const parent = records.map((_, index) => index);
  const find = (index: number): number => parent[index] === index ? index : (parent[index] = find(parent[index]));
  const join = (a: number, b: number) => { parent[find(b)] = find(a); };
  const seen = new Map<string, number>();
  records.forEach((record, index) => {
    for (const key of [record.openalex_id, record.doi_url].filter((item): item is string => item !== null)) {
      const prior = seen.get(key);
      if (prior !== undefined) join(prior, index); else seen.set(key, index);
    }
  });
  const groups = new Map<number, WorkMetadata[]>();
  records.forEach((record, index) => { const key = find(index); groups.set(key, [...groups.get(key) ?? [], record]); });
  const candidates: CandidateIntakePacket['candidates'] = [];
  const duplicates: CandidateIntakePacket['duplicate_records'] = [];
  for (const members of groups.values()) {
    members.sort((a, b) => a.openalex_id.localeCompare(b.openalex_id, 'en') || JSON.stringify(a).localeCompare(JSON.stringify(b), 'en'));
    const first = members[0];
    const candidateId = `openalex:${first.openalex_id.split('/').at(-1)}`;
    const flags = members.map(({ provider_is_retracted }) => provider_is_retracted);
    candidates.push({
      ...first, candidate_id: candidateId, source_record_ids: [...new Set(members.map(({ openalex_id }) => openalex_id))].sort(),
      provider_is_retracted: flags.includes(true) ? true : flags.every((flag) => flag === false) ? false : null,
      provider_retraction_reports: members.map(({ openalex_id, provider_is_retracted }) => ({ openalex_id, value: provider_is_retracted })),
      review_flags: [...(flags.includes(true) ? ['provider_reported_retraction'] : []), ...(new Set(flags).size > 1 ? ['different_provider_retraction_flags'] : []), ...(members.length > 1 ? ['duplicate_metadata_requires_review'] : [])],
      independent_publication_check: 'not_checked', status: 'unreviewed', promotion: 'not_in_graph',
    });
    duplicates.push(...members.slice(1).map((record) => ({ matches_candidate_id: candidateId, record })));
  }
  candidates.sort((a, b) => a.candidate_id.localeCompare(b.candidate_id, 'en'));
  const origin = options.dataOrigin ?? 'offline_input';
  return {
    schema_version: 'openalex-candidates-0.1.0', data_origin: origin,
    request_provenance: origin === 'offline_input' ? 'declared_for_offline_input' : 'issued_by_adapter',
    provider: 'OpenAlex', immutable_release: null, processed_at: processedAt,
    retrieved_at: origin === 'live_api_response' ? processedAt : null, query,
    request_url: buildOpenAlexRequest(query, limit).href,
    metadata_license: 'CC0-1.0', metadata_terms_url: 'https://creativecommons.org/publicdomain/zero/1.0/',
    attribution: 'Bibliographic metadata from OpenAlex (OurResearch), CC0; article content has separate reuse terms.',
    status: 'unreviewed', promotion: 'not_in_graph', provider_result_count: response.meta.count,
    candidates, duplicate_records: duplicates,
    limitations: [
      'Search matches and bibliographic metadata do not establish support for a biological claim.',
      'Only one bounded result page is retained; this is not a systematic literature review.',
      'Identifier grouping does not establish cohort independence or replicate evidence.',
      'Provider retraction flags are retained, not independently verified; false is not proof that no notice exists.',
      'No abstracts, full text, scientific interpretations, or human review attestations are imported.',
    ],
  };
}

function parseJson(bytes: Uint8Array): unknown {
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
  catch { return fail('OpenAlex input is not valid UTF-8 JSON.'); }
}

export async function fetchOpenAlexCandidates(options: {
  query?: string; limit?: number; apiKey?: string; timeoutMs?: number;
} = {}, fetcher: typeof fetch = fetch): Promise<CandidateIntakePacket> {
  const query = queryText(options.query ?? DEFAULT_QUERY);
  const url = buildOpenAlexRequest(query, options.limit ?? 20);
  const timeout = options.timeoutMs ?? 15_000;
  if (!Number.isInteger(timeout) || timeout < 1 || timeout > 15_000) fail('Request timeout must be between 1 and 15000 milliseconds.');
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.apiKey) {
    if (!/^[\x21-\x7e]{1,1024}$/.test(options.apiKey)) fail('OpenAlex API key is not a valid bearer token.');
    headers.Authorization = `Bearer ${options.apiKey}`;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetcher(url, { headers, signal: controller.signal, redirect: 'error' });
    if (!response.ok) {
      await response.body?.cancel();
      fail(`OpenAlex request returned HTTP ${response.status}; no response content was retained.`);
    }
    if (Number(response.headers.get('content-length')) > MAX_BYTES) {
      await response.body?.cancel();
      fail('OpenAlex response exceeded the 5 MiB intake limit.');
    }
    if (!response.body) fail('OpenAlex response body is missing.');
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) { await reader.cancel(); fail('OpenAlex response exceeded the 5 MiB intake limit.'); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return normalizeOpenAlexResponse(parseJson(bytes), { query, processedAt: new Date().toISOString(), requestUrl: url, dataOrigin: 'live_api_response' });
  } catch (error) {
    if (error instanceof IntakeError) throw error;
    return fail(controller.signal.aborted ? 'OpenAlex request timed out.' : 'OpenAlex request failed. Check the configured network access and retry.');
  } finally { clearTimeout(timer); }
}

async function main() {
  const args = process.argv.slice(2);
  const values = new Map<string, string>();
  for (let i = 0; i < args.length; i += 2) {
    if (!['--input', '--query', '--limit'].includes(args[i]) || values.has(args[i]) || args[i + 1] === undefined) fail('Usage: openalex-intake.ts [--query TEXT] [--limit 1..50] [--input archived-response.json]');
    values.set(args[i], args[i + 1]);
  }
  const query = values.get('--query') ?? DEFAULT_QUERY;
  const limit = values.has('--limit') ? Number(values.get('--limit')) : 20;
  const requestUrl = buildOpenAlexRequest(query, limit);
  const input = values.get('--input');
  let packet: CandidateIntakePacket;
  if (input !== undefined) {
    let bytes: Buffer;
    try {
      const info = await stat(input);
      if (!info.isFile() || info.size > MAX_BYTES) fail('Archived OpenAlex input must be a regular file no larger than 5 MiB.');
      bytes = await readFile(input);
      if (bytes.byteLength > MAX_BYTES) fail('Archived OpenAlex input exceeded the 5 MiB intake limit.');
    } catch (error) {
      if (error instanceof IntakeError) throw error;
      return fail('Unable to read the archived OpenAlex JSON file.');
    }
    packet = normalizeOpenAlexResponse(parseJson(bytes), { query, processedAt: new Date().toISOString(), requestUrl, dataOrigin: 'offline_input' });
  } else packet = await fetchOpenAlexCandidates({ query, limit, apiKey: process.env.OPENALEX_API_KEY });
  process.stdout.write(`${JSON.stringify(packet, null, 2)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error: unknown) => { console.error(error instanceof IntakeError ? error.message : 'OpenAlex intake failed without producing a candidate packet.'); process.exitCode = 1; });
}
