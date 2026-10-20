import { Component, lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import rawDataset from '../../../data/alzheimers/dataset.json';
import { getClaimEvidence, getEntityClaims, loadDataset, searchEntities } from './lib/dataset.ts';
import type { Claim, EntityType, Snapshot } from './lib/types.ts';

const Galaxy = lazy(() => import('./components/Galaxy.tsx'));
const typeNames: Record<EntityType, string> = { disease: 'Disease', gene: 'Gene', protein: 'Protein', drug: 'Drug', pathway: 'Pathway', paper: 'Paper' };
const filters: { type: EntityType | 'all'; label: string }[] = [
  { type: 'all', label: 'All entities' }, { type: 'gene', label: 'Genes' },
  { type: 'disease', label: 'Diseases' }, { type: 'paper', label: 'Papers' },
];

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    external: <><path d="M14 4h6v6M20 4 10 14M10 4H4v16h16v-6" /></>,
    galaxy: <><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-35 12 12)" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(35 12 12)" /><circle cx="12" cy="12" r="2" /></>,
    list: <><path d="M9 6h12M9 12h12M9 18h12M3 6h1M3 12h1M3 18h1" /></>,
    reset: <><path d="M4 10a8 8 0 1 1 1 7M4 4v6h6" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7v1" /></>,
    paper: <><path d="M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h7" /></>,
    gene: <><path d="M7 3c0 8 10 10 10 18M17 3C17 11 7 13 7 21M8 5h8M8 19h8M9 9h6M9 15h6" /></>,
    disease: <><circle cx="12" cy="12" r="8" /><path d="M8 12h8M12 8v8" /></>,
    check: <path d="m5 12 4 4L19 6" />,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] ?? paths.info}</svg>;
}

class SceneBoundary extends Component<{ children: ReactNode; onFail: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFail(); }
  render() { return this.state.failed ? <p className="empty-state">The 3D view is unavailable. Your evidence is available in the list.</p> : this.props.children; }
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

export default function App() {
  let snapshot: Snapshot;
  try { snapshot = loadDataset(rawDataset); }
  catch (error) {
    return <main className="load-error"><Icon name="galaxy" size={48} /><h1>We couldn’t load this atlas.</h1><p>The local dataset did not pass its integrity checks.</p><details><summary>Validation details</summary><pre>{String(error)}</pre></details></main>;
  }
  return <Explorer snapshot={snapshot} />;
}

