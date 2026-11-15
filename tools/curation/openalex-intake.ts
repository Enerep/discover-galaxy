import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { DEFAULT_QUERY, MAX_BYTES, IntakeError, fail, queryText, buildOpenAlexRequest,
  normalizeOpenAlexBytes as normalizeOpenAlexCore } from '../../shared/source-intake/openalex.ts';
import type { CandidateIntakePacket } from '../../shared/source-intake/openalex.ts';
export { DEFAULT_QUERY, buildOpenAlexRequest, normalizeOpenAlexResponse } from '../../shared/source-intake/openalex.ts';
export type { CandidateIntakePacket } from '../../shared/source-intake/openalex.ts';

/** Hash only actual bytes; parsed-object normalization retains an unknown raw digest. */
export function normalizeOpenAlexBytes(bytes: Uint8Array, options: Parameters<typeof normalizeOpenAlexCore>[1]): CandidateIntakePacket {
  if (bytes.byteLength > MAX_BYTES) fail('OpenAlex input exceeded the 5 MiB intake limit.');
  return normalizeOpenAlexCore(bytes, options, createHash('sha256').update(bytes).digest('hex'));
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
    return normalizeOpenAlexBytes(bytes, { query, processedAt: new Date().toISOString(), requestUrl: url, dataOrigin: 'live_api_response' });
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
    packet = normalizeOpenAlexBytes(bytes, { query, processedAt: new Date().toISOString(), requestUrl, dataOrigin: 'offline_input' });
  } else packet = await fetchOpenAlexCandidates({ query, limit, apiKey: process.env.OPENALEX_API_KEY });
  process.stdout.write(`${JSON.stringify(packet, null, 2)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error: unknown) => { console.error(error instanceof IntakeError ? error.message : 'OpenAlex intake failed without producing a candidate packet.'); process.exitCode = 1; });
}
