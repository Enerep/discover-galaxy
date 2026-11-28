import { APOE_MAP_COMPARISON } from '../../../../data/map-comparisons.ts';
import type { MapComparisonGroup } from '../../../../data/map-comparisons.ts';
import type { CollectionId } from '../../../../data/collections.ts';
import { buildFindingBrief } from './compare-evidence.ts';
import { getClaimEvidence } from './dataset.ts';
import { sourceCitation } from './source-format.ts';
import type { ContextValue } from './compare-evidence.ts';
import type { Snapshot } from './types.ts';

function requireRecord(condition: unknown, detail: string): asserts condition {
  if (!condition) throw new Error(`Map comparison: ${detail}`);
}

function positiveCount(value: ContextValue | undefined): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

function carrierCount(value: number, size: number): boolean {
  return Number.isSafeInteger(value) && value >= 0 && value <= size;
}

export function buildMapComparison(snapshots: Record<CollectionId, Snapshot>, definition = APOE_MAP_COMPARISON) {
  const { version, title, geneId, ncbiGeneId, sourceId, pmid, doi, groups, controlCarriers, interpretation, review } = definition;
  requireRecord(groups[0].collection !== groups[1].collection, 'choose two distinct disease maps.');
  const cohorts = groups.map((group) => {
    const snapshot = snapshots[group.collection];
    requireRecord(snapshot, `unknown map ${group.collection}.`);
    const gene = snapshot.entities.find(({ id }) => id === geneId);
    requireRecord(gene?.type === 'gene' && gene.taxonomy_id === 9606
      && gene.external_ids.some(({ namespace, value }) => namespace === 'NCBIGene' && value === ncbiGeneId),
    `the shared human gene identity is missing from ${group.collection}.`);
    const claim = snapshot.claims.find(({ id }) => id === group.claimId);
    const disease = snapshot.entities.find(({ id }) => id === group.diseaseId);
    requireRecord(claim?.subject_id === geneId && claim.object_id === disease?.id && disease?.type === 'disease'
      && claim.predicate === 'associated_with', `finding ${group.claimId} has unexpected endpoints.`);
    const evidence = getClaimEvidence(snapshot, claim.id).find((item) => item.source_id === sourceId && item.relation === 'supports');
    const source = snapshot.sources.find(({ id }) => id === sourceId);
    requireRecord(evidence && source?.kind === 'publication' && source.publication_type === 'primary_research'
      && source.publication_status.status !== 'retracted'
      && source.identifiers.some(({ namespace, value }) => namespace === 'PMID' && value === pmid)
      && source.identifiers.some(({ namespace, value }) => namespace === 'DOI' && value === doi),
    `finding ${group.claimId} needs the original study record.`);
    const context = evidence.study_context;
    requireRecord(context.taxonomy_id === 9606 && context.variant === 'APOE ε4 carrier status',
      `finding ${group.claimId} needs the human APOE ε4 carrier contrast.`);
    requireRecord(positiveCount(context.case_count) && carrierCount(group.carriers, context.case_count),
      `invalid case or carrier counts for ${group.tableLabel}.`);
    requireRecord([group.lower, group.estimate, group.upper].every((value) => Number.isFinite(value) && value > 0)
      && group.lower <= group.estimate && group.estimate <= group.upper, `invalid odds ratio or interval for ${group.tableLabel}.`);
    requireRecord(typeof context.pathology_definition === 'string' && context.pathology_definition.trim(),
      `missing case definition for ${group.tableLabel}.`);
    return {
      ...group, snapshot, claim, evidence, source,
      name: disease.label.replaceAll("'", '’'), count: context.case_count, definition: context.pathology_definition,
    };
  });
  const [left, right] = cohorts;
  const context = left.evidence.study_context;
  const otherContext = right.evidence.study_context;
  requireRecord(positiveCount(context.control_count) && carrierCount(controlCarriers, context.control_count),
    'invalid shared control counts.');
  requireRecord(context.control_count === otherContext.control_count, 'control counts differ between findings.');
  const sharedContext = (field: 'analysis_model' | 'control_selection' | 'population') => {
    const value = context[field];
    requireRecord(typeof value === 'string' && value.trim() && value === otherContext[field], `shared ${field} differs or is missing.`);
    return value;
  };
  return {
    version, title, geneId, cohorts, source: left.source, review, interpretation,
    controls: { count: context.control_count, carriers: controlCarriers, definition: sharedContext('control_selection') },
    model: sharedContext('analysis_model'), population: sharedContext('population'),
  };
}

export type MapComparison = ReturnType<typeof buildMapComparison>;
export type MapComparisonCohort = MapComparison['cohorts'][number];

export function formatOddsRatio({ estimate, lower, upper }: Pick<MapComparisonGroup, 'estimate' | 'lower' | 'upper'>): string {
  return `${estimate} (${lower}–${upper})`;
}

export function buildMapComparisonBrief(comparison: MapComparison): string {
  const { source, controls, review } = comparison;
  return [
    `# Discovery Galaxy — ${comparison.title}`, '',
    `Comparison ${comparison.version} · Source-checked draft`, '',
    `[${sourceCitation(source)} · Original paper](${source.url})`, '',
    `${controls.count} shared autopsied controls, including ${controls.carriers} APOE ε4 carriers.`, '',
    controls.definition, '', comparison.population, '', comparison.model, '', comparison.interpretation, '',
    '| Study group | Cases | ε4 carriers | Adjusted OR (95% CI) |',
    '| --- | ---: | ---: | --- |',
    ...comparison.cohorts.map((cohort) => `| ${cohort.label} (${cohort.tableLabel}) | ${cohort.count} | ${cohort.carriers} | ${formatOddsRatio(cohort)} |`),
    '', 'Carrier counts are summed from Table 2 genotypes. Adjusted odds ratios and intervals come from Table 3.', '',
    `Comparison source check by ${review.reviewer} on ${review.date}. ${review.rationale}`, '',
    '## Dataset versions', '',
    ...comparison.cohorts.map((cohort) => `- ${cohort.name} · ${cohort.snapshot.dataset_version}`), '',
    ...comparison.cohorts.flatMap((cohort) => [buildFindingBrief(cohort.snapshot, cohort.claim.id), '']),
  ].join('\n');
}
