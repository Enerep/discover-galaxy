# Alzheimer’s source-review packet

Generated from the checked-in dataset. Do not edit this extract: record actual reviews and source checks in the dataset, then regenerate it.
Generating this packet performs structural validation only; it does not inspect publications, establish study independence, or grant scientific approval.

- **Dataset:** alzheimers-source-checked-0.8.0
- **Schema:** 0.2.0
- **Snapshot date:** 2026-11-05
- **Release status:** development
- **Coverage:** 45 entities, 49 claims, 49 evidence records, 49 sources
- **Disease:** Alzheimer's disease
- **Inclusion criteria:** Selected Alzheimer's association studies, human gene–protein identities, curated cholesterol-regulation and DAP12 records, binding assays from three publications, and one source-checked study-context comparison. Adds MARCO and SCARA5 from a validated public AD pathway result, APOB ligand context, curated scavenger-receptor participation and two assay-scoped modified-apoB findings from Cheng 2021. Adds source-checked mouse Abca1/Apoe orthology and genotype-scoped ApoE readouts from Wahrle2004 and Hirsch-Reinshagen2005, plus separately labeled human Open Targets aggregate associations.

## Scope limitations

- Source-checked draft: inspected locations include study abstracts/metadata, original figure captions, selected search-indexed methods/results passages, and specific database annotations; this is not a comprehensive literature or full-paper review.
- The four human genetic association findings retain their original variant and population scopes. Database pathways do not establish AD causality, individual risk or treatment benefit.
- The APOE–TREM2 binding findings concern in vitro protein constructs. They are not human clinical observations or evidence of signaling, disease causation or treatment benefit.
- Human and explicitly species-qualified mouse genes/proteins remain separate. Orthology permits navigation, not transfer of experimental effects or human RNA measurements. Molecular preparations/fractions remain in context rather than distinct isoform/state nodes.
- Reactome assertions are attributed curated records, not independent experiments. Access dates are recorded; the exact Reactome database release was not captured.
- Independent scientific review is a future milestone. Remaining reuse and correction/retraction checks are recorded per source; no human-review attestation is inferred.
- One draft study-context comparison records different R47H assay reports. It does not establish a settled contradiction, the cause of the difference, or clinical effects. No research hypotheses are included.
- Different publication identifiers do not establish independent replication. Assay preparations, surface presentation and replicate units remain source-specific; a recorded correction does not mean a comprehensive notice search is complete.
- MARCO/SCARA5 inclusion was prioritized using a public AD differential-expression table. Those input statistics are not graph claims; the Cheng protein assays were not an AD patient or brain experiment, and mouse-inferred Reactome annotations retain their inference scope.
- Open Targets association summaries are database aggregates, not additional original experiments or independent support for the existing variant-specific findings.
- Mouse perturbation effects remain model/readout-specific; neither orthology nor a human disease annotation establishes the mouse effect in humans.
- The broader human enrichment and HGNC references are unchanged; human RNA evidence coverage never traverses orthology links to borrow mouse papers.

## Source coverage

Each row is one source record, not an independent experiment or cohort. Database identity records and repeated references do not add independent biological support; even different publications may reuse participants. Study independence and comparability require human assessment.

| Source | Kind | Linked claims | Entity provenance | Reuse | Publication status |
| --- | --- | --- | --- | --- | --- |
| source-atagi-2015 | publication | claim-trem2-apoe-binding; claim-trem2-r47h-apoe-binding | paper-atagi-2015 | pending\_review | not\_checked |
| source-bailey-2015 | publication | claim-bailey-trem2-apoe-binding; claim-bailey-trem2-r47h-apoe-binding | paper-bailey-2015 | pending\_review | corrected |
| source-cheng-2021 | publication | claim-cheng-marco-modified-apob-binding; claim-cheng-scara5-modified-apob-binding | paper-cheng-2021 | pending\_review | not\_checked |
| source-corder-1993 | publication | claim-apoe-e4-risk | paper-corder-1993 | pending\_review | not\_checked |
| source-corder-1994 | publication | claim-apoe-e2-risk | paper-corder-1994 | pending\_review | not\_checked |
| source-ensembl-abca1-orthology | database\_record | claim-mouse-abca1-human-ortholog | gene-mouse-abca1 | pending\_review | not\_checked |
| source-ensembl-apoe-orthology | database\_record | claim-mouse-apoe-human-ortholog | gene-mouse-apoe | pending\_review | not\_checked |
| source-hgnc-coverage-identities | database\_record | claim-col1a1-encodes; claim-col1a2-encodes; claim-col3a1-encodes; claim-saa1-encodes | gene-col1a1; gene-col1a2; gene-col3a1; gene-saa1; protein-col1a1; protein-col1a2; protein-col3a1; protein-saa1 | permitted | not\_checked |
| source-hgnc-scavenger-identities | database\_record | claim-apob-encodes; claim-marco-encodes; claim-scara5-encodes | gene-apob; gene-marco; gene-scara5; protein-apob; protein-marco; protein-scara5 | permitted | not\_checked |
| source-hirsch-reinshagen-2005 | publication | claim-mouse-abca1-apoe-soluble-app-ps1; claim-mouse-abca1-apoe-soluble-tgswdi | paper-hirsch-reinshagen-2005 | permitted | not\_checked |
| source-jonsson-2013 | publication | claim-trem2-r47h-risk | paper-jonsson-2013 | pending\_review | not\_checked |
| source-lessard-2018 | publication | claim-lessard-trem2-r47h-apoe3-binding | paper-lessard-2018 | permitted | not\_checked |
| source-mesh-alzheimers | database\_record | None | disease-alzheimers | pending\_review | not\_checked |
| source-mondo-alzheimers-mesh | database\_record | None | disease-alzheimers | pending\_review | not\_checked |
| source-ncbi-abca1 | database\_record | None | gene-abca1 | pending\_review | not\_checked |
| source-ncbi-apoe | database\_record | None | gene-apoe | pending\_review | not\_checked |
| source-ncbi-mouse-abca1-apoe | database\_record | None | gene-mouse-abca1; gene-mouse-apoe | permitted | not\_checked |
| source-ncbi-trem2 | database\_record | None | gene-trem2 | pending\_review | not\_checked |
| source-nordestgaard-2015 | publication | claim-abca1-n1800h-risk | paper-nordestgaard-2015 | pending\_review | not\_checked |
| source-openalex-apoe-abca1-legacy | database\_record | None | Not recorded | permitted | not\_checked |
| source-openalex-apoe-abca1-live | database\_record | None | Not recorded | permitted | not\_checked |
| source-opentargets-abca1-direct-association | database\_record | claim-abca1-opentargets-association | Not recorded | permitted | not\_checked |
| source-opentargets-apoe-direct-association | database\_record | claim-apoe-opentargets-association | Not recorded | permitted | not\_checked |
| source-reactome-abca1-live-mapping | database\_record | None | pathway-cholesterol-efflux | permitted | not\_checked |
| source-reactome-abca1-protein | database\_record | claim-abca1-cholesterol-pathway; claim-abca1-encodes | protein-abca1 | permitted | not\_checked |
| source-reactome-apob-scavenger | database\_record | claim-apob-scavenger-pathway | Not recorded | permitted | not\_checked |
| source-reactome-apoe-expression | database\_record | claim-apoe-cholesterol-pathway | Not recorded | permitted | not\_checked |
| source-reactome-apoe-live-mapping | database\_record | None | pathway-cholesterol-efflux | permitted | not\_checked |
| source-reactome-apoe-scavenger | database\_record | claim-apoe-scavenger-pathway | Not recorded | permitted | not\_checked |
| source-reactome-cholesterol-efflux | database\_record | None | pathway-cholesterol-efflux | permitted | not\_checked |
| source-reactome-dap12 | database\_record | None | pathway-dap12 | permitted | not\_checked |
| source-reactome-marco-binding | database\_record | claim-marco-scavenger-pathway | Not recorded | permitted | not\_checked |
| source-reactome-nr1h2-protein | database\_record | claim-nr1h2-cholesterol-pathway; claim-nr1h2-encodes | gene-nr1h2; protein-nr1h2 | permitted | not\_checked |
| source-reactome-nr1h3-protein | database\_record | claim-nr1h3-cholesterol-pathway; claim-nr1h3-encodes | gene-nr1h3; protein-nr1h3 | permitted | not\_checked |
| source-reactome-rxra-protein | database\_record | claim-rxra-cholesterol-pathway | Not recorded | permitted | not\_checked |
| source-reactome-scara5-binding | database\_record | claim-scara5-scavenger-pathway | Not recorded | permitted | not\_checked |
| source-reactome-scavenger-gene-set | database\_record | claim-col1a1-scavenger-gene-set; claim-col1a2-scavenger-gene-set; claim-col3a1-scavenger-gene-set; claim-saa1-scavenger-gene-set | Not recorded | permitted | not\_checked |
| source-reactome-scavenger-pathway | database\_record | None | pathway-scavenger-receptors | permitted | not\_checked |
| source-reactome-trem2-dap12 | database\_record | claim-trem2-dap12-binding | Not recorded | permitted | not\_checked |
| source-reactome-trem2-protein | database\_record | claim-trem2-dap12-pathway | Not recorded | permitted | not\_checked |
| source-reactome-tyrobp-state | database\_record | claim-tyrobp-dap12-pathway | Not recorded | permitted | not\_checked |
| source-uniprot-abca1-live-2026-11-05 | database\_record | None | gene-abca1; protein-abca1 | permitted | not\_checked |
| source-uniprot-apoe | database\_record | claim-apoe-encodes | protein-apoe | permitted | not\_checked |
| source-uniprot-apoe-live-2026-11-05 | database\_record | None | gene-apoe; protein-apoe | permitted | not\_checked |
| source-uniprot-mouse-apoe | database\_record | claim-mouse-apoe-encodes | protein-mouse-apoe | permitted | not\_checked |
| source-uniprot-rxra | database\_record | claim-rxra-encodes | gene-rxra; protein-rxra | permitted | not\_checked |
| source-uniprot-trem2 | database\_record | claim-trem2-encodes | protein-trem2 | permitted | not\_checked |
| source-uniprot-tyrobp | database\_record | claim-tyrobp-encodes | gene-tyrobp; protein-tyrobp | permitted | not\_checked |
| source-wahrle-2004 | publication | claim-mouse-abca1-apoe-lipidation-wahrle | paper-wahrle-2004 | permitted | not\_checked |

## Findings for review

### claim-abca1-cholesterol-pathway

**ABCA1 protein → Cholesterol transport and efflux · participates\_in**

Reactome includes ABCA1 protein in its human cholesterol transport and efflux gene-regulation pathway.

**Summary:** Follow the cited record for the annotation and its source context.

#### Claim context

- **assertion type:** curated database annotation
- **organism:** Homo sapiens
- **pathway id:** R-HSA-9029569
- **protein state:** ABCA1 at the plasma membrane

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-22
- **Human reviewed:** false
- **Review rationale:** Source record and stated locator checked. This draft preserves the scope of the database annotation; independent scientific review is a future milestone.

#### Claim limitations

- Curated pathway participation does not establish an AD-specific mechanism or activity in every tissue.
- Record page accessed 2026-10-22; database release and record revision not captured
- Database annotations are not independent experimental replication or evidence of treatment benefit.

#### Evidence: evidence-abca1-cholesterol-pathway

