# s197-m02 — reference and light palette checkpoint

The reference and Brand A/B light work is implemented and verified. The user
approved scoped gates ("yes, use scoped gates"): m02 requires reference/light gates;
m03 requires its dark/shell gates; full token validation is required after m04.
`gate-resolution.json` records completion under that approval. The earlier blocked
checkpoint and its actual full-validator failures remain retained as history.

The sole palette authoring input remains `packages/tokens/src/palette/seeds.json`:
Brand A primary hue 43, accent 305, neutral 265; status hues 245/155/85/25/285;
Brand B inherits the method with primary hue 210. The generator now gives neutral
light-end steps a subtle chroma floor and keeps primary default/hover/pressed
reference lightness at 0.55/0.45/0.41. Every existing reference step is retained;
full ladders are generated. All three reference files and both brand base files
were produced by `generate-palette.ts --only reference,light`. Theme0 aliases and
dark/HC source files remain untouched. No generated JSON was hand-edited.

## Verification

- All reference/light CSV coherence checks pass; full reports in `color-guardrails.json`.
- The existing full `tokens-validate` command exits 1: 75 remaining color failures
  are all dark (5 family-hue, 30 gamut, 40 missing chart overrides).
- The separately run viz validator retains 53 failures for the chart work in m04.
  Its dark coverage overlaps the color validator's coverage; counts are not additive.
- `pnpm check:tokens`, strict TypeScript, and the scoped generator `--check` pass.
- React: 218 light component root cells; Vue: 218. Both brands, zero failures or skips.
  The reports and four original full-page screenshots are under `react/` and `vue/`.
- Focused contract tests: 44 passed; contrast suite: 29 passed; none skipped.
- `ramps.json` lists source file SHA pairs and every before/after token value.
- `attribution.json` records 328 changed light semantic token values, scans all
  1,577 retained SVG/snapshot files (1,196 match changed light paints), and attributes
  42 light registry scopes to their changed token inputs. Its paint matches identify
  potential affected inputs; they do not claim newly measured SVG hashes. Every
  retained golden and registry hash remains unchanged. The single update is m05.

The screenshot harness emitted a Tailwind missing-content warning; the browsers
mounted correctly and all requested cells were measured with zero failures.
No component code or contract changed. No five-suite closeout capture was run.
`builderSelfCertified: false`.

## Next

Continue m03 (dark palette and app-shell theme preference), then m04 (chart colors
and HC scope). Full token validation must be green after m04. The only golden
migration remains m05.
