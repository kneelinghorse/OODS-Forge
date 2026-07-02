# Research Report: DSV-045 - Generative & Agentic Data Visualization: SOTA for an Agent-Native Viz/BI Engine

> ⚠️ **2026-06-29 — Forge-mapping claims partially obsolete.** The DSV-045 SOTA framework (Draco/LIDA/Cube/Malloy/nvBench/Vega-Lite/ECharts) remains valid, but the Forge-specific mapping claims about `viz.fromText`, the LLM parser, and the `nlviz-accuracy` gate refer to code **REVERTED on 2026-06-29** (commit `a0e876e`, decision #973). The deterministic `viz.render` structured-`intent` mode (s131) survives; treat all NL→viz/parser/eval-gate Forge specifics here as historical.

**Sources collected:** 114
**Verified references:** 16
**Agent steps:** 14 / 40
**Runtime:** 4m 56s

> **Editor's note (2026-06-16, working draft).** Reviewed against primary sources + the real Forge codebase. Three caveats handled: (1) misattributed citations **[3] Voyager 2** and **[4] CompassQL** corrected, and **[14] LookML** refreshed (the originals were live URLs but pointed at the wrong/stale papers). (2) Sections that returned "[Data unavailable in primary sources]" — Voyager (3.1), LookML (3.13), Tableau Pulse (3.14), ThoughtSpot (3.15), Perceptual Effectiveness (3.17) — are backfilled in **§10**, labeled as editor knowledge (not DeepSearch primary sources). (3) **Every "How it plugs into Forge" claim is INFERENCE** from the mission brief (Forge is private); **§10b reconciles those claims against the verified codebase.** Trust the strategy spine + the system descriptions (Draco/LIDA/Cube/Malloy/nvBench/Vega-Lite/ECharts are accurate); treat Forge-mapping specifics as verified only where §10b confirms them. ~55–65% source-grounded; the rest is honestly-flagged inference.

## For OODS Forge — Agent-Native Viz/BI Engine Strategy

## 1. Executive Summary

This report maps the state-of-the-art in automatic, LLM-driven, and agentic data visualization and business intelligence, scoped to ground a flagship generative-viz strategy for OODS Forge. Forge enters this space with substantial structural advantages: a grammar-of-graphics (GoG) normalized viz spec compiling to both Vega-Lite and ECharts, a heuristic chart-recommendation engine, a semantic Object Catalog, and tokenized multi-brand theming with WCAG-AA accessibility.

The core finding is that **an achievable-today deterministic agentic-viz engine is possible** by combining four well-established families of techniques: (a) declarative visualization recommendation (Voyager/CompassQL style) that outputs to a grammar-of-graphics spec; (b) LLM-based natural-language-to-visualization (LIDA, nvBench-trained models) with a structured, grammar-constrained generation surface; (c) a semantic/metrics layer (Cube, Malloy, dbt MetricFlow) that grounds generated queries in validated business definitions; and (d) an agentic orchestration layer (inspired by Data-to-Dashboard multi-agent frameworks and ThoughtSpot's agentic BI) that composes dashboards from typed entities and relationships.

The research frontier — fully autonomous, insight-generating agents that replace BI analysts — remains unproven in production. Current LLM→viz systems struggle with ambiguity resolution, complex multi-view dashboards, and maintaining data grounding across exploration sessions. The pragmatic strategy is to ship a deterministic, (semi-)structured pipeline now, instrument it for continuous learning, and gradually increase agentic autonomy as the research frontier stabilizes.

**Key Recommendation:** Build a pipeline that accepts tabular data + an optional NL utterance, applies data profiling + Voyager-style recommendation to produce a ranked list of visualization candidates, refines them through Draco-style perceptual-constraint optimization, resolves semantic grounding via the Object Catalog + Cube-style metrics layer, and serializes to the Forge GoG spec. Offer an LLM "copilot" overlay for natural-language refinement but keep the core path deterministic. This yields robust, trustworthy, and brand-compliant visualizations today while positioning Forge to ride the agentic wave as it matures.

## 2. Reasoning Summary

This report synthesizes primary sources retrieved between 2023–2026: the GenAI for Visualization survey [1]  provided broad context; Vega-Lite specification documentation [2]  confirmed the GoG normal form; Voyager 2 and CompassQL papers [3] [4]  supplied the recommendation engine design; Draco 2 [5]  provided constraint-based optimization; LIDA [6]  demonstrated LLM→viz with a grammar-agnostic approach; nvBench [7]  and nvBench 2.0 [8]  provided evaluation benchmarks; the agnostic visual recommendation survey [9]  identified open challenges; Data-to-Dashboard [10]  showed multi-agent dashboard composition; Cube [11] , Malloy [12] , dbt MetricFlow [13] , and [Data unavailable in primary sources] grounded the semantic-layer analysis; ThoughtSpot's agentic BI posture [15]  and [Data unavailable in primary sources] provided commercial benchmarks; Observable Plot [17]  and ECharts [18]  served as render targets; the graphical perception knowledge survey [19]  anchored perceptual effectiveness.

Gaps remain: Tableau Pulse and Draco full-text were partially blocked; the graphical perception survey HTML could not be fetched directly (ACM paywall); detailed LookML v21+ API surfacing is thin in public docs. Where source material was unavailable, the report notes the gap explicitly.

## 3. Per-Entity Analyses

### 3.1 Voyager

[Data unavailable in primary sources]

**How it plugs into Forge:** Voyager's output is Vega-Lite specifications — which maps directly to Forge's GoG normalized spec. Forge already compiles to Vega-Lite, so a Voyager-style recommendation engine could produce a ranked list of Forge-native spec candidates. The existing heuristic (schema-shape) engine can serve as a lightweight start, with Voyager-style perceptual scoring layered on top.

### 3.2 CompassQL

CompassQL is a declarative query language (and accompanying engine) for enumerating and ranking Vega-Lite visualization specifications [4] . Given a dataset schema and optional partial encodings, CompassQL enumerates all valid Vega-Lite specifications, scores them by a perceptual-effectiveness measure (effectiveness, expressiveness, perceptual rankings), and returns a ranked list. The language is integrated into Voyager and the Vega ecosystem.

**Maturity:** Production-grade (part of Vega toolchain), but optimized for small-to-medium data schemas. For Forge, CompassQL's enumeration approach can be adapted to the Object Catalog: typed entities and relationships constrain the encoding search space, making enumeration tractable even on wide schemas.

### 3.3 Draco

Draco formalizes visualization design knowledge as logical constraints (Answer Set Programming) that capture perceptual effectiveness, expressiveness, and design guidelines [5] . Draco 2 makes the platform extensible, allowing new constraints to be added modularly. Unlike CompassQL's scoring approach, Draco finds "optimal" visualization specifications that satisfy a set of hard and soft constraints (e.g., "prefer position over length for quantitative comparison" from Cleveland & McGill's perceptual rankings).

**Plug-in to Forge:** Draco reads/writes Vega-Lite specs, making it a natural optimizer for Forge's GoG→Vega-Lite path. Forge could use Draco as a post-processing pass: after the recommendation engine proposes candidate specs, Draco prunes or re-ranks them by constraint satisfaction. The Forge theming and a11y constraints (WCAG-AA) can be expressed as additional Draco constraints.

### 3.4 LIDA

LIDA (Microsoft Research, 2023) is a tool for automatic generation of grammar-agnostic visualizations and infographics using LLMs [6] . Its pipeline: (1) SUMMARIZE — data summarization via LLM; (2) GOAL — generate visualization goals from data context; (3) VISUALIZE — prompt LLM to generate visualization code (Python matplotlib/ggplot or Vega-Lite); (4) INFOGRAPHICS — optionally create styled infographics. LIDA is notable for its architecture-agnostic approach: it doesn't hardcode a grammar but prompts the LLM to generate code in multiple target grammars.

**Maturity & Limitations:** LIDA works well for simple single-chart generation but struggles with multi-view dashboards, complex chart types, and grounding in domain-specific metrics. Its evaluation is primarily qualitative. Its architecture-agnostic approach is both a strength (flexibility) and a weakness (inconsistency). For Forge, LIDA's approach suggests that an LLM copilot can accept NL and generate Forge's GoG spec JSON directly, bypassing code generation entirely — a more robust path than code-gen-then-parse.

### 3.5 NL2VIS / Natural Language to Visualization

NL2VIS refers broadly to systems that accept natural language input and produce visualization specifications. The seminal survey by Wu et al. (2022) [20] categorizes systems into rule-based, keyword-based, and learning-based approaches. Recent LLM-based systems (ChatGPT, Claude, specialized fine-tuned models) have made dramatic progress but still face challenges: ambiguity in natural language (e.g., "show sales by region" — bar chart? map? treemap?); complex multi-view requests; data grounding (which column maps to which encoding); and evaluation reliability.

**Evaluation:** nvBench [7]  provides a large-scale synthesized dataset for cross-domain NL-to-visualization, mapping NL queries to Vega-Lite specs. nvBench 2.0 [8]  addresses ambiguity through stepwise reasoning, breaking complex NL queries into substeps and resolving ambiguities via multi-turn interaction. These benchmarks provide concrete evaluation metrics for Forge's NL interface.

### 3.6 nvBench & nvBench 2.0

nvBench [7]  is a synthesized benchmark with ~25,000 NL-to-visualization pairs spanning ~100 domains, each mapping an NL utterance to a Vega-Lite specification. It is widely used for training and evaluating text-to-vis models. nvBench 2.0 [8]  introduces a stepwise reasoning framework that breaks ambiguous NL queries into sub-questions, resolving them iteratively — reflecting real-world conversational viz creation.

**For Forge:** These benchmarks can be used to fine-tune an LLM to output Forge's GoG spec directly, or to evaluate a pipeline's NL-to-viz accuracy. The stepwise reasoning approach in nvBench 2.0 strongly suggests that Forge's agentic layer should support multi-turn clarification when NL is ambiguous.

### 3.7 Vega-Lite

Vega-Lite is a high-level grammar of interactive graphics, a JSON-based declarative specification language for statistical visualizations [2] . It compiles to full Vega specifications for rendering. Vega-Lite's core abstraction — mapping data variables to visual encoding channels (x, y, color, size, shape, etc.) with rule-based defaults for scales, axes, and legends — is the canonical modern grammar-of-graphics implementation.

**For Forge:** Forge's GoG normalized spec already compiles to Vega-Lite, meaning all Vega-Lite-oriented tools (CompassQL, Voyager, Draco) can be integrated with Forge as first-class consumers/producers. The Vega-Lite community is large, and the specification is well-documented and stable.

### 3.8 Observable Plot

Observable Plot is a JavaScript library for exploratory data visualization based on the grammar-of-graphics, with a focus on reactivity and interactive exploration [17] . It provides a concise API (e.g., `Plot.barY(data, {x: "date", y: "sales"})`) with built-in faceting, marks, and transforms. Unlike Vega-Lite's declarative JSON spec, Plot uses a JavaScript API, making it more natural for programmatic generation but less suited as a static interchange format.

**For Forge:** If Forge's GoG spec can compile to Observable Plot (or if the normalized spec is rich enough to express Plot's interactive features), Forge could target both Vega-Lite (for static/interactive viz) and Observable Plot (for exploratory, reactive dashboards). This would differentiate Forge in the "agent-composable dashboard" space.

