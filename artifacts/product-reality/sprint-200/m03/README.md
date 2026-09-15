# s200-m03 — license and terms

Builder self-certified: **false**. Base f034a8d5f (the m02 commit) on `codex/sprint-200-available`; the mission commit records the head. No primary build, delivery, publish or public flip. The holder name is Derek's to confirm at the review; it changes in one line of `configs/license/holder.json` and the generator re-renders every carrier.

## What is in the tree

- **One holder source, one renderer.** `configs/license/holder.json` is the only authored occurrence of the holder. `scripts/license/render-license.mjs` (with `--check`) renders it into the root LICENSE, the five package LICENSE files (identical bytes: the SPDX text with only the Required Notice line replaced) and the marker spans in README.md, COMMERCIAL.md and CONTRIBUTING.md. The canonical text is `configs/license/PolyForm-Noncommercial-1.0.0.txt`, fetched from the SPDX license-list-data raw URL on 2026-09-14; its sha256 `ffcca38841adb694b6f380647e15f17c446a4d1656fed51a1e2041d064c94cc8` is recorded beside it and asserted by the renderer and the spec.
- **23 manifests** declare `PolyForm-Noncommercial-1.0.0` (ten from MIT, twelve from absent, plus examples/sample-app outside the baseline); the root `repository` and `homepage` name `kneelinghorse/OODS-Forge`. The 22 guarded transitions are approved by #2061 in the packet block beside the ten m01 entries (33 approvals); `release-publish-shape.s196` is green and the sprint-196 baseline is byte-identical. Readiness facts regenerated under `artifacts/product-reality/sprint-200/readiness/` with the unchanged generator (`m03-facts.patch` is the diff); `--check` green.
- **Packed manifest.** `scripts/pkg/build.ts` inherits the license id and copies LICENSE, COMMERCIAL.md and, once m04 generates it, THIRD-PARTY-NOTICES.md beside the manifest; `pnpm pkg:build` ran once and `packed-manifest.json` records the id and identical terms bytes.
- **Terms.** README: title "OODS Forge", a LICENSING section in plain words with the rendered holder line, the "Other" detector note and the OODS-Foundry MIT statement; the three MIT references in docs replaced. CONTRIBUTING: the inbound grant (rendered from the holder source), the contributor path named, no CLA; both PR templates carry the required checkbox. COMMERCIAL.md with the starting price on one marked line, `docs/legal/commercial-license-agreement.md` (one page, ten clauses, Illinois), `docs/LICENSE-FAQ.md` for the edges, SECURITY.md re-pointed at the release line, product name and the licensor's contact, a CHANGELOG entry.
- **Spec.** `tests/verification/license-shape.s200.test.ts`: canonical hash, six identical rendered LICENSE files differing from the canonical text by exactly the notice line, the holder string in exactly one authored source with every other occurrence inside a rendered span, `render-license --check` exit 0, the 23 manifests and the repository URL, the packed manifest, no MIT reference outside the historical statement, no OSI claim, the grant, checkboxes, price line, agreement clauses and FAQ edges. Its bite (`bite.json`): a hand edit to one LICENSE file turns the spec red; restoring the render turns it green.

## Gates

- `render-license --check`, license-shape spec, `release-publish-shape.s196`, readiness `--check`, `docs:check` (the claims spans and generated READMEs unchanged), the how-forge-works and s177 prose contracts, docs and agent-docs contracts, root typecheck: green.

## Not done here

- Stage1's license change is made from Stage1's repository. The GitHub Release, notices, brand source and aliases are m04. The public flip and the holder confirmation are Derek's, at the review. The agreement and FAQ are the memo's terms written down; whether Derek wants counsel to read them before the flip is his call.
