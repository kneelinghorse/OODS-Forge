# OODS Forge — first run, transcript

First-time user. Two documents only (README.md and the release's install.md), the six release files,
Node v24.6.0 on macOS (Darwin 25.3.0), Claude Code as the client.
Clean HOME at `…/m06-run-3/home`, scratch project at `…/m06-run-3/project`.
Paths below are abbreviated as `$RUN` = `/private/tmp/claude-501/-Users-systemsystems-portfolio-Design-Tools-OODS-Forge/3451bf4e-7b6f-40ae-a646-79864acacee2/scratchpad/m06-run-3`
and `$ASSETS` = `…/scratchpad/m06-assets-3` (the release page's files).

No command in this run failed. There are no errors to quote.

---

## 00:25:56Z — before the README: what the release page gave me

```sh
ls -la $ASSETS ; node --version
```

```
-rw-r--r--  544861  THIRD-PARTY-NOTICES.md
-rw-r--r--    3005  forge-runtime.manifest.json
-rw-r--r-- 32837995 forge-runtime.tar.gz
-rw-r--r--      87  forge-runtime.tar.gz.sha256
-rw-r--r--    6779  install.md
-rw-r--r--   70776  runtime-sbom-lite.json
v24.6.0
```

All six files install.md section 1 promises are there. Node 24.6.0 clears the 20.11.1 floor.

---

## Step 1 — Download and verify (00:26:06Z → 00:26:14Z, 8s)

Run from the directory holding the two downloaded files, as install.md section 3 says
("Run these in the directory that holds the two downloaded files; the digest file names the archive by its bare file name").

```sh
cd $ASSETS
shasum -a 256 -c forge-runtime.tar.gz.sha256
mkdir -p $RUN/home/forge-runtime && tar -xzf forge-runtime.tar.gz -C $RUN/home/forge-runtime
```

```
forge-runtime.tar.gz: OK
exit=0
exit=0
```

Verify + extract: 2 seconds for a 32 MB archive.

```sh
ls $RUN/home/forge-runtime
ls -la $RUN/home/forge-runtime/packages/mcp-adapter/index.js
```

```
COMMERCIAL.md  LICENSE  THIRD-PARTY-NOTICES.md  artifacts  configs  docs  domains
forge-runtime.manifest.json  node_modules  objects  packages  runtime-sbom-lite.json  schemas  traits

-rw-r--r--  10533  …/packages/mcp-adapter/index.js
```

Matches install.md: "Inside the archive, `LICENSE`, `COMMERCIAL.md` and `THIRD-PARTY-NOTICES.md` sit at the root beside the manifest",
and the entry point is where it says it is. The archive has no top-level folder, as warned, and `mkdir` first handled that.

---

## Step 2 — Install into the client (00:26:22Z → 00:26:24Z, 2s)

```sh
cd $RUN/project
HOME=$RUN/home claude mcp add forge -- node $RUN/home/forge-runtime/packages/mcp-adapter/index.js
HOME=$RUN/home claude mcp get forge
```

```
Added stdio MCP server forge with command: node …/packages/mcp-adapter/index.js to local config
File modified: …/m06-run-3/home/.claude.json [project: …/m06-run-3/project]
exit=0

forge:
  Scope: Local config (private to you in this project)
  Status: ✓ Connected
  Type: stdio
  Command: node
  Args: …/packages/mcp-adapter/index.js
  Environment:

To remove this server, run: claude mcp remove "forge" -s local
exit=0
```

`Status: ✓ Connected` is exactly the string install.md tells you to look for. No build, no npm, nothing to configure.

### The server definition used for every tool call below

Claude Code on this machine is logged in only under the real HOME, so the assistant runs in print mode from the real HOME
with install.md's Claude Desktop JSON block, path filled in, saved as `$RUN/project/forge.mcp.json`:

```json
{
  "mcpServers": {
    "forge": {
      "command": "node",
      "args": [
        "/…/m06-run-3/home/forge-runtime/packages/mcp-adapter/index.js"
      ]
    }
  }
}
```

Invocation form (prompt on stdin; the two `--add-dir` flags stand in for a user granting the assistant's read/write requests):

```sh
printf '%s' "<the request>" | claude -p --model sonnet --strict-mcp-config --mcp-config forge.mcp.json \
  --allowedTools "mcp__forge__*,Read,Write,Bash" --add-dir /private/tmp/claude-501 --add-dir /Users/systemsystems/.claude/projects
```

---

## Step 2 (continued) — `health` (00:26:36Z → 00:26:48Z, 12s)

Asked: *"Run the forge health tool. Report: status, the registry counts (objects, traits, components), server.uptime in
milliseconds, and the productReality.tools ledger by evidence tier. Also say how many forge tools you can see listed.
If a tool result was saved to a file, read that file rather than guessing; never invent values."*

```
**Status:** ok

**Registry counts:**
- Objects: 18
- Traits: 46
- Components: 110

**Server uptime:** 479 milliseconds

**productReality.tools ledger by evidence tier:**
- product-reality: 19 tools
- contract: 5 tools
- unit: 0 tools
- none: 0 tools
- Total entries: 24 tools

**Forge tools I can see listed:** I can see 28 forge tools available (all the `mcp__forge__*` prefixed tools in my available tools list).
exit=0
```

Every number the README's first paragraph claims — 18 objects, 46 traits, 110 governed components — came back from the
running server. The ledger is 24 entries split 19 / 5 exactly as the tool-surface table says.

The one wrong number here is the assistant's own: it said **28** forge tools where both documents say 19. Settled later
(see the re-ask): the real surface is 19. The assistant miscounted its own tool list; Forge advertised the documented 19.

---

## Steps 3, 5 and 6 — one conversation (00:27:21Z → 00:28:55Z, 94s)

The README's rule: "a `schemaRef` lives in the server your client started, for 30 minutes and for that conversation,
so make steps 3, 5 and 6 in one conversation." So all three went into one invocation.

Asked: *"Do these three forge tool calls in order, in this one conversation. 1. design.compose with
`{"object": "Subscription", "context": "detail"}` … 2. code.generate with `{"schemaRef": "<from call 1>", "framework":
"react", "profile": "build"}` … 3. repl with `{"action": "render", "schemaRef": "<the same schemaRef>", "apply": true,
"output": {"compact": false}}`. Save the returned html verbatim to …/subscription-detail.html and tell me the byte size."*

Returned (the assistant's final message; see Friction #1 for why only call 3's detail survived):

```
### Call 3 Results:
**Status:** ok
**HTML Saved:** Successfully saved to …/m06-run-3/project/subscription-detail.html
**File Size:** **215,664 bytes** (215.6 KB)
**Errors:** None

## Summary
1. ✅ design.compose - Created a Subscription detail view with 10 component slots, schemaRef `compose-ce8611e4`, valid for 30 minutes
2. ✅ code.generate - Generated React artifact with 2 files, contentHash `sha256:eb92ea7...`, passed 11 validation checks
3. ✅ repl.render - Rendered HTML successfully, saved as 215,664 bytes to subscription-detail.html
exit=0
```

All three calls succeeded on the first try, with the values the README predicts: a `compose-…` ref, a 2-file React
artifact, and a self-contained document.

---

## Step 4 — Certify a chart (00:29:22Z → 00:29:49Z, 27s)

Its own conversation (it shares no schemaRef). Asked for `viz.render` with the README's exact bar-chart JSON, then
`artifact.certify` with the returned `normalizedSpec`.

```
### 1. viz.render Results
**contentHash**: `5415fcfac8e391af4cccfa3bbb33c6c119b7b9f0f643a93101a2c7cee66d5fcd`
**a11y narrative**:
- Summary: "Bar chart compares Status; active leads at 17 while archived is lowest at 3."
- Key Findings: High Count: Count 17 (active) / Low Count: Count 3 (archived) / Total Count: 25
**a11y table**:
- Caption: "Data table for Bar chart"
- Columns: Status (non-numeric), Count (numeric); 3 rows: active (17), draft (5), archived (3)
**normalizedSpec**: ✓ returned, schema `https://oods.dev/viz-spec/v1`

### 2. artifact.certify Results
**coverage**: `certified`
**conformant**: `true`
**Four Pillars**: a11yEquivalence pass · determinism pass · contrast pass · accuracy pass
**findings**: `[]`
**accuracyRules**: 4 rules applied to this bar chart:
  OODS-V150 Non-zero bar baseline · OODS-V151 Dual axis · OODS-V152 Area scaling · OODS-V153 Undisclosed aggregation
All 4 accuracy rules were evaluated with 0 failing.
exit=0
```

This is the step that matched its documentation most exactly. The README promises `coverage: "certified"`, `conformant:
true`, four passing pillars, and that "four of the set apply to a plain bar chart" — all four, by name. The narrative is
derived from the same rows that were drawn ("active leads at 17 while archived is lowest at 3"), which is the
accessibility-equivalence claim doing visible work rather than asserting itself.

---

## Step 6 — Look at it (00:30:00Z → 00:30:16Z, 16s)

```sh
open $RUN/project/subscription-detail.html          # exit=0, opened in the browser
grep -o '<title>[^<]*</title>' subscription-detail.html
grep -oE '<h[1-4][^>]*>[^<]*</h[1-4]>' … | sed -E 's/<[^>]*>//g'
grep -oE 'data-oods-component="[^"]*"' … | sort | uniq -c | sort -rn
```

**What the document contains**

Head:

```
<!DOCTYPE html>
<html lang="en" data-theme="light" data-brand="default">
  <title>OODS Preview</title>
  <style data-source="tokens">
    :root { --oods-viz-scale-categorical-01: oklch(0.3 0.11 17.5); /** scale.categorical.01 … */
```

- **Title**: `OODS Preview` — the exact title the README names.
- **Token CSS inline**: two `<style>` blocks, the first `data-source="tokens"`, OKLCH custom properties carrying their
  token path in a comment. 215,664 bytes, self-contained, which is what `output.compact: false` buys.
- **Headings in the text**: `Details`, `Status Timeline`, `Cancellation Summary`, `Archive Summary`, `Billing cycle`, `Payments`.
- **Component markers**: 49 `data-oods-component` attributes over 15 distinct components —
  Text ×18, Stack ×14, Table ×3, Tabs ×2, Card ×2, and one each of VizAreaPreview, StatusTimeline, PaymentTimeline,
  DetailHeader, CycleProgressCard, CancellationSummary, ArchiveSummary, Button, Banner, Badge.
  Also 39 `data-oods-node-id`, one `data-oods-surface`, one `data-oods-label`.
- **Visible text** (tags stripped): "Details · Area preview (640 x 360) · Status Timeline: No events · Cancellation
  Summary: Cancel at period end `cancel_at_period_end`, Reason `cancellation_reason`, Code Cancellation Reason Code ·
  Archive Summary: Reason `archive_reason` · Created at · Updated at · Last event · Last event at · Subscription id ·
  Plan code · Plan interval · Customer name · Customer email · Billing cycle: Progress unavailable · Remaining days
  unavailable · Payments: No amount USD · pending · Payment method: Not provided · Last payment: No previous payment ·
  Next payment: No payment scheduled".

That is the README's sentence made literal: "the composed screen's structure (its header, tabs, summaries and timelines)
with placeholder values where live data would go." The header, the two tab groups, both summaries and both timelines are
all present, and every value position is a field name or an explicit "unavailable" / "Not provided" rather than a fake number.

---

## Verification re-ask — not a README step (00:30:26Z → 00:32:00Z, 94s)

Print mode prints only the assistant's final message, so the detail of calls 1 and 2 above never reached me. Re-ran
`design.compose` and `code.generate` in a fresh conversation (a new server process, hence a new ref) and asked for the
full selections, warnings and receipt, plus the exact tool list.

**A. Tool list — 19, as documented.** `tokens_build, structuredData_fetch, brand_apply, brand_intake, catalog_list,
code_generate, design_compose, design_preview, pipeline, viz_render, dashboard_render, artifact_certify, health,
registry_snapshot, fidelity_preview, map, schema, object, repl`. The earlier "28" was the first assistant's miscount.

**B. `design.compose` detail.** `status: ok`, `layout: detail`, `schemaRef: compose-43b27431`, created
2026-09-15T00:30:33.798Z, expires 2026-09-15T01:00:33.798Z — a 30-minute TTL, as the README says.

`objectUsed`: Subscription **2.0.0**, traits `lifecycle/Stateful`, `lifecycle/Cancellable`, `lifecycle/Timestampable`,
`financial/Billable`, `lifecycle/Archivable`, `viz/MarkArea`; 36 fields; view extensions applied list 4, detail 7,
form 4, timeline 5, card 4.

`selections`, 10 slots:

| slot | component | confidence | reason (abridged) |
| --- | --- | --- | --- |
| tab-0 | CycleProgressCard | 0.95 | view_extension placement |
| tab-1 | PaymentTimeline | 0.95 | view_extension placement |
| header | VizAreaPreview | 0.95 | view_extension placement |
| tab-2 | Stack | 0.71 | preferred for "metadata-display" (rank 1); position affinity |
| metadata | AuditTimeline | **0.40** | 1 tag match; tag match (metadata); 1 context; 1 region; 2 traits — **reviewHint** |
| tab-3 | StatusBadge | 1.00 | preferred for "status-indicator" (rank 1); name contains "status" |
| tab-4 | Text | 0.76 | field affinity: field type "datetime" (rank 3) |
| tab-5 | Card | 0.94 | preferred for "data-display" (rank 1) |
| tab-6 | Stack | 0.71 | preferred for "metadata-display" (rank 1) |
| tab-7 | Card | 0.94 | preferred for "data-display" (rank 1) |

The README's worked example — "for example `CycleProgressCard` for `tab-0` at `0.95`" — is exactly right.

`reviewHint` on `metadata`: *"Low-confidence selection for "metadata". Consider preferences.componentOverrides to pin a
different component if needed."* with `alternativeCandidates` TagSummary (0.95), TagManager (0.9).

Warnings, 14, verbatim:

```
OODS-V121: Object 'Subscription' has maturity 'beta' — composed output may change.
OODS-V117: Field collision: "status" in object schema overrides trait definition
OODS-V117: … "cancel_at_period_end" …          OODS-V117: … "cancellation_reason" …
OODS-V117: … "cancellation_requested_at" …     OODS-V117: … "amount" …
OODS-V117: … "currency" …                      OODS-V117: … "billing_interval" …
OODS-V117: … "current_period_start" …          OODS-V117: … "current_period_end" …
OODS-V117: … "current_period_progress" …       OODS-V117: … "last_payment_at" …
OODS-V117: … "next_payment_due_at" …
OODS-V120: No matching slot for position "bottom" from lifecycle/Timestampable/AuditTimeline.
```

The README warned about precisely these three things before I saw them: "the shipped `Subscription` is beta, some of its
fields override trait defaults, and one contribution has no slot in the detail layout". Twelve collisions, one beta
notice, one unplaced contribution. Being told in advance that warnings are normal on this call, and which ones, is the
difference between a clean run and a support question.

**C. `code.generate` detail.**

- `artifact.files`: `src/GeneratedUI.tsx`, `src/charts/payment-001.svg` — the two paths the README names.
- `artifact.contentHash`: `sha256:eb92ea79759284a6f1e47f618e024e415b275d2bdefe7e0fb0c2659840a3ef35`
- `artifact.dependencies`: `@oods/component-contracts` 0.1.0, `@oods/component-styles` 0.1.0, `@oods/components-react`
  0.1.0 (dependencies); `react` 19.2.0, `react-dom` 19.2.0 (peerDependencies).
- `validationReceipt`: profile `build`, defaulted false, rationale "Build is the default minimum gate for a runnable
  artifact: target, bindings, dependencies, and fallbacks must resolve"; axes scope `generated-artifact`, enforcement
  `blocking`, fallback `forbidden`, target requested react / resolved react / source explicit.
  - **checks that ran (11)**: schema-structure, component-registry, state-contract, target-readiness,
    normalization-fidelity, binding-contract, props-contract, slots-contract, events-contract, dependency-closure,
    fallback-policy.
  - **notChecked (7)**: rendered-evidence, interaction-evidence, accessibility-evidence, theme-evidence,
    determinism-evidence, performance-evidence, certification-evidence.

**Determinism, checked by accident.** The two `code.generate` calls ran in two different conversations against two
different server processes, from two different `schemaRef`s (`compose-ce8611e4` and `compose-43b27431`), ten minutes
apart. Both returned `sha256:eb92ea79759284a6f1e47f618e024e415b275d2bdefe7e0fb0c2659840a3ef35`. The README's claim that
"the same inputs give the same hash" held across processes without my trying to test it.

The `notChecked` list is the honest half of the README's claim that "No receipt claims a check it did not run": the
receipt names seven things it did not verify, including determinism-evidence, on the same artifact whose hash I had just
reproduced independently.

---

## After the run — did anything get written?

```sh
ls $RUN/home/forge-runtime/artifacts/current-state   # No such file or directory
ls -d $RUN/home/forge-runtime/.oods                  # No such file or directory
ls -la $RUN/project                                  # forge.mcp.json, subscription-detail.html
```

install.md section 7 says "Read-only use creates no files." True: nothing appeared under the extracted runtime, not even
from `repl` with `apply: true` (which returns the document rather than writing it). The only artifacts of the whole run
are the two files I asked for in my own project directory.

## Release manifest (read for the issue's version field)

`commit 723bc2195cb99fa3482cad3fbd5700d8713e9a7e`, dirty false, date 2026-09-14T19:23:38-05:00, nodeFloor `>=20.11.1`,
`@oods/mcp-adapter` 0.3.0 with every other package 0.1.0, `registry.autoCount 19` + `onDemandCount 5`,
archive sha256 `338dc780cf206df5082a1796bb44f696ec57b0c0b351841b6c3446c77b2f6aa9`, 283 third-party packages,
`archivePacking.determinismCertified: true`. The 19/5 split in the manifest matches the README's tool-surface table and
the ledger `health` returned.

---

## Outcome

install ✓ · compose ✓ · certify ✓ · generate ✓ · see ✓ — five of five, no failures, no retries, no workarounds.
Install to seeing the screen: **234 seconds (3 min 54 s)** against the README's "in ten minutes".
