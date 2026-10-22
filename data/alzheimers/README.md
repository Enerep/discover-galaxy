# Alzheimer's source-checked snapshot

`dataset.json` is **alzheimers-source-checked-0.2.0**: 21 entities, 19 claims, 19 evidence records, and 22 sources. It contains one disease, seven human genes, seven distinct human proteins, two pathways, and four paper projections. Every claim/evidence record remains **draft**; the interface calls this **Source-checked draft**. Independent scientific review is deferred to a future milestone and does not block the development explorer.

The [change log](CHANGELOG.md) records all additions, source locations, observed entry versions, terms checks and access limits. New data are canonical gene/product mappings and attributed Reactome annotations, not new empirical AD-risk findings. The four original studies below retain their variant/population scopes. The separate scientific-release gate still rejects draft records.

## Original study lookups retained from 0.1.0

| Record | Original evidence and locator | Lookup limits |
| --- | --- | --- |
| `claim-apoe-e4-risk` | [Corder et al., 1993: PubMed abstract](https://pubmed.ncbi.nlm.nih.gov/8346443/), DOI `10.1126/science.8346443` | Abstract and bibliographic metadata only |
| `claim-apoe-e2-risk` | [Corder et al., 1994: publisher abstract](https://www.nature.com/articles/ng0694-180), DOI `10.1038/ng0694-180`; [PubMed metadata](https://pubmed.ncbi.nlm.nih.gov/7920638/) | Publisher abstract and author metadata; article body not inspected |
| `claim-abca1-n1800h-risk` | [Nordestgaard et al., 2015: publisher abstract, Methods and Results](https://alz-journals.onlinelibrary.wiley.com/doi/10.1016/j.jalz.2015.04.006); [PubMed metadata](https://pubmed.ncbi.nlm.nih.gov/26079414/) | Abstract and bibliographic metadata only |
| `claim-trem2-r47h-risk` | [Jonsson et al., 2013: PubMed abstract, Methods and Results](https://pubmed.ncbi.nlm.nih.gov/23150908/), DOI `10.1056/NEJMoa1211103` | Abstract and bibliographic metadata only |

Source lookup date: **2026-10-20**. Bibliographic metadata was cross-checked against the original publication pages or PubMed. The UI should retain this limited-review status rather than present these records as an approved consensus.

## Identity provenance

- [APOE — NCBI Gene 348](https://www.ncbi.nlm.nih.gov/gene/348)
- [ABCA1 — NCBI Gene 19](https://www.ncbi.nlm.nih.gov/gene/19)
- [TREM2 — NCBI Gene 54209](https://www.ncbi.nlm.nih.gov/gene/54209)
- [Alzheimer Disease — MeSH D000544](https://id.nlm.nih.gov/mesh/D000544.html)

Gene identity was checked against indexed NCBI Gene records. Some direct NCBI page opens returned browser challenges, so no complete database payload or database release was captured. Disease identity and aliases were checked against NLM MeSH. These records establish names and identity, not the scientific association claims.

The APOE claims retain distinct genotype contexts; a lower-risk ε2/ε3 finding and a higher-risk ε4 finding are not labeled as a contradiction. Variants remain claim context. The 0.2.0 additions use human gene/product identities and specific curated pathway records; they do not assume mouse-to-human equivalence or add therapeutic claims, confidence percentages, conflicts, or hypotheses.

## Retained material and reuse

The project's [MIT software license](../../LICENSE) does not grant new rights to third-party scientific material or complete the source reuse checks below. Dataset provenance, attribution, and each source's recorded reuse status remain applicable.

Retained material is limited to bibliographic facts, identifiers, links, and short project-authored paraphrases. No abstracts, article bodies, figures, tables, or downloaded publisher payloads are included.

The [NCBI policies](https://www.ncbi.nlm.nih.gov/home/about/policies/) and [Wiley terms](https://onlinelibrary.wiley.com/terms-and-conditions) were inspected on the lookup date. NCBI's access does not grant blanket rights to third-party article text. Publisher-specific permissions are **pending review**; an attempted Nature permissions-page lookup was unavailable. No permission grant or article-text redistribution license is asserted. Each source records the relevant terms URL and review state.

## Continue the source-checked explorer

The separate [candidate-source coverage packet](candidate-coverage.md), backed by [staging JSON](candidate-coverage.json), keeps six publications ready for the next AD source pass. The two earlier pathway candidates were added through the separately checked dataset diff in 0.2.0. The remaining papers need assay-level extraction; their metadata is not experimental graph evidence. Use `npm run curation:coverage:check` to verify the packet's references and generated output.

Use the [generated source-review packet](review-packet.md) for all 19 findings, their source-specific context and 22 sources. Run `npm run curation:check` to verify it is current. Source-check records belong in `dataset.json`; regenerate the packet after changes. Generation performs structural checks, not source inspection.

Further draft additions require actual source inspection, scoped context and limitations, identifiers, locators, and source reuse assessment. Keep unknowns explicit and record a new dataset version. Do not add automatic approval attestations or promote staged metadata into experimental evidence.

## Future scientific release

Independent scientific review is a future milestone. The existing release contract retains these additional requirements:

1. Record a named human scientific reviewer and review date for every claim and evidence record.
2. Review the full relevant methods and results, including study comparability and source limitations.
3. Check correction/retraction notices and record the check date. The current `not_checked` status must not be interpreted as absence of a notice.
4. Complete source reuse and attribution review for the material actually distributed.
5. Validate the contract and references, complete the remaining MVP capabilities, and publish a new immutable scientific dataset version; the development snapshot already meets the 20–50 entity size target.

The development graph supports source exploration now. Its size and source checks do not themselves complete the future scientific-release gate in [steps.md](../../steps.md) or the [evidence policy](../../docs/evidence-policy.md).
