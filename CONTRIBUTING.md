# Contributing

Read [README.md](README.md) and [steps.md](steps.md) to understand the current milestone. Coding agents should also read [AGENTS.md](AGENTS.md).

## Making changes

1. Identify the milestone and the smallest useful change. Check the product and architecture documents before expanding scope.
2. Implement the change and update any affected contracts, setup instructions, and milestone checkboxes.
3. Validate the result with checks that actually exist in the repository.
4. Describe the resulting behavior, validation, and any remaining limitations for review.

There is no runnable application yet. Setup and verification commands will be documented when the scaffold exists; do not assume `npm` or Python commands are already available as project tasks.

## Scientific content

Follow the [evidence policy](docs/evidence-policy.md) and [data model](docs/data-model.md). A content change should include stable entity identifiers, exact claims, original references, study context, provenance, and review status. Verify that sources support the wording being presented. Keep uncertainty and conflicting findings visible.

Code review alone does not establish scientific validity. Record a scientific content review before including a claim in a public snapshot. Do not use realistic invented citations as demo content. Synthetic fixtures belong in isolated test data and must be labeled.

## Reviewing interface changes

Check the main flow from search to entity selection to original evidence. Include the list alternative, keyboard navigation, reduced motion, empty search results, and unavailable WebGL. Scientific information must be accessible without using the 3D canvas.

## Repository hygiene

Commit source and reproducibility files, including the chosen dependency lockfile once one exists. Keep secrets, downloaded raw datasets, local environments, and generated output out of version control. Track source attribution and licensing alongside curated data; the project has not yet selected a software license.
