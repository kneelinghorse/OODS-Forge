# Forge s179-m01 — baseline and future-RED matrix

**Status:** m01 build record, 2026-08-28.  
**Authority:** locked `forge-s179-echarts-render-grading-decision-memo.md` §0, §1a, and §5.  
**Scope:** controls, fixtures, and in-tree provenance only. No product, advertised-surface,
lockfile, Storybook, or capture movement is authorized by this mission.

This record separates evidence produced or rechecked during s179-m01 from the inherited s178
feasibility evidence. `OBSERVED` means the named command or capture ran against the exact s179 base
or the current build tree at that same HEAD. `INHERITED` means the result comes from the locked s178
feasibility record and retains that record's narrower host and fixture scope.

## 1. Exact-base spec-only recapture — OBSERVED

The verified sprint base is:

```text
1be93f8e16fee2607682361bbd56e521fda3bcdb
```

The following literal detached-worktree sequence was run. The `rev-parse` check preceded every
probe, satisfying SR-23.

```bash
git worktree add --detach /tmp/oods-forge-s179-m01-1be93f8 1be93f8e16fee2607682361bbd56e521fda3bcdb
git -C /tmp/oods-forge-s179-m01-1be93f8 rev-parse HEAD
pnpm -C /tmp/oods-forge-s179-m01-1be93f8 install --frozen-lockfile
pnpm -C /tmp/oods-forge-s179-m01-1be93f8 run build:packages
pnpm -C /tmp/oods-forge-s179-m01-1be93f8 --filter @oods/mcp-server exec tsx test/tools/s172-spec-only-capture.mts
sha256sum /tmp/oods-forge-s179-m01-1be93f8/packages/mcp-server/test/tools/__fixtures__/s172-certify-spec-only-baseline.json
cmp -s /tmp/oods-forge-s179-m01-1be93f8/packages/mcp-server/test/tools/__fixtures__/s172-certify-spec-only-baseline.json /Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/mcp-server/test/tools/__fixtures__/s172-certify-spec-only-baseline.json
```

Observed output:

```text
1be93f8e16fee2607682361bbd56e521fda3bcdb
wrote 13 trait responses to .../s172-certify-spec-only-baseline.json
da68a40aa71c99a7b2d67b3e3bca9a206297da1b5108c532788f231ff65364a3
byte comparison: identical
```

The temporary worktree was then removed with:

```bash
git worktree remove --force /tmp/oods-forge-s179-m01-1be93f8
git worktree prune
```

The recapture therefore proves that the 13 current `{spec}`-only responses are byte-identical to
the checked-in fixture at the exact post-s178 base. In particular, all eight ECharts-primary
`{spec}`-only responses remain unchanged and carry no `determinism` object. This is a zero-byte
rebase: provenance moves to `1be93f8`, not the fixture contents.

The five declaration slots remain empty for the whole sprint:

| Declaration slot                           | Locked value |
| ------------------------------------------ | ------------ |
| `DECLARED_NOTE_ADDITIONS`                  | `[]`         |
| `DECLARED_NOTE_REWORDS`                    | `[]`         |
| `DECLARED_ECHARTS_CONTRAST_NOTE_REWORD`    | `null`       |
| `DECLARED_CARTESIAN_CONTRAST_NOTE_REWORD`  | `null`       |
| `DECLARED_CARTESIAN_DETERMINISM_ADDITIONS` | `[]`         |

The frozen-lockfile install resolved `echarts@6.0.0`; its lockfile snapshot resolves
`zrender@6.0.0`. `@oods/viz-core` already carries `echarts:^6.0.0` as a dev dependency. No package
manifest or lockfile change is required or allowed in m01.

## 2. Operand-backed and served-option pins — OBSERVED

The full operand-backed response baseline is
`packages/mcp-server/test/tools/__fixtures__/s179-certify-operand-baseline.json`. Its observed
SHA-256 is:

```text
b4295ab2b99152300ad142ff6fd86e2b3fdf94e1c17b599d297801181d5c87a1
```

