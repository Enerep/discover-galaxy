import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export type Provider = 'uniprot' | 'reactome' | 'opentargets';
export interface GeneIdentity { symbol: string; ensembl: string; uniprot: string }
export const MAX_BYTES = 5 * 1024 * 1024;
const MAX_PATHWAYS = 1000;
const ASSOCIATION_PAGE_SIZE = 20;
const ACCESSION = /^(?:[OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9](?:[A-Z][A-Z0-9]{2}[0-9]){1,2})$/u;
const TARGET_QUERY = `query GeneAnnotations($id: String!) {
  meta { dataVersion { year month iteration } }
  target(ensemblId: $id) {
    id approvedSymbol
    associatedDiseases(enableIndirect: false, page: { index: 0, size: 20 }) {
      count rows { disease { id name } score datasourceScores { id score } }
    }
  }
}`;

const TERMS = {
  uniprot: { license: 'CC-BY-4.0', terms_url: 'https://rest.uniprot.org/help/license', attribution: 'The UniProt Consortium, UniProtKB. Identity metadata only; CC BY 4.0.' },
  reactome: { license: 'CC0-1.0', terms_url: 'https://reactome.org/license', attribution: 'Reactome Pathway Database. Database identifier mappings, not original experimental findings.' },
  opentargets: { license: 'CC0-1.0', terms_url: 'https://platform-docs.opentargets.org/licence', attribution: 'Open Targets Platform. Direct target–disease association summaries with provider-defined scores.' },
} as const;

type Annotation =
  | { kind: 'protein_identity'; accession: string; gene_symbol: string; protein_name: string; taxonomy_id: 9606; provider_reviewed: boolean; entry_version: number; annotation_updated_at: string; ensembl_cross_reference_verified: boolean; url: string }
  | { kind: 'pathway_mapping'; accession: string; pathway_id: string; name: string; record_revision: string | null; organism: 'Homo sapiens'; url: string }
  | { kind: 'disease_association'; target_id: string; disease_id: string; name: string; overall_association_score: number; datasource_scores: { id: string; score: number }[]; enable_indirect: false; url: string };

export interface AnnotationPacket {
  schema_version: 'biomedical-annotations-1';
  provider: Provider;
  identity: GeneIdentity;
  data_origin: 'offline_input' | 'live_api_response';
  request_provenance: 'declared_for_offline_input' | 'issued_by_adapter';
  request: { url: string; method: 'GET' | 'POST'; body: string | null };
  processed_at: string;
  retrieved_at: string | null;
  response_sha256: string;
  provider_release: string | null;
  immutable_release: null;
  reuse: typeof TERMS[Provider];
  status: 'unreviewed';
  promotion: 'not_in_graph';
  coverage: { total_reported: number | null; retained: number; truncated: boolean | null; scope: string };
  records: Annotation[];
  limitations: string[];
}

class IntakeError extends Error {}
function fail(message: string): never { throw new IntakeError(message); }
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('Provider response contains a malformed object.');
  return value as Record<string, unknown>;
}
function text(value: unknown, max = 512): string {
  if (typeof value !== 'string' || !value.trim() || value.length > max || /[\u0000-\u001f\u007f]/u.test(value)) fail('Provider response contains malformed text.');
  return value.trim();
}
function integer(value: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < min || value > max) fail('Provider response contains an invalid count or version.');
  return value;
}
function score(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1) fail('Provider association score is invalid.');
  return value;
}
function date(value: unknown): string {
  const result = text(value, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(result) || !Number.isFinite(Date.parse(result)) || new Date(result).toISOString().slice(0, 10) !== result) fail('Provider annotation date is invalid.');
  return result;
}
function list(value: unknown, max: number): unknown[] {
  if (!Array.isArray(value) || value.length > max) fail('Provider result list is missing or exceeds the intake limit.');
  return value;
}

