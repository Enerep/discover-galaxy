# Implementation steps

**Current stage: human RNA-seq interpretation is implemented beside the 32-entity Source-checked draft explorer and local research brief; independent scientific review is a future milestone.**

Checkboxes distinguish implemented work from remaining milestones. Complete them in order unless a documented dependency allows parallel work. Check an item only after its acceptance criteria are met. Actual setup and check commands are in [README.md](README.md).

The [checkpoint plan](docs/checkpoints.md) now prioritizes interpreting experimental results and developing ideas to investigate. The curated evidence library remains Alzheimer's-only; a separate broad human pathway reference supports analysis. Further source curation and independent review remain separate future milestones.

## M0 — Establish the foundation

- [x] Define the Alzheimer's MVP and its limits in [README.md](README.md) and [docs/product.md](docs/product.md).
- [x] Record agent and contributor instructions.
- [x] Document the architecture, data contract, evidence policy, and technical decisions.
- [x] Write this implementation and validation plan.

**Done when:** the documents agree on scope, distinguish plans from working features, and link to one another correctly.

## M1 — Build a runnable vertical slice

The smallest useful flow is: search → select an entity → inspect a relationship → open its original evidence.

- [x] Scaffold `apps/web/` with React, TypeScript, Vite, React Three Fiber, and native Three.js controls; record supported runtime versions and commit a lockfile. Drei is unnecessary for this slice.
- [x] Add actual install, development, typecheck, test, and production-build commands to the README. Lint tooling has not been introduced.
- [x] Create the dataset adapter, machine-readable schema, and validator from [docs/data-model.md](docs/data-model.md). Reject broken IDs and uncited claims, including during development.
- [x] Curate a source-checked development snapshot in `data/alzheimers/`, with valid identities, cited relationships, source context and recorded reuse/publication-status checks or explicit unresolved fields.
- [x] Render selectable nodes and relationships with a legend, restrained motion, and a clear selected state.
- [x] Add alias-aware local search, an entity panel, and a relationship/evidence panel.
- [x] Add a synchronized searchable list, keyboard access to selection and evidence, reduced-motion support, and a WebGL failure state.
- [x] Handle loading, invalid data, no results, and missing optional metadata without inventing content.
- [x] Run the implemented checks and exercise the search-to-evidence flow in desktop/mobile browser tests, including WebGL failure. See [verification](docs/verification.md).

The current snapshot has 32 source-linked entities and 33 draft claims, including the original four variant-scoped association findings. The interface uses **Source-checked draft**. The owner has deferred independent scientific review and authorized continued development; the separate future scientific-release gate remains intact. Actual source checks, reuse status, unknown releases and publication-status limits stay recorded. Synthetic fixtures remain isolated in tests.

**Done when:** a clean local setup runs with no service credentials, and a user can search for Alzheimer's, select APOE, inspect a source-checked draft relationship, and open its cited evidence through graph or list. Independent scientific approval belongs to the future release milestone.

The source-checked development journey is usable now; structural checks never manufacture scientific approval.

### Explorer UX refinement

- [x] Record [standing design requirements](docs/design.md) and make `master` the explicit default working branch in the agent guide.
- [x] Simplify the workspace to one search field, one type filter, one Graph/List switch, and a readable evidence panel.
- [x] Put original-paper links before detailed study metadata; preserve claim context and limitations in disclosures.
- [x] Add keyboard search-result navigation, visible zoom/reset controls, and explicit mobile evidence/back navigation without automatic page scrolling.
- [x] Smooth selection, camera movement, and disclosure transitions; honor reduced motion and verify that graph rendering settles at rest.
- [x] Exercise the revised desktop, touch/mobile, and WebGL-fallback flows in browser checks. Scientific release criteria remain pending.
- [x] Record the owner's copy and UX/DX/AX rules in `AGENTS.md`; group controls, remove repeated labels/instructions, share citation formatting and retain scientific context in disclosures.

### Sharing and review preparation

