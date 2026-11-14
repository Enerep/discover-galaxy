import assert from 'node:assert/strict';
import test from 'node:test';
import { MAX_EXPERIMENT_BYTES, MAX_EXPERIMENT_ROWS, parseExperiment, selectExperimentHits } from './experiment.ts';

const HEADER = 'gene,log2FoldChange,padj';
const THRESHOLDS = { adjustedPMax: 0.05, minAbsLog2FoldChange: 1 };

test('all uploaded genes are retained for explicit eligibility while only complete thresholded rows are selected', () => {
  const table = parseExperiment(`${HEADER}\nAPOE,1,.05\nABCA1,-1,0\nTREM2,.9,.001\nTYROBP,2,.051\nNR1H2,NA,.01\nNR1H3,0.5,NA\nRXRA,NA,NA`, 'human-results.csv');
  const before = JSON.stringify(table);
  assert.equal(table.rows.length, 7);
  assert.equal(table.missingStatisticsCount, 3);
  assert.deepEqual(selectExperimentHits(table, THRESHOLDS).map(({ gene }) => gene), ['APOE', 'ABCA1']);
  assert.equal(table.rows[4].log2FoldChange, null);
  assert.equal(table.rows[6].padj, null);
  assert.equal(JSON.stringify(table), before);
});

test('BOM, TSV, scientific notation, escaped quotes and multiline extra cells preserve exact symbols and stats', () => {
  const table = parseExperiment('\uFEFF"Symbol"\t"log2FC"\t"FDR"\t"note"\r\n"APOE"\t"+1.50e0"\t"1e-3"\t"two ""quoted"" words\r\nmore text"\r\nC11orf65\t-.5\t.3\t\r\n', 'human-results.tsv');
  assert.equal(table.delimiter, '\t');
  assert.equal(table.filename, 'human-results.tsv');
  assert.deepEqual(table.columns, { gene: 'Symbol', log2FoldChange: 'log2FC', padj: 'FDR' });
  assert.deepEqual(table.rows, [{ gene: 'APOE', log2FoldChange: 1.5, padj: 0.001 }, { gene: 'C11orf65', log2FoldChange: -0.5, padj: 0.3 }]);
  const comma = parseExperiment('gene_symbol,log2FoldChange,adj.P.Val,note\nAPOE,2,.01,"commas, are data"', 'human.csv');
  assert.equal(comma.rows[0].gene, 'APOE');
});

test('unknown, ambiguous or inconsistent columns and malformed quoting fail with bounded location messages', () => {
  for (const text of ['gene,log2FoldChange,pvalue\nAPOE,1,.01', 'gene,symbol,log2FC,padj\nAPOE,APOE,1,.01',
    'gene,log2FC,padj,NOTE,note\nAPOE,1,.01,a,b', 'gene\tlog2FoldChange,padj\nAPOE\t1,.01',
    `${HEADER}\nAPOE,1,.01,extra`, `${HEADER}\n"APOE,1,.01`, `${HEADER}\n"APOE"x,1,.01`, `${HEADER}\nAP"OE,1,.01`,
    `${HEADER}\n,,`, `${HEADER}\n`, `${HEADER}\nAPOE,1,\0`]) {
    assert.throws(() => parseExperiment(text, 'synthetic-input.csv'));
  }
  assert.throws(() => parseExperiment('gene,log2FC,padj,note\nAPOE,1,.01,"first\nsecond"\nABCA1,bad,.2,notes', 'synthetic.csv'), /Row 4, log2FoldChange/);
  const secret = '=HYPERLINK("https://example.invalid/private-workflow-test")';
  let message = '';
  try { parseExperiment(`${HEADER}\n"${secret.replaceAll('"', '""')}",1,.01`, 'synthetic.csv'); }
  catch (error) { message = (error as Error).message; }
  assert.ok(message.includes('Row 2, gene'));
  assert.ok(!message.includes(secret));
});

