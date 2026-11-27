# Live sources research-preview checkpoint

The website offers a bounded, read-only lookup for the human APOE and ABCA1 genes and proteins in the Alzheimer’s map. Select one in **Explore**, open **Live sources** below the curated findings and choose **Check live sources**. Opening the disclosure, selecting a record or uploading a file does not request providers. The curated explorer and local pathway analysis remain usable independently of provider availability.

## What the lookup returns

| Provider | Meaning and boundary | Terms |
| --- | --- | --- |
| UniProt | One exact human canonical protein identity; symbol/accession/taxonomy and available Ensembl cross-reference checked; entry version/update and exposed release header retained | [CC BY 4.0](https://rest.uniprot.org/help/license), credit UniProt Consortium |
| Reactome | Human lower-level pathways mapped from the exact UniProt accession; stable IDs and available record revisions, global release unknown | [CC0](https://reactome.org/license), credit Reactome |
| Open Targets | First 20 direct target–disease associations, `enableIndirect=false`; exact Ensembl ID/symbol checked, total reported, component scores and exact version components retained | [CC0](https://platform-docs.opentargets.org/licence), credit Open Targets |
| OpenAlex | First five title/abstract-search matches for fixed `Alzheimer AND APOE` or `Alzheimer AND ABCA1`; citation metadata only, grouped identifiers and original provider retraction flags | [CC0 metadata](https://creativecommons.org/publicdomain/zero/1.0/), credit OpenAlex/OurResearch; article content has separate terms |

Live results are **unreviewed**. Mappings do not establish pathway activity; association scores are provider-defined aggregates, not probabilities or causal findings. Literature matches are candidates for original-paper reading. They do not demonstrate support, study independence, publication safety or a shared human mechanism. No abstracts, article text, sequences or protein-function prose are retained in normalized results. A false/unknown OpenAlex retraction flag does not verify publication status. No provider call updates a graph claim, review attestation, interpretation catalog or numerical reference.

The first five records appear initially; remaining returned rows and their original statistics stay available through disclosures. **Provenance and terms** retains the exact fixed request, browser-reported retrieval time, SHA-256 of the actual response-body bytes, reported version/unknowns, attribution and coverage limits. A live response and a release label are not an immutable upstream snapshot. CORS-hidden release headers stay unknown. OpenAlex reports per-work update times rather than an invented global release.

## Privacy and failure behavior

The child component receives only one checked public identity. The transport accepts only the fixed APOE/ABCA1 triples already represented in the curated snapshot; mouse, variant, arbitrary symbol/URL and uploaded-gene lookups are unsupported. Even when a user reaches APOE from Analyze results, no experimental row, fold change, p-value, comparison, filename or context enters a provider request. Requests omit credentials and referrers, reject redirects and use fixed HTTPS endpoints. No key, server, dependency or additional storage/export is introduced.

Each provider has a 15-second deadline and a streamed 5 MiB response cap. HTTP, CORS, schema, identity and size failures produce a provider-local error. Other providers remain usable. There is no automatic retry or polling; deliberate provider retry preserves successful siblings. Explicit refresh retains prior records with their original retrieval times and labels refresh failures. Entity navigation aborts pending requests and ignores stale completions. Request controls retain keyboard focus; async completion does not move focus or scroll. All lookup state is memory-only and separate from research-brief storage and shared links.

Provider outages, anonymous quotas and browser CORS policies can change. Reactome rejected a Python client signature during this check while ordinary Chromium succeeded; no user-agent spoofing or proxy bypass was used. The UI handles these failures directly rather than silently substituting saved data or a third-party proxy. If future authenticated service access becomes necessary, credentials must stay outside the frontend and require a separately scoped architecture change.

## Shared contracts and checks

[Biomedical](../shared/source-intake/biomedical.ts) and [OpenAlex](../shared/source-intake/openalex.ts) pure modules provide the same request builders, allowlists and validation rules to browser and CLI adapters. Existing Node entry points and packet schemas remain compatible. Node uses its crypto implementation; the browser computes Web Crypto digests from exact response bytes before shared normalization. Parsed-object OpenAlex normalization still leaves the raw digest null. The extraction has parity checks for compact/formatted bytes, digest validation, original error classes and unchanged offline/live provenance.

```sh
npm run check:ci
npm run check:ci:security
npm run preview -- --port 4174
# With the production preview running:
python3 tools/live-sources-smoke.py --url http://127.0.0.1:4174/
```

CI uses synthetic fixtures and never requires live scientific providers. Browser mocks exercise UI/failure/privacy behavior separately from actual provider-access checks. Live checks use public curated IDs only, without an uploaded experimental file. Normal browser requests succeeded for all four providers from localhost and the existing Vercel origin on 2026-11-14; that verifies origin access, not deployment of this new UI. The new production-build UI also completed all eight APOE/ABCA1 provider requests on 2026-11-15, with independently verified response digests. The [metadata-only check record](../data/annotations/live-browser-check-2026-11-15.json) preserves exact requests, times, hashes, versions and coverage; it is a technical check, not a staging packet or scientific approval. Exact observed results and affected browser regressions belong in [verification](verification.md).

The resulting path is processed results → pathway/member measurements → curated findings and original papers → an explicit current-provider lookup. This is a useful stopping point for the research preview. Wider curated evidence, observed researcher feedback and independent scientific review remain future work; this checkpoint does not establish biological explanations or complete a scientific release.
