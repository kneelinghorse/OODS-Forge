# Research objects

TraceLab UX-1 adds seven alpha objects: Project, Document, Chunk, Collection,
Mission, Report and Evidence. Authoring follows
[the object authoring guide](../../docs/authoring-objects.md).

The [TraceLab field mapping contract](https://github.com/kneelinghorse/TraceLab/blob/main/cmos/contracts/oods-object-model.md)
is authoritative for API projections, nullable ownership, processing-state
derivation, classification and unavailable fields. The YAML preserves API
fields as well as trait display aliases; it does not add columns to TraceLab.
Space and User reuse the universal Organization and User objects.

Chunk is inline-only. Mission uses immediate `cancelled`, with none of the
subscription's pending-cancellation states. Evidence's four dispositions are
classification categories, not lifecycle states. Counts and provenance come
from the server. Generated fixture data is for composition and preview only.

Public registry and composition checks:

```bash
pnpm generate:objects --objects objects/research --out /tmp/research-object-types
pnpm --filter @oods/mcp-server exec vitest run test/objects/research.spec.ts
```

The existing object loader scans this directory recursively; rebuild the MCP
server and start its next process from the updated checkout to refresh its
in-memory registry. No token refresh or package publication is necessary.