function Explorer({ snapshot }: { snapshot: Snapshot }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<EntityType | 'all'>('all');
  const [selectedId, setSelectedId] = useState('gene-apoe');
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [view, setView] = useState<'galaxy' | 'list'>('galaxy');
  const [resetKey, setResetKey] = useState(0);
  const [webglFailed, setWebglFailed] = useState(false);
  const [showAllEvidence, setShowAllEvidence] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const aboutRef = useRef<HTMLDialogElement>(null);
  const reducedMotion = useReducedMotion();
  const results = useMemo(() => searchEntities(snapshot, query, filter), [snapshot, query, filter]);
  const selected = snapshot.entities.find(({ id }) => id === selectedId) ?? snapshot.entities[0];
  const related = getEntityClaims(snapshot, selected.id);
  const activeClaim = related.find(({ id }) => id === selectedClaimId) ?? related[0];
  const graphIds = new Set(results.map(({ id }) => id));
  if (query.trim() && filter === 'all') {
    const contextClaims = results.flatMap((entity) => getEntityClaims(snapshot, entity.id));
    for (const claim of contextClaims) { graphIds.add(claim.subject_id); graphIds.add(claim.object_id); }
    const contextSources = new Set(contextClaims.flatMap((claim) => getClaimEvidence(snapshot, claim.id).map(({ source_id }) => source_id)));
    for (const paper of snapshot.entities.filter(({ type }) => type === 'paper')) {
      if (paper.source_id && contextSources.has(paper.source_id)) graphIds.add(paper.id);
    }
  }
  const graphEntities = snapshot.entities.filter(({ id }) => graphIds.has(id));
  const visibleIds = new Set(graphEntities.map(({ id }) => id));
  const visibleClaims = snapshot.claims.filter(({ subject_id, object_id }) => visibleIds.has(subject_id) && visibleIds.has(object_id));
  const citationLinks = snapshot.entities.filter(({ type }) => type === 'paper').flatMap((paper) =>
    snapshot.evidence.filter(({ source_id }) => source_id === paper.source_id).flatMap((evidence) => {
      const claim = snapshot.claims.find(({ id }) => id === evidence.claim_id);
      return claim ? [{ paperId: paper.id, entityId: claim.subject_id, claimId: claim.id }] : [];
    }),
  ).filter(({ paperId, entityId }) => visibleIds.has(paperId) && visibleIds.has(entityId));
  const paperCount = snapshot.entities.filter(({ type }) => type === 'paper').length;

  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault(); searchRef.current?.focus();
      }
    }
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, []);

  function selectEntity(id: string) {
    setSelectedId(id); setSelectedClaimId(null); setShowAllEvidence(false);
    if (window.matchMedia('(max-width: 740px)').matches) {
      requestAnimationFrame(() => document.querySelector('.inspector')?.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'start' }));
    }
  }
  function selectClaim(id: string) {
    const claim = snapshot.claims.find((item) => item.id === id);
    if (!claim) return;
    if (!getEntityClaims(snapshot, selectedId).some((item) => item.id === id)) setSelectedId(claim.subject_id);
    setSelectedClaimId(id); setShowAllEvidence(true);
  }
  function resetFilters() { setQuery(''); setFilter('all'); }
  function unavailable() { setWebglFailed(true); setView('list'); }

  return <div className="app-shell">
    <a className="skip-link" href="#explorer">Skip to explorer</a>
    <header className="topbar">
      <a href="/" className="brand" aria-label="Discovery Galaxy home"><span className="brand-mark"><Icon name="galaxy" size={33} /></span><span>discovery<span className="brand-second">galaxy</span></span></a>
      <div className="topbar-breadcrumb"><span>Research workspace</span><span className="slash">/</span><strong>Alzheimer’s atlas</strong></div>
      <div className="topbar-actions"><span className="local-badge"><i /> Local snapshot</span><button className="icon-button" aria-label="About this atlas" onClick={() => aboutRef.current?.showModal()}><Icon name="info" /></button><a className="project-link" href="https://github.com/Enerep/discover-galaxy" target="_blank" rel="noreferrer">Project <Icon name="external" size={14} /></a></div>
    </header>

    <div className="workspace">
      <aside className="sidebar" aria-label="Atlas navigation">
        <div className="sidebar-heading">YOUR OBSERVATORY <span>01</span></div>
        <button className="collection-card" onClick={() => { resetFilters(); selectEntity('disease-alzheimers'); }}><span className="collection-orbit"><Icon name="galaxy" size={26} /></span><span><strong>Alzheimer’s disease</strong><small>Human genetics · starter atlas</small></span><Icon name="arrow" size={16} /></button>
        <div className="sidebar-heading section-gap">EXPLORE</div>
        <div className="view-nav"><button className={view === 'galaxy' ? 'nav-item active' : 'nav-item'} disabled={webglFailed} onClick={() => setView('galaxy')} aria-pressed={view === 'galaxy'}><Icon name="galaxy" /> Galaxy view <span>3D</span></button><button className={view === 'list' ? 'nav-item active' : 'nav-item'} onClick={() => setView('list')} aria-pressed={view === 'list'}><Icon name="list" /> Entity list <span>{snapshot.entities.length}</span></button></div>
        <div className="sidebar-heading section-gap">ENTITY TYPES</div>
        <div className="filter-list">{filters.map(({ type, label }) => <button key={type} className={`filter-item ${filter === type ? 'selected' : ''}`} aria-pressed={filter === type} onClick={() => setFilter(type)}><span className={`type-dot ${type}`} />{label}<span className="filter-count">{type === 'all' ? snapshot.entities.length : snapshot.entities.filter((item) => item.type === type).length}</span></button>)}</div>
        <div className="sidebar-note"><span className="small-orbit">✧</span><h3>A starting point for discovery.</h3><p>Follow a connection back to the research behind it.</p><button onClick={() => aboutRef.current?.showModal()}>About the evidence <Icon name="arrow" size={15} /></button></div>
        <div className="sidebar-footer"><span className="status-dot" /> Development preview <span className="version">v0.1</span></div>
      </aside>

      <main id="explorer" className="explorer" tabIndex={-1}>
        <div className="explorer-heading"><div><div className="eyebrow">THE KNOWLEDGE ATLAS <span> / 001</span></div><h1>Alzheimer’s disease<span className="heading-period">.</span></h1><p>Explore the connections. Follow the evidence.</p></div><button className="text-button about-button" onClick={() => aboutRef.current?.showModal()}><Icon name="info" size={16} /> Atlas notes</button></div>
        <div className="search-row"><div className="search-box"><Icon name="search" size={20} /><input ref={searchRef} aria-label="Search entities" placeholder="Search a gene, disease, or paper…" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && results.length === 1) selectEntity(results[0].id); }} />{query ? <button className="icon-button" aria-label="Clear search" onClick={() => setQuery('')}><Icon name="close" size={16} /></button> : <kbd>⌘ / Ctrl K</kbd>}</div><div className="atlas-count"><strong>{String(snapshot.entities.length).padStart(2, '0')}</strong> entities<span /> <strong>{String(snapshot.claims.length).padStart(2, '0')}</strong> claims</div></div>
        <div className="mobile-filters" aria-label="Filter entity types">{filters.map(({ type, label }) => <button key={type} aria-pressed={filter === type} onClick={() => setFilter(type)}><span className={`type-dot ${type}`} />{label}</button>)}</div>
        {(query || filter !== 'all') && <div className="filter-status" role="status">{results.length} of {snapshot.entities.length} entities match {filter !== 'all' && <span>· {typeNames[filter]}</span>}{query && filter === 'all' && view === 'galaxy' && results.length > 0 && <span>· neighborhood shown</span>}<button onClick={resetFilters}>Clear filters <Icon name="close" size={12} /></button></div>}
        {query && results.length > 0 && <div className="search-results" aria-label="Search results">{results.map((entity) => <button key={entity.id} aria-pressed={selectedId === entity.id} onClick={() => selectEntity(entity.id)}><i className={`type-dot ${entity.type}`} />{entity.label}<Icon name="arrow" size={12} /></button>)}</div>}
        <section className={`atlas-viewport ${view === 'list' ? 'list-mode' : ''}`} aria-label={view === 'galaxy' ? 'Interactive knowledge galaxy' : 'Knowledge entity list'}>
          <div className="viewport-toolbar"><div className="viewport-label"><span className="status-dot" /> {view === 'galaxy' ? 'EVIDENCE NETWORK' : 'ENTITY INDEX'}<span className="viewport-coordinate">AD—001</span></div><div className="view-toggle" aria-label="Explorer display"><button aria-label="Galaxy view" aria-pressed={view === 'galaxy'} disabled={webglFailed} className={view === 'galaxy' ? 'active' : ''} onClick={() => setView('galaxy')}><Icon name="galaxy" size={16} /></button><button aria-label="List view" aria-pressed={view === 'list'} className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}><Icon name="list" size={16} /></button></div></div>
          {!results.length ? <div className="empty-state"><Icon name="search" size={32} /><h2>No entities found</h2><p>This small atlas only searches its local, source-linked records.</p><button className="primary-button" onClick={resetFilters}>Show all entities <Icon name="arrow" size={16} /></button></div> : view === 'galaxy' ? <>
            <SceneBoundary onFail={unavailable}><Suspense fallback={<div className="scene-loading" role="status"><span className="loading-orbit" /> Preparing your atlas…</div>}><Galaxy entities={graphEntities} layoutEntities={snapshot.entities} claims={visibleClaims} selectedId={selectedId} selectedClaimId={activeClaim?.id ?? null} onSelect={selectEntity} onSelectClaim={selectClaim} reducedMotion={reducedMotion} resetKey={resetKey} onUnavailable={unavailable} citationLinks={citationLinks} /></Suspense></SceneBoundary>
            <div className="graph-caption"><span className="caption-kicker">A SMALL WINDOW INTO A MUCH BIGGER QUESTION</span><p>Every visible node leads to a source.</p></div>
            <button className="reset-view" onClick={() => setResetKey((key) => key + 1)}><Icon name="reset" size={15} /> Reset view</button>
            <div className="graph-instructions">Drag to orbit <span>·</span> Scroll to zoom <span>·</span> Select a node</div>
          </> : <div className="entity-grid">{webglFailed && <p className="fallback-notice" role="status">The 3D renderer is unavailable. All entities and evidence remain accessible here.</p>}{results.map((entity) => <button key={entity.id} data-entity-id={entity.id} className={`entity-card ${selectedId === entity.id ? 'is-selected' : ''}`} onClick={() => selectEntity(entity.id)} aria-pressed={selectedId === entity.id}><span className={`entity-icon ${entity.type}`}><Icon name={entity.type} size={21} /></span><span className="entity-card-type">{typeNames[entity.type]}</span><strong>{entity.label}</strong><small>{entity.description ?? snapshot.sources.find(({ id }) => id === entity.source_id)?.title}</small><span className="entity-card-bottom">{getEntityClaims(snapshot, entity.id).length} linked claims <Icon name="arrow" size={16} /></span></button>)}</div>}
          <div className="viewport-footer"><div className="legend"><span><i className="type-dot gene" />Gene</span><span><i className="type-dot disease" />Disease</span><span><i className="type-dot paper" />Paper</span></div><span className="legend-edges">— claim <span>┄ citation</span></span></div>
        </section>
        <div className="quick-entities" aria-label="Select an entity without using the 3D canvas"><span>JUMP TO</span>{snapshot.entities.filter(({ type }) => type === 'gene').map((entity) => <button key={entity.id} className={selectedId === entity.id ? 'active' : ''} onClick={() => { resetFilters(); selectEntity(entity.id); }}><i className="type-dot gene" />{entity.label}<Icon name="arrow" size={13} /></button>)}<button onClick={() => { resetFilters(); setView('list'); }}>All {snapshot.entities.length} entities <Icon name="list" size={14} /></button></div>
        <div className="development-notice"><span className="draft-dot" /><p><strong>Development snapshot.</strong> {paperCount} source papers; scientific review pending. This is a selective research map, not a clinical tool.</p><button onClick={() => aboutRef.current?.showModal()}>Read scope <Icon name="external" size={12} /></button></div>
      </main>

      <aside className="inspector" aria-label="Entity and evidence inspector">
        <div className="inspector-topline"><span>ENTITY DETAILS</span><span className="inspector-number">{String(snapshot.entities.findIndex(({ id }) => id === selectedId) + 1).padStart(2, '0')} / {String(snapshot.entities.length).padStart(2, '0')}</span></div>
        <div className="sr-only" role="status">Selected {selected.label}. {related.length} evidence connections available in entity details.</div>
        <div className="inspector-scroll" key={selected.id}>
          <div className="entity-title-row"><span className={`entity-icon ${selected.type}`}><Icon name={selected.type} size={24} /></span><span className={`type-tag ${selected.type}`}>{typeNames[selected.type]}</span></div>
          <h2 className={`selected-title ${selected.type === 'paper' || selected.type === 'disease' ? 'long-title' : ''}`}>{selected.label}</h2>
          {selected.description && <p className="entity-description">{selected.description.split(' · ')[0]}</p>}
          <div className="identifier-list">{selected.external_ids.map(({ namespace, value }) => <span key={`${namespace}:${value}`}>{namespace} <strong>{value}</strong></span>)}{selected.type === 'paper' && <span>Original publication</span>}</div>
          <div className="inspector-divider" />
          <div className="section-title"><h3>Evidence connections</h3><span>{related.length}</span></div>
          <p className="section-description">Select a claim to inspect its source and study context.</p>
          <div className="claim-list">{related.map((claim) => <button key={claim.id} aria-pressed={activeClaim?.id === claim.id} className={`claim-button ${activeClaim?.id === claim.id ? 'active' : ''}`} onClick={() => { setSelectedClaimId(claim.id); setShowAllEvidence(true); }}><span className="claim-route"><span className="type-dot gene" />{snapshot.entities.find(({ id }) => id === claim.subject_id)?.label}<span className="relation-line" /><span className="type-dot disease" />Alzheimer’s</span><strong>{String(claim.context.variant ?? claim.predicate.replaceAll('_', ' '))}</strong><span className="claim-button-bottom">Association · draft <Icon name="arrow" size={14} /></span></button>)}</div>
          {activeClaim ? <EvidencePanel snapshot={snapshot} claim={activeClaim} expanded={showAllEvidence} onExpand={() => setShowAllEvidence((value) => !value)} /> : <p className="section-description">No claims have been included for this entity in this snapshot.</p>}
          <div className="scope-note"><Icon name="info" size={16} /><p>Connections reflect selected findings. Position, size, and glow help navigation; they do not indicate scientific certainty.</p></div>
        </div>
        <div className="inspector-footer"><span className="status-dot" /> Evidence before inference <Icon name="check" size={14} /></div>
      </aside>
    </div>

    <dialog className="about-dialog" ref={aboutRef} aria-labelledby="about-title"><button className="icon-button dialog-close" aria-label="Close atlas notes" onClick={() => aboutRef.current?.close()}><Icon name="close" /></button><div className="eyebrow">DISCOVERY GALAXY / ATLAS NOTES</div><h2 id="about-title">A map, with its limits visible.</h2><p>{snapshot.scope.inclusion_criteria}</p><ul>{snapshot.scope.limitations.map((item) => <li key={item}>{item}</li>)}</ul><p>Summaries are project-authored source notes from an AI-assisted abstract lookup. No live AI explanation service is connected. Original publications remain the evidence.</p><dl><dt>Dataset</dt><dd>{snapshot.dataset_version}</dd><dt>Source lookup</dt><dd>{snapshot.created_at.slice(0, 10)}</dd><dt>Current status</dt><dd>Development · human scientific review pending</dd></dl><button className="primary-button" onClick={() => aboutRef.current?.close()}>Back to exploring <Icon name="arrow" size={16} /></button></dialog>
  </div>;
}

