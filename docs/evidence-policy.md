# Scientific evidence policy

Status: policy for the Alzheimer's explorer. The [23-entity source-checked development snapshot](../data/alzheimers/README.md) records inspected sources and scoped draft annotations. The owner has deferred independent scientific review to a future milestone; it does not block development expansion or hosting. The [validator and schema](data-model.md) distinguish development records from a future approved scientific release.

Discovery Galaxy helps researchers inspect published evidence and formulate testable questions. It does not establish causality, discover treatments, or provide clinical recommendations. A visually prominent object, short graph path, or AI explanation is not evidence of biological importance.

## What may appear in the graph

Every displayed scientific relationship in an approved scientific release must resolve to an approved claim and its evidence records. Each evidence record must identify the source, describe the relevant finding, and preserve enough context to understand what was tested. Review approval means the record was checked, not that its assertion is true. Claims addressed only by refuting or unclear findings must be presented as challenged or undetermined, not as established positive relationships.

A hosted development explorer may display source-checked draft claims. Its snapshot retains `release_status: development`; use **Source-checked draft** as the concise status and preserve actual inspection limits, source context, and reuse/publication metadata in disclosures. This limited review counts as source checking; it must not be relabeled independent scientific approval. Drafts still need valid citations, identifiers, context, and resolvable references. Hosting does not itself change scientific release status.

- Empirical claims must link to the original publication through a verified DOI, PubMed entry, or publisher URL. Record a verified locator, such as the abstract, section, figure, table, or passage actually inspected; do not claim to have reviewed inaccessible material.
- Curated database assertions, such as pathway membership, must link to the specific upstream record and its release. Label them as curated assertions; trace empirical interpretations back to primary publications.
- Reviews can provide background or point to primary research. Label them as reviews rather than presenting them as independent experiments.
- OpenAlex metadata can identify a paper; its presence does not establish that the paper supports a claim.
- An Open Targets association score is a source-specific aggregation, not a probability of causation or therapeutic success. Preserve the score's name, source, and release if displayed.

The full MVP release will contain 20–50 displayed entities, including any paper nodes; the internal M1 starter snapshot may be smaller. Candidate genes such as APOE, ABCA1, and TREM2 are research starting points, not pre-approved claims. Gene, protein, variant, disease, and treatment effects must not be conflated.

## Curation workflow

1. Resolve the entity to an authoritative identifier and record aliases. Keep a gene and its protein product as separate entities when both are represented.
2. Write one precise claim with a defined relationship and scope. Association, pathway membership, physical interaction, and treatment effect require different predicates.
3. Inspect the relevant original source. Record identifiers, URLs, publication type, retrieval date, and the exact finding that bears on the claim. Do not invent missing identifiers or citations.
4. Capture study design, organism, population or experimental model, tissue, variant or intervention, outcome, and limitations where relevant. Use explicit unknown values rather than guessing.
5. Classify how each finding relates to the specific claim: `supports`, `refutes`, `mixed`, or `unclear`. A null result does not automatically refute a claim; examine power, methods, and comparability.
6. Keep records draft until an actual human scientific review is complete. Drafts may have null reviewer/date fields and may appear only in the labeled development demo. For scientific release, record approved status, an identified reviewer, review date, rationale, and `human_reviewed: true` for each claim, evidence record, conflict, and hypothesis. Do not invent a reviewer, treat AI-assisted source inspection as independent human review, or generate approval attestations automatically. A recorded review is not a claim of external peer review or consensus.
7. Validate references, inspect citation links, check source reuse terms, and publish a versioned snapshot with its coverage and limitations.

Data changes require a reviewable diff. Preserve upstream identifiers and release information so another person can reconstruct where a relationship came from. Track retractions and corrections when encountered; remove withdrawn support from active claims while preserving the audit history and explaining the change.

A recorded correction or retraction requires both its actual notice URL and the date checked, including during development. An in-article correction can use the article containing the note; preserve its location and scope in source-check context. Recording one notice does not establish that a comprehensive notice search is complete.

