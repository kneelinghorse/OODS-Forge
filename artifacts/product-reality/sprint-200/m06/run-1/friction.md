# Friction log — first run, 2026-09-14

Ordered by cost. Everything here is from the README and `docs/runtime/install.md` as published, plus what
the runtime actually returned.

---

## 1. The `schemaRef` died 68 seconds after it was created — cost: ~3.5 minutes and two extra sessions

**What I read** (README, "The first run, in ten minutes", step 3):

> a `schemaRef` such as `compose-dae744a8` (it lasts 30 minutes; `schema.save` keeps it longer)

and step 5:

> **Generate the app.** `code.generate` with `{"schemaRef": "<from step 3>", "framework": "react", "profile": "build"}`

and, under "Working with the tools":

> `schemaRef` TTL: refs returned by `design.compose`, `design.preview`, `pipeline`, and `schema.load` last 30 minutes. Persist them with `schema.save` when the workflow spans sessions or multiple review loops.

**What I expected.** The README walks steps 3 → 5 → 6 as one numbered list and tells me twice that the ref
is good for 30 minutes. I took "<from step 3>" literally: compose, look at the answer, then hand the ref to
`code.generate`. `design.compose` itself told me `Expires: 2026-09-15T00:16:15.980Z`.

**What happened.** 68 seconds after compose, `code.generate` with that exact ref returned:

> **Code**: OODS-N003 — The schemaRef 'compose-b8fc9aa5' is missing and needs to be regenerated

Nothing had expired. The ref is scoped to the running server process, and my second tool call was a new
assistant session, so a new adapter process. "It lasts 30 minutes" is only true inside one continuous
client session. The word that would have warned me — "spans sessions" — is buried in a later section about
long workflows, and it reads like advice for multi-day work, not for the next call in the same ten-minute
walkthrough. I lost the first attempt (13s), then two re-runs of the whole 3 → 5 → 6 sequence (127s + 78s)
before the walkthrough completed.

---

## 2. `health` reports 18 objects; the README says 19, twice — cost: ~1 minute of re-reading

**What I read** (README, first paragraph):

> Today it knows 19 object definitions, 46 traits and 110 governed components

and again under "Three words":

> Forge ships 19 object definitions; you add your own as YAML.

**What I expected.** `health` is the first call the README asks for, explicitly "with the registry counts",
so I read the counts against the sentence I had just read.

**What happened.** Components 110 ✓, traits 46 ✓, **objects 18**. Two of the three headline numbers match
exactly and the third is off by one, which is worse than no number at all: I could not tell whether the
bundle was short an object, whether one object is hidden from the count, or whether the README is simply
stale. install.md's own first-call paragraph names "19 auto tools, 24 total" but no object count, so there
is nothing to break the tie.

---

## 3. "certify" reports 4 accuracy rules where the README advertises 16 — cost: ~30 seconds

**What I read** (README, "What Forge generates, and what 'certify' means"):

> accuracy (16 rules about baselines, hidden aggregation, mis-scaled encodings and inconsistent structure)

**What I expected.** A pass on accuracy meaning the 16 rules ran.

**What happened.** `artifact.certify` returned `accuracy: pass` with "4 rules evaluated, 0 failing
(OODS-V150, V151, V152, V153)". That is probably correct — 4 of 16 rules apply to a 3-row bar chart — but
the README's own framing ("Certify is a measurement, not a promise… reports which rules were evaluated and
which failed") is exactly what makes 4-of-16 land as a question. One clause saying only the applicable
rules run would remove it.

---

## 4. Step 6 produces a document titled "OODS Preview" with field keys as data — cost: ~1 minute

**What I read** (README step 6):

> returns `html`: a complete document with the token CSS inline. Ask the assistant to save it as `subscription-detail.html` and open it in your browser.

**What I expected.** The Subscription detail screen I had just composed, recognisable as such.

**What happened.** The document is real — 215,664 bytes, 49 `data-oods-component` markers, the full oklch
token CSS inline, headings Details / Status Timeline / Cancellation Summary / Archive Summary / Billing
cycle / Payments — but `<title>` is `OODS Preview` and the word "Subscription" appears only as a field
label ("Subscription id"). The value slots show raw field keys where a value belongs: "Cancel at period end
**cancel_at_period_end**", "Reason **cancellation_reason**", "Reason **archive_reason**", next to proper
empty states ("No events", "No payment scheduled", "Progress unavailable"). After a walkthrough that
promised a screen composed from my object, the payoff screen does not say which object it is and mixes two
different placeholder conventions. Also: compose reported `VizAreaPreview` for the `header` slot, but the
rendered markup contains `DetailHeader` — the README's override example pins `header` to `DetailHeader`,
which made me look twice to work out which one the renderer actually used.

---

## 5. Compose returns three warnings the walkthrough never mentions — cost: ~45 seconds

`design.compose` on the README's own example (`Subscription` / `detail`) came back with:

> OODS-V121: Object 'Subscription' has maturity 'beta' — composed output may change
> OODS-V117: 13 field collisions where object schema overrides trait definitions
> OODS-V120: No matching slot for position "bottom" from lifecycle/Timestampable/AuditTimeline

plus a 0.40-confidence `metadata` slot carrying a review hint. The README's step 3 lists what the answer
has — `status`, `layout`, `schemaRef`, `objectUsed`, `selections` — and never says warnings are normal on
the sample call. I stopped to decide whether 13 field collisions meant I had done something wrong. A
half-sentence ("the shipped `Subscription` is beta, so this call also returns warnings; they are expected")
would have cost me nothing.

---

## 6. `code.generate` names 18 checks in `notChecked` when it fails — cost: ~20 seconds

The failed generate (item 1) returned a `validationReceipt` whose `notChecked` list had all 18 checks in
it. The README says "a `validationReceipt` listing the checks that ran and, under `notChecked`, the ones
that did not" and "No receipt claims a check it did not run" — accurate, but a receipt attached to a call
that produced no artifact at all reads as if the generation half-happened. On the successful run the split
was clean and useful: 11 ran, 7 (`rendered-evidence`, `interaction-evidence`, `accessibility-evidence`,
`theme-evidence`, `determinism-evidence`, `performance-evidence`, `certification-evidence`) did not.

---

## 7. Two small ones

- **The archive has no top-level directory.** install.md says `mkdir -p ~/forge-runtime` then
  `tar -xzf … -C ~/forge-runtime`, which is right, but I only learned after extracting that the tarball
  unpacks flat (LICENSE, packages/, node_modules/ … straight into the target). Anyone who omits `-C` or
  extracts into a directory they already use will strew 13 entries across it. Worth one clause. (~15s)
- **Node floor vs. what runs.** install.md says "Node.js 20.11.1 or newer"; I had v24.6.0 and everything
  worked, but the manifest lists `"ciNodes": [24, "20.11.1"]` and nothing in the install page says the
  upper end is tested, so I hesitated before starting. (~15s)

---

## Harness friction (not Forge's, recorded for completeness)

My stand-in for "ask the assistant" is `claude -p … --allowedTools "mcp__forge__*" "<prompt>"`.
`--allowedTools` is variadic, so it consumed the prompt as a second tool pattern and the CLI then blocked
forever reading a prompt from stdin: **424 seconds lost with no output and no error**, half my budget.
Piping the prompt on stdin fixed it. Separately, large `code.generate` / `repl render` payloads are spilled
to a file outside the session's working directory, so the first combined attempt could report nothing and
save nothing (127s lost) until I passed `--add-dir`. Neither is a Forge defect, but both are what a scripted
or agentic first run will hit.
