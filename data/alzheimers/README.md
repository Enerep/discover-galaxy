# Alzheimer's source-checked snapshot

`dataset.json` is **alzheimers-source-checked-0.7.0**: 40 entities, 41 claims, 41 evidence records, 34 sources, and one draft study-context comparison. It contains one disease, fourteen human genes, fourteen distinct human proteins, three pathways, and eight paper projections. Every claim/evidence record remains **draft**; the interface calls this **Source-checked draft**. Independent scientific review is deferred to a future milestone and does not block the development explorer.

The [change log](CHANGELOG.md) records all additions, source locations, observed entry versions, terms checks and access limits. The snapshot combines canonical gene/product mappings, attributed Reactome annotations and five assay-scoped APOE–TREM2 binding findings. The four original association studies below retain their variant/population scopes. The separate scientific-release gate still rejects draft records.

## Reference-derived coverage in 0.7.0

COL1A1, COL1A2, COL3A1 and SAA1 add eight gene/protein nodes and eight draft database assertions. Their approved HGNC identities and UniProt product cross-references come from the same verified archive used for identifier mapping. Gene → pathway annotations retain literal membership in the pinned Reactome GMT, without assuming a molecular state or moving that annotation to a protein. **Annotated to / Annotated gene** names the distinction in the inspector. These records now appear in 3D, List, search and the analysis coverage audit; none adds original-paper coverage or an AD-risk claim. [The reproducible seed](../annotations/README.md) and [change record](CHANGELOG.md#alzheimers-source-checked-070--2026-10-24) preserve source hashes, unknown upstream releases and actual inspection limits. Live API requests remain blocked; this batch is not presented as an API retrieval.

## Scavenger-receptor evidence in 0.6.0

The public AD analysis's leading pathway exposed missing MARCO and SCARA5 coverage. Both now connect through separate proteins to scavenger-receptor binding/uptake; APOB supplies the ligand identity for two [Cheng 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC8353498/) modified-protein ELISA findings. An attributed APOE participation record joins this branch to the existing network. Gene/product identities come from the checked pinned HGNC rows, not inferred RNA/protein effects.

New records appear in 3D, List, search, comparison/brief citations and **View … evidence** from analysis. The numerical pathway reference and enrichment remain unchanged. The [0.6.0 change record](CHANGELOG.md#alzheimers-source-checked-060--2026-10-24) preserves mouse-inferred database scope, recombinant/modified protein forms, repeat units, access limits and source terms. These protein assays do not establish an AD mechanism or turn the public table's expression values into graph claims.

## Different assay reports in 0.5.0

[Lessard et al. (2018)](https://link.springer.com/article/10.15252/emmm.201809027) adds a scoped lipidated-APOE3 BLI finding. One draft context note pairs it with Atagi's R47H finding, with citations and differences in preparation, construct and readout retained. This is a contextual comparison, not a resolved contradiction or evidence that either result applies universally.

Publisher methods/results and the Figure 2C caption were readable; raw numerical figure images, appendices and underlying data were not reviewed. Five ligand concentrations are not five independent experiments, and the total run count remains unresolved. The new source's CC BY 4.0 terms/attribution were checked; publication-status checking remains incomplete. See the [0.5.0 change record](CHANGELOG.md#alzheimers-source-checked-050--2026-10-23).

## Two binding studies in 0.4.0

[Bailey et al. (2015)](https://pubmed.ncbi.nlm.nih.gov/26374897/) adds baseline and R47H ELISA findings using plasma-derived APOE. Original figure captions and selected indexed methods/results preserve the unknown APOE isoform, plate presentation and technical-well units. Two reported experiments do not turn triplicate wells into six independent studies. The source retains its in-article Figure 1 correction and original notice link; broader notice checking remains incomplete.

The Atagi records now include structured condition, protein form and immobilization context from the same original captions. A null ligand preparation for the Atagi variant assays remains unknown. See the [0.4.0 change record](CHANGELOG.md#alzheimers-source-checked-040--2026-10-23) for the exact extract, access and reuse limits. Different citations do not establish independent replication or scientific agreement.

## Binding experiments added in 0.3.0

[Atagi et al. (2015)](https://pubmed.ncbi.nlm.nih.gov/26374899/) connects the existing APOE and TREM2 **protein** nodes. Two findings preserve baseline binding and the R47H comparison separately, with original figure-caption locators, cell-free fusion-protein context, controls and assay replicate units. Three replicates are not three human participants. Both findings share one original publication; the comparison must expose that shared identity.

Only the original captions, metadata and partial introductory/methods text were inspected. Raw figure images, complete methods and supplements were unavailable or not reviewed. See the [0.3.0 change record](CHANGELOG.md#alzheimers-source-checked-030--2026-10-23) for actual access and reuse checks. These assays do not establish signaling, treatment benefit or independent replication.

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

Use the [generated source-review packet](review-packet.md) for all 41 findings, their source-specific context and 34 sources. Run `npm run curation:check` to verify it is current. Source-check records belong in `dataset.json`; regenerate the packet after changes. Generation performs structural checks, not source inspection.

Further draft additions require actual source inspection, scoped context and limitations, identifiers, locators, and source reuse assessment. Keep unknowns explicit and record a new dataset version. Do not add automatic approval attestations or promote staged metadata into experimental evidence.

## Future scientific release

Independent scientific review is a future milestone. The existing release contract retains these additional requirements:

1. Record a named human scientific reviewer and review date for every claim and evidence record.
2. Review the full relevant methods and results, including study comparability and source limitations.
3. Check correction/retraction notices and record the check date. The current `not_checked` status must not be interpreted as absence of a notice.
4. Complete source reuse and attribution review for the material actually distributed.
5. Validate the contract and references, complete the remaining MVP capabilities, and publish a new immutable scientific dataset version; the development snapshot already meets the 20–50 entity size target.

The development graph supports source exploration now. Its size and source checks do not themselves complete the future scientific-release gate in [steps.md](../../steps.md) or the [evidence policy](../../docs/evidence-policy.md).
