export const MAX_EXPERIMENT_BYTES = 5 * 1024 * 1024;
export const MAX_EXPERIMENT_ROWS = 50_000;
const MAX_COLUMNS = 128;

export interface ExperimentRow {
  gene: string;
  /** Original Ensembl ID when a separate mapping produced the display symbol. */
  sourceId?: string;
  log2FoldChange: number | null;
  padj: number | null;
}

export interface ExperimentTable {
  filename: string;
  /** Set only by the built-in demonstration; never inferred from an upload. */
  isSynthetic?: true;
  delimiter: ',' | '\t';
  columns: { gene: string; log2FoldChange: string; padj: string };
  rows: ExperimentRow[];
  missingStatisticsCount: number;
  identifierType: 'symbol' | 'ensembl';
}

export interface ExperimentThresholds {
  adjustedPMax: number;
  minAbsLog2FoldChange: number;
}

type RecordRow = { values: string[]; line: number };
const HEADER_ALIASES = {
  gene: ['gene', 'gene_symbol', 'symbol', 'gene_id', 'ensembl_gene_id', 'ensembl_id', 'genename'],
  log2FoldChange: ['log2foldchange', 'log2fc'],
  padj: ['padj', 'fdr', 'adj.p.val'],
} as const;
const MISSING_VALUES = new Set(['', 'NA', 'N/A', 'NAN', 'NULL']);

export class ExperimentColumnChoiceError extends Error {
  columns: { index: number; label: string }[];
  constructor(columns: { index: number; label: string }[]) {
    super('Choose the column containing gene identifiers.');
    this.columns = columns;
  }
}

function detectDelimiter(text: string): ',' | '\t' {
  let quoted = false;
  let commas = 0;
  let tabs = 0;
  let content = false;
  for (let index = 0; index < text.length; index += 1) {
    const value = text[index];
    if (value === '"') {
      if (quoted && text[index + 1] === '"') index += 1;
      else quoted = !quoted;
    } else if (!quoted && (value === '\r' || value === '\n')) {
      if (content || commas || tabs) break;
    } else if (!quoted && value === ',') commas += 1;
    else if (!quoted && value === '\t') tabs += 1;
    if (value.trim()) content = true;
  }
  if (Boolean(commas) === Boolean(tabs)) throw new Error('Use a CSV or TSV header with gene, log2FoldChange and padj columns.');
  return commas ? ',' : '\t';
}

/** RFC-style quoting, bounded rows/columns, and physical line numbers for actionable errors. */
function readRecords(text: string, delimiter: ',' | '\t'): RecordRow[] {
  const records: RecordRow[] = [];
  let values: string[] = [];
  let field = '';
  let state: 'start' | 'bare' | 'quoted' | 'closed' = 'start';
  let line = 1;
  let recordLine = 1;
  const finishField = () => {
    values.push(field);
    if (values.length > MAX_COLUMNS) throw new Error(`Row ${recordLine} exceeds the ${MAX_COLUMNS}-column limit.`);
    field = ''; state = 'start';
  };
  const finishRecord = () => {
    finishField();
    // A delimiter-only record is malformed input, not an empty physical line.
    if (values.length > 1 || values[0].trim()) {
      records.push({ values, line: recordLine });
      if (records.length > MAX_EXPERIMENT_ROWS + 1) throw new Error(`Use at most ${MAX_EXPERIMENT_ROWS.toLocaleString('en-US')} gene rows.`);
    }
    values = [];
  };
  for (let index = 0; index < text.length; index += 1) {
    const value = text[index];
    const newline = value === '\r' || value === '\n';
    if (state === 'quoted') {
      if (value === '"') {
        if (text[index + 1] === '"') { field += '"'; index += 1; }
        else state = 'closed';
      } else if (newline) {
        field += '\n'; line += 1;
        if (value === '\r' && text[index + 1] === '\n') index += 1;
      } else field += value;
    } else if (value === delimiter) finishField();
    else if (newline) {
      finishRecord(); line += 1; recordLine = line;
      if (value === '\r' && text[index + 1] === '\n') index += 1;
    } else if (state === 'closed') throw new Error(`Row ${recordLine} has text after a closing quote. Use a delimiter or a new line.`);
    else if (value === '"') {
      if (state !== 'start') throw new Error(`Row ${recordLine} has a quote inside an unquoted field.`);
      state = 'quoted';
    } else { field += value; state = 'bare'; }
  }
  if (state === 'quoted') throw new Error(`Row ${recordLine} has an unclosed quoted field.`);
  finishRecord();
  return records;
}

function numberValue(value: string, line: number, column: string, adjustedP: boolean): number | null {
  const trimmed = value.trim();
  if (MISSING_VALUES.has(trimmed.toUpperCase())) return null;
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/iu.test(trimmed)
    || !Number.isFinite(Number(trimmed))) throw new Error(`Row ${line}, ${column}: enter a finite decimal number or NA.`);
  const number = Number(trimmed);
  if (number === 0 && /[1-9]/u.test(trimmed.split(/[eE]/u)[0])) throw new Error(`Row ${line}, ${column}: this nonzero value is too small to represent. Use a representable value or NA; it cannot be treated as a reported zero.`);
  if (adjustedP && (number < 0 || number > 1)) throw new Error(`Row ${line}, ${column}: adjusted p-values must be between 0 and 1.`);
  return number;
}

