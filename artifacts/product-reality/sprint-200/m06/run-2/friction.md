# Friction log — first run of OODS Forge

Ordered by cost. Wall-clock cost in brackets. "The docs" = README.md and the release install.md, the only two things I had.

---

## 1. Large tool results break the "ask the assistant" steps, and nothing warns you [≈6 minutes, two dead runs]

**What I read.** README step 5: "`code.generate` … returns `artifact.files` … `artifact.contentHash` … and a `validationReceipt`". Step 6: "`repl` … returns `html`: a complete document with the token CSS inline … Ask the assistant to save it as `subscription-detail.html`".

**What I expected.** That asking for those calls in one conversation would produce the fields and the file.

**What happened.** `code.generate` returned ~97KB and `repl` render ~250KB. Both were too large for the assistant's reply, so my client spilled them to files and handed the assistant a path. First attempt: 193 seconds, then an **empty reply** (literally one newline byte), no file, no error. Second attempt: 176 seconds, and rather than say it was stuck the assistant **made values up** —

> **Call 2: code.generate** … Files generated (typical structure): App.tsx, SubscriptionDetail.tsx, sampleData.ts, types.ts, package.json, README.md, tsconfig.json
> contentHash: [in file]
> Dependencies: react, @oods/design-system, typescript, vite (typical)

None of that is real. The truth is `src/GeneratedUI.tsx`, `src/charts/payment-001.svg`, `@oods/component-contracts`, `@oods/component-styles`, `@oods/components-react`, react/react-dom peers. A first-time user reading that summary would have walked away with a completely false picture of what Forge generates — and with "All three calls completed successfully" as the closing line.

Once the assistant could read the spill file, the same three calls took **80 seconds** and worked.

**Why it belongs in Forge's friction log even though the spilling is the client's doing.** The docs set the expectation that these are ordinary chat requests ("Ask the assistant to run", "Ask for `design.compose`"), and two of the five first-run steps return payloads in the 100–250KB range. Nothing in README §"Working with the tools" or install.md mentions output size, and the one lever that exists — `output.compact` — is documented for the opposite purpose ("Pass `output.compact: false` for a self-contained document"). A sentence like "step 5 and step 6 return large payloads; ask the assistant to write them to a file rather than summarise them" would have saved both dead runs.

---

## 2. `health` does not report the counts install.md says it reports [≈1 minute, and left me unsure whether the install was right]

**What I read.** install.md §5: "A healthy answer reports `status: ok`, the registry counts (19 auto tools, 24 total) and the product-reality summaries."

**What I expected.** An answer naming 19 auto-registered tools and 24 total.

**What happened.** Tool count came back as `24`, and the only 19 in sight was an **evidence-tier** breakdown: `product-reality: 19, contract: 5, unit: 0, none: 0`. The 19/5 split of the tiers happens to coincide with the 19/5 split of auto vs on-demand in the README's tool table, so I could not tell whether `health` was telling me what my client had been served or how well-evidenced the tools are. This is the issue I filed.

---

## 3. `health` reported an uptime older than my install [≈30 seconds of doubt]

I ran `claude mcp add` at 00:02:51 and asked for `health` at 00:03:03. The answer included "the server has been up for **543 seconds**" — nine minutes, for a runtime I had extracted four minutes earlier. Harmless if `uptime` means something other than this process's age, but on a first run the one number that could tell me "yes, this is the server you just installed" told me it was older than the install. Nothing in the docs says what `health`'s uptime measures.

---

## 4. Step 4 says "Certify a chart" but certification is not about the screen you just composed [≈30 seconds of re-reading]

**What I read.** The steps run 3) compose a Subscription detail screen → 4) "**Certify a chart.** Certification runs on charts, so render one and certify it."

**What I expected**, on first reading of the numbered list: that step 4 would certify something from step 3 — the composed screen carries a `VizAreaPreview` and `code.generate` emitted `src/charts/payment-001.svg`, so a chart is right there.

**What happened.** Step 4 is a standalone bar chart of invented status counts, unrelated to the Subscription. The README does say so ("Certification runs on charts") and the "what certify means" section is explicit, but inside a numbered walkthrough the sudden change of subject reads like a missing link. The obvious question a first-time user forms at step 4 — "can I certify the chart my screen just generated?" — is neither answered nor deflected. [Cost was only re-reading; the step itself was flawless.]

---

## 5. `schemaRef` lifetime is explained three times, in three places, slightly differently [≈1 minute]

README step 3: "it lives in the running server for 30 minutes; your client keeps that server running for the whole conversation, so make the next calls in the same conversation, and `schema.save` keeps a ref across sessions". README "Working with the tools": "refs returned by `design.compose`, `design.preview`, `pipeline`, and `schema.load` last 30 minutes inside the server process that issued them; a client keeps that process for one conversation, and a restarted client starts a new one that does not know earlier refs (`OODS-N003`)".

Both are correct and the second is the better sentence. But the constraint is the single most important one for sequencing the first run — it decides whether steps 3, 5 and 6 can be separate requests — and it is introduced as a parenthetical inside step 3 rather than stated as a rule before the walkthrough. I read step 3 twice to be sure "the same conversation" meant what I thought.

---

## 6. Step 6 tells you to save a file but not what to name the tab [≈20 seconds]

"Ask the assistant to save it as `subscription-detail.html` and open it in your browser." Fine — but the document's own `<title>` is `OODS Preview`, which the README does mention ("titled `OODS Preview`"). With several previews open you get identical tabs. Tiny; noting it because the README goes to the trouble of naming the title.

---

## 7. The `.sha256` file only verifies from its own directory [≈10 seconds]

`shasum -a 256 -c forge-runtime.tar.gz.sha256` contains a bare relative filename, so it must be run from the download directory. Obvious to most, and the docs' commands do assume you are there — but the extract line right after it (`tar -xzf forge-runtime.tar.gz -C ~/forge-runtime`) is also relative while the install steps that follow are absolute-path-only. A reader who has already `cd`-ed somewhere else gets a confusing "No such file" from a verification step, which is a bad place to get one.

---

## What had no friction at all

Worth saying, because it is most of the run:

- **Verify and extract: 4 seconds.** Digest OK, no top-level-folder surprise (the doc warned), license files exactly where §1 said.
- **Install: 2 seconds**, and `claude mcp get forge` printed `Status: ✓ Connected` — the exact string install.md told me to expect. No version pinning, no npm, no build.
- **Step 4 certify: 21 seconds**, and every single value matched its prediction, down to "four of the set apply to a plain bar chart" → four rules.
- **Step 3 compose:** the README predicted the beta warning, the field-override warnings and the unslotted contribution *before* I saw them, so three warning classes arrived as expected behaviour instead of as errors. That is the difference between a walkthrough and a demo.
- **Step 6:** the components named in step 3 are visibly the components in the HTML. The whole point of the product is legible in one file.
