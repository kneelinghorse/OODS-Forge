# s156 m07 — `examples/viz/before-after` conformance residual

**Status:** DEFERRED (Derek-ratified 2026-07-20, AskUserQuestion — "scope the keystone gate to the canonical corpus + log residual"). NOT swept silently.

## What

The s156 m07 keystone anti-rot gate ([examples-conformance.spec.ts](../../packages/viz-core/test/examples-conformance.spec.ts)) validates the **canonical** example corpus — `examples/viz/patterns-v2` (21) + `examples/viz/patterns` (11), all 32 valid after m03/m04/m05 — against the live `assertNormalizedVizSpec`, plus a byte-identity assert on both dual-maintained schema pairs.

`examples/viz/before-after` is **deliberately excluded**. Its 5 fixtures fail `assertNormalizedVizSpec` on **pre-existing v1-schema rot** unrelated to this sprint (the memo's grounding, `wf_985d8538-d66`, only enumerated the 6 patterns-v2 failures). The 6th before-after fixture (1 of 6) validates.

## The 5 rotted fixtures + their defects

| Fixture | Defects (AJV path → keyword) |
|---|---|
| `before-after/accessibility-tighten/after.spec.json` | missing top-level `encoding`; `/marks/0/encodings/color` extra prop `scheme` (should be `scale:"diverging"`, now valid after m04); `/interactions/0/select/on` is an array `["hover","focus"]` (must be a string) |
| `before-after/accessibility-tighten/before.spec.json` | `/marks/0/encodings/color` extra prop `scheme` |
| `before-after/facet-small-multiples/after.spec.json` | `/interactions/0/select` malformed (array `on`, missing `encodings`, `type` enum) |
| `before-after/renderer-density-upgrade/after.spec.json` | missing top-level `encoding`; top-level extra prop; `/interactions/0/select` malformed |
| `before-after/renderer-density-upgrade/before.spec.json` | missing top-level `encoding`; top-level extra prop; `/interactions/0/select` malformed |

## Why deferred (not fixed in m07)

- Pre-existing rot outside the sprint's grounded scope (m07 is an `[S]` gate mission, not a fixture-repair mission).
- The before-after fixtures are **referenced by no test or code** (verified) — zero live-consumer risk from leaving them.
- They are before/after DEMO pairs; a structural rewrite risks altering the demonstrated contrast. A dedicated cleanup can fix them (the defects are the SAME classes m03/m05 already fixed for patterns-v2: add top-level `encoding`, `color.scheme`→`color.scale:"diverging"`, `select.on` array→string, interval-select `fields`→`encodings`) and then widen the m07 glob to `examples/viz/**`.

## Reactivation

A follow-up mission fixes the 5 fixtures, then changes `CANONICAL_GLOBS` in `examples-conformance.spec.ts` to `examples/viz/**/*.spec.json` and drops this residual.
