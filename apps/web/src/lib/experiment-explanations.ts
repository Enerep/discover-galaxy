import sourceCatalog from '../../../../data/interpretation/apoe-bulk-rna-sources.json' with { type: 'json' };
import type { ExperimentAnalysis } from './experiment-analysis.ts';
import type { ExperimentContext } from './experiment-context.ts';
import type { ExperimentThresholds } from './experiment.ts';

export interface ApoeExplanationComparison {
  id: 'apoe-bulk-brain-rna';
  comparison: string;
  isSynthetic: boolean;
  observation: { gene: 'APOE'; sourceId?: string; log2FoldChange: number; padj: number };
  context: ExperimentContext;
  thresholds: ExperimentThresholds;
  referenceId: string;
  pathway: { id: string; name: string; url: string; overlapSize: number; pathwayMeasuredSize: number; adjustedPValue: number; logAdjustedPValue: number };
  explanations: { id: string; title: string; description: string; sourceIds: string[]; assumptions: string[] }[];
  suggestedTest: { title: string; steps: string[]; limitations: string[] };
  limitations: string[];
  sources: typeof sourceCatalog.sources;
}

/** One explicit interpretation pilot; no inference of sample type, scores or graph claims. */
export function buildApoeExplanationComparison(analysis: ExperimentAnalysis, pathwayId: string): ApoeExplanationComparison | null {
  if (analysis.context.sampleType !== 'bulk_brain_tissue' || analysis.context.design !== 'observational') return null;
  const pathway = analysis.pathways.find(({ id }) => id === pathwayId);
  if (!pathway?.overlapGenes.includes('APOE')) return null;
  const row = analysis.selected.find(({ gene }) => gene === 'APOE');
  if (!row || row.log2FoldChange === null || !Number.isFinite(row.log2FoldChange) || row.log2FoldChange === 0
    || row.padj === null || !Number.isFinite(row.padj) || row.padj < 0 || row.padj > 1) return null;
  return {
    id: 'apoe-bulk-brain-rna', comparison: analysis.comparison, isSynthetic: analysis.table.isSynthetic === true,
    observation: { gene: 'APOE', ...(row.sourceId ? { sourceId: row.sourceId } : {}), log2FoldChange: row.log2FoldChange, padj: row.padj },
    context: { ...analysis.context }, thresholds: { ...analysis.thresholds }, referenceId: analysis.reference.reference_id,
    pathway: { id: pathway.id, name: pathway.name, url: pathway.url, overlapSize: pathway.overlapSize,
      pathwayMeasuredSize: pathway.pathwayMeasuredSize, adjustedPValue: pathway.adjustedPValue, logAdjustedPValue: pathway.logAdjustedPValue },
    explanations: [
      { id: 'cell-composition', title: 'Different proportions of cell types',
        description: 'A different mixture of cell types could change bulk APOE RNA even if expression within each cell type stayed the same.',
        sourceIds: ['mathys-2019', 'murphy-2023'],
        assumptions: ['The tissue contains multiple cell types with different APOE RNA contributions. This table does not measure their proportions.',
          'Cell counts and RNA contribution per cell are different quantities; more captured nuclei do not by themselves establish more cells in the tissue.'] },
      { id: 'within-cell-type', title: 'Different APOE expression within cell types',
        description: 'APOE RNA could differ within one or more cell types even if tissue cell proportions stayed the same.',
        sourceIds: ['mathys-2019', 'murphy-2023'],
        assumptions: ['Cell-type identities and relevant donor-level covariates can be assessed in a suitable follow-up.',
          'The cited cell-type findings depend on analysis choices; a reanalysis of the same cohort questions their robustness.'] },
    ],
    suggestedTest: { title: 'Measure both in matched samples', steps: [
      'Measure tissue cell proportions with an independent method, such as validated cell-type markers and quantitative histology; record sampling and marker limitations.',
      'Measure APOE RNA within identified cell types, for example using single-nucleus RNA-seq or cell-type-resolved RNA imaging from matched donors and brain regions.',
      'Compare within-cell-type RNA at the donor level and assess the contribution of composition, using appropriate quality controls and recorded study covariates. Check the result in independent donors.',
    ], limitations: ['Nuclei from one donor are not independent biological replicates. Nucleus capture fractions can be biased and are not direct tissue cell proportions.',
      'Nuclear APOE RNA can differ from whole-cell or bulk RNA because of compartment and capture effects; a single-nucleus assay is not a direct reproduction of the original measurement.',
      'These measurements can help separate contributions; they do not alone establish causality, protein abundance, pathway activity or a validated mechanism.'] },
    limitations: ['Both contributions may occur together. Technical effects, RNA contribution per cell and other covariates may also contribute; this table cannot choose a winning explanation.',
      'These human postmortem brain studies provide interpretation context, not validation of this experiment. The original study and its reanalysis use the same cohort and are not independent replication.',
      'Sample type and study design are researcher-supplied. No disease status, brain region, genotype or causal effect is inferred from the comparison label.',
      'This is a source-checked draft proposal. Novelty and experimental feasibility have not been assessed.'],
    sources: sourceCatalog.sources,
  };
}