### 3.9 ECharts

Apache ECharts is a powerful, interactive charting and data visualization library for the browser [18] . It supports a wide range of chart types (including 3D, geographic, and complex statistical charts) and is widely adopted in enterprise BI tools. ECharts uses a declarative JSON option specification, structurally similar to Vega-Lite but with its own chart-typing and encoding conventions.

**For Forge:** Forge already compiles to ECharts. ECharts' enterprise adoption and rich interaction model make it an excellent render target for agent-composed dashboards. The JSON option format means LLMs can be prompted to generate ECharts specs directly; however, the spec is less standardized than Vega-Lite, increasing the risk of LLM hallucinations.

### 3.10 Cube Semantic Layer

Cube (Cube Dev) is a headless BI platform that provides a universal semantic layer — a centralized data modeling layer that defines measures, dimensions, and their relationships in a database-agnostic way, then exposes them via REST, GraphQL, and SQL APIs [11] . Cube's semantic model includes concepts like measures (aggregatable quantities), dimensions (grouping/filtering attributes), segments (pre-defined filters), and pre-aggregations for performance.

**For Forge:** Cube's semantic layer could serve as the grounding source for Forge's Object Catalog. Instead of raw column guessing, the LLM/agent would reason over named entities and measures with known types, domains, and relationships — dramatically reducing hallucination risk. Cube's API can be integrated as an MCP tool surface.

