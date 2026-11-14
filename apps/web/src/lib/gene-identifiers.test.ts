import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { parseExperiment } from './experiment.ts';
import { applyGeneMapping, loadGeneIdentityReference, resolveGeneIdentifiers, validateGeneIdentityReference } from './gene-identifiers.ts';
import type { GeneIdentityReference } from './gene-identifiers.ts';
import { runExperimentAnalysis, validatePathwayReference } from './experiment-analysis.ts';

const bytes = await readFile(new URL('../../../../data/reference/hgnc-ensembl.json', import.meta.url));
const reference = validateGeneIdentityReference(JSON.parse(bytes.toString()));
const ncbiBytes = await readFile(new URL('../../../../data/reference/hgnc-ncbi-gene.json', import.meta.url));
const pinnedNcbiReference = validateGeneIdentityReference(JSON.parse(ncbiBytes.toString()));
const pathways = validatePathwayReference(JSON.parse(await readFile(new URL('../../../../data/reference/reactome-pathways.json', import.meta.url), 'utf8')));
const options = { comparison: 'Synthetic treatment / control', allTestedGenes: true, thresholds: { adjustedPMax: 0.05, minAbsLog2FoldChange: 1 } };
const input = () => parseExperiment('gene,log2FoldChange,padj\nENSG00000130203.12,2,.01\nENSG00000095970,-1.5,.02\nENSG99999999999,0,.9\nENSG00000230417,1.2,.03\nENSG00000165029,NA,NA\n', 'synthetic-ensembl.csv');
// Deliberately synthetic identities exercise ambiguity without altering pinned data.
const ncbiReference: GeneIdentityReference = { ...reference, reference_id: 'hgnc-ncbi-gene-6bb2951c5620', columns: ['hgnc_id', 'symbol', 'ncbi_gene_id'], genes: [
  ['HGNC:613', 'APOE', '348'], ['HGNC:29', 'ABCA1', '19'],
  ['HGNC:1', 'SYNTHETICFIRST', '999'], ['HGNC:2', 'SYNTHETICSECOND', '999'], ['HGNC:3', 'SYNTHETICMISSING', null],
] };

test('the bounded HGNC reference preserves pinned bytes, approved identities and real ambiguous cross-references', () => {
  assert.equal(reference.genes.length, 44997);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), 'b003cb4c9b0cbc7ef1e17d223110888d51962fc3eae1732a120269b78ef11799');
  assert.equal(reference.reported_source_date, '2026-06-20');
  assert.equal(reference.source.license, 'CC0-1.0');
  assert.equal(reference.genes.filter((row) => row[2] === 'ENSG00000230417').length, 2);
  assert.throws(() => validateGeneIdentityReference({ ...reference, genes: [reference.genes[0], reference.genes[0]] }), /duplicate/);
  assert.throws(() => validateGeneIdentityReference({ ...reference, source: { ...reference.source, url: 'javascript:alert(1)' } }), /URL/);
});

