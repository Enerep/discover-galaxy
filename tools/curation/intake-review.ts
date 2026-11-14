import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import { open } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildAnnotationRequest, MAX_BYTES, normalizeAnnotationResponse, validateIdentity } from './biomedical-intake.ts';
import type { AnnotationPacket, Provider } from './biomedical-intake.ts';
import { buildOpenAlexRequest, normalizeOpenAlexResponse } from './openalex-intake.ts';
import type { CandidateIntakePacket } from './openalex-intake.ts';
import { loadDataset } from '../../apps/web/src/lib/dataset.ts';
import type { Entity, Snapshot } from '../../apps/web/src/lib/types.ts';

export interface PacketInput { name: string; bytes: Uint8Array }
type Packet = AnnotationPacket | CandidateIntakePacket;
type StagedRecord = AnnotationPacket['records'][number] | CandidateIntakePacket['candidates'][number];
export interface FieldChange { field: string; before: unknown; after: unknown }
export interface GraphMatches { status: 'not_represented' | 'represented' | 'ambiguous'; entity_ids: string[]; claim_ids: string[]; source_ids: string[] }
export interface RecordReview {
  key: string; kind: string; change: 'not_compared' | 'added' | 'changed' | 'unchanged' | 'not_returned';
  record: StagedRecord; previous_record: StagedRecord | null; fields: FieldChange[]; graph_matches: GraphMatches;
}
export interface PacketReview {
  input: string; input_sha256: string; previous_input_sha256: string | null;
  provider: string; request_scope_sha256: string; provenance: Record<string, unknown>;
  metadata_changes: FieldChange[]; records: RecordReview[]; not_returned: RecordReview[];
  duplicate_metadata: CandidateIntakePacket['duplicate_records'];
  previous_duplicate_metadata: CandidateIntakePacket['duplicate_records'] | null;
  duplicate_metadata_changes: FieldChange[];
}
export interface IntakeReviewReport {
  schema_version: 'intake-review-1'; status: 'unreviewed'; promotion: 'not_in_graph';
  snapshot: { dataset_version: string; input_sha256: string | null };
  packets: PacketReview[]; limitations: string[];
}

class ReviewError extends Error {}
function fail(message: string): never { throw new ReviewError(message); }
const hash = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
const canonical = (value: unknown): string => JSON.stringify(value, (_, item: unknown) => item && typeof item === 'object' && !Array.isArray(item)
  ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b, 'en'))) : item);
const same = (a: unknown, b: unknown) => canonical(a) === canonical(b);
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('A normalized intake object is malformed.');
  return value as Record<string, unknown>;
}
function keys(value: unknown, allowed: string[]) {
  if (Object.keys(object(value)).some((key) => !allowed.includes(key))) fail('Unsupported fields in a normalized intake packet.');
}
function text(value: unknown, max = 2048): asserts value is string {
  if (typeof value !== 'string' || !value.trim() || value.length > max || /[\u0000-\u001f\u007f]/u.test(value)) fail('Normalized intake text is malformed.');
}
function texts(value: unknown, max: number) {
  if (!Array.isArray(value) || value.length > max) fail('Normalized intake list exceeds its limit.');
  value.forEach((entry) => text(entry));
}
function utc(value: unknown) {
  text(value, 32);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?Z$/u.test(value) || !Number.isFinite(Date.parse(value))
    || new Date(value).toISOString().slice(0, 10) !== value.slice(0, 10)) fail('Normalized intake timestamp is invalid.');
}
const parse = (bytes: Uint8Array): unknown => {
  if (!bytes.byteLength || bytes.byteLength > MAX_BYTES) fail('Review inputs must be nonempty JSON files no larger than 5 MiB.');
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
  catch { return fail('Review input is not valid UTF-8 JSON.'); }
};
function common(packet: Record<string, unknown>, nullableDigest: boolean) {
  if (packet.status !== 'unreviewed' || packet.promotion !== 'not_in_graph' || packet.immutable_release !== null) fail('Intake packets must remain unreviewed and outside graph promotion.');
  utc(packet.processed_at);
  if (packet.data_origin === 'offline_input') {
    if (packet.retrieved_at !== null || packet.request_provenance !== 'declared_for_offline_input') fail('Offline intake provenance is inconsistent.');
  } else if (packet.data_origin === 'live_api_response') {
    utc(packet.retrieved_at);
    if (packet.request_provenance !== 'issued_by_adapter' || packet.retrieved_at !== packet.processed_at) fail('Live intake provenance is inconsistent.');
  } else fail('Normalized intake origin is unsupported.');
  if (!(nullableDigest && packet.response_sha256 === null) && (typeof packet.response_sha256 !== 'string' || !/^[a-f0-9]{64}$/u.test(packet.response_sha256))) fail('The raw-response digest is missing or malformed.');
  texts(packet.limitations, 32);
}

