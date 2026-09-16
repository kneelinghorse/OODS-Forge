# Sprint 203 m06 handoff — what is done, what is left

Worktree `~/.codex/worktrees/s203/OODS-Forge`, branch `codex/sprint-203-objects-and-context`.
HEAD `db00f26d2`. Base `a5d1ba084`. builderSelfCertified: **false**.

## Done and committed (m01–m05, and most of m06)

m01 carries · m02 CMOS objects · m03 Hive objects · m04 craft · m05 context — all complete with
receipts under `artifacts/product-reality/sprint-203/m0{1..5}/` and CMOS decisions recorded.

m06 so far:
- **Root sweep** for stranded pins: 5 found, all fixed.
- **Runtime sweep**, the one deferred through m02–m04: roster 18 → 23 objects, **240 → 310 cells,
  310 pass, 0 typed gaps**, pinned Linux container. First run went red on 4 (2 real, 2 npm flakes) and
  is retained at `m06/runtime-red-1/` with `WHY-THIS-IS-RETAINED.md`.
- **A real defect found by that sweep and fixed**: m02 widened the Stack contract to admit a
  `DateRange` pattern group without widening the lowering, so the generated React artifact emitted
  `<Stack patternComponent fields>` and failed strict typecheck. `composition-directives.ts` now
  consumes directives for every pattern group. Nothing else in the repo runs that gate.
- **Pre-freeze part A**: 27 gates, all exit 0 (`m06/pre-freeze/part-a-status.txt`).
- **viz:gate**: 11/11 exit 0, receipts at `artifacts/product-reality/sprint-203/gate/`. The gate's
  receipt path was hardcoded to the sealed sprint-202 and is now a named constant.
- **Part B2**: archive assembled clean at `cd7e76a2e`, sha256
  `9d7d73d581d83d8124e85374c4075c0bbbef28675c6929ae99c1003417f851fd`; **E2E pass, 19 tools, 42 calls,
  0 typed limits**; **pinned Linux container proof pass** on linux-arm64.
- **near.md**: row E and the Sprint 203 section moved to **BUILT, REVIEW PENDING 2026-09-16**; the 136
  closeout-reader assertions pass; the retained record below the divider is byte-identical.
- **Golden ledger**: 138 entries, `check` verified, sprint-195…202 sealed receipts byte-identical.

## Left to do

1. **Finish the five-suite capture.** Script: `artifacts/product-reality/sprint-203/m06/capture/run-capture.sh`.
   It was interrupted after two suites: `viz-core` exit 0, `viz-render` exit 0; `mcp-server`,
   `root-core` and `component-packages` did not run. Re-run the whole script from a clean tree — it
   writes `status.txt` and one `<suite>.vitest.json` per suite under
   `capture/forge-s203-m06-head/run-1/`. Each suite must run alone (root-core goes red under parallel
   scheduling, policy `#1833`).
2. **Head accounting**: write `capture/head-accounting.json` in the Sprint 202 shape — five counts
   stated separately (passed assertions, failed assertions, skipped, failed files, uncollected) from
   the raw vitest JSON, per suite and in total, with the measured head.
3. **Censuses**: runtime roster (23 objects / 310 cells, 70 added attributed), components (110), viz
   (unmoved — no chart work this sprint), the bundle closure and archive size, the app resource size,
   and the **tool ledger re-bound in mode `s203`** to the frozen bundle's E2E receipt. Note: the tool
   ledger is currently bound in mode `s202`; `s193-tool-truth.mjs` needs an `s203` entry in
   `PORTABLE_RECEIPT_PATHS` and `PORTABLE_TYPED_CODES` pointing at
   `artifacts/product-reality/sprint-203/m06/pre-freeze/e2e-host.json`.
4. **m06 receipt**: `artifacts/product-reality/sprint-203/m06/README.md` in the Sprint 202 shape —
   heads table, the pre-freeze pass, the capture, the censuses, the carries.
5. **Push and PR** against `OODS-pro`, `builderSelfCertified: false`, carries named.
6. **Complete `s203-m06` in CMOS.**

## Carries for the Sprint 204 m01

- `Decision/card` is **not certified usable**: a CMOS decision has no title, so the card shows a raw
  date and a badge and nothing about the decision.
- Three defects measured in m04 and deliberately left, each because the fix disturbs a screen an
  earlier sprint certified: the empty `Card` body under every card header (all 23 objects; the
  placeholder is the slot `componentOverrides` and slot swaps target), the raw stored date in
  slot-bound text (formatting pulls `@oods/component-contracts` into artifacts that declare no such
  dependency), and the `Allowed transitions: None recorded` row on every `Stateful` detail (the fix
  reshapes Subscription's already-certified tabs).
- `traits/visual/Statusable.trait.yaml` authors `Badge` with a `statusField` directive the canonical
  Badge contract refuses; no object composes it, so it sits unexercised.
- Derek's Claude Desktop and Cursor runs remain his and are not claimed.
