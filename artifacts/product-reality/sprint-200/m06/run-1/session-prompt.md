You are a person trying OODS Forge for the first time. You have never seen it, you have no access to its source code, and you know nothing about it beyond two documents (README.md and install.md, given to you below in full) and the six release files that were downloaded for you into `/private/tmp/claude-501/-Users-systemsystems-portfolio-Design-Tools-OODS-Forge/3451bf4e-7b6f-40ae-a646-79864acacee2/scratchpad/m06-assets` (the release lives on a private repository, so the download step was done for you; treat that directory as "the release page's files").

Hard rules for this session:

1. Do not read, list or search anything on this machine other than: the two documents below, the files in `/private/tmp/claude-501/-Users-systemsystems-portfolio-Design-Tools-OODS-Forge/3451bf4e-7b6f-40ae-a646-79864acacee2/scratchpad/m06-assets`, and the directories you create under `/private/tmp/claude-501/-Users-systemsystems-portfolio-Design-Tools-OODS-Forge/3451bf4e-7b6f-40ae-a646-79864acacee2/scratchpad/m06-run-1`. No other directories, no source code, no other documentation, no web searches.
2. Do not use any MCP tool that may already be available to you. Forge is reached only the way the documents describe.
3. Work in a clean HOME for the install and registration steps: prefix `claude mcp add` and `claude mcp get` with `HOME=/private/tmp/claude-501/-Users-systemsystems-portfolio-Design-Tools-OODS-Forge/3451bf4e-7b6f-40ae-a646-79864acacee2/scratchpad/m06-run-1/home` and run them from the scratch project `/private/tmp/claude-501/-Users-systemsystems-portfolio-Design-Tools-OODS-Forge/3451bf4e-7b6f-40ae-a646-79864acacee2/scratchpad/m06-run-1/project`. Extract the runtime under that HOME (for example `/private/tmp/claude-501/-Users-systemsystems-portfolio-Design-Tools-OODS-Forge/3451bf4e-7b6f-40ae-a646-79864acacee2/scratchpad/m06-run-1/home/forge-runtime`).
4. Claude Code on this machine is logged in only under the real HOME, so the clean HOME cannot run an interactive assistant. Wherever the README says "ask the assistant" or "ask for", you are the assistant's stand-in: run Claude Code in print mode from `/private/tmp/claude-501/-Users-systemsystems-portfolio-Design-Tools-OODS-Forge/3451bf4e-7b6f-40ae-a646-79864acacee2/scratchpad/m06-run-1/project` without the HOME prefix, with the same server definition install.md gives (the Claude Desktop JSON block with your path filled in, saved as `/private/tmp/claude-501/-Users-systemsystems-portfolio-Design-Tools-OODS-Forge/3451bf4e-7b6f-40ae-a646-79864acacee2/scratchpad/m06-run-1/project/forge.mcp.json`):

   claude -p --model sonnet --strict-mcp-config --mcp-config forge.mcp.json --allowedTools "mcp__forge__*" "<exactly what you would have asked>"

   Ask for the tool call the README names and for the fields the README says come back; keep each request short. If a print-mode call fails, record it verbatim and try once more with a clearer request, then move on.
5. Do not fix, patch or work around Forge or its documents. When something fails or reads wrong, record it and continue with whatever honest alternative the documents give.
6. Time everything. Before and after each step record `date +%s` (or use `time`), and keep the wall-clock seconds per step. The clock that matters is the wall time of the commands you run; do not pause between steps.
7. Stop after 25 minutes of wall time even if unfinished, and report what you reached.

Do the README's "first run" exactly as written, in its order: (1) verify and extract, (2) install into the client and run `health`, (3) compose one screen, (4) certify a chart, (5) generate the app, (6) look at it (save the returned HTML as `/private/tmp/claude-501/-Users-systemsystems-portfolio-Design-Tools-OODS-Forge/3451bf4e-7b6f-40ae-a646-79864acacee2/scratchpad/m06-run-1/project/subscription-detail.html`, open it with `open`, and describe in the transcript what the document contains: its title, the headings you see in its text, and any component markers such as `data-oods-component`). Skip the "run it as an app" alternative in step 6.

Write these files, and nothing else outside `/private/tmp/claude-501/-Users-systemsystems-portfolio-Design-Tools-OODS-Forge/3451bf4e-7b6f-40ae-a646-79864acacee2/scratchpad/m06-run-1`:

