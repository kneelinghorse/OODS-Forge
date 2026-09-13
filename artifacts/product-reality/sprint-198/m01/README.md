# s198-m01 — canonical token gates and CI repair

Builder self-certified: **false**. CI acceptance remains pending until the pushed
head passes a11y-contract, coverage, tokens-governance A/B and guardrails-check.
No craft mission has started.

The first commit, `0c230e55c`, copied the four planning files byte-for-byte from
the primary checkout. All implementation work is in the Sprint 198 worktree.
The initial disk check reported 305 GiB free. The served checkout and PM2 were
not changed; no consumer notices were sent.

Both CLIs now import one typed CSV reader. It retains all six relative-color
rows and validates the 61 palette rows before the a11y CLI names their owner,
`tokens-validate`. Misspelled types, missing operands, malformed rows and
non-finite numeric limits fail. The canonical color loader uses the token
builder's ordered default scope; it does not merge dark/HC brand overrides
into the base scope. The old transform command was another legacy gate input:
`tokens:validate` now delegates to the canonical builder's `--check`, and
`tokens:transform` delegates to its build. The old root palette tree is historical. A final gate audit also found the billing
status-map reader under `tokens/maps/`: the enum gate and its convergence test now
read a byte-identical map under `packages/tokens/src/maps/`. Existing application
imports retain their compatible copy; a boundary test checks equality. The unused
legacy map constant in governance is removed.

The generator owns the independent interaction-state ladder and Theme0
surface/status bindings. Dark starts at L=0.40 so its +0.10/+0.14 states retain
white foreground contrast. Light starts at L=0.53. Both ladders use C=0.060,
0.075 and 0.085; the reference palette's bell-shaped chroma curve cannot supply
positive state chroma deltas toward its darker end. Existing relative-color
expressions are retained for light hover/pressed. No guardrail range, threshold
or a11y baseline was changed.

`token-measurements.json` binds before/after readings to source hashes:
228/228 brand source pairs pass. System accent text/icon ratios are
7.8283/5.5480 (thresholds 4.5/3); on-interactive is 4.6337 (threshold 4.5).
All six state rows pass their lightness, chroma, hue and contrast checks.
The complete canonical color guard reports 454/454 checks.

Final browser receipts are `component-proof/react-final/report.json` and
`component-proof/vue-final/report.json`: 654 cells each, zero failures/skips.
The initial sweeps are retained separately; they preceded restoration of the
existing relative-color metadata. `logs/a11y-diff-final.log` reports zero new
violations from the built tokens and Storybook contract.

`golden-migration/baseline.json` preceded token changes. The addendum records
viz-core registries omitted by the first path filter. `attribution.json` names
every changed token: 20 values in seven generated files, all interactive-primary
or accent-status. All 14 live snapshot files and the chart registries stayed
byte-identical; no `--update` command was necessary or run. Their 118 scoped tests
passed without skips. Reference, categorical, sequential and diverging colors
remain fixed. Reproduce the attribution with `golden-migration/finalize.py`.

Focused parser/generator/source tests, the 29-test contrast suite, typecheck,
`tokens-validate`, `docs:check`, and the unchanged readiness generator's `--check`
passed. The migration audit passed 7/7 tests, no skips, in 15.06 seconds, with its
slowest assertion at 11.13 seconds; it now has the same 60-second budget as its
git-reading siblings. The root parallel CI result is still independently required.
Initial failed commands are retained in the logs: the canonical loader exposed
the CSV's underscore spelling of on-interactive, generator population assertions
needed to include the two newly owned Theme0 files, and typecheck caught missing
native-ESM typing and receipt array annotations. Final logs record corrections.

`scripts/product-reality/s198-prefreeze.mjs` places the unchanged readiness
`--check` first, then token, ledger, docs and contract verifiers. The root manifest
is unchanged, so the readiness facts did not need regeneration. This mission's
local scoped checks are not the sprint's one five-suite closeout capture.

The first remote run (34780820944, implementation 747a48813) exposed a fresh-runner
setup gap in tokens-validate: all five dist outputs were absent before `--check`.
The raw failed job log is retained in `ci/tokens-validate-initial.log`. The workflow
now builds the canonical tokens before checking their emitted output. A boundary
spec pins that ordering. This failed run is not relabeled as a passing run.

The second remote run (34781054944, head bfd9bfcc9) passed a11y-contract,
tokens-validate, both governance jobs and guardrails-check. Coverage executed
7,335 tests: 7,318 passed, one failed, 16 skipped. Its sole failure was the old
bridge assertion that every branded value must differ from the default. The
three A/light interaction values intentionally share the new generated ladder;
the assertion now names exactly those three shared slots, while all 41 per-cell
source comparisons and seeded cross-cell leak controls remain. A bridge that
repeats the entire root block still fails. No color threshold or token changed.
Raw output: `ci/coverage-bfd9bfcc9.log`. The 16 existing optional Stage1 fixture
skips are reported, not counted as passes. A new CI run must establish coverage.
