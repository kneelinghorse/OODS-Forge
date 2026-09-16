# s203-m01 — The Sprint 202 carries closed

Builder self-certified: **false**. Built on `codex/sprint-203-objects-and-context` from `ce6d3a429` (the planning commit; product code identical to the base `a5d1ba084`). Before receipts were taken at that tree; after receipts from the working tree before this mission's commit. Every fix is at the producer; nothing is edited in generated output.

## The carries (`#2150`), and what each turned out to be

| Carry | What it actually was | Fix (producer) | Receipt |
| --- | --- | --- | --- |
| `heading-order` (recorded as "moderate, one node, the StatusTimeline title") | **Far wider than recorded.** Sprint 202 m01 raised a detail's record title to `h1` and gave every other screen a shell `h1`, but left every section title at `h3`, so every generated page skipped level two. Measured across the whole roster: **98 `heading-order` findings over 85 screens × 2 frameworks**, from eight distinct components on Subscription alone. The generated outline is flat — one `h1` then a run of sibling section titles, with only layout primitives (Stack, Tabs, Card) between them and **never a heading nested inside another heading** on any of the 85 screens. | A section title is a level-two heading, in **all three renderers**: the hardcoded `h3` in `breadth`, `ported`, `trait-recipes`, `viz-recipes`, `billing-views` and `disputed` (20 sites per framework), the server-side HTML renderer's own copies in `packages/mcp-server/src/render/component-map.ts` (9 sites — panel header, form header, timeline title, summary titles, the status-colour legend), the composer's `fieldGroupPattern` heading, and `CardHeader`'s fallback level (3 → 2, beside `DetailHeader`'s 2) in all three, through the existing `headingElement(as, level, fallback)` / `headingTag(level, fallback)` helpers, which leave an explicit `as`/`level` override untouched. The `component-styles` selectors that targeted those headings moved with them. The HTML renderer is a separate producer the carry did not name; `parity.s185` compares the three targets, so leaving it behind would have split React and Vue from HTML. | `before/headings.json` vs `after/headings.json`; gate `packages/mcp-server/test/product-reality/heading-order.s203.spec.ts` |
| axe-core does not run inside the conversation view | The conversation app mounts the generated design **in its own document, beside its own chrome** (no iframe), so there are only two possible scopes and both were measured on the same page, engine 4.11.0. A run scoped to the mounted design drops **nine document-level rules** — `aria-hidden-body`, `document-title`, `html-has-lang`, `html-lang-valid`, `landmark-one-main`, `meta-viewport`, `meta-viewport-large`, `page-has-heading-one`, `region` — identically on all three screens tested. Three of those (`landmark-one-main`, `page-has-heading-one`, `region`) are **exactly the findings Sprint 202 m01 closed**, so a subtree run could never re-prove the generated shell. Widening back to the whole document is worse: with chrome in the document the run reported the chrome's own `image-alt` and `region` as findings. Inlining the engine would also add 582 KB (+28%) to the app resource, for a strictly weaker measurement than the one already stored. | **The descope is re-typed with that measured reason.** The measurement panel now states that every result was measured by the browser preview page over the whole generated page as its own document and stored on the version, that this view re-runs nothing, and why neither scope here would be honest — naming the three rules. | `before/axe-scope.json`; gate `packages/mcp-server/test/product-reality/axe-scope.s203.spec.ts` (2 tests: the dropped rules, and the panel text in the built app) |
| `node packages/mcp-adapter/test-s55-m03.js` at 15/16 | **Both sides were wrong, and the check was hiding it.** The assertion ran inside the loop, so it stopped at the first offender and reported only `health` — three sprints of offenders sat behind it. The verb list last moved in `a8397f6df` (s90-m05) while the descriptions were rewritten through s201–s202. | (a) The list gained the three action verbs later sprints introduced: `Read` (`health`), `Open` (`design.preview`), `Certify` (`artifact.certify`). (b) Four descriptions genuinely opened with a noun phrase — `map`, `schema`, `object` and `repl` all began "Grouped … tool." — and the check was right about them: they now open "Run one … operation." (c) The check reports **every** offender at once instead of the first. | `after/adapter-descriptions.txt`; `docs/api/*`, `docs/api/README.md` and `docs/mcp/Tool-Specs.md` regenerated through their generators; `configs/agent/policy.json` moved with them so both policy layers still agree |
| Derek's Claude Desktop and Cursor receipts | `artifacts/product-reality/sprint-202/m05/hosts/` holds **only its README** (2,651 bytes, unchanged). Those runs did not happen, or were not recorded. | Nothing staged, nothing claimed, the folder untouched. The carry is re-stated for the next review: it is Derek's run to make and the review's to record. | `artifacts/product-reality/sprint-202/m05/hosts/README.md`, unmodified |

## The heading measurement

`before/headings.json` and `after/headings.json` record, for **18 objects × 5 contexts** (85 screens composed, 5 refused — `Chunk` is inline-only — in React and Vue, 170 framework runs), the full heading outline with each heading's owning component and its component ancestors, plus the axe violations the running page stored.

- **`heading-order`: 98 → 0.** Zero on every screen, in both frameworks.
- The components that started a level skip before the fix: `StatusTimeline` (12), `StateTransitionEvent` (12), `CardHeader` (11), `ClassificationEditor` (5), `CancellationForm` (3), `OwnershipSummary` (3), `AddressEditor` (2), `TagSummary` (1).
- `Subscription/detail` after the fix reads `h1 Cedar Plan` → `h2 Status Timeline` → `h2 Cancellation Summary` → `h2 Archive Summary` → `h2 Billing cycle` → `h2 Payments`.
- There was no `h2` anywhere in either component package before this mission: `h3` was the only section tier, which is the whole of the defect.

### No runtime-cell re-sweep is owed to this mission

`after/generated-heading-tags.txt` (reproducible with `after/generated-heading-tags.mjs`) generates seven object/context pairs in both frameworks and lists every heading tag that appears in the generated artifact. The only one is the shell `<h1>` Sprint 202 m01 added — **no `h2` or `h3` appears in any generated artifact**, because every section heading is rendered by the component packages the artifact imports rather than embedded in it. The runtime-cell registry pins each cell's generation-gate `artifactHash`, so this fix moves no cell and the 240-cell sweep Sprint 202 m01 owed is not owed here. The registry is still declared `mayMoveOnce` for m02–m04, which add and change cells.

## Found by the sweep, not fixed here

The same 170-run sweep surfaced two findings that are **not** in the carry list and are **not** of the classes this mission or Sprint 202 m01 closed. Both are real producer defects, both are recorded here and neither is touched:

| Finding | Where | What it is |
| --- | --- | --- |
| `button-name` (1 node) | `Article/card`, `Media/card`, `Invoice/card`, `Usage/card`, both frameworks | The card footer places `<button id="slot-footer-6" data-oods-component="Button">` with no text and no accessible name at all. |
| `landmark-unique` (1 node) | `Subscription/timeline`, both frameworks | `PaymentEventTimeline` renders every instance as `<section aria-label="Payment event">`, so two sibling region landmarks carry the same accessible name ("Last payment" and "Next payment" are the content, not the label). |

They belong to **m04**, whose objective is exactly this: defects fixed at the producer with before and after receipts in both frameworks at all three widths. They are named here so m04 does not have to rediscover them.

## Tests

- `@oods/components-react` **639/639**, `@oods/components-vue` **625/625**. The 36 assertions that moved are heading-level pins on the producer's default (`getByRole('heading', { level: 3 })`, `querySelector('h3')`, the `CardHeader` default-level rows); the intent each encodes — a section title is a real heading — is unchanged, only the level it pins. `@oods/component-contracts` scenarios moved with them, since the shared scenario text names the level both frameworks must render.
- New gates: `heading-order.s203.spec.ts` (one screen per template — detail, timeline, form, card — asserting one `h1`, no level skipped, and no stored `heading-order`, in both frameworks) and `axe-scope.s203.spec.ts` (the two scopes measured, and the panel text asserted in the built app).
- `node packages/mcp-adapter/test-s55-m03.js` **16/16**; `test-s55-m05.js` 21/21; `test-s196-native-errors.js` green.

## Movers

The preview app rebuilt from `87de86c9408e` to `6394d6f1bdfb` (the panel text and the component styles it inlines), the same 2,105,9xx-byte shape.

`../golden-ledger.json` was planned at the base `a5d1ba084` (4 must-not-move — the viz pattern registry, the certified matrix, the viz recipes and the Sprint 196 package-shape baseline, since there is no chart work this sprint — and 9 may-move-once) and m01 appended **2 entries**: `packages/mcp-adapter/tool-descriptions.json` and `configs/agent/policy.json`, the two hand-authored sources that carry the advertised descriptions. `check`: the four must-not-move pins byte-identical to the base, every moved pin recorded once, the sealed `sprint-195…202` receipts byte-identical (`verified`). The runtime-cell and release-cell registries and the composed-screen snapshots did **not** move, for the reason measured above.

The generated pages the regeneration rewrote — `docs/api/*`, `docs/api/README.md` and `docs/mcp/Tool-Specs.md` — are **not** pinned in the ledger. They were, briefly: m02 then regenerated `Tool-Specs.md` against the moved census and `check` failed with "moved again after its ledger entry", which is the pin telling the truth about the wrong kind of file. A generated document is rewritten by its generator every time the census it reports moves, and it is gated by `docs:check --check`; Sprint 202 treated the tool capability ledger the same way. The ledger now pins registries, fixtures, snapshots and hand-authored sources only.

Regenerated through their generators, not by hand: `docs/api/*` and `docs/api/README.md` (`docs:api`), `docs/mcp/Tool-Specs.md` (`docs:tools`), the 15 component pages whose heading level the fix moved (`docs:components`), and the tool capability ledger (`s193-tool-truth.mjs --mode s202`, still bound to the Sprint 202 archive receipt; closeout re-binds it to Sprint 203). `docs:check` passes.

## Suites at this tree

`@oods/mcp-server` **405 files / 7,182 passed**, `@oods/components-react` 639, `@oods/components-vue` 625, `@oods/component-contracts` 159, `@oods/component-styles` 62, `@oods/mcp-bridge` 58; root `pnpm typecheck` clean; `docs:check` green; `node packages/mcp-adapter/test-s55-m03.js` 16/16.

The root project's own run went red on 25 files, and every one was accounted for rather than excused. Three causes, none a defect in this work:

1. **The root project had never been built in this worktree.** `dist/` is gitignored and `pnpm run build` + `pnpm run pkg:build` had not run here, so `tests/contracts/public-api.contract.test.ts` could not find `dist/pkg`. Built; the file passes.
2. **`docs/components` was genuinely stale** — 15 pages whose heading level this fix moved. Regenerated through `docs:components`; `--check` passes. This one was mine.
3. **The rest were the parallel-scheduling reds policy `#1833` describes.** Every one of the remaining 21 mcp-server files passes serially: a 13-file serial rerun is 295/295, and the two lone timeouts (`collections.s189` vue at 30s, `design-loop` at 20s) each pass in one isolated rerun (12/12 and 15/15, the latter in 6.7s against a 20s budget). No full recapture was run, per that policy.

The two genuinely failing files at the first pass were `tool-truth.s193` and `closeout-audit.s195`, both stale-ledger: this mission's two new specs import `design.preview` and this receipt is a new README reference. Regenerating the ledger closed both.