/** Validate normalized packets without making requests or reconstructing a raw-response digest. */
function packetFromBytes(bytes: Uint8Array): Packet {
  const p = object(parse(bytes));
  if (p.schema_version !== 'biomedical-annotations-2' && p.schema_version !== 'openalex-candidates-0.2.0') {
    return fail('Unsupported intake schema. Supply full current normalized packets; legacy packets and composite manifests are not upgraded.');
  }
  if (p.schema_version === 'biomedical-annotations-2') {
    keys(p, ['schema_version', 'provider', 'identity', 'data_origin', 'request_provenance', 'request', 'processed_at', 'retrieved_at', 'response_sha256', 'provider_release', 'provider_version', 'immutable_release', 'reuse', 'status', 'promotion', 'coverage', 'records', 'limitations']);
    common(p, false);
    if (!['uniprot', 'reactome', 'opentargets'].includes(p.provider as string)) fail('Unsupported annotation provider.');
    keys(p.identity, ['symbol', 'ensembl', 'uniprot']);
    const identity = validateIdentity(p.identity as AnnotationPacket['identity']);
    const provider = p.provider as Provider;
    if (!same(p.request, buildAnnotationRequest(provider, identity))) fail('Normalized annotation request disagrees with its fixed identity and scope.');
    if (!Array.isArray(p.records) || p.records.length > 1000) fail('Annotation records exceed the review limit.');
    const records = p.records.map(object);
    let raw: unknown;
    if (provider === 'uniprot') {
      if (records.length !== 1) fail('A UniProt identity packet must contain one record.');
      const r = records[0];
      keys(r, ['kind', 'accession', 'gene_symbol', 'protein_name', 'taxonomy_id', 'provider_reviewed', 'entry_version', 'annotation_updated_at', 'ensembl_cross_reference_verified', 'url']);
      if (typeof r.provider_reviewed !== 'boolean' || typeof r.ensembl_cross_reference_verified !== 'boolean') fail('Normalized UniProt verification flags are malformed.');
      raw = { primaryAccession: r.accession, organism: { taxonId: r.taxonomy_id }, genes: [{ geneName: { value: r.gene_symbol } }],
        entryType: r.provider_reviewed ? 'UniProtKB reviewed (Swiss-Prot)' : 'UniProtKB unreviewed (TrEMBL)',
        proteinDescription: { recommendedName: { fullName: { value: r.protein_name } } },
        entryAudit: { entryVersion: r.entry_version, lastAnnotationUpdateDate: r.annotation_updated_at },
        uniProtKBCrossReferences: r.ensembl_cross_reference_verified ? [{ database: 'Ensembl', properties: [{ key: 'GeneId', value: identity.ensembl }] }] : [] };
    } else if (provider === 'reactome') {
      raw = records.map((r) => {
        keys(r, ['kind', 'accession', 'pathway_id', 'name', 'record_revision', 'organism', 'url']);
        return { stId: r.pathway_id, stIdVersion: r.record_revision, displayName: r.name, speciesName: r.organism, schemaClass: 'Pathway' };
      });
    } else {
      raw = { data: { meta: { dataVersion: p.provider_version }, target: { id: identity.ensembl, approvedSymbol: identity.symbol,
        associatedDiseases: { count: object(p.coverage).total_reported, rows: records.map((r) => {
          keys(r, ['kind', 'target_id', 'disease_id', 'name', 'overall_association_score', 'datasource_scores', 'enable_indirect', 'url']);
          return { disease: { id: r.disease_id, name: r.name }, score: r.overall_association_score, datasourceScores: r.datasource_scores };
        }) } } } };
    }
    const normalized = normalizeAnnotationResponse(Buffer.from(JSON.stringify(raw)), { provider, identity, processedAt: p.processed_at as string });
    if (!same(records, normalized.records) || !same(p.coverage, normalized.coverage) || !same(p.reuse, normalized.reuse)) fail('Normalized annotation content, coverage or terms disagree with the adapter contract.');
    if (provider === 'uniprot') {
      if (p.provider_version !== null || (p.provider_release !== null && (typeof p.provider_release !== 'string' || !/^\d{4}_\d{2}$/u.test(p.provider_release)))) fail('UniProt release provenance is malformed.');
    } else if (!same(p.provider_version, normalized.provider_version) || p.provider_release !== normalized.provider_release) fail('Provider release components disagree with the adapter contract.');
    return p as unknown as AnnotationPacket;
  }
  keys(p, ['schema_version', 'data_origin', 'request_provenance', 'provider', 'immutable_release', 'processed_at', 'retrieved_at', 'response_sha256', 'query', 'request_url', 'metadata_license', 'metadata_terms_url', 'attribution', 'status', 'promotion', 'provider_result_count', 'candidates', 'duplicate_records', 'limitations']);
  common(p, true);
  if (p.provider !== 'OpenAlex' || !Array.isArray(p.candidates) || !Array.isArray(p.duplicate_records) || p.candidates.length + p.duplicate_records.length > 50) fail('OpenAlex metadata exceeds the review limit.');
  const fields = ['openalex_id', 'doi_url', 'pubmed_url', 'title', 'publication_year', 'publication_date', 'work_type', 'provider_is_retracted', 'provider_updated_at'];
  const candidates = p.candidates.map((value) => {
    keys(value, [...fields, 'candidate_id', 'source_record_ids', 'provider_retraction_reports', 'review_flags', 'independent_publication_check', 'status', 'promotion']);
    const c = object(value);
    if (!Array.isArray(c.provider_retraction_reports) || !c.provider_retraction_reports.length) fail('OpenAlex retraction provenance is malformed.');
    c.provider_retraction_reports.forEach((report) => keys(report, ['openalex_id', 'value']));
    return c;
  });
  const duplicates = p.duplicate_records.map((value) => {
    keys(value, ['matches_candidate_id', 'record']);
    const d = object(value); keys(d.record, fields); return d;
  });
  const rawWork = (r: Record<string, unknown>, flag: unknown = r.provider_is_retracted) => ({ id: r.openalex_id,
    ids: { doi: r.doi_url, pmid: r.pubmed_url }, doi: r.doi_url, title: r.title, publication_year: r.publication_year,
    publication_date: r.publication_date, type: r.work_type, is_retracted: flag, updated_date: r.provider_updated_at });
  let url: URL;
  try { url = new URL(p.request_url as string); } catch { return fail('OpenAlex request provenance is malformed.'); }
  const limit = Number(url.searchParams.get('per_page'));
  if (p.request_url !== buildOpenAlexRequest(p.query as string, limit).href) fail('OpenAlex request disagrees with its fixed first-page scope.');
  const normalized = normalizeOpenAlexResponse({ meta: { count: p.provider_result_count }, results: [
    ...candidates.map((c) => rawWork(c, object((c.provider_retraction_reports as unknown[])[0]).value)),
    ...duplicates.map((d) => rawWork(object(d.record))),
  ] }, { query: p.query as string, processedAt: p.processed_at as string, requestUrl: url });
  for (const field of ['candidates', 'duplicate_records', 'metadata_license', 'metadata_terms_url', 'attribution'] as const) {
    if (!same(p[field], normalized[field])) fail('Normalized OpenAlex metadata or terms disagree with the adapter contract.');
  }
  return p as unknown as CandidateIntakePacket;
}

