# Experimental analysis validation

These checks validate import, identifier handling and pathway calculations on supplied results. They do not rerun differential expression, establish the source models' validity, reproduce a disease mechanism or add scientific graph claims. Experimental tables remain outside Git and the hosted app. Runtime inputs stay in the browser.

## Pinned identifiers

The [HGNC reference](../data/reference/hgnc-ensembl.json) retains 44,997 approved records as `[hgnc_id, symbol, ensembl_gene_id]`, including 2,682 without an Ensembl cross-reference. There are 42,312 distinct referenced Ensembl IDs, of which three have multiple HGNC candidates. Their ambiguity is retained.

| Field | Value |
| --- | --- |
| Reference | `hgnc-ensembl-6bb2951c5620` |
| Retrieved source | [gene-tidy HGNC data mirror](https://raw.githubusercontent.com/MargoSolo/gene-tidy/37b375b4e4f70445cbb9e40b273a510467b798ae/src/gene_tidy/data/hgnc_complete_set.tsv.gz) |
| Mirror commit | `37b375b4e4f70445cbb9e40b273a510467b798ae` |
| Retrieved | 2026-10-24 |
| Compressed input | 1,415,550 bytes; SHA-256 `6bb2951c56204cd7b387c4e40b8d46107f6bdc422e77b8e4f2088a5d39e1be4b` |
| Normalized output | 1,887,725 bytes; SHA-256 `b003cb4c9b0cbc7ef1e17d223110888d51962fc3eae1732a120269b78ef11799` |
| Source date reported by mirror | 2026-06-20, per its [metadata](https://raw.githubusercontent.com/MargoSolo/gene-tidy/37b375b4e4f70445cbb9e40b273a510467b798ae/src/gene_tidy/data/hgnc_version.json) |
| Reuse | HGNC data are [CC0](https://hgnc.genenames.org/about/license/); credit HGNC (RRID:SCR_002827) |

The official [download overview](https://www.genenames.org/download/) and license were inspected. The official Google Storage download returned HTTP 403 under the environment policy; it was not bypassed. The immutable mirror and hashes identify the actual data. Its reported source date/release was not independently verified against an official archive. No gene-tidy software or alias-resolution logic is imported, and its software license does not relicense HGNC data.

Only exact HGNC Ensembl cross-references resolve to a symbol. Version suffixes are removed for lookup, while original IDs and supplied statistics are retained. Missing and ambiguous matches remain unannotated, with an explicit acknowledgement before analysis; eligible unresolved genes still count in N and can remain in the selected set. Repeated stable IDs and duplicate gene mappings block analysis. No row is selected, averaged, dropped or merged to resolve a collision. The reference does not verify the experiment's organism, genome annotation release or upstream gene assignment. Symbol-mode inputs retain their original exact matching behavior; aliases and historic symbols are not repaired.

```sh
python3 tools/analysis/prepare-identifiers.py --input /path/to/hgnc_complete_set.tsv.gz
python3 tools/analysis/prepare-identifiers.py --input /path/to/hgnc_complete_set.tsv.gz --check
npm run reference:check
```

Preparation/checking uses only the Python standard library and performs no network operation. Builds and browser analysis never refresh references silently.

## Public AD table: MAYO temporal cortex

The validation source is the authors' processed MAYO table from [Systematic review and meta-analysis of bulk RNAseq studies in human Alzheimer's disease brain tissue](https://doi.org/10.1002/alz.70025), associated with the [Ebbert Lab repository](https://github.com/UK-SBCoA-EbbertLab/AD_bulk_RNAseq_review). It represents the Mayo temporal-lobe AD/control comparison analyzed by Marques-Coelho and colleagues, as reused by the systematic review. It is one cohort table, not the review's pooled meta-analysis output. The publication and repository report 160 samples; group-specific counts and raw-model reproduction were not established in this checkpoint.

| Field | Value |
| --- | --- |
| Immutable source | [MAYO_TL.tsv](https://raw.githubusercontent.com/UK-SBCoA-EbbertLab/AD_bulk_RNAseq_review/7b55b9c973cfd404cb27d9fd959315410669b9b8/data/processed_data/temporal_lobe/MAYO_TL.tsv) |
| Commit | `7b55b9c973cfd404cb27d9fd959315410669b9b8` |
| Source bytes | 2,407,173; SHA-256 `5eb91451860590f0df3c7d060cf94dfb53df30367dd3bb0e6f14cd309db8ca7f` |
| Normalized CSV | 2,472,342 bytes; SHA-256 `0f084d65603e1608c8293300ce0b00ccf5dab6d3bf93321cbd3179d688f61c09` |
| Input rows | 32,607 unique Ensembl IDs, all with complete supplied statistics |

The [authors' preprocessing notebook](https://github.com/UK-SBCoA-EbbertLab/AD_bulk_RNAseq_review/blob/7b55b9c973cfd404cb27d9fd959315410669b9b8/scripts/00.pre-processing/00.pre-processing_meta_analysis_data.ipynb) labels reference/non-reference as AD/Control, adds the reported sample size, removes exact duplicate records and drops NA records before producing this table. The QA contrast is labeled **MAYO temporal cortex: author-coded AD / Control**. Source effects are preserved without changing signs; their direction is taken from author coding, not independently reconstructed from raw samples. The tested background is conditional on the supplied complete table and its upstream processing.

The [conversion](../tools/analysis/prepare-mayo-validation.py) splits the explicitly supplied `ENSG|symbol` label at `|`, keeps the Ensembl field as `gene`, renames the supplied fold-change/FDR columns, and retains the original composite label as an extra column. It preserves every row and each numerical string. No threshold filtering, ID substitution or statistical recalculation occurs. The source repository's MIT software license is not treated as permission to redistribute all underlying cohort data; source and converted experiment tables are held outside the repository.

At gene padj ≤0.05 and absolute log2FC ≥1:

| Check | Result |
| --- | --- |
| Eligible tested genes | 32,607 |
| Selected genes | 397 |
| Uniquely HGNC-mapped input IDs | 26,347 |
| Unresolved IDs | 6,260, including one ambiguous ID; all remain in the input/background |
| Eligible genes matching Reactome | 10,786 |
| Tested pathway family | 2,720, including zero-overlap pathways |
| Pathway BH ≤0.05 | 71 |
| Leading pathway | `R-HSA-2173782`; p ≈5.66053e-19; BH ≈1.53966e-15 |

Every pathway's N/n/K/k, exact overlapping identities, p-value and BH value matched an independent SciPy 1.17 oracle. Maximum absolute p/q error was 1.02e-9; maximum relative error was 1.07e-9. This establishes computational agreement for this input/reference, not biological validation, pathway activity or a novel AD finding. Bulk cell composition, model covariates, gene-length/expression selection bias, pathway overlap, source completeness and reference age remain interpretation limits.

## Original public airway table

The [airway source and cohort provenance](../data/reference/README.md#external-validation-dataset) remain unchanged. The new Ensembl workflow accepts the original 15,513-row table directly by choosing its `gene` column instead of its optional `symbol` column. It does not require the earlier symbol-only conversion or its missing/duplicate-symbol exclusions. Results are N=15,513, selected=749, uniquely HGNC-mapped=14,504, unresolved=1,009 (one ambiguous), Reactome-mapped=7,686, tested family=2,581, and 23 pathways at BH ≤0.05. Every pathway also matched SciPy: maximum absolute error 1.26e-10 and relative error 1.57e-10. This is dexamethasone/untreated human airway data, not an AD experiment. Different backgrounds and identifier references explain why its counts differ from the earlier symbol-subset validation.

## Reproduce numerical/browser QA

Obtain the linked immutable experiment files explicitly outside Git, then prepare the MAYO table:

```sh
python3 tools/analysis/prepare-mayo-validation.py --input /path/to/MAYO_TL.tsv --output /tmp/mayo-validation.csv
```

Produce application results using the same library as the UI, from the repository root:

```sh
node --experimental-strip-types --input-type=module - <<'JS'
import {readFile, writeFile} from 'node:fs/promises';
import {parseExperiment} from './apps/web/src/lib/experiment.ts';
import {validateGeneIdentityReference} from './apps/web/src/lib/gene-identifiers.ts';
import {runExperimentAnalysis, validatePathwayReference} from './apps/web/src/lib/experiment-analysis.ts';
const table = parseExperiment(await readFile('/tmp/mayo-validation.csv', 'utf8'), 'mayo-validation.csv');
const genes = validateGeneIdentityReference(JSON.parse(await readFile('data/reference/hgnc-ensembl.json', 'utf8')));
const pathways = validatePathwayReference(JSON.parse(await readFile('data/reference/reactome-pathways.json', 'utf8')));
const result = runExperimentAnalysis(table, {comparison: 'MAYO temporal cortex: author-coded AD / Control', allTestedGenes: true, allowUnresolvedIds: true, thresholds: {adjustedPMax: 0.05, minAbsLog2FoldChange: 1}}, pathways, genes);
await writeFile('/tmp/mayo-pathways.json', JSON.stringify(result.pathways));
JS
python3 tools/analysis/validate-results.py --input /tmp/mayo-validation.csv --results /tmp/mayo-pathways.json --sha256 0f084d65603e1608c8293300ce0b00ccf5dab6d3bf93321cbd3179d688f61c09 --identifier-type ensembl
python3 tools/browser-smoke.py --url http://127.0.0.1:5173/ --mayo-table /tmp/mayo-validation.csv
```

The numerical oracle requires an existing SciPy; browser QA requires the existing Playwright/system-Chromium environment described in [verification](verification.md). Neither is a frontend dependency, and these commands install nothing. Ordinary browser QA uses synthetic inputs; `--mayo-table` explicitly adds the externally held real table and verifies its hash.

## Rejected AD validation candidate

The GSE53697 reanalysis at [CyrilleMesue, commit a66062f](https://github.com/CyrilleMesue/differentially-expressed-genes-in-Alzheimers/tree/a66062fb6401a1796daeea5bd60b2841d9d0f411) supplies `output_files/DGE/Deseq2-results-all.tsv`, 1,857,651 bytes, SHA-256 `37b73fbb9f44c6b525f34e45e9779ddada493191d3959a42ba64e4e5091f71e8`. It has 15,943 rows, including 99 names rejected by current symbol syntax, with date-like strings such as `7-Sep` and other historic/nonstandard labels. It was not used for enrichment validation; no guesses, automatic repairs or dropped-row substitute were made. [GEO GSE53697](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE53697) describes 17 samples; the reanalysis's retained metadata has 13 (5 control, 8 AD). These are distinct source scopes, not interchangeable sample counts.
