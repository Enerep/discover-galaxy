import { useMemo, useState } from 'react';
import type { ExperimentAnalysis } from '../lib/experiment-analysis.ts';
import type { Snapshot } from '../lib/types.ts';
import { buildPathwayEvidence, coverageLabel } from '../lib/pathway-evidence.ts';
import { findingLabel, sourceCitation } from '../lib/source-format.ts';
import { PublicationStatus } from './PublicationStatus.tsx';
import { StudyContextNote } from './StudyContextNote.tsx';
import { Icon } from './ui.tsx';

const PAGE_SIZE = 20;

interface Props {
  snapshot: Snapshot;
  analysis: ExperimentAnalysis;
  pathwayId: string;
  onInspectFinding: (claimId: string) => void;
}

export function PathwayEvidence({ snapshot, analysis, pathwayId, onInspectFinding }: Props) {
  const report = useMemo(() => buildPathwayEvidence(snapshot, analysis, pathwayId), [snapshot, analysis, pathwayId]);
  const [page, setPage] = useState(0);
  const covered = report.genes.filter(({ paperIds }) => paperIds.length).length;
  return <section className="experiment-literature" aria-label="Pathway evidence">
    <h4>Evidence</h4>
    <p className="experiment-coverage-summary">{report.genes.length
      ? `${covered} of ${report.genes.length} selected genes have paper findings in this library.`
      : 'No selected genes in this pathway at the applied cutoffs.'}</p>
    {report.genes.length > 0 && <details className="experiment-coverage">
      <summary>Coverage by selected gene</summary>
      <div className="experiment-table-scroll" role="region" aria-label="Selected gene evidence coverage" tabIndex={0}>
        <table className="experiment-table experiment-coverage-table"><thead><tr><th scope="col">Gene</th><th scope="col">Curated coverage</th></tr></thead>
          <tbody>{report.genes.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((gene) => <tr key={gene.gene}><th scope="row">{gene.gene}</th><td>{coverageLabel(gene)}</td></tr>)}</tbody>
        </table>
      </div>
      {report.genes.length > PAGE_SIZE && <div className="experiment-pagination"><span>{page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, report.genes.length)} of {report.genes.length}</span>
        <nav aria-label="Evidence coverage pages"><button className="secondary-button" type="button" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button><button className="secondary-button" type="button" disabled={(page + 1) * PAGE_SIZE >= report.genes.length} onClick={() => setPage(page + 1)}>Next</button></nav>
      </div>}
      <p>This is coverage of our curated library, not a comprehensive literature search. Database records are not counted as original papers; missing coverage does not establish a scientific research gap.</p>
      <p>Matches use exact gene symbols and cited gene–protein mappings, without following other interactions. Variant associations and protein assays are study context, not measurements of your RNA result. Findings are grouped by paper; separate citations do not establish independent replication.</p>
    </details>}
    {report.papers.length > 0 && <>
      <p className="experiment-literature-scope">Studies about the selected genes or their encoded proteins; they do not establish this pathway’s behavior in your samples.</p>
      <div className="experiment-papers">{report.papers.map(({ source, findings }) => <details className="experiment-paper" key={source.id} data-source-id={source.id}>
        <summary><span>{sourceCitation(source)}</span><span>{source.title}</span></summary>
        <a className="experiment-paper-source" href={source.url} target="_blank" rel="noreferrer">Original paper<Icon name="external" size={14} /></a>
        {(source.publication_status.status === 'corrected' || source.publication_status.status === 'retracted') && <PublicationStatus source={source} />}
        {findings.map(({ claim, evidence, genes }) => <article key={claim.id} data-claim-id={claim.id}>
          <p className="experiment-finding-genes">Selected {genes.length === 1 ? 'gene' : 'genes'}: {genes.join(', ')}</p>
          <p>{claim.statement}</p>
          {evidence.filter(({ relation }) => relation !== 'supports').map((item) => <p className="experiment-finding-relation" key={item.id}>Recorded evidence: {item.relation}</p>)}
          <button className="text-button" type="button" aria-label={`View finding: ${findingLabel(snapshot, claim)}`} onClick={() => onInspectFinding(claim.id)}>View finding<Icon name="arrow" size={14} /></button>
        </article>)}
      </details>)}</div>
      {report.contextNotes.map((note) => <StudyContextNote key={note.id} snapshot={snapshot} note={note} headingLevel={5} />)}
    </>}
  </section>;
}
