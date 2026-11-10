import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { parseExperiment } from './experiment.ts';
import { runExperimentAnalysis, validatePathwayReference } from './experiment-analysis.ts';
import { buildApoeExplanationComparison } from './experiment-explanations.ts';
import { createExampleExperiment } from './experiment-example.ts';
import { normalizeExperimentContext } from './experiment-context.ts';
import { validateGeneIdentityReference } from './gene-identifiers.ts';

const reference = validatePathwayReference(JSON.parse(await readFile(new URL('../../../../data/reference/reactome-pathways.json', import.meta.url), 'utf8')));
const identities = validateGeneIdentityReference(JSON.parse(await readFile(new URL('../../../../data/reference/hgnc-ensembl.json', import.meta.url), 'utf8')));
const context = () => normalizeExperimentContext({ model: 'Synthetic cortex', condition: 'Synthetic groups', design: 'observational', sampleType: 'bulk_brain_tissue' });
const options = () => ({ comparison: 'Synthetic numerator / denominator', context: context(), allTestedGenes: true,
  thresholds: { adjustedPMax: 0.05, minAbsLog2FoldChange: 1 } });
// Invented measurements only; these fixtures never enter a scientific dataset.
const table = (effect = 2, padj = 0.01) => parseExperiment(`gene,log2FoldChange,padj\nAPOE,${effect},${padj}\nTREM2,-1.5,.02\nABCA1,.1,.7\n`, 'synthetic-apoe-pilot.csv');
const pathwayId = 'R-HSA-174824';

test('the APOE pilot retains exact applied values, pathway overlap and cutoffs without changing the analysis', () => {
  const analysis = runExperimentAnalysis(table(2.123456789, 0.0123456789), options(), reference);
  const before = JSON.stringify(analysis);
  const report = buildApoeExplanationComparison(analysis, pathwayId)!;
  assert.ok(report);
  assert.equal(report.observation.gene, 'APOE');
  assert.equal(report.observation.log2FoldChange, 2.123456789);
  assert.equal(report.observation.padj, 0.0123456789);
  assert.deepEqual(report.thresholds, analysis.thresholds);
  const pathway = analysis.pathways.find(({ id }) => id === pathwayId)!;
  assert.equal(report.pathway.overlapSize, pathway.overlapSize);
  assert.equal(report.pathway.pathwayMeasuredSize, pathway.pathwayMeasuredSize);
  assert.equal(report.pathway.adjustedPValue, pathway.adjustedPValue);
  assert.equal(report.pathway.logAdjustedPValue, pathway.logAdjustedPValue);
  assert.equal(report.referenceId, reference.reference_id);
  assert.equal(report.comparison, analysis.comparison);
  assert.equal(JSON.stringify(analysis), before);
  assert.notEqual(report.context, analysis.context);
  assert.notEqual(report.thresholds, analysis.thresholds);
  // Merely opening a pilot must not require a significant pathway.
  assert.ok(pathway.adjustedPValue > 0.05);
});

test('bulk brain tissue and observational design must be explicit, never guessed from labels or free text', () => {
  for (const supplied of [undefined, { model: 'human bulk brain AD observational' }, { design: 'observational' as const },
    { sampleType: 'bulk_brain_tissue' as const }, { ...context(), sampleType: 'other' as const },
    { ...context(), sampleType: 'unspecified' as const }, { ...context(), design: 'unspecified' as const },
    { ...context(), design: 'perturbation' as const }]) {
    const analysis = runExperimentAnalysis(table(), { ...options(), context: supplied, comparison: 'AD bulk brain / control observational' }, reference);
    assert.equal(buildApoeExplanationComparison(analysis, pathwayId), null);
  }
});

test('the pilot requires a complete, nonzero selected APOE observation in this pathway', () => {
  for (const rows of ['APOE,.1,.8', 'APOE,2,NA', 'APOE,NA,.01', 'APOE,0,.01', 'TREM2,2,.01', 'APOE2,2,.01']) {
    const input = parseExperiment(`gene,log2FoldChange,padj\n${rows}\nABCA1,.1,.8\n`, 'synthetic-ineligible-pilot.csv');
    const analysis = runExperimentAnalysis(input, options(), reference);
    assert.equal(buildApoeExplanationComparison(analysis, pathwayId), null);
  }
  const zero = runExperimentAnalysis(table(0), { ...options(), thresholds: { adjustedPMax: 0.05, minAbsLog2FoldChange: 0 } }, reference);
  assert.ok(zero.selected.some(({ gene }) => gene === 'APOE'));
  assert.equal(buildApoeExplanationComparison(zero, pathwayId), null);
  const analysis = runExperimentAnalysis(table(), options(), reference);
  assert.equal(buildApoeExplanationComparison(analysis, 'R-HSA-DOES-NOT-EXIST'), null);
  const other = analysis.pathways.find(({ overlapGenes }) => overlapGenes.includes('TREM2') && !overlapGenes.includes('APOE'))!;
  assert.ok(other);
  assert.equal(buildApoeExplanationComparison(analysis, other.id), null);
});

