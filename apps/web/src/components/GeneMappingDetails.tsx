import { useMemo, useState } from 'react';
import type { GeneMappingReport } from '../lib/gene-identifiers.ts';

export function GeneMappingDetails({ report }: { report: GeneMappingReport }) {
  const [query, setQuery] = useState('');
  const [issuesOnly, setIssuesOnly] = useState(report.unresolvedCount + report.collisionCount > 0);
  const [page, setPage] = useState(0);
  const filtered = useMemo(() => report.rows.filter((row) => (!issuesOnly || row.status !== 'mapped')
    && (!query.trim() || `${row.inputId} ${row.candidates.map(({ symbol }) => symbol).join(' ')}`.toLocaleLowerCase('en-US').includes(query.trim().toLocaleLowerCase('en-US')))), [report, query, issuesOnly]);
  const labels = { mapped: 'Mapped', unmapped: 'Not found', ambiguous: 'Ambiguous', collision: 'Duplicate gene' };
  return <details className="experiment-identifiers" open={report.unresolvedCount + report.collisionCount > 0}>
    <summary>Identifier mapping · {report.mappedCount.toLocaleString('en-US')} mapped{report.unresolvedCount > 0 ? ` · ${report.unresolvedCount.toLocaleString('en-US')} unresolved` : ''}{report.collisionCount > 0 ? ` · ${report.collisionCount.toLocaleString('en-US')} duplicate rows` : ''}</summary>
    <div className="experiment-table-tools">
      <label><span className="sr-only">Find identifiers</span><input type="search" aria-label="Find identifiers" value={query} onChange={(event) => { setQuery(event.target.value); setPage(0); }} /></label>
      <label className="experiment-significance"><input type="checkbox" checked={issuesOnly} onChange={(event) => { setIssuesOnly(event.target.checked); setPage(0); }} />Unresolved or duplicate only</label>
    </div>
    {filtered.length ? <>
      <div className="experiment-table-scroll" role="region" aria-label="Gene identifier mappings" tabIndex={0}>
        <table className="experiment-table"><thead><tr><th scope="col">Input ID</th><th scope="col">HGNC symbol</th><th scope="col">Status</th></tr></thead><tbody>
          {filtered.slice(page * 20, (page + 1) * 20).map((row) => <tr key={row.inputId}><th scope="row">{row.inputId}</th><td>{row.candidates.length ? row.candidates.map(({ hgncId, symbol }) => <div key={hgncId}><a href={`https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/${hgncId}`} target="_blank" rel="noreferrer">{symbol} ({hgncId})</a></div>) : '—'}</td><td>{labels[row.status]}</td></tr>)}
        </tbody></table>
      </div>
      <div className="experiment-pagination"><span>{page * 20 + 1}–{Math.min((page + 1) * 20, filtered.length)} of {filtered.length.toLocaleString('en-US')}</span><nav aria-label="Identifier mapping pages"><button className="secondary-button" type="button" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button><button className="secondary-button" type="button" disabled={(page + 1) * 20 >= filtered.length} onClick={() => setPage(page + 1)}>Next</button></nav></div>
    </> : <p>No matching identifiers.</p>}
    <p>{report.versionedCount.toLocaleString('en-US')} version suffixes removed for lookup only; original IDs and statistics are retained. No alias or case conversion. Unresolved IDs stay unannotated in the eligible background; duplicate mappings block analysis.</p>
    <p>{report.reference.source.attribution} <a href={report.reference.source.url} target="_blank" rel="noreferrer">Pinned HGNC reference</a> · <a href={report.reference.source.terms_url} target="_blank" rel="noreferrer">CC0</a><br />Reference: {report.reference.reference_id}<br />SHA-256: {report.reference.source.sha256}</p>
  </details>;
}
