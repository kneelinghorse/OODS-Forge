# Temporal placement migration

Seven retained s195 requests were replayed unchanged through the built `code.generate` input/output boundary. They produced 25 temporal SVG assets: Usage detail in HTML, React and Vue at B/dark (3), Usage workflow in React and Vue at A/light (20), and Subscription detail in React and Vue at A/hc (2). All 25 SVGs changed after the UTC correction. Complete generated artifacts are byte-identical between separate America/Chicago and UTC processes.

The historical request/result files remain unchanged. `source-fixture-audit.json` binds those seven files, the preview fixture, the old spec-only hash fixture and its shared operands directly to Git bytes at pre-UTC commit `944f4dda5f784e266310978b31f65b3d452e6387`. Each migration row preserves the source-file hash, exact request hash, original SVG hash, new SVG hash and both raw-output paths. `chicago/` and `utc/` retain complete request/result JSON and individual SVG files. These are build-session measurements, not independent certification.

| Qualified placement | Assets | Previous SVG SHA-256 | UTC SVG SHA-256 |
| --- | ---: | --- | --- |
| Usage detail, B/dark | 3 | `dc05841ce9bc5133cab0aa3dfb6497c6c22ef306f191e2ebbd162b6222cd5eb5` | `1f085c96448cf2731dce230ae431d0be0d8ae2d3e0120b6e453f48d91f20b958` |
| Usage workflow, A/light | 20 | `d4665d4e3318dbc7310cb08031f9c740055eb1a98a41afa277b64f191e51c5d5` | `7cbb39257178ae2505dceab5f3500139ac88e207e07c6a3193eda62bc4d4bbab` |
| Subscription detail, A/hc | 2 | `d77a69219501a87cef9c6b318cbdd97802f19caf1776c953b268771ac4379db7` | `21a3d57a9516971ecf0daa13572206c21f19d30b9cae8765d8354d28efd5388e` |

The package-source JSON scan found one file containing literal SVGs: `packages/component-contracts/fixtures/viz-preview-samples.v1.json`. All six inputs are explicitly non-temporal; even its line and area examples bind the nominal `period` field. Rerendering all six in both zones preserved their SVG bytes and hashes. The s172 spec-only JSON fixture stores hashes rather than SVGs; its shared line/area operands use nominal regions and numeric revenue, so it requires no UTC rewrite. Registry and certified-matrix coverage belongs to the parent golden-migration receipt. The audit classifies every source JSON match for `svg`, `svgHash` or `renderHash`.

Reproduce after the shared package build:

```sh
node scripts/product-reality/s196-temporal-placement-receipt.mjs
```

`--audit-only` reruns just the Git/source audit without loading any runtime module. `--output <directory>` retains a separate run. The producer always launches fresh processes with explicit timezones; it never changes the process timezone after importing the renderer.

The focused contract run uses:

```sh
pnpm --filter @oods/mcp-server exec vitest run \
  test/product-reality/temporal-placement-migration.s196.spec.ts \
  test/product-reality/chart-placement-codegen.s195.spec.ts \
  -t 'temporal placement migration|Usage detail|Usage workflow|legacy Subscription' \
  --reporter=default --reporter=json \
  --outputFile=../../artifacts/product-reality/sprint-196/m05/placement/contracts.json
```

`contracts.log` and `contracts.json` retain 17 passing tests: ten new migration contracts and seven selected Usage/Subscription cases. The 18 unrelated s195 cases are deliberately excluded by the name filter; this is not a full-suite receipt. The existing Subscription assertions now require the qualified UTC raw asset while retaining every other asset field. The new contract binds exact Usage artifacts, original operands, source Git bytes, raw hashes, both timezones and the unchanged nominal controls.