It is captured from the eight standard `ECHARTS_OPERAND_CASES`, not from newly authored lookalike
operands. Each response currently has exactly `stable` and `contentHash` in `determinism`; no case
has `renderHash`. The two adversarial sibling exports
`GEO_CHOROPLETH_UNMATCHED_BRANCH` and `GEO_BUBBLE_NO_GEOMETRY_BRANCH` remain available for the
future REDs but are not members of the eight-case array.

The canonical projected/served option hashes at base `1be93f8` are:

| Standard case | Projected-option `contentHash`                                     |
| ------------- | ------------------------------------------------------------------ |
| `treemap`     | `0f1887380e087bbd5e15b9bc926ddb7a887eed5cddcca5f052895e4a291fa10a` |
| `sunburst`    | `510b357978de88f2001e9b227033da4c6e7cc0dd920cd4a1e9c20cb0414c018b` |
| `sankey`      | `346b1675f25761bc4352b6f38ba89d66bbbaf11360800d525ade905b19832a15` |
| `chord`       | `6d844d7a48c2f7d897eee10b31cb0f78dcdd6677937651293077a1dcc701fb53` |
| `force_graph` | `cfdb9cfb3dfd021318f0a42232fe63fb8bd6042806bc3f4e29fbebf648045519` |
| `choropleth`  | `178534c597318a742fae67e2fe6c9a24ea1cc75306bf736d6332ccef476ef5c1` |
| `bubble_map`  | `68580817ceab383b158c33fa62eaa36e40af8741725210ce4246f6822ad235e3` |
| `flow_map`    | `d02900062bbf0fa0f983e60de987a8919316032b74099366d90dfa464e4f7cd5` |

The m01 render capture uses the canonical served options for those same cases and a test-side
first-appearance remap from each discovered zrender token to `oods-zr-<index>`. Fresh processes on
Darwin and Alpine Linux reproduced all seven non-force normalized hashes below from the same
portable bundle. `force_graph` remained unequal after generated-token normalization, as expected
before the worker-scoped seed and synchronous convergence land in m02.

| Standard case | Canonical served-option SSR normalized SHA-256                     | m01 result                            |
| ------------- | ------------------------------------------------------------------ | ------------------------------------- |
| `treemap`     | `b61714c82926e331f9eae00a17babaa8e2b54241994ffb2d192c355843242f5d` | matched on Darwin and Alpine          |
| `sunburst`    | `20789b8d568b656c4e6b5c870277f2569f12bfd0beda586f8549ba0d04169c9f` | matched on Darwin and Alpine          |
| `sankey`      | `c5e34d1e0fca1ab3d4711a8a5e6ca56e6f1df3033a80e09c6590ddcea89aca9a` | matched on Darwin and Alpine          |
| `chord`       | `68ee777050c31706845a197166cac058484dcf16e102bbf6c2009d19316ed662` | matched on Darwin and Alpine          |
| `force_graph` | none                                                               | substantive geometry remained unequal |
| `choropleth`  | `1506cb791b702a162e333a864a70c772e853088a1d3dab4184ce5be8f5fcb8f1` | matched on Darwin and Alpine          |
| `bubble_map`  | `68b19232a5c6f32770760065f21f706e94c3f609e211d0b04b454dcb4db0a75a` | matched on Darwin and Alpine          |
| `flow_map`    | `58871d84288bc6d88add326b9793be9f5767b3675dcb675c7196e1941bbc202d` | matched on Darwin and Alpine          |

The direct canonical cross-host carrier used:

- macOS 26.3.1 / Darwin 25.3.0 arm64, Node 24.6.0, V8 13.6.233.10-node.24;
- Alpine Linux 3.23.4 / Linux aarch64, Node 22.22.2, V8 12.4.254.21-node.39;
- the already-local `the-academy-web:railway` image at
  `sha256:62ddd2e22a559a15cdf7cc50c269e5358302748802453d64fe90b9a26db81506`;
- one test-only portable ESM bundle of the checked-out harness, SHA-256
  `18c5c1c4a26f7add8184e60f1daa779d0e1cfed8ee7da5466c0142b55826a1a4`,
  bind-mounted read-only for the Alpine capture.

