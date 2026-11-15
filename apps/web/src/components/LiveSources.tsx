import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { AnnotationPacket, GeneIdentity } from '../../../../shared/source-intake/biomedical.ts';
import type { CandidateIntakePacket } from '../../../../shared/source-intake/openalex.ts';
import { fetchLiveSource, LIVE_PROVIDERS } from '../lib/live-source-lookup.ts';
import type { LiveSourceResult } from '../lib/live-source-lookup.ts';
import { Icon } from './ui.tsx';
import '../live-sources.css';

type LiveProvider = typeof LIVE_PROVIDERS[number];
type SourceState = { status: 'idle' | 'loading' | 'ready' | 'error'; result: LiveSourceResult | null; error: string; canRetry: boolean };
const PROVIDER_NAMES: Record<LiveProvider, string> = { uniprot: 'UniProt', reactome: 'Reactome', opentargets: 'Open Targets', openalex: 'OpenAlex' };
const initialState = (): Record<LiveProvider, SourceState> => ({
  uniprot: { status: 'idle', result: null, error: '', canRetry: false }, reactome: { status: 'idle', result: null, error: '', canRetry: false },
  opentargets: { status: 'idle', result: null, error: '', canRetry: false }, openalex: { status: 'idle', result: null, error: '', canRetry: false },
});

function utc(value: string): string {
  return new Date(value).toISOString().replace('T', ' ').replace(/\.\d{3}Z$/u, ' UTC');
}

function SourceLink({ url, children }: { url: string; children: ReactNode }) {
  return <a href={url} target="_blank" rel="noreferrer">{children}<Icon name="external" size={12} /></a>;
}

function Work({ work }: { work: CandidateIntakePacket['candidates'][number] }) {
  return <li>
    <SourceLink url={work.doi_url ?? work.pubmed_url ?? work.openalex_id}>{work.title ?? 'Untitled OpenAlex work'}</SourceLink>
    <span className="live-source-record-meta">{work.publication_year ?? 'Year unknown'}{work.work_type ? ` · ${work.work_type}` : ''}</span>
    {work.provider_is_retracted === true && <p className="live-source-notice">OpenAlex reports a retraction.</p>}
    <details className="live-source-record-details"><summary>Work metadata</summary>
      <dl className="context-list">
        <div><dt>OpenAlex record</dt><dd><SourceLink url={work.openalex_id}>{work.openalex_id}</SourceLink></dd></div>
        {work.pubmed_url && <div><dt>PubMed record</dt><dd><SourceLink url={work.pubmed_url}>{work.pubmed_url}</SourceLink></dd></div>}
        <div><dt>Provider retraction flag</dt><dd>{work.provider_is_retracted === null ? 'Unknown' : String(work.provider_is_retracted)} · not independently checked</dd></div>
        <div><dt>Provider updated</dt><dd>{work.provider_updated_at ?? 'Not supplied'}</dd></div>
        <div><dt>Grouped records</dt><dd>{work.source_record_ids.join(', ')}</dd></div>
        {work.review_flags.length > 0 && <div><dt>Review flags</dt><dd>{work.review_flags.join(', ')}</dd></div>}
      </dl>
    </details>
  </li>;
}

function Annotation({ record }: { record: AnnotationPacket['records'][number] }) {
  if (record.kind === 'protein_identity') return <li>
    <SourceLink url={record.url}>{record.protein_name}</SourceLink>
    <span className="live-source-record-meta">{record.gene_symbol} · {record.accession} · human</span>
    <dl className="context-list">
      <div><dt>Entry version</dt><dd>{record.entry_version} · annotation updated {record.annotation_updated_at}</dd></div>
      <div><dt>Provider review</dt><dd>{record.provider_reviewed ? 'Reviewed UniProt entry' : 'Unreviewed UniProt entry'}</dd></div>
      <div><dt>Ensembl cross-reference</dt><dd>{record.ensembl_cross_reference_verified ? 'Matches the requested gene' : 'Not verified in this entry'}</dd></div>
    </dl>
  </li>;
  if (record.kind === 'pathway_mapping') return <li>
    <SourceLink url={record.url}>{record.name}</SourceLink>
    <span className="live-source-record-meta">{record.pathway_id}{record.record_revision ? ` · revision ${record.record_revision}` : ''}</span>
  </li>;
  return <li>
    <SourceLink url={record.url}>{record.name}</SourceLink>
    <span className="live-source-record-meta">Association score: {record.overall_association_score}</span>
    <details className="live-source-record-details"><summary>Identifiers and data-source scores</summary>
      <dl className="context-list">
        <div><dt>Target / disease</dt><dd>{record.target_id} / {record.disease_id}</dd></div>
        {record.datasource_scores.map(({ id, score }) => <div key={id}><dt>{id}</dt><dd>{score}</dd></div>)}
      </dl>
    </details>
  </li>;
}

