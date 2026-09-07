# s187-m03 ownership and summary ports

Build branch: `codex/sprint-187-fresh-composition`, starting from m02 `1d38ff33`.
Builder evidence only; Sprint 187 remains Active and `builderSelfCertified:false`.

The four families are OwnerBadge, OwnershipSummary, OwnershipMeta and TagSummary. Both framework roots have real implementations, contracts, shared scenarios, public declarations, token styles and separately resolved readiness references. Ownership summaries retain owner ID/type/role term associations; role is displayed data and never leaks into an ARIA role attribute. Authored children preserve each HTML renderer's override behavior. These are presentational components; no ownership-transfer or tag-edit action is claimed.

TagSummary preserves scalar HTML behavior and adds the meaningful Taggable array operand using the existing tag normalizer. It displays names separated by comma-space, retains numeric zero count, and omits the Tags term for an empty array. HTML's scalar reader itself ignores arrays; the array presentation is an explicit additive React/Vue behavior (CMOS #1798), not a claim that HTML already supported it. Fresh card consumer data includes a nonempty tag array and independently supplied zero count so both are observed in the browser. OwnershipSummary's transferredAtField and allowTransferParameter remain disclosed unbound because HTML has no transfer term or action.

Verified live result: `live-attempt-2/report.json` records **6/6 cells, 46 passed gates, zero failures, zero skips, and two interaction N/A gates** for the metadata-only Organization cards. Every card has attached framework state and retains its server DOM; browser probes directly observe owner type, role, zero tag count and the nonempty tag array in both frameworks. `fresh-final.json` records **59/66 schemas, 118/132 generation cells and 59 governed IDs**; the seven remaining schemas require the m04 families.

## Repairs exposed during proof

- Computed parity with active status caught an inherited automatic subscription-status glyph in the React badge-family adapter. The HTML and Vue family renderers are iconless. The adapter now sets showIcon=false, retaining Badge's own behavior and the families' status/tone data. Active-status parity covers OwnerBadge and the four existing badge families using this adapter (CMOS #1799). The initial failed test receipts remain intact.
- `live-attempt-1` stopped during authentic Organization/card generation. The composer inserted an empty unbound Button into an optional footer already populated by OwnershipMeta and TagSummary. The harness correctly refused to call a declared unsupported control N/A. The slot filler now preserves a populated optional action-or-metadata slot without inventing an action, while retaining explicitly authored buttons and required-slot fallbacks (CMOS #1800). This is a public producer repair; no harness schema pruning, action fabrication or interaction-gate weakening is used. Regression tests cover the real Organization/card plus an explicitly authored footer action.
- An initial shared-scenario ordering error was corrected to match the single sorted governed union; original logs are retained. The component ID list retains its established one-entry-per-line style.

## Verification commands

```sh
pnpm --filter @oods/components-react exec vitest run --config vitest.config.ts --maxWorkers=2
pnpm --filter @oods/components-vue exec vitest run --config vitest.config.ts --maxWorkers=2
pnpm --filter @oods/component-contracts exec vitest run --config vitest.config.ts --maxWorkers=2
pnpm --filter @oods/component-styles exec vitest run --config vitest.config.ts --maxWorkers=2
pnpm --filter @oods/mcp-server exec vitest run test/compose/object-slot-filler.spec.ts src/compose/object-slot-filler.test.ts test/product-reality/fresh-composition.s187.spec.ts test/codegen/ --maxWorkers=2
pnpm exec tsx scripts/product-reality/s185-m04-live-consumers.ts --mission s187-m03 --fresh Organization/list,Organization/detail,Organization/card --output artifacts/product-reality/sprint-187/m03/live-attempt-2
node scripts/product-reality/s185-m03-export-mutations.mjs --components OwnerBadge,OwnershipSummary,OwnershipMeta,TagSummary --spec test/product-reality/breadth-export-cells.s187.spec.ts --output artifacts/product-reality/sprint-187/m03/mutation-attempt-1 --mission s187-m03
```

- React `react-tests-attempt-2.log`: 15 files / 196 passed. Vue `vue-tests-attempt-2.log`: 14 files / 148 passed. Includes scalar and array data, zero count, alias precedence, authored children, role semantics, shared scenarios, SSR and existing accessibility checks. React/Vue typechecks pass in `*-typecheck-attempt-2.log`.
- `server-tests-attempt-2.log`: 3 files / 91 passed, including computed parity and 18 named export cells. After the optional-footer repair, `server-tests-attempt-3.log`: 13 files / 297 passed, including the affected composition/codegen tests. No skips.
- `styles-tests-attempt-1.log`: 3 files / 33 passed, including actual token cascade through A/B × light/dark/hc. No new visual-review or accessibility-maturity promotion is claimed.
- Package builds and the strict CLI/dependency-closure check pass (`harness-typecheck-attempt-1.log`). Builds complete before dependent tests; consumer cells use only their retained exact tarballs.

No per-mission four-suite capture, shared-service restart, deployment or shared-store adoption is performed.

Final closure checks: `contracts-tests-final.log` passes all 8 files / 96 tests. `baseline-fold-write.log` and `baseline-fold-check.log` verify 135 surface cells across 45 existing baseline identities, all 109 identities unchanged, and 540 resolved readiness references. The old runtime-census approval remains null. Frozen prior-sprint evidence is intact. `mutation-attempt-1/mutation-manifest.json` retains eight selected package reds and eight independent readiness reds, 136 unaffected green executions, 144 restored green executions, and byte-identical restoration in every case.
