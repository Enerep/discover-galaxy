# Implementation steps

**Current stage: the 21-entity Source-checked draft explorer is implemented; independent scientific review is a future milestone.**

Checkboxes distinguish implemented work from remaining milestones. Complete them in order unless a documented dependency allows parallel work. Check an item only after its acceptance criteria are met. Actual setup and check commands are in [README.md](README.md).

The [checkpoint plan](docs/checkpoints.md) records source-specific finding comparison and staged candidate intake. Coverage remains Alzheimer's-only; the next scientific milestone reviews the existing packet and deepens AD evidence before adding another disease.

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

The current snapshot has 21 source-linked entities and 19 draft claims, including the original four variant-scoped association findings. The interface uses **Source-checked draft**. The owner has deferred independent scientific review and authorized continued development; the separate future scientific-release gate remains intact. Actual source checks, reuse status, unknown releases and publication-status limits stay recorded. Synthetic fixtures remain isolated in tests.

**Done when:** a clean local setup runs with no service credentials, and a user can search for Alzheimer's, select APOE, inspect a source-checked draft relationship, and open its cited evidence through graph or list. Independent scientific approval belongs to the future release milestone.

The source-checked development journey is usable now; structural checks never manufacture scientific approval.

### Explorer UX refinement

- [x] Record [standing design requirements](docs/design.md) and make `master` the explicit default working branch in the agent guide.
- [x] Simplify the workspace to one search field, one type filter, one Graph/List switch, and a readable evidence panel.
- [x] Put original-paper links before detailed study metadata; preserve claim context and limitations in disclosures.
- [x] Add keyboard search-result navigation, visible zoom/reset controls, and explicit mobile evidence/back navigation without automatic page scrolling.
- [x] Smooth selection, camera movement, and disclosure transitions; honor reduced motion and verify that graph rendering settles at rest.
- [x] Exercise the revised desktop, touch/mobile, and WebGL-fallback flows in browser checks. Scientific release criteria remain pending.

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

### Prepare the next AD evidence pass

- [x] Stage a bounded, source-linked reading list: six publications and two Reactome pathway records, with lookup dates, actual access limits, and unknown context preserved.
- [x] Generate a [candidate-source coverage table](data/alzheimers/candidate-coverage.md) connecting three reading questions to existing finding context and candidate studies without asserting support or independence.
- [x] Validate identities, baseline references, freshness, and the unreviewed/outside-graph boundary; keep article content and approval attestations out of the packet.
- [x] Expand through a separately source-checked dataset diff: 21 entities, distinct gene/protein identities, two pathways, and recorded database assertions.
- [ ] Later scientific-release milestone: record an actual independent scientific review and resolve remaining source/release checks. This is deferred, not a blocker for source-checked development.

The two pathway candidates now have source-checked draft annotations in 0.2.0; six publications remain staged. No live adapter request or exact Reactome release is claimed. The entity-count target is met; other MVP criteria remain separate.

## M2 — Deliver the curated Alzheimer's explorer

Continue from the 19-finding source packet and six staged publications. Keep metadata candidates separate from experimental evidence and distinguish independent studies from follow-ups or reused cohorts. See [the next checkpoint](docs/checkpoints.md#next-checkpoint-deepen-the-alzheimers-evidence).

- [x] Reach **20–50 source-checked draft entities**, including paper nodes: 21 total, with scope and original references retained.
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

- [ ] Curate potential disagreements, preserving each study's claim, organism, population, intervention, endpoint, and limitations.
- [ ] Present differences in context alongside results; label true uncertainty without treating every difference or null result as a contradiction.
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
