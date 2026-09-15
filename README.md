# OODS Forge

<!-- forge-claim:what-forge-is -->
OODS Forge is a design-system engine that an AI assistant drives over MCP. You name a screen by its object and its context; Forge composes the screen from governed components and tokens, generates it as React, Vue or HTML, renders charts and dashboards from your data, and certifies what it produced against accuracy, accessibility, contrast and determinism rules. It ships as a runtime bundle you extract and connect to Claude Desktop, Claude Code or Cursor.

Today it knows 18 objects, 46 traits and 110 governed components, renders 13 chart types under a taxonomy of 23 named patterns, and advertises 19 tools by default (24 in all).
<!-- /forge-claim:what-forge-is -->

## Three words

<!-- forge-claim:three-words -->
- **Object**: a thing your product has, described once with its fields and behaviours. `Subscription` is an object: a plan, a status, a billing interval and a payment history. Forge ships 18 objects, each defined in YAML; you add your own the same way.
- **Trait**: a capability an object composes in, bringing its fields, states and screen contributions with it. `Subscription` composes `Stateful` (a status with allowed transitions) and `Billable`; `User` and `Organization` compose `Addressable`. There are 46 traits, 21 of them chart traits.
- **Context**: the kind of screen an object is shown in. The same `Subscription` produces a different but consistent screen for each of detail, list, form, timeline, card, inline, workflow; a trait's view extension says what it contributes to which context.
<!-- /forge-claim:three-words -->

## What Forge generates, and what "certify" means

<!-- forge-claim:generates-and-certifies -->
Forge generates React, Vue and HTML screens and whole workflow applications from composed screens, with every component drawn from the 110 governed components and every colour, space and type value from the token system. Two brands ship today, each with light, dark and high-contrast themes. It renders 13 chart types from your data (bar, line, area, scatter, heatmap from tabular rows; treemap, sunburst, sankey, chord, force graph, choropleth, bubble map, flow map from node, link and geometry inputs) and composes dashboards of KPI tiles, trend, breakdown and map panels over 11 admitted chart types, as tokened SVG and specs.

"Certify" is a measurement, not a promise. `artifact.certify` takes a chart specification Forge rendered and runs its four pillars on it: accuracy (16 structural-distortion rules about baselines, hidden aggregation, mis-scaled encodings and inconsistent structure; a chart is graded on the ones that apply to its type, and the result names them), accessibility equivalence (the narrative and the data table say what the chart says), contrast (the drawn paints against the tokens) and determinism (two independent renders hash the same). Each pillar reports pass or fail with findings, and `coverage` says whether the chart type is on the certified path. Generated screens carry a `validationReceipt` from `code.generate` naming the checks that ran (schema structure, component registry, state contract, target readiness, dependency closure and more) and, under `notChecked`, the ones that did not. No receipt claims a check it did not run.
<!-- /forge-claim:generates-and-certifies -->

## Four capability pillars

Every claim Forge makes about its output sits on one of four pillars, and each is reported per call rather than promised in general.

### 1) Accuracy

- `artifact.certify` runs the structural-distortion rules on a chart specification and reports which rules were evaluated and which failed.

### 2) Fidelity

- `viz.render`, `dashboard.render` and generated screens use the governed tokens and components; `fidelity.preview` shows an object at four fidelities from boxes to branded mockup; `tokens.build` and `brand.apply` keep output tied to brand inputs.

### 3) Contract-determinism

- Rendered charts, dashboards and generated file-sets carry canonical content hashes; the same inputs give the same bytes, and `artifact.certify` checks that two independent renders agree.

### 4) Accessibility-by-construction

- `viz.render` synthesizes a narrative and a data table from the same rows it draws; `artifact.certify` checks that they say what the chart says; `repl` (`action: validate`) and the on-demand `a11y.scan` cover screen contracts and token contrast.

## The first run, in ten minutes

You need Node.js 20.11.1 or newer and one of Claude Desktop, Claude Code or Cursor. The steps are the release's install page, [docs/runtime/install.md](docs/runtime/install.md), plus a handful of tool calls your assistant makes for you. Nothing is installed from npm. One rule shapes the run: a `schemaRef` lives in the server your client started, for 30 minutes and for that conversation, so make steps 3, 5 and 6 in one conversation.

