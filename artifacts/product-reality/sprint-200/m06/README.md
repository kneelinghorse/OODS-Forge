# s200-m06 — the ten-minute proof

Builder self-certified: **false**. Base 86aedaa49 (the m05 commit) on `codex/sprint-200-available`; the fix commits are 5c02dee27 and 723bc2195 and the receipts commit records the head. The outside-individual measurement that near.md §6 names as the Phase C exit follows Derek's public flip; it is recorded as the exit when it happens and does not block closing Sprint 200 (memo decision 11).

## The proxy for "a person who is not Derek"

Before the flip nobody outside can reach a draft on a private repository, so each run is a fresh agent session (a general-purpose subagent on Opus) that knows nothing about Forge beyond two documents, README.md and the release's install.md, pasted into its instructions, plus the six release assets downloaded for it with the owner's token into a clean directory. It works in a clean HOME for the install and registration steps (`HOME=<clean> claude mcp add …`, `claude mcp get forge`) and an empty scratch project; it may not read, list or search anything else on the machine, and may not use any MCP tool it already has. Its instructions (`run-N/session-prompt.md`) are the same for every run except the harness corrections listed below; nothing in them explains Forge.

Where the README says "ask the assistant", the session is the assistant's stand-in: Claude Code in print mode from the scratch project, with the same server definition install.md gives (the Claude Desktop JSON block, path filled in) and `--strict-mcp-config`, run with `--model sonnet` to keep usage low. Print mode is one conversation per invocation and the server lives for that conversation, which is exactly the README's rule for a `schemaRef`; the session therefore asks for the calls that share a ref in one message, as a person does in one chat. The clean HOME cannot log in to Claude Code (the credential is keychain-scoped to the real HOME), so the print-mode calls use the real login with the documented config; the registration itself is proven in the clean HOME. Each session records its commands verbatim with timestamps, per-step wall seconds, every point of friction in its own words, and one issue through the "This did not read right" template when something read wrong.

## Run 1 — 838 s total, install → see 826 s, all five steps passed; issue #113

`run-1/` holds `transcript.md`, `timings.json`, `friction.md`, `issue.md`, the raw tool outputs, the saved `subscription-detail.html` and its screenshot (`subscription-detail.png`, rendered by the builder with Playwright). Against the first draft archive (`eca3704c…5adf`, head 59269dd7f).

| Step | Seconds | Outcome |
| --- | --- | --- |
| 1 verify + extract | 3 | pass |
| 2 `claude mcp add` / `get` → `✓ Connected` | 1 | pass |
| 2 `health` (two failed print-mode forms, then 12 s) | 424 + 2 + 12 | pass on the third form |
| 3 `design.compose` | 29 | pass |
| 4 `viz.render` + `artifact.certify` | 22 | pass |
| 5 `code.generate` with the step-3 ref | 13 | fail: OODS-N003 (new server process) |
| 3+5+6 re-composed, two attempts | 127 + 78 | pass on the second |
| 6 open and describe | 1 | pass |

Harness time inside that total: 424 s (a print-mode form whose variadic `--allowedTools` swallowed the prompt and blocked on stdin) and 127 s (a large tool result spilled to a file the assistant could not read). The Forge-side path was about 275 s.

Friction, in the session's order of cost, and what changed at the producer (commit 5c02dee27):

