import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { getEntityClaims, loadDataset } from './dataset.ts';
import { relationshipLabel } from './relationship-label.ts';

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
