# Development preview verification

## Two-source binding comparison — 2026-10-23, local checkpoint

Snapshot `alzheimers-source-checked-0.4.0` passes development validation and JSON Schema: **23 entities, 23 claims/evidence records and 24 sources**. It adds two Bailey 2015 binding findings and one paper projection. The Atagi records gain structured assay condition, protein form, preparation and immobilization context from the same inspected captions; unknown variant-assay preparation stays null. Human association findings and database annotations are unchanged. The [change log](../data/alzheimers/CHANGELOG.md) records readable PubMed captions, selected search-indexed PMC methods/results, blocked direct full-text access, reuse checks and the observed in-article correction. Raw figures, supplements and underlying data were not reviewed. All 46 scientific records remain draft; the separate release gate still rejects the outstanding scientific/source checks.

All **51 tests** pass. New coverage preserves technical-well versus repeated-experiment units, plasma-APOE isoform uncertainty, original correction identity and dated notice links. Runtime validation and JSON Schema reject a corrected/retracted record without a notice URL. Comparison defaults use the same recorded binding-condition label on the same relationship in another publication; repeated source IDs, PMIDs or DOIs cannot masquerade as a different paper. This is a navigation preference, not a comparability or independence judgment. Preparation differences, explicit unknowns and the correction URL survive the Markdown brief.

Production build/typecheck, strict checks of the affected curation tools/tests, both generated-packet freshness checks, dependency source/integrity/exact-pin checks and local Markdown target review pass. No dependency, package manifest, lockfile or install policy changed. The main application is approximately 371 kB minified / 100 kB gzip; the existing lazy-3D size warning remains at approximately 943 kB / 250 kB gzip. Scientific-release validation still rejects draft approvals and unresolved checks while the size target remains met.

The full browser suite passed search/keyboard/list/graph, original links, pathway journeys, themes, sharing/restoration/retry, comparisons, touch/mobile and WebGL fallback. Its eight idle samples observed **0 frame requests / 0 WebGL draws**. New checks exercise initial baseline pairs across studies, an explicit R47H comparison, same-paper shared-identity checks, preparation unknowns, separate experiment counts, original correction links/dates, downloaded Markdown and actual cited PNGs. Study names and recorded conditions remain distinguishable in the controls and cards; assay fields precede general study fields without dropping missing values.

Desktop light/dark, the two-study comparison, 360 px touch layouts and the complete Bailey citation PNG were visually inspected. A crowded paper/pathway label prompted an even-ring offset and outward placement of upper paper labels; near-edge labels retain their vertical bounds. Final follow-up browser checks cover camera controls, canvas selection, the two-study flow, mobile/fallback and idle rendering after those adjustments. These are local headless system-Chromium/software-WebGL checks; no deployed Vercel or real-device result is claimed. Six staged papers remain outside the graph, and no independent-review attestation, scientific contradiction or research hypothesis was created.

## Assay-specific APOE–TREM2 findings — 2026-10-23

Snapshot `alzheimers-source-checked-0.3.0` passes development validation and the separate JSON Schema check: **22 entities, 21 claims/evidence records and 23 sources**. The prior entity, claim, evidence and source records are unchanged. Two new protein-level findings share Atagi 2015, with original figure-caption locators, assay controls and explicit replicate units. Three assay replicates never become three participants or independent papers. The [change log](../data/alzheimers/CHANGELOG.md) records the actual source/terms inspections and blocked full-text access. Raw figures, complete methods and supplements were not reviewed. All 42 scientific records remain draft, and the scientific-release gate still rejects the outstanding approvals/source checks without an entity-count error.

All **48 tests** pass, including same-relationship comparison defaults, shared-paper identity, unpooled replicate/sample context, typed binding endpoints, and protein/pathway share-filter round trips. Production build/typecheck, strict TypeScript checks of the affected curation tools/tests, development-data validation, both generated-packet freshness checks, dependency source/integrity/exact-pin checks and social-preview artifact validation pass. All 147 local Markdown targets resolve. No package, lockfile, install configuration or dependency changed. The main application is approximately 359 kB minified / 98 kB gzip; the existing lazy-3D chunk warning remains at approximately 942 kB / 250 kB gzip.

The full browser suite passed desktop/touch search, list/graph selection, original links, typed pathway journeys, themes, image export/retry/native cancellation, sharing restoration, comparisons and WebGL fallback. Its eight idle samples observed **0 frame requests / 0 WebGL draws**. New checks verify visible assay context, the baseline/R47H initial comparison, shared publication identity, distinct replicate units, unknown participant counts, actual downloaded Markdown and PNG files, restored protein filters and keyboard focus. Sampled assay-context text passes contrast checks in both themes; 360 px touch and unavailable WebGL retain the new finding/comparison flow.