- **Original source:** [ABCA1 \[plasma membrane\]](https://reactome.org/content/detail/R-HSA-194209)
- **Source record:** source-reactome-abca1-protein
- **Upstream source records:** source-reactome-abca1-live-mapping
- **Evidence relation:** supports
- **Inspected location:** Reactome Locations in the PathwayBrowser: cholesterol transport/efflux → ABCA1 translation and NR1H2 binding.

Reactome includes ABCA1 protein in its human cholesterol transport and efflux gene-regulation pathway.

Source-specific study context:

- **assertion type:** curated database annotation
- **design:** database annotation
- **live mapping provenance:** R-HSA-9029569.2, completed 2026-11-05T00:00:46.412Z; accession lookup only, not an independent molecular-state check.
- **organism:** Homo sapiens
- **pathway id:** R-HSA-9029569
- **protein state:** ABCA1 at the plasma membrane
- **sample size:** Not recorded

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-22
- **Human reviewed:** false
- **Review rationale:** Source record and stated locator checked. This draft preserves the scope of the database annotation; independent scientific review is a future milestone.

Evidence limitations:

- Curated pathway participation does not establish an AD-specific mechanism or activity in every tissue.
- Record page accessed 2026-10-22; database release and record revision not captured
- Database annotations are not independent experimental replication or evidence of treatment benefit.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-abca1-encodes

**ABCA1 → ABCA1 protein · encodes**

The human ABCA1 gene encodes Phospholipid-transporting ATPase ABCA1 (O95477).

**Summary:** Follow the cited record for the annotation and its source context.

#### Claim context

- **assertion type:** curated database annotation
- **gene id:** 19
- **organism:** Homo sapiens
- **protein accession:** O95477

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-22
- **Human reviewed:** false
- **Review rationale:** Source record and stated locator checked. This draft preserves the scope of the database annotation; independent scientific review is a future milestone.

#### Claim limitations

- Canonical gene-product mapping; isoforms and post-translational states are not separate nodes.
- Database annotations are not independent experimental replication or evidence of treatment benefit.

#### Evidence: evidence-abca1-encodes

- **Original source:** [ABCA1 \[plasma membrane\]](https://reactome.org/content/detail/R-HSA-194209)
- **Source record:** source-reactome-abca1-protein
- **Upstream source records:** source-uniprot-abca1-live-2026-11-05
- **Evidence relation:** supports
- **Inspected location:** Reactome External Reference Information: UniProt accession, Gene Names and Reference Genes; species in record identity.

The human ABCA1 gene encodes Phospholipid-transporting ATPase ABCA1 (O95477).

Source-specific study context:

- **assertion type:** curated database annotation
- **design:** database annotation
- **gene id:** 19
- **live ensembl gene id:** ENSG00000165029
- **live entry version:** 244
- **live identity check:** Completed UniProt JSON: accession, gene, human taxon, explicit Ensembl GeneId cross-reference and entryAudit; no function prose or sequence retained.
- **live provider release:** 2026\_04
- **live response sha256:** cc09f5c6c6d66ac2e406096e47eab9b32ac32abd93d7c5a1d7f6abd17ade26cb
- **live retrieved at:** 2026-11-05T00:00:45.202Z
- **live taxonomy id:** 9606
- **organism:** Homo sapiens
- **protein accession:** O95477
- **sample size:** Not recorded

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-11-05
- **Human reviewed:** false
- **Review rationale:** Preserves the original2026-10-22 identity assertion and source; appends inspected completed2026-11-05 UniProt identity/cross-reference provenance, not another experiment or independent scientific review.

Evidence limitations:

- Canonical gene-product mapping; isoforms and post-translational states are not separate nodes.
- Database annotations are not independent experimental replication or evidence of treatment benefit.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-abca1-n1800h-risk

**ABCA1 → Alzheimer's disease · associated\_with**

A 2015 general-population study associated the ABCA1 N1800H loss-of-function variant with higher Alzheimer's disease risk.

**Summary:** This finding concerns a particular rare variant. It is not evidence that every ABCA1 variant increases risk or that modifying ABCA1 treats disease.

#### Claim context

- **intervention:** Not recorded
- **organism:** Homo sapiens
- **outcome:** Alzheimer's disease hazard
- **population:** 92,726 general-population participants in the AD analysis
- **study design:** Human genetic association
- **variant:** ABCA1 N1800H; study genotype comparison AC versus AA

#### Claim review record

- **Review status:** draft
- **Reviewer:** Not recorded
- **Review date:** Not recorded
- **Human reviewed:** Not recorded
- **Review rationale:** AI-assisted abstract lookup only. Independent scientific review, reuse assessment, and correction/retraction checks are pending.

#### Claim limitations

- The reported estimate was imprecise; the abstract gives a wide confidence interval. No intervention was tested.

#### Evidence: evidence-abca1-nordestgaard-2015

- **Original source:** [Loss-of-function mutation in ABCA1 and risk of Alzheimer's disease and cerebrovascular disease](https://pubmed.ncbi.nlm.nih.gov/26079414/)
- **Source record:** source-nordestgaard-2015
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** Publisher abstract, Methods and Results, DOI 10.1016/j.jalz.2015.04.006

For the AD analysis, the abstract reports a higher adjusted hazard for N1800H AC than AA, with a wide confidence interval.

Source-specific study context:

- **intervention:** Not recorded
- **organism:** Homo sapiens
- **outcome:** Alzheimer's disease hazard
- **population:** General-population participants
- **sample size:** 92726
- **study design:** Human general-population genetic association
- **tissue:** Not recorded
- **variant:** ABCA1 N1800H; AC versus AA

Evidence review record:

- **Review status:** draft
- **Reviewer:** Not recorded
- **Review date:** Not recorded
- **Human reviewed:** Not recorded
- **Review rationale:** AI-assisted abstract lookup only. Independent scientific review, reuse assessment, and correction/retraction checks are pending.

Evidence limitations:

- The abstract-level review cannot assess all confounding or ascertainment choices. A rare-variant association is not a treatment experiment.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-abca1-opentargets-association

**ABCA1 → Alzheimer's disease · associated\_with**

Open Targets reports a direct ABCA1–Alzheimer disease association summary (data version 26.09); this is an aggregate database annotation.

**Summary:** Open Targets reports a direct ABCA1–Alzheimer disease association summary (data version 26.09); this is an aggregate database annotation.

#### Claim context

- **assertion type:** provider aggregate association
- **association scope:** provider\_aggregate
- **datasource scores:** gwas\_credible\_sets: 0.7554219891183979; europepmc: 0.9440037085287274; clinical\_precedence: 0.09118961964174316
- **disease id:** MONDO\_0004975
- **enable indirect:** false
- **organism:** Homo sapiens
- **overall association score:** 0.4940984029965598
- **page index:** 0
- **page size:** 20
- **provider release:** 26.09
- **score definition:** Open Targets weighted harmonic aggregation heuristic for ranking; not a causal probability, scientific confidence score or independent-study count.
- **target id:** ENSG00000165029
- **taxonomy id:** 9606
- **total reported:** 1797

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-11-05
- **Human reviewed:** false
- **Review rationale:** The cited original locations and identities were inspected. This source-checked draft preserves model, readout and unknowns; it is not independent scientific review.

#### Claim limitations

- Provider aggregation, not a new human genetic finding, mechanistic experiment, causal probability or treatment-benefit estimate.
- Only the first 20 direct disease rows were retrieved, from 1797 reported for this target; underlying study evidence was not extracted.
- Distinct databases can reuse the same studies; this summary is not independent replication of the four original variant-scoped findings.

#### Evidence: evidence-abca1-opentargets-association

- **Original source:** [Open Targets: ABCA1–Alzheimer disease direct association summary](https://platform.opentargets.org/target/ENSG00000165029/associations)
- **Source record:** source-opentargets-abca1-direct-association
- **Upstream source records:** source-mondo-alzheimers-mesh
- **Evidence relation:** supports
- **Inspected location:** Completed GraphQL response: target.id/approvedSymbol; associatedDiseases(enableIndirect=false,page index0,size20), MONDO\_0004975 row; score/datasourceScores; meta.dataVersion.

Open Targets reports a direct ABCA1–Alzheimer disease association summary (data version 26.09); this is an aggregate database annotation.

Source-specific study context:

- **assertion type:** provider aggregate association
- **association scope:** provider\_aggregate
- **datasource scores:** gwas\_credible\_sets: 0.7554219891183979; europepmc: 0.9440037085287274; clinical\_precedence: 0.09118961964174316
- **disease id:** MONDO\_0004975
- **enable indirect:** false
- **organism:** Homo sapiens
- **overall association score:** 0.4940984029965598
- **page index:** 0
- **page size:** 20
- **provider release:** 26.09
- **score definition:** Open Targets weighted harmonic aggregation heuristic for ranking; not a causal probability, scientific confidence score or independent-study count.
- **target id:** ENSG00000165029
- **taxonomy id:** 9606
- **total reported:** 1797

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-11-05
- **Human reviewed:** false
- **Review rationale:** The cited original locations and identities were inspected. This source-checked draft preserves model, readout and unknowns; it is not independent scientific review.

Evidence limitations:

- Provider aggregation, not a new human genetic finding, mechanistic experiment, causal probability or treatment-benefit estimate.
- Only the first 20 direct disease rows were retrieved, from 1797 reported for this target; underlying study evidence was not extracted.
- Distinct databases can reuse the same studies; this summary is not independent replication of the four original variant-scoped findings.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-apob-encodes

**APOB → APOB protein · encodes**

HGNC links the approved human APOB gene to the UniProt gene product P04114.

**Summary:** Canonical identity cross-reference.

#### Claim context

- **assertion type:** curated database cross-reference
- **gene id:** 338
- **organism:** Homo sapiens
- **protein accession:** P04114

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-24
- **Human reviewed:** false
- **Review rationale:** Targeted source locations inspected on 2026-10-24. Canonical identities, database inference and assay scope are retained separately. Raw figures, supplements and underlying data were not reviewed; independent scientific review remains a future milestone.

#### Claim limitations

- Canonical gene/product identity only; molecular forms and assay constructs remain in evidence context.
- The pinned mirror has not been reconciled against an official HGNC release archive.

#### Evidence: evidence-apob-encodes

- **Original source:** [HGNC approved MARCO, SCARA5 and APOB gene/product cross-references (pinned mirror)](https://raw.githubusercontent.com/MargoSolo/gene-tidy/37b375b4e4f70445cbb9e40b273a510467b798ae/src/gene_tidy/data/hgnc_complete_set.tsv.gz)
- **Source record:** source-hgnc-scavenger-identities
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** Pinned HGNC TSV: approved HGNC:603 row; symbol, entrez\_id, ensembl\_gene\_id and uniprot\_ids fields.

HGNC links the approved human APOB gene to the UniProt gene product P04114.

Source-specific study context:

- **organism:** Homo sapiens
- **source record:** HGNC:603
- **study design:** Curated identity cross-reference
- **upstream release:** Not recorded

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-24
- **Human reviewed:** false
- **Review rationale:** Targeted source locations inspected on 2026-10-24. Canonical identities, database inference and assay scope are retained separately. Raw figures, supplements and underlying data were not reviewed; independent scientific review remains a future milestone.

Evidence limitations:

- Canonical gene/product identity only; molecular forms and assay constructs remain in evidence context.
- The pinned mirror has not been reconciled against an official HGNC release archive.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-apob-scavenger-pathway

**APOB protein → Scavenger-receptor binding and uptake · participates\_in**

Reactome places APOB in the human scavenger-receptor ligand-binding and uptake pathway.

**Summary:** Source-specific pathway membership.

#### Claim context

- **assertion type:** curated database annotation
- **inferred from:** Not recorded
- **molecular context:** APOB(28-4563), endocytic vesicle lumen
- **organism:** Homo sapiens

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-24
- **Human reviewed:** false
- **Review rationale:** Targeted source locations inspected on 2026-10-24. Canonical identities, database inference and assay scope are retained separately. Raw figures, supplements and underlying data were not reviewed; independent scientific review remains a future milestone.

#### Claim limitations

- Database participation describes a broad human pathway, not an AD-specific effect or proof of receptor activity in an RNA-seq sample.
- The exact Reactome database release and record revision were not captured.
- The source describes a specific protein form/compartment in a ligand set; the displayed node represents its canonical human gene product.

#### Evidence: evidence-apob-scavenger-pathway

- **Original source:** [Reactome R-HSA-2512789 — APOB(28-4563) \[endocytic vesicle lumen\]](https://reactome.org/content/detail/R-HSA-2512789)
- **Source record:** source-reactome-apob-scavenger
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** Species, Locations in the PathwayBrowser, Participants and Inferred From where present; parent R-HSA-2173782.

Reactome places APOB in the human scavenger-receptor ligand-binding and uptake pathway.

Source-specific study context:

- **inferred from:** Not recorded
- **molecular context:** APOB(28-4563), endocytic vesicle lumen
- **organism:** Homo sapiens
- **study design:** Curated pathway annotation
- **upstream release:** Not recorded

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-24
- **Human reviewed:** false
- **Review rationale:** Targeted source locations inspected on 2026-10-24. Canonical identities, database inference and assay scope are retained separately. Raw figures, supplements and underlying data were not reviewed; independent scientific review remains a future milestone.

Evidence limitations:

- Database participation describes a broad human pathway, not an AD-specific effect or proof of receptor activity in an RNA-seq sample.
- The exact Reactome database release and record revision were not captured.
- The source describes a specific protein form/compartment in a ligand set; the displayed node represents its canonical human gene product.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-apoe-cholesterol-pathway

**APOE protein → Cholesterol transport and efflux · participates\_in**

Reactome includes APOE protein in its human cholesterol transport and efflux gene-regulation pathway.

**Summary:** Follow the cited record for the annotation and its source context.

#### Claim context

- **assertion type:** curated database annotation
- **organism:** Homo sapiens
- **pathway id:** R-HSA-9029569
- **protein state:** Secreted APOE output of a curated expression event

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-22
- **Human reviewed:** false
- **Review rationale:** Source record and stated locator checked. This draft preserves the scope of the database annotation; independent scientific review is a future milestone.

#### Claim limitations

- Curated pathway participation does not establish an AD-specific mechanism or activity in every tissue.
- Record page accessed 2026-10-22; database release and record revision not captured
- Database annotations are not independent experimental replication or evidence of treatment benefit.

#### Evidence: evidence-apoe-cholesterol-pathway

- **Original source:** [Expression of APOE regulated by NR1H2 or NR1H3](https://reactome.org/content/detail/R-HSA-9031512)
- **Source record:** source-reactome-apoe-expression
- **Upstream source records:** source-reactome-apoe-live-mapping
- **Evidence relation:** supports
- **Inspected location:** Reactome Participants: APOE protein output; Participates: cholesterol transport/efflux pathway.

Reactome includes APOE protein in its human cholesterol transport and efflux gene-regulation pathway.

Source-specific study context:

- **assertion type:** curated database annotation
- **design:** database annotation
- **live mapping provenance:** R-HSA-9029569.2, completed 2026-11-05T00:00:45.508Z; accession lookup only, not an independent molecular-state check.
- **organism:** Homo sapiens
- **pathway id:** R-HSA-9029569
- **protein state:** Secreted APOE output of a curated expression event
- **sample size:** Not recorded

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-22
- **Human reviewed:** false
- **Review rationale:** Source record and stated locator checked. This draft preserves the scope of the database annotation; independent scientific review is a future milestone.

Evidence limitations:

- Curated pathway participation does not establish an AD-specific mechanism or activity in every tissue.
- Record page accessed 2026-10-22; database release and record revision not captured
- Database annotations are not independent experimental replication or evidence of treatment benefit.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-apoe-e2-risk

**APOE → Alzheimer's disease · associated\_with**

A 1994 study reported the lowest Alzheimer's risk among participants with the APOE ε2/ε3 genotype.

**Summary:** The allele-specific result illustrates why APOE relationships must retain genotype context. It does not imply immunity to Alzheimer's disease.

#### Claim context

- **intervention:** Not recorded
- **organism:** Homo sapiens
- **outcome:** Late-onset Alzheimer's disease risk
- **population:** Case-control participants and members of 66 Alzheimer's families
- **study design:** Case-control and family genetic association
- **variant:** APOE ε2/ε3 genotype

#### Claim review record

- **Review status:** draft
- **Reviewer:** Not recorded
- **Review date:** Not recorded
- **Human reviewed:** Not recorded
- **Review rationale:** AI-assisted abstract lookup only. Independent scientific review, reuse assessment, and correction/retraction checks are pending.

#### Claim limitations

- This is a historical observational association, not a treatment effect or an individual risk estimate.

#### Evidence: evidence-apoe-e2-corder-1994

- **Original source:** [Protective effect of apolipoprotein E type 2 allele for late onset Alzheimer disease](https://pubmed.ncbi.nlm.nih.gov/7920638/)
- **Source record:** source-corder-1994
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** Nature Genetics publisher abstract, DOI 10.1038/ng0694-180

The abstract reports the lowest disease risk in ε2/ε3 participants and describes an ε2-associated reduction in risk.

Source-specific study context:

- **intervention:** Not recorded
- **organism:** Homo sapiens
- **outcome:** Late-onset Alzheimer's disease risk
- **population:** 115 cases, 243 controls, and 150 affected plus 197 unaffected relatives in 66 families
- **sample size:** Not recorded
- **study design:** Case-control and family genetic association
- **tissue:** Not recorded
- **variant:** APOE ε2/ε3 genotype

Evidence review record:

- **Review status:** draft
- **Reviewer:** Not recorded
- **Review date:** Not recorded
- **Human reviewed:** Not recorded
- **Review rationale:** AI-assisted abstract lookup only. Independent scientific review, reuse assessment, and correction/retraction checks are pending.

Evidence limitations:

- Only the publisher abstract was inspected. Case and family totals are not combined because participant overlap was not assessed.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-apoe-e4-risk

**APOE → Alzheimer's disease · associated\_with**

In 42 late-onset Alzheimer's families studied in 1993, more APOE ε4 alleles were associated with higher disease risk and earlier onset.

**Summary:** This historical family study connects APOE allele dosage to disease susceptibility; it does not predict an individual's outcome.

#### Claim context

- **intervention:** Not recorded
- **organism:** Homo sapiens
- **outcome:** Disease risk and age at onset
- **population:** 42 families with late-onset Alzheimer's disease
- **study design:** Familial genetic association
- **variant:** APOE ε4 allele count

#### Claim review record

- **Review status:** draft
- **Reviewer:** Not recorded
- **Review date:** Not recorded
- **Human reviewed:** Not recorded
- **Review rationale:** AI-assisted abstract lookup only. Independent scientific review, reuse assessment, and correction/retraction checks are pending.

#### Claim limitations

- Selected families and an abstract-level lookup do not establish population-wide risk or causality.

#### Evidence: evidence-apoe-e4-corder-1993

- **Original source:** [Gene dose of apolipoprotein E type 4 allele and the risk of Alzheimer's disease in late onset families](https://pubmed.ncbi.nlm.nih.gov/8346443/)
- **Source record:** source-corder-1993
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** PubMed abstract, PMID 8346443

The abstract reports increasing disease risk and decreasing mean onset age as APOE ε4 allele count increased in the sampled families.

Source-specific study context:

- **families:** 42
- **intervention:** Not recorded
- **organism:** Homo sapiens
- **outcome:** Disease risk and age at onset
- **population:** Late-onset Alzheimer's families
- **sample size:** Not recorded
- **study design:** Familial genetic association
- **tissue:** Not recorded
- **variant:** APOE ε4 allele count

Evidence review record:

- **Review status:** draft
- **Reviewer:** Not recorded
- **Review date:** Not recorded
- **Human reviewed:** Not recorded
- **Review rationale:** AI-assisted abstract lookup only. Independent scientific review, reuse assessment, and correction/retraction checks are pending.

Evidence limitations:

- Only the abstract and bibliographic metadata were inspected. The family-based estimates are not individual predictions.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-apoe-encodes

**APOE → APOE protein · encodes**

The human APOE gene encodes Apolipoprotein E (P02649).

**Summary:** Follow the cited record for the annotation and its source context.

#### Claim context

- **assertion type:** curated database annotation
- **gene id:** 348
- **organism:** Homo sapiens
- **protein accession:** P02649

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-22
- **Human reviewed:** false
- **Review rationale:** Source record and stated locator checked. This draft preserves the scope of the database annotation; independent scientific review is a future milestone.

#### Claim limitations

- Canonical gene-product mapping; isoforms and post-translational states are not separate nodes.
- Database annotations are not independent experimental replication or evidence of treatment benefit.

#### Evidence: evidence-apoe-encodes

- **Original source:** [UniProtKB P02649 — Apolipoprotein E](https://rest.uniprot.org/uniprotkb/P02649.txt)
- **Source record:** source-uniprot-apoe
- **Upstream source records:** source-uniprot-apoe-live-2026-11-05
- **Evidence relation:** supports
- **Inspected location:** UniProtKB ID/AC, gene name (GN), organism (OS), GeneID cross-reference (DR), and entry-version (DT) fields.

The human APOE gene encodes Apolipoprotein E (P02649).

Source-specific study context:

- **assertion type:** curated database annotation
- **design:** database annotation
- **gene id:** 348
- **live ensembl gene id:** ENSG00000130203
- **live entry version:** 281
- **live identity check:** Completed UniProt JSON: accession, gene, human taxon, explicit Ensembl GeneId cross-reference and entryAudit; no function prose or sequence retained.
- **live provider release:** 2026\_04
- **live response sha256:** 092114effe4244e54e48c0e220b17dd15e96d65ded46d384238a193a29a83203
- **live retrieved at:** 2026-11-05T00:00:45.152Z
- **live taxonomy id:** 9606
- **organism:** Homo sapiens
- **protein accession:** P02649
- **sample size:** Not recorded

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-11-05
- **Human reviewed:** false
- **Review rationale:** Preserves the original2026-10-22 identity assertion and source; appends inspected completed2026-11-05 UniProt identity/cross-reference provenance, not another experiment or independent scientific review.

Evidence limitations:

- Canonical gene-product mapping; isoforms and post-translational states are not separate nodes.
- Database annotations are not independent experimental replication or evidence of treatment benefit.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-apoe-opentargets-association

**APOE → Alzheimer's disease · associated\_with**

Open Targets reports a direct APOE–Alzheimer disease association summary (data version 26.09); this is an aggregate database annotation.

**Summary:** Open Targets reports a direct APOE–Alzheimer disease association summary (data version 26.09); this is an aggregate database annotation.

#### Claim context

- **assertion type:** provider aggregate association
- **association scope:** provider\_aggregate
- **datasource scores:** gwas\_credible\_sets: 0.9725857409132884; eva: 0.516741177969878; crispr\_screen: 0.2670020417823128; europepmc: 0.9992042452669387; expression\_atlas: 0.017251532679053088
- **disease id:** MONDO\_0004975
- **enable indirect:** false
- **organism:** Homo sapiens
- **overall association score:** 0.695512952413486
- **page index:** 0
- **page size:** 20
- **provider release:** 26.09
- **score definition:** Open Targets weighted harmonic aggregation heuristic for ranking; not a causal probability, scientific confidence score or independent-study count.
- **target id:** ENSG00000130203
- **taxonomy id:** 9606
- **total reported:** 2836

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-11-05
- **Human reviewed:** false
- **Review rationale:** The cited original locations and identities were inspected. This source-checked draft preserves model, readout and unknowns; it is not independent scientific review.

#### Claim limitations

- Provider aggregation, not a new human genetic finding, mechanistic experiment, causal probability or treatment-benefit estimate.
- Only the first 20 direct disease rows were retrieved, from 2836 reported for this target; underlying study evidence was not extracted.
- Distinct databases can reuse the same studies; this summary is not independent replication of the four original variant-scoped findings.

#### Evidence: evidence-apoe-opentargets-association

- **Original source:** [Open Targets: APOE–Alzheimer disease direct association summary](https://platform.opentargets.org/target/ENSG00000130203/associations)
- **Source record:** source-opentargets-apoe-direct-association
- **Upstream source records:** source-mondo-alzheimers-mesh
- **Evidence relation:** supports
- **Inspected location:** Completed GraphQL response: target.id/approvedSymbol; associatedDiseases(enableIndirect=false,page index0,size20), MONDO\_0004975 row; score/datasourceScores; meta.dataVersion.

Open Targets reports a direct APOE–Alzheimer disease association summary (data version 26.09); this is an aggregate database annotation.

Source-specific study context:

- **assertion type:** provider aggregate association
- **association scope:** provider\_aggregate
- **datasource scores:** gwas\_credible\_sets: 0.9725857409132884; eva: 0.516741177969878; crispr\_screen: 0.2670020417823128; europepmc: 0.9992042452669387; expression\_atlas: 0.017251532679053088
- **disease id:** MONDO\_0004975
- **enable indirect:** false
- **organism:** Homo sapiens
- **overall association score:** 0.695512952413486
- **page index:** 0
- **page size:** 20
- **provider release:** 26.09
- **score definition:** Open Targets weighted harmonic aggregation heuristic for ranking; not a causal probability, scientific confidence score or independent-study count.
- **target id:** ENSG00000130203
- **taxonomy id:** 9606
- **total reported:** 2836

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-11-05
- **Human reviewed:** false
- **Review rationale:** The cited original locations and identities were inspected. This source-checked draft preserves model, readout and unknowns; it is not independent scientific review.

Evidence limitations:

- Provider aggregation, not a new human genetic finding, mechanistic experiment, causal probability or treatment-benefit estimate.
- Only the first 20 direct disease rows were retrieved, from 2836 reported for this target; underlying study evidence was not extracted.
- Distinct databases can reuse the same studies; this summary is not independent replication of the four original variant-scoped findings.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-apoe-scavenger-pathway

**APOE protein → Scavenger-receptor binding and uptake · participates\_in**

Reactome places APOE in the human scavenger-receptor ligand-binding and uptake pathway.

**Summary:** Source-specific pathway membership.

#### Claim context

- **assertion type:** curated database annotation
- **inferred from:** Not recorded
- **molecular context:** APOE, endocytic vesicle lumen
- **organism:** Homo sapiens

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-24
- **Human reviewed:** false
- **Review rationale:** Targeted source locations inspected on 2026-10-24. Canonical identities, database inference and assay scope are retained separately. Raw figures, supplements and underlying data were not reviewed; independent scientific review remains a future milestone.

#### Claim limitations

- Database participation describes a broad human pathway, not an AD-specific effect or proof of receptor activity in an RNA-seq sample.
- The exact Reactome database release and record revision were not captured.
- The source describes a specific protein form/compartment in a ligand set; the displayed node represents its canonical human gene product.

#### Evidence: evidence-apoe-scavenger-pathway

- **Original source:** [Reactome R-HSA-3221641 — APOE \[endocytic vesicle lumen\]](https://reactome.org/content/detail/R-HSA-3221641)
- **Source record:** source-reactome-apoe-scavenger
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** Species, Locations in the PathwayBrowser, Participants and Inferred From where present; parent R-HSA-2173782.

Reactome places APOE in the human scavenger-receptor ligand-binding and uptake pathway.

Source-specific study context:

- **inferred from:** Not recorded
- **molecular context:** APOE, endocytic vesicle lumen
- **organism:** Homo sapiens
- **study design:** Curated pathway annotation
- **upstream release:** Not recorded

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-24
- **Human reviewed:** false
- **Review rationale:** Targeted source locations inspected on 2026-10-24. Canonical identities, database inference and assay scope are retained separately. Raw figures, supplements and underlying data were not reviewed; independent scientific review remains a future milestone.

Evidence limitations:

- Database participation describes a broad human pathway, not an AD-specific effect or proof of receptor activity in an RNA-seq sample.
- The exact Reactome database release and record revision were not captured.
- The source describes a specific protein form/compartment in a ligand set; the displayed node represents its canonical human gene product.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-bailey-trem2-apoe-binding

**TREM2 protein → APOE protein · interacts\_with**

In Bailey et al.'s ELISA, wild-type human TREM2-Ig bound plasma-derived APOE.

**Summary:** Compare the source-specific preparation and plate readout with the Atagi binding assays.

#### Claim context

- **assay:** ELISA
- **binding condition:** Wild-type TREM2
- **experimental system:** Cell-free protein assay
- **immobilized partner:** APOE on ELISA plates
- **intervention:** Not recorded
- **ligand preparation:** Human plasma-derived APOE; isoform not identified
- **organism:** Homo sapiens
- **outcome:** APOE binding to TREM2-Ig
- **population:** Not recorded
- **protein form:** Human TREM2 ectodomain–IgG1 Fc fusion; plasma-derived APOE
- **study design:** Biochemical binding assay
- **tissue:** Not recorded
- **variant:** Wild-type TREM2; plasma APOE isoform not identified

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-23
- **Human reviewed:** false
- **Review rationale:** PubMed original Figure 5 captions and bibliographic metadata checked. Search-indexed PMC passages checked: Ig Fusion Constructs, ELISA methods, Results, Discussion and Note Added in Proof. Direct full-text opens were blocked; indexed text may be stale. Raw figure images, supplements and underlying data were not reviewed.

#### Claim limitations

- Surface-based binding signals do not establish binding kinetics, cellular signaling or treatment benefit.
- The plasma-derived APOE isoform was not identified. Triplicate wells are not three independent studies or participants.
- The in-article Note Added in Proof corrects a Figure 1 control plot; it does not identify Figure 5 as affected. Broader correction/retraction checking remains incomplete.

#### Evidence: evidence-bailey-2015-binding

- **Original source:** [The Triggering Receptor Expressed on Myeloid Cells 2 Binds Apolipoprotein E](https://pubmed.ncbi.nlm.nih.gov/26374897/)
- **Source record:** source-bailey-2015
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** PubMed original Figure 5D caption; search-indexed PMC Experimental Procedures (Ig Fusion Constructs, ELISA), Results and Discussion.

In Bailey et al.'s ELISA, wild-type human TREM2-Ig bound plasma-derived APOE.

Source-specific study context:

- **assay:** ELISA
- **assay replicates:** 3
- **binding condition:** Wild-type TREM2
- **controls:** CD4-Ig background; plasma-derived APOA1 and APOA2
- **experimental system:** Cell-free protein assay
- **experiments reported:** Not recorded
- **immobilized partner:** APOE on ELISA plates
- **intervention:** Not recorded
- **ligand preparation:** Human plasma-derived APOE; isoform not identified
- **organism:** Homo sapiens
- **outcome:** APOE binding to TREM2-Ig
- **population:** Not recorded
- **protein form:** Human TREM2 ectodomain–IgG1 Fc fusion; plasma-derived APOE
- **replicate unit:** Triplicate wells in a representative Figure 5D experiment
- **sample size:** Not recorded
- **study design:** Biochemical binding assay
- **tissue:** Not recorded
- **variant:** Wild-type TREM2; plasma APOE isoform not identified

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-23
- **Human reviewed:** false
- **Review rationale:** PubMed original Figure 5 captions and bibliographic metadata checked. Search-indexed PMC passages checked: Ig Fusion Constructs, ELISA methods, Results, Discussion and Note Added in Proof. Direct full-text opens were blocked; indexed text may be stale. Raw figure images, supplements and underlying data were not reviewed.

Evidence limitations:

- Surface-based binding signals do not establish binding kinetics, cellular signaling or treatment benefit.
- The plasma-derived APOE isoform was not identified. Triplicate wells are not three independent studies or participants.
- The in-article Note Added in Proof corrects a Figure 1 control plot; it does not identify Figure 5 as affected. Broader correction/retraction checking remains incomplete.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-bailey-trem2-r47h-apoe-binding

**TREM2 protein → APOE protein · interacts\_with**

In Bailey et al.'s plasma-APOE ELISA, the human TREM2 R47H-Ig construct showed less binding than wild type.

**Summary:** Compare this plate-binding result with the Atagi variant assays; the preparations differ.

#### Claim context

- **assay:** ELISA
- **binding condition:** R47H versus wild type
- **experimental system:** Cell-free protein assay
- **immobilized partner:** APOE on ELISA plates
- **intervention:** Not recorded
- **ligand preparation:** Human plasma-derived APOE; isoform not identified
- **organism:** Homo sapiens
- **outcome:** APOE binding to TREM2-Ig
- **population:** Not recorded
- **protein form:** Human TREM2 ectodomain–IgG1 Fc fusion; plasma-derived APOE
- **study design:** Biochemical binding assay
- **tissue:** Not recorded
- **variant:** TREM2 R47H versus wild type; plasma APOE isoform not identified

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-23
- **Human reviewed:** false
- **Review rationale:** PubMed original Figure 5 captions and bibliographic metadata checked. Search-indexed PMC passages checked: Ig Fusion Constructs, ELISA methods, Results, Discussion and Note Added in Proof. Direct full-text opens were blocked; indexed text may be stale. Raw figure images, supplements and underlying data were not reviewed.

#### Claim limitations

- Surface-based binding signals do not establish binding kinetics, cellular signaling or treatment benefit.
- The plasma-derived APOE isoform was not identified. Triplicate wells are not three independent studies or participants.
- The in-article Note Added in Proof corrects a Figure 1 control plot; it does not identify Figure 5 as affected. Broader correction/retraction checking remains incomplete.

#### Evidence: evidence-bailey-2015-r47h-binding

- **Original source:** [The Triggering Receptor Expressed on Myeloid Cells 2 Binds Apolipoprotein E](https://pubmed.ncbi.nlm.nih.gov/26374897/)
- **Source record:** source-bailey-2015
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** PubMed original Figure 5C caption; search-indexed PMC Experimental Procedures (Ig Fusion Constructs, ELISA), Results and Discussion.

In Bailey et al.'s plasma-APOE ELISA, the human TREM2 R47H-Ig construct showed less binding than wild type.

Source-specific study context:

- **assay:** ELISA
- **assay replicates:** 3
- **binding condition:** R47H versus wild type
- **controls:** Wild-type TREM2-Ig; mutant panel
- **experimental system:** Cell-free protein assay
- **experiments reported:** 2
- **immobilized partner:** APOE on ELISA plates
- **intervention:** Not recorded
- **ligand preparation:** Human plasma-derived APOE; isoform not identified
- **organism:** Homo sapiens
- **outcome:** APOE binding to TREM2-Ig
- **population:** Not recorded
- **protein form:** Human TREM2 ectodomain–IgG1 Fc fusion; plasma-derived APOE
- **replicate unit:** Triplicate wells in one of two Figure 5C experiments
- **sample size:** Not recorded
- **study design:** Biochemical binding assay
- **tissue:** Not recorded
- **variant:** TREM2 R47H versus wild type; plasma APOE isoform not identified

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-23
- **Human reviewed:** false
- **Review rationale:** PubMed original Figure 5 captions and bibliographic metadata checked. Search-indexed PMC passages checked: Ig Fusion Constructs, ELISA methods, Results, Discussion and Note Added in Proof. Direct full-text opens were blocked; indexed text may be stale. Raw figure images, supplements and underlying data were not reviewed.

Evidence limitations:

- Surface-based binding signals do not establish binding kinetics, cellular signaling or treatment benefit.
- The plasma-derived APOE isoform was not identified. Triplicate wells are not three independent studies or participants.
- The in-article Note Added in Proof corrects a Figure 1 control plot; it does not identify Figure 5 as affected. Broader correction/retraction checking remains incomplete.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-cheng-marco-modified-apob-binding

**MARCO protein → APOB protein · interacts\_with**

Cheng et al. reported ELISA binding of the human MARCO SRCR domain to acetylated and oxidized apoB, with unmodified apoB as a control.

**Summary:** Assay-scoped recognition of modified apoB.

#### Claim context

- **assay:** ELISA
- **binding condition:** MARCO SRCR with modified apoB
- **experimental system:** Cell-free protein assay
- **expression system:** Baculovirus/High Five insect cells for human receptor domains
- **immobilized partner:** ApoB preparations coated on a 96-well plate
- **intervention:** Not recorded
- **ligand preparation:** Commercial human apoB, acetylated or oxidized in vitro; unmodified apoB control
- **organism:** Homo sapiens
- **outcome:** ELISA binding signal for modified apoB
- **population:** Not recorded
- **protein form:** Human MARCO SRCR domain fused to GFP; purified human apoB
- **study design:** Biochemical binding assay
- **tissue:** Not recorded
- **variant:** Not recorded

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-24
- **Human reviewed:** false
- **Review rationale:** Targeted source locations inspected on 2026-10-24. Canonical identities, database inference and assay scope are retained separately. Raw figures, supplements and underlying data were not reviewed; independent scientific review remains a future milestone.

#### Claim limitations

- The assay uses a recombinant receptor domain and chemically modified ligand on a plate; it does not establish native full-length binding kinetics or an AD mechanism.
- Raw figure images, supplements and underlying measurements were not reviewed; no affinity or effect estimate is imported.
- Both receptor findings come from the same paper. Three reported ELISA repeats are not three studies or human participants; replicate independence and apoB isoform remain unresolved.

#### Evidence: evidence-cheng-marco-modified-apob-binding

- **Original source:** [Recognition of lipoproteins by scavenger receptor class A members](https://pmc.ncbi.nlm.nih.gov/articles/PMC8353498/)
- **Source record:** source-cheng-2021
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** Figure 7G–H and caption; Results on modified apoB recognition; Protein expression and purification, Preparation of the modified lipoproteins, and ELISA experiments.

Cheng et al. reported ELISA binding of the human MARCO SRCR domain to acetylated and oxidized apoB, with unmodified apoB as a control.

Source-specific study context:

- **assay:** ELISA
- **assay replicates:** Not recorded
- **binding condition:** MARCO SRCR with modified apoB
- **controls:** Unmodified human apoB
- **experimental system:** Cell-free protein assay
- **experiments reported:** 3
- **expression system:** Baculovirus/High Five insect cells for human receptor domains
- **immobilized partner:** ApoB preparations coated on a 96-well plate
- **intervention:** Not recorded
- **ligand isoform:** Not recorded
- **ligand preparation:** Commercial human apoB, acetylated or oxidized in vitro; unmodified apoB control
- **organism:** Homo sapiens
- **outcome:** ELISA binding signal for modified apoB
- **population:** Not recorded
- **protein form:** Human MARCO SRCR domain fused to GFP; purified human apoB
- **replicate unit:** Figure 7 describes representative data from three repeated ELISA experiments; technical replicate counts and independence are not resolved.
- **sample size:** Not recorded
- **study design:** Biochemical binding assay
- **tissue:** Not recorded
- **variant:** Not recorded

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-24
- **Human reviewed:** false
- **Review rationale:** Targeted source locations inspected on 2026-10-24. Canonical identities, database inference and assay scope are retained separately. Raw figures, supplements and underlying data were not reviewed; independent scientific review remains a future milestone.

Evidence limitations:

- The assay uses a recombinant receptor domain and chemically modified ligand on a plate; it does not establish native full-length binding kinetics or an AD mechanism.
- Raw figure images, supplements and underlying measurements were not reviewed; no affinity or effect estimate is imported.
- Both receptor findings come from the same paper. Three reported ELISA repeats are not three studies or human participants; replicate independence and apoB isoform remain unresolved.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-cheng-scara5-modified-apob-binding

**SCARA5 protein → APOB protein · interacts\_with**

Cheng et al. reported ELISA binding of the human SCARA5 SRCR domain to acetylated and oxidized apoB, with unmodified apoB as a control.

**Summary:** Assay-scoped recognition of modified apoB.

#### Claim context

- **assay:** ELISA
- **binding condition:** SCARA5 SRCR with modified apoB
- **experimental system:** Cell-free protein assay
- **expression system:** Baculovirus/High Five insect cells for human receptor domains
- **immobilized partner:** ApoB preparations coated on a 96-well plate
- **intervention:** Not recorded
- **ligand preparation:** Commercial human apoB, acetylated or oxidized in vitro; unmodified apoB control
- **organism:** Homo sapiens
- **outcome:** ELISA binding signal for modified apoB
- **population:** Not recorded
- **protein form:** Human SCARA5 SRCR domain fused to GFP; purified human apoB
- **study design:** Biochemical binding assay
- **tissue:** Not recorded
- **variant:** Not recorded

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-24
- **Human reviewed:** false
- **Review rationale:** Targeted source locations inspected on 2026-10-24. Canonical identities, database inference and assay scope are retained separately. Raw figures, supplements and underlying data were not reviewed; independent scientific review remains a future milestone.

#### Claim limitations

- The assay uses a recombinant receptor domain and chemically modified ligand on a plate; it does not establish native full-length binding kinetics or an AD mechanism.
- Raw figure images, supplements and underlying measurements were not reviewed; no affinity or effect estimate is imported.
- Both receptor findings come from the same paper. Three reported ELISA repeats are not three studies or human participants; replicate independence and apoB isoform remain unresolved.

#### Evidence: evidence-cheng-scara5-modified-apob-binding

- **Original source:** [Recognition of lipoproteins by scavenger receptor class A members](https://pmc.ncbi.nlm.nih.gov/articles/PMC8353498/)
- **Source record:** source-cheng-2021
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** Figure 7G–H and caption; Results on modified apoB recognition; Protein expression and purification, Preparation of the modified lipoproteins, and ELISA experiments.

Cheng et al. reported ELISA binding of the human SCARA5 SRCR domain to acetylated and oxidized apoB, with unmodified apoB as a control.

Source-specific study context:

- **assay:** ELISA
- **assay replicates:** Not recorded
- **binding condition:** SCARA5 SRCR with modified apoB
- **controls:** Unmodified human apoB
- **experimental system:** Cell-free protein assay
- **experiments reported:** 3
- **expression system:** Baculovirus/High Five insect cells for human receptor domains
- **immobilized partner:** ApoB preparations coated on a 96-well plate
- **intervention:** Not recorded
- **ligand isoform:** Not recorded
- **ligand preparation:** Commercial human apoB, acetylated or oxidized in vitro; unmodified apoB control
- **organism:** Homo sapiens
- **outcome:** ELISA binding signal for modified apoB
- **population:** Not recorded
- **protein form:** Human SCARA5 SRCR domain fused to GFP; purified human apoB
- **replicate unit:** Figure 7 describes representative data from three repeated ELISA experiments; technical replicate counts and independence are not resolved.
- **sample size:** Not recorded
- **study design:** Biochemical binding assay
- **tissue:** Not recorded
- **variant:** Not recorded

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-24
- **Human reviewed:** false
- **Review rationale:** Targeted source locations inspected on 2026-10-24. Canonical identities, database inference and assay scope are retained separately. Raw figures, supplements and underlying data were not reviewed; independent scientific review remains a future milestone.

Evidence limitations:

- The assay uses a recombinant receptor domain and chemically modified ligand on a plate; it does not establish native full-length binding kinetics or an AD mechanism.
- Raw figure images, supplements and underlying measurements were not reviewed; no affinity or effect estimate is imported.
- Both receptor findings come from the same paper. Three reported ELISA repeats are not three studies or human participants; replicate independence and apoB isoform remain unresolved.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-col1a1-encodes

**COL1A1 → COL1A1 protein · encodes**

HGNC links the approved human COL1A1 gene to the UniProt gene product P02452.

**Summary:** Canonical identity cross-reference.

#### Claim context

- **assertion type:** curated database cross-reference
- **gene id:** 1277
- **organism:** Homo sapiens
- **protein accession:** P02452

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-24
- **Human reviewed:** false
- **Review rationale:** Inspected the checksum-verified HGNC approved identity rows and exact gene-level memberships in the pinned Reactome reference. This source check does not inspect original experiments, establish protein states or disease effects, or constitute independent scientific review.

#### Claim limitations

- Identity and annotation records do not measure RNA, protein abundance, translation or a disease effect.
- The source mirrors have not been reconciled to exact official upstream releases.

#### Evidence: evidence-col1a1-encodes

- **Original source:** [HGNC approved COL1A1, COL1A2, COL3A1 and SAA1 gene/product cross-references (pinned mirror)](https://raw.githubusercontent.com/MargoSolo/gene-tidy/37b375b4e4f70445cbb9e40b273a510467b798ae/src/gene_tidy/data/hgnc_complete_set.tsv.gz)
- **Source record:** source-hgnc-coverage-identities
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** Approved HGNC row HGNC:2197 (COL1A1); symbol, name, ensembl\_gene\_id, entrez\_id and uniprot\_ids columns.

HGNC links the approved human COL1A1 gene to the UniProt gene product P02452.

Source-specific study context:

- **experimental system:** Not recorded
- **hgnc id:** HGNC:2197
- **organism:** Homo sapiens
- **sample size:** Not recorded
- **source sha256:** 6bb2951c56204cd7b387c4e40b8d46107f6bdc422e77b8e4f2088a5d39e1be4b
- **study design:** database identity annotation
- **upstream release:** Not recorded

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-24
- **Human reviewed:** false
- **Review rationale:** Inspected the checksum-verified HGNC approved identity rows and exact gene-level memberships in the pinned Reactome reference. This source check does not inspect original experiments, establish protein states or disease effects, or constitute independent scientific review.

Evidence limitations:

- Identity and annotation records do not measure RNA, protein abundance, translation or a disease effect.
- The source mirrors have not been reconciled to exact official upstream releases.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-col1a1-scavenger-gene-set

**COL1A1 → Scavenger-receptor binding and uptake · participates\_in**

The pinned Reactome gene-set reference lists COL1A1 in Binding and Uptake of Ligands by Scavenger Receptors (R-HSA-2173782).

**Summary:** Literal gene-level pathway annotation in the pinned reference.

#### Claim context

- **annotation level:** gene
- **assertion type:** curated gene-set annotation
- **organism:** Homo sapiens
- **reference id:** reactome-human-mrbiomics-f5d9af14b2f8
- **upstream release:** Not recorded

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-24
- **Human reviewed:** false
- **Review rationale:** Inspected the checksum-verified HGNC approved identity rows and exact gene-level memberships in the pinned Reactome reference. This source check does not inspect original experiments, establish protein states or disease effects, or constitute independent scientific review.

#### Claim limitations

- Identity and annotation records do not measure RNA, protein abundance, translation or a disease effect.
- The source mirrors have not been reconciled to exact official upstream releases.
- Gene-set membership is not a resolved protein/complex/compartment annotation, direct physical interaction or pathway-activity measurement.
- Selection from an AD results table does not establish an AD-risk or causal association.

#### Evidence: evidence-col1a1-scavenger-gene-set

- **Original source:** [Pinned Reactome human GMT: scavenger-receptor gene-set annotations](https://raw.githubusercontent.com/epigen/MrBiomics/fbe2f70935496c73ed21337af70e97e633c2f4d3/resources/ReactomePathways.gmt)
- **Source record:** source-reactome-scavenger-gene-set
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** Pinned Reactome JSON pathways\[id=R-HSA-2173782\].genes contains exact symbol COL1A1. The original GMT row is identified by the same stable pathway ID; source raw/normalized digests are retained.

The pinned Reactome gene-set reference lists COL1A1 in Binding and Uptake of Ligands by Scavenger Receptors (R-HSA-2173782).

Source-specific study context:

- **annotation level:** gene
- **experimental system:** Not recorded
- **normalized reference sha256:** f19f3f37b142e1f0d0a6ef84118f1ae586334b04545897627c6d9236c7a739c6
- **organism:** Homo sapiens
- **protein form:** Not recorded
- **reference id:** reactome-human-mrbiomics-f5d9af14b2f8
- **sample size:** Not recorded
- **study design:** database gene-set annotation
- **upstream release:** Not recorded

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-24
- **Human reviewed:** false
- **Review rationale:** Inspected the checksum-verified HGNC approved identity rows and exact gene-level memberships in the pinned Reactome reference. This source check does not inspect original experiments, establish protein states or disease effects, or constitute independent scientific review.

Evidence limitations:

- Identity and annotation records do not measure RNA, protein abundance, translation or a disease effect.
- The source mirrors have not been reconciled to exact official upstream releases.
- Gene-set membership is not a resolved protein/complex/compartment annotation, direct physical interaction or pathway-activity measurement.
- Selection from an AD results table does not establish an AD-risk or causal association.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-col1a2-encodes

**COL1A2 → COL1A2 protein · encodes**

HGNC links the approved human COL1A2 gene to the UniProt gene product P08123.

**Summary:** Canonical identity cross-reference.

#### Claim context

- **assertion type:** curated database cross-reference
- **gene id:** 1278
- **organism:** Homo sapiens
- **protein accession:** P08123

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-24
- **Human reviewed:** false
- **Review rationale:** Inspected the checksum-verified HGNC approved identity rows and exact gene-level memberships in the pinned Reactome reference. This source check does not inspect original experiments, establish protein states or disease effects, or constitute independent scientific review.

#### Claim limitations

- Identity and annotation records do not measure RNA, protein abundance, translation or a disease effect.
- The source mirrors have not been reconciled to exact official upstream releases.

#### Evidence: evidence-col1a2-encodes

- **Original source:** [HGNC approved COL1A1, COL1A2, COL3A1 and SAA1 gene/product cross-references (pinned mirror)](https://raw.githubusercontent.com/MargoSolo/gene-tidy/37b375b4e4f70445cbb9e40b273a510467b798ae/src/gene_tidy/data/hgnc_complete_set.tsv.gz)
- **Source record:** source-hgnc-coverage-identities
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** Approved HGNC row HGNC:2198 (COL1A2); symbol, name, ensembl\_gene\_id, entrez\_id and uniprot\_ids columns.

HGNC links the approved human COL1A2 gene to the UniProt gene product P08123.

Source-specific study context:

- **experimental system:** Not recorded
- **hgnc id:** HGNC:2198
- **organism:** Homo sapiens
- **sample size:** Not recorded
- **source sha256:** 6bb2951c56204cd7b387c4e40b8d46107f6bdc422e77b8e4f2088a5d39e1be4b
- **study design:** database identity annotation
- **upstream release:** Not recorded

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-24
- **Human reviewed:** false
- **Review rationale:** Inspected the checksum-verified HGNC approved identity rows and exact gene-level memberships in the pinned Reactome reference. This source check does not inspect original experiments, establish protein states or disease effects, or constitute independent scientific review.

Evidence limitations:

- Identity and annotation records do not measure RNA, protein abundance, translation or a disease effect.
- The source mirrors have not been reconciled to exact official upstream releases.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-col1a2-scavenger-gene-set

**COL1A2 → Scavenger-receptor binding and uptake · participates\_in**

The pinned Reactome gene-set reference lists COL1A2 in Binding and Uptake of Ligands by Scavenger Receptors (R-HSA-2173782).

**Summary:** Literal gene-level pathway annotation in the pinned reference.

#### Claim context

- **annotation level:** gene
- **assertion type:** curated gene-set annotation
- **organism:** Homo sapiens
- **reference id:** reactome-human-mrbiomics-f5d9af14b2f8
- **upstream release:** Not recorded

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-24
- **Human reviewed:** false
- **Review rationale:** Inspected the checksum-verified HGNC approved identity rows and exact gene-level memberships in the pinned Reactome reference. This source check does not inspect original experiments, establish protein states or disease effects, or constitute independent scientific review.

#### Claim limitations

- Identity and annotation records do not measure RNA, protein abundance, translation or a disease effect.
- The source mirrors have not been reconciled to exact official upstream releases.
- Gene-set membership is not a resolved protein/complex/compartment annotation, direct physical interaction or pathway-activity measurement.
- Selection from an AD results table does not establish an AD-risk or causal association.

#### Evidence: evidence-col1a2-scavenger-gene-set

- **Original source:** [Pinned Reactome human GMT: scavenger-receptor gene-set annotations](https://raw.githubusercontent.com/epigen/MrBiomics/fbe2f70935496c73ed21337af70e97e633c2f4d3/resources/ReactomePathways.gmt)
- **Source record:** source-reactome-scavenger-gene-set
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** Pinned Reactome JSON pathways\[id=R-HSA-2173782\].genes contains exact symbol COL1A2. The original GMT row is identified by the same stable pathway ID; source raw/normalized digests are retained.

The pinned Reactome gene-set reference lists COL1A2 in Binding and Uptake of Ligands by Scavenger Receptors (R-HSA-2173782).

Source-specific study context:

- **annotation level:** gene
- **experimental system:** Not recorded
- **normalized reference sha256:** f19f3f37b142e1f0d0a6ef84118f1ae586334b04545897627c6d9236c7a739c6
- **organism:** Homo sapiens
- **protein form:** Not recorded
- **reference id:** reactome-human-mrbiomics-f5d9af14b2f8
- **sample size:** Not recorded
- **study design:** database gene-set annotation
- **upstream release:** Not recorded

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-24
- **Human reviewed:** false
- **Review rationale:** Inspected the checksum-verified HGNC approved identity rows and exact gene-level memberships in the pinned Reactome reference. This source check does not inspect original experiments, establish protein states or disease effects, or constitute independent scientific review.

Evidence limitations:

- Identity and annotation records do not measure RNA, protein abundance, translation or a disease effect.
- The source mirrors have not been reconciled to exact official upstream releases.
- Gene-set membership is not a resolved protein/complex/compartment annotation, direct physical interaction or pathway-activity measurement.
- Selection from an AD results table does not establish an AD-risk or causal association.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-col3a1-encodes

**COL3A1 → COL3A1 protein · encodes**

HGNC links the approved human COL3A1 gene to the UniProt gene product P02461.

**Summary:** Canonical identity cross-reference.

#### Claim context

- **assertion type:** curated database cross-reference
- **gene id:** 1281
- **organism:** Homo sapiens
- **protein accession:** P02461

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-24
- **Human reviewed:** false
- **Review rationale:** Inspected the checksum-verified HGNC approved identity rows and exact gene-level memberships in the pinned Reactome reference. This source check does not inspect original experiments, establish protein states or disease effects, or constitute independent scientific review.

#### Claim limitations

- Identity and annotation records do not measure RNA, protein abundance, translation or a disease effect.
- The source mirrors have not been reconciled to exact official upstream releases.

#### Evidence: evidence-col3a1-encodes

- **Original source:** [HGNC approved COL1A1, COL1A2, COL3A1 and SAA1 gene/product cross-references (pinned mirror)](https://raw.githubusercontent.com/MargoSolo/gene-tidy/37b375b4e4f70445cbb9e40b273a510467b798ae/src/gene_tidy/data/hgnc_complete_set.tsv.gz)
- **Source record:** source-hgnc-coverage-identities
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** Approved HGNC row HGNC:2201 (COL3A1); symbol, name, ensembl\_gene\_id, entrez\_id and uniprot\_ids columns.

HGNC links the approved human COL3A1 gene to the UniProt gene product P02461.

Source-specific study context:

- **experimental system:** Not recorded
- **hgnc id:** HGNC:2201
- **organism:** Homo sapiens
- **sample size:** Not recorded
- **source sha256:** 6bb2951c56204cd7b387c4e40b8d46107f6bdc422e77b8e4f2088a5d39e1be4b
- **study design:** database identity annotation
- **upstream release:** Not recorded

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-24
- **Human reviewed:** false
- **Review rationale:** Inspected the checksum-verified HGNC approved identity rows and exact gene-level memberships in the pinned Reactome reference. This source check does not inspect original experiments, establish protein states or disease effects, or constitute independent scientific review.

Evidence limitations:

- Identity and annotation records do not measure RNA, protein abundance, translation or a disease effect.
- The source mirrors have not been reconciled to exact official upstream releases.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-col3a1-scavenger-gene-set

**COL3A1 → Scavenger-receptor binding and uptake · participates\_in**

The pinned Reactome gene-set reference lists COL3A1 in Binding and Uptake of Ligands by Scavenger Receptors (R-HSA-2173782).

**Summary:** Literal gene-level pathway annotation in the pinned reference.

#### Claim context

- **annotation level:** gene
- **assertion type:** curated gene-set annotation
- **organism:** Homo sapiens
- **reference id:** reactome-human-mrbiomics-f5d9af14b2f8
- **upstream release:** Not recorded

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-24
- **Human reviewed:** false
- **Review rationale:** Inspected the checksum-verified HGNC approved identity rows and exact gene-level memberships in the pinned Reactome reference. This source check does not inspect original experiments, establish protein states or disease effects, or constitute independent scientific review.

#### Claim limitations

- Identity and annotation records do not measure RNA, protein abundance, translation or a disease effect.
- The source mirrors have not been reconciled to exact official upstream releases.
- Gene-set membership is not a resolved protein/complex/compartment annotation, direct physical interaction or pathway-activity measurement.
- Selection from an AD results table does not establish an AD-risk or causal association.

#### Evidence: evidence-col3a1-scavenger-gene-set

- **Original source:** [Pinned Reactome human GMT: scavenger-receptor gene-set annotations](https://raw.githubusercontent.com/epigen/MrBiomics/fbe2f70935496c73ed21337af70e97e633c2f4d3/resources/ReactomePathways.gmt)
- **Source record:** source-reactome-scavenger-gene-set
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** Pinned Reactome JSON pathways\[id=R-HSA-2173782\].genes contains exact symbol COL3A1. The original GMT row is identified by the same stable pathway ID; source raw/normalized digests are retained.

The pinned Reactome gene-set reference lists COL3A1 in Binding and Uptake of Ligands by Scavenger Receptors (R-HSA-2173782).

Source-specific study context:

- **annotation level:** gene
- **experimental system:** Not recorded
- **normalized reference sha256:** f19f3f37b142e1f0d0a6ef84118f1ae586334b04545897627c6d9236c7a739c6
- **organism:** Homo sapiens
- **protein form:** Not recorded
- **reference id:** reactome-human-mrbiomics-f5d9af14b2f8
- **sample size:** Not recorded
- **study design:** database gene-set annotation
- **upstream release:** Not recorded

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-24
- **Human reviewed:** false
- **Review rationale:** Inspected the checksum-verified HGNC approved identity rows and exact gene-level memberships in the pinned Reactome reference. This source check does not inspect original experiments, establish protein states or disease effects, or constitute independent scientific review.

Evidence limitations:

- Identity and annotation records do not measure RNA, protein abundance, translation or a disease effect.
- The source mirrors have not been reconciled to exact official upstream releases.
- Gene-set membership is not a resolved protein/complex/compartment annotation, direct physical interaction or pathway-activity measurement.
- Selection from an AD results table does not establish an AD-risk or causal association.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-lessard-trem2-r47h-apoe3-binding

**TREM2 protein → APOE protein · interacts\_with**

Lessard et al. reported no statistically significant difference in lipidated APOE3 binding affinity between wild-type and R47H human TREM2-Fc in their biolayer interferometry assay.

**Summary:** Read alongside the earlier R47H assays while keeping preparation and readout differences visible.

#### Claim context

- **assay:** Biolayer interferometry
- **binding condition:** R47H versus wild type
- **experimental system:** Cell-free protein assay
- **fitted model:** 1:1 association/dissociation fit
- **immobilized partner:** TREM2-Fc on Protein A biosensors
- **intervention:** Not recorded
- **ligand preparation:** Human lipidated recombinant APOE3
- **organism:** Homo sapiens
- **outcome:** Fitted equilibrium dissociation constant (KD) for APOE3 binding
- **population:** Not recorded
- **protein form:** Human TREM2 ectodomain–IgG4 Fc–V5 fusion
- **study design:** Biochemical binding assay
- **tissue:** Not recorded
- **variant:** TREM2 R47H versus wild type; APOE3

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-23
- **Human reviewed:** false
- **Review rationale:** Publisher Results around Figure 2C, BioLayer interferometry methods, Figure 2 caption and Discussion inspected as readable article text; metadata cross-checked with PubMed. Selected passages only: numerical figure tables, raw curves, supplements and underlying data were not reviewed. Publication-status search remains incomplete.

#### Claim limitations

- A non-significant difference does not establish equivalent binding or a universally absent R47H effect.
- The result concerns lipidated APOE3 and this construct/assay; it does not establish cellular signaling or treatment benefit.
- The caption says the complete experiment was repeated twice with new preparations; the total run count was not resolved. Five ligand concentrations are a dilution series, not five independent experiments.

#### Evidence: evidence-lessard-2018-apoe3-binding

- **Original source:** [High-affinity interactions and signal transduction between Aβ oligomers and TREM2](https://link.springer.com/article/10.15252/emmm.201809027)
- **Source record:** source-lessard-2018
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** Publisher Results paragraph on APOE3/APOE4 affinities adjacent to Figure 2C; Figure 2C caption; Materials and Methods: BioLayer interferometry; Discussion comparison with Atagi/Bailey. Article text and captions inspected, not numerical figure images or appendices.

Lessard et al. reported no statistically significant difference in lipidated APOE3 binding affinity between wild-type and R47H human TREM2-Fc in their biolayer interferometry assay.

Source-specific study context:

- **assay:** Biolayer interferometry
- **assay replicates:** Not recorded
- **binding condition:** R47H versus wild type
- **controls:** Buffer baseline; Fc and nonspecific-binding checks in the optimized assay
- **experimental system:** Cell-free protein assay
- **experiments reported:** Not recorded
- **fitted model:** 1:1 association/dissociation fit
- **immobilized partner:** TREM2-Fc on Protein A biosensors
- **intervention:** Not recorded
- **ligand concentrations:** 5
- **ligand preparation:** Human lipidated recombinant APOE3
- **organism:** Homo sapiens
- **outcome:** Fitted equilibrium dissociation constant (KD) for APOE3 binding
- **population:** Not recorded
- **protein form:** Human TREM2 ectodomain–IgG4 Fc–V5 fusion
- **replicate unit:** Caption: complete experiment repeated twice with new preparations; total run count not resolved
- **sample size:** Not recorded
- **study design:** Biochemical binding assay
- **tissue:** Not recorded
- **variant:** TREM2 R47H versus wild type; APOE3

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-23
- **Human reviewed:** false
- **Review rationale:** Publisher Results around Figure 2C, BioLayer interferometry methods, Figure 2 caption and Discussion inspected as readable article text; metadata cross-checked with PubMed. Selected passages only: numerical figure tables, raw curves, supplements and underlying data were not reviewed. Publication-status search remains incomplete.

Evidence limitations:

- A non-significant difference does not establish equivalent binding or a universally absent R47H effect.
- The result concerns lipidated APOE3 and this construct/assay; it does not establish cellular signaling or treatment benefit.
- The caption says the complete experiment was repeated twice with new preparations; the total run count was not resolved. Five ligand concentrations are a dilution series, not five independent experiments.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-marco-encodes

**MARCO → MARCO protein · encodes**

HGNC links the approved human MARCO gene to the UniProt gene product Q9UEW3.

**Summary:** Canonical identity cross-reference.

#### Claim context

- **assertion type:** curated database cross-reference
- **gene id:** 8685
- **organism:** Homo sapiens
- **protein accession:** Q9UEW3

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-24
- **Human reviewed:** false
- **Review rationale:** Targeted source locations inspected on 2026-10-24. Canonical identities, database inference and assay scope are retained separately. Raw figures, supplements and underlying data were not reviewed; independent scientific review remains a future milestone.

#### Claim limitations

- Canonical gene/product identity only; molecular forms and assay constructs remain in evidence context.
- The pinned mirror has not been reconciled against an official HGNC release archive.

#### Evidence: evidence-marco-encodes

- **Original source:** [HGNC approved MARCO, SCARA5 and APOB gene/product cross-references (pinned mirror)](https://raw.githubusercontent.com/MargoSolo/gene-tidy/37b375b4e4f70445cbb9e40b273a510467b798ae/src/gene_tidy/data/hgnc_complete_set.tsv.gz)
- **Source record:** source-hgnc-scavenger-identities
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** Pinned HGNC TSV: approved HGNC:6895 row; symbol, entrez\_id, ensembl\_gene\_id and uniprot\_ids fields.

HGNC links the approved human MARCO gene to the UniProt gene product Q9UEW3.

Source-specific study context:

- **organism:** Homo sapiens
- **source record:** HGNC:6895
- **study design:** Curated identity cross-reference
- **upstream release:** Not recorded

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-24
- **Human reviewed:** false
- **Review rationale:** Targeted source locations inspected on 2026-10-24. Canonical identities, database inference and assay scope are retained separately. Raw figures, supplements and underlying data were not reviewed; independent scientific review remains a future milestone.

Evidence limitations:

- Canonical gene/product identity only; molecular forms and assay constructs remain in evidence context.
- The pinned mirror has not been reconciled against an official HGNC release archive.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-marco-scavenger-pathway

**MARCO protein → Scavenger-receptor binding and uptake · participates\_in**

Reactome places MARCO in the human scavenger-receptor ligand-binding and uptake pathway.

**Summary:** Source-specific pathway membership.

#### Claim context

- **assertion type:** curated database annotation
- **inferred from:** Mus musculus reaction
- **molecular context:** MARCO trimer, plasma membrane
- **organism:** Homo sapiens

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-24
- **Human reviewed:** false
- **Review rationale:** Targeted source locations inspected on 2026-10-24. Canonical identities, database inference and assay scope are retained separately. Raw figures, supplements and underlying data were not reviewed; independent scientific review remains a future milestone.

#### Claim limitations

- Database participation describes a broad human pathway, not an AD-specific effect or proof of receptor activity in an RNA-seq sample.
- The exact Reactome database release and record revision were not captured.
- The cited human reaction is explicitly inferred from a mouse reaction; its annotation is not direct experimental evidence in human brain.

#### Evidence: evidence-marco-scavenger-pathway

- **Original source:** [Reactome R-HSA-2173781 — MARCO (SCARA2) binds ligands](https://reactome.org/content/detail/R-HSA-2173781)
- **Source record:** source-reactome-marco-binding
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** Species, Locations in the PathwayBrowser, Participants and Inferred From where present; parent R-HSA-2173782.

Reactome places MARCO in the human scavenger-receptor ligand-binding and uptake pathway.

Source-specific study context:

- **inferred from:** Mus musculus reaction
- **molecular context:** MARCO trimer, plasma membrane
- **organism:** Homo sapiens
- **study design:** Curated pathway annotation
- **upstream release:** Not recorded

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-24
- **Human reviewed:** false
- **Review rationale:** Targeted source locations inspected on 2026-10-24. Canonical identities, database inference and assay scope are retained separately. Raw figures, supplements and underlying data were not reviewed; independent scientific review remains a future milestone.

Evidence limitations:

- Database participation describes a broad human pathway, not an AD-specific effect or proof of receptor activity in an RNA-seq sample.
- The exact Reactome database release and record revision were not captured.
- The cited human reaction is explicitly inferred from a mouse reaction; its annotation is not direct experimental evidence in human brain.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-mouse-abca1-apoe-lipidation-wahrle

**Abca1 (mouse) → ApoE protein (mouse) · perturbation\_affects**

In primary mouse astrocyte cultures, Abca1 deficiency yielded smaller ApoE-containing lipoprotein particles with lower cholesterol content than wild-type cultures.

**Summary:** In primary mouse astrocyte cultures, Abca1 deficiency yielded smaller ApoE-containing lipoprotein particles with lower cholesterol content than wild-type cultures.

#### Claim context

- **afm particle count:** Not recorded
- **afm preparation:** Selected wild-type fraction 37 versus knockout fraction 51
- **afm run count:** Not recorded
- **assay:** Size-exclusion fractionation; ApoE ELISA; enzymatic total-cholesterol assay; selected-fraction atomic force microscopy
- **cholesterol per apoe knockout:** 0.69 μg/μg (authors reported)
- **cholesterol per apoe wild type:** 2.3 μg/μg (authors reported)
- **comparison group:** astrocyte particle lipidation
- **conditioning:** Three days in serum-free medium
- **experimental system:** Primary forebrain astrocytes from individual neonatal mice
- **finding label:** Astrocyte particle lipidation
- **intervention:** Abca1-null versus wild-type; heterozygous cultures also included
- **model:** DBA/1-Abca1tm1Jdm
- **normalization:** ApoE and total cholesterol normalized to astrocyte-cell-lysate total protein
- **organism:** Mus musculus
- **outcome:** Size and cholesterol content of ApoE-containing lipoprotein fractions
- **preparation:** Conditioned medium concentrated 40-fold; tandem Superose-6 fractionation
- **replicate unit:** Fig4A/B reports n=4 per genotype without defining the counted unit; culture/flask/repeated-harvest independence unresolved
- **reported n per genotype:** 4
- **sample size:** Not recorded
- **study design:** Genotype-defined ex vivo culture comparison
- **taxonomy id:** 10090
- **tissue:** Forebrain; neonatal mice 1–3 days old

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-11-05
- **Human reviewed:** false
- **Review rationale:** The cited original locations and identities were inspected. This source-checked draft preserves model, readout and unknowns; it is not independent scientific review.

#### Claim limitations

- This is a mouse-model perturbation finding, not evidence that the effect occurs in humans or that ABCA1 directly binds ApoE.
- ApoE readouts do not establish Alzheimer disease causation, pathway activity or treatment benefit.
- Different publications and mouse models do not establish independent replication; shared material/cohort overlap was not assessed.
- Fig3E reports no significant difference in total unfractionated conditioned-medium ApoE; do not interpret fractionated particle changes as reduced total ApoE secretion.
- Fig 4A/B reports n=4 per genotype without a defined biological-replicate unit; AFM run/particle totals and independent repeated-harvest counts remain unknown.
- Fig3 caption reverses the D/E assay order; the plotted axes and Results identify D as cholesterol and E as ApoE. No formal correction notice was inferred.

#### Evidence: evidence-mouse-abca1-apoe-lipidation-wahrle

- **Original source:** [ABCA1 Is Required for Normal Central Nervous System ApoE Levels and for Lipidation of Astrocyte-secreted apoE](https://doi.org/10.1074/jbc.M407963200)
- **Source record:** source-wahrle-2004
- **Upstream source records:** source-openalex-apoe-abca1-live
- **Evidence relation:** supports
- **Inspected location:** Original JBC PDF via 2018-07-23 archive: Experimental Procedures p40988 (Primary Astrocyte Cultures, Fractionation of ACM, Atomic Force Microscopy); Results pp40990–40991; Fig4A–C/caption p40992; Fig3E axes and corresponding Results. Figure visuals and selected methods/results inspected.

In primary mouse astrocyte cultures, Abca1 deficiency yielded smaller ApoE-containing lipoprotein particles with lower cholesterol content than wild-type cultures.

Source-specific study context:

- **afm particle count:** Not recorded
- **afm preparation:** Selected wild-type fraction 37 versus knockout fraction 51
- **afm run count:** Not recorded
- **assay:** Size-exclusion fractionation; ApoE ELISA; enzymatic total-cholesterol assay; selected-fraction atomic force microscopy
- **cholesterol per apoe knockout:** 0.69 μg/μg (authors reported)
- **cholesterol per apoe wild type:** 2.3 μg/μg (authors reported)
- **comparison group:** astrocyte particle lipidation
- **conditioning:** Three days in serum-free medium
- **experimental system:** Primary forebrain astrocytes from individual neonatal mice
- **finding label:** Astrocyte particle lipidation
- **intervention:** Abca1-null versus wild-type; heterozygous cultures also included
- **model:** DBA/1-Abca1tm1Jdm
- **normalization:** ApoE and total cholesterol normalized to astrocyte-cell-lysate total protein
- **organism:** Mus musculus
- **outcome:** Size and cholesterol content of ApoE-containing lipoprotein fractions
- **preparation:** Conditioned medium concentrated 40-fold; tandem Superose-6 fractionation
- **replicate unit:** Fig4A/B reports n=4 per genotype without defining the counted unit; culture/flask/repeated-harvest independence unresolved
- **reported n per genotype:** 4
- **sample size:** Not recorded
- **study design:** Genotype-defined ex vivo culture comparison
- **taxonomy id:** 10090
- **tissue:** Forebrain; neonatal mice 1–3 days old

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-11-05
- **Human reviewed:** false
- **Review rationale:** The cited original locations and identities were inspected. This source-checked draft preserves model, readout and unknowns; it is not independent scientific review.

Evidence limitations:

- This is a mouse-model perturbation finding, not evidence that the effect occurs in humans or that ABCA1 directly binds ApoE.
- ApoE readouts do not establish Alzheimer disease causation, pathway activity or treatment benefit.
- Different publications and mouse models do not establish independent replication; shared material/cohort overlap was not assessed.
- Fig3E reports no significant difference in total unfractionated conditioned-medium ApoE; do not interpret fractionated particle changes as reduced total ApoE secretion.
- Fig 4A/B reports n=4 per genotype without a defined biological-replicate unit; AFM run/particle totals and independent repeated-harvest counts remain unknown.
- Fig3 caption reverses the D/E assay order; the plotted axes and Results identify D as cholesterol and E as ApoE. No formal correction notice was inferred.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-mouse-abca1-apoe-soluble-app-ps1

**Abca1 (mouse) → ApoE protein (mouse) · perturbation\_affects**

In 12-month APP/PS1 mice, the authors reported about 80% lower PBS-soluble hippocampal ApoE in Abca1-knockout animals than in transgene-positive wild-type controls.

**Summary:** In 12-month APP/PS1 mice, the authors reported about 80% lower PBS-soluble hippocampal ApoE in Abca1-knockout animals than in transgene-positive wild-type controls.

#### Claim context

- **age months:** 12
- **assay:** Sequential extraction; equal-protein Western blot and densitometry; murine-specific ApoE antibody; GAPDH loading control
- **authors reported reduction percent:** 80
- **comparison group:** hippocampal soluble ApoE
- **crossref doi creation date:** 2005-10-06
- **experimental system:** 12-month APP/PS1 transgene-positive mouse hippocampus
- **experiments reported:** At least two experiments in figure caption; reblot/sample overlap not defined
- **finding label:** APP/PS1 · 12 months
- **intervention:** Homozygous Abca1 knockout versus Abca1 wild-type, both transgene-positive
- **knockout mice:** 5
- **model:** APP/PS1
- **openalex publication date:** 2005-10-06
- **organism:** Mus musculus
- **original online publication date:** 2005-10-05
- **outcome:** PBS-soluble ApoE protein in hippocampus
- **replicate unit:** Individual mice; two representative blot lanes per group are not the biological sample total
- **reported statistical comparison:** No exact p-value assigned to this transgene-positive knockout/wild-type contrast; caption stars use a nontransgenic baseline
- **sample size:** Not recorded
- **sex per compared group:** 2 female / 3 male
- **study design:** Genotype-defined in vivo mouse comparison
- **taxonomy id:** 10090
- **tissue:** Hippocampus
- **wild type mice:** 5

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-11-05
- **Human reviewed:** false
- **Review rationale:** The cited original locations and identities were inspected. This source-checked draft preserves model, readout and unknowns; it is not independent scientific review.

#### Claim limitations

- This is a mouse-model perturbation finding, not evidence that the effect occurs in humans or that ABCA1 directly binds ApoE.
- ApoE readouts do not establish Alzheimer disease causation, pathway activity or treatment benefit.
- Different publications and mouse models do not establish independent replication; shared material/cohort overlap was not assessed.
- The antibody measured endogenous mouse ApoE despite the human APP/PS1 transgenes; the human APOE protein is not this experimental endpoint.
- PBS-soluble ApoE is an extraction-specific protein pool, not total brain ApoE, secretion rate or particle lipidation.
- This comparison uses the stated individual-mouse groups; figure repeats and representative blots are not additional independent mice or studies.
- Figure-star significance is relative to the caption-defined nontransgenic baseline and must not be transferred to a different contrast.

#### Evidence: evidence-mouse-abca1-apoe-soluble-app-ps1

- **Original source:** [The Absence of ABCA1 Decreases Soluble ApoE Levels but Does Not Diminish Amyloid Deposition in Two Murine Models of Alzheimer Disease](https://doi.org/10.1074/jbc.M508781200)
- **Source record:** source-hirsch-reinshagen-2005
- **Upstream source records:** source-openalex-apoe-abca1-legacy
- **Evidence relation:** supports
- **Inspected location:** Original JBC PDF via public hospital repository: Methods pp43245–43246 (sequential extraction and Western Blotting); Results p43249; Fig6B and complete caption p43250. Methods, text and actual Fig6 visual inspected.

In 12-month APP/PS1 mice, the authors reported about 80% lower PBS-soluble hippocampal ApoE in Abca1-knockout animals than in transgene-positive wild-type controls.

Source-specific study context:

- **age months:** 12
- **assay:** Sequential extraction; equal-protein Western blot and densitometry; murine-specific ApoE antibody; GAPDH loading control
- **authors reported reduction percent:** 80
- **comparison group:** hippocampal soluble ApoE
- **crossref doi creation date:** 2005-10-06
- **experimental system:** 12-month APP/PS1 transgene-positive mouse hippocampus
- **experiments reported:** At least two experiments in figure caption; reblot/sample overlap not defined
- **finding label:** APP/PS1 · 12 months
- **intervention:** Homozygous Abca1 knockout versus Abca1 wild-type, both transgene-positive
- **knockout mice:** 5
- **model:** APP/PS1
- **openalex publication date:** 2005-10-06
- **organism:** Mus musculus
- **original online publication date:** 2005-10-05
- **outcome:** PBS-soluble ApoE protein in hippocampus
- **replicate unit:** Individual mice; two representative blot lanes per group are not the biological sample total
- **reported statistical comparison:** No exact p-value assigned to this transgene-positive knockout/wild-type contrast; caption stars use a nontransgenic baseline
- **sample size:** Not recorded
- **sex per compared group:** 2 female / 3 male
- **study design:** Genotype-defined in vivo mouse comparison
- **taxonomy id:** 10090
- **tissue:** Hippocampus
- **wild type mice:** 5

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-11-05
- **Human reviewed:** false
- **Review rationale:** The cited original locations and identities were inspected. This source-checked draft preserves model, readout and unknowns; it is not independent scientific review.

Evidence limitations:

- This is a mouse-model perturbation finding, not evidence that the effect occurs in humans or that ABCA1 directly binds ApoE.
- ApoE readouts do not establish Alzheimer disease causation, pathway activity or treatment benefit.
- Different publications and mouse models do not establish independent replication; shared material/cohort overlap was not assessed.
- The antibody measured endogenous mouse ApoE despite the human APP/PS1 transgenes; the human APOE protein is not this experimental endpoint.
- PBS-soluble ApoE is an extraction-specific protein pool, not total brain ApoE, secretion rate or particle lipidation.
- This comparison uses the stated individual-mouse groups; figure repeats and representative blots are not additional independent mice or studies.
- Figure-star significance is relative to the caption-defined nontransgenic baseline and must not be transferred to a different contrast.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-mouse-abca1-apoe-soluble-tgswdi

**Abca1 (mouse) → ApoE protein (mouse) · perturbation\_affects**

In 10-month Tg-SwDI/B mice, the authors reported about 75% lower PBS-soluble hippocampal ApoE in Abca1-knockout animals than in transgene-positive wild-type controls.

**Summary:** In 10-month Tg-SwDI/B mice, the authors reported about 75% lower PBS-soluble hippocampal ApoE in Abca1-knockout animals than in transgene-positive wild-type controls.

#### Claim context

- **age months:** 10
- **assay:** Sequential extraction; equal-protein Western blot and densitometry; murine-specific ApoE antibody; GAPDH loading control
- **authors reported reduction percent:** 75
- **comparison group:** hippocampal soluble ApoE
- **crossref doi creation date:** 2005-10-06
- **experimental system:** 10-month Tg-SwDI/B transgene-positive mouse hippocampus
- **experiments reported:** At least two experiments in figure caption; reblot/sample overlap not defined
- **finding label:** Tg-SwDI/B · 10 months
- **intervention:** Homozygous Abca1 knockout versus Abca1 wild-type, both transgene-positive
- **knockout mice:** 8
- **model:** Tg-SwDI/B
- **openalex publication date:** 2005-10-06
- **organism:** Mus musculus
- **original online publication date:** 2005-10-05
- **outcome:** PBS-soluble ApoE protein in hippocampus
- **replicate unit:** Individual mice; two representative blot lanes per group are not the biological sample total
- **reported statistical comparison:** Results reports p\<0.001 for the transgene-positive knockout/wild-type comparison
- **sample size:** Not recorded
- **sex per compared group:** 4 female / 4 male
- **study design:** Genotype-defined in vivo mouse comparison
- **taxonomy id:** 10090
- **tissue:** Hippocampus
- **wild type mice:** 8

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-11-05
- **Human reviewed:** false
- **Review rationale:** The cited original locations and identities were inspected. This source-checked draft preserves model, readout and unknowns; it is not independent scientific review.

#### Claim limitations

- This is a mouse-model perturbation finding, not evidence that the effect occurs in humans or that ABCA1 directly binds ApoE.
- ApoE readouts do not establish Alzheimer disease causation, pathway activity or treatment benefit.
- Different publications and mouse models do not establish independent replication; shared material/cohort overlap was not assessed.
- The antibody measured endogenous mouse ApoE despite the human APP transgenes; the human APOE protein is not this experimental endpoint.
- PBS-soluble ApoE is an extraction-specific protein pool, not total brain ApoE, secretion rate or particle lipidation.
- This comparison uses the stated individual-mouse groups; figure repeats and representative blots are not additional independent mice or studies.
- Figure-star significance is relative to the caption-defined nontransgenic baseline and must not be transferred to a different contrast.

#### Evidence: evidence-mouse-abca1-apoe-soluble-tgswdi

- **Original source:** [The Absence of ABCA1 Decreases Soluble ApoE Levels but Does Not Diminish Amyloid Deposition in Two Murine Models of Alzheimer Disease](https://doi.org/10.1074/jbc.M508781200)
- **Source record:** source-hirsch-reinshagen-2005
- **Upstream source records:** source-openalex-apoe-abca1-legacy
- **Evidence relation:** supports
- **Inspected location:** Original JBC PDF via public hospital repository: Methods pp43245–43246 (sequential extraction and Western Blotting); Results p43249; Fig6A and complete caption p43250. Methods, text and actual Fig6 visual inspected.

In 10-month Tg-SwDI/B mice, the authors reported about 75% lower PBS-soluble hippocampal ApoE in Abca1-knockout animals than in transgene-positive wild-type controls.

Source-specific study context:

- **age months:** 10
- **assay:** Sequential extraction; equal-protein Western blot and densitometry; murine-specific ApoE antibody; GAPDH loading control
- **authors reported reduction percent:** 75
- **comparison group:** hippocampal soluble ApoE
- **crossref doi creation date:** 2005-10-06
- **experimental system:** 10-month Tg-SwDI/B transgene-positive mouse hippocampus
- **experiments reported:** At least two experiments in figure caption; reblot/sample overlap not defined
- **finding label:** Tg-SwDI/B · 10 months
- **intervention:** Homozygous Abca1 knockout versus Abca1 wild-type, both transgene-positive
- **knockout mice:** 8
- **model:** Tg-SwDI/B
- **openalex publication date:** 2005-10-06
- **organism:** Mus musculus
- **original online publication date:** 2005-10-05
- **outcome:** PBS-soluble ApoE protein in hippocampus
- **replicate unit:** Individual mice; two representative blot lanes per group are not the biological sample total
- **reported statistical comparison:** Results reports p\<0.001 for the transgene-positive knockout/wild-type comparison
- **sample size:** Not recorded
- **sex per compared group:** 4 female / 4 male
- **study design:** Genotype-defined in vivo mouse comparison
- **taxonomy id:** 10090
- **tissue:** Hippocampus
- **wild type mice:** 8

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-11-05
- **Human reviewed:** false
- **Review rationale:** The cited original locations and identities were inspected. This source-checked draft preserves model, readout and unknowns; it is not independent scientific review.

Evidence limitations:

- This is a mouse-model perturbation finding, not evidence that the effect occurs in humans or that ABCA1 directly binds ApoE.
- ApoE readouts do not establish Alzheimer disease causation, pathway activity or treatment benefit.
- Different publications and mouse models do not establish independent replication; shared material/cohort overlap was not assessed.
- The antibody measured endogenous mouse ApoE despite the human APP transgenes; the human APOE protein is not this experimental endpoint.
- PBS-soluble ApoE is an extraction-specific protein pool, not total brain ApoE, secretion rate or particle lipidation.
- This comparison uses the stated individual-mouse groups; figure repeats and representative blots are not additional independent mice or studies.
- Figure-star significance is relative to the caption-defined nontransgenic baseline and must not be transferred to a different contrast.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-mouse-abca1-human-ortholog

**Abca1 (mouse) → ABCA1 · ortholog\_of**

Ensembl Compara annotates mouse Abca1 as a one-to-one ortholog of human ABCA1.

**Summary:** Ensembl Compara annotates mouse Abca1 as a one-to-one ortholog of human ABCA1.

#### Claim context

- **assertion type:** curated orthology annotation
- **object gene id:** ENSG00000165029
- **object taxonomy id:** 9606
- **orthology type:** ortholog\_one2one
- **subject gene id:** ENSMUSG00000015243
- **subject taxonomy id:** 10090

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-11-05
- **Human reviewed:** false
- **Review rationale:** The cited original locations and identities were inspected. This source-checked draft preserves model, readout and unknowns; it is not independent scientific review.

#### Claim limitations

- Orthology is an evolutionary database annotation, not proof that a mouse experimental effect occurs in humans.
- Ensembl release was not captured and exact source-terms review remains pending; no sequence/alignments are distributed.

#### Evidence: evidence-mouse-abca1-human-ortholog

- **Original source:** [Ensembl Compara: mouse/human ABCA1 orthology](https://rest.ensembl.org/homology/symbol/mus_musculus/Abca1?target_species=homo_sapiens&type=orthologues&content-type=application/json)
- **Source record:** source-ensembl-abca1-orthology
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** Completed homology/symbol response: single ortholog\_one2one source/target gene IDs and taxon\_ids; target\_species=homo\_sapiens, type=orthologues.

Ensembl Compara annotates mouse Abca1 as a one-to-one ortholog of human ABCA1.

Source-specific study context:

- **assertion type:** curated orthology annotation
- **object gene id:** ENSG00000165029
- **object taxonomy id:** 9606
- **orthology type:** ortholog\_one2one
- **subject gene id:** ENSMUSG00000015243
- **subject taxonomy id:** 10090

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-11-05
- **Human reviewed:** false
- **Review rationale:** The cited original locations and identities were inspected. This source-checked draft preserves model, readout and unknowns; it is not independent scientific review.

Evidence limitations:

- Orthology is an evolutionary database annotation, not proof that a mouse experimental effect occurs in humans.
- Ensembl release was not captured and exact source-terms review remains pending; no sequence/alignments are distributed.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-mouse-apoe-encodes

**Apoe (mouse) → ApoE protein (mouse) · encodes**

The mouse Apoe gene (NCBI Gene11816) encodes the ApoE protein represented by UniProt P08226.

**Summary:** The mouse Apoe gene (NCBI Gene11816) encodes the ApoE protein represented by UniProt P08226.

#### Claim context

- **assertion type:** curated database identity
- **gene id:** 11816
- **organism:** Mus musculus
- **protein accession:** P08226
- **taxonomy id:** 10090

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-11-05
- **Human reviewed:** false
- **Review rationale:** The cited original locations and identities were inspected. This source-checked draft preserves model, readout and unknowns; it is not independent scientific review.

#### Claim limitations

- Canonical gene/product identity; the experimental particle fractions are context, not separately identified isoform or modification nodes.

#### Evidence: evidence-mouse-apoe-encodes

- **Original source:** [UniProtKB P08226: mouse Apoe gene/product identity](https://rest.uniprot.org/uniprotkb/P08226.json)
- **Source record:** source-uniprot-mouse-apoe
- **Upstream source records:** source-ncbi-mouse-abca1-apoe
- **Evidence relation:** supports
- **Inspected location:** Entry JSON primaryAccession, genes, organism, entryAudit and explicit GeneID/Ensembl GeneId cross-references.

The mouse Apoe gene (NCBI Gene11816) encodes the ApoE protein represented by UniProt P08226.

Source-specific study context:

- **assertion type:** curated database identity
- **gene id:** 11816
- **organism:** Mus musculus
- **protein accession:** P08226
- **taxonomy id:** 10090

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-11-05
- **Human reviewed:** false
- **Review rationale:** The cited original locations and identities were inspected. This source-checked draft preserves model, readout and unknowns; it is not independent scientific review.

Evidence limitations:

- Canonical gene/product identity; the experimental particle fractions are context, not separately identified isoform or modification nodes.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-mouse-apoe-human-ortholog

**Apoe (mouse) → APOE · ortholog\_of**

Ensembl Compara annotates mouse Apoe as a one-to-one ortholog of human APOE.

**Summary:** Ensembl Compara annotates mouse Apoe as a one-to-one ortholog of human APOE.

#### Claim context

- **assertion type:** curated orthology annotation
- **object gene id:** ENSG00000130203
- **object taxonomy id:** 9606
- **orthology type:** ortholog\_one2one
- **subject gene id:** ENSMUSG00000002985
- **subject taxonomy id:** 10090

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-11-05
- **Human reviewed:** false
- **Review rationale:** The cited original locations and identities were inspected. This source-checked draft preserves model, readout and unknowns; it is not independent scientific review.

#### Claim limitations

- Orthology is an evolutionary database annotation, not proof that a mouse experimental effect occurs in humans.
- Ensembl release was not captured and exact source-terms review remains pending; no sequence/alignments are distributed.

#### Evidence: evidence-mouse-apoe-human-ortholog

- **Original source:** [Ensembl Compara: mouse/human APOE orthology](https://rest.ensembl.org/homology/symbol/mus_musculus/Apoe?target_species=homo_sapiens&type=orthologues&content-type=application/json)
- **Source record:** source-ensembl-apoe-orthology
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** Completed homology/symbol response: single ortholog\_one2one source/target gene IDs and taxon\_ids; target\_species=homo\_sapiens, type=orthologues.

Ensembl Compara annotates mouse Apoe as a one-to-one ortholog of human APOE.

Source-specific study context:

- **assertion type:** curated orthology annotation
- **object gene id:** ENSG00000130203
- **object taxonomy id:** 9606
- **orthology type:** ortholog\_one2one
- **subject gene id:** ENSMUSG00000002985
- **subject taxonomy id:** 10090

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-11-05
- **Human reviewed:** false
- **Review rationale:** The cited original locations and identities were inspected. This source-checked draft preserves model, readout and unknowns; it is not independent scientific review.

Evidence limitations:

- Orthology is an evolutionary database annotation, not proof that a mouse experimental effect occurs in humans.
- Ensembl release was not captured and exact source-terms review remains pending; no sequence/alignments are distributed.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-nr1h2-cholesterol-pathway

**LXRβ protein → Cholesterol transport and efflux · participates\_in**

Reactome includes LXRβ protein in its human cholesterol transport and efflux gene-regulation pathway.

**Summary:** Follow the cited record for the annotation and its source context.

#### Claim context

- **assertion type:** curated database annotation
- **organism:** Homo sapiens
- **pathway id:** R-HSA-9029569
- **protein state:** NR1H2-containing nuclear-receptor complexes

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-22
- **Human reviewed:** false
- **Review rationale:** Source record and stated locator checked. This draft preserves the scope of the database annotation; independent scientific review is a future milestone.

#### Claim limitations

- Curated pathway participation does not establish an AD-specific mechanism or activity in every tissue.
- Record page accessed 2026-10-22; database release and record revision not captured
- Database annotations are not independent experimental replication or evidence of treatment benefit.

#### Evidence: evidence-nr1h2-cholesterol-pathway

- **Original source:** [NR1H2 \[nucleoplasm\]](https://reactome.org/content/detail/R-HSA-375500)
- **Source record:** source-reactome-nr1h2-protein
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** Reactome Locations in the PathwayBrowser: cholesterol transport/efflux branch and NR1H2-containing complexes.

Reactome includes LXRβ protein in its human cholesterol transport and efflux gene-regulation pathway.

Source-specific study context:

- **assertion type:** curated database annotation
- **design:** database annotation
- **organism:** Homo sapiens
- **pathway id:** R-HSA-9029569
- **protein state:** NR1H2-containing nuclear-receptor complexes
- **sample size:** Not recorded

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-22
- **Human reviewed:** false
- **Review rationale:** Source record and stated locator checked. This draft preserves the scope of the database annotation; independent scientific review is a future milestone.

Evidence limitations:

- Curated pathway participation does not establish an AD-specific mechanism or activity in every tissue.
- Record page accessed 2026-10-22; database release and record revision not captured
- Database annotations are not independent experimental replication or evidence of treatment benefit.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-nr1h2-encodes

**NR1H2 → LXRβ protein · encodes**

The human NR1H2 gene encodes Oxysterols receptor LXR-beta (P55055).

**Summary:** Follow the cited record for the annotation and its source context.

#### Claim context

- **assertion type:** curated database annotation
- **gene id:** 7376
- **organism:** Homo sapiens
- **protein accession:** P55055

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-22
- **Human reviewed:** false
- **Review rationale:** Source record and stated locator checked. This draft preserves the scope of the database annotation; independent scientific review is a future milestone.

#### Claim limitations

- Canonical gene-product mapping; isoforms and post-translational states are not separate nodes.
- Database annotations are not independent experimental replication or evidence of treatment benefit.

#### Evidence: evidence-nr1h2-encodes

- **Original source:** [NR1H2 \[nucleoplasm\]](https://reactome.org/content/detail/R-HSA-375500)
- **Source record:** source-reactome-nr1h2-protein
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** Reactome External Reference Information: UniProt accession, Gene Names and Reference Genes; species in record identity.

The human NR1H2 gene encodes Oxysterols receptor LXR-beta (P55055).

Source-specific study context:

- **assertion type:** curated database annotation
- **design:** database annotation
- **gene id:** 7376
- **organism:** Homo sapiens
- **protein accession:** P55055
- **sample size:** Not recorded

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-22
- **Human reviewed:** false
- **Review rationale:** Source record and stated locator checked. This draft preserves the scope of the database annotation; independent scientific review is a future milestone.

Evidence limitations:

- Canonical gene-product mapping; isoforms and post-translational states are not separate nodes.
- Database annotations are not independent experimental replication or evidence of treatment benefit.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-nr1h3-cholesterol-pathway

**LXRα protein → Cholesterol transport and efflux · participates\_in**

Reactome includes LXRα protein in its human cholesterol transport and efflux gene-regulation pathway.

**Summary:** Follow the cited record for the annotation and its source context.

#### Claim context

- **assertion type:** curated database annotation
- **organism:** Homo sapiens
- **pathway id:** R-HSA-9029569
- **protein state:** NR1H3-containing nuclear-receptor complexes

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-22
- **Human reviewed:** false
- **Review rationale:** Source record and stated locator checked. This draft preserves the scope of the database annotation; independent scientific review is a future milestone.

#### Claim limitations

- Curated pathway participation does not establish an AD-specific mechanism or activity in every tissue.
- Record page accessed 2026-10-22; database release and record revision not captured
- Database annotations are not independent experimental replication or evidence of treatment benefit.

#### Evidence: evidence-nr1h3-cholesterol-pathway

- **Original source:** [NR1H3 \[nucleoplasm\]](https://reactome.org/content/detail/R-HSA-8854957)
- **Source record:** source-reactome-nr1h3-protein
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** Reactome Locations in the PathwayBrowser: cholesterol transport/efflux branch and NR1H3-containing complexes.

Reactome includes LXRα protein in its human cholesterol transport and efflux gene-regulation pathway.

Source-specific study context:

- **assertion type:** curated database annotation
- **design:** database annotation
- **organism:** Homo sapiens
- **pathway id:** R-HSA-9029569
- **protein state:** NR1H3-containing nuclear-receptor complexes
- **sample size:** Not recorded

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-22
- **Human reviewed:** false
- **Review rationale:** Source record and stated locator checked. This draft preserves the scope of the database annotation; independent scientific review is a future milestone.

Evidence limitations:

- Curated pathway participation does not establish an AD-specific mechanism or activity in every tissue.
- Record page accessed 2026-10-22; database release and record revision not captured
- Database annotations are not independent experimental replication or evidence of treatment benefit.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-nr1h3-encodes

**NR1H3 → LXRα protein · encodes**

The human NR1H3 gene encodes Oxysterols receptor LXR-alpha (Q13133).

**Summary:** Follow the cited record for the annotation and its source context.

#### Claim context

- **assertion type:** curated database annotation
- **gene id:** 10062
- **organism:** Homo sapiens
- **protein accession:** Q13133

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-22
- **Human reviewed:** false
- **Review rationale:** Source record and stated locator checked. This draft preserves the scope of the database annotation; independent scientific review is a future milestone.

#### Claim limitations

- Canonical gene-product mapping; isoforms and post-translational states are not separate nodes.
- Database annotations are not independent experimental replication or evidence of treatment benefit.

#### Evidence: evidence-nr1h3-encodes

- **Original source:** [NR1H3 \[nucleoplasm\]](https://reactome.org/content/detail/R-HSA-8854957)
- **Source record:** source-reactome-nr1h3-protein
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** Reactome External Reference Information: UniProt accession, Gene Names and Reference Genes; species in record identity.

The human NR1H3 gene encodes Oxysterols receptor LXR-alpha (Q13133).

Source-specific study context:

- **assertion type:** curated database annotation
- **design:** database annotation
- **gene id:** 10062
- **organism:** Homo sapiens
- **protein accession:** Q13133
- **sample size:** Not recorded

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-22
- **Human reviewed:** false
- **Review rationale:** Source record and stated locator checked. This draft preserves the scope of the database annotation; independent scientific review is a future milestone.

Evidence limitations:

- Canonical gene-product mapping; isoforms and post-translational states are not separate nodes.
- Database annotations are not independent experimental replication or evidence of treatment benefit.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-rxra-cholesterol-pathway

**RXRα protein → Cholesterol transport and efflux · participates\_in**

Reactome includes RXRα protein in its human cholesterol transport and efflux gene-regulation pathway.

**Summary:** Follow the cited record for the annotation and its source context.

#### Claim context

- **assertion type:** curated database annotation
- **organism:** Homo sapiens
- **pathway id:** R-HSA-9029569
- **protein state:** RXRA in NR1H2/NR1H3 receptor complexes

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-22
- **Human reviewed:** false
- **Review rationale:** Source record and stated locator checked. This draft preserves the scope of the database annotation; independent scientific review is a future milestone.

#### Claim limitations

- Curated pathway participation does not establish an AD-specific mechanism or activity in every tissue.
- Record page accessed 2026-10-22; database release and record revision not captured
- Database annotations are not independent experimental replication or evidence of treatment benefit.

#### Evidence: evidence-rxra-cholesterol-pathway

- **Original source:** [RXRA \[nucleoplasm\]](https://reactome.org/content/detail/R-HSA-381319)
- **Source record:** source-reactome-rxra-protein
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** Reactome Locations in the PathwayBrowser: cholesterol transport/efflux branch, NR1H2:RXRA and NR1H3:RXRA complexes.

Reactome includes RXRα protein in its human cholesterol transport and efflux gene-regulation pathway.

Source-specific study context:

- **assertion type:** curated database annotation
- **design:** database annotation
- **organism:** Homo sapiens
- **pathway id:** R-HSA-9029569
- **protein state:** RXRA in NR1H2/NR1H3 receptor complexes
- **sample size:** Not recorded

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-22
- **Human reviewed:** false
- **Review rationale:** Source record and stated locator checked. This draft preserves the scope of the database annotation; independent scientific review is a future milestone.

Evidence limitations:

- Curated pathway participation does not establish an AD-specific mechanism or activity in every tissue.
- Record page accessed 2026-10-22; database release and record revision not captured
- Database annotations are not independent experimental replication or evidence of treatment benefit.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-rxra-encodes

**RXRA → RXRα protein · encodes**

The human RXRA gene encodes Retinoic acid receptor RXR-alpha (P19793).

**Summary:** Follow the cited record for the annotation and its source context.

#### Claim context

- **assertion type:** curated database annotation
- **gene id:** 6256
- **organism:** Homo sapiens
- **protein accession:** P19793

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-22
- **Human reviewed:** false
- **Review rationale:** Source record and stated locator checked. This draft preserves the scope of the database annotation; independent scientific review is a future milestone.

#### Claim limitations

- Canonical gene-product mapping; isoforms and post-translational states are not separate nodes.
- Database annotations are not independent experimental replication or evidence of treatment benefit.

#### Evidence: evidence-rxra-encodes

- **Original source:** [UniProtKB P19793 — Retinoic acid receptor RXR-alpha](https://rest.uniprot.org/uniprotkb/P19793.txt)
- **Source record:** source-uniprot-rxra
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** UniProtKB ID/AC, gene name (GN), organism (OS), GeneID cross-reference (DR), and entry-version (DT) fields.

The human RXRA gene encodes Retinoic acid receptor RXR-alpha (P19793).

Source-specific study context:

- **assertion type:** curated database annotation
- **design:** database annotation
- **gene id:** 6256
- **organism:** Homo sapiens
- **protein accession:** P19793
- **sample size:** Not recorded

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-22
- **Human reviewed:** false
- **Review rationale:** Source record and stated locator checked. This draft preserves the scope of the database annotation; independent scientific review is a future milestone.

Evidence limitations:

- Canonical gene-product mapping; isoforms and post-translational states are not separate nodes.
- Database annotations are not independent experimental replication or evidence of treatment benefit.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-saa1-encodes

**SAA1 → SAA1 protein · encodes**

HGNC links the approved human SAA1 gene to the UniProt gene product P0DJI8.

**Summary:** Canonical identity cross-reference.

#### Claim context

- **assertion type:** curated database cross-reference
- **gene id:** 6288
- **organism:** Homo sapiens
- **protein accession:** P0DJI8

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-24
- **Human reviewed:** false
- **Review rationale:** Inspected the checksum-verified HGNC approved identity rows and exact gene-level memberships in the pinned Reactome reference. This source check does not inspect original experiments, establish protein states or disease effects, or constitute independent scientific review.

#### Claim limitations

- Identity and annotation records do not measure RNA, protein abundance, translation or a disease effect.
- The source mirrors have not been reconciled to exact official upstream releases.

#### Evidence: evidence-saa1-encodes

- **Original source:** [HGNC approved COL1A1, COL1A2, COL3A1 and SAA1 gene/product cross-references (pinned mirror)](https://raw.githubusercontent.com/MargoSolo/gene-tidy/37b375b4e4f70445cbb9e40b273a510467b798ae/src/gene_tidy/data/hgnc_complete_set.tsv.gz)
- **Source record:** source-hgnc-coverage-identities
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** Approved HGNC row HGNC:10513 (SAA1); symbol, name, ensembl\_gene\_id, entrez\_id and uniprot\_ids columns.

HGNC links the approved human SAA1 gene to the UniProt gene product P0DJI8.

Source-specific study context:

- **experimental system:** Not recorded
- **hgnc id:** HGNC:10513
- **organism:** Homo sapiens
- **sample size:** Not recorded
- **source sha256:** 6bb2951c56204cd7b387c4e40b8d46107f6bdc422e77b8e4f2088a5d39e1be4b
- **study design:** database identity annotation
- **upstream release:** Not recorded

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-24
- **Human reviewed:** false
- **Review rationale:** Inspected the checksum-verified HGNC approved identity rows and exact gene-level memberships in the pinned Reactome reference. This source check does not inspect original experiments, establish protein states or disease effects, or constitute independent scientific review.

Evidence limitations:

- Identity and annotation records do not measure RNA, protein abundance, translation or a disease effect.
- The source mirrors have not been reconciled to exact official upstream releases.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-saa1-scavenger-gene-set

**SAA1 → Scavenger-receptor binding and uptake · participates\_in**

The pinned Reactome gene-set reference lists SAA1 in Binding and Uptake of Ligands by Scavenger Receptors (R-HSA-2173782).

**Summary:** Literal gene-level pathway annotation in the pinned reference.

#### Claim context

- **annotation level:** gene
- **assertion type:** curated gene-set annotation
- **organism:** Homo sapiens
- **reference id:** reactome-human-mrbiomics-f5d9af14b2f8
- **upstream release:** Not recorded

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-24
- **Human reviewed:** false
- **Review rationale:** Inspected the checksum-verified HGNC approved identity rows and exact gene-level memberships in the pinned Reactome reference. This source check does not inspect original experiments, establish protein states or disease effects, or constitute independent scientific review.

#### Claim limitations

- Identity and annotation records do not measure RNA, protein abundance, translation or a disease effect.
- The source mirrors have not been reconciled to exact official upstream releases.
- Gene-set membership is not a resolved protein/complex/compartment annotation, direct physical interaction or pathway-activity measurement.
- Selection from an AD results table does not establish an AD-risk or causal association.

#### Evidence: evidence-saa1-scavenger-gene-set

- **Original source:** [Pinned Reactome human GMT: scavenger-receptor gene-set annotations](https://raw.githubusercontent.com/epigen/MrBiomics/fbe2f70935496c73ed21337af70e97e633c2f4d3/resources/ReactomePathways.gmt)
- **Source record:** source-reactome-scavenger-gene-set
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** Pinned Reactome JSON pathways\[id=R-HSA-2173782\].genes contains exact symbol SAA1. The original GMT row is identified by the same stable pathway ID; source raw/normalized digests are retained.

The pinned Reactome gene-set reference lists SAA1 in Binding and Uptake of Ligands by Scavenger Receptors (R-HSA-2173782).

Source-specific study context:

- **annotation level:** gene
- **experimental system:** Not recorded
- **normalized reference sha256:** f19f3f37b142e1f0d0a6ef84118f1ae586334b04545897627c6d9236c7a739c6
- **organism:** Homo sapiens
- **protein form:** Not recorded
- **reference id:** reactome-human-mrbiomics-f5d9af14b2f8
- **sample size:** Not recorded
- **study design:** database gene-set annotation
- **upstream release:** Not recorded

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-24
- **Human reviewed:** false
- **Review rationale:** Inspected the checksum-verified HGNC approved identity rows and exact gene-level memberships in the pinned Reactome reference. This source check does not inspect original experiments, establish protein states or disease effects, or constitute independent scientific review.

Evidence limitations:

- Identity and annotation records do not measure RNA, protein abundance, translation or a disease effect.
- The source mirrors have not been reconciled to exact official upstream releases.
- Gene-set membership is not a resolved protein/complex/compartment annotation, direct physical interaction or pathway-activity measurement.
- Selection from an AD results table does not establish an AD-risk or causal association.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-scara5-encodes

**SCARA5 → SCARA5 protein · encodes**

HGNC links the approved human SCARA5 gene to the UniProt gene product Q6ZMJ2.

**Summary:** Canonical identity cross-reference.

#### Claim context

- **assertion type:** curated database cross-reference
- **gene id:** 286133
- **organism:** Homo sapiens
- **protein accession:** Q6ZMJ2

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-24
- **Human reviewed:** false
- **Review rationale:** Targeted source locations inspected on 2026-10-24. Canonical identities, database inference and assay scope are retained separately. Raw figures, supplements and underlying data were not reviewed; independent scientific review remains a future milestone.

#### Claim limitations

- Canonical gene/product identity only; molecular forms and assay constructs remain in evidence context.
- The pinned mirror has not been reconciled against an official HGNC release archive.

#### Evidence: evidence-scara5-encodes

- **Original source:** [HGNC approved MARCO, SCARA5 and APOB gene/product cross-references (pinned mirror)](https://raw.githubusercontent.com/MargoSolo/gene-tidy/37b375b4e4f70445cbb9e40b273a510467b798ae/src/gene_tidy/data/hgnc_complete_set.tsv.gz)
- **Source record:** source-hgnc-scavenger-identities
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** Pinned HGNC TSV: approved HGNC:28701 row; symbol, entrez\_id, ensembl\_gene\_id and uniprot\_ids fields.

HGNC links the approved human SCARA5 gene to the UniProt gene product Q6ZMJ2.

Source-specific study context:

- **organism:** Homo sapiens
- **source record:** HGNC:28701
- **study design:** Curated identity cross-reference
- **upstream release:** Not recorded

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-24
- **Human reviewed:** false
- **Review rationale:** Targeted source locations inspected on 2026-10-24. Canonical identities, database inference and assay scope are retained separately. Raw figures, supplements and underlying data were not reviewed; independent scientific review remains a future milestone.

Evidence limitations:

- Canonical gene/product identity only; molecular forms and assay constructs remain in evidence context.
- The pinned mirror has not been reconciled against an official HGNC release archive.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-scara5-scavenger-pathway

**SCARA5 protein → Scavenger-receptor binding and uptake · participates\_in**

Reactome places SCARA5 in the human scavenger-receptor ligand-binding and uptake pathway.

**Summary:** Source-specific pathway membership.

#### Claim context

- **assertion type:** curated database annotation
- **inferred from:** Mus musculus reaction
- **molecular context:** SCARA5 trimer, plasma membrane
- **organism:** Homo sapiens

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-24
- **Human reviewed:** false
- **Review rationale:** Targeted source locations inspected on 2026-10-24. Canonical identities, database inference and assay scope are retained separately. Raw figures, supplements and underlying data were not reviewed; independent scientific review remains a future milestone.

#### Claim limitations

- Database participation describes a broad human pathway, not an AD-specific effect or proof of receptor activity in an RNA-seq sample.
- The exact Reactome database release and record revision were not captured.
- The cited human reaction is explicitly inferred from a mouse reaction; its annotation is not direct experimental evidence in human brain.

#### Evidence: evidence-scara5-scavenger-pathway

- **Original source:** [Reactome R-HSA-2187266 — SCARA5 binds ligands](https://reactome.org/content/detail/R-HSA-2187266)
- **Source record:** source-reactome-scara5-binding
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** Species, Locations in the PathwayBrowser, Participants and Inferred From where present; parent R-HSA-2173782.

Reactome places SCARA5 in the human scavenger-receptor ligand-binding and uptake pathway.

Source-specific study context:

- **inferred from:** Mus musculus reaction
- **molecular context:** SCARA5 trimer, plasma membrane
- **organism:** Homo sapiens
- **study design:** Curated pathway annotation
- **upstream release:** Not recorded

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-24
- **Human reviewed:** false
- **Review rationale:** Targeted source locations inspected on 2026-10-24. Canonical identities, database inference and assay scope are retained separately. Raw figures, supplements and underlying data were not reviewed; independent scientific review remains a future milestone.

Evidence limitations:

- Database participation describes a broad human pathway, not an AD-specific effect or proof of receptor activity in an RNA-seq sample.
- The exact Reactome database release and record revision were not captured.
- The cited human reaction is explicitly inferred from a mouse reaction; its annotation is not direct experimental evidence in human brain.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-trem2-apoe-binding

**TREM2 protein → APOE protein · interacts\_with**

In Atagi et al.'s dot-blot assays, APOE2, APOE3 and APOE4 bound the human TREM2 extracellular domain fused to Fc.

**Summary:** Follow this protein interaction to inspect the separate cholesterol and DAP12 pathway annotations.

#### Claim context

- **assay:** Dot blot
- **binding condition:** Wild-type TREM2
- **experimental system:** Cell-free protein assay
- **immobilized partner:** TREM2-Fc on nitrocellulose
- **intervention:** Not recorded
- **ligand preparation:** Recombinant or astrocyte-derived APOE isoforms
- **organism:** Homo sapiens
- **outcome:** APOE binding to TREM2-Fc
- **population:** Not recorded
- **protein form:** Human TREM2 ectodomain–Fc fusion; APOE2, APOE3 and APOE4
- **study design:** Biochemical binding assay
- **tissue:** Not recorded
- **variant:** APOE2, APOE3 and APOE4; wild-type TREM2

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-23
- **Human reviewed:** false
- **Review rationale:** Original figure captions and bibliographic metadata inspected on PubMed, with partial PMC methods/introductory text. Full article methods, raw figure images and supplements were not reviewed; later full-text opens were blocked. Source check only.

#### Claim limitations

- Surface-based assays with fusion proteins do not establish binding kinetics, microglial signaling, or treatment benefit.
- Two findings from this paper are not independent studies.

#### Evidence: evidence-atagi-2015-binding

- **Original source:** [Apolipoprotein E Is a Ligand for Triggering Receptor Expressed on Myeloid Cells 2 (TREM2)](https://pubmed.ncbi.nlm.nih.gov/26374899/)
- **Source record:** source-atagi-2015
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** PubMed Figures, original Figure 1A–B caption; Figure 4A caption identifies the human TREM2 fusion construct. Caption text inspected, not raw figure images.

In Atagi et al.'s dot-blot assays, APOE2, APOE3 and APOE4 bound the human TREM2 extracellular domain fused to Fc.

Source-specific study context:

- **assay:** Dot blot
- **assay replicates:** 3
- **binding condition:** Wild-type TREM2
- **controls:** Human IgG-Fc and TREM1-Fc
- **experimental system:** Cell-free protein assay
- **immobilized partner:** TREM2-Fc on nitrocellulose
- **intervention:** Not recorded
- **ligand preparation:** Recombinant or astrocyte-derived APOE isoforms
- **organism:** Homo sapiens
- **outcome:** APOE binding to TREM2-Fc
- **population:** Not recorded
- **protein form:** Human TREM2 ectodomain–Fc fusion; APOE2, APOE3 and APOE4
- **replicate unit:** Independent dot blots in Figure 1B
- **sample size:** Not recorded
- **study design:** Biochemical binding assay
- **tissue:** Not recorded
- **variant:** APOE2, APOE3 and APOE4; wild-type TREM2

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-23
- **Human reviewed:** false
- **Review rationale:** Original figure captions and bibliographic metadata inspected on PubMed, with partial PMC methods/introductory text. Full article methods, raw figure images and supplements were not reviewed; later full-text opens were blocked. Source check only.

Evidence limitations:

- Surface-based assays with fusion proteins do not establish binding kinetics, microglial signaling, or treatment benefit.
- Two findings from this paper are not independent studies.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-trem2-dap12-binding

**TREM2 protein → DAP12 protein · interacts\_with**

Reactome records binding between human TREM2 and the DAP12 adaptor dimer.

**Summary:** Follow the cited record for the annotation and its source context.

#### Claim context

- **assertion type:** curated database annotation
- **organism:** Homo sapiens
- **protein state:** TREM2 and DAP12 dimer at the plasma membrane
- **record id:** R-HSA-210300

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-22
- **Human reviewed:** false
- **Review rationale:** Source record and stated locator checked. This draft preserves the scope of the database annotation; independent scientific review is a future milestone.

#### Claim limitations

- Curated binding assertion; the primary experiment was not re-extracted in this pass.
- Record page accessed 2026-10-22; database release and record revision not captured
- Database annotations are not independent experimental replication or evidence of treatment benefit.

#### Evidence: evidence-trem2-dap12-binding

- **Original source:** [Interaction of DAP12 and TREM2](https://reactome.org/content/detail/R-HSA-210300)
- **Source record:** source-reactome-trem2-dap12
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** Reactome R-HSA-210300 Participants: TREM2 and DAP12 dimer inputs, DAP12 dimer:TREM2 output.

Reactome records binding between human TREM2 and the DAP12 adaptor dimer.

Source-specific study context:

- **assertion type:** curated database annotation
- **design:** database annotation
- **organism:** Homo sapiens
- **protein state:** TREM2 and DAP12 dimer at the plasma membrane
- **record id:** R-HSA-210300
- **sample size:** Not recorded

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-22
- **Human reviewed:** false
- **Review rationale:** Source record and stated locator checked. This draft preserves the scope of the database annotation; independent scientific review is a future milestone.

Evidence limitations:

- Curated binding assertion; the primary experiment was not re-extracted in this pass.
- Record page accessed 2026-10-22; database release and record revision not captured
- Database annotations are not independent experimental replication or evidence of treatment benefit.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-trem2-dap12-pathway

**TREM2 protein → DAP12 signaling · participates\_in**

Reactome includes TREM2 protein in its human DAP12 signaling pathway.

**Summary:** Follow the cited record for the annotation and its source context.

#### Claim context

- **assertion type:** curated database annotation
- **organism:** Homo sapiens
- **pathway id:** R-HSA-2424491
- **protein state:** TREM2 in DAP12-receptor signaling complexes

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-22
- **Human reviewed:** false
- **Review rationale:** Source record and stated locator checked. This draft preserves the scope of the database annotation; independent scientific review is a future milestone.

#### Claim limitations

- The annotation concerns specified protein states and complexes, not all possible protein activities.
- Record page accessed 2026-10-22; database release and record revision not captured
- Database annotations are not independent experimental replication or evidence of treatment benefit.

#### Evidence: evidence-trem2-dap12-pathway

- **Original source:** [TREM2 \[plasma membrane\]](https://reactome.org/content/detail/R-HSA-197664)
- **Source record:** source-reactome-trem2-protein
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** Reactome Locations in the PathwayBrowser: Innate Immune System → DAP12 interactions → DAP12 signaling.

Reactome includes TREM2 protein in its human DAP12 signaling pathway.

Source-specific study context:

- **assertion type:** curated database annotation
- **design:** database annotation
- **organism:** Homo sapiens
- **pathway id:** R-HSA-2424491
- **protein state:** TREM2 in DAP12-receptor signaling complexes
- **sample size:** Not recorded

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-22
- **Human reviewed:** false
- **Review rationale:** Source record and stated locator checked. This draft preserves the scope of the database annotation; independent scientific review is a future milestone.

Evidence limitations:

- The annotation concerns specified protein states and complexes, not all possible protein activities.
- Record page accessed 2026-10-22; database release and record revision not captured
- Database annotations are not independent experimental replication or evidence of treatment benefit.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-trem2-encodes

**TREM2 → TREM2 protein · encodes**

The human TREM2 gene encodes Triggering receptor expressed on myeloid cells 2 (Q9NZC2).

**Summary:** Follow the cited record for the annotation and its source context.

#### Claim context

- **assertion type:** curated database annotation
- **gene id:** 54209
- **organism:** Homo sapiens
- **protein accession:** Q9NZC2

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-22
- **Human reviewed:** false
- **Review rationale:** Source record and stated locator checked. This draft preserves the scope of the database annotation; independent scientific review is a future milestone.

#### Claim limitations

- Canonical gene-product mapping; isoforms and post-translational states are not separate nodes.
- Database annotations are not independent experimental replication or evidence of treatment benefit.

#### Evidence: evidence-trem2-encodes

- **Original source:** [UniProtKB Q9NZC2 — Triggering receptor expressed on myeloid cells 2](https://rest.uniprot.org/uniprotkb/Q9NZC2.txt)
- **Source record:** source-uniprot-trem2
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** UniProtKB ID/AC, gene name (GN), organism (OS), GeneID cross-reference (DR), and entry-version (DT) fields.

The human TREM2 gene encodes Triggering receptor expressed on myeloid cells 2 (Q9NZC2).

Source-specific study context:

- **assertion type:** curated database annotation
- **design:** database annotation
- **gene id:** 54209
- **organism:** Homo sapiens
- **protein accession:** Q9NZC2
- **sample size:** Not recorded

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-22
- **Human reviewed:** false
- **Review rationale:** Source record and stated locator checked. This draft preserves the scope of the database annotation; independent scientific review is a future milestone.

Evidence limitations:

- Canonical gene-product mapping; isoforms and post-translational states are not separate nodes.
- Database annotations are not independent experimental replication or evidence of treatment benefit.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-trem2-r47h-apoe-binding

**TREM2 protein → APOE protein · interacts\_with**

In Atagi et al.'s dot-blot and solid-phase assays, human TREM2 R47H-Fc showed less APOE binding than the wild-type fusion.

**Summary:** Compare this assay result with the baseline binding finding or the separate human genetic association.

#### Claim context

- **assay:** Dot blot and solid-phase binding
- **binding condition:** R47H versus wild type
- **experimental system:** Cell-free protein assay
- **immobilized partner:** TREM2-Fc in dot blots; APOE on solid-phase plates
- **intervention:** Not recorded
- **ligand preparation:** Not recorded
- **organism:** Homo sapiens
- **outcome:** APOE binding to TREM2-Fc
- **population:** Not recorded
- **protein form:** Human TREM2-Fc or R47H-Fc; APOE2, APOE3 and APOE4
- **study design:** Biochemical binding assay
- **tissue:** Not recorded
- **variant:** TREM2 R47H versus wild type; APOE2, APOE3 and APOE4

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-23
- **Human reviewed:** false
- **Review rationale:** Original figure captions and bibliographic metadata inspected on PubMed, with partial PMC methods/introductory text. Full article methods, raw figure images and supplements were not reviewed; later full-text opens were blocked. Source check only.

#### Claim limitations

- Surface-based assays with fusion proteins do not establish binding kinetics, microglial signaling, or treatment benefit.
- Two findings from this paper are not independent studies.

#### Evidence: evidence-atagi-2015-r47h-binding

- **Original source:** [Apolipoprotein E Is a Ligand for Triggering Receptor Expressed on Myeloid Cells 2 (TREM2)](https://pubmed.ncbi.nlm.nih.gov/26374899/)
- **Source record:** source-atagi-2015
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** PubMed Figures, original Figure 4A and Figure 5A–G captions: human constructs, loading/background controls and isoform-specific assays. Caption text inspected, not raw figure images.

In Atagi et al.'s dot-blot and solid-phase assays, human TREM2 R47H-Fc showed less APOE binding than the wild-type fusion.

Source-specific study context:

- **assay:** Dot blot and solid-phase binding
- **assay replicates:** 3
- **binding condition:** R47H versus wild type
- **controls:** Anti-Fc loading control for dot blots; uncoated wells for solid-phase assays
- **experimental system:** Cell-free protein assay
- **immobilized partner:** TREM2-Fc in dot blots; APOE on solid-phase plates
- **intervention:** Not recorded
- **ligand preparation:** Not recorded
- **organism:** Homo sapiens
- **outcome:** APOE binding to TREM2-Fc
- **population:** Not recorded
- **protein form:** Human TREM2-Fc or R47H-Fc; APOE2, APOE3 and APOE4
- **replicate unit:** Figure 5 reports n = 3 per assay panel; replicate independence not resolved
- **sample size:** Not recorded
- **study design:** Biochemical binding assay
- **tissue:** Not recorded
- **variant:** TREM2 R47H versus wild type; APOE2, APOE3 and APOE4

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-23
- **Human reviewed:** false
- **Review rationale:** Original figure captions and bibliographic metadata inspected on PubMed, with partial PMC methods/introductory text. Full article methods, raw figure images and supplements were not reviewed; later full-text opens were blocked. Source check only.

Evidence limitations:

- Surface-based assays with fusion proteins do not establish binding kinetics, microglial signaling, or treatment benefit.
- Two findings from this paper are not independent studies.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-trem2-r47h-risk

**TREM2 → Alzheimer's disease · associated\_with**

A 2013 study associated the rare TREM2 rs75932628-T variant, predicted to produce R47H, with Alzheimer's disease in Iceland and replication samples.

**Summary:** The association concerns a specific rare variant; a proposed inflammatory mechanism was not demonstrated by this association alone.

#### Claim context

- **intervention:** Not recorded
- **organism:** Homo sapiens
- **outcome:** Alzheimer's disease odds
- **population:** Icelandic discovery and US, Norwegian, Dutch, and German replication samples
- **study design:** Sequencing, imputation, and case-control replication
- **variant:** rs75932628-T; predicted R47H substitution

#### Claim review record

- **Review status:** draft
- **Reviewer:** Not recorded
- **Review date:** Not recorded
- **Human reviewed:** Not recorded
- **Review rationale:** AI-assisted abstract lookup only. Independent scientific review, reuse assessment, and correction/retraction checks are pending.

#### Claim limitations

- The sampled populations and rare-variant analysis limit generalization. Association does not establish a mechanism or therapeutic effect.

#### Evidence: evidence-trem2-jonsson-2013

- **Original source:** [Variant of TREM2 associated with the risk of Alzheimer's disease](https://pubmed.ncbi.nlm.nih.gov/23150908/)
- **Source record:** source-jonsson-2013
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** PubMed abstract, Methods and Results, PMID 23150908

The abstract reports an rs75932628-T association in the Icelandic analysis and in combined discovery and replication samples.

Source-specific study context:

- **intervention:** Not recorded
- **organism:** Homo sapiens
- **outcome:** Alzheimer's disease odds
- **population:** Icelandic discovery; replication in the United States, Norway, the Netherlands, and Germany
- **sample size:** Not recorded
- **sequenced discovery individuals:** 2261
- **study design:** Sequencing, imputation, and case-control replication
- **tissue:** Not recorded
- **variant:** rs75932628-T; predicted R47H substitution

Evidence review record:

- **Review status:** draft
- **Reviewer:** Not recorded
- **Review date:** Not recorded
- **Human reviewed:** Not recorded
- **Review rationale:** AI-assisted abstract lookup only. Independent scientific review, reuse assessment, and correction/retraction checks are pending.

Evidence limitations:

- Only the abstract and metadata were inspected. The 2,261 sequenced individuals are not the total case-control sample size.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-tyrobp-dap12-pathway

**DAP12 protein → DAP12 signaling · participates\_in**

Reactome includes DAP12 protein in its human DAP12 signaling pathway.

**Summary:** Follow the cited record for the annotation and its source context.

#### Claim context

- **assertion type:** curated database annotation
- **organism:** Homo sapiens
- **pathway id:** R-HSA-2424491
- **protein state:** TYROBP phosphorylated at Y91/Y102 in membrane signaling complexes

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-22
- **Human reviewed:** false
- **Review rationale:** Source record and stated locator checked. This draft preserves the scope of the database annotation; independent scientific review is a future milestone.

#### Claim limitations

- The annotation concerns specified protein states and complexes, not all possible protein activities.
- Record page accessed 2026-10-22; database release and record revision not captured
- Database annotations are not independent experimental replication or evidence of treatment benefit.

#### Evidence: evidence-tyrobp-dap12-pathway

- **Original source:** [p-Y91,Y102-TYROBP \[plasma membrane\]](https://reactome.org/content/detail/R-HSA-210010)
- **Source record:** source-reactome-tyrobp-state
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** Reactome Locations in the PathwayBrowser: Innate Immune System → DAP12 interactions → DAP12 signaling.

Reactome includes DAP12 protein in its human DAP12 signaling pathway.

Source-specific study context:

- **assertion type:** curated database annotation
- **design:** database annotation
- **organism:** Homo sapiens
- **pathway id:** R-HSA-2424491
- **protein state:** TYROBP phosphorylated at Y91/Y102 in membrane signaling complexes
- **sample size:** Not recorded

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-22
- **Human reviewed:** false
- **Review rationale:** Source record and stated locator checked. This draft preserves the scope of the database annotation; independent scientific review is a future milestone.

Evidence limitations:

- The annotation concerns specified protein states and complexes, not all possible protein activities.
- Record page accessed 2026-10-22; database release and record revision not captured
- Database annotations are not independent experimental replication or evidence of treatment benefit.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

### claim-tyrobp-encodes

**TYROBP → DAP12 protein · encodes**

The human TYROBP gene encodes TYRO protein tyrosine kinase-binding protein (O43914).

**Summary:** Follow the cited record for the annotation and its source context.

#### Claim context

- **assertion type:** curated database annotation
- **gene id:** 7305
- **organism:** Homo sapiens
- **protein accession:** O43914

#### Claim review record

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-22
- **Human reviewed:** false
- **Review rationale:** Source record and stated locator checked. This draft preserves the scope of the database annotation; independent scientific review is a future milestone.

#### Claim limitations

- Canonical gene-product mapping; isoforms and post-translational states are not separate nodes.
- Database annotations are not independent experimental replication or evidence of treatment benefit.

#### Evidence: evidence-tyrobp-encodes

- **Original source:** [UniProtKB O43914 — TYRO protein tyrosine kinase-binding protein](https://rest.uniprot.org/uniprotkb/O43914.txt)
- **Source record:** source-uniprot-tyrobp
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** UniProtKB ID/AC, gene name (GN), organism (OS), GeneID cross-reference (DR), and entry-version (DT) fields.

The human TYROBP gene encodes TYRO protein tyrosine kinase-binding protein (O43914).

Source-specific study context:

- **assertion type:** curated database annotation
- **design:** database annotation
- **gene id:** 7305
- **organism:** Homo sapiens
- **protein accession:** O43914
- **sample size:** Not recorded

Evidence review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-22
- **Human reviewed:** false
- **Review rationale:** Source record and stated locator checked. This draft preserves the scope of the database annotation; independent scientific review is a future milestone.

Evidence limitations:

- Canonical gene-product mapping; isoforms and post-translational states are not separate nodes.
- Database annotations are not independent experimental replication or evidence of treatment benefit.

#### Pending review tasks

- [ ] Inspect the original source and verify the claim, variant, endpoints, population, and recorded locator.
- [ ] Assess study limitations, cohort overlap, independence, and comparability with other findings.
- [ ] Check source reuse terms, attribution, and correction/retraction status.
- [ ] Record an actual human scientific review in the source claim and evidence records; keep unresolved checks pending.

## Study-context comparisons

### conflict-r47h-binding-context

**Different R47H binding results**

Atagi 2015 reported reduced R47H binding in dot-blot and solid-phase assays. Lessard 2018 reported no statistically significant APOE3 affinity difference in biolayer interferometry. The protein/variant question overlaps, but preparations and readouts differ; these reports do not establish one assay-independent R47H effect.

- **Compared claims:** claim-trem2-r47h-apoe-binding; claim-lessard-trem2-r47h-apoe3-binding

Compared evidence:

- evidence-atagi-2015-r47h-binding: [Apolipoprotein E Is a Ligand for Triggering Receptor Expressed on Myeloid Cells 2 (TREM2)](https://pubmed.ncbi.nlm.nih.gov/26374899/); inspected location: PubMed Figures, original Figure 4A and Figure 5A–G captions: human constructs, loading/background controls and isoform-specific assays. Caption text inspected, not raw figure images.
- evidence-lessard-2018-apoe3-binding: [High-affinity interactions and signal transduction between Aβ oligomers and TREM2](https://link.springer.com/article/10.15252/emmm.201809027); inspected location: Publisher Results paragraph on APOE3/APOE4 affinities adjacent to Figure 2C; Figure 2C caption; Materials and Methods: BioLayer interferometry; Discussion comparison with Atagi/Bailey. Article text and captions inspected, not numerical figure images or appendices.

Context differences and limits:

- Readout: Atagi measured membrane/plate binding signals; Lessard fitted association/dissociation curves.
- Preparation: the Atagi Figure 5 preparation is unresolved here; Lessard used lipidated recombinant APOE3.
- Construct: Atagi used human TREM2-Fc; Lessard used an IgG4 Fc–V5 fusion on Protein A biosensors.
- The difference does not demonstrate that lipidation, construct or assay format caused the different result; a non-significant result is not an equivalence test.

Comparison review record:

- **Review status:** draft
- **Reviewer:** Discovery Galaxy source check (AI)
- **Review date:** 2026-10-23
- **Human reviewed:** false
- **Review rationale:** The two scoped findings, named locators and methodological distinctions were source-checked. Lessard explicitly discusses differences from earlier binding reports. This draft is a contextual comparison, not a definitive contradiction, causal explanation or independent scientific approval.

## Source records and outstanding checks

### source-atagi-2015

[Apolipoprotein E Is a Ligand for Triggering Receptor Expressed on Myeloid Cells 2 (TREM2)](https://pubmed.ncbi.nlm.nih.gov/26374899/)

- **Kind:** publication
- **Identifiers:** PMID: 26374899; DOI: 10.1074/jbc.M115.679043; PMCID: PMC4646257
- **Authors:** Yuka Atagi; Chia-Chen Liu; Meghan M Painter; Xiao-Fen Chen; Christophe Verbeeck; Honghua Zheng; Xia Li; Rosa Rademakers; Silvia S Kang; Huaxi Xu; Steven Younkin; Pritam Das; John D Fryer; Guojun Bu
- **Year / publication type:** 2015 / primary\_research
- **Provider / release:** Not recorded / Not recorded
- **Retrieved:** 2026-10-23
- **Reuse permission status:** pending\_review
- **Reuse terms:** https://pmc.ncbi.nlm.nih.gov/about/copyright/
- **Reuse checked:** 2026-10-23
- **Attribution:** Atagi and colleagues, Journal of Biological Chemistry, 2015; bibliographic facts and original figure captions inspected via PubMed/NLM. © 2015 American Society for Biochemistry and Molecular Biology.
- **Retained content:** Bibliographic facts, links and short project-authored paraphrases only; no abstract, caption text, article body or figures redistributed. NCBI policy and PMC copyright notice inspected; publisher-specific reuse remains unresolved.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-bailey-2015

[The Triggering Receptor Expressed on Myeloid Cells 2 Binds Apolipoprotein E](https://pubmed.ncbi.nlm.nih.gov/26374897/)

- **Kind:** publication
- **Identifiers:** PMID: 26374897; DOI: 10.1074/jbc.M115.677286; PMCID: PMC4646256
- **Authors:** Charles C Bailey; Lindsey B DeVaux; Michael Farzan
- **Year / publication type:** 2015 / primary\_research
- **Provider / release:** Not recorded / Not recorded
- **Retrieved:** 2026-10-23
- **Reuse permission status:** pending\_review
- **Reuse terms:** https://pmc.ncbi.nlm.nih.gov/about/copyright/
- **Reuse checked:** 2026-10-23
- **Attribution:** Bailey, DeVaux and Farzan, Journal of Biological Chemistry, 2015; publication metadata and figure captions via PubMed/NLM. © 2015 American Society for Biochemistry and Molecular Biology.
- **Retained content:** Bibliographic facts, links and short project-authored paraphrases only. NCBI policies and PMC copyright notice inspected; no article prose, captions, figures or full-text payload retained. Publisher-specific reuse remains unresolved.
- **Publication status:** corrected
- **Publication status checked:** 2026-10-23
- **Notice URL:** https://pmc.ncbi.nlm.nih.gov/articles/PMC4646256/

### source-cheng-2021

[Recognition of lipoproteins by scavenger receptor class A members](https://pmc.ncbi.nlm.nih.gov/articles/PMC8353498/)

- **Kind:** publication
- **Identifiers:** PMID: 34252459; DOI: 10.1016/j.jbc.2021.100948; PMCID: PMC8353498
- **Authors:** Chen Cheng; Enlin Zheng; Bowen Yu; Ze Zhang; Yuanyuan Wang; Yingbin Liu; Yongning He
- **Year / publication type:** 2021 / primary\_research
- **Provider / release:** PubMed Central / Not recorded
- **Retrieved:** 2026-10-24
- **Reuse permission status:** pending\_review
- **Reuse terms:** https://creativecommons.org/licenses/by-nc-nd/4.0/
- **Reuse checked:** 2026-10-24
- **Attribution:** Cheng, Zheng, Yu, Zhang, Wang, Liu and He, Journal of Biological Chemistry, 2021, DOI 10.1016/j.jbc.2021.100948. Article notice: © 2021 The Authors, CC BY-NC-ND 4.0. Retained material is limited to bibliographic facts and project-authored factual paraphrases; no article prose, image, table or full text is redistributed. Article-specific reuse review remains pending.
- **Retained content:** Bibliographic facts, identifiers, links and short project-authored factual summaries only; no article text, figures, tables, sequences or full-text payloads.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-corder-1993

[Gene dose of apolipoprotein E type 4 allele and the risk of Alzheimer's disease in late onset families](https://pubmed.ncbi.nlm.nih.gov/8346443/)

- **Kind:** publication
- **Identifiers:** PMID: 8346443; DOI: 10.1126/science.8346443
- **Authors:** E H Corder; A M Saunders; W J Strittmatter; D E Schmechel; P C Gaskell; G W Small; A D Roses; J L Haines; M A Pericak-Vance
- **Year / publication type:** 1993 / primary\_research
- **Provider / release:** Not recorded / Not recorded
- **Retrieved:** 2026-10-20
- **Reuse permission status:** pending\_review
- **Reuse terms:** https://www.ncbi.nlm.nih.gov/home/about/policies/
- **Reuse checked:** 2026-10-20
- **Attribution:** Corder and colleagues, Science, 1993; bibliographic metadata via PubMed/NLM.
- **Retained content:** Bibliographic facts, source links, and project-authored paraphrases only; no abstract or full-text excerpts.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-corder-1994

[Protective effect of apolipoprotein E type 2 allele for late onset Alzheimer disease](https://pubmed.ncbi.nlm.nih.gov/7920638/)

- **Kind:** publication
- **Identifiers:** PMID: 7920638; DOI: 10.1038/ng0694-180
- **Authors:** E H Corder; A M Saunders; N J Risch; W J Strittmatter; D E Schmechel; P C Gaskell Jr; J B Rimmler; P A Locke; P M Conneally; K E Schmader; G W Small; A D Roses; J L Haines; M A Pericak-Vance
- **Year / publication type:** 1994 / primary\_research
- **Provider / release:** Not recorded / Not recorded
- **Retrieved:** 2026-10-20
- **Reuse permission status:** pending\_review
- **Reuse terms:** https://www.nature.com/nature-portfolio/about/permissions
- **Reuse checked:** Not recorded
- **Attribution:** Corder and colleagues, Nature Genetics, 1994.
- **Retained content:** Bibliographic facts, source links, and project-authored paraphrases only; no abstract or full-text excerpts.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-ensembl-abca1-orthology

[Ensembl Compara: mouse/human ABCA1 orthology](https://rest.ensembl.org/homology/symbol/mus_musculus/Abca1?target_species=homo_sapiens&type=orthologues&content-type=application/json)

- **Kind:** database\_record
- **Identifiers:** Ensembl: ENSMUSG00000015243; Ensembl: ENSG00000165029
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** Ensembl Compara / Live orthology response; release not captured; response SHA-256 6381d49c359b56e46463d14a760425f2c412b3ead78f913ed74394a3371fb72c
- **Retrieved:** 2026-11-05T11:16:56.610773Z
- **Reuse permission status:** pending\_review
- **Reuse terms:** https://www.ensembl.org/info/about/legal/disclaimer.html
- **Reuse checked:** Not recorded
- **Attribution:** Ensembl Compara. One-to-one gene orthology annotation and identifier/taxon facts only; no alignment or sequence retained. Terms page returned403; exact reuse review remains pending.
- **Retained content:** Identifiers, bibliographic facts and project-authored factual summaries only; no source prose, sequences, alignments, article text, figures or raw provider payloads are distributed.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-ensembl-apoe-orthology

[Ensembl Compara: mouse/human APOE orthology](https://rest.ensembl.org/homology/symbol/mus_musculus/Apoe?target_species=homo_sapiens&type=orthologues&content-type=application/json)

- **Kind:** database\_record
- **Identifiers:** Ensembl: ENSMUSG00000002985; Ensembl: ENSG00000130203
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** Ensembl Compara / Live orthology response; release not captured; response SHA-256 28c20dce5e98a352b0aa5b41194e1aedb3fd1b0a68238c6b7620ddc2aca69ea6
- **Retrieved:** 2026-11-05T11:16:53.940108Z
- **Reuse permission status:** pending\_review
- **Reuse terms:** https://www.ensembl.org/info/about/legal/disclaimer.html
- **Reuse checked:** Not recorded
- **Attribution:** Ensembl Compara. One-to-one gene orthology annotation and identifier/taxon facts only; no alignment or sequence retained. Terms page returned403; exact reuse review remains pending.
- **Retained content:** Identifiers, bibliographic facts and project-authored factual summaries only; no source prose, sequences, alignments, article text, figures or raw provider payloads are distributed.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-hgnc-coverage-identities

[HGNC approved COL1A1, COL1A2, COL3A1 and SAA1 gene/product cross-references (pinned mirror)](https://raw.githubusercontent.com/MargoSolo/gene-tidy/37b375b4e4f70445cbb9e40b273a510467b798ae/src/gene_tidy/data/hgnc_complete_set.tsv.gz)

- **Kind:** database\_record
- **Identifiers:** SHA-256: 6bb2951c56204cd7b387c4e40b8d46107f6bdc422e77b8e4f2088a5d39e1be4b
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** HGNC (pinned mirror) / gene-tidy mirror commit 37b375b4e4f70445cbb9e40b273a510467b798ae; original HGNC release/date not independently verified
- **Retrieved:** 2026-10-24
- **Reuse permission status:** permitted
- **Reuse terms:** https://www.genenames.org/about/
- **Reuse checked:** 2026-10-24
- **Attribution:** HUGO Gene Nomenclature Committee at the University of Cambridge, HGNC (RRID:SCR\_002827), https://www.genenames.org/. Approved symbols and cross-references from the same verified pinned archive used by the identifier reference; no gene-tidy software copied.
- **Retained content:** Approved identity facts, stable cross-references and short project-authored locators/summaries only; no sequence, protein-function prose, software or article content.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-hgnc-scavenger-identities

[HGNC approved MARCO, SCARA5 and APOB gene/product cross-references (pinned mirror)](https://raw.githubusercontent.com/MargoSolo/gene-tidy/37b375b4e4f70445cbb9e40b273a510467b798ae/src/gene_tidy/data/hgnc_complete_set.tsv.gz)

- **Kind:** database\_record
- **Identifiers:** SHA-256: 6bb2951c56204cd7b387c4e40b8d46107f6bdc422e77b8e4f2088a5d39e1be4b
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** HGNC (pinned mirror) / gene-tidy mirror commit 37b375b4e4f70445cbb9e40b273a510467b798ae; original HGNC release/date not independently verified
- **Retrieved:** 2026-10-24
- **Reuse permission status:** permitted
- **Reuse terms:** https://www.genenames.org/about/
- **Reuse checked:** 2026-10-24
- **Attribution:** HUGO Gene Nomenclature Committee at the University of Cambridge, HGNC (RRID:SCR\_002827), https://www.genenames.org/. Approved symbols and cross-references from the same verified pinned archive used by the identifier reference; no gene-tidy software copied.
- **Retained content:** Bibliographic facts, identifiers, links and short project-authored factual summaries only; no article text, figures, tables, sequences or full-text payloads.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-hirsch-reinshagen-2005

[The Absence of ABCA1 Decreases Soluble ApoE Levels but Does Not Diminish Amyloid Deposition in Two Murine Models of Alzheimer Disease](https://doi.org/10.1074/jbc.M508781200)

- **Kind:** publication
- **Identifiers:** DOI: 10.1074/jbc.M508781200; PMID: 16207707; OpenAlex: W2151049459
- **Authors:** Veronica Hirsch-Reinshagen; Luis F. Maia; Braydon L. Burgess; Jean-Francois Blain; Kathryn E. Naus; Sean A. McIsaac; Pamela F. Parkinson; Jennifer Y. Chan; Gavin H. Tansley; Michael R. Hayden; Judes Poirier; William Van Nostrand; Cheryl L. Wellington
- **Year / publication type:** 2005 / primary\_research
- **Provider / release:** Journal of Biological Chemistry / Not recorded
- **Retrieved:** 2026-11-05
- **Reuse permission status:** permitted
- **Reuse terms:** https://creativecommons.org/licenses/by/4.0/
- **Reuse checked:** 2026-11-05
- **Attribution:** Veronica Hirsch-Reinshagen and colleagues, Journal of Biological Chemistry (2005), DOI 10.1074/jbc.M508781200. Publisher-deposited Crossref VOR metadata reports CC BY4.0 effective 2020-10-02; original archived PDF retains historical ASBMB copyright. Project-authored factual paraphrases of inspected results/methods only; no article text/figures redistributed.
- **Retained content:** Identifiers, bibliographic facts and project-authored factual summaries only; no source prose, sequences, alignments, article text, figures or raw provider payloads are distributed.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-jonsson-2013

[Variant of TREM2 associated with the risk of Alzheimer's disease](https://pubmed.ncbi.nlm.nih.gov/23150908/)

- **Kind:** publication
- **Identifiers:** PMID: 23150908; DOI: 10.1056/NEJMoa1211103
- **Authors:** Thorlakur Jonsson; Hreinn Stefansson; Stacy Steinberg; Ingileif Jonsdottir; Palmi V Jonsson; Jon Snaedal; Sigurbjorn Bjornsson; Johanna Huttenlocher; Allan I Levey; James J Lah; Dan Rujescu; Harald Hampel; Ina Giegling; Ole A Andreassen; Knut Engedal; Ingun Ulstein; Srdjan Djurovic; Carla Ibrahim-Verbaas; Albert Hofman; M Arfan Ikram; Cornelia M van Duijn; Unnur Thorsteinsdottir; Augustine Kong; Kari Stefansson
- **Year / publication type:** 2013 / primary\_research
- **Provider / release:** Not recorded / Not recorded
- **Retrieved:** 2026-10-20
- **Reuse permission status:** pending\_review
- **Reuse terms:** https://www.ncbi.nlm.nih.gov/home/about/policies/
- **Reuse checked:** 2026-10-20
- **Attribution:** Jonsson and colleagues, New England Journal of Medicine, 2013; bibliographic metadata via PubMed/NLM.
- **Retained content:** Bibliographic facts, source links, and project-authored paraphrases only; no abstract or full-text excerpts.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-lessard-2018

[High-affinity interactions and signal transduction between Aβ oligomers and TREM2](https://link.springer.com/article/10.15252/emmm.201809027)

- **Kind:** publication
- **Identifiers:** PMID: 30341064; DOI: 10.15252/emmm.201809027; PMCID: PMC6220267
- **Authors:** Christian B Lessard; Samuel L Malnik; Yingyue Zhou; Thomas B Ladd; Pedro E Cruz; Yong Ran; Thomas E Mahan; Paramita Chakrabaty; David M Holtzman; Jason D Ulrich; Marco Colonna; Todd E Golde
- **Year / publication type:** 2018 / primary\_research
- **Provider / release:** Not recorded / Not recorded
- **Retrieved:** 2026-10-23
- **Reuse permission status:** permitted
- **Reuse terms:** https://creativecommons.org/licenses/by/4.0/
- **Reuse checked:** 2026-10-23
- **Attribution:** Lessard and colleagues, EMBO Molecular Medicine, 2018, doi:10.15252/emmm.201809027. © The Authors; CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Project-authored paraphrases, not source text.
- **Retained content:** Bibliographic facts, source links and project-authored paraphrases only; no article prose, figures, tables or raw payloads retained. Publisher Rights and permissions and CC BY 4.0 terms inspected on the check date.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-mesh-alzheimers

[Alzheimer Disease — MeSH D000544](https://id.nlm.nih.gov/mesh/D000544.html)

- **Kind:** database\_record
- **Identifiers:** MeSH: D000544
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** NLM MeSH / Accessed 2026-10-20; no MeSH release version captured
- **Retrieved:** 2026-10-20
- **Reuse permission status:** pending\_review
- **Reuse terms:** https://www.ncbi.nlm.nih.gov/home/about/policies/
- **Reuse checked:** 2026-10-20
- **Attribution:** Medical Subject Headings, National Library of Medicine.
- **Retained content:** Disease label, identifier, selected search aliases, and source URL only.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-mondo-alzheimers-mesh

[Mondo Alzheimer disease: exact MeSH cross-reference](https://www.ebi.ac.uk/ols4/api/ontologies/mondo/terms?obo_id=MONDO:0004975)

- **Kind:** database\_record
- **Identifiers:** MONDO: MONDO\_0004975; MeSH: D000544
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** Mondo via EMBL-EBI OLS / OLS ontology config reports Mondo2026-11-03; term response SHA-256 fe11f19846657fb2a3093ee124e1b1087cb757898ae45cf4606f9a60b9625588
- **Retrieved:** 2026-11-05T11:22:04.457097Z
- **Reuse permission status:** pending\_review
- **Reuse terms:** https://mondo.monarchinitiative.org/
- **Reuse checked:** Not recorded
- **Attribution:** Mondo Disease Ontology via EMBL-EBI OLS. Identifier equivalence only; no disease definition text retained.
- **Retained content:** Identifiers, bibliographic facts and project-authored factual summaries only; no source prose, sequences, alignments, article text, figures or raw provider payloads are distributed.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-ncbi-abca1

[ABCA1 ATP binding cassette subfamily A member 1 \[Homo sapiens (human)\]](https://www.ncbi.nlm.nih.gov/gene/19)

- **Kind:** database\_record
- **Identifiers:** NCBIGene: 19
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** NCBI Gene / Accessed 2026-10-20; no database release version captured
- **Retrieved:** 2026-10-20
- **Reuse permission status:** pending\_review
- **Reuse terms:** https://www.ncbi.nlm.nih.gov/home/about/policies/
- **Reuse checked:** 2026-10-20
- **Attribution:** National Center for Biotechnology Information, National Library of Medicine.
- **Retained content:** Gene identifier, official symbol, name, organism, and source URL only.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-ncbi-apoe

[APOE apolipoprotein E \[Homo sapiens (human)\]](https://www.ncbi.nlm.nih.gov/gene/348)

- **Kind:** database\_record
- **Identifiers:** NCBIGene: 348
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** NCBI Gene / Accessed 2026-10-20; no database release version captured
- **Retrieved:** 2026-10-20
- **Reuse permission status:** pending\_review
- **Reuse terms:** https://www.ncbi.nlm.nih.gov/home/about/policies/
- **Reuse checked:** 2026-10-20
- **Attribution:** National Center for Biotechnology Information, National Library of Medicine.
- **Retained content:** Gene identifier, official symbol, name, organism, and source URL only.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-ncbi-mouse-abca1-apoe

[NCBI Gene: mouse Abca1 and Apoe identities](https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=gene&id=11303,11816&retmode=json)

- **Kind:** database\_record
- **Identifiers:** NCBIGene: 11303; NCBIGene: 11816
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** NCBI Gene / Live ESummary; database release unknown; response SHA-256 f13d4d087745a35638abdbfdedf7b7fcc47d1ac158690149ee5af045c10f9e80
- **Retrieved:** 2026-11-05T11:16:48.866950Z
- **Reuse permission status:** permitted
- **Reuse terms:** https://www.ncbi.nlm.nih.gov/home/about/policies/
- **Reuse checked:** 2026-11-05
- **Attribution:** NCBI Gene/National Library of Medicine. Gene identifiers, official symbols and organism facts only; no RefSeq prose retained.
- **Retained content:** Identifiers, bibliographic facts and project-authored factual summaries only; no source prose, sequences, alignments, article text, figures or raw provider payloads are distributed.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-ncbi-trem2

[TREM2 triggering receptor expressed on myeloid cells 2 \[Homo sapiens (human)\]](https://www.ncbi.nlm.nih.gov/gene/54209)

- **Kind:** database\_record
- **Identifiers:** NCBIGene: 54209
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** NCBI Gene / Accessed 2026-10-20; no database release version captured
- **Retrieved:** 2026-10-20
- **Reuse permission status:** pending\_review
- **Reuse terms:** https://www.ncbi.nlm.nih.gov/home/about/policies/
- **Reuse checked:** 2026-10-20
- **Attribution:** National Center for Biotechnology Information, National Library of Medicine.
- **Retained content:** Gene identifier, official symbol, name, organism, and source URL only.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-nordestgaard-2015

[Loss-of-function mutation in ABCA1 and risk of Alzheimer's disease and cerebrovascular disease](https://pubmed.ncbi.nlm.nih.gov/26079414/)

- **Kind:** publication
- **Identifiers:** PMID: 26079414; DOI: 10.1016/j.jalz.2015.04.006
- **Authors:** Liv Tybjærg Nordestgaard; Anne Tybjærg-Hansen; Børge G Nordestgaard; Ruth Frikke-Schmidt
- **Year / publication type:** 2015 / primary\_research
- **Provider / release:** Not recorded / Not recorded
- **Retrieved:** 2026-10-20
- **Reuse permission status:** pending\_review
- **Reuse terms:** https://onlinelibrary.wiley.com/terms-and-conditions
- **Reuse checked:** 2026-10-20
- **Attribution:** Nordestgaard and colleagues, Alzheimer's & Dementia, 2015.
- **Retained content:** Bibliographic facts, source links, and project-authored paraphrases only; no abstract or full-text excerpts.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-openalex-apoe-abca1-legacy

[OpenAlex: legacy Alzheimer/APOE/ABCA1 candidate metadata](https://api.openalex.org/works?search.title_and_abstract=Alzheimer+AND+%28APOE+OR+ABCA1%29&per_page=5&page=1&select=id%2Cids%2Cdoi%2Ctitle%2Cpublication_year%2Cpublication_date%2Ctype%2Cis_retracted%2Cupdated_date)

- **Kind:** database\_record
- **Identifiers:** OpenAlex: W2151049459
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** OpenAlex / Live API; schema0.1.0; raw response digest unavailable; saved packet SHA-256 867aab43d6cf3eeeb35654641dba9e4065bb094b3cc7b7bf8f8f4f5aa2ed626f; no immutable release
- **Retrieved:** 2026-11-04T23:56:45.327Z
- **Reuse permission status:** permitted
- **Reuse terms:** https://creativecommons.org/publicdomain/zero/1.0/
- **Reuse checked:** 2026-11-05
- **Attribution:** Bibliographic metadata from OpenAlex (OurResearch), CC0; article content has separate reuse terms.
- **Retained content:** Identifiers, bibliographic facts and project-authored factual summaries only; no source prose, sequences, alignments, article text, figures or raw provider payloads are distributed.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-openalex-apoe-abca1-live

[OpenAlex: ABCA1/APOE first-page literature metadata](https://api.openalex.org/works?search.title_and_abstract=ABCA1+AND+APOE&per_page=5&page=1&select=id%2Cids%2Cdoi%2Ctitle%2Cpublication_year%2Cpublication_date%2Ctype%2Cis_retracted%2Cupdated_date)

- **Kind:** database\_record
- **Identifiers:** OpenAlex: W2013111251
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** OpenAlex / Live API; schema0.2.0; page1 limit5; no immutable release; response SHA-256 1e3907e7f99d10cf4b97e77fda52532336bb61ac683549b2129e91a30da93033
- **Retrieved:** 2026-11-05T11:18:18.716Z
- **Reuse permission status:** permitted
- **Reuse terms:** https://creativecommons.org/publicdomain/zero/1.0/
- **Reuse checked:** 2026-11-05
- **Attribution:** Bibliographic metadata from OpenAlex (OurResearch), CC0; article content has separate reuse terms.
- **Retained content:** Identifiers, bibliographic facts and project-authored factual summaries only; no source prose, sequences, alignments, article text, figures or raw provider payloads are distributed.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-opentargets-abca1-direct-association

[Open Targets: ABCA1–Alzheimer disease direct association summary](https://platform.opentargets.org/target/ENSG00000165029/associations)

- **Kind:** database\_record
- **Identifiers:** Ensembl: ENSG00000165029; MONDO: MONDO\_0004975
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** Open Targets Platform / dataVersion 26.09 (year="26", month="09", iteration=null); first 20 direct rows of 1797; response SHA-256 39428ebc6794cd529fd7446fbb896d05827b39eb06d4eaf90a46e8c81912100c
- **Retrieved:** 2026-11-05T00:00:45.794Z
- **Reuse permission status:** permitted
- **Reuse terms:** https://platform-docs.opentargets.org/licence
- **Reuse checked:** 2026-11-05
- **Attribution:** Open Targets Platform. Direct target–disease association summaries with provider-defined scores.
- **Retained content:** Identifiers, bibliographic facts and project-authored factual summaries only; no source prose, sequences, alignments, article text, figures or raw provider payloads are distributed.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-opentargets-apoe-direct-association

[Open Targets: APOE–Alzheimer disease direct association summary](https://platform.opentargets.org/target/ENSG00000130203/associations)

- **Kind:** database\_record
- **Identifiers:** Ensembl: ENSG00000130203; MONDO: MONDO\_0004975
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** Open Targets Platform / dataVersion 26.09 (year="26", month="09", iteration=null); first 20 direct rows of 2836; response SHA-256 8dbb515c4d2f74956893b88d4c01770d041820ec5ddf3bb72d774b8e1a856ab2
- **Retrieved:** 2026-11-05T00:00:44.940Z
- **Reuse permission status:** permitted
- **Reuse terms:** https://platform-docs.opentargets.org/licence
- **Reuse checked:** 2026-11-05
- **Attribution:** Open Targets Platform. Direct target–disease association summaries with provider-defined scores.
- **Retained content:** Identifiers, bibliographic facts and project-authored factual summaries only; no source prose, sequences, alignments, article text, figures or raw provider payloads are distributed.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-reactome-abca1-live-mapping

[Reactome UniProt O95477 to human pathway mappings](https://reactome.org/ContentService/data/mapping/UniProt/O95477/pathways?species=9606)

- **Kind:** database\_record
- **Identifiers:** Reactome: R-HSA-9029569; UniProt: O95477
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** Reactome / Selected record R-HSA-9029569.2; global release unknown; response SHA-256 06aa17f8a26e14bf818df483ac21533d3c8fe62f85645e2019bf67a68c3b84d7
- **Retrieved:** 2026-11-05T00:00:46.412Z
- **Reuse permission status:** permitted
- **Reuse terms:** https://reactome.org/license
- **Reuse checked:** 2026-11-05
- **Attribution:** Reactome Pathway Database. Database identifier mappings, not original experimental findings.
- **Retained content:** Identifiers, bibliographic facts and project-authored factual summaries only; no source prose, sequences, alignments, article text, figures or raw provider payloads are distributed.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-reactome-abca1-protein

[ABCA1 \[plasma membrane\]](https://reactome.org/content/detail/R-HSA-194209)

- **Kind:** database\_record
- **Identifiers:** Reactome: R-HSA-194209
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** Reactome / Record page accessed 2026-10-22; database release and record revision not captured
- **Retrieved:** 2026-10-22
- **Reuse permission status:** permitted
- **Reuse terms:** https://reactome.org/license
- **Reuse checked:** 2026-10-22
- **Attribution:** Reactome Pathway Database; database data are CC0. Project-authored summaries; no Reactome artwork is retained.
- **Retained content:** Record identifiers, names, links and project-authored annotation summaries only; no source prose, sequences, figures or artwork.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-reactome-apob-scavenger

[Reactome R-HSA-2512789 — APOB(28-4563) \[endocytic vesicle lumen\]](https://reactome.org/content/detail/R-HSA-2512789)

- **Kind:** database\_record
- **Identifiers:** Reactome: R-HSA-2512789
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** Reactome / Accessed 2026-10-24; exact Reactome release and record revision not captured
- **Retrieved:** 2026-10-24
- **Reuse permission status:** permitted
- **Reuse terms:** https://reactome.org/license
- **Reuse checked:** 2026-10-24
- **Attribution:** Reactome Pathway Database, CC0 data. Identifiers, links and project-authored factual summaries only; no diagrams or source prose.
- **Retained content:** Bibliographic facts, identifiers, links and short project-authored factual summaries only; no article text, figures, tables, sequences or full-text payloads.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-reactome-apoe-expression

[Expression of APOE regulated by NR1H2 or NR1H3](https://reactome.org/content/detail/R-HSA-9031512)

- **Kind:** database\_record
- **Identifiers:** Reactome: R-HSA-9031512
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** Reactome / Record page accessed 2026-10-22; database release and record revision not captured
- **Retrieved:** 2026-10-22
- **Reuse permission status:** permitted
- **Reuse terms:** https://reactome.org/license
- **Reuse checked:** 2026-10-22
- **Attribution:** Reactome Pathway Database; database data are CC0. Project-authored summaries; no Reactome artwork is retained.
- **Retained content:** Record identifiers, names, links and project-authored annotation summaries only; no source prose, sequences, figures or artwork.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-reactome-apoe-live-mapping

[Reactome UniProt P02649 to human pathway mappings](https://reactome.org/ContentService/data/mapping/UniProt/P02649/pathways?species=9606)

- **Kind:** database\_record
- **Identifiers:** Reactome: R-HSA-9029569; UniProt: P02649
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** Reactome / Selected record R-HSA-9029569.2; global release unknown; response SHA-256 58e052001dd4c2b9f78902ef7b3e6dd895101a341dde0007239486ae7284b314
- **Retrieved:** 2026-11-05T00:00:45.508Z
- **Reuse permission status:** permitted
- **Reuse terms:** https://reactome.org/license
- **Reuse checked:** 2026-11-05
- **Attribution:** Reactome Pathway Database. Database identifier mappings, not original experimental findings.
- **Retained content:** Identifiers, bibliographic facts and project-authored factual summaries only; no source prose, sequences, alignments, article text, figures or raw provider payloads are distributed.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-reactome-apoe-scavenger

[Reactome R-HSA-3221641 — APOE \[endocytic vesicle lumen\]](https://reactome.org/content/detail/R-HSA-3221641)

- **Kind:** database\_record
- **Identifiers:** Reactome: R-HSA-3221641
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** Reactome / Accessed 2026-10-24; exact Reactome release and record revision not captured
- **Retrieved:** 2026-10-24
- **Reuse permission status:** permitted
- **Reuse terms:** https://reactome.org/license
- **Reuse checked:** 2026-10-24
- **Attribution:** Reactome Pathway Database, CC0 data. Identifiers, links and project-authored factual summaries only; no diagrams or source prose.
- **Retained content:** Bibliographic facts, identifiers, links and short project-authored factual summaries only; no article text, figures, tables, sequences or full-text payloads.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-reactome-cholesterol-efflux

[NR1H3 & NR1H2 regulate gene expression linked to cholesterol transport and efflux](https://reactome.org/content/detail/R-HSA-9029569)

- **Kind:** database\_record
- **Identifiers:** Reactome: R-HSA-9029569
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** Reactome / Record page accessed 2026-10-22; database release and record revision not captured
- **Retrieved:** 2026-10-22
- **Reuse permission status:** permitted
- **Reuse terms:** https://reactome.org/license
- **Reuse checked:** 2026-10-22
- **Attribution:** Reactome Pathway Database; database data are CC0. Project-authored summaries; no Reactome artwork is retained.
- **Retained content:** Record identifiers, names, links and project-authored annotation summaries only; no source prose, sequences, figures or artwork.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-reactome-dap12

[DAP12 signaling](https://reactome.org/content/detail/R-HSA-2424491)

- **Kind:** database\_record
- **Identifiers:** Reactome: R-HSA-2424491
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** Reactome / Record page accessed 2026-10-22; database release and record revision not captured
- **Retrieved:** 2026-10-22
- **Reuse permission status:** permitted
- **Reuse terms:** https://reactome.org/license
- **Reuse checked:** 2026-10-22
- **Attribution:** Reactome Pathway Database; database data are CC0. Project-authored summaries; no Reactome artwork is retained.
- **Retained content:** Record identifiers, names, links and project-authored annotation summaries only; no source prose, sequences, figures or artwork.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-reactome-marco-binding

[Reactome R-HSA-2173781 — MARCO (SCARA2) binds ligands](https://reactome.org/content/detail/R-HSA-2173781)

- **Kind:** database\_record
- **Identifiers:** Reactome: R-HSA-2173781
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** Reactome / Accessed 2026-10-24; exact Reactome release and record revision not captured
- **Retrieved:** 2026-10-24
- **Reuse permission status:** permitted
- **Reuse terms:** https://reactome.org/license
- **Reuse checked:** 2026-10-24
- **Attribution:** Reactome Pathway Database, CC0 data. Identifiers, links and project-authored factual summaries only; no diagrams or source prose.
- **Retained content:** Bibliographic facts, identifiers, links and short project-authored factual summaries only; no article text, figures, tables, sequences or full-text payloads.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-reactome-nr1h2-protein

[NR1H2 \[nucleoplasm\]](https://reactome.org/content/detail/R-HSA-375500)

- **Kind:** database\_record
- **Identifiers:** Reactome: R-HSA-375500
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** Reactome / Record page accessed 2026-10-22; database release and record revision not captured
- **Retrieved:** 2026-10-22
- **Reuse permission status:** permitted
- **Reuse terms:** https://reactome.org/license
- **Reuse checked:** 2026-10-22
- **Attribution:** Reactome Pathway Database; database data are CC0. Project-authored summaries; no Reactome artwork is retained.
- **Retained content:** Record identifiers, names, links and project-authored annotation summaries only; no source prose, sequences, figures or artwork.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-reactome-nr1h3-protein

[NR1H3 \[nucleoplasm\]](https://reactome.org/content/detail/R-HSA-8854957)

- **Kind:** database\_record
- **Identifiers:** Reactome: R-HSA-8854957
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** Reactome / Record page accessed 2026-10-22; database release and record revision not captured
- **Retrieved:** 2026-10-22
- **Reuse permission status:** permitted
- **Reuse terms:** https://reactome.org/license
- **Reuse checked:** 2026-10-22
- **Attribution:** Reactome Pathway Database; database data are CC0. Project-authored summaries; no Reactome artwork is retained.
- **Retained content:** Record identifiers, names, links and project-authored annotation summaries only; no source prose, sequences, figures or artwork.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-reactome-rxra-protein

[RXRA \[nucleoplasm\]](https://reactome.org/content/detail/R-HSA-381319)

- **Kind:** database\_record
- **Identifiers:** Reactome: R-HSA-381319
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** Reactome / Record page accessed 2026-10-22; database release and record revision not captured
- **Retrieved:** 2026-10-22
- **Reuse permission status:** permitted
- **Reuse terms:** https://reactome.org/license
- **Reuse checked:** 2026-10-22
- **Attribution:** Reactome Pathway Database; database data are CC0. Project-authored summaries; no Reactome artwork is retained.
- **Retained content:** Record identifiers, names, links and project-authored annotation summaries only; no source prose, sequences, figures or artwork.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-reactome-scara5-binding

[Reactome R-HSA-2187266 — SCARA5 binds ligands](https://reactome.org/content/detail/R-HSA-2187266)

- **Kind:** database\_record
- **Identifiers:** Reactome: R-HSA-2187266
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** Reactome / Accessed 2026-10-24; exact Reactome release and record revision not captured
- **Retrieved:** 2026-10-24
- **Reuse permission status:** permitted
- **Reuse terms:** https://reactome.org/license
- **Reuse checked:** 2026-10-24
- **Attribution:** Reactome Pathway Database, CC0 data. Identifiers, links and project-authored factual summaries only; no diagrams or source prose.
- **Retained content:** Bibliographic facts, identifiers, links and short project-authored factual summaries only; no article text, figures, tables, sequences or full-text payloads.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-reactome-scavenger-gene-set

[Pinned Reactome human GMT: scavenger-receptor gene-set annotations](https://raw.githubusercontent.com/epigen/MrBiomics/fbe2f70935496c73ed21337af70e97e633c2f4d3/resources/ReactomePathways.gmt)

- **Kind:** database\_record
- **Identifiers:** SHA-256: f5d9af14b2f8d373201372b2e63e3c7b2c5b535d30af1459fddfdba22015cd7d
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** Reactome (pinned mirror) / MrBiomics commit fbe2f70935496c73ed21337af70e97e633c2f4d3; exact upstream Reactome release unknown
- **Retrieved:** 2026-10-24
- **Reuse permission status:** permitted
- **Reuse terms:** https://reactome.org/license
- **Reuse checked:** 2026-10-24
- **Attribution:** Reactome annotation data, mirrored by Computational Epigenetics / MrBiomics; exact upstream release unknown.
- **Retained content:** Four literal gene-symbol memberships, stable pathway identifiers, links and project-authored summaries. No artwork, source prose, protein states or original-paper interpretations.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-reactome-scavenger-pathway

[Reactome R-HSA-2173782 — Binding and Uptake of Ligands by Scavenger Receptors](https://reactome.org/content/detail/R-HSA-2173782)

- **Kind:** database\_record
- **Identifiers:** Reactome: R-HSA-2173782
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** Reactome / Accessed 2026-10-24; exact Reactome release and record revision not captured
- **Retrieved:** 2026-10-24
- **Reuse permission status:** permitted
- **Reuse terms:** https://reactome.org/license
- **Reuse checked:** 2026-10-24
- **Attribution:** Reactome Pathway Database, CC0 data. Identifiers, links and project-authored factual summaries only; no diagrams or source prose.
- **Retained content:** Bibliographic facts, identifiers, links and short project-authored factual summaries only; no article text, figures, tables, sequences or full-text payloads.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-reactome-trem2-dap12

[Interaction of DAP12 and TREM2](https://reactome.org/content/detail/R-HSA-210300)

- **Kind:** database\_record
- **Identifiers:** Reactome: R-HSA-210300
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** Reactome / Record page accessed 2026-10-22; database release and record revision not captured
- **Retrieved:** 2026-10-22
- **Reuse permission status:** permitted
- **Reuse terms:** https://reactome.org/license
- **Reuse checked:** 2026-10-22
- **Attribution:** Reactome Pathway Database; database data are CC0. Project-authored summaries; no Reactome artwork is retained.
- **Retained content:** Record identifiers, names, links and project-authored annotation summaries only; no source prose, sequences, figures or artwork.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-reactome-trem2-protein

[TREM2 \[plasma membrane\]](https://reactome.org/content/detail/R-HSA-197664)

- **Kind:** database\_record
- **Identifiers:** Reactome: R-HSA-197664
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** Reactome / Record page accessed 2026-10-22; database release and record revision not captured
- **Retrieved:** 2026-10-22
- **Reuse permission status:** permitted
- **Reuse terms:** https://reactome.org/license
- **Reuse checked:** 2026-10-22
- **Attribution:** Reactome Pathway Database; database data are CC0. Project-authored summaries; no Reactome artwork is retained.
- **Retained content:** Record identifiers, names, links and project-authored annotation summaries only; no source prose, sequences, figures or artwork.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-reactome-tyrobp-state

[p-Y91,Y102-TYROBP \[plasma membrane\]](https://reactome.org/content/detail/R-HSA-210010)

- **Kind:** database\_record
- **Identifiers:** Reactome: R-HSA-210010
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** Reactome / Record page accessed 2026-10-22; database release and record revision not captured
- **Retrieved:** 2026-10-22
- **Reuse permission status:** permitted
- **Reuse terms:** https://reactome.org/license
- **Reuse checked:** 2026-10-22
- **Attribution:** Reactome Pathway Database; database data are CC0. Project-authored summaries; no Reactome artwork is retained.
- **Retained content:** Record identifiers, names, links and project-authored annotation summaries only; no source prose, sequences, figures or artwork.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-uniprot-abca1-live-2026-11-05

[UniProtKB O95477: human ABCA1 identity](https://rest.uniprot.org/uniprotkb/O95477.json)

- **Kind:** database\_record
- **Identifiers:** UniProt: O95477; Ensembl: ENSG00000165029
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** UniProtKB / 2026\_04; entry 244; annotation update 2026-11-04; response SHA-256 cc09f5c6c6d66ac2e406096e47eab9b32ac32abd93d7c5a1d7f6abd17ade26cb
- **Retrieved:** 2026-11-05T00:00:45.202Z
- **Reuse permission status:** permitted
- **Reuse terms:** https://rest.uniprot.org/help/license
- **Reuse checked:** 2026-11-05
- **Attribution:** The UniProt Consortium, UniProtKB. Identity metadata only; CC BY 4.0.
- **Retained content:** Identifiers, bibliographic facts and project-authored factual summaries only; no source prose, sequences, alignments, article text, figures or raw provider payloads are distributed.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-uniprot-apoe

[UniProtKB P02649 — Apolipoprotein E](https://rest.uniprot.org/uniprotkb/P02649.txt)

- **Kind:** database\_record
- **Identifiers:** UniProt: P02649
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** UniProt / Entry version 280, 2026-09-02; sequence version 1
- **Retrieved:** 2026-10-22
- **Reuse permission status:** permitted
- **Reuse terms:** https://rest.uniprot.org/help/license
- **Reuse checked:** 2026-10-22
- **Attribution:** The UniProt Consortium, UniProtKB (CC BY 4.0, https://creativecommons.org/licenses/by/4.0/). Identifiers and project-authored summaries; no sequence or source prose retained.
- **Retained content:** Record identifiers, names, links and project-authored annotation summaries only; no source prose, sequences, figures or artwork.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-uniprot-apoe-live-2026-11-05

[UniProtKB P02649: human APOE identity](https://rest.uniprot.org/uniprotkb/P02649.json)

- **Kind:** database\_record
- **Identifiers:** UniProt: P02649; Ensembl: ENSG00000130203
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** UniProtKB / 2026\_04; entry 281; annotation update 2026-11-04; response SHA-256 092114effe4244e54e48c0e220b17dd15e96d65ded46d384238a193a29a83203
- **Retrieved:** 2026-11-05T00:00:45.152Z
- **Reuse permission status:** permitted
- **Reuse terms:** https://rest.uniprot.org/help/license
- **Reuse checked:** 2026-11-05
- **Attribution:** The UniProt Consortium, UniProtKB. Identity metadata only; CC BY 4.0.
- **Retained content:** Identifiers, bibliographic facts and project-authored factual summaries only; no source prose, sequences, alignments, article text, figures or raw provider payloads are distributed.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-uniprot-mouse-apoe

[UniProtKB P08226: mouse Apoe gene/product identity](https://rest.uniprot.org/uniprotkb/P08226.json)

- **Kind:** database\_record
- **Identifiers:** UniProt: P08226; NCBIGene: 11816
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** UniProtKB / 2026\_04; entry 224; annotation update 2026-11-04; response SHA-256 b0d26792635e76bae51fb0c96125efd17a8b9895014a7fbcade78f4617a1c2a3
- **Retrieved:** 2026-11-05T11:16:48.188761Z
- **Reuse permission status:** permitted
- **Reuse terms:** https://rest.uniprot.org/help/license
- **Reuse checked:** 2026-11-05
- **Attribution:** The UniProt Consortium. Mouse gene/product identity metadata, CC BY4.0.
- **Retained content:** Identifiers, bibliographic facts and project-authored factual summaries only; no source prose, sequences, alignments, article text, figures or raw provider payloads are distributed.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-uniprot-rxra

[UniProtKB P19793 — Retinoic acid receptor RXR-alpha](https://rest.uniprot.org/uniprotkb/P19793.txt)

- **Kind:** database\_record
- **Identifiers:** UniProt: P19793
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** UniProt / Entry version 263, 2026-09-02; sequence version 1
- **Retrieved:** 2026-10-22
- **Reuse permission status:** permitted
- **Reuse terms:** https://rest.uniprot.org/help/license
- **Reuse checked:** 2026-10-22
- **Attribution:** The UniProt Consortium, UniProtKB (CC BY 4.0, https://creativecommons.org/licenses/by/4.0/). Identifiers and project-authored summaries; no sequence or source prose retained.
- **Retained content:** Record identifiers, names, links and project-authored annotation summaries only; no source prose, sequences, figures or artwork.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-uniprot-trem2

[UniProtKB Q9NZC2 — Triggering receptor expressed on myeloid cells 2](https://rest.uniprot.org/uniprotkb/Q9NZC2.txt)

- **Kind:** database\_record
- **Identifiers:** UniProt: Q9NZC2
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** UniProt / Entry version 187, 2026-09-02; sequence version 1
- **Retrieved:** 2026-10-22
- **Reuse permission status:** permitted
- **Reuse terms:** https://rest.uniprot.org/help/license
- **Reuse checked:** 2026-10-22
- **Attribution:** The UniProt Consortium, UniProtKB (CC BY 4.0, https://creativecommons.org/licenses/by/4.0/). Identifiers and project-authored summaries; no sequence or source prose retained.
- **Retained content:** Record identifiers, names, links and project-authored annotation summaries only; no source prose, sequences, figures or artwork.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-uniprot-tyrobp

[UniProtKB O43914 — TYRO protein tyrosine kinase-binding protein](https://rest.uniprot.org/uniprotkb/O43914.txt)

- **Kind:** database\_record
- **Identifiers:** UniProt: O43914
- **Authors:** Not recorded
- **Year / publication type:** Not recorded / Not recorded
- **Provider / release:** UniProt / Entry version 196, 2026-09-02; sequence version 1
- **Retrieved:** 2026-10-22
- **Reuse permission status:** permitted
- **Reuse terms:** https://rest.uniprot.org/help/license
- **Reuse checked:** 2026-10-22
- **Attribution:** The UniProt Consortium, UniProtKB (CC BY 4.0, https://creativecommons.org/licenses/by/4.0/). Identifiers and project-authored summaries; no sequence or source prose retained.
- **Retained content:** Record identifiers, names, links and project-authored annotation summaries only; no source prose, sequences, figures or artwork.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

### source-wahrle-2004

[ABCA1 Is Required for Normal Central Nervous System ApoE Levels and for Lipidation of Astrocyte-secreted apoE](https://doi.org/10.1074/jbc.M407963200)

- **Kind:** publication
- **Identifiers:** DOI: 10.1074/jbc.M407963200; PMID: 15269217; OpenAlex: W2013111251
- **Authors:** Suzanne E. Wahrle; Hong Jiang; Maia Parsadanian; Justin Legleiter; Xianlin Han; John D. Fryer; Tomasz Kowalewski; David M. Holtzman
- **Year / publication type:** 2004 / primary\_research
- **Provider / release:** Journal of Biological Chemistry / Not recorded
- **Retrieved:** 2026-11-05
- **Reuse permission status:** permitted
- **Reuse terms:** https://creativecommons.org/licenses/by/4.0/
- **Reuse checked:** 2026-11-05
- **Attribution:** Suzanne E. Wahrle and colleagues, Journal of Biological Chemistry (2004), DOI 10.1074/jbc.M407963200. Publisher-deposited Crossref VOR metadata reports CC BY4.0 effective 2020-09-21; original archived PDF retains historical ASBMB copyright. Project-authored factual paraphrases of inspected results/methods only; no article text/figures redistributed.
- **Retained content:** Identifiers, bibliographic facts and project-authored factual summaries only; no source prose, sequences, alignments, article text, figures or raw provider payloads are distributed.
- **Publication status:** not\_checked
- **Publication status checked:** Not recorded
- **Notice URL:** Not recorded

## Reproduce this packet

Generate: `node --experimental-strip-types tools/curation/review-packet.ts`

Check the committed extract: `node --experimental-strip-types tools/curation/review-packet.ts --check`

The tool makes no network requests and does not change scientific records or review attestations.
