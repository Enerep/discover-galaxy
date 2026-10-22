# Dataset changes

## alzheimers-source-checked-0.2.0 — 2026-10-22

**21 entities, 19 claims, 19 evidence records, 22 sources.** Development snapshot; all claims/evidence remain draft. The original four variant-scoped human association findings and four paper projections are unchanged.

Added four human genes (TYROBP, NR1H2, NR1H3, RXRA), seven separately identified human proteins, and two human Reactome pathways. The 15 new assertions comprise seven canonical gene–protein mappings, seven curated pathway-participation records, and one curated TREM2–DAP12 binding record. No new empirical AD-risk or therapeutic claim is inferred from these annotations.

### Source checks

Source lookup date: **2026-10-22**. These were targeted web-tool inspections, not a live importer run, full-paper review, or independent scientific approval.

| Source | Inspected fields / location | Retained scope |
| --- | --- | --- |
| [UniProt P02649](https://rest.uniprot.org/uniprotkb/P02649.txt), [Q9NZC2](https://rest.uniprot.org/uniprotkb/Q9NZC2.txt), [O43914](https://rest.uniprot.org/uniprotkb/O43914.txt), [P19793](https://rest.uniprot.org/uniprotkb/P19793.txt) | ID/AC, GN, OS, DR GeneID and DT fields | Canonical protein identity, human gene mapping and observed entry versions: 280, 187, 196, 263 respectively; entries dated 2026-09-02 |
| [ABCA1 protein](https://reactome.org/content/detail/R-HSA-194209), [NR1H2 protein](https://reactome.org/content/detail/R-HSA-375500), [NR1H3 protein](https://reactome.org/content/detail/R-HSA-8854957) | Species, UniProt accession, Gene Names, Reference Genes, relevant PathwayBrowser locations | Human gene/product identity and participation in the named cholesterol-regulation branch |
| [RXRA protein](https://reactome.org/content/detail/R-HSA-381319) | Cholesterol transport/efflux PathwayBrowser branch; NR1H2:RXRA and NR1H3:RXRA complexes | Specific complex context for pathway participation |
| [APOE expression event](https://reactome.org/content/detail/R-HSA-9031512) | APOE protein output and parent-pathway membership | Curated participation in gene-regulation events, not a claim about AD outcomes |
| [TREM2 protein](https://reactome.org/content/detail/R-HSA-197664), [phosphorylated TYROBP](https://reactome.org/content/detail/R-HSA-210010) | DAP12 signaling branch and molecular-state label | Participation retains complex/state context, including TYROBP Y91/Y102 phosphorylation |
| [TREM2–DAP12 binding](https://reactome.org/content/detail/R-HSA-210300) | Human species; input/output participants | Curated binding to a DAP12 dimer; no re-extraction of the primary experiment |
| [Cholesterol transport/efflux](https://reactome.org/content/detail/R-HSA-9029569), [DAP12 signaling](https://reactome.org/content/detail/R-HSA-2424491) | Pathway names, stable identifiers, human species and event hierarchy | Pathway identity and navigation context |

The exact Reactome database release and record revisions were not captured. Source records explicitly use access-date context and retain this limit; an access date is not an immutable upstream release. UniProt's observed entry versions are recorded individually. Species and state-specific Reactome entities are presented as canonical protein nodes only with that scope preserved in evidence context.

The [Reactome license](https://reactome.org/license) was inspected for the retained database metadata (CC0; artwork has separate terms), and the [UniProt license](https://rest.uniprot.org/help/license) for CC BY 4.0 database material. Source records include attribution and the material retained. No source prose, sequences, figures, artwork, or full texts are redistributed. Original publication/source checks from 0.1.0 retain their pending fields; no absence-of-retraction claim was added.

The two earlier pathway candidates were added through this separate source-checked dataset diff. The six publication candidates remain in [coverage staging](candidate-coverage.md), with unknown assay-level context and original-source checks preserved. Their presence in that reading list does not create experimental graph evidence.

The owner deferred independent scientific review to a future milestone. This version records the limited source check, keeps `release_status: development`, and creates no human-review attestation. It meets the entity-count target; disagreement/hypothesis capabilities and the future scientific-release requirements remain separate.

## alzheimers-starter-0.1.0 — 2026-10-20

Eight entities, four draft genetic-association claims, four evidence records and eight sources. AI-assisted abstract/metadata inspection of Corder 1993/1994, Nordestgaard 2015 and Jonsson 2013, plus identity lookups. The original snapshot is preserved in Git history; no independent scientific approval was recorded.
