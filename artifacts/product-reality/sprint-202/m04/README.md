# s202-m04 — Act from the conversation

Builder self-certified: **false**. Built on `codex/sprint-202-conversation-preview` from `ebe67e646` (m03 committed); receipts from the dirty working tree before this mission's commit.

## What is in the tree

- **Accepting a version.** `design.preview action:"accept"` (`packages/mcp-server/src/tools/design.preview.ts`, with `appendAcceptance` and `readAccepted` in `src/lib/composition-store.ts`) records compositionId@version, by default the latest, in `<compositions>/<id>/accepted.json`. Each acceptance is one entry:
  - when it was accepted;
  - the Forge head that recorded it and the head that produced the version;
  - the schema hash;
  - the version's stored measurements, plus the placed-chart certifications stored for other scopes;
  - the summary a render reports as measured;
  - which acceptance it supersedes.

  The file is replaced atomically with the new entry appended, and earlier entries stay as written. The new **OODS-V205** refuses two cases: accepting the standing version again, and accepting a version that was never generated (it has nothing measured). `action:"versions"` returns `accepted`: the standing version, when, and how many acceptances there are. An acceptance is not a version, so `versions/` does not change.
- **The advertised change.** Edited by hand:
  - `design.preview.input.json`: the `accept` action, its prose and an example;
  - `design.preview.output.json`: the accept branch and `accepted` on versions;
  - `tool-descriptions.json`: accept, the in-conversation app, and "accepted.json on accept";
  - the agent policy text;
  - the error registry;
  - `CHANGELOG.md`: a new Sprint 202 section.

  Regenerated through their generators, each with `--check` fresh:
  - `generated.ts`;
  - the tool capability ledger (`s193-tool-truth`);
  - `docs/api`;
  - `docs/mcp/Tool-Specs.md`;
  - the claims in `README.md`, `docs/how-forge-works.html` and the server and bridge READMEs.

  The root input count stays at 125, because no root property was added.
- **The browser page shows the accepted version.** The bridge's `store.ts` gains `readAccepted`. `versions.json` carries `accepted`, which is null until a version is accepted. The page's lineage and version list mark the accepted version, because `renderLineage` and `renderVersionList` now take the acceptance. Without one, the page is byte-identical.
- **The preview app acts from the conversation** (`preview-app/main.ts` and `index.html`; the app is 2,105,938 bytes, revision `87de86c9408e`). Every act is a `design_preview` call or a host message through the host:
  - **The four edits.** The page's `renderEditControls` call `action:"edit"`, and the new version opens in place with its lineage.
  - **Compare side by side.** `action:"compare"` mounts both versions' running apps in one scope. They are two frames in the app document, each answering the width queries.
    - The what-changed list uses `renderWhatChanged`, extracted from `compare.ts`; the compare page stays byte-identical.
    - Both measurement panels are shown.
    - Fullscreen is requested, and inline again on close.
    - A brand, theme or framework switch re-mounts both sides.
  - **Accept.** `action:"accept"` marks the panel, then sends `ui/update-model-context`. The text carries the accepted version's summary: what was accepted, its lineage, when, the schema, and what was and was not measured. The same facts go in structured form.
  - **Request changes.** `ui/message` names the composition, the version and the request.

  The app never edits a schema: an edit is a re-composition, and a request is a message.
- **Fixed at the producer on the way (an m01 regression).** m01's `swappableCandidates` (`design.compose.ts`) re-composed every slot candidate with the version's own order overrides and let a trial's OODS-V204 escape. Recording any version whose field order some candidate cannot carry therefore failed. In the app: swap the header to VizAreaPreview, reorder the body's fields, and the edit was refused with the trial's field set. Now a trial that the order overrides refuse leaves that candidate out, because a swap to it would be refused the same way. Compositions without order overrides are unaffected, so no pinned output moved. The receipt's edit chain below is exactly this case.
- **Pins moved.**
  - `packages/mcp-bridge/src/preview/host.test.ts`: `versions.json` now carries `accepted: null`.
  - `packages/mcp-adapter/test-s55-m04.js` criterion 4. This Sprint 55 source check, that the adapter never mentions `structuredContent`, had failed since m02 returned it for `design_preview`; m02's verification did not run this script. It now asserts that `structuredContent` appears only in the `design_preview` result branch.

## Receipts (`reference-host/preview-acts.json`, `accepted-after-v5.json`, `accepted-after-v4.json`, 10 screenshots)

One Subscription detail composition (`cmp-285c863660fa`) from the real adapter, in the reference host with a 900 px container.

- **Edits.** Each version opened in place with its lineage, and the version list shows `v5 · seed ← v4`.

  | Operation | Result |
  | --- | --- |
  | reorder-region | v1 → v2 |
  | swap-slot (header → VizAreaPreview) | v2 → v3 |
  | reorder-fields (`detail-body-10`: `cancellation_reason_code` before `status`) | v3 → v4 |
  | seed | v4 → v5 |