const scope = (p: Packet) => canonical(p.provider === 'OpenAlex' ? { provider: p.provider, request: p.request_url }
  : { provider: p.provider, identity: p.identity, request: p.request });
function recordKey(r: StagedRecord): string {
  if ('candidate_id' in r) return `literature:${r.candidate_id}`;
  if (r.kind === 'protein_identity') return `protein_identity:${r.accession}`;
  if (r.kind === 'pathway_mapping') return `pathway_mapping:${r.accession}:${r.pathway_id}`;
  return `disease_association:${r.target_id}:${r.disease_id}`;
}
function comparable(record: StagedRecord): StagedRecord {
  if ('kind' in record && record.kind === 'disease_association') return { ...record, datasource_scores: [...record.datasource_scores].sort((a, b) => a.id.localeCompare(b.id, 'en')) };
  return record;
}
function changes(before: unknown, after: unknown): FieldChange[] {
  const a = object(before), b = object(after);
  return [...new Set([...Object.keys(a), ...Object.keys(b)])].sort().filter((key) => !same(a[key], b[key]))
    .map((field) => ({ field, before: a[field] ?? null, after: b[field] ?? null }));
}
function metadata(p: Packet): Record<string, unknown> {
  if (p.provider === 'OpenAlex') {
    const { candidates: _c, duplicate_records: _d, ...rest } = p;
    return { ...rest, duplicate_record_count: p.duplicate_records.length, retained_candidates: p.candidates.length };
  }
  const { records: _r, ...rest } = p; return rest;
}
const hasId = (entity: Entity, namespace: string, value: string) => entity.external_ids.some((id) => id.namespace === namespace && id.value === value);
const human = (entity: Entity) => entity.taxonomy_id === undefined || entity.taxonomy_id === 9606;
function publicationKeys(value: { openalex_id: string; doi_url: string | null; pubmed_url: string | null }): string[] {
  return [`OpenAlex:${value.openalex_id.split('/').at(-1)}`, ...(value.doi_url ? [`DOI:${value.doi_url.replace(/^https:\/\/doi\.org\//u, '').toLowerCase()}`] : []),
    ...(value.pubmed_url ? [`PMID:${value.pubmed_url.split('/').filter(Boolean).at(-1)}`] : [])];
}
function graphMatches(record: StagedRecord, packet: Packet, snapshot: Snapshot): GraphMatches {
  const entityIds = new Set<string>(), claimIds = new Set<string>(), sourceIds = new Set<string>();
  let ambiguous = false;
  if ('candidate_id' in record) {
    const aliases = new Set(publicationKeys(record));
    if (packet.provider === 'OpenAlex') for (const d of packet.duplicate_records.filter((d) => d.matches_candidate_id === record.candidate_id)) publicationKeys(d.record).forEach((id) => aliases.add(id));
    record.source_record_ids.forEach((id) => aliases.add(`OpenAlex:${id.split('/').at(-1)}`));
    for (const source of snapshot.sources.filter(({ kind }) => kind === 'publication')) {
      if (source.identifiers.some((id) => aliases.has(`${id.namespace}:${id.namespace === 'DOI' ? id.value.replace(/^https:\/\/doi\.org\//u, '').toLowerCase() : id.namespace === 'OpenAlex' ? id.value.split('/').at(-1) : id.value}`))) sourceIds.add(source.id);
    }
    ambiguous = sourceIds.size > 1;
  } else if (packet.provider !== 'OpenAlex') {
    const proteins = snapshot.entities.filter((e) => e.type === 'protein' && human(e) && hasId(e, 'UniProt', packet.identity.uniprot));
    const genes = snapshot.entities.filter((e) => e.type === 'gene' && human(e) && hasId(e, 'Ensembl', packet.identity.ensembl));
    proteins.forEach((e) => entityIds.add(e.id)); genes.forEach((e) => entityIds.add(e.id));
    ambiguous = proteins.length > 1 || genes.length > 1;
    for (const c of snapshot.claims) {
      if (record.kind === 'protein_identity' && c.predicate === 'encodes' && genes.some((e) => e.id === c.subject_id) && proteins.some((e) => e.id === c.object_id)) claimIds.add(c.id);
      if (record.kind === 'pathway_mapping' && c.predicate === 'participates_in' && proteins.some((e) => e.id === c.subject_id)
        && snapshot.entities.some((e) => e.id === c.object_id && e.type === 'pathway' && hasId(e, 'Reactome', record.pathway_id))) { claimIds.add(c.id); entityIds.add(c.object_id); }
      if (record.kind === 'disease_association' && c.predicate === 'associated_with' && c.context.association_scope === 'provider_aggregate'
        && genes.some((e) => e.id === c.subject_id) && c.context.target_id === record.target_id && c.context.disease_id === record.disease_id) { claimIds.add(c.id); entityIds.add(c.object_id); }
    }
    ambiguous ||= claimIds.size > 1;
  }
  return { status: ambiguous ? 'ambiguous' : claimIds.size || sourceIds.size ? 'represented' : 'not_represented',
    entity_ids: [...entityIds].sort(), claim_ids: [...claimIds].sort(), source_ids: [...sourceIds].sort() };
}

