# Sprint 189 planning probe

Measured at the merged `OODS-pro` head `f4cd1ba3cda3d1d52405582e425ecd6d19890b51` in the prepared worktree, after a frozen-lockfile install and
the token, package and pkg builds (log in [setup/install-and-build.log](setup/install-and-build.log)).

**Result:** 75/77 schemas, 150/154 cells, 72 governed IDs, head f4cd1ba3, measured 2026-09-08T22:15:11.529Z.

The census script (the Sprint 187 script unchanged) now enumerates the seventh public context, `workflow`, for all
11 objects, so the population is 77 schemas / 154 cells rather than Sprint 188's 66 + Subscription/workflow. The two
non-green rows are **Organization/workflow** and **User/workflow**: both compose, and application generation returns
the typed gap in both targets — `OODS-N016: Workflow has no domain implementation for 'handleChange_addresses'.`. Subscription/workflow is green in both targets; the 66 single-screen
schemas and 132 cells are green, which reproduces the certified Sprint 188 population at the build base.

This is the regression pin for `s189-m03`/`s189-m04` (every schema movement enumerated per schema by class) and
the starting denominator for `s189-m06`, which reports the same 77-schema population: 66/66 + Subscription/workflow
2/2 green, and the two N016 rows either unchanged and disclosed or green with attribution.

Repeat with:

```bash
node cmos/planning/forge-s189-planning-probe/fresh-composition-census.mjs "$PWD" <output.json>
```

Rebuild affected packages before claiming a fresh measurement.
