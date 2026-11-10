# Sources for the APOE RNA explanation pilot

The [versioned catalog](../data/interpretation/apoe-bulk-rna-sources.json) supplies human-brain literature context for the **Possible explanations** pilot. It is separate from the curated graph and its source/evidence counts. It does not promote an uploaded observation into a claim or manufacture scientific review. Source checking covers the locations below; it is not independent review, raw-data replication or scientific release approval.

## What the sources support

[Mathys et al. (2019)](https://pmc.ncbi.nlm.nih.gov/articles/PMC6865822/) reported cell-type-specific APOE RNA patterns in human postmortem prefrontal cortex. Selected Results, Fig. 1g, Fig. 3a–d, their captions and images, and differential-expression Methods were inspected. The study's 80,660 nuclei came from 48 ROSMAP donors (24 AD-pathology, 24 no/low-pathology); nuclei are not additional independent participants. Captured subpopulation enrichment does not measure absolute cell numbers in intact tissue.

The [2019 publisher correction](https://www.nature.com/articles/s41586-019-1329-6), also linked by Crossref, concerns funding acknowledgements and reversed early/late-pathology column labels in Supplementary Table 2 (Y/Z). The original Fig. 1g comparison must not be described as an independently replicated finding. PMC supplies an author manuscript; the correction is a separate publisher record.

[Murphy, Fancy and Skene (2023)](https://elifesciences.org/articles/90214) reanalyzed **the same cohort**, finding substantial sensitivity to quality control and differential-expression methods. Selected Results/discussion, Fig. 1–3 captions and Methods were inspected. The publisher identifies the December 4, 2023 article as the **Version of Record**, DOI [10.7554/eLife.90214.3](https://doi.org/10.7554/eLife.90214.3); earlier reviewed-preprint versions remain distinct. This is methodological context, not a second participant cohort or proof that APOE has no effect. The pilot deliberately does not predict an APOE direction from these papers.

## Interpretation and follow-up limits

Bulk-tissue RNA alone cannot distinguish changed cell contributions from RNA differences within a cell type, and both may occur. The proposed follow-up should combine independently measured tissue composition with cell-type-resolved APOE RNA in matched samples, retaining donor identity, relevant covariates and comparable sampling. Count tissue cells with a suitable independently validated cell-identification method; do not label snRNA-seq capture fractions as tissue cell counts. Analyze donors as biological units rather than treating their nuclei as independent participants. These are proposed checks, not controls proven sufficient for the user's experiment.

The literature does not verify an uploaded table's species, brain region, diagnosis, sample composition, APOE genotype, RNA quality, protein abundance or causal mechanism. It cannot select a winning explanation. The pilot must use explicitly applied observational bulk-brain context and actual applied APOE RNA statistics, keeping synthetic examples labeled. Neither paper adds graph findings or borrows mouse Abca1/ApoE evidence.

## Retrieval and provenance

Original response bytes were downloaded into temporary workspace files with inherited HTTPS proxy/CA settings on **2026-11-10 (UTC)**. The catalog records exact retrieval timestamps and SHA-256 for the main inspected full-text response of each retained source. Temporary article HTML, images and raw API responses are not committed. Hashes identify those retrieved representations, not an independently immutable publisher release.

| Inspected representation | SHA-256 |
| --- | --- |
| Mathys PMC author-manuscript HTML, 270,692 bytes | `0e652e85f054b4ae9e8277d065215d1375ff02f306caa60c59b0d9ae9151d27f` |
| Mathys Fig. 1 original image, 430,470 bytes | `871f38bc3b53afc13217608d4bbb30fd34c3797126080b0e9f18346f0581d775` |
| Mathys Fig. 3 original image, 533,871 bytes | `1838fe820902be10de136fa760ba38be8225c2d68e2b4fbc03c4dac829f275eb` |
| Mathys publisher author-correction HTML, 253,457 bytes | `da1c7ed63a5eb67d2553a672887aec2e561610051253183982a5ae1a1c2af62f` |
| Mathys Crossref metadata, 26,118 bytes | `77be668ae1bb43b4367ba6e3423c363f1bcd87bfe472181f981d0764b1211994` |
| Murphy publisher Version-of-Record HTML, 378,565 bytes | `21ec2ec32d3bc2f22073cf37649cc30bc5c9c1b4f5e415b5e024cda1ba69a442` |
| Murphy PMC full-text HTML, 233,511 bytes | `d73aa95e568057c6955fdfc34a9b5fdc6275918c422ecd004aa2af4f79f6532e` |
| Murphy Crossref metadata, 16,016 bytes | `b7c0098f811c35adbc5a18b9f85d40827bb7a4172f52300010e71b21da19f17e` |

The Grubman 2019 candidate (DOI 10.1038/s41593-019-0539-4) was considered, but only publisher preview material and bibliographic metadata were reached in this pass. It is excluded from the retained pilot catalog; no full-experiment check is claimed.

## Reuse and publication status

Only citation metadata, precise source links and limited project-authored factual paraphrases are retained. Article text, figures, participant-level records and count matrices are not redistributed. Mathys full-text/image reuse remains **pending review**: PMC availability and the Crossref Springer TDM link are not an open redistribution licence. Its original rights remain with the applicable holders. The article's linked Nature reprints endpoint returned HTTP 503 during this pass; no successful full terms review is claimed. Murphy's PMC copyright statement and Crossref record identify **CC BY 4.0**; the catalog retains attribution, source link and paraphrase notice.

The observed Mathys author correction is recorded with its original URL and limited scope. Murphy publication status remains `not_checked`, with a null check date, because a comprehensive correction/retraction search was not completed. A reachable full-text page, Crossref response or Version-of-Record label does not complete that check. All source-check/reuse limits stay separate from the graph's future scientific-release gate.
