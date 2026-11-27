# Dementia with Lewy bodies

**Source-checked draft · lewy-bodies-source-checked-0.1.0 · 2026-11-27**

The initial map contains seven entities, seven findings from three original human studies, and one paired study comparison. Its scope is genetic association in dementia with Lewy bodies (DLB), with the original studies' case definitions and Alzheimer’s disease (AD) co-pathology thresholds. DLB and Parkinson’s disease dementia are distinct in this collection. Mondo describes the disease identity and HGNC supplies gene identities.

## Reading the evidence

| Original source | Inspected locations and retained findings |
| --- | --- |
| [Tsuang et al., JAMA Neurology, 2013](https://pmc.ncbi.nlm.nih.gov/articles/PMC3580799/) | Methods for subjects, classification and analysis, plus Tables 2–3 in the accepted manuscript. The age-at-death- and sex-adjusted carrier model compared 91 low/absent AD co-pathology cases with 269 autopsied controls. OR 6.1, 95% CI 3.5–10.5. The paper grouped every result below its high AD threshold under low AD change. |
| [Kaivola et al., Brain, 2022](https://pmc.ncbi.nlm.nih.gov/articles/PMC9423712/) | Cohort, neuropathological subgroup methods, Table 1 and the subgroup results. The 88 low/absent AD co-pathology cases met Braak 0–II and CERAD 0–A thresholds. The APOE ε4 estimate versus 2,928 controls was OR 0.75, 95% CI 0.43–1.30. Intermediate and high co-pathology groups each had their own elevated estimate versus the same controls. Seven low-pathology cases carried GBA1 rs2230288 T. Its lower CI bound is 1.94 in the Results and 1.95 in the Discussion. The map cites Results. |
| [Guerreiro et al., The Lancet Neurology, 2018](https://pmc.ncbi.nlm.nih.gov/articles/PMC5805394/) | Cohort and statistical methods and Tables 1–3 in the accepted manuscript. The map cites Table 2’s Global cohort meta-analysis columns for APOE rs429358 C, SNCA rs7681440 C and the GBA1-locus marker rs35749011 G. The separate discovery and replication estimates and denominators are in the evidence details. The combined DLB cohort includes clinical and neuropathological diagnoses. |

Kaivola’s 2023 correction changes the separate APOE-stratified GWAS analysis for GBA1 rs2230288, including its significance wording and Figure 2. The selected pathology-subgroup result has its own cohort and estimate. The source record carries the notice in the inspector, comparison and cited exports. [Brain correction](https://pmc.ncbi.nlm.nih.gov/articles/PMC10393388/)

The comparison aligns carrier model, sampled controls and pathology definitions. Tsuang selected controls with no cognitive impairment at their final assessment, no Lewy body pathology and no high AD pathology. Kaivola used neurologically healthy controls aged at least 50. These design differences matter when reading the estimates. Participant overlap, the cause of the different findings and the equivalence of the two estimates remain unresolved.

## Retrieval and reuse

All lookups on 2026-11-27. Each checksum identifies the inspected response bytes. The repository retains citation facts, selected quantitative facts and project-authored paraphrases. The paper records carry the PMC or publisher terms link and pending reuse status. Kaivola’s PMC article displays the Oxford University Press Standard Journals Publication Model. The Tsuang and Guerreiro PMC pages are author manuscripts subject to the PMC copyright guidance. No article text, tables, figures, supplement files or individual-level data are distributed. [PMC copyright](https://pmc.ncbi.nlm.nih.gov/about/copyright/)

| Inspected response | Bytes | SHA-256 |
| --- | ---: | --- |
| [Tsuang manuscript](https://pmc.ncbi.nlm.nih.gov/articles/PMC3580799/) | 292479 | `7d79a6173f74effd6a5bec8a2b83c74afbd5a92915b5e5629eab550860a162ef` |
| [Kaivola full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC9423712/) | 172083 | `62a14d88d946696bbc70e4ee733c67c616baeeb3b699933e931c5d9118893d19` |
| [Guerreiro manuscript](https://pmc.ncbi.nlm.nih.gov/articles/PMC5805394/) | 1057978 | `c71c2308a6c90e4543bf9d302f3625a0e3fb8b2b8494d36ccffc7a44eaabeb92` |
| [Kaivola correction](https://pmc.ncbi.nlm.nih.gov/articles/PMC10393388/) | 90569 | `e028190a6a4fa759fc4aaf3400d47e24088aa2239297b196da87a1e9e06d52cf` |
| [PubMed XML metadata](https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=23407718,35381062,29263008&retmode=xml) | 103215 | `b58d9d01aab5e1dc39e1f68353b081bea93f7f227d69e613c654f1f2e7314417` |
| [Mondo record via EMBL-EBI OLS](https://www.ebi.ac.uk/ols4/api/ontologies/mondo/terms?short_form=MONDO_0007488) | 7977 | `18d3fbde3d98742843d791cbb155b8ddc39888f6654aea697a4df4f445a3b805` |
| [Mondo OLS version metadata](https://www.ebi.ac.uk/ols4/api/ontologies/mondo) | 1900 | `58bee021e847d239f664ee1c0842dbbc50fd3ebfea20915e0c8c6281236b0d2c` |
| [HGNC APOE](https://rest.genenames.org/fetch/hgnc_id/HGNC:613) | 1075 | `ac545c1a62acf3c35a9596b21252bda705b813123c91c13c0cf22e003c16bc01` |
| [HGNC SNCA](https://rest.genenames.org/fetch/hgnc_id/HGNC:11138) | 1331 | `cc5c30ead5e78798dc5c074fdf6f4f9dfaa5c1de67bd9707d2dae3a2d53844e0` |
| [HGNC GBA1](https://rest.genenames.org/fetch/hgnc_id/HGNC:4177) | 1295 | `fa3aeb07b19a07b3f2fb2c5b2c00f2f79369c888c1ac60d9d1993fd8363968d8` |

PubMed and Crossref were checked for publication notices. PubMed links the Kaivola correction (PMID 37022744) and a commentary for Guerreiro. Neither the checked records nor the viewed manuscripts showed a Tsuang or Guerreiro correction or retraction. Direct publisher requests for Tsuang and Kaivola returned HTTP 403. This was a bounded notice check. [Tsuang Crossref](https://api.crossref.org/works/10.1001/jamaneurol.2013.600) · [Kaivola Crossref](https://api.crossref.org/works/10.1093/brain/awab402) · [Guerreiro Crossref](https://api.crossref.org/works/10.1016/S1474-4422%2817%2930400-3)

OLS reported Mondo release 2026-11-03. Only the specific DLB identity and its abbreviation are used in the map. HGNC API records show a modification date of 2023-01-20 for these three genes. A database-wide version was unavailable. GBA is the previous HGNC symbol for GBA1. [Mondo license](https://raw.githubusercontent.com/monarch-initiative/mondo/v2026-11-03/LICENSE) · [HGNC terms](https://www.genenames.org/about/license/)

Use `npm run validate:data` to validate both collections locally. Generate the DLB source extract with `npm run --silent curation:packet -- lewy-bodies`. The records are AI-assisted source checks. Independent scientific review remains pending.
