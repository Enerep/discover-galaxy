# Checkpoints

## Current checkpoint: share the development explorer

The app still covers **Alzheimer's disease only**: one disease, three genes, four papers, and four draft claims. Multiple sources deepen a disease's coverage; adding another disease is a separate step. No upstream scientific API or automatic import pipeline is connected.

The owner reports a working Vercel deployment. Its URL and deployment logs have not been independently checked for this checkpoint. Hosting the development preview does not change the dataset's review status.

This checkpoint adds image export and reproducible links without expanding the scientific dataset. Its acceptance criteria are:

- Export the current graph and selected finding to a PNG with the original source reference, dataset version, and visible draft status; retain the full finding rather than shortening its scientific meaning.
- Export a useful evidence card from the list or when WebGL is unavailable. Do not substitute a decorative graph for an unavailable capture.
- Offer native image sharing where supported and a PNG download elsewhere. Creating an image does not upload it or send it to anyone.
- Copy a link that restores the selected entity and finding, search, type filter, and Graph/List view. Camera orbit and zoom are not stored.
- Keep search text in the URL fragment and strip unrelated URL parameters from copied links. Handle unknown or obsolete record IDs safely.
- Check desktop and mobile flows, keyboard operation, reduced motion, export failure, and unavailable WebGL. Record observed results in [verification](verification.md); a build alone does not complete these checks.

## Next checkpoint: deepen the Alzheimer's evidence

Keep the next content pass focused on AD. First review the existing APOE, ABCA1, and TREM2 records, then build toward the **20–50 entity** release target, including displayed paper nodes. Add genes and pathways when they create a useful, supported route from an entity to its original evidence.

| Work | Concrete result | Acceptance boundary |
| --- | --- | --- |
| Review the starter | A claim-by-claim review packet for the four current findings | Actual named human review, inspected source locations, reuse assessment, and correction/retraction checks; pending items stay pending |
| Find candidate sources | A bounded list of original studies and authoritative pathway records for AD | Candidates remain separate from approved graph records; preserve database versions, identifiers, and retrieval dates |
| Assess source coverage | A table connecting each proposed claim to its studies and study contexts | Distinguish independent studies from repeated metadata, follow-ups, reviews, and reused cohorts; publication count is not evidence strength |
| Add reviewed content | Versioned additions toward 20–50 entities and at least one useful pathway journey | Every relationship has a scoped claim, source-specific evidence, limitations, and eligible review status |
| Verify the expanded snapshot | Data validation, citation inspection, browser checks, and a recorded coverage statement | Never mark scientific release complete using structural checks alone |

Candidate discovery should begin with the existing genes and the pathway questions their reviewed sources actually support. A candidate's name, a database hit, or a generated summary does not establish a relationship. Keep genes, proteins, and variant contexts distinct. Curate disagreements only when study contexts support a meaningful comparison.

The next reviewable deliverable is **one AD curation packet**, followed by a small reviewed dataset diff. A candidate list alone does not expand the released graph or satisfy M2.

## Then: automate collection, preserve review

Introduce one source adapter at a time after verifying current access, attribution, and reuse terms:

1. Fetch a bounded set of candidate records into staging, recording the source release, retrieval date, and original identifiers.
2. Normalize and validate identifiers, duplicates, evidence links, and study context; show a reviewable diff from the previous snapshot.
3. Have a human assess scientific interpretation, source comparability, reuse, and publication status. Automation must not create review attestations.
4. Publish an approved, versioned snapshot that the existing explorer can read; imports must not silently replace its content.
5. Reuse the tested workflow for a second disease, then widen coverage according to source availability and review capacity.

Open Targets, Reactome, and OpenAlex are planned inputs, not working integrations. AI explanations remain optional and downstream of reviewed evidence. See [steps.md](../steps.md) for the full milestones and the [evidence policy](evidence-policy.md) for scientific release rules.
