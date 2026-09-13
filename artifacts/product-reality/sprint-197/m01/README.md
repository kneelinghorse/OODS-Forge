# s197-m01 — generator and the BEFORE proof

Implementation starts from `bc12723e9b7a42a4790a98f5d2a0dc4a1f970b99`. The first commit,
`5dcf4d5a9`, carries the four locked planning files byte-identically from the primary
checkout. A normal worktree checkout exhausted disk space and Git cleaned it up;
the successful full checkout uses APFS copy-on-write clones of all 78,742 tracked
files, verified clean before the four planning files were copied. No sparse paths
or shared writable dependencies were introduced. Worktree:
`/Users/systemsystems/.codex/worktrees/s197/OODS-Forge`.

The generator validates `packages/tokens/src/palette/seeds.json` against its strict
JSON schema and deterministically emits the three reference files and both brands'
base/dark files. Brand B inherits the design with a single primary hue override.
Chroma is reduced into sRGB while retaining lightness and hue. `--only reference,light`
and `--only dark` support serial application in the next missions. The retained
categorical inputs keep the previous viz values until m04. All generated color
values and metadata derive from seeds and code; tracked outputs are never inputs.

No existing token source or golden changed in m01. `generator-fixture/` proves a
seven-file generate/check round-trip without applying the palette to the repo.
The process-boundary tests prove changed seeds and missing outputs make `--check`
exit 1 and that check mode never repairs drift. The default repo-wide generator
check is intentionally not green until the generated values are applied in m02/m03.

The CSV retains the six legacy interaction checks, which read `tokens/`. New checks
read the canonical package source tree and cover ramp lightness, family/neutral hue,
interior chroma peaks, raw sRGB gamut and explicit dark sequential/diverging paints.
The viz validator additionally checks diverging chroma symmetry. Both CLIs expose
`--json` reports with pass/fail counts per check type.

The frozen key contract includes every theme, brand base/dark/hc file, alias file and
viz key. A dark/HC declaration of a viz name already in the frozen shared set is an
override, not a new public name; this permits the explicitly planned m04 work.
Existing declarations cannot be removed, and new names/additions/renames fail.

## Measured BEFORE results

`before/commands.json` retains exact commands, exit codes and the 59 unchanged token
source hashes. `before/color-guardrails.json` has 122 failures among 358 checks:
21 family hue, 1 neutral hue, 2 chroma shape, 58 gamut and 40 missing dark overrides.
All 33 existing ramp-lightness comparisons and all 24 legacy subchecks pass.
`before/viz-scales.json` has 53 failures among 116 checks: 1 chroma shape, 7 gamut,
5 diverging chroma symmetry and 40 missing dark overrides. Coverage is intentionally
reported by both validators; those counts are not independent missing-color counts.

`baseline.json` freezes 1,696 tracked file identities from Git blobs at the base:
1,549 SVGs, 28 snapshots (14 live and 14 historical copies), 59 token sources,
21 literal-bearing test sources, 2 registries, 1 certified matrix and 36 historical
matrices/censuses. It also lists every snapshot entry, all 60 recipe and 32 pattern
svgHash pointers, 8 certified-matrix hashes plus tokenVersion, and 138 pinned-literal
lines. `s197-palette-baseline.py --check` independently re-derives the manifest from
those immutable Git blobs. `before/` retains source/snapshot bytes for m05.
`export-baseline.json` binds all 9 built token exports; the actual six scoped token
maps are retained in `before/cssVariablesByScope.json`.

## Verification

- Frozen install, token build and package builds succeeded (`setup/`).
- 40/40 focused tests passed, none skipped (`final-contract-tests.log`).
- Strict NodeNext TypeScript check passed (`typecheck.log`).
- Generator fixture emitted and checked seven files (`generator-fixture.log`).
- Immutable baseline check and `pnpm check:tokens` passed.
- Existing palette gates are deliberately red, as required by m01. No golden update
  or five-suite closeout capture was performed.

`development/` retains the initial failed validator/test attempt (Color.js boxed
numbers required explicit conversion before finite-channel validation), and the
initial TypeScript import failure; neither is offered as palette-defect evidence.

`builderSelfCertified: false`. Sprint review remains a separate session.
