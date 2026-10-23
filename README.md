# Discovery Galaxy

**Explore humanity's scientific knowledge in 3D.**

Discovery Galaxy is an interactive map of scientific evidence in development. Glowing objects represent biological entities and papers; connections lead to the original studies, source-specific context, and limitations behind a finding.

The first version focuses on **Alzheimer's disease**, with a release target of **20–50 curated entities**. Its value comes from making evidence easy to follow: every scientific relationship and explanation must lead back to its sources.

## Project status

**The source-checked explorer contains 24 entities and 24 cited claims.** It covers one disease, seven genes, seven distinct proteins, two pathways, and seven papers. The selectable 3D graph, alias-aware search, type filters, synchronized list, evidence inspector, original references, reduced-motion support, and WebGL fallback are implemented.

One toolbar groups search, the type filter and Graph/List. The selected entity, finding and original citation lead the evidence panel; **Entity details** and **Study details and limitations** hold the extra metadata. Keyboard search, visible camera controls and explicit mobile navigation support the search-to-study flow. Selection and camera transitions ease between states, respect reduced motion, and stop rendering when idle. The [design guide](docs/design.md) applies the standing rule to cut taglines/helper text and improve UX, DX and AX together.

The appearance control offers Light, Dark, and System. System follows the operating system by default; explicit choices are remembered locally. Dark uses a `#1F1F24` page background. The graph stays dark in either theme, and exported citation cards keep their light background.

Sharing supports a PNG of the graph and selected finding, with source references, dataset version, and draft status. Native image sharing is offered where supported; downloading works without it. Copied links restore the entity, finding, search, filter, and view, but not the camera position. Images are created in the browser without an upload service.