- [x] Export the current graph and selected finding as a cited PNG; provide an evidence card in List mode or without WebGL.
- [x] Offer native image sharing where available and preserve a download option.
- [x] Copy validated links that restore the entity, finding, query, filter, and view; test reload, navigation, invalid links, and clipboard denial.
- [x] Add a static social-link thumbnail and crawler-visible Open Graph/Twitter metadata for the public Vercel address; verify the production artifacts separately from social-platform caches.
- [x] Generate a reproducible AD review packet for the four existing findings without changing their draft status.

### Appearance

- [x] Verify Light, Dark, and System controls, local preference persistence, operating-system changes, and the `#1F1F24` dark background.
- [x] Check readable evidence, controls, dialogs, mobile layout, and sharing in both themes without resetting the current view; record observed results in [verification](docs/verification.md).

### Evidence comparison and candidate intake

- [x] Implement two-finding comparison with original citations, exact recorded context labels, preserved unknowns, source-specific participant counts, and a complete downloadable Markdown brief.
- [x] Verify comparison through keyboard, both themes, narrow screens, and unavailable WebGL; record observed checks separately from scientific review.
- [x] Verify bounded OpenAlex metadata intake and archived-response normalization, keeping candidates unreviewed and outside the graph; record live API availability separately from offline contract checks. Offline/simulated-network checks pass; the live request did not complete in this workspace.
- [ ] Complete a successful bounded live OpenAlex request in an environment with working API access and inspect the real candidate packet before using it for source review.

This work provides a reading and curation workflow. It does not add reviewed claims, establish study independence, classify scientific contradictions, or complete M3's disagreement/hypothesis criteria.

### Research brief workspace

- [x] Pin existing findings and include one comparison without changing scientific records or the underlying explorer view.
- [x] Provide separate fields for the user's question, explanation, assumptions and proposed experiment, with no generated or prefilled scientific conclusions.
- [x] Save one bounded draft locally, retain notes across reloads, and expose recovery for unavailable/corrupt storage and another tab's edits.
- [x] Preserve references across dataset changes, show unavailable findings and require explicit refresh before evidence additions or export.
- [x] Export a user-authored draft with complete cited findings/comparison, source contexts, unknowns, limitations and actual review metadata.
- [x] Verify keyboard, themes, mobile touch, WebGL fallback, saved-state recovery and downloaded Markdown in browser checks.

This is a user writing workflow. It does not add curator-reviewed questions, establish novelty, supply a live AI service or complete M3's scientific-content criteria. Notes remain device-local; Markdown download is the current sharing option, with imports and multiple saved briefs deferred.

### Experimental-data interpretation

- [x] Parse bounded local human-symbol RNA-seq CSV/TSV results with explicit nulls, duplicate/identifier errors and complete input retention.
- [x] Pin a broad Reactome reference independently of the curated graph, recording immutable bytes, CC0 attribution and unknown upstream release.
- [x] Require a named contrast and full-tested-table declaration; define background from complete statistics before cutoffs, retain eligible unmapped genes and report incomplete exclusions.
- [x] Implement right-tailed hypergeometric ORA and BH across the complete eligible pathway family, with stable extreme tails and separate input gene/pathway FDR values.
- [x] Inspect signed member results, source records and rule-based follow-up questions with assumptions; link covered genes to a separate transcript observation in the existing evidence panel.
- [x] Validate numerical results against independent SciPy calculations on a real public human RNA-seq reanalysis, with conversion/provenance limits recorded and no raw table bundled.
- [x] Exercise upload/recovery/privacy, keyboard/themes/mobile/WebGL fallback and existing explorer flows in browser QA; record final observations in verification.
- [x] Add pinned HGNC/Ensembl mapping, explicit column choice, original-ID/version traceability, ambiguity acknowledgement and blocked duplicate mappings.
- [x] Validate supplied public MAYO AD and original Ensembl airway results against independent SciPy calculations; record conversions, source scopes and rejected data-quality candidates.
- [x] Compare nearby gene cutoffs in local workers while preserving the eligible background and complete pathway-BH family.
- [x] Group overlapping eligible pathway memberships with original statistics, explicit similarity and access to every member; avoid claims of independent mechanisms.
- [x] Add a one-click synthetic example using the normal analysis, sensitivity, grouping and evidence-navigation flows, with persistent synthetic provenance.
- [x] Capture optional tissue/cell model, treatment/condition and explicit study design; scope follow-up questions while preserving numerical results, applied provenance and tab-only privacy.

