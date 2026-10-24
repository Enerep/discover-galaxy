import type { ExperimentRow, ExperimentTable } from './experiment.ts';

export interface GeneIdentityReference {
  schema_version: 1;
  reference_id: string;
  organism: 'Homo sapiens';
  reported_source_date: string;
  source: { url: string; commit: string; sha256: string; retrieved_at: string; metadata_url: string; terms_url: string; license: 'CC0-1.0'; attribution: string };
  columns: ['hgnc_id', 'symbol', 'ensembl_gene_id'];
  genes: [hgncId: string, symbol: string, ensemblId: string | null][];
}
export interface GeneMappingRow {
  inputId: string;
  stableId: string;
  status: 'mapped' | 'unmapped' | 'ambiguous' | 'collision';
  candidates: { hgncId: string; symbol: string }[];
}
export interface GeneMappingReport {
  reference: Omit<GeneIdentityReference, 'genes' | 'columns'>;
  rows: GeneMappingRow[];
  mappedCount: number;
  unresolvedCount: number;
  collisionCount: number;
  versionedCount: number;
}

export function validateGeneIdentityReference(value: unknown): GeneIdentityReference {
  const ref = value as GeneIdentityReference | null;
  if (!ref || ref.schema_version !== 1 || ref.organism !== 'Homo sapiens'
    || typeof ref.reference_id !== 'string' || !/^hgnc-ensembl-[a-f0-9]{12}$/u.test(ref.reference_id)
    || !/^\d{4}-\d{2}-\d{2}$/u.test(ref.reported_source_date) || !ref.source
    || !/^[a-f0-9]{40}$/u.test(ref.source.commit) || !/^[a-f0-9]{64}$/u.test(ref.source.sha256)
    || ref.source.license !== 'CC0-1.0' || !Number.isFinite(Date.parse(ref.source.retrieved_at))
    || typeof ref.source.attribution !== 'string' || !ref.source.attribution.trim()
    || JSON.stringify(ref.columns) !== '["hgnc_id","symbol","ensembl_gene_id"]'
    || !Array.isArray(ref.genes) || !ref.genes.length || ref.genes.length > 100_000) throw new Error('The gene identifier reference failed validation.');
  for (const value of [ref.source.url, ref.source.metadata_url, ref.source.terms_url]) {
    let url: URL;
    try { url = new URL(value); } catch { throw new Error('Invalid gene identifier source URL.'); }
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Invalid gene identifier source URL.');
  }
  const ids = new Set<string>();
  const symbols = new Set<string>();
  for (const row of ref.genes) {
    if (!Array.isArray(row) || row.length !== 3 || typeof row[0] !== 'string' || !/^HGNC:\d+$/u.test(row[0])
      || ids.has(row[0]) || typeof row[1] !== 'string' || !row[1].trim() || row[1].length > 64 || /\p{Cc}/u.test(row[1])
      || symbols.has(row[1]) || (row[2] !== null && (typeof row[2] !== 'string' || !/^ENSG\d{11}$/u.test(row[2])))) throw new Error('Invalid or duplicate gene identifier record.');
    ids.add(row[0]); symbols.add(row[1]);
  }
  return ref;
}

export async function loadGeneIdentityReference(): Promise<GeneIdentityReference> {
  let value: unknown;
  try {
    const response = await fetch(new URL('../../../../data/reference/hgnc-ensembl.json', import.meta.url));
    if (!response.ok) throw new Error('Reference unavailable.');
    value = await response.json();
  } catch { throw new Error('Unable to load gene identifier mappings. Try the analysis again.'); }
  return validateGeneIdentityReference(value);
}

/** Only HGNC's exact Ensembl cross-reference is used; no alias/case guessing. */
export function resolveGeneIdentifiers(table: ExperimentTable, reference: GeneIdentityReference): GeneMappingReport {
  if (table.identifierType !== 'ensembl') throw new Error('Ensembl mapping requires an Ensembl identifier column.');
  validateGeneIdentityReference(reference);
  const index = new Map<string, GeneMappingRow['candidates']>();
  for (const [hgncId, symbol, ensemblId] of reference.genes) {
    if (!ensemblId) continue;
    const candidates = index.get(ensemblId) ?? [];
    candidates.push({ hgncId, symbol }); index.set(ensemblId, candidates);
  }
  const rows: GeneMappingRow[] = table.rows.map(({ gene }) => {
    if (!/^ENSG\d{11}(?:\.\d+)?$/u.test(gene)) throw new Error('Invalid human Ensembl gene identifier.');
    const stableId = gene.split('.')[0];
    const candidates = (index.get(stableId) ?? []).map((row) => ({ ...row }));
    return { inputId: gene, stableId, candidates, status: candidates.length === 1 ? 'mapped' : candidates.length ? 'ambiguous' : 'unmapped' };
  });
  // Version variants or many IDs resolving to one gene cannot become multiple
  // independent genes in N. Block instead of choosing a row or averaging stats.
  const stableGroups = new Map<string, GeneMappingRow[]>();
  const symbolGroups = new Map<string, GeneMappingRow[]>();
  for (const row of rows) {
    const stable = stableGroups.get(row.stableId) ?? []; stable.push(row); stableGroups.set(row.stableId, stable);
    if (row.status === 'mapped') {
      const symbol = row.candidates[0].symbol;
      const group = symbolGroups.get(symbol) ?? []; group.push(row); symbolGroups.set(symbol, group);
    }
  }
  for (const group of [...stableGroups.values(), ...symbolGroups.values()]) {
    if (group.length > 1) group.forEach((row) => { row.status = 'collision'; });
  }
  const { genes: _genes, columns: _columns, ...provenance } = reference;
  return { reference: provenance, rows, mappedCount: rows.filter(({ status }) => status === 'mapped').length,
    unresolvedCount: rows.filter(({ status }) => status === 'unmapped' || status === 'ambiguous').length,
    collisionCount: rows.filter(({ status }) => status === 'collision').length,
    versionedCount: rows.filter(({ inputId, stableId }) => inputId !== stableId).length };
}

export function applyGeneMapping(table: ExperimentTable, report: GeneMappingReport): ExperimentRow[] {
  if (report.collisionCount) throw new Error('Resolve duplicate gene mappings in the input file before analysis; rows are never merged.');
  if (report.rows.length !== table.rows.length) throw new Error('Gene mapping does not match this input.');
  return table.rows.map((row, index) => {
    const mapping = report.rows[index];
    if (mapping.inputId !== row.gene) throw new Error('Gene mapping does not match this input.');
    return { ...row, sourceId: row.gene, gene: mapping.status === 'mapped' ? mapping.candidates[0].symbol : row.gene };
  });
}
