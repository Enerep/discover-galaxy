# npm dependency security

Reviewed: 2026-10-20. This policy addresses the user's explicit concern about Shai-Hulud and related npm supply-chain attacks. It reduces exposure; it does not certify that a package or build is malware-free.

## Installation policy

- Keep the dependency set small. Use the existing React/Vite source files rather than running a downloaded scaffolder through `npx` or `npm exec`.
- Pin direct dependencies exactly and commit `package-lock.json`. Review changes to both files together, including transitive packages, registry URLs, and integrity hashes.
- Set `ignore-scripts=true` and `save-exact=true` in the project `.npmrc`. Install from the repository root with `npm ci --ignore-scripts` once the lockfile exists. Do not enable lifecycle scripts globally to fix an installation issue.
- Use the official npm registry over verified HTTPS. Reject unexpected Git, HTTP, local-file, or alternate-registry dependencies unless explicitly reviewed and documented. Preserve the environment's proxy and CA configuration.
- Check current advisories and publication dates before accepting new versions. Prefer a 14-day release-age window when resolving dependencies; make a reviewed exception when a necessary security fix is newer rather than retaining a vulnerable package blindly.
- Run `npm audit` after resolution and before executing build tooling. It checks known advisories, not every possible malicious behavior. After installation, `npm audit signatures` can additionally check supported registry signatures and provenance. Investigate failures; a successful check does not establish that the signed content is benign. See [npm audit documentation](https://docs.npmjs.com/cli/v11/commands/npm-audit/).

`ignore-scripts` blocks package lifecycle hooks during installation. Explicit project commands such as `npm run build` still execute the named script and its imported dependencies, so review those commands and dependencies before running them. These behaviors are documented in [npm's configuration reference](https://docs.npmjs.com/cli/v11/using-npm/config/) and [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/).

## Release-age compatibility

The initial cloud environment has npm 11.9.0. npm introduced `min-release-age` in **11.10.0**, so adding that key to this environment's `.npmrc` would not enforce a release-age policy. Use a documented absolute `--before` cutoff during dependency resolution and inspect the final selected versions' registry publication dates, including transitive dependencies. A later `npm ci` reproduces the reviewed lockfile; it does not independently re-evaluate publication age. Recheck support before changing the toolchain. See the [npm 11.10.0 release notes](https://github.com/npm/cli/releases/tag/v11.10.0).

## Why these controls matter

GitHub describes Shai-Hulud as a campaign using compromised publication credentials and malicious lifecycle hooks, including credential theft and propagation. Script-disabled installation, limited credentials, and careful dependency review address parts of that attack path. Keep publishing credentials out of this frontend workflow; never commit tokens or place secrets in client environment variables. See [GitHub's Shai-Hulud guidance](https://github.blog/security/supply-chain-security/strengthening-supply-chain-security-preparing-for-the-next-malware-campaign/).

Recent incidents also demonstrate that trusted package names and publication pipelines can be compromised. When checking a known incident, compare **exact package names and versions** against its primary advisory, not just the package family or a remembered date. The [TanStack incident postmortem](https://tanstack.com/blog/npm-supply-chain-compromise-postmortem) and [CVE-2026-45321 advisory](https://github.com/advisories/GHSA-g7cv-rxg3-hmpx) provide one such version-specific record. An incident list is not a complete inventory of malicious packages.

## React advisory scope

The first explorer is a client-rendered React/Vite application. It does not need React Server Components, `react-server-dom-*`, a server framework, or an RSC bundler plugin.

The React team's January 26, 2026 update identifies fixes in `react-server-dom-webpack`, `react-server-dom-parcel`, and `react-server-dom-turbopack` at 19.0.4, 19.1.5, and 19.2.4, and states that client-only apps without RSC support are outside those particular vulnerabilities. This is a scope distinction, not a claim that browser-only dependencies have no security risk. Recheck the advisory if server rendering or RSC support is added. See [React's updated RSC advisory](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components).

## Known-IOC lockfile check

The repository includes a Python-standard-library [IOC checker](../tools/security/check-iocs.py). It compares resolved package names and exact versions in npm v2/v3 lockfiles against three pinned CSV feeds: Datadog's consolidated Shai-Hulud 2.0 indicators, Wiz's Shai-Hulud 2.0 indicators, and Wiz's keyv campaign indicators. The [source manifest](../tools/security/ioc-sources.json) records publisher, immutable revision, URL, expected columns, and SHA-256 for each feed. CSV contents are parsed as data and never executed. Feed errors, digest changes, empty feeds, and unsupported version syntax fail the check rather than producing a clean result.

Run from the repository root with network access to the pinned raw GitHub URLs:

```sh
python tools/security/check-iocs.py
python -m unittest discover -s tools/security -p 'test_*.py'
```

For an offline comparison, supply `--feed-dir /path/to/reviewed-feeds`, containing `<feed-id>.csv` files with the pinned digests. Exit status is `0` for no exact match in these feeds, `1` for a match requiring investigation, and `2` for an incomplete or invalid check.

The [initial check report](../tools/security/initial-ioc-report.json) records 68 resolved package entries and zero matches, together with the lockfile digest and each feed's revision/digest. That result applies to that lockfile and those historical feeds. It does not cover unknown malware, every campaign, a compromised machine, or later dependency changes. Review newer publisher data and update the pinned revisions/digests when updating dependencies or responding to an advisory; do not assume that rerunning an unchanged historical list makes it current.

## Updating dependencies

1. Check upstream ownership, release notes, advisories, publication age, and the reason for the update.
2. Resolve the candidate lockfile with scripts disabled; inspect new dependencies, source URLs, integrity data, and install-hook declarations.
3. Run the audit and relevant checks. Do not run `npm audit fix --force` or automatically accept a broad lockfile rewrite.
4. Install using `npm ci --ignore-scripts`, then run the reviewed project validation commands.
5. Record deliberate release-age or lifecycle-script exceptions with the package/version, reason, and review date. No blanket exception is implied by this policy.

If CI is introduced, keep default workflow permissions read-only, pin third-party actions to reviewed commit SHAs, and isolate untrusted pull-request code from credentials and privileged workflow contexts.
