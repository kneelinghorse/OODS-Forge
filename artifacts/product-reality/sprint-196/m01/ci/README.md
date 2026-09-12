# Portable fixture contract runner receipt

The existing `portable-runtime` CI job now runs the package-native fixture
contract proof explicitly before assembling the runtime:

```sh
pnpm --filter @oods/mcp-server exec vitest run test/contracts/portable-fixtures.s194.spec.ts --reporter=verbose
```

Local execution passed: one file, one test, zero skipped tests. The exact
Vitest output is retained in `portable-fixtures.log`; machine-readable results
are in `portable-fixtures.vitest.json`. The local run added JSON reporting to
the same test command. YAML parsing confirmed the step is in the existing
`portable-runtime` job and precedes assembly. `git diff --check` passed.

Discovery audit: the test already matched the root `core` project globs and the
package-native whole-suite globs used by the `viz-contract` job. This change
makes its execution explicit in the portable runtime's own CI proof; it does
not claim that the existing test was excluded from all runners.

## Remote CI evidence

The exact implementation head `6e66d3f79faf0a3eafe0d1ded91b849ec5e08278`
passed the `portable-runtime` job in run `34674083968`, job `103500676755`.
The explicit fixture step passed one test with zero skips. Retained evidence:
`github-portable-runtime.log` (raw Actions log),
`github-portable-runtime.json` (job metadata), and
`github-verification.json` (head, step result, log digest, and matching lines).

The commands below remain the retrieval recipe for later exact revisions.

A local result is not a GitHub Actions receipt. After pushing the mission
commit and triggering CI for that exact revision, locate the run and job:

```sh
gh run list --repo kneelinghorse/OODS-Forge --workflow ci.yml --commit <commit-sha> --json databaseId,headSha,status,conclusion,url
gh run view <run-id> --repo kneelinghorse/OODS-Forge --json headSha,jobs,url
gh run view <run-id> --repo kneelinghorse/OODS-Forge --job <portable-runtime-job-id> --log > artifacts/product-reality/sprint-196/m01/ci/github-portable-runtime.log
```

The remote log must name `test/contracts/portable-fixtures.s194.spec.ts` in the
`Verify portable fixture contracts` step and show the passing test summary.
CI push triggers currently cover `main`, `OODS-pro`, and `Forge-expansion`;
other branches need the existing pull-request or `workflow_dispatch` trigger.
