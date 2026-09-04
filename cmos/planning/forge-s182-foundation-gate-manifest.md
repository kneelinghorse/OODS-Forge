# Sprint 182 Foundation Gate Manifest

**Status:** execution binding for the locked
[`forge-s182-product-reality-foundation-decision-memo.md`](./forge-s182-product-reality-foundation-decision-memo.md)

**Authority:** Sprint-182 memo §6, CMOS decisions `#1652`–`#1654`

**Scope:** concrete carriers for mutation bites `B-01`…`B-15`. This manifest does not weaken or
replace the memo. A carrier or selector change requires a recorded manifest revision before the
mutation is run.

## Execution protocol

Run every mutation in a disposable clean checkout at review HEAD. Record the pre-mutation GREEN,
apply exactly one mutation leg, run only the literal selector below, record the expected RED, restore
the mutation, run the listed rebuild/repin command, and record the restored GREEN. Never update an
expectation, snapshot, digest, or baseline while a mutant is applied.

`selected` means tests selected by the literal selector, not assertions and not the parent suite's
total. Filtered-out tests are not gate skips; nevertheless, the receipt must record the runner's
reported skipped count. A real selected test that is skipped, todo, environment-blocked, or absent is
a failed gate. Unless a row says otherwise, the expected sequence is:

- pre-mutation: `selected 1 / failed 0`;
- mutation: `selected 1 / failed 1`;
- restoration: `selected 1 / failed 0`.

Every evidence directory below contains `mutation.patch`, `pre-green.log`, `selected-red.log`,
`restored-green.log`, and `receipt.json`. The receipt records review HEAD, carrier path and SHA-256,
literal command, mutation description and patch SHA-256, selected/failed/skipped counts, exit code,
toolchain versions, and every generated artifact path/digest. These filenames are literal.

## M01 truth-plane carriers

### B-01 — canonical intake membership and uniqueness

- Carrier: `packages/component-contracts/test/contracts.spec.ts`
- Selector:
  `pnpm --filter @oods/component-contracts exec vitest run test/contracts.spec.ts -t 'derives the controlling 109-row denominator from unique sorted membership'`
- Mutations, run and restore separately: (a) delete the `AddressCollectionPanel` row from
  `packages/component-contracts/registry/component-intake.v1.json`; (b) retain 109 rows but change
  `AddressEditor.id` to `AddressCollectionPanel`. Do not edit the denominator or digest index.
- Expected for each leg: `selected 1 / failed 1`; the exact-109 assertion reds for (a), and the
  unique/sorted membership assertion reds for (b).
- Restore/rebuild/repin:
  `node scripts/product-reality/generate-s182-foundation.mjs --write && node scripts/product-reality/generate-s182-foundation.mjs --check && pnpm --filter @oods/component-contracts run build && pnpm --filter @oods/component-contracts exec vitest run test/contracts.spec.ts -t 'derives the controlling 109-row denominator from unique sorted membership'`
- Evidence destinations: `artifacts/product-reality/sprint-182/gates/B-01/drop/` and
  `artifacts/product-reality/sprint-182/gates/B-01/duplicate/`

### B-02 — real catalog count resolver ignores stale `101`

- Production seam: `packages/mcp-server/src/tools/catalog.shared.ts::resolveComponentCount`
- Carrier: `packages/mcp-server/test/contracts/catalog.list.spec.ts`
- Selector:
  `pnpm --filter @oods/mcp-server exec vitest run test/contracts/catalog.list.spec.ts -t 'B-02 derives the catalog count from unique row IDs instead of stale stats'`
- Mutation: in `resolveComponentCount`, move the finite `dataset.stats.componentCount` branch ahead of
  unique `dataset.components[].id` derivation. The carrier's real resolver input deliberately contains
  `stats.componentCount: 101`, 109 unique rows, and one duplicate-row variant; do not replace it with a
  contracts-only helper.
- Expected: `selected 1 / failed 1`, with `101` received where `109` is required.
- Restore/rebuild/repin:
  `node scripts/product-reality/generate-s182-foundation.mjs --check && pnpm --filter @oods/mcp-server run build && pnpm --filter @oods/mcp-server exec vitest run test/contracts/catalog.list.spec.ts -t 'B-02 derives the catalog count from unique row IDs instead of stale stats'`
- Evidence destination: `artifacts/product-reality/sprint-182/gates/B-02/`

### B-03 — readiness cannot be promoted around missing evidence

