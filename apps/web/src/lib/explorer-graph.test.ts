import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { loadDataset, getEntityClaims } from './dataset.ts';
import { buildExplorerGraph } from './explorer-graph.ts';
import type { GraphScope } from './explorer-graph.ts';
import { createFocusedLayout } from '../components/galaxy-layout.ts';

const snapshot = loadDataset(JSON.parse(await readFile(new URL('../../../../data/alzheimers/dataset.json', import.meta.url), 'utf8')));
const scope: GraphScope = { selectedId: 'gene-apoe', selectedClaimId: null, mode: 'focus', expanded: false, query: '', filter: 'all' };

test('focus exposes exactly one biological neighbourhood and keeps source findings intact', () => {
  const before = JSON.stringify(snapshot);
  const graph = buildExplorerGraph(snapshot, scope);
  assert.deepEqual([...graph.ids].sort(), ['disease-alzheimers', 'gene-apoe', 'protein-apoe'].sort());
  assert.equal(graph.claims.length, 2);
  assert.equal(graph.citationLinks.length, 0);
  assert.equal(graph.canExpand, true);
  assert.equal(getEntityClaims(snapshot, 'gene-apoe').length, 3);
  assert.equal(JSON.stringify(snapshot), before);
});

test('expansion stops at the next level, keeps the first ring stable and collapses reproducibly', () => {
  const direct = buildExplorerGraph(snapshot, scope);
  const expanded = buildExplorerGraph(snapshot, { ...scope, expanded: true });
  assert.ok(expanded.ids.has('protein-trem2'));
  assert.ok(!expanded.ids.has('gene-col1a1'));
  assert.ok(expanded.entities.length > direct.entities.length);
  const first = createFocusedLayout(direct.entities, scope.selectedId, direct.directIds);
  const second = createFocusedLayout(expanded.entities, scope.selectedId, expanded.directIds);
  for (const id of direct.ids) assert.deepEqual(second.get(id), first.get(id));
  assert.deepEqual(buildExplorerGraph(snapshot, scope), direct);
});

test('one display edge per pair preserves the selected original finding and every inspector record', () => {
  const related = getEntityClaims(snapshot, 'protein-trem2');
  const binding = related.filter(({ subject_id, object_id }) => [subject_id, object_id].includes('protein-apoe'));
  assert.ok(binding.length >= 5);
  for (const finding of binding) {
    const graph = buildExplorerGraph(snapshot, { ...scope, selectedId: 'protein-trem2', selectedClaimId: finding.id });
    assert.equal(graph.claims.filter(({ subject_id, object_id }) => [subject_id, object_id].includes('protein-apoe')).length, 1);
    assert.ok(graph.claims.includes(finding));
  }
  assert.equal(getEntityClaims(snapshot, 'protein-trem2').length, related.length);
});

test('overview exposes the complete library without drawing unrelated branches; papers retain their citations', () => {
  const overview = buildExplorerGraph(snapshot, { ...scope, mode: 'overview' });
  assert.equal(overview.entities.length, snapshot.entities.length);
  assert.ok(overview.claims.every(({ subject_id, object_id }) => [subject_id, object_id].includes(scope.selectedId)));
  const paper = snapshot.entities.find(({ type }) => type === 'paper')!;
  const graph = buildExplorerGraph(snapshot, { ...scope, selectedId: paper.id });
  assert.ok(graph.citationLinks.length > 0);
  for (const link of graph.citationLinks) {
    assert.equal(link.paperId, paper.id);
    assert.ok(snapshot.evidence.some(({ source_id, claim_id }) => source_id === paper.source_id && claim_id === link.claimId));
  }
  assert.equal(new Set(graph.citationLinks.map(({ paperId, entityId }) => `${paperId}|${entityId}`)).size, graph.citationLinks.length);
});

test('type filters, no matches and paper searches preserve explicit library access', () => {
  const proteins = buildExplorerGraph(snapshot, { ...scope, filter: 'protein' });
  assert.ok(proteins.entities.every(({ type }) => type === 'protein'));
  const none = buildExplorerGraph(snapshot, { ...scope, query: 'not a real entity' });
  assert.equal(none.entities.length, 0);
  const paper = snapshot.entities.find(({ type }) => type === 'paper')!;
  const searched = buildExplorerGraph(snapshot, { ...scope, query: paper.id });
  assert.ok(searched.ids.has(paper.id));
  assert.ok(searched.citationLinks.length > 0);
});
