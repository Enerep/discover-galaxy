import { getEntityClaims } from './dataset.ts';
import type { EntityType, Snapshot } from './types.ts';

export interface ExplorerShareState {
  entityId: string;
  claimId: string | null;
  query: string;
  filter: EntityType | 'all';
  view: 'graph' | 'list';
}

const KEYS = ['entity', 'claim', 'q', 'type', 'view'] as const;
const FILTERS = new Set(['all', 'gene', 'protein', 'pathway', 'disease', 'paper']);
const MAX_QUERY_LENGTH = 256;
const MAX_FRAGMENT_LENGTH = 4096;

function isValidState(state: ExplorerShareState, snapshot: Snapshot): boolean {
  if (!snapshot.entities.some(({ id }) => id === state.entityId)) return false;
  if (state.claimId !== null && !getEntityClaims(snapshot, state.entityId).some(({ id }) => id === state.claimId)) return false;
  return typeof state.query === 'string' && state.query.length <= MAX_QUERY_LENGTH
    && !/[\u0000-\u001f\u007f]/u.test(state.query)
    && FILTERS.has(state.filter) && (state.view === 'graph' || state.view === 'list');
}

/** Invalid or unrelated fragments leave the explorer at its ordinary default. */
export function parseShareState(url: URL, snapshot: Snapshot): ExplorerShareState | null {
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  const fragment = url.hash.slice(1);
  if (!fragment || fragment.length > MAX_FRAGMENT_LENGTH) return null;
  try {
    // URLSearchParams is forgiving about broken escapes; shared state is not.
    decodeURIComponent(fragment);
  } catch {
    return null;
  }
  const params = new URLSearchParams(fragment);
  if (KEYS.some((key) => params.getAll(key).length > 1)) return null;
  const entityId = params.get('entity');
  if (!entityId) return null;
  const state: ExplorerShareState = {
    entityId,
    claimId: params.get('claim'),
    query: params.get('q') ?? '',
    filter: (params.get('type') ?? 'all') as ExplorerShareState['filter'],
    view: (params.get('view') ?? 'graph') as ExplorerShareState['view'],
  };
  return isValidState(state, snapshot) ? state : null;
}

/** Fragments keep search text out of HTTP requests; unrelated URL tokens are omitted. */
export function buildShareUrl(base: URL, state: ExplorerShareState, snapshot: Snapshot): string {
  if (base.protocol !== 'https:' && base.protocol !== 'http:') throw new Error('Sharing requires an HTTP or HTTPS address.');
  if (!isValidState(state, snapshot)) throw new Error('Cannot share an invalid explorer selection or search.');
  const url = new URL(base.href);
  url.username = '';
  url.password = '';
  url.search = '';
  url.hash = '';
  const params = new URLSearchParams({ entity: state.entityId });
  if (state.claimId !== null) params.set('claim', state.claimId);
  if (state.query) params.set('q', state.query);
  if (state.filter !== 'all') params.set('type', state.filter);
  if (state.view !== 'graph') params.set('view', state.view);
  url.hash = params.toString();
  return url.href;
}
