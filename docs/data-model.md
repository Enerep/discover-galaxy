# Knowledge graph data model

Status: proposed contract for the first curated JSON snapshot. There is no dataset, executable schema, validator, API, or database implementation yet. Define machine-readable schemas before adding scientific records; treat changes to this contract as versioned changes.

## Model boundaries

Store entities, claims, evidence, and sources separately. A biological relationship is a claim backed by evidence, not an unqualified line between two labels. A source can support several findings, and several studies can address one claim.

The 20–50 entity MVP includes displayed disease, gene, protein, drug, pathway, and paper nodes. Paper nodes are projections of publication sources and refer to their source IDs; do not duplicate publication metadata or count a paper twice. Evidence and claims are records, not additional displayed entities. Hypotheses and conflict comparisons are separate annotations.

Internal IDs are stable project identifiers. External identifiers retain their namespace, such as Ensembl for genes, UniProt for proteins, Reactome for pathways, and an explicitly selected disease or compound vocabulary. Confirm each identifier against its source. Do not use an entity's display label as its identity, infer a protein ID from a gene symbol, or silently merge ambiguous aliases.

## Snapshot envelope

| Field | Purpose |
| --- | --- |
| `schema_version` | Version of the data contract, independent of dataset content |
| `dataset_version` | Immutable identifier for this curated content release |
| `created_at` | ISO 8601 timestamp for the snapshot |
| `scope` | Disease focus, inclusion criteria, and coverage limitations |
| `upstream_releases` | Provider, release/version or access date, source URL, applicable reuse terms and attribution |
| `entities` | Entity records |
| `claims` | Scientific relationship records |
| `evidence` | Findings tied to claims and sources |
| `sources` | Publications and upstream database records |
| `conflicts` | Reviewed comparisons of findings; may be empty |
| `hypotheses` | Labeled candidate research questions; may be empty |

A published snapshot is immutable. Corrections produce a new version and a change note describing affected records. Store provider payloads separately from the browser snapshot when retaining them is permitted; record retrieval parameters and checksums for reproducibility. The frontend must not call upstream providers to reconstruct a released graph.

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
| `review` | Status (`draft` or `approved`), reviewer, review date, and rationale |

Start with narrowly defined predicates such as `associated_with`, `encodes`, `participates_in`, `interacts_with`, and `targets`. Document direction and semantics before using each one: storage subject/object order does not make `associated_with` causal or directional. `targets` describes a molecular relationship, not clinical efficacy. Add treatment-outcome predicates only with a separate definition and appropriately scoped evidence.

Do not turn graph paths into new claims automatically. Parallel claims with different contexts are valid; deduplicate only when meaning and scope match. A rendered biological edge resolves to its claim ID. A paper-to-claim citation link is visibly a citation relationship, not an additional biological assertion.

An approved review validates the record and interpretation, not the truth of the assertion. The reviewed summary and visible relationship state must distinguish supported, contested, challenged, and undetermined interpretations. A claim with only refuting or unclear findings cannot appear as an established positive relationship.

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

Separate records may describe different findings from one study. Preserve the underlying study identity so those records are not counted as independent replications. Unknown values are explicit `null` values or documented unknowns, not invented measurements. A null finding is not automatically classified as `refutes`.

## Source

| Field | Requirement |
| --- | --- |
| `id`, `kind` | Unique source ID; `publication` or `database_record` |
| `title`, `url` | Verified title and resolvable original publication or specific database-record link |
| `identifiers` | Verified DOI, PMID, OpenAlex ID, or provider record identifiers where available |
| `publication_type` | Primary research, review, preprint, or other verified type; required for publications |
| `authors`, `year` | Verified publication metadata where available; explicitly unknown otherwise |
| `provider`, `release` | Required provider and release/access-date context for database records |
| `retrieved_at` | Date the referenced record was inspected |
| `reuse` | Applicable terms URL, attribution, permitted retained content, and date checked |
| `publication_status` | Retraction/correction status as checked, including check date and any relevant notice URL |

Publication URLs and bibliographic metadata do not prove a finding. That judgment belongs in the reviewed evidence record. Preprints and reviews remain visibly labeled, and retracted publications cannot provide active support in a released graph. A corrected publication requires review of the affected evidence.

## Conflicts and hypotheses

A conflict record contains `id`, `claim_ids`, `evidence_ids`, `label`, `comparison`, `context_differences`, and `review`. References must identify the compared findings, and the comparison must explain why disagreement is meaningful despite contextual differences. Use the rules in [the evidence policy](evidence-policy.md); an empty collection is acceptable when no justified conflict has been curated.

A hypothesis record contains `id`, `question`, `basis_claim_ids`, `basis_evidence_ids`, `assumptions`, `limitations`, `suggested_test`, `origin` (`curated` or `ai_generated`), `dataset_version`, and `review`. It remains labeled as a question for investigation and never becomes a claim merely by being generated. The released snapshot contains only reviewed hypotheses; unreviewed AI output stays outside it. Record any novelty-check method and date before asserting a question is unexplored.

## Required validation before release

1. Validate the contract version, required fields, types, enum values, ID uniqueness, dates, and reference integrity. Every endpoint, evidence link, source link, and annotation reference must resolve.
2. Check claim/evidence backlinks: a claim's evidence must address that claim. Reject claims without approved evidence, and reject draft claims or evidence from the release.
3. Enforce predicate endpoint types and context requirements. Check gene/protein identity separation, ambiguous aliases, duplicate entities, and repeated study records.
4. Check empirical evidence has an original publication source and locator; database assertions have a specific record and release. Require verified citation metadata and human inspection that the source supports the finding.
5. Require reviewer and review date for approved records. Validate conflict comparisons and hypothesis bases; never reinterpret either as primary evidence.
6. Confirm the released graph has 20–50 displayed entities, including paper nodes; every scientific description resolves to approved claims. Confirm paper projections reference their canonical publication sources.
7. Verify provenance, retrieval information, attribution, reuse terms, dataset limitations, and correction/retraction handling. Check URLs without treating HTTP success as scientific validation.

Automated checks can enforce structure and catch missing provenance. They cannot establish that a study supports an interpretation. Implement the first validator alongside the curated snapshot, with negative fixtures covering dangling references, missing citations, and unapproved records.
