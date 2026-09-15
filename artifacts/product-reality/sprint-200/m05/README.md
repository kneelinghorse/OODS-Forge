# s200-m05 — onboarding: the README for a newcomer, the feedback path

Builder self-certified: **false**. Base 13c3b97c7 (the m04 receipts commit) on `codex/sprint-200-available`; the mission commit records the head.

## What is in the tree

- **README.md rewritten** in the memo's order: what Forge is (three sentences), the three words (object, trait, context, one plain sentence each with `Subscription`, `Stateful`/`Billable`/`Addressable` and the measured context roster), what Forge generates and what "certify" means (a measurement, not a promise: the four pillars, the accuracy rule count, the `validationReceipt` and its `notChecked` list), the four capability pillars (kept because `agent-docs-registry.contract` pins them), the ten-minute first run from the release as six numbered steps with the real tool calls and the shape of their real outputs (measured against the local adapter at this head: `design.compose` Subscription/detail, `viz.render` + `artifact.certify` on its `normalizedSpec`, `code.generate` react/build, `repl` render with `output.compact: false` for a self-contained document), LICENSING (the m03 section, holder span re-rendered by `render-license.mjs`), Feedback, Contributing (the clone path), Working with the tools, the generated tool surface, Repo layout, Docs. The "Historical upstream reference", the recovery paragraph, the Storybook link and the old title are gone.
- **Every count is generated.** Four new claim blocks in `scripts/docs/forge-claims.templates.json` (`what-forge-is`, `three-words`, `generates-and-certifies`, `first-run-health`) render the object, trait, component, chart-type, pattern, tool, brand, accuracy-rule and dashboard counts from the same facts the deep explanation uses; `tests/verification/forge-claims.contract.test.ts` lists them; `pnpm docs:claims --check` and `docs:check` are green.
- **Two stale claims corrected while rewriting.** The old README said `repl` render keeps the full token CSS by default; the measured default is compact (tokens omitted, `tokenCssRef: "tokens.build"`), and `output.compact: false` inlines them (a 215 KB document). The old README linked `docs/patterns/index.md`, which does not exist.
- **FEEDBACK.md**: what helps (a screen that reads wrong, a certification result you disagree with, install friction with how long it took, a chart that says the wrong thing, a sentence that did not make sense), what to include (the tool call, the output, a screenshot or the saved HTML, the client and the runtime version), and where (the two templates, COMMERCIAL.md and the FAQ for licensing, SECURITY.md).
- **Issue templates**: `bug-report.yml` reworded for the release (client, runtime version, tool call, output, expected, environment); new `did-not-read-right.yml` ("This did not read right": what, which screen or document, what you saw, what you expected, runtime); `feature-request.yml` kept; `adoption-support.yml` removed; `config.yml` with blank issues off and contact links to FEEDBACK.md, COMMERCIAL.md and SECURITY.md.
- **Spec**: `tests/verification/readme.s200.test.ts` pins the title, the three definitions, the generated counts against `collectFacts()`, the certify sentences, the six first-run steps with their tool calls in order, the LICENSING/feedback/contributing/deep-explanation pointers, the absence of "open source" and of the retired `repl.*` names, FEEDBACK.md's phrases and the four template files' shapes.

## Rendered README

`readme-rendered.html` is the GitHub markdown API rendering (`gh api -X POST /markdown -f mode=gfm -f context=kneelinghorse/OODS-Forge`) of README.md at sha256 `be6e2aa32588923905ad596dfcfaaa3d1f0aac434eb377f9dfcb64441e1bd16b`; the builder read it once: eleven `h2` sections in the intended order, one ordered list of six steps, six code blocks, two tables (the generated tool surface), no visible claim markers.

## Gates run here

- `pnpm docs:claims` then `pnpm docs:check`; `node scripts/license/render-license.mjs --check`; `pnpm typecheck`.
- Root verification: `readme.s200`, `agent-docs-registry.contract`, `docs.contract`, `license-shape.s200`, `forge-claims.contract`, `how-forge-works.contract`, `s177-prose-carriers.contract`; `@oods/mcp-server` `doc-bites.s196`.

## Not done here

- The ten-minute proof itself is m06; the README is what the fresh session will read. The outside-individual measurement follows the public flip.
