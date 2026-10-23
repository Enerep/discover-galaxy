# Design guide

This is the standing design standard for Discovery Galaxy. Apply it to every interface and copy change. The goal is a simple research tool that feels clear and responsive, with smooth animation that helps people understand what changed.

## Start with the task

The primary flow is **search → select an entity → read a finding → open the original study**. Make that flow clear before adding another feature or visual treatment.

- Keep one search field, one entity-type filter, and one graph/list switch in a consistent location.
- Use a single main workspace and a readable evidence panel. A single collection does not need a permanent navigation sidebar.
- Make node selection obvious. Search results, graph selection, list selection, and the evidence panel must agree.
- Put the finding and original paper link before advanced identifiers and detailed study metadata.
- Reveal study context and limitations on request, preserving their source-specific meaning. Simplifying the interface must not remove scientific context.
- Keep the graph usable with touch, visible zoom/reset controls, and an equivalent keyboard-operable list.
- Keep the user in control of focus and scrolling. Do not move the viewport while they type or filter. Prefer explicit mobile details and return-to-graph actions over surprise scrolling.
- Keep sharing in one action area. Exported images must retain the finding's meaning, original source reference, dataset version, and draft status. Provide an evidence-card fallback when the graph cannot be captured.
- Open comparison from a finding. Keep two original statements and citations visible, align study-context fields, and reveal detailed provenance and reading prompts on request. Preserve the underlying selection, filters, and view.
- Prefer an explicit curated pair as the initial comparison choice, then the same recorded binding condition in another publication on the same relationship, falling back to the existing relationship/subject order. This is a navigation shortcut, not a judgment of comparability or independent replication. Name the study and condition in binding finding controls and comparison cards. Put recorded assay details first when both columns have explicit experimental-system context; preserve all unknowns and replicate units. Keep original correction/retraction links and dates in source disclosures and exported briefs.
- Show a source-checked study-context note after the original citation, beside the exact finding it addresses. Use a neutral heading, links to both studies, and **What differs** for methodological detail and actual source-check metadata. In comparison, include a note only when both selected findings and their cited evidence belong to it; preserve the complete note in the downloaded brief. Do not generate a disagreement from field labels or style it as an automated alert.
- Let readers follow a finding to its other entity with **View …**, preserving the chosen finding and graph/list mode. Clear filters that would hide that destination, move keyboard focus to its heading without scrolling the page, and keep the original source link before this navigation.

## Visual language

Offer Light, Dark, and System in one appearance control. Light uses neutral surfaces; Dark uses **`#1F1F24`** as the page background with slightly lighter surfaces. System is the default and follows the operating-system preference; remember an explicit choice locally. Mint is an interaction accent, not a coating for every surface. Let spacing, typography, and alignment establish hierarchy.

- Use familiar system typography. Body text should generally be 14–16 px; supporting metadata should remain at least 11–12 px.
- Give primary controls and touch targets approximately 40–44 px of usable height. Small icons still need accessible names and adequate hit areas.
- Keep lines, borders, shadows, badges, and cards restrained. Group information with spacing before adding another container.
- Use color with text or shape. Maintain visible focus and sufficient contrast in both themes and on the graph.
- Define interface colors through semantic tokens. Check text, controls, hover/selection states, dialogs, and unavailable-data states in both themes; a dark background alone is not a complete dark mode.
- Keep the graph dark and preserve the meaning of node and edge colors across themes. Exported evidence images retain a light citation card for readable sharing, independent of the interface theme.
- Keep the active filter, selection, empty state, and data-review status easy to find.
- Distinguish genes, proteins and pathways in filters, labels, icons and the legend. Use separate stable layout rings, outer paper arcs and compact labels; narrow graphs emphasize the main gene anchors and the selected/hovered entity. Never crop a selected label at the canvas edge.
- Remove decoration that competes with reading: artificial collection numbers, repeated headings, marketing cards, and unrelated navigation.
- Keep decorative stars quiet and noninteractive. Spatial distance, size, brightness, and animation never imply evidence strength.

## Copy

Name the action or information directly. Use short labels and concrete nouns; explain only what helps someone make the next choice.

Use **Source-checked draft** as the dataset status (short **Draft** on narrow headers). It describes the actual limited source checks, not independent scientific approval. Independent review is a future milestone, not a repeated interface warning or a blocker for development work. Keep exact inspection limits, reuse/publication status, and review provenance available in the data dialog and source disclosures. Label **Database annotation / Open record** separately from **Original paper / Open paper**.

| Avoid | Prefer |
| --- | --- |
| “Your observatory” above navigation | A visible search field and entity-type filter |
| “A starting point for discovery” | Omit the promotional card |
| “Every visible node leads to a source” | “Select an entity to view its studies” when guidance is needed |
| “The knowledge atlas / 001” | “Alzheimer’s disease” |
| Repeated draft warnings in every section | One clear preview notice, with record status where relevant |

Do not add a chat interface, generated explanation, confidence score, progress number, or capability label unless it corresponds to a working, useful feature. Keep scientific wording accurate and traceable; the [evidence policy](evidence-policy.md) governs claims and uncertainty.

Use neutral comparison labels such as “Different” and “Missing context.” Exact text matches do not prove comparable studies; a difference does not prove contradiction. Show unknowns plainly and keep participant subsets attached to their source. Source-reading prompts are checks to perform, not claims of novel research opportunities.

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

The current scientific dataset remains a development starter. A cleaner presentation does not make its records scientifically approved or complete the MVP release gates.
