import { enrichPathways } from './enrichment.ts';
import type { EnrichmentResult, PathwayGeneSet } from './enrichment.ts';
import { selectExperimentHits } from './experiment.ts';
import type { ExperimentRow, ExperimentThresholds } from './experiment.ts';

/** A snapshot of an already applied analysis. Original identifiers stay upstream. */
export interface RobustnessInput {
  rows: ExperimentRow[];
  backgroundGenes: string[];
  pathways: PathwayGeneSet[];
  thresholds: ExperimentThresholds;
  baseline: EnrichmentResult[];
}
export interface SensitivitySetting {
  thresholds: ExperimentThresholds;
  applied: boolean;
  selectedCount: number;
  pathwayCount: number;
  significantCount: number;
  results: { id: string; adjustedPValue: number; logAdjustedPValue: number; overlapSize: number }[];
}
export interface ThresholdSensitivity {
  geneFdrValues: number[];
  foldChangeValues: number[];
  backgroundSize: number;
  pathwayFdrMax: 0.05;
  settings: SensitivitySetting[];
}
export interface PathwayGroupMember {
  id: string;
  jaccard: number;
  sharedCount: number;
  eligibleSize: number;
}
export interface PathwayGroup {
  representativeId: string;
  members: PathwayGroupMember[];
}
export interface PathwayGrouping {
  minJaccard: 0.5;
  backgroundSize: number;
  pathwayCount: number;
  groups: PathwayGroup[];
}

function adjacent(value: number): number {
  // Remove subtraction artifacts for ordinary cutoffs, preserving the exact
  // applied value separately and avoiding rounding overflow at extreme inputs.
  return Math.abs(value) < 1e12 ? Number(value.toPrecision(15)) : value;
}
const axis = (values: number[]) => [...new Set(values)].sort((a, b) => a - b);

/** Descriptive cutoff comparisons, with the same N/K and full BH family in every cell. */
export function analyzeThresholdSensitivity(input: RobustnessInput): ThresholdSensitivity {
  selectExperimentHits({ rows: input.rows }, input.thresholds); // Validate the applied cutoffs.
  const geneFdrValues = axis([adjacent(input.thresholds.adjustedPMax / 2), input.thresholds.adjustedPMax, adjacent(Math.min(1, input.thresholds.adjustedPMax * 2))]);
  const foldChangeValues = axis([adjacent(Math.max(0, input.thresholds.minAbsLog2FoldChange - 0.5)), input.thresholds.minAbsLog2FoldChange, adjacent(input.thresholds.minAbsLog2FoldChange + 0.5)]);
  const family = new Set(input.baseline.map(({ id }) => id));
  const settings = geneFdrValues.flatMap((adjustedPMax) => foldChangeValues.map((minAbsLog2FoldChange) => {
    const thresholds = { adjustedPMax, minAbsLog2FoldChange };
    const applied = adjustedPMax === input.thresholds.adjustedPMax && minAbsLog2FoldChange === input.thresholds.minAbsLog2FoldChange;
    const selected = selectExperimentHits({ rows: input.rows }, thresholds);
    const results = applied ? input.baseline : enrichPathways(input.backgroundGenes, selected.map(({ gene }) => gene), input.pathways);
    if (results.length !== family.size || results.some(({ id }) => !family.has(id))) throw new Error('The tested pathway family changed across cutoffs.');
    return { thresholds, applied, selectedCount: selected.length, pathwayCount: results.length,
      significantCount: results.filter(({ adjustedPValue }) => adjustedPValue <= 0.05).length,
      results: results.map(({ id, adjustedPValue, logAdjustedPValue, overlapSize }) => ({ id, adjustedPValue, logAdjustedPValue, overlapSize })) };
  }));
  return { geneFdrValues, foldChangeValues, backgroundSize: input.backgroundGenes.length, pathwayFdrMax: 0.05, settings };
}

/** Greedy representative groups, never transitive clusters or combined significance tests. */
export function groupOverlappingPathways(input: Pick<RobustnessInput, 'backgroundGenes' | 'pathways' | 'baseline'>): PathwayGrouping {
  const background = new Set(input.backgroundGenes);
  const family = new Set(input.baseline.map(({ id }) => id));
  const profiles = new Map(input.pathways.filter(({ id }) => family.has(id)).map(({ id, genes }) => [id, new Set(genes.filter((gene) => background.has(gene)))]));
  const ranked = [...input.baseline].sort((a, b) => a.logAdjustedPValue - b.logAdjustedPValue || a.logPValue - b.logPValue || a.id.localeCompare(b.id, 'en-US'));
  const groups: PathwayGroup[] = [];
  const representatives: Set<string>[] = [];
  const byGene = new Map<string, number[]>();
  for (const row of ranked) {
    const members = profiles.get(row.id);
    if (!members?.size) throw new Error('A tested pathway has no eligible reference members.');
    const candidates = new Set<number>();
    for (const gene of members) for (const index of byGene.get(gene) ?? []) candidates.add(index);
    let best = -1;
    let bestShared = 0;
    let bestJaccard = 0;
    for (const index of candidates) {
      const reference = representatives[index];
      if (Math.min(reference.size, members.size) / Math.max(reference.size, members.size) < 0.5) continue;
      const small = reference.size < members.size ? reference : members;
      const large = small === reference ? members : reference;
      let shared = 0;
      for (const gene of small) if (large.has(gene)) shared += 1;
      const union = reference.size + members.size - shared;
      if (2 * shared < union) continue;
      const jaccard = shared / union;
      if (jaccard > bestJaccard || (jaccard === bestJaccard && index < best)) {
        best = index; bestShared = shared; bestJaccard = jaccard;
      }
    }
    if (best >= 0) {
      groups[best].members.push({ id: row.id, jaccard: bestJaccard, sharedCount: bestShared, eligibleSize: members.size });
    } else {
      const index = groups.length;
      groups.push({ representativeId: row.id, members: [{ id: row.id, jaccard: 1, sharedCount: members.size, eligibleSize: members.size }] });
      representatives.push(members);
      for (const gene of members) {
        const indices = byGene.get(gene) ?? [];
        indices.push(index); byGene.set(gene, indices);
      }
    }
  }
  return { minJaccard: 0.5, backgroundSize: background.size, pathwayCount: ranked.length, groups };
}

export type RobustnessKind = 'sensitivity' | 'grouping';
export type RobustnessRequest = { kind: RobustnessKind; input: RobustnessInput };
export type RobustnessReply = { kind: 'sensitivity'; result: ThresholdSensitivity } | { kind: 'grouping'; result: PathwayGrouping } | { kind: RobustnessKind; error: string };
