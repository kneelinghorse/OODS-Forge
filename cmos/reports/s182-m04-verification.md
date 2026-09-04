# Sprint 182 M04 verification

Date: 2026-09-04
Mission: `s182-m04`
Implementation review head: `e9915292c108b686d57623bc9bcfb84621a0ce23`
Status: passed; ready for M05 closeout derivation

## Result

M04 makes React and Vue code generation target-aware and runnable against submitted package artifacts. Supported requests import the real `@oods/components-react` or `@oods/components-vue` package plus `@oods/component-styles/css`. Known component/target pairs without `emissionEligible` fail before emission with the exact ordered `OODS-N015` response and an empty code payload. HTML behavior remains compatible. `pipeline` preserves that failure at `error.step: "codegen"` and does not synthesize successful code.

The implementation normalizes only the locked 14-component nucleus, performs framework syntax preflight, emits deterministic target source, and keeps the public success response shape compatible. Direct callers are dispositioned in `cmos/reports/s182-m04-caller-migration.md`; the saved Tier-1 compatibility operand is bounded to `Card`, `Stack`, `Tabs`, and `Text`.

## Product evidence

`scripts/product-reality/run-s182-m04-evidence.ts` regenerated the canonical artifact tree after the final visual-parity fixes.

| Evidence | Result |
| --- | --- |
| Public option matrix | 12 selected / 12 passed: React and Vue × inline, tokens, and Tailwind × TypeScript on and off |
| Packed root-export proof | 1 selected / 1 passed |
| Generated consumers | 2 selected / 2 passed |
| Target cells | 28 / 28 derive `codegenUsable` |
| React default consumer | fresh submitted-tarball install, strict typecheck, production build, SSR, hydration/mount, CSS, interaction, and phone/tablet/desktop screenshots passed |
| Vue default consumer | fresh submitted-tarball install, strict typecheck, production build, SSR, hydration/mount, CSS, interaction, and phone/tablet/desktop screenshots passed |

The six inspected screenshots show the declared three-column table without horizontal overflow, unboxed field wrappers, styled native controls, the visible required Checkbox marker, semantic Banner title emphasis, and responsive one-line table cells at 375, 768, and 1280 CSS pixels.

Canonical hashes:

- `artifacts/product-reality/sprint-182/m04/report.json`: `9017ef71ba4ac92d1d9ce945fa0135e4bdd452713b5bc2a78b40ea06c2ae3cf9`
- `artifacts/product-reality/sprint-182/m04/codegen-usable-ledger.json`: `6516c93d34712cf9e9d38fdb5a7f19061f3c01be5cfc0cb03fd51657c96f4ed6`
- `scripts/product-reality/s182-m04-consumer-harness.mjs`: `1a19332a2fc4070036491104631e6d9bbe29f06737132f29a1777db7a8e75be4`
- `scripts/product-reality/capture-s182-m04-gates.mjs`: `b1cf1a5d86d01e59a21b01b6e374be16c35dd05614f6c98da062e49c7255fa41`
- `packages/mcp-server/.oods/schemas/tier1-acceptance-sub-detail.json`: `6d31155b9162b2e203d5e83a349762537f98f06294734c323910840301ff2c04`

## Verification

- Final MCP-server suite after the visual fixes: 229 files passed, 1 file skipped; 4,528 tests passed, 16 skipped; 0 failed; 145.45 seconds.
- Component styles: 2 files, 15 tests passed.
- React package: 5 files, 28 tests passed; typecheck and build passed.
- Vue package: 5 files, 30 tests passed; typecheck and build passed.
- Focused packed B-13 replay after the visual fixes: selected 1, passed 1, skipped 0.
- Evidence regeneration: 12/12 matrix cells, 1/1 packed root proof, 2/2 consumers, and 28/28 `codegenUsable` cells.
- All seven B-11…B-15 mutation legs passed GREEN → selected RED → restored GREEN in seven fresh detached worktrees at the exact review head. Every selected phase had zero selected-test skips and every worktree was removed before publication.
- Both restored package-verifier trees select 4, pass 4, fail 0, and skip 0. Their reports are byte-identical with SHA-256 `7bdf90c996d565f177e947f36a64a2eeb498c8b5cea9ac725f6ba2bb469cc4cb`; each canonical tree contains 29 inventoried files.
- A separate-agent read-only review returned PASS against `e9915292c108b686d57623bc9bcfb84621a0ce23`. It independently checked production ordering and error propagation, direct-caller coverage, report/inventory consistency, all six screenshots, B-11…B-15 runner/receipt conformance, and the absence of `foundation-v1` self-certification. It made no edits and ran no build, pack, or test command.

Mutation details and receipt digests are recorded in `cmos/reports/s182-m04-mutation-evidence.md`.

## Claim boundary

M04 derives only `codegenUsable` for the exact 14 React and 14 Vue cells. The machine ledger explicitly withholds `foundation-v1-candidate` and `foundation-v1`, and both booleans remain false. M04 does not approve the 109-row runtime census, broaden the nucleus, publish packages, or certify itself for release.
