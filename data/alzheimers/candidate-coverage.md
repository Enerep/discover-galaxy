# Alzheimer’s candidate-source coverage

Generated from candidate-coverage.json and the current snapshot. Edit the JSON, then regenerate. This is a reading plan: candidates are unreviewed, outside the graph, and do not establish support for any existing or proposed claim.

- **Prepared:** 2026-10-22
- **Baseline snapshot:** alzheimers-starter-0.1.0
- **Staged sources:** 8 (6 publications, 2 pathway records)
- **Selection:** Targeted, AI-assisted web lookup of original publications and human Reactome records around the starter's APOE, ABCA1, and TREM2 anchors. This is a selective reading list, not a systematic search or an OpenAlex API import.

## Limits

- All candidates are unreviewed and outside the public graph. No source count establishes independent experiments, replication, or evidence strength.
- Inspection was limited to the locations recorded per source. Search-indexed excerpts may be stale; several direct PubMed/PMC opens returned challenges. No full paper, supplement, figure, or table was reviewed.
- Sample sizes, effect estimates, experiment-level species and methods, cohort overlap, and publication-status checks require extraction from original sources. Unknown fields are not negative findings.
- Human Reactome records describe curated biological processes, not an AD-specific causal mechanism. Their database release and record versions were not captured; an attempted version endpoint lookup was unavailable.
- Genes in the current graph are search anchors. Protein interactions require separately resolved protein identities; mouse experiments must not become human gene or clinical-effect claims.
- These are source-reading questions, not novel research hypotheses or curated contradictions. The 20–50 entity release and human scientific review remain pending.

## Existing findings and recorded review status

The [starter review packet](review-packet.md) contains the complete findings and source-specific evidence. These anchors are navigation context, not claims that the staged papers replicate or support them.

