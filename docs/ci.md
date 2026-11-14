# Continuous integration

[GitHub Actions](../.github/workflows/ci.yml) runs **CI / Tests, build and source checks** for pull requests targeting `master`, pushes to `master`, and manual dispatches. New commits cancel superseded runs on the same request/ref. The workflow tests the proposed revision; it never merges, deploys or promotes scientific records.

## Reproduce the checks

Use Node.js 24, the declared npm 11.9.0 package manager, and Python 3. From the repository root:

```sh
npm run check:dependencies
npm ci --ignore-scripts
npm run check:ci:security
npm run check:ci
```

The security command requires network access to the official npm registry and the three checksum-pinned IOC feeds. It fails on reported vulnerabilities, exact malware-indicator matches, or incomplete feed checks. These are current advisory checks against the installed lockfile and historical pinned indicators, not a guarantee that dependencies are benign. See [dependency security](npm-security.md).

The reproducible project command runs native tests, development-data validation, pinned pathway/identifier integrity, generated review/coverage/seed checks, the security checker's Python tests, and the production build with typechecking. It makes no live scientific-provider request. The intentionally rejecting `validate:release` is a separate scientific-release gate; source-checked development does not create independent approval.

Browser checks remain explicit local checks using the existing Playwright/system-Chromium setup in [verification](verification.md). The first CI workflow does not install a browser stack or claim a browser result. Branch protection and required checks are repository settings; adding this workflow does not itself prevent merging a failed request. Configure the named check as required if merge enforcement is desired.

## Runner and dependency safeguards

The job uses Ubuntu 24.04, Node **24.19.0** and npm **11.9.0**. Official Node distribution metadata reports npm 11.17.0 bundled with this Node version, so a lifecycle-disabled, exact-version npm bootstrap makes CI match `packageManager`. Application dependencies are installed only from the committed lockfile with `npm ci --ignore-scripts`. The job verifies dependency sources before installation, disables package-manager caching, and rejects tracked-file rewrites after checks.

Workflow permissions are `contents: read`, checkout does not persist credentials, and no secrets or privileged pull-request event are used. Both official actions are pinned to reviewed commits:

| Action | Reviewed release | Commit |
| --- | --- | --- |
| `actions/checkout` | v7.0.1, 2026-07-20 | `3d3c42e5aac5ba805825da76410c181273ba90b1` |
| `actions/setup-node` | v7.1.0, 2026-10-08 | `949feb2413d6458794dcd2491c4babbbce0c15c1` |

The upstream tag targets, signed commit verification, releases and `action.yml` Node 24 declarations were checked on 2026-11-14. [Node distribution metadata](https://nodejs.org/dist/index.json) identifies 24.19.0 as published 2026-08-03. The official npm registry identifies npm 11.9.0 as published **2026-02-04T18:24:56.782Z**, from the `npm/cli` project and expected npm maintainers. Its 2,413,625-byte tarball matches reviewed integrity `sha512-BBZoU926FCypj4b7V7ElinxsWcy4Kss88UG3ejFYmKyq7Uc5XnT34Me2nEhgCOaL5qY4HvGu5aI92C4OYd7NaA==`; 1,797 archive members were inspected and no preinstall/install/postinstall/prepare hook is declared. No application dependency or release-age exception is introduced.
