import { analyzeThresholdSensitivity, groupOverlappingPathways } from './experiment-robustness.ts';
import type { RobustnessReply, RobustnessRequest } from './experiment-robustness.ts';

const scope = self as unknown as { onmessage: ((event: MessageEvent<RobustnessRequest>) => void) | null; postMessage(message: RobustnessReply): void };
scope.onmessage = ({ data }) => {
  try {
    if (data.kind === 'sensitivity') scope.postMessage({ kind: 'sensitivity', result: analyzeThresholdSensitivity(data.input) });
    else if (data.kind === 'grouping') scope.postMessage({ kind: 'grouping', result: groupOverlappingPathways(data.input) });
  } catch {
    scope.postMessage({ kind: data.kind, error: data.kind === 'sensitivity' ? 'Unable to check thresholds. Try again.' : 'Unable to group pathways. Try again.' });
  }
};
