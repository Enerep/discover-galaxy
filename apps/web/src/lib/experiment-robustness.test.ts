import assert from 'node:assert/strict';
import test from 'node:test';
import { enrichPathways } from './enrichment.ts';
import { analyzeThresholdSensitivity, groupOverlappingPathways } from './experiment-robustness.ts';
import type { RobustnessInput } from './experiment-robustness.ts';

const pathway = (id: string, genes: string[]) => ({ id, name: `Synthetic ${id}`, url: `https://example.invalid/synthetic/${id}`, genes });
const approximately = (actual: number, expected: number) => assert.ok(Math.abs(actual - expected) < 1e-13, `${actual} differs from ${expected}`);
function fixture(): RobustnessInput {
  const backgroundGenes = [...'ABCDEFGHIJKL'];
  const rows = backgroundGenes.map((gene) => ({ gene, log2FoldChange: 0, padj: 0.9 }));
  Object.assign(rows[0], { log2FoldChange: 2, padj: 0.01 });
  Object.assign(rows[1], { log2FoldChange: 1, padj: 0.04 });
  Object.assign(rows[2], { log2FoldChange: 0.5, padj: 0.08 });
  Object.assign(rows[3], { log2FoldChange: -1.5, padj: 0.02 });
  const pathways = [pathway('P1', ['A', 'B', 'D']), pathway('P2', ['C', 'E']), pathway('P3', ['F']), pathway('P4', ['OUTSIDE'])];
  return { rows, backgroundGenes, pathways, thresholds: { adjustedPMax: 0.05, minAbsLog2FoldChange: 1 }, baseline: enrichPathways(backgroundGenes, ['A', 'B', 'D'], pathways) };
}

test('cutoff sensitivity agrees with exact hypergeometric/BH fractions while keeping N and the full family fixed', () => {
  const input = fixture(); const before = JSON.stringify(input);
  const report = analyzeThresholdSensitivity(input);
  assert.deepEqual(report.geneFdrValues, [0.025, 0.05, 0.1]);
  assert.deepEqual(report.foldChangeValues, [0.5, 1, 1.5]);
  assert.equal(report.settings.length, 9);
  assert.deepEqual(report.settings.map(({ selectedCount }) => selectedCount), [2, 2, 2, 3, 3, 2, 4, 3, 2]);
  assert.ok(report.settings.every(({ pathwayCount }) => pathwayCount === 3));
  assert.equal(report.backgroundSize, 12);
  assert.equal(report.settings.filter(({ applied }) => applied).length, 1);
  assert.equal(report.settings.filter(({ results }) => results.find(({ id }) => id === 'P1')!.adjustedPValue <= 0.05).length, 3);
  for (const setting of report.settings) {
    const result = setting.results.find(({ id }) => id === 'P1')!;
    approximately(result.adjustedPValue, setting.selectedCount === 2 ? 3 / 22 : setting.selectedCount === 3 ? 3 / 220 : 3 / 55);
    assert.ok(setting.results.some(({ id, overlapSize, adjustedPValue }) => id === 'P3' && overlapSize === 0 && adjustedPValue === 1));
  }
  assert.equal(JSON.stringify(input), before);
});

test('zero/boundary/custom cutoffs stay inclusive and produce unique finite settings containing the exact applied values', () => {
  for (const thresholds of [
    { adjustedPMax: 0, minAbsLog2FoldChange: 0 },
    { adjustedPMax: 1, minAbsLog2FoldChange: 0.7 },
    { adjustedPMax: 0.03712345678912345, minAbsLog2FoldChange: 1.2345678912345678 },
    { adjustedPMax: Number.MIN_VALUE, minAbsLog2FoldChange: Number.MAX_VALUE },
  ]) {
    const input = fixture(); input.thresholds = thresholds;
    const hits = input.rows.filter((row) => row.padj !== null && row.log2FoldChange !== null && row.padj <= thresholds.adjustedPMax && Math.abs(row.log2FoldChange) >= thresholds.minAbsLog2FoldChange);
    input.baseline = enrichPathways(input.backgroundGenes, hits.map(({ gene }) => gene), input.pathways);
    const report = analyzeThresholdSensitivity(input);
    assert.equal(report.settings.filter(({ applied }) => applied).length, 1);
    assert.equal(new Set(report.settings.map(({ thresholds }) => JSON.stringify(thresholds))).size, report.settings.length);
    assert.ok(report.settings.every(({ thresholds }) => Number.isFinite(thresholds.adjustedPMax) && Number.isFinite(thresholds.minAbsLog2FoldChange)));
  }
  const input = fixture(); input.thresholds = { adjustedPMax: 1, minAbsLog2FoldChange: 0.7 };
  input.baseline = enrichPathways(input.backgroundGenes, input.rows.filter(({ log2FoldChange }) => log2FoldChange !== null && Math.abs(log2FoldChange) >= 0.7).map(({ gene }) => gene), input.pathways);
  assert.deepEqual(analyzeThresholdSensitivity(input).foldChangeValues, [0.2, 0.7, 1.2]);
});

