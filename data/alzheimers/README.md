# Alzheimer's development snapshot

`dataset.json` is an **eight-entity development starter**, not a released scientific dataset. It contains one disease, three human genes, four paper projections, and four source-scoped association claims. Every claim and evidence record remains **draft**. An AI-assisted source lookup is not an independent human scientific review.

## What was inspected

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

The APOE claims retain distinct genotype contexts; a lower-risk ε2/ε3 finding and a higher-risk ε4 finding are not labeled as a contradiction. Variants are claim context, not separate gene or protein nodes. No mouse-to-human orthology assumption, pathway claim, therapeutic claim, confidence percentage, conflict comparison, or research hypothesis was added.

## Retained material and reuse

The project's [MIT software license](../../LICENSE) does not grant new rights to third-party scientific material or complete the source reuse checks below. Dataset provenance, attribution, and each source's recorded reuse status remain applicable.

Retained material is limited to bibliographic facts, identifiers, links, and short project-authored paraphrases. No abstracts, article bodies, figures, tables, or downloaded publisher payloads are included.

The [NCBI policies](https://www.ncbi.nlm.nih.gov/home/about/policies/) and [Wiley terms](https://onlinelibrary.wiley.com/terms-and-conditions) were inspected on the lookup date. NCBI's access does not grant blanket rights to third-party article text. Publisher-specific permissions are **pending review**; an attempted Nature permissions-page lookup was unavailable. No permission grant or article-text redistribution license is asserted. Each source records the relevant terms URL and review state.

## Before scientific release

The separate [candidate-source coverage packet](candidate-coverage.md), backed by [staging JSON](candidate-coverage.json), prepares the next AD reading pass: six publications and two pathway records around the existing gene anchors. It preserves source access limits and unresolved context. It is not imported by the client and does not establish support for the existing claims. Use `npm run curation:coverage:check` to verify its references and generated output.

Use the [generated review packet](review-packet.md) to inspect all four current findings, their source-specific context, and the eight source records in one place. Run `npm run curation:check` from the repository root to verify the extract is current. Actual review attestations belong in `dataset.json`; regenerate the packet after source-record changes. Generation performs structural checks only and does not complete any item below.

1. Record a named human scientific reviewer and review date for every claim and evidence record.
2. Review the full relevant methods and results, including study comparability and source limitations.
3. Check correction/retraction notices and record the check date. The current `not_checked` status must not be interpreted as absence of a notice.
4. Complete source reuse and attribution review for the material actually distributed.
5. Validate the contract and references, expand to the 20–50 entity MVP target, and publish a new immutable dataset version.

The development graph is suitable for implementing the search-to-evidence interaction. Its existence does not complete the scientific approval gate in [steps.md](../../steps.md) or the [evidence policy](../../docs/evidence-policy.md).
