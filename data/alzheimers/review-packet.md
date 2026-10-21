# Alzheimer’s starter review packet

Generated from the checked-in dataset. Do not edit this extract: record actual reviews and source checks in the dataset, then regenerate it.
Generating this packet performs structural validation only; it does not inspect publications, establish study independence, or grant scientific approval.

- **Dataset:** alzheimers-starter-0.1.0
- **Schema:** 0.1.0
- **Snapshot date:** 2026-10-20T00:00:00Z
- **Release status:** development
- **Coverage:** 8 entities, 4 claims, 4 evidence records, 8 sources
- **Disease:** Alzheimer's disease
- **Inclusion criteria:** Small, source-linked development graph of selected human genetic association findings for APOE, ABCA1, and TREM2.

## Scope limitations

- Development data: AI-assisted abstract lookup is complete, but no independent human scientific review has been recorded.
- This selective historical starter is not a systematic review, a current consensus statement, or a comprehensive map of Alzheimer's biology.
- All claims and evidence remain draft; source reuse and correction/retraction checks must be completed before scientific release.
- Associations are scoped to variants and study populations; they do not establish causation, individual risk, or treatment benefit.
- Pathways, therapeutic targets, conflicting findings, and research hypotheses have not yet been curated.

## Source coverage

Each row is one source record, not an independent experiment or cohort. Database identity records and repeated references do not add independent biological support; even different publications may reuse participants. Study independence and comparability require human assessment.

| Source | Kind | Linked claims | Entity provenance | Reuse | Publication status |
| --- | --- | --- | --- | --- | --- |
| source-corder-1993 | publication | claim-apoe-e4-risk | paper-corder-1993 | pending\_review | not\_checked |
| source-corder-1994 | publication | claim-apoe-e2-risk | paper-corder-1994 | pending\_review | not\_checked |
| source-jonsson-2013 | publication | claim-trem2-r47h-risk | paper-jonsson-2013 | pending\_review | not\_checked |
| source-mesh-alzheimers | database\_record | None | disease-alzheimers | pending\_review | not\_checked |
| source-ncbi-abca1 | database\_record | None | gene-abca1 | pending\_review | not\_checked |
| source-ncbi-apoe | database\_record | None | gene-apoe | pending\_review | not\_checked |
| source-ncbi-trem2 | database\_record | None | gene-trem2 | pending\_review | not\_checked |
| source-nordestgaard-2015 | publication | claim-abca1-n1800h-risk | paper-nordestgaard-2015 | pending\_review | not\_checked |

## Findings for review

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

## Source records and outstanding checks

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

## Reproduce this packet

Generate: `node --experimental-strip-types tools/curation/review-packet.ts`

Check the committed extract: `node --experimental-strip-types tools/curation/review-packet.ts --check`

The tool makes no network requests and does not change scientific records or review attestations.