test('missing statistics cannot enter any sensitivity selection and an empty annotation family stays empty', () => {
  const input = fixture();
  input.rows.push({ gene: 'INCOMPLETE', log2FoldChange: null, padj: null });
  assert.equal(analyzeThresholdSensitivity(input).settings.length, 9);
  input.pathways = [pathway('EMPTY', ['OUTSIDE'])]; input.baseline = [];
  assert.ok(analyzeThresholdSensitivity(input).settings.every(({ pathwayCount, significantCount, results }) => pathwayCount === 0 && significantCount === 0 && results.length === 0));
  assert.deepEqual(groupOverlappingPathways(input).groups, []);
});

test('overlap groups use all eligible pathway members, include the exact 0.5 boundary, and prevent transitive chaining', () => {
  const backgroundGenes = ['A', 'B', 'C', 'D', 'E', 'X', 'Y', 'UNANNOTATED'];
  const pathways = [pathway('P-A', ['A', 'B', 'C']), pathway('P-AA', ['C', 'B', 'A']), pathway('P-AB', ['A', 'B', 'C', 'UNMEASURED']),
    pathway('P-B', ['B', 'C', 'D']), pathway('P-C', ['C', 'D', 'E']), pathway('P-Z', ['X', 'Y'])];
  const baseline = enrichPathways(backgroundGenes, ['A'], pathways);
  const input = { backgroundGenes, pathways, baseline }; const before = JSON.stringify(input);
  const report = groupOverlappingPathways(input);
  assert.equal(report.backgroundSize, 8);
  assert.equal(report.pathwayCount, 6);
  assert.equal(report.groups.length, 3);
  const group = report.groups.find(({ representativeId }) => representativeId === 'P-A')!;
  assert.deepEqual(group.members.map(({ id }) => id), ['P-A', 'P-AA', 'P-AB', 'P-B']);
  assert.deepEqual(group.members.find(({ id }) => id === 'P-B'), { id: 'P-B', jaccard: 0.5, sharedCount: 2, eligibleSize: 3 });
  assert.equal(group.members.find(({ id }) => id === 'P-AB')!.jaccard, 1);
  assert.ok(report.groups.some(({ representativeId }) => representativeId === 'P-C'));
  assert.ok(report.groups.some(({ representativeId }) => representativeId === 'P-Z'));
  assert.equal(new Set(report.groups.flatMap(({ members }) => members.map(({ id }) => id))).size, 6);
  assert.equal(JSON.stringify(input), before);
  assert.deepEqual(groupOverlappingPathways({ ...input, baseline: [...baseline].reverse(), pathways: [...pathways].reverse() }), report);
});

test('a shared selected hit cannot collapse distinct pathways whose full eligible-member Jaccard is below the cutoff', () => {
  const backgroundGenes = [...'ABCDEFGHI'];
  const pathways = [pathway('P-A', ['A', 'B', 'C', 'D', 'E']), pathway('P-B', ['A', 'F', 'G', 'H', 'I'])];
  const baseline = enrichPathways(backgroundGenes, ['A'], pathways);
  const result = groupOverlappingPathways({ backgroundGenes, pathways, baseline });
  assert.equal(result.groups.length, 2);
  assert.ok(result.groups.every(({ members }) => members.length === 1));
});

test('sensitivity refuses a changing tested family instead of comparing selected-only tests', () => {
  const input = fixture(); input.baseline = input.baseline.filter(({ overlapSize }) => overlapSize > 0);
  assert.throws(() => analyzeThresholdSensitivity(input), /family changed/);
});
