# Sprint 188 planning probe

Measured at the merged `OODS-pro` head `cd8ee986` in the prepared worktree, after a frozen-lockfile install and
the token, package and pkg builds (logs in [setup/](setup/)).

**Result:** 66/66 schemas, 132/132 cells, 64 governed IDs, head cd8ee986, measured 2026-09-08T02:38:13.086Z; Subscription detail=green, list=green, form=green, timeline=green, card=green, inline=green.

This reproduces the certified Sprint 187 population at the build base: it is the regression pin for
`s188-m02` (the six existing contexts must stay byte-identical apart from the enumerated label fix) and the
starting denominator for `s188-m06` (66/66 plus the new `Subscription/workflow` schema).

Repeat with:

```bash
node cmos/planning/forge-s188-planning-probe/fresh-composition-census.mjs "$PWD" <output.json>
```

Rebuild affected packages before claiming a fresh measurement. The script is the Sprint 187 census unchanged.
