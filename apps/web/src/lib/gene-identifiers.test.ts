import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { parseExperiment } from './experiment.ts';
import { applyGeneMapping, resolveGeneIdentifiers, validateGeneIdentityReference } from './gene-identifiers.ts';
import { runExperimentAnalysis, validatePathwayReference } from './experiment-analysis.ts';

const bytes = await readFile(new URL('../../../../data/reference/hgnc-ensembl.json', import.meta.url));
const reference = validateGeneIdentityReference(JSON.parse(bytes.toString()));
const pathways = validatePathwayReference(JSON.parse(await readFile(new URL('../../../../data/reference/reactome-pathways.json', import.meta.url), 'utf8')));
const options = { comparison: 'Synthetic treatment / control', allTestedGenes: true, thresholds: { adjustedPMax: 0.05, minAbsLog2FoldChange: 1 } };
const input = () => parseExperiment('gene,log2FoldChange,padj\nENSG00000130203.12,2,.01\nENSG00000095970,-1.5,.02\nENSG99999999999,0,.9\nENSG00000230417,1.2,.03\nENSG00000165029,NA,NA\n', 'synthetic-ensembl.csv');

test('the bounded HGNC reference preserves pinned bytes, approved identities and real ambiguous cross-references', () => {
  assert.equal(reference.genes.length, 44997);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), 'b003cb4c9b0cbc7ef1e17d223110888d51962fc3eae1732a120269b78ef11799');
  assert.equal(reference.reported_source_date, '2026-06-20');
  assert.equal(reference.source.license, 'CC0-1.0');
  assert.equal(reference.genes.filter((row) => row[2] === 'ENSG00000230417').length, 2);
  assert.throws(() => validateGeneIdentityReference({ ...reference, genes: [reference.genes[0], reference.genes[0]] }), /duplicate/);
  assert.throws(() => validateGeneIdentityReference({ ...reference, source: { ...reference.source, url: 'javascript:alert(1)' } }), /URL/);
});

test('mapping retains original versions and statistics, and reports unknown/ambiguous identities without guessing', () => {
  const table = input(); const before = JSON.stringify(table);
  const report = resolveGeneIdentifiers(table, reference);
  assert.deepEqual([report.mappedCount, report.unresolvedCount, report.collisionCount, report.versionedCount], [3, 2, 0, 1]);
  assert.equal(report.rows[0].candidates[0].hgncId, 'HGNC:613');
  assert.deepEqual(report.rows[3].candidates.map(({ symbol }) => symbol), ['LINC00595', 'LINC00856']);
  const rows = applyGeneMapping(table, report);
  assert.deepEqual(rows[0], { gene: 'APOE', sourceId: 'ENSG00000130203.12', log2FoldChange: 2, padj: 0.01 });
  assert.equal(rows[2].gene, 'ENSG99999999999');
  assert.equal(rows[3].gene, 'ENSG00000230417');
  assert.equal(JSON.stringify(table), before);
});

test('unresolved eligible IDs stay in N and the selected set only after explicit acknowledgement; missing statistics stay excluded', () => {
  const table = input();
  assert.throws(() => runExperimentAnalysis(table, options, pathways), /reference/);
  assert.throws(() => runExperimentAnalysis(table, options, pathways, reference), /Review unresolved/);
  const result = runExperimentAnalysis(table, { ...options, allowUnresolvedIds: true }, pathways, reference);
  assert.equal(result.backgroundGenes.length, 4);
  assert.equal(result.selected.length, 3);
  assert.ok(result.backgroundGenes.includes('ENSG99999999999'));
  assert.ok(result.selected.some(({ gene }) => gene === 'ENSG00000230417'));
  assert.ok(!result.backgroundGenes.includes('ABCA1'));
  assert.equal(result.mappedGenesCount, 2);
  assert.ok(result.pathways.some(({ overlapGenes }) => overlapGenes.includes('APOE')));
  assert.ok(result.pathways.every(({ backgroundSize, selectedSize, overlapGenes }) => backgroundSize === 4 && selectedSize === 3 && !overlapGenes.includes('LINC00595')));
});

test('different versions of one stable ID block analysis even when one row has missing statistics', () => {
  const table = parseExperiment('gene,log2FC,padj\nENSG00000130203.1,2,.01\nENSG00000130203.2,NA,NA', 'synthetic-collision.csv');
  const report = resolveGeneIdentifiers(table, reference);
  assert.equal(report.collisionCount, 2);
  assert.ok(report.rows.every(({ status }) => status === 'collision'));
  assert.throws(() => applyGeneMapping(table, report), /never merged/);
  assert.throws(() => runExperimentAnalysis(table, { ...options, allowUnresolvedIds: true }, pathways, reference), /never merged/);
});

test('malformed references cannot assign one symbol to multiple identities', () => {
  const synthetic = { ...reference, genes: [
    ['HGNC:1', 'SYNTHETICGENE', 'ENSG00000000001'],
    ['HGNC:2', 'SYNTHETICOTHER', 'ENSG00000000002'],
  ] as typeof reference.genes };
  // A real HGNC symbol is unique in the reference. Duplicate stable inputs are
  // therefore the only possible collision in this pinned mapping; test bounds
  // still reject a malformed reference that tries to assign a symbol twice.
  const invalid = { ...synthetic, genes: [synthetic.genes[0], ['HGNC:2', 'SYNTHETICGENE', 'ENSG00000000002']] };
  assert.throws(() => validateGeneIdentityReference(invalid), /duplicate/);
});

test('symbol analysis keeps its original exact-match behavior and never loads identity data', () => {
  const table = parseExperiment('gene,log2FC,padj\nAPOE,2,.01\nSYNTHETICUNMAPPED,0,.9', 'synthetic-symbols.csv');
  const result = runExperimentAnalysis(table, options, pathways);
  assert.equal(result.identifierMapping, null);
  assert.equal(result.rows, table.rows);
  assert.equal(result.rows[0].sourceId, undefined);
});
