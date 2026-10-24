import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { Snapshot } from '../lib/types.ts';
import { ExperimentColumnChoiceError, MAX_EXPERIMENT_BYTES, parseExperiment } from '../lib/experiment.ts';
import type { ExperimentTable } from '../lib/experiment.ts';
import { buildExperimentQuestions, formatProbability, loadPathwayReference, runExperimentAnalysis } from '../lib/experiment-analysis.ts';
import type { ExperimentAnalysis } from '../lib/experiment-analysis.ts';
import { useReducedMotion } from '../lib/useReducedMotion.ts';
import { Icon } from './ui.tsx';
import { loadGeneIdentityReference, resolveGeneIdentifiers } from '../lib/gene-identifiers.ts';
import type { GeneIdentityReference, GeneMappingReport } from '../lib/gene-identifiers.ts';
import { GeneMappingDetails } from './GeneMappingDetails.tsx';
import { ThresholdSensitivity } from './ThresholdSensitivity.tsx';
import { PathwayGroupMembers } from './PathwayGroupMembers.tsx';
import { useExperimentRobustness } from '../lib/useExperimentRobustness.ts';
import './experiment-workspace.css';

interface Props {
  snapshot: Snapshot;
  onInspectGene: (gene: string) => void;
  onResults: (result: ExperimentAnalysis | null) => void;
}

const PAGE_SIZE = 20;
const MEMBER_PAGE_SIZE = 20;
const integer = (value: number) => value.toLocaleString('en-US');
const foldChange = (value: number | null) => {
  if (value === null) return 'Not recorded';
  const absolute = Math.abs(value);
  const formatted = absolute > 0 && (absolute < 0.001 || absolute >= 10_000)
    ? value.toExponential(3) : Number(value.toPrecision(4)).toString();
  return `${value > 0 ? '+' : ''}${formatted}`;
};

