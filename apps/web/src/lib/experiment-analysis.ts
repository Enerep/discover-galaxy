import type { Snapshot } from './types.ts';
import { getClaimEvidence } from './dataset.ts';
import { enrichPathways } from './enrichment.ts';
import type { EnrichmentResult, PathwayGeneSet } from './enrichment.ts';
import { selectExperimentHits } from './experiment.ts';
import type { ExperimentRow, ExperimentTable, ExperimentThresholds } from './experiment.ts';
import { applyGeneMapping, resolveGeneIdentifiers } from './gene-identifiers.ts';
import type { GeneIdentityReference, GeneMappingReport } from './gene-identifiers.ts';

export interface PathwayReference {
  schema_version: 1;
  reference_id: string;
  organism: 'Homo sapiens';
  identifier_type: 'gene_symbol';
  upstream_release: null;
  source: { url: string; commit: string; sha256: string; retrieved_at: string; terms_url: string; license: string; attribution: string };
  pathways: PathwayGeneSet[];
}
export interface ExperimentAnalysis {
  table: ExperimentTable;
  rows: ExperimentRow[];
  identifierMapping: GeneMappingReport | null;
  comparison: string;
  thresholds: ExperimentThresholds;
  reference: PathwayReference;
  backgroundGenes: string[];
  selected: ExperimentRow[];
  mappedGenesCount: number;
  pathways: EnrichmentResult[];
  createdAt: string;
  backgroundDeclaration: 'full_tested_table_supplied';
}
export interface ExperimentObservation {
  comparison: string;
  row: ExperimentRow;
  selected: boolean;
  thresholds: ExperimentThresholds;
}
export interface ExperimentQuestion {
  id: string;
  question: string;
  premise: string;
  assumptions: string[];
  suggestedTest: string;
  sources: { title: string; url: string }[];
  claimIds: string[];
}

/** Validate the pinned reference independently of the curated claim snapshot. */
export function validatePathwayReference(value: unknown): PathwayReference {
  const item = value as Partial<PathwayReference> | null;
  if (!item || item.schema_version !== 1 || item.organism !== 'Homo sapiens' || item.identifier_type !== 'gene_symbol'
    || item.upstream_release !== null || typeof item.reference_id !== 'string' || !/^reactome-human-[a-z0-9-]{1,100}$/u.test(item.reference_id)
    || !item.source || !/^[a-f0-9]{64}$/u.test(item.source.sha256) || !/^[a-f0-9]{40}$/u.test(item.source.commit)
    || item.source.license !== 'CC0-1.0' || !Number.isFinite(Date.parse(item.source.retrieved_at))
    || !Array.isArray(item.pathways) || !item.pathways.length || item.pathways.length > 10_000) throw new Error('The pathway reference did not pass its integrity checks.');
  for (const url of [item.source.url, item.source.terms_url]) {
    let parsed: URL;
    try { parsed = new URL(url); } catch { throw new Error('The pathway reference has an invalid source URL.'); }
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new Error('The pathway reference has an invalid source URL.');
  }
  if (typeof item.source.attribution !== 'string' || !item.source.attribution.trim()) throw new Error('The pathway reference has no attribution.');
  const seen = new Set<string>();
  let memberships = 0;
  for (const pathway of item.pathways) {
    if (!pathway || typeof pathway.id !== 'string' || !/^R-HSA-\d+$/u.test(pathway.id) || seen.has(pathway.id)
      || typeof pathway.name !== 'string' || !pathway.name.trim() || pathway.name.length > 500
      || /[\u0000-\u001f\u007f]/u.test(pathway.name) || pathway.url !== `https://reactome.org/content/detail/${pathway.id}`
      || !Array.isArray(pathway.genes) || !pathway.genes.length || pathway.genes.length > 50_000
      || pathway.genes.some((gene) => typeof gene !== 'string' || !gene.trim() || gene.length > 500 || /[\u0000-\u001f\u007f]/u.test(gene))
      || new Set(pathway.genes).size !== pathway.genes.length) throw new Error('The pathway reference contains an invalid or duplicate record.');
    memberships += pathway.genes.length;
    if (memberships > 5_000_000) throw new Error('The pathway reference exceeds the membership limit.');
    seen.add(pathway.id);
  }
  return item as PathwayReference;
}

/** Vite emits a separate local asset; no uploaded measurements leave the browser. */
export async function loadPathwayReference(): Promise<PathwayReference> {
  let payload: unknown;
  try {
    const response = await fetch(new URL('../../../../data/reference/reactome-pathways.json', import.meta.url));
    if (!response.ok) throw new Error('Reference response unavailable.');
    payload = await response.json();
  } catch { throw new Error('Unable to load the pathway reference. Try the analysis again.'); }
  return validatePathwayReference(payload);
}