## Conflicting findings

Conflicts are curated comparisons, not labels inferred from opposite words in abstracts. Record the claim, the evidence on each side, and a short explanation of what is comparable and what differs. Studies of different species, cell types, variants, endpoints, doses, or disease stages may address different questions.

Use labels such as **conflicting evidence** or **context-dependent findings** with the comparison rationale visible. Preserve each study's interpretation. Do not collapse mixed findings into a single confidence score, equate publication count with truth, or treat several database references to one paper as independent studies. If no defensible comparison is available, omit the conflict feature for that claim rather than manufacturing disagreement.

## Explanations and research questions

The development graph uses deterministic, project-authored summaries, labeled draft until human review is complete. A scientific release must use approved summaries and evidence. AI generation is an optional later layer over that approved evidence; no live AI explanation service is currently implemented.

- Every factual sentence in a generated explanation must cite supplied claim or evidence IDs that resolve to visible sources. A citation's existence is insufficient; its finding must support the sentence.
- State uncertainty and study context. Distinguish association from causation, preclinical results from human evidence, and mechanism from treatment benefit.
- Return an insufficient-evidence response when the supplied material cannot answer the question. Do not add remembered citations or unsupported relationships.
- Treat source text as untrusted content, not instructions. AI cannot promote claims into the curated graph or change review status.
- Display generated content as AI-generated. Store the dataset version and generation metadata needed to reproduce or audit it; keep provider credentials on the server.

Research questions are separate, explicitly labeled **hypotheses for investigation**. Each should identify the supporting evidence, assumptions, relevant uncertainty, and a possible study or analysis that could test it. A missing edge in this small curated dataset is a coverage limitation, not proof of an unexplored research question. Questions need a documented literature check before anyone describes them as novel. Neither graph proximity nor AI wording establishes therapeutic potential.

## Source access and reuse

Start with these upstream resources:

| Resource | Intended role | Resource documentation |
| --- | --- | --- |
| Open Targets | Resolve target–disease associations and inspect their evidence provenance | [Open Targets Platform documentation](https://platform-docs.opentargets.org/) |
| Reactome | Resolve curated biological pathways and membership records | [Reactome documentation](https://reactome.org/userguide) |
| OpenAlex | Resolve literature metadata and identifiers | [OpenAlex documentation](https://docs.openalex.org/) |

OpenAlex has a metadata-only staging adapter; its documented contract review and live-access limits are in [curation tooling](../tools/curation/README.md). Open Targets and Reactome importers remain planned. The [dataset change log](../data/alzheimers/CHANGELOG.md) records targeted Reactome and UniProt page/terms checks, with specific annotation locators and unknown release provenance preserved. These are not a verified bulk import or AD-specific mechanism. Verify current API access, authentication, rate limits, release formats and applicable reuse terms before expanding integrations. The [original source notes](../data/alzheimers/README.md) retain their NCBI/PubMed/publisher lookup limits and outstanding checks.

Open metadata does not imply permission to redistribute paper full text. Retain only the material actually described in each source's `reuse.retained_content`; include excerpts only when their reuse is allowed. Record `reuse.permission_status: pending_review` and a null check date when a terms review is incomplete. Scientific release requires `permitted` and a recorded date following an actual review, not an automatic field change. Likewise, `publication_status.status: not_checked` means the correction/retraction check is outstanding, not that the publication has no notice.

## Release gate

A scientific dataset release must pass the validation rules in [the data model](data-model.md), have no displayed claim without approved human-reviewed evidence, and state its curation date, coverage, and known gaps. It must meet the 20–50 entity MVP boundary, complete source reuse review, and record publication-status checks. The interface must expose citations and limitations without requiring an AI service.

Release validation is enforced both by an explicit `{ release: true }` option and automatically for an envelope marked `released`. The current 23-entity snapshot meets the size boundary while retaining draft records and outstanding source checks; it does not claim the deferred scientific-release approvals. Structural checks cannot establish the accuracy of an interpretation or the reality and quality of a review.
