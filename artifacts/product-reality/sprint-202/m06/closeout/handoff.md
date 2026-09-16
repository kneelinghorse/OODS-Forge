# Sprint 202 — built, review pending

Builder self-certified: **false**. Independent review, delivery, and the Claude Desktop and Cursor runs remain separate. GitHub CI is off, so every gate below is a local command with its log in this tree.

| Head | Commit | What it is |
| --- | --- | --- |
| Implementation | `c374f090b` | m05's receipts, the last mission commit |
| Pre-freeze | `202805582` | The Sprint 202 modes, the roadmap row and the part A receipts |
| Part B | `99f3d501d` | The chart gate and the frozen bundle |
| Part B receipts | `56d54d8cc` | The E2E and the Linux proof, with the tool ledger bound to them |
| Capture | `74abd729f` | The two moved root-core pins and the retained red capture; the head the five-suite capture measured |
| Execution | tip of `codex/sprint-202-conversation-preview` | The commit that adds this handoff |

## What was built

The running-app preview that Sprint 201 put in the browser now opens inside the conversation, as an MCP Apps `ui://` resource served by the stdio adapter from the extracted bundle. From that view a person:
- edits the composition;
- compares two versions;
- accepts one, which saves the version with its measurements;
- requests changes.

By mission:
- **[m01, the Sprint 201 carries closed](../../m01/README.md):**
  - Placed-chart titles moved into the figure heading, with a narrow render. The smallest axis label at 390px went from 4.68px to 9.24px.
  - Every generated page has one `main` and one `h1`. The three axe findings are at zero in both frameworks, light and dark.
  - Swap candidates are limited to those that re-compose and pass the target contracts.
  - A brand or theme switch mounts the placed chart generated and certified for that scope.
  - One 240-cell re-sweep: 240/240, with 214 hashes moved and attributed.
- **[m02, the adapter speaks MCP Apps](../../m02/README.md):**
  - `resources` and the `io.modelcontextprotocol/ui` negotiation;
  - `_meta.ui.resourceUri` on `design_preview`, only when negotiated;
  - `structuredContent` beside the unchanged text;
  - the revisioned app resource, and the composition module, style, record and lineage resources, through an `iife` compile;
  - the client and the negotiation named on stderr;
  - the reference host: the SDK's `app-bridge` in Chromium under the default CSP.
- **[m03, the preview app](../../m03/README.md):**
  - One self-contained HTML resource with the runtime inlined.
  - It mounts the running React or Vue app with lineage, measurements, and framework, brand, theme and width switches, taking the host's theme and container width.
  - It matched the browser page in both frameworks, both brands and three themes.
- **[m04, act from the conversation](../../m04/README.md):**
  - the four edits;
  - side by side with what changed;
  - `action:"accept"` writing `accepted.json` with the measurements snapshot and supersession (OODS-V205 refuses the standing or an ungenerated version), shown on the app and the browser page;
  - the accepted summary through `ui/update-model-context`;
  - request changes as `ui/message`;
  - an m01 regression in the swap-candidate trial, fixed at the producer.
- **[m05, from the bundle into Claude Desktop and Cursor](../../m05/README.md):**
  - the install path: Developer Mode, Reload MCP Configuration, direct registration beside a hub;
  - the archive's E2E with the MCP Apps resources and the negotiated `design_preview`;
  - the Linux container proof;
  - the host receipt folder, left empty for Derek's runs.

## Review these receipts

- **Pre-freeze:**
  - [part A](../pre-freeze/part-a-status.txt) and [part B](../pre-freeze/part-b-status.txt), with every gate's log and exit code;
  - the [chart gate report](../pre-freeze/viz-gate/report.json);
  - the frozen bundle's [manifest](../pre-freeze/portable-manifest.json), [digest](../pre-freeze/portable-archive.sha256), [E2E receipt](../pre-freeze/e2e-host.json) and [Linux proof](../pre-freeze/linux/preview-proof.json).
- **Closeout:** the [censuses](censuses.json), the [runtime generation census](runtime-census.json), the [advertised diff attributed by mission](advertised-diff.json) and the [golden ledger](../../golden-ledger.json).
- **Capture:** the [accounting](../capture/head-accounting.json) and the [raw five-suite capture](../capture/forge-s202-m06-head/).
- **The conversation surface in the reference host:** [m02](../../m02/reference-host/reference-host.json), [m03](../../m03/reference-host/preview-app.json) and [m04](../../m04/reference-host/preview-acts.json).

## Verified scope

**The frozen bundle.** `forge-runtime.tar.gz` at `99f3d501d`: sha256 `d314933412f7504ef054a159355834b4432c0507cc0a640d1f20ada97f046dbe`, 55,909,250 bytes, 315 packages in the production closure, 20,947 payload entries, terms and brand source aboard, `dirty: false`. Its extracted-runtime E2E passed with all 19 advertised tools executed and 0 typed limits.