test('positive and negative RNA effects keep the same unranked alternatives and do not infer disease status', () => {
  const positive = buildApoeExplanationComparison(runExperimentAnalysis(table(2), options(), reference), pathwayId)!;
  const negative = buildApoeExplanationComparison(runExperimentAnalysis(table(-2), { ...options(), comparison: 'Arbitrary group A / B' }, reference), pathwayId)!;
  assert.equal(negative.observation.log2FoldChange, -2);
  assert.deepEqual(negative.explanations, positive.explanations);
  assert.equal(negative.explanations.length, 2);
  assert.ok(negative.limitations.some((value) => value.includes('Both contributions may occur together')));
  assert.ok(negative.limitations.some((value) => value.includes('cannot choose a winning explanation')));
  assert.ok(negative.limitations.some((value) => value.includes('No disease status')));
  assert.ok(!JSON.stringify(negative).includes('protein-mouse'));
  for (const alternative of negative.explanations) {
    assert.ok(!('score' in alternative) && !('probability' in alternative) && !('rank' in alternative));
  }
});

test('exact Ensembl mapping retains the original identifier and every supplied measurement', () => {
  const input = parseExperiment('gene,log2FoldChange,padj\nENSG00000130203.7,-2.3456789,.023456789\nENSG00000165029,.1,.8\n', 'synthetic-ensembl-pilot.csv');
  const analysis = runExperimentAnalysis(input, options(), reference, identities);
  const report = buildApoeExplanationComparison(analysis, pathwayId)!;
  assert.equal(report.observation.sourceId, 'ENSG00000130203.7');
  assert.equal(report.observation.log2FoldChange, -2.3456789);
  assert.equal(report.observation.padj, 0.023456789);
  assert.deepEqual(analysis.table.rows, input.rows);
});

test('synthetic provenance comes from the table and survives comparison/context/cutoff changes', () => {
  const input = createExampleExperiment();
  const result = runExperimentAnalysis(input, { ...options(), comparison: 'A real-sounding edited comparison',
    thresholds: { adjustedPMax: 0.04, minAbsLog2FoldChange: 1.1 } }, reference);
  assert.equal(buildApoeExplanationComparison(result, pathwayId)!.isSynthetic, true);
  assert.equal(buildApoeExplanationComparison(runExperimentAnalysis(table(), options(), reference), pathwayId)!.isSynthetic, false);
});

test('fresh reports follow successfully applied cutoffs and context without retaining stale measurements', () => {
  const applied = runExperimentAnalysis(table(), options(), reference);
  assert.ok(buildApoeExplanationComparison(applied, pathwayId));
  const pending = { ...options(), context: { ...context(), sampleType: 'other' as const } };
  assert.ok(buildApoeExplanationComparison(applied, pathwayId));
  assert.equal(buildApoeExplanationComparison(runExperimentAnalysis(table(), pending, reference), pathwayId), null);
  const strict = runExperimentAnalysis(table(), { ...options(), thresholds: { adjustedPMax: 0.001, minAbsLog2FoldChange: 1 } }, reference);
  assert.equal(buildApoeExplanationComparison(strict, pathwayId), null);
  assert.deepEqual(strict.backgroundGenes, applied.backgroundGenes);
  const next = runExperimentAnalysis(table(-3, 0.02), options(), reference);
  assert.equal(buildApoeExplanationComparison(next, pathwayId)!.observation.log2FoldChange, -3);
});

test('source premises retain human study identity, the shared cohort, correction and actual source-check limits', () => {
  const report = buildApoeExplanationComparison(runExperimentAnalysis(table(), options(), reference), pathwayId)!;
  assert.deepEqual(report.sources.map(({ id }) => id), ['mathys-2019', 'murphy-2023']);
  const ids = new Set(report.sources.map(({ id }) => id));
  assert.ok(report.explanations.every(({ sourceIds }) => sourceIds.every((id) => ids.has(id))));
  assert.equal(new Set(report.sources.map(({ cohort_id }) => cohort_id)).size, 1);
  for (const source of report.sources) {
    assert.equal(source.study_context.taxonomy_id, 9606);
    assert.equal(source.study_context.participants, 48);
    assert.match(source.source_check.sha256, /^[a-f0-9]{64}$/);
    assert.ok(Number.isFinite(Date.parse(source.source_check.retrieved_at)));
    assert.ok(source.locators.length > 0 && source.locators.every(({ label, url }) => label && new URL(url).protocol === 'https:'));
    assert.ok(source.limitations.length > 0);
    assert.ok(source.reuse.retained_content && source.reuse.terms_url);
    assert.ok(source.publication_status.scope);
  }
  assert.equal(report.sources[0].publication_status.status, 'corrected');
  assert.ok(report.sources[0].publication_status.notice_url);
  assert.ok(report.suggestedTest.limitations.some((value) => value.includes('not independent biological replicates')));
  assert.ok(report.limitations.some((value) => value.includes('not independent replication')));
});
