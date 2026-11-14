# Checkpoints

## Current checkpoint: interpret experimental data

The main user is a researcher interpreting experimental results and looking for ideas to investigate. **Analyze results** now accepts a full human-symbol, Ensembl or explicitly confirmed NCBI Gene RNA-seq differential-expression table, a named comparison and gene-level cutoffs. It tests pathway overrepresentation against a separate pinned Reactome library of 2,751 pathways, shows signed member-level measurements and links covered genes into the curated evidence explorer.

The statistical background is uploaded genes with complete log2FC and padj, before applying either cutoff; incomplete rows remain in the input and are reported as excluded. Eligible unannotated genes remain in N. Right-tailed hypergeometric tests and BH correction cover every pathway with an eligible member, including zero-hit pathways. Gene-level padj values are preserved, and pathway enrichment is not an activity or causality score. The exact upstream Reactome release is unknown; the immutable mirror and digests identify the reference actually used.

Source-linked questions identify measured premises, assumptions and possible tests. They are rule-based proposals outside the curated claims/hypotheses, with no novelty or experimental-validation claim. RNA measurements never transfer to protein nodes or imply a genotype. Files stay in browser memory, with no upload, automatic storage, raw-count analysis or live AI service. The existing AD evidence library and brief workspace remain available.

Observed numerical and browser checks belong in [verification](verification.md). The real public airway dataset used for validation is not AD data and is not bundled; the pinned reference and actual conversion limits are documented in [reference provenance](../data/reference/README.md).

## Completed checkpoint: identifiers and a public AD results table

A pinned HGNC reference now maps human Ensembl IDs while retaining original versions, unknown/ambiguous identities and the full eligible denominator. Duplicate stable IDs/gene mappings block analysis, and multiple identifier columns require a choice. [Public MAYO AD and original airway tables](experimental-validation.md) match independent SciPy calculations; actual backgrounds, author-coded contrasts and source limitations remain explicit. No experimental rows enter the curated graph.

## Public research-preview milestone

The complete working path is processed human RNA-seq input → identifier audit → pathway analysis → threshold sensitivity/overlap inspection → published evidence and questions to investigate. This is suitable to publish as a public research preview. It remains a tool for interpreting supplied data; it does not run differential expression, establish pathway activity, independently verify source models or validate discoveries. The existing Source-checked draft label and accessible reference/source limitations remain. Independent scientific review and the strict scientific-release gates are separate future work, as the owner requested.

**Threshold sensitivity** compares gene FDR half/applied/double (capped at 1) and absolute log2FC minus/applied/plus 0.5 (floored at 0). Duplicate boundary settings are removed. The exact applied values are retained; every cell uses the same eligible N and full pathway family, recalculating pathway BH separately. Counts across cells describe cutoff sensitivity, not confidence or independent replication. No correction across settings is applied.

**Group overlaps** uses eligible-member Jaccard ≥0.5 against a deterministic representative ranked by applied BH, raw p-value and ID. Members must meet the cutoff against that representative; transitive chains do not collapse into a group. Groups retain every pathway's original statistics and are navigation aids, not independent mechanisms or Reactome hierarchy. Search reveals matching members beside the original representative. Both operations use an on-demand local worker, preserve the applied analysis and discard stale work after replacement/removal.

On the public MAYO table, all nine settings × 2,720 pathways matched independent SciPy calculations. Independent Python sets also matched all 1,673 groups. At the applied cutoffs, its 71 pathways at BH ≤0.05 appear as 37 groups, with every underlying result retained. These are input/reference-specific observations, not benchmarks or disease claims; full provenance and reproduction are in [experimental validation](experimental-validation.md).

## Completed checkpoint: experiment context

Optional tissue/cell model, treatment/condition and explicit study design now scope follow-up questions. Observational comparisons prompt sample-composition and potential-confounder checks; treatment/perturbation studies prompt controlled manipulation or rescue designs. Applied context stays separate from pending fields and cited study metadata, and remains available beside a gene's RNA observation. Blank context is not inferred. Selection, membership, pathway statistics, sensitivity and overlap groups are unchanged, and context stays in memory outside worker messages/storage/exports. The example includes explicitly synthetic context.

## Completed checkpoint: focused exploration

The 3D view now starts with a selected entity’s direct connections, with one optional expansion level, Collapse and bounded Back history. Overview retains the complete library with selection-only relationship lines; the complete searchable List and paper selections remain available. Original findings/citations stay in the inspector, and one line per endpoint pair does not combine evidence records. Focus rings are navigation levels, not scientific proximity. Graph scope/history remain transient and existing links retain their entity/finding/query/filter/view contract.

