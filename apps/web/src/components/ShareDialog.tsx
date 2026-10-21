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
}

export function ShareDialog({ open, onClose, snapshot, selected, claim, captureGraph }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [preview, setPreview] = useState<{ url: string; file: File; nativeShare: boolean } | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [sharing, setSharing] = useState(false);

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
    </dialog>
  );
}