This completes the product milestone for a **public research preview**: processed human RNA-seq input → identifier audit → pathway analysis → sensitivity/overlap inspection → cited evidence and follow-up questions. Observed numerical/browser checks remain distinct from scientific release approval. Hosting requires the normal production build; no server or AI key is needed.

This workflow interprets processed results; it does not run raw-count differential expression, verify input species/identity, model gene-length/expression selection bias, prove pathway activity or promote questions into the curated scientific snapshot. No backend, upload service or live AI model was added.

### Prepare the next AD evidence pass

- [x] Stage a bounded, source-linked reading list: six publications and two Reactome pathway records, with lookup dates, actual access limits, and unknown context preserved.
- [x] Generate a [candidate-source coverage table](data/alzheimers/candidate-coverage.md) connecting three reading questions to existing finding context and candidate studies without asserting support or independence.
- [x] Validate identities, baseline references, freshness, and the unreviewed/outside-graph boundary; keep article content and approval attestations out of the packet.
- [x] Expand through a separately source-checked dataset diff: 21 entities, distinct gene/protein identities, two pathways, and recorded database assertions.
- [ ] Later scientific-release milestone: record an actual independent scientific review and resolve remaining source/release checks. This is deferred, not a blocker for source-checked development.

The two pathway candidates now have source-checked draft annotations in 0.2.0; six publications remain staged. No live adapter request or exact Reactome release is claimed. The entity-count target is met; other MVP criteria remain separate.

Snapshot 0.3.0 adds two APOE–TREM2 protein-binding findings and one paper projection from a separate original-source check of Atagi 2015. Caption-level scope, assay controls, replicate units and shared-paper identity are retained; raw figures and full methods were not reviewed. No staged metadata was promoted automatically.

Snapshot 0.4.0 adds Bailey 2015's baseline and R47H plate-binding findings, with original captions, selected indexed methods/results, technical-well units and its recorded in-article correction. The two Atagi findings gain structured preparation/presentation fields without filling their unknowns. Different publication IDs do not establish independent replication.

Snapshot 0.5.0 adds Lessard 2018's scoped APOE3 BLI finding and one source-checked draft context comparison with Atagi's R47H report. Unknown run totals, source-specific readouts and limits on interpreting non-significance remain explicit. The separate future scientific-release approvals are unchanged.

- [x] Expand coverage from a real public AD pathway result: MARCO/SCARA5, APOB ligand context, separate proteins, the scavenger-receptor pathway and two original modified-apoB binding findings; retain database inference and assay-specific limits in the 32-entity snapshot.

## M2 — Deliver the curated Alzheimer's explorer

