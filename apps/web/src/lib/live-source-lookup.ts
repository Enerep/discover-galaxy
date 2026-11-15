import { buildAnnotationRequest, IntakeError as AnnotationError, MAX_BYTES, normalizeAnnotationResponse, OFFLINE_PROVENANCE_LIMITATION } from '../../../../shared/source-intake/biomedical.ts';
import type { AnnotationPacket, GeneIdentity } from '../../../../shared/source-intake/biomedical.ts';
import { buildOpenAlexRequest, IntakeError as LiteratureError, normalizeOpenAlexBytes } from '../../../../shared/source-intake/openalex.ts';
import type { CandidateIntakePacket } from '../../../../shared/source-intake/openalex.ts';
import type { Entity } from './types.ts';

export const LIVE_PROVIDERS = ['uniprot', 'reactome', 'opentargets', 'openalex'] as const;
export type LiveProvider = typeof LIVE_PROVIDERS[number];
export type LiveSourceResult = { provider: 'uniprot' | 'reactome' | 'opentargets'; packet: AnnotationPacket }
  | { provider: 'openalex'; packet: CandidateIntakePacket };

const IDENTITIES: readonly (GeneIdentity & { ncbi: string })[] = [
  { symbol: 'APOE', ensembl: 'ENSG00000130203', uniprot: 'P02649', ncbi: '348' },
  { symbol: 'ABCA1', ensembl: 'ENSG00000165029', uniprot: 'O95477', ncbi: '19' },
];

class LookupError extends Error {}
const fail = (message: string): never => { throw new LookupError(message); };
const copyIdentity = ({ symbol, ensembl, uniprot }: GeneIdentity): GeneIdentity => ({ symbol, ensembl, uniprot });

/** The pilot accepts curated identities only, never an uploaded row or free-text query. */
export function getLiveLookupIdentity(entity: Entity): GeneIdentity | null {
  const identity = IDENTITIES.find(({ symbol }) => entity.id === `${entity.type}-${symbol.toLowerCase()}`);
  if (!identity || entity.taxonomy_id !== 9606 || !['gene', 'protein'].includes(entity.type)
    || entity.label !== (entity.type === 'gene' ? identity.symbol : `${identity.symbol} protein`)) return null;
  const expected = entity.type === 'gene' ? [['Ensembl', identity.ensembl], ['NCBIGene', identity.ncbi]] : [['UniProt', identity.uniprot]];
  if (expected.some(([namespace, value]) => {
    const ids = entity.external_ids.filter((id) => id.namespace === namespace);
    return ids.length !== 1 || ids[0].value !== value;
  })) return null;
  return copyIdentity(identity);
}

function checkedIdentity(value: GeneIdentity): GeneIdentity {
  const identity = IDENTITIES.find((item) => value && item.symbol === value.symbol && item.ensembl === value.ensembl && item.uniprot === value.uniprot);
  if (!identity) return fail('Live lookup supports the curated human APOE and ABCA1 identities.');
  return copyIdentity(identity);
}

/** All endpoints and query variables come from fixed, shared request builders. */
export async function fetchLiveSource(provider: LiveProvider, input: GeneIdentity, options: {
  signal?: AbortSignal; fetcher?: typeof fetch; timeoutMs?: number;
} = {}): Promise<LiveSourceResult> {
  if (!LIVE_PROVIDERS.includes(provider)) fail('Choose a supported live source.');
  const identity = checkedIdentity(input);
  const timeoutMs = options.timeoutMs ?? 15_000;
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 15_000) fail('Live lookup timeout must be between 1 and 15000 milliseconds.');
  const query = `Alzheimer AND ${identity.symbol}`;
  const request = provider === 'openalex'
    ? { url: buildOpenAlexRequest(query, 5).href, method: 'GET' as const, body: null }
    : buildAnnotationRequest(provider, identity);
  const controller = new AbortController();
  const abort = () => controller.abort();
  options.signal?.addEventListener('abort', abort, { once: true });
  if (options.signal?.aborted) controller.abort();
  const timer = setTimeout(abort, timeoutMs);
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  const cancelReader = () => { void reader?.cancel().catch(() => {}); };
  controller.signal.addEventListener('abort', cancelReader, { once: true });
  try {
    if (controller.signal.aborted) throw new DOMException('Lookup canceled.', 'AbortError');
    const response = await (options.fetcher ?? fetch)(request.url, {
      method: request.method, ...(request.body ? { body: request.body } : {}),
      headers: { Accept: 'application/json', ...(request.body ? { 'Content-Type': 'application/json' } : {}) },
      signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer',
      mode: 'cors', cache: 'no-store', redirect: 'error',
    });
    if (controller.signal.aborted) { await response.body?.cancel(); throw new DOMException('Lookup canceled.', 'AbortError'); }
    if (!response.ok) {
      await response.body?.cancel();
      fail(`Source returned HTTP ${response.status}. Retry later or open its website.`);
    }
    if (Number(response.headers.get('content-length')) > MAX_BYTES) {
      await response.body?.cancel();
      fail('Source response exceeded the 5 MiB limit.');
    }
    if (!response.body) throw new LookupError('Source response body is missing.');
    reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      if (controller.signal.aborted) throw new DOMException('Lookup canceled.', 'AbortError');
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) { await reader.cancel(); fail('Source response exceeded the 5 MiB limit.'); }
      chunks.push(value);
    }
    const retrievedAt = new Date().toISOString();
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    if (!globalThis.crypto?.subtle) fail('This browser cannot verify response provenance. Use HTTPS or localhost.');
    const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
    const sha256 = Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, '0')).join('');
    if (controller.signal.aborted) throw new DOMException('Lookup canceled.', 'AbortError');
    const processedAt = new Date().toISOString();
    if (provider === 'openalex') {
      const packet = normalizeOpenAlexBytes(bytes, { query, processedAt, requestUrl: request.url, dataOrigin: 'live_api_response' }, sha256);
      packet.retrieved_at = retrievedAt;
      return { provider, packet };
    }
    const packet = normalizeAnnotationResponse(bytes, { provider, identity, processedAt }, sha256);
    packet.data_origin = 'live_api_response';
    packet.request_provenance = 'issued_by_adapter';
    packet.retrieved_at = retrievedAt;
    packet.limitations = packet.limitations.map((limitation) => limitation === OFFLINE_PROVENANCE_LIMITATION
      ? 'The browser completed this recorded request. Retrieval does not establish scientific review.' : limitation);
    if (provider === 'uniprot') {
      const release = response.headers.get('x-uniprot-release');
      if (release !== null && !/^\d{4}_\d{2}$/u.test(release)) fail('UniProt release header is malformed.');
      packet.provider_release = release;
    }
    return { provider, packet };
  } catch (error) {
    if (options.signal?.aborted) throw new DOMException('Lookup canceled.', 'AbortError');
    if (controller.signal.aborted) return fail('Live source request timed out. Retry later.');
    if (error instanceof LookupError || error instanceof AnnotationError || error instanceof LiteratureError) throw error;
    return fail('Live source unavailable. Check the connection or browser access and retry.');
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener('abort', abort);
    controller.signal.removeEventListener('abort', cancelReader);
    reader?.releaseLock();
  }
}
