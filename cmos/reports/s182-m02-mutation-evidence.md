# Sprint 182 M02 React mutation evidence

Date: 2026-09-03
Mission: `s182-m02`
Frozen predecessor: `38afc8a`
Result: all three locked React carriers discriminated, were restored, and selected zero skipped tests.

Vitest reports tests excluded by `-t` as skipped. The `non-selected` column records those tests; none
is part of the selected gate.

| Gate | State | Selected | Passed | Failed | Selected skipped | Non-selected |
|---|---|---:|---:|---:|---:|---:|
| B-05 | pre-mutation green | 1 | 1 | 0 | 0 | 2 |
| B-05 | mutation red | 1 | 0 | 1 | 0 | 2 |
| B-05 | restored green | 1 | 1 | 0 | 0 | 2 |
| B-05 supplemental declaration closure | pre-mutation green | 1 | 1 | 0 | 0 | 2 |
| B-05 supplemental declaration closure | mutation red | 1 | 0 | 1 | 0 | 2 |
| B-05 supplemental declaration closure | restored green | 1 | 1 | 0 | 0 | 2 |
| B-06 | pre-mutation green | 1 | 1 | 0 | 0 | 3 |
| B-06 | mutation red | 1 | 0 | 1 | 0 | 3 |
| B-06 | restored green | 1 | 1 | 0 | 0 | 3 |
| B-07 | pre-mutation green | 1 | 1 | 0 | 0 | 3 |
| B-07 | mutation red | 1 | 0 | 1 | 0 | 3 |
| B-07 | restored green | 1 | 1 | 0 | 0 | 3 |

## B-05 — exact runtime/declaration nucleus

Carrier:
`packages/components-react/test/package-contract.spec.ts::B-05 exports the exact React nucleus with public declarations`

Command:

```sh
pnpm --filter @oods/components-react exec vitest run test/package-contract.spec.ts -t 'B-05 exports the exact React nucleus with public declarations'
```

Mutation: removed only the `Text` value re-export from
`packages/components-react/src/index.ts`, retained the implementation and the other 13 exports, and
rebuilt declarations. The selected assertion failed with `Text` absent from the exact runtime set.
After strengthening the same carrier to cover the public `./table` subpath, the identical production
mutation was replayed: selected 1 / failed 1 / selected skipped 0. Restoring the re-export and
rebuilding returned selected 1 / passed 1 / selected skipped 0. It was replayed once more after the
packed declaration-graph assertion was added, with the same selected 1 / failed 1 / selected skipped
0 result; restoration again returned selected 1 / passed 1 / selected skipped 0. This remains the
manifest-locked B-05 mutation.

Supplemental closure control: removed only `src/types.ts` from the tsup entry list and rebuilt. That
restored the broken declaration layout in which six imports from `index`, `status`, and `table`
declarations named absent hashed `.js`/`.cjs` chunks. The strengthened B-05 carrier failed selected 1
/ failed 1 / selected skipped 0 and printed all six unresolved edges. Restoring the private types
entry emitted `types.js`, `types.cjs`, and matching declarations; the carrier returned selected 1 /
passed 1 / selected skipped 0. This supplemental control does not replace the locked `Text` mutation.

Restored source SHA-256:
`39722a50e63692d9b4567f4d46c8074c22cfa8299d05e91d91e9fd2184369251`.

Restored tsup configuration SHA-256:
`9d7206dd0ec52eb202d6d22242c1998dc04f9ada83405aa9e59c97dadc049ddc`.

## B-06 — field label/error association

Carrier:
`packages/components-react/test/accessibility.spec.tsx::B-06 preserves React field label and error associations`

Command:

```sh
pnpm --filter @oods/components-react exec vitest run test/accessibility.spec.tsx -t 'B-06 preserves React field label and error associations'
```

Mutation: removed only the validation-message ID from `describedByIds` while retaining the visible
label, visible error, and `aria-invalid`. The selected assertion received only
`["email-description"]` instead of `["email-description", "email-validation"]`. Restoration returned
one passed.

Restored source SHA-256:
`2e02f2d9866f4fd5b7dcdbaab66f1c1671890b42f6155fdf4b2ad3ec83ed60a3`.

## B-07 — Tabs keyboard selection and focus

Carrier:
`packages/components-react/test/interactions.spec.tsx::B-07 moves React Tabs selection and focus with ArrowRight`

Command:

```sh
pnpm --filter @oods/components-react exec vitest run test/interactions.spec.tsx -t 'B-07 moves React Tabs selection and focus with ArrowRight'
```

Mutation: removed only the `ArrowRight` branch from the private Tabs key handler. Initial and pointer
selection remained. The selected assertion observed `aria-selected="false"` on Billing instead of
`"true"`; restoration returned one passed.

Restored source SHA-256:
`363a5709593b4bea8b158506217fe5ef562f33f994eeaf0081fd881644e66e64`.

## Restoration verification

The final restored package run passed 5 files / 27 tests with no skips, and the final root
compatibility set passed 10 files / 43 tests with no skips. The four former root Tabs assertions now
encode the Sprint-182 locked automatic-activation behavior; production behavior was not changed for
that compatibility correction.
