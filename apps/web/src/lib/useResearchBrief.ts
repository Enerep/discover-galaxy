import { useEffect, useRef, useState } from 'react';
import type { Snapshot } from './types.ts';
import { BRIEF_STORAGE_KEY, createResearchBrief, includeBriefComparison, parseResearchBrief, updateResearchBrief } from './research-brief.ts';
import type { BriefAction, ResearchBrief } from './research-brief.ts';

export type BriefSaveStatus = 'empty' | 'saving' | 'saved' | 'unavailable' | 'invalid' | 'conflict';

function restore(snapshot: Snapshot): { brief: ResearchBrief; raw: string | null; status: BriefSaveStatus } {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(BRIEF_STORAGE_KEY);
    return { brief: raw === null ? createResearchBrief(snapshot) : parseResearchBrief(raw), raw, status: raw === null ? 'empty' : 'saved' };
  } catch { return { brief: createResearchBrief(snapshot), raw, status: raw === null ? 'unavailable' : 'invalid' }; }
}

export function useResearchBrief(snapshot: Snapshot) {
  const [initial] = useState(() => restore(snapshot));
  const [brief, setBrief] = useState(initial.brief);
  const [status, setStatus] = useState<BriefSaveStatus>(initial.status);
  const [error, setError] = useState('');
  const stored = useRef(initial.raw);
  const paused = useRef(initial.status === 'invalid');

  useEffect(() => {
    const raw = JSON.stringify(brief);
    if (paused.current || raw === stored.current) return;
    if (stored.current === null && !brief.pinned_claim_ids.length
      && ![brief.question, brief.explanation, brief.assumptions, brief.experiment].some((value) => value.length)) {
      setStatus((current) => current === 'saving' ? 'empty' : current);
      return;
    }
    const save = () => {
      if (paused.current) return;
      try {
        if (raw === stored.current) return;
        if (localStorage.getItem(BRIEF_STORAGE_KEY) !== stored.current) {
          paused.current = true; setStatus('conflict'); return;
        }
        localStorage.setItem(BRIEF_STORAGE_KEY, raw);
        stored.current = raw;
        setStatus('saved');
      } catch { setStatus('unavailable'); }
    };
    const timer = window.setTimeout(save, 300);
    // A refresh can arrive before the debounce; preserve the last committed edit.
    window.addEventListener('pagehide', save);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pagehide', save);
    };
  }, [brief]);

  useEffect(() => {
    const changed = (event: StorageEvent) => {
      if ((event.key === BRIEF_STORAGE_KEY || event.key === null) && event.newValue !== stored.current) {
        paused.current = true; setStatus('conflict');
      }
    };
    window.addEventListener('storage', changed);
    return () => window.removeEventListener('storage', changed);
  }, []);

  function accept(next: ResearchBrief) {
    setBrief(next);
    setError('');
    if (!paused.current) setStatus('saving');
  }
  function change(action: BriefAction): boolean {
    try { accept(updateResearchBrief(snapshot, brief, action)); return true; }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to update the brief.'); return false; }
  }
  function includeComparison(pair: [string, string]): boolean {
    try { accept(includeBriefComparison(snapshot, brief, pair)); return true; }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to include the comparison.'); return false; }
  }
  /** Explicit recovery only: a conflicting or unreadable saved draft is never replaced automatically. */
  function saveThisVersion() {
    try {
      const raw = JSON.stringify(brief);
      localStorage.setItem(BRIEF_STORAGE_KEY, raw);
      stored.current = raw; paused.current = false; setStatus('saved');
    } catch { setStatus('unavailable'); }
  }
  return { brief, status, error, change, includeComparison, saveThisVersion };
}
