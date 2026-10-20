# Architecture decisions

These decisions establish the intended first implementation. They do not describe shipped functionality. Changes should update the relevant decision and the [build steps](../steps.md).

## ADR-001 — Start with one reviewed Alzheimer's snapshot

**Date:** 2026-10-20

**Status:** Accepted

Use a versioned, curated JSON dataset with 20–50 entities for the first release. Keep claims, evidence, sources, and research questions explicit and linked according to the [data model](data-model.md).

This bounds curation effort, makes citations reviewable, and produces a reproducible demo without live API availability. The cost is limited coverage and deliberate refreshes. Missing relationships cannot be presented as gaps in the scientific literature.

## ADR-002 — Use React and TypeScript for the explorer

**Date:** 2026-10-20

**Status:** Accepted

Use Vite, React, TypeScript, and Three.js through React Three Fiber; use Drei helpers selectively. Share selection and filtering state between the galaxy and accessible HTML views.

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

See the [architecture](architecture.md) for component boundaries and future extension points.
