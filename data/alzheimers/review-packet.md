# Alzheimer’s source-review packet

Generated from the checked-in dataset. Do not edit this extract: record actual reviews and source checks in the dataset, then regenerate it.
Generating this packet performs structural validation only; it does not inspect publications, establish study independence, or grant scientific approval.

- **Dataset:** alzheimers-source-checked-0.3.0
- **Schema:** 0.1.0
- **Snapshot date:** 2026-10-23
- **Release status:** development
- **Coverage:** 22 entities, 21 claims, 21 evidence records, 23 sources
- **Disease:** Alzheimer's disease
- **Inclusion criteria:** Selected Alzheimer's association studies, human gene–protein identities, curated cholesterol-regulation and DAP12 pathway records, and source-scoped APOE–TREM2 binding assays.

## Scope limitations

- Source-checked draft: inspected locations include study abstracts/metadata, selected original figure captions, and specific database annotations; this is not a comprehensive literature or full-paper review.
- The four human genetic association findings retain their original variant and population scopes. Database pathways do not establish AD causality, individual risk or treatment benefit.
- The APOE–TREM2 binding findings concern in vitro protein constructs. They are not human clinical observations or evidence of signaling, disease causation or treatment benefit.
- Protein nodes represent canonical human gene products. Compartments and modified states remain in evidence context; the graph does not depict every isoform, complex or molecular state.
- Reactome assertions are attributed curated records, not independent experiments. Access dates are recorded; the exact Reactome database release was not captured.
- Independent scientific review is a future milestone. Remaining reuse and correction/retraction checks are recorded per source; no human-review attestation is inferred.
- No curated contradictions, therapeutic claims or novel research hypotheses are included. Missing connections describe coverage, not research gaps.

## Source coverage

Each row is one source record, not an independent experiment or cohort. Database identity records and repeated references do not add independent biological support; even different publications may reuse participants. Study independence and comparability require human assessment.

| Source | Kind | Linked claims | Entity provenance | Reuse | Publication status |
| --- | --- | --- | --- | --- | --- |
| source-atagi-2015 | publication | claim-trem2-apoe-binding; claim-trem2-r47h-apoe-binding | paper-atagi-2015 | pending\_review | not\_checked |
| source-corder-1993 | publication | claim-apoe-e4-risk | paper-corder-1993 | pending\_review | not\_checked |
| source-corder-1994 | publication | claim-apoe-e2-risk | paper-corder-1994 | pending\_review | not\_checked |
| source-jonsson-2013 | publication | claim-trem2-r47h-risk | paper-jonsson-2013 | pending\_review | not\_checked |
| source-mesh-alzheimers | database\_record | None | disease-alzheimers | pending\_review | not\_checked |
| source-ncbi-abca1 | database\_record | None | gene-abca1 | pending\_review | not\_checked |
| source-ncbi-apoe | database\_record | None | gene-apoe | pending\_review | not\_checked |
| source-ncbi-trem2 | database\_record | None | gene-trem2 | pending\_review | not\_checked |
| source-nordestgaard-2015 | publication | claim-abca1-n1800h-risk | paper-nordestgaard-2015 | pending\_review | not\_checked |
| source-reactome-abca1-protein | database\_record | claim-abca1-cholesterol-pathway; claim-abca1-encodes | protein-abca1 | permitted | not\_checked |
| source-reactome-apoe-expression | database\_record | claim-apoe-cholesterol-pathway | Not recorded | permitted | not\_checked |
| source-reactome-cholesterol-efflux | database\_record | None | pathway-cholesterol-efflux | permitted | not\_checked |
| source-reactome-dap12 | database\_record | None | pathway-dap12 | permitted | not\_checked |
| source-reactome-nr1h2-protein | database\_record | claim-nr1h2-cholesterol-pathway; claim-nr1h2-encodes | gene-nr1h2; protein-nr1h2 | permitted | not\_checked |
| source-reactome-nr1h3-protein | database\_record | claim-nr1h3-cholesterol-pathway; claim-nr1h3-encodes | gene-nr1h3; protein-nr1h3 | permitted | not\_checked |
| source-reactome-rxra-protein | database\_record | claim-rxra-cholesterol-pathway | Not recorded | permitted | not\_checked |
| source-reactome-trem2-dap12 | database\_record | claim-trem2-dap12-binding | Not recorded | permitted | not\_checked |
| source-reactome-trem2-protein | database\_record | claim-trem2-dap12-pathway | Not recorded | permitted | not\_checked |
| source-reactome-tyrobp-state | database\_record | claim-tyrobp-dap12-pathway | Not recorded | permitted | not\_checked |
| source-uniprot-apoe | database\_record | claim-apoe-encodes | protein-apoe | permitted | not\_checked |
| source-uniprot-rxra | database\_record | claim-rxra-encodes | gene-rxra; protein-rxra | permitted | not\_checked |
| source-uniprot-trem2 | database\_record | claim-trem2-encodes | protein-trem2 | permitted | not\_checked |
| source-uniprot-tyrobp | database\_record | claim-tyrobp-encodes | gene-tyrobp; protein-tyrobp | permitted | not\_checked |

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
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** Reactome Locations in the PathwayBrowser: cholesterol transport/efflux → ABCA1 translation and NR1H2 binding.

