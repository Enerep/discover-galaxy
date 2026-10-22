# Scientific curation tools

These command-line tools prepare material for review. They do not promote records into the graph, establish biological support, or create human-review attestations.

## Current snapshot review packet

`npm run curation:packet` prints the existing snapshot's review extract; `npm run curation:check` verifies the committed packet is current. Record actual reviews in the source dataset, then regenerate the extract.

## Candidate-source coverage

The checked-in [reading plan](../../data/alzheimers/candidate-coverage.json) stages eight manually selected sources around the existing gene anchors. It contains bibliographic metadata and project-authored screening notes, not abstracts, paper text, graph claims, or scientific approvals. Actual page access is distinguished from indexed excerpts. Unknown experiment-level context, publication checks, permissions, and database releases stay explicit.

```sh
npm run --silent curation:coverage > data/alzheimers/candidate-coverage.md
npm run curation:coverage:check
```

The [generated coverage table](../../data/alzheimers/candidate-coverage.md) includes the current snapshot's pending review states and links three reading questions to candidate sources. Its validator rejects unresolved or duplicate identities, records already in the snapshot, mismatched baseline versions, unsupported extra content, invalid dates/URLs, and attempted scientific/reuse approval or promotion. It requires each candidate to have a reading question. It does not inspect sources, check source accuracy, infer contradictions, assess independence, import content, or fetch data. `npm test` includes its contract tests.

This targeted lookup is **separate from the OpenAlex adapter below**. Neither a retrieved web page nor this coverage validator establishes that the API adapter completed a live request. Before adding pathway assertions, capture the exact Reactome release/member-event provenance and resolve gene/protein identities. A human reviewer must inspect original methods/results and record real claim/evidence reviews in a separate dataset diff.

## OpenAlex candidate intake

The intake tool makes one bounded request to the OpenAlex works API or normalizes a locally archived response. It retains bibliographic metadata only: identifiers, title, publication date/year, work type, provider update time, and the provider's retraction flag. No abstracts, article text, similarity/relevance scores, or inferred scientific relationships are retained.

```sh
# One live first page; default query: Alzheimer AND (APOE OR ABCA1 OR TREM2).
node --use-env-proxy --experimental-strip-types tools/curation/openalex-intake.ts --limit 20

# Local normalization only. Supply the query that produced the archived response.
node --experimental-strip-types tools/curation/openalex-intake.ts --input /path/to/response.json --query 'Alzheimer AND TREM2' --limit 20

# Synthetic fixture exercise only: never load this fixture into the public graph.
node --experimental-strip-types tools/curation/openalex-intake.ts --input tools/curation/fixtures/openalex-response.json
```

Output is JSON on stdout; the tool never modifies `data/alzheimers/dataset.json`. Use an ignored local staging directory for captured output. Every packet records its actual `processed_at` time. An `offline_input` packet records a declared query, with `retrieved_at: null` because the archive's original network retrieval time is unknown; processing a file is not proof that a network query occurred. Successful fetches use `live_api_response` and record the completed fetch time in `retrieved_at`, not a scientific verification label. No immutable upstream release is claimed for the live API.

OpenAlex IDs and DOI aliases are grouped transitively so duplicate metadata does not appear as independent candidate studies. Duplicate records remain available for inspection. A group retraction flag is true if any member reports true, false only if all report false, and null otherwise; original member flags are retained. Neither a false flag nor separate publication IDs establish publication safety or cohort independence. Every candidate remains `unreviewed` and `not_in_graph` with an independent publication check still `not_checked`.

The CLI accepts `--query` (1–512 characters), `--limit` (1–50), and `--input` for offline JSON. It uses page one only, a 15-second fetch timeout, no redirects, and a 5 MiB response/input cap. Non-success responses and malformed payloads fail without printing response content, API keys, or transport details. It does not automatically retry rate limits, preventing surprise repeated requests; wait and rerun deliberately after a `429`.

For proxied environments, the shown Node 24 `--use-env-proxy` option preserves `HTTP_PROXY`/`HTTPS_PROXY`/`NO_PROXY`. Keep configured CA trust and TLS verification. If destination policy blocks `api.openalex.org`, use the supported environment configuration workflow or a legitimate archived response; do not bypass the proxy. Live API access from this workspace has not been established by these unit tests.

The local checkpoint attempted one keyless live request through the configured proxy; it failed before producing a candidate packet. Offline and simulated-network checks pass, but a successful live API response remains unverified. The synthetic fixture is test material and must stay outside the graph.

## Source contract review

- [API reference](https://help.openalex.org/api/): OpenAlex metadata is CC0; list responses contain `meta` and `results`. Article content has separate reuse terms, so metadata access does not grant article-text redistribution rights.
- [Authentication](https://help.openalex.org/api/authentication/) (updated 2026-10-15): basic first-page queries currently work without a key. An optional free verified key increases the daily budget and permits deeper cursor paging. Keyless requests are limited to 10 requests/second, free-key requests to 30, and `per_page` to 100. Earlier 2026 API-key/rate-limit pages are stale; check current documentation before expanding intake.
- [Search](https://help.openalex.org/api/searching/): `search.title_and_abstract` scopes candidate matching to title/abstract text without returning that text; uppercase Boolean operators are supported. Matching does not establish biological support.
- [Select fields](https://help.openalex.org/api/selecting-fields/): selection uses top-level fields only.
- [Work attributes](https://help.openalex.org/data/works/attributes/) (updated 2026-10-17): external IDs can be absent; titles may be null; `is_retracted` reflects OpenAlex's provider record, not an independent check.

If you already have a verified OpenAlex key, supply it through `OPENALEX_API_KEY`; the tool sends a bearer header, never a saved query parameter. Do not put credentials in CLI arguments, fixtures, committed output, or the frontend. No account creation or email request is performed.

OpenAlex metadata is an input for candidate discovery. A human must inspect the original studies, scope findings and limitations, assess overlap and publication status, and record an actual review before including a scientific claim in an approved snapshot.