export function reviewIntakePackets(options: { packets: PacketInput[]; previous?: PacketInput[]; snapshot: Snapshot; snapshotBytes?: Uint8Array }): IntakeReviewReport {
  if (!options.packets.length || options.packets.length + (options.previous?.length ?? 0) > 16) fail('Supply at least one current packet and at most 16 packet files in total.');
  let snapshot: Snapshot;
  try { snapshot = loadDataset(options.snapshot); } catch { return fail('Snapshot failed development-data validation.'); }
  if (options.snapshotBytes && !same(parse(options.snapshotBytes), snapshot)) fail('Snapshot bytes do not match the supplied snapshot.');
  const prepare = (inputs: PacketInput[]) => {
    const seen = new Set<string>();
    return inputs.map((input) => {
      text(input.name, 255);
      const packet = packetFromBytes(input.bytes), key = scope(packet);
      if (seen.has(key)) fail('Duplicate packet request scopes require separate review runs.');
      seen.add(key); return { input, packet, key };
    });
  };
  const current = prepare(options.packets), previous = prepare(options.previous ?? []);
  if (previous.some((p) => !current.some((c) => c.key === p.key))) fail('Every previous packet must match a current provider, identity and exact request scope.');
  const packets = current.sort((a, b) => a.key.localeCompare(b.key, 'en')).map(({ input, packet, key }): PacketReview => {
    const prior = previous.find((p) => p.key === key);
    if (packet.provider === 'OpenAlex' && prior?.packet.provider === 'OpenAlex'
      && packet.candidates.some((candidate) => prior.packet.provider === 'OpenAlex' && prior.packet.candidates.some((old) => old.candidate_id !== candidate.candidate_id
        && old.source_record_ids.some((id) => candidate.source_record_ids.includes(id))))) {
      fail('OpenAlex candidate grouping changed across captures. Review the packets separately and reconcile aliases before comparing them.');
    }
    const records = packet.provider === 'OpenAlex' ? packet.candidates : packet.records;
    const old = prior ? prior.packet.provider === 'OpenAlex' ? prior.packet.candidates : prior.packet.records : [];
    const oldByKey = new Map(old.map((r) => [recordKey(r), comparable(r)]));
    const seen = new Set<string>();
    const reviews = records.map((raw): RecordReview => {
      const record = comparable(raw), id = recordKey(record), before = oldByKey.get(id) ?? null;
      if (seen.has(id)) fail('Duplicate record identities require manual reconciliation.');
      seen.add(id);
      const fields = before ? changes(before, record) : [];
      return { key: id, kind: 'kind' in record ? record.kind : 'literature_metadata',
        change: !prior ? 'not_compared' : before ? fields.length ? 'changed' : 'unchanged' : 'added',
        record, previous_record: before, fields, graph_matches: graphMatches(record, packet, snapshot) };
    }).sort((a, b) => a.key.localeCompare(b.key, 'en'));
    return { input: basename(input.name), input_sha256: hash(input.bytes), previous_input_sha256: prior ? hash(prior.input.bytes) : null,
      provider: packet.provider, request_scope_sha256: hash(Buffer.from(key)), provenance: metadata(packet),
      metadata_changes: prior ? changes(metadata(prior.packet), metadata(packet)) : [], records: reviews,
      not_returned: old.filter((r) => !seen.has(recordKey(r))).map((record): RecordReview => ({ key: recordKey(record),
        kind: 'kind' in record ? record.kind : 'literature_metadata', change: 'not_returned', record, previous_record: record,
        fields: [], graph_matches: graphMatches(record, prior!.packet, snapshot) })).sort((a, b) => a.key.localeCompare(b.key, 'en')),
      duplicate_metadata: packet.provider === 'OpenAlex' ? packet.duplicate_records : [],
      previous_duplicate_metadata: prior ? prior.packet.provider === 'OpenAlex' ? prior.packet.duplicate_records : [] : null,
      duplicate_metadata_changes: prior && packet.provider === 'OpenAlex' && prior.packet.provider === 'OpenAlex'
        && !same(prior.packet.duplicate_records, packet.duplicate_records)
        ? [{ field: 'duplicate_records', before: prior.packet.duplicate_records, after: packet.duplicate_records }] : [] };
  });
  return { schema_version: 'intake-review-1', status: 'unreviewed', promotion: 'not_in_graph',
    snapshot: { dataset_version: snapshot.dataset_version, input_sha256: options.snapshotBytes ? hash(options.snapshotBytes) : null }, packets,
    limitations: ['This offline report compares normalized staging material and exact identifiers; it does not inspect sources or approve scientific findings.',
      'Graph matches are structural references only. They do not establish matching biological scope, protein state, evidence support, review status or independent replication.',
      'A not_returned record is absent from this bounded response, not deleted, disproven or absent from the provider. First-page searches are incomplete.',
      'Database annotations, provider aggregates and literature metadata remain separate from original experimental findings. No graph records or review attestations are written.',
      'Input-packet hashes identify the files reviewed; raw-response hashes identify earlier provider bytes only when actually recorded. Missing raw digests and releases remain unknown.'] };
}

