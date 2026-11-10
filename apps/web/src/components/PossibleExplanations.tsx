import { useMemo } from 'react';
import type { ExperimentAnalysis } from '../lib/experiment-analysis.ts';
import { formatProbability } from '../lib/experiment-analysis.ts';
import { buildApoeExplanationComparison } from '../lib/experiment-explanations.ts';
import { ExperimentContextDetails } from './ExperimentContextDetails.tsx';
import { Icon } from './ui.tsx';

export function PossibleExplanations({ analysis, pathwayId }: { analysis: ExperimentAnalysis; pathwayId: string }) {
  const report = useMemo(() => buildApoeExplanationComparison(analysis, pathwayId), [analysis, pathwayId]);
  if (!report) return null;
  const higher = report.observation.log2FoldChange > 0;
  const signedFoldChange = `${higher ? '+' : ''}${report.observation.log2FoldChange}`;
  return <details className="experiment-explanations" data-synthetic={report.isSynthetic}>
    <summary>{report.isSynthetic ? 'Example explanations' : 'Possible explanations'}</summary>
    <h4>What could contribute to {higher ? 'higher' : 'lower'} APOE RNA?</h4>
    {report.isSynthetic && <p>Synthetic example · invented measurements</p>}
    <p>{report.comparison}</p>
    <dl className="experiment-explanation-observation">
      <div><dt>APOE log₂ fold change</dt><dd>{signedFoldChange}</dd></div>
      <div><dt>APOE gene FDR</dt><dd>{formatProbability(report.observation.padj)}</dd></div>
      <div><dt>Selected pathway members</dt><dd>{report.pathway.overlapSize} of {report.pathway.pathwayMeasuredSize} eligible</dd></div>
      <div><dt>Pathway FDR</dt><dd>{formatProbability(report.pathway.adjustedPValue, report.pathway.logAdjustedPValue)}</dd></div>
    </dl>
    <p>Applied cutoffs: gene FDR ≤ {report.thresholds.adjustedPMax}; |log₂ fold change| ≥ {report.thresholds.minAbsLog2FoldChange}.</p>
    <p>{report.limitations[0]}</p>
    {report.explanations.map((explanation) => <article className="experiment-explanation-alternative" key={explanation.id}>
      <h5>{explanation.title}</h5>
      <p>{explanation.description}</p>
      <details><summary>Assumptions</summary><ul>{explanation.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul></details>
    </article>)}
    <section aria-label="Published interpretation context">
      <h5>Published context</h5>
      {report.sources.map((source) => <article className="experiment-explanation-source" key={source.id}>
        <a href={source.url} target="_blank" rel="noreferrer">{source.title}<Icon name="external" size={13} /></a>
        <p>{source.short_label} · {source.publication_type === 'reanalysis' ? 'Same-cohort reanalysis' : 'Original study'}</p>
        {source.publication_status.notice_url && <a href={source.publication_status.notice_url} target="_blank" rel="noreferrer">Author correction<Icon name="external" size={13} /></a>}
        <p>{source.premise}</p>
        <details><summary>Source locations and checks</summary>
          <ul className="experiment-question-sources">{source.locators.map((locator) => <li key={locator.url}>
            <a href={locator.url} target="_blank" rel="noreferrer">{locator.label}<Icon name="external" size={13} /></a>
          </li>)}</ul>
          <ul>{source.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul>
          <dl className="context-list">
            <div><dt>Organism and tissue</dt><dd>{source.study_context.organism} · {source.study_context.tissue}</dd></div>
            <div><dt>Study design</dt><dd>{source.study_context.design}</dd></div>
            <div><dt>Participants</dt><dd>{source.study_context.participants}</dd></div>
            <div><dt>Nuclei</dt><dd>{source.study_context.nuclei ?? 'Not recorded'}</dd></div>
            <div><dt>Replicate unit</dt><dd>{source.study_context.replicate_unit}</dd></div>
            <div><dt>Cohort identity</dt><dd>{source.cohort_id}</dd></div>
            <div><dt>Publication identifiers</dt><dd>DOI: {source.identifiers.doi}<br />PMID: {source.identifiers.pmid}<br />PMCID: {source.identifiers.pmcid}</dd></div>
            <div><dt>Publication version</dt><dd>{source.publication_version}</dd></div>
            <div><dt>Publication status</dt><dd>{source.publication_status.status === 'not_checked' ? 'Not checked' : 'Corrected'}{source.publication_status.checked_at && ` · checked ${source.publication_status.checked_at}`}<br />{source.publication_status.scope}</dd></div>
            <div><dt>Source inspection</dt><dd>{source.source_check.inspection_scope}<br />Retrieved: {source.source_check.retrieved_at}</dd></div>
            <div><dt>Retrieved page SHA-256</dt><dd>{source.source_check.sha256}</dd></div>
            <div><dt>Reuse</dt><dd>{source.reuse.attribution}<br />{source.reuse.retained_content}<br />{source.reuse.permission_status === 'permitted' ? 'Permitted' : 'Pending review'} · checked {source.reuse.date_checked}<br /><a href={source.reuse.terms_url} target="_blank" rel="noreferrer">Source terms<Icon name="external" size={13} /></a></dd></div>
          </dl>
        </details>
      </article>)}
    </section>
    <section className="experiment-explanation-test" aria-label="Proposed follow-up">
      <h5>{report.suggestedTest.title}</h5>
      <ol>{report.suggestedTest.steps.map((step) => <li key={step}>{step}</li>)}</ol>
      <details><summary>Measurement limits</summary><ul>{report.suggestedTest.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul></details>
    </section>
    <details className="experiment-explanation-limits"><summary>Applied context and scope</summary>
      <ExperimentContextDetails context={report.context} />
      <ul>{report.limitations.slice(1).map((limitation) => <li key={limitation}>{limitation}</li>)}</ul>
      <dl className="context-list">
        {report.observation.sourceId && <div><dt>Original input ID</dt><dd>{report.observation.sourceId}</dd></div>}
        <div><dt>Pathway reference</dt><dd>{report.referenceId}</dd></div>
      </dl>
    </details>
  </details>;
}
