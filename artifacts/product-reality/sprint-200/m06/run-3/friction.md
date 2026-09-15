# Friction log — OODS Forge first run

Nothing failed, so none of this is about breakage. It is the list of places where I stopped, re-read, or had to go
find out. Ordered by what it cost me.

---

## 1. Three calls in one conversation, one summary back — 94s

**What I read.** README, the first-run preamble: *"One rule shapes the run: a `schemaRef` lives in the server your
client started, for 30 minutes and for that conversation, so make steps 3, 5 and 6 in one conversation."*

**What I expected.** To put steps 3, 5 and 6 in one message, as instructed, and see what each call returned.

**What happened.** I asked for all three in order and got back a detailed report of call 3, then a three-line summary:
*"1. ✅ design.compose - Created a Subscription detail view with 10 component slots … 2. ✅ code.generate - Generated
React artifact with 2 files, contentHash `sha256:eb92ea7...`, passed 11 validation checks"*. The `selections` with their
confidences, the 14 warnings and the whole `validationReceipt` — the things the README spends its longest paragraphs
teaching me to read — were summarized away. Getting them back cost a second conversation, 94 seconds, and a new
`schemaRef`.

Part of this is my client (print mode returns only the final message). But the README's own TTL rule is what pushes a
user to batch three heavy calls into a single request, and an assistant given three things at once will compress the
first two. The rule and the payoff pull against each other: the calls that must share a conversation are exactly the
calls whose output you most want to read one at a time. A line in step 3 along the lines of "ask for these one message
at a time inside the same chat, not as one request" would have cost me nothing and saved the re-run.

---

## 2. The Overrides example points at the wrong slot — ~90s

**What I read.** README, "Working with the tools": *"Overrides: when `design.compose` reports a low-confidence selection
or a `reviewHint`, pin only that slot with `preferences.componentOverrides`, for example `{"object": "Subscription",
"context": "detail", "preferences": {"componentOverrides": {"header": "DetailHeader"}}}`."*

**What I expected.** The example to show me the slot the sentence had just described — the low-confidence one with the
`reviewHint` — for the exact object and context I had just composed.

**What happened.** In that exact compose, `header` came back **high** confidence (0.95, reason "view_extension
placement") with no `reviewHint`, and `DetailHeader` was not among its candidates (VizAreaPreview, StatusTimeline,
CancellationSummary, ArchiveSummary, all 0.95). The slot that actually carried the `reviewHint` was `metadata`
(AuditTimeline, 0.40, alternatives TagSummary 0.95 and TagManager 0.9). So the rule and its one worked example disagree
about which slot you would override, on the same object and context. I re-read the sentence three times assuming I had
mis-composed, then went back through the selections to confirm. This is the issue I filed.

---

## 3. `confidence: 0.40` next to the same component at `1.0` — ~60s

**What I read / saw.** The `metadata` slot: selected component AuditTimeline, **confidence 0.40**, flagged
low-confidence with a `reviewHint` — and immediately below, its own candidate list led by **AuditTimeline (1.0)**,
ahead of TagSummary (0.95) and TagManager (0.9). Same component, same slot, two numbers an order apart. `tab-2` does it
too: selected Stack at 0.71, candidate Stack at 1.0.

**What I expected.** One number per candidate, or two clearly different names. If the selection's confidence and the
candidate's score are different quantities (say, a raw match score versus a calibrated confidence after penalties),
nothing in the README or the tool output says so.

**What happened.** I read it twice, decided the candidate score must be a within-slot ranking and the confidence an
absolute, and moved on without being sure. The README teaches me to act on this number — *"a low-confidence slot carries
a `reviewHint`"* — so it is the one field in `selections` I most need to trust. This was my runner-up for the issue.

---

## 4. The first thing on the screen is an empty chart box — ~30s

**What I read.** README step 6: the document *"showing the composed screen's structure (its header, tabs, summaries and
timelines) with placeholder values where live data would go."*

**What I expected.** A header at the top of a Subscription detail screen.

