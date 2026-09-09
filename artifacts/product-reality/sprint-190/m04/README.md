# s190-m04 — Subscription payment chart

The public Subscription detail now places one data-bound area chart above Status
Timeline. `viz/MarkArea` binds existing payment dates and `amount / 100`; it adds
no visualization fields or controls to the host object. `repl.ui.schema.json`
and generated types carry the chart declaration. Compose brand is optional;
light/A remains the default, with dark and brand B supported for chart pixels.

`code.generate` calls the public `viz.render` handler during generation. React
and Vue receive a typed optional `svg` prop with a seed default. Workflow files
include ten hashed SVG assets and an SVG map selected by record id. The charts
are explicitly sample payments: editing the local record does not regenerate
them. The existing application shell styling is unchanged; dark preference here
is evidenced by the chart canvas, not a claim that the whole shell was rethemed.

`VizAreaPreview` is a 1.1.0 component contract with SVG/title/description props.
HTML, React and Vue preserve renderer IDs and ARIA. The static boundary rejects
active tags, CSS blocks/attributes, external references, event attributes and
encoded reference attacks. Omitted SVG keeps the original placeholder.

## Acceptance evidence

- `schema-movement.json`: census against m03 `04b5dd78`. Exactly Subscription
  detail moves among 66 standalone schemas; 65 are unchanged. The assembled
  workflow also carries that detail subtree. Class (h), 66/66 schemas and 132/132
  framework cells green; workflow 2/2. `after-final/census/` contains responses.
- `close-tests.log`: 78 passing tests, including public renderer byte identity,
  one asset per seed id, dark/B canvas, repeated artifact identity, strict React
  and Vue detail/workflow compilation, rejected active SVGs, and computed
  HTML/React/Vue figure/label/SVG parity with no exceptions.
- `after-final/{light,dark}/{react,vue}/`: twelve screenshot/accessibility views
  at 390/820/1440 for the Team annual review state. The named figure precedes
  Status Timeline, with no overflow or page/console errors. Screenshots were
  visually inspected. Each theme's `browser-comparison.json` computes visible
  text, chart accessible-name/role subtree and CSS parity: empty allowlist and
  zero differences. `verify-browser.ts` replays the actual public app.
- The accessibility dump now appends the browser's real AX subtree, matched by
  backend DOM identity. Playwright's shorter snapshot collapsed graphics roles
  into `img`; the actual browser tree retains `graphics-object` descendants.
- `flows-linux/report.json`: 16/16 packed consumer gates, 18/18 flow checks,
  32/32 state observations, 36 screenshots. Includes exact tarball installation,
  strict types, production build, SSR, hydration, CSS, native keyboard edits,
  save/cancel/timeline/archive, and the existing isolated navigation mutation.
  Linux Chromium uses the retained official image in `linux-browser-image.json`.
- `mcp-regression-verified.log`: 208 composer/emitter/render checks. The corrected
  workflow run is in `focused-final.log` (77 tests, overlapping the area/parity
  checks). `object-tests.log`: 93. `component-contracts-tests-final.log`: 121.
  `react-component-tests.log`: 36; `vue-component-tests.log`: 27;
  `component-styles-tests.log`: 33; `design-loop-tests-verified.log`: 11.
  These are overlapping execution counts, not a sum of unique tests. No skips.
- MCP build, root/renderer typechecks, schema generation check, API docs check
  and `git diff --check` pass. No full four-suite capture was run.
- `m03-preservation.json`: all 15 attributed m03 files remain byte-identical and
  the flat token map hash remains
  `0cc0e991e94d1fed98fe04a1ec4e18b1d9efdfa8835bd7eaa43782eb5b66f968`.
  No existing chart golden moved during m04.
- `current-artifact-identity.json` verifies all four measured React/Vue app
  artifacts against final source. The final contract-version metadata and HTML
  explicit-label correction do not change their bytes. The packed browser
  receipts precede that metadata-only amendment; m06 recaptures final packages.

## Attributed corrections and retained failures

Initial build failures exposed the public nonempty-row tuple type, TypeScript
control-flow narrowing, and inclusion of Vega's existing textMetrics type
augmentation when codegen began importing the public renderer. The latter now
travels with its source module; it changes no renderer runtime behavior.
Vue strict compilation caught inline SVG expression parsing; its seed string
now lives in script setup. The workflow store test now materializes the declared
chart-assets module. Area prop/version/placeholder pins were updated to the new
contract; the older StatusSelector.help pin was corrected to the implementation
already present at m03 HEAD (no StatusSelector code changes).

`flows/` retains the red macOS run. Its native Home/ArrowDown select proof does
not work on this host, as already documented in s188/m04 and the s189 memo.
The unchanged harness passes with the pinned Linux browser. No synthetic event
or component keyboard workaround was added. The probe log also records Enter
submitting the form, rather than repairing that platform limitation.

Other retained red logs cover the wrong test canvas token, the pre-existing
full-detail HTML Tabs normalization gate (the HTML chart component is tested
independently), and a Playwright/tsx probe closure serialization issue. They are
not counted as acceptance evidence. Decisions #1853/#1854 and learnings #547/#548
record the durable choices. Sprint 190 remains active, builderSelfCertified=false;
this mission completion is not sprint review or runtime deployment.
