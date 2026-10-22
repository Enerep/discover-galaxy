import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadDataset } from '../../apps/web/src/lib/dataset.ts';
import type { Snapshot } from '../../apps/web/src/lib/types.ts';

const CANDIDATES = new URL('../../data/alzheimers/candidate-coverage.json', import.meta.url);
const COVERAGE = new URL('../../data/alzheimers/candidate-coverage.md', import.meta.url);
const DATASET = new URL('../../data/alzheimers/dataset.json', import.meta.url);

interface Candidate {
  id: string;
  kind: 'primary_publication' | 'pathway_record';
  citation: string;
  title: string;
  url: string;
  identifiers: { pmid?: string; doi?: string; reactome?: string };
  year: number | null;
  provider: 'PubMed' | 'Reactome';
  release: string | null;
  inspection: { url: string; method: 'page' | 'indexed_excerpt'; locator: string; accessed_at: string };
  context: { organisms: string[] | null; model: string | null; readout: string | null; sample_size: number | null };
  reuse: { terms_url: string; terms_checked_at: string | null; observed_terms: string | null; permission_status: 'pending_review' };
  publication_status: 'not_checked' | 'not_applicable';
  review_status: 'unreviewed';
  graph_status: 'not_in_graph';
}

interface ReadingQuestion {
  id: string;
  question: string;
  anchor_entity_ids: string[];
  existing_claim_ids: string[];
  candidate_ids: string[];
  checks: string[];
}

export interface CandidateCoverage {
  schema_version: 'candidate-coverage-1';
  dataset_version: string;
  prepared_at: string;
  selection_method: string;
  limitations: string[];
  candidates: Candidate[];
  questions: ReadingQuestion[];
}

function record(value: unknown, keys: string[], label: string): Record<string, unknown> {
  assert(value && typeof value === 'object' && !Array.isArray(value), `${label}: expected an object`);
  assert.deepEqual(Object.keys(value).sort(), [...keys].sort(), `${label}: unexpected or missing fields`);
  return value as Record<string, unknown>;
}

function string(value: unknown, label: string): asserts value is string {
  assert(typeof value === 'string' && value.trim().length > 0 && value.length <= 3000, `${label}: expected bounded text`);
}

function strings(value: unknown, label: string): asserts value is string[] {
  assert(Array.isArray(value) && value.length > 0 && value.length <= 50, `${label}: expected a bounded nonempty list`);
  value.forEach((item) => string(item, label));
  assert.equal(new Set(value).size, value.length, `${label}: duplicate entries`);
}

function date(value: unknown, label: string): asserts value is string {
  string(value, label);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(value), `${label}: expected ISO date`);
  const parsed = new Date(`${value}T00:00:00Z`);
  assert(Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value, `${label}: invalid date`);
}

function url(value: unknown, label: string): URL {
  string(value, label);
  const parsed = new URL(value);
  assert(parsed.protocol === 'https:' && !parsed.username && !parsed.password && !parsed.search && !parsed.hash, `${label}: expected credential-free HTTPS URL without query or fragment`);
  return parsed;
}

