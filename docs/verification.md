# Development preview verification

Checked on **2026-10-20** in the Codex cloud workspace. These results cover the current development starter, not a scientific release or a deployed service.

## Application and data

| Check | Observed result |
| --- | --- |
| `npm test` | 11 native Node tests passed: data integrity, malformed inputs, aliases, paper projections, and release gates |
| `npm run validate:data` | Passed: 8 entities and 4 claims; warnings retain the pending-review state |
| `npm run validate:release` | Failed as intended: 26 errors prevent promoting draft, undersized, scientifically unapproved data |
| `npm run build` | TypeScript checks and Vite production build passed |
| JSON Schema cross-check | The schema and actual dataset also validated with the environment's Python `jsonschema` library |

The build warns about the lazy-loaded 3D chunk's size: approximately 938 kB minified / 248 kB gzip. The main application chunk is approximately 274 kB / 83 kB gzip. No frame-rate or real-device performance claim has been established.

## Browser interactions

The reproducible [browser smoke test](../tools/browser-smoke.py) ran against the local Vite server using the environment's installed headless Chromium **154.0.8037.57** with software WebGL. It installs no browser or npm package. It requires Python Playwright and a system Chromium, independently of the frontend runtime.

```sh
# Start the server in one terminal.
npm run dev

# Run in another terminal with the optional browser prerequisites available.
python3 tools/browser-smoke.py --screenshots artifacts/browser
```

- **Desktop, 1440 × 1000:** WebGL rendering, actual canvas-node picking, gene selection, source-link targets, claim and source-specific study context, search shortcut, apostrophe-normalized disease search, neighborhood display, no-result state, list/paper selection, keyboard activation, type filters, and dialog dismissal passed.
- **Mobile emulation, 390 × 844:** responsive layout without horizontal overflow, reduced-motion preference, type filters, and entity inspection passed.
- **WebGL disabled, 1280 × 900:** the application switched to the HTML list; entity selection and original-evidence links remained usable.

The normal desktop and mobile runs produced no uncaught page errors. External publication links were checked for the intended URLs; the test did not visit publisher pages. These checks do not constitute a full assistive-technology or accessibility audit, a real mobile-device test, or a scientific review.

## Dependency checks

Direct dependencies are exactly pinned. Resolution used `--before=2026-10-06T00:00:00.000Z`; installation used `npm ci --ignore-scripts`. The [dependency policy](../tools/security/dependency-policy.json) records this cutoff, and [.npmrc](../.npmrc) keeps lifecycle scripts disabled.

| Check | Observed result |
| --- | --- |
| `npm run check:dependencies` | 68 registry package entries have approved registry URLs and SHA-512 integrity fields; direct pins are exact |
| `npm run check:dependencies -- --metadata` | All 68 locked entries satisfy the reviewed publication-date cutoff |
| `npm audit --ignore-scripts` | 0 reported vulnerabilities at check time |
| Pinned IOC comparison | 0 exact package/version matches across the selected Datadog and Wiz feeds |
| IOC parser tests | 7 Python standard-library tests passed |
| `npm audit signatures` | **Incomplete:** npm's TUF trust-metadata download failed in this environment; signature/provenance verification is not claimed |

The only locked install-script declaration was the optional macOS package `fsevents@2.3.3`; lifecycle scripts remained disabled. Registry integrity, audit findings, and known-indicator comparisons do not establish that every dependency is benign. The pinned feeds have bounded historical coverage and require deliberate refreshes. See [npm security](npm-security.md) and the [initial IOC report](../tools/security/initial-ioc-report.json) for exact feed revisions, hashes, and the checked lockfile hash.

## Scientific limits

The four association claims are scoped to particular variants and study populations. Source lookup was AI-assisted and limited to abstracts and bibliographic metadata. All claim and evidence records remain draft, with no human reviewer recorded. Source reuse assessments and correction/retraction checks are incomplete.

There are no pathway claims, verified disagreement comparisons, research-question cards, live AI explanations, biomedical API integrations, backend, database, or deployment. Follow [steps.md](../steps.md) and the [starter notes](../data/alzheimers/README.md) before expanding or releasing scientific content.
