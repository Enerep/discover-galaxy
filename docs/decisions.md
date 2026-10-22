# Architecture decisions

These decisions guide the implemented local development preview and later milestones. M1 engineering now exists, while scientific approval and release remain pending. Update the relevant decision and the [build steps](../steps.md) when the approach changes.

## ADR-001 — Start with one reviewed Alzheimer's snapshot

**Date:** 2026-10-20

**Status:** Accepted

Use a versioned, curated JSON dataset with 20–50 entities for the first release. Keep claims, evidence, sources, and research questions explicit and linked according to the [data model](data-model.md).

The current development snapshot has eight entities and four draft claims. Its AI-assisted source lookup does not satisfy human scientific review. Development and release validation are separate; the starter must fail the release gate until review, reuse, publication-status, and release-size requirements are met.

This bounds curation effort, makes citations reviewable, and produces a reproducible demo without live API availability. The cost is limited coverage and deliberate refreshes. Missing relationships cannot be presented as gaps in the scientific literature.

## ADR-002 — Use React and TypeScript for the explorer

**Date:** 2026-10-20

**Status:** Accepted

Use Vite, React, TypeScript, and Three.js through React Three Fiber. Share selection and filtering state between the galaxy and accessible HTML views.

The implementation uses native Three.js `OrbitControls` and canvas-generated labels rather than adding Drei. This keeps the dependency set smaller while covering the current scene's controls and labels. The exact versions are pinned in the npm workspace and lockfile; Node 24 and npm 11.9.0 are the supported toolchain.

This fits the 3D interaction while keeping the evidence-reading interface in ordinary web components. A canvas adds accessibility and rendering constraints, so the list view and WebGL fallback are part of the first usable version.

## ADR-003 — Introduce backend infrastructure incrementally

**Date:** 2026-10-20

**Status:** Accepted

Begin with a static frontend and a dataset adapter. Introduce Python and NetworkX for curation and graph checks. Add FastAPI for server-side requirements and PostgreSQL for persisted updates or queries when those needs are demonstrated.

The first vertical slice needs no database, graph database, microservices, or model provider. Deferring these components reduces operational work while preserving a clear data boundary for later growth. Revisit this choice when measured data scale, refresh needs, or user workflows require it.

## ADR-004 — Publish human-reviewed claims and disagreements

**Date:** 2026-10-20

**Status:** Accepted

Require traceable evidence and study context for published scientific claims. Represent disagreement through reviewed evidence records and explanatory notes. Keep research questions distinct from established claims; do not infer a research gap from sparse graph coverage or use an aggregate association score as causal confidence.

This makes the explorer useful for assessing evidence. It requires curation and limits automatic expansion. Follow the [evidence policy](evidence-policy.md) for admission and review rules.

## ADR-005 — Make AI explanations optional

**Date:** 2026-10-20

**Status:** Accepted

Start with curated summaries. Later AI explanations must use bounded, reviewed evidence supplied by a server, cite records from that evidence, disclose uncertainty, and abstain when evidence is insufficient. Keep credentials on the server and retain the curated experience when AI is unavailable.

This lets the core product work without a model key or per-request cost. Generated wording still requires grounding checks and evaluation. AI output cannot become a graph claim or scientific source without a separate evidence review.

## ADR-006 — Pin and inspect dependencies with installation scripts disabled

**Date:** 2026-10-20

**Status:** Accepted

Use npm workspaces and one committed lockfile, exact direct versions, the official registry, and script-disabled installation. Record an absolute resolution cutoff with a 14-day age window because npm 11.9.0 does not support `min-release-age`. Review necessary newer security fixes individually rather than retaining a vulnerable version solely to meet the age window.

The lockfile checker verifies registry sources, SHA-512 integrity, and direct pins; an optional metadata mode checks publication dates against the recorded cutoff. A separate Python checker compares exact resolved versions with pinned historical IOC feeds. Audit and IOC results are bounded checks, not proof that dependencies are free of malware. Follow the [npm security policy](npm-security.md) for dependency changes.

## ADR-007 — Keep the interface simple and motion purposeful

**Date:** 2026-10-20

**Status:** Accepted

Use the [design guide](design.md) as a standing implementation and review standard. The primary flow is search → select → inspect evidence → open the original study. Use a single control set, readable evidence, restrained light interface surfaces around the dark graph, plain functional copy, and progressive disclosure. Remove repeated navigation and promotional decoration rather than adding another layer of controls.

Motion should clarify a state change, remain interruptible, and settle when interaction ends. Respect reduced-motion preferences and keep keyboard and touch flows complete. A cleaner interface must preserve source-specific context and visible development status. Browser checks must verify the implemented behavior before it is reported as complete.

## ADR-008 — Use master as the default working branch

**Date:** 2026-10-20

**Status:** Accepted

The repository's default branch is `master`, as explicitly specified by the user. Base work on the fetched `origin/master` and push `master` when authorized. Do not create or switch to `main`; use a feature branch only when explicitly requested. Preserve merged remote work and inspect branch state before editing or pushing.

## ADR-009 — License original software and documentation under MIT

**Date:** 2026-10-22

**Status:** Accepted

Use the standard [MIT License](../LICENSE) for original software and project-authored documentation, with the copyright notice naming Discovery Galaxy contributors. This permits use, modification, redistribution, and commercial use while requiring retention of the copyright and permission notice.

Third-party dependencies, scientific datasets, and publications retain their own terms. Software licensing does not establish source reuse permission, scientific review, or an approved dataset release. Keep those requirements in the source records and evidence policy.

See the [architecture](architecture.md) for component boundaries and future extension points.