Pasting the website link into a compatible social app uses a separate **1200 × 630 social preview**, with Open Graph and Twitter metadata in the initial HTML. It represents the explorer as a whole; selected findings in URL fragments do not create different thumbnails. The public address is [discover-galaxy-web.vercel.app](https://discover-galaxy-web.vercel.app/). See [social preview maintenance](docs/social-preview.md) for checks, domain changes, and cache behavior.

**Compare findings** opens two findings side by side with their original citations, study populations, variants, endpoints, limitations, and review status. Recorded fields are labeled matching, different, or missing; those labels do not determine agreement, contradiction, or study independence. A downloadable Markdown brief keeps the complete context and dataset version. Reading prompts identify source checks to make, not verified research gaps or new hypotheses.

**Research brief** turns selected evidence into a working document. Pin findings or add a comparison, write your question, explanation, assumptions and proposed experiment, then download a cited Markdown brief. One draft with up to 12 findings and one comparison is saved on this browser/device; no account or AI key is needed. Notes stay separate from the scientific records and retain their user-authored status in the export. Download the file to share it or keep a copy: explorer links and PNG sharing do not include your notes, and device storage is not cloud sync or a backup.

The interface uses **Source-checked draft**. Each finding records its source, inspected location, context, and limitations. Four existing human genetic-association findings keep their variant/population scopes; the additions are seven gene–protein mappings, seven pathway-participation annotations, and one TREM2–DAP12 binding annotation. Database records are labeled separately from original papers. Use **View …** in a finding to follow a connection from a gene to its protein and pathway, with keyboard focus preserved.

Four findings connect APOE and TREM2 proteins through the binding assays reported by Atagi and Bailey (2015), with baseline and R47H results kept separate. Source-specific protein preparations, surface presentation and replicate units remain attached to the original paper. Bailey's plasma-derived APOE isoform is unknown, and its triplicate wells are not three independent studies. The source records its in-article correction and the actual inspection limits.

A fifth finding from Lessard (2018) reports no significant wild-type/R47H APOE3 affinity difference under a different assay setup. **Different R47H binding results** appears beside either compared finding, with both original studies and a **What differs** disclosure. The source retains its lipidated-protein BLI setup, unresolved run count, inspected locations and CC BY attribution.

The assay setup appears beside the citation, and finding labels name the study and recorded condition. **Compare findings** opens an explicitly curated pair first, otherwise the same recorded binding condition in another publication when available; within-paper comparisons remain selectable. The context note is included only for its cited pair and survives the Markdown export with its limits, locators and actual review record. Assay details come first in experimental comparisons, with preparation, immobilization, replicate units and unknowns retained. Original correction links are available in the source details and downloaded brief. Shared links preserve protein and pathway filters.

Independent scientific review is deferred to a future milestone, as requested by the owner; it does not block expanding or hosting the source-checked development explorer. Source-checking is a limited inspection, not an independent approval or a full-paper review. All scientific records retain draft status, and outstanding source reuse/publication checks remain recorded. One source-checked study-context note records differing assay reports; it is a draft comparison, not a definitive contradiction. Curator-reviewed hypothesis records, an AI service, backend and database remain unimplemented. The client reads its local snapshot and makes no upstream scientific API requests.

See the [dataset notes](data/alzheimers/README.md) and [change log](data/alzheimers/CHANGELOG.md) for source checks and lookup limits. The development snapshot meets the **20–50 entity size target**; the remaining MVP capabilities and future scientific-release checks in [steps.md](steps.md) are separate.

The owner reports a working Vercel development deployment. **We are expanding within Alzheimer's first.** The [checkpoint plan](docs/checkpoints.md) now prioritizes using evidence to build a research brief; additional disease coverage and scientific source work remain separate milestones.

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

The [AD source-review packet](data/alzheimers/review-packet.md) collects the 24 current findings, citations, source context, and outstanding checks. It is a generated extract, not scientific approval. Check or regenerate it from the repository root:

```sh
npm run curation:check
npm run --silent curation:packet > data/alzheimers/review-packet.md
```

Record actual scientific reviews in the source dataset, then regenerate; do not edit the packet as a separate review record. The packet generator makes no API requests and does not change the graph.

The separate [OpenAlex candidate-intake tool](tools/curation/README.md) collects a bounded first page of literature metadata or normalizes an archived response:

```sh
npm run --silent curation:intake -- --limit 20
```

Its output is unreviewed staging material, not graph evidence. It excludes abstracts and full text, retains retrieval/query provenance, and does not create claims or review approvals. Live network availability and observed checks belong in the [verification record](docs/verification.md); offline normalization does not verify a live API request.

A separate [candidate-source coverage packet](data/alzheimers/candidate-coverage.md) keeps **six publications** in staging around ABCA1–ApoE lipid handling, TREM2–APOE interactions, and TREM2 model comparisons. The two earlier pathway candidates now have separately checked draft annotations in the explorer. The remaining papers need assay-level source extraction before adding empirical findings. The packet records lookup limits and reading checks; it is separate from the OpenAlex adapter and never imports or approves content. Edit its [source JSON](data/alzheimers/candidate-coverage.json), then regenerate and check:

```sh
npm run --silent curation:coverage > data/alzheimers/candidate-coverage.md
npm run curation:coverage:check
```

Dependency lifecycle scripts are disabled in [.npmrc](.npmrc); direct versions are exact and the lockfile is committed. Read the [npm security policy](docs/npm-security.md) before changing dependencies. Its checks include release dates, registry integrity, audit findings, and pinned Shai-Hulud indicators. Optional standard-library Python tooling runs the IOC comparison with `python3 tools/security/check-iocs.py`.

In this cloud workspace, npm's default cache directory may be read-only. Use `export npm_config_cache=/tmp/discovery-galaxy-npm-cache` for the session if that occurs.

## The first experience

1. Search for “Alzheimer's disease” and focus its curated neighborhood.
2. Select an entity such as APOE, ABCA1, or TREM2.
3. Inspect its recorded relationships in the evidence panel.
4. Open a relationship to see the claim, study context, limitations, and original references.
5. Choose **Compare findings** to inspect two findings' source-specific context and download a cited reading brief.
6. Follow **View APOE protein**, then its cholesterol-regulation connection; inspect the original Reactome record or follow another participant such as ABCA1.
7. Select the Atagi or Lessard R47H binding finding to read **Different R47H binding results**, then compare the cited assays.
8. Pin useful findings, or choose **Add to research brief** from a comparison. Open **Research brief**, write your question and reasoning, and download the cited document for discussion.

The current explorer implements these steps, including one draft study-context comparison and a user-authored brief. The TREM2 protein → DAP12 signaling route is also available. Further disagreement curation and curator-reviewed research questions remain planned; a user's notes do not complete those milestones. Pathway annotations do not demonstrate AD-specific mechanisms; gene, protein, variant, and protein-state meanings remain distinct.

Briefs save automatically after editing. If another tab changes the saved draft or saved data cannot be read, automatic saving pauses until **Save this version** is chosen. If the dataset changes, inspect the current pinned findings, remove unavailable references, then choose **Refresh evidence** before adding evidence or exporting. When storage is unavailable, writing and downloading still work in memory.

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
| Data tooling | Native Node.js/TypeScript tools now; Python and NetworkX when needed | Reuse the data contract for validation, review packets, and candidate staging |
| API, when needed | Python and FastAPI | Support controlled retrieval and server-side AI calls |
| Storage, when needed | PostgreSQL | Persist provenance and support updates beyond snapshots |

This keeps the proposed React / Three.js / Python / NetworkX / PostgreSQL direction, while introducing each component when it has a job to do. The current client pins React 19.3.0, React Three Fiber 9.8.1, Three.js 0.186.1, Vite 8.3.2, and TypeScript 5.9.3. Python security checks are development tooling; NetworkX analysis and reviewed scientific import/promotion remain planned.

## Scientific resources

| Resource | Intended role |
| --- | --- |
| [Open Targets Platform](https://platform.opentargets.org/) | Find target–disease associations and their underlying evidence |
| [Reactome](https://reactome.org/) | Find pathway definitions, stable identifiers, and supporting references |
| [OpenAlex](https://openalex.org/) | Resolve literature metadata and discover candidate papers |

These resources help find and contextualize evidence. Database associations, metadata, and aggregate scores do not replace reviewing the original studies. OpenAlex has a metadata-only staging adapter; Open Targets and Reactome adapters remain planned. Verify current access, release provenance, attribution, and reuse terms before adopting new source data. No candidate intake automatically changes the explorer.

## Repository guide

| Document | Purpose |
| --- | --- |
| [steps.md](steps.md) | Ordered milestones, dependencies, and completion criteria |
| [Checkpoint plan](docs/checkpoints.md) | Research brief workspace, evidence comparison, and future coverage |
| [Product specification](docs/product.md) | Audience, user journeys, scope, and release criteria |
| [Design guide](docs/design.md) | Simple workflows, clean presentation, plain language, and purposeful motion |
| [Architecture](docs/architecture.md) | Data flow, technical boundaries, and planned layout |
| [Data model](docs/data-model.md) | Entities, claims, evidence, sources, and dataset rules |
| [Evidence policy](docs/evidence-policy.md) | Curation, uncertainty, disagreements, and AI grounding |
| [npm security policy](docs/npm-security.md) | Script-disabled installs, exact versions, and known-IOC checks |
| [Dataset notes](data/alzheimers/README.md) | Source checks, pathway scope, provenance, and access limits |
| [Dataset change log](data/alzheimers/CHANGELOG.md) | Versioned content additions and inspection locations |
| [AD review packet](data/alzheimers/review-packet.md) | Current findings, source-specific context, and outstanding review tasks |
| [Candidate-source coverage](data/alzheimers/candidate-coverage.md) | Six staged publications, reading questions, provenance, and checks before a dataset diff |
| [Curation tools](tools/curation/README.md) | Bounded OpenAlex metadata intake and its staging boundary |
| [Verification record](docs/verification.md) | Observed checks, browser coverage, and limitations |
| [Decision log](docs/decisions.md) | Why the main technical choices were made |
| [LICENSE](LICENSE) | MIT license for original software and project documentation |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to make and validate changes |
| [AGENTS.md](AGENTS.md) | Instructions for coding agents working in this repository |
| [agent.md](agent.md) | Entry point pointing to the canonical agent instructions |

## License

The project's original software and project-authored documentation are licensed under the [MIT License](LICENSE), copyright 2026 Discovery Galaxy contributors. You may use, modify, redistribute, and commercially use that material while retaining the copyright and license notice.

Third-party dependencies, scientific datasets, and cited publications retain their own terms; the software license does not grant rights to redistribute them or complete pending source reuse checks. Follow the recorded source attribution and reuse status in the [starter dataset notes](data/alzheimers/README.md) and [evidence policy](docs/evidence-policy.md).