| Existing claim | Original source | Claim review | Evidence review | Human review recorded for claim and all evidence |
| --- | --- | --- | --- | --- |
| claim-abca1-n1800h-risk | [26079414](https://pubmed.ncbi.nlm.nih.gov/26079414/) | draft | draft | No |
| claim-apoe-e2-risk | [7920638](https://pubmed.ncbi.nlm.nih.gov/7920638/) | draft | draft | No |
| claim-apoe-e4-risk | [8346443](https://pubmed.ncbi.nlm.nih.gov/8346443/) | draft | draft | No |
| claim-trem2-r47h-risk | [23150908](https://pubmed.ncbi.nlm.nih.gov/23150908/) | draft | draft | No |

## Reading questions and source coverage

Source counts are not independent-study counts. Questions identify checks to perform; they are not novel hypotheses or classified contradictions.

### reading-abca1-apoe-lipids

What do the ABCA1 experiments measure about ApoE lipid handling, and how would that relate to the scoped human association findings?

**Current graph anchors:** gene-abca1; gene-apoe. These remain their recorded entity types.

**Existing finding context:** claim-abca1-n1800h-risk; claim-apoe-e4-risk; claim-apoe-e2-risk

| Candidate source | Kind | Recorded model | Recorded readout |
| --- | --- | --- | --- |
| [Wahrle et al. (2004)](https://pubmed.ncbi.nlm.nih.gov/15269217/) | primary\_publication | Abca1 genotype comparisons; primary astrocyte cultures | CNS ApoE levels and secreted-particle lipidation |
| [Hirsch-Reinshagen et al. (2004)](https://pubmed.ncbi.nlm.nih.gov/15269218/) | primary\_publication | ABCA1-deficient astrocytes and microglia; species needs source extraction | Lipid efflux to ApoE and brain ApoE metabolism |
| [Reactome R-HSA-9029569](https://reactome.org/content/detail/R-HSA-9029569) | pathway\_record | Curated pathway record; not an AD experiment | Cholesterol transport/efflux gene regulation |

**Before proposing a graph claim:**

- [ ] Extract species, genotype, cell preparation, assay and experiment-specific counts; separate ApoE protein lipidation from APOE genotype associations.
- [ ] Assess model/material overlap between the two 2004 publications; distinct DOIs do not establish independent replication.
- [ ] Resolve relevant Reactome member events, protein/gene identities, primary references and exact release. Do not treat a peripheral pathway as a demonstrated brain or AD mechanism.

### reading-trem2-apoe-interaction

Which experiments address TREM2–APOE protein interactions or microglial transcription, and which proposed pathway relationships would each support?

**Current graph anchors:** gene-trem2; gene-apoe. These remain their recorded entity types.

**Existing finding context:** claim-trem2-r47h-risk; claim-apoe-e4-risk; claim-apoe-e2-risk

| Candidate source | Kind | Recorded model | Recorded readout |
| --- | --- | --- | --- |
| [Yeh et al. (2016)](https://pubmed.ncbi.nlm.nih.gov/27477018/) | primary\_publication | Protein binding, heterologous cells, knockout microglia, and human variant-carrier macrophages; resolve each assay separately | Apolipoprotein binding and uptake of lipoprotein-associated amyloid-beta |
| [Krasemann et al. (2017)](https://pubmed.ncbi.nlm.nih.gov/28930663/) | primary\_publication | Multiple neurodegeneration models; extract AD-specific experiments separately | Microglial transcriptional phenotype |
| [Reactome R-HSA-2424491](https://reactome.org/content/detail/R-HSA-2424491) | pathway\_record | Curated immune-signaling pathway; not AD-specific | DAP12 signaling |

**Before proposing a graph claim:**

- [ ] Separate binding, cellular uptake and transcriptional endpoints. Extract assay-specific organism, protein form, variant, model and controls.
- [ ] Distinguish protein-level interactions from gene associations and human risk from experimental perturbations; resolve canonical protein identities before adding nodes.
- [ ] Inspect TREM2/DAP12 member-event provenance and record versions; an upstream pathway name or review badge does not establish an AD-specific edge or project approval.

### reading-trem2-model-context

Do the two 2015 TREM2 model studies address comparable perturbations, cell populations, disease stages and outcomes?

**Current graph anchors:** gene-trem2. These remain their recorded entity types.

**Existing finding context:** claim-trem2-r47h-risk

| Candidate source | Kind | Recorded model | Recorded readout |
| --- | --- | --- | --- |
| [Wang et al. (2015)](https://pubmed.ncbi.nlm.nih.gov/25728668/) | primary\_publication | Trem2 deficiency in the 5XFAD model; other assays need extraction | Microglial response and lipid sensing |
| [Jay et al. (2015)](https://pubmed.ncbi.nlm.nih.gov/25732305/) | primary\_publication | Trem2-deficient AD mouse models; human AD tissue observations are a separate component | Plaque-associated myeloid cells, inflammation, amyloid and tau pathology |

**Before proposing a graph claim:**

- [ ] Extract mouse line, genetic background, age, sex, disease stage, cell markers and brain region per experiment before comparing outcomes.
- [ ] Distinguish microglial response, macrophage classification, amyloid/tau readouts and human tissue observations; do not infer a contradiction from abstract wording.
- [ ] Check shared animals/data, later corrections and follow-up work. Neither result establishes whether changing TREM2 would benefit people.

## Candidate provenance and outstanding checks

### candidate-hirsch-reinshagen-2004

[Deficiency of ABCA1 impairs apolipoprotein E metabolism in brain](https://pubmed.ncbi.nlm.nih.gov/15269218/)

- **Citation:** Hirsch-Reinshagen et al. (2004)
- **Identifiers:** pmid: 15269218; doi: 10.1074/jbc.M407962200
- **Provider / release:** PubMed / Not captured; access date is not a release
- **Inspected:** 2026-10-22 · indexed_excerpt · [location](https://pubmed.ncbi.nlm.nih.gov/15269218/)
- **Locator / access limits:** PubMed page metadata and indexed abstract excerpts; later page opens returned a challenge.
- **Recorded organisms:** Not extracted; not an exhaustive assay-level species extraction
- **Sample size:** Not extracted; do not pool experiment-level counts
- **Review / graph:** unreviewed / not_in_graph
- **Publication status:** not_checked; absence of a notice has not been established
- **Reuse:** pending_review · [terms](https://www.ncbi.nlm.nih.gov/home/about/policies/) · checked Not extracted
- **Terms observation:** Not extracted

### candidate-jay-2015

[TREM2 deficiency eliminates TREM2+ inflammatory macrophages and ameliorates pathology in Alzheimer's disease mouse models](https://pubmed.ncbi.nlm.nih.gov/25732305/)

- **Citation:** Jay et al. (2015)
- **Identifiers:** pmid: 25732305; doi: 10.1084/jem.20142322
- **Provider / release:** PubMed / Not captured; access date is not a release
- **Inspected:** 2026-10-22 · page · [location](https://pubmed.ncbi.nlm.nih.gov/25732305/)
- **Locator / access limits:** PubMed bibliographic metadata and Abstract; full methods, figures, and article body not inspected.
- **Recorded organisms:** Mus musculus; Homo sapiens; not an exhaustive assay-level species extraction
- **Sample size:** Not extracted; do not pool experiment-level counts
- **Review / graph:** unreviewed / not_in_graph
- **Publication status:** not_checked; absence of a notice has not been established
- **Reuse:** pending_review · [terms](https://www.ncbi.nlm.nih.gov/home/about/policies/) · checked Not extracted
- **Terms observation:** Not extracted

### candidate-krasemann-2017

[The TREM2-APOE Pathway Drives the Transcriptional Phenotype of Dysfunctional Microglia in Neurodegenerative Diseases](https://pubmed.ncbi.nlm.nih.gov/28930663/)

- **Citation:** Krasemann et al. (2017)
- **Identifiers:** pmid: 28930663; doi: 10.1016/j.immuni.2017.08.008
- **Provider / release:** PubMed / Not captured; access date is not a release
- **Inspected:** 2026-10-22 · indexed_excerpt · [location](https://pubmed.ncbi.nlm.nih.gov/28930663/)
- **Locator / access limits:** Indexed PubMed/PMC metadata and abstract excerpts; direct PubMed and PMC opens returned challenges.
- **Recorded organisms:** Not extracted; not an exhaustive assay-level species extraction
- **Sample size:** Not extracted; do not pool experiment-level counts
- **Review / graph:** unreviewed / not_in_graph
- **Publication status:** not_checked; absence of a notice has not been established
- **Reuse:** pending_review · [terms](https://www.ncbi.nlm.nih.gov/home/about/policies/) · checked Not extracted
- **Terms observation:** Not extracted

### candidate-reactome-cholesterol-efflux

[NR1H3 & NR1H2 regulate gene expression linked to cholesterol transport and efflux](https://reactome.org/content/detail/R-HSA-9029569)

- **Citation:** Reactome R-HSA-9029569
- **Identifiers:** reactome: R-HSA-9029569
- **Provider / release:** Reactome / Not captured; access date is not a release
- **Inspected:** 2026-10-22 · page · [location](https://reactome.org/content/detail/R-HSA-9029569)
- **Locator / access limits:** Pathway identity, species and indexed summary; member-event provenance and database release not extracted.
- **Recorded organisms:** Homo sapiens; not an exhaustive assay-level species extraction
- **Sample size:** Not extracted; do not pool experiment-level counts
- **Review / graph:** unreviewed / not_in_graph
- **Publication status:** not_applicable; database revision provenance still needs checking
- **Reuse:** pending_review · [terms](https://reactome.org/license) · checked 2026-10-22
- **Terms observation:** Reactome distinguishes CC0 database data from CC BY 4.0 illustrations. Only record metadata and project-authored notes are retained; no artwork or source text is copied.

### candidate-reactome-dap12

[DAP12 signaling](https://reactome.org/content/detail/R-HSA-2424491)

- **Citation:** Reactome R-HSA-2424491
- **Identifiers:** reactome: R-HSA-2424491
- **Provider / release:** Reactome / Not captured; access date is not a release
- **Inspected:** 2026-10-22 · page · [location](https://reactome.org/content/detail/R-HSA-2424491)
- **Locator / access limits:** Pathway identity and species; TREM2 protein lookup R-HSA-197664 provides a navigation anchor, not an extracted membership assertion.
- **Recorded organisms:** Homo sapiens; not an exhaustive assay-level species extraction
- **Sample size:** Not extracted; do not pool experiment-level counts
- **Review / graph:** unreviewed / not_in_graph
- **Publication status:** not_applicable; database revision provenance still needs checking
- **Reuse:** pending_review · [terms](https://reactome.org/license) · checked 2026-10-22
- **Terms observation:** CC0 database data; illustrations have separate CC BY 4.0 terms. No illustrations or source text are retained.

### candidate-wahrle-2004

[ABCA1 is required for normal central nervous system ApoE levels and for lipidation of astrocyte-secreted apoE](https://pubmed.ncbi.nlm.nih.gov/15269217/)

- **Citation:** Wahrle et al. (2004)
- **Identifiers:** pmid: 15269217; doi: 10.1074/jbc.M407963200
- **Provider / release:** PubMed / Not captured; access date is not a release
- **Inspected:** 2026-10-22 · indexed_excerpt · [location](https://pubmed.ncbi.nlm.nih.gov/15269217/)
- **Locator / access limits:** Indexed metadata and abstract excerpts; direct PubMed open returned a challenge.
- **Recorded organisms:** Mus musculus; not an exhaustive assay-level species extraction
- **Sample size:** Not extracted; do not pool experiment-level counts
- **Review / graph:** unreviewed / not_in_graph
- **Publication status:** not_checked; absence of a notice has not been established
- **Reuse:** pending_review · [terms](https://www.ncbi.nlm.nih.gov/home/about/policies/) · checked Not extracted
- **Terms observation:** Not extracted

### candidate-wang-2015

[TREM2 lipid sensing sustains the microglial response in an Alzheimer's disease model](https://pubmed.ncbi.nlm.nih.gov/25728668/)

- **Citation:** Wang et al. (2015)
- **Identifiers:** pmid: 25728668; doi: 10.1016/j.cell.2015.01.049
- **Provider / release:** PubMed / Not captured; access date is not a release
- **Inspected:** 2026-10-22 · indexed_excerpt · [location](https://pubmed.ncbi.nlm.nih.gov/25728668/)
- **Locator / access limits:** PubMed page metadata and indexed abstract excerpts; later page opens returned a challenge.
- **Recorded organisms:** Mus musculus; not an exhaustive assay-level species extraction
- **Sample size:** Not extracted; do not pool experiment-level counts
- **Review / graph:** unreviewed / not_in_graph
- **Publication status:** not_checked; absence of a notice has not been established
- **Reuse:** pending_review · [terms](https://www.ncbi.nlm.nih.gov/home/about/policies/) · checked Not extracted
- **Terms observation:** Not extracted

### candidate-yeh-2016

[TREM2 Binds to Apolipoproteins, Including APOE and CLU/APOJ, and Thereby Facilitates Uptake of Amyloid-Beta by Microglia](https://pubmed.ncbi.nlm.nih.gov/27477018/)

- **Citation:** Yeh et al. (2016)
- **Identifiers:** pmid: 27477018; doi: 10.1016/j.neuron.2016.06.015
- **Provider / release:** PubMed / Not captured; access date is not a release
- **Inspected:** 2026-10-22 · page · [location](https://shenglab.broadinstitute.org/publications/trem2-binds-apolipoproteins-including-apoe-and-cluapoj-and-thereby-facilitates-uptake)
- **Locator / access limits:** Author laboratory citation and Abstract; DOI cross-checked in indexed PubMed metadata. Full text not inspected.
- **Recorded organisms:** Not extracted; not an exhaustive assay-level species extraction
- **Sample size:** Not extracted; do not pool experiment-level counts
- **Review / graph:** unreviewed / not_in_graph
- **Publication status:** not_checked; absence of a notice has not been established
- **Reuse:** pending_review · [terms](https://www.ncbi.nlm.nih.gov/home/about/policies/) · checked Not extracted
- **Terms observation:** Not extracted

## Review handoff

Retained content is bibliographic metadata, identifiers, links, and project-authored screening notes. No abstracts, paper text, figures, or Reactome artwork are redistributed.

A human scientific reviewer must inspect original methods/results, extract scoped findings with locators and limitations, assess overlap and publication status, resolve biological identities, and complete source reuse checks. Record actual claim/evidence review attestations in a separate dataset diff; this staging tool cannot create them. Capture the exact Reactome release and member-event provenance before adding pathway assertions.

Generate: `npm run --silent curation:coverage`

Check freshness: `npm run curation:coverage:check`

Generation validates the reading plan and its baseline references. It makes no network requests and does not modify the dataset or approve scientific interpretations.
