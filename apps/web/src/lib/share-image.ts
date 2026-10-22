import { getClaimEvidence } from './dataset.ts';
import type { Claim, Entity, Snapshot, Source } from './types.ts';

export interface ShareImageOptions {
  snapshot: Snapshot;
  selected: Entity;
  claim?: Claim;
  graphImage?: HTMLCanvasElement;
}

interface TextBlock {
  text: string;
  size: number;
  lineHeight: number;
  color: string;
  weight?: number;
  gap?: number;
}

const FONT = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const WIDTH = 1200;
const PAD = 40;
const BODY_TOP = 136;
const TEXT_X = 704;
const TEXT_WIDTH = WIDTH - TEXT_X - PAD;

function font(block: TextBlock) { return `${block.weight ?? 400} ${block.size}px ${FONT}`; }

/** Split long identifiers and URLs too; no content is silently abbreviated. */
function wrap(context: CanvasRenderingContext2D, text: string, width: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    for (const word of paragraph.split(/\s+/u).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;
      if (context.measureText(candidate).width <= width) { line = candidate; continue; }
      if (line) { lines.push(line); line = ''; }
      for (const character of word) {
        if (line && context.measureText(line + character).width > width) { lines.push(line); line = ''; }
        line += character;
      }
    }
    lines.push(line);
  }
  return lines;
}

function sourceBlocks(source: Source): TextBlock[] {
  const author = source.authors[0] ?? 'Author not recorded';
  const authors = source.authors.length > 1 ? `${author} et al.` : author;
  const identifiers = source.identifiers.map(({ namespace, value }) => `${namespace}: ${value}`).join(' · ');
  return [
    { text: source.title, size: 17, lineHeight: 25, color: '#294e39', weight: 500, gap: 8 },
    { text: source.kind === 'publication' ? `${authors} · ${source.year ?? 'Year not recorded'}` : `${source.provider ?? 'Database'} · ${source.release ?? 'Version not recorded'}`, size: 14, lineHeight: 21, color: '#52675b', gap: 6 },
    ...(identifiers ? [{ text: identifiers, size: 13, lineHeight: 20, color: '#52675b', gap: 6 }] : []),
    { text: source.url, size: 14, lineHeight: 21, color: '#235e4a', gap: 24 },
  ];
}

function blocksFor({ snapshot, selected, claim }: ShareImageOptions): TextBlock[] {
  const sourceIds = claim
    ? new Set(getClaimEvidence(snapshot, claim.id).map(({ source_id }) => source_id))
    : new Set(selected.source_id ? [selected.source_id] : []);
  const sources = snapshot.sources.filter(({ id }) => sourceIds.has(id));
  const limitations = claim
    ? [...new Set([...claim.limitations, ...getClaimEvidence(snapshot, claim.id).flatMap((item) => item.limitations)])]
    : [];
  return [
    { text: selected.type.charAt(0).toUpperCase() + selected.type.slice(1), size: 15, lineHeight: 22, color: '#65716b', gap: 10 },
    { text: selected.label, size: 32, lineHeight: 40, color: '#202b29', weight: 600, gap: 22 },
    { text: claim ? 'Selected finding' : 'Selected record', size: 14, lineHeight: 21, color: '#65716b', gap: 10 },
    { text: claim?.statement ?? 'No findings for this record in the current dataset.', size: 21, lineHeight: 31, color: '#263a2d', gap: 24 },
    ...(sources.length ? [
      { text: sources.length === 1 ? 'Original source' : 'Original sources', size: 14, lineHeight: 21, color: '#65716b', gap: 10 },
      ...sources.flatMap(sourceBlocks),
    ] : []),
    ...(limitations.length ? [
      { text: 'Study limitations', size: 14, lineHeight: 21, color: '#65716b', gap: 10 },
      ...limitations.map((text) => ({ text: `• ${text}`, size: 14, lineHeight: 22, color: '#52675b', gap: 8 })),
    ] : []),
  ];
}

