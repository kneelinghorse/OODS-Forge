# s195-m04 real accuracy predicate bite

Run `node scripts/product-reality/s195-viz-accuracy-bite.mjs` only in a coordinated exclusive build window. It temporarily replaces the real `OODS-V171` negative-strength predicate in `packages/viz-core/src/accuracy/echarts-index.ts` with an evaluated no-op, preserving the offered rule list and evaluated count. A harmless reference to the original function prevents an unused-import build failure from masquerading as the intended red.

The disabled core build succeeded. The complete live census `--check` then exited 1 specifically with `flow_map: census missed required OODS-V171 accuracy finding`. The harness restored byte-identical source in `finally`, rebuilt successfully, and the complete live census `--check` exited 0. The restored build also embeds the newly generated 13-row certification registry.

`accuracy-bite.json` records exact source hashes, the real mutation, commands, exit codes, restoration, and status. The four raw logs are retained beside it. This is a production predicate fault, not a changed expectation or copied registry assertion. It is builder verification, not independent certification.