This bite has two independent predicates. Both carriers must exist before m01 freezes shared files;
one combined assertion is not a substitute.

- Foundation carrier: `packages/component-contracts/test/contracts.spec.ts`
- Foundation selector:
  `pnpm --filter @oods/component-contracts exec vitest run test/contracts.spec.ts -t 'B-03 blocks foundation-v1 independently for each of the nine evidence classes'`
- Foundation mutation: weaken
  `packages/component-contracts/src/foundation-v1.ts::evaluateFoundationV1` so `packedImport` is no
  longer required. The carrier itself removes each of the nine frozen evidence classes independently;
  for every removal it asserts `evidenceComplete:false`, `candidate:false`, and `foundationV1:false`
  even when independent review is approved. The representative production mutation must therefore
  red the `packedImport` iteration without requiring nine separate source mutations.
- Expected foundation mutation: `selected 1 / failed 1`.
- Emission carrier: `packages/component-contracts/test/contracts.spec.ts`
- Emission selector:
  `pnpm --filter @oods/component-contracts exec vitest run test/contracts.spec.ts -t 'B-03 blocks emission eligibility independently for incomplete target evidence'`
- Emission mutation: weaken
  `packages/component-contracts/src/foundation-v1.ts::evaluateEmissionEligibility` so
  `publicDeclaration` is ignored and a target surface can be promoted without that evidence. The
  carrier itself removes each of the six frozen eligibility classes independently and asserts
  `emissionEligible:false` plus the exact one-item `incomplete` list. The representative production
  mutation must therefore red the `publicDeclaration` iteration without requiring six separate source
  mutations.
- Expected emission mutation: `selected 1 / failed 1`.
- Restore/rebuild/repin:
  `pnpm --filter @oods/component-contracts run build && pnpm --filter @oods/component-contracts exec vitest run test/contracts.spec.ts -t 'B-03 blocks foundation-v1 independently for each of the nine evidence classes|B-03 blocks emission eligibility independently for incomplete target evidence'`
- Evidence destinations: `artifacts/product-reality/sprint-182/gates/B-03/foundation/` and
  `artifacts/product-reality/sprint-182/gates/B-03/emission/`

### B-04 — Code Connect uses explicit story metadata, not prose

- Production seam: `cmos/scripts/refresh_structured_data.py::generate_code_connect_payload`
- Carrier:
  `cmos/tests/test_refresh_structured_data.py::RefreshStructuredDataTest::test_code_connect_requires_explicit_oods_component_id`
- Selector:
  `python3 -m unittest cmos.tests.test_refresh_structured_data.RefreshStructuredDataTest.test_code_connect_requires_explicit_oods_component_id`
- Mutation: remove only `parameters: { oodsComponentId: 'TagInput' }` from the carrier's positive
  Storybook meta fixture. Retain its `title`, `TagInput` prose/comment, and story export. The paired
  prose-only fixture remains unchanged. This must execute `generate_code_connect_payload`; a scenario
  object carrying an ID is not this seam.
- Expected: `selected 1 / failed 1`; the positive `components.TagInput` reference becomes empty while
  the prose-only fixture remains unlinked.
- Restore/rebuild/repin:
  `python3 -m compileall -q cmos/scripts/refresh_structured_data.py && python3 -m unittest cmos.tests.test_refresh_structured_data.RefreshStructuredDataTest.test_code_connect_requires_explicit_oods_component_id`
- Evidence destination: `artifacts/product-reality/sprint-182/gates/B-04/`

## M02 React carriers

The following literal files/selectors are part of the m02 delivery contract; m02 must create them
before claiming its gate. Their fixtures consume the shared scenario IDs from
`packages/component-contracts/src/scenarios.ts`.

### B-05 — exact React runtime and declaration surface

- Carrier: `packages/components-react/test/package-contract.spec.ts`
- Selector:
  `pnpm --filter @oods/components-react exec vitest run test/package-contract.spec.ts -t 'B-05 exports the exact React nucleus with public declarations'`
- Mutation: remove only the `Text` runtime re-export from `packages/components-react/src/index.ts`
  while leaving its implementation and the other 13 IDs intact. The carrier checks both the exact
  14-name runtime set and the emitted root declaration.
- Expected: `selected 1 / failed 1`; `Text` is the one missing runtime/declaration member.
- Restore/rebuild/repin:
  `pnpm --filter @oods/components-react run build && pnpm --filter @oods/components-react exec vitest run test/package-contract.spec.ts -t 'B-05 exports the exact React nucleus with public declarations'`