export default function ExperimentWorkspace({ snapshot, onInspectGene, onResults }: Props) {
  const workspace = useRef<HTMLElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const detailHeading = useRef<HTMLHeadingElement>(null);
  const groupToggle = useRef<HTMLInputElement>(null);
  const readSequence = useRef(0);
  const pendingResultFocus = useRef(false);
  const mappingRegion = useRef<HTMLDivElement>(null);
  const pendingMappingFocus = useRef(false);
  const geneReference = useRef<{ table: ExperimentTable; reference: GeneIdentityReference } | null>(null);
  const [columnInput, setColumnInput] = useState<{ text: string; filename: string; choices: { index: number; label: string }[] } | null>(null);
  const [identifierColumn, setIdentifierColumn] = useState('');
  const [mapping, setMapping] = useState<GeneMappingReport | null>(null);
  const [allowUnresolvedIds, setAllowUnresolvedIds] = useState(false);
  const [pendingTable, setPendingTable] = useState<ExperimentTable | null>(null);
  const [analysis, setAnalysis] = useState<ExperimentAnalysis | null>(null);
  const [comparison, setComparison] = useState('');
  const [geneFdr, setGeneFdr] = useState('0.05');
  const [minimumFoldChange, setMinimumFoldChange] = useState('1');
  const [allTestedGenes, setAllTestedGenes] = useState(false);
  const [busy, setBusy] = useState<'reading' | 'analyzing' | null>(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('fdr');
  const [significantOnly, setSignificantOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [pathwayId, setPathwayId] = useState<string | null>(null);
  const [memberPage, setMemberPage] = useState(0);
  const [groupOverlaps, setGroupOverlaps] = useState(false);
  const [sensitivityOpen, setSensitivityOpen] = useState(false);
  const robustness = useExperimentRobustness(analysis);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    if (groupOverlaps) setPage(0);
  }, [robustness.grouping.result]);

  useLayoutEffect(() => {
    if (!mapping || !pendingMappingFocus.current) return;
    pendingMappingFocus.current = false;
    if (!workspace.current?.getClientRects().length) return;
    mappingRegion.current?.focus({ preventScroll: true });
    mappingRegion.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  }, [mapping, reducedMotion]);

  useLayoutEffect(() => {
    if (!analysis || !pendingResultFocus.current) return;
    pendingResultFocus.current = false;
    // Another workspace may have been opened while the reference was loading.
    if (!workspace.current?.getClientRects().length) return;
    resultHeading.current?.focus({ preventScroll: true });
    resultHeading.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  }, [analysis, reducedMotion]);

  const filtered = useMemo(() => {
    const search = query.trim().toLocaleLowerCase('en-US');
    const rows = (analysis?.pathways ?? []).filter((row) => (!search || `${row.name} ${row.id}`.toLocaleLowerCase('en-US').includes(search))
      && (!significantOnly || row.adjustedPValue <= 0.05));
    if (sort === 'name') rows.sort((a, b) => a.name.localeCompare(b.name, 'en-US') || a.id.localeCompare(b.id, 'en-US'));
    if (sort === 'hits') rows.sort((a, b) => b.overlapSize - a.overlapSize || a.logAdjustedPValue - b.logAdjustedPValue || a.id.localeCompare(b.id, 'en-US'));
    return rows;
  }, [analysis, query, sort, significantOnly]);
  const pathwayLookup = useMemo(() => new Map(analysis?.pathways.map((row) => [row.id, row]) ?? []), [analysis]);
  const listed = useMemo(() => {
    if (!groupOverlaps || !robustness.grouping.result) return filtered.map((row) => ({ row, group: null }));
    const groupsById = new Map(robustness.grouping.result.groups.flatMap((group) => group.members.map(({ id }) => [id, group] as const)));
    const visible = new Set(filtered.map(({ id }) => id));
    const seen = new Set<string>();
    return filtered.flatMap((row) => {
      const group = groupsById.get(row.id)!;
      if (seen.has(group.representativeId)) return [];
      seen.add(group.representativeId);
      return [{ row: pathwayLookup.get(group.representativeId)!, group: { ...group, members: group.members.filter(({ id }) => visible.has(id)) } }];
    });
  }, [filtered, groupOverlaps, robustness.grouping.result, pathwayLookup]);
  const visibleRows = listed.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const selectedPathway = (pathwayId ? pathwayLookup.get(pathwayId) : null) ?? filtered[0];
  const selectedGenes = useMemo(() => new Set(analysis?.selected.map(({ gene }) => gene) ?? []), [analysis]);
  const eligibleGenes = useMemo(() => new Set(analysis?.backgroundGenes ?? []), [analysis]);
  const eligibleMembers = useMemo(() => {
    const reference = analysis?.reference.pathways.find(({ id }) => id === selectedPathway?.id);
    const members = new Set(reference?.genes ?? []);
    return (analysis?.rows ?? []).filter(({ gene }) => eligibleGenes.has(gene) && members.has(gene))
      .sort((a, b) => Number(selectedGenes.has(b.gene)) - Number(selectedGenes.has(a.gene)) || a.gene.localeCompare(b.gene, 'en-US'));
  }, [analysis, selectedPathway?.id, selectedGenes, eligibleGenes]);
  const questions = useMemo(() => analysis && selectedPathway ? buildExperimentQuestions(snapshot, analysis, selectedPathway.id) : [], [snapshot, analysis, selectedPathway]);
  const curatedGenes = useMemo(() => new Set(snapshot.entities.filter(({ type }) => type === 'gene').map(({ label }) => label)), [snapshot]);
  const changed = analysis && (pendingTable !== analysis.table || comparison.trim() !== analysis.comparison
    || Number(geneFdr) !== analysis.thresholds.adjustedPMax || Number(minimumFoldChange) !== analysis.thresholds.minAbsLog2FoldChange || !allTestedGenes);

  async function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const sequence = ++readSequence.current;
    setBusy('reading'); setError(''); setPendingTable(null); setAllTestedGenes(false);
    setColumnInput(null); setIdentifierColumn(''); setMapping(null); setAllowUnresolvedIds(false); geneReference.current = null;
    let text = '';
    try {
      if (file.size > MAX_EXPERIMENT_BYTES) throw new Error('Use a results file no larger than 5 MiB.');
      text = await file.text();
      const table = parseExperiment(text, file.name);
      if (sequence === readSequence.current) setPendingTable(table);
    } catch (cause) {
      if (sequence === readSequence.current) {
        if (cause instanceof ExperimentColumnChoiceError) {
          setColumnInput({ text, filename: file.name, choices: cause.columns });
          return;
        }
        setError(cause instanceof Error ? cause.message : 'The file could not be read. Choose a UTF-8 CSV or TSV file.');
        if (fileInput.current) fileInput.current.value = '';
      }
    } finally { if (sequence === readSequence.current) setBusy(null); }
  }

  function chooseColumn(value: string) {
    if (!columnInput) return;
    setIdentifierColumn(value); setError(''); setPendingTable(null); setAllTestedGenes(false);
    setMapping(null); setAllowUnresolvedIds(false); geneReference.current = null;
    if (value === '') return;
    try { setPendingTable(parseExperiment(columnInput.text, columnInput.filename, { identifierColumn: Number(value) })); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to read this identifier column.'); }
  }

  async function analyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pendingTable || busy) return;
    setBusy('analyzing'); setError('');
    try {
      let identities: GeneIdentityReference | undefined;
      if (pendingTable.identifierType === 'ensembl') {
        identities = geneReference.current?.table === pendingTable ? geneReference.current.reference : await loadGeneIdentityReference();
        geneReference.current = { table: pendingTable, reference: identities };
        const report = resolveGeneIdentifiers(pendingTable, identities);
        pendingMappingFocus.current = report.collisionCount > 0 || (report.unresolvedCount > 0 && !allowUnresolvedIds);
        setMapping(report);
        if (report.collisionCount) throw new Error('Resolve duplicate gene mappings in your file before analysis. No rows have been merged.');
        if (report.unresolvedCount && !allowUnresolvedIds) return;
      }
      const reference = await loadPathwayReference();
      const result = runExperimentAnalysis(pendingTable, { comparison, allTestedGenes, allowUnresolvedIds,
        thresholds: { adjustedPMax: Number(geneFdr), minAbsLog2FoldChange: Number(minimumFoldChange) } }, reference, identities);
      pendingResultFocus.current = true;
      setAnalysis(result); onResults(result);
      setQuery(''); setPage(0); setMemberPage(0); setPathwayId(null); setSignificantOnly(false);
      setGroupOverlaps(false); setSensitivityOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The analysis could not be completed. Your previous results are still available.');
    } finally { setBusy(null); }
  }

  function clear() {
    ++readSequence.current;
    pendingResultFocus.current = false;
    pendingMappingFocus.current = false;
    setPendingTable(null); setAnalysis(null); setAllTestedGenes(false); setBusy(null); setError('');
    setColumnInput(null); setIdentifierColumn(''); setMapping(null); setAllowUnresolvedIds(false); geneReference.current = null;
    setGroupOverlaps(false); setSensitivityOpen(false);
    if (fileInput.current) fileInput.current.value = '';
    onResults(null); fileInput.current?.focus();
  }

  function template() {
    const url = URL.createObjectURL(new Blob(['gene,log2FoldChange,padj,data_kind\nAPOE,1.5,0.01,synthetic\nABCA1,-1.2,0.02,synthetic\nTREM2,0.3,0.8,synthetic\n'], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'synthetic-rnaseq-format-template.csv'; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function choosePathway(id: string) {
    setPathwayId(id); setMemberPage(0);
    if (window.matchMedia('(max-width: 960px)').matches) requestAnimationFrame(() => {
      detailHeading.current?.focus({ preventScroll: true });
      detailHeading.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
  }

  function changePage(next: number) {
    setPage(next); setPathwayId(listed[next * PAGE_SIZE]?.row.id ?? null); setMemberPage(0);
  }

  return <main ref={workspace} className="experiment-workspace" id="experiment-workspace" tabIndex={-1} aria-labelledby="experiment-title">
    <div className="experiment-heading"><h1 id="experiment-title">Analyze results</h1>
      <button className="secondary-button" type="button" onClick={template}><Icon name="download" size={16} />CSV template</button>
    </div>
    <form className="experiment-input" onSubmit={analyze} aria-label="RNA-seq analysis">
      <label className="experiment-file"><span>Human RNA-seq results</span>
        <input ref={fileInput} type="file" accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values" onChange={chooseFile} disabled={busy !== null} aria-describedby="experiment-format" />
      </label>
      {columnInput && <label><span>Gene identifier column</span><select value={identifierColumn} onChange={(event) => chooseColumn(event.target.value)} disabled={busy !== null} required><option value="">Choose column</option>{columnInput.choices.map(({ index, label }) => <option key={index} value={index}>{label}</option>)}</select></label>}
      <label className="experiment-comparison"><span>Comparison</span>
        <input value={comparison} onChange={(event) => setComparison(event.target.value)} required maxLength={160} placeholder="Treatment / control" aria-describedby="experiment-contrast" />
      </label>
      <span className="sr-only" id="experiment-contrast">Enter the numerator and denominator. Positive log2 fold changes describe higher expression in the numerator.</span>
      <label><span>Gene FDR</span><input type="number" required min="0" max="1" step="any" value={geneFdr} onChange={(event) => setGeneFdr(event.target.value)} /></label>
      <label><span>|log₂ fold change|</span><input type="number" required min="0" step="any" value={minimumFoldChange} onChange={(event) => setMinimumFoldChange(event.target.value)} /></label>
      <label className="experiment-background"><input type="checkbox" required checked={allTestedGenes} onChange={(event) => setAllTestedGenes(event.target.checked)} />This table contains all tested genes</label>
      <div className="experiment-run-actions"><button className="primary-button" type="submit" disabled={!pendingTable || busy !== null}>
        {busy === 'analyzing' ? 'Analyzing…' : changed ? 'Apply changes' : 'Analyze results'}<Icon name="arrow" size={16} />
      </button>{(analysis || pendingTable) && <button className="text-button" type="button" onClick={clear} disabled={busy === 'analyzing'}>Remove results</button>}</div>
      {busy === 'reading' && <p className="experiment-input-status" role="status">Reading results…</p>}
      {error && <p className="experiment-error" role="alert">{error}</p>}
      {mapping && pendingTable !== analysis?.table && <div ref={mappingRegion} className="experiment-mapping" tabIndex={-1} role="region" aria-label="Identifier review">
        {mapping.unresolvedCount > 0 && !mapping.collisionCount && <label className="experiment-background"><input type="checkbox" required checked={allowUnresolvedIds} onChange={(event) => setAllowUnresolvedIds(event.target.checked)} />Keep unresolved IDs unannotated in the eligible background</label>}
        <GeneMappingDetails key={pendingTable?.filename} report={mapping} />
      </div>}
      <details className="experiment-input-details"><summary>Input format and privacy</summary>
        <p id="experiment-format">CSV or TSV with one human gene symbol or Ensembl gene ID per row and columns <code>gene</code>, <code>log2FoldChange</code> and <code>padj</code>. Choose the identifier column if several are present. Include the full tested table, including nonsignificant genes. Maximum 5 MiB and 50,000 rows.</p>
        <p>Ensembl IDs use a pinned HGNC cross-reference, with ambiguous/unmapped IDs reported and duplicate gene mappings blocked. Symbol inputs keep exact spelling. Rows missing either statistic remain in the input but are excluded from enrichment. Input species and annotation release are not verified.</p>
        <p>File contents are processed on this device and stay in this tab. They are not uploaded or automatically saved. The CSV template contains synthetic values and demonstrates the format only.</p>
      </details>
    </form>

    {analysis && <section className="experiment-results" aria-labelledby="experiment-results-title">
      <div className="experiment-results-heading"><h2 ref={resultHeading} tabIndex={-1} id="experiment-results-title">{analysis.comparison}</h2><span>{analysis.table.filename} · {integer(analysis.table.rows.length)} uploaded rows</span></div>
      <dl className="experiment-counts">
        <div><dt>Eligible tested genes</dt><dd>{integer(analysis.backgroundGenes.length)}</dd></div>
        <div><dt>Selected genes</dt><dd>{integer(analysis.selected.length)}</dd></div>
        <div><dt>Reference-mapped genes</dt><dd>{integer(analysis.mappedGenesCount)}</dd></div>
        <div><dt>Tested pathways</dt><dd>{integer(analysis.pathways.length)}</dd></div>
      </dl>
      <div className="experiment-results-layout">
        <section className="experiment-pathways" aria-label="Pathway enrichment">
          <div className="experiment-table-tools">
            <label className="experiment-pathway-search"><span className="sr-only">Find pathways</span><input type="search" placeholder="Find pathways" value={query} onChange={(event) => { setQuery(event.target.value); setPage(0); setPathwayId(null); setMemberPage(0); }} /></label>
            <label><span className="sr-only">Sort pathways</span><select aria-label="Sort pathways" value={sort} onChange={(event) => { setSort(event.target.value); setPage(0); setPathwayId(null); setMemberPage(0); }}>
              <option value="fdr">Pathway FDR</option><option value="hits">Selected hits</option><option value="name">Pathway name</option>
            </select></label>
            <div className="experiment-pathway-options">
              <label className="experiment-significance"><input type="checkbox" checked={significantOnly} onChange={(event) => { setSignificantOnly(event.target.checked); setPage(0); setPathwayId(null); setMemberPage(0); }} />Pathway FDR ≤ 0.05</label>
              <label className="experiment-significance"><input ref={groupToggle} type="checkbox" checked={groupOverlaps} onChange={(event) => { setGroupOverlaps(event.target.checked); setPage(0); if (event.target.checked) robustness.request('grouping'); }} />Group overlaps</label>
            </div>
          </div>
          {groupOverlaps && robustness.grouping.status === 'running' && <p role="status">Grouping pathways…</p>}
          {groupOverlaps && robustness.grouping.status === 'error' && <div role="alert"><p>{robustness.grouping.error}</p><button className="secondary-button" type="button" onClick={() => { groupToggle.current?.focus({ preventScroll: true }); robustness.request('grouping'); }}>Retry pathway grouping</button></div>}
          {visibleRows.length ? <>
            <div className="experiment-table-scroll" role="region" aria-label="Pathway results" tabIndex={0}>
              <table className="experiment-table"><thead><tr><th scope="col">Pathway</th><th scope="col">Selected hits</th><th scope="col">Eligible members</th><th scope="col">Pathway FDR</th></tr></thead>
                <tbody>{visibleRows.map(({ row, group }) => <tr key={row.id} data-selected={row.id === selectedPathway?.id || group?.members.some(({ id }) => id === selectedPathway?.id)}>
                  <th scope="row"><button type="button" className="experiment-pathway-choice" aria-pressed={row.id === selectedPathway?.id} onClick={() => choosePathway(row.id)}>{row.name}</button>
                    {group && <PathwayGroupMembers group={group} lookup={pathwayLookup} selectedId={selectedPathway?.id} searching={Boolean(query.trim())} onChoose={choosePathway} />}
                  </th>
                  <td>{integer(row.overlapSize)}</td><td>{integer(row.pathwayMeasuredSize)}</td><td>{formatProbability(row.adjustedPValue, row.logAdjustedPValue)}</td>
                </tr>)}</tbody>
              </table>
            </div>
            <div className="experiment-pagination"><span>{integer(page * PAGE_SIZE + 1)}–{integer(Math.min((page + 1) * PAGE_SIZE, listed.length))} of {integer(listed.length)}{groupOverlaps && robustness.grouping.result ? ` groups (${integer(filtered.length)} pathways)` : ''}</span>
              <nav aria-label="Pathway result pages"><button className="secondary-button" type="button" disabled={page === 0} onClick={() => changePage(page - 1)}>Previous</button><button className="secondary-button" type="button" disabled={(page + 1) * PAGE_SIZE >= listed.length} onClick={() => changePage(page + 1)}>Next</button></nav>
            </div>
          </> : <div className="experiment-empty" role="status"><h3>{query.trim() ? 'No matching pathways' : significantOnly ? 'No pathways pass this FDR cutoff' : 'No eligible genes map to the pathway reference'}</h3>
            {(query || significantOnly) && <button className="secondary-button" type="button" onClick={() => { setQuery(''); setSignificantOnly(false); setPage(0); }}>Show all tested pathways</button>}
          </div>}
        </section>
        {selectedPathway && <section className="experiment-pathway-detail" aria-labelledby="experiment-pathway-title">
          <h3 ref={detailHeading} tabIndex={-1} id="experiment-pathway-title">{selectedPathway.name}</h3>
          <a className="experiment-source-link" href={selectedPathway.url} target="_blank" rel="noreferrer">{selectedPathway.id}<Icon name="external" size={14} /></a>
          <p className="experiment-pathway-summary">{integer(selectedPathway.overlapSize)} selected of {integer(selectedPathway.pathwayMeasuredSize)} eligible members</p>
          <ThresholdSensitivity pathway={selectedPathway} open={sensitivityOpen} onToggle={(open) => { setSensitivityOpen(open); if (open) robustness.request('sensitivity'); }} status={robustness.sensitivity.status} report={robustness.sensitivity.result} error={robustness.sensitivity.error} onRetry={() => robustness.request('sensitivity')} />
          <div className="experiment-table-scroll" role="region" aria-label="Eligible pathway members" tabIndex={0}>
            <table className="experiment-table experiment-member-table"><thead><tr><th scope="col">Gene</th><th scope="col">log₂FC</th><th scope="col">Gene FDR</th><th scope="col">Selected</th></tr></thead>
              <tbody>{eligibleMembers.slice(memberPage * MEMBER_PAGE_SIZE, (memberPage + 1) * MEMBER_PAGE_SIZE).map((row) => <tr key={row.gene}>
                <th scope="row">{row.gene}</th><td>{foldChange(row.log2FoldChange)}</td><td>{row.padj === null ? 'Not recorded' : formatProbability(row.padj)}</td><td>{selectedGenes.has(row.gene) ? 'Yes' : 'No'}</td>
              </tr>)}</tbody>
            </table>
          </div>
          {eligibleMembers.length > MEMBER_PAGE_SIZE && <div className="experiment-pagination"><span>{integer(memberPage * MEMBER_PAGE_SIZE + 1)}–{integer(Math.min((memberPage + 1) * MEMBER_PAGE_SIZE, eligibleMembers.length))} of {integer(eligibleMembers.length)}</span><nav aria-label="Eligible member pages"><button className="secondary-button" type="button" disabled={memberPage === 0} onClick={() => setMemberPage(memberPage - 1)}>Previous</button><button className="secondary-button" type="button" disabled={(memberPage + 1) * MEMBER_PAGE_SIZE >= eligibleMembers.length} onClick={() => setMemberPage(memberPage + 1)}>Next</button></nav></div>}
          <div className="experiment-evidence-links">{eligibleMembers.filter(({ gene }) => curatedGenes.has(gene)).map(({ gene }) => <button className="text-button" type="button" key={gene} onClick={() => onInspectGene(gene)}>View {gene} evidence<Icon name="arrow" size={14} /></button>)}</div>
          {questions.length > 0 && <section className="experiment-questions" aria-label="Questions to investigate"><h4>Questions to investigate</h4>
            {questions.map((item) => <article key={item.id}><h5>{item.question}</h5><p>{item.premise}</p><details><summary>Assumptions and proposed test</summary><ul>{item.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul><p>{item.suggestedTest}</p></details><ul className="experiment-question-sources">{item.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}<Icon name="external" size={13} /></a></li>)}</ul></article>)}
          </section>}
        </section>}
      </div>
      <details className="experiment-methods"><summary>Methods and reference</summary>
        {analysis.identifierMapping && <GeneMappingDetails key={analysis.createdAt} report={analysis.identifierMapping} />}
        <dl className="context-list">
          <div><dt>Selected set</dt><dd>Gene FDR ≤ {analysis.thresholds.adjustedPMax}; |log₂ fold change| ≥ {analysis.thresholds.minAbsLog2FoldChange}. Supplied gene adjusted p-values are used without recalculation.</dd></div>
          <div><dt>Eligible background</dt><dd>{integer(analysis.backgroundGenes.length)} unique symbols with complete log2FoldChange and padj values, including unannotated eligible genes. {integer(analysis.table.missingStatisticsCount)} incomplete rows remain in the uploaded input and are excluded from the enrichment background and selected set.</dd></div>
          <div><dt>Pathway correction</dt><dd>Right-tailed hypergeometric tests; Benjamini–Hochberg correction across all {integer(analysis.pathways.length)} pathways with eligible members, including zero-overlap pathways.</dd></div>
          <div><dt>Overlap groups</dt><dd>Greedy groups use Jaccard ≥0.5 (shared genes / union) on complete eligible pathway membership, including genes outside the selected set. Representatives are chosen by ascending pathway BH, raw p-value, then ID; each member meets the cutoff against its original representative. Groups are navigation aids, not independent mechanisms or Reactome hierarchy. Original pathway statistics and the full BH family are unchanged. Search can show a group representative beside matching members; Jaccard values always refer to that original representative.</dd></div>
          <div><dt>Interpretation</dt><dd>Up/down genes are pooled for membership testing; signed changes remain visible individually. Pathway FDR tests overrepresentation, not pathway activity. Overlapping parent/child pathways are not independent mechanisms. RNA-seq gene-length and expression-dependent selection bias are not modeled. Questions are proposals for investigation; novelty and experimental feasibility have not been established.</dd></div>
          <div><dt>Reference</dt><dd>{analysis.reference.reference_id}</dd></div>
          <div><dt>Upstream Reactome release</dt><dd>{analysis.reference.upstream_release ?? 'Not recorded'}</dd></div>
          <div><dt>Source</dt><dd><a href={analysis.reference.source.url} target="_blank" rel="noreferrer">Pinned gene-set file<Icon name="external" size={13} /></a><br />Commit: {analysis.reference.source.commit}<br />SHA-256: {analysis.reference.source.sha256}</dd></div>
          <div><dt>Reuse</dt><dd>{analysis.reference.source.attribution} <a href={analysis.reference.source.terms_url} target="_blank" rel="noreferrer">{analysis.reference.source.license}<Icon name="external" size={13} /></a></dd></div>
          <div><dt>Input storage</dt><dd>This tab only. File contents are not uploaded or automatically saved.</dd></div>
        </dl>
      </details>
    </section>}
  </main>;
}