function drawContained(context: CanvasRenderingContext2D, image: HTMLCanvasElement, x: number, y: number, width: number, height: number) {
  if (!image.width || !image.height) throw new Error('The graph image is empty. Try sharing again.');
  const scale = Math.min(width / image.width, height / image.height);
  const drawnWidth = image.width * scale;
  const drawnHeight = image.height * scale;
  context.drawImage(image, x + (width - drawnWidth) / 2, y + (height - drawnHeight) / 2, drawnWidth, drawnHeight);
}

/** Render locally: no remote image/font fetches, uploads, or extra dependencies. */
export async function renderShareImage(options: ShareImageOptions): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Image export is unavailable in this browser.');
  const blocks = blocksFor(options);
  const measured = blocks.map((block) => {
    context.font = font(block);
    return { block, lines: wrap(context, block.text, TEXT_WIDTH) };
  });
  const textHeight = measured.reduce((height, { block, lines }) => height + lines.length * block.lineHeight + (block.gap ?? 0), 0);
  const contentHeight = Math.max(560, textHeight);
  // Grow instead of omitting a long source, finding, or limitation.
  canvas.height = Math.max(800, BODY_TOP + contentHeight + 100);
  context.fillStyle = '#f5f6f4';
  context.fillRect(0, 0, WIDTH, canvas.height);
  context.textBaseline = 'top';
  context.fillStyle = '#202b29';
  context.font = `600 23px ${FONT}`;
  context.fillText('Discovery Galaxy', PAD, 32);
  context.fillStyle = '#78613e';
  context.font = `400 16px ${FONT}`;
  context.textAlign = 'right';
  context.fillText('Source-checked draft', WIDTH - PAD, 37);
  context.textAlign = 'left';
  context.strokeStyle = '#dce2dc';
  context.beginPath(); context.moveTo(PAD, 87); context.lineTo(WIDTH - PAD, 87); context.stroke();
  context.font = `500 17px ${FONT}`;
  context.fillStyle = '#52675b';
  context.fillText(options.snapshot.scope.disease, PAD, 105);

  const graphWidth = 624;
  const graphHeight = Math.min(contentHeight, 760);
  context.fillStyle = '#0b1217';
  context.fillRect(PAD, BODY_TOP, graphWidth, graphHeight);
  if (options.graphImage) {
    drawContained(context, options.graphImage, PAD, BODY_TOP, graphWidth, graphHeight);
    context.fillStyle = '#adc1b8';
    context.font = `400 13px ${FONT}`;
    context.fillText('Current graph view', PAD + 20, BODY_TOP + 18);
  } else {
    context.fillStyle = '#adc1b8';
    context.font = `400 16px ${FONT}`;
    context.fillText('Evidence card', PAD + 28, BODY_TOP + 30);
    context.fillStyle = '#e7eeed';
    context.font = `500 30px ${FONT}`;
    const lines = wrap(context, options.selected.label, graphWidth - 56);
    let y = BODY_TOP + 95;
    for (const line of lines) { context.fillText(line, PAD + 28, y); y += 40; }
    context.fillStyle = '#adc1b8';
    context.font = `400 16px ${FONT}`;
    for (const line of wrap(context, 'The selected finding and its original source are shown alongside this card.', graphWidth - 56)) {
      context.fillText(line, PAD + 28, y + 35); y += 25;
    }
  }
  let y = BODY_TOP;
  for (const { block, lines } of measured) {
    context.font = font(block);
    context.fillStyle = block.color;
    for (const line of lines) { context.fillText(line, TEXT_X, y); y += block.lineHeight; }
    y += block.gap ?? 0;
  }
  const footer = canvas.height - 68;
  context.strokeStyle = '#dce2dc';
  context.beginPath(); context.moveTo(PAD, footer - 20); context.lineTo(WIDTH - PAD, footer - 20); context.stroke();
  context.fillStyle = '#52675b';
  context.font = `400 13px ${FONT}`;
  context.fillText('Graph positions and brightness do not measure evidence strength or causality.', PAD, footer);
  context.fillText(`Dataset: ${options.snapshot.dataset_version}`, PAD, footer + 25);
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Unable to encode the image. Try downloading again.')), 'image/png');
    } catch {
      reject(new Error('Image export failed. Try sharing from the list view.'));
    }
  });
}
