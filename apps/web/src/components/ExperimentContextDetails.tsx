import { STUDY_DESIGN_LABELS } from '../lib/experiment-context.ts';
import type { ExperimentContext } from '../lib/experiment-context.ts';

export function ExperimentContextDetails({ context }: { context: ExperimentContext }) {
  return <dl className="context-list">
    <div><dt>Tissue or cell model</dt><dd>{context.model || 'Not specified'}</dd></div>
    <div><dt>Treatment or condition</dt><dd>{context.condition || 'Not specified'}</dd></div>
    <div><dt>Study design</dt><dd>{STUDY_DESIGN_LABELS[context.design]}</dd></div>
  </dl>;
}