Desktop light/dark, the complete citation PNG, narrow layouts and comparison views were visually inspected. A crowded new paper label prompted a small increase in paper-ring spacing; final follow-up checks passed overview canvas picking, the binding flow, mobile/fallback and idle rendering after that adjustment. These are headless system-Chromium/software-WebGL checks, not deployed Vercel, real-device or assistive-technology verification. The six staged candidate papers remain outside the graph, exact Reactome release provenance is unresolved, and no independent-review attestation, contradiction or hypothesis was created.

## Source-checked pathway explorer — 2026-10-22, local checkpoint

Snapshot `alzheimers-source-checked-0.2.0` passes runtime development validation and the separate JSON Schema check: **21 entities, 19 claims, 19 evidence records and 22 sources**. The original four association findings are unchanged. The 15 added claims are seven gene/product mappings, seven curated pathway-participation annotations and one TREM2–DAP12 binding annotation. Source checks, observed UniProt entry versions, reuse attribution and Reactome access-date/release limits are recorded in the [dataset change log](../data/alzheimers/CHANGELOG.md). All 38 claim/evidence records remain draft; no human-review or independent-approval attestation was added. Independent scientific review is a future milestone under the owner's current preference and does not block this development track.

All **44 tests** pass. The dataset regression now checks distinct gene/protein identities, connected pathway records, human annotation scope, database evidence and retained draft status. Production build/typecheck, strict TypeScript checks of affected curation tooling/tests, dependency source/integrity/exact-pin checks, both generated-packet freshness checks, social-preview artifact validation and local Markdown link review pass. No dependency, package manifest or lockfile changed. The main application is approximately 351 kB minified / 97 kB gzip; the existing lazy-3D chunk warning remains at approximately 942 kB / 250 kB gzip.

The existing browser suite passed the expanded snapshot's search, original study links, canvas picking, keyboard results overflow, themes, mobile touch, WebGL fallback, image export/retry/native cancellation, share-link restoration and finding comparisons. Its six idle checks observed **0 frame requests / 0 WebGL draws**. Focused checks on the final pathway UI passed APOE → protein → cholesterol regulation → ABCA1 and TREM2 → protein → DAP12 signaling, including directional labels, retained finding selection, cleared incompatible filters, heading focus, original database URLs, modified-protein state context, source terms, mobile touch and unavailable WebGL. The new pathway idle sample also observed 0/0 after navigation and real PNG capture.

Desktop light/dark, 360 px overview/evidence and the database-backed PNG were visually inspected. Initial mobile label crowding was corrected by emphasizing the main anchors and current selection, wrapping pathway names, and keeping labels inside the canvas; filtered small sets retain their labels. These are headless Chromium checks using the existing system browser, not a real-device or assistive-technology audit. The public Vercel deployment and social-platform caches were not inspected in this checkpoint. Scientific-release validation still correctly rejects draft reviews and unresolved source checks; its size-boundary error is now absent.

## AD candidate-source coverage checkpoint — 2026-10-22, local commits

A selective, AI-assisted web lookup staged six original publications and two human Reactome pathway records outside the client. The generated coverage table links three reading questions to these sources and the four existing draft findings. Each candidate records the actual inspection location, page versus indexed-excerpt access, lookup date, unknown context, and pending review/publication/reuse checks. Reactome's data/artwork terms were inspected and recorded as an observation; no project reuse or scientific approval was granted. Database releases and member-event provenance remain unresolved. No abstracts, full text, figures, artwork, or upstream raw payloads are committed.

All **44 tests** passed, including seven new coverage tests for deterministic/nonmutating output, blocked approval/promotion, content allowlisting, reference integrity, duplicate/source identities, preserved unknowns, and malformed inputs. The generator and its tests passed a separate strict TypeScript check. Coverage freshness, starter-review freshness, development-data validation, dependency source/integrity/exact-pin checks, production build/typecheck, social-preview artifact check, and local Markdown link review passed. Scientific release validation still rejects the starter with the same 26 outstanding review/source/size errors. The client remains eight entities and four draft claims; no dependencies, lockfile entries, application bundles, or scientific review attestations changed. The existing lazy-3D chunk size warning remains. No interface changed, so the application browser suite was not rerun.

The web tool could not access the public Vercel page or social PNG, so the deployed preview and platform caches remain unverified here. A bounded OpenAlex API URL and the Reactome database-version endpoint were also unavailable through that tool. These are web-tool access failures, not successful CLI adapter requests or observations that the public services are down. No live API response, Reactome release, deployed update, or new scientific graph content is claimed.

## Social link preview checkpoint — 2026-10-22, local commit

The production build and all 37 existing tests passed. The new standard-library `python3 tools/social-preview.py check` verified canonical/Open Graph/Twitter metadata in the built initial HTML, matching absolute HTTPS page/image URLs for `discover-galaxy-web.vercel.app`, and the shipped 1200 × 630 PNG. The card is approximately 174 kB; its source SVG and optional renderer are committed. No npm dependencies, lockfile entries, application bundles, or scientific records changed. The existing lazy-3D chunk size warning remains.