- Evidence destination: `artifacts/product-reality/sprint-182/gates/B-05/`

### B-06 — React field label/error association

- Carrier: `packages/components-react/test/accessibility.spec.tsx`
- Selector:
  `pnpm --filter @oods/components-react exec vitest run test/accessibility.spec.tsx -t 'B-06 preserves React field label and error associations'`
- Mutation: remove the invalid `Input` control's error ID from `aria-describedby` while retaining the
  visible label, error text, and `aria-invalid`. This prevents a visibility-only assertion from
  satisfying the bite.
- Expected: `selected 1 / failed 1`; the accessible description no longer contains the validation
  message.
- Restore/rebuild/repin:
  `pnpm --filter @oods/components-react run build && pnpm --filter @oods/components-react exec vitest run test/accessibility.spec.tsx -t 'B-06 preserves React field label and error associations'`
- Evidence destination: `artifacts/product-reality/sprint-182/gates/B-06/`

### B-07 — React Tabs keyboard behavior

- Carrier: `packages/components-react/test/interactions.spec.tsx`
- Selector:
  `pnpm --filter @oods/components-react exec vitest run test/interactions.spec.tsx -t 'B-07 moves React Tabs selection and focus with ArrowRight'`
- Mutation: remove only the `ArrowRight` branch from the React Tabs key handler; pointer activation and
  initial selection remain intact.
- Expected: `selected 1 / failed 1`; after `ArrowRight`, both selection and DOM focus remain on the
  first enabled tab instead of the next enabled tab.
- Restore/rebuild/repin:
  `pnpm --filter @oods/components-react run build && pnpm --filter @oods/components-react exec vitest run test/interactions.spec.tsx -t 'B-07 moves React Tabs selection and focus with ArrowRight'`
- Evidence destination: `artifacts/product-reality/sprint-182/gates/B-07/`

## M03 Vue carriers

The following literal files/selectors are part of the m03 delivery contract; m03 must create them
before claiming its gate. Vue tests may not import a React implementation.

### B-08 — exact Vue runtime and declaration surface

- Carrier: `packages/components-vue/test/package-contract.spec.ts`
- Selector:
  `pnpm --filter @oods/components-vue exec vitest run test/package-contract.spec.ts -t 'B-08 exports the exact Vue nucleus with public declarations'`
- Mutation: remove only the `Text` runtime re-export from `packages/components-vue/src/index.ts` while
  leaving its implementation and the other 13 IDs intact.
- Expected: `selected 1 / failed 1`; `Text` is the one missing runtime/declaration member.
- Restore/rebuild/repin:
  `pnpm --filter @oods/components-vue run build && pnpm --filter @oods/components-vue exec vitest run test/package-contract.spec.ts -t 'B-08 exports the exact Vue nucleus with public declarations'`
- Evidence destination: `artifacts/product-reality/sprint-182/gates/B-08/`

### B-09 — idiomatic Vue model/change emission

- Carrier: `packages/components-vue/test/interactions.spec.ts`
- Selector:
  `pnpm --filter @oods/components-vue exec vitest run test/interactions.spec.ts -t 'B-09 emits Vue update:modelValue and change for controlled fields'`
- Mutation: remove only `emit('update:modelValue', value)` from the Vue `Input` input handler while
  retaining the DOM update and `change` emission.
- Expected: `selected 1 / failed 1`; the wrapper records no `update:modelValue` payload although the
  other event still fires.
- Restore/rebuild/repin:
  `pnpm --filter @oods/components-vue run build && pnpm --filter @oods/components-vue exec vitest run test/interactions.spec.ts -t 'B-09 emits Vue update:modelValue and change for controlled fields'`
- Evidence destination: `artifacts/product-reality/sprint-182/gates/B-09/`

### B-10 — Vue Tabs keyboard behavior

- Carrier: `packages/components-vue/test/interactions.spec.ts`
- Selector:
  `pnpm --filter @oods/components-vue exec vitest run test/interactions.spec.ts -t 'B-10 moves Vue Tabs selection and focus with ArrowRight'`
- Mutation: remove only the `ArrowRight` branch from the Vue Tabs key handler; pointer activation and
  initial selection remain intact.
