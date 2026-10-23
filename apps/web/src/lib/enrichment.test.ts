import assert from 'node:assert/strict';
import test from 'node:test';
import { enrichPathways } from './enrichment.ts';
import type { PathwayGeneSet } from './enrichment.ts';

// Synthetic identifiers and sets exercise statistics only; none enter scientific data.
const genes = (count: number, start = 0) => Array.from({ length: count }, (_, index) => `GENE${index + start}`);
const pathway = (id: string, members: string[]): PathwayGeneSet => ({ id, name: `Synthetic test ${id}`, url: `https://example.org/synthetic/${id}`, genes: members });
const close = (actual: number, expected: number, relative = 1e-12) => assert.ok(Math.abs(actual - expected) <= Math.max(1e-15, Math.abs(expected) * relative), `${actual} != ${expected}`);

test('ORA uses the right-tailed hypergeometric probability and the uploaded measured background', () => {
  // N=10, K=4, n=3, k=2: (C(4,2)C(6,1)+C(4,3)C(6,0))/C(10,3) = 1/3.
  const result = enrichPathways(genes(10), ['GENE0', 'GENE1', 'GENE9'], [pathway('synthetic-a', genes(4))])[0];
  assert.deepEqual([result.backgroundSize, result.pathwayMeasuredSize, result.selectedSize, result.overlapSize], [10, 4, 3, 2]);
  assert.deepEqual(result.overlapGenes, ['GENE0', 'GENE1']);
  close(result.pValue, 1 / 3);
  close(result.adjustedPValue, 1 / 3);
  // Ten unannotated measured genes change the conditional background to N=20:
  // (C(4,2)C(16,1)+C(4,3))/C(20,3) = 5/57. They are not discarded.
  const larger = enrichPathways(genes(20), ['GENE0', 'GENE1', 'GENE9'], [pathway('synthetic-a', genes(4))])[0];
  close(larger.pValue, 5 / 57);
  assert.equal(larger.backgroundSize, 20);
});

test('BH includes zero-overlap pathways and corrects the full tested family with monotone values', () => {
  const results = enrichPathways(genes(10), genes(3), [
    pathway('synthetic-zero', ['GENE7', 'GENE8']),
    pathway('synthetic-three', genes(4)), // p=1/30.
    pathway('synthetic-two', ['GENE0', 'GENE1', 'GENE5', 'GENE6']), // p=1/3.
    pathway('synthetic-unmeasured', ['UNMEASURED']),
  ]);
  assert.deepEqual(results.map(({ id }) => id), ['synthetic-three', 'synthetic-two', 'synthetic-zero']);
  close(results[0].pValue, 1 / 30);
  close(results[0].adjustedPValue, 1 / 10);
  close(results[1].adjustedPValue, 1 / 2);
  assert.equal(results[2].pValue, 1);
  assert.equal(results[2].adjustedPValue, 1);
  assert.equal(results[2].overlapSize, 0);
  assert.ok(results.every((row, index) => index === 0 || row.adjustedPValue >= results[index - 1].adjustedPValue));
});

test('duplicate membership is deduplicated, unmeasured members do not enter K, and inputs remain unchanged', () => {
  const background = Object.freeze(genes(10));
  const selected = Object.freeze(['GENE1', 'GENE0', 'GENE9']);
  const sets = Object.freeze([Object.freeze({ ...pathway('synthetic-a', []), genes: Object.freeze(['GENE1', 'GENE0', 'GENE0', 'GENE2', 'GENE3', 'UNMEASURED']) })]);
  const before = JSON.stringify({ background, selected, sets });
  const result = enrichPathways(background, selected, sets)[0];
  assert.equal(result.pathwayMeasuredSize, 4);
  assert.deepEqual(result.overlapGenes, ['GENE0', 'GENE1']);
  close(result.pValue, 1 / 3);
  assert.equal(JSON.stringify({ background, selected, sets }), before);
  assert.deepEqual(enrichPathways(background, [...selected].reverse(), [...sets].reverse()), [result]);
});

test('original reference product labels remain intact and never become guessed gene-symbol aliases', () => {
  const members = Object.freeze(['APOE', '18S rRNA', 'CSF2 gene', '18S rRNA, 5.8S rRNA, 28S rRNA', 'EPAS1 (HIF2A)']);
  const sets = Object.freeze([Object.freeze({ ...pathway('synthetic-original-labels', []), genes: members })]);
  const before = JSON.stringify(sets);
  const result = enrichPathways(['APOE', 'CSF2', 'EPAS1', 'RNA18SN1'], ['APOE', 'CSF2', 'EPAS1'], sets)[0];
  assert.equal(result.pathwayMeasuredSize, 1);
  assert.equal(result.overlapSize, 1);
  assert.deepEqual(result.overlapGenes, ['APOE']);
  close(result.pValue, 3 / 4);
  assert.equal(JSON.stringify(sets), before);
  assert.throws(() => enrichPathways(['CSF2 gene'], [], sets), /invalid gene/);
  for (const label of ['', ' ', 'A'.repeat(501), '18S\u0085rRNA']) {
    assert.throws(() => enrichPathways(['APOE'], [], [pathway('synthetic-invalid-label', [label])]), /invalid member/);
  }
});

