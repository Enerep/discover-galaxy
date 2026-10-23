# Alzheimer’s candidate-source coverage

Generated from candidate-coverage.json and the current snapshot. Edit the JSON, then regenerate. This is a reading plan: candidates are unreviewed, outside the graph, and do not establish support for any existing or proposed claim.

- **Prepared:** 2026-10-23
- **Baseline snapshot:** alzheimers-source-checked-0.3.0
- **Staged sources:** 6 (6 publications, 0 pathway records)
- **Selection:** Targeted, AI-assisted web lookup of original publications around APOE, ABCA1, and TREM2. The two earlier Reactome candidates were checked separately for snapshot 0.2.0. This is a selective reading list, not a systematic search or an OpenAlex API import.

## Limits

- The six publication candidates remain unreviewed and outside the graph. The two earlier pathway candidates were added separately as source-checked draft annotations in snapshot 0.2.0, not approved scientific records.
- Inspection was limited to the locations recorded per source. Search-indexed excerpts may be stale; several direct PubMed/PMC opens returned challenges. No full paper, supplement, figure, or table was reviewed.
- Sample sizes, effect estimates, experiment-level species and methods, cohort overlap, and publication-status checks require extraction from original sources. Unknown fields are not negative findings.
- Human Reactome records describe curated biological processes, not an AD-specific causal mechanism. Their database release and record versions were not captured; an attempted version endpoint lookup was unavailable.
- Gene and protein identities remain separate. The candidate papers need assay-level extraction before their experimental findings can become graph claims.
- These are source-reading questions, not novel research hypotheses or curated contradictions. The 22-entity development snapshot meets the size target; scientific release remains a separate future milestone.

## Existing findings and recorded review status

The [starter review packet](review-packet.md) contains the complete findings and source-specific evidence. These anchors are navigation context, not claims that the staged papers replicate or support them.

