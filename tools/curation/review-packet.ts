import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { getClaimEvidence, loadDataset } from '../../apps/web/src/lib/dataset.ts';
import type { Context, Review, Snapshot } from '../../apps/web/src/lib/types.ts';

const DATASET = new URL('../../data/alzheimers/dataset.json', import.meta.url);
const PACKET = new URL('../../data/alzheimers/review-packet.md', import.meta.url);

function text(value: unknown): string {
  if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) return 'Not recorded';
  const plain = Array.isArray(value) ? value.join('; ') : String(value);
  return plain.replaceAll('\\', '\\\\').replace(/[|\[\]<>*_`]/g, '\\$&').replace(/\r?\n/g, ' ');
}

function contextRows(context: Context): string[] {
  return Object.entries(context).sort(([a], [b]) => a.localeCompare(b, 'en')).map(([key, value]) => `- **${text(key.replaceAll('_', ' '))}:** ${text(value)}`);
}

function reviewRows(review: Review): string[] {
  return [
    `- **Review status:** ${text(review.status)}`,
    `- **Reviewer:** ${text(review.reviewer)}`,
    `- **Review date:** ${text(review.date)}`,
    `- **Human reviewed:** ${text(review.human_reviewed)}`,
    `- **Review rationale:** ${text(review.rationale)}`,
  ];
}

/** An evidence extract, not a review attestation; never changes the source snapshot. */
export function renderReviewPacket(snapshot: Snapshot): string {
  loadDataset(snapshot);
  const claims = [...snapshot.claims].sort((a, b) => a.id.localeCompare(b.id, 'en'));
  const sources = [...snapshot.sources].sort((a, b) => a.id.localeCompare(b.id, 'en'));
  const lines = [
    '# Alzheimer’s source-review packet', '',
    'Generated from the checked-in dataset. Do not edit this extract: record actual reviews and source checks in the dataset, then regenerate it.',
    'Generating this packet performs structural validation only; it does not inspect publications, establish study independence, or grant scientific approval.', '',
    `- **Dataset:** ${text(snapshot.dataset_version)}`,
    `- **Schema:** ${text(snapshot.schema_version)}`,
    `- **Snapshot date:** ${text(snapshot.created_at)}`,
    `- **Release status:** ${text(snapshot.release_status)}`,
    `- **Coverage:** ${snapshot.entities.length} entities, ${snapshot.claims.length} claims, ${snapshot.evidence.length} evidence records, ${snapshot.sources.length} sources`,
    `- **Disease:** ${text(snapshot.scope.disease)}`,
    `- **Inclusion criteria:** ${text(snapshot.scope.inclusion_criteria)}`, '',
    '## Scope limitations', '', ...snapshot.scope.limitations.map((item) => `- ${text(item)}`), '',
    '## Source coverage', '',
    'Each row is one source record, not an independent experiment or cohort. Database identity records and repeated references do not add independent biological support; even different publications may reuse participants. Study independence and comparability require human assessment.', '',
    '| Source | Kind | Linked claims | Entity provenance | Reuse | Publication status |',
    '| --- | --- | --- | --- | --- | --- |',
    ...sources.map((source) => {
      const claimIds = [...new Set(snapshot.evidence.filter(({ source_id }) => source_id === source.id).map(({ claim_id }) => claim_id))].sort();
      const entityIds = snapshot.entities.filter(({ provenance_source_ids }) => provenance_source_ids.includes(source.id)).map(({ id }) => id).sort();
      return `| ${text(source.id)} | ${text(source.kind)} | ${claimIds.length ? text(claimIds) : 'None'} | ${text(entityIds)} | ${text(source.reuse.permission_status)} | ${text(source.publication_status.status)} |`;
    }), '',
    '## Findings for review', '',
  ];
  for (const claim of claims) {
    const subject = snapshot.entities.find(({ id }) => id === claim.subject_id)!;
    const object = snapshot.entities.find(({ id }) => id === claim.object_id)!;
    lines.push(`### ${text(claim.id)}`, '',
      `**${text(subject.label)} → ${text(object.label)} · ${text(claim.predicate)}**`, '',
      text(claim.statement), '', `**Summary:** ${text(claim.summary)}`, '',
      '#### Claim context', '', ...contextRows(claim.context), '',
      '#### Claim review record', '', ...reviewRows(claim.review), '',
      '#### Claim limitations', '', ...claim.limitations.map((item) => `- ${text(item)}`), '');
    for (const evidence of getClaimEvidence(snapshot, claim.id).sort((a, b) => a.id.localeCompare(b.id, 'en'))) {
      const source = snapshot.sources.find(({ id }) => id === evidence.source_id)!;
      lines.push(`#### Evidence: ${text(evidence.id)}`, '',
        `- **Original source:** [${text(source.title)}](${source.url})`,
        `- **Source record:** ${text(source.id)}`,
        `- **Upstream source records:** ${text(evidence.upstream_source_ids)}`,
        `- **Evidence relation:** ${text(evidence.relation)}`,
        `- **Inspected location:** ${text(evidence.locator)}`, '',
        text(evidence.finding), '', 'Source-specific study context:', '', ...contextRows(evidence.study_context), '',
        'Evidence review record:', '', ...reviewRows(evidence.review), '',
        'Evidence limitations:', '', ...evidence.limitations.map((item) => `- ${text(item)}`), '');
      if (evidence.source_metrics?.length) lines.push('Recorded source metrics:', '', ...evidence.source_metrics.map((metric) => `- ${text(JSON.stringify(metric))}`), '');
    }
    lines.push('#### Pending review tasks', '',
      '- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.',
      '- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.',
      '- [ ] Check source reuse terms, attribution, and correction/retraction status.',
      '- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.', '');
  }
  lines.push('## Study-context comparisons', '');
  if (!snapshot.conflicts.length) lines.push('No study-context comparison is recorded.', '');
  for (const note of [...snapshot.conflicts].sort((a, b) => a.id.localeCompare(b.id, 'en'))) {
    lines.push(`### ${text(note.id)}`, '', `**${text(note.label)}**`, '', text(note.comparison), '',
      `- **Compared claims:** ${text(note.claim_ids)}`, '', 'Compared evidence:', '');
    for (const id of note.evidence_ids) {
      const evidence = snapshot.evidence.find((item) => item.id === id)!;
      const source = snapshot.sources.find((item) => item.id === evidence.source_id)!;
      lines.push(`- ${text(id)}: [${text(source.title)}](${source.url}); inspected location: ${text(evidence.locator)}`);
    }
    lines.push('', 'Context differences and limits:', '', ...note.context_differences.map((item) => `- ${text(item)}`), '',
      'Comparison review record:', '', ...reviewRows(note.review), '');
  }
  lines.push('## Source records and outstanding checks', '');
  for (const source of sources) {
    lines.push(`### ${text(source.id)}`, '', `[${text(source.title)}](${source.url})`, '',
      `- **Kind:** ${text(source.kind)}`,
      `- **Identifiers:** ${text(source.identifiers.map(({ namespace, value }) => `${namespace}: ${value}`))}`,
      `- **Authors:** ${text(source.authors)}`,
      `- **Year / publication type:** ${text(source.year)} / ${text(source.publication_type)}`,
      `- **Provider / release:** ${text(source.provider)} / ${text(source.release)}`,
      `- **Retrieved:** ${text(source.retrieved_at)}`,
      `- **Reuse permission status:** ${text(source.reuse.permission_status)}`,
      `- **Reuse terms:** ${source.reuse.terms_url}`,
      `- **Reuse checked:** ${text(source.reuse.date_checked)}`,
      `- **Attribution:** ${text(source.reuse.attribution)}`,
      `- **Retained content:** ${text(source.reuse.retained_content)}`,
      `- **Publication status:** ${text(source.publication_status.status)}`,
      `- **Publication status checked:** ${text(source.publication_status.checked_at)}`,
      `- **Notice URL:** ${text(source.publication_status.notice_url)}`, '');
  }
  lines.push('## Reproduce this packet', '',
    'Generate: `node --experimental-strip-types tools/curation/review-packet.ts`', '',
    'Check the committed extract: `node --experimental-strip-types tools/curation/review-packet.ts --check`', '',
    'The tool makes no network requests and does not change scientific records or review attestations.', '');
  return lines.join('\n');
}

async function main() {
  if (process.argv.slice(2).some((arg) => arg !== '--check') || process.argv.slice(2).length > 1) throw new Error('Usage: review-packet.ts [--check]');
  const snapshot = loadDataset(JSON.parse(await readFile(DATASET, 'utf8')));
  const packet = renderReviewPacket(snapshot);
  if (process.argv.includes('--check')) {
    if (await readFile(PACKET, 'utf8') !== packet) throw new Error('Review packet is stale. Regenerate the extract from the dataset; do not edit it manually.');
    console.log(`Review packet matches ${snapshot.dataset_version}; scientific review remains a separate task.`);
  } else process.stdout.write(packet);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
}
