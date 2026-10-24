# Scientific curation tools

These command-line tools prepare material for review. They do not promote records into the graph, establish biological support, or create human-review attestations.

## Current snapshot review packet

`npm run curation:packet` prints the existing snapshot's review extract; `npm run curation:check` verifies the committed packet is current. Record actual reviews in the source dataset, then regenerate the extract.

## Candidate-source coverage

The checked-in [reading plan](../../data/alzheimers/candidate-coverage.json) stages six manually selected publications around the existing gene anchors. The two earlier pathway candidates entered snapshot 0.2.0 through a separate source-checked draft diff; see the [change log](../../data/alzheimers/CHANGELOG.md). The plan contains bibliographic metadata and project-authored screening notes, not abstracts, paper text, graph claims, or scientific approvals. Actual page access is distinguished from indexed excerpts. Unknown experiment-level context, publication checks, permissions, and database releases stay explicit.

```sh
npm run --silent curation:coverage > data/alzheimers/candidate-coverage.md
npm run curation:coverage:check
```

The [generated coverage table](../../data/alzheimers/candidate-coverage.md) includes the current snapshot's pending review states and links three reading questions to candidate sources. Its validator rejects unresolved or duplicate identities, records already in the snapshot, mismatched baseline versions, unsupported extra content, invalid dates/URLs, and attempted scientific/reuse approval or promotion. It requires each candidate to have a reading question. It does not inspect sources, check source accuracy, infer contradictions, assess independence, import content, or fetch data. `npm test` includes its contract tests.

This targeted lookup is **separate from the OpenAlex adapter below**. Neither a retrieved web page nor this coverage validator establishes that the API adapter completed a live request. Draft pathway annotations may retain an explicitly unknown release with inspected record/participant locators and access dates; do not claim an immutable upstream snapshot. Resolve gene/protein/state meanings and inspect original sources before adding experimental claims. Independent scientific review is a deferred future milestone; no tooling may fabricate its attestations.

## Gene and protein API intake

`biomedical-intake.ts` makes one fixed, bounded provider request for an explicitly identified human gene/product, or normalizes a saved JSON response. It writes a staging packet to stdout and never modifies the scientific snapshot, invokes a browser request or receives uploaded experiment data. No new npm dependency, API key, server or install hook is required.

```sh
# Live request in an environment whose network policy permits the provider.
npm run --silent curation:annotations -- --provider uniprot --symbol COL1A1 --ensembl ENSG00000108821 --uniprot P02452

# Replay a legitimately saved provider JSON response; no network request.
npm run --silent curation:annotations -- --provider reactome --symbol COL1A1 --ensembl ENSG00000108821 --uniprot P02452 --input /path/to/reactome-response.json

# Direct association summaries; only page zero, size 20, enableIndirect=false.
npm run --silent curation:annotations -- --provider opentargets --symbol COL1A1 --ensembl ENSG00000108821 --uniprot P02452
```

Keep output in ignored `data/staging/`. The CLI validates the declared symbol, stable Ensembl ID and canonical UniProt accession. UniProt must match accession, primary gene symbol and human taxon; explicit Ensembl cross-references must agree. Missing Ensembl cross-references remain unverified. Reactome accepts human pathway objects only, retaining record revisions when supplied; mappings do not imply a molecular state or direct binding. Open Targets must match both gene identifiers, reject GraphQL errors/partial error responses, and preserve overall/data-source scores under their provider definitions. A score is not a causal or therapeutic-success probability. First-page truncation is explicit; no citation count or independent-study claim is derived.

Packets retain actual processing time, exact request, response-byte SHA-256, provider-reported release when available, source terms/attribution and original IDs. Offline packets keep `retrieved_at: null` and label request provenance as declared, since processing an archive does not verify when or how it was fetched. Live packets record actual completed retrieval. UniProt captures `X-UniProt-Release`; entry version/update date are separate. Open Targets requests `meta.dataVersion`; Reactome global release is unknown. No result is called an immutable provider snapshot.

Every API packet stays `unreviewed` / `not_in_graph`. Normalization is not source inspection or scientific approval. It retains identity names, identifiers, pathway mappings and association summaries only, discarding sequences, function prose, abstracts, full text and arbitrary fields. Source-checked draft promotion requires a separate reviewable dataset diff; independent human scientific review remains the deferred release milestone. The [four-gene seed](../../data/annotations/README.md) instead uses already pinned HGNC/Reactome references and records that distinct origin honestly.

Requests use inherited proxy/CA settings, HTTPS and fixed hosts, a 15-second timeout covering fetch/body reading, no redirects/retries and a 5 MiB streamed response cap. Reactome caps mappings at 1,000; Open Targets requests at most 20 rows. Non-success responses, identity mismatches and invalid shapes fail without printing provider bodies, transport details or secrets. Builds and the hosted app never fetch upstream data. Direct probes to all three providers failed at this workspace's configured proxy on 2026-10-24; offline and simulated-request tests do **not** establish live availability. Allow `rest.uniprot.org`, `reactome.org` and `api.platform.opentargets.org` through the supported environment configuration before performing a real import; never bypass its proxy.

Source contracts and terms inspected on 2026-10-24:

- [UniProt API help](https://www.uniprot.org/help/api_queries) and [license](https://rest.uniprot.org/help/license): entry JSON identity/audit fields, CC BY 4.0 attribution. The JavaScript help page was a fallback; the REST license document was readable.
- [Reactome's official Python client mapping method](https://github.com/reactome/reactome2py/blob/b3cbc27bb381b79153b80078a382c3dac5097b45/reactome2py/content.py): `/data/mapping/UniProt/{accession}/pathways?species=9606` returns lower-level pathway mappings. [Reactome data terms](https://reactome.org/license), section 1(c), are CC0.
- [Open Targets GraphQL documentation](https://platform-docs.opentargets.org/data-access/graphql-api), [official association query](https://github.com/opentargets/platform-api/blob/253d0d5f16512074f7a86f9181663ab6d58de9dc/test/resources/gqlQueries/TargetAssociations_TargetAssociationsQuery.gql) and [schema version fields](https://github.com/opentargets/platform-api/blob/253d0d5f16512074f7a86f9181663ab6d58de9dc/app/models/gql/Objects.scala): POST target variables, pagination, direct-association flag and provider data version. [Open Targets licence](https://platform-docs.opentargets.org/licence) marks data CC0. Contract/source-code inspection is separate from testing the live endpoint.

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