- **Compare v5 with v1.** Checked in React, then in Vue after the framework switch.
  - Components (v5 / v1): React 9 / 13, Vue 43 / 41.
  - 12 differences in both frameworks: regions 1, slots 1, nodes 4, field order 1, seed 1, artifact files 4, props 0.
  - The rendered lists equal the preview host's own `diff.json` for the pair, in both frameworks.
  - Both measurement panels are shown.
  - Fullscreen was requested and granted, and inline was requested again on close.
- **Accept v5, then v4.** `accepted.json` holds v5 (supersedes nothing), then v4 (supersedes v5).
  - Each entry carries the version's measurements, equal to its version file, with the recording and producing heads both `ebe67e646`.
  - The panel reads `this version`, the version list marks the version `accepted`, and the accept button is disabled for the standing version.
  - The browser page shows the acceptance.
  - Two `ui/update-model-context` messages were sent. The second reads: "Accepted design: Subscription detail, composition cmp-285c863660fa version 4 (reorder-fields from v3), accepted 2026-09-15T21:18:14.429Z, superseding v5. Schema sha256:092314a9…. Measured at acceptance: generation receipts for react and vue; 0 placed charts, 0 conformant; axe-core not run. Not measured: axe:react:A/light, …".
- **Request changes on v4.** One `ui/message`: `{role: "user", content: [{type: "text", text: "Request changes to Subscription detail, composition cmp-285c863660fa version 4: Put the billing cycle card first."}]}`.
- **Calls and cleanliness.** The app made 11 `design_preview` calls: 4 edits, 3 compares, 1 generation of v1's Vue module for the switch, and 3 accepts. The second accept met the server's limit of ten calls a minute (OODS-R001) and succeeded on the app's retry.
  - Events: 37 `resources/read`, 2 `ui/request-display-mode`, 2 `ui/update-model-context`, 1 `ui/message`.
  - Zero console errors, page errors, CSP violations and non-JSON stdout lines.

## Tests

- **`@oods/mcp-server`, new:**
  - `test/tools/design.preview.accept.s202.spec.ts` (2): each acceptance is written once with the measurements snapshot; supersession keeps the first entry; the standing version is refused and nothing is written; `versions` and the page's host name the acceptance; a never-generated version is refused.
  - `test/product-reality/preview-app-acts.s202.spec.ts` (3, reference host): the four edits; side by side against the host's `diff.json`; accept, supersede and request changes.
  - A new case in `test/tools/design.compose.s202.spec.ts`: a version's own order overrides never abort recording it. Every candidate the order refuses is not offered, every offered candidate composes, and at least one refusal occurs.
- **`@oods/mcp-server`, re-run green (1 or more files each):**

  | Group | Files and tests |
  | --- | --- |
  | Tools and store | `design.compose.s202` 2, `design.preview.s201` 8, `design.preview.s202` 2, `composition-store.s201` 3 |
  | Docs and advertised surface | `tool-specs-generator.s196` 19, `portable-claims.s196` 11, `tool-truth.s193` 31, `api-docs-generator` 7, `doc-retirement-gate` 11, `s71-fixes` 10, `s90-registration-audit` 32, `temporal-docs.s196` 2, `src/errors/registry.test.ts` 27 |
  | Conversation surface | `preview-app.s202` 3, `reference-host.s202` 3, `adapter-mcp-apps.s202` 3, `adapter-preview-host.s201` 1, `portable-boundary.s181` 13, `shell-landmarks.s202` 1 |
  | Other product reality | `options.s194` 9, `closeout.s194` 6, `release-limit.s198` 2, `browser-receipt-audit.s189` 6 |

- **`@oods/mcp-bridge`:** 11 files, 58 tests, including the new `src/preview/accepted.test.ts` (3) and `host.test.ts` with its moved pin.
- **Root:** `how-forge-works.contract` with `license-shape.s200` 24, `bridge-policy-and-tool-names` 3, `readme.s200` 6, `viz-coverage-table.s199` 2. `pnpm typecheck` is clean.
- **Adapter proof scripts:** `test-s55-m04.js` 17/17 and `test-s55-m05.js` 21/21; `test-s181-lifecycle.js` and `test-s196-native-errors.js` pass.
- **Generators and gates:** `schemas-tools generate:check`, `s193-tool-truth --check`, `docs:api`, `docs:tools` and `docs:claims --check`, and `docs:check` are all fresh. The golden ledger `check` is verified; m04 moves no ledger pin.

## Not done here

- `packages/mcp-adapter/test-s55-m03.js` "Descriptions start with an action verb" fails 15/16, and did so before Sprint 202. Seven advertised descriptions start with words outside its verb list: `health` ("Read"), `artifact.certify` ("Certify"), `map`, `schema`, `object` and `repl` ("Grouped"), and `design.preview` ("Open"). The same list fails at the Sprint 201 base `04182b116`. This is carried, not changed here.
- axe-core still does not run inside the conversation view (descope rung 1).
- The archive's end-to-end test with the resources, and the Claude Desktop and Cursor install path, are m05.
