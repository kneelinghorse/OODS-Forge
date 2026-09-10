# s192-m02 — Baseline conflict; implementation paused

Session `PS-2026-09-10-010`. Baseline source head `77f174d1` contains only the locked planning documents and m01 delivery receipts beyond reviewed runtime `5fdf8a18`. No product source, token source, workflow, capture script or test has changed in m02.

The locked handoff says: “The mission's script must reproduce these at the base before it changes anything.” Its reference census cannot be reproduced by an exhaustive reference inventory of the named files. `baseline-census.mjs` is a read-only diagnostic, not the finished token-resolution contract. It balances nested `var()` calls, ignores comments/quoted text, records every source location, and checks every scope of `@oods/tokens.cssVariablesByScope` against declarations in the actual built CSS. It normalizes the JS export's legacy `--oods-` prefixes for reserved CSS namespaces, as documented by `packages/tokens/scripts/build-entry.mjs`.

Run from the sprint worktree:

```sh
node artifacts/product-reality/sprint-192/m02/baseline-census.mjs --check-locked
```

Exit 1 is the deliberate locked-baseline mismatch (`baseline-census.log`, `baseline-census.json`). Both stylesheet byte hashes equal `5fdf8a18` and the planning measurement head `70e41570`, checked by the script against Git. The main stylesheet SHA256 is `d3ccf7f9e9af4de6feb42cdfb18c349a7d955a4e8621b526689a808a48ce872e`.

| Inventory metric | Locked | Measured in every scope |
| --- | ---: | ---: |
| Distinct referenced variables, including nested fallbacks | 174 | 191 |
| Token-defined | 42 | 45 |
| Local stylesheet declaration exists | 52 | 57 |
| No token or local declaration | 80 | 89 |
| Missing `--sys-*` names | 7 | 7 |
| Unresolved names with at least one use without a fallback | 1 | 6 |

The six names are `--radius-md`, `--space-2`, `--space-3`, `--sys-focus-ring`, `--sys-surface-default`, `--sys-text-subtle`. Each occurrence and complete expression is retained. “Local” is a declaration inventory, not proof that its selector applies to every use. System-colour **reachability** has not been measured by this diagnostic; a syntactic colour occurrence is not counted as reachable. The locked 26 must be checked by the real resolver, not silently copied into its output. The parser's nested-fallback and quoted/comment exclusion assertions pass before its real-source scan.

## Four package baseline

Executed the literal package command before any producer changes:

```sh
pnpm --filter @oods/component-contracts --filter @oods/component-styles --filter @oods/components-react --filter @oods/components-vue run test
```

`component-packages-base.log` exits 1. Recursive first-failure termination prevented a final Vue summary, so Vue was run once independently (`components-vue-base.log`, exit 1).

| Package | Files | Tests | Attribution |
| --- | --- | --- | --- |
| component-contracts | 9 passed | 121 passed | Green |
| component-styles | 3 passed | 34 passed | Includes browser spec |
| components-react | 17 passed, 1 failed | 230 passed, 2 failed | `test/scenarios.spec.tsx:528,588` |
| components-vue | 17 passed, 1 failed | 186 passed, 1 failed | `test/scenarios.spec.ts:735` |

ArchiveSummary assertions in both frameworks expect `false` and raw ISO text; Sprint 191 producers now render `No` and a formatted timestamp. React StatusTimeline still expects “2 transitions available.” in the current-status text, whereas the current producer renders “Current status: Active”. These are existing assertion failures; nothing is declared green or skipped. They must be reconciled with the reviewed behavior when the package gate is implemented.

## Concrete correction proposed

Replace m02's literal historical census equality with: “At the m01 runtime head, retain an exhaustive inventory of both named stylesheets, including nested references, and attribute differences from the planning estimate. The measured inventory is 191 referenced / 45 token-defined / 57 local / 89 unresolved across all six scopes, with seven missing sys names and six unresolved names used without fallbacks. Retain the independently derived system-colour reachability count and its definition.”

Every post-fix requirement remains as locked: zero unresolved colour roles, zero reachable system-colour fallbacks outside forced-colors, defined focus ring, authored semantic aliases, mutation bite, CI/fifth-suite integration, six-scope browser proof, BEFORE/AFTER design-loop receipts, and focused tests/typecheck. This proposed wording has **not** been applied to the CMOS mission or accepted memo. Confirm the correction or provide the original counting rule/probe that reproduces the locked denominator; then unblock m02 and continue the serial slate.

CI changes, the production resolver/contract, token fixes, design-loop receipts and subsequent missions are not implemented. No full-suite capture was run. The live bridge remains at the independently reviewed Sprint 191 delivery from m01.