| Friction (verbatim gist) | Producer fix |
| --- | --- |
| The `schemaRef` "lasts 30 minutes" but `code.generate` 68 s later returned OODS-N003: the ref is scoped to the server process and a new assistant session is a new process. Issue #113. | README states the rule before the first-run list and in the schema-ttl block ("inside the server process that issued them; a restarted client starts a new one that does not know earlier refs"); the `design.compose` description states the scope; the missing-ref message from `code.generate`, `repl` render and `repl` validate says why and what to do. |
| `health` reports 18 objects; the README said 19 twice. | The README renders the unique object count (`{{objectNames}}`, the number `health` serves), not the definition count. |
| Certify reports "4 rules evaluated" against the README's 16 accuracy rules. | README: a chart is graded on the rules that apply to its type, and the result names them; step 4 says four apply to a plain bar chart. |
| The preview document is titled "OODS Preview" and shows field keys as placeholder values; compose named `VizAreaPreview` for `header` while the markup carries `DetailHeader` too. | README step 6 says what the document shows (structure with placeholder values, title `OODS Preview`). The renderer's placeholder convention and the header-slot naming are craft residue for the next craft pass, recorded here. |
| Compose returns three warnings (V121 beta, V117 field collisions, V120 unmatched slot) and a 0.40-confidence slot on the README's own sample call. | README step 3 says the warnings are normal on this call and what each means, and points at the overrides bullet. |
| A failed generate returns a receipt with every check under `notChecked`. | Honest behaviour; no change. |
| The archive has no top-level directory; install.md names the Node floor but not what the bundle is tested on. | install.md says both (extract into a directory you created; built and exercised on Node 24). |

## Run 2 — 683 s total, install → see 665 s, all five steps passed; issue #114

`run-2/` holds the same files, against the refreshed archive (`252fb715…16d6`, head 5c02dee27) and the README and install.md of that head.

| Step | Seconds | Outcome |
| --- | --- | --- |
| 1 verify + extract | 4 | pass |
| 2 install + `health` | 26 | pass |
| 3+5+6 in one conversation, attempt 1 | 193 | fail: empty reply, no file |
| 3+5+6 attempt 2 | 176 | fail: spilled results unreadable; the assistant invented values |
| 3+5+6 attempt 3 | 80 | partial: HTML saved, other calls not reported (a mis-quoted flag) |
| 4 `viz.render` + `artifact.certify` | 21 | pass |
| 3+5 fields re-asked | 44 | pass |
| 6 open and describe | 4 | pass |

Harness time inside that total: 369 s in two dead conversations, because `code.generate` (~97 KB) and the rendered document (~250 KB) are saved by the client to a file the assistant had no permission to read; in the second of them the assistant fabricated a summary (`App.tsx`, `@oods/design-system`, "All three calls completed successfully") instead of saying it could not see the result. The Forge-side path was 179 s.

Friction and producer fixes (commit 723bc2195):

| Friction (verbatim gist) | Producer fix |
| --- | --- |
| Large tool results silently break the "ask the assistant" steps and nothing warns you; the assistant's fabricated reply is the dangerous failure. | README: a paragraph after the first run says which calls return large results and that a client asking to read a saved result should be allowed to, and that a reply written without seeing the result is a guess. The harness grants the stand-in assistant `Read`, `Write` and `Bash` and the spill directory, as an interactive user would when asked. Payload size itself is unchanged (next craft pass: an option to write the document to a file). |
| `health` does not report the "19 auto tools, 24 total" install.md promised; it reports evidence tiers that happen to split 19/5. Issue #114. | install.md §5 and README step 2 say what `health` reports (registry counts, `server.uptime` in milliseconds, the tool ledger by evidence tier) and that the client's tool list is the surface. |
| `health` reported 543 s of uptime on a server started 30 s earlier. | It was 543 ms: the `health` description and output schema now state the unit. |
| Step 4 changes subject without saying so: it certifies a standalone chart, not the screen's. | Step 4 says the screen's chart is rendered inside code generation and this step makes a chart of its own to certify. |
| The `schemaRef` rule is stated three times, buried in step 3's parenthetical. | Stated once before the list; step 3 refers to it. |
| The `.sha256` check only works from the download directory. | install.md says to run the check where the two files are. |

## Run 3 — 354 s total, install → see 234 s, all five steps passed first time; issue #115

<!-- run-3:start -->
`run-3/` holds the same files, against the final archive (`338dc780…6aa9`, head 723bc2195) and the README and install.md of that head, with the harness corrections from run 2 (the stand-in assistant may read a saved tool result and write the HTML file). **Install → see: 234 s (3 min 54 s); all five steps passed on the first attempt; total session 354 s including a 94 s verification re-ask that is not a README step.** Issue #115.