- `/private/tmp/claude-501/-Users-systemsystems-portfolio-Design-Tools-OODS-Forge/3451bf4e-7b6f-40ae-a646-79864acacee2/scratchpad/m06-run-1/out/transcript.md`: every command you ran, verbatim, with its output (or the part of it that matters, and every error in full), each with a timestamp.
- `/private/tmp/claude-501/-Users-systemsystems-portfolio-Design-Tools-OODS-Forge/3451bf4e-7b6f-40ae-a646-79864acacee2/scratchpad/m06-run-1/out/timings.json`: `{"steps": [{"step": "<name>", "startedAt": "<ISO>", "endedAt": "<ISO>", "seconds": <number>, "outcome": "pass" | "fail" | "partial", "note": "<one line>"}], "totalSeconds": <number>, "installToSeeSeconds": <number>}` where installToSee covers steps 2 through 6.
- `/private/tmp/claude-501/-Users-systemsystems-portfolio-Design-Tools-OODS-Forge/3451bf4e-7b6f-40ae-a646-79864acacee2/scratchpad/m06-run-1/out/friction.md`: every point of friction, verbatim and specific: what you read (quote it), what you expected, what happened. Include the small things (a sentence you had to read twice, a value you had to guess, a step that took longer than it should) and how long each cost you.
- `/private/tmp/claude-501/-Users-systemsystems-portfolio-Design-Tools-OODS-Forge/3451bf4e-7b6f-40ae-a646-79864acacee2/scratchpad/m06-run-1/out/issue.md`: one issue following the "This did not read right" template fields (What did not read right; Which screen or document; What you saw; What you expected instead; Runtime version), about the single most confusing thing you met. Then file it with:

   gh issue create --repo kneelinghorse/OODS-Forge --title "[Reads wrong]: <short title>" --body-file /private/tmp/claude-501/-Users-systemsystems-portfolio-Design-Tools-OODS-Forge/3451bf4e-7b6f-40ae-a646-79864acacee2/scratchpad/m06-run-1/out/issue.md --label reads-wrong

  and write the returned URL to `/private/tmp/claude-501/-Users-systemsystems-portfolio-Design-Tools-OODS-Forge/3451bf4e-7b6f-40ae-a646-79864acacee2/scratchpad/m06-run-1/out/issue-url.txt`.

Finish with a short report: seconds per step, install-to-see total, which of install / compose / certify / generate / see passed, the issue URL, and the three biggest friction points in one line each.

===== README.md (as published) =====
# OODS Forge

<!-- forge-claim:what-forge-is -->
OODS Forge is a design-system engine that an AI assistant drives over MCP. You name a screen by its object and its context; Forge composes the screen from governed components and tokens, generates it as React, Vue or HTML, renders charts and dashboards from your data, and certifies what it produced against accuracy, accessibility, contrast and determinism rules. It ships as a runtime bundle you extract and connect to Claude Desktop, Claude Code or Cursor.

Today it knows 19 object definitions, 46 traits and 110 governed components, renders 13 chart types under a taxonomy of 23 named patterns, and advertises 19 tools by default (24 in all).
<!-- /forge-claim:what-forge-is -->

## Three words

<!-- forge-claim:three-words -->
- **Object**: a thing your product has, described once with its fields and behaviours. `Subscription` is an object: a plan, a status, a billing interval and a payment history. Forge ships 19 object definitions; you add your own as YAML.
- **Trait**: a capability an object composes in, bringing its fields, states and screen contributions with it. `Subscription` composes `Stateful` (a status with allowed transitions) and `Billable`; `User` and `Organization` compose `Addressable`. There are 46 traits, 21 of them chart traits.
- **Context**: the kind of screen an object is shown in. The same `Subscription` produces a different but consistent screen for each of detail, list, form, timeline, card, inline, workflow; a trait's view extension says what it contributes to which context.
<!-- /forge-claim:three-words -->

## What Forge generates, and what "certify" means

<!-- forge-claim:generates-and-certifies -->
Forge generates React, Vue and HTML screens and whole workflow applications from composed screens, with every component drawn from the 110 governed components and every colour, space and type value from the token system. Two brands ship today, each with light, dark and high-contrast themes. It renders 13 chart types from your data (bar, line, area, scatter, heatmap from tabular rows; treemap, sunburst, sankey, chord, force graph, choropleth, bubble map, flow map from node, link and geometry inputs) and composes dashboards of KPI tiles, trend, breakdown and map panels over 11 admitted chart types, as tokened SVG and specs.