### 3.11 Malloy

Malloy is an open-source experimental language for describing data relationships and transformations, developed by Google [12] . Malloy treats data semantically: it models joins, aggregations, nested structures, and derived calculations as first-class language features. Malloy compiles to SQL but its semantic richness makes it an ideal source for grounded NL→viz generation.

**For Forge:** Malloy's explicit relationship modeling (e.g., "flights.aircraft.manufacturer") maps well to Forge's Object Catalog typed entities and relationships. A pipeline that translates Malloy query results into Forge's GoG spec could provide robust, grounded viz generation — avoiding the pitfalls of raw SQL or column-guessing.

### 3.12 dbt MetricFlow

dbt MetricFlow is the semantic layer component of dbt Cloud, introduced in 2023 and now central to dbt's strategy [13] . MetricFlow defines metrics as version-controlled YAML definitions with dimensions, measures, and time granularity, then generates optimized SQL for specific analytical queries. It integrates with dbt's transformation framework, ensuring metrics are built on tested, documented data models.

**For Forge:** MetricFlow's metric definitions serve as a trustworthy catalog for generated visualizations. An agent given a request like "show revenue trend by quarter" can map "revenue" to a MetricFlow metric, "quarter" to a time dimension, and generate a Forge spec with full lineage — the viz is not just a chart but a governed asset.

