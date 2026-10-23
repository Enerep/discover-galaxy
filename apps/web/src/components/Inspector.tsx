import { useId, useLayoutEffect, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { getClaimEvidence, getEntityClaims } from '../lib/dataset.ts';
import { getStudyContextNotes } from '../lib/compare-evidence.ts';
import type { Claim, Context, Entity, Snapshot, Source } from '../lib/types.ts';
import { Icon, TYPE_LABELS } from './ui.tsx';
import { PublicationStatus } from './PublicationStatus.tsx';
import { StudyContextNote } from './StudyContextNote.tsx';

function Disclosure({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="disclosure">
      <button className="disclosure-trigger" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        {label}<Icon name="down" size={16} />
      </button>
      <div id={id} className="disclosure-body" data-open={open} aria-hidden={!open} inert={!open}>
        <div className="disclosure-inner">{children}</div>
      </div>
    </div>
  );
}

function StudyContext({ context, className = '' }: { context: Context; className?: string }) {
  return (
    <dl className={`context-list ${className}`}>
      {Object.entries(context).map(([key, value]) => (
        <div key={key}>
          <dt>{key.replaceAll('_', ' ')}</dt>
          <dd>{value === null ? 'Not recorded' : Array.isArray(value) ? value.join(', ')
            : typeof value === 'number' ? value.toLocaleString('en-US') : value}</dd>
        </div>
      ))}
    </dl>
  );
}

function authorLabel(source: Source) {
  if (source.kind === 'database_record') return source.provider ?? 'Database';
  if (!source.authors.length) return 'Author not recorded';
  if (source.authors.length === 1) return source.authors[0];
  return `${source.authors[0].split(' ').at(-1)} et al.`;
}

function connectionLabel(snapshot: Snapshot, claim: Claim, selected: Entity): string {
  if (typeof claim.context.binding_condition === 'string') {
    const sourceIds = new Set(getClaimEvidence(snapshot, claim.id).map(({ source_id }) => source_id));
    const sources = snapshot.sources.filter(({ id, kind }) => sourceIds.has(id) && kind === 'publication');
    if (sources.length === 1) return `${authorLabel(sources[0])} ${sources[0].year ?? ''} · ${claim.context.binding_condition}`;
  }
  if (claim.context.variant) return String(claim.context.variant);
  const isSubject = claim.subject_id === selected.id;
  const other = snapshot.entities.find(({ id }) => id === (isSubject ? claim.object_id : claim.subject_id));
  const label = claim.predicate === 'encodes' ? isSubject ? 'Encodes' : 'Encoded by'
    : claim.predicate === 'participates_in' ? isSubject ? 'Part of' : 'Participant'
      : claim.predicate === 'interacts_with' ? 'Interacts with' : 'Associated with';
  return `${label} · ${other?.label ?? ''}`;
}

function Finding({ snapshot, claim, selected, onFollow }: { snapshot: Snapshot; claim: Claim; selected: Entity; onFollow: (entityId: string, claimId: string) => void }) {
  const evidence = getClaimEvidence(snapshot, claim.id);
  const limitations = [...new Set([...claim.limitations, ...evidence.flatMap((item) => item.limitations)])];
  return (
    <section className="finding-content" key={claim.id} aria-label="Selected claim evidence">
      <div className="finding-heading"><h3>Finding</h3><span className="draft-label">Draft</span></div>
      <p className="finding-statement">{claim.statement}</p>
      <p className="finding-summary">{claim.summary}</p>
      {evidence.map((item) => {
        const source = snapshot.sources.find(({ id }) => id === item.source_id);
        return source ? (
          <div className="source-card" key={item.id}>
            <div className="source-meta"><Icon name={source.kind === 'publication' ? 'paper' : 'pathway'} size={16} /><span>{source.kind === 'publication' ? 'Original paper' : 'Database annotation'}</span><span>{source.kind === 'publication' ? source.year ?? 'Date unknown' : source.provider}</span></div>
            <a className="source-link" href={source.url} target="_blank" rel="noreferrer">
              <span className="source-title">{source.title}</span>
              <span className="source-action">{source.kind === 'publication' ? 'Open paper' : 'Open record'} <Icon name="external" size={14} /></span>
            </a>
            <p className="source-author">{source.kind === 'publication' ? `${authorLabel(source)} · ${source.publication_type?.replaceAll('_', ' ') ?? 'Publication'}` : source.release}</p>
            {typeof item.study_context.experimental_system === 'string' && <p className="source-context" aria-label="Experiment context">
              <span>{item.study_context.experimental_system}</span>
              {typeof item.study_context.assay === 'string' && <span>{item.study_context.assay}</span>}
            </p>}
          </div>
        ) : null;
      })}
      <div className="connection-navigation" aria-label="Follow this connection">
        {[...new Set([claim.subject_id, claim.object_id])].filter((id) => id !== selected.id).map((id) => {
          const entity = snapshot.entities.find((item) => item.id === id)!;
          return <button key={id} className="connection-link" aria-label={`View ${entity.label}`} onClick={() => onFollow(id, claim.id)}>
            <Icon name={entity.type} size={16} /><span>View {entity.label}<small>{TYPE_LABELS[entity.type]}</small></span><Icon name="arrow" size={15} />
          </button>;
        })}
      </div>
      {getStudyContextNotes(snapshot, claim.id).map((note) => <StudyContextNote key={note.id} snapshot={snapshot} note={note} />)}
      <Disclosure label="Study details and limitations">
        <div className="study-context">
          <h4>Claim context</h4>
          <StudyContext context={claim.context} />
          {evidence.map((item) => {
            const source = snapshot.sources.find(({ id }) => id === item.source_id);
            return (
              <section className="source-details" key={item.id}>
                <h4>{source ? `${authorLabel(source)}${source.year ? ` · ${source.year}` : ''}` : 'Source context'}</h4>
                <p>{item.finding}</p>
                <p className="evidence-relation">Evidence relation: {item.relation}</p>
                <StudyContext context={item.study_context} className="source-study-context" />
                <p className="source-locator"><strong>Source location</strong>{item.locator}</p>
                {source && <>
                  <p className="source-locator"><strong>Source check</strong>{item.review.rationale}</p>
                  <p className="source-locator"><strong>Reuse</strong>{source.reuse.permission_status === 'permitted' ? 'Recorded metadata reuse permitted.' : 'Assessment pending.'} {source.reuse.attribution} <a href={source.reuse.terms_url} target="_blank" rel="noreferrer">Source terms <Icon name="external" size={12} /></a></p>
                  <PublicationStatus source={source} />
                </>}
              </section>
            );
          })}
          <h4>Limitations</h4>
          <ul className="limitations">{limitations.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </Disclosure>
    </section>
  );
}

interface Props {
  snapshot: Snapshot;
  selected: Entity;
  selectedClaimId: string | null;
  onSelectClaim: (id: string) => void;
  visible: boolean;
  onShowSelected: () => void;
  onBack: () => void;
  panelRef: RefObject<HTMLElement | null>;
  onCompare: () => void;
  onFollow: (entityId: string, claimId: string) => void;
}

export function Inspector({ snapshot, selected, selectedClaimId, onSelectClaim, visible, onShowSelected, onBack, panelRef, onCompare, onFollow }: Props) {
  const claims = getEntityClaims(snapshot, selected.id);
  const active = claims.find(({ id }) => id === selectedClaimId) ?? claims[0];
  useLayoutEffect(() => {
    // A new record starts at its heading without moving the document on mobile.
    if (panelRef.current) panelRef.current.scrollTop = 0;
  }, [selected.id, panelRef]);
  return (
    <aside className="inspector" aria-label="Entity and evidence inspector" ref={panelRef}>
      <button className="back-to-graph" onClick={onBack}><Icon name="back" size={16} />Back to graph</button>
      <div className="sr-only" role="status">Selected {selected.label}. {claims.length} findings available.</div>
      <div className="inspector-content" key={selected.id}>
        <div className="entity-heading">
          <span className={`entity-symbol ${selected.type}`}><Icon name={selected.type} size={22} /></span>
          <span className="entity-type">{TYPE_LABELS[selected.type]}</span>
        </div>
        <h2 className={`selected-title ${selected.type === 'paper' ? 'paper-title' : ''}`} tabIndex={-1}>{selected.label}</h2>
        {selected.description && <p className="entity-description">{selected.description.split(' · ')[0]}</p>}
        {!visible && <button className="show-selected" onClick={onShowSelected}>Show in the current view <Icon name="arrow" size={14} /></button>}
        <section className="findings">
          <div className="section-heading"><h3>Findings</h3><span>{claims.length}</span></div>
          {active && snapshot.claims.length > 1 && <button className="secondary-button comparison-launch" onClick={onCompare}>Compare findings<Icon name="compare" size={17} /></button>}
          {claims.length > 1 && (
            <div className="claim-list" aria-label="Choose a finding">
              {claims.map((claim) => (
                <button className="claim-button" key={claim.id} aria-pressed={claim.id === active?.id}
                  onClick={() => onSelectClaim(claim.id)}>
                  <span>{connectionLabel(snapshot, claim, selected)}</span>
                  <Icon name="arrow" size={14} />
                </button>
              ))}
            </div>
          )}
          {active ? <Finding key={active.id} snapshot={snapshot} claim={active} selected={selected} onFollow={onFollow} />
            : <p className="no-findings">No findings for this record in the current dataset.</p>}
        </section>
        {selected.external_ids.length > 0 && (
          <Disclosure label="Entity identifiers">
            <dl className="context-list identifiers">
              {selected.external_ids.map(({ namespace, value }) => <div key={`${namespace}:${value}`}><dt>{namespace}</dt><dd>{value}</dd></div>)}
            </dl>
          </Disclosure>
        )}
      </div>
    </aside>
  );
}