/** Validates a reading plan only. It cannot approve or import scientific records. */
export function loadCandidateCoverage(input: unknown, snapshot: Snapshot): CandidateCoverage {
  loadDataset(snapshot);
  const root = record(input, ['schema_version', 'dataset_version', 'prepared_at', 'selection_method', 'limitations', 'candidates', 'questions'], 'coverage');
  assert.equal(root.schema_version, 'candidate-coverage-1', 'Unsupported candidate coverage schema');
  assert.equal(root.dataset_version, snapshot.dataset_version, 'Coverage targets a different snapshot');
  date(root.prepared_at, 'prepared_at');
  string(root.selection_method, 'selection_method');
  strings(root.limitations, 'limitations');
  assert(Array.isArray(root.candidates) && root.candidates.length > 0 && root.candidates.length <= 20, 'Expected 1–20 candidate sources');
  const ids = new Set<string>();
  const identities = new Set<string>();
  const snapshotIdentities = new Set(snapshot.sources.flatMap((source) => source.identifiers.map(({ namespace, value }) => `${namespace.toLowerCase()}:${value.toLowerCase()}`)));
  for (const value of root.candidates) {
    const candidate = record(value, ['id', 'kind', 'citation', 'title', 'url', 'identifiers', 'year', 'provider', 'release', 'inspection', 'context', 'reuse', 'publication_status', 'review_status', 'graph_status'], 'candidate');
    string(candidate.id, 'candidate.id');
    assert(/^candidate-[a-z0-9-]+$/.test(candidate.id) && !ids.has(candidate.id), 'Candidate ID is invalid or duplicated');
    ids.add(candidate.id);
    string(candidate.citation, 'citation');
    string(candidate.title, 'title');
    const sourceUrl = url(candidate.url, 'source URL');
    const publication = candidate.kind === 'primary_publication';
    assert(publication || candidate.kind === 'pathway_record', 'Unsupported source kind');
    const identifiers = record(candidate.identifiers, publication ? ['pmid', 'doi'] : ['reactome'], 'identifiers');
    for (const [namespace, identity] of Object.entries(identifiers)) {
      string(identity, namespace);
      const canonical = `${namespace}:${identity.toLowerCase()}`;
      assert(!identities.has(canonical), 'Duplicate publication or database identity');
      assert(!snapshotIdentities.has(canonical), 'Candidate already exists in the snapshot; use its review packet');
      identities.add(canonical);
    }
    if (publication) {
      assert(typeof identifiers.pmid === 'string' && /^\d+$/.test(identifiers.pmid), 'Invalid PMID');
      assert(typeof identifiers.doi === 'string' && /^10\.\d{4,9}\/\S+$/i.test(identifiers.doi), 'Invalid DOI');
      assert(sourceUrl.hostname === 'pubmed.ncbi.nlm.nih.gov' && sourceUrl.pathname === `/${identifiers.pmid}/`, 'Publication URL must match its PMID');
      assert(Number.isInteger(candidate.year) && Number(candidate.year) >= 1800 && Number(candidate.year) <= Number(root.prepared_at.slice(0, 4)), 'Invalid publication year');
      assert.equal(candidate.provider, 'PubMed');
      assert.equal(candidate.release, null, 'Publication metadata does not establish a provider release');
      assert.equal(candidate.publication_status, 'not_checked');
    } else {
      assert(typeof identifiers.reactome === 'string' && /^R-HSA-\d+$/.test(identifiers.reactome), 'Expected a human Reactome record');
      assert(sourceUrl.hostname === 'reactome.org' && sourceUrl.pathname === `/content/detail/${identifiers.reactome}`, 'Pathway URL must match its record');
      assert.equal(candidate.provider, 'Reactome');
      assert.equal(candidate.year, null, 'Do not invent a pathway publication year');
      if (candidate.release !== null) string(candidate.release, 'release');
      assert.equal(candidate.publication_status, 'not_applicable');
    }
    assert.equal(candidate.review_status, 'unreviewed', 'Coverage cannot grant human review');
    assert.equal(candidate.graph_status, 'not_in_graph', 'Coverage cannot promote candidates');
    const inspection = record(candidate.inspection, ['url', 'method', 'locator', 'accessed_at'], 'inspection');
    url(inspection.url, 'inspection URL');
    assert(inspection.method === 'page' || inspection.method === 'indexed_excerpt', 'Unknown inspection method');
    string(inspection.locator, 'inspection locator');
    date(inspection.accessed_at, 'inspection date');
    assert(inspection.accessed_at <= root.prepared_at, 'Inspection is later than packet preparation');
    const context = record(candidate.context, ['organisms', 'model', 'readout', 'sample_size'], 'context');
    if (context.organisms !== null) strings(context.organisms, 'organisms');
    for (const field of ['model', 'readout']) if (context[field] !== null) string(context[field], field);
    assert(context.sample_size === null || (Number.isInteger(context.sample_size) && Number(context.sample_size) > 0), 'Invalid sample size');
    const reuse = record(candidate.reuse, ['terms_url', 'terms_checked_at', 'observed_terms', 'permission_status'], 'reuse');
    url(reuse.terms_url, 'terms URL');
    assert.equal(reuse.permission_status, 'pending_review', 'Screening cannot grant source reuse approval');
    if (reuse.terms_checked_at === null) assert.equal(reuse.observed_terms, null, 'Terms observation needs a real check date');
    else {
      date(reuse.terms_checked_at, 'terms check date');
      assert(reuse.terms_checked_at <= root.prepared_at, 'Terms check is later than packet preparation');
      string(reuse.observed_terms, 'terms observation');
    }
  }
  assert(Array.isArray(root.questions) && root.questions.length > 0 && root.questions.length <= 20, 'Expected 1–20 reading questions');
  const questions = new Set<string>();
  const referenced = new Set<string>();
  for (const value of root.questions) {
    const question = record(value, ['id', 'question', 'anchor_entity_ids', 'existing_claim_ids', 'candidate_ids', 'checks'], 'question');
    string(question.id, 'question ID');
    assert(/^reading-[a-z0-9-]+$/.test(question.id) && !questions.has(question.id), 'Invalid or duplicate question ID');
    questions.add(question.id);
    string(question.question, 'question text');
    for (const field of ['anchor_entity_ids', 'existing_claim_ids', 'candidate_ids', 'checks']) strings(question[field], field);
    for (const id of question.anchor_entity_ids as string[]) assert(snapshot.entities.some((entity) => entity.id === id && entity.type !== 'paper'), `Unknown biological anchor: ${id}`);
    for (const id of question.existing_claim_ids as string[]) assert(snapshot.claims.some((claim) => claim.id === id), `Unknown baseline claim: ${id}`);
    for (const id of question.candidate_ids as string[]) {
      assert(ids.has(id), `Unresolved candidate: ${id}`);
      referenced.add(id);
    }
  }
  assert.equal(referenced.size, ids.size, 'Every candidate needs a reading question');
  return input as CandidateCoverage;
}

