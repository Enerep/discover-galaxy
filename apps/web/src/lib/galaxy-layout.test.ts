import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { createFocusedLayout } from '../components/galaxy-layout.ts';
import type { Position } from '../components/galaxy-layout.ts';
import { loadDataset } from './dataset.ts';
import { buildExplorerGraph } from './explorer-graph.ts';
import type { Claim, Entity } from './types.ts';

const snapshot = loadDataset(JSON.parse(await readFile(new URL('../../../../data/alzheimers/dataset.json', import.meta.url), 'utf8')));
const pathways = snapshot.entities.filter(({ type }) => type === 'pathway');

function graph(selectedId: string, expanded = false) {
  return buildExplorerGraph(snapshot, { selectedId, selectedClaimId: null, mode: 'focus', expanded, query: '', filter: 'all' });
}

for (const pathway of pathways) {
  test(`${pathway.label}: expansion preserves every direct position and reserves explicit identity rows`, () => {
    const before = JSON.stringify(snapshot);
    const direct = graph(pathway.id);
    const expanded = graph(pathway.id, true);
    const first = createFocusedLayout(direct.entities, pathway.id, direct.directIds, snapshot.claims);
    const second = createFocusedLayout(expanded.entities, pathway.id, expanded.directIds, snapshot.claims);
    for (const id of direct.ids) assert.deepEqual(second.get(id), first.get(id), `${id} moved during expansion`);
    for (const claim of snapshot.claims.filter(({ predicate }) => predicate === 'encodes')) {
      if (!expanded.ids.has(claim.subject_id) || !expanded.ids.has(claim.object_id)) continue;
      if (!direct.ids.has(claim.subject_id) && !direct.ids.has(claim.object_id)) continue;
      const gene = second.get(claim.subject_id)!;
      const protein = second.get(claim.object_id)!;
      assert.equal(gene[1], protein[1], 'Recorded gene–protein counterparts share a row');
      assert.ok(gene[0] < protein[0], 'Gene and protein columns remain distinct');
    }
    assert.equal(JSON.stringify(snapshot), before, 'Layout must not alter scientific records');
  });

  test(`${pathway.label}: both navigation levels fit finite, separated positions within mobile camera bounds`, () => {
    for (const expanded of [false, true]) {
      const projection = graph(pathway.id, expanded);
      const positions = createFocusedLayout(projection.entities, pathway.id, projection.directIds, snapshot.claims);
      assert.equal(positions.size, projection.entities.length);
      const points = [...positions.values()];
      assert.ok(points.every((point) => point.every(Number.isFinite)));
      for (let a = 0; a < points.length; a += 1) {
        for (let b = a + 1; b < points.length; b += 1) {
          assert.ok(Math.hypot(...points[a]!.map((coordinate, axis) => coordinate - points[b]![axis]!)) >= 2,
            'Nodes need room for labels and touch targets');
        }
      }
      const span = (axis: number) => Math.max(0, ...points.map((point) => point[axis]!)) - Math.min(0, ...points.map((point) => point[axis]!));
      // Same fit calculation as the graph camera, with a narrow 0.6 aspect ratio.
      const halfFov = 23 * Math.PI / 180;
      const distance = Math.max((span(1) + 3) / 2 / Math.tan(halfFov), (span(0) + 4) / 2 / (Math.tan(halfFov) * 0.6));
      assert.ok(distance < 42, `Unclamped mobile fit requires ${distance}`);
    }
  });

  test(`${pathway.label}: entity, direct-id and claim order do not change layout`, () => {
    const projection = graph(pathway.id, true);
    const first = createFocusedLayout(projection.entities, pathway.id, projection.directIds, snapshot.claims);
    const reordered = createFocusedLayout([...projection.entities].reverse(), pathway.id,
      new Set([...projection.directIds].reverse()), [...snapshot.claims].reverse());
    assert.deepEqual(reordered, first);
  });
}

/** Synthetic layout-only records; no scientific meaning and never loaded by the application. */
function entity(id: string, type: Entity['type'], label = 'Same label'): Entity {
  return { id, type, label, aliases: [], external_ids: [], description_claim_ids: [], provenance_source_ids: [] };
}

function claim(predicate: Claim['predicate'], subject_id: string, object_id: string): Claim {
  return { id: 'synthetic-layout-claim', predicate, subject_id, object_id, statement: 'Synthetic layout test only.', context: {}, evidence_ids: [], summary: '', limitations: [],
    review: { status: 'draft', reviewer: null, date: null, rationale: 'Synthetic fixture; no scientific meaning.' } };
}

test('pathway identity pairing follows encodes endpoints, never matching labels or other relationship types', () => {
  const pathway = entity('destination', 'pathway');
  const gene = entity('gene-one', 'gene');
  const protein = entity('protein-one', 'protein');
  const sameLabelProtein = entity('protein-two', 'protein');
  const entities = [pathway, gene, protein, sameLabelProtein];
  const direct = new Set([pathway.id, gene.id]);
  for (const claims of [[], [claim('interacts_with', gene.id, protein.id)], [claim('participates_in', protein.id, pathway.id)]]) {
    const layout = createFocusedLayout(entities, pathway.id, direct, claims);
    assert.notEqual(layout.get(protein.id)![1], layout.get(gene.id)![1]);
    assert.notEqual(layout.get(sameLabelProtein.id)![1], layout.get(gene.id)![1]);
  }
  for (const directMember of [gene, protein]) {
    const memberIds = new Set([pathway.id, directMember.id]);
    const layout = createFocusedLayout(entities, pathway.id, memberIds, [claim('encodes', gene.id, protein.id)]);
    assert.equal(layout.get(gene.id)![1], layout.get(protein.id)![1]);
    assert.notEqual(layout.get(sameLabelProtein.id)![1], layout.get(gene.id)![1]);
    assert.deepEqual(memberIds, new Set([pathway.id, directMember.id]), 'Pairing cannot promote a counterpart to direct membership');
  }
});

test('encodes records with an incompatible visible endpoint cannot pair identities', () => {
  const entities = [entity('destination', 'pathway'), entity('gene-one', 'gene'), entity('other', 'pathway')];
  const layout = createFocusedLayout(entities, 'destination', new Set(['destination', 'gene-one']), [claim('encodes', 'gene-one', 'other')]);
  assert.notEqual(layout.get('gene-one')![1], layout.get('other')![1]);
});

test('non-pathway focus retains its original rings even when full claims are provided', () => {
  const projection = graph('gene-apoe', true);
  const original = createFocusedLayout(projection.entities, 'gene-apoe', projection.directIds);
  const withClaims = createFocusedLayout(projection.entities, 'gene-apoe', projection.directIds, snapshot.claims);
  assert.deepEqual(withClaims, original);
  assert.deepEqual(withClaims.get('gene-apoe'), [0, 0, 0] satisfies Position);
  assert.deepEqual(withClaims.get('disease-alzheimers'), [Math.cos(Math.PI / 2) * 3.4, Math.sin(Math.PI / 2) * 3.4 * 0.82, Math.sin(Math.PI) * 0.3]);
});
