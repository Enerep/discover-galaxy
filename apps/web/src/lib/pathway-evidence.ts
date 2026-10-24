import type { ExperimentAnalysis } from './experiment-analysis.ts';
import type { Claim, Conflict, Evidence, Snapshot, Source } from './types.ts';

export interface GeneEvidenceCoverage {
  gene: string;
  entityId: string | null;
  paperIds: string[];
  databaseClaimIds: string[];
}

export interface PathwayPaperFinding {
  claim: Claim;
  evidence: Evidence[];
  genes: string[];
}

export interface PathwayEvidenceReport {
  genes: GeneEvidenceCoverage[];
  papers: { source: Source; findings: PathwayPaperFinding[] }[];
  contextNotes: Conflict[];
}

/** Library coverage, not a literature search or evidence that an enriched pathway is active.
 * Match selected pathway members exactly, then follow only cited gene → protein mappings.
 * Do not traverse interactions, borrow a neighbour's findings, or reinterpret RNA as protein data.
 */
export function buildPathwayEvidence(snapshot: Snapshot, analysis: ExperimentAnalysis, pathwayId: string): PathwayEvidenceReport {
  const pathway = analysis.pathways.find(({ id }) => id === pathwayId);
  if (!pathway) return { genes: [], papers: [], contextNotes: [] };
  const selected = new Set(analysis.selected.map(({ gene }) => gene));
  const symbols = pathway.overlapGenes.filter((gene) => selected.has(gene)).slice().sort((a, b) => a.localeCompare(b, 'en-US'));
  const entities = new Map(snapshot.entities.map((entity) => [entity.id, entity]));
  const geneEntities = new Map(snapshot.entities.filter(({ type }) => type === 'gene').map((entity) => [entity.label, entity]));
  const sources = new Map(snapshot.sources.map((source) => [source.id, source]));
  const evidenceByClaim = new Map(snapshot.claims.map((claim) => [claim.id,
    snapshot.evidence.filter((item) => item.claim_id === claim.id && claim.evidence_ids.includes(item.id))]));
  const papers = new Map<string, { source: Source; findings: Map<string, PathwayPaperFinding> }>();
  const genes = symbols.map((gene): GeneEvidenceCoverage => {
    const entity = geneEntities.get(gene);
    if (!entity) return { gene, entityId: null, paperIds: [], databaseClaimIds: [] };
    const relatedIds = new Set([entity.id]);
    for (const claim of snapshot.claims) {
      if (claim.predicate === 'encodes' && claim.subject_id === entity.id && entities.get(claim.object_id)?.type === 'protein'
        && evidenceByClaim.get(claim.id)?.some(({ relation }) => relation === 'supports')) relatedIds.add(claim.object_id);
    }
    const paperIds = new Set<string>();
    const databaseClaimIds = new Set<string>();
    for (const claim of snapshot.claims) {
      if (!relatedIds.has(claim.subject_id) && !relatedIds.has(claim.object_id)) continue;
      for (const item of evidenceByClaim.get(claim.id) ?? []) {
        const source = sources.get(item.source_id);
        if (!source) continue;
        if (source.kind === 'database_record') { databaseClaimIds.add(claim.id); continue; }
        paperIds.add(source.id);
        let paper = papers.get(source.id);
        if (!paper) { paper = { source, findings: new Map() }; papers.set(source.id, paper); }
        let finding = paper.findings.get(claim.id);
        if (!finding) { finding = { claim, evidence: [], genes: [] }; paper.findings.set(claim.id, finding); }
        if (!finding.evidence.some(({ id }) => id === item.id)) finding.evidence.push(item);
        if (!finding.genes.includes(gene)) finding.genes.push(gene);
      }
    }
    return { gene, entityId: entity.id, paperIds: [...paperIds], databaseClaimIds: [...databaseClaimIds] };
  });
  const results = [...papers.values()].map(({ source, findings }) => ({ source, findings: [...findings.values()] }))
    .sort((a, b) => (b.source.year ?? 0) - (a.source.year ?? 0) || a.source.id.localeCompare(b.source.id, 'en-US'));
  const claimIds = new Set(results.flatMap(({ findings }) => findings.map(({ claim }) => claim.id)));
  const evidenceIds = new Set(results.flatMap(({ findings }) => findings.flatMap(({ evidence }) => evidence.map(({ id }) => id))));
  return { genes, papers: results, contextNotes: snapshot.conflicts.filter((note) =>
    note.claim_ids.every((id) => claimIds.has(id)) && note.evidence_ids.every((id) => evidenceIds.has(id))) };
}

export function coverageLabel(gene: GeneEvidenceCoverage): string {
  if (gene.paperIds.length) return `${gene.paperIds.length} paper${gene.paperIds.length === 1 ? '' : 's'}`;
  if (gene.databaseClaimIds.length) return 'Database records only';
  return gene.entityId ? 'No linked findings' : 'Outside library';
}