Future content work can continue from the 33-finding source packet and six staged publications. Keep metadata candidates separate from experimental evidence and distinguish independent studies from follow-ups or reused cohorts. See [future AD content work](docs/checkpoints.md#future-content-work-deepen-the-alzheimers-evidence).

- [x] Reach **20–50 source-checked draft entities**, including paper nodes: 32 total, with scope and original references retained.
- [x] Add two human Reactome pathways and seven distinct proteins with source-linked participation and state context; variant nodes remain deferred.
- [x] Record access dates, observed entry versions where obtained, attribution, source context and actual check status. Exact Reactome release provenance remains unresolved.
- [x] Expose all current entity types in one filter, with active state visible.
- [ ] Add relationship/evidence filters when a concrete research task requires them.
- [x] Display scoped, source-linked statements, summaries and limitations; distinguish database annotations from original papers.
- [ ] Introduce Python/NetworkX tooling for reproducible validation and snapshot preparation; document its actual setup and commands.
- [x] Validate IDs, references, evidence links, draft states, source coverage and snapshot version.
- [x] Exercise typed pathway journeys, alias search, selection, connection navigation and the production build; record observed coverage in verification.

**Done when:** the complete curated snapshot works offline after app assets are loaded, all public scientific relationships have reviewed evidence and traceable citations, and the same content is available through the list view.

## M3 — Add disagreements and research questions

- [x] Record one source-checked draft study-context comparison with cited findings and methodological limits; this is not a definitive contradiction or an independently approved scientific record.
- [x] Show that note beside the named findings and their exact comparison, with both original studies, a methodological disclosure and complete provenance in the downloaded brief.
- [ ] Curate potential disagreements, preserving each study's claim, organism, population, intervention, endpoint, and limitations.
- [x] Present differences in context alongside results; label uncertainty without treating every difference or null result as a contradiction. This is verified for the current R47H comparison; further scientific curation remains separate.
- [ ] Add a small set of curator-reviewed, testable research questions with premises, assumptions, limitations, and a suggested way to investigate each one.
- [ ] Keep research questions separate from evidence-backed graph claims. Explain why an absent connection in this dataset does not demonstrate an unexplored topic.
- [ ] Review the resulting wording and evidence before release. If no comparable conflicting findings are verified, show an honest empty state and keep that feature pending.

**Done when:** users can compare at least one reviewed disagreement and inspect at least one grounded research question, with no implied causal proof or clinical recommendation. An empty state alone does not complete this milestone.

## M4 — Optional evidence-grounded AI

Depends on M2 and the evidence presentation rules in M3. This is not required to ship the curated explorer.

- [ ] Choose an AI provider and evaluate whether a server-side FastAPI endpoint is needed. Record the decision and any operating requirements.
- [ ] Retrieve only the relevant reviewed evidence packet, retaining source and claim IDs.
- [ ] Generate explanations and suggested questions that cite those IDs, separate evidence from interpretation, and abstain when support is insufficient.
- [ ] Validate generated references and evaluate unsupported-claim, misleading-citation, disagreement, and insufficient-evidence cases.
- [ ] Keep credentials server-side; add request limits, timeouts, and a curated-summary fallback.
- [ ] Show which text is generated, which sources it used, and its limitations.

**Done when:** evaluated outputs remain grounded in the supplied evidence, invalid citations are rejected, and the core explorer works when AI is disabled or unavailable. Citation validation alone is not a factuality check.

## M5 — Optional persistent services and wider coverage

Start only when multi-user curation, larger queries, frequent updates, or another concrete requirement exceeds static snapshots.

- [ ] Add FastAPI/PostgreSQL with migrations, explicit provenance tables, and import/review boundaries.
- [ ] Implement source-specific imports with current access requirements, rate limits, release tracking, caching, and license checks.
- [ ] Publish reviewed dataset snapshots reproducibly; imports must not silently change the public graph.
- [ ] Expand to another disease only after the Alzheimer's evidence workflow is reliable.
- [ ] Evaluate graph algorithms as hypothesis-generation aids, preserving their assumptions and avoiding claims of biological validation.

**Done when:** the adopted service has a documented operational purpose, repeatable setup, and checks for data integrity and recovery. There is no current requirement for a graph database or a distributed architecture.

## Before the first public release

- [ ] Meet the MVP acceptance criteria in [docs/product.md](docs/product.md).
- [ ] Complete a scientific review of all exposed claims, summaries, disagreements, and questions.
- [x] Choose the [MIT License](LICENSE) for original software and project-authored documentation.
- [ ] Verify scientific source terms and attribution separately from the software license.
- [ ] Verify keyboard/list access, reduced motion, WebGL fallback, search, and reference links.
- [ ] Run the implemented data checks, typecheck, lint, relevant tests, and production build; record results.
- [ ] Document the actual local setup and known limitations. Keep private keys and unreviewed data out of distributed assets.

Hosting and scientific release are separate actions. The owner reports a working Vercel development preview; no backend is implemented. A hosted preview does not complete the scientific release criteria above.