export function validateIdentity(input: GeneIdentity): GeneIdentity {
  if (!input || typeof input.symbol !== 'string' || typeof input.ensembl !== 'string' || typeof input.uniprot !== 'string'
    || !/^[A-Za-z][A-Za-z0-9_.-]{0,63}$/u.test(input.symbol) || !/^ENSG\d{11}$/u.test(input.ensembl)
    || !ACCESSION.test(input.uniprot)) fail('Supply an exact gene symbol, stable human Ensembl ID and canonical UniProt accession.');
  return { symbol: input.symbol, ensembl: input.ensembl, uniprot: input.uniprot };
}

/** Fixed endpoints and variables only: provider text cannot redirect a request or issue a mutation. */
export function buildAnnotationRequest(provider: Provider, input: GeneIdentity): AnnotationPacket['request'] {
  const identity = validateIdentity(input);
  if (provider === 'uniprot') return { url: `https://rest.uniprot.org/uniprotkb/${identity.uniprot}.json`, method: 'GET', body: null };
  if (provider === 'reactome') return { url: `https://reactome.org/ContentService/data/mapping/UniProt/${identity.uniprot}/pathways?species=9606`, method: 'GET', body: null };
  if (provider === 'opentargets') return { url: 'https://api.platform.opentargets.org/api/v4/graphql', method: 'POST', body: JSON.stringify({ query: TARGET_QUERY, variables: { id: identity.ensembl } }) };
  return fail('Choose uniprot, reactome or opentargets.');
}

