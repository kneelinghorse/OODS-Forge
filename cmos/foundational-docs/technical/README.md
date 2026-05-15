# Technical Specs

Deep technical specifications for OODS-Forge subsystems. These docs go beyond the strategic framing in [../overview.md](../overview.md) and the mission-level breakdown in [../mission-graph.md](../mission-graph.md). They are the implementer's reference.

## Planned docs

| Doc | Scope | Gating mission |
|---|---|---|
| `object-catalog.md` | The Object Catalog spec v1.0.0 — JSON Schema + TypeScript types + versioning policy + examples | F1 |
| `bidirectional-mcp.md` | The writable Object Catalog MCP surface — read/write tool contracts, idempotency, conflict semantics | F3 |
| `concordance-integration.md` | The Concordance wire `1.1.0` ingestion contract — translation pipeline, evidence-ref preservation, auth/version/error semantics | F2 |
| `federation-integration.md` | Cedar policy + federated catalog distribution — capability surface, view materialization, performance budget | I2 (post-D4) |
| `fidelity-ladder.md` | Multi-fidelity render abstraction — presentation graph IR, per-fidelity renderers, runtime/build-time line | C1, C2 (post-D2) |
| `agent-vitals-telemetry.md` | Forge → agent-vitals event shapes, drift markers, dashboard contract | I3 |
| `tracelab-evidence-loop.md` | Forge usage records → TraceLab corpus contract | I4 |

## Authoring convention

Each spec doc:
1. Names the contract surfaces it defines.
2. Cites the corresponding decision memo(s) it implements.
3. Provides at least one fixture-shaped example.
4. Specifies versioning policy.
5. Names test gates (unit, contract, E2E) the spec must pass.

## Ordering

Specs land alongside their gating missions, not ahead. The first spec to author is `object-catalog.md` once D1 is decided.
