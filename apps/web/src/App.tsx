import { Component, lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import rawDataset from '../../../data/alzheimers/dataset.json';
import { EntitySearch } from './components/EntitySearch.tsx';
import { Inspector } from './components/Inspector.tsx';
import { ShareDialog } from './components/ShareDialog.tsx';
import { ThemeControl } from './components/ThemeControl.tsx';
import { EvidenceComparison } from './components/EvidenceComparison.tsx';
import { ResearchBrief } from './components/ResearchBrief.tsx';
import { Icon, TYPE_LABELS } from './components/ui.tsx';
import { getClaimEvidence, getEntityClaims, loadDataset, searchEntities } from './lib/dataset.ts';
import type { EntityType, Snapshot } from './lib/types.ts';
import { useReducedMotion } from './lib/useReducedMotion.ts';
import { buildShareUrl, parseShareState } from './lib/share-state.ts';
import type { ExplorerShareState } from './lib/share-state.ts';
import { findComparisonPartner } from './lib/compare-evidence.ts';
import { useResearchBrief } from './lib/useResearchBrief.ts';
import type { ExperimentAnalysis } from './lib/experiment-analysis.ts';

const Galaxy = lazy(() => import('./components/Galaxy.tsx'));
const ExperimentWorkspace = lazy(() => import('./components/ExperimentWorkspace.tsx'));
const FILTERS: { value: EntityType | 'all'; label: string }[] = [
  { value: 'all', label: 'All types' }, { value: 'gene', label: 'Genes' },
  { value: 'protein', label: 'Proteins' }, { value: 'pathway', label: 'Pathways' },
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
  const [comparisonIds, setComparisonIds] = useState<[string, string] | null>(null);
  const [briefOpen, setBriefOpen] = useState(false);
  const [workspace, setWorkspace] = useState<'explore' | 'analysis'>('explore');
  const [analysisVisited, setAnalysisVisited] = useState(false);
  const [experiment, setExperiment] = useState<ExperimentAnalysis | null>(null);
  const research = useResearchBrief(snapshot);
  const graphCapture = useRef<(() => HTMLCanvasElement) | null>(null);
  const receiveCapture = useCallback((capture: (() => HTMLCanvasElement) | null) => { graphCapture.current = capture; }, []);
  const captureGraph = useCallback(() => graphCapture.current?.(), []);
  const aboutRef = useRef<HTMLDialogElement>(null);
  const graphRef = useRef<HTMLElement>(null);
  const inspectorRef = useRef<HTMLElement>(null);
  const briefTrigger = useRef<HTMLButtonElement>(null);
  const focusConnection = useRef(false);
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
  const experimentRows = useMemo(() => new Map(experiment?.rows.map((row) => [row.gene, row]) ?? []), [experiment]);
  const observation = selected.type === 'gene' ? experimentRows.get(selected.label) : undefined;

  useLayoutEffect(() => {
    if (!focusConnection.current) return;
    inspectorRef.current?.querySelector<HTMLElement>('.selected-title')?.focus({ preventScroll: true });
    focusConnection.current = false;
  }, [selectedId, selectedClaimId]);

  function togglePin(claimId: string) {
    const success = research.change(research.brief.pinned_claim_ids.includes(claimId)
      ? { type: 'unpin', claimId } : { type: 'pin', claimIds: [claimId] });
    if (!success) setBriefOpen(true);
  }
  function includeComparison(pair: [string, string]) {
    research.includeComparison(pair);
    setComparisonIds(null);
    setBriefOpen(true);
  }
  function closeBrief() {
    setBriefOpen(false);
    requestAnimationFrame(() => briefTrigger.current?.focus({ preventScroll: true }));
  }
  function viewBriefFinding(id: string) {
    const claim = snapshot.claims.find((claim) => claim.id === id);
    if (!claim) return;
    setBriefOpen(false);
    followConnection(claim.subject_id, claim.id);
    // A dialog can also return to the currently selected record.
    requestAnimationFrame(openEvidence);
  }
  function openAnalysis() {
    setAnalysisVisited(true);
    setWorkspace('analysis');
  }
  function inspectExperimentGene(gene: string) {
    const entity = snapshot.entities.find((entity) => entity.type === 'gene' && entity.label === gene);
    if (!entity) return;
    setWorkspace('explore');
    clearFilters();
    selectEntity(entity.id);
    requestAnimationFrame(openEvidence);
  }

  function openComparison() {
    if (!activeClaim) return;
    const other = findComparisonPartner(snapshot, activeClaim.id);
    if (other) setComparisonIds([activeClaim.id, other.id]);
  }
  function changeComparison(side: 0 | 1, id: string) {
    setComparisonIds((current) => {
      if (!current || current[1 - side] === id || !snapshot.claims.some((claim) => claim.id === id)) return current;
      return side === 0 ? [id, current[1]] : [current[0], id];
    });
  }

  useEffect(() => {
    const restore = () => {
      if (['#explorer', '#experiment-workspace'].includes(window.location.hash)) return;
      const next = parseShareState(new URL(window.location.href), snapshot) ?? defaultState;
      setWorkspace('explore');
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
  function followConnection(entityId: string, claimId: string) {
    focusConnection.current = true;
    setQuery('');
    setFilter('all');
    setSelectedId(entityId);
    setSelectedClaimId(claimId);
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
      <a className="skip-link" href={workspace === 'explore' ? '#explorer' : '#experiment-workspace'}>Skip to workspace</a>
      <header className="app-header">
        <a className="brand" href="/" aria-label="Discovery Galaxy home"><Icon name="galaxy" size={29} /><span>Discovery Galaxy</span></a>
        <div className="header-actions">
          <ThemeControl />
          <button className="data-status" aria-label="About the data" onClick={() => aboutRef.current?.showModal()}>
            <span className="draft-dot" /><span className="status-full">Source-checked draft</span><span className="status-compact">Draft</span><Icon name="info" size={16} />
          </button>
          <a className="project-link" href="https://github.com/Enerep/discover-galaxy" target="_blank" rel="noreferrer">GitHub <Icon name="external" size={14} /></a>
        </div>
      </header>

      <nav className="workspace-navigation" aria-label="Workspace">
        <button aria-pressed={workspace === 'explore'} onClick={() => setWorkspace('explore')}><Icon name="galaxy" size={17} />Explore</button>
        <button aria-pressed={workspace === 'analysis'} onClick={openAnalysis}><Icon name="analysis" size={17} />Analyze results</button>
      </nav>
      {analysisVisited && <div className="analysis-view" hidden={workspace !== 'analysis'}>
        <Suspense fallback={<p className="workspace-loading" role="status">Loading analysis…</p>}>
          <ExperimentWorkspace snapshot={snapshot} onInspectGene={inspectExperimentGene} onResults={setExperiment} />
        </Suspense>
      </div>}
      <div className="workspace" hidden={workspace !== 'explore'}>
        <main className="explorer" id="explorer" tabIndex={-1}>
          <div className="page-heading">
            <h1>Alzheimer’s disease</h1>
            <div className="workspace-actions">
              <button ref={briefTrigger} className="secondary-button brief-trigger" aria-label="Research brief" onClick={() => setBriefOpen(true)}><Icon name="brief" size={17} />Research brief
                {research.brief.pinned_claim_ids.length > 0 && <span className="brief-count" aria-hidden="true">{research.brief.pinned_claim_ids.length}</span>}
              </button>
              <button className="secondary-button share-trigger" onClick={() => setShareOpen(true)}><Icon name="share" size={17} />Share</button>
            </div>
          </div>
          {experiment && <section className="experiment-context" aria-label="Active experiment">
            <div><strong>{experiment.comparison}</strong><span>{experiment.table.filename}</span></div>
            <button className="text-button" onClick={openAnalysis}>Analysis results<Icon name="arrow" size={14} /></button>
          </section>}
          <div className="explorer-tools">
            <EntitySearch query={query} matches={matches} onQuery={setQuery} onSelect={selectEntity} />
            <div className="type-filter">
              <select aria-label="Filter by entity type" value={filter} onChange={(event) => setFilter(event.target.value as EntityType | 'all')}>
                {FILTERS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
              </select>
              <Icon name="down" size={16} />
            </div>
            <div className="view-switch" role="group" aria-label="View mode">
              <button aria-label="Graph view" aria-pressed={view === 'graph'} disabled={webglFailed} onClick={() => setView('graph')}><Icon name="galaxy" size={16} />Graph</button>
              <button aria-label="List view" aria-pressed={view === 'list'} onClick={() => setView('list')}><Icon name="list" size={16} />List</button>
            </div>
          </div>

          <section className="graph-card" ref={graphRef} tabIndex={-1} aria-label="Knowledge explorer">
            <div className={filtered ? 'view-toolbar' : 'sr-only'}>
              <p className="result-status" role="status">
                {filtered ? `${matches.length} ${matches.length === 1 ? 'match' : 'matches'}` : `${snapshot.entities.length} entities · ${paperCount} papers`}
                {query.trim() && filter === 'all' && view === 'graph' && graph.entities.length > matches.length
                  && <span> · {graph.entities.length - matches.length} related</span>}
              </p>
              {filtered && <button className="clear-filters" onClick={clearFilters}>Clear filters</button>}
            </div>

            <div className={`viewport ${view === 'list' ? 'list-mode' : ''}`}>
              {!matches.length ? (
                <div className="empty-state" role="status">
                  <Icon name="search" size={28} /><h2>No matches</h2>
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
                </>
              ) : (
                <div className="list-content">
                  {webglFailed && <p className="fallback-notice" role="status">3D unavailable · List view</p>}
                  <ul className="entity-list">
                    {matches.map((entity) => (
                      <li key={entity.id}>
                        <button className="entity-row" data-entity-id={entity.id} aria-pressed={selectedId === entity.id} onClick={() => selectEntity(entity.id)}>
                          <span className={`entity-symbol ${entity.type}`} role="img" aria-label={TYPE_LABELS[entity.type]}><Icon name={entity.type} size={20} /></span>
                          <span className="entity-row-text"><strong>{entity.label}</strong></span>
                          <span className="row-type" aria-hidden="true">{TYPE_LABELS[entity.type]}</span><Icon name="arrow" size={15} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {view === 'graph' && matches.length > 0 && <footer className="graph-legend" aria-label="Graph legend">
              <div className="entity-legend">
                {(['gene', 'protein', 'pathway', 'disease', 'paper'] as const).map((type) => <span key={type}><i className={`type-dot ${type}`} />{TYPE_LABELS[type]}</span>)}
              </div>
              <div className="edge-legend"><span><i />Claim</span><span><i className="citation-line" />Citation</span></div>
            </footer>}
          </section>

          <div className="gene-shortcuts" role="group" aria-label="Choose a gene">
            {snapshot.entities.filter(({ type }) => type === 'gene').map((entity) => (
              <button key={entity.id} aria-pressed={selectedId === entity.id} onClick={() => { clearFilters(); selectEntity(entity.id); }}>{entity.label}</button>
            ))}
          </div>
          <div className="mobile-selection">
            <span><strong>{selected.label}</strong></span>
            <button className="primary-button" onClick={openEvidence}>View evidence<Icon name="arrow" size={14} /></button>
          </div>
        </main>

        <Inspector snapshot={snapshot} selected={selected} selectedClaimId={selectedClaimId} onSelectClaim={selectClaim}
          visible={view === 'graph' ? graph.ids.has(selectedId) : matches.some(({ id }) => id === selectedId)}
          onShowSelected={clearFilters} onBack={backToGraph} panelRef={inspectorRef} onCompare={openComparison} onFollow={followConnection}
          pinnedClaimIds={research.brief.pinned_claim_ids} onPin={togglePin}
          experimentObservation={experiment && observation ? { comparison: experiment.comparison, row: observation, thresholds: experiment.thresholds,
            selected: experiment.selected.some(({ gene }) => gene === observation.gene) } : null} />
      </div>

      <dialog className="data-dialog" ref={aboutRef} aria-labelledby="data-title">
        <button className="icon-button dialog-close" aria-label="Close data information" onClick={() => aboutRef.current?.close()}><Icon name="close" /></button>
        <h2 id="data-title">About this dataset</h2>
        <p>{snapshot.scope.inclusion_criteria}</p>
        <ul>{snapshot.scope.limitations.map((item) => <li key={item}>{item}</li>)}</ul>
        <dl className="context-list"><div><dt>Dataset</dt><dd>{snapshot.dataset_version}</dd></div><div><dt>Source lookup</dt><dd>{snapshot.created_at.slice(0, 10)}</dd></div></dl>
      </dialog>
      <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} snapshot={snapshot}
        selected={selected} claim={activeClaim} captureGraph={captureGraph} shareUrl={shareUrl} />
      <EvidenceComparison snapshot={snapshot} claimIds={comparisonIds} onChange={changeComparison} onClose={() => setComparisonIds(null)} onIncludeInBrief={includeComparison} />
      <ResearchBrief snapshot={snapshot} brief={research.brief} open={briefOpen} onClose={closeBrief}
        status={research.status} error={research.error} selectedClaimId={activeClaim?.id ?? null} onChange={research.change} onSave={research.saveThisVersion}
        onViewFinding={viewBriefFinding} onCompare={(pair) => { setBriefOpen(false); setComparisonIds(pair); }} />
    </div>
  );
}