/** Parse local results only. Syntax does not verify HGNC identity, species or assay completeness. */
export function parseExperiment(text: string, filename: string, options: { identifierColumn?: number } = {}): ExperimentTable {
  if (typeof text !== 'string' || typeof filename !== 'string') throw new Error('Read a UTF-8 CSV or TSV results file.');
  if (text.length > MAX_EXPERIMENT_BYTES || new TextEncoder().encode(text).byteLength > MAX_EXPERIMENT_BYTES) throw new Error('Use a results file no larger than 5 MiB.');
  if (text.includes('\0')) throw new Error('Read a UTF-8 CSV or TSV file; binary content is not supported.');
  const normalized = text.replace(/^\uFEFF/u, '');
  const delimiter = detectDelimiter(normalized);
  const records = readRecords(normalized, delimiter);
  const header = records[0]?.values.map((value) => value.trim()) ?? [];
  const normalizedHeader = header.map((value) => value.toLowerCase());
  const indices = {} as Record<keyof typeof HEADER_ALIASES, number>;
  for (const [key, aliases] of Object.entries(HEADER_ALIASES)) {
    let matches = normalizedHeader.flatMap((value, index) => (aliases as readonly string[]).includes(value) || (key === 'gene' && index === 0 && value === '') ? [index] : []);
    if (key === 'gene') {
      if (options.identifierColumn !== undefined) {
        if (!Number.isInteger(options.identifierColumn) || options.identifierColumn < 0 || options.identifierColumn >= header.length) throw new Error('Choose an available gene identifier column.');
        matches = [options.identifierColumn];
      } else if (matches.length !== 1) {
        throw new ExperimentColumnChoiceError(header.map((label, index) => ({ index, label: label || `Column ${index + 1} (unnamed)` })));
      }
    }
    if (matches.length !== 1) throw new Error(`Include exactly one ${key} column (${aliases.join(', ')}).`);
    indices[key as keyof typeof HEADER_ALIASES] = matches[0];
  }
  if (new Set(normalizedHeader).size !== normalizedHeader.length) throw new Error('Give each column a unique header.');
  const rows: ExperimentRow[] = [];
  const seen = new Set<string>();
  let missingStatisticsCount = 0;
  let identifierType: ExperimentTable['identifierType'] | undefined;
  for (const record of records.slice(1)) {
    if (record.values.length !== header.length) throw new Error(`Row ${record.line} has ${record.values.length} columns; the header has ${header.length}.`);
    const gene = record.values[indices.gene].trim();
    if (gene.length > 64) throw new Error(`Row ${record.line}, gene: identifiers must contain at most 64 characters.`);
    const type = /^ENSG\d{11}(?:\.\d+)?$/u.test(gene) ? 'ensembl' : 'symbol';
    if (type === 'symbol' && (/^ENS[A-Z]*G\d/u.test(gene) || gene.length > 64 || !/^(?:[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*|C(?:\d+|X|Y)orf\d+(?:-[A-Z0-9]+)*)$/u.test(gene))) throw new Error(`Row ${record.line}, gene: use human gene symbols or human Ensembl gene IDs. Species and identifiers are not guessed.`);
    if (identifierType && identifierType !== type) throw new Error(`Row ${record.line}, gene: use one identifier type per column; symbols and Ensembl IDs cannot be mixed.`);
    identifierType = type;
    if (seen.has(gene)) throw new Error(`Row ${record.line}, gene: duplicate ${type === 'symbol' ? 'symbol' : 'identifier'}. Supply one result per gene; duplicates are not merged.`);
    seen.add(gene);
    const log2FoldChange = numberValue(record.values[indices.log2FoldChange], record.line, 'log2FoldChange', false);
    const padj = numberValue(record.values[indices.padj], record.line, 'padj', true);
    rows.push({ gene, log2FoldChange, padj });
    if (log2FoldChange === null || padj === null) missingStatisticsCount += 1;
  }
  if (!rows.length) throw new Error('Include at least one gene row below the header.');
  return { filename: filename.trim().slice(0, 255) || 'Uploaded results', delimiter,
    columns: { gene: header[indices.gene], log2FoldChange: header[indices.log2FoldChange], padj: header[indices.padj] },
    rows, missingStatisticsCount, identifierType: identifierType! };
}

/** Literal inclusive thresholds; zero remains unchanged even if selected at a zero minimum. */
export function selectExperimentHits(table: Pick<ExperimentTable, 'rows'>, thresholds: ExperimentThresholds): ExperimentRow[] {
  if (!Number.isFinite(thresholds.adjustedPMax) || thresholds.adjustedPMax < 0 || thresholds.adjustedPMax > 1
    || !Number.isFinite(thresholds.minAbsLog2FoldChange) || thresholds.minAbsLog2FoldChange < 0) throw new Error('Use an adjusted p-value between 0 and 1 and a finite, nonnegative fold-change minimum.');
  return table.rows.filter(({ padj, log2FoldChange }) => padj !== null && log2FoldChange !== null
    && padj <= thresholds.adjustedPMax && Math.abs(log2FoldChange) >= thresholds.minAbsLog2FoldChange);
}