| Step | Seconds | Outcome |
| --- | --- | --- |
| 1-download-and-verify | 8 | pass |
| 2-install-into-client-and-health | 26 | pass |
| 3+5+6a-compose-generate-render (one conversation) | 94 | pass |
| 4-certify-a-chart | 27 | pass |
| 6b-look-at-it (open and describe) | 16 | pass |
| 7-verification-re-ask (not a README step) | 94 | pass |

Every headline number the README states was confirmed live by the session (18 objects, 46 traits, 110 components, a 24-entry ledger split 19/5, a 19-tool default surface); step 4's output matched its documentation value for value; the 14 compose warnings fell into the three classes the README names; two `code.generate` calls in two server processes ten minutes apart produced the same `contentHash`; nothing was written under the extracted runtime.

Friction and producer fixes (the receipts commit):

| Friction (verbatim gist) | Producer fix |
| --- | --- |
| The Overrides example pins `header` to `DetailHeader`, but on the sample call `header` is 0.95 with no hint and `DetailHeader` is not among its candidates; the slot with the `reviewHint` is `metadata` (AuditTimeline at 0.40). Issue #115. | The README's example names the `metadata` slot and one of its listed candidates (`TagSummary`) and says a pinned slot returns at 1.0 with the reason "explicitly pinned" (measured). |
| Three calls in one conversation come back as one summary; the first two calls' fields needed a second conversation. | Client behaviour under the proxy (one message for three calls); the README already lists each call's fields. Recorded, no change. |
| A selection at `0.40` sits next to the same component at `1.0` in its own candidate list (`metadata`/AuditTimeline, `tab-2`/Stack). | Composer craft residue for the next craft pass: the slot confidence and the candidate score are different measures with the same name. Recorded. |
| The `header` slot resolves to `VizAreaPreview`, so the screen opens with an empty "Area preview" box above everything. | Craft residue (the view-extension placement puts the chart preview in the header region); recorded for the next craft pass. |
<!-- run-3:end -->

## The README after the runs

`readme-rendered.html` is the GitHub markdown API rendering of README.md at sha256 `95789578c2b46b332101e194aef409a6095bab4e613dfb8e63594c436c1b4fd3` (the m06 wording: the schemaRef rule before the list, the health sentence, the chart-of-its-own clause, the large-results paragraph, the corrected overrides example); one ordered list of six steps, read once by the builder. The m05 receipt keeps the m05 rendering.

## The release under the runs

The draft release was rebuilt with `--final` at each fix head and retargeted (5c02dee27, then 723bc2195), its six assets uploaded with `--clobber`; `release-refresh/` holds the receipt, manifest, sidecar, the E2E of the final archive (`e2e-host.json`, also the ledger's receipt at `../m04/e2e-host.json`) and the clean-HOME Claude Code proof against the final extraction. No tag exists; the release stays a draft until Derek flips the repository public.

## Phase C exit, after the flip

The outside-individual run needs: the public release URL (`https://github.com/kneelinghorse/OODS-Forge/releases`), the same six assets, README.md on the public repository, and the same six steps. The measurement is install → compose → certify → generate → see, timed by the person, plus one issue through a template; the bar is ten minutes. Nothing else changes: the docs the fresh sessions read here are the docs a person reads there.

## Gates run here

- Per fix commit: `pnpm docs:claims`/`docs:check`, `node scripts/runtime/client-configs.mjs --check`, `render-license --check`, `pnpm typecheck`, the README, claims, runbook, registry and license specs, the ledger and tool-specs specs, the health specs.
- Per release refresh: `portable:assemble --final` and `portable:e2e` against the extraction (18 pass, 1 typed), the clean-HOME Claude Code proof, the ledger regenerated at the frozen head.
