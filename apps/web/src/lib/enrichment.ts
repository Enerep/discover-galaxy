/** A source-supplied gene set, separate from the small exploration graph. */
export interface PathwayGeneSet {
  id: string;
  name: string;
  url: string;
  genes: readonly string[];
}

export interface EnrichmentResult {
  id: string;
  name: string;
  url: string;
  backgroundSize: number;
  selectedSize: number;
  pathwayMeasuredSize: number;
  overlapSize: number;
  overlapGenes: string[];
  pValue: number;
  adjustedPValue: number;
  /** Natural logarithms retain extreme tails when the numeric probability underflows. */
  logPValue: number;
  logAdjustedPValue: number;
}

const MAX_GENES = 50_000;
const MAX_PATHWAYS = 10_000;
const MAX_MEMBERSHIPS = 5_000_000;
const identifier = (value: unknown): value is string => typeof value === 'string'
  && /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,79}$/u.test(value);

function uniqueGenes(values: readonly string[], label: string): Set<string> {
  if (!Array.isArray(values) || values.length > MAX_GENES) throw new Error(`${label} must contain at most ${MAX_GENES} gene identifiers.`);
  const genes = new Set<string>();
  for (const gene of values) {
    if (!identifier(gene)) throw new Error(`${label} contains an invalid gene identifier.`);
    if (genes.has(gene)) throw new Error(`${label} contains duplicate gene identifiers.`);
    genes.add(gene);
  }
  return genes;
}

function logAdd(left: number, right: number): number {
  if (left === -Infinity) return right;
  const high = Math.max(left, right);
  return high + Math.log1p(Math.exp(Math.min(left, right) - high));
}

/** Right-tailed P(X >= observed), with an exact finite hypergeometric support. */
function logHypergeometricTail(N: number, K: number, n: number, observed: number, factorials: Float64Array): number {
  const low = Math.max(0, n - (N - K));
  const high = Math.min(n, K);
  if (observed <= low) return 0;
  const logChoose = (total: number, count: number) => factorials[total] - factorials[count] - factorials[total - count];
  const logMass = (x: number) => logChoose(K, x) + logChoose(N - K, n - x) - logChoose(N, n);
  const sum = (start: number, end: number): number => {
    let term = logMass(start);
    let total = term;
    for (let x = start; x < end; x += 1) {
      term += Math.log(K - x) + Math.log(n - x) - Math.log(x + 1) - Math.log(N - K - n + x + 1);
      total = logAdd(total, term);
    }
    return Math.min(0, total);
  };
  // Sum the small tail itself. Complementing a near-one lower CDF would erase
  // very small upper probabilities; lower-CDF complementation is used only
  // when the observed count is at or below the distribution's mean.
  if (observed > n * K / N) return sum(observed, high);
  const lower = sum(low, observed - 1);
  return Math.log(-Math.expm1(lower));
}

/**
 * Overrepresentation conditional on the eligible tested background supplied by
 * the caller, defined before selection cutoffs. Unannotated eligible genes remain
 * in N. Every pathway with an eligible member is in the BH family, including
 * pathways with no selected hit.
 * This tests membership overrepresentation, never activation or biological cause.
 * Numeric p=0 denotes IEEE underflow: use the accompanying log value or a bound
 * when formatting it. It is not a claim of an impossible null event.
 */
export function enrichPathways(
  backgroundGenes: readonly string[],
  selectedGenes: readonly string[],
  pathways: readonly PathwayGeneSet[],
): EnrichmentResult[] {
  const background = uniqueGenes(backgroundGenes, 'The measured background');
  if (!background.size) throw new Error('Upload the measured gene background before testing pathways.');
  const selected = uniqueGenes(selectedGenes, 'The selected set');
  if ([...selected].some((gene) => !background.has(gene))) throw new Error('Every selected gene must belong to the measured background.');
  if (!Array.isArray(pathways) || pathways.length > MAX_PATHWAYS) throw new Error(`Choose at most ${MAX_PATHWAYS} pathway gene sets.`);
  const factorials = new Float64Array(background.size + 1);
  for (let i = 2; i <= background.size; i += 1) factorials[i] = factorials[i - 1] + Math.log(i);
  const rows: EnrichmentResult[] = [];
  const pathwayIds = new Set<string>();
  let memberships = 0;
  for (const pathway of pathways) {
    if (!pathway || !identifier(pathway.id) || pathwayIds.has(pathway.id)) throw new Error('Pathway identifiers must be valid and unique.');
    pathwayIds.add(pathway.id);
    if (typeof pathway.name !== 'string' || !pathway.name.trim() || pathway.name.length > 500 || /[\u0000-\u001f\u007f]/u.test(pathway.name)) throw new Error('A pathway name is invalid.');
    let url: URL;
    try { url = new URL(pathway.url); } catch { throw new Error('A pathway source URL is invalid.'); }
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error('Pathway source URLs must use HTTP or HTTPS without credentials.');
    if (!Array.isArray(pathway.genes) || pathway.genes.length > MAX_GENES) throw new Error('A pathway gene set is too large or invalid.');
    memberships += pathway.genes.length;
    if (memberships > MAX_MEMBERSHIPS) throw new Error('The pathway reference exceeds the membership limit.');
    const measured = new Set<string>();
    for (const gene of pathway.genes) {
      // Reference files can contain literal RNA/product labels or comma-separated
      // names. Preserve them exactly; an unmatched label is not a symbol alias.
      if (typeof gene !== 'string' || !gene.trim() || gene.length > 500 || /\p{Cc}/u.test(gene)) throw new Error('A pathway contains an invalid member label.');
      if (background.has(gene)) measured.add(gene);
    }
    if (!measured.size) continue;
    const overlapGenes = [...measured].filter((gene) => selected.has(gene)).sort();
    const logPValue = logHypergeometricTail(background.size, measured.size, selected.size, overlapGenes.length, factorials);
    rows.push({ id: pathway.id, name: pathway.name, url: pathway.url,
      backgroundSize: background.size, selectedSize: selected.size, pathwayMeasuredSize: measured.size,
      overlapSize: overlapGenes.length, overlapGenes, pValue: Math.exp(logPValue), adjustedPValue: 1,
      logPValue, logAdjustedPValue: 0 });
  }
  rows.sort((left, right) => left.logPValue - right.logPValue || (left.id < right.id ? -1 : left.id > right.id ? 1 : 0));
  let next = 0;
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    const row = rows[index];
    next = Math.min(next, row.logPValue + Math.log(rows.length) - Math.log(index + 1));
    row.logAdjustedPValue = next;
    row.adjustedPValue = Math.exp(next);
  }
  return rows;
}
