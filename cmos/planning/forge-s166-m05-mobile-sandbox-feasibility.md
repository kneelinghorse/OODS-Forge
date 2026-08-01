# s166 m05 findings — certify-native mobile sandbox feasibility (XcodeBuildMCP)

**Build session PS-2026-08-01-004, 2026-08-01.** One-afternoon spike per the s166 memo: can an
LLM-driven local mobile test sandbox run the certify-native loop end-to-end on Derek's Mac?
**Verdict: YES — the full loop was demonstrated live**, with one toolchain bug worked around and
three genuine audit findings produced. No Forge code changes were made.

## What ran (all through XcodeBuildMCP 2.7.0, npx, zero global installs)

1. **Scaffold** — `project-scaffolding scaffold-ios` produced a complete SwiftUI workspace
   (app target + SwiftPM feature package + XCUITest target + xctestplan) in seconds.
2. **Token-styled screen** — ContentView styled from Forge artifacts: the compilable subset of
   m03's generated `OodsTokens.swift` (dims; the oklch/keyword lines are non-compilable — the m03
   finding) + Parts Town brand colors converted from the m04 DTCG artifact
   (`partstown.base.json` hex → SwiftUI Color). The screen visibly renders PT red `#c8102e`, and
   the m03 ×16 dimension inflation is VISIBLE on screen (a "large geometry scalar" swatch renders
   320 pt tall) — the token-quality gaps surface as rendered pixels, exactly what certification
   is for.
3. **Headless simulator** — `simulator-management boot` on the iPhone 17 / iOS 26.4 device, no
   Simulator GUI ever opened (8.8 s boot).
4. **Build–install–launch** — `simulator build-and-run` (cold build 244 s; app launched by PID).
5. **Accessibility hierarchy** — `simulator snapshot-ui` returns a semantic rs/1 tree (11
   elements, roles/labels/frames/actions + tappable elementRefs consumable by the ui-automation
   tools). Screenshot tool returns real rendered pixels (PT branding verified visually).
6. **performAccessibilityAudit** — via the scaffolded XCUITest target (`simulator test`):
   `app.performAccessibilityAudit(for: .all)` ran and collected **3 genuine findings** —
   "Dynamic Type font sizes are unsupported" (audit type `.dynamicType`) against the screen's
   fixed-size fonts. A real, correct accessibility verdict on a token-styled native screen.

## What broke (worked around, disclosed)

- **Scaffold bug:** the generated scheme references `container:ForgeTokenProbe.xctestplan`
  (workspace root) but scaffold writes the file into the app subfolder → `simulator test` fails
  with "test plan could not be read". Fix: copy the plan to the root (1 line). Worth an upstream
  report if XcodeBuildMCP becomes a dependency.
- **snapshot-ui foreground requirement:** fails with a cryptic "No translation object returned"
  error while Springboard is frontmost; `build-and-run`'s launch left the home screen up on the
  freshly booted sim. Re-launching the app foregrounded it and snapshot-ui worked. certify.native
  must treat "app is foreground" as a precondition, not an assumption.
- **XCUIElement identifier queries:** SwiftUI `Text` matched `staticTexts` by LABEL, not by
  `.accessibilityIdentifier`, in this setup — assertions should key on labels or the runtime
  a11y tree. After switching the query to the label form, the full suite passed **3/3**
  (182.5 s warm, vs 310 s on the cold test build).
- The deliberate unlabeled-image defect was NOT flagged by the audit (SF Symbols carry implicit
  labels) — audit coverage has blind spots; certify.native should layer its own tree checks
  (snapshot-ui gives the data) on top of Apple's audit.

## Machine cost observed (Derek's Mac, Apple Silicon)

- **Disk:** iOS 26.4 simulator runtime download 8.46 GB (net free-space delta ≈ 8–9 GB; Xcode
  26.4 itself was already installed). Total well under the memo's 50 GB planning bar.
- **Wall time:** ~25 min end-to-end from runtime-download start to audit findings (download
  dominated; boot 8.8 s, cold app build 244 s, full test pass incl. 2 UI tests ~310 s).
- **RAM:** booted headless simulator ≈ 1.3 GB RSS across sim processes.
- **Cost class:** entirely local, no paid services, no Apple developer account needed for
  simulator-only work.

## What an MCP `certify.native` tool would need (feeds the s170+ mobile walk)

1. **Wrap four XcodeBuildMCP capabilities:** build-and-run (or install+launch), snapshot-ui (the
   a11y tree is the native twin of Forge's accessible-table), screenshot (paint-level proof — the
   native twin of the s166 SSR probe), and `simulator test` running a generated XCUITest that
   calls `performAccessibilityAudit` and prints findings in a parseable form (the
   `A11Y-AUDIT-FINDING[n]:` convention worked).
2. **A stable scratch host app** (the scaffold output, checked in once) that renders
   agent-supplied screens styled from Forge token artifacts — so certification doesn't pay the
   scaffold+cold-build cost per run (warm incremental builds are the steady state).
3. **Preconditions/verdict plumbing:** app-foreground guard before snapshot-ui; audit findings +
   tree checks + screenshot assertions graded into the same certify verdict shape artifact.certify
   uses today.
4. **Android:** untested here. Compose token emission exists (m03); the equivalent sandbox needs
   an emulator + accessibility-tree bridge — separate spike before the mobile walk commits.

Session-local evidence (scratchpad, not committed): ForgeTokenProbe workspace, a11y-tree.json,
probe screenshots, XcodeBuildMCP result bundles/logs under
`~/Library/Developer/XcodeBuildMCP/workspaces/OODS-Forge-*`.
