import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { loadDataset } from './dataset.ts';
import { parseExperiment } from './experiment.ts';
import { buildExperimentQuestions, formatProbability, runExperimentAnalysis, validatePathwayReference } from './experiment-analysis.ts';
import { createExampleExperiment, EXAMPLE_COMPARISON } from './experiment-example.ts';
import { describeExperimentContext, MAX_CONTEXT_LENGTH, normalizeExperimentContext } from './experiment-context.ts';
import type { ExperimentContext } from './experiment-context.ts';
import { analyzeThresholdSensitivity, groupOverlappingPathways } from './experiment-robustness.ts';

const snapshot = loadDataset(JSON.parse(await readFile(new URL('../../../../data/alzheimers/dataset.json', import.meta.url), 'utf8')));
const referenceBytes = await readFile(new URL('../../../../data/reference/reactome-pathways.json', import.meta.url));
const reference = validatePathwayReference(JSON.parse(referenceBytes.toString('utf8')));
// This is an explicitly synthetic workflow fixture, never a public experimental finding.
const table = () => parseExperiment('gene,log2FoldChange,padj\nAPOE,2,.01\nTREM2,-1.5,.02\nABCA1,.1,.7\nSYNTHETICUNMAPPED,.1,.8\nSYNTHETICINCOMPLETE,NA,NA\n', 'synthetic-workflow.csv');
const options = () => ({ comparison: 'Synthetic numerator / denominator', allTestedGenes: true, thresholds: { adjustedPMax: 0.05, minAbsLog2FoldChange: 1 } });

test('optional experiment context is bounded and copied without guessing design or accepting malformed values', () => {
  assert.deepEqual(normalizeExperimentContext(), { model: '', condition: '', design: 'unspecified' });
  assert.equal(describeExperimentContext(normalizeExperimentContext()), '');
  const input = { model: '  iPSC microglia  ', condition: '  Example treatment  ', design: 'perturbation' as const };
  const normalized = normalizeExperimentContext(input);
  assert.equal(normalized.model, 'iPSC microglia');
  input.model = 'changed';
  assert.equal(normalized.model, 'iPSC microglia');
  assert.equal(normalizeExperimentContext({ model: 'x'.repeat(MAX_CONTEXT_LENGTH) }).model.length, MAX_CONTEXT_LENGTH);
  for (const invalid of [null, [], { model: 1 }, { condition: '\u0000' }, { model: 'two\nlines' }, { model: 'x'.repeat(MAX_CONTEXT_LENGTH + 1) }, { design: 'clinical' }, { design: null }, { design: 'toString' }]) {
    assert.throws(() => normalizeExperimentContext(invalid as unknown as Partial<ExperimentContext>));
  }
});

test('changing only experiment context preserves measurements, the full tested family, sensitivity and overlap groups', () => {
  const input = table();
  const before = JSON.stringify(snapshot);
  const plain = runExperimentAnalysis(input, options(), reference);
  const context: ExperimentContext = { model: 'Postmortem cortex', condition: 'AD vs control', design: 'observational' };
  const contextual = runExperimentAnalysis(input, { ...options(), context }, reference);
  assert.deepEqual(contextual.rows, plain.rows);
  assert.deepEqual(contextual.backgroundGenes, plain.backgroundGenes);
  assert.deepEqual(contextual.selected, plain.selected);
  assert.deepEqual(contextual.pathways, plain.pathways);
  const robustness = (analysis: typeof plain) => ({ rows: analysis.rows, backgroundGenes: analysis.backgroundGenes,
    pathways: analysis.reference.pathways, thresholds: analysis.thresholds, baseline: analysis.pathways });
  assert.deepEqual(analyzeThresholdSensitivity(robustness(contextual)), analyzeThresholdSensitivity(robustness(plain)));
  assert.deepEqual(groupOverlappingPathways(robustness(contextual)), groupOverlappingPathways(robustness(plain)));
  context.model = 'Edited later';
  assert.equal(contextual.context.model, 'Postmortem cortex');
  assert.equal(JSON.stringify(snapshot), before);
});