| Existing claim | Original source | Claim review | Evidence review | Human review recorded for claim and all evidence |
| --- | --- | --- | --- | --- |
| claim-abca1-cholesterol-pathway | [source-reactome-abca1-protein](https://reactome.org/content/detail/R-HSA-194209) | draft | draft | No |
| claim-abca1-encodes | [source-reactome-abca1-protein](https://reactome.org/content/detail/R-HSA-194209) | draft | draft | No |
| claim-abca1-n1800h-risk | [26079414](https://pubmed.ncbi.nlm.nih.gov/26079414/) | draft | draft | No |
| claim-apoe-cholesterol-pathway | [source-reactome-apoe-expression](https://reactome.org/content/detail/R-HSA-9031512) | draft | draft | No |
| claim-apoe-e2-risk | [7920638](https://pubmed.ncbi.nlm.nih.gov/7920638/) | draft | draft | No |
| claim-apoe-e4-risk | [8346443](https://pubmed.ncbi.nlm.nih.gov/8346443/) | draft | draft | No |
| claim-apoe-encodes | [source-uniprot-apoe](https://rest.uniprot.org/uniprotkb/P02649.txt) | draft | draft | No |
| claim-nr1h2-cholesterol-pathway | [source-reactome-nr1h2-protein](https://reactome.org/content/detail/R-HSA-375500) | draft | draft | No |
| claim-nr1h2-encodes | [source-reactome-nr1h2-protein](https://reactome.org/content/detail/R-HSA-375500) | draft | draft | No |
| claim-nr1h3-cholesterol-pathway | [source-reactome-nr1h3-protein](https://reactome.org/content/detail/R-HSA-8854957) | draft | draft | No |
| claim-nr1h3-encodes | [source-reactome-nr1h3-protein](https://reactome.org/content/detail/R-HSA-8854957) | draft | draft | No |
| claim-rxra-cholesterol-pathway | [source-reactome-rxra-protein](https://reactome.org/content/detail/R-HSA-381319) | draft | draft | No |
| claim-rxra-encodes | [source-uniprot-rxra](https://rest.uniprot.org/uniprotkb/P19793.txt) | draft | draft | No |
| claim-trem2-apoe-binding | [26374899](https://pubmed.ncbi.nlm.nih.gov/26374899/) | draft | draft | No |
| claim-trem2-dap12-binding | [source-reactome-trem2-dap12](https://reactome.org/content/detail/R-HSA-210300) | draft | draft | No |
| claim-trem2-dap12-pathway | [source-reactome-trem2-protein](https://reactome.org/content/detail/R-HSA-197664) | draft | draft | No |
| claim-trem2-encodes | [source-uniprot-trem2](https://rest.uniprot.org/uniprotkb/Q9NZC2.txt) | draft | draft | No |
| claim-trem2-r47h-apoe-binding | [26374899](https://pubmed.ncbi.nlm.nih.gov/26374899/) | draft | draft | No |
| claim-trem2-r47h-risk | [23150908](https://pubmed.ncbi.nlm.nih.gov/23150908/) | draft | draft | No |
| claim-tyrobp-dap12-pathway | [source-reactome-tyrobp-state](https://reactome.org/content/detail/R-HSA-210010) | draft | draft | No |
| claim-tyrobp-encodes | [source-uniprot-tyrobp](https://rest.uniprot.org/uniprotkb/O43914.txt) | draft | draft | No |

## Reading questions and source coverage

Source counts are not independent-study counts. Questions identify checks to perform; they are not novel hypotheses or classified contradictions.

### reading-abca1-apoe-lipids

What do the ABCA1 experiments measure about ApoE lipid handling, and how would that relate to the scoped human association findings?

**Current graph anchors:** gene-abca1; gene-apoe. These remain their recorded entity types.

**Existing finding context:** claim-abca1-n1800h-risk; claim-apoe-e4-risk; claim-apoe-e2-risk; claim-apoe-cholesterol-pathway; claim-abca1-cholesterol-pathway

| Candidate source | Kind | Recorded model | Recorded readout |
| --- | --- | --- | --- |
| [Wahrle et al. (2004)](https://pubmed.ncbi.nlm.nih.gov/15269217/) | primary\_publication | Abca1 genotype comparisons; primary astrocyte cultures | CNS ApoE levels and secreted-particle lipidation |
| [Hirsch-Reinshagen et al. (2004)](https://pubmed.ncbi.nlm.nih.gov/15269218/) | primary\_publication | ABCA1-deficient astrocytes and microglia; species needs source extraction | Lipid efflux to ApoE and brain ApoE metabolism |

**Before proposing a graph claim:**

- [ ] Extract species, genotype, cell preparation, assay and experiment-specific counts; separate ApoE protein lipidation from APOE genotype associations.
- [ ] Assess model/material overlap between the two 2004 publications; distinct DOIs do not establish independent replication.
- [ ] Resolve relevant Reactome member events, protein/gene identities, primary references and exact release. Do not treat a peripheral pathway as a demonstrated brain or AD mechanism.

### reading-trem2-apoe-interaction

Which experiments address TREM2–APOE protein interactions or microglial transcription, and which proposed pathway relationships would each support?

**Current graph anchors:** gene-trem2; gene-apoe. These remain their recorded entity types.

**Existing finding context:** claim-trem2-r47h-risk; claim-apoe-e4-risk; claim-apoe-e2-risk; claim-trem2-dap12-binding; claim-trem2-dap12-pathway; claim-trem2-apoe-binding; claim-trem2-r47h-apoe-binding

| Candidate source | Kind | Recorded model | Recorded readout |
| --- | --- | --- | --- |
| [Yeh et al. (2016)](https://pubmed.ncbi.nlm.nih.gov/27477018/) | primary\_publication | Protein binding, heterologous cells, knockout microglia, and human variant-carrier macrophages; resolve each assay separately | Apolipoprotein binding and uptake of lipoprotein-associated amyloid-beta |
| [Krasemann et al. (2017)](https://pubmed.ncbi.nlm.nih.gov/28930663/) | primary\_publication | Multiple neurodegeneration models; extract AD-specific experiments separately | Microglial transcriptional phenotype |

**Before proposing a graph claim:**

- [ ] Separate binding, cellular uptake and transcriptional endpoints. Extract assay-specific organism, protein form, variant, model and controls.
- [ ] Distinguish protein-level interactions from gene associations and human risk from experimental perturbations; resolve canonical protein identities before adding nodes.
- [ ] Inspect TREM2/DAP12 member-event provenance and record versions; an upstream pathway name or review badge does not establish an AD-specific edge or project approval.
- [ ] Compare the staged papers with the separately source-checked Atagi 2015 binding assays; preserve shared-source identity, protein form and endpoint. Binding, signaling and uptake are different outcomes.

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
