# Sprint 194 m03 — Registry and schema boundaries

Mapping registration is explicitly scoped to external consumers. No composer or
generator reads these mappings. Registry v1.4 preferred terms and disambiguation
decisions round-trip losslessly but are surfaced, not consumed by resolution,
composition or generation. This uses the mission's authorized narrowing option.

The four boundary specs call real map, registry.snapshot, schema, object and
structuredData.fetch handlers and validate the registered input/output wires.
Temporary stores isolate create/delete mutations from canonical data. Receipts
retain mapping ETag movement, draft metadata, structured prop translations,
resolved and missing lookups, schema persistence and readback, object context and
domain filtering, and dataset cache behavior.

The existing schema wire has monotonic versions and schemaRef identity, not ETags
or conditional requests. The tests preserve that interface and prove versions,
load/list/delete and byte-identical composed-schema round-trips. Mapping snapshots
and datasets separately prove their actual ETag contracts. No fictional schema
ETag claim is made.

structuredData.fetch now uses tool-specific OODS-V202 for invalid kind options;
listVersions/version remain dataset-only. OODS-V201 remains reserved for map input.
The descriptor, API reference and narrative state these limits.

Validation: 136 targeted tests across 13 files and 10 narrative checks passed,
with no skips. The generated schema types, API check and server build also passed.
The component-census directory and schema-movement.json contain a fresh 77-schema,
154-generation run and comparison against the retained Sprint 193 census. This is
generation evidence; the required fresh browser sweep remains scheduled for m07.
The five-suite closeout capture has not been run.
