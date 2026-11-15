import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { MAX_BYTES, OFFLINE_PROVENANCE_LIMITATION, IntakeError, fail, validateIdentity, buildAnnotationRequest,
  normalizeAnnotationResponse as normalizeAnnotationCore } from '../../shared/source-intake/biomedical.ts';
import type { Provider, GeneIdentity, AnnotationPacket } from '../../shared/source-intake/biomedical.ts';
export { MAX_BYTES, validateIdentity, buildAnnotationRequest } from '../../shared/source-intake/biomedical.ts';
export type { Provider, GeneIdentity, AnnotationPacket } from '../../shared/source-intake/biomedical.ts';

/** Hash only the actual input bytes, retaining the existing Node intake contract. */
export function normalizeAnnotationResponse(bytes: Uint8Array, options: Parameters<typeof normalizeAnnotationCore>[1]): AnnotationPacket {
  if (!bytes.byteLength || bytes.byteLength > MAX_BYTES) fail('Provider input must contain at most 5 MiB of JSON.');
  return normalizeAnnotationCore(bytes, options, createHash('sha256').update(bytes).digest('hex'));
}

export async function fetchAnnotations(provider: Provider, identity: GeneIdentity, fetcher: typeof fetch = fetch, timeoutMs = 15_000): Promise<AnnotationPacket> {
  const request = buildAnnotationRequest(provider, identity);
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 15_000) fail('Request timeout must be between 1 and 15000 milliseconds.');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetcher(request.url, { method: request.method, headers: { Accept: 'application/json', ...(request.body ? { 'Content-Type': 'application/json' } : {}) },
      ...(request.body ? { body: request.body } : {}), signal: controller.signal, redirect: 'error' });
    if (!response.ok) { await response.body?.cancel(); fail(`Annotation request returned HTTP ${response.status}; no response content was retained.`); }
    if (Number(response.headers.get('content-length')) > MAX_BYTES) { await response.body?.cancel(); fail('Annotation response exceeded the 5 MiB limit.'); }
    if (!response.body) fail('Annotation response body is missing.');
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) { await reader.cancel(); fail('Annotation response exceeded the 5 MiB limit.'); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    const packet = normalizeAnnotationResponse(bytes, { provider, identity, processedAt: new Date().toISOString() });
    packet.data_origin = 'live_api_response'; packet.request_provenance = 'issued_by_adapter'; packet.retrieved_at = packet.processed_at;
    packet.limitations = packet.limitations.map((limitation) => limitation === OFFLINE_PROVENANCE_LIMITATION
      ? 'The adapter completed the recorded request; retrieval and normalization do not establish scientific review.' : limitation);
    if (provider === 'uniprot') {
      const release = response.headers.get('x-uniprot-release');
      if (release !== null && !/^\d{4}_\d{2}$/u.test(release)) fail('UniProt release header is malformed.');
      packet.provider_release = release;
    }
    return packet;
  } catch (error) {
    if (error instanceof IntakeError) throw error;
    return fail(controller.signal.aborted ? 'Annotation request timed out.' : 'Annotation request failed. Check configured provider network access; no packet was produced.');
  } finally { clearTimeout(timer); }
}

async function main() {
  const args = process.argv.slice(2); const values = new Map<string, string>();
  for (let i = 0; i < args.length; i += 2) {
    if (!['--provider', '--symbol', '--ensembl', '--uniprot', '--input'].includes(args[i]) || values.has(args[i]) || args[i + 1] === undefined) fail('Usage: biomedical-intake.ts --provider uniprot|reactome|opentargets --symbol SYMBOL --ensembl ENSG... --uniprot ACCESSION [--input archived-response.json]');
    values.set(args[i], args[i + 1]);
  }
  const provider = values.get('--provider') as Provider;
  const identity = validateIdentity({ symbol: values.get('--symbol') ?? '', ensembl: values.get('--ensembl') ?? '', uniprot: values.get('--uniprot') ?? '' });
  buildAnnotationRequest(provider, identity);
  const input = values.get('--input');
  let packet: AnnotationPacket;
  if (input !== undefined) {
    let bytes: Buffer;
    try {
      const info = await stat(input);
      if (!info.isFile() || info.size > MAX_BYTES) fail('Archived annotation input must be a regular JSON file no larger than 5 MiB.');
      bytes = await readFile(input);
    } catch (error) { if (error instanceof IntakeError) throw error; return fail('Unable to read the archived annotation input.'); }
    packet = normalizeAnnotationResponse(bytes, { provider, identity, processedAt: new Date().toISOString() });
  } else packet = await fetchAnnotations(provider, identity);
  process.stdout.write(`${JSON.stringify(packet, null, 2)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error: unknown) => { console.error(error instanceof IntakeError ? error.message : 'Annotation intake failed without producing a packet.'); process.exitCode = 1; });
}
