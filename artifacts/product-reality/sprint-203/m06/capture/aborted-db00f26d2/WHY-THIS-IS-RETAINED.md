# Retained: an aborted capture, not a receipt

This directory holds the five-suite capture the previous session started at `db00f26d2` and never
finished. **It is not a capture receipt and no count in it is claimed anywhere.** It is retained
because it found a real defect.

## Why it is not a receipt

- It ran through `run-capture.sh`, a bespoke script written for that session, not through
  `capture-s185-m01-baseline.mjs` — so it has no cleanliness checkpoints, no setup receipts, no
  host block and no `four-suite-baseline.json` for `s200-capture-accounting.mjs` to read.
- It was **interrupted**. Two suites finished before the session ended (`viz-core` exit 0,
  `viz-render` exit 0); the process kept running unattended, `mcp-server` finished exit 1, and
  `root-core` was still running when the next session killed it. `component-packages` never ran.
- Its `mcp-server` run **straddled a source edit**. The next session bound the tool ledger in mode
  `s203` while that suite was still executing, which is why
  `tool-truth.s193.spec.ts` appears failed in `mcp-server.vitest.json`. That failure is an artifact
  of the overlap, not a defect: the spec passes at the capture head.

## Why it is retained

Its second `mcp-server` failure was real and is fixed at the capture head:

`release-readiness.s196.spec.ts` — "checks generated JSON and the marked facts block" — failed with
`Generated release readiness drift: cmos/planning/forge-gate2-decision-packet.md`. The Sprint 203
pre-freeze regenerated the Gate 2 packet with an explicit
`--facts artifacts/product-reality/sprint-203/readiness/release-readiness-facts.json`, so part A's
`--check` passed, but `FACTS_PATH` in `scripts/product-reality/s196-release-readiness.ts` still
named `sprint-202`. The only caller of the default is this spec, which part A does not run.
`FACTS_PATH` now names `sprint-203` and the spec is green.

The five-suite capture that *is* the receipt is `../forge-s203-m06-head/`.
