# Sprint 182 m03 Vue mutation evidence

Review base: `38afc8a32f71a7dce4301dff46ac73de7575f088`. These are literal gate-manifest selectors. Each sequence began green, applied only the named production mutation, observed the selected control fail, restored the source, rebuilt, and reran green. No selected test was skipped.

| Bite | Carrier and selector | Mutation | Pre | Mutant | Restored | Owned evidence |
|---|---|---|---:|---:|---:|---|
| B-08 | `packages/components-vue/test/package-contract.spec.ts` — `B-08 exports the exact Vue nucleus with public declarations` | Removed only the `Text` runtime re-export from `src/index.ts`; the implementation and other 13 canonical exports remained. | selected 1 / failed 0 | selected 1 / failed 1 | selected 1 / failed 0 | `artifacts/product-reality/sprint-182/gates/B-08/` |
| B-09 | `packages/components-vue/test/interactions.spec.ts` — `B-09 emits Vue update:modelValue and change for controlled fields` | Removed only the Input handler's `emit('update:modelValue', nextValue)`; DOM input and change paths remained. | selected 1 / failed 0 | selected 1 / failed 1 | selected 1 / failed 0 | `artifacts/product-reality/sprint-182/gates/B-09/` |
| B-10 | `packages/components-vue/test/interactions.spec.ts` — `B-10 moves Vue Tabs selection and focus with ArrowRight` | Removed only the `ArrowRight` branch; pointer activation, initial selection, and other keyboard branches remained. | selected 1 / failed 0 | selected 1 / failed 1 | selected 1 / failed 0 | `artifacts/product-reality/sprint-182/gates/B-10/` |

Commands:

```text
pnpm --filter @oods/components-vue exec vitest run test/package-contract.spec.ts -t 'B-08 exports the exact Vue nucleus with public declarations'
pnpm --filter @oods/components-vue exec vitest run test/interactions.spec.ts -t 'B-09 emits Vue update:modelValue and change for controlled fields'
pnpm --filter @oods/components-vue exec vitest run test/interactions.spec.ts -t 'B-10 moves Vue Tabs selection and focus with ArrowRight'
```

Every restoration included `pnpm --filter @oods/components-vue run build` before its selector replay. The restored production/carrier hashes match the receipts:

- B-08: `src/index.ts` `8cc491e4ba8320e68743882b9e10c5565d7d214aa4aeeb7afc512e4b8b278c79`; carrier `093d3f6ade21fe300d3b944e7976fc28321645bd48de36b6b78233a0a55998fe`.
- B-09: `src/fields.ts` `5023b5a1d3038c71a789826251634220e755fe8c6f8c3f36ce0239ba3f15196a`; carrier `b2f5335a6e9f587cd03a26cfaffa6332cc5baf9711c4ca7ffea7cdbc8da15fb3`.
- B-10: `src/tabs.ts` `d7b4fc4eea4fe9868ac8f96944cc91a1875d26843f875fdf87e6cff762ffe8a7`; carrier `b2f5335a6e9f587cd03a26cfaffa6332cc5baf9711c4ca7ffea7cdbc8da15fb3`.
- Restored declaration artifact: `dist/index.d.ts` `3305b40ba2bf04f2190fb9d4f24c0ea98e0704c976e3a12426020cc19713699a`.

The canonical gate-manifest destinations are `artifacts/product-reality/sprint-182/gates/B-08/` through
`B-10/`. Each contains the required patch, pre-green log, selected-red log, restored-green log, and
receipt. Byte-identical mission-local copies remain under
`artifacts/product-reality/sprint-182/m03/gates/` as M03 provenance.

Post-restoration package lifecycle on the same carriers: typecheck passed; build passed; the package-native suite selected 18 / failed 0 / skipped 0 across five files.
