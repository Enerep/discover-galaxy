# Checkpoints

## Current checkpoint: inspect different R47H assay results

Snapshot **alzheimers-source-checked-0.5.0** has **24 entities, 24 cited draft claims and one draft study-context comparison**. A Lessard 2018 finding reports no significant APOE3 affinity difference between wild-type and R47H TREM2 in its lipidated-protein BLI assay. The context note compares that scoped report with Atagi 2015's reduced-binding finding while preserving different preparations, constructs and readouts. The [dataset changes](../data/alzheimers/CHANGELOG.md) record inspected publisher text, figure captions, unknown replicate totals and CC BY attribution. This does not establish identical binding, a settled contradiction, the cause of the difference or clinical effects.

The interface uses **Source-checked draft**. Users can follow a finding's **View …** action from a gene to its protein, then a pathway and another participant. Protein/pathway filters and distinct database-record labels support this through graph, list, keyboard, touch and WebGL fallback. The owner deferred independent scientific review to a future milestone; it is not a blocker for this development track, and no independent approval or human attestation is fabricated.

The binding findings expose the study and condition in their controls, with experimental system and assay beside the citation. Comparison prefers the same recorded condition in a different publication on the same relationship where available; publication IDs, PMIDs and DOIs prevent repeated metadata from being preferred as another paper. This is a navigation default, not a comparability or replication judgment. Experimental comparisons put assay context first, retaining unknowns, technical units, repeated-experiment counts and shared-paper checks. Source disclosures and Markdown exports include the original correction notice link/date. Protein/pathway filters survive shared-link creation and restoration.

The [candidate-source coverage packet](../data/alzheimers/candidate-coverage.md) now retains six original publications outside the graph, grouped into three reading questions. The two prior pathway candidates entered through the separately source-checked dataset diff. This selective lookup is separate from the OpenAlex adapter; no successful live API request or exact Reactome release capture is claimed.

## Implemented foundation: compare the evidence behind a connection

The app covers **Alzheimer's disease only**. Comparison helps a reader inspect what two findings or annotations actually describe before interpreting them together.

The owner reports a working Vercel deployment. Sharing and Light / Dark / System are part of the existing foundation. The current checkpoint's observed checks belong in [verification](verification.md); hosting and interface completion do not change the dataset's review status.

The comparison and intake boundaries are:

- Open **Compare findings** from the evidence panel, choose two existing findings, and keep their statements and original citations visible.
- Align source-specific organism, variant, intervention, endpoint, design, population, tissue, sample size, and additional recorded context. Keep claim scope separate and unknown values explicit; never pool participant counts.
- Label exact recorded fields matching, different, or missing. These labels do not determine agreement, contradiction, comparability, evidence strength, or study independence.
- Expose repeated source IDs, PMIDs, or DOIs without treating different publication identities as proof of independent replication.
- Offer source-reading prompts derived from recorded differences and missing context. They are not new hypotheses, verified research gaps, or curator-reviewed disagreement records.
- Download a complete Markdown brief with citations, locators, limitations, actual review/source status, and dataset version. Preserve the underlying explorer state, keyboard access, both themes, narrow-table scrolling, and WebGL fallback.
- Stage a bounded first page of OpenAlex literature metadata or normalize an archived response. Candidates remain unreviewed and outside the graph; exclude abstracts/full text and preserve query/retrieval provenance. Offline contract checks do not verify a live API request.

The intended product value is a traceable path from a connection to the evidence and checks needed to use it. Reviewed pathways, intervention findings, and grounded research questions can deepen that path later. Adding more edges or calling an automated output a discovery does not meet this checkpoint's scientific purpose.

## Next checkpoint: deepen the Alzheimer's evidence

The development snapshot meets the **20–50 entity size target**. Next, inspect selected original papers from the staged list at assay level and add precise, cited draft findings when the source supports them. Prioritize useful connections across lipid handling and microglial signaling rather than adding nodes for their count.

| Work | Concrete result | Acceptance boundary |
| --- | --- | --- |
| Extract original experiments | Assay-specific statements, inspected locators, model/variant context and explicit unknowns | Metadata or an article title does not establish an experimental finding; retain actual source-access limits |
| Verify provenance | Exact Reactome release/member-event provenance, source reuse and publication-status checks where obtainable | Missing release and notice checks stay explicit; never infer their completion from a reachable page |
| Assess source coverage | A table connecting proposed claims to experiments and their contexts | Distinguish repeated metadata, follow-ups, shared cohorts and comparable experiments; counts are not evidence strength |
| Add source-checked content | A small versioned draft diff connecting a useful research journey | Every relationship has source-linked evidence, context, limits and accurate source-check status |
| Verify the expanded snapshot | Data validation, citation inspection, browser checks, and a recorded coverage statement | Never mark scientific release complete using structural checks alone |

Candidate discovery should begin with the existing genes and the pathway questions their reviewed sources actually support. A candidate's name, a database hit, or a generated summary does not establish a relationship. Keep genes, proteins, and variant contexts distinct. Curate disagreements only when study contexts support a meaningful comparison.

A [generated AD source-review packet](../data/alzheimers/review-packet.md) collects all 24 findings, the context comparison and source-check records. `npm run curation:check` verifies it matches the snapshot; `npm run --silent curation:packet` prints a replacement. Generation performs no source lookup or review.

`npm run curation:coverage:check` verifies the six remaining candidates and their baseline references. This checkpoint extends the three-study binding evidence with one source-checked contextual comparison, preserving page-vs-indexed access. Next, deepen assay coverage with a further original source or add a separately identified model-specific lipid-handling experiment. Complete source access must be recorded before claiming a full experiment review. Independent scientific review remains a future milestone; generated packets do not create its attestations.

## Then: automate collection, preserve review

Introduce one source adapter at a time after verifying current access, attribution, and reuse terms:

1. Fetch a bounded set of candidate records into staging, recording the source release, retrieval date, and original identifiers.
2. Normalize and validate identifiers, duplicates, evidence links, and study context; show a reviewable diff from the previous snapshot.
3. Have a human assess scientific interpretation, source comparability, reuse, and publication status. Automation must not create review attestations.
4. Publish an approved, versioned snapshot that the existing explorer can read; imports must not silently replace its content.
5. Reuse the tested workflow for a second disease, then widen coverage according to source availability and review capacity.

The OpenAlex metadata adapter begins the staging boundary; see [curation tooling](../tools/curation/README.md) for its current contract and limitations. Open Targets and Reactome adapters remain planned. No tool promotes candidates, invents claim support, or creates human-review attestations. AI explanations remain optional and downstream of reviewed evidence. See [steps.md](../steps.md) for the full milestones and the [evidence policy](evidence-policy.md) for scientific release rules.