export function normalizeAnnotationResponse(bytes: Uint8Array, options: {
  provider: Provider; identity: GeneIdentity; processedAt: string;
}): AnnotationPacket {
  if (!bytes.byteLength || bytes.byteLength > MAX_BYTES) fail('Provider input must contain at most 5 MiB of JSON.');
  let parsed: unknown;
  try { parsed = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
  catch { return fail('Provider input is not valid UTF-8 JSON.'); }
  const identity = validateIdentity(options.identity);
  const request = buildAnnotationRequest(options.provider, identity);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/u.test(options.processedAt) || !Number.isFinite(Date.parse(options.processedAt))) fail('Processing timestamp is invalid.');
  date(options.processedAt.slice(0, 10));
  let records: Annotation[] = [];
  let release: string | null = null;
  let total: number | null = null;
  let scope = 'Single declared human protein entry';
  if (options.provider === 'uniprot') {
    const entry = object(parsed);
    if (entry.primaryAccession !== identity.uniprot || object(entry.organism).taxonId !== 9606) fail('UniProt accession or organism does not match the requested human identity.');
    if (!list(entry.genes, 100).some((gene) => object(object(gene).geneName).value === identity.symbol)) fail('UniProt primary gene symbol does not match the requested identity.');
    const reviewed = entry.entryType === 'UniProtKB reviewed (Swiss-Prot)';
    if (!reviewed && entry.entryType !== 'UniProtKB unreviewed (TrEMBL)') fail('UniProt entry review status is missing or unrecognized.');
    const ids = list(entry.uniProtKBCrossReferences ?? [], 2000).flatMap((item) => {
      const crossRef = object(item);
      return crossRef.database === 'Ensembl' ? list(crossRef.properties ?? [], 100).flatMap((property) => {
        const field = object(property);
        return field.key === 'GeneId' ? [text(field.value, 32).replace(/\.\d+$/u, '')] : [];
      }) : [];
    });
    if (ids.length && !ids.includes(identity.ensembl)) fail('UniProt Ensembl cross-references disagree with the requested identity.');
    const audit = object(entry.entryAudit);
    const proteinName = object(object(object(entry.proteinDescription).recommendedName).fullName).value;
    records = [{ kind: 'protein_identity', accession: identity.uniprot, gene_symbol: identity.symbol,
      protein_name: text(proteinName), taxonomy_id: 9606, provider_reviewed: reviewed,
      entry_version: integer(audit.entryVersion, 1), annotation_updated_at: date(audit.lastAnnotationUpdateDate),
      ensembl_cross_reference_verified: ids.includes(identity.ensembl), url: `https://www.uniprot.org/uniprotkb/${identity.uniprot}/entry` }];
    total = 1;
  } else if (options.provider === 'reactome') {
    scope = 'Human lower-level pathways mapped from the declared UniProt accession; no molecular-state inference';
    const seen = new Set<string>();
    records = list(parsed, MAX_PATHWAYS).map((value) => {
      const row = object(value);
      const id = text(row.stId, 40);
      if (!/^R-HSA-\d+$/u.test(id) || row.speciesName !== 'Homo sapiens' || row.schemaClass !== 'Pathway' || seen.has(id)) fail('Reactome returned a duplicate, non-human or non-pathway mapping.');
      seen.add(id);
      const revision = row.stIdVersion == null ? null : text(row.stIdVersion, 64);
      if (revision && (!revision.startsWith(`${id}.`) || !/^R-HSA-\d+\.\d+$/u.test(revision))) fail('Reactome record revision disagrees with its pathway ID.');
      return { kind: 'pathway_mapping', accession: identity.uniprot, pathway_id: id, name: text(row.displayName),
        record_revision: revision, organism: 'Homo sapiens', url: `https://reactome.org/content/detail/${id}` };
    });
  } else {
    scope = 'First 20 direct target–disease associations (enableIndirect=false); not a comprehensive disease or literature search';
    const root = object(parsed);
    if ('errors' in root && list(root.errors, 100).length) fail('Open Targets returned GraphQL errors; partial data was not accepted.');
    const data = object(root.data);
    const version = object(object(data.meta).dataVersion);
    release = `${integer(version.year, 0, 9999)}.${String(integer(version.month, 1, 12)).padStart(2, '0')}${version.iteration == null ? '' : `.${integer(version.iteration, 0, 999)}`}`;
    const target = object(data.target);
    if (target.id !== identity.ensembl || target.approvedSymbol !== identity.symbol) fail('Open Targets gene identity does not match the requested Ensembl ID and symbol.');
    const associations = object(target.associatedDiseases);
    total = integer(associations.count);
    const seen = new Set<string>();
    records = list(associations.rows, ASSOCIATION_PAGE_SIZE).map((value) => {
      const row = object(value); const disease = object(row.disease);
      const id = text(disease.id, 80);
      if (!/^[A-Za-z][A-Za-z0-9]*_[A-Za-z0-9]+$/u.test(id) || seen.has(id)) fail('Open Targets disease identity is invalid or duplicated.');
      seen.add(id);
      const components = new Set<string>();
      const scores = list(row.datasourceScores, 100).map((value) => {
        const component = object(value); const id = text(component.id, 100);
        if (!/^[a-zA-Z0-9_-]+$/u.test(id) || components.has(id)) fail('Open Targets data-source score identity is invalid or duplicated.');
        components.add(id); return { id, score: score(component.score) };
      });
      return { kind: 'disease_association', target_id: identity.ensembl, disease_id: id, name: text(disease.name),
        overall_association_score: score(row.score), datasource_scores: scores, enable_indirect: false,
        url: `https://platform.opentargets.org/target/${identity.ensembl}/associations` };
    });
    if (total < records.length || (total > 0 && !records.length)) fail('Open Targets result count disagrees with the first-page rows.');
  }
  return { schema_version: 'biomedical-annotations-1', provider: options.provider, identity,
    data_origin: 'offline_input', request_provenance: 'declared_for_offline_input', request,
    processed_at: options.processedAt, retrieved_at: null, response_sha256: createHash('sha256').update(bytes).digest('hex'),
    provider_release: release, immutable_release: null, reuse: { ...TERMS[options.provider] }, status: 'unreviewed', promotion: 'not_in_graph',
    coverage: { total_reported: total, retained: records.length, truncated: total === null ? null : total > records.length, scope }, records,
    limitations: [
      'Provider annotations are staging material, not source-checked original-paper findings or scientific approval.',
      'The requested identity is declared; offline processing does not prove a request occurred or verify the archive origin.',
      'Database mappings and association scores do not establish causation, pathway activity, therapeutic benefit or independent replication.',
      'A provider release label is reported provenance, not a captured immutable upstream snapshot. Reactome global release is not requested.',
      'Only allowlisted identity, mapping and association fields are retained. No sequences, abstracts, article text or protein-function prose are imported.',
    ] };
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
