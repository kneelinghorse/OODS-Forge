# s197-m06 — palette comparison and prepared TraceLab re-pin

Builder self-certified: **false**. Independent visual judgment remains pending.

Open [the review gallery](side-by-side/index.html): 90 before/after pairs,
180 full-page screenshots, with selectors for the screen, brand, theme and
viewport. All pairs preserve the input and visible text and show different
palette pixels. No captured viewport has horizontal overflow.

- Forge: Subscription list, detail, form, timeline and workflow, plus Organization
  detail; React, A/B, light/dark, 390/820/1440. Twelve saved compositions and seeds
  feed both isolated palette workers. Before uses m01's preserved bc12723e9
  bundle; both sides use the current generator. 72 pairs / 144 screenshots.
- TraceLab: Home, Evidence and Mission detail; A, light/dark, 390/820/1440.
  Unmodified tracked frontend source at 97fd25c359dc4a164b0a9ea3f9da21e0bb0bf70d,
  synthetic local GET fixtures and a fixed UTC clock. Before uses the consumer's
  existing 114a268e tarballs. 18 pairs / 36 screenshots. The Next development
  indicator remains visible on both sides; no UI element was hidden for capture.
- Prepared consumer files: two tarballs, measured provenance, lockfile reference
  and exact commands in [tracelab-repin](tracelab-repin/README.md). A clean install
  passed the literal-token gate and byte-checked Brand A light/dark/hc CSS.
- Boundary proof: all 151 tracked frontend files and the two already modified
  CMOS reports retain their original hashes. Git HEAD and status are identical
  before/after. The checkout was already dirty; `source-boundary.json` reports
  **zero added changes**, not a clean checkout. Clarification of the mission's
  literal clean-status criterion remains pending with the user.

## Validation and recovery

`verification.log` records five contract tests: gallery/image/input verification,
Cartesian screen coverage, real archive and npm integrity checks, unrelated
lock/source preservation, and execution of the prepared re-pin helper against
an isolated test copy including a wrong-consumer rejection. `gallery-browser.json` records all 90
selector combinations loading both images without browser errors. The owned
throwaway frontend was removed after evidence capture; the static review
gallery remains available.

Initial failed proof attempts are retained. The first Forge wait assumed every
screen had a Text component; detail screens do not, so the final wait checks
actual mounted components. The first TraceLab install retained stale same-version
tarball integrity pins; only those two entries are now invalidated before the
lock refresh. Local disk pressure interrupted one compilation; byte-identical
APFS dependency clones recovered space without changing package contents. A
missing read-only Mission log fixture was added. Finally, the pair checker
rejected Next's stale cached CSS despite correct installed package bytes;
clearing only the scratch compiler cache produced the qualified after captures. The first contract run also surfaced six
bundled optional WASM metadata additions from npm; their exact entries are
receipted, while every pre-existing unrelated lock entry remains unchanged.

The optional type/spacing/radius/elevation/focus chrome pass is deferred under
memo descope rung 1. TraceLab's source checkout, the primary Forge checkout, the live bridge and
running consumers were not updated. These screenshots do not certify the nine deferred HC chart pixels.

```sh
pnpm exec tsx scripts/product-reality/s197-palette-sheets.ts prepare
pnpm exec tsx scripts/product-reality/s197-palette-sheets.ts before
pnpm exec tsx scripts/product-reality/s197-palette-sheets.ts after
python3 scripts/product-reality/s197-tracelab-repin.py
node scripts/product-reality/s197-tracelab-sheets.mjs before
node scripts/product-reality/s197-tracelab-sheets.mjs after
python3 scripts/product-reality/s197-tracelab-repin.py --check-source
python3 scripts/product-reality/s197-palette-gallery.py --check
pnpm --filter @oods/mcp-server exec vitest run test/product-reality/palette-sheets.s197.spec.ts --coverage.enabled=false
```

Full reproduction creates new scratch receipts. The committed comparison,
inputs, package provenance and boundary records retain this measured run.