const escapeMarkdown = (value: unknown) => String(value).replace(/&/gu, '&amp;').replace(/</gu, '&lt;').replace(/>/gu, '&gt;').replace(/[\\`*_{}\[\]()#+.!|~-]/gu, '\\$&');
const show = (value: unknown) => escapeMarkdown(typeof value === 'string' ? value : JSON.stringify(value));
export function renderIntakeReview(report: IntakeReviewReport): string {
  const lines = ['# Intake review', '', 'Status: unreviewed · not_in_graph', '', `Snapshot: ${show(report.snapshot.dataset_version)}`, `Snapshot input SHA-256: ${report.snapshot.input_sha256 ?? 'Unknown (object supplied)'}`, ''];
  for (const p of report.packets) {
    lines.push(`## ${show(p.provider)} — ${show(p.input)}`, '', `Input-packet SHA-256: ${p.input_sha256}`, `Previous input SHA-256: ${p.previous_input_sha256 ?? 'Not supplied'}`, `Request-scope SHA-256: ${p.request_scope_sha256}`, '', '### Provenance and terms', '', '| Field | Recorded value |', '| --- | --- |');
    for (const [field, value] of Object.entries(p.provenance)) lines.push(`| ${show(field)} | ${value === null ? 'Unknown' : show(value)} |`);
    if (p.metadata_changes.length) {
      lines.push('', '### Provenance/coverage changes', '', '| Field | Previous | Current |', '| --- | --- | --- |');
      p.metadata_changes.forEach((c) => lines.push(`| ${show(c.field)} | ${show(c.before)} | ${show(c.after)} |`));
    }
    lines.push('', '### Staged records', '');
    for (const r of [...p.records, ...p.not_returned]) {
      lines.push(`#### ${show(r.key)}`, '', `Category: ${show(r.kind)} · Change: ${show(r.change)} · Graph matching: ${show(r.graph_matches.status)}`, '',
        `Entities: ${show(r.graph_matches.entity_ids.join(', ') || 'None')}`, `Claims: ${show(r.graph_matches.claim_ids.join(', ') || 'None')}`, `Publication sources: ${show(r.graph_matches.source_ids.join(', ') || 'None')}`, '', `Staged content: ${show(r.record)}`, '');
      if (r.fields.length) { lines.push('| Field | Previous | Current |', '| --- | --- | --- |'); r.fields.forEach((c) => lines.push(`| ${show(c.field)} | ${show(c.before)} | ${show(c.after)} |`)); lines.push(''); }
    }
    if (p.duplicate_metadata.length || p.previous_duplicate_metadata?.length) {
      lines.push('### Duplicate metadata (not additional experiments)', '', `Current duplicate metadata: ${show(p.duplicate_metadata)}`, '');
      if (p.previous_duplicate_metadata !== null) lines.push(`Previous duplicate metadata: ${show(p.previous_duplicate_metadata)}`, '');
      if (p.duplicate_metadata_changes.length) {
        lines.push('| Field | Previous | Current |', '| --- | --- | --- |');
        p.duplicate_metadata_changes.forEach((c) => lines.push(`| ${show(c.field)} | ${show(c.before)} | ${show(c.after)} |`));
        lines.push('', 'Missing duplicate metadata is not evidence that a provider record was deleted or that another experiment occurred.', '');
      }
    }
  }
  lines.push('## Review limits', '', ...report.limitations.map((limit) => `- ${escapeMarkdown(limit)}`), '');
  return lines.join('\n');
}

