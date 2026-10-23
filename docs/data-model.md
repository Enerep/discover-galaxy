# Knowledge graph data model

Status: contract version **0.1.0** is implemented in the [TypeScript types](../apps/web/src/lib/types.ts), [JSON Schema](../data/schema/knowledge-graph.schema.json), and [runtime validator](../apps/web/src/lib/validate.ts). Content snapshot **0.4.0** contains 23 entities, 23 draft claims/evidence records, and 24 sources; its [change log](../data/alzheimers/CHANGELOG.md) records source checks. It passes development validation; independent review is a future milestone and the scientific-release gate remains separate. No application API/backend or database is implemented. Treat contract changes separately from dataset versions.

## Model boundaries

Store entities, claims, evidence, and sources separately. A biological relationship is a claim backed by evidence, not an unqualified line between two labels. A source can support several findings, and several studies can address one claim.

The 20–50 entity MVP includes displayed disease, gene, protein, drug, pathway, and paper nodes. Paper nodes are projections of publication sources and refer to their source IDs; do not duplicate publication metadata or count a paper twice. Evidence and claims are records, not additional displayed entities. Hypotheses and conflict comparisons are separate annotations.

Internal IDs are stable project identifiers. External identifiers retain their namespace, such as Ensembl for genes, UniProt for proteins, Reactome for pathways, and an explicitly selected disease or compound vocabulary. Confirm each identifier against its source. Do not use an entity's display label as its identity, infer a protein ID from a gene symbol, or silently merge ambiguous aliases.

## Snapshot envelope

| Field | Purpose |
| --- | --- |
| `schema_version` | Version of the data contract, independent of dataset content |
| `dataset_version` | Immutable identifier for this curated content release |
| `release_status` | `development` or `released`; development content is not approved scientific output |
| `created_at` | ISO 8601 date or timestamp for the snapshot |
| `scope` | Disease focus, inclusion criteria, and coverage limitations |
| `upstream_releases` | Provider, release/version or access date, source URL, applicable reuse terms and attribution |
| `entities` | Entity records |
| `claims` | Scientific relationship records |
| `evidence` | Findings tied to claims and sources |
| `sources` | Publications and upstream database records |
| `conflicts` | Reviewed comparisons of findings; may be empty |
| `hypotheses` | Labeled candidate research questions; may be empty |

A published snapshot is immutable. Corrections produce a new version and a change note describing affected records. Store provider payloads separately from the browser snapshot when retaining them is permitted; record retrieval parameters and checksums for reproducibility. The frontend must not call upstream providers to reconstruct a released graph.

Development validation permits source-checked draft records with explicit warnings so the search-to-evidence interaction can be built before scientific review is complete. The interface must retain a clear development label and the draft, source-access, reuse, and publication-status limitations. This exception does not permit fabricated records, missing citations, broken references, or automatic scientific approval. A development snapshot may contain fewer than 20 entities.

The owner's current track is the hosted **Source-checked draft** explorer. It can expand using inspected sources while independent review remains a future milestone. New source checks since 0.2.0 explicitly identify the AI checker and keep `status: draft` / `human_reviewed: false`; they are not independent approvals. Reactome source records retain access-date context with an explicit unknown database release. That is usable development provenance, not a claim to have captured an immutable upstream release. Canonical protein nodes preserve compartment/complex/modified-state scope on the relevant evidence.

`validateDataset(input, { release: true })` applies the public scientific release gate regardless of the envelope's current status. An envelope marked `released` automatically invokes the same gate, including when loaded through the normal adapter. Changing the label therefore cannot bypass review requirements.

## Entity

| Field | Requirement |
| --- | --- |
| `id` | Unique stable internal ID |
| `type` | One of `disease`, `gene`, `protein`, `drug`, `pathway`, `paper` |
| `label`, `aliases` | Display name and explicitly curated search aliases |
| `external_ids` | Array of `{ namespace, value }`; use verified IDs for biological entities |
| `description` | Optional short description; scientific statements reference approved claim IDs |
| `description_claim_ids` | Claims supporting scientific statements in the description; empty for a label-only description |
| `source_id` | Required for a paper node; resolves to a publication source |
| `provenance_source_ids` | Sources establishing entity identity and naming |