test('empty selections, complete selections and finite-support boundaries retain exact probabilities', () => {
  const sets = [pathway('synthetic-a', genes(8))];
  assert.equal(enrichPathways(genes(10), [], sets)[0].pValue, 1);
  assert.equal(enrichPathways(genes(10), genes(10), sets)[0].pValue, 1);
  // Five members is the minimum possible overlap when n=7 and K=8 in N=10.
  assert.equal(enrichPathways(genes(10), [...genes(5), 'GENE8', 'GENE9'], sets)[0].pValue, 1);
  assert.equal(enrichPathways(['GENE0'], ['GENE0'], [pathway('synthetic-one', ['GENE0'])])[0].pValue, 1);
  assert.deepEqual(enrichPathways(genes(10), genes(3), [pathway('synthetic-none', ['UNMEASURED'])]), []);
});

test('small-universe probabilities agree with enumerating every possible selected subset', () => {
  // Enumerating the 2^6 subsets supplies an independent reference without
  // factorials, hypergeometric recurrence or a statistical library dependency.
  const background = genes(6);
  const subsets = Array.from({ length: 64 }, (_, mask) => background.filter((_, index) => mask & (1 << index)));
  for (let n = 0; n <= background.length; n += 1) {
    const selectedSets = subsets.filter((set) => set.length === n);
    for (let K = 1; K <= background.length; K += 1) {
      const members = genes(K);
      const counts = selectedSets.map((set) => set.filter((gene) => members.includes(gene)).length);
      for (const k of new Set(counts)) {
        const selected = selectedSets[counts.indexOf(k)];
        const expected = counts.filter((value) => value >= k).length / counts.length;
        close(enrichPathways(background, selected, [pathway('synthetic-enumerated', members)])[0].pValue, expected);
      }
    }
  }
});

test('large-count tails agree with independent exact-combination reference values', () => {
  // Values computed using Python fractions.Fraction(sum(math.comb(K,x) *
  // math.comb(N-K,n-x)), math.comb(N,n)), independent of this log recurrence.
  for (const [N, K, n, k, expected] of [
    [20_000, 100, 500, 12, 7.466733235688401e-6],
    [50_000, 2000, 3000, 180, 3.790040641823354e-8],
    [50_000, 2000, 3000, 60, 0.9999999999066532],
  ]) {
    const selected = [...genes(k), ...genes(n - k, K)];
    const result = enrichPathways(genes(N), selected, [pathway('synthetic-large', genes(K))])[0];
    close(result.pValue, expected, 5e-9);
    close(Math.exp(result.logPValue), expected, 5e-9);
  }
});

test('extreme probabilities preserve logarithms and BH ranks when numeric probabilities underflow', () => {
  // P(all 25,000 selected genes are in one 25,000-gene set | N=50,000)
  // is 1/C(50,000,25,000); Python math.log(math.comb(...)) gives this log tail.
  const result = enrichPathways(genes(50_000), genes(25_000), [
    pathway('synthetic-extreme', genes(25_000)), pathway('synthetic-zero', genes(25_000, 25_000)),
  ])[0];
  assert.equal(result.pValue, 0);
  assert.equal(result.adjustedPValue, 0);
  close(result.logPValue, -34651.72334250241, 1e-12);
  close(result.logAdjustedPValue, result.logPValue + Math.log(2));
  assert.ok(Number.isFinite(result.logPValue));
});

test('malformed, duplicate or inconsistent identifiers and reference metadata fail explicitly', () => {
  const sets = [pathway('synthetic-a', genes(2))];
  assert.throws(() => enrichPathways([], [], sets), /background/);
  assert.throws(() => enrichPathways(['GENE0', 'GENE0'], [], sets), /duplicate/);
  assert.throws(() => enrichPathways(genes(4), ['GENE0', 'GENE0'], sets), /duplicate/);
  assert.throws(() => enrichPathways(genes(4), ['UNMEASURED'], sets), /belong/);
  assert.throws(() => enrichPathways([' GENE0'], [], sets), /invalid gene/);
  assert.throws(() => enrichPathways(genes(4), [], [...sets, ...sets]), /unique/);
  assert.throws(() => enrichPathways(genes(4), [], [{ ...sets[0], url: 'javascript:invalid' }]), /HTTP/);
  assert.throws(() => enrichPathways(genes(4), [], [{ ...sets[0], url: 'https://credential@example.org/test' }]), /credentials/);
  assert.throws(() => enrichPathways(genes(4), [], [{ ...sets[0], genes: ['GENE0', 'untrusted text\nGENE1'] }]), /invalid member/);
  assert.throws(() => enrichPathways(genes(50_001), [], sets), /50000/);
});
