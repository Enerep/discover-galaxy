import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { Snapshot } from '../lib/types.ts';
import { getClaimEvidence } from '../lib/dataset.ts';
import { findingLabel, sourceCitation } from '../lib/source-format.ts';
import { BRIEF_FIELD_LIMITS, buildResearchBrief } from '../lib/research-brief.ts';
import type { BriefAction, BriefField, ResearchBrief as Brief } from '../lib/research-brief.ts';
import type { BriefSaveStatus } from '../lib/useResearchBrief.ts';
import { Icon } from './ui.tsx';
import { PublicationStatus } from './PublicationStatus.tsx';

interface Props {
  snapshot: Snapshot;
  brief: Brief;
  open: boolean;
  status: BriefSaveStatus;
  error: string;
  selectedClaimId: string | null;
  onClose: () => void;
  onChange: (action: BriefAction) => boolean;
  onSave: () => void;
  onViewFinding: (id: string) => void;
  onCompare: (pair: [string, string]) => void;
}
const NOTE_FIELDS: { key: Exclude<BriefField, 'question'>; label: string; rows: number }[] = [
  { key: 'explanation', label: 'Your explanation', rows: 5 },
  { key: 'assumptions', label: 'Your assumptions', rows: 4 },
  { key: 'experiment', label: 'Your proposed experiment', rows: 5 },
];

