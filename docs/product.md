# Product specification

## Goal

Help researchers navigate a small, evidence-traceable map of Alzheimer's research, understand why entities are connected, and formulate questions they can investigate. The broader “galaxy of humanity's knowledge” is the long-term direction; the initial product covers one deliberately curated slice.

The central product promise is **from a visible connection to its supporting evidence in a few clear interactions**.

The product direction is to help a researcher judge what a relationship rests on and what needs checking before using it. Source-specific comparison, visible missing context, and portable cited briefs make that task concrete. A larger graph alone does not fulfill this direction, and the product makes no claim that these capabilities are exclusive to Discovery Galaxy.

## Audience

The initial audience is biomedical researchers, research trainees, and scientifically literate readers exploring relationships across genetics, disease biology, pathways, and literature. The product supports literature orientation and research planning. It does not evaluate individual patients or recommend treatment.

## Core journey

1. Open a restrained galaxy view with a visible search field, legend, and list-view option.
2. Search for “Alzheimer's disease” or a curated alias and focus the disease neighborhood.
3. Select APOE or another source-checked entity. See its type, identifiers, description, and connected claims.
4. Select a relationship. Read the exact claim, evidence, study context, source references, and limitations.
5. Choose **Compare findings**. Read the two source records side by side, inspect recorded context differences and unknowns, then download a cited brief for further reading.
6. Follow the finding's **View …** action from gene to protein to a cited pathway and another participant. Distinguish database annotations from original studies.
7. In later content milestones, inspect justified disagreements and research questions with explicit premises and uncertainty.

Search is local entity/alias lookup in the first version. Unsupported searches explain that the curated dataset has limited coverage; they do not invent entities or trigger an unbounded AI answer.

## MVP capabilities

| Capability | Required behavior |
| --- | --- |
| 3D exploration | Select and focus entities; distinguish entity types; expose labeled relationship details |
| Search and filters | Search labels, aliases, and curated identifiers; show active filters and no-result states |
| Evidence inspection | Show exact claims, evidence direction, context, uncertainty, and links to original references |
| Finding comparison | Align claim scope and source-specific context without pooling participants or inferring agreement, conflict, independence, or strength; preserve citations in a downloadable brief |
| Pathways | Represent reviewed pathway relationships using stable identifiers and cited provenance |
| Conflicting findings | Show curator-reviewed comparisons with context and limitations |
| Research questions | Present testable, sourced questions, labeled as hypotheses or proposals |
| Explanations | Provide curator-written summaries; optional AI can later explain the same reviewed material |
| Accessible exploration | Provide the same content through searchable lists and keyboard-operable panels |

## Dataset scope

The release target is 20–50 entities, including any displayed paper nodes. Claims, evidence, sources, and provenance are separate records and do not count as additional visible entities unless a source is explicitly represented as a paper node.

Alzheimer's disease, APOE, ABCA1, and TREM2 are curation priorities. Other genes, proteins, pathways, drugs, and papers are included only when they support a useful, reviewed journey. Variants remain explicit claim and study context in the initial schema; separate variant nodes require a later contract extension. Coverage is selective, not a comprehensive statement of the field. No particular connection, conflict, or drug claim is approved by naming a candidate here.

## Scientific presentation

- Distinguish association, mechanism, intervention results, and proposed hypotheses.
- Preserve differences between genes, proteins, variants, organisms, study populations, and endpoints.
- Label the basis of a relationship instead of presenting a universal confidence percentage.
- Explain that spatial proximity, node size, glow, and graph connectivity are navigation choices unless a specific scientific measure is explicitly defined and sourced.
- Keep uncertainty and disagreement visible. Do not treat an absent edge as evidence that a relationship is unstudied.
- Keep model-generated text visually identifiable and linked to the reviewed evidence it used.

The [evidence policy](evidence-policy.md) and [data model](data-model.md) define the detailed rules.

The current 21-entity explorer is a **Source-checked draft**. Independent scientific review is a future milestone, as requested by the owner, and does not block source-checked development. Gene/product mappings, curated pathway participation and experimental findings retain different meanings. Exact source-check provenance and limits remain accessible; the interface must not imply an independent approval that has not occurred.

Comparison labels describe recorded values only: matching, different, or missing. The APOE ε4 and ε2/ε3 findings concern different variant contexts; the interface must not turn that difference into a contradiction. Likewise, TREM2's 2,261 sequenced discovery individuals remain a source-specific subset, while its total sample-size field stays unrecorded. Repeated source IDs, PMIDs, or DOIs can expose repeated references; different citations do not establish independent cohorts. Reading prompts identify source checks to make and are not reviewed hypotheses or proof of a research gap.

## Experience requirements

Follow the standing [design guide](design.md) for every interface and copy change. Use a simple evidence-first workspace: one search field, one filter, one graph/list switch, and a readable finding panel. Prefer plain action labels and useful study information over promotional copy, decorative counters, or repeated navigation. Use light or dark neutral interface surfaces around the dark graph and reserve accents for interaction and meaning.

The scientific content must be available without interacting with a 3D canvas. Search, selection, filtering, and opening evidence should work using a keyboard. Use text and symbols as well as color, respect reduced-motion preferences, and avoid flashing or perpetual camera movement. On WebGL failure, retain the list and evidence panels.

Keep labels and selection readable before adding decorative effects. Loading, invalid data, empty results, unsupported searches, and unavailable optional AI each need an explicit state. The app must show the dataset version and coverage limits.

Use short, interruptible transitions for selection, details, and camera navigation. The scene should settle when interaction ends. Reduced-motion preferences require immediate state changes without nonessential animation. Keep focus and scrolling under user control, and preserve source-specific study context when progressively disclosing details.

Open comparison from the selected finding, preserve the underlying research view, and keep original citations visible. Its two native finding selectors and aligned table must work with a keyboard, narrow screens, either theme, and unavailable WebGL. Advanced provenance and reading prompts belong in disclosures rather than extra permanent navigation.

## Out of scope for the first release

General scientific search, autonomous discovery, automatic contradiction detection, personalized medicine, claims of therapeutic efficacy, accounts, collaborative editing, continuous ingestion of all literature, and a complete biomedical knowledge graph.

## MVP acceptance criteria

- A new contributor can follow documented commands to run the app with a local snapshot and no service credentials.
- Users can search for Alzheimer's, inspect APOE, follow a reviewed pathway relationship, and open original supporting evidence.
- The snapshot contains 20–50 curated entities with valid IDs and explicit release provenance.
- Every public scientific relationship and factual summary is linked to reviewed evidence; no synthetic fixture or unreviewed claim appears in the scientific demo.
- At least one verified disagreement comparison and one curator-reviewed research question demonstrate their respective features. Without suitable evidence, keep those features and the full MVP milestone pending.
- The list and keyboard flows provide the same scientific information as the graph, including when WebGL is unavailable.
- The selected build and data checks pass, and a scientific content review is recorded.

AI is optional for these criteria. Its eventual value must come from clearer, grounded explanations, not the appearance of discovering new facts.

## Decisions still to make during implementation

Choose compatible package/runtime versions, the exact curated entity list and references, scientific review ownership, and eventual hosting. Original software and project documentation use the [MIT License](../LICENSE); source-specific data reuse remains a separate review. Select an AI provider and persistent infrastructure only if their milestones are undertaken. These choices do not block creating the first local vertical slice.
