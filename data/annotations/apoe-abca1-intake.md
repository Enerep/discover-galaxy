# APOE / ABCA1 intake — 2026-11-05

This records the earlier staging checkpoint at base 9d83eeb. The separate [0.8.0 dataset diff](../alzheimers/CHANGELOG.md#alzheimers-source-checked-080--2026-11-05) later added inspected graph records and a fresh OpenAlex 0.2.0 capture; the original packet's unknown raw digest and the observations below are preserved.

The [inspection manifest](apoe-abca1-intake.json) prepares **eight selected staging records** from seven successful provider requests: two protein identities, two mappings to one shared pathway, two database association summaries, and two literature candidates. All remain `unreviewed` / `not_in_graph`. Source checking here means the limited inspections below, not independent scientific approval. No graph import was performed; snapshot 0.7.0 remains **40 entities, 41 claims and three pathways**.

Inspection dates use Asia/Ulaanbaatar; exact retrieval timestamps in the manifest use UTC. The base is fetched `origin/master` at `9d83eeb`. The manifest retains exact requests, declared identities, retrieval times, provider versions, source terms, counts and digests. Full packets and six bounded raw-response archives remain in ignored `data/staging/`; only the selected metadata/annotations and provenance summary are committed. A fresh fetch may return different bytes; these APIs are not immutable snapshots.

## Live access

| Host / identity | Completed UTC retrieval | Retained / reported | Observed version |
| --- | --- | --- | --- |
| rest.uniprot.org / APOE | 2026-11-05 00:00:45.152 | 1 / 1 | release `2026_04`, entry 281 |
| rest.uniprot.org / ABCA1 | 2026-11-05 00:00:45.202 | 1 / 1 | release `2026_04`, entry 244 |
| reactome.org / APOE | 2026-11-05 00:00:45.508 | 12 / unknown | selected pathway `R-HSA-9029569.2` |
| reactome.org / ABCA1 | 2026-11-05 00:00:46.412 | 4 / unknown | selected pathway `R-HSA-9029569.2` |
| api.platform.opentargets.org / APOE | 2026-11-05 00:00:44.940 | 20 / 2,836 | `26.09` |
| api.platform.opentargets.org / ABCA1 | 2026-11-05 00:00:45.794 | 20 / 1,797 | `26.09` |
| api.openalex.org / literature | 2026-11-04 23:56:45.327 | 5 / 21,458 | live API; no immutable release |

All four hosts returned successful API data. Open Targets initially returned HTTP 200 but its string-valued version components were rejected by the adapter. Schema `biomedical-annotations-2` accepts bounded numeric strings for version fields only, retains the original `{"year":"26","month":"09","iteration":null}`, and does not invent a century. Counts and scores remain strict numbers.

The successful OpenAlex packet predates the digest fix and retains schema `openalex-candidates-0.1.0`. Its raw response was neither archived nor hashed; the manifest records **only its saved packet digest**, with `response_sha256: null`. Later digest-enabled requests returned HTTP 504, 503, 504 and 503 for the original, narrower two-gene and single-gene queries; none produced a packet. Do not relabel the earlier packet as 0.2.0 or hash reconstructed JSON as original response bytes. Schema 0.2.0 now hashes actual bytes for future live requests and archived replay; a successful live 0.2.0 capture remains pending. No automatic retries or proxy bypass were added.

## Database records

UniProt identity/audit fields were inspected in the actual JSON responses. Both records are human, provider-reviewed, and explicitly cross-reference the declared Ensembl identity:

| Gene | Ensembl gene | UniProt protein | Identity check |
| --- | --- | --- | --- |
| APOE | ENSG00000130203 | [P02649](https://rest.uniprot.org/uniprotkb/P02649.json) | Apolipoprotein E; entry 281; annotation update 2026-11-04 |
| ABCA1 | ENSG00000165029 | [O95477](https://rest.uniprot.org/uniprotkb/O95477.json) | Phospholipid-transporting ATPase ABCA1; entry 244; annotation update 2026-11-04 |

The accessions match existing `protein-apoe` / `protein-abca1`; Ensembl IDs also match the pinned HGNC tuples. These are existing canonical identities, not new genes, variants or protein states.

Both mapping responses contain **[R-HSA-9029569](https://reactome.org/content/detail/R-HSA-9029569)**, revision `.2`. The record page's Stable Identifier, Type and Species fields, summary, and event list were inspected. It is a human pathway; its listed events include APOE and ABCA1 gene regulation. The mapping is an accession-to-pathway lookup, not proof that a canonical free protein is the exact event participant. Preserve that scope and resolve event-specific gene/protein/complex states before any separate dataset update. The existing pathway and `claim-apoe-cholesterol-pathway` / `claim-abca1-cholesterol-pathway` must not be duplicated. Global Reactome release remains unknown; the pinned enrichment reference was not refreshed.

The two selected Open Targets rows use `MONDO_0004975` (Alzheimer disease). APOE's overall association score is `0.695512952413486`; ABCA1's is `0.4940984029965598`. Exact component IDs/scores remain in the manifest. They are first-page **direct** association aggregates (`enableIndirect=false`), not original experiments, causal probabilities, evidence counts, or replacements for the variant-scoped human findings. [The provider defines these scores as ranking heuristics](https://platform-docs.opentargets.org/associations). No underlying evidence-page or study-level extraction was performed.

## Literature candidates

The completed OpenAlex query was `Alzheimer AND (APOE OR ABCA1)`, page one, limit five, with allowlisted bibliographic fields only. No abstracts or paper text entered its packet. Two candidates were selected for later assay review:

- **Wahrle et al. 2004** — [W2013111251](https://openalex.org/W2013111251), DOI `10.1074/jbc.M407963200`, PMID `15269217`. This is the existing `candidate-wahrle-2004`, not another study. The [author-institution record](https://profiles.wustl.edu/en/publications/abca1-is-required-for-normal-central-nervous-system-apoe-levels-a/), Abstract and citation, matches the metadata. Its abstract describes Abca1 knockout mice and cultured mouse astrocytes, reduced CNS apoE and altered secreted-particle lipidation. Canonical PubMed exposed only a footer and publisher full-text requests returned 403. This was abstract-level inspection via an institutional mirror; methods, figures, replicate units and raw measurements were not inspected.
- **Hirsch-Reinshagen et al. 2005** — [W2151049459](https://openalex.org/W2151049459), DOI `10.1074/jbc.M508781200`, PMID `16207707`. [PubMed citation and Abstract](https://pubmed.ncbi.nlm.nih.gov/16207707/) identify Tg-SwDI/B and APP/PS1 mouse models. The abstract reports reduced soluble brain apoE with ABCA1 deficiency; amyloid deposition was not reduced, with model-specific differences. It is distinct from the staged Hirsch-Reinshagen **2004** paper (PMID `15269218`); distinct citations do not establish independent models or experiments. PubMed lists Epub **2005-10-05**, whereas OpenAlex retains **2005-10-06**. Keep both source-specific dates. Full methods, figures and sample/replicate counts remain uninspected.

Three other results remain withheld: `W2568317134` is a review; `W3098053098` lacks DOI/PMID and needs original-publication identity resolution; and [W2762954339's publisher record](https://academic.oup.com/eurheartj/article/38/suppl_1/ehx504.P4494/4090538) identifies P4494 in *European Heart Journal* 38, supplement 1. Its short report must not become a full-paper experimental finding merely because OpenAlex labels it `article`. The publisher date is 2017-08-29, differing from OpenAlex's 2017-08-01.

These observations are source-screening notes, separate from the database annotations and graph evidence. Article-content reuse remains pending for both selected papers. Provider retraction flags are false, but independent notice searches remain `not_checked`; no methods-level or full-paper review, independence determination or scientific approval is claimed.

## Terms inspected

Official terms pages were readable during this check:

| Source | Terms and retained scope |
| --- | --- |
| [UniProt](https://rest.uniprot.org/help/license) | CC BY 4.0; retain UniProt Consortium attribution, license link, identity/audit facts only. |
| [Reactome](https://reactome.org/license) | Section 1(c): data/derived files CC0; retain database IDs/mappings, no artwork. |
| [Open Targets](https://platform-docs.opentargets.org/licence) | Platform data CC0; retain provider attribution, exact score definitions and its latest-publication citation guidance. |
| [OpenAlex](https://help.openalex.org/api/) | Metadata CC0; OurResearch attribution. Article content has separate terms. [Authentication](https://help.openalex.org/api/authentication/) was updated 2026-11-03 and still permits basic keyless first-page requests. No key was used. |

## Repeat the bounded intake

These commands re-fetch current data and print staging JSON. Save only successful output in an ignored staging directory; they do not reproduce immutable provider bytes or import graph claims.

```sh
npm run --silent curation:annotations -- --provider uniprot --symbol APOE --ensembl ENSG00000130203 --uniprot P02649
npm run --silent curation:annotations -- --provider reactome --symbol APOE --ensembl ENSG00000130203 --uniprot P02649
npm run --silent curation:annotations -- --provider opentargets --symbol APOE --ensembl ENSG00000130203 --uniprot P02649
npm run --silent curation:annotations -- --provider uniprot --symbol ABCA1 --ensembl ENSG00000165029 --uniprot O95477
npm run --silent curation:annotations -- --provider reactome --symbol ABCA1 --ensembl ENSG00000165029 --uniprot O95477
npm run --silent curation:annotations -- --provider opentargets --symbol ABCA1 --ensembl ENSG00000165029 --uniprot O95477
npm run --silent curation:intake -- --query 'Alzheimer AND (APOE OR ABCA1)' --limit 5
```

The captured database packets used the existing exported `fetchAnnotations` function with a bounded stream tap to archive the same consumed bytes; their raw hashes were independently compared with the manifest. The earlier OpenAlex packet came from the unmodified CLI. Replaying an archive through `--input` must keep `offline_input` and null retrieval time, even when a separate manifest records the original fetch. Further promotion requires a separate reviewed diff with resolved identities, states, original-study scope and actual inspection limits.