The bundle was generated under a `mktemp` directory, used unchanged by both runtimes, and removed
after the equality assertion; it is evidence, not a product or fixture artifact. This proves the
canonical seven-case cross-host equality only for the two named arm64 runtime combinations. It is
not Linux/x64 or real-CI qualification; those remain m06 work.

The exact bundle and capture invocations were:

```sh
node --input-type=module --eval 'import { build } from "tsup"; await build({ entry: ["packages/viz-core/test/s179-echarts-render-harness.ts"], outDir: "/tmp/oods-s179-m01-crosshost.mldDV9", format: ["esm"], platform: "node", target: "node20", splitting: false, clean: true, config: false, noExternal: [/.*/] });'
node --input-type=module --eval 'import { captureStableNormalizedHashes } from "file:///tmp/oods-s179-m01-crosshost.mldDV9/s179-echarts-render-harness.js"; process.stdout.write(JSON.stringify(captureStableNormalizedHashes()));'
docker run --rm --mount type=bind,src=/tmp/oods-s179-m01-crosshost.mldDV9,dst=/probe,readonly --entrypoint node the-academy-web:railway --input-type=module --eval 'import { captureStableNormalizedHashes } from "file:///probe/s179-echarts-render-harness.js"; process.stdout.write(JSON.stringify(captureStableNormalizedHashes()));'
```

These seven values are the canonical s172-case pins for m01. They intentionally differ from some
numbers in the s178 feasibility report because that spike used ad hoc probe fixtures and options;
the older values are retained below as inherited cross-host evidence, not substituted for the
canonical case pins.

## 3. s178 feasibility evidence — INHERITED, not reclassified

The s178 spike rendered on two arm64 hosts:

- Darwin 25.3/arm64, Node 24.6.0, V8 13.6.233.10-node.24;
- Alpine Linux 3.23.4/arm64, Node 22.22.2, V8 12.4.254.21-node.39, from the already-local
  `the-academy-web:railway` image
  `sha256:62ddd2e22a559a15cdf7cc50c269e5358302748802453d64fe90b9a26db81506`.

Its seven non-force ad hoc probe fixtures matched across those two host combinations after the
spike's generated-token normalization:

| Feasibility fixture | Inherited normalized SHA-256                                       |
| ------------------- | ------------------------------------------------------------------ |
| `treemap`           | `bca27bace18d94ff8af9dfe2ffe8c514c6a7708d06bc4e2d5612c1ba08982267` |
| `sunburst`          | `fb72835f8be455b96925d0bf04c5c9170b1c3ce21f54064c421f3399fc06013a` |
| `sankey`            | `daddd998f8e855b0329546eb9a24885ae6051e24685a1a341c51e0ff35542e24` |
| `chord`             | `41fcfb44bb3ca6a163fdedae1116f6b1da2e96638aacc76f5238d0b2bdf72097` |
| `choropleth`        | `1a83a87044f7385343d5b380f04b06cf6e17137abec8bb7a165fcc3f18b7250d` |
| `bubble_map`        | `f8cabfebb06fb775bf6102ac9b42a9ee2a043a05f70c874aa888337478439786` |
| `flow_map`          | `a6430ccebbea3b3ff35ce4d96e6c73a07784bc99473ddcd32c7bbc9d1a6354fc` |

That evidence establishes only the named Darwin/arm64 and Alpine/arm64 combinations and only the
spike's probe fixtures. It is not Linux/x64 evidence, not a real-CI qualification, and not a
replacement for the canonical s172-case pins above. The real CI/runtime matrix remains m06 work.
The spike also observed unequal raw sequential SVG for all eight families and substantive
non-counter force differences; m01 preserves that finding without claiming force stability.

## 4. Joined-choropleth old-contract evidence

The representative s172 operand's GeoJSON features expose `region` and `state_name`, while the join
declares `featureProperty:'region'`. At the m01 baseline:

- the served option has no `geo.nameProperty`;
- registration succeeds, but the region join does not bind inside ECharts;
- rendered region paths use ECharts' default `#5070dd` paint;
- the same paths carry `ecmeta_data_index="-1"`, rather than non-negative joined data indexes.