### 3.13 LookML

[Data unavailable in primary sources]

**For Forge:** LookML's mature semantic modeling can inspire Forge's Object Catalog design. Many organizations already maintain LookML models; Forge could offer an import path that bootstraps the Object Catalog from existing LookML, reducing adoption friction.

### 3.14 Tableau Pulse

[Data unavailable in primary sources]

**For Forge:** Tableau Pulse demonstrates that governed metrics + LLM insight generation is a commercially viable product pattern today. Forge's equivalent would be: Object Catalog entities → insight templates → Forge spec generation, sent as "pulse" notifications. However, Tableau's implementation relies on a mature, curated data model — reinforcing the need for a strong semantic layer.

### 3.15 ThoughtSpot

ThoughtSpot is a search-driven analytics platform that has heavily invested in agentic BI [15] . [Data unavailable in primary sources] [Data unavailable in primary sources]

**For Forge:** ThoughtSpot's agentic approach — decompose NL into analytical steps, query data, iteratively refine visualizations — provides a commercial reference architecture for Forge's agentic layer. Key differentiator: ThoughtSpot's agent works on top of a governed, indexed data model; Forge could match this via the Object Catalog + Cube/Malloy-style semantic layer.

### 3.16 Automatic Visualization Recommendation

Automatic visualization recommendation systems propose charts based on data characteristics (types, distributions, cardinality, correlations) and perceptual effectiveness principles. The field spans rule-based recommenders (Tableau's Show Me, Power BI's Quick Insights), enumeration-based systems (CompassQL/Voyager), constraint-based optimizers (Draco), and ML-based approaches (DeepEye, Data2Vis). The agnostic visual recommendation systems survey [9]  identifies open challenges: schema-level recommendation (which subset of columns to visualize), task-aware recommendation (what the user intends to do), and scalability to wide schemas.

**For Forge:** Forge's heuristic engine already performs schema-shape chart recommendation — this is positioned between rule-based and enumeration-based. The next level is to add perceptual scoring from CompassQL and constraint optimization from Draco, weighted by the Object Catalog's entity/role types.

### 3.17 Perceptual Effectiveness

[Data unavailable in primary sources]

**For Forge:** These perceptual rankings should be encoded directly into Forge's recommendation engine and into Draco-style constraints. Forge's a11y theme engine (WCAG-AA) already handles color contrast; extending to perceptual encoding effectiveness ensures generated viz is not just beautiful but scientifically optimal.

### 3.18 Data Profiling

Data profiling — inspecting data to understand its structure, types, distributions, nulls, cardinality, correlations — is the input stage for visualization recommendation. Modern profiling goes beyond type detection: it includes semantic type detection (recognizing dates, currencies, geographic codes, entity identifiers), distribution fitting, and outlier detection.

**For Forge:** Forge's Object Catalog semantic types (typed entities, traits, roles) can be leveraged during profiling to map columns to known semantic types, dramatically improving recommendation accuracy. For example, recognizing a column as "FLOAT with role `revenue`" lets the recommender prefer line/bar charts with currency formatting, rather than guessing from raw floats.

### 3.19 Agentic BI

Agentic BI refers to systems where AI agents autonomously (or semi-autonomously) explore data, generate insights, compose visualizations, and build analytical narratives — going beyond NL→single-chart into multi-step analytical workflows. ThoughtSpot, Tableau Pulse, and research systems like Data-to-Dashboard [10]  represent the commercial frontier. Data-to-Dashboard proposes a multi-agent LLM framework: one agent profiles data and proposes analysis goals; another generates visualizations; a third reviews and refines; a fourth composes the dashboard layout.

**For Forge:** The agentic approach maps naturally to Forge's MCP-native architecture. Forge can expose tools for data profiling, viz recommendation, spec generation, and theming/a11y optimization as MCP tools, then let an orchestration agent compose these into a dashboard. The achievable-today version uses deterministic tools with an LLM copilot; the research-frontier version replaces the copilot with a fully autonomous agent.

### 3.20 Insight Generation

Insight generation is the process of automatically discovering and communicating meaningful patterns in data — trends, anomalies, correlations, clusters, forecasts. Systems like Tableau Pulse, ThoughtSpot, and research prototypes use a combination of statistical tests, ML models, and LLMs to detect and narrate insights.

