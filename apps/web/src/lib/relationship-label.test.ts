import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { getEntityClaims, loadDataset } from './dataset.ts';
import { relationshipLabel } from './relationship-label.ts';
import { validateDataset } from './validate.ts';
import type { Claim, Entity, Snapshot } from './types.ts';

const snapshot = loadDataset(JSON.parse(await readFile(new URL('../../../../data/alzheimers/dataset.json', import.meta.url), 'utf8')));

test('one pathway keeps gene annotations distinct from protein participation in both directions', () => {
  const members = getEntityClaims(snapshot, 'pathway-scavenger-receptors');
  const geneClaims = members.filter(({ context }) => context.annotation_level === 'gene');
  const proteinClaims = members.filter(({ context }) => context.annotation_level !== 'gene');
  assert.deepEqual(geneClaims.map(({ subject_id }) => subject_id).sort(), ['gene-col1a1', 'gene-col1a2', 'gene-col3a1', 'gene-saa1']);
  assert.deepEqual(proteinClaims.map(({ subject_id }) => subject_id).sort(), ['protein-apob', 'protein-apoe', 'protein-marco', 'protein-scara5']);
  for (const claim of geneClaims) {
    assert.equal(snapshot.entities.find(({ id }) => id === claim.subject_id)?.type, 'gene');
    assert.equal(relationshipLabel(claim), 'Annotated to');
    assert.equal(relationshipLabel(claim, true), 'Annotated gene');
  }
  for (const claim of proteinClaims) {
    assert.equal(snapshot.entities.find(({ id }) => id === claim.subject_id)?.type, 'protein');
    assert.equal(relationshipLabel(claim), 'Part of');
    assert.equal(relationshipLabel(claim, true), 'Participant');
  }
});

test('encoding labels follow the recorded gene-to-protein identity without transferring pathway membership', () => {
  for (const key of ['col1a1', 'col1a2', 'col3a1', 'saa1']) {
    const identity = snapshot.claims.find(({ id }) => id === `claim-${key}-encodes`)!;
    assert.equal(identity.subject_id, `gene-${key}`);
    assert.equal(identity.object_id, `protein-${key}`);
    assert.equal(relationshipLabel(identity), 'Encodes');
    assert.equal(relationshipLabel(identity, true), 'Encoded by');
    assert.ok(!getEntityClaims(snapshot, identity.object_id).some(({ predicate }) => predicate === 'participates_in'));
  }
});

test('variant-scoped associations and binding assays retain their different predicates and original scope', () => {
  const before = JSON.stringify(snapshot);
  const association = snapshot.claims.find(({ id }) => id === 'claim-trem2-r47h-risk')!;
  const binding = snapshot.claims.find(({ id }) => id === 'claim-trem2-r47h-apoe-binding')!;
  assert.equal(association.subject_id, 'gene-trem2');
  assert.equal(association.object_id, 'disease-alzheimers');
  assert.equal(association.context.variant, 'rs75932628-T; predicted R47H substitution');
  assert.equal(binding.subject_id, 'protein-trem2');
  assert.equal(binding.object_id, 'protein-apoe');
  assert.equal(binding.context.binding_condition, 'R47H versus wild type');
  for (const reverse of [false, true]) {
    assert.equal(relationshipLabel(association, reverse), 'Variant association');
    assert.equal(relationshipLabel({ ...association, context: { ...association.context, variant: null } }, reverse), 'Associated with');
    assert.equal(relationshipLabel(binding, reverse), 'Interacts with');
    assert.equal(relationshipLabel({ ...binding, context: { ...binding.context, variant: 'R47H' } }, reverse), 'Interacts with');
  }
  assert.equal(JSON.stringify(snapshot), before);
});

