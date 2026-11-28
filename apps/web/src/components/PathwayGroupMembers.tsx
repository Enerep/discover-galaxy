import type { EnrichmentResult } from '../lib/enrichment.ts';
import type { PathwayGroup } from '../lib/experiment-robustness.ts';
import { formatProbability } from '../lib/experiment-analysis.ts';
import { Icon } from './ui.tsx';

export function PathwayGroupMembers({ group, lookup, selectedId, searching, onChoose }: {
  group: PathwayGroup;
  lookup: ReadonlyMap<string, EnrichmentResult>;
  selectedId: string | undefined;
  searching: boolean;
  onChoose: (id: string, trigger: HTMLButtonElement) => void;
}) {
  const others = group.members.filter(({ id }) => id !== group.representativeId);
  if (!others.length) return null;
  return <details className="experiment-overlap-members" open={searching ? true : undefined}>
    <summary>{others.length} {searching ? 'matching' : 'overlapping'} {others.length === 1 ? 'pathway' : 'pathways'}</summary>
    <ul>{others.map((member) => {
      const related = lookup.get(member.id)!;
      return <li key={member.id}>
        <button className="experiment-pathway-choice" type="button" aria-pressed={member.id === selectedId} aria-controls="experiment-pathway-detail"
          onClick={(event) => onChoose(member.id, event.currentTarget)}>{related.name}<Icon name="arrow" size={14} /></button>
        <span>Pathway FDR {formatProbability(related.adjustedPValue, related.logAdjustedPValue)} · Jaccard {Number(member.jaccard.toPrecision(3))} · {member.sharedCount} shared genes</span>
      </li>;
    })}</ul>
  </details>;
}