- Expected: `selected 1 / failed 1`; selection and DOM focus do not move to the next enabled tab.
- Restore/rebuild/repin:
  `pnpm --filter @oods/components-vue run build && pnpm --filter @oods/components-vue exec vitest run test/interactions.spec.ts -t 'B-10 moves Vue Tabs selection and focus with ArrowRight'`
- Evidence destination: `artifacts/product-reality/sprint-182/gates/B-10/`

## M04 generation and packed-consumer carriers

The m04 carrier paths below are locked now so implementation cannot choose a test after observing a
mutation. Clean-consumer tests must create their project outside the pnpm workspace, use a fresh empty
`node_modules`, install only submitted tarballs with an empty verifier-owned npm configuration, and
resolve neither a workspace symlink nor repository source.

### B-11 — typed target-capability preflight

- Carrier: `packages/mcp-server/src/tools/__tests__/code.generate.test.ts`
- Selector:
  `pnpm --filter @oods/mcp-server exec vitest run src/tools/__tests__/code.generate.test.ts -t 'B-11 returns exact OODS-N015 with no source for a known target that is not emission-eligible'`
- Mutation: in the target-capability preflight called by
  `packages/mcp-server/src/tools/code.generate.ts`, replace the `OODS-N015` early error with the former
  warning-only fallback and allow emitter execution.
- Expected: `selected 1 / failed 1`; any non-empty `code`, extension, import, warning, success status,
  or `meta.unknownComponents` entry violates memo §4.6. The exact affected-node error list and ordering
  remain asserted.
- Restore/rebuild/repin:
  `pnpm --filter @oods/mcp-server run build && pnpm --filter @oods/mcp-server exec vitest run src/tools/__tests__/code.generate.test.ts -t 'B-11 returns exact OODS-N015 with no source for a known target that is not emission-eligible'`
- Evidence destination: `artifacts/product-reality/sprint-182/gates/B-11/`

### B-12 — packed artifact/export is load-bearing

- Primary carrier: `packages/mcp-server/test/product-reality/packed-consumers.s182.spec.ts`
- Primary selector:
  `pnpm --filter @oods/mcp-server exec vitest run test/product-reality/packed-consumers.s182.spec.ts -t 'B-12 installs and imports every required tarball and root export in isolation'`
- Mutation: after the clean harness records its tarball set, omit the
  `@oods/components-react` tarball from the install operand. Run a separate leg deleting the packed
  manifest's `exports["."]` by deleting it from `packages/components-react/package.json` before
  packing; do not allow a repository path or workspace dependency as a replacement.
- Expected per leg: `selected 1 / failed 1`; install/import cannot complete.
- Supporting package verifier for the missing-root-export leg:
  `node scripts/product-reality/verify-package-foundations.mjs --artifact-root artifacts/product-reality/sprint-182/gates/B-12/missing-root-export/verifier-red`
  selects four package foundations and must report `selected 4 / failed 1 / skipped 0` in
  `artifacts/product-reality/sprint-182/gates/B-12/missing-root-export/verifier-red/package-foundations/report.json`.
- Restore/rebuild/repin:
  `node scripts/product-reality/verify-package-foundations.mjs --artifact-root artifacts/product-reality/sprint-182/gates/B-12/verifier-green && pnpm --filter @oods/mcp-server exec vitest run test/product-reality/packed-consumers.s182.spec.ts -t 'B-12 installs and imports every required tarball and root export in isolation'`
- Evidence destinations: `artifacts/product-reality/sprint-182/gates/B-12/missing-tarball/` and
  `artifacts/product-reality/sprint-182/gates/B-12/missing-root-export/`

### B-13 — declared dependency and CSS entry are load-bearing

- Primary carrier: `packages/mcp-server/test/product-reality/packed-consumers.s182.spec.ts`
- Primary selector:
  `pnpm --filter @oods/mcp-server exec vitest run test/product-reality/packed-consumers.s182.spec.ts -t 'B-13 resolves declared dependencies and shared CSS in a clean production build'`
- Mutations, run and restore separately: (a) delete
  `dependencies["@oods/component-styles"]` from `packages/components-react/package.json` before
  packing while retaining the emitted bare import; (b) delete `exports["./css"]` from
  `packages/component-styles/package.json` before packing while retaining the generated consumer CSS
  import. An external export target such as
  `"@oods/component-styles/css"` is also invalid because Node package export targets must be
  `./`-relative.