// Authored structural fixtures only; none represents a biological finding.
function syntheticSpeciesSnapshot(predicate: 'ortholog_of' | 'perturbation_affects' | 'encodes'): Snapshot {
  const review = { status: 'draft' as const, reviewer: null, date: null, rationale: 'Synthetic structural fixture, not a source check.' };
  const entity = (id: string, type: Entity['type'], taxonomy_id: number): Entity => ({ id, type, taxonomy_id,
    label: `Synthetic ${id}`, aliases: [], external_ids: [{ namespace: 'Synthetic', value: id }], description_claim_ids: [], provenance_source_ids: ['synthetic-source'] });
  return {
    schema_version: '0.2.0', dataset_version: 'synthetic-species-contract', created_at: '2026-11-05', release_status: 'development',
    scope: { disease: 'Synthetic fixture', inclusion_criteria: 'Structural testing only.', limitations: ['No scientific meaning.'] },
    upstream_releases: [{ provider: 'Synthetic', release: null, accessed_at: '2026-11-05', source_url: 'https://example.org/synthetic', reuse_terms_url: 'https://example.org/terms', attribution: 'Synthetic.' }],
    entities: [entity('synthetic-gene-a', 'gene', 9606), entity('synthetic-gene-b', 'gene', 10090), entity('synthetic-protein-b', 'protein', 10090)],
    claims: [{ id: 'synthetic-claim', predicate, subject_id: predicate === 'ortholog_of' ? 'synthetic-gene-a' : 'synthetic-gene-b',
      object_id: predicate === 'ortholog_of' ? 'synthetic-gene-b' : 'synthetic-protein-b', statement: 'Synthetic assertion only.',
      context: predicate === 'ortholog_of' ? { subject_taxonomy_id: 9606, object_taxonomy_id: 10090 }
        : { taxonomy_id: 10090, intervention: 'Synthetic perturbation', experimental_system: 'Synthetic model', outcome: 'Synthetic readout' },
      evidence_ids: ['synthetic-evidence'], summary: 'Synthetic.', limitations: ['Not scientific evidence.'], review }],
    evidence: [{ id: 'synthetic-evidence', claim_id: 'synthetic-claim', source_id: 'synthetic-source', upstream_source_ids: [], relation: 'supports', finding: 'Synthetic.', locator: 'Synthetic fixture.', study_context: predicate === 'perturbation_affects' ? { taxonomy_id: 10090 } : { organism: null }, limitations: ['Synthetic.'], review }],
    sources: [{ id: 'synthetic-source', kind: predicate === 'perturbation_affects' ? 'publication' : 'database_record', publication_type: predicate === 'perturbation_affects' ? 'primary_research' : undefined, title: 'Synthetic fixture source', url: 'https://example.org/synthetic', identifiers: [], authors: [], year: null, provider: 'Synthetic', release: 'Synthetic fixture', retrieved_at: '2026-11-05',
      reuse: { terms_url: 'https://example.org/terms', attribution: 'Synthetic.', retained_content: 'Synthetic fixture.', date_checked: null, permission_status: 'pending_review' }, publication_status: { status: 'not_checked', checked_at: null, notice_url: null } }],
    conflicts: [], hypotheses: [],
  };
}

test('orthology requires gene endpoints and exact different-species context, without becoming a perturbation result', () => {
  const valid = syntheticSpeciesSnapshot('ortholog_of');
  assert.equal(validateDataset(valid).valid, true);
  for (const reverse of [false, true]) assert.equal(relationshipLabel(valid.claims[0], reverse), 'Ortholog of');
  for (const mutate of [
    (data: Snapshot) => { delete data.entities[0].taxonomy_id; },
    (data: Snapshot) => { data.entities[1].taxonomy_id = 9606; },
    (data: Snapshot) => { data.claims[0].context.subject_taxonomy_id = '9606'; },
    (data: Snapshot) => { data.claims[0].context.object_taxonomy_id = 9606; },
    (data: Snapshot) => { delete data.claims[0].context.object_taxonomy_id; },
    (data: Snapshot) => { data.claims[0].object_id = 'synthetic-protein-b'; },
  ]) {
    const data = structuredClone(valid); mutate(data);
    assert.equal(validateDataset(data).valid, false);
  }
});