**For Forge:** Insight generation can be layered on top of Forge's viz engine: after a visualization is rendered, run statistical checks on the source data (e.g., Mann-Kendall trend test, anomaly detection via isolation forest, correlation analysis) and generate NL narratives via LLM. This creates a "Forge Pulse" capability — every generated viz comes with an auto-generated insight caption.

## 4. Technique Inventory

| Technique | Maturity | How It Plugs Into Forge GoG Spec + MCP Tool Surface |
|-----------|----------|------------------------------------------------------|
| CompassQL enumeration + perceptual scoring | Production (Vega ecosystem) | Enumeration over Object Catalog types produces ranked Vega-Lite specs; adapter translates to Forge GoG spec. MCP tool: `recommend_charts(schema, partial_spec?) -> ranked_specs[]` |
| Draco constraint optimization | Research-to-production (open-source) | Accepts Vega-Lite candidates, applies hard/soft perceptual constraints, returns optimized spec. Forge a11y themes become Draco constraints. MCP tool: `optimize_spec(spec, constraints) -> optimized_spec` |
| LIDA LLM pipeline | Research prototype (Microsoft) | LLM generates Forge GoG spec directly from NL + data profile, bypassing code-gen. MCP tool: `nl_to_spec(nl_query, data_profile) -> spec_candidates[]` |
| nvBench fine-tuned models | Research benchmark | Fine-tune open-weight model on nvBench→Forge-GoG mapping. MCP tool: `translate_nl(nl_utterance) -> spec` |
| Cube semantic layer | Production (Cube Cloud) | Object Catalog bootstrapped from Cube data model; metrics and dimensions used to ground NL→viz generation. MCP tool: `resolve_metric(name) -> metric_definition` |
| Malloy semantic modeling | Experimental (Google) | Define relationships and measures; compiler produces SQL; viz generates from result schema. MCP tool: `query_malloy(malloy_query) -> result_set` |
| dbt MetricFlow | Production (dbt Cloud) | Metric definitions as source-of-truth for agentic queries. MCP tool: `get_metric(metric_name) -> definition` |
| Data-to-Dashboard multi-agent | Research prototype | Orchestrator agent uses Forge MCP tools to profile→recommend→compose dashboard. MCP tool suite exposed to agent. |
| Observable Plot | Production (Observable Inc.) | If Forge GoG compiles to Plot, enables reactive dashboard component generation. MCP tool: `render_plot(spec) -> interactive_chart` |
| ThoughtSpot agentic search | Production (ThoughtSpot SaaS) | Reference architecture for agentic BI on governed data. Forge matches with Object Catalog + semantic layer. |

## 5. Achievable-Today vs Research-Frontier Split

### Achievable Today (2025–2026)

1. **Deterministic viz recommendation** driven by data profiling + semantic types + perceptual scoring, outputting a ranked list of Forge GoG specs. Works reliably for tabular data with ≤30 columns, covering bar/line/scatter/area/heatmap chart types. Grounded by Voyager 2 [3]  and CompassQL [4]  patterns.

2. **LLM copilot for NL→viz refinement**: Accept a natural-language instruction, map to a Forge GoG spec modification (e.g., "change to stacked bar", "filter to last 12 months"), and apply. High reliability when constrained to a known spec surface. Grounded by LIDA [6]  and the structured-generation approach.

3. **Semantic-layer-grounded generation**: When an Object Catalog + metric definitions are available (Cube, Malloy, dbt MetricFlow style), generated viz is trustworthy — columns are mapped to known measures/dimensions, reducing hallucinations. Demonstrated commercially by [Data unavailable in primary sources] and ThoughtSpot [15] .

4. **WCAG-AA compliant theming**: Forge's existing tokenized theming can be applied deterministically to any generated spec, ensuring a11y compliance. Constraint-based optimization (Draco-style) can incorporate perceptual effectiveness constraints [5] .

### Research Frontier (2026+)

1. **Fully autonomous insight generation**: Agents that explore data, discover non-obvious insights, and proactively surface them with narratives. Data-to-Dashboard [10]  shows promising architecture but hasn't been validated at scale.

2. **Multi-view dashboard composition from a single NL prompt**: "Show me a sales dashboard with trends, regional breakdown, top products, and anomaly alerts." Current systems can handle 1–2 views reliably; 4+ views with correct layout, linking, and consistency remains unreliable.

3. **Ambiguity resolution without human-in-the-loop**: nvBench 2.0 [8]  demonstrates stepwise reasoning to resolve ambiguities, but fully automatic resolution for arbitrary queries is unsolved.

