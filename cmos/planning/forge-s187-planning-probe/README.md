# Sprint 187 planning inputs

- `fresh-composition-census.json`: original planning measurement at reviewed s186 head `87a7933b`; 27/66 schemas and 58/132 generation cells green.
- `prepared-worktree-census.json`: repeat from rebuilt packages at `0d87824a` (merged source `21c7c319` plus review records), with the same per-input results. The public context enum orders detail before list; comparison uses object/context identity, not row position.
- `fresh-composition-census.mjs`: repeatable read-only generation census. It discovers objects and contexts from the current public sources, uses unmodified default composition, and runs both frameworks at `profile=build`. Known codegen refusals are retained as data; a zero process exit is not a green generation gate. An unexpected composition failure throws.
- `runtime-cohort.json`: 14 explicit paths / 28 framework cells. Planning verified their union covers all fourteen measured missing families. This file defines future runtime proof; it is not a runtime pass receipt.
- `setup/`: successful token, workspace-package and distributable build logs. No full test-suite capture was run during planning.

From the prepared worktree, after rebuilding affected packages:

```sh
node cmos/planning/forge-s187-planning-probe/fresh-composition-census.mjs \
  "$PWD" artifacts/product-reality/sprint-187/m01/fresh-composition-census.json
```

Read the emitted JSON, compare exact input membership with the planning baseline, and count actual green schemas/cells. The script does not bless targets, rewrite schemas or saved stores, or demonstrate installation/rendering/hydration. Its output must not substitute for the existing packed-consumer harness.

Preparation used `pnpm install --frozen-lockfile`, followed by `pnpm run build:tokens`, `pnpm run build:packages`, and `pnpm run pkg:build`, in that order. Node was v24.6.0 and pnpm 9.12.2. The root distributable build reported Storybook hash and VR baseline as unavailable; these are explicitly not preparation claims.
