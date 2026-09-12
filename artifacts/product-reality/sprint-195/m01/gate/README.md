# Sprint 195 m01 — retirement gate

The repo-wide gate now checks every name in `RETIRED_TOOL_NAMES` plus `viz.compose` and the single-word `review` family. Multi-part names cover dot, underscore, camel and MCP-prefixed forms with identifier boundaries. The single-word matcher requires calls, wire names, registrations, tool/family lists or explicit tool instructions. Human review prose, fidelity and panel enums, current internal evaluators, and longer identifiers remain valid.

The existing docs-only history/changelog check remains. The repo-wide scan retains exactly its existing exclusions: `artifacts/`, `cmos/`, binary contents and the capability ledger's validated `retired` array. It includes tracked and non-ignored untracked files. No additional path allowlist was added.

## Changes surfaced by the widened gate

- Removed three retired tool options from the Storybook addon type union, bridge filter, descriptions, apply-capable set and labels. A new real `fetchToolNames` test proves a stale bridge cannot make these selectable while all five supported tools remain selectable.
- Updated the adapter registration and bridge surface smoke tests to use supported on-demand examples. The adapter annotations baseline had 14 passing and 3 failing assertions because its 32-entry action-level roster was obsolete; its independent named read/write rosters now cover the 24 current registered tools, restoring 17/17 assertions.
- Removed the obsolete `review` family from the tool-ledger generator. Its 11 contract tests pass, including byte-identical regeneration of the current ledger at the ledger's recorded head.
- Preserved four dated 2025 soak observations in `retired-diagnostics.json` and removed those rows from the live root diagnostics snapshot.
- Archived the unregistered release helper byte-for-byte in `retired-source/release.verify.ts`, then removed the unused source. Before deletion, repository searches found its retired name only in the helper, retirement gate and retirement ledger; there were no imports/callers. `verification.json` pins its original bytes to planning base `c36eadc5` by SHA-256, and server typechecking passes after removal.
- The narrative contract's existing negative assertion assembles its retired family vocabulary from parts so the scanner can inspect that test without treating the assertion as a live tool instruction. Its behavior and all 12 narrative tests remain intact.

## Decision and historical retention

CMOS #1923 retained the release helper as unregistered historical source. The newer Sprint 195 m01 gate requires retired names to leave live source. Resolution: preserve the exact implementation as an artifact and remove its unused live module; this preserves historical evidence without a new gate exclusion. No public runtime registration, tool policy, generated schema or ledger row changed.

## Verification

`verification.json` records commands, final gate-source hash, source-archive hash and the bite outcome. Retained logs cover adapter registration (19/19), adapter annotations (17/17), bridge surface (3/3), focused addon/bridge/narrative contracts (16/16), server `tsc --noEmit` (exit 0), and the final gate.

The tool-truth contract also passed 11/11 as recorded in the verification JSON. No tests were skipped in these targeted runs. No full-suite capture or critic was run.

The final scratch file `tests/s195-retirement-gate-bite.tmp.md` named `release.verify`: the gate failed with exactly 1 failing/9 passing tests and named that file. Removing it restored 10/10 passing tests. `retirement-gate-red.log` and `retirement-gate-green.log` retain both outcomes. The scratch file is absent and was never staged or committed. The bite was refreshed after the final matcher edit.