test('explicit study design scopes follow-up tests while preserving source identity and RNA-to-protein limitations', () => {
  const input = table();
  const baseline = runExperimentAnalysis(input, { ...options(), comparison: 'AD vs control' }, reference);
  const pathway = baseline.pathways.find(({ overlapGenes }) => overlapGenes.includes('APOE'))!;
  const generic = buildExperimentQuestions(snapshot, baseline, pathway.id);
  assert.equal(baseline.context.design, 'unspecified');
  assert.ok(generic[0].assumptions.some((value) => value.includes('Study design is unspecified')));
  assert.ok(!generic[0].premise.includes('Researcher-supplied context'));
  for (const design of ['perturbation', 'observational'] as const) {
    const context = { model: 'Human microglia', condition: 'Example comparison', design };
    const result = runExperimentAnalysis(input, { ...options(), context }, reference);
    const questions = buildExperimentQuestions(snapshot, result, pathway.id);
    assert.ok(questions.every(({ question, premise }) => question.includes(context.model) && question.includes(context.condition) && premise.includes('Researcher-supplied context')));
    assert.deepEqual(questions.map(({ sources }) => sources), generic.map(({ sources }) => sources));
    assert.deepEqual(questions.map(({ claimIds }) => claimIds), generic.map(({ claimIds }) => claimIds));
    assert.ok(questions[1].assumptions.some((value) => value.includes('do not establish that this experiment involves R47H')));
    if (design === 'observational') {
      assert.ok(questions[0].question.includes('persist within comparable samples'));
      assert.ok(questions[0].suggestedTest.includes('potential confounders before adjustment'));
      assert.ok(questions[0].suggestedTest.includes('separate controlled perturbation'));
    } else {
      assert.ok(questions[0].suggestedTest.includes('their combination and matched controls'));
    }
  }
});

test('context does not invent missing model details, select new sources or override synthetic provenance', () => {
  const example = createExampleExperiment();
  const result = runExperimentAnalysis(example, { ...options(), context: { condition: '<b>R47H AD</b>' } }, reference);
  const pathway = result.pathways.find(({ overlapGenes }) => overlapGenes.includes('APOE'))!;
  const questions = buildExperimentQuestions(snapshot, result, pathway.id);
  assert.equal(result.table.isSynthetic, true);
  assert.equal(result.context.model, '');
  assert.equal(result.context.design, 'unspecified');
  assert.ok(questions[0].assumptions.some((value) => value.includes('Specify the tissue or cell model')));
  assert.ok(questions[1].assumptions.some((value) => value.includes('do not establish that this experiment involves R47H')));
  assert.ok(!questions[0].question.includes('microglia'));
  assert.ok(questions[0].question.includes('<b>R47H AD</b>'));
});

test('the demonstration preserves synthetic provenance through cutoff changes without marking uploads or changing evidence', () => {
  const before = JSON.stringify(snapshot);
  const example = createExampleExperiment();
  const result = runExperimentAnalysis(example, { ...options(), comparison: EXAMPLE_COMPARISON }, reference);
  assert.equal(result.table.isSynthetic, true);
  assert.equal(result.backgroundGenes.length, 120);
  assert.equal(result.selected.length, 12);
  assert.ok(result.selected.some(({ log2FoldChange }) => log2FoldChange! > 0));
  assert.ok(result.selected.some(({ log2FoldChange }) => log2FoldChange! < 0));
  assert.ok(result.pathways.some(({ adjustedPValue }) => adjustedPValue <= 0.05));
  const reapplied = runExperimentAnalysis(example, { ...options(), comparison: 'An edited example label',
    thresholds: { adjustedPMax: 0.025, minAbsLog2FoldChange: 1.5 } }, reference);
  assert.equal(reapplied.table.isSynthetic, true);
  assert.equal(reapplied.backgroundGenes.length, 120);
  assert.ok(reapplied.selected.length < result.selected.length);
  assert.equal(parseExperiment('gene,log2FoldChange,padj,data_kind\nAPOE,2,.01,synthetic', example.filename).isSynthetic, undefined);
  assert.equal(JSON.stringify(snapshot), before);
});

test('the analysis reference has pinned provenance and keeps original descriptive members outside the curated graph', () => {
  assert.equal(reference.pathways.length, 2751);
  assert.equal(createHash('sha256').update(referenceBytes).digest('hex'), 'f19f3f37b142e1f0d0a6ef84118f1ae586334b04545897627c6d9236c7a739c6');
  assert.equal(reference.source.sha256, 'f5d9af14b2f8d373201372b2e63e3c7b2c5b535d30af1459fddfdba22015cd7d');
  assert.equal(reference.upstream_release, null);
  assert.equal(reference.source.license, 'CC0-1.0');
  assert.ok(reference.pathways.some(({ genes }) => genes.includes('CSF2 gene')));
  assert.equal(snapshot.entities.length, 32);
  assert.throws(() => validatePathwayReference({ ...reference, source: { ...reference.source, sha256: 'unverified' } }));
  assert.throws(() => validatePathwayReference({ ...reference, pathways: [reference.pathways[0], reference.pathways[0]] }));
});