test('the pinned NCBI cross-reference preserves all approved HGNC records and the same raw source', () => {
  assert.equal(createHash('sha256').update(ncbiBytes).digest('hex'), 'ade9370607ec7c0cca9d5993bd8b8b007ba2027f109502bae3512a04721b1284');
  assert.equal(pinnedNcbiReference.reference_id, 'hgnc-ncbi-gene-6bb2951c5620');
  assert.equal(pinnedNcbiReference.genes.length, 44997);
  assert.deepEqual(pinnedNcbiReference.columns, ['hgnc_id', 'symbol', 'ncbi_gene_id']);
  assert.deepEqual(pinnedNcbiReference.genes.map(([hgncId, symbol]) => [hgncId, symbol]), reference.genes.map(([hgncId, symbol]) => [hgncId, symbol]));
  assert.equal(pinnedNcbiReference.source.sha256, reference.source.sha256);
  assert.equal(pinnedNcbiReference.source.commit, reference.source.commit);
  assert.equal(pinnedNcbiReference.source.url, reference.source.url);
  assert.equal(pinnedNcbiReference.reported_source_date, reference.reported_source_date);
  assert.equal(pinnedNcbiReference.genes.filter((row) => row[2] === null).length, 615);
  assert.equal(new Set(pinnedNcbiReference.genes.flatMap((row) => row[2] === null ? [] : [row[2]])).size, 44382);
  const report = resolveGeneIdentifiers(parseExperiment('entrez_id,log2FC,padj\n348,2,.01\n19,0,.8', 'synthetic-pinned-ncbi.csv'), pinnedNcbiReference);
  assert.deepEqual(report.rows.map(({ candidates }) => candidates), [[{ hgncId: 'HGNC:613', symbol: 'APOE' }], [{ hgncId: 'HGNC:29', symbol: 'ABCA1' }]]);
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

test('NCBI mappings retain exact original IDs, all statistics and ambiguous/unmapped rows', () => {
  const table = parseExperiment('entrez_id,log2FC,padj\n348,2.2201675785994,4.3996355993083e-17\n999,-2,.01\n998,0,.8\n19,NA,NA', 'synthetic-ncbi.csv');
  const before = JSON.stringify(table);
  const report = resolveGeneIdentifiers(table, ncbiReference);
  assert.equal(report.identifierType, 'ncbi_gene');
  assert.deepEqual([report.mappedCount, report.unresolvedCount, report.collisionCount, report.versionedCount], [2, 2, 0, 0]);
  assert.deepEqual(report.rows.map(({ inputId, stableId, status }) => ({ inputId, stableId, status })), [
    { inputId: '348', stableId: '348', status: 'mapped' }, { inputId: '999', stableId: '999', status: 'ambiguous' },
    { inputId: '998', stableId: '998', status: 'unmapped' }, { inputId: '19', stableId: '19', status: 'mapped' },
  ]);
  assert.deepEqual(report.rows[1].candidates.map(({ symbol }) => symbol), ['SYNTHETICFIRST', 'SYNTHETICSECOND']);
  const rows = applyGeneMapping(table, report);
  assert.deepEqual(rows[0], { gene: 'APOE', sourceId: '348', log2FoldChange: 2.2201675785994, padj: 4.3996355993083e-17 });
  assert.deepEqual(rows.slice(1).map(({ gene, sourceId }) => ({ gene, sourceId })), [
    { gene: '999', sourceId: '999' }, { gene: '998', sourceId: '998' }, { gene: 'ABCA1', sourceId: '19' },
  ]);
  assert.deepEqual(rows.map(({ log2FoldChange, padj }) => ({ log2FoldChange, padj })), table.rows.map(({ log2FoldChange, padj }) => ({ log2FoldChange, padj })));
  assert.equal(JSON.stringify(table), before);
});

test('reference namespaces, identifier syntax and unique HGNC symbols are validated before mapping', () => {
  const ncbi = parseExperiment('gene,log2FC,padj\n348,2,.01', 'synthetic-ncbi.csv');
  assert.throws(() => resolveGeneIdentifiers(ncbi, reference), /namespace/);
  assert.throws(() => resolveGeneIdentifiers(input(), ncbiReference), /namespace/);
  assert.throws(() => runExperimentAnalysis(ncbi, { ...options, ncbiGeneIdsConfirmed: true }, pathways), /NCBI Gene identifier reference/);
  assert.throws(() => runExperimentAnalysis(ncbi, { ...options, ncbiGeneIdsConfirmed: true }, pathways, reference), /namespace/);
  const withoutCrossref = [['HGNC:1', 'SYNTHETICFIRST', null]];
  assert.throws(() => validateGeneIdentityReference({ ...ncbiReference, reference_id: reference.reference_id, genes: withoutCrossref }), /validation/);
  assert.throws(() => validateGeneIdentityReference({ ...reference, reference_id: ncbiReference.reference_id, genes: withoutCrossref }), /validation/);
  for (const id of ['0348', '348.0', '3.48e2', '0', 'NCBIGene:348', '1000000000000']) {
    assert.throws(() => validateGeneIdentityReference({ ...ncbiReference, genes: [['HGNC:613', 'APOE', id]] }), /record/);
    assert.throws(() => resolveGeneIdentifiers({ ...ncbi, rows: [{ ...ncbi.rows[0], gene: String(id) }] }, ncbiReference), /Invalid NCBI Gene/);
  }
  assert.throws(() => validateGeneIdentityReference({ ...ncbiReference, genes: [['HGNC:613', 'APOE', 348]] }), /record/);
  assert.throws(() => validateGeneIdentityReference({ ...ncbiReference, genes: [['HGNC:613', 'APOE', '348'], ['HGNC:29', 'APOE', '19']] }), /duplicate/);
});

test('duplicate NCBI mappings block analysis even for an incomplete row and never merge statistics', () => {
  const table = parseExperiment('gene,log2FC,padj\n348,2,.01', 'synthetic-ncbi.csv');
  // The parser already blocks duplicate IDs; the mapping boundary must also guard caller-created tables.
  table.rows.push({ gene: '348', log2FoldChange: null, padj: null });
  const report = resolveGeneIdentifiers(table, ncbiReference);
  assert.equal(report.collisionCount, 2);
  assert.ok(report.rows.every(({ status }) => status === 'collision'));
  assert.throws(() => applyGeneMapping(table, report), /never merged/);
  assert.throws(() => runExperimentAnalysis(table, { ...options, allowUnresolvedIds: true, ncbiGeneIdsConfirmed: true }, pathways, ncbiReference), /never merged/);
});

test('numeric identifiers require explicit NCBI Gene confirmation regardless of the header or available reference', () => {
  for (const header of ['gene', 'symbol', 'entrez_id', '']) {
    const table = parseExperiment(`${header},log2FC,padj\n348,2,.01`, 'synthetic-numeric-column.csv');
    for (const confirmation of [undefined, false]) {
      assert.throws(() => runExperimentAnalysis(table, { ...options, ncbiGeneIdsConfirmed: confirmation }, pathways, ncbiReference), /Confirm these are NCBI Gene IDs.*not row numbers/);
      assert.throws(() => runExperimentAnalysis(table, { ...options, ncbiGeneIdsConfirmed: confirmation }, pathways), /Confirm these are NCBI Gene IDs.*not row numbers/);
    }
    const result = runExperimentAnalysis(table, { ...options, ncbiGeneIdsConfirmed: true }, pathways, ncbiReference);
    assert.equal(result.rows[0].gene, 'APOE');
    assert.equal(result.rows[0].sourceId, '348');
  }
});

test('identity loading uses only the fixed local asset for the requested namespace and keeps the Ensembl default', async (t) => {
  const requests: string[] = [];
  t.mock.method(globalThis, 'fetch', async (url: URL) => {
    requests.push(url.pathname);
    return new Response(JSON.stringify(url.pathname.endsWith('hgnc-ncbi-gene.json') ? ncbiReference : reference));
  });
  assert.equal((await loadGeneIdentityReference()).reference_id, reference.reference_id);
  assert.equal((await loadGeneIdentityReference('ncbi_gene')).reference_id, ncbiReference.reference_id);
  assert.deepEqual(requests.map((url) => url.split('/').at(-1)), ['hgnc-ensembl.json', 'hgnc-ncbi-gene.json']);
  assert.ok(requests.every((url) => url.endsWith('/data/reference/hgnc-ensembl.json') || url.endsWith('/data/reference/hgnc-ncbi-gene.json')));
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify(reference)));
  await assert.rejects(loadGeneIdentityReference('ncbi_gene'), /namespace/);
});
