# Sprint 179 M05 — certify wiring and advertised move

Date: 2026-08-28  
Mission: `s179-m05`  
Review session: `PS-2026-08-29-005`  
Base: `1be93f8`  
Commit: none; the sprint commit boundary remains Derek-owned.

## Outcome

`artifact.certify` now renders the exact retained ECharts projection when the optional
operand is present. The first normalized SVG supplies the render hash and contrast
evidence. A separately emitted second projection is rendered independently, and
`stable` is the conjunction of projected-option equality and normalized-SVG equality.
`contentHash` remains projected-option identity.

All eight standard operand fixtures carry stable `renderHash` values. The five
categorical families grade rendered Role-C carriers and the semantic N-long Role-A
assignment. The three geo families retain render evidence but remain contrast-exempt;
their notes explicitly make no canvas-ratio claim. Bubble maps without inline geometry
remain option-only with an explicit no-server-map note.

The first-render fault path is typed and honest: the response remains
`status:'ok'`/`coverage:'uncertified'`, preserves the option hash plus a11y/accuracy
evidence, reports determinism fail and contrast ungradeable, and omits `renderHash`.
A second-render difference or fault retains the first hash and makes `stable:false`.

The nested default sunburst remains a pinned honest Role-C failure: `#809DE5` measures
`2.6018134537251476:1` against `#FCFCFD`; no colour bytes moved.

## Compatibility and advertised surfaces

- ECharts `{spec}`-only responses remain byte-identical to the `1be93f8` fixture and
  retain the baked-palette fallback caveat.
- The D11 caveat pin now names its path-scoped purpose: legacy spec-only fallback bytes
  stay frozen while operand-backed responses name normalized render evidence.
- The obsolete option-only force-physics limitation was removed. Force option and render
  stability are both proved inside the deterministic isolated renderer.
- `artifact.certify` input/output schemas, generated types, adapter description, bridge
  policy, and generated API docs describe `contentHash`, first-render `renderHash`, typed
  faults, geo exemption, and the certified-runtime-matrix boundary.
- Review found that the pre-existing input-schema brand rationale became false once
  ECharts carrier evidence landed. It was corrected within the already-declared certify
  advertised class: categorical paints are compared to the light canvas; geo evidence is
  read but remains exempt. No schema shape changed.
- One advertised regeneration workflow ran. Review corrections were then synchronized
  directly across source and generated artifacts without a second regeneration;
  `generate:check` and the API idempotence contract prove final parity.
- Rider r1 qualifies every advertised RFC 6902 reference as the supported
  `add`/`remove`/`replace` subset; the enum did not widen.
- Rider r2 returns an authored `dashboard.render` `tokenCssRef` exactly and retains
  `tokens.build` as the absent-input default. The root/viz dashboard schema parity pair
  stayed untouched.

## Verification

- Certify/M04/advertised focused gate: 20 files, 428 tests passed.
- Final root-owned integration gate: 11 files, 133 tests passed.
- Full MCP suite: 222 files passed, 1 pre-existing file skipped; 4,423 tests passed,
  16 pre-existing tests skipped; zero M05 skips and zero failures.
- `@oods/viz-render` build: passed.
- `@oods/mcp-server` build: passed.
- Schema generation check: passed.
- API docs regeneration-idempotence contract: passed.
- Advertised retired-phrase grep: zero matches.
- `git diff --check`: passed.

## Physical bites

Each controlled mutant reddened its intended carrier and was restored:

- second render reused `firstProjected` instead of the independently emitted projection;
- first-render fault incorrectly emitted a `renderHash`;
- option stability was removed from the final conjunction;
- one RFC 6902 description lost the subset qualification;
- `dashboard.render` reverted to the hard-coded token reference;
- Role C and Role A were collapsed;
- the N-long Role-A assignment was deduplicated/capped.

No commit was created, no capture/story corpus moved, and the two unrelated deleted CMOS
snapshot files were preserved as user-owned worktree state.