function text(value: unknown): string {
  if (value === null || value === undefined) return 'Not extracted';
  const plain = Array.isArray(value) ? value.join('; ') : String(value);
  return plain.replaceAll('\\', '\\\\').replace(/[|\[\]<>*_`]/g, '\\$&').replace(/\r?\n/g, ' ');
}

export function renderCandidateCoverage(input: unknown, snapshot: Snapshot): string {
  const packet = loadCandidateCoverage(input, snapshot);
  const candidates = [...packet.candidates].sort((a, b) => a.id.localeCompare(b.id, 'en'));
  const lines = [
    '# Alzheimer’s candidate-source coverage', '',
    'Generated from candidate-coverage.json and the current snapshot. Edit the JSON, then regenerate. This is a reading plan: candidates are unreviewed, outside the graph, and do not establish support for any existing or proposed claim.', '',
    `- **Prepared:** ${packet.prepared_at}`,
    `- **Baseline snapshot:** ${text(packet.dataset_version)}`,
    `- **Staged sources:** ${candidates.length} (${candidates.filter(({ kind }) => kind === 'primary_publication').length} publications, ${candidates.filter(({ kind }) => kind === 'pathway_record').length} pathway records)`,
    `- **Selection:** ${text(packet.selection_method)}`, '',
    '## Limits', '', ...packet.limitations.map((item) => `- ${text(item)}`), '',
    '## Existing findings and recorded review status', '',
    'The [starter review packet](review-packet.md) contains the complete findings and source-specific evidence. These anchors are navigation context, not claims that the staged papers replicate or support them.', '',
    '| Existing claim | Original source | Claim review | Evidence review | Human review recorded for claim and all evidence |',
    '| --- | --- | --- | --- | --- |',
  ];
  for (const claim of [...snapshot.claims].sort((a, b) => a.id.localeCompare(b.id, 'en'))) {
    const evidence = snapshot.evidence.filter(({ claim_id }) => claim_id === claim.id);
    const citations = evidence.map(({ source_id }) => snapshot.sources.find(({ id }) => id === source_id)!);
    const humanReviewed = claim.review.status === 'approved' && claim.review.human_reviewed === true
      && evidence.every(({ review }) => review.status === 'approved' && review.human_reviewed === true);
    lines.push(`| ${text(claim.id)} | ${citations.map((source) => `[${text(source.identifiers.find(({ namespace }) => namespace.toLowerCase() === 'pmid')?.value ?? source.id)}](${source.url})`).join('; ')} | ${text(claim.review.status)} | ${text(evidence.map(({ review }) => review.status))} | ${humanReviewed ? 'Yes; inspect recorded attestations' : 'No'} |`);
  }
  lines.push('', '## Reading questions and source coverage', '',
    'Source counts are not independent-study counts. Questions identify checks to perform; they are not novel hypotheses or classified contradictions.', '');
  for (const question of packet.questions) {
    lines.push(`### ${text(question.id)}`, '', text(question.question), '',
      `**Current graph anchors:** ${text(question.anchor_entity_ids)}. These remain their recorded entity types.`, '',
      `**Existing finding context:** ${text(question.existing_claim_ids)}`, '',
      '| Candidate source | Kind | Recorded model | Recorded readout |', '| --- | --- | --- | --- |');
    for (const id of question.candidate_ids) {
      const source = candidates.find((candidate) => candidate.id === id)!;
      lines.push(`| [${text(source.citation)}](${source.url}) | ${text(source.kind)} | ${text(source.context.model)} | ${text(source.context.readout)} |`);
    }
    lines.push('', '**Before proposing a graph claim:**', '', ...question.checks.map((item) => `- [ ] ${text(item)}`), '');
  }
  lines.push('## Candidate provenance and outstanding checks', '');
  for (const source of candidates) {
    lines.push(`### ${text(source.id)}`, '', `[${text(source.title)}](${source.url})`, '',
      `- **Citation:** ${text(source.citation)}`,
      `- **Identifiers:** ${text(Object.entries(source.identifiers).map(([key, value]) => `${key}: ${value}`))}`,
      `- **Provider / release:** ${source.provider} / ${source.release === null ? 'Not captured; access date is not a release' : text(source.release)}`,
      `- **Inspected:** ${source.inspection.accessed_at} · ${source.inspection.method} · [location](${source.inspection.url})`,
      `- **Locator / access limits:** ${text(source.inspection.locator)}`,
      `- **Recorded organisms:** ${text(source.context.organisms)}; not an exhaustive assay-level species extraction`,
      `- **Sample size:** ${text(source.context.sample_size)}; do not pool experiment-level counts`,
      `- **Review / graph:** ${source.review_status} / ${source.graph_status}`,
      `- **Publication status:** ${source.publication_status}${source.publication_status === 'not_checked' ? '; absence of a notice has not been established' : '; database revision provenance still needs checking'}`,
      `- **Reuse:** ${source.reuse.permission_status} · [terms](${source.reuse.terms_url}) · checked ${text(source.reuse.terms_checked_at)}`,
      `- **Terms observation:** ${text(source.reuse.observed_terms)}`, '');
  }
  lines.push('## Review handoff', '',
    'Retained content is bibliographic metadata, identifiers, links, and project-authored screening notes. No abstracts, paper text, figures, or Reactome artwork are redistributed.', '',
    'A human scientific reviewer must inspect original methods/results, extract scoped findings with locators and limitations, assess overlap and publication status, resolve biological identities, and complete source reuse checks. Record actual claim/evidence review attestations in a separate dataset diff; this staging tool cannot create them. Capture the exact Reactome release and member-event provenance before adding pathway assertions.', '',
    'Generate: `npm run --silent curation:coverage`', '',
    'Check freshness: `npm run curation:coverage:check`', '',
    'Generation validates the reading plan and its baseline references. It makes no network requests and does not modify the dataset or approve scientific interpretations.', '');
  return lines.join('\n');
}

async function main() {
  const args = process.argv.slice(2);
  assert(args.length === 0 || (args.length === 1 && args[0] === '--check'), 'Usage: candidate-coverage.ts [--check]');
  const packet: unknown = JSON.parse(await readFile(CANDIDATES, 'utf8'));
  const snapshot = loadDataset(JSON.parse(await readFile(DATASET, 'utf8')));
  const rendered = renderCandidateCoverage(packet, snapshot);
  if (args.includes('--check')) {
    if (await readFile(COVERAGE, 'utf8') !== rendered) throw new Error('Candidate coverage is stale; regenerate from JSON and the current snapshot');
    console.log(`Candidate coverage matches ${snapshot.dataset_version}; all candidates remain outside the graph.`);
  } else process.stdout.write(rendered);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
}
