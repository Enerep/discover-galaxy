# Design guide

This is the standing design standard for Discovery Galaxy. Apply it to every interface and copy change. The goal is a simple research tool that feels clear and responsive, with smooth animation that helps people understand what changed.

Follow the [canonical design and decision rules](../AGENTS.md#design-standard): cut taglines, helper text and secondary labels, and choose changes that improve UX, DX and AX together. Solve unclear screens through layout, grouping and direct controls. Keep scientific data, accessible names, form labels and actionable error states; move detailed metadata into the relevant disclosure.

## Start with the task

The primary research task is now **upload processed results → inspect pathway statistics and gene measurements → follow evidence → consider an experiment**. Keep **Explore** and **Analyze results** as explicit workspaces, preserving state between them. Provide a small `?` beside each workspace for on-demand purpose, concrete examples and key terms. Opening help must preserve the active workspace and pending/applied work, support native dialog focus/Escape/return behavior and avoid loading the analysis reference. Keep these explanations out of the permanent workspace layout. Group the file, named contrast, gene cutoffs, full-tested-table declaration and Analyze action in one form. Keep input-format, privacy and method details in disclosures. Show applied-result provenance separately from pending replacement files; failed reads or reference loads must preserve previous results.

The evidence-reading flow remains **search → select an entity → read a finding → open the original study**. Preserve that route when connecting experimental results to the explorer.

Offer **Try example** beside the CSV template on an empty analysis workspace. Open useful results directly with synthetic data; keep that provenance visible after changing cutoffs, editing the comparison or following a gene into Explore. Do not replace a pending upload or applied analysis with the example. **Remove results** restores the entry point. Example measurements and questions never become curated findings.

Group optional tissue/cell model, treatment/condition and explicit study design under **Experiment context (optional)**. Keep these fields out of the primary upload/cutoff row, use native labeled controls and wrap long context in questions. Apply edits with the same form action; pending text must not change questions or explorer observations until a successful apply. Expose the applied values under Methods and in the gene's RNA observation, including explicit unknowns. A new file or removal clears input context. Do not infer a model, classify a design from text, change reference membership or turn a user label into a source assertion.

When a file has multiple candidate identifier columns, show one native selector beside the file. For Ensembl inputs, retain original IDs and show mapping issues before results. Focus the committed review only while its workspace is active. Keep unresolved IDs in the eligible universe after explicit acknowledgement; duplicate mappings need a corrected file. Search/paginate the mapping report and move its audit into Methods after applying results, avoiding repeated reports in the primary view. A gene's Inspector observation retains the original input ID.

Keep **Threshold sensitivity** in a pathway disclosure, with actual cutoff axes, pathway FDR values and a visible applied cell. Counts/method details explain the shared background and separate BH families; avoid a confidence or stability badge. Put **Group overlaps** beside the pathway-FDR filter. Expanded groups retain member names, original FDR, shared counts and Jaccard values; search reveals matching members without hiding access to source records. Grouping and cutoff checks must preserve the applied analysis, run in local workers, recover explicitly from worker failure and discard stale results after replacement/removal. Completion and ordinary disclosure actions do not move focus or scroll the page; retry returns focus to the initiating control.

- Group one search field, one entity-type filter, and one graph/list switch in the same toolbar. On narrow screens, use a full-width search followed by the filter and switch.
- Use a single main workspace and a readable evidence panel. A single collection does not need a permanent navigation sidebar.
- Make node selection obvious. Search results, graph selection, list selection, and the evidence panel must agree.
- Put the finding and original paper link before advanced identifiers and detailed study metadata.
- Use the entity icon and title as one heading. Put full entity names and identifiers in **Entity details**, and keep the finding summary with **Study details and limitations**. Omit repeated Findings/Finding headings and decorative counts.
- Reveal study context and limitations on request, preserving their source-specific meaning. Simplifying the interface must not remove scientific context.
- Keep the graph usable with touch, visible zoom/reset controls, and an equivalent keyboard-operable list.
- Keep the user in control of focus and scrolling. Do not move the viewport while they type or filter. Prefer explicit mobile details and return-to-graph actions over surprise scrolling.
- Keep sharing in one action area. Exported images must retain the finding's meaning, original source reference, dataset version, and draft status. Provide an evidence-card fallback when the graph cannot be captured.
- Open comparison from a finding. Keep two original statements and citations visible, align study-context fields, and reveal detailed provenance and reading prompts on request. Preserve the underlying selection, filters, and view.
- Prefer an explicit curated pair as the initial comparison choice, then the same recorded binding condition in another publication on the same relationship, falling back to the existing relationship/subject order. This is a navigation shortcut, not a judgment of comparability or independent replication. Name the study and condition in binding finding controls and comparison cards. Put recorded assay details first when both columns have explicit experimental-system context; preserve all unknowns and replicate units. Keep original correction/retraction links and dates in source disclosures and exported briefs.
- Show a source-checked study-context note after the original citation, beside the exact finding it addresses. Use a neutral heading, links to both studies, and **What differs** for methodological detail and actual source-check metadata. In comparison, include a note only when both selected findings and their cited evidence belong to it; preserve the complete note in the downloaded brief. Do not generate a disagreement from field labels or style it as an automated alert.
- Let readers follow a finding to its other entity with **View …**, preserving the chosen finding and graph/list mode. Clear filters that would hide that destination, move keyboard focus to its heading without scrolling the page, and keep the original source link before this navigation.
- Treat eligible background, selected genes, annotation coverage and tested family size as scientific denominators. Distinguish **Gene FDR** from **Pathway FDR**; show signed measurements without using enrichment as an activity score. Paginate pathway/member tables and allow keyboard scrolling at narrow widths. An explicit pathway selection may move to its details on mobile; typing or filtering must not move the viewport. Focus completed results after React commits them, and never steal focus if analysis finishes while another workspace is active. Put the user's RNA result in a separate inspector section for a matched gene, never its protein node. Proposed questions retain assumptions and source links without AI branding or discovery claims.
- Put covered genes' evidence actions directly in the member table, with a named keyboard/touch action; avoid a repeated list of gene links below it. Below the measurements, show selected-gene library coverage and group original findings by paper in native disclosures. Keep the source-specific statement and **View finding** action together. Coverage is selective and gene/protein literature does not validate the user's pathway result; keep that scope explicit, with full matching limits in the coverage disclosure.
- Use **Pin finding** beside the selected evidence and **Add to research brief** in comparison. Keep **Research brief** beside Share. In the brief, put the question first, then the user's explanation, assumptions and proposed experiment; keep pinned source statements in a separate column, stacked after the writing fields on mobile. Use **Context and limitations** for detail and keep download/save feedback visible while scrolling. Do not prefill scientific conclusions or imply that the notes have been verified. **View finding** is an explicit return to the inspector, including scrolling it into view on mobile; closing the workspace returns focus to its trigger.

## Visual language

Offer Light, Dark, and System in one appearance control. Light uses neutral surfaces; Dark uses **`#1F1F24`** as the page background with slightly lighter surfaces. System is the default and follows the operating-system preference; remember an explicit choice locally. Mint is an interaction accent, not a coating for every surface. Let spacing, typography, and alignment establish hierarchy.

- Use familiar system typography. Body text should generally be 14–16 px; supporting metadata should remain at least 11–12 px.
- Give primary controls and touch targets approximately 40–44 px of usable height. Small icons still need accessible names and adequate hit areas.
- Keep lines, borders, shadows, badges, and cards restrained. Group information with spacing before adding another container.
- Use color with text or shape. Maintain visible focus and sufficient contrast in both themes and on the graph.
- Define interface colors through semantic tokens. Check text, controls, hover/selection states, dialogs, and unavailable-data states in both themes; a dark background alone is not a complete dark mode.
- Keep the graph dark and preserve the meaning of node and edge colors across themes. Exported evidence images retain a light citation card for readable sharing, independent of the interface theme.
- Keep the active filter, selection, empty state, and data-review status easy to find.
- Start the graph with the selected entity and its direct connections. Selection centers a readable neighbourhood; **Expand connections** adds only the next level, **Collapse** restores the first, and **Back** restores the preceding selection/search/scope. **Overview** exposes every entity with only the selection’s relationship lines. Keep the complete searchable List available.
- Keep original papers in the evidence panel rather than adding every citation to biological neighbourhoods. Paper search/filter/List selection still opens paper nodes and their citations. Multiple findings for the same pair share a visual line; the selected finding controls its action and all original records remain separate in the inspector.
- Distinguish genes, proteins and pathways in filters, labels, icons and the legend. Focus rings indicate navigation depth only. Overview/search use stable type rings and outer paper arcs; narrow graphs emphasize the current selection. Never crop a selected label at the canvas edge.
- When more than 32 entities are visible, keep unselected protein labels quiet to avoid duplicated gene/product names crowding the overview. Protein nodes remain selectable; hover/selection reveals their labels, while smaller searched/filtered views restore ordinary labels. This is a display-density rule, not an evidence-strength signal.
- Remove decoration that competes with reading: artificial collection numbers, repeated headings, marketing cards, and unrelated navigation.
- Keep decorative stars quiet and noninteractive. Spatial distance, size, brightness, and animation never imply evidence strength.

## Copy

Name the action or information directly. Use short labels and concrete nouns; explain only what helps someone make the next choice.

Use **Source-checked draft** as the dataset status (short **Draft** on narrow headers). It describes the actual limited source checks, not independent scientific approval. Independent review is a future milestone, not a repeated interface warning or a blocker for development work. Keep exact inspection limits, reuse/publication status, and review provenance available in the data dialog and source disclosures. Distinguish **Database annotation** from **Original paper** beside the source citation. The linked title and external-link icon provide the action without a repeated Open paper/Open record caption.

| Avoid | Prefer |
| --- | --- |
| “Your observatory” above navigation | A visible search field and entity-type filter |
| “A starting point for discovery” | Omit the promotional card |
| “Every visible node leads to a source” | Omit the instruction; make selection and the source panel obvious |
| “The knowledge atlas / 001” | “Alzheimer’s disease” |
| Repeated draft warnings in every section | One clear preview notice, with record status where relevant |

Do not add a chat interface, generated explanation, confidence score, progress number, or capability label unless it corresponds to a working, useful feature. Keep scientific wording accurate and traceable; the [evidence policy](evidence-policy.md) governs claims and uncertainty.

Use neutral comparison labels such as “Different” and “Missing context.” Exact text matches do not prove comparable studies; a difference does not prove contradiction. Show unknowns plainly and keep participant subsets attached to their source. Source-reading prompts are checks to perform, not claims of novel research opportunities.

Show comparison values directly beneath their column headings. Repeat study attribution in a cell only when multiple evidence records or a separate claim-scope value make it necessary. Keep matching-value status available to screen readers without a badge on every row. Put interpretation limits and source-identity checks in **Interpretation and source checks**; retain their complete meaning in exported briefs. Sharing should show the actual preview and actions, with text only for loading, errors or recovery.

## Motion

Motion explains selection, navigation, opening details, and feedback. It must not delay the next action.

| Interaction | Starting range |
| --- | --- |
| Hover, press, focus, selection feedback | 120–180 ms |
| Evidence-panel and disclosure transitions | 180–260 ms |
| Camera focus, zoom, or reset | Approximately 350–550 ms of damped movement |

These are starting ranges, not artificial delays or performance claims. Tune against the actual interaction and test it in the browser.

- Favor opacity, small transforms, and damped camera motion. Avoid broad `transition: all`, large page sweeps, exaggerated bounce, and animated blur.
- Preserve scene orientation when sensible. A drag or touch gesture must interrupt automatic camera movement immediately.
- Do not spin the galaxy, pulse labels, or animate particles perpetually. Demand rendering must settle when interaction and transitions finish.
- Reuse scene materials and geometry during visual feedback instead of rebuilding them on each hover or selection.
- With `prefers-reduced-motion: reduce`, apply state changes immediately and disable nonessential animation and smooth scrolling. Keep selection equally clear.
- Keep controls usable throughout an animation. Do not queue repeated transitions behind rapid inputs.

## Review every change

Before calling an interface refinement complete:

1. Search for Alzheimer's, select APOE, inspect a finding, and open its original paper through both graph and list.
2. Check keyboard focus, search-result navigation, touch targets, no-result recovery, mobile layout, and unavailable WebGL.
3. Confirm labels and findings are readable without zooming the page. Remove duplicate controls and generic copy.
4. Check hover, selection, zoom, reset, and disclosure transitions; verify reduced-motion behavior and that the scene becomes idle.
5. Confirm development data remains clearly labeled and source-specific context remains available.
6. Record observed results separately from intended design. A typecheck does not establish good interaction or animation performance.
7. Check Light, Dark, and System, including saved preference, operating-system changes, narrow screens, and readable evidence/sharing dialogs. Switching appearance must not reset the current research view.
8. Compare two findings, open their original sources, inspect known and missing context, and download the complete cited brief. Check narrow-table scrolling, keyboard focus, and return to the unchanged research view.
9. Pin findings, include a comparison, write and reload a brief, then download the actual Markdown. Check user-note/evidence separation, keyboard and mobile access, both themes, storage failure/conflict recovery, and explicit dataset refresh without losing notes.

The current scientific dataset remains a development starter. A cleaner presentation does not make its records scientifically approved or complete the MVP release gates.
