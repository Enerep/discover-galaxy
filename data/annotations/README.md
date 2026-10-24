# Database annotation intake

The [seed plan](seed-plan.json) selects four genes missing from snapshot 0.6.0: **COL1A1, COL1A2, COL3A1 and SAA1**. They pass the documented public MAYO AD cutoffs and occur in its leading scavenger-receptor pathway. This selects a useful library expansion; it does not establish an AD mechanism. The public input and actual interpretation limits are in [experimental validation](../../docs/experimental-validation.md).

[coverage-seed.json](coverage-seed.json) is a reproducible extract of approved HGNC gene/product cross-references and exact gene-level Reactome memberships. The generator creates no claims, scientific approvals or graph changes. Source-checked facts can enter a separate versioned dataset diff after their identities, scope and reuse terms are inspected.

| Input | Provenance |
| --- | --- |
| HGNC | Same checksum-pinned gzip as the [identifier reference](../reference/hgnc-ensembl.json); includes approved symbols/names, HGNC, Ensembl, NCBI and UniProt cross-references. Raw SHA-256: `6bb2951c56204cd7b387c4e40b8d46107f6bdc422e77b8e4f2088a5d39e1be4b`. |
| Reactome | Existing [pinned human gene sets](../reference/README.md), normalized SHA-256 `f19f3f37b142e1f0d0a6ef84118f1ae586334b04545897627c6d9236c7a739c6`. Exact upstream release remains unknown. |
| Seed extract | SHA-256 `0f149175bb29242405c31276d65b90cc320751abe26529e6062c816d9dc50201`; explicit bounded plan and preparation date, no live retrieval timestamp. |

The extract retains official identity facts and project-authored locators, not function prose, sequences or publication content. HGNC's [data-use policy](https://www.genenames.org/about/) permits reuse and requests attribution to the HUGO Gene Nomenclature Committee at the University of Cambridge, RRID:SCR_002827. Reactome data/derived files use [CC0](https://reactome.org/license), section 1(c); no artwork is included. Source terms were inspected on 2026-10-24. These inputs are mirrors, not verified current official release archives.

```sh
# Offline check; does not download or change the enrichment references.
npm run curation:seed:check

# Reproduce from the explicitly downloaded pinned gzip.
python3 tools/curation/prepare-annotation-seed.py --hgnc /path/to/hgnc_complete_set.tsv.gz --check
```

The separate [API intake commands](../../tools/curation/README.md#gene-and-protein-api-intake) support UniProt identity metadata, Reactome UniProt-to-pathway mappings and Open Targets direct disease-association summaries. On 2026-10-24 all three direct CLI probes failed at the configured network proxy before returning API data. Offline normalization and simulated requests are tested; a successful live fetch is still unverified. This seed is labeled **pinned_reference_extract**, never a live API result. Provider API packets and raw downloads belong in ignored `data/staging/` / `data/raw/`, outside frontend imports.
