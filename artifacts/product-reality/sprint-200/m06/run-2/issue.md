### What did not read right

install.md §5 "First call" promises that `health` reports "the registry counts (19 auto tools, 24 total)". It does not. The answer gives a tool count of 24 and then a breakdown by **evidence tier** — `product-reality: 19, contract: 5` — with no auto vs on-demand split anywhere in it.

The trap is that both splits are 19/5. README's tool-surface table lists exactly 19 auto-registered tools, all tiered `product-reality`, and exactly 5 on-demand tools, all tiered `contract`. So as a first-time user I saw a `19` next to a `5`, matched it to the sentence I had just read, and believed `health` had confirmed my tool surface. It had not — it had told me how well-evidenced the tools are, which is a different claim that happens to partition identically today. If I ever set `MCP_TOOLSET=all` (install.md §6, one table below), the tier numbers would presumably stay 19/5 while the advertised surface became 24, and the sentence I trusted would now be actively misleading.

`health` is the first call the docs ask you to make, and its job at that moment is to answer "is my install serving what the docs say it serves". Right now it answers a question I did not ask, in numbers that look exactly like the answer to the one I did.

Two fixes, either works: have `health` name the advertised surface (e.g. `advertised: 19, available: 24, toolset: default`) alongside the tiers, or change install.md §5 to describe what actually comes back ("24 tools, tiered 19 product-reality / 5 contract") and say plainly that the tier split is not the toolset split.

### Which screen or document

`docs/runtime/install.md`, §5 "First call" — and the `health` tool response it describes. README's "The first run, in ten minutes" step 2 has the softer version of the same sentence ("it answers `status: "ok"` with the registry counts and the tool count"), which is accurate; §5 is the one that over-promises.

### What you saw

Following install.md §4 (Claude Code) then §5, first call of a clean install:

```
**Status:** `ok`

**Registry Counts:**
- Components: 110
- Traits: 46
- Objects: 18

**Tool Count:** 24 tools (entries in the tools section)

The tool count breaks down by tier as:
- product-reality: 19
- contract: 5
- unit: 0
- none: 0
```

(Also in that answer: "the server has been up for 543 seconds", on a runtime I had extracted four minutes earlier and registered 30 seconds earlier. Separate and much smaller, but it is the other number in `health` I could not reconcile with my install — if `uptime` is not this process's age, the docs never say what it is.)

### What you expected instead

A count of the tools my client had actually been served — 19 advertised on the default toolset, 24 existing — because that is the sentence install.md §5 put in my head, and because "did my install work" is the only question a first call can usefully answer. Instead the two numbers that matched were measuring source evidence.

### Runtime version

Runtime v0.1.0, adapter 0.3.0 (install.md §8). Archive `forge-runtime.tar.gz`, sha256 `252fb7151de0c4bd589eab112b029dac4a6f803fdc24d3d424f85b62e63216d6`, manifest commit `5c02dee27297ee9285262fc582a68272a903d277`, built `2026-09-14T19:00:20-05:00`. macOS, Node v24.6.0, Claude Code, default toolset (no env vars set).
