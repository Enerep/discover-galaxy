# Human pathway analysis reference

[reactome-pathways.json](reactome-pathways.json) is a bounded reference for interpreting uploaded human gene-level results. It is separate from the Alzheimer's knowledge-graph snapshot, its claims and its scientific-review records. It contains **2,751 human Reactome pathway IDs and 11,727 distinct original member strings**. It is a broad pathway collection, not a comprehensive list of human genes or an Alzheimer's-specific mechanism map.

## Provenance and reuse

| Field | Recorded value |
| --- | --- |
| Reference ID | `reactome-human-mrbiomics-f5d9af14b2f8` |
| Upstream source | [Reactome download directory](https://reactome.org/download-data/) |
| Retrieved source | [GMT mirrored by Computational Epigenetics / MrBiomics](https://raw.githubusercontent.com/epigen/MrBiomics/fbe2f70935496c73ed21337af70e97e633c2f4d3/resources/ReactomePathways.gmt) |
| Mirror commit | `fbe2f70935496c73ed21337af70e97e633c2f4d3` |
| Retrieved | `2026-10-23T11:42:08Z` |
| Raw GMT | 964,840 bytes; SHA-256 `f5d9af14b2f8d373201372b2e63e3c7b2c5b535d30af1459fddfdba22015cd7d` |
| Normalized JSON | 1,466,389 bytes; SHA-256 `f19f3f37b142e1f0d0a6ef84118f1ae586334b04545897627c6d9236c7a739c6` |
| Exact upstream Reactome release | **Unknown** (`upstream_release: null`) |
| Annotation-data license | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/), per the [Reactome license agreement](https://reactome.org/license), section 1(c) |

The current Reactome download and license pages were inspected on 2026-10-23. The official GMT download and database-version CLI requests were denied by this environment's HTTP policy. The pinned mirror bytes were downloaded successfully and checked; they have not been verified against an official release archive. A mirror commit and digest identify this exact analysis reference, **not an exact upstream release or the current Reactome collection**. Its age and upstream completeness remain unverified.

Reactome permits reuse of its annotation/data files and derived data under CC0. Credit is retained: **Reactome annotation data, mirrored by Computational Epigenetics / MrBiomics; exact upstream release unknown.** No Reactome diagrams, logos, artwork, database dumps or third-party software code are included. Their separate terms are not discharged by this reference's CC0 data license. The mirror's [MIT license](https://github.com/epigen/MrBiomics/blob/fbe2f70935496c73ed21337af70e97e633c2f4d3/LICENSE) covers its own software; it is not used to relicense Reactome content.

## Preparation and checking

The [preparation script](../../tools/analysis/prepare-pathways.py) uses only Python's standard library and performs no network request. Supply the pinned GMT explicitly:

```sh
python3 tools/analysis/prepare-pathways.py --input /path/to/ReactomePathways.gmt
python3 tools/analysis/prepare-pathways.py --input /path/to/ReactomePathways.gmt --check
```

Input byte count and SHA-256 must match the recorded source. Preparation retains each pathway name, stable ID and original member string, including case and ordering; it adds the original pathway-record URL and provenance envelope. It does not resolve aliases, change symbols, discard small pathways or apply a gene-set-size filter. Compact JSON encoding and the recorded retrieval time make output reproducible.

The committed reference can be checked without possessing or downloading the raw input:

```sh
python3 tools/analysis/prepare-pathways.py --check
```

The normalized digest is pinned in the checker. Updating this reference requires a reviewed source diff, new input/output digests, retrieval provenance and corresponding code/document changes. Application builds and browser analysis never fetch or replace it silently.

## Interpretation boundaries

- “Human” describes the Reactome pathways. Some pathway-member strings describe microbial/viral components, gene variants or other nonstandard labels. Original mixed-case human symbols also occur. No HGNC approval or alias mapping has been established for every member. **Do not blanket-uppercase members or silently relabel microbial genes as human genes.** Identifier matching must report its actual behavior and coverage.
- Pathway membership is an annotation, not proof of a disease mechanism, pathway activity or causation. RNA expression changes do not establish corresponding protein binding or signaling changes.
- Use the experiment's eligible tested genes as the declared analysis background. The tiny curated explorer is not a reference gene universe; neither is the union of these pathway members automatically an assay's background. Record any annotation-based restriction and excluded identifiers explicitly.
- Multiple-testing correction must cover the complete eligible tested pathway family, including pathways with no selected-gene overlap. Gene-set-size thresholds are analysis choices, not preparation filters. Overlapping parent/child pathways are not independent mechanisms or independent replication.
- Any follow-up questions derived from overlap remain proposals tied to the uploaded contrast and available evidence. A missing annotation, unmeasured gene or absent explorer edge does not establish a novel research gap.

## External validation dataset

A real public human airway RNA-seq result table was retrieved for local validation only; it is not bundled with this reference or imported into the scientific graph. It is a reanalysis of Himes et al. 2014, [GSE52778](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE52778), [DOI 10.1371/journal.pone.0099625](https://doi.org/10.1371/journal.pone.0099625): four donor-paired airway smooth-muscle cell lines treated with dexamethasone versus untreated. It is **not an Alzheimer's experiment**.

The [reanalysis table](https://raw.githubusercontent.com/pgristow/rnaseq-deseq2-airway/796fe87e7367e87b364f71e1e46b5dd950ea5190/results/deseq2_results.csv) is pinned at commit `796fe87e7367e87b364f71e1e46b5dd950ea5190`, 1,813,055 bytes, SHA-256 `60c342b11354d4dc9a55ba90c0607b9828c2d607a476ea6cde0062b34486efc8`. Its [README](https://github.com/pgristow/rnaseq-deseq2-airway/blob/796fe87e7367e87b364f71e1e46b5dd950ea5190/README.md) describes donor-controlled DESeq2 analysis and apeglm shrinkage. These are the reanalysis author's recorded methods; this project has not rerun alignment, differential expression or effect-size estimation.

The table contains 15,513 rows with Ensembl IDs, optional symbols and finite fold changes/adjusted p-values. A documented QA conversion selected `symbol`, `log2FoldChange` and `padj`, excluded 1,902 missing-symbol rows and all 24 rows belonging to 12 duplicated symbols, and retained **13,587 unambiguous symbol rows**. Numeric values were preserved. At adjusted p-value ≤0.05 and absolute log2 fold change ≥1, 710 rows pass (385 positive, 325 negative). Exactly 7,682 symbols match this reference's member strings with case preserved. These counts describe the converted table and pinned reference; they do not establish biological validity or reproduce the original study's analysis.

The reanalysis README licenses its code under MIT and separately attributes the data to Bioconductor's [airway package](https://bioconductor.org/packages/airway/), whose package metadata reports LGPL. Data redistribution has not been resolved from the code license. Raw and converted experiment tables therefore remain outside the repository; no patient-level or sample-level table is shipped.