Gene variants are outside the initial entity type set. Preserve variant context on evidence and claims; adding variant nodes later requires an explicit schema extension. Layout coordinates, camera state, and visual emphasis belong to presentation data and must not encode scientific certainty.

Identity labels and aliases have their own `provenance_source_ids`; they do not establish a biomedical association. The validator conservatively warns about any nonempty description without claim links in development and rejects it in release mode. It does not attempt to decide whether prose is merely an identity label or a scientific assertion. Before release, remove unnecessary descriptions or provide appropriately reviewed claim links.

## Claim

| Field | Requirement |
| --- | --- |
| `id` | Unique stable claim ID |
| `subject_id`, `object_id` | Existing entity IDs |
| `predicate` | Controlled relationship term with documented meaning and allowed endpoint types |
| `statement` | Human-readable, scoped scientific assertion |
| `context` | Relevant organism, variant, population/model, tissue, intervention, outcome, or explicit unknowns |
| `evidence_ids` | Nonempty list of evidence records that address this claim |
| `summary`, `limitations` | Reviewed interpretation and material uncertainties |
| `review` | Status (`draft` or `approved`), `reviewer`, `date`, `rationale`, and optional `human_reviewed` attestation |

Start with narrowly defined predicates such as `associated_with`, `encodes`, `participates_in`, `interacts_with`, and `targets`. Document direction and semantics before using each one: storage subject/object order does not make `associated_with` causal or directional. `targets` describes a molecular relationship, not clinical efficacy. Add treatment-outcome predicates only with a separate definition and appropriately scoped evidence.

Do not turn graph paths into new claims automatically. Parallel claims with different contexts are valid; deduplicate only when meaning and scope match. A rendered biological edge resolves to its claim ID. A paper-to-claim citation link is visibly a citation relationship, not an additional biological assertion.

An approved review validates the record and interpretation, not the truth of the assertion. The reviewed summary and visible relationship state must distinguish supported, contested, challenged, and undetermined interpretations. A claim with only refuting or unclear findings cannot appear as an established positive relationship.

The same review object is used for claims, evidence, conflicts, and hypotheses. The original four findings retain null reviewer/date fields; draft additions since 0.2.0 name their AI source checker, check date, rationale and `human_reviewed: false`. Approved records require an identified reviewer and date. The future scientific-release contract additionally requires a real `human_reviewed: true` attestation; an automated process must never manufacture it. Structural checks cannot verify a reviewer's identity, independence or judgment.

## Evidence

| Field | Requirement |
| --- | --- |
| `id`, `claim_id` | Unique evidence ID and the claim it addresses |
| `source_id` | Original publication source for empirical claims, or a specific curated database source for a database assertion |
| `upstream_source_ids` | Database records through which this finding was located; these are provenance, not additional studies |
| `relation` | `supports`, `refutes`, `mixed`, or `unclear` relative to the precise claim |
| `finding` | Reviewed description of the result, preserving its scope |
| `locator` | Section, figure, table, passage, or record location used to verify the finding |
| `study_context` | Study design, organism, population/model, tissue, variant/intervention, outcome, and sample size when available |
| `limitations` | Relevant methodological limitations and missing information |
| `source_metrics` | Optional named provider scores with provider/release; never a generic causal probability |
| `review` | Status, reviewer, date, and rationale |

The 0.3.0 binding records use `experimental_system` and `assay` for the tested setup, and `assay_replicates` with an explicit `replicate_unit`. Their `sample_size` remains null; three assay replicates must not become three human participants.

The 0.4.0 binding records add source-scoped `binding_condition`, `protein_form`, `ligand_preparation` and `immobilized_partner`. `experiments_reported` stays separate from technical-well counts; do not multiply these fields into a pooled sample. The condition field is a recorded experiment label, not a comparability assessment. Unresolved preparation stays null.

Separate records may describe different findings from one study. Preserve the underlying study identity so those records are not counted as independent replications. Unknown values are explicit `null` values or documented unknowns, not invented measurements. A null finding is not automatically classified as `refutes`.

## Source