test('duplicate genes and unsupported identifiers are rejected without casing conversion or merging', () => {
  assert.throws(() => parseExperiment(`${HEADER}\nAPOE,1,.01\n APOE ,-2,.001`, 'synthetic.csv'), /Row 3, gene: duplicate/);
  for (const gene of ['Apoe', 'apoe', 'ENSG123', 'ENSMUSG00000002985', 'APOE;ABCA1', 'C11orf' + '6'.repeat(65)]) {
    assert.throws(() => parseExperiment(`${HEADER}\n${gene},1,.01`, 'synthetic.csv'), /Row 2, gene:/);
  }
  // Syntactic acceptance is not a claim that the uploaded symbol exists in HGNC.
  const table = parseExperiment(`${HEADER}\nSYNTHETIC-WORKFLOW-GENE,1,.01`, 'synthetic.csv');
  assert.equal(table.rows[0].gene, 'SYNTHETIC-WORKFLOW-GENE');
});

test('Ensembl versions and unnamed R row names are preserved; mixed types need a separate column', () => {
  const table = parseExperiment(',log2FoldChange,padj\nENSG00000130203.12,2,.01\nENSG00000095970,-1,.02', 'synthetic.csv');
  assert.equal(table.identifierType, 'ensembl');
  assert.equal(table.rows[0].gene, 'ENSG00000130203.12');
  assert.throws(() => parseExperiment(`${HEADER}\nAPOE,2,.01\nENSG00000095970,1,.02`, 'synthetic.csv'), /cannot be mixed/);
});

test('NCBI Gene identifiers retain canonical digit strings, including bounds and recognized Entrez headers', () => {
  for (const column of ['gene', 'ncbi_gene_id', 'entrez_id', 'entrez_gene_id', '']) {
    const table = parseExperiment(`${column},log2FC,padj\n1,1e0,.05\n348,2.2201675785994,4.3996355993083e-17\n999999999999,NA,NA`, 'synthetic-ncbi.csv');
    assert.equal(table.identifierType, 'ncbi_gene');
    assert.deepEqual(table.rows.map(({ gene }) => gene), ['1', '348', '999999999999']);
    assert.equal(table.rows[1].log2FoldChange, 2.2201675785994);
    assert.equal(table.rows[1].padj, 4.3996355993083e-17);
    assert.equal(table.missingStatisticsCount, 1);
  }
  for (const gene of ['0', '0348', '+348', '-348', '348.0', '348.1', '3.48e2', '348e0', '348E0', 'NCBIGene:348', 'entrez:348', '1000000000000']) {
    assert.throws(() => parseExperiment(`${HEADER}\n${gene},1,.01`, 'synthetic-ncbi.csv'), /Row 2, gene:/);
  }
});

test('NCBI Gene IDs cannot mix with symbols or Ensembl IDs and duplicates never merge', () => {
  for (const genes of [['348', 'APOE'], ['348', 'ENSG00000130203'], ['APOE', '348'], ['ENSG00000130203', '348']]) {
    assert.throws(() => parseExperiment(`${HEADER}\n${genes.map((gene) => `${gene},1,.01`).join('\n')}`, 'synthetic-mixed.csv'), /cannot be mixed/);
  }
  assert.throws(() => parseExperiment(`${HEADER}\n348,1,.01\n 348 ,-2,.001`, 'synthetic-duplicate.csv'), /Row 3, gene: duplicate identifier/);
  const text = 'entrez_id,symbol,log2FC,padj\n348,APOE,2,.01';
  assert.throws(() => parseExperiment(text, 'synthetic-columns.csv'), /Choose the column/);
  assert.equal(parseExperiment(text, 'synthetic-columns.csv', { identifierColumn: 0 }).identifierType, 'ncbi_gene');
  assert.equal(parseExperiment(text, 'synthetic-columns.csv', { identifierColumn: 1 }).identifierType, 'symbol');
});

test('explicit column selection resolves multiple identifier columns without changing data or guessing a symbol', () => {
  const text = 'gene_id,symbol,log2FC,padj\nENSG00000130203,APOE,2,.01';
  const ensembl = parseExperiment(text, 'synthetic.csv', { identifierColumn: 0 });
  const symbols = parseExperiment(text, 'synthetic.csv', { identifierColumn: 1 });
  assert.equal(ensembl.identifierType, 'ensembl');
  assert.equal(symbols.identifierType, 'symbol');
  assert.equal(ensembl.rows[0].log2FoldChange, symbols.rows[0].log2FoldChange);
  assert.throws(() => parseExperiment(text, 'synthetic.csv', { identifierColumn: 8 }), /available/);
});