## Completed checkpoint: workspace explanations

A `?` beside each workspace explains its purpose on demand. Explore’s example follows an APOE gene mapping into distinct protein/pathway evidence. Analyze results explains the processed-table input, gene/log₂FC/pathway-FDR terms and the actual synthetic 120-gene example. Opening help retains the current workspace and pending/applied data, with no reference loading or permanent copy added to the workspace.

## Next checkpoint: public research use

Use the public preview with actual processed research tables and refine input compatibility and interpretation from observed use. Expand curated gene evidence where those inputs reveal useful coverage gaps, with source-specific review. Rank-based analysis, gene-length/expression selection-bias correction and broader curated disease evidence require separate methods/data work; none is implied by completing the preview. More sharing features and extra nodes are not the current priority.

### APOE pilot: compare possible explanations

The implemented first pilot requires explicitly applied **Bulk brain tissue**, **Observational comparison**, and a complete nonzero APOE RNA observation that passes the applied gene cutoffs and belongs to the selected pathway. **Possible explanations** appears below the member measurements; pathway FDR is displayed without a significance gate or activity inference. Sample type and design are never inferred from free text. The authored synthetic example retains **Example explanations** even after comparison/context edits; uploaded text never declares that provenance.

1. Show the actual signed APOE measurement, gene/pathway FDR, pathway overlap and applied cutoffs.
2. Compare two nonexclusive contributions: cell-type proportions and APOE RNA differences within cell types. [Mathys 2019 and Murphy 2023](apoe-explanations-sources.md) provide source-checked human-brain context. Murphy reanalyzes the same cohort and questions method sensitivity; it is not independent replication. Original locations, the Mathys correction and actual inspection/reuse limits remain accessible.
3. Propose independently measuring tissue composition alongside cell-type-resolved APOE RNA in matched donors/regions. Preserve donor units, capture bias and nuclear-versus-bulk measurement differences. Neither alternative is scored or selected; other technical/covariate contributions remain possible.
4. Preserve exact source navigation, applied results and tab-only privacy. Pending edits or failed applies retain the applied report; successful replacements/cutoffs and removal cannot retain an inapplicable report. The report and its context stay outside worker payloads, storage, links, exports and graph records. The graph remains at 45 entities / 49 claims; the versioned interpretation catalog is separate.