function EvidencePanel({ snapshot, claim, expanded, onExpand }: { snapshot: Snapshot; claim: Claim; expanded: boolean; onExpand: () => void }) {
  const evidence = getClaimEvidence(snapshot, claim.id);
  return <section className="evidence-panel" aria-label="Selected claim evidence">
    <div className="section-title evidence-title"><h3>The finding</h3><span className="draft-label">DRAFT</span></div>
    <p className="finding-statement">{claim.statement}</p><p className="finding-summary">{claim.summary}</p>
    {evidence.map((item) => {
      const source = snapshot.sources.find(({ id }) => id === item.source_id);
      return source ? <div className="source-card" key={item.id}><div className="source-top"><Icon name="paper" size={16} /><span>ORIGINAL EVIDENCE</span><span>{source.year}</span></div><a href={source.url} target="_blank" rel="noreferrer">{source.title}<Icon name="external" size={14} /></a><div className="source-meta">{source.authors[0]} et al. <span>·</span> {source.publication_type?.replaceAll('_', ' ')}</div><p className="evidence-relation"><span className="status-dot" /> {item.relation} this scoped claim</p><details><summary>Finding, source & study context</summary><p>{item.finding}</p><p className="locator">{item.locator}</p><h4>Source study context</h4><dl className="source-study-context">{Object.entries(item.study_context).map(([key, value]) => <div key={key}><dt>{key.replaceAll('_', ' ')}</dt><dd>{value === null ? 'Not recorded in this snapshot' : Array.isArray(value) ? value.join(', ') : String(value)}</dd></div>)}</dl><p>Review: {item.review.status}. Human scientific approval pending.</p></details></div> : null;
    })}
    <button className="context-toggle" aria-expanded={expanded} onClick={onExpand}>{expanded ? 'Hide' : 'Show'} study context & limitations <span>{expanded ? '−' : '+'}</span></button>
    {expanded && <div className="study-context"><dl>{Object.entries(claim.context).filter(([, value]) => value !== null).map(([key, value]) => <div key={key}><dt>{key.replaceAll('_', ' ')}</dt><dd>{Array.isArray(value) ? value.join(', ') : String(value)}</dd></div>)}</dl><h4>Limitations</h4><ul>{[...claim.limitations, ...evidence.flatMap((item) => item.limitations)].map((item) => <li key={item}>{item}</li>)}</ul></div>}
  </section>;
}
