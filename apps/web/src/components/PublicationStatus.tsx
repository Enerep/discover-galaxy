import type { Source } from '../lib/types.ts';
import { Icon } from './ui.tsx';

export function PublicationStatus({ source }: { source: Source }) {
  if (source.kind !== 'publication') return null;
  const { status, checked_at, notice_url } = source.publication_status;
  const label = status === 'corrected' ? 'Correction recorded'
    : status === 'retracted' ? 'Retraction recorded'
      : status === 'no_notice_found' ? 'No notice found at the recorded check' : 'Correction/retraction check not recorded';
  return <p className="source-locator publication-status">
    <strong>Publication status</strong>{label}{checked_at ? ` (${checked_at})` : ''}.
    {notice_url && <> <a href={notice_url} target="_blank" rel="noreferrer">View notice <Icon name="external" size={12} /></a></>}
  </p>;
}
