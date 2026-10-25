import { useId, useRef } from 'react';
import { Icon } from './ui.tsx';

export function WorkspaceHelp({ workspace }: { workspace: 'explore' | 'analysis' }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const explore = workspace === 'explore';
  const name = explore ? 'Explore' : 'Analyze results';
  return <>
    <button className="workspace-help-trigger" aria-label={`Help with ${name}`} aria-haspopup="dialog"
      onClick={() => dialog.current?.showModal()}>?</button>
    <dialog className="data-dialog workspace-help-dialog" ref={dialog} aria-labelledby={titleId}>
      <div className="workspace-help-heading">
        <h2 id={titleId}>{name}</h2>
        <button className="icon-button dialog-close" aria-label="Close workspace help" onClick={() => dialog.current?.close()}><Icon name="close" /></button>
      </div>
      {explore ? <>
        <p>Browse biological connections and the scientific sources behind them. The curated evidence library focuses on Alzheimer’s disease.</p>
        <ol>
          <li>Search for a gene, protein, pathway or paper.</li>
          <li>Select an entity to see its direct connections. Expand one level, retrace with Back, or use Overview to see the library with the selection’s connections.</li>
          <li>Choose a finding in the evidence panel and follow its original paper or database record. List provides the same library without using 3D.</li>
        </ol>
        <section className="workspace-help-example" aria-label="Explore example">
          <h3>For example</h3>
          <p>Search <strong>APOE</strong> and choose the gene. Its variant-specific Alzheimer’s association findings and gene-to-protein mapping appear separately. Select <strong>Encodes · APOE protein</strong>, then <strong>View APOE protein</strong> to follow the protein’s pathway and binding evidence.</p>
        </section>
        <p>Each finding retains its study context and limitations. A missing connection describes this library’s coverage.</p>
      </> : <>
        <p>Bring a processed human RNA-seq results table to find pathways with more selected genes than expected among all the genes tested.</p>
        <ol>
          <li>Upload CSV/TSV with gene symbols or Ensembl IDs, log₂ fold changes and adjusted p-values. Include the full tested table, including nonsignificant genes.</li>
          <li>Name the groups compared, choose gene cutoffs and select Analyze. Use <strong>Try example</strong> to start with invented measurements.</li>
          <li>Choose a pathway to inspect its genes, cutoff sensitivity, overlapping pathways and available scientific evidence.</li>
        </ol>
        <dl className="workspace-help-terms">
          <div><dt>Gene FDR</dt><dd>The adjusted p-value supplied in your table. A lower cutoff selects fewer genes.</dd></div>
          <div><dt>log₂ fold change</dt><dd>The RNA change between your groups: +1 means twice as much; −1 means half as much.</dd></div>
          <div><dt>Pathway FDR</dt><dd>The adjusted p-value calculated here for pathway overrepresentation using the pinned Reactome reference.</dd></div>
        </dl>
        <section className="workspace-help-example" aria-label="Analysis example">
          <h3>For example</h3>
          <p>In the synthetic example, <strong>APOE</strong> has log₂FC <strong>+2.1</strong> and gene FDR <strong>0.008</strong>, so it passes cutoffs of FDR ≤ 0.05 and |log₂FC| ≥ 1.</p>
          <p>Of 120 tested genes, 12 pass. Ten of the 12 selected genes belong to a Reactome lipoprotein pathway, compared with 13 of the 120 tested genes overall. The app tests that overlap, then links covered genes to the curated evidence library.</p>
        </section>
        <p>Files stay in this tab. Enrichment describes gene membership; pathway activity needs separate evidence. Human pathway analysis extends beyond Alzheimer’s, while the curated evidence library remains focused on it.</p>
      </>}
    </dialog>
  </>;
}
