import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { buildComparisonBrief, buildEvidenceComparison } from '../lib/compare-evidence.ts';
import type { ComparisonColumn, ComparisonContextCell, ContextValue } from '../lib/compare-evidence.ts';
import type { Claim, Snapshot, Source } from '../lib/types.ts';
import { Icon } from './ui.tsx';

interface Props {
  snapshot: Snapshot;
  claimIds: [string, string] | null;
  onChange: (side: 0 | 1, id: string) => void;
  onClose: () => void;
}

function display(value: ContextValue | undefined) {
  if (value === null || value === undefined || (typeof value === 'string' && !value.trim()) || (Array.isArray(value) && !value.length)) return 'Not recorded';
  return Array.isArray(value) ? value.join('; ') : typeof value === 'number' ? value.toLocaleString('en-US') : value;
}

function citation(source: Source) {
  const author = source.authors[0]?.split(' ').at(-1) ?? 'Source';
  return `${author}${source.authors.length > 1 ? ' et al.' : ''}${source.year ? ` · ${source.year}` : ''}`;
}

function findingLabel(snapshot: Snapshot, claim: Claim) {
  const subject = snapshot.entities.find(({ id }) => id === claim.subject_id);
  return String(claim.context.variant ?? `${subject?.label ?? claim.subject_id}: ${claim.predicate.replaceAll('_', ' ')}`);
}

function ContextValues({ cell, column }: { cell: ComparisonContextCell; column: ComparisonColumn }) {
  return (
    <div className="comparison-values">
      {display(cell.claimValue) !== 'Not recorded' && cell.studies.some(({ value }) => JSON.stringify(value) !== JSON.stringify(cell.claimValue)) && (
        <div className="comparison-entry"><strong>Claim scope</strong><p>{display(cell.claimValue)}</p></div>
      )}
      {cell.studies.map((study) => {
        const source = column.sources.find(({ id }) => id === study.sourceId);
        return <div className="comparison-entry" key={study.evidenceId}><strong>{source ? citation(source) : 'Study'}</strong><p>{display(study.value)}</p></div>;
      })}
    </div>
  );
}

function FindingCard({ column }: { column: ComparisonColumn }) {
  const { claim, subject, evidence, limitations } = column;
  const draft = claim.review.status !== 'approved' || claim.review.human_reviewed !== true
    || evidence.some(({ evidence: item }) => item.review.status !== 'approved' || item.review.human_reviewed !== true);
  return (
    <section className="comparison-finding" aria-label={`${subject.label} finding`}>
      <h3>{subject.label}{draft && <span className="draft-label">Draft</span>}</h3>
      <p>{claim.statement}</p>
      <ul className="comparison-sources">
        {column.sources.map((source) => <li key={source.id}><a href={source.url} target="_blank" rel="noreferrer">{source.title}<Icon name="external" size={13} /></a></li>)}
      </ul>
      <details className="comparison-provenance">
        <summary>Scope, limitations, and review</summary>
        <dl className="context-list">
          {Object.entries(claim.context).map(([key, value]) => <div key={key}><dt>{key.replaceAll('_', ' ')}</dt><dd>{display(value)}</dd></div>)}
          <div><dt>Scientific review</dt><dd>{claim.review.status === 'approved' && claim.review.human_reviewed ? 'Human review recorded' : 'Human review pending'}</dd></div>
          <div><dt>Reviewer / date</dt><dd>{claim.review.reviewer ?? 'Not recorded'} / {claim.review.date ?? 'Not recorded'}</dd></div>
        </dl>
        {evidence.map(({ evidence: item, source }) => <section key={item.id}>
          <h4>{citation(source)}</h4>
          <p>{item.finding}</p>
          <p>Source location: {item.locator}</p>
          <p>{item.review.status === 'approved' && item.review.human_reviewed ? 'Evidence review recorded.' : 'Evidence review pending.'} {source.reuse.permission_status === 'permitted' ? 'Reuse permitted.' : 'Reuse assessment pending.'}</p>
          <p>{source.publication_status.status === 'not_checked' ? 'Correction/retraction check pending.'
            : source.publication_status.status === 'retracted' ? 'Retraction recorded.'
              : source.publication_status.status === 'corrected' ? 'Correction recorded.' : `No notice found at the recorded check (${source.publication_status.checked_at ?? 'date not recorded'}).`}</p>
        </section>)}
        <ul>{limitations.map((item) => <li key={item}>{item}</li>)}</ul>
      </details>
    </section>
  );
}

