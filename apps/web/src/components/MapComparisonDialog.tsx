import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { buildMapComparisonBrief, formatOddsRatio } from '../lib/map-comparison.ts';
import type { MapComparison, MapComparisonCohort } from '../lib/map-comparison.ts';
import { sourceCitation } from '../lib/source-format.ts';
import { Icon } from './ui.tsx';
import { PublicationStatus } from './PublicationStatus.tsx';
import './map-comparison.css';

function OddsRatios({ cohorts }: { cohorts: MapComparisonCohort[] }) {
  // Powers of two keep multiplicative distances equal and include the null at one.
  const min = Math.floor(Math.log2(Math.min(0.5, ...cohorts.map(({ lower }) => lower))));
  const max = Math.ceil(Math.log2(Math.max(2, ...cohorts.map(({ upper }) => upper))));
  const ticks = Array.from({ length: max - min + 1 }, (_, index) => 2 ** (min + index));
  const offset = (value: number) => 100 * (Math.log2(value) - min) / (max - min);
  return <figure className="map-odds">
    <figcaption>Adjusted odds ratios (95% CI)</figcaption>
    {cohorts.map((cohort) => <div className="map-odds-row" key={cohort.claimId}>
      <span>{cohort.label}</span>
      <div className="map-odds-track" aria-hidden="true">
        <i className="map-odds-reference" style={{ left: `${offset(1)}%` }} />
        <i className="map-odds-interval" style={{ left: `${offset(cohort.lower)}%`, width: `${offset(cohort.upper) - offset(cohort.lower)}%` }} />
        <i className="map-odds-marker" style={{ left: `${offset(cohort.estimate)}%` }} />
      </div>
      <strong>{formatOddsRatio(cohort)}</strong>
    </div>)}
    <div className="map-odds-row map-odds-axis" aria-hidden="true">
      <div className="map-odds-ticks">
        {ticks.map((tick) => <span key={tick} style={{ left: `${offset(tick)}%` }}>{tick}</span>)}
      </div>
      <span>Log scale</span>
    </div>
  </figure>;
}

export function MapComparisonDialog({ open, comparison, onClose, onViewFinding }: {
  open: boolean;
  comparison: MapComparison;
  onClose: () => void;
  onViewFinding: (cohort: MapComparisonCohort) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [downloadUrl, setDownloadUrl] = useState('');

  useLayoutEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    else if (!open && dialog.current?.open) dialog.current.close();
  }, [open]);

  useEffect(() => {
    if (!open) { setDownloadUrl(''); return; }
    const url = URL.createObjectURL(new Blob([buildMapComparisonBrief(comparison)], { type: 'text/markdown;charset=utf-8' }));
    setDownloadUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [open, comparison]);

  const { source, controls, cohorts, review } = comparison;
  return <dialog className="data-dialog comparison-dialog map-comparison-dialog" ref={dialog} aria-labelledby={titleId}
    onCancel={(event) => { event.preventDefault(); onClose(); }}>
    {open && <>
      <button className="icon-button dialog-close" type="button" aria-label="Close map comparison" onClick={onClose}><Icon name="close" /></button>
      <h2 id={titleId}>{comparison.title}</h2>
      <div className="map-comparison-source">
        <a href={source.url} target="_blank" rel="noreferrer">{sourceCitation(source)}<Icon name="external" size={14} /></a>
        <span className="draft-label">Source-checked draft</span>
      </div>
      <p className="map-comparison-controls">Both estimates use the same <strong>{controls.count} autopsied controls</strong>, including {controls.carriers} ε4 carriers.</p>
      <OddsRatios cohorts={cohorts} />
      <p className="map-comparison-interpretation">{comparison.interpretation}</p>

      <div className="comparison-findings map-comparison-cohorts">
        {cohorts.map((cohort) => <section className="comparison-finding map-cohort" key={cohort.claimId} aria-label={cohort.name}>
          <h3>{cohort.name}</h3>
          <p>{cohort.definition}</p>
          <p className="map-cohort-counts"><strong>{cohort.count}</strong> cases · <strong>{cohort.carriers}</strong> ε4 carriers</p>
          <button className="text-button" type="button" aria-label={`View ${cohort.name} finding`} onClick={() => onViewFinding(cohort)}>
            View finding<Icon name="arrow" size={15} />
          </button>
        </section>)}
      </div>

      <details className="comparison-provenance map-comparison-context">
        <summary>Study context and limits</summary>
        <dl className="context-list">
          <div><dt>Shared controls</dt><dd>{controls.definition}</dd></div>
          <div><dt>Study population</dt><dd>{comparison.population}</dd></div>
          <div><dt>Analysis</dt><dd>One or two ε4 alleles versus none. {comparison.model}.</dd></div>
          <div><dt>Original results</dt><dd>Carrier counts were summed from Table 2 genotypes. Odds ratios and 95% intervals use the adjusted AD and pDLB rows of Table 3.</dd></div>
          <div><dt>Source check</dt><dd>{review.reviewer} · {review.date}. {review.rationale}</dd></div>
        </dl>
        <p>The paper also reports separate Parkinson disease dementia and mixed high Alzheimer’s plus Lewy body pathology groups. The authors lacked ancestry-informative markers.</p>
        <PublicationStatus source={source} />
      </details>
      <div className="comparison-actions">
        {downloadUrl && <a className="primary-button" href={downloadUrl} download={`${comparison.version}.md`}
          ><Icon name="download" size={17} />Download comparison</a>}
      </div>
    </>}
  </dialog>;
}
