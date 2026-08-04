# Sprint-171 — the mobile compile-truth slice (first mobile-WALK item) + s170 record corrective

**Status: v2 LOCKED 2026-08-04.** Planning PS-2026-08-04-002. Grounding wf_5f4af9a0-08c (7 lenses). **Critic wf_94ae25e1-17d REJECTED v1 on 4 of 5 lenses (4 blockers / 12 majors) — all disposed in §6.** Derek ratified (AskUserQuestion ×3, 10 forks): spine = the compile-truth transforms · carries fold as m01 · riders in (#1160 closed at planning; #781 stays declined) · breakpoints DEFERRED to the PT seed · kotlinc via one-time brew install · stage1-reconciliation RETIRED · B/dark RATCHET-PINNED · PR #70 no label · **RELABELED: this is mobile-WALK work (decisions #1429/#1344), NOT crawl 1–3 — crawl 1–3 (breakpoint tokens → view-context collapse/drawer → mobile test guardrails) stays QUEUED and unclaimed, expected paired with the PT seed** · **easings/font-stacks DEFERRED from mobile output, honestly framed (see m03.4)**.

Build in a FRESH session from this memo ONLY (rule 9); review is a separate session (rule 10). Rule 15: every recorded verification output is a PASTE of a command actually run at final HEAD. Supersedes the v1 file (`forge-s171-mobile-crawl-decision-memo.md`, deleted pre-lock — never committed).

---

## §0 What this sprint is

s170 opened the accuracy pillar; its review was NOT_GENUINE_CLOSE on record integrity — product sound. s171: (1) **m01 restores the record** (every carry home grounded in §1f); (2) **the compile-truth slice makes `dist/ios-swift/OodsTokens.swift` and `dist/compose/OodsTokens.kt` genuinely compile with correct values** — real compilers, zero web movement. Today only 32/771 emitted Swift constants are valid AND correctly valued; `swiftc -parse` fails on **557** distinct lines, `-typecheck` on **565** (557 + the 8 bare identifiers only typecheck resolves). The sprint ends with both files compiling and every emitted value correct or explicitly, disclosedly absent. **This is the first mobile-WALK item. It does NOT discharge crawl 1–3.**

## §1 Grounded facts (wf_5f4af9a0-08c, re-verified by the critic at HEAD `e59b9dc`)

### 1a. Census — identical 771-name sets, both platforms

| class | count | source $type | fate |
|---|---|---|---|
| oklch passthrough | 381 | color | → UIColor / Color(0xAARRGGBB) (m02) |
| ×16 dimensions | 174 | dimension | unit-aware descale + sp/dp split (m03) |
| ms durations | 108 | duration 66 + delay 42 | typed numerics (m03) |
| comma lists | 68 | 54 easing quads + 14 font stacks | DEFERRED from mobile, disclosed (m03.4) |
| bare numerics | 24 | fontWeight/number | already valid |
| bare identifiers | 8 | strokeStyle/border/textCase | quoted strings (m02) |
| UIColor / Color | 8 | color (hex/rgba shadows) | already valid — proof the stock colour transform works on parseable input |

Kotlin facts: 174 `.dp`, **zero `.sp`** (all fontSize tokens are `$type dimension` post-preprocess — `isFontSize` can never fire). kotlinc absent locally; analytic Kotlin classification trusted because the same method matched swiftc line-for-line.

### 1b. Root causes (SD 4.4.0, not our code)

- `isColor` (transforms.js:46) gates on tinycolor2 → rejects oklch → 381 skipped verbatim; the 8 hex/rgba pass.
- `sizeSwiftRemToCGFloat` (:954) / `sizeComposeRemToDp` (:910): `parseFloat × basePxFontSize(16)` assuming rem; sources are 100% px/%/em, zero rem. `12px → CGFloat(192.00)`, `160% → 2560.00`, `0.08em → 1.28`.
- **Appended transforms run AFTER the stock group's** (config.js:52-68) — they see already-damaged values. Fix = REPLACE the groups.
- Topology: **6** dedicated css SD instances (one per brand×theme cell) + **1** shared non-css instance (ts/tailwind/ios-swift/compose); `_exportPlatform` transforms into a fresh object per platform → platform-level changes are web-isolated; **source edits are not**. Empirical: same instance, tailwind `"20px"` raw vs ios-swift `CGFloat(320.00)`.
- Stock group contents differ: iosSwift = [attribute/cti, name/camel, color/UIColorSwift, content/swift/literal, asset/swift/literal, size/swift/remToCGFloat]; compose = [attribute/cti, name/camel, color/composeColor, size/compose/em, size/compose/remToSp, size/compose/remToDp] — **compose has no content/asset transforms to keep**.

### 1c. The ×16 class (174) — binding split 27 fontSize / 24 lineHeight / 18 letterSpacing / 105 spacing (grounding + critic agree)

Policies: spacing+fontSize px → **1:1** (fontSize → pt iOS, `.sp` Compose); lineHeight `%` → **unitless multiplier** (160% → 1.6) both platforms; letterSpacing `em` → Compose `.em`, Swift Double + documented convention (kerning pt = value × fontSize). `basePxFontSize:1` FORBIDDEN as mechanism. The sp/dp split keys on a committed **path manifest** (m03.1), never `$type`. Spacing sub-families (informational — the critic corrected v1's arithmetic; re-derive when authoring the manifest): space/spacing 44, shadow geometry 24, radius 6, width 5, focus 3, viz 23 = 105. **Four shadow offsetX sources are `"0px"`** — correct output is 0 (matters for the 16× oracle wording, m04.1).

### 1d. Compile gates (measured)

- **Swift:** `xcrun -sdk iphonesimulator swiftc -typecheck -target arm64-apple-ios17.0-simulator <file>` — both flags required; `-typecheck` not `-parse`. Today exit 1, **565** distinct error lines (the RED inventory). Valid control: exit 0. ~2–3s. Swift 6.3 / iPhoneSimulator 26.4.
- **Kotlin:** one-time `brew install kotlin` (ratified; brew's openjdk is keg-only — no PATH/java shadowing). Hermetic: compile against a checked-in stub file (§m04.3). **kotlinc -version pasted into the gate table.**
- No macOS CI job (private repo, 10× billing, all workflows ubuntu). Gates are local-closeout; the m04 oracle runs in CI (coverage job builds tokens; root `core` globs `tests/**`).

### 1e. Zero-web-movement control — SHA-256 at HEAD, re-hash at closeout AFTER the final rebuild (ordering per m06)

- `dist/css/tokens.css` `7593101da4414e1ac2899c7dba03652d028755fac10b3ef9c2ea449708132556`
- `dist/ts/tokens.ts` `f452d2e79a757c5d120c062484a5fb26791d6bce19799e203c8c40cd9365d2b4`
- `dist/tailwind/tokens.json` `f7b25e3dda72762437c014acb535da3c8374873e5ca7ce242b093d7120dec470`

Also frozen: the 322 gate, tests/tokens pinned counts (41/41, 14 rows), governance source-diff counts, the mcp `tokens.build` 4-artifact contract, SD pinned 4.4.0. **Known transient:** `brand.apply` spawns `pnpm run check:tokens` at runtime — during m02/m03 intermediate states a live bridge call can fail on stale dist; rebuild promptly after transform edits (bridge execution is fresh-per-call).

### 1f. Carry homes (three v1-review premises corrected by grounding; anchors critic-verified)

1. **Scratchpad:** 214 tracked; 19 file negations (+1 dir negation `!scratchpad/s169-m02/` + re-ignore `:87`) at .gitignore:72-92, all 19 tracked+on-disk. TRAP: `git check-ignore` without `--no-index` returns nothing for tracked files.
2. **NUL bytes:** exactly 3 raw 0x00 — `packages/viz-core/src/accuracy/aggregation-rule.ts:108` (two) and `:261` (one); escaped forms proven byte-identical at runtime. **This file is on the certify accuracy path → the edit is a SERVED-PATH mover** (m06 rebuilds viz-core dist + pm2 restart; behavior-identity is the no-consumer-notification argument, not a no-restart argument).
3. **Totals homes:** wrong numbers in s170 memo **line 151** + decisions **#1425/#1427** (checkpoint claims); the memo gate table lines **175/176/178** is CORRECT. Finals: viz-core 1286/62 · mcp-server 4030+16/197 · root core 4795+20/439.
4. **policy.json:** the "V15x literals" claim is a phantom (no home in any record; likely conflation with `tool-descriptions.json`, which legitimately carries the codes). Resolution = Option A record amendment (this memo + m01 closeout decision citing #1434).
5. **LICENSE:** year → 2026 in both files, party unchanged. Root LICENSE 2025 = optional Derek item, not chartered.
6. **PT brief §5** :239-241 dated correction; **findings note :23** strike 259→381.
7. **Retire `packages/mcp-server/test/e2e/stage1-reconciliation.test.ts`** (full path; 4 stale copies exist under `.claude/worktrees/` — do not touch those). Root-core-only collection; movement root core 439→438 files / 20→16 skipped.
8. **Governance:** PR #69 merged WITH token-change:breaking (2026-08-03T21:44Z, before the committed RED lastRun 23:51Z — local-visibility artifact, accepted standing debt); PR #70 needs no label (zero token-source changes in s170).
9. **Certified-path `unchecked`:** accuracy catch `artifact.certify.ts:357-362`; contrast catch is **:331-337** (its own comment's ":288-296" is stale) and writes NO note; third catch :211-213. Prototype **salvaged to `scratchpad/s171-accuracy-fault-prototype/accuracy-fault.spec.ts`** (+ its scratch vitest config) — proven 2/2 green in the planning session; imports are ABSOLUTE paths, rewrite to relative on lift; if the salvage is lost, m05a's assertion inventory is authoritative and the test is re-authored from it.

### 1g. Riders — states

- **#1159 residue only:** reword `vega-lite-adapter.ts:227-228` + keep dead guard `:253` with honest comment. Translations/else-x/cookbook shipped s169 — cite, don't re-charter.
- **#1160 CLOSED AT PLANNING:** four ratios re-measured TRUE (4.9911/4.6004/4.6437/4.6942); warning-icon disclosure exists (3.000514); `brand-description-truth.spec.ts` 3/3; "by construction" exists in no shipped file. Nothing chartered.
- **#1158:** `color.status.json` IS consumed (theme0 aliases + all-platform emission) — control targets brand-literal provenance. B/dark = 5/20 byte-copies (status.critical.icon + four status.neutral slots); ratchet ratified.
- **#1129:** genuine plant = `Image(uiImage:)` ONLY (SF Symbols AND asset-catalog images derive implicit labels). Scaffold salvaged to `scratchpad/s171-native-probe-salvage/` (durable, gitignored). Xcode 26.4 + iOS 26.4 sim installed. XcodeBuildMCP is NOT registered anywhere — see m05b tooling.

## §2 Mission slate — DAG: m01 root · m02→m03→m04 · m05a root · m05b root · m06 requires all non-descoped

**Descope order, declared up front:** m05b first, then m05a, then m04's Kotlin leg (Swift gate + oracle stay). **m01 + m02 + m03 + m04-Swift ARE the sprint.**

### m01 [M] — s170 record corrective

1. **Scratchpad drop:** `git ls-files -z scratchpad/ | git check-ignore -z --stdin --no-index | xargs -0 git rm --cached --`. Pasted verifications: `git ls-files scratchpad/ | wc -l` == **19**; `diff <(git ls-files scratchpad/ | sort) <(grep '^!scratchpad/' .gitignore | sed 's/^!//' | grep -v '/$' | sort)` == **empty** (the executable recipe — 19 file negations, dir negation excluded); `git status --porcelain scratchpad/ | grep -c '^D '` == **195**. FORBIDDEN as verification: `check-ignore` without `--no-index`. Files stay on disk; both `s171-*` salvage dirs stay ignored/untracked.
2. **NUL swaps:** `:108` → `` `${channel}\0${binding.aggregate}\0${binding.field}` ``; `:261` → `surfaces.join(' \0 ')` (keyFor precedent, data-analysis.ts:502-509). Acceptance: 0x00 byte-count == 0; `git diff --numstat` shows real line counts; viz-core stays 1286/62. Declared served-path mover (§1f.2).
3. **Totals true-up:** dated correction block in the s170 memo naming memo:151 + #1425 + #1427, finals per §1f.3, framed **checkpoint-superseded-by-final**; new dated CMOS decision; #1425/#1427 not edited.
4. **policy.json Option A** dated note citing #1434 + the tool-descriptions.json conflation.
5. **LICENSE year → 2026** ×2.
6. **PT brief §5** correction; **findings note :23** strike.
7. **Retire** `packages/mcp-server/test/e2e/stage1-reconciliation.test.ts` (fixture-loss evidence recorded; movement per §1f.7).
8. **Governance record** per §1f.8 into the closeout decision.

### m02 [M] — transforms I: colour + identifiers

Mechanism: `registerTransformGroup('oods/ios-swift', …)` / `('oods/compose', …)` with curated lists — iOS keeps attribute/cti, name/camel, content/swift/literal, asset/swift/literal; compose keeps attribute/cti, name/camel. **The ONLY permitted shared-config edit: the two `transformGroup:` keys at style-dictionary.config.cjs:218 and :231** pointed at the new group names. NO other config lines, NO source-JSON edits, NO sharedConfig/preprocessor/expand edits.

1. **oklch → sRGB via colorjs.io `toGamut` (CSS-Color-4)**; emit `UIColor(red:green:blue:alpha:)` / `Color(0xAARRGGBB)`. Non-throwing: unknown shapes → logged passthrough (8+ CI jobs run build:tokens; never throw).
2. **42-row out-of-gamut table committed** (oklch → mapped hex). **Anti-circularity (rule 7c):** for every divergent row (clip-vs-toGamut ΔE00 > 1 — ≥10 rows, including both brands' interactive primaries), the oracle computes BOTH naive-clip and toGamut **in-test** and asserts transform output == toGamut AND ≠ clip — a clip-implemented transform cannot green. The asserting test lives in m04's `mobile-output.test.ts` (declared there); m02's done-bar for the table = committed + spot-verified by a pasted node script.
3. **Bare identifiers (8)** → quoted strings.

**Done-bar:** zero `oklch(` in both files; ≥389 typed colour constants; table committed + spot-verified; web SHAs untouched (verified at closeout per m06 ordering).

### m03 [M] — transforms II: dimensions, durations, deferred classes (requires m02)

1. **Path manifest** `packages/tokens/scripts/mobile-manifest.mjs` — 27/24/18/105 by token path, consumed by BOTH transform and oracle (rule 8). No `$type` retyping.
2. **Policies per §1c.**
3. **Durations:** Swift `TimeInterval` seconds (0.18), Kotlin `Int` ms (180), documented in the emitted header.
4. **DEFER easing quads (54) + font stacks (14)** from mobile output via platform filter — **Derek-ratified 2026-08-04 with the corrected framing: easings are mobile-relevant (s166 review, #1347) and have typed targets (Compose `CubicBezierEasing`, iOS `CAMediaTimingFunction`); they are deferred because typed emission is a consumer-API commitment better made with the walk's consumer in view. Font stacks genuinely do not map to mobile.** Disclosed in both emitted file headers with class names + exact counts. Post-defer: **703 constants per file**. Never describe easings as "web-only" anywhere.

**Done-bar:** zero ms-suffixed/comma-list/×16 values; 12 `*FontSize` constants carry `.sp` in Kotlin; headers disclose 54+14; 703 constants.

### m04 [S/M] — the honesty gates (requires m03)

1. **`tests/tokens/mobile-output.test.ts`** (root core; CI-covered). Assertions:
   - zero `oklch(`; zero bare identifiers; per-line value-shape regexes;
   - **magnitude pins, one per value class:** px (refSpaceInsetCompact==8, refBorderWidthHairline==1, refBorderRadiusPill==999) · fontSize (sysTextScaleBodyMdFontSize==16, `.sp` in Kotlin) · lineHeight (sysTextScaleBodyMdLineHeight==1.5, refTypographyLineHeightLoose==1.6) · letterSpacing (refTypographyLetterSpacingWide==0.08, `.em` in Kotlin) · duration (motionDurationBase==0.18 Swift / 180 Kotlin);
   - **no NONZERO emitted dimension equals 16× its px source** (the four `"0px"` shadow offsets are correctly 0 and excluded);
   - **manifest pins:** class counts 27/24/18/105 asserted against this memo's census + one literal member per class named OUTSIDE the manifest (the four pins above);
   - **anti-gaming, value-position anchored** (regex on the text right of `= `): ≥389 values matching `^UIColor\(`/`^Color\(0x`; zero quoted-string values for colour- or duration-class tokens;
   - header disclosure lists exact deferred counts (54+14); 703 constants per file; the m02 gamut-table assertion (§m02.2).
2. **Swift gate (literal):** `pnpm --filter @oods/tokens run build && xcrun -sdk iphonesimulator swiftc -typecheck -target arm64-apple-ios17.0-simulator packages/tokens/dist/ios-swift/OodsTokens.swift` → exit 0. RED-first: exits 1 today, 565 distinct error lines pasted.
3. **Kotlin gate:** `brew install kotlin` (one-time; paste `kotlinc -version`). Stubs at **`packages/tokens/scripts/compile-gate/androidx-stubs.kt`** (OUTSIDE src — token-lint scans `packages/tokens/src`): exact signatures only — `Color(Long)`, value class `Dp`, `Int`/`Double` `.dp`/`.sp`/`.em` extensions. **RED-first via a committed known-bad fixture** `packages/tokens/scripts/compile-gate/red-fixture.kt` (contains `oklch(0.5 0.1 200)`, `180ms`, `Color("string")` lines): `kotlinc <stubs> <red-fixture> -d <discard>` MUST exit 1 — this doubles as the stub-permissiveness control (a stub that accepts `Color(String)` greens the fixture and self-reds the gate). Then `kotlinc <stubs> <OodsTokens.kt> -d <discard>` → exit 0.
4. **Named mutation set — each run individually against a rebuilt dist, each reds its own family:** (a) disable the colour transform → colour assertions red; (b) restore stock size transforms → magnitude pins red; (c) drop the /100 in the lineHeight policy → lineHeight pins red; (d) emit durations unconverted → duration pins red; (e) remove the header disclosure → disclosure assertion reds; (f) emit one colour as a quoted String → anti-gaming reds.

**Done-bar:** oracle green post-m03 AND the six mutations each red; both compilers exit 0 with the RED-fixture leg exit 1; all invocations pasted.

### m05a [S] — code riders (independent root, env-free)

1. **#1158:** `testing/a11y/status-provenance.spec.ts` (guardrails). Zero byte-copies A/base, A/dark, B/base vs their sources; **B/dark ratchet-pins the exact 5**; cross-set 0. Source JSONs only. States in-file that color.status.json is legitimately consumed.
2. **#1159 residue:** reword `vega-lite-adapter.ts:227-228` (TraitBinding.scale is a string enum — scale.zero cannot be caller-declared); keep guard `:253` with "defensive, currently unreachable".
3. **Fault tests:** `packages/mcp-server/test/tools/artifact.certify.accuracy-fault.spec.ts` (NEW file — vi.mock is file-wide; the existing 72-test spec must not gain a mock). Lift from `scratchpad/s171-accuracy-fault-prototype/accuracy-fault.spec.ts`, rewriting its absolute imports to relative. Armed: status ok / coverage certified / accuracy `'unchecked'` / accuracySummary undefined / findings [] / notes toEqual verbatim ("…4 rules were offered." — a deliberate scope tripwire, stated) / other pillars pass / **conformant true (parity LOCK on #781, not endorsement)** / AJV-valid. Disarmed control: accuracy `'pass'`. **Plus contentHash armed==disarmed** (pure-reader invariant becomes a checked fact). **Sibling file** mocks the local certify-contrast module for the catches at `:331-337` (writes NO note — observed, not fixed) and `:211-213`.

### m05b [S] — native evidence re-plant (independent root; descopes first, never blocks m06)

1. **Prune before commit:** from the salvage, DELETE `CLAUDE.md`, `.cursor/` (7 template rule files), `.github/copilot-instructions.md` — template agent-config must not become live config under a tracked tree. Keep nested `.gitignore`s only if they ignore build artifacts (review at commit). Then commit the scaffold to `apps/native-probe/ForgeTokenProbe/` (declared mover; keep the xctestplan-at-root workaround).
2. **Plant:** ContentView.swift:21 `Image(systemName:)` → **`Image(uiImage:)`** bitmap, no label, NOT decorative.
3. **Tooling:** register XcodeBuildMCP for the session (`claude mcp add xcodebuild -- npx -y xcodebuildmcp@2.7.0`) OR the **declared fallback needing no MCP**: `xcodebuild test -workspace … -scheme … -destination 'platform=iOS Simulator,name=iPhone 17,OS=26.4'` — `performAccessibilityAudit` is an XCUITest API, so the audit datum needs no MCP; the a11y tree via `XCUIApplication.debugDescription` dumped to file.
4. **Evidence:** XCUITest with `A11Y-AUDIT-FINDING[n]:` lines; the audit verdict on the bitmap (either answer is the datum); tree dump showing the label-less node; screenshot; RED→GREEN pair.

### m06 [S] — closeout (requires all non-descoped)

Full gate table by LITERAL invocation, env vars included. **Gate 22e is the FLAGGED form: `node scripts/state-assessment.mjs --guardrails --tokens`** (matches ci.yml:372 + s170 gate 22e). NEVER bare — bare runs all 10 checks and rewrites tracked `artifacts/state/performance.json`. **Closeout ordering (the gate deletes `dist/tailwind/tokens.json` by design):** (1) gate 22e → (2) full tokens rebuild → (3) §1e SHA re-hash → the review re-derives after its own rebuild. Declared: diagnostics.json counter delta (gate-that-writes, rule 14); `performance.json` NOT touched under the flagged form. **Served-surface statement:** m01.2 moved the viz-core accuracy module → rebuild packages + **pm2 restart oods-forge-bridge** (standing practice; behavior byte-identical so no consumer notification); loop-closure otherwise NONE (tokens.build serves css/ts/tailwind only — mobile outputs reach no consumer). Line-item charter-diff every mission. ZERO `.snap` movement predicted (census 14/61). Suite totals computed at END from final observed runs (m01 retire, m05a additions, m04 oracle all move totals — per-mission arithmetic is reconciliation input, never the recorded final). NOT self-certified.

## §3 Predicted movement (exhaustive; finals at closeout per rule 15)

Baselines: viz-core 1286/62 · mcp-server 4030p+16s/197 · root core 4795p+20s/439 · guardrails 15/4 (re-verify at build start) · snaps 14/61 · SHAs §1e.
- m01: root core −1 file/−4 skipped; 195 staged scratchpad deletions; s170 memo + PT brief + findings note + 2 LICENSEs + aggregation-rule.ts (served-path; rebuild+restart in m06).
- m02+m03: style-dictionary.config.cjs (two transformGroup keys ONLY) + build.mjs registrations + mobile-manifest.mjs + 42-row table + emitted dist (gitignored). ZERO web movement.
- m04: +1 core test file (`tests/tokens/mobile-output.test.ts`, carries the table assertion) + `androidx-stubs.kt` + `red-fixture.kt` (both under packages/tokens/scripts/compile-gate/) + gate rows.
- m05a: +1 guardrails file + 2 mcp-server test/tools files (mcp-server AND root core gain them); vega-lite-adapter.ts comment-only.
- m05b: apps/native-probe/** (pruned per m05b.1 — CLAUDE.md/.cursor/copilot-instructions NEVER tracked).
- m06: diagnostics.json (declared counter delta); nothing else.

## §4 Deferred / declined (explicit)

**Crawl 1–3 (breakpoints → view-context collapse/drawer → mobile test guardrails) — QUEUED, unclaimed, expected paired with the PT seed** · typed easing emission (walk, with a consumer in view) · #781 (declined 3rd time; m05a parity lock OBSERVES it) · B/dark re-author · multi-brand×theme mobile emission (this slice certifies DEFAULT_SCOPE brand-A×base) · SwiftUI.Color migration · macOS CI · SD version move · root-LICENSE 2025 (optional Derek item) · certify.native tool build · PT seed + client conversation (Derek-gated).

## §5 Review charter (rule 10)

Cover the s170 review's unverified surfaces (#1185): aquex-adapter certify path, full gate enumeration, root rerun, per-mission decisionCount, and verify NO info_push was sent (none chartered). Plus: rule-15 paste-audit; §1e SHAs re-derived after the review's own rebuild; the B/dark ratchet's 5-copy set re-measured; the six m04 mutations spot-reproduced.

## §6 Critic dispositions (wf_94ae25e1-17d: 4 blockers / 12 majors / 14 minors — v1 REJECTED 4-of-5)

B1 prototype unreachable in volatile /tmp → salvaged to `scratchpad/s171-accuracy-fault-prototype/` + re-author inventory in m05a.3. B2 oracle blind on lineHeight/duration/letterSpacing → per-class pins m04.1. B3 state-assessment bare invocation (deletes a SHA-pinned file; rewrites performance.json; 10-check scope) → flagged form + closeout ordering m06. B4 false "crawl 1–3" identity → RELABELED to mobile-walk (Derek-ratified), crawl stays queued. Majors: m02 fence contradiction → the two-key permitted-edit clause; 16×-at-zero unsatisfiable → NONZERO wording; gamut-table circularity → clip-vs-toGamut in-test discrimination; Kotlin gate never-RED + permissive stubs → red-fixture.kt + exact signatures; unnamed mutation direction → six named mutations; NUL edit vs "no served surface moved" → declared served-path mover + restart; spacing sub-counts false (117≠105) → corrected 44/24/6/5/3/23; no descope order → declared; m05 grab-bag + MCP-tooling gap → split m05a/m05b + xcodebuild fallback; easing "web idioms" re-committed the s166-corrected framing → honest deferral, Derek-ratified; salvage would track template agent-config → prune list; 42-row table assertion homeless → lives in m04 oracle, declared. Minors: verification recipe made executable; anchors 175/176/178; 6+1 SD instances; 565-line typecheck census; full paths + worktree-copy warning; compose keep-list corrected; stubs path outside src; kotlinc -version paste; brand.apply transient noted; anti-gaming value-anchored.

---

## §7 Closeout record — s171 m06 (2026-08-04)

**NOT self-certified.** The genuine-close review is a separate session (rule 10, charter §5). Every result below is a paste of a command run in this session at final HEAD state (rule 15).

### Gate table — sequential, by literal invocation

| # | gate | result |
|---|---|---|
| 1 | `pnpm install --frozen-lockfile` | clean |
| 2 | `pnpm run build:packages` | pass (includes the m01.2 served-path viz-core dist rebuild) |
| 3 | `pnpm --filter @oods/viz-core exec vitest run` | **1286 / 62** UNCHANGED (m01.2 + m05a.2 are byte/comment-level) |
| 4 | `npx vitest run --project core` | **4826 + 16 skipped / 441** (440 passed + 1 skipped file; from 4795+20/439: m01.7 −4 skipped/−1 file · m04.1 +25/+1 · m05a.3 +6/+2) |
| 5 | `npx vitest run --project guardrails` | **24 / 5** (from 15/4: m05a.1 +9/+1) |
| 6 | `pnpm --filter @oods/mcp-server exec vitest run` | **4036 + 16 skipped / 199** (198+1; from 4030+16/197: m05a.3 +6/+2; the m01.7 retiree was root-core-only, as §1f.7 said) |
| 7 | `pnpm --filter @oods/mcp-server run test:scale` | **62 / 4** exact |
| 8 | `pnpm run tokens-validate` | pass, **32** viz checks |
| 9 | `pnpm run tokens:collision-guard` | **0 non-exempt / 6 scopes** |
| 10 | `pnpm run check:tokens` | up-to-date (with the s171 oods/* groups live) |
| 11 | `lint` · `lint:enum-to-token` · `lint:enum-convergence` · `lint:audit-log` · `lint:brand-bleed` · `lint:tokens` | all six exit 0 |
| 12 | root `pnpm run typecheck` | pass |
| 13 | `pnpm --filter @oods/viz-core run typecheck` | pass (first attempt exited 2 under CPU contention with the concurrently-running suite battery; clean re-run exit 0 on both the pnpm form and direct `tsc --noEmit -p tsconfig.json`) |
| 14 | `pnpm -w run docs:api -- --check` | fresh, 26 files, no orphans |
| 15 | `@oods/schemas-tools generate:check` | pass |
| 16 | `pnpm run generate:schema-types -- --check` | unchanged |
| 17 | `pnpm run verify:brand-cascade` then `BRAND_CASCADE_PROOF_SELFTEST=1 …` | **246** computed-style assertions (228 bridged + 18 focus) + 9 derived checks, exit 0; self-test exit **1** |
| 18 | `pnpm run tokens:governance -- diff --brand <A,B> --base $(git merge-base HEAD OODS-pro) --head HEAD --labels token-change:breaking` | **A high=78 / B high=41**, both exit 0 with the label — byte-for-byte the s170 finals: zero token-source movement in s171, proven through the real gate |
| 19 | the exact ci.yml colocated 13-file invocation | **287 / 13** unchanged |
| 20 | `pnpm run test:coverage` | **4865 + 16 skipped / 453** (from 4825+20/450: −4 skipped m01.7 · +25/+1 m04.1 · +6/+2 m05a.3 · +9/+1 m05a.1 — guardrails specs are globbed by coverage) |
| 21 | `pnpm run a11y:diff` | no new violations; the run rewrote `tools/a11y/reports/a11y-report.json` with PURE noise (all 98 changed lines are ephemeral `127.0.0.1:<port>` URLs — grep-verified zero residual) → REVERTED per the #1433 rule |
| 22 | viz-render **11/1** · mcp-bridge **5/1** · `tenancy:check` 0 · `validate:diagnostics` 0 · **22e** `node scripts/state-assessment.mjs --guardrails --tokens` (FLAGGED form) exit 0, verdict RED on the accepted standing debt (highRisk 119 = 78A+41B) · `build` 0 · `build-storybook` 0 | all pass |
| 23 | **Swift compile gate** `pnpm --filter @oods/tokens run build && xcrun -sdk iphonesimulator swiftc -typecheck -target arm64-apple-ios17.0-simulator packages/tokens/dist/ios-swift/OodsTokens.swift` | **exit 0**. RED reproduced at full-stock conditions (HEAD build.mjs + stock group keys): exit 1, **565 distinct error source lines** — the memo figure exactly; intermediate datum 497 = 565 − 68 with the deferral filter active |
| 24 | **Kotlin compile gate** `kotlinc <color-stub> <unit-stub> <file> -d <discard>` | red-fixture leg **exit 1** (7 diagnostics incl. the `Color("string")` permissiveness control); `OodsTokens.kt` leg **exit 0**. `kotlinc -version` → **kotlinc-jvm 2.4.10 (JRE 26.0.2)** |

### The 22e ordering + zero-web-movement control

Executed exactly as chartered: (1) gate 22e flagged form → (2) full `pnpm --filter @oods/tokens run build` → (3) §1e re-hash. **All three SHA-256 digests BYTE-IDENTICAL to the pins:** css `7593101d…` · ts `f452d2e7…` · tailwind `f7b25e3d…`. `performance.json` untouched (flagged form). `diagnostics.json` counter delta declared and arithmetic: runs 9→10, cumulative highRisk 592→711 (+119 = 78+41), quoted with its run count per #1433.

### Served-surface statement

m01.2 moved `packages/viz-core/src/accuracy/aggregation-rule.ts` (NUL→escaped-`\0`, behaviour byte-identical — proven at planning and re-proven by the unchanged 1286/62). Packages rebuilt (gate 2), **`pm2 restart oods-forge-bridge` executed, bridge online, :4466 answering HTTP 200**. No consumer notification (behaviour-identity is the argument) and **zero `info_push` sent this session** (none chartered; verifiable in the session record). The mobile outputs reach no consumer — `tokens.build` serves css/ts/tailwind only.

### Per-golden review

**ZERO `.snap` movement repo-wide** — census re-measured at final state: **14 files / 61 entries**, exactly the §1e-frozen baseline; `git status` shows no `.snap` paths.

### Charter-diff, line-item, every mission

- **m01** — all 8 items exact. ONE deviation: plain `git diff --numstat` reports the NUL file binary because the PRE-image contains the bytes being removed; the unified `--text` diff (2 lines exactly) is the recorded evidence. The §9 correction block landed in the s170 memo (within the declared "s170 memo" movement).
- **m02** — exact. The ONLY shared-config edits are the two `transformGroup:` keys (:218/:231). Census reproduced to the digit (381/195/42).
- **m03** — exact. Manifest generated from the live dictionary, counts hard-asserted 27/24/18/105; zero source-JSON movement.
- **m04** — three declared deviations: (i) brand A's primary is NOT clip-divergent (ΔE00=0, both #C93E00) — memo expectation corrected by measurement, pinned as its own fact test; (ii) the Kotlin stub is TWO files (`androidx-color-stub.kt` + `androidx-stubs.kt`) — Kotlin's one-package-per-file rule; the colour stub carries `Color(Int)` alongside `Color(Long)`, mirroring androidx's real API (sub-0x80000000 hex literals type as Int); (iii) mutation (f) first targeted an alias token — silent no-op (decision #1442: non-transitive SD transforms never see alias tokens); retargeted to a literal, then red as designed.
- **m05a** — exact; movement +1 guardrails file, +2 mcp-server `test/tools` files, adapter comment-only.
- **m05b** — deviations: destination `iPhone 17 Pro` (no plain "iPhone 17" simulator exists here); the stale s166 `a11y-tree.json` left OUT of the committed scaffold (fresh evidence supersedes it); README's template AI-rules section replaced with a provenance note (consequence of the chartered prune).
- **m06** — gate 13's ephemeral first-run failure and gate 21's noise-revert declared above; suite gates 3–7/20 ran concurrently with the m05b simulator run but strictly AFTER `build:packages` at final code state (m05b's remaining artifacts were evidence files no vitest suite globs).

### Movement reconciliation (final observed runs; per-mission arithmetic was reconciliation input only)

Every suite delta names its mission, no unexplained movement: root core 4795+20/439 → **4826+16/441** (m01.7 / m04.1 / m05a.3) · guardrails 15/4 → **24/5** (m05a.1) · mcp-server 4030+16/197 → **4036+16/199** (m05a.3) · coverage 4825+20/450 → **4865+16/453** (all of the above; guardrails globbed) · viz-core, scale, gate-19 goldens, viz-render, mcp-bridge, browser-proof 246 all UNCHANGED.