Focused browser checks against the local production-preview server confirmed that metadata is present with JavaScript disabled and the image responds with `image/png` and the committed bytes. Chromium decoded the actual image at 1200 × 630 with nonblank, opaque content; both the full-size card and a 600 × 315 thumbnail were visually inspected. Light/dark initial appearance still resolved correctly with the application module blocked. These are local HTTP/browser checks; no social-platform preview cache or post-deployment result is claimed.

The dependency source/integrity/exact-pin check, review-packet freshness check, and local Markdown link review passed. The full application browser suite was not rerun for this static metadata/asset change; its previous checkpoint results remain below. [Social preview maintenance](social-preview.md) records domain updates, asset regeneration, and external cache limits.

## Candidate intake checkpoint — local commits only

The combined suite passes 37 tests, including seven OpenAlex intake tests. The adapter and its tests passed a separate strict TypeScript check. A real CLI run against the explicitly synthetic archived fixture produced an `offline_input` packet with a processing timestamp, unknown original retrieval time, duplicate metadata grouped for inspection, and every candidate marked `unreviewed` / `not_in_graph`. The fixture and staged output are not imported by the client. Local `data/staging/` output is ignored by Git.

The tests cover nullable bibliographic fields, identifier grouping, retained provider retraction disagreements, metadata allowlisting, credential removal, invalid payloads/URLs/dates/bounds, one-page requests, bearer headers, timeout, size limits, and sanitized failures. Simulated transport responses verify the implementation contract; they do not establish current live API compatibility. The source contract and usage references are in [curation tooling](../tools/curation/README.md).

One keyless live request through the configured environment proxy failed before a candidate packet was produced. Live OpenAlex retrieval remains unverified in this restricted cloud environment. No real imported papers, new scientific relationships, review attestations, dependencies, or published dataset changes were created. The dependency source/integrity/exact-pin check and all 111 local Markdown links passed.

The user's instruction for this checkpoint is commit only: no push or deployment was performed.

## Evidence comparison checkpoint — local commits only

The comparison implementation passed the production build, all 30 current data/share-state/comparison/review-packet tests, development-data validation, and review-packet freshness. The scientific dataset remains the same eight entities and four draft claims. No dependencies were added. The main application chunk is approximately 300 kB minified / 91 kB gzip; the existing 3D chunk size warning remains.

The full browser suite passed on the final source. New checks compare the two APOE findings without classifying them as a conflict; preserve claim scope separately from source-specific study context; verify all four original publication targets across pairs; and retain unknown sample size plus TREM2's separate 2,261 sequenced-discovery-individual count. Downloaded Markdown preserves full statements, citations, limitations, dataset version, and actual review fields.

Light/dark, 360 px touch layout, keyboard table scrolling, dialog dismissal/focus restoration, unchanged explorer selection/search/filter, and unavailable WebGL passed. Existing search/evidence/theme/sharing/retry flows passed as well. All six idle samples observed 0 frame requests and 0 WebGL draws. Desktop/mobile comparison screenshots were visually inspected. These remain headless Chromium checks, not an assistive-technology or real-device audit.

Comparison labels describe recorded fields only. Unknowns do not become matches; participant counts are not pooled; repeated PMID/DOI/source identities do not become independent evidence. Development records marked approved without an explicit human-review flag remain pending in comparisons and exported briefs. Curated disagreements, scientific hypotheses, and new approved graph content remain unimplemented.

## Appearance checkpoint — 2026-10-21

The Light / Dark / System implementation passed the production build, all 21 existing data/share-state/review-packet tests, review-packet freshness, and the dependency source/integrity/exact-pin check. No dependencies or scientific records changed. The main application chunk is approximately 285 kB minified / 87 kB gzip; the existing 3D chunk size warning remains.

Focused browser checks passed for default System behavior, explicit Light/Dark selection, reload persistence, operating-system changes, real cross-tab storage events, invalid stored preferences, and blocked storage. With the app module withheld, the head script still set the correct initial dark background and browser theme color. The dark page background is exactly `#1F1F24`.

Switching themes preserved the entity, finding, query, filter, and view. Sampled body/evidence/control text and placeholders met 4.5:1 contrast in both themes, and keyboard focus remained visible. Browser checks also covered the 360 px touch header, dark List mode, evidence/sharing dialogs, and unavailable WebGL. Exported PNGs retained their light citation-card palette. The graph settled after switching: a 500 ms idle sample observed 0 frame requests and 0 WebGL draws.

Desktop and mobile screenshots were visually inspected. These checks cover the documented headless Chromium environment and sampled states, not a complete accessibility audit or a real-device browser matrix.

The full revised smoke suite also passed the existing graph/evidence/search/mobile/fallback, PNG export, native-sharing cancellation, copy-link restoration, and export-Retry flows. All five idle samples recorded 0 frame requests and 0 WebGL draws.

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