Reactome includes ABCA1 protein in its human cholesterol transport and efflux gene-regulation pathway.

Source-specific study context:

- **assertion type:** curated database annotation
- **design:** database annotation
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
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** Reactome External Reference Information: UniProt accession, Gene Names and Reference Genes; species in record identity.

The human ABCA1 gene encodes Phospholipid-transporting ATPase ABCA1 (O95477).

Source-specific study context:

- **assertion type:** curated database annotation
- **design:** database annotation
- **gene id:** 19
- **organism:** Homo sapiens
- **protein accession:** O95477
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
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** Reactome Participants: APOE protein output; Participates: cholesterol transport/efflux pathway.

Reactome includes APOE protein in its human cholesterol transport and efflux gene-regulation pathway.

Source-specific study context:

- **assertion type:** curated database annotation
- **design:** database annotation
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
- **Upstream source records:** Not recorded
- **Evidence relation:** supports
- **Inspected location:** UniProtKB ID/AC, gene name (GN), organism (OS), GeneID cross-reference (DR), and entry-version (DT) fields.

The human APOE gene encodes Apolipoprotein E (P02649).

Source-specific study context:

- **assertion type:** curated database annotation
- **design:** database annotation
- **gene id:** 348
- **organism:** Homo sapiens
- **protein accession:** P02649
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

### claim-trem2-apoe-binding

**TREM2 protein → APOE protein · interacts\_with**

In Atagi et al.'s dot-blot assays, APOE2, APOE3 and APOE4 bound the human TREM2 extracellular domain fused to Fc.

**Summary:** Follow this protein interaction to inspect the separate cholesterol and DAP12 pathway annotations.

#### Claim context

- **assay:** Dot blot
- **experimental system:** Cell-free protein assay
- **intervention:** Not recorded
- **organism:** Homo sapiens
- **outcome:** APOE binding to TREM2-Fc
- **population:** Not recorded
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
- **controls:** Human IgG-Fc and TREM1-Fc
- **experimental system:** Cell-free protein assay
- **intervention:** Not recorded
- **organism:** Homo sapiens
- **outcome:** APOE binding to TREM2-Fc
- **population:** Not recorded
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
- **experimental system:** Cell-free protein assay
- **intervention:** Not recorded
- **organism:** Homo sapiens
- **outcome:** APOE binding to TREM2-Fc
- **population:** Not recorded
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
- **controls:** Anti-Fc loading control for dot blots; uncoated wells for solid-phase assays
- **experimental system:** Cell-free protein assay
- **intervention:** Not recorded
- **organism:** Homo sapiens
- **outcome:** APOE binding to TREM2-Fc
- **population:** Not recorded
- **replicate unit:** Figure 5 reports n = 3; replicate independence not resolved
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

## Reproduce this packet

Generate: `node --experimental-strip-types tools/curation/review-packet.ts`

Check the committed extract: `node --experimental-strip-types tools/curation/review-packet.ts --check`

The tool makes no network requests and does not change scientific records or review attestations.