This is the expected old-contract evidence. m03 must make its first RED assert joined ramp paints
and non-negative indexes, and its green must change the served option by emitting
`geo.nameProperty:'region'`. Renderer-only repair is forbidden because it would grade bytes the
consumer was not served.

## 5. Movement fences

A fresh read-only census of the existing `storybook-static/index.json` was run locally:

```bash
node --input-type=module -e "import { readFileSync } from 'node:fs'; const doc=JSON.parse(readFileSync('storybook-static/index.json','utf8')); const entries=Object.values(doc.entries ?? {}); const critical=entries.filter((entry) => (entry.tags ?? []).includes('vrt-critical')); const stories=critical.filter((entry) => entry.type === 'story'); const docs=critical.filter((entry) => entry.type === 'docs'); const family=/treemap|sunburst|sankey|chord|force[ _-]?graph|choropleth|bubble[ _-]?map|flow[ _-]?map|echarts/i; const matches=critical.filter((entry) => family.test([entry.id,entry.title,entry.name].filter(Boolean).join(' '))); console.log(JSON.stringify({total:entries.length,vrtCritical:critical.length,vrtCriticalStories:stories.length,vrtCriticalDocs:docs.length,vrtCriticalEchartsFamilyMatches:matches.length}));"
```

Observed output:

```json
{
  "total": 455,
  "vrtCritical": 76,
  "vrtCriticalStories": 70,
  "vrtCriticalDocs": 6,
  "vrtCriticalEchartsFamilyMatches": 0
}
```

Thus the locally available static index corroborates the locked zero-ECharts-family census within
the 76-entry `vrt-critical` corpus. The regex was applied to each critical entry's `id`, `title`,
and `name`; it was not a claim that the entire 455-entry index contains no ECharts examples. No
Storybook rebuild or capture was run because m01 has no story or `src/viz` mover. Storybook renders
the `src/viz` twin, not this server-side path. Therefore m01 and the later server-side
implementation carry these fences:

- zero `src/viz` movement;
- zero Storybook story or static-index movement;
- zero capture movement; any observed capture delta is stop-on, not attributed away;
- zero brand or token value movement;
- zero product source movement in m01;
- zero advertised-surface movement in m01: no schemas, generated TypeScript, tool descriptions,
  policy descriptions, API docs, or CHANGELOG;
- zero package-manifest or `pnpm-lock.yaml` movement;
- `BAKED_CONTRAST_CAVEAT` and both frozen ECharts caveat surfaces remain byte-identical in m01;
- all future operand-backed movement is owned by the new operand-backed controls, never by filling
  one of the five spec-only declaration slots.

The zero-story count is both inherited from the locked sprint grounding and locally rechecked
against the existing static index. The zero-movement clauses are mission fences to be rechecked
against base `1be93f8` at close; they are not claims that an unexecuted future diff has already been
measured.

## 6. Future-RED matrix

Each owner first records a green, non-zero unmutated baseline and then proves the named mutant turns
the carrier red (SR-24). m01 records these inputs and bites but does not commit skipped or knowingly
failing tests. A carrier that stays green under its named mutation does not satisfy Rule 9/SR-04.