test('perturbation effects require one explicit species and recorded experimental scope', () => {
  const valid = syntheticSpeciesSnapshot('perturbation_affects');
  assert.equal(validateDataset(valid).valid, true);
  assert.equal(relationshipLabel(valid.claims[0]), 'Perturbation effect');
  assert.equal(relationshipLabel(valid.claims[0], true), 'Perturbation result');
  for (const mutate of [
    (data: Snapshot) => { data.entities[2].taxonomy_id = 9606; },
    (data: Snapshot) => { delete data.entities[1].taxonomy_id; },
    (data: Snapshot) => { data.claims[0].context.taxonomy_id = '10090'; },
    (data: Snapshot) => { data.claims[0].context.taxonomy_id = 9606; },
    (data: Snapshot) => { delete data.claims[0].context.taxonomy_id; },
    (data: Snapshot) => { data.claims[0].subject_id = 'synthetic-protein-b'; },
    (data: Snapshot) => { data.claims[0].object_id = 'synthetic-gene-b'; },
    (data: Snapshot) => { data.claims[0].context.finding_label = 123; },
  ]) {
    const data = structuredClone(valid); mutate(data);
    assert.equal(validateDataset(data).valid, false);
  }
  for (const field of ['intervention', 'experimental_system', 'outcome']) {
    for (const value of [null, '', ' ', ['Synthetic']]) {
      const data = structuredClone(valid); data.claims[0].context[field] = value;
      assert.equal(validateDataset(data).valid, false);
    }
  }
});

test('explicit species prevent cross-species encoding, while unknown legacy identities stay unknown', () => {
  const valid = syntheticSpeciesSnapshot('encodes');
  assert.equal(validateDataset(valid).valid, true);
  valid.entities[2].taxonomy_id = 9606;
  assert.equal(validateDataset(valid).valid, false);
  delete valid.entities[2].taxonomy_id;
  assert.equal(validateDataset(valid).valid, true);
  for (const value of [0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, null, '10090']) {
    const data = syntheticSpeciesSnapshot('encodes');
    Object.assign(data.entities[1], { taxonomy_id: value });
    assert.equal(validateDataset(data).valid, false);
  }
  const outdated = syntheticSpeciesSnapshot('encodes');
  Object.assign(outdated, { schema_version: '0.1.0' });
  assert.equal(validateDataset(outdated).valid, false);
});

test('perturbation findings require primary experimental publications and matching evidence species', () => {
  const valid = syntheticSpeciesSnapshot('perturbation_affects');
  assert.equal(validateDataset(valid).valid, true);
  for (const mutate of [
    (data: Snapshot) => { data.sources[0].kind = 'database_record'; },
    (data: Snapshot) => { data.sources[0].publication_type = 'review'; },
    (data: Snapshot) => { data.sources[0].publication_type = 'conference_abstract'; },
    (data: Snapshot) => { data.evidence[0].study_context.taxonomy_id = 9606; },
    (data: Snapshot) => { data.evidence[0].study_context.taxonomy_id = '10090'; },
    (data: Snapshot) => { delete data.evidence[0].study_context.taxonomy_id; },
  ]) {
    const data = structuredClone(valid); mutate(data);
    assert.equal(validateDataset(data).valid, false);
  }
  const mixed = structuredClone(valid);
  mixed.sources.push({ ...mixed.sources[0], id: 'synthetic-metadata', kind: 'database_record' });
  mixed.evidence.push({ ...mixed.evidence[0], id: 'synthetic-database-evidence', source_id: 'synthetic-metadata' });
  mixed.claims[0].evidence_ids.push('synthetic-database-evidence');
  assert.equal(validateDataset(mixed).valid, false, 'One original paper must not turn another database annotation into an original experiment.');
});

test('database aggregate labels stay separate from variant findings in either navigation direction', () => {
  const association: Claim = { ...snapshot.claims.find(({ id }) => id === 'claim-trem2-r47h-risk')!, context: { association_scope: 'provider_aggregate' } };
  for (const reverse of [false, true]) {
    assert.equal(relationshipLabel(association, reverse), 'Database association');
    assert.equal(relationshipLabel({ ...association, context: { ...association.context, variant: 'Synthetic variant' } }, reverse), 'Variant association');
  }
});
