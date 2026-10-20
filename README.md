# Discovery Galaxy

**Explore humanity's scientific knowledge in 3D.**

Discovery Galaxy is a planned interactive map of scientific evidence. Glowing objects represent biological entities and papers; connections let researchers inspect published relationships, compare findings, and formulate testable questions.

The first version focuses on **Alzheimer's disease**, with **20–50 curated entities**. Its value comes from making evidence easy to follow: every scientific relationship and explanation must lead back to its sources.

## Project status

**Documentation foundation complete; application implementation has not started.** This repository currently contains the product specification, architecture, evidence policy, data contract, and build plan. There is no runnable app, curated dataset, live integration, or AI service yet.

Start with [steps.md](steps.md) for the implementation sequence and acceptance criteria. The next milestone is a small, runnable graph explorer backed by reviewed local data.

## The first experience

1. Search for “Alzheimer's disease” and focus its curated neighborhood.
2. Select an entity such as APOE, ABCA1, or TREM2.
3. Inspect its relationships and relevant pathways in a side panel.
4. Open a relationship to see the claim, study context, limitations, and original references.
5. Compare findings where curators have identified a meaningful disagreement.
6. Read clearly labeled research questions, including the evidence and assumptions behind them.

APOE, ABCA1, and TREM2 are initial curation candidates, not a seed dataset or a statement that every possible connection between them is established. Gene, protein, and variant identities must remain distinct.

An accessible searchable list will expose the same information as the 3D view. The galaxy is a way to navigate evidence; its layout does not measure biological distance, causality, or therapeutic promise.

## MVP boundaries

The first release will include local search, graph selection and filtering, an evidence inspector, curated summaries, reviewed disagreement notes, and a small set of testable research questions. Paper nodes count toward the 20–50 entity budget; evidence records and source records are stored separately.

AI explanations are a later, optional layer over the reviewed evidence. The first usable build must work without an AI key, backend, or database. Neither generated hypotheses nor graph algorithms establish new biological facts. This is a research exploration tool, not a system for diagnosis, treatment recommendations, or claims of discovering cures.

Broad disease coverage, automatic literature ingestion, automatic contradiction detection, accounts, and clinical use are outside the first release.

## Recommended technology

| Layer | Initial choice | Why |
| --- | --- | --- |
| Interface | React, TypeScript, Vite | A small interactive app with a clear data contract |
| 3D visualization | Three.js through React Three Fiber; Drei helpers | Integrates scene rendering and interaction with React |
| Knowledge data | Versioned, reviewed JSON snapshot | Makes a 20–50 entity graph reproducible and inspectable |
| Data tooling | Python and NetworkX, introduced with curation tooling | Validate graph structure and prepare snapshots offline |
| API, when needed | Python and FastAPI | Support controlled retrieval and server-side AI calls |
| Storage, when needed | PostgreSQL | Persist provenance and support updates beyond snapshots |

This keeps the proposed React / Three.js / Python / NetworkX / PostgreSQL direction, while introducing each component when it has a job to do. Package versions and setup commands will be added with the scaffold, after compatibility is checked.

## Scientific resources

| Resource | Intended role |
| --- | --- |
| [Open Targets Platform](https://platform.opentargets.org/) | Find target–disease associations and their underlying evidence |
| [Reactome](https://reactome.org/) | Find pathway definitions, stable identifiers, and supporting references |
| [OpenAlex](https://openalex.org/) | Resolve literature metadata and discover candidate papers |

These resources help find and contextualize evidence. Database associations, metadata, and aggregate scores do not replace reviewing the original studies. Access requirements, release versions, attribution, and redistribution terms must be checked before importing data; no integration has been verified or implemented yet.

## Repository guide

| Document | Purpose |
| --- | --- |
| [steps.md](steps.md) | Ordered milestones, dependencies, and completion criteria |
| [Product specification](docs/product.md) | Audience, user journeys, scope, and release criteria |
| [Architecture](docs/architecture.md) | Data flow, technical boundaries, and planned layout |
| [Data model](docs/data-model.md) | Entities, claims, evidence, sources, and dataset rules |
| [Evidence policy](docs/evidence-policy.md) | Curation, uncertainty, disagreements, and AI grounding |
| [Decision log](docs/decisions.md) | Why the main technical choices were made |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to make and validate changes |
| [AGENTS.md](AGENTS.md) | Instructions for coding agents working in this repository |
| [agent.md](agent.md) | Entry point pointing to the canonical agent instructions |

No software license or third-party dataset redistribution permission is assumed. Choose a project license before distributing a release, and track imported material's terms separately.