const annotationKey = (record: AnnotationPacket['records'][number]) => record.kind === 'protein_identity' ? record.accession
  : record.kind === 'pathway_mapping' ? record.pathway_id : record.disease_id;

function ProviderRecords({ result }: { result: LiveSourceResult }) {
  if (result.provider === 'openalex') {
    const { packet } = result;
    return <>
      <p className="live-source-scope">Literature metadata · search: {packet.query}</p>
      <p className="live-source-scope">{packet.candidates.length} grouped works from {packet.candidates.length + packet.duplicate_records.length} returned records; {packet.provider_result_count.toLocaleString('en-US')} matches reported. Matches need original-paper review.</p>
      {packet.candidates.length > 0 ? <ul className="live-source-records">{packet.candidates.slice(0, 5).map((work) => <Work key={work.candidate_id} work={work} />)}</ul> : <p>No works returned for this search.</p>}
      {packet.candidates.length > 5 && <details className="live-source-more"><summary>Remaining {packet.candidates.length - 5} returned works</summary><ul className="live-source-records">{packet.candidates.slice(5).map((work) => <Work key={work.candidate_id} work={work} />)}</ul></details>}
    </>;
  }
  const { packet } = result;
  return <>
    {result.provider === 'reactome' && <p className="live-source-scope">Human pathways mapped from {packet.identity.uniprot}. Membership does not establish pathway activity.</p>}
    {result.provider === 'opentargets' && <p className="live-source-scope">First {packet.records.length} direct target–disease associations. Provider scores are not probabilities.</p>}
    {packet.records.length > 0 ? <ul className="live-source-records">{packet.records.slice(0, 5).map((record) => <Annotation key={annotationKey(record)} record={record} />)}</ul> : <p>No records returned in this request.</p>}
    {packet.records.length > 5 && <details className="live-source-more"><summary>Remaining {packet.records.length - 5} returned records</summary><ul className="live-source-records">{packet.records.slice(5).map((record) => <Annotation key={annotationKey(record)} record={record} />)}</ul></details>}
  </>;
}