- Expected per leg: `selected 1 / failed 1`; the fresh production build or CSS resolution fails.
- Supporting package verifier, once per mutation:
  `node scripts/product-reality/verify-package-foundations.mjs --artifact-root artifacts/product-reality/sprint-182/gates/B-13/missing-dependency/verifier-red`
  and
  `node scripts/product-reality/verify-package-foundations.mjs --artifact-root artifacts/product-reality/sprint-182/gates/B-13/missing-css-export/verifier-red`.
  Each run selects four package foundations and must report `selected 4 / failed 1 / skipped 0` plus
  `missingRequiredDependencies`/`undeclaredBareImports` for the dependency leg or
  `missingRequiredExports` for the CSS leg. An external CSS target must instead appear under
  `invalidExportTargets`.
- Restore/rebuild/repin:
  `node scripts/product-reality/verify-package-foundations.mjs --artifact-root artifacts/product-reality/sprint-182/gates/B-13/verifier-green && pnpm --filter @oods/mcp-server exec vitest run test/product-reality/packed-consumers.s182.spec.ts -t 'B-13 resolves declared dependencies and shared CSS in a clean production build'`
- Evidence destinations: `artifacts/product-reality/sprint-182/gates/B-13/missing-dependency/` and
  `artifacts/product-reality/sprint-182/gates/B-13/missing-css-export/`

### B-14 — governed generation is byte/digest deterministic

- Carrier: `packages/mcp-server/src/tools/__tests__/code.generate.test.ts`
- Selector:
  `pnpm --filter @oods/mcp-server exec vitest run src/tools/__tests__/code.generate.test.ts -t 'B-14 emits byte-identical governed source and evidence on repeated runs'`
- Mutation: add an invocation-varying value to one governed React or Vue emission (for example a
  timestamp in emitted source or unsorted capability iteration in evidence metadata) without changing
  the input. The carrier performs independent repeated React and Vue calls and compares source bytes
  and canonical evidence digests.
- Expected: `selected 1 / failed 1`; at least one same-input byte/digest pair differs.
- Restore/rebuild/repin:
  `pnpm --filter @oods/mcp-server run build && pnpm --filter @oods/mcp-server exec vitest run src/tools/__tests__/code.generate.test.ts -t 'B-14 emits byte-identical governed source and evidence on repeated runs'`
- Evidence destination: `artifacts/product-reality/sprint-182/gates/B-14/`

### B-15 — `pipeline` propagates the codegen-stage typed error

- Carrier: `packages/mcp-server/src/tools/__tests__/pipeline.test.ts`
- Selector:
  `pnpm --filter @oods/mcp-server exec vitest run src/tools/__tests__/pipeline.test.ts -t 'B-15 propagates OODS-N015 as a codegen-stage error without a successful payload'`
- Mutation: in `packages/mcp-server/src/tools/pipeline.ts`, swallow a codegen result whose status is
  `error`/first issue is `OODS-N015`, continue as success, and attach or retain a code payload.
- Expected: `selected 1 / failed 1`; the carrier requires `error.step: "codegen"`, code
  `OODS-N015`, the message from the codegen issue, no successful `code` payload, and a `pipeline.steps`
  sequence ending at `codegen`.
- Restore/rebuild/repin:
  `pnpm --filter @oods/mcp-server run build && pnpm --filter @oods/mcp-server exec vitest run src/tools/__tests__/pipeline.test.ts -t 'B-15 propagates OODS-N015 as a codegen-stage error without a successful payload'`
- Evidence destination: `artifacts/product-reality/sprint-182/gates/B-15/`

## Closeout integrity checks

Before independent review, verify that all 15 top-level evidence directories exist, B-01 contains
both drop and duplicate legs, B-03 contains its representative foundation and emission legs, each
B-12 contains its missing-tarball and missing-root-export legs, B-13 contains its missing-dependency
and missing-CSS-export legs, each receipt records the literal selector above, and every mutation has
both an observed RED and restored GREEN. Re-run the package verifier into a new destination:

`node scripts/product-reality/verify-package-foundations.mjs --artifact-root artifacts/product-reality/sprint-182/m05/final-package-verification`

Its final report must say `selected 4 / passed 4 / failed 0 / skipped 0`; both tarballs for each
package must have identical SHA-256 and inventory SHA-256 values; all protocol, source-path,
undeclared-import, export, and dependency finding arrays must be empty. Any absent carrier, selector
selecting zero tests, non-discriminating mutation, skipped selected test, or overwritten evidence
directory is a closeout finding rather than a pass.