export function EvidenceComparison({ snapshot, claimIds, onChange, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [downloadUrl, setDownloadUrl] = useState('');
  const result = useMemo(() => {
    if (!claimIds) return { comparison: null, error: '' };
    try { return { comparison: buildEvidenceComparison(snapshot, ...claimIds), error: '' }; }
    catch (cause) { return { comparison: null, error: cause instanceof Error ? cause.message : 'Unable to compare these findings.' }; }
  }, [snapshot, claimIds]);
  const comparison = result.comparison;

  useEffect(() => {
    if (claimIds && !dialog.current?.open) dialog.current?.showModal();
    else if (!claimIds && dialog.current?.open) dialog.current.close();
  }, [claimIds]);

  useEffect(() => {
    if (!comparison) { setDownloadUrl(''); return; }
    const markdown = buildComparisonBrief(snapshot, comparison.columns[0].claim.id, comparison.columns[1].claim.id);
    const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }));
    setDownloadUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [snapshot, comparison]);

  return (
    <dialog className="data-dialog comparison-dialog" ref={dialog} aria-labelledby={titleId} aria-describedby={descriptionId} onClose={onClose}>
      <button className="icon-button dialog-close" aria-label="Close comparison" onClick={onClose}><Icon name="close" /></button>
      <h2 id={titleId}>Compare findings</h2>
      <p id={descriptionId}>Check what was studied, where the context differs, and what the source records leave unanswered.</p>
      {result.error && <p role="alert">{result.error}</p>}
      {comparison && claimIds && <>
        <div className="comparison-selectors">
          {(['Finding A', 'Finding B'] as const).map((label, side) => <label key={label}>
            <span>{label}</span>
            <select aria-label={label} value={claimIds[side]} onChange={(event) => onChange(side as 0 | 1, event.target.value)}>
              {snapshot.claims.map((claim) => <option key={claim.id} value={claim.id} disabled={claim.id === claimIds[1 - side]}>{findingLabel(snapshot, claim)}</option>)}
            </select>
          </label>)}
        </div>
        <p className="comparison-summary">{comparison.scopeStatus === 'different recorded scope' ? 'The recorded study contexts differ.'
          : comparison.scopeStatus === 'insufficient context' ? 'The recorded study context is incomplete.'
            : 'Recorded fields match; check the source methods before treating the studies as comparable.'} These labels do not establish agreement or contradiction.</p>
        <div className="comparison-findings">{comparison.columns.map((column) => <FindingCard key={column.claim.id} column={column} />)}</div>
        <h3>Study context</h3>
        <p>Source values and claim scope stay separate; participant counts are not combined.</p>
        <div className="comparison-table-wrap" tabIndex={0} role="region" aria-label="Study context comparison">
          <table className="comparison-table">
            <caption className="sr-only">Source-specific study context for the two selected findings</caption>
            <thead><tr><th scope="col">Recorded field</th><th scope="col">Finding A</th><th scope="col">Finding B</th></tr></thead>
            <tbody>{comparison.contextRows.map((row) => <tr key={row.key}>
              <th scope="row">{row.label}<span className="context-status" data-state={row.status}>{row.status === 'matching' ? 'Same recorded value' : row.status === 'different' ? 'Different' : 'Missing context'}</span></th>
              <td><ContextValues cell={row.left} column={comparison.columns[0]} /></td>
              <td><ContextValues cell={row.right} column={comparison.columns[1]} /></td>
            </tr>)}</tbody>
          </table>
        </div>
        <p className="comparison-source-note">{comparison.sharedSources.length
          ? 'A source record or publication identifier is shared. Repeated references are not separate observations.'
          : 'No shared publication identifier is recorded. Participant overlap and study independence have not been checked.'}</p>
        <details className="comparison-prompts"><summary>Questions to check in the sources</summary>
          <ul>{comparison.prompts.map((prompt) => <li key={prompt}>{prompt}</li>)}</ul>
          <p>These are reading prompts from the recorded context, not verified research gaps or new hypotheses.</p>
        </details>
        <div className="comparison-actions">{downloadUrl && <a className="primary-button" href={downloadUrl} download="discovery-galaxy-comparison.md"><Icon name="download" size={17} />Download comparison</a>}
          <p>Includes full context, limitations, citations, and dataset {snapshot.dataset_version}.</p>
        </div>
      </>}
    </dialog>
  );
}