function Provenance({ result }: { result: LiveSourceResult }) {
  const packet = result.packet;
  const biomedical = result.provider === 'openalex' ? null : result.packet;
  const literature = result.provider === 'openalex' ? result.packet : null;
  return <details className="live-source-provenance"><summary>Provenance and terms</summary>
    <dl className="context-list">
      <div><dt>Retrieved</dt><dd>{packet.retrieved_at ? utc(packet.retrieved_at) : 'Not recorded'}</dd></div>
      <div><dt>Request</dt><dd>{biomedical?.request.method ?? 'GET'} <SourceLink url={biomedical?.request.url ?? literature!.request_url}>{biomedical?.request.url ?? literature!.request_url}</SourceLink>{biomedical?.request.body && <pre>{biomedical.request.body}</pre>}</dd></div>
      <div><dt>Raw response SHA-256</dt><dd><code>{packet.response_sha256 ?? 'Not recorded'}</code></dd></div>
      <div><dt>Provider release</dt><dd>{biomedical?.provider_release ?? 'Not supplied'}</dd></div>
      {biomedical?.provider_version && <div><dt>Version components</dt><dd><code>{JSON.stringify(biomedical.provider_version)}</code></dd></div>}
      {biomedical && <div><dt>Returned coverage</dt><dd>{biomedical.coverage.retained} retained; total {biomedical.coverage.total_reported ?? 'unknown'}; truncated: {biomedical.coverage.truncated === null ? 'unknown' : String(biomedical.coverage.truncated)}.<br />{biomedical.coverage.scope}</dd></div>}
      {literature && <div><dt>Duplicate metadata</dt><dd>{literature.duplicate_records.length} duplicate records grouped by identifiers; this does not establish independent studies.</dd></div>}
      <div><dt>Terms</dt><dd><SourceLink url={biomedical?.reuse.terms_url ?? literature!.metadata_terms_url}>{biomedical?.reuse.license ?? literature!.metadata_license}</SourceLink><br />{biomedical?.reuse.attribution ?? literature!.attribution}</dd></div>
    </dl>
    <ul className="live-source-limits">{packet.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul>
  </details>;
}

export function LiveSources({ identity }: { identity: GeneIdentity }) {
  const [states, setStates] = useState(initialState);
  const [requested, setRequested] = useState(false);
  const mounted = useRef(true);
  const sequence = useRef(0);
  const active = useRef(new Map<LiveProvider, { controller: AbortController; token: number }>());
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      for (const { controller } of active.current.values()) controller.abort();
      active.current.clear();
    };
  }, []);

  async function request(provider: LiveProvider) {
    active.current.get(provider)?.controller.abort();
    const controller = new AbortController();
    const token = ++sequence.current;
    active.current.set(provider, { controller, token });
    setRequested(true);
    setStates((current) => ({ ...current, [provider]: { ...current[provider], status: 'loading', error: '' } }));
    try {
      const result = await fetchLiveSource(provider, identity, { signal: controller.signal });
      if (!mounted.current || active.current.get(provider)?.token !== token) return;
      setStates((current) => ({ ...current, [provider]: { ...current[provider], status: 'ready', result, error: '' } }));
    } catch (cause) {
      if (!mounted.current || active.current.get(provider)?.token !== token || controller.signal.aborted) return;
      setStates((current) => ({ ...current, [provider]: { ...current[provider], status: 'error', canRetry: true, error: cause instanceof Error ? cause.message : 'This source could not be loaded. Try again.' } }));
    } finally {
      if (active.current.get(provider)?.token === token) active.current.delete(provider);
    }
  }

  const busy = LIVE_PROVIDERS.some((provider) => states[provider].status === 'loading');
  return <details className="live-sources">
    <summary><span>Live sources</span><Icon name="down" size={16} /></summary>
    <div className="live-sources-body">
      <p>Send public {identity.symbol} identifiers ({identity.uniprot}, {identity.ensembl}) to UniProt, Reactome, Open Targets and OpenAlex. Uploaded results stay local.</p>
      <button className="secondary-button" type="button" aria-disabled={busy} onClick={() => { if (!busy) for (const provider of LIVE_PROVIDERS) void request(provider); }}>{requested ? 'Refresh live sources' : 'Check live sources'}</button>
      {requested && <section className="live-source-results" aria-label="Live source results">
        <h3>Live results · unreviewed</h3>
        <p className="sr-only" role="status">{busy ? 'Loading live sources.' : 'Live source requests finished.'}</p>
        {LIVE_PROVIDERS.map((provider) => {
          const state = states[provider];
          return <section className="live-source-provider" key={provider} aria-label={PROVIDER_NAMES[provider]} aria-busy={state.status === 'loading'}>
            <h4>{PROVIDER_NAMES[provider]}</h4>
            {state.status === 'loading' && <p className="live-source-status" role="status">{state.result ? 'Refreshing…' : 'Loading…'}</p>}
            {state.status === 'error' && <div className="live-source-error"><p role="alert">{state.error}{state.result ? ' Previous result retained.' : ''}</p></div>}
            {state.canRetry && <button className="text-button live-source-retry" type="button" aria-disabled={state.status === 'loading'} onClick={() => { if (state.status !== 'loading') void request(provider); }}>{state.status === 'ready' ? 'Refresh' : 'Retry'} {PROVIDER_NAMES[provider]}</button>}
            {state.result && <>
              <p className="live-source-retrieved">Retrieved {state.result.packet.retrieved_at ? <time dateTime={state.result.packet.retrieved_at}>{utc(state.result.packet.retrieved_at)}</time> : 'time not recorded'}</p>
              <ProviderRecords result={state.result} />
              <Provenance result={state.result} />
            </>}
          </section>;
        })}
      </section>}
    </div>
  </details>;
}