test('finite decimal statistics are required and missing values remain explicit', () => {
  for (const [fold, padj] of [['Infinity', '.01'], ['-Inf', '.01'], ['0x10', '.01'], ['1e999', '.01'],
    ['1', '-.001'], ['1', '1.001'], ['1', '0x0'], ['1', '1e999'], ['1 000', '.01']]) {
    assert.throws(() => parseExperiment(`${HEADER}\nAPOE,${fold},${padj}`, 'synthetic.csv'), /Row 2,/);
  }
  const table = parseExperiment(`${HEADER}\nAPOE,,N/A\nABCA1,NaN,null\nTREM2,0,1`, 'synthetic.csv');
  assert.deepEqual(table.rows.slice(0, 2), [{ gene: 'APOE', log2FoldChange: null, padj: null }, { gene: 'ABCA1', log2FoldChange: null, padj: null }]);
  assert.equal(table.missingStatisticsCount, 2);
  assert.deepEqual(selectExperimentHits(table, { adjustedPMax: 1, minAbsLog2FoldChange: 0 }).map(({ gene }) => gene), ['TREM2']);
});

test('thresholds are inclusive and cannot silently accept invalid probability or effect cutoffs', () => {
  const table = parseExperiment(`${HEADER}\nAPOE,+1,.05\nABCA1,-1,.05\nTREM2,0,0`, 'synthetic.csv');
  assert.deepEqual(selectExperimentHits(table, THRESHOLDS).map(({ gene }) => gene), ['APOE', 'ABCA1']);
  assert.deepEqual(selectExperimentHits(table, { adjustedPMax: 0, minAbsLog2FoldChange: 0 }).map(({ gene }) => gene), ['TREM2']);
  for (const thresholds of [{ adjustedPMax: -0.1, minAbsLog2FoldChange: 1 }, { adjustedPMax: 1.1, minAbsLog2FoldChange: 1 },
    { adjustedPMax: NaN, minAbsLog2FoldChange: 1 }, { adjustedPMax: 0.05, minAbsLog2FoldChange: -1 },
    { adjustedPMax: 0.05, minAbsLog2FoldChange: Infinity }]) assert.throws(() => selectExperimentHits(table, thresholds), /adjusted p-value/);
});

test('nonzero underflow cannot silently become a reported zero or bypass probability bounds', () => {
  for (const [fold, padj] of [['1e-999', '.01'], ['1', '1e-999'], ['1', '-1e-999']]) {
    assert.throws(() => parseExperiment(`${HEADER}\nAPOE,${fold},${padj}`, 'synthetic.csv'), /too small to represent/);
  }
  const table = parseExperiment(`${HEADER}\nAPOE,1,5e-324\nABCA1,0e-999,0e-999`, 'synthetic.csv');
  assert.ok(table.rows[0].padj! > 0);
  assert.equal(table.rows[1].padj, 0);
});

test('file bytes and row limits are bounded while blank physical lines do not add genes', () => {
  assert.throws(() => parseExperiment('x'.repeat(MAX_EXPERIMENT_BYTES + 1), 'synthetic.csv'), /5 MiB/);
  assert.throws(() => parseExperiment('é'.repeat(Math.floor(MAX_EXPERIMENT_BYTES / 2) + 1), 'synthetic.csv'), /5 MiB/);
  const tooMany = `${HEADER}\n${Array.from({ length: MAX_EXPERIMENT_ROWS + 1 }, (_, index) => `SYNTHETIC${index},1,.01`).join('\n')}`;
  assert.throws(() => parseExperiment(tooMany, 'synthetic.csv'), /50,000 gene rows/);
  assert.deepEqual(parseExperiment(`\r\n${HEADER}\r\n\r\nAPOE,1,.01\r\n  \r\n`, 'synthetic.csv').rows, [{ gene: 'APOE', log2FoldChange: 1, padj: 0.01 }]);
});
