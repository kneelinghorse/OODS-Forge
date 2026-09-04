# Sprint 182 M01 mutation evidence

**Mission:** `s182-m01`

**Baseline HEAD:** `8ce349076e7e3ba3f0b2f3f667d4fbb5c6a4b63b`

**Branch:** `codex/sprint-182-product-reality`

**Environment:** Node `v24.6.0`; pnpm `9.12.2`; Python `3.11.9`

**Run date:** 2026-09-04 UTC

Every row used the literal selector in
`cmos/planning/forge-s182-foundation-gate-manifest.md`. Mutants were applied one at a time; no
snapshot, digest, or expectation was changed under mutation. `Skipped` below means tests filtered
out by the named selector, not an unrun selected test.

| Bite / leg | Production or fixture mutation | Pre-green selected / failed / skipped | Mutant selected / failed / skipped | Restored selected / failed / skipped | Discriminating observation |
|---|---|---:|---:|---:|---|
| B-01 drop | Deleted the `AddressCollectionPanel` intake row and retained denominator 109 | 1 / 0 / 6 | 1 / 1 / 6 | 1 / 0 / 6 | Exact membership expected 109, received 108 |
| B-01 duplicate | Changed `AddressEditor.id` to `AddressCollectionPanel` while retaining 109 rows | 1 / 0 / 6 | 1 / 1 / 6 | 1 / 0 / 6 | Derived unique membership expected 109, received 108 |
| B-02 stale count | Moved the finite `stats.componentCount` branch ahead of row-ID derivation in `resolveComponentCount` | 1 / 0 / 27 | 1 / 1 / 27 | 1 / 0 / 27 | Live resolver returned stale 101 instead of 109 |
| B-03 foundation | Removed `packedImport` from `FOUNDATION_V1_EVIDENCE_CLASSES` | 1 / 0 / 6 | 1 / 1 / 6 | 1 / 0 / 6 | Independent frozen nine-class tuple detected the weakened predicate |
| B-03 emission | Removed `publicDeclaration` from `EMISSION_ELIGIBILITY_EVIDENCE_CLASSES` | 1 / 0 / 6 | 1 / 1 / 6 | 1 / 0 / 6 | Independent frozen six-class tuple detected false target promotion |
| B-04 story identity | Removed the positive story's default-meta `oodsComponentId` while retaining import, title, prose, comment, JSX, and story export | 1 / 0 / 0 | 1 / 1 / 0 | 1 / 0 / 0 | `components.TagInput` became empty; prose did not reconnect it |

The two restored B-03 selectors were also run together after both source restorations: 2 selected, 2
passed, 5 filtered out. The full structured-data test module then passed 12/12.

## Restored-source digests

| Path | SHA-256 |
|---|---|
| `packages/component-contracts/registry/component-intake.v1.json` | `9eaba8f8fe6d5c75f7815b128e9763b188ea2e80f3ffc21635ee1887ede3f299` |
| `packages/component-contracts/src/foundation-v1.ts` | `7f4c9ae5e2863880859c312a2587254322a36f194f5a66eb25c34a993ba4194f` |
| `packages/mcp-server/src/tools/catalog.shared.ts` | `aa62c9e96578b59a7b47f58a35f80111a89a7a8c632c6eae5e9f4b9dcfffc306` |
| `cmos/scripts/refresh_structured_data.py` | `bb27ba5fbb80ecae0447684c63ee1e722c316f61e476e74b1891628235cf9dc2` |

## Package foundation proof

`node scripts/product-reality/verify-package-foundations.mjs --artifact-root artifacts/product-reality/sprint-182/m01/foundation-pack-final`
selected four packages and passed 4/4 with no skips or findings. Each package was built and packed
twice with a verifier-owned empty npm configuration. The two tarball SHA-256 values and inventory
SHA-256 values match per package. The complete report, logs, inventories, and local tarballs are in
`artifacts/product-reality/sprint-182/m01/foundation-pack-final/package-foundations/`.

No mutation remains applied.
