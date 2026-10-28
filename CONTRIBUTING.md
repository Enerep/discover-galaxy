# Contributing

Discovery Galaxy helps researchers interpret processed human RNA-seq results and explore an Alzheimer's-focused evidence library. The public research preview currently contains 40 entities, 41 cited claims and a separate broad Reactome analysis reference. Start with [README.md](README.md), [checkpoints](docs/checkpoints.md) and the relevant [architecture](docs/architecture.md) or [evidence policy](docs/evidence-policy.md). Coding agents must also read [AGENTS.md](AGENTS.md).

## Choose a useful first contribution

| Contribution | A concrete starting point | Include in the request |
| --- | --- | --- |
| Input compatibility | Reproduce a CSV/TSV parsing problem using a small synthetic table, then fix it without changing the eligible background or supplied statistics. | Column names, minimal input, expected/observed behavior and the relevant parser checks. |
| Accessible exploration | Try **Analyze results → Try example**, follow a gene into Explore, and return to the applied result using keyboard, touch or List mode. | Browser, viewport, exact interaction and the observed problem; screenshots when useful. |
| Scientific evidence | Extract one finding from the [six staged publications](data/alzheimers/candidate-coverage.md), preserving its gene/protein identity and assay scope. | Original source and inspected locator, model/species, readout, replicate units, unknowns, access/reuse terms and the proposed draft record. |

A useful bug report or precise source proposal is also a contribution. Use the [bug report](https://github.com/Enerep/discover-galaxy/issues/new?template=bug_report.md) or [evidence proposal](https://github.com/Enerep/discover-galaxy/issues/new?template=evidence_proposal.md) template. Keep private research tables, personal information and credentials out of public reports; use a minimal synthetic reproduction where possible.

## Branches and pull requests

`master` remains the default branch and merge target. Work on a feature branch and open a pull request (PR, also called a merge request/MR) against `master`; do not commit or push directly to `master`. The repository does not use `main`.

```sh
git fetch origin
git switch -c your-change origin/master
```

Choose the smallest useful change, preserve existing behavior and update affected documentation. Commit and push your feature branch, then describe the problem, resulting behavior and actual validation in the request. Keep unrelated dependency, scientific-data and interface changes separate. Maintainers merge through the request after review; opening one does not authorize merging it.

## Local setup

Use Node 24 (`.nvmrc`), npm 11.9.x and Python 3 (standard library) for native tests and offline reference/curation checks. Run commands from the repository root; npm workspaces route frontend tasks to `apps/web/`. Read the [dependency security policy](docs/npm-security.md) before installation or dependency changes.

```sh
npm ci --ignore-scripts
npm run check:dependencies
npm audit
npm run dev
```

Vite normally starts on port 5173; use the URL it reports. No scientific API, backend or AI credential is required. Installation lifecycle scripts stay disabled; explicit reviewed project commands still execute their named scripts.

## Checks by change type

| Changed area | Validation |
| --- | --- |
| Documentation/templates | Review local links, identifiers, current status and consistency; run `git diff --check`. Application tests are unnecessary when no application behavior changes. |
| Application behavior | Run `npm test` and `npm run build`; exercise affected browser flows. `build` includes TypeScript checking; `npm run typecheck` is available separately. |
| Analysis or identifier/reference behavior | Also run `npm run reference:check` and verify that eligible background, supplied gene statistics, full pathway-BH family and input privacy remain correct. |
| Scientific snapshot | Run `npm run validate:data` and `npm run curation:check`; regenerate the review packet when its source changes. Check/regenerate candidate coverage or the annotation seed when those inputs change. See [curation commands](tools/curation/README.md). |
| Dependencies | Inspect package/lockfile changes, run `npm run check:dependencies -- --metadata` with registry access and `npm audit`, and follow the exact-pin, release-age and script-disabled [security workflow](docs/npm-security.md). |

`npm run preview` serves a production build. There is no lint command. Report which checks actually ran and any access or environment limits; do not describe a successful build as browser or scientific verification.

`npm run validate:data` permits valid draft records and reports review warnings. `npm run validate:release` deliberately rejects the current development snapshot because scientific approval and source/release checks remain outstanding. The 20–50 entity size target is already met; never edit review fields merely to make the release gate pass.

## Scientific content

Follow the [evidence policy](docs/evidence-policy.md) and [data model](docs/data-model.md). A content change needs stable entity identifiers, precise claims, original references, inspected locations, study context, provenance and actual review status. Keep gene, protein, variant and molecular-state identities distinct. Preserve uncertainty, database inference, publication identity and source-specific replicate units.

Source-checked draft additions can enter the labeled development preview after a reviewable source/data diff. Independent scientific review is a separate future release milestone; it does not block source-checked development or hosting. Retain draft status, actual lookup limits and unresolved fields, and never invent a reviewer or set `human_reviewed: true` without that review. Metadata intake alone does not establish a paper's findings or promote a candidate into the graph.

Do not infer pathway activity from enrichment, protein effects from RNA, or a research gap from missing graph coverage. Questions and possible explanations remain proposals with explicit premises, assumptions and tests. Synthetic fixtures must be labeled and isolated from the scientific snapshot; do not invent realistic citations.

## Interface changes

Apply the [design guide](docs/design.md). Check the relevant search → selection → original-source flow and analysis → evidence → return journey. Preserve the List alternative, keyboard access, Light/Dark/System, reduced motion, no-result recovery and unavailable WebGL. Record browser, viewport and observed results; keep the input in tab memory and outside shared links, saved briefs and exports.

An optional smoke test is `python3 tools/browser-smoke.py` against a running server. It requires Python Playwright and a system Chromium, available in the current cloud environment but not frontend npm dependencies. Use `--url`, `--chromium` and `--screenshots` as needed. Generated artifacts are ignored. See [verification](docs/verification.md) for observed coverage and limits.

## Repository hygiene

Commit source and reproducibility files, including the existing `package-lock.json`. Keep secrets, raw downloads, local environments and generated output out of version control. Original software and project-authored documentation use the [MIT License](LICENSE); preserve its notices. Dependencies, datasets and publications retain their own terms, recorded beside their sources. Software licensing does not approve scientific reuse.