| Input                                                                                                                                                                        | Expected RED                                                                                                                                    | Owner                                    | Mutation bite                                                                                                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **R01 — generated-token normalization:** two sequential renders of rich ECharts options exercising `zrN-cls-M`, `zrN-ani-M`, and `zrN-{s,g,p,c}M` definitions and references | Normalized bytes or hash differ even though only a generated token counter changed; definition/reference integrity may also break               | m02                                      | Disable each `cls`/`ani`/`s`/`g`/`p`/`c` token map one at a time; an emitting fixture must red for every disabled class                                                       |
| **R02 — structural discovery scope:** SVG containing an author label that merely looks like `zr7-cls-2`, plus real structural zrender tokens                                 | Author text or an `ecmeta_*` value is rewritten, or a real structural reference is missed                                                       | m02                                      | Replace structural discovery with a blind global regex; the author-text lookalike carrier must red while geometry and `ecmeta_*` remain byte-exact in the real implementation |
| **R03 — force convergence:** a valid degenerate network with coincident positions, symmetric nodes, isolated nodes, and zero/duplicate values                                | Two admitted force renders under controlled different RNG streams produce different normalized geometry/hash                                    | m02                                      | Remove the versioned worker seed or seeded synchronous convergence; the two-stream degenerate carrier must red                                                                |
| **R04 — force input boundary:** a network just beyond each declared node/link/size limit, paired with an at-limit control                                                    | Oversized input is accepted or reaches ECharts instead of returning the declared typed rejection                                                | m02                                      | Remove one typed limit; its over-limit rejection carrier must red                                                                                                             |
| **R05 — worker RNG isolation:** concurrent force and non-force jobs plus a forced render fault, with a main-realm `Math.random` sentinel                                     | The shared MCP realm is patched, concurrent output changes, or the worker RNG hook is not restored after failure                                | m02                                      | Patch the shared realm or omit restoration in `finally`; the concurrent sentinel carrier must red                                                                             |
| **R06 — text/canvas independence:** a text-bearing treemap under ambient-canvas poison and a forced slow ASCII width-map build crossing the zrender timing threshold         | Normalized hash changes, truncation diverges, or the worker admits clock-dependent cache state                                                  | m02                                      | Bypass the text-clock/canvas guard under poison or slow-map conditions; the same text fixture must red                                                                        |
| **R07 — first geo registration:** fresh-worker renders of the standard choropleth, inline-geometry bubble, and flow operands                                                 | A missing first registration yields an empty/default render or an untyped exception instead of the typed no-map/render fault                    | m02                                      | Skip the first `registerMap` call in a fresh worker; all applicable geo carriers must red                                                                                     |
| **R08 — warm geo replacement:** two sequential geo jobs reuse the fixed internal alias but supply conflicting FeatureCollections                                             | The second render retains stale first-job geometry, paint, or hash                                                                              | m02                                      | Skip re-registration/replacement in the warmed worker; the conflicting-geometry carrier must red                                                                              |
| **R09 — bounded geo alias:** a soak of unique caller map IDs and unique FeatureCollections                                                                                   | Registry cardinality or retained memory grows with caller IDs rather than staying bounded at the fixed internal alias                           | m02 carrier; m06 soak gate               | Restore caller-derived map names; the registry-growth and memory-series carrier must red                                                                                      |
| **R10 — choropleth join truth:** `GEO_CHOROPLETH_BRANCH`, whose features have `region` but no `name` key                                                                     | Region paths remain `#5070dd` with `ecmeta_data_index="-1"`, or the served option/hash fails to move                                            | m03                                      | Remove `geo.nameProperty`; the ramp-paint and non-negative-data-index carrier must red                                                                                        |
| **R11 — projected-byte fidelity:** paired paint perturbations, one applied only to the raw adapter object and one retained in the JSON-projected served option               | Grading follows the raw-only mutation or ignores the projected mutation                                                                         | m03 authors the carrier; m05 consumes it | Grade/render the raw unserved option instead of the projected object; the two-direction discrimination must red                                                               |
| **R12 — Role-C/Role-A separation:** hierarchy fixtures where a visible descendant tint differs from the semantic category assignment                                         | One lossy list is returned for both roles, hiding either the actual visible carrier or palette recycling                                        | m04                                      | Collapse `roleCPaints` and `roleAAssignment`; the deliberately divergent hierarchy fixture must red                                                                           |
| **R13 — actual Role C:** the standard sunburst whose descendant tint is `#809DE5` at 2.60:1 against the canvas while its base is `#416CD9` at 4.69:1                         | The tint is omitted and the known honest contrast failure disappears                                                                            | m04                                      | Drop derived descendant tints from paint extraction; the pinned sunburst fail must red                                                                                        |
| **R14 — semantic Role A:** an eight-category operand consuming a shorter recycled categorical palette                                                                        | Duplicate assignments are deduplicated/capped and the recycled equal-paint pair disappears                                                      | m04                                      | Dedupe or cap the `n=8` assignment; the recycled-pair carrier must red                                                                                                        |
| **R15 — unresolved pattern:** a categorical chart whose only visible carrier resolves to an unsupported `url(...)`/pattern                                                   | Contrast reports `pass` or `unchecked` rather than `ungradeable` with the unreadable-paint reason                                               | m04                                      | Treat an unresolved pattern as a skipped/non-failing paint; the verdict carrier must red                                                                                      |
| **R16 — missing paint metadata:** a separate rendered mark with the structural metadata required for family/role classification removed                                      | Contrast silently passes or becomes `unchecked` instead of reporting `ungradeable`                                                              | m04                                      | Drop the missing-metadata fault path; this carrier must red independently of R15                                                                                              |
| **R17 — independent render proof:** a renderable standard operand whose second render is instrumented and then paint/geometry-perturbed                                      | `stable` remains true, the second call is not observed, or the first valid `renderHash` is discarded                                            | m05                                      | Remove the second render or alias it to the first result; invocation and perturbation assertions must red                                                                     |
| **R18 — lazy cost boundary:** MCP startup and a sequence of non-renderable/spec-only calls followed by the first renderable operand-backed call                              | Worker/ECharts loads before the first renderable call, or the first real call fails to trigger the load                                         | m02                                      | Eagerly spawn the worker or import ECharts at module/startup time; the worker-state introspection carrier must red                                                            |
| **R19 — disposal/resource truth:** repeated successful and faulting renders with chart/worker instrumentation, followed by the ratified plateau window series                | Charts are not disposed on success/fault, or heap/RSS shows positive retained growth                                                            | m02 disposal carrier; m06 plateau gate   | Skip `dispose` on one path; the fault-path counter and soak carrier must red                                                                                                  |
| **R20 — D11 path scope:** the eight no-operand spec-only calls paired with their eight standard operand-backed calls                                                         | New render-backed wording or fields leak into the spec-only bytes, or operand-backed responses retain the superseded reconstruction-only caveat | m05                                      | Apply the D11 replacement globally instead of only to the operand-backed path; the spec-only byte control must red                                                            |
| **R21 — `renderHash` presence boundary:** all eight standard inline/renderable operands plus `GEO_BUBBLE_NO_GEOMETRY_BRANCH`                                                 | A completed first render lacks `renderHash`, or the no-geometry/no-render bubble receives one                                                   | m05                                      | Omit the hash after a successful first render or emit one on the option-only bubble path; the presence/absence matrix must red                                                |
| **R22 — typed render-fault failure half:** an operand-backed carrier with corrupt geometry or a forced worker render fault before the first SVG completes                    | The response fabricates a `renderHash`, reports a pass, or erases the valid option identity instead of returning the typed, honest failure      | m05                                      | Emit `renderHash` on the failed-first-render path; the carrier must assert it is absent and red under this mutant                                                             |
| **R23 — RFC-6902 subset wording rider:** every enumerated `brand.apply` advertised description site                                                                          | One site says unqualified “RFC 6902 patch” rather than the supported add/remove/replace subset                                                  | m05 rider r1                             | Remove the add/remove/replace qualification at any one enumerated site; the authored wording clause control must red                                                          |
| **R24 — `tokenCssRef` honor rider:** dashboard input with a non-default `tokenCssRef`, paired with an omitted-input control                                                  | The supplied value is accepted but output/export still hardcodes `tokens.build`, or the absent case loses its default                           | m05 rider r2                             | Revert the input-to-output thread; the custom-value and default-value assertions must red                                                                                     |
| **R25 — certified-matrix epoch discipline:** installed lockfile/runtime axes paired with `packages/viz-render/certified-matrix.json`                                         | A dependency, renderer/normalizer contract, token, dimension, or snapshot-policy change lands without the required epoch/record update          | m06                                      | Change a pinned installed version or contract axis while skipping the epoch bump; the consuming matrix pin spec must red                                                      |

## 7. m01 completion boundary

m01 is complete only when its owned controls are green with a non-zero test count and zero skips,
the exact-base fixture recapture remains byte-identical, the new operand-backed baseline pins all
eight standard cases and `renderHash` absence, the operand mirror parity guard is green, and the
working-tree diff contains only declared test/fixture/provenance files. The repository's inherited
full-suite skips are disclosed separately; they cannot be restated as “zero skips.” Review remains
a separate session under SR-14, and the commit boundary remains Derek's.
