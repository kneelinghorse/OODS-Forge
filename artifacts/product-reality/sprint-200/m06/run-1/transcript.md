# First-run transcript — OODS Forge runtime, 2026-09-14

All times UTC. Extract dir: `<RUN>/home/forge-runtime`. Scratch project: `<RUN>/project`.
`<RUN>` = `/private/tmp/claude-501/-Users-systemsystems-portfolio-Design-Tools-OODS-Forge/3451bf4e-7b6f-40ae-a646-79864acacee2/scratchpad/m06-run-1`.
`<ASSETS>` = `.../scratchpad/m06-assets` (the release page's files).

---

## Step 1 — Download and verify (23:38:03Z → 23:38:06Z, 3s, PASS)

```sh
cd <ASSETS>
shasum -a 256 -c forge-runtime.tar.gz.sha256
mkdir -p <RUN>/home/forge-runtime && tar -xzf forge-runtime.tar.gz -C <RUN>/home/forge-runtime
```

```
forge-runtime.tar.gz: OK
exit=0
(tar) exit=0
```

Extracted top level:

```
COMMERCIAL.md  LICENSE  THIRD-PARTY-NOTICES.md  artifacts  configs  docs  domains
forge-runtime.manifest.json  node_modules  objects  packages  runtime-sbom-lite.json
schemas  traits
```

Manifest: `"commit": "59269dd7f376058216f8c8077719d304de5f31c4"`, archive sha256 `eca3704c…`.

---

## Step 2 — Install into the client (23:38:15Z → 23:45:56Z)

### 2a. Register (23:38:15Z → 23:38:16Z, 1s, PASS)

```sh
node -v
# v24.6.0
HOME=<RUN>/home claude mcp add forge -- node <RUN>/home/forge-runtime/packages/mcp-adapter/index.js
HOME=<RUN>/home claude mcp get forge
```

```
Added stdio MCP server forge with command: node <RUN>/home/forge-runtime/packages/mcp-adapter/index.js to local config
File modified: <RUN>/home/.claude.json [project: <RUN>/project]
exit=0

forge:
  Scope: Local config (private to you in this project)
  Status: ✓ Connected
  Type: stdio
  Command: node
  Args: <RUN>/home/forge-runtime/packages/mcp-adapter/index.js
  Environment:

To remove this server, run: claude mcp remove "forge" -s local
exit=0
```

### 2b. `health`, attempt 1 — HUNG, killed after 424s (23:38:24Z → 23:45:28Z, FAIL)

Server definition written from install.md's Claude Desktop JSON block to `<RUN>/project/forge.mcp.json`:

```json
{
  "mcpServers": {
    "forge": {
      "command": "node",
      "args": [
        "<RUN>/home/forge-runtime/packages/mcp-adapter/index.js"
      ]
    }
  }
}
```

```sh
claude -p --model sonnet --strict-mcp-config --mcp-config forge.mcp.json --allowedTools "mcp__forge__*" "Run the forge health tool. Report status, the registry counts, and the tool count."
```

No output for 7 minutes; no adapter child process ever appeared:

```
ps -eo pid,ppid,etime,command | grep -E "claude|forge-runtime"
48888 48883       05:12 claude
48889 48883       05:12 tee <RUN>/out/raw-health.txt
```

Killed at 23:45:28Z. Cause found on the retry (below): `--allowedTools` is variadic, so it swallowed the
prompt string as a second allowed-tool pattern and the CLI then blocked reading a prompt from stdin.
This is the stand-in CLI invocation, not Forge.

### 2c. `health`, attempt 2 — 2s, FAIL (23:45:28Z → 23:45:30Z)

```sh
claude -p --model sonnet --strict-mcp-config --mcp-config forge.mcp.json --allowedTools "mcp__forge__*" "Call the forge health tool and paste its status, registry counts and tool count." < /dev/null
```

```
Error: Input must be provided either through stdin or as a prompt argument when using --print
exit=1
```

### 2d. `health`, attempt 3 — 12s, PASS (23:45:44Z → 23:45:56Z)

```sh
echo "Call the forge health tool and paste its status, registry counts and tool count." | claude -p --model sonnet --strict-mcp-config --mcp-config forge.mcp.json --allowedTools "mcp__forge__*"
```

```
**Status:** ok
**Registry Counts:**
- Components: 110
- Traits: 46
- Objects: 18
- Last Sync: 2026-09-14T00:00:00Z
**Tool Count:** 24 tools
- Product Reality tier: 19
- Contract tier: 5
- Unit tier: 0
- None tier: 0
**Additional Details:**
- Server version: 0.1.0
- Uptime: 506 seconds
- Token brands: A, B
- Token themes: dark, hc, light
- Saved schemas: 0
- DSL version: 1.0
The server is healthy with 240 runtime cells (all passing) and 42 release cells (all passing), with no typed gaps or failures.
```

Note: `Objects: 18`. The README says "19 object definitions" twice.

---

## Step 3 — Compose one screen (23:46:06Z → 23:46:35Z, 29s, PASS)

```sh
echo 'Call design.compose with {"object": "Subscription", "context": "detail"}. Report status, layout, schemaRef, objectUsed, and the selections (component, confidence, reason per slot).' | claude -p --model sonnet --strict-mcp-config --mcp-config forge.mcp.json --allowedTools "mcp__forge__*"
```

```
Status: ok
Layout: detail
schemaRef: compose-b8fc9aa5   (created 23:46:15.980Z, expires 2026-09-15T00:16:15.980Z, 30-minute TTL)
objectUsed: Subscription 2.0.0, maturity beta, 6 traits
  (lifecycle/Stateful, lifecycle/Cancellable, lifecycle/Timestampable,
   financial/Billable, lifecycle/Archivable, viz/MarkArea), 36 fields
  view extensions: list 4, detail 7, form 4, timeline 5, card 4
Selections (10 slots):
  tab-0    CycleProgressCard    0.95   view_extension placement
  tab-1    PaymentTimeline      0.95   view_extension placement
  header   VizAreaPreview       0.95   view_extension placement
  tab-3    StatusBadge          1.00   preferred for status-indicator; tag match
  tab-5    Card                 0.94
  tab-7    Card                 0.94
  tab-2    Stack                0.71
  tab-4    Text                 0.76
  tab-6    Stack                0.71
  metadata AuditTimeline        0.40   reviewHint: low-confidence; alternatives TagSummary 0.95, TagManager 0.90
Warnings:
  OODS-V121: Object 'Subscription' has maturity 'beta' — composed output may change
  OODS-V117: 13 field collisions where object schema overrides trait definitions
  OODS-V120: No matching slot for position "bottom" from lifecycle/Timestampable/AuditTimeline
```

README's example value (`CycleProgressCard` for `tab-0` at `0.95`) matched exactly.

---

## Step 4 — Certify a chart (23:46:50Z → 23:47:12Z, 22s, PASS)

```sh
echo 'Call viz.render with {"chartType":"bar","rows":[{"status":"active","count":17},{"status":"draft","count":5},{"status":"archived","count":3}],"encodings":{"x":{"field":"status","type":"nominal"},"y":{"field":"count","type":"quantitative","aggregate":"sum"}},"output":{"includeNormalizedSpec":true,"includeA11y":true}}. Then call artifact.certify with {"spec": <that normalizedSpec>}. Report the contentHash, the a11y narrative, and from certify: coverage, conformant, the four pillars and any findings.' | claude -p --model sonnet --strict-mcp-config --mcp-config forge.mcp.json --allowedTools "mcp__forge__*"
```

```
viz.render
  contentHash: 5415fcfac8e391af4cccfa3bbb33c6c119b7b9f0f643a93101a2c7cee66d5fcd
  a11y summary: "Bar chart compares Status; active leads at 17 while archived is lowest at 3."
  key findings: High Count 17 (active); Low Count 3 (archived); Total Count 25

artifact.certify
  coverage: certified
  conformant: true
  pillars: a11yEquivalence pass, determinism pass, contrast pass, accuracy pass
  findings: [] (none)
  renderHash: 8e083bfe635a520758af05662e4ed63c55754f9743253e1ae8775c4833a7b738
  accuracy: 4 rules evaluated, 0 failing (OODS-V150, V151, V152, V153)
  contrast measured against light/A theme scope with render evidence
```

---

## Step 5 — Generate the app, attempt 1 (23:47:23Z → 23:47:36Z, 13s, FAIL)

```sh
echo 'Call code.generate with {"schemaRef":"compose-b8fc9aa5","framework":"react","profile":"build"}. List artifact.files (paths), artifact.contentHash, artifact.dependencies with versions, and the validationReceipt including everything under notChecked.' | claude -p --model sonnet --strict-mcp-config --mcp-config forge.mcp.json --allowedTools "mcp__forge__*"
```

```
The call failed because the schemaRef 'compose-b8fc9aa5' is missing or expired.
**Error Details:**
- **Code**: OODS-N003
- **Message**: The schemaRef 'compose-b8fc9aa5' is missing and needs to be regenerated
**Validation Receipt (from failed call):**
- Profile: build
- Not Checked (18 items): schema-structure, component-registry, state-contract, target-readiness,
  normalization-fidelity, binding-contract, props-contract, slots-contract, events-contract,
  dependency-closure, fallback-policy, rendered-evidence, interaction-evidence,
  accessibility-evidence, theme-evidence, determinism-evidence, performance-evidence,
  certification-evidence
```

The ref was 68 seconds old and its stated expiry was 29 minutes away. It did not survive the end of the
assistant session that created it (each session starts its own adapter process).

## Steps 5+6 — attempt 2, one session (23:48:02Z → 23:50:09Z, 127s, PARTIAL)

```sh
echo 'Do three calls in order. 1) design.compose with {"object":"Subscription","context":"detail"} and keep the schemaRef. 2) code.generate with {"schemaRef":"<that ref>","framework":"react","profile":"build"} - report artifact.files paths, artifact.contentHash, artifact.dependencies with versions, and the validationReceipt checks that ran plus everything under notChecked. 3) repl with {"action":"render","schemaRef":"<same ref>","apply":true,"output":{"compact":false}} and save the returned html verbatim with the Write tool to <RUN>/project/subscription-detail.html' | claude -p --model sonnet --strict-mcp-config --mcp-config forge.mcp.json --allowedTools "mcp__forge__*" "Write"
```

All three Forge calls ran (schemaRef `compose-d2d24912`), but the stand-in assistant could not report the
fields or save the file:

```
**Issue**: The tool results are being saved outside my allowed working directory, preventing me from
extracting the specific fields you requested (artifact paths, contentHash, dependencies, validation
receipt details) and saving the HTML file.
```

(The large `code.generate` / `repl render` payloads spill to a file the CLI session could not read.
Fixed by adding `--add-dir /private/tmp/claude-501`. Harness limit, not Forge.)

## Steps 5+6 — attempt 3, one session (23:50:34Z → 23:51:52Z, 78s, PASS)

```sh
echo 'Three calls in order, then one file. 1) design.compose {"object":"Subscription","context":"detail"} - keep the schemaRef. 2) code.generate {"schemaRef":"<ref>","framework":"react","profile":"build"} - list the artifact.files paths, artifact.contentHash, artifact.dependencies with versions, and the validationReceipt check names plus everything under notChecked. 3) repl {"action":"render","schemaRef":"<ref>","apply":true,"output":{"compact":false}} - take the html field and write it verbatim to <RUN>/project/subscription-detail.html (if a tool result was spilled to a file, read that file and copy the html out of it with a shell command). Saving that html file is the required outcome.' | claude -p --model sonnet --strict-mcp-config --mcp-config forge.mcp.json --add-dir /private/tmp/claude-501 --allowedTools "mcp__forge__*" "Write" "Read" "Bash"
```

```
1. design.compose  schemaRef: compose-a5b03df0
2. code.generate
   Artifact Files: src/GeneratedUI.tsx, src/charts/payment-001.svg
   Artifact Content Hash: sha256:eb92ea79759284a6f1e47f618e024e415b275d2bdefe7e0fb0c2659840a3ef35
   Dependencies: @oods/component-contracts@0.1.0, @oods/component-styles@0.1.0,
                 @oods/components-react@0.1.0, react@19.2.0 (peer), react-dom@19.2.0 (peer)
   validationReceipt checks: schema-structure, component-registry, state-contract, target-readiness,
                 normalization-fidelity, binding-contract, props-contract, slots-contract,
                 events-contract, dependency-closure, fallback-policy
   validationReceipt notChecked: rendered-evidence, interaction-evidence, accessibility-evidence,
                 theme-evidence, determinism-evidence, performance-evidence, certification-evidence
3. repl render → HTML saved, 211KB
```

Both README step-5 file paths matched the README exactly (`src/GeneratedUI.tsx` and
`src/charts/payment-001.svg`), and the hash carried the documented `sha256:` prefix.

---

## Step 6 — Look at it (23:52:01Z, ~1s, PASS)

```sh
open <RUN>/project/subscription-detail.html
grep -o "<title>[^<]*</title>" subscription-detail.html
grep -oE "<h[1-6][^>]*>[^<]{1,90}" subscription-detail.html
grep -oE 'data-oods-component="[^"]+"' subscription-detail.html | sort | uniq -c | sort -rn
```

File: 215,664 bytes. Opened in the browser without error.

Document root:

```
<!DOCTYPE html>
<html lang="en" data-theme="light" data-brand="default">
  <title>OODS Preview</title>
  <style data-source="tokens">   ← the full token CSS inline (oklch custom properties)
```

**Title:** `OODS Preview` — generic; nothing in the document names `Subscription`, the object I composed.

**Headings, in order:** Details · Status Timeline · Cancellation Summary · Archive Summary ·
Billing cycle · Payments.

**Component markers:** 49 `data-oods-component` attributes, 39 `data-oods-node-id`, 1 `data-oods-label`,
1 `data-oods-surface`. By component:

```
18 Text        14 Stack       3 Table      2 Tabs      2 Card
 1 VizAreaPreview   1 StatusTimeline   1 PaymentTimeline   1 DetailHeader
 1 CycleProgressCard  1 CancellationSummary  1 Button  1 Banner  1 Badge  1 ArchiveSummary
```

**Visible text of the screen (tags stripped):**

```
Details | Area preview (640 x 360) | Status Timeline: No events | Cancellation Summary:
Cancel at period end cancel_at_period_end · Reason cancellation_reason · Code Cancellation Reason Code |
Archive Summary: Reason archive_reason | Created at · Updated at · Last event · Last event at ·
Subscription id · Plan code · Plan interval · Customer name · Customer email |
Billing cycle: Progress unavailable · Remaining days unavailable |
Payments: No amount USD · pending · Payment method: Not provided ·
Last payment: No previous payment · Next payment: No payment scheduled
```

So the screen is the real composed structure with governed components and inline tokens, but every value
slot is either an empty-state string or the raw field key (`cancel_at_period_end`, `cancellation_reason`,
`archive_reason`) shown where a value would be. `DetailHeader` appears in the rendered markup even though
`design.compose` reported `VizAreaPreview` for the `header` slot.

---

## Issue filed (23:55:23Z)

```sh
gh issue create --repo kneelinghorse/OODS-Forge --title "[Reads wrong]: schemaRef \"lasts 30 minutes\" but dies with the assistant session (OODS-N003 after 68s)" --body-file <RUN>/out/issue.md --label reads-wrong
```

```
https://github.com/kneelinghorse/OODS-Forge/issues/113
exit=0
```
