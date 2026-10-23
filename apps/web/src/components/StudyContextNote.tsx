import { useId } from 'react';
import type { Conflict, Snapshot } from '../lib/types.ts';
import { Icon } from './ui.tsx';

/** A curated comparison of named findings, separate from automatic field labels. */
export function StudyContextNote({ snapshot, note }: { snapshot: Snapshot; note: Conflict }) {
  const titleId = useId();
  const sourceIds = new Set(note.evidence_ids.map((id) => snapshot.evidence.find((item) => item.id === id)!.source_id));
  const sources = snapshot.sources.filter(({ id }) => sourceIds.has(id));
  const draft = note.review.status !== 'approved' || note.review.human_reviewed !== true;
  return (
    <section className="study-context-note" aria-labelledby={titleId} data-note-id={note.id}>
      <h3 id={titleId}>{note.label}{draft && <span className="draft-label">Draft</span>}</h3>
      <p>{note.comparison}</p>
      <div className="context-note-sources" aria-label="Compared original studies">
        {sources.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer">
          {source.authors[0]?.split(' ').at(-1) ?? source.provider ?? 'Source'}{source.authors.length > 1 ? ' et al.' : ''}{source.year ? ` · ${source.year}` : ''}<Icon name="external" size={13} />
        </a>)}
      </div>
      <details>
        <summary>What differs</summary>
        <ul>{note.context_differences.map((difference) => <li key={difference}>{difference}</li>)}</ul>
        <p className="context-note-review">Source check · {note.review.date ?? 'Date not recorded'}<br />{note.review.reviewer ?? 'Reviewer not recorded'}</p>
        <p className="context-note-review">{note.review.rationale}</p>
      </details>
    </section>
  );
}