async function readBounded(path: string): Promise<Uint8Array> {
  try {
    const file = await open(path, constants.O_RDONLY | constants.O_NONBLOCK);
    try {
      const info = await file.stat();
      if (!info.isFile() || info.size > MAX_BYTES) fail('Review inputs must be regular JSON files no larger than 5 MiB.');
      const chunks: Buffer[] = []; let size = 0;
      while (true) {
        const chunk = Buffer.alloc(64 * 1024), { bytesRead } = await file.read(chunk, 0, chunk.length, null);
        if (!bytesRead) break;
        size += bytesRead; if (size > MAX_BYTES) fail('Review input exceeded 5 MiB.');
        chunks.push(chunk.subarray(0, bytesRead));
      }
      return Buffer.concat(chunks);
    } finally { await file.close(); }
  } catch (error) { if (error instanceof ReviewError) throw error; return fail('Unable to read a review input file.'); }
}
async function main() {
  const args = process.argv.slice(2), packets: string[] = [], previous: string[] = [];
  let snapshotPath = 'data/alzheimers/dataset.json', format = 'markdown';
  const single = new Set<string>();
  for (let i = 0; i < args.length; i += 2) {
    const flag = args[i], value = args[i + 1];
    if (!value || value.startsWith('--') || !['--packet', '--previous', '--snapshot', '--format'].includes(flag)) fail('Usage: intake-review.ts --packet normalized.json [--packet ...] [--previous normalized.json] [--snapshot snapshot.json] [--format markdown|json]');
    if (flag === '--packet') packets.push(value);
    else if (flag === '--previous') previous.push(value);
    else { if (single.has(flag)) fail('Supply each review option once.'); single.add(flag); if (flag === '--snapshot') snapshotPath = value; else format = value; }
  }
  if (!packets.length || packets.length + previous.length > 16 || !['markdown', 'json'].includes(format)) fail('Supply at least one current packet, at most 16 packet files in total, and markdown or json output.');
  const snapshotBytes = await readBounded(snapshotPath);
  const report = reviewIntakePackets({ packets: await Promise.all(packets.map(async (name) => ({ name, bytes: await readBounded(name) }))),
    previous: await Promise.all(previous.map(async (name) => ({ name, bytes: await readBounded(name) }))), snapshot: parse(snapshotBytes) as Snapshot, snapshotBytes });
  process.stdout.write(format === 'json' ? `${JSON.stringify(report, null, 2)}\n` : renderIntakeReview(report));
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error: unknown) => { console.error(error instanceof ReviewError ? error.message : 'Intake review failed; no report was produced.'); process.exitCode = 1; });
}