1. **Download and verify.** From the [release page](https://github.com/kneelinghorse/OODS-Forge/releases) take `forge-runtime.tar.gz` and `forge-runtime.tar.gz.sha256`, check the digest and extract:
   ```sh
   shasum -a 256 -c forge-runtime.tar.gz.sha256      # sha256sum --check on Linux
   mkdir -p ~/forge-runtime && tar -xzf forge-runtime.tar.gz -C ~/forge-runtime
   ```
2. **Install into your client.** Claude Code, from any project directory, with the absolute path of the directory you extracted into:
   ```sh
   claude mcp add forge -- node /path/to/forge-runtime/packages/mcp-adapter/index.js
   claude mcp get forge          # Status: ✓ Connected
   ```
   Claude Desktop and Cursor take the same command in a JSON block; install.md has both. Ask the assistant to run `health`: it answers `status: "ok"` with the registry counts (objects, traits, components), `server.uptime` in milliseconds and, under `productReality.tools`, the tool ledger by evidence tier; the tools your client lists are the default surface, which `health` does not count.
3. **Compose one screen.** Ask for `design.compose` with `{"object": "Subscription", "context": "detail"}`. The answer has `status: "ok"`, `layout: "detail"`, a `schemaRef` such as `compose-dae744a8` (the rule above; `schema.save` keeps a ref across sessions), `objectUsed` (the object, its version, the traits and the fields it composed) and `selections`: one entry per slot naming the component chosen, its confidence and the reason, for example `CycleProgressCard` for `tab-0` at `0.95`. `warnings` are normal on this call: the shipped `Subscription` is beta, some of its fields override trait defaults, and one contribution has no slot in the detail layout; a low-confidence slot carries a `reviewHint` (see Overrides below).
4. **Certify a chart.** Certification runs on chart specifications. The screen's own chart (`src/charts/payment-001.svg` in step 5) is rendered inside code generation, so this step makes a small chart of its own with `viz.render` and certifies that. Ask for `viz.render` with
   ```json
   {"chartType": "bar", "rows": [{"status": "active", "count": 17}, {"status": "draft", "count": 5}, {"status": "archived", "count": 3}],
    "encodings": {"x": {"field": "status", "type": "nominal"}, "y": {"field": "count", "type": "quantitative", "aggregate": "sum"}},
    "output": {"includeNormalizedSpec": true, "includeA11y": true}}
   ```
   It returns the spec, a `contentHash`, an `a11y` narrative and table, and `normalizedSpec`. Then `artifact.certify` with `{"spec": <that normalizedSpec>}` returns `coverage: "certified"`, `conformant: true` and `pillars: {"a11yEquivalence": "pass", "determinism": "pass", "contrast": "pass", "accuracy": "pass"}`, with `findings` for anything that failed and `accuracyRules` naming the rules that applied to this chart (four of the set apply to a plain bar chart).
5. **Generate the app.** `code.generate` with `{"schemaRef": "<from step 3>", "framework": "react", "profile": "build"}` returns `artifact.files` (`src/GeneratedUI.tsx` and the screen's chart, `src/charts/payment-001.svg`), `artifact.contentHash` (`sha256:…`; the same inputs give the same hash), `artifact.dependencies` with exact versions, and a `validationReceipt` listing the checks that ran and, under `notChecked`, the ones that did not. `"framework": "vue"` gives the Vue file-set.
6. **Look at it.** `repl` with `{"action": "render", "schemaRef": "<from step 3>", "apply": true, "output": {"compact": false}}` returns `html`: a complete document with the token CSS inline, titled after the screen (`Subscription detail`), showing the composed screen's structure (its header, tabs, summaries and timelines); a field bound by name with no value shows `—` where live data would go. Ask the assistant to save it as `subscription-detail.html` and open it in your browser. To run the generated component in an app instead, create a Vite React project, pack the four packages from the bundle, install the tarballs, copy the artifact's files into `src/`, and mount `GeneratedUI` with the object's fields and its four action handlers as props:
   ```sh
   npm pack --ignore-scripts ~/forge-runtime/packages/tokens ~/forge-runtime/packages/component-contracts ~/forge-runtime/packages/component-styles ~/forge-runtime/packages/components-react
   npm install ./oods-*.tgz
   ```

Two of these calls return large results: `code.generate` (the whole file-set) and the rendered document. If your client saves a large result to a file and asks to read it, allow it; a reply written without seeing the result is a guess.

<!-- forge-claim:first-run-health -->
The default surface is 19 tools; `MCP_TOOLSET=all` advertises all 24. `health` reports the tool ledger's 24 entries by evidence tier, not the surface your client lists.
<!-- /forge-claim:first-run-health -->

`design.preview` opens the composed screen as the generated React or Vue app actually running: `{"object": "Subscription", "context": "detail"}` returns one URL per framework, served on 127.0.0.1 by the preview host your adapter starts (or by the bridge), with the schema hash and the compiled module digests; open the URL in your browser. Without a reachable host it returns `OODS-N021`. When a step took longer than it should, or read wrong, say so: [FEEDBACK.md](FEEDBACK.md).

## LICENSING

<!-- license-holder:start -->
Copyright (c) 2026 System Systems LLC (https://aquex.ai). OODS Forge is licensed under the PolyForm Noncommercial License 1.0.0 (SPDX `PolyForm-Noncommercial-1.0.0`), the text in [LICENSE](LICENSE). Commercial licensing: [COMMERCIAL.md](COMMERCIAL.md) or derek@derekn.com.
<!-- license-holder:end -->

In plain words:

- Individuals, students, hobbyists, researchers, nonprofits and government bodies may use, study, modify and share Forge for any noncommercial purpose, forks and patches included.
- Any commercial purpose needs a commercial license from the licensor. That includes use inside a company, evaluation by a company, products or services built on Forge, and work delivered to a paying client. [COMMERCIAL.md](COMMERCIAL.md) says how, and [docs/LICENSE-FAQ.md](docs/LICENSE-FAQ.md) covers the fuzzy edges.
- The license is source-available and noncommercial. It is not an OSI-approved license and it never converts to one; GitHub's license detector therefore shows "Other".
- Contributions are welcome under the inbound grant in [CONTRIBUTING.md](CONTRIBUTING.md). There is no CLA.

**The OODS-Foundry snapshot.** The public OODS-Foundry repository's manifest declared MIT with no LICENSE file. Anyone who fetched those commits keeps that grant to that snapshot. Nothing in OODS-Forge from this commit on is MIT.

## Feedback

Forge is released to individuals so it can be proven out. A screen that reads wrong, a certification result you disagree with, install friction and how long it took, a chart that says the wrong thing, a sentence that did not make sense: [FEEDBACK.md](FEEDBACK.md) says what to include, and the issue templates ([bug report](https://github.com/kneelinghorse/OODS-Forge/issues/new?template=bug-report.yml), [this did not read right](https://github.com/kneelinghorse/OODS-Forge/issues/new?template=did-not-read-right.yml)) take it from there.

## Contributing

The release is the user path; cloning is the contributor path. Clone, install and build, then connect a client to the clone with [docs/mcp/Connections.md](docs/mcp/Connections.md):

```sh
git clone https://github.com/kneelinghorse/OODS-Forge.git && cd OODS-Forge
pnpm install --frozen-lockfile
pnpm run build:tokens && pnpm run build:packages
pnpm --filter @oods/mcp-server run build
```

[CONTRIBUTING.md](CONTRIBUTING.md) has the workflow, the local gates and the inbound license grant. `agents.md` is the charter for agents working in the repository.

## Working with the tools

<!-- forge-claim:schema-ttl -->
- `schemaRef` TTL: refs returned by `design.compose`, `design.preview`, `pipeline`, and `schema.load` last 30 minutes inside the server process that issued them; a client keeps that process for one conversation, and a restarted client starts a new one that does not know earlier refs (`OODS-N003`). Persist them with `schema.save` when the workflow spans sessions or multiple review loops.
<!-- /forge-claim:schema-ttl -->
- `apply`: write-capable tools default to dry-run or preview behaviour. Set `apply: true` only when you want artifacts written or heavy outputs returned; `repl` (`action: render`) returns HTML only with `apply: true`.
- `compact`: `pipeline` and `repl` (`action: render`) omit the token CSS by default and point at `tokens.build` instead. Pass `output.compact: false` for a self-contained document.
- Trait names: `catalog.list` and `map` use canonical trait names such as `Stateful` or `Priceable`. `object` (`action: list`) accepts full or suffix-matched namespaced names such as `lifecycle/Stateful` or `Stateful`.
- Overrides: when `design.compose` reports a low-confidence selection or a `reviewHint` (on the first run's sample call that is the `metadata` slot, at 0.40), pin only that slot to one of its listed candidates with `preferences.componentOverrides`, for example `{"object": "Subscription", "context": "detail", "preferences": {"componentOverrides": {"metadata": "TagSummary"}}}`; a pinned slot comes back at confidence 1.0 with the reason "explicitly pinned".
- Project defaults: a `.oodsrc` JSON file in your project root sets defaults for `pipeline`, `design.compose` and `code.generate` (`{ "framework": "vue", "styling": "tailwind", "typescript": false }`); explicit parameters win, and a missing or invalid file is ignored.

Full contracts: [docs/mcp/Tool-Specs.md](docs/mcp/Tool-Specs.md) and [docs/api/README.md](docs/api/README.md).

<!-- forge-claim:tool-surface -->
## MCP tool surface (24 tools)

Generated from `packages/mcp-server/src/tools/registry.json`, input schemas and the tool capability ledger by `pnpm docs:claims`. Proof tiers describe source evidence location; they do not certify execution.

**Auto-registered (19 tools)** — available by default. The five action families (`design.preview`, `map`, `schema`, `object`, `repl`) use the top-level `action` parameter.

| Tool / actions | Source evidence tier |
| --- | --- |
| `tokens.build` | product-reality |
| `structuredData.fetch` | product-reality |
| `brand.apply` | product-reality |
| `brand.intake` | product-reality |
| `catalog.list` | product-reality |
| `code.generate` | product-reality |
| `design.compose` | product-reality |
| `design.preview` (`render`/`compare`/`edit`/`versions`) | product-reality |
| `pipeline` | product-reality |
| `health` | product-reality |
| `registry.snapshot` | product-reality |
| `viz.render` | product-reality |
| `dashboard.render` | product-reality |
| `artifact.certify` | product-reality |
| `fidelity.preview` | product-reality |
| `map` (`create`/`list`/`resolve`/`update`/`delete`/`apply`) | product-reality |
| `schema` (`save`/`load`/`list`/`delete`) | product-reality |
| `object` (`list`/`show`) | product-reality |
| `repl` (`render`/`validate`) | product-reality |

**On-demand (5 tools)** — enable with `MCP_TOOLSET=all` or `MCP_EXTRA_TOOLS=...`:

| Tool | Source evidence tier |
| --- | --- |
| `diag.snapshot` | contract |
| `billing.reviewKit` | contract |
| `billing.switchFixtures` | contract |
| `a11y.scan` | contract |
| `release.tag` | contract |

Full contracts: `docs/mcp/Tool-Specs.md` and `docs/api/README.md`.

<!-- /forge-claim:tool-surface -->

## Repo layout

```
OODS-Forge/
├── objects/, traits/, domains/, schemas/   # the registry: what Forge knows
├── packages/mcp-server/                    # the tools
├── packages/mcp-adapter/                   # stdio entry point for clients
├── packages/mcp-bridge/                    # HTTP bridge
├── packages/tokens/                        # DTCG tokens, brands and themes
├── packages/components-react|vue|styles/   # the governed components
├── packages/viz-core|viz-render/           # chart compiler and renderer
├── scripts/runtime/                        # bundle assembly, E2E, notices, client configs
├── artifacts/                              # receipts and structured data
└── docs/                                   # how it works, contracts, runbooks
```

## Docs

- [docs/how-forge-works.html](docs/how-forge-works.html): the deep explanation, generated from the registry and the ledgers.
- [docs/runtime/install.md](docs/runtime/install.md) and [docs/runtime/portable-runtime.md](docs/runtime/portable-runtime.md): the release and the bundle contract.
- [docs/mcp/Tool-Specs.md](docs/mcp/Tool-Specs.md), [docs/api/README.md](docs/api/README.md), [docs/mcp/Connections.md](docs/mcp/Connections.md).
- [docs/README.md](docs/README.md), the [Regions Specification](docs/specs/regions.md) and [Modifier Purity](docs/patterns/modifier-purity.md).
- [CHANGELOG.md](CHANGELOG.md) and [SECURITY.md](SECURITY.md).
