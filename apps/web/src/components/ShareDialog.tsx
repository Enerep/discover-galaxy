import { useEffect, useId, useRef, useState } from 'react';
import type { Claim, Entity, Snapshot } from '../lib/types.ts';
import { renderShareImage } from '../lib/share-image.ts';
import { Icon } from './ui.tsx';

interface Props {
  open: boolean;
  onClose: () => void;
  snapshot: Snapshot;
  selected: Entity;
  claim?: Claim;
  captureGraph: () => HTMLCanvasElement | undefined;
  shareUrl: string;
}

export function ShareDialog({ open, onClose, snapshot, selected, claim, captureGraph, shareUrl }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const linkInput = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const [preview, setPreview] = useState<{ url: string; file: File; nativeShare: boolean } | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [sharing, setSharing] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'manual'>('idle');

  useEffect(() => { setCopyStatus('idle'); }, [open, shareUrl]);

  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    else if (!open && dialog.current?.open) dialog.current.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let disposed = false;
    let url: string | undefined;
    setPreview(null);
    setError('');
    setNotice('');
    async function prepare() {
      try {
        let graphImage: HTMLCanvasElement | undefined;
        try { graphImage = captureGraph(); }
        catch { if (!disposed) setNotice('Graph capture is unavailable. The image includes the selected evidence.'); }
        const blob = await renderShareImage({ snapshot, selected, claim, graphImage });
        if (disposed) return;
        url = URL.createObjectURL(blob);
        const filename = `discovery-galaxy-${selected.id.replace(/[^a-z0-9-]/gi, '-')}.png`;
        const file = new File([blob], filename, { type: 'image/png' });
        let nativeShare = false;
        try { nativeShare = !!navigator.share && !!navigator.canShare?.({ files: [file] }); }
        catch { /* The download remains available when file sharing is unsupported. */ }
        setPreview({ url, file, nativeShare });
      } catch {
        if (!disposed) setError('Couldn’t create the image. Try again.');
      }
    }
    void prepare();
    return () => { disposed = true; if (url) URL.revokeObjectURL(url); };
  }, [open, snapshot, selected, claim, captureGraph, attempt]);

  async function shareImage() {
    if (!preview || sharing) return;
    setSharing(true);
    setNotice('');
    try {
      await navigator.share({ files: [preview.file], title: `Discovery Galaxy · ${selected.label}` });
    } catch (cause) {
      if (!(cause instanceof DOMException && cause.name === 'AbortError')) {
        setNotice('Sharing didn’t open. You can download the image instead.');
      }
    } finally { setSharing(false); }
  }

  async function copyLink() {
    if (!shareUrl) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('manual');
      linkInput.current?.focus({ preventScroll: true });
      linkInput.current?.select();
    }
  }

  return (
    <dialog className="data-dialog share-dialog" ref={dialog} aria-labelledby={titleId} onClose={onClose}>
      <button className="icon-button dialog-close" aria-label="Close sharing" onClick={onClose}><Icon name="close" /></button>
      <h2 id={titleId}>Share this view</h2>
      <p>The image includes the selected finding, its sources, and the dataset’s draft status.</p>
      <div className="share-preview" aria-busy={!preview && !error}>
        {preview ? <img src={preview.url} alt="Share image preview" />
          : error ? <div role="alert"><p>{error}</p><button className="secondary-button" onClick={() => setAttempt((value) => value + 1)}>Retry</button></div>
          : <p role="status">Preparing image…</p>}
      </div>
      {notice && <p className="share-notice" role="status">{notice}</p>}
      <div className="share-actions">
        {preview && <a className="primary-button" href={preview.url} download={preview.file.name}><Icon name="download" size={17} />Download PNG</a>}
        {preview?.nativeShare && <button className="secondary-button" onClick={() => void shareImage()} disabled={sharing}><Icon name="share" size={17} />{sharing ? 'Sharing…' : 'Share image'}</button>}
      </div>
      <div className="share-link">
        <label htmlFor={`${titleId}-link`}>Link to this view</label>
        <div className="share-link-field">
          <input id={`${titleId}-link`} ref={linkInput} value={shareUrl} readOnly onFocus={(event) => event.currentTarget.select()} />
          <button className="secondary-button" onClick={() => void copyLink()} disabled={!shareUrl}>{copyStatus === 'copied' ? 'Copied' : 'Copy link'}</button>
        </div>
        <p className="copy-status" role="status">{!shareUrl ? 'Clear the search to create a shareable link.'
          : copyStatus === 'copied' ? 'Link copied.' : copyStatus === 'manual' ? 'Copy the selected link to share this view.'
          : 'Opens the same entity, finding, search, filter, and view.'}</p>
      </div>
    </dialog>
  );
}
