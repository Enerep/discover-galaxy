import { useRef } from 'react';
import { formatProbability } from '../lib/experiment-analysis.ts';
import type { EnrichmentResult } from '../lib/enrichment.ts';
import type { ThresholdSensitivity as Report } from '../lib/experiment-robustness.ts';

interface Props {
  pathway: EnrichmentResult;
  open: boolean;
  onToggle: (open: boolean) => void;
  status: 'idle' | 'running' | 'ready' | 'error';
  report: Report | null;
  error: string;
  onRetry: () => void;
}

export function ThresholdSensitivity({ pathway, open, onToggle, status, report, error, onRetry }: Props) {
  const summary = useRef<HTMLElement>(null);
  const passing = report?.settings.filter((setting) => setting.results.some((result) => result.id === pathway.id && result.adjustedPValue <= report.pathwayFdrMax)).length ?? 0;
  return <details className="experiment-sensitivity" open={open} onToggle={(event) => onToggle(event.currentTarget.open)}>
    <summary ref={summary}>Threshold sensitivity</summary>
    {status === 'running' && <p role="status">Checking thresholds…</p>}
    {status === 'error' && <div role="alert"><p>{error}</p><button className="secondary-button" type="button" onClick={() => { summary.current?.focus({ preventScroll: true }); onRetry(); }}>Retry threshold check</button></div>}
    {report && <>
      <p className="experiment-sensitivity-count">Pathway FDR ≤ 0.05 in {passing} of {report.settings.length} settings</p>
      <div className="experiment-table-scroll" role="region" aria-label="Pathway threshold sensitivity" tabIndex={0}>
        <table className="experiment-table experiment-sensitivity-table"><caption>Pathway FDR across gene cutoffs</caption>
          <thead><tr><th rowSpan={2} scope="col">Gene FDR</th><th colSpan={report.foldChangeValues.length} scope="colgroup">|log₂ fold change|</th></tr><tr>{report.foldChangeValues.map((value) => <th key={value} scope="col">{value}</th>)}</tr></thead>
          <tbody>{report.geneFdrValues.map((geneFdr) => <tr key={geneFdr}><th scope="row">{geneFdr}</th>{report.foldChangeValues.map((fold) => {
            const setting = report.settings.find(({ thresholds }) => thresholds.adjustedPMax === geneFdr && thresholds.minAbsLog2FoldChange === fold)!;
            const result = setting.results.find(({ id }) => id === pathway.id)!;
            const probability = formatProbability(result.adjustedPValue, result.logAdjustedPValue);
            return <td key={fold} data-applied={setting.applied} data-significant={result.adjustedPValue <= report.pathwayFdrMax}>
              <span aria-hidden="true">{probability}{setting.applied && <span className="experiment-applied-label">Applied</span>}</span>
              <span className="sr-only">{probability}; {result.adjustedPValue <= report.pathwayFdrMax ? 'passes' : 'outside'} pathway FDR 0.05; {setting.selectedCount} selected genes{setting.applied ? '; applied cutoffs' : ''}</span>
            </td>;
          })}</tr>)}</tbody>
        </table>
      </div>
      <details><summary>Counts and method</summary>
        <p>Gene FDR is halved/doubled, capped at 1; absolute log₂ fold change varies by ±0.5, floored at 0. Duplicate settings are removed. Every setting uses the same {report.backgroundSize.toLocaleString('en-US')} eligible genes and the complete tested pathway family, with BH correction calculated separately. No correction across settings is applied. Supplied gene FDR values stay unchanged. Passing several settings describes cutoff sensitivity; it is not confidence, replication or a pathway-activity test.</p>
        <div className="experiment-table-scroll" role="region" aria-label="Threshold setting counts" tabIndex={0}><table className="experiment-table"><thead><tr><th scope="col">Gene FDR</th><th scope="col">|log₂FC|</th><th scope="col">Selected genes</th><th scope="col">Tested pathways</th><th scope="col">Pathway FDR ≤ 0.05</th></tr></thead><tbody>{report.settings.map((setting, index) => <tr key={index}><th scope="row">{setting.thresholds.adjustedPMax}</th><td>{setting.thresholds.minAbsLog2FoldChange}</td><td>{setting.selectedCount.toLocaleString('en-US')}</td><td>{setting.pathwayCount.toLocaleString('en-US')}</td><td>{setting.significantCount.toLocaleString('en-US')}</td></tr>)}</tbody></table></div>
      </details>
    </>}
  </details>;
}