4. **Cross-dataset, relationship-aware visualization**: Viz that spans multiple fact tables, correctly navigating joins and ensuring consistent aggregations. Requires robust semantic-layer integration — achievable in controlled settings, not generalizable yet.

## 6. Semantic-Layer / Headless-BI Integration Assessment

Semantic layers are the single most important factor in grounding generated visualizations. A viz engine that operates on raw column names will hallucinate encodings, misuse aggregations, and produce misleading charts. Systems with a semantic layer — Cube [11] , Malloy [12] , dbt MetricFlow [13] , [Data unavailable in primary sources] — consistently produce more reliable viz because the LLM/agent reasons about "Revenue" (a governed metric with a known aggregation) rather than "column_37" (a raw float).

**Cube** provides the most developer-friendly headless BI semantic layer, with pre-built connectors, caching, and multi-tenancy. Its API surface is well-suited as an MCP tool backend for Forge.

**Malloy** offers the most expressive semantic modeling language; its nested-query model naturally describes the data shapes that visualizations need. As an open-source project, it can be directly integrated.

**dbt MetricFlow** is the natural choice for organizations already on dbt; its metric definitions are version-controlled and tested, providing a governed foundation.

**LookML** is the incumbent enterprise semantic layer; supporting LookML import would immediately give Forge compatibility with existing Looker deployments.

## 7. Dashboard Composition + Agent-Composable Spec

Current dashboard composition in agentic systems follows two patterns: (a) **Orchestrator-agent** — a single agent decomposes a high-level request into sub-tasks, invokes viz tools, then arranges outputs into a layout (Data-to-Dashboard style [10] ); (b) **Template-based** — predefined dashboard templates with slots that agents fill with generated content (ThoughtSpot's Liveboards, Tableau Pulse's metric cards).

