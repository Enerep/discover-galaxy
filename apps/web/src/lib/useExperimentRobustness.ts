import { useEffect, useRef, useState } from 'react';
import type { ExperimentAnalysis } from './experiment-analysis.ts';
import type { PathwayGrouping, RobustnessKind, RobustnessReply, RobustnessRequest, ThresholdSensitivity } from './experiment-robustness.ts';

type Job<T> = { status: 'idle' | 'running' | 'ready' | 'error'; result: T | null; error: string };
const idle = <T,>(): Job<T> => ({ status: 'idle', result: null, error: '' });
type State = { owner: ExperimentAnalysis | null; sensitivity: Job<ThresholdSensitivity>; grouping: Job<PathwayGrouping> };
const stateFor = (owner: ExperimentAnalysis | null): State => ({ owner, sensitivity: idle(), grouping: idle() });

/** Workers are local, on demand, and terminated when the applied input is replaced/removed. */
export function useExperimentRobustness(analysis: ExperimentAnalysis | null) {
  const [state, setState] = useState<State>(() => stateFor(null));
  const active = useRef<{ owner: ExperimentAnalysis; worker: Worker; pending: Set<RobustnessKind>; complete: Set<RobustnessKind> } | null>(null);
  useEffect(() => {
    setState((current) => current.owner === analysis ? current : stateFor(analysis));
    return () => {
      if (active.current?.owner === analysis) { active.current.worker.terminate(); active.current = null; }
    };
  }, [analysis]);

  function request(kind: RobustnessKind) {
    if (!analysis) return;
    let job = active.current;
    try {
      if (job?.owner !== analysis) {
        job?.worker.terminate();
        const worker = new Worker(new URL('./experiment-robustness.worker.ts', import.meta.url), { type: 'module' });
        job = { owner: analysis, worker, pending: new Set(), complete: new Set() };
        active.current = job;
        const ownerJob = job;
        worker.onmessage = ({ data }: MessageEvent<RobustnessReply>) => {
          if (active.current !== ownerJob) return;
          ownerJob.pending.delete(data.kind);
          if (!('error' in data)) ownerJob.complete.add(data.kind);
          setState((current) => {
            const next = current.owner === analysis ? current : stateFor(analysis);
            if ('error' in data) return { ...next, [data.kind]: { status: 'error', result: null, error: data.error } };
            return { ...next, [data.kind]: { status: 'ready', result: data.result, error: '' } };
          });
        };
        worker.onerror = (event) => {
          event.preventDefault();
          if (active.current !== ownerJob) return;
          worker.terminate(); active.current = null;
          const failed = [...ownerJob.pending];
          setState((current) => {
            const next = { ...(current.owner === analysis ? current : stateFor(analysis)) };
            for (const failedKind of failed) next[failedKind] = { status: 'error', result: null, error: failedKind === 'sensitivity' ? 'Unable to check thresholds. Try again.' : 'Unable to group pathways. Try again.' };
            return next;
          });
        };
      }
      if (job.pending.has(kind) || job.complete.has(kind)) return;
      job.pending.add(kind);
      setState((current) => ({ ...(current.owner === analysis ? current : stateFor(analysis)), [kind]: { status: 'running', result: null, error: '' } }));
      const message: RobustnessRequest = { kind, input: { rows: analysis.rows, backgroundGenes: analysis.backgroundGenes, pathways: analysis.reference.pathways, thresholds: analysis.thresholds, baseline: analysis.pathways } };
      job.worker.postMessage(message);
    } catch {
      job?.pending.delete(kind);
      setState((current) => ({ ...(current.owner === analysis ? current : stateFor(analysis)), [kind]: { status: 'error', result: null, error: kind === 'sensitivity' ? 'Unable to check thresholds. Try again.' : 'Unable to group pathways. Try again.' } }));
    }
  }
  const current = state.owner === analysis ? state : stateFor(analysis);
  return { sensitivity: current.sensitivity, grouping: current.grouping, request };
}