export function ResearchBrief({ snapshot, brief, open, status, error, selectedClaimId, onClose, onChange, onSave, onViewFinding, onCompare }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const question = useRef<HTMLTextAreaElement>(null);
  const pinSelected = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const [exportError, setExportError] = useState('');
  const outdated = brief.dataset_version !== snapshot.dataset_version;
  const pinned = brief.pinned_claim_ids.map((id) => snapshot.claims.find((claim) => claim.id === id));
  const available = pinned.filter((claim) => claim !== undefined);
  const pair = brief.comparison_claim_ids;

  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    else if (!open && dialog.current?.open) dialog.current.close();
  }, [open]);
  useEffect(() => { setExportError(''); }, [brief]);

  function download(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const markdown = buildResearchBrief(snapshot, brief);
      const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url; link.download = 'discovery-galaxy-research-brief.md';
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setExportError('');
    } catch (cause) {
      setExportError(cause instanceof Error ? cause.message : 'Unable to export the brief.');
      if (!brief.question.trim()) question.current?.focus();
      else if (!brief.pinned_claim_ids.length) pinSelected.current?.focus();
    }
  }

  return <dialog className="data-dialog brief-dialog" ref={dialog} aria-labelledby={titleId}
    onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <button className="icon-button dialog-close" aria-label="Close research brief" onClick={onClose}><Icon name="close" /></button>
    <h2 id={titleId}>Research brief</h2>
    <form onSubmit={download}>
      <label className="brief-question"><span>Research question</span>
        <textarea ref={question} required maxLength={BRIEF_FIELD_LIMITS.question} rows={2} value={brief.question}
          onChange={(event) => onChange({ type: 'edit', field: 'question', value: event.target.value })} />
      </label>
      {outdated && <div className="brief-notice" role="status">
        <p>Saved with {brief.dataset_version}. Pinned findings below use {snapshot.dataset_version}.</p>
        <button className="secondary-button" type="button" onClick={() => onChange({ type: 'refresh' })}>Refresh evidence</button>
      </div>}
      <div className="brief-columns">
        <section className="brief-notes" aria-label="Your reasoning">
          {NOTE_FIELDS.map(({ key, label, rows }) => <label key={key}><span>{label}</span>
            <textarea rows={rows} maxLength={BRIEF_FIELD_LIMITS[key]} value={brief[key]}
              onChange={(event) => onChange({ type: 'edit', field: key, value: event.target.value })} />
          </label>)}
        </section>
        <section className="brief-evidence" aria-label="Pinned findings">
          <div className="brief-section-heading"><h3>Pinned findings</h3>
            <button className="text-button" type="button" onClick={onClose}>Explore findings<Icon name="arrow" size={14} /></button>
          </div>
          {!brief.pinned_claim_ids.length && <div className="brief-empty">
            {selectedClaimId ? <>
              <p>{snapshot.claims.find(({ id }) => id === selectedClaimId)?.statement}</p>
              <button type="button" className="secondary-button" ref={pinSelected}
                onClick={() => onChange({ type: 'pin', claimIds: [selectedClaimId] })}><Icon name="pin" size={16} />Pin selected finding</button>
            </> : <p>No findings pinned.</p>}
          </div>}
          {brief.pinned_claim_ids.map((id, index) => {
            const claim = pinned[index];
            const evidence = claim ? getClaimEvidence(snapshot, id) : [];
            const sources = [...new Set(evidence.map(({ source_id }) => source_id))].map((id) => snapshot.sources.find((source) => source.id === id)!);
            return <article className="brief-finding" key={id} data-claim-id={id}>
              <div className="brief-section-heading"><h4>{claim ? findingLabel(snapshot, claim) : 'Unavailable finding'}</h4>
                <button className="icon-button" type="button" aria-label={`Unpin ${claim ? findingLabel(snapshot, claim) : id}`}
                  onClick={() => onChange({ type: 'unpin', claimId: id })}><Icon name="close" size={16} /></button>
              </div>
              <p>{claim?.statement ?? id}</p>
              {sources.map((source) => <div className="brief-source" key={source.id}>
                <a href={source.url} target="_blank" rel="noreferrer">{source.title}<Icon name="external" size={13} /></a>
                <span>{source.kind === 'publication' ? sourceCitation(source) : `Database annotation · ${source.provider}`}</span>
              </div>)}
              {claim && <details className="brief-finding-details"><summary>Context and limitations</summary>
                {evidence.map((item) => <section key={item.id}>
                  <h5>{sourceCitation(snapshot.sources.find(({ id }) => id === item.source_id)!)}</h5>
                  <dl className="context-list">{Object.entries(item.study_context).map(([key, value]) => <div key={key}>
                    <dt>{key.replaceAll('_', ' ')}</dt><dd>{value === null ? 'Not recorded' : Array.isArray(value) ? value.join('; ') : String(value)}</dd>
                  </div>)}</dl>
                  <p>Source location: {item.locator}</p>
                  <PublicationStatus source={snapshot.sources.find(({ id }) => id === item.source_id)!} />
                </section>)}
                <ul>{[...new Set([...claim.limitations, ...evidence.flatMap(({ limitations }) => limitations)])].map((value) => <li key={value}>{value}</li>)}</ul>
              </details>}
              {claim && <button className="text-button" type="button" onClick={() => onViewFinding(id)}>View finding<Icon name="arrow" size={14} /></button>}
            </article>;
          })}
          {available.length > 1 && <section className="brief-comparison" aria-label="Included comparison">
            <div className="brief-section-heading"><h3>Comparison</h3>
              {pair && <button type="button" className="icon-button" aria-label="Remove comparison" onClick={() => onChange({ type: 'compare', claimIds: null })}><Icon name="close" size={16} /></button>}
            </div>
            {pair ? <>
              <div className="brief-pair-selectors">{(['Finding A', 'Finding B'] as const).map((label, side) => <label key={label}>
                <span>{label}</span><select value={pair[side]} onChange={(event) => onChange({ type: 'compare', claimIds: side === 0 ? [event.target.value, pair[1]] : [pair[0], event.target.value] })}>
                  {available.map((claim) => <option key={claim.id} value={claim.id} disabled={claim.id === pair[1 - side]}>{findingLabel(snapshot, claim)}</option>)}
                </select>
              </label>)}</div>
              <button type="button" className="secondary-button" onClick={() => onCompare(pair)}><Icon name="compare" size={16} />View comparison</button>
            </> : <button type="button" className="secondary-button" onClick={() => onChange({ type: 'compare', claimIds: [available[0].id, available[1].id] })}>Include a comparison</button>}
          </section>}
        </section>
      </div>
      <div className="brief-footer">
        {(error || exportError) && <p className="brief-error" role="alert">{error || exportError}</p>}
        {status === 'unavailable' && <div className="brief-notice" role="status"><p>Device storage is unavailable. Download the brief to keep your work.</p><button className="secondary-button" type="button" onClick={onSave}>Try saving again</button></div>}
        {(status === 'invalid' || status === 'conflict') && <div className="brief-notice" role="status">
          <p>{status === 'invalid' ? 'The saved brief could not be read. It has not been replaced.' : 'Another tab changed the saved brief. Your edits are still here.'}</p>
          <button className="secondary-button" type="button" onClick={onSave}>Save this version</button>
        </div>}
        <button type="submit" className="primary-button"><Icon name="download" size={17} />Download brief</button>
        <span className="brief-save-status" role="status">{status === 'saved' ? 'Saved on this device' : status === 'saving' ? 'Saving…' : ''}</span>
      </div>
    </form>
  </dialog>;
}
