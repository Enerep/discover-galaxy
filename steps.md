# Implementation steps

**Current stage: M0 complete — documentation foundation. Next: M1, the first runnable vertical slice.**

These milestones describe planned work, not implemented features. Complete them in order unless a documented dependency allows parallel work. Check an item only after its acceptance criteria are met. No application commands exist yet.

## M0 — Establish the foundation

- [x] Define the Alzheimer's MVP and its limits in [README.md](README.md) and [docs/product.md](docs/product.md).
- [x] Record agent and contributor instructions.
- [x] Document the architecture, data contract, evidence policy, and technical decisions.
- [x] Write this implementation and validation plan.

**Done when:** the documents agree on scope, distinguish plans from working features, and link to one another correctly.

## M1 — Build a runnable vertical slice

The smallest useful flow is: search → select an entity → inspect a relationship → open its original evidence.

- [ ] Scaffold `apps/web/` with React, TypeScript, Vite, React Three Fiber, and compatible Drei helpers; record supported runtime versions and commit a lockfile.
- [ ] Add the actual install, development, lint, typecheck, test, and production-build commands to the README.
- [ ] Create the dataset adapter and a minimal validator from [docs/data-model.md](docs/data-model.md). Reject broken IDs and uncited published claims.
- [ ] Curate a small reviewed starter snapshot in `data/alzheimers/`, including Alzheimer's disease, APOE, and enough sourced relationships to demonstrate the flow. Verify every identifier, claim, citation, and redistribution condition before inclusion.
- [ ] Render selectable nodes and relationships with a legend, restrained motion, and a clear selected state.
- [ ] Add alias-aware local search, an entity panel, and a relationship/evidence panel.
- [ ] Add a synchronized searchable list, keyboard access to selection and evidence, reduced-motion support, and a WebGL failure state.
- [ ] Handle loading, invalid data, no results, and missing optional metadata without inventing content.
- [ ] Run the implemented checks and manually exercise the search-to-evidence flow.

The starter snapshot may contain fewer than 20 entities; it is a development milestone, not the full MVP release. If scientific curation is incomplete, use explicitly synthetic fixtures for internal development only and keep the public scientific demo unreleased.

**Done when:** a clean local setup runs with no external service credentials, and a user can search for Alzheimer's, select APOE, inspect a reviewed relationship, and open its cited evidence through either the graph or the list.

## M2 — Deliver the curated Alzheimer's explorer

- [ ] Expand the reviewed snapshot to **20–50 entities total**, including any paper nodes. Include ABCA1 and TREM2 when their identifiers and selected relationships are verified.
- [ ] Add relevant pathways and other initial entity types where evidence warrants them; distinguish genes and proteins and preserve variant context. Separate variant nodes are deferred.
- [ ] Record source releases or retrieval dates, attribution, curation history, study context, and review status for each included claim.
- [ ] Add filters by entity type and relationship/evidence attributes without hiding the active filter state.
- [ ] Display concise curator-written explanations with claim-linked references and limitations.
- [ ] Introduce Python/NetworkX tooling for reproducible validation and snapshot preparation; document its actual setup and commands.
- [ ] Validate IDs, references, evidence links, eligible review states, source coverage, and the snapshot version.
- [ ] Add focused tests for data rules, alias search, selection, and evidence navigation; check the production build.

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
- [ ] Verify source terms and attribution; choose the repository's software license.
- [ ] Verify keyboard/list access, reduced motion, WebGL fallback, search, and reference links.
- [ ] Run the implemented data checks, typecheck, lint, relevant tests, and production build; record results.
- [ ] Document the actual local setup and known limitations. Keep private keys and unreviewed data out of distributed assets.

Publication and hosting are separate actions. No site or backend is deployed by this documentation milestone.
