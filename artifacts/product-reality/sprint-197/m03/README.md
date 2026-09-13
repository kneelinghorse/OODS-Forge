# s197-m03 — Dark palette and composed shell

Dark color sources are generated from the same authored seeds as the light palette.
The five elevations (backdrop, canvas, raised, subtle, disabled) use L=.145/.18/.215/.25/.285,
C=.008, H=265. Brand B uses the same method with its primary seed hue. Shared dark
surface/text/status/focus color files now derive from the generator; focus width and
all other non-color theme files retain their contract. All semantic names are frozen.

`code.generate` now inherits a recognized light/dark/hc schema theme for React/Vue app
shells. Explicit code-generation options take precedence. Compose's dark preference
reaches html/body, mount code, semantic canvas, and embedded chart assets. Public
schemas and tool descriptions remain unchanged.

Verified final source:

- 41 focused palette/key/boundary tests and 33 contrast/provenance/legacy-shell tests
  passed, none skipped. The source contrast grid covers all 228 pairs.
- 436 mounted dark component cells (109 roots × two brands × React/Vue): zero failures
  or skips. Reports and screenshots are in `react/` and `vue/`.
- 52 public chart cells: deterministic repeated SVGs and correct scoped canvases;
  Role C has 36 passes, 16 existing geo/gradient exemptions, zero failures or
  ungradeable cells. Four dashboard scopes each draw eleven charts. `matrix/matrix.json`
  retains contrast notes and exemptions; no new certification is claimed.
- `composed-dark-shell.png` and `shell-proof.json`: a mounted React Subscription
  workflow requested dark in compose, omitted code-generation options, and rendered
  a dark canvas with zero browser errors or horizontal overflow. Both frameworks
  have public boundary tests for inheritance and explicit override precedence.
- All 414 non-coverage CSV color checks pass. Full color validation remains red only
  for the 40 missing dark chart scale overrides; full viz validation remains red for
  the chart-scale work assigned to m04. The user approved this scoped gate boundary.
- `check:tokens`, the full current generator `--check`, generator strict TypeScript,
  and MCP server TypeScript pass. Full `tokens-validate` is retained red, not claimed
  green. All full palette gates must pass after m04.
- 1,580 existing SVG/snapshot/registry/certified-matrix files retain their baseline
  hashes. Golden migration remains reserved for m05.

Initial failure and decision:

The broader contrast run in `contrast-and-theme-tests.log` caught Brand B dark
pressed text at 4.3:1 although mounted component cells passed. The generated dark
interactive ramp changed from L=.52/.54/.56 to .52/.53/.54 for both brands. Final
contrast and browser runs are retained separately; `verification-commands.json`
identifies the final successful commands. `development/` preserves the first shell.

The same run exposed #1158's older byte-inequality status-provenance rule. That rule
required artificial hue differences between brand and shared status colors. Sprint
197's more recent settled decisions require coherent shared status seeds and make
Brand B a mechanical primary-hue variation. The test now verifies actual seed
provenance, a targeted success-hue mutation reaching both brands and the shared dark
set, and separation between light/dark sets. It no longer treats intended equal
seed-derived values as copying. This is a provenance rule change, not a golden update.

`builderSelfCertified:false`; independent visual review remains pending at sprint close.