export function runExperimentAnalysis(table: ExperimentTable, options: { comparison: string; thresholds: ExperimentThresholds; allTestedGenes: boolean; allowUnresolvedIds?: boolean }, reference: PathwayReference, geneReference?: GeneIdentityReference): ExperimentAnalysis {
  if (options.allTestedGenes !== true) throw new Error('Use the full tested-gene table as the background, including genes that did not pass your cutoffs.');
  if (typeof options.comparison !== 'string' || !options.comparison.trim() || options.comparison.trim().length > 160) throw new Error('Name the comparison, in numerator / denominator order.');
  validatePathwayReference(reference);
  if (table.identifierType === 'ensembl' && !geneReference) throw new Error('Load the pinned Ensembl identifier reference before analysis.');
  const identifierMapping = table.identifierType === 'ensembl' ? resolveGeneIdentifiers(table, geneReference!) : null;
  if (identifierMapping?.unresolvedCount && options.allowUnresolvedIds !== true) throw new Error('Review unresolved identifiers before analysis. They remain unannotated in the eligible background.');
  const rows = identifierMapping ? applyGeneMapping(table, identifierMapping) : table.rows;
  const selected = selectExperimentHits({ ...table, rows }, options.thresholds);
  // Eligibility precedes every p/effect cutoff. Missing padj can mean a gene
  // was untestable or independently filtered and could never enter this set.
  const background = rows.filter(({ padj, log2FoldChange }) => padj !== null && log2FoldChange !== null).map(({ gene }) => gene);
  if (!background.length) throw new Error('No genes have both a fold change and an adjusted p-value. Supply complete tested-gene results for enrichment.');
  const pathways = enrichPathways(background, selected.map(({ gene }) => gene), reference.pathways);
  const annotated = new Set(reference.pathways.flatMap(({ genes }) => genes));
  return { table, rows, identifierMapping, comparison: options.comparison.trim(), thresholds: { ...options.thresholds }, reference, selected, backgroundGenes: background,
    mappedGenesCount: background.filter((gene) => annotated.has(gene)).length, pathways, createdAt: new Date().toISOString(),
    backgroundDeclaration: 'full_tested_table_supplied' };
}

/** A log-space value avoids displaying an underflow as a mathematically zero p-value. */
export function formatProbability(value: number, logValue?: number): string {
  if (!Number.isFinite(value) || value < 0 || value > 1) return 'Not recorded';
  if (value === 0) {
    if (logValue !== undefined && Number.isFinite(logValue) && logValue < 0) {
      const exponent = Math.floor(logValue / Math.LN10);
      return `${Math.exp(logValue - exponent * Math.LN10).toFixed(2)}e${exponent}`;
    }
    return '0 (reported)';
  }
  return value < 0.001 ? value.toExponential(2) : Number(value.toPrecision(3)).toString();
}

/** Rule-based proposals grounded in measured input and reference membership, never new graph claims. */
export function buildExperimentQuestions(snapshot: Snapshot, analysis: ExperimentAnalysis, pathwayId: string): ExperimentQuestion[] {
  const result = analysis.pathways.find(({ id }) => id === pathwayId);
  if (!result || !result.overlapGenes.length) return [];
  const selected = new Map(analysis.selected.map((row) => [row.gene, row]));
  const row = result.overlapGenes.map((gene) => selected.get(gene)!)
    .sort((left, right) => Math.abs(right.log2FoldChange!) - Math.abs(left.log2FoldChange!) || left.gene.localeCompare(right.gene))[0];
  const question: ExperimentQuestion = {
    id: `perturbation-${result.id}-${row.gene}`,
    question: `Does altering ${row.gene} change a readout of ${result.name} in your experimental model?`,
    premise: `${row.gene}: log₂ fold change ${row.log2FoldChange}, gene FDR ${formatProbability(row.padj!)} in ${analysis.comparison}. It is an exact member of this reference pathway. Pathway FDR: ${formatProbability(result.adjustedPValue, result.logAdjustedPValue)}.`,
    assumptions: ['The uploaded contrast and full tested-gene background are appropriate. Gene symbols match by exact spelling; identity and species were declared, not independently verified.',
      'A suitable model and pathway readout must be chosen. RNA differential expression and membership overrepresentation do not establish pathway activation or a causal role for this gene.',
      'This is a rule-based question for investigation; novelty and experimental feasibility have not been assessed.'],
    suggestedTest: `Choose a readout from the linked pathway record, test a controlled perturbation of ${row.gene} in the model used for ${analysis.comparison}, and compare with matched controls. Validate the transcript result in independent samples.`,
    sources: [{ title: result.name, url: result.url }], claimIds: [],
  };
  const questions = [question];
  const note = snapshot.conflicts.find(({ id }) => id === 'conflict-r47h-binding-context');
  if (note && selected.has('APOE') && selected.has('TREM2') && result.overlapGenes.some((gene) => gene === 'APOE' || gene === 'TREM2')) {
    const sourceIds = new Set(note.claim_ids.flatMap((id) => getClaimEvidence(snapshot, id).map(({ source_id }) => source_id)));
    questions.push({ id: 'transcripts-to-apoe-trem2-binding',
      question: 'Do the APOE and TREM2 transcript changes correspond to changes in protein abundance or binding?',
      premise: ['APOE', 'TREM2'].map((gene) => { const item = selected.get(gene)!; return `${gene}: log₂ fold change ${item.log2FoldChange}, gene FDR ${formatProbability(item.padj!)}.`; }).join(' ') + ` Literature context: ${note.comparison}`,
      assumptions: ['The input contains RNA-level results, not protein abundance, lipidation, isoform or binding measurements.',
        'The cited wild-type/R47H binding studies are methodological context; they do not establish that this experiment involves R47H or that RNA changes reproduce their results.',
        'The experimental model, genotype and sample composition need to be checked. This proposal is not a novel or validated mechanism.'],
      suggestedTest: 'Measure the corresponding proteins in matched samples. If binding is the question, choose and record a defined protein preparation, genotype, controls and readout; compare with the methods and limits of the two cited assays.',
      sources: snapshot.sources.filter(({ id }) => sourceIds.has(id)).map(({ title, url }) => ({ title, url })), claimIds: [...note.claim_ids] });
  }
  return questions;
}
