# Checkpoints

## Current checkpoint: prepare the Alzheimer's evidence expansion

The [candidate-source coverage packet](../data/alzheimers/candidate-coverage.md) stages six original publications and two human Reactome pathway records, grouped into three source-reading questions. It records lookup dates, indexed-excerpt versus page access, unknown study context, pending publication/reuse checks, and unresolved database releases. Its validator checks source identity and baseline references; a generated extract does not approve the interpretation or add graph records.

This selective, AI-assisted lookup is separate from the OpenAlex API adapter. No successful live OpenAlex response or Reactome release lookup is claimed. The current public graph remains eight entities and four draft claims. The next concrete handoff is a human review of the existing packet and relevant original candidate sources, followed by a small, separately reviewable dataset diff.

## Implemented foundation: compare the evidence behind a connection

The app still covers **Alzheimer's disease only**: one disease, three genes, four papers, and four draft claims. This checkpoint changes the research workflow, not the scientific snapshot. It helps a reader inspect what two findings actually studied before interpreting them together.

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

Keep the next content pass focused on AD: review the four existing APOE, ABCA1, and TREM2 findings, stage a bounded set of candidate AD sources, then add reviewed genes, pathways, and papers toward the **20–50 entity** release target. Add relationships only when they create a useful, supported route to original evidence.

| Work | Concrete result | Acceptance boundary |
| --- | --- | --- |
| Review the starter packet | Recorded reviews or explicit unresolved issues for the four current findings | Actual named human review, inspected source locations, reuse assessment, and correction/retraction checks; pending items stay pending |
| Find candidate sources | A bounded list of original studies and authoritative pathway records for AD | Candidates remain separate from approved graph records; preserve database versions, identifiers, and retrieval dates |
| Assess source coverage | A table connecting each proposed claim to its studies and study contexts | Distinguish independent studies from repeated metadata, follow-ups, reviews, and reused cohorts; publication count is not evidence strength |
| Add reviewed content | Versioned additions toward 20–50 entities and at least one useful pathway journey | Every relationship has a scoped claim, source-specific evidence, limitations, and eligible review status |
| Verify the expanded snapshot | Data validation, citation inspection, browser checks, and a recorded coverage statement | Never mark scientific release complete using structural checks alone |

Candidate discovery should begin with the existing genes and the pathway questions their reviewed sources actually support. A candidate's name, a database hit, or a generated summary does not establish a relationship. Keep genes, proteins, and variant contexts distinct. Curate disagreements only when study contexts support a meaningful comparison.

A [generated AD review packet](../data/alzheimers/review-packet.md) now collects the four existing findings and their outstanding checks. `npm run curation:check` verifies it matches the snapshot; `npm run --silent curation:packet` prints a reproducible replacement. It performs no source lookup or scientific review.

The bounded [candidate-source coverage table](../data/alzheimers/candidate-coverage.md) is prepared; `npm run curation:coverage:check` checks its references and freshness against the starter. The next reviewable deliverable is the **scientific review of the starter and selected candidate sources**, followed by a small reviewed dataset diff. A generated extract or candidate list alone does not expand the released graph or satisfy M2.

## Then: automate collection, preserve review

Introduce one source adapter at a time after verifying current access, attribution, and reuse terms:

1. Fetch a bounded set of candidate records into staging, recording the source release, retrieval date, and original identifiers.
2. Normalize and validate identifiers, duplicates, evidence links, and study context; show a reviewable diff from the previous snapshot.
3. Have a human assess scientific interpretation, source comparability, reuse, and publication status. Automation must not create review attestations.
4. Publish an approved, versioned snapshot that the existing explorer can read; imports must not silently replace its content.
5. Reuse the tested workflow for a second disease, then widen coverage according to source availability and review capacity.

The OpenAlex metadata adapter begins the staging boundary; see [curation tooling](../tools/curation/README.md) for its current contract and limitations. Open Targets and Reactome adapters remain planned. No tool promotes candidates, invents claim support, or creates human-review attestations. AI explanations remain optional and downstream of reviewed evidence. See [steps.md](../steps.md) for the full milestones and the [evidence policy](evidence-policy.md) for scientific release rules.
