# Sprint 191 build handoff

Sprint 191 is locked and ready. CMOS has five serial missions: `s191-m01` is Current, `s191-m02`–`s191-m05` are Queued with a Requires chain. No mission has started. Direction: Derek, 2026-09-10, after the Sprint 190 review and delivery ("the carry-forward is significant, so pay it down this sprint"). Lock: planning session `PS-2026-09-10-003`.

**Build directory:** `/Users/systemsystems/.codex/worktrees/s191/OODS-Forge`

**Branch:** `codex/sprint-191-paydown` from `d3a99d39` (`OODS-pro`, the Sprint 190 merge of PR #92)

**Canonical CMOS projectRoot:** `/Users/systemsystems/portfolio/Design-Tools/OODS-Forge`

The primary checkout is clean at `d3a99d39` on `Forge-expansion`, is the served bridge checkout (PM2 `/health.revision` = `d3a99d39`, delivered 2026-09-10) and the CMOS database location. **No mission touches it.** There is no delivery mission this sprint; Sprint 192 m01 delivers this sprint's reviewed head.

## Prompt for the fresh build session

```text
Build the locked Sprint 191 plan in /Users/systemsystems/.codex/worktrees/s191/OODS-Forge,
branch codex/sprint-191-paydown. Read agents.md and the locked
cmos/planning/forge-s191-paydown-decision-memo.md, then execute the five CMOS missions
serially from s191-m01 through s191-m05. Always pass
projectRoot="/Users/systemsystems/portfolio/Design-Tools/OODS-Forge" to CMOS tools.

Open with cmos_review, cmos_sprint(action="show", sprintId="sprint-191") and
cmos_decisions(action="list", sprintId="sprint-191"). Confirm the prepared branch and
clean worktree (if origin/OODS-pro has moved because PR #93 merged, merge it into the
branch first and record the head; it moves no runtime bytes), start a build-tracking
session, then start s191-m01. Do not re-plan the accepted slate. Never touch the primary
checkout or the PM2 process; never send a CMOS message; never print process environment
values or .env contents.

s191-m01 dark charts: dark categorical palette for brands A and B in the token scopes
chosen so every slot passes Role-C against that brand's dark canvas (the token build must
be changed to emit viz scale overrides into the [data-brand][data-theme] block; flat
cssVariables and the light CSS scopes stay byte-identical, hash pairs retained), the light
slot-04 repair with per-file golden attribution, the registry cell contrastPassed measured
by the census, code.generate options.theme/brand with the workflow app setting
data-theme/data-brand in index.html and at mount and APP_CSS reading token variables, and
the design loop rendering a theme into its receipt. Gate: 52-cell matrix with zero measured
contrast failures, registry equals census, dark receipts in both frameworks whose body
background and chart canvas equal the dark scope canvas.

s191-m02 two more workflows: close OODS-N016 generically in the workflow emitter
(collection-field handleChange_<field> resolver + seeded AddressableEntry), census to 77/77
and 154/154 with exactly the two workflow rows moving, the packed-app harness parameterised
by object with an address gate so Subscription, Organization and User pass in both
frameworks, design-loop receipts for both new apps, the s185/s186 pins untouched.

s191-m03 craft at the producer: the six #1845 items, the chart series and single title,
and the #1274 scaffold import, each fixed where the memo's §2 table locates it and proven
by BEFORE/AFTER design-loop receipts that map every item to a receipt line.

s191-m04 maintenance: record #1318 (write SR-27) and #1322's --final half as satisfied;
fix #1320 with a planted-sentinel bite and #1322's OODS-N013 registry entry; re-run and
correct #1319 and #1321 in their memos; assemble the portable runtime clean at the m04
head (--final twice, sha compared, manifest commit = head, dirty:false, e2e green) and
retain it; prepare, do not send, the re-pin notices.

s191-m05 proof and handoff: censuses, the matrix and contrast table, receipts, the bundle
at the frozen head, one four-suite capture under #1833, the advertised diff from d3a99d39,
the reconnect and re-pin notices prepared for Sprint 192 delivery, near.md Increment 10 at
BUILT, REVIEW PENDING with the roadmap tables updated, a PR to OODS-pro with CI observed,
and the review handoff with builderSelfCertified:false.

Every golden that moves is replaced in the mission that moves it, with the reason, before
any capture. Never widen a certification claim: the 8 ECharts-primary types stay
uncertified and HC pixels stay deferred. Never hand-edit a composed or saved schema;
enumerate census movement per schema by class. Ship first, verify with the suites the
change touches, one full capture at close. Record tests, failures, decisions, actual counts
and commit identities in CMOS. Stop with a complete independent-review handoff; leave
Sprint 191 Active and builderSelfCertified:false.
```

`build-tracking session` means `cmos_session(action="start", type="custom", title="Sprint 191 Build", sprintId="sprint-191", projectRoot=...)`. Use the mission lifecycle tool to start and complete each mission after inspecting its criteria.

## Prepared and checked

- Worktree created from `origin/OODS-pro` at `d3a99d39`, `pnpm install --frozen-lockfile`, `pnpm run build:tokens` and `pnpm run build:packages` succeeded; `git status --porcelain` empty. The primary `.env` is reachable through the ignored `.env` symlink; the canonical CMOS database stays in the primary checkout.
- Node `v24.6.0`, pnpm `9.12.2`. Build order that works: `build:tokens`, then `build:packages` (topological), then `@oods/mcp-bridge` and `pkg:build` when a bridge is needed. `@oods/viz-render test` rebuilds its own dist (learning #546): never run it in parallel with suites that consume that dist.
- Design loop: `pnpm design:loop serve | render --input JSON | diff BEFORE AFTER --output DIR | status` (`scripts/design-loop/README.md`); input examples in `artifacts/product-reality/sprint-189/m06/inputs/*.json` and `sprint-190/m06/inputs/final-light.json`; the per-screen driver `artifacts/product-reality/sprint-189/m06/run-browser-receipts.py`. Component/CSS package changes need a rebuild and a loop restart; composer/emitter changes take effect per render. Native select proofs need the retained Linux Playwright browser (learning #548).
- Census and closeout tooling to reuse with bounded s191 modes: `scripts/product-reality/s185-reachability.mjs` (the 77/75/150 gate at `:66` moves to 77/154), `s188-m03-app-consumers.ts`, `s190-viz-census.ts`, `s185-sprint-wide-movers.mjs`, `s185-closeout.mjs`, `s185-audit-closeout.mjs` (its "every non-green row is N016" assertions at `:438,922` become vacuous once the rows are green), `s185-reconnect.mjs`, and the Sprint 190 `m06/matrix-capture.ts` (calls the handlers directly; the bridge's dashboard `ChartPanel` schema is closed, so strip the fixture `name` field when posting through the bridge).
- Measured starting point is memo §2; decisions the builder does not reopen are memo §4; the descope ladder and never-cut list are memo §7. Mission order (dark charts → workflows → craft → maintenance → closeout) is deliberate: m01 moves goldens the rest build on, m02 gives m03 three apps to receipt, m04 proves the bundle recipe once before m05 repeats it at the frozen head.