A corrected or retracted publication requires a dated check and a non-null original notice URL in both runtime validation and JSON Schema. A note contained in the original article may use that article's URL, with the specific location and observed scope recorded in source-check context. An observed correction is not a completed comprehensive publication-status search.

| Field | Requirement |
| --- | --- |
| `id`, `kind` | Unique source ID; `publication` or `database_record` |
| `title`, `url` | Verified title and resolvable original publication or specific database-record link |
| `identifiers` | Verified DOI, PMID, OpenAlex ID, or provider record identifiers where available |
| `publication_type` | Primary research, review, preprint, or other verified type; required for publications |
| `authors`, `year` | Verified publication metadata where available; explicitly unknown otherwise |
| `provider`, `release` | Required provider and release/access-date context for database records |
| `retrieved_at` | Date the referenced record was inspected |
| `reuse` | `terms_url`, `attribution`, `retained_content`, `date_checked`, and `permission_status` (`pending_review` or `permitted`) |
| `publication_status` | `status` (`not_checked`, `no_notice_found`, `corrected`, or `retracted`), `checked_at`, and optional notice URL as `notice_url` |

Publication URLs and bibliographic metadata do not prove a finding. That judgment belongs in the reviewed evidence record. Preprints and reviews remain visibly labeled, and retracted publications cannot provide active support in a released graph. A corrected publication requires review of the affected evidence.

`reuse.date_checked` may be null while permissions are pending. Release validation requires `permission_status: permitted` and a recorded check date for every source; changing the field without completing the underlying terms review is not permitted. Publication sources must also have a checked correction/retraction status before release. `not_checked` with a null date does not mean that no notice exists. The current starter deliberately leaves reuse pending and publication status unchecked; its own paraphrases and retained metadata are described in the [source notes](../data/alzheimers/README.md), without asserting article-text redistribution rights.

## Conflicts and hypotheses

A conflict record contains `id`, `claim_ids`, `evidence_ids`, `label`, `comparison`, `context_differences`, and `review`. References must identify the compared findings, and the comparison must explain why disagreement is meaningful despite contextual differences. Use the rules in [the evidence policy](evidence-policy.md); an empty collection is acceptable when no justified conflict has been curated.

A hypothesis record contains `id`, `question`, `basis_claim_ids`, `basis_evidence_ids`, `assumptions`, `limitations`, `suggested_test`, `origin` (`curated` or `ai_generated`), `dataset_version`, and `review`. It remains labeled as a question for investigation and never becomes a claim merely by being generated. The released snapshot contains only reviewed hypotheses; unreviewed AI output stays outside it. Record any novelty-check method and date before asserting a question is unexplored.

## Required validation before release

1. Validate the contract version, required fields, types, enum values, ID uniqueness, dates, and reference integrity. Every endpoint, evidence link, source link, and annotation reference must resolve.
2. Check claim/evidence backlinks: a claim's evidence must address that claim. Reject claims without approved evidence, and reject draft claims or evidence from the release.
3. Enforce predicate endpoint types and context requirements. Check gene/protein identity separation, ambiguous aliases, duplicate entities, and repeated study records.
4. Check empirical evidence has an original publication source and locator; database assertions have a specific record and release. Require verified citation metadata and human inspection that the source supports the finding.
5. Require approved status, a named reviewer, review date, and `human_reviewed: true` for every claim, evidence record, conflict, and hypothesis. Validate conflict comparisons and hypothesis bases; never reinterpret either as primary evidence.
6. Confirm the released graph has 20–50 displayed entities, including paper nodes; every scientific description resolves to approved claims. Confirm paper projections reference their canonical publication sources.
7. Verify provenance, retrieval information, attribution, reuse terms, dataset limitations, and correction/retraction handling. Require source reuse permission and its check date, and checked publication status for publication sources. Check URLs without treating HTTP success as scientific validation.

Automated checks enforce structure and catch missing provenance; they cannot establish that a study supports an interpretation. The runtime validator adds cross-record IDs, reciprocal evidence links, endpoint types, duplicate identities, hypothesis bases, and release gates to the machine-readable schema. The [data tests](../apps/web/src/lib/dataset.test.ts) cover malformed inputs, missing references and citations, search aliases, paper projections, development/release separation, and the checked-in starter. Test-only synthetic review records are isolated from the application dataset.
