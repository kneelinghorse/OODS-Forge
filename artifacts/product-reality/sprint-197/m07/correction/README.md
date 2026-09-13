# Corrective closeout preparation

The first clean five-suite run at `c5246c3f721ea49761e4a5c5eecbbd4df0b10279` retained 15 root-core assertion failures. Viz-core 1511/1511, viz-render 69/69, MCP 6884 passed plus 16 optional-fixture skips, and component packages 1436/1436 were green. The root suite had 7205 passed, 15 failed, and 16 of the same optional-fixture skips. Its original capture is preserved under `five-suite-closeout-attempt-1` at final close.

Corrections leave palette/product source values unchanged:

- Add the existing locked esbuild 0.25.10 to root devDependencies; supply diagnostic token labels and an explicit screenshot-row type.
- Lint all DTCG roots (tokens, presets, standalone viz JSON) while seed metadata stays under the palette generator's schema validation. The linter accepts explicit JSON files. A mutation test confirms invalid DTCG still fails in every root.
- Reconcile 12 omitted light/dark focus source pins. All 41 names and six HC pins stay fixed. The browser still performs 264 paint assertions and nine cross-brand relationships; primary ring differs, shared neutral/accent and HC roles agree. Mutations exercise all nine relationships.
- Update the receipt canvas pin and the independently derived 964-token/896-mobile-constant/632-color-and-duration counts (+48 colors, unchanged deferrals). Historical out-of-gamut colors now enter an isolated copy of the unmodified production token builder; emitted Swift/Kotlin must map, never clip.
- Seed cross-brand contamination with a primary role, retain all declared 26 viz overlay color names while rejecting unrelated shared shadows, and exclude exactly the committed pre-palette CSS copy from the live specificity census. Existing parser and seeded-cascade failures remain discriminating.
- Replay Sprint195's retained grades and exhaustive hue search without running its obsolete live-source migration against Sprint197 or overwriting historical receipts. Pin the current roadmap authority while preserving its historical record.

The original m05 31-file attribution is untouched. The final inventory adds four late contract files (focus fixture, design-loop canvas, mobile counts, narrative counts), all named in `before.json` before editing; focus token-by-token attribution is in `focus-contract.before.json`. There is no new pixel/golden capture or product palette change.

`closeout-preflight.mjs` exercised both complete report consumers with real runtime/theme/viz/store/mission receipts. Its final accounting, CI and review-head metadata were explicitly synthetic unit-test boundaries: no generated claims were written or presented as evidence. The actual producer and independent actual-output audit must still pass after the final capture. Raw first targeted failures and their corrected follow-up are retained.
