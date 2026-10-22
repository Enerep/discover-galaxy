# Contributing

Read [README.md](README.md) and [steps.md](steps.md) to understand the current milestone. Coding agents should also read [AGENTS.md](AGENTS.md).

## Making changes

1. Identify the milestone and the smallest useful change. Check the product and architecture documents before expanding scope.
2. Implement the change and update any affected contracts, setup instructions, and milestone checkboxes.
3. Validate the result with checks that actually exist in the repository.
4. Describe the resulting behavior, validation, and any remaining limitations for review.

The local React application and its engineering checks now exist. The eight-entity development snapshot remains scientifically unapproved; no deployment or public scientific release is implied by a successful build.

## Local setup and checks

Use Node 24 (`.nvmrc`) and npm 11.9.0. Run commands from the repository root; npm workspaces route the frontend tasks to `apps/web/`. Read the [dependency security policy](docs/npm-security.md) before installation or dependency changes.

```sh
npm ci --ignore-scripts
npm run check:dependencies
npm audit
npm run validate:data
npm test
npm run build
npm run dev
```

`npm run build` includes TypeScript checking. `npm run typecheck` runs that check alone, and `npm run preview` serves the built frontend. The development command starts Vite on port 5173 by default; use the URL it reports. Installation lifecycle scripts stay disabled; explicit reviewed project commands still execute their named scripts.

`npm run validate:data` permits structurally valid draft records and reports review warnings. `npm run validate:release` must fail for the current starter: approved human scientific review, reuse and publication-status checks, and the 20–50 entity release target remain incomplete. Do not change review fields merely to make this command pass.

For dependency updates, inspect the lockfile diff and use `npm run check:dependencies -- --metadata` with registry network access to check publication dates against the reviewed cutoff. The optional known-IOC comparison and its tests use Python's standard library:

```sh
python tools/security/check-iocs.py
python -m unittest discover -s tools/security -p 'test_*.py'
```

The IOC comparison fetches pinned historical feeds unless an offline feed directory is supplied. Its limits and exit codes are documented in the [security policy](docs/npm-security.md). These checks do not substitute for source review or current advisory checks.

## Scientific content

Follow the [evidence policy](docs/evidence-policy.md) and [data model](docs/data-model.md). A content change should include stable entity identifiers, exact claims, original references, study context, provenance, and review status. Verify that sources support the wording being presented. Keep uncertainty and conflicting findings visible.

Code review and AI-assisted source lookup do not establish scientific validity. Record an independent human scientific content review before including a claim in a public snapshot. Retain the development starter's draft status and lookup limitations until that review is completed. Do not use realistic invented citations as demo content. Synthetic fixtures belong in isolated test data and must be labeled.

## Reviewing interface changes

Check the main flow from search to entity selection to original evidence. Include the list alternative, keyboard navigation, reduced motion, empty search results, and unavailable WebGL. Scientific information must be accessible without using the 3D canvas. Record browser, viewport, and observed results; a passing typecheck, build, or data test does not establish that browser interactions work.

An optional reproducible smoke test is available as `python3 tools/browser-smoke.py` against a running local server. It requires Python Playwright and a system Chromium, which are available in the current cloud environment; they are not frontend npm dependencies. Pass `--url`, `--chromium`, or `--screenshots` to change the defaults. Generated browser artifacts are ignored. See the [verification record](docs/verification.md) for observed coverage and limits.

## Repository hygiene

Commit source and reproducibility files, including the existing `package-lock.json`. Keep secrets, downloaded raw datasets, local environments, and generated output out of version control. Original software and project-authored documentation use the [MIT License](LICENSE); retain applicable copyright and license notices. Track third-party attribution and licensing alongside dependencies and curated data; the software license does not replace their terms or approve scientific reuse.
