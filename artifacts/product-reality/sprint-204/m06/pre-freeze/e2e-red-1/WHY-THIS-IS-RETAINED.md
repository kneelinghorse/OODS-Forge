# The first B2 run's archive E2E — red, retained

Head `07a1b2e1e`, archive sha256 `4f22bf27…`. The build, assembly, extraction and the Linux container
proof passed. The extracted-runtime E2E failed on one assertion:

    health.registry: { components: 110, objects: 23, traits: 47 }  — expected traits: 46

That is not a defect in the bundle. It is Sprint 204 m02's fix arriving at the archive. `health` used
to report trait and component counts from a snapshot frozen at Sprint 199, and the Sprint 203 review
found 46 to be stale: the registry has held 47 traits since Sprint 203 added
`lifecycle/Supersedable`. m02 made the counts live, and the E2E still pinned the stale number.
`scripts/runtime/e2e.mjs` now expects 47, and the bundle was rebuilt and re-run from the next head.
