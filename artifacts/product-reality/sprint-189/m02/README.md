# s189-m02 — browser render leg

The loop is implemented at `36a3a31e` over the unchanged Sprint 188 runtime. Test handling landed first at `c0c886b8`. [Usage](../../../../scripts/design-loop/README.md), [computed verification](verification.json), [executable verifier](verify-before.ts).

## Test handling before capture

Decision #1833 is implemented: the five git-range/census specs leave root-core, remain in the serial MCP-server suite and root test:coverage tail, and have explicit 60-second test budgets. [Root collection](test-handling/root-core-list.json) lists 6,180 tests and none of the five specs. [Native execution](test-handling/native-five.json) passes 70/70 with no skips: archive-workflow 2, fresh-composition 29, public-head-equivalence 21, sprint-wide-movers 7, workflow 11. The mover file took 4.38 seconds. [Per-file accounting inputs](test-handling/suite-accounting-inputs.json) attribute the root-core delta of −70 to the exact configuration commit; the new loop test file adds nine tests separately. The initial pnpm test shorthand rejected --outputFile before execution; the retained native command uses pnpm run test. No suite recapture or full-suite capture occurred.

[Focused loop tests](focused-tests.log): 9/9, no skips, covering receipt validation, changed observations/errors/source files, unchanged comparisons, output/symlink guards, unmodified React/Vue artifact mounting, workflow ownership, stopped-server behavior and diff artifacts. [Targeted TypeScript check](typecheck.log) exits 0 with no diagnostics (`tsc --noEmit --module esnext --moduleResolution bundler --target es2022 --strict --esModuleInterop --skipLibCheck --resolveJsonModule scripts/design-loop/*.ts`).

## Persistent consumers and BEFORE evidence

[Serve status](serve-status.json) records a cold startup of 30.97 seconds, controller 4477 and React/Vue 4478/4479, with the same PID/consumer roots across renders. [Package inventory](submitted-packages/inventory.json), exact tarballs, pack logs and both install receipts are retained. Each consumer installs four applicable packages from the five-package submission; all versions/hashes and isolation assertions are in status. Node modules are outside the workspace, with empty npmrc files, scripts disabled, no aliases, workspace symlinks or repository imports.

[BEFORE executions](before-executions.json): 18 receipts / 54 screenshots (three widths × two frameworks × nine observations). The five public compose contexts list/detail/form/timeline/workflow are rendered directly; four additional `review-*` observations render the workflow after public edit/cancel steps. Decision #1835 records why these must be distinguished: the original review ran the Sprint 188 flow before screenshots, producing the `1999` amount and two-entry history. [Inputs](inputs/review-timeline.json) retain every browser interaction; schemas and generated artifacts are unchanged.

The [verification mapping](verification.json) checks all three widths in both frameworks:

- review-list: two searchboxes, React `No items` / Vue `1 / 0`, and Filter/Open row/Sort buttons.
- review-timeline: four empty Card roots in region measurements and bare `1999` accessibility text. Empty Cards are absent from the native accessibility tree; the separate region measurements preserve that evidence.
- review-form: all nine generic composed controls have sentence labels ending in a period (React required markers are retained), and both Save and Submit remain. Recipe controls and the App's plan-name input are separately observable.
- review-detail: `No events`, two populated status-history entries and literal `false` under Archive Summary.

Each receipt is AJV-validated and binds screenshots and text dumps to schema/artifact/file hashes, deterministic en-US/UTC time, layout/glyph measurements, visible region text, input values, console/page errors and timings. All 54 screenshot hashes are independently rechecked. All 17 live saved-store hashes remain unchanged.

## Warm render and mutation

Warm render costs approximately 1.04 seconds for React and 0.94 seconds for Vue including compose/generate/capture. [Warm diffs](diffs/warm/react/diff.json) and [restoration diffs](diffs/restored/react/diff.json) have zero differences in both frameworks: schema hash, artifact hash, accessibility, input values, measurements, region text and errors match. Timings, output locations and source identity metadata are not claimed byte-identical.

The public [mutation input](inputs/mutation.json) overrides `toolbar-actions` with Stack. Both diffs detect changed schema/artifact/file hashes and toolbar observations; BillingSummaryBadge is absent, while list-items, pagination and the accessibility suffix remain identical. The composer also reassigns the generic toolbar field and increments two sequential row-node IDs; these are actual public output, not schema edits. The [React diff](diffs/mutation/react/diff.md) and [Vue diff](diffs/mutation/vue/diff.md) name the toolbar. The valid mutation was followed by the restored render and a fresh zero-difference check.

An initial override used the nonexistent slot `toolbar` and produced no change; the zero diff correctly exposed that ineffective mutation. That attempt is retained under development-failures/mutation-unrecognized-slot. No composer behavior was changed to make the bite pass.

## Observed limitations and corrections

The React development workflow emits two nested-form console errors during edit/cancel: the App form contains CancellationForm's form. All four React review-state receipts retain these errors; Vue emits none. This is the unchanged runtime's defect, captured as CMOS learning #536 for m04, not suppressed or claimed fixed.

Development failures are retained separately: Vite needed real consumer paths on macOS; the standalone React mount needed its named GeneratedUI export and required action operands; a tsx-injected function-name helper had to be removed from browser evaluation. Final renders and focused checks pass. Standalone required callbacks observe action events; only workflow artifacts claim generated store/action behavior. No consumer-authored workflow components or wiring were added.

No public runtime code, saved schema or structured-data artifact changed in m02. The independent reviewer retains the usability decision. Sprint 189 remains Active.
