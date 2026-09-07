# s187-m01 — binding repairs and authentic fresh inputs

Build worktree: `/Users/systemsystems/.codex/worktrees/s187/OODS-Forge`.
Canonical CMOS projectRoot: `/Users/systemsystems/portfolio/Design-Tools/OODS-Forge`.
Implementation started at `0273e2e82eea68cf64c732907f172192efc75c90` (planning head); the live-generation receipts retain the exact source diff alongside its SHA-256, the unchanged composer result, generated artifact and source hashes. Exact runtime tarballs and their inventories are retained per attempt. Mission close commit is recorded in CMOS.

**Verified runtime result:** `live-attempt-4/report.json` records 10 cells, 78 passed gates, 2 N/A interaction gates (Transaction/timeline has no interactive controls), zero failures and zero skips. Browser receipts verify current status, numeric zero, boolean false as No, and both numeric local editors updating to 7 and back to 0 in each framework.

## Measured generation

`before-census.json` reproduces the immutable planning baseline: 27/66 schemas, 58/132 cells, 50 governed IDs. `final-census.json` measures 36/66 schemas, 72/132 cells after rebuilding the server. Membership is unchanged (11 objects × 6 contexts), and all nine binding-defect schemas generate in both frameworks. Every remaining failing schema has an ungoverned component from the locked later-mission slate. This is generation evidence only.

Repairs:

- Default field wiring stops synthesizing unsupported `StatusTimeline.label`; `status` and `historyField` remain bound.
- An unconfigured Select bound to a continuous number becomes `Input type=number`, with the same field and a generated local change binding. Authored options and enum choices remain Selects. Numeric updates are local editor state, not application filtering.
- Boolean Text explicitly renders Yes/No in both targets; nullish optional values remain empty. Validation accepts this implemented lowering.
- The typed-data regression exposed Vue form refs ignoring supplied values. Form props now accept optional initial data and seed refs using nullish fallback, retaining zero/false and no-props defaults. This is a public initialization behavior change for saved and fresh form output (CMOS #1791).

## Fresh harness invocation

```sh
pnpm exec tsx scripts/product-reality/s185-m04-live-consumers.ts \
  --mission s187-m01 \
  --fresh User/detail,Product/detail,Usage/list,Subscription/inline,Transaction/timeline \
  --output artifacts/product-reality/sprint-187/m01/live-attempt-4
```

`--fresh` accepts distinct public Object/context operands only, and cannot be combined with `--schemas` or `--store`. The runner invokes `design.compose` with exactly `{object, context}`, passes its unmodified schema to generation, and retains `composition.json`, `artifact.json`, generated source, source identity/diff and exact tarball hashes. Legacy saved-store operation remains supported and was exercised by `live-workflow-consumers.s184.spec.ts`: four cells, all 32 gates passed.

The fresh runtime viewport is explicitly 1920×1080 with a 112rem consumer container. The legacy saved mode stays at 1280×800 with its existing 72rem container. This is a desktop consumer proof, not responsive/overflow maturity evidence. No validation or hydration invariants were relaxed.

## Tests and retained attempts

- `server-build-final.log`: server TypeScript build passed.
- `harness-typecheck-verified.log`: strict TypeScript check of the consumer CLI and dependency closure.
- `fresh-input-compatibility-verified.log`: rerun the 14 fresh-input tests after adding API mixed-mode rejection and omitted-initial-data checks for Vue form mode. The earlier `fresh-input-compatibility-final.log` is a retained failed attempt: its no-props test incorrectly included list-mode output, whose public fields remain required.
- `focused-tests-final.log`: 17 files, 320 tests passed, no skips. Includes the codegen suite, field wiring, form differentiation, binding analysis/state branches, typed fresh data and B2 compatibility.
- `focused-tests-attempt-1.log`: retained 3 failures (two missing test cache directories; historical current-replay expectation needed its measured positive delta), with the saved-store 4-cell consumer test passing.
- `focused-tests-attempt-2.log`: retained Vue nonzero-input failure (7 rendered as 0), 63 passes.
- `typed-data-tests-attempt-3.log`: typed runtime values passed; two string expectations still pinned old Vue default-only ref initialization. Updated these expectations and verified in the final 320-test run.
- `harness-typecheck-attempt-1.log`: widened fresh-name union exposed a CLI includes-type mismatch; corrected and rechecked.
- `live-attempt-1`: first consumer reached mount; new value assertion used different capitalization from the existing status renderer. Corrected the assertion; no runtime capitalization changed.
- `live-attempt-2`: first consumer reached hydration with matching visible value and no runtime errors, but 1280px triggers the existing Tabs overflow layout effect, removing two tab buttons after attachment. Retained the failure and set an explicit wide desktop viewport (CMOS #1792).

- `live-attempt-3`: viewport-only change still overflowed because the consumer wrapper capped width at 72rem. The final fresh scaffold uses 112rem (learning #511).

## Legacy B2, separately identified

```sh
node scripts/product-reality/s185-b2-legacy-inputs.mjs "$PWD" \
  artifacts/product-reality/sprint-187/m01/legacy-b2 s187-m01
```

`legacy-b2/measurement.json` retains the exact historical operands and input hashes. The unchanged `pipeline({object:"Product",context:"detail",framework})` request now returns code for React and Vue; HTML retains OODS-V007 for nested Tabs content. Other B2 operands retain their negative outcomes. The disposable saved store stayed empty. Frozen s184/s185/s186 records and the original User-form corpus were not rewritten. Fresh Product/detail is separately represented by the default-composition census and live-consumer record.

No full four-suite capture was run in m01. Sprint certification, deployment and shared-store adoption remain separate.