Positive-path verification uses explicitly synthetic measurements. In the pinned real MAYO input APOE has log₂FC −0.0592458611038634 and FDR 0.682961137290324, so the pilot correctly stays hidden at default cutoffs. A bounded check of three other public cohort tables found no qualifying APOE result either; cutoffs were not loosened to force a demonstration. [Validation](experimental-validation.md#apoe-explanation-pilot) distinguishes this negative control from a biological interpretation. A qualifying real research case and observed researcher feedback remain the next evaluation step.

The first contribution paths support this work: input-compatibility reproductions, accessible analysis/evidence navigation and one original-paper extraction from the staged reading list. See [Contributing](../CONTRIBUTING.md) for scope-specific checks and the feature-branch → PR/MR → `master` workflow.

## Completed checkpoint: contribution entry points

The contribution guide now reflects the 40-entity/41-claim preview, current staging tools and the distinction between source-checked development and future scientific release. Bug/evidence-proposal templates and a pull-request template provide concrete entry points. All work uses feature branches with requests targeting `master`; the default branch remains `master`. The README acknowledges selection and licence clearance for XERJ's pinned 2026-10-24 repository snapshot and its highlighted AD/airway validation work.

## Completed expansion: genes from a public AD pathway result

Snapshot 0.6.0 adds MARCO and SCARA5, which pass the applied cutoffs in the public MAYO input's leading scavenger-receptor pathway. APOB provides ligand context for two original Cheng 2021 ELISA findings; three genes, separate proteins, the pathway and a paper add eight nodes. Four attributed participation records join the branch to existing APOE evidence. The 3D/list explorer and analysis evidence links use these records without changing the broad reference or numerical results. [The change record](../data/alzheimers/CHANGELOG.md#alzheimers-source-checked-060--2026-10-24) retains identity provenance, mouse inference, modified/domain constructs, repeat units and reuse limits. No new AD-risk, activity, cure or novelty claim is inferred from gene selection.

## Completed checkpoint: evidence for an analyzed pathway

The selected pathway now has an **Evidence** section with a selected-gene coverage audit and original-paper findings grouped by citation. MARCO/SCARA5/APOB lead to one Cheng paper with the distinct modified-apoB findings; database-only genes do not borrow neighbouring genes' papers. Exact gene/product mappings connect the input to the curated library without converting RNA changes into protein results. **View finding** opens the corresponding graph/list inspector record and preserves the applied analysis when returning. Existing curated study-context notes require all their findings/evidence; no automated contradiction or research-gap detection is claimed. Coverage, source terms and numerical/reference boundaries remain unchanged.

## Completed checkpoint: reproducible database expansion

Bounded UniProt/Reactome/Open Targets tools stage provider facts with exact identity checks, response digests, archived replay and separate database/experimental meanings. Live access was blocked at the original seed checkpoint, so that first expansion used the checksum-pinned HGNC/Reactome seed: COL1A1/COL1A2/COL3A1/SAA1, separate proteins and eight scoped assertions brought the graph to 40 entities / 41 claims. Its gene-set annotations remain on genes, without invented protein-state, activity, interaction or AD-risk claims. The later 0.8.0 checkpoint has separate successful API/source provenance. [The earlier source record](../data/alzheimers/CHANGELOG.md#alzheimers-source-checked-070--2026-10-24) is not relabeled as live API data; enrichment statistics remain unchanged.

## Existing workflow: build a research argument

The research brief workspace adds a complete working flow on top of the existing Alzheimer's evidence:

1. Use **Pin finding** in the inspector or **Add to research brief** from a comparison.
2. Write a research question, explanation, assumptions and proposed experiment beside the selected evidence.
3. Keep original citations and context accessible, and include one comparison without losing its methodological limits.
4. Save one draft locally and download a cited Markdown document for discussion.

The workspace supports up to 12 pinned findings and one comparison. It keeps user text separate from scientific records and never creates graph hypotheses or approvals. Storage errors leave writing/export usable; corrupt saved data and conflicting tabs require explicit recovery. Dataset changes retain notes and require an explicit evidence refresh. There are no accounts, cloud sync, brief imports or AI-generated answers. Explorer sharing links and PNGs do not carry the user's notes.

This checkpoint changes the research workflow without adding more source records. Browser and model checks are recorded in [verification](verification.md); a working brief does not establish novelty or experimentally validate its argument.

## Future brief refinements

Use the complete pin → compare → write → download flow for a concrete lab-meeting question. Check whether the resulting document makes the evidence, assumptions and proposed controls easy to discuss. Prioritize the next workflow change from that use: multiple saved questions or reopening a portable draft are natural extensions, but neither is implemented here. Keep the current single-device storage boundary explicit and preserve cited context in any future import/export format. More source records and broader disease coverage are separate work.

## Evidence foundation: inspect different R47H assay results

Snapshot **alzheimers-source-checked-0.5.0** has **24 entities, 24 cited draft claims and one draft study-context comparison**. A Lessard 2018 finding reports no significant APOE3 affinity difference between wild-type and R47H TREM2 in its lipidated-protein BLI assay. The context note compares that scoped report with Atagi 2015's reduced-binding finding while preserving different preparations, constructs and readouts. The [dataset changes](../data/alzheimers/CHANGELOG.md) record inspected publisher text, figure captions, unknown replicate totals and CC BY attribution. This does not establish identical binding, a settled contradiction, the cause of the difference or clinical effects.

The interface uses **Source-checked draft**. Users can follow a finding's **View …** action from a gene to its protein, then a pathway and another participant. Protein/pathway filters and distinct database-record labels support this through graph, list, keyboard, touch and WebGL fallback. The owner deferred independent scientific review to a future milestone; it is not a blocker for this development track, and no independent approval or human attestation is fabricated.

The binding findings expose the study and condition in their controls, with experimental system and assay beside the citation. **Different R47H binding results** appears beside the Atagi and Lessard findings, with both original links and a **What differs** disclosure. Comparison opens that curated pair first; otherwise it prefers the same recorded condition in a different publication on the same relationship where available. Publication IDs, PMIDs and DOIs prevent repeated metadata from being preferred as another paper. These are navigation defaults, not comparability or replication judgments. The note appears only for its cited pair and is exported with source locators, methodological limits and its actual draft review record. Experimental comparisons retain unknowns, technical units, repeated-experiment counts and shared-paper checks. Source disclosures and Markdown exports include the original correction notice link/date. Protein/pathway filters survive shared-link creation and restoration.

The [candidate-source coverage packet](../data/alzheimers/candidate-coverage.md) now retains six original publications outside the graph, grouped into three reading questions. The two prior pathway candidates entered through the separately source-checked dataset diff. This selective lookup is separate from the OpenAlex adapter; no successful live API request or exact Reactome release capture is claimed.

## Implemented foundation: compare the evidence behind a connection

The curated evidence library covers **Alzheimer's disease only**; the separate human pathway analysis is not a disease-specific evidence library. Comparison helps a reader inspect what two findings or annotations actually describe before interpreting them together.

The owner reports a working Vercel deployment. Sharing and Light / Dark / System are part of the existing foundation. The current checkpoint's observed checks belong in [verification](verification.md); hosting and interface completion do not change the dataset's review status.

The comparison and intake boundaries are:

- Open **Compare findings** from the evidence panel, choose two existing findings, and keep their statements and original citations visible.
- Align source-specific organism, variant, intervention, endpoint, design, population, tissue, sample size, and additional recorded context. Keep claim scope separate and unknown values explicit; never pool participant counts.
- Label exact recorded fields matching, different, or missing. These labels do not determine agreement, contradiction, comparability, evidence strength, or study independence.
- Expose repeated source IDs, PMIDs, or DOIs without treating different publication identities as proof of independent replication.
- Offer source-reading prompts derived from recorded differences and missing context. They are separate from explicitly curated context notes and do not become new hypotheses, verified research gaps or scientific approvals.
- Download a complete Markdown brief with citations, locators, limitations, actual review/source status, and dataset version. Preserve the underlying explorer state, keyboard access, both themes, narrow-table scrolling, and WebGL fallback.
- Stage a bounded first page of OpenAlex literature metadata or normalize an archived response. Candidates remain unreviewed and outside the graph; exclude abstracts/full text and preserve query/retrieval provenance. Offline contract checks do not verify a live API request.

The intended product value is a traceable path from a connection to the evidence and checks needed to use it. Reviewed pathways, intervention findings, and grounded research questions can deepen that path later. Adding more edges or calling an automated output a discovery does not meet this checkpoint's scientific purpose.

## Completed: APOE/ABCA1 source-checked graph checkpoint

Snapshot 0.8.0 makes the staged evidence visible:45 entities,49 claims,49 evidence records and49 sources. Three model/readout-specific mouse findings come from inspected original methods/Results/figures in two publications; two orthology links and one mouse gene/product mapping keep species separate. Two human Open Targets aggregate associations are explicitly database records, while existing UniProt/Reactome mappings gain provenance without duplicate biological assertions. OpenAlex remains metadata and now has a completed 0.2.0 live response digest; the legacy unknown digest remains explicit.

This is a meaningful explorer checkpoint: human ABCA1→mouse Abca1→mouse ApoE→the original experiment is navigable, source-linked, comparable and exportable. It does not complete the possible-explanations pilot, establish a human mechanism, add hypotheses or manufacture independent scientific review. Human RNA data/coverage do not cross orthology, and the broad analysis references remain unchanged. [Source locations and limits](../data/alzheimers/CHANGELOG.md#alzheimers-source-checked-080--2026-11-05) and [provenance](../data/annotations/apoe-abca1-checkpoint-provenance.json) retain unresolved terms/releases/notices.

## Future content work: deepen the Alzheimer's evidence

The development snapshot meets the **20–50 entity size target**. Next, inspect selected original papers from the staged list at assay level and add precise, cited draft findings when the source supports them. Prioritize useful connections across lipid handling and microglial signaling rather than adding nodes for their count.

| Work | Concrete result | Acceptance boundary |
| --- | --- | --- |
| Extract original experiments | Assay-specific statements, inspected locators, model/variant context and explicit unknowns | Metadata or an article title does not establish an experimental finding; retain actual source-access limits |
| Verify provenance | Exact Reactome release/member-event provenance, source reuse and publication-status checks where obtainable | Missing release and notice checks stay explicit; never infer their completion from a reachable page |
| Assess source coverage | A table connecting proposed claims to experiments and their contexts | Distinguish repeated metadata, follow-ups, shared cohorts and comparable experiments; counts are not evidence strength |
| Add source-checked content | A small versioned draft diff connecting a useful research journey | Every relationship has source-linked evidence, context, limits and accurate source-check status |
| Verify the expanded snapshot | Data validation, citation inspection, browser checks, and a recorded coverage statement | Never mark scientific release complete using structural checks alone |

Candidate discovery should begin with the existing genes and the pathway questions their reviewed sources actually support. A candidate's name, a database hit, or a generated summary does not establish a relationship. Keep genes, proteins, and variant contexts distinct. Curate disagreements only when study contexts support a meaningful comparison.

A [generated AD source-review packet](../data/alzheimers/review-packet.md) collects all 49 claims and 49 evidence records, the context comparison and source-check records. `npm run curation:check` verifies it matches the snapshot; `npm run --silent curation:packet` prints a replacement. Generation performs no source lookup or review.

`npm run curation:coverage:check` verifies the five remaining candidates and their baseline references. The prior content checkpoint extended the three-study binding evidence with one source-checked contextual comparison, preserving page-vs-indexed access. The 0.8.0 pass inspected selected ABCA1/APOE experiments; the remaining Hirsch-Reinshagen 2004 efflux candidate still needs a separate scoped extraction. Keep organism, model and preparation explicit. Such an experiment would not establish the cause of the R47H assay difference. Complete source access must be recorded before claiming a full experiment review. Independent scientific review remains a future milestone; generated packets do not create its attestations.

## Completed: automatic checks and API-update review

[CI](ci.md) runs the same native tests, data/reference/curation checks, production build and dependency safeguards on MRs targeting `master`. It uses read-only permissions, pinned official actions and script-disabled installs. Browser verification and independent scientific-release approval remain distinct; live scientific providers are not a CI requirement.

The offline [intake review command](../tools/curation/README.md#review-staged-api-updates) compares full current normalized packets with matching earlier requests and the existing graph. It reports precise content/provenance changes and identifier references, not a promoted dataset or scientific approval. Missing first-page records are not deletions. Live provider access was reverified for all four sources on 2026-11-14; seven APOE/ABCA1 packets retain 58 unchanged database records and five OpenAlex records with updated provider timestamps only. The graph remains 45 entities / 49 claims.

## Then: automate collection, preserve review

Introduce one source adapter at a time after verifying current access, attribution, and reuse terms:

1. Fetch a bounded set of candidate records into staging, recording the source release, retrieval date, and original identifiers.
2. Normalize and validate identifiers, duplicates, evidence links, and study context; show a reviewable diff from the previous snapshot.
3. Have a human assess scientific interpretation, source comparability, reuse, and publication status. Automation must not create review attestations.
4. Publish an approved, versioned snapshot that the existing explorer can read; imports must not silently replace its content.
5. Reuse the tested workflow for a second disease, then widen coverage according to source availability and review capacity.

OpenAlex metadata intake and the bounded UniProt/Reactome/Open Targets annotation adapters implement a staging boundary; see [curation tooling](../tools/curation/README.md) for their contracts, archived replay and live-access limits. No tool promotes candidates, invents claim support, or creates human-review attestations. The [four-gene seed](../data/annotations/README.md) uses existing pinned references rather than a live provider fetch. AI explanations remain optional and downstream of reviewed evidence. See [steps.md](../steps.md) for the full milestones and the [evidence policy](evidence-policy.md) for scientific release rules.

The [APOE/ABCA1 intake batch](../data/annotations/apoe-abca1-intake.md) now records successful API access to all four providers and eight selected staging records. Identity/pathway records already represented in the graph require reconciliation rather than duplication; Open Targets aggregates remain separate from original-paper findings. That staging checkpoint had abstract-level checks only and a legacy unknown raw digest, followed by 503/504 failures. The separate0.8.0 diff inspected original methods/figures and added graph records plus a fresh successful0.2.0 capture; the old packet was not relabeled. Numerical references and future scientific-review gates remain unchanged.

## Completed checkpoint: real APOE input workflow

A pinned full GSE147352 GBM-versus-normal-brain portfolio reanalysis now exercises the APOE report with real supplied statistics at unchanged default cutoffs. Exact HGNC NCBI Gene mapping preserves original IDs and all rows, requires numeric-namespace confirmation, and keeps acknowledged unresolved IDs in N/n without treating literal Reactome numeric labels as matching symbols. The two existing identifier assets and 45-entity/49-claim graph remain unchanged.

All 2,717 pathways agree with an independent SciPy oracle; browser checks cover the actual context, original APOE ID/statistics, citations/limits, gates, navigation, removal and privacy. This is computational and interaction validation of a real positive case, not AD/GBM mechanism validation or independent scientific review. The selected lipoprotein pathway has q≈0.91 and is not significant. Full tables remain outside Git/hosting; [provenance and reproduction](experimental-validation.md#real-apoe-positive-workflow-gse147352) preserve the original cohort versus reanalysis distinction and model/reuse limits.

A useful on-demand live provider lookup in the website remains a separate next checkpoint. The four-provider intake/review tools are staged/offline-review workflows; this checkpoint adds no automatic provider calls or graph promotion. These two product steps strengthen the research preview rather than completing all future evidence/review work.