test('analysis declares an eligible tested universe, keeps unannotated eligible genes and reports retained incomplete rows', () => {
  const input = table();
  const before = JSON.stringify(input);
  const graphBefore = JSON.stringify(snapshot);
  const result = runExperimentAnalysis(input, options(), reference);
  assert.equal(result.table.rows.length, 5);
  assert.equal(result.table.missingStatisticsCount, 1);
  assert.equal(result.backgroundGenes.length, 4);
  assert.ok(result.backgroundGenes.includes('SYNTHETICUNMAPPED'));
  assert.ok(!result.backgroundGenes.includes('SYNTHETICINCOMPLETE'));
  assert.deepEqual(result.selected.map(({ gene }) => gene), ['APOE', 'TREM2']);
  assert.equal(result.mappedGenesCount, 3);
  assert.ok(result.pathways.length > 2);
  assert.ok(result.pathways.every(({ backgroundSize, selectedSize }) => backgroundSize === 4 && selectedSize === 2));
  assert.ok(result.pathways.some(({ overlapSize, pValue, adjustedPValue }) => overlapSize === 0 && pValue === 1 && adjustedPValue === 1));
  assert.equal(JSON.stringify(input), before);
  assert.equal(JSON.stringify(snapshot), graphBefore);
  assert.throws(() => runExperimentAnalysis(input, { ...options(), allTestedGenes: false }, reference), /full tested/);
  assert.throws(() => runExperimentAnalysis(input, { ...options(), comparison: ' ' }, reference), /comparison/);
  assert.throws(() => runExperimentAnalysis(input, { ...options(), thresholds: { adjustedPMax: 2, minAbsLog2FoldChange: 1 } }, reference), /adjusted p-value/);
  assert.throws(() => runExperimentAnalysis(parseExperiment('gene,log2FoldChange,padj\nAPOE,NA,NA\n', 'synthetic-incomplete.csv'), options(), reference), /No genes have both/);
});

test('unmapped or empty selected sets produce honest results without changing background or inventing an opportunity', () => {
  const input = parseExperiment('gene,log2FoldChange,padj\nSYNTHETICUNMAPPED,2,.01\n', 'synthetic-unmapped.csv');
  const result = runExperimentAnalysis(input, options(), reference);
  assert.equal(result.mappedGenesCount, 0);
  assert.deepEqual(result.pathways, []);
  assert.deepEqual(buildExperimentQuestions(snapshot, result, 'R-HSA-123'), []);
  const noneSelected = runExperimentAnalysis(table(), { ...options(), thresholds: { adjustedPMax: 0, minAbsLog2FoldChange: 1 } }, reference);
  assert.equal(noneSelected.selected.length, 0);
  assert.ok(noneSelected.pathways.every(({ adjustedPValue }) => adjustedPValue === 1));
  assert.deepEqual(buildExperimentQuestions(snapshot, noneSelected, noneSelected.pathways[0].id), []);
});

test('follow-up questions cite input and membership, preserve assay limitations and never promote RNA results into curated claims', () => {
  const before = JSON.stringify(snapshot);
  const result = runExperimentAnalysis(table(), options(), reference);
  const pathway = result.pathways.find(({ overlapGenes }) => overlapGenes.includes('APOE'))!;
  const questions = buildExperimentQuestions(snapshot, result, pathway.id);
  assert.equal(questions.length, 2);
  assert.ok(questions[0].sources.some(({ url }) => url === pathway.url));
  assert.ok(questions[0].premise.includes(result.comparison));
  assert.ok(questions[0].assumptions.some((value) => value.includes('do not establish pathway activation')));
  const binding = questions.find(({ id }) => id === 'transcripts-to-apoe-trem2-binding')!;
  assert.deepEqual(binding.claimIds, snapshot.conflicts[0].claim_ids);
  assert.ok(binding.sources.some(({ url }) => url === 'https://pubmed.ncbi.nlm.nih.gov/26374899/'));
  assert.ok(binding.sources.some(({ url }) => url === 'https://link.springer.com/article/10.15252/emmm.201809027'));
  assert.ok(binding.assumptions.some((value) => value.includes('do not establish that this experiment involves R47H')));
  assert.ok(binding.premise.includes('no statistically significant APOE3 affinity difference'));
  assert.equal(JSON.stringify(snapshot), before);
  assert.equal(snapshot.hypotheses.length, 0);
  const noTrem2 = parseExperiment('gene,log2FoldChange,padj\nAPOE,2,.01\nTREM2,0,.7\n', 'synthetic-without-pair.csv');
  const other = runExperimentAnalysis(noTrem2, options(), reference);
  assert.equal(buildExperimentQuestions(snapshot, other, pathway.id).length, 1);
});

test('probability formatting preserves extreme calculated tails and distinguishes a reported zero from inferred precision', () => {
  assert.equal(formatProbability(0, -1000), '5.08e-435');
  assert.equal(formatProbability(0), '0 (reported)');
  assert.equal(formatProbability(0.00002), '2.00e-5');
  assert.equal(formatProbability(1), '1');
  assert.equal(formatProbability(NaN), 'Not recorded');
});