**The conversation surface from the archive.** In that same run, a client that negotiated `io.modelcontextprotocol/ui` saw the adapter advertise `resources` and the extension, `_meta.ui.resourceUri` on `design_preview` alone, and exactly one listed resource: the shipped preview app (2,105,938 bytes, revision `87de86c9408e`), read back byte for byte. Its `design_preview` call carried `structuredContent` equal to the text plus the resource URIs, and the compiled modules, styles, version record (head `99f3d501d`) and lineage list were read through `resources/read`. The restart client declared nothing, got no `_meta.ui` and kept the text result. The same archive passed in the pinned Linux container (linux-arm64, Node v22.20.0) with 20 of 20 checks and a matching digest.

**The tool ledger** is in mode `s202`, bound to that receipt (`pre-freeze/e2e-host.json`, sha256 `67194d59…`): 24 rows, 19 auto, 19 executed from the archive, 0 typed.

**Rosters and registries.** Canonical runtime roster 18 objects / 240 cells, re-swept once in m01 (240/240, run `07270109-60fb-49ad-aea8-667036fa5e9b`); the generation census at the capture head re-composed and re-generated every row and found all 240 hashes equal. The release ledger is 42 cells and did not move. 110 component identities / 1,320 theme cells, with one stylesheet file changed for the placed chart's figure. Viz 13 types / 78 render scopes / 23 patterns, with every viz registry and the certified matrix byte-identical to the base.

**The advertised diff** from `04182b116`: 12 commits, 4,846 changed paths (4,653 of them m01's receipts and sweep), 24 advertised-surface paths attributed to their commits (`closeout/advertised-diff.json`).

## Test accounting

One numbered run at the capture head `74abd729f`, serial files (`maxWorkers=1`), a 60 s test timeout, suites sequential, every cleanliness checkpoint clean (14 of 14), 2026-09-15T23:17:03Z → 23:59:11Z. **Status: passed.** The five counts stated separately:

| Suite | Status | Passed | Failed | Skipped | Failed files | Uncollected |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| viz-core | passed | 1,546 | 0 | 0 | 0 | 0 |
| viz-render | passed | 72 | 0 | 0 | 0 | 0 |
| mcp-server | passed | 7,181 | 0 | 16 | 0 | 0 |
| root-core | passed | 7,565 | 0 | 16 | 0 | 0 |
| component-packages | passed | 1,485 | 0 | 0 | 0 | 0 |
| **Total** | **passed** | **17,849** | **0** | **32** | **0** | **0** |

The 32 skipped executions are the same 16 optional external Stage1 cases collected by both MCP and root. Raw Vitest JSON per suite under `../capture/forge-s202-m06-head/run-1/`, the harness log in `../capture/capture.log`, the accounting in `../capture/head-accounting.json`.

An earlier capture at `56d54d8cc` is retained as a red receipt at `../capture/attempt-1-56d54d8cc/`: 17,847 passed, 2 failed, 32 skipped, 2 failed files, every checkpoint clean. Its two failures were stale root-core expectations left behind by m01's producer change — the multi-screen emission's page landmark, and the pattern census observations path in `docs:check`. Both pins moved at `74abd729f`, which is the head this capture measured.

## Golden ledger and sealed receipts

`artifacts/product-reality/sprint-202/golden-ledger.json` holds 215 entries, all from m01: 214 runtime-cell generation hashes and the registry head `315dcf118` → `e3a66b108`.
- No chart golden, chrome snapshot, recipe registry or contracts fixture moved.
- The three must-not-move files are byte-identical to the base `04182b116`: the viz pattern registry, the certified matrix and the Sprint 196 package-shape baseline.
- The sealed Sprint 195–201 receipts are byte-identical across the branch.

## Carries for the next sprint's m01

- **The adapter's description verb check.** `packages/mcp-adapter/test-s55-m03.js` ("Descriptions start with an action verb") fails 15/16, as it did at the Sprint 201 base `04182b116`. Seven advertised descriptions start with words outside its list: `health` ("Read"), `artifact.certify` ("Certify"), `map`, `schema`, `object` and `repl` ("Grouped"), and `design.preview` ("Open").
- **axe-core inside the conversation view** does not run (descope rung 1). The app's panel shows what the version stored from the browser page.
- **`heading-order` on the timeline title.** With the level-one heading in place, axe reports `heading-order` (moderate, one node) on the StatusTimeline title, an `h3` directly after the `h1`. This is the m01 residual.
- **The Claude Desktop and Cursor renders** are Derek's runs. `m05/hosts/README.md` states the receipt shape. A reference-host or archive pass is not a host pass.
- **Delivery and the roadmap closure.** Delivering this head to the served bridge (fast-forward, install, build, PM2 restart, `/health`) belongs to the reviewing session, as does the near.md closure paragraph.

## Not done, by rule

No npm publish, no tag, no release, no consumer notices, no primary-checkout build or PM2 restart, and no edits to the Claude Desktop or Cursor configuration files.
