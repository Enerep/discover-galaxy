import { Component, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import rawDataset from '../../../data/alzheimers/dataset.json';
import { EntitySearch } from './components/EntitySearch.tsx';
import { Inspector } from './components/Inspector.tsx';
import { ShareDialog } from './components/ShareDialog.tsx';
import { ThemeControl } from './components/ThemeControl.tsx';
import { Icon, TYPE_LABELS } from './components/ui.tsx';
import { getClaimEvidence, getEntityClaims, loadDataset, searchEntities } from './lib/dataset.ts';
import type { EntityType, Snapshot } from './lib/types.ts';
import { useReducedMotion } from './lib/useReducedMotion.ts';
import { buildShareUrl, parseShareState } from './lib/share-state.ts';
import type { ExplorerShareState } from './lib/share-state.ts';

const Galaxy = lazy(() => import('./components/Galaxy.tsx'));
const FILTERS: { value: EntityType | 'all'; label: string }[] = [
  { value: 'all', label: 'All types' }, { value: 'gene', label: 'Genes' },
  { value: 'disease', label: 'Diseases' }, { value: 'paper', label: 'Papers' },
];

class SceneBoundary extends Component<{ children: ReactNode; onFail: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFail(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function App() {
  let snapshot: Snapshot;
  try { snapshot = loadDataset(rawDataset); }
  catch (error) {
    return (
      <main className="load-error">
        <Icon name="galaxy" size={36} /><h1>Unable to load the dataset</h1>
        <p>The data did not pass its integrity checks.</p>
        <details><summary>Validation details</summary><pre>{String(error)}</pre></details>
      </main>
    );
  }
  return <Explorer snapshot={snapshot} />;
}

function Explorer({ snapshot }: { snapshot: Snapshot }) {
  const defaultState = useMemo<ExplorerShareState>(() => ({
    entityId: snapshot.entities.find(({ id }) => id === 'gene-apoe')?.id ?? snapshot.entities[0].id,
    claimId: null, query: '', filter: 'all', view: 'graph',
  }), [snapshot]);
  const [initialState] = useState(() => parseShareState(new URL(window.location.href), snapshot) ?? defaultState);
  const [query, setQuery] = useState(initialState.query);
  const [filter, setFilter] = useState<EntityType | 'all'>(initialState.filter);
  const [selectedId, setSelectedId] = useState(initialState.entityId);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(initialState.claimId);
  const [view, setView] = useState<'graph' | 'list'>(initialState.view);
  const [resetKey, setResetKey] = useState(0);
  const [zoomStep, setZoomStep] = useState(0);
  const [webglFailed, setWebglFailed] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const graphCapture = useRef<(() => HTMLCanvasElement) | null>(null);
  const receiveCapture = useCallback((capture: (() => HTMLCanvasElement) | null) => { graphCapture.current = capture; }, []);
  const captureGraph = useCallback(() => graphCapture.current?.(), []);
  const aboutRef = useRef<HTMLDialogElement>(null);
  const graphRef = useRef<HTMLElement>(null);
  const inspectorRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const matches = useMemo(() => searchEntities(snapshot, query, filter), [snapshot, query, filter]);
  const selected = snapshot.entities.find(({ id }) => id === selectedId) ?? snapshot.entities[0];
  const related = getEntityClaims(snapshot, selected.id);
  const activeClaim = related.find(({ id }) => id === selectedClaimId) ?? related[0];
  const shareUrl = useMemo(() => {
    try {
      return buildShareUrl(new URL(window.location.href), {
        entityId: selected.id, claimId: activeClaim?.id ?? null, query, filter, view,
      }, snapshot);
    } catch { return ''; }
  }, [snapshot, selected.id, activeClaim?.id, query, filter, view]);
  const paperCount = snapshot.entities.filter(({ type }) => type === 'paper').length;
  const filtered = !!query.trim() || filter !== 'all';

  useEffect(() => {
    const restore = () => {
      if (window.location.hash === '#explorer') return;
      const next = parseShareState(new URL(window.location.href), snapshot) ?? defaultState;
      setQuery(next.query);
      setFilter(next.filter);
      setSelectedId(next.entityId);
      setSelectedClaimId(next.claimId);
      setView(webglFailed ? 'list' : next.view);
    };
    window.addEventListener('hashchange', restore);
    return () => window.removeEventListener('hashchange', restore);
  }, [snapshot, defaultState, webglFailed]);

  const graph = useMemo(() => {
    const ids = new Set(matches.map(({ id }) => id));
    if (query.trim() && filter === 'all') {
      const contextClaims = matches.flatMap((entity) => getEntityClaims(snapshot, entity.id));
      for (const claim of contextClaims) { ids.add(claim.subject_id); ids.add(claim.object_id); }
      const sourceIds = new Set(contextClaims.flatMap((claim) => getClaimEvidence(snapshot, claim.id).map(({ source_id }) => source_id)));
      for (const entity of snapshot.entities) {
        if (entity.type === 'paper' && entity.source_id && sourceIds.has(entity.source_id)) ids.add(entity.id);
      }
    }
    const claims = snapshot.claims.filter(({ subject_id, object_id }) => ids.has(subject_id) && ids.has(object_id));
    const citationLinks = snapshot.entities.filter(({ type }) => type === 'paper').flatMap((paper) =>
      snapshot.evidence.filter(({ source_id }) => source_id === paper.source_id).flatMap((evidence) => {
        const claim = snapshot.claims.find(({ id }) => id === evidence.claim_id);
        return claim && ids.has(paper.id) && ids.has(claim.subject_id)
          ? [{ paperId: paper.id, entityId: claim.subject_id, claimId: claim.id }] : [];
      }),
    );
    return { ids, claims, citationLinks, entities: snapshot.entities.filter(({ id }) => ids.has(id)) };
  }, [snapshot, matches, query, filter]);

  function selectEntity(id: string) {
    setSelectedId(id);
    setSelectedClaimId(null);
  }
  function selectClaim(id: string) {
    const claim = snapshot.claims.find((item) => item.id === id);
    if (!claim) return;
    if (!getEntityClaims(snapshot, selectedId).some((item) => item.id === id)) setSelectedId(claim.subject_id);
    setSelectedClaimId(id);
  }
  function clearFilters() { setQuery(''); setFilter('all'); }
  function unavailable() { setWebglFailed(true); setView('list'); }
  function moveTo(target: HTMLElement | null, focus: HTMLElement | null = target) {
    focus?.focus({ preventScroll: true });
    target?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  }
  function openEvidence() {
    moveTo(inspectorRef.current, inspectorRef.current?.querySelector<HTMLElement>('.selected-title'));
  }
  function backToGraph() { moveTo(graphRef.current); }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#explorer">Skip to explorer</a>
      <header className="app-header">
        <a className="brand" href="/" aria-label="Discovery Galaxy home"><Icon name="galaxy" size={29} /><span>Discovery Galaxy</span></a>
        <div className="header-actions">
          <ThemeControl />
          <button className="data-status" aria-label="About the data" onClick={() => aboutRef.current?.showModal()}>
            <span className="draft-dot" />Draft dataset<Icon name="info" size={16} />
          </button>
          <a className="project-link" href="https://github.com/Enerep/discover-galaxy" target="_blank" rel="noreferrer">GitHub <Icon name="external" size={14} /></a>
        </div>
      </header>

      <div className="workspace">
        <main className="explorer" id="explorer" tabIndex={-1}>
          <div className="page-heading">
            <div><h1>Alzheimer’s disease</h1><p>Search or choose a gene to read its studies.</p></div>
            <button className="secondary-button share-trigger" onClick={() => setShareOpen(true)}><Icon name="share" size={17} />Share</button>
          </div>
          <div className="explorer-tools">
            <EntitySearch query={query} matches={matches} onQuery={setQuery} onSelect={selectEntity} />
            <div className="type-filter">
              <select aria-label="Filter by entity type" value={filter} onChange={(event) => setFilter(event.target.value as EntityType | 'all')}>
                {FILTERS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
              </select>
              <Icon name="down" size={16} />
            </div>
          </div>

          <section className="graph-card" ref={graphRef} tabIndex={-1} aria-label="Knowledge explorer">
            <div className="view-toolbar">
              <p className="result-status" role="status">
                {filtered ? `${matches.length} ${matches.length === 1 ? 'match' : 'matches'}` : `${snapshot.entities.length} entities · ${paperCount} papers`}
                {query.trim() && filter === 'all' && view === 'graph' && matches.length > 0 && <span> with context</span>}
              </p>
              {filtered && <button className="clear-filters" onClick={clearFilters}>Clear filters</button>}
              <div className="view-switch" role="group" aria-label="View mode">
                <button aria-label="Graph view" aria-pressed={view === 'graph'} disabled={webglFailed} onClick={() => setView('graph')}><Icon name="galaxy" size={16} />Graph</button>
                <button aria-label="List view" aria-pressed={view === 'list'} onClick={() => setView('list')}><Icon name="list" size={16} />List</button>
              </div>
            </div>

            <div className={`viewport ${view === 'list' ? 'list-mode' : ''}`}>
              {!matches.length ? (
                <div className="empty-state" role="status">
                  <Icon name="search" size={28} /><h2>No matches</h2>
                  <p>Try a gene name or clear the filters.</p>
                  <button className="primary-button" onClick={clearFilters}>Show all entities</button>
                </div>
              ) : view === 'graph' ? (
                <>
                  <SceneBoundary onFail={unavailable}>
                    <Suspense fallback={<div className="scene-loading" role="status"><span className="loading-ring" />Loading graph…</div>}>
                      <Galaxy entities={graph.entities} layoutEntities={snapshot.entities} claims={graph.claims}
                        selectedId={selectedId} selectedClaimId={activeClaim?.id ?? null} onSelect={selectEntity}
                        onSelectClaim={selectClaim} reducedMotion={reducedMotion} resetKey={resetKey} zoomStep={zoomStep}
                        onUnavailable={unavailable} citationLinks={graph.citationLinks} onCaptureReady={receiveCapture} />
                    </Suspense>
                  </SceneBoundary>
                  <div className="camera-controls" aria-label="Graph controls">
                    <button className="icon-button" aria-label="Zoom in" title="Zoom in" onClick={() => setZoomStep((step) => step + 1)}><Icon name="plus" /></button>
                    <button className="icon-button" aria-label="Zoom out" title="Zoom out" onClick={() => setZoomStep((step) => step - 1)}><Icon name="minus" /></button>
                    <button className="icon-button" aria-label="Reset view" title="Reset view" onClick={() => setResetKey((key) => key + 1)}><Icon name="reset" size={17} /></button>
                  </div>
                  <p className="graph-hint"><span className="pointer-hint">Drag to rotate · Scroll to zoom</span><span className="touch-hint">Drag to rotate · Pinch to zoom</span></p>
                </>
              ) : (
                <div className="list-content">
                  {webglFailed && <p className="fallback-notice" role="status">3D is unavailable. You can browse all the evidence in this list.</p>}
                  <ul className="entity-list">
                    {matches.map((entity) => (
                      <li key={entity.id}>
                        <button className="entity-row" data-entity-id={entity.id} aria-pressed={selectedId === entity.id} onClick={() => selectEntity(entity.id)}>
                          <span className={`entity-symbol ${entity.type}`}><Icon name={entity.type} size={20} /></span>
                          <span className="entity-row-text"><strong>{entity.label}</strong><small>{entity.description?.split(' · ')[0] ?? snapshot.sources.find(({ id }) => id === entity.source_id)?.title}</small></span>
                          <span className="row-type">{TYPE_LABELS[entity.type]}</span><Icon name="arrow" size={15} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <footer className="graph-legend" aria-label="Graph legend">
              <div className="entity-legend"><span><i className="type-dot gene" />Gene</span><span><i className="type-dot disease" />Disease</span><span><i className="type-dot paper" />Paper</span></div>
              <div className="edge-legend"><span><i />Claim</span><span><i className="citation-line" />Citation</span></div>
            </footer>
          </section>

          <div className="gene-shortcuts" aria-label="Choose a gene">
            <span>Genes</span>
            {snapshot.entities.filter(({ type }) => type === 'gene').map((entity) => (
              <button key={entity.id} aria-pressed={selectedId === entity.id} onClick={() => { clearFilters(); selectEntity(entity.id); }}>{entity.label}</button>
            ))}
          </div>
          <div className="mobile-selection">
            <span><strong>{selected.label}</strong><small>{related.length} {related.length === 1 ? 'finding' : 'findings'}</small></span>
            <button className="primary-button" onClick={openEvidence}>View evidence<Icon name="arrow" size={14} /></button>
          </div>
          <p className="coverage-note">Selected studies; scientific review pending.</p>
        </main>

        <Inspector snapshot={snapshot} selected={selected} selectedClaimId={selectedClaimId} onSelectClaim={selectClaim}
          visible={view === 'graph' ? graph.ids.has(selectedId) : matches.some(({ id }) => id === selectedId)}
          onShowSelected={clearFilters} onBack={backToGraph} panelRef={inspectorRef} />
      </div>

      <dialog className="data-dialog" ref={aboutRef} aria-labelledby="data-title">
        <button className="icon-button dialog-close" aria-label="Close data information" onClick={() => aboutRef.current?.close()}><Icon name="close" /></button>
        <h2 id="data-title">About this dataset</h2>
        <p>{snapshot.scope.inclusion_criteria}</p>
        <ul>{snapshot.scope.limitations.map((item) => <li key={item}>{item}</li>)}</ul>
        <p>Source notes were prepared with AI assistance from abstracts and bibliographic records. All scientific records are drafts awaiting human review.</p>
        <dl className="context-list"><div><dt>Dataset</dt><dd>{snapshot.dataset_version}</dd></div><div><dt>Source lookup</dt><dd>{snapshot.created_at.slice(0, 10)}</dd></div></dl>
        <button className="primary-button" onClick={() => aboutRef.current?.close()}>Close</button>
      </dialog>
      <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} snapshot={snapshot}
        selected={selected} claim={activeClaim} captureGraph={captureGraph} shareUrl={shareUrl} />
    </div>
  );
}