"Certify" is a measurement, not a promise. `artifact.certify` takes a chart specification Forge rendered and runs its four pillars on it: accuracy (16 rules about baselines, hidden aggregation, mis-scaled encodings and inconsistent structure), accessibility equivalence (the narrative and the data table say what the chart says), contrast (the drawn paints against the tokens) and determinism (two independent renders hash the same). Each pillar reports pass or fail with findings, and `coverage` says whether the chart type is on the certified path. Generated screens carry a `validationReceipt` from `code.generate` naming the checks that ran (schema structure, component registry, state contract, target readiness, dependency closure and more) and, under `notChecked`, the ones that did not. No receipt claims a check it did not run.
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

You need Node.js 20.11.1 or newer and one of Claude Desktop, Claude Code or Cursor. The steps are the release's install page, [docs/runtime/install.md](docs/runtime/install.md), plus a handful of tool calls your assistant makes for you. Nothing is installed from npm.

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
   Claude Desktop and Cursor take the same command in a JSON block; install.md has both. Ask the assistant to run `health`: it answers `status: "ok"` with the registry counts and the tool count.
3. **Compose one screen.** Ask for `design.compose` with `{"object": "Subscription", "context": "detail"}`. The answer has `status: "ok"`, `layout: "detail"`, a `schemaRef` such as `compose-dae744a8` (it lasts 30 minutes; `schema.save` keeps it longer), `objectUsed` (the object, its version, the traits and the fields it composed) and `selections`: one entry per slot naming the component chosen, its confidence and the reason, for example `CycleProgressCard` for `tab-0` at `0.95`.
4. **Certify a chart.** Certification runs on charts, so render one and certify it. Ask for `viz.render` with
   ```json
   {"chartType": "bar", "rows": [{"status": "active", "count": 17}, {"status": "draft", "count": 5}, {"status": "archived", "count": 3}],
    "encodings": {"x": {"field": "status", "type": "nominal"}, "y": {"field": "count", "type": "quantitative", "aggregate": "sum"}},
    "output": {"includeNormalizedSpec": true, "includeA11y": true}}
   ```
   It returns the spec, a `contentHash`, an `a11y` narrative and table, and `normalizedSpec`. Then `artifact.certify` with `{"spec": <that normalizedSpec>}` returns `coverage: "certified"`, `conformant: true` and `pillars: {"a11yEquivalence": "pass", "determinism": "pass", "contrast": "pass", "accuracy": "pass"}`, with `findings` for anything that failed.
