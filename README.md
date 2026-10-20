# Discovery Galaxy

**Explore humanity's scientific knowledge in 3D.**

Discovery Galaxy is an interactive map of scientific evidence in development. Glowing objects represent biological entities and papers; connections let researchers inspect published relationships. Comparing findings and formulating testable questions are planned next steps.

The first version focuses on **Alzheimer's disease**, with **20–50 curated entities**. Its value comes from making evidence easy to follow: every scientific relationship and explanation must lead back to its sources.

## Project status

**The first development explorer is implemented.** It has a selectable 3D graph, alias-aware search, type filters, a synchronized entity list, an evidence inspector, source links, reduced-motion support, and a WebGL fallback. The local starter contains **8 entities and 4 source-scoped claims** about APOE, ABCA1, and TREM2.

The interface uses one search field, one type filter, and one Graph/List switch. Keyboard search, visible camera controls, a readable evidence panel, and explicit mobile navigation support the search-to-study flow. Selection and camera transitions ease between states, respect reduced motion, and stop rendering when idle. The [design guide](docs/design.md) makes simplicity, plain language, and purposeful animation permanent requirements.

The scientific records are **development drafts**, based on an AI-assisted inspection of source abstracts and metadata. Human scientific review, source reuse assessment, and correction/retraction checks are pending. No human approval is fabricated. There are no pathway claims, conflict comparisons, research hypotheses, live upstream integrations, AI service, backend, or database yet.

See the [starter dataset notes](data/alzheimers/README.md) for original references and lookup limits, and [steps.md](steps.md) for remaining acceptance criteria. The 20–50 entity MVP and its scientific release gates remain ahead.

## Run locally

**`master` is the default branch.** Start from `origin/master` and push work to `master`; this repository does not use `main`.

Use **Node.js 24** and **npm 11.9.x**. From the repository root:

```sh
npm run check:dependencies
npm ci --ignore-scripts
npm run dev
```

Open the printed local address, normally `http://localhost:5173`. The explorer requires no service credentials. `npm run dev -- --port 5174` selects another port. Production output is written to `apps/web/dist/`.

```sh
npm test
npm run validate:data
npm run build
npm run preview
```

`npm run validate:release` deliberately fails for this starter: it is not scientifically approved. `npm run typecheck` can run separately. There is no lint command yet.

Dependency lifecycle scripts are disabled in [.npmrc](.npmrc); direct versions are exact and the lockfile is committed. Read the [npm security policy](docs/npm-security.md) before changing dependencies. Its checks include release dates, registry integrity, audit findings, and pinned Shai-Hulud indicators. Optional standard-library Python tooling runs the IOC comparison with `python3 tools/security/check-iocs.py`.

In this cloud workspace, npm's default cache directory may be read-only. Use `export npm_config_cache=/tmp/discovery-galaxy-npm-cache` for the session if that occurs.

## The first experience

1. Search for “Alzheimer's disease” and focus its curated neighborhood.
2. Select an entity such as APOE, ABCA1, or TREM2.
3. Inspect its relationships and relevant pathways in a side panel.
4. Open a relationship to see the claim, study context, limitations, and original references.
5. Compare findings where curators have identified a meaningful disagreement.
6. Read clearly labeled research questions, including the evidence and assumptions behind them.

The current starter implements steps 1–4 through selected genetic-association findings. Pathways, disagreement comparisons, and research questions remain planned. Including APOE, ABCA1, and TREM2 does not establish every possible connection between them. Gene, protein, and variant identities remain distinct.

A keyboard-operable searchable list exposes the same information as the 3D view. The galaxy is a way to navigate evidence; its layout does not measure biological distance, causality, or therapeutic promise.

## MVP boundaries

The first release will include local search, graph selection and filtering, an evidence inspector, curated summaries, reviewed disagreement notes, and a small set of testable research questions. Paper nodes count toward the 20–50 entity budget; evidence records and source records are stored separately.

AI explanations are a later, optional layer over the reviewed evidence. The first usable build must work without an AI key, backend, or database. Neither generated hypotheses nor graph algorithms establish new biological facts. This is a research exploration tool, not a system for diagnosis, treatment recommendations, or claims of discovering cures.

Broad disease coverage, automatic literature ingestion, automatic contradiction detection, accounts, and clinical use are outside the first release.

## Recommended technology

| Layer | Initial choice | Why |
| --- | --- | --- |
| Interface | React, TypeScript, Vite | A small interactive app with a clear data contract |
| 3D visualization | Three.js through React Three Fiber; native OrbitControls | Integrates the scene with React without an extra helper dependency |
| Knowledge data | Versioned, reviewed JSON snapshot | Makes a 20–50 entity graph reproducible and inspectable |
| Data tooling | Python and NetworkX, introduced with curation tooling | Validate graph structure and prepare snapshots offline |
| API, when needed | Python and FastAPI | Support controlled retrieval and server-side AI calls |
| Storage, when needed | PostgreSQL | Persist provenance and support updates beyond snapshots |

This keeps the proposed React / Three.js / Python / NetworkX / PostgreSQL direction, while introducing each component when it has a job to do. The current client pins React 19.3.0, React Three Fiber 9.8.1, Three.js 0.186.1, Vite 8.3.2, and TypeScript 5.9.3. Python security checks are development tooling; biomedical import tooling remains planned.

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
| [Design guide](docs/design.md) | Simple workflows, clean presentation, plain language, and purposeful motion |
| [Architecture](docs/architecture.md) | Data flow, technical boundaries, and planned layout |
| [Data model](docs/data-model.md) | Entities, claims, evidence, sources, and dataset rules |
| [Evidence policy](docs/evidence-policy.md) | Curation, uncertainty, disagreements, and AI grounding |
| [npm security policy](docs/npm-security.md) | Script-disabled installs, exact versions, and known-IOC checks |
| [Starter dataset](data/alzheimers/README.md) | Source lookups, provenance, and pending scientific review |
| [Verification record](docs/verification.md) | Observed checks, browser coverage, and limitations |
| [Decision log](docs/decisions.md) | Why the main technical choices were made |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to make and validate changes |
| [AGENTS.md](AGENTS.md) | Instructions for coding agents working in this repository |
| [agent.md](agent.md) | Entry point pointing to the canonical agent instructions |

No software license or third-party dataset redistribution permission is assumed. Choose a project license before distributing a release, and track imported material's terms separately.