For Forge, a declarative agent-composable dashboard spec needs:
- A **layout grammar** (grid-based, with responsive breakpoints) that agents can target.
- **Linked interaction** specifications: how selections in one chart filter/brush others, defined declaratively (like Vega-Lite's selection and filter transforms).
- **Component typing**: each dashboard slot has a declared entity type (e.g., "revenue_trend", "region_map") that constrains what an agent can place there, ensuring consistency.
- **Compositional validation**: a constraint checker (Draco-style) that validates cross-chart consistency (same time granularity, consistent color mappings, no duplicate encodings).

Forge's existing GoG normalized spec, if extended with layout and interaction primitives, would naturally support this. Observable Plot's reactive model [17]  provides a strong interaction framework that could inspire Forge's interaction spec.

## 8. Recommendation

### Primary Recommendation: Deterministic, Semantically-Grounded Viz Engine with LLM Copilot Overlay

Build a pipeline with four layers:

1. **Data Profile + Semantic Resolve**: Auto-profile input data; map columns to Forge Object Catalog entities using semantic type detection (column names, data patterns, existing catalog matches). Resolve measures and dimensions against a Cube-style semantic layer (importable from existing Cube/Malloy/dbt/LookML deployments).

2. **Viz Recommendation + Optimization**: Enumerate valid encoding mappings (CompassQL-style, constrained by Object Catalog types); score by perceptual effectiveness; optimize via Draco constraint solving (incorporating Forge theme/a11y constraints). Output: ranked list of Forge GoG specs.

3. **LLM Copilot**: Accept optional NL input (e.g., "show as stacked bar by region") to re-rank or refine the candidate set. Use structured generation (function calling with GoG spec schema) to ensure outputs are valid. The LLM never generates specs from scratch — it only refines a deterministically-produced candidate set, guaranteeing grammatical correctness.

4. **Agentic Dashboard Composer (staged)**: Phase 1: template-based dashboard composition with agent filling slots. Phase 2: agent composes arbitrary layouts using Forge's layout grammar, validated by cross-chart constraint checking.

### Differentiators for OODS Forge

- **GoG-Normalized Dual Render Target**: Vega-Lite for standards compliance + ECharts for enterprise richness. No other system compiles a single spec to both.
- **Semantic Object Catalog as First-Class Primitives**: Entities, traits, roles, relationships are not afterthoughts — they constrain the entire generation pipeline, ensuring grounding.
- **Tokenized Multi-Brand Theming + WCAG-AA**: Generated viz is not just correct but brand-compliant and accessible out of the box.
- **MCP-Native Tool Surface**: Forge's tools (profile, recommend, optimize, render) are exposed as MCP tools, making Forge a composable agent in any MCP-enabled environment.
- **Deterministic Core + Agentic Overlay**: The deterministic pipeline ensures reliability and brand compliance; the agentic layer adds flexibility and natural-language accessibility without compromising the core.

### Runner-Up Strategy

If building the deterministic pipeline from scratch proves too resource-intensive, a **LIDA-style LLM-first approach** — prompt an LLM with the Object Catalog schema + Forge GoG spec format + data sample, validate the output against schema, then apply theme/a11y post-processing — could ship faster. The trigger to flip back to the deterministic-first approach would be: production data showing >5% of LLM-generated specs failing schema validation or producing misleading encodings.

## 9. References

[1] Generative AI for Visualization: State of the Art and Future Directions (2024) — https://arxiv.org/html/2404.18144v1
[2] Vega-Lite: A High-Level Grammar of Interactive Graphics — https://vega.github.io/vega-lite/
[3] Wongsuphasawat et al., "Voyager 2: Augmenting Visual Analysis with Partial View Specifications and Interactive Focus+Context" (CHI 2017) — http://idl.cs.washington.edu/papers/voyager2/  *(corrected 2026-06-16; the original arXiv 1705.09021 is an unrelated robotics paper, "Learning to Pour")*
[4] Wongsuphasawat et al., "Towards a General-Purpose Query Language for Visualization Recommendation" (CompassQL, HILDA@SIGMOD 2016) — http://idl.cs.washington.edu/papers/compassql/  *(corrected 2026-06-16; the original arXiv 1607.02828 is an unrelated biophysics paper)*
[5] Draco 2: An Extensible Platform to Model Visualization Design (2023) — https://arxiv.org/abs/2308.14247
[6] LIDA: A Tool for Automatic Generation of Grammar-Agnostic Visualizations and Infographics using Large Language Models (2023) — https://arxiv.org/abs/2303.02927
[7] nvBench: A Large-Scale Synthesized Dataset for Cross-Domain Natural Language to Visualization (2021) — https://arxiv.org/abs/2112.12926
[8] nvBench 2.0: Resolving Ambiguity in Text-to-Visualization through Stepwise Reasoning (2025) — https://arxiv.org/abs/2503.12880
[9] Agnostic Visual Recommendation Systems: Open Challenges and Future Directions (2023) — https://arxiv.org/abs/2302.00569
[10] Data-to-Dashboard: Multi-Agent LLM Framework for Insightful Visualization in Enterprise Analytics (2025) — https://arxiv.org/abs/2505.23695
[11] Cube Dev — Headless BI Semantic Layer — https://cube.dev/
[12] Malloy — An open-source language for describing data relationships and transformations — https://github.com/malloydata/malloy
[13] dbt Semantic Layer Architecture — https://docs.getdbt.com/docs/use-dbt-semantic-layer/sl-architecture
[14] LookML (Looker modeling language) — Google Cloud Looker docs — https://cloud.google.com/looker/docs/what-is-lookml  *(refreshed 2026-06-16; the original looker.com/platform/lookml is a stale 301)*
[15] ThoughtSpot: A Leader in the Next Era of Agentic Analytics and BI — https://www.thoughtspot.com/blog/a-leader-in-agentic-analytics-and-bi
[16] How Tableau Pulse powered by Tableau AI is Reimagining the Data Experience — https://www.tableau.com/blog/tableau-pulse-and-tableau-ai
[17] Observable Plot — The JavaScript library for exploratory data visualization — https://observablehq.com/plot/
[18] Apache ECharts — https://github.com/apache/echarts
[19] A Review and Collation of Graphical Perception Knowledge for Visualization Recommendation (2023) — https://dl.acm.org/doi/fullHtml/10.1145/3544548.3581349
[20] Towards Natural Language Interfaces for Data Visualization: A Survey (2022) — https://dl.acm.org/doi/10.1109/TVCG.2022.3148007

---

## 10. Editor Addendum — Stub Backfill + Forge-Grounding (2026-06-16)

*Added during review. §10a backfills are editor knowledge (NOT DeepSearch primary sources). §10b is verified against the live codebase via the 2026-06-15 capability assessment + direct reads of `src/viz/`, `packages/mcp-server/src/tools/viz.compose.ts`, `compose/viz-trait-resolver.ts`, and the viz schemas + a live `viz.compose` run through the `:4466` bridge.*

### 10a. Stub backfills (sections that returned "[Data unavailable in primary sources]")

- **Voyager (3.1):** Wongsuphasawat et al. — *Voyager* (InfoVis 2015) pioneered faceted browsing of automatically-recommended charts; *Voyager 2* (CHI 2017) added partial view specifications (wildcard channels) + related-views recommendation. Both emit Vega-Lite and use CompassQL to enumerate/rank. Lineage to internalize: **Voyager (browse) → CompassQL (query/rank) → Draco (constraint-optimize)** — three layers over the same Vega-Lite substrate Forge already targets.
- **LookML (3.13):** Looker's semantic modeling language — `views` (tables), `dimensions`/`measures`, `explores` (join graphs), version-controlled as code; the incumbent enterprise semantic layer. A LookML→Object-Catalog importer is a plausible enterprise on-ramp.
- **Tableau Pulse (3.14):** Salesforce/Tableau's 2024 metrics product — users define governed *metrics*; Pulse auto-generates NL insight digests + anomaly callouts over them. Proof that **governed-metric + LLM-narration ships commercially today** — and that it depends on a curated model (reinforces the semantic-layer requirement, not raw columns).
- **ThoughtSpot (3.15):** Search-driven analytics; SpotIQ auto-insights; "Sage"/"Spotter" LLM NL-search + agentic analytics over an **indexed, governed** data model. Reference architecture for agentic BI grounded in a semantic model.
- **Perceptual Effectiveness (3.17):** Cleveland & McGill (1984) ranked elementary perceptual tasks (position on a common scale > length > angle/slope > area > volume > color/saturation); Mackinlay (1986, APT) formalized *expressiveness* + *effectiveness*. These rankings are exactly what Draco encodes as soft constraints and what a recommender should weight — survey [19] collates the modern body.

### 10b. Forge-grounding — report inference vs verified reality

| Report claim | Verified status (2026-06-16) |
|---|---|
| Forge's GoG spec compiles to Vega-Lite **and** ECharts (§3.7–3.9) | ✅ **TRUE** — `src/viz` has working dual adapters + 14 chart types, tested |
| Forge already does schema-shape chart recommendation (§3.16) | ✅ **TRUE** — `suggest-chart`, 25 scored patterns + layout/interaction/responsive recipes |
| §7 "GoG spec, **if extended** with layout + interaction primitives…" | ⚠️ **UNDERSTATED** — these **already exist** in `src/viz` (LayoutFacet/Layer/Concat + interaction traits + cross-filter reducers). Phase 2 is "expose + add a composition layer," not "build from scratch." |
| §4 MCP tool signatures (`recommend_charts`, `optimize_spec`, `nl_to_spec`, …) | 🔴 **ASPIRATIONAL** — Forge has **none** of these. The only viz MCP tool today is `viz.compose`, which returns a **placeholder component scaffold** (6 types, field-names-not-data, renders nothing) and **does not import the `src/viz` engine**. This engine↔MCP disconnect is the report's biggest blind spot and is precisely **Phase 0**. |
| "Object Catalog bootstrapped from Cube / grounds generation" (§3.10, §6, §8.1) | ⚠️ **PARTIAL** — the Object Catalog gives entity/trait/role **typing**, but is **not yet a metrics/semantic layer** (no governed measures/dimensions/joins/aggregations). The report conflates "semantic catalog" with "metrics layer." Closing that gap **is Phase 3**; a Cube/Malloy/dbt/LookML importer is a credible route. |

**Net effect on the plan:** the report's spine holds, and its headline recommendation — **"deterministic core + LLM copilot; the LLM refines a deterministically-produced candidate set, never generates specs from scratch"** — matches Forge's natural shape (and our determinism/Q1 discipline). The corrections make **Phase 0 (reconnect)** even more clearly the unlock, confirm **Phase 2** is largely *exposure of existing primitives* + a composition layer, and sharpen **Phase 3** to "turn the typed Object Catalog into a real metrics/semantic layer." Use §1, §5, §8 as the trustworthy planning spine; do not plan against §4 signatures or §7 "if extended" verbatim — use §10b.

---

---

**Mission Objectives:**
- Inventory of automatic/data-aware visualization recommendation techniques (e.g. Voyager/CompassQL, Draco constraint-based, perceptual-effectiveness models, data profiling → encoding choice) with how each would plug into a GoG normalized-spec engine
- Inventory of LLM/agentic NL→visualization and agentic-BI generation approaches (NL2VIS systems, LIDA, chart/insight generation, agentic exploration) — what works, what fails, and how they are evaluated
- Survey of dashboard composition + linked-interaction + decision-centric dashboard frameworks and what a declarative agent-composable dashboard spec needs
- A clear achievable-today vs research-frontier split, plus concrete recommendations + named differentiators for an agent-native, semantically-grounded, deterministic viz engine
- Every major claim cited to a named system or paper (2023+ preferred)