5. **Generate the app.** `code.generate` with `{"schemaRef": "<from step 3>", "framework": "react", "profile": "build"}` returns `artifact.files` (`src/GeneratedUI.tsx` and the screen's chart, `src/charts/payment-001.svg`), `artifact.contentHash` (`sha256:…`; the same inputs give the same hash), `artifact.dependencies` with exact versions, and a `validationReceipt` listing the checks that ran and, under `notChecked`, the ones that did not. `"framework": "vue"` gives the Vue file-set.
6. **Look at it.** `repl` with `{"action": "render", "schemaRef": "<from step 3>", "apply": true, "output": {"compact": false}}` returns `html`: a complete document with the token CSS inline. Ask the assistant to save it as `subscription-detail.html` and open it in your browser. To run the generated component in an app instead, create a Vite React project, pack the four packages from the bundle, install the tarballs, copy the artifact's files into `src/`, and mount `GeneratedUI` with the object's fields and its four action handlers as props:
   ```sh
   npm pack --ignore-scripts ~/forge-runtime/packages/tokens ~/forge-runtime/packages/component-contracts ~/forge-runtime/packages/component-styles ~/forge-runtime/packages/components-react
   npm install ./oods-*.tgz
   ```

<!-- forge-claim:first-run-health -->
The default surface is 19 tools; `MCP_TOOLSET=all` advertises all 24, and `health` reports the counts it serves.
<!-- /forge-claim:first-run-health -->

`design.preview`, the live preview server, is not available from the bundle yet and returns `OODS-N019`; the rendered document in step 6 is the way to see a screen today. When a step took longer than it should, or read wrong, say so: [FEEDBACK.md](FEEDBACK.md).

## LICENSING

<!-- license-holder:start -->
Copyright (c) 2026 Derek Niedringhaus (https://derekn.com). OODS Forge is licensed under the PolyForm Noncommercial License 1.0.0 (SPDX `PolyForm-Noncommercial-1.0.0`), the text in [LICENSE](LICENSE). Commercial licensing: [COMMERCIAL.md](COMMERCIAL.md) or derek@derekn.com.
<!-- license-holder:end -->

In plain words:

- Individuals, students, hobbyists, researchers, nonprofits and government bodies may use, study, modify and share Forge for any noncommercial purpose, forks and patches included.
- Any commercial purpose needs a commercial license from Derek. That includes use inside a company, evaluation by a company, products or services built on Forge, and work delivered to a paying client. [COMMERCIAL.md](COMMERCIAL.md) says how, and [docs/LICENSE-FAQ.md](docs/LICENSE-FAQ.md) covers the fuzzy edges.
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
- `schemaRef` TTL: refs returned by `design.compose`, `design.preview`, `pipeline`, and `schema.load` last 30 minutes. Persist them with `schema.save` when the workflow spans sessions or multiple review loops.
<!-- /forge-claim:schema-ttl -->
- `apply`: write-capable tools default to dry-run or preview behaviour. Set `apply: true` only when you want artifacts written or heavy outputs returned; `repl` (`action: render`) returns HTML only with `apply: true`.
- `compact`: `pipeline` and `repl` (`action: render`) omit the token CSS by default and point at `tokens.build` instead. Pass `output.compact: false` for a self-contained document.
- Trait names: `catalog.list` and `map` use canonical trait names such as `Stateful` or `Priceable`. `object` (`action: list`) accepts full or suffix-matched namespaced names such as `lifecycle/Stateful` or `Stateful`.
- Overrides: when `design.compose` reports a low-confidence selection or a `reviewHint`, pin only that slot with `preferences.componentOverrides`, for example `{"object": "Subscription", "context": "detail", "preferences": {"componentOverrides": {"header": "DetailHeader"}}}`.
- Project defaults: a `.oodsrc` JSON file in your project root sets defaults for `pipeline`, `design.compose` and `code.generate` (`{ "framework": "vue", "styling": "tailwind", "typescript": false }`); explicit parameters win, and a missing or invalid file is ignored.

Full contracts: [docs/mcp/Tool-Specs.md](docs/mcp/Tool-Specs.md) and [docs/api/README.md](docs/api/README.md).

<!-- forge-claim:tool-surface -->
## MCP tool surface (24 tools)

Generated from `packages/mcp-server/src/tools/registry.json`, input schemas and the tool capability ledger by `pnpm docs:claims`. Proof tiers describe source evidence location; they do not certify execution.

**Auto-registered (19 tools)** — available by default. The four action families (`map`, `schema`, `object`, `repl`) use the top-level `action` parameter.

| Tool / actions | Source evidence tier |
| --- | --- |
| `tokens.build` | product-reality |
| `structuredData.fetch` | product-reality |
| `brand.apply` | product-reality |
| `brand.intake` | product-reality |
| `catalog.list` | product-reality |
| `code.generate` | product-reality |
| `design.compose` | product-reality |
| `design.preview` | product-reality |
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

===== end README.md =====

===== install.md (the release's install page) =====
<!-- Generated by scripts/runtime/client-configs.mjs from the tool registry, the adapter manifest and the runtime manifest module. Do not edit; run `node scripts/runtime/client-configs.mjs` and verify with `--check`. -->
# Install the OODS Forge runtime

This page is the user path: from a downloaded release to a working MCP server in Claude Desktop, Claude Code or Cursor. Nothing is built or installed from npm; the archive contains everything the adapter needs. Contributors who clone the repository use [docs/mcp/Connections.md](../mcp/Connections.md) instead.

## 1. What you download

Every release at <https://github.com/kneelinghorse/OODS-Forge/releases> carries these files:

- `forge-runtime.tar.gz`: the runtime (MCP server, stdio adapter, HTTP bridge, tokens, component packages, registry data and the production dependency closure).
- `forge-runtime.tar.gz.sha256`: the SHA-256 of the archive.
- `forge-runtime.manifest.json`: the source commit, package versions, Node floor and payload digests.
- `runtime-sbom-lite.json`: every third-party package in the archive with its integrity hash.
- `THIRD-PARTY-NOTICES.md`: the licenses of those packages.
- `install.md`: this page.

Inside the archive, `LICENSE`, `COMMERCIAL.md` and `THIRD-PARTY-NOTICES.md` sit at the root beside the manifest. OODS Forge is licensed under PolyForm Noncommercial 1.0.0: free for personal, research, educational, nonprofit and government use; any commercial use, including use inside a company, needs the commercial license in `COMMERCIAL.md`.

## 2. Requirements

- Node.js 20.11.1 or newer on the PATH as `node` (or set `OODS_NODE_PATH` to a Node binary).
- macOS, Linux or Windows with a shell that can run `tar`; no package manager, no build step.
- One of the clients below.

## 3. Verify and extract

Check the download against its digest, then extract into a directory you keep. The commands below use `~/forge-runtime`; any absolute path works.

```sh
shasum -a 256 -c forge-runtime.tar.gz.sha256        # macOS
sha256sum --check forge-runtime.tar.gz.sha256        # Linux
mkdir -p ~/forge-runtime
tar -xzf forge-runtime.tar.gz -C ~/forge-runtime
```

On Windows PowerShell, compare `(Get-FileHash forge-runtime.tar.gz -Algorithm SHA256).Hash` with the value in the `.sha256` file, then extract with `tar -xzf forge-runtime.tar.gz -C C:\forge-runtime`.

The extracted directory is what every configuration below calls `/path/to/forge-runtime`. Use your absolute path (the expanded form of `~/forge-runtime`, or `C:\\forge-runtime` on Windows) wherever the placeholder appears. The server entry point is `/path/to/forge-runtime/packages/mcp-adapter/index.js`; the adapter starts the bundled native server itself.

## 4. Connect a client

All three clients speak to the same stdio adapter and see the same 19 tools by default. The server is registered under the name `forge`.

### Claude Desktop

Open the configuration file (create it if it does not exist):

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

Add the `forge` entry under `mcpServers` (the same block is in `configs/agents/claude-desktop.stdio-mcp.json`):

```json
{
  "mcpServers": {
    "forge": {
      "command": "node",
      "args": [
        "/path/to/forge-runtime/packages/mcp-adapter/index.js"
      ]
    }
  }
}
```

Restart Claude Desktop. The tools appear under the `forge` server.

### Claude Code

From the project directory where you want the server available, run:

```sh
claude mcp add forge -- node /path/to/forge-runtime/packages/mcp-adapter/index.js
claude mcp get forge
```

The second command prints the registration and its status; `Status: ✓ Connected` means the adapter started and answered. Add `-s user` to the first command to register the server for every project, and `-e MCP_TOOLSET=all` to advertise all 24 tools. `claude mcp remove forge` undoes the registration. The equivalent JSON block is in `configs/agents/claude-code.stdio-mcp.json`.

### Cursor

Create `.cursor/mcp.json` in the project (or `~/.cursor/mcp.json` for every project) with the same block as `configs/agents/cursor.stdio-mcp.json`:

```json
{
  "mcpServers": {
    "forge": {
      "command": "node",
      "args": [
        "/path/to/forge-runtime/packages/mcp-adapter/index.js"
      ]
    }
  }
}
```

Reload the Cursor window. The server shows up in the MCP settings with its tools.

## 5. First call

Ask the assistant to run the `health` tool. A healthy answer reports `status: ok`, the registry counts (19 auto tools, 24 total) and the product-reality summaries. Then compose a screen: `design.compose` with an intent such as "subscription detail page", followed by `code.generate` for React or Vue, produces a generated application whose readiness is attested against the shipped package bytes.

## 6. Settings

Environment variables are optional; every default is the documented one.

| Variable | Default | Effect |
| --- | --- | --- |
| `MCP_TOOLSET` | `default` | `default` advertises 19 tools; `all` advertises all 24. |
| `MCP_EXTRA_TOOLS` | (none) | Comma-separated on-demand tools added to the default surface, for example `a11y.scan,diag.snapshot`. |
| `MCP_ROLE` | `designer` | Policy role (`designer` or `maintainer`). |
| `OODS_NODE_PATH` | the Node running the adapter | Node binary used to start the native server. |

Set them in the client's `env` block (Claude Desktop, Cursor) or with `-e KEY=value` on `claude mcp add`. The complete runtime contract, including where the bundle writes files and every other variable it reads, is in [docs/runtime/portable-runtime.md](portable-runtime.md).

## 7. Where things go

Read-only use creates no files. Calls that opt into writing (`apply: true`, saved schemas, mappings) write under the extracted directory: `artifacts/current-state/<date>/` for run bundles and `.oods/` for saved schemas. Delete those directories to reset; the shipped files never change. To remove the runtime, remove the client entry and delete `/path/to/forge-runtime`.

## 8. Versions and feedback

This page describes runtime v0.1.0 with adapter 0.3.0. The manifest inside the archive names the exact source commit. Problems, questions and "this did not read right" notes go to <https://github.com/kneelinghorse/OODS-Forge/issues/new/choose>.

===== end install.md =====
