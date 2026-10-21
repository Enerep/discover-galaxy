# Development preview verification

## Sharing checkpoint — 2026-10-21

The sharing and review-preparation checkpoint passed the production build, all 21 data/share-state/review-packet tests, development-data validation, and the dependency source/integrity/exact-pin check. No dependencies or scientific records changed. The current application chunk is approximately 282 kB minified / 87 kB gzip; the lazy 3D chunk remains approximately 942 kB / 249 kB gzip and still produces the existing size warning.

The browser smoke suite downloaded and decoded actual PNG files from the graph, a zoomed graph, the list, mobile touch emulation, and the WebGL fallback. Files had valid PNG headers, a width of 1200 px, sufficient height to retain the finding and references, and nonblank image content. Zooming changed the exported graph. The graph and list exports were visually inspected for the full finding, original citation, limitations, draft label, and dataset version.

Dialog keyboard focus, Escape dismissal, mobile layout, download touch targets, supported native file-sharing invocation, and cancellation passed. Native sharing used a browser stub; an actual operating-system share sheet was not exercised. Rendering still settled after capture: the four 500 ms idle samples observed 0 frame requests and 0 WebGL draws.

Shared-link checks passed for all five stored fields (entity, finding, query, filter, and view), fresh load/reload, hash navigation and browser Back, invalid entity/claim recovery, and unavailable WebGL. Clipboard invocation and denial were tested with browser stubs; denial left the full link selected for manual copying. Copied links stripped unrelated URL parameters. Six native Node tests additionally exercise Unicode queries, malformed fragments, duplicate keys, bounds, related paper claims, and URL canonicalization.

An isolated browser regression forced PNG encoding to fail, confirmed the error/Retry state and retained sharing link, restored the encoder, then successfully retried and downloaded a real PNG. Closing returned focus to Share.

`npm run curation:check` confirmed the generated AD review packet matches the current snapshot. The four packet tests preserve citations, locators, study context, actual pending review/source-check fields, and deterministic output; a broken citation fails validation. The generator and its tests also passed a separate strict TypeScript check. No source lookups, new scientific claims, or human review attestations were produced.

The owner reports the Vercel preview is working. Its deployed URL and deployment logs were not independently inspected; source pushes do not establish deployment success.

## Initial explorer verification — 2026-10-20

Checked on **2026-10-20** in the Codex cloud workspace, including the simplified interface and motion refinement on `master`. These results cover the current development starter, not a scientific release or a deployed service.

## Application and data

| Check | Observed result |
| --- | --- |
| `npm test` | 11 native Node tests passed: data integrity, malformed inputs, aliases, paper projections, and release gates |
| `npm run validate:data` | Passed: 8 entities and 4 claims; warnings retain the pending-review state |
| `npm run validate:release` | Failed as intended: 26 errors prevent promoting draft, undersized, scientifically unapproved data |
| `npm run build` | TypeScript checks and Vite production build passed |
| JSON Schema cross-check | The schema and actual dataset also validated with the environment's Python `jsonschema` library |

The build warns about the lazy-loaded 3D chunk's size: approximately 941 kB minified / 249 kB gzip. The main application chunk is approximately 272 kB / 83 kB gzip. No frame-rate or real-device performance claim has been established.

## Browser interactions

The reproducible [browser smoke test](../tools/browser-smoke.py) ran against the local Vite server using the environment's installed headless Chromium **154.0.8037.57** with software WebGL. It installs no browser or npm package. It requires Python Playwright and a system Chromium, independently of the frontend runtime.

```sh
# Start the server in one terminal.
npm run dev

# Run in another terminal with the optional browser prerequisites available.
python3 tools/browser-smoke.py --screenshots artifacts/browser
```

- **Desktop, 1440 × 1000:** WebGL rendering, actual canvas-node picking, gene selection, all four publication-link targets, claim and source-specific study context, collapsed/inert disclosures, search shortcut and arrow/Enter/Escape navigation, apostrophe-normalized disease search, neighborhood display, no-result recovery, list/paper selection, keyboard activation, type filters, dialog dismissal, and zoom/reset controls passed.
- **Mobile touch emulation, 390 × 844:** responsive layout without horizontal overflow, pinch guidance, tested control targets of at least 40 × 40 px, reduced-motion styling, type filters, and entity inspection passed. Selecting entities, searching, and filtering did not force page scrolling; explicit View evidence / Back to graph actions moved focus and the viewport.
- **WebGL disabled, 1280 × 900:** the application switched to the HTML list; entity selection and original-evidence links remained usable.

Overflow regressions also passed: keyboard navigation kept all eight results of a broad search visible, including wrapping from last to first. Changing entities after scrolling expanded study details reset only the inspector's internal scroll position. Neither action moved the document.

Test-only instrumentation sampled rendering after the initial scene, zoom/reset, and reduced-motion interactions. Each 500 ms idle sample observed **0 animation-frame requests and 0 WebGL draw calls** after settling. This establishes idle behavior in the tested browser, not a frame-rate or battery-life benchmark. The instrumentation is confined to the browser test.

The normal desktop and mobile runs produced no uncaught page errors. External publication links were checked for the intended URLs; the test did not visit publisher pages. These checks do not constitute a full assistive-technology or accessibility audit, a real mobile-device test, or a scientific review.

## Dependency checks

Direct dependencies are exactly pinned. Resolution used `--before=2026-10-06T00:00:00.000Z`; installation used `npm ci --ignore-scripts`. The [dependency policy](../tools/security/dependency-policy.json) records this cutoff, and [.npmrc](../.npmrc) keeps lifecycle scripts disabled.

The UX refinement changed no package manifests or lockfile and installed no dependencies. The local source/integrity/exact-pin check was rerun; the network-backed results below were recorded during the initial scaffold verification and were not rerun for these interface changes.

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
