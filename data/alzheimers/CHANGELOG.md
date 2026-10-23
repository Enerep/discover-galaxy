# Dataset changes

## alzheimers-source-checked-0.5.0 — 2026-10-23

**24 entities, 24 claims/evidence records, 25 sources and one draft study-context comparison.** Adds [Lessard et al. (2018)](https://link.springer.com/article/10.15252/emmm.201809027), DOI `10.15252/emmm.201809027`, PMID `30341064`, PMCID `PMC6220267`. Prior entity, claim, evidence and source records are unchanged.

The selected finding records the authors' report of no statistically significant wild-type/R47H difference for lipidated APOE3 binding affinity in biolayer interferometry (BLI). The publisher's Results adjacent to Figure 2C, Figure 2C caption, BioLayer interferometry methods and Discussion were readable. Human soluble TREM2–IgG4 Fc–V5 was presented on Protein A sensors; the authors fitted association/dissociation curves with a 1:1 model. The article's numerical figure images, appendices, raw curves and underlying data were not reviewed, and no numerical affinity estimate is imported.

The caption's five ligand concentrations remain a dilution-series count. Its statement that the complete experiment was repeated twice with new preparations is retained without assuming a total run count; `assay_replicates`, `experiments_reported` and `sample_size` stay null. A non-significant comparison does not establish equivalence or a universally absent R47H effect. No Aβ experiment, cellular signaling result, therapeutic claim or mouse-to-human inference is added.

`conflict-r47h-binding-context` is a source-checked draft comparison of the Atagi and Lessard findings, not an automatic contradiction classification. Lessard's Discussion explicitly addresses differences from earlier reports. The comparison retains the overlapping protein/variant question, different readouts, unresolved Atagi preparation and distinct constructs; these observations do not identify the cause of the difference. Both underlying findings support their own scoped claims, rather than acting as blanket refutations of one another.

Check date: **2026-10-23**. Metadata and authors were cross-checked on PubMed. The publisher's Rights and permissions section and [CC BY 4.0 terms](https://creativecommons.org/licenses/by/4.0/) were inspected; the new source records permission for the retained material with author, DOI and license attribution. Only metadata, links and project-authored paraphrases are retained; no article prose, images, tables or full-text payload are redistributed. Publication-status checking remains `not_checked`; a reachable page does not establish absence of a notice.

All 49 scientific records remain draft with no independent/human-review attestation. The context note is stored in the existing `conflicts` collection, and its citations cover every compared claim. The generated review packet now retains those comparisons and their actual review records. Six earlier publication candidates remain in staging; no metadata was automatically promoted and no research hypothesis was added.

## alzheimers-source-checked-0.4.0 — 2026-10-23

**23 entities, 23 claims, 23 evidence records, 24 sources.** Adds [Bailey et al. (2015)](https://pubmed.ncbi.nlm.nih.gov/26374897/), DOI `10.1074/jbc.M115.677286`, PMCID `PMC4646256`, as one paper projection and two scoped protein-binding findings. Existing human association findings and database annotations are unchanged. The two Atagi binding records gain structured condition, protein-form, ligand-preparation and immobilization fields from their previously inspected captions; unknown preparation in the Atagi Figure 5 assays remains null.

| Finding | Original locator and actual access | Retained context |
| --- | --- | --- |
| `claim-bailey-trem2-apoe-binding` | PubMed Figure 5D caption; search-indexed PMC Ig Fusion Constructs, ELISA, Results and Discussion | Wild-type human TREM2-Ig; plasma-derived APOE with unidentified isoform; plate ELISA; triplicate wells in a representative experiment |
| `claim-bailey-trem2-r47h-apoe-binding` | PubMed Figure 5C caption; the same indexed methods/results passages | R47H versus wild type; plasma APOE; triplicate wells in one of two reported experiments |

Source check date: **2026-10-23**. PubMed metadata and the original captions were readable as pages. The web search returned indexed PMC article passages, including construct/ELISA methods, the selected binding results, Discussion and Note Added in Proof. Direct PMC opens returned a browser challenge; publisher full-text links returned 403. Indexed passages may be stale. Raw figure images, supplements and underlying data were not reviewed. No complete full-paper or systematic literature review is claimed.

The [in-article Note Added in Proof](https://pmc.ncbi.nlm.nih.gov/articles/PMC4646256/) reports replacement of an incorrect Figure 1 control scatter plot from the Paper in Press. It does not identify the selected Figure 5 experiments as affected. The source records `publication_status: corrected`, check date and the article URL containing the notice; this is a targeted observation, not a completed comprehensive notice search or a retraction finding.

The assays retain protein endpoints and separate source identity, preparation, immobilization and replicate units. Plate-binding signals do not become binding-rate measurements, cellular signaling, clinical outcomes or evidence of independent replication. No macaque-fluid experiment, therapeutic claim, contradiction or hypothesis was added. The six staged candidates remain outside the graph.

NCBI policies and the PMC copyright notice were inspected on the source-check date. Only bibliographic facts, links and short project-authored paraphrases are retained; no article prose, captions, images or full-text payloads are redistributed. Publisher-specific reuse remains pending. All scientific records remain draft, with no human or independent-review attestation.

## alzheimers-source-checked-0.3.0 — 2026-10-23

**22 entities, 21 claims, 21 evidence records, 23 sources.** Adds one paper projection and two protein-level findings from [Atagi et al. (2015)](https://pubmed.ncbi.nlm.nih.gov/26374899/), DOI `10.1074/jbc.M115.679043`, PMCID `PMC4646257`. The 0.2.0 records are unchanged. All scientific records remain draft.

| Finding | Inspected original locator | Extracted context |
| --- | --- | --- |
| `claim-trem2-apoe-binding` | PubMed's Figure 1A–B caption; Figure 4A construct caption | Cell-free dot blots of APOE isoforms and a human TREM2-Fc construct; three independent dot blots, not three participants |
| `claim-trem2-r47h-apoe-binding` | PubMed's Figure 4A and Figure 5A–G captions | R47H versus wild-type fusion constructs; dot-blot and solid-phase readouts; n = 3 with replicate independence unresolved |

The original figure captions and bibliographic metadata were readable on PubMed. An initial PMC view exposed partial methods/introductory text; later PMC opens returned a browser challenge, and publisher full-text/PDF and Europe PMC links were unavailable. Raw figure images, complete methods, supplements and underlying data were not reviewed. Captions support these narrowly scoped statements, not estimates of binding kinetics, microglial signaling, clinical effects or an AD-specific causal mechanism. Both findings retain the same paper identity; they are not independent studies. Protein endpoints stay separate from the existing gene–disease associations.

The [NCBI policies](https://www.ncbi.nlm.nih.gov/home/about/policies/) and [PMC copyright notice](https://pmc.ncbi.nlm.nih.gov/about/copyright/) were inspected on 2026-10-23. Access is not a redistribution license. Only bibliographic facts, source links and short project-authored paraphrases are retained; publisher-specific reuse remains pending and no article prose, captions or figures are redistributed. Correction/retraction status remains `not_checked`; no absence-of-notice assertion was created.

Atagi 2015 was found while following the staged TREM2–APOE reading question. The six earlier publication candidates remain outside the graph: blocked access to the Yeh 2016 original methods did not become a claim. Their generated coverage packet now uses the 0.3.0 baseline and points to the two separately checked binding findings. Reactome release provenance remains unresolved.

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