**What happened.** The `header` slot resolved to `VizAreaPreview`, so the document opens with **"Details / Area preview
(640 x 360)"** — a placeholder chart frame — above everything else, while a `DetailHeader` component does exist further
down in the markup. Nothing is wrong, and the README never promises which component wins the header, but "its header"
sets an expectation that the top of the page is a header. It also makes the README's `{"header": "DetailHeader"}`
override read like a fix for something rather than an illustration (see #2).

---

## 5. The 19 / 24 / 28 tool count — ~30s

**What I read.** README: *"advertises 19 tools by default (24 in all)"*, and *"The default surface is 19 tools;
`MCP_TOOLSET=all` advertises all 24. `health` reports the tool ledger's 24 entries by evidence tier, not the surface
your client lists."* install.md: *"All three clients speak to the same stdio adapter and see the same 19 tools by default."*

**What I expected.** To be able to confirm 19 at a glance.

**What happened.** Asked how many forge tools it could see, my assistant answered **28** — *"I can see 28 forge tools
available (all the `mcp__forge__*` prefixed tools in my available tools list)"*. Three numbers were now in play. Asking
for the names settled it at 19, matching the README's table and the manifest's `autoCount: 19`; the assistant had simply
miscounted. Forge did nothing wrong, and the README's sentence anticipating this confusion is one of the better lines in
the document — but "count them yourself" is not something a user can do, so the claim is unfalsifiable from the client
side, and an assistant will confidently produce a wrong number.

---

## 6. `server.uptime` is always near zero — ~15s

**What I read.** README step 2: *"it answers `status: "ok"` with the registry counts (objects, traits, components),
`server.uptime` in milliseconds"*.

**What I saw.** `479 milliseconds`. I briefly wondered whether something had restarted or crashed before deciding the
client starts a fresh server per conversation, which makes uptime a measure of how long ago my own call started the
process. As a health signal it tells a first-time user nothing; as a number sitting next to "status: ok" it invites a
double-take.

---

## 7. Where the generated files went — ~20s

**What I read.** README step 5: *"`code.generate` … returns `artifact.files` (`src/GeneratedUI.tsx` and the screen's
chart, `src/charts/payment-001.svg`)"*.

**What I expected.** Paths that look like `src/…` to be somewhere on disk.

**What happened.** They are paths inside the returned artifact, not files. install.md section 7 answers it from the
other direction — *"Read-only use creates no files. Calls that opt into writing (`apply: true`, saved schemas, mappings)
write under the extracted directory"* — and I confirmed afterwards that nothing was written. The README's step 5 never
says the file-set is returned rather than written, and "Generate the app" as a step title leans the other way.

---

## 8. `shasum` needs the right working directory — ~10s

**What I read.** README step 1 gives `shasum -a 256 -c forge-runtime.tar.gz.sha256` with no note about where to run it.
install.md section 3 has the note: *"Run these in the directory that holds the two downloaded files; the digest file
names the archive by its bare file name."*

**What happened.** No cost, because I had read install.md. A user who works from the README alone and keeps downloads
somewhere other than their working directory gets a "No such file or directory" on their very first command. The README
links install.md as "the release's install page" but presents its own numbered step 1 as sufficient.

---

## Things that were notably better than expected

Recorded because they are also findings.

- **The warnings were pre-announced.** *"`warnings` are normal on this call: the shipped `Subscription` is beta, some of
  its fields override trait defaults, and one contribution has no slot in the detail layout"* — 14 warnings arrived and
  every one of them fell into those three buckets (OODS-V121 beta, 12 × OODS-V117 collisions, OODS-V120 unplaced). Being
  told in advance turned an alarming wall of warnings into a checked box.
- **Step 4 predicted its own output exactly**, down to *"four of the set apply to a plain bar chart"* (OODS-V150–V153).
- **`notChecked` is real.** The receipt lists seven checks it did not run, including `determinism-evidence`, rather than
  quietly omitting them.
- **Determinism held across processes.** Two `code.generate` calls, two conversations, two server processes, two
  different `schemaRef`s, ten minutes apart: identical `sha256:eb92ea79…`.
- **Install was 2 seconds** and `Status: ✓ Connected` was the literal string the document told me to expect.
