/**
 * s204-m02 — the screen receipt, retained beside its output.
 *
 * Sprint 203 m04 measured its screens with a harness that appears in no source file, so its numbers
 * could not be explained or re-run — and one of them was wrong: `charactersRendered: 1` for an
 * 8,418-character decision that visibly rendered in full (learning #658, mission defect (f)). This is
 * the replacement, and the point of it is that it is IN THE TREE: every number this sprint states
 * about a rendered screen comes from here and can be re-run by the reviewer.
 *
 *   pnpm exec tsx scripts/product-reality/s204-m02-screens.ts --label before --out <dir> [--scope touched|certify|long-text] [--limit N]
 *
 * The arm is MEASURED, not declared. `--label` only names the output; what was actually rendered is
 * determined by reading the built producer the bridge loads (`packages/mcp-server/dist`) and
 * recording whether the m02 producer changes are present in it, with a digest. A receipt that claims
 * to be a "before" while the tree holds the "after" build is the failure mode this guards.
 *
 * Scopes:
 *   touched    the 68 screens whose composed schema this mission changes, in React and Vue at 390,
 *              820 and 1440 — the mission's before/after receipt. The set is READ from
 *              screen-readout.json rather than hardcoded, so it cannot drift from the producer.
 *   certify    the full Sprint 199 bar — every context of the named objects in React and Vue, at
 *              three widths across light, dark and high contrast in brands A and B (18 width/scope
 *              cells per framework), with axe. High contrast is measured under `forced-colors:
 *              active`, because that is the environment the scope describes (s203-m04 established
 *              that measuring it any other way reports contrast failures that are not real).
 *   long-text  the real extreme values from the live stores written onto the version the host serves,
 *              opened at 390 in both frameworks. This is the re-measure of defect (f).
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium, type Browser, type Page } from 'playwright';

const root = path.resolve(import.meta.dirname, '../..');
const arg = (name: string, fallback?: string): string | undefined => {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : fallback;
};
const label = arg('label', 'after')!;
const scope = arg('scope', 'touched')!;
const limit = Number(arg('limit', '0'));
const out = path.resolve(root, arg('out', `artifacts/product-reality/sprint-204/m02/${label}`)!);
fs.mkdirSync(out, { recursive: true });
const shots = path.join(out, scope === 'long-text' ? 'long-text' : 'shots');
fs.mkdirSync(shots, { recursive: true });

/* ------------------------------------------------------------------ */
/*  Which producer is actually being measured                          */
/* ------------------------------------------------------------------ */

/**
 * The bridge loads `packages/mcp-server/dist`, so that build — not the source tree, and not the
 * `--label` on the command line — is what the screenshots below show. Read it and say so.
 */
function producerStamp(): Record<string, unknown> {
  const filler = path.join(root, 'packages/mcp-server/dist/compose/object-slot-filler.js');
  const composeTool = path.join(root, 'packages/mcp-server/dist/tools/design.compose.js');
  const patterns = path.join(root, 'packages/mcp-server/dist/compose/field-patterns.js');
  const read = (file: string) => fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const fillerSource = read(filler);
  const composeSource = read(composeTool);
  const patternSource = read(patterns);
  const digest = createHash('sha256').update(fillerSource + composeSource + patternSource).digest('hex').slice(0, 16);
  // One probe per producer change, so the stamp says WHICH of them the build carries rather than
  // just that it differs.
  return {
    distDigest: digest,
    distMtime: fs.existsSync(filler) ? fs.statSync(filler).mtime.toISOString() : null,
    carries: {
      neutralizeUnfilledSurfaceSlots: fillerSource.includes('neutralizeUnfilledSurfaceSlots'),
      bindCardHeadingField: fillerSource.includes('bindCardHeadingField'),
      timestampValuedTransitions: patternSource.includes('isTimestampValued'),
      wiredIntoCompose: composeSource.includes('neutralizeUnfilledSurfaceSlots'),
    },
  };
}

const stamp = producerStamp();
const carriesM02 = Object.values(stamp.carries as Record<string, boolean>).every(Boolean);
const armIs = carriesM02 ? 'after' : (Object.values(stamp.carries as Record<string, boolean>).some(Boolean) ? 'mixed' : 'before');
console.log(`[s204-m02] label=${label} scope=${scope} — the built producer reads as: ${armIs}`);
console.log(`[s204-m02] ${JSON.stringify(stamp)}`);
assert.notEqual(armIs, 'mixed', 'the built producer carries only SOME of the m02 changes; rebuild before measuring');
assert.equal(armIs, label, `--label ${label} but the built producer is the ${armIs} arm; build the arm you mean to measure`);

/* ------------------------------------------------------------------ */
/*  The screens                                                        */
/* ------------------------------------------------------------------ */

type Screen = { object: string; context: string };

/** The touched set is derived, never typed by hand: whatever the readout says changed is what is measured. */
function touchedScreens(): Screen[] {
  const readoutPath = path.join(root, 'artifacts/product-reality/sprint-204/m02/screen-readout.json');
  const readout = JSON.parse(fs.readFileSync(readoutPath, 'utf8')) as {
    objects: Record<string, { declared: Array<{ context: string; before: Record<string, unknown>; after: Record<string, unknown> }> }>;
  };
  const screens: Screen[] = [];
  for (const [object, entry] of Object.entries(readout.objects)) {
    for (const declared of entry.declared) {
      const keys = new Set([...Object.keys(declared.before), ...Object.keys(declared.after)]);
      if ([...keys].some(key => declared.before[key] !== declared.after[key])) screens.push({ object, context: declared.context });
    }
  }
  return screens;
}

/**
 * The objects whose ALREADY-CERTIFIED screens this mission reshapes, and so must re-certify.
 *
 * Subscription is the one the mission named, and it is here for the reason the mission gave, though
 * on a different screen than the mission expected: the (c) fix re-pairs the status-timeline group
 * from `allowed_transitions` to `updated_at` on Subscription's DASHBOARD — `Subscription/detail` is
 * byte-identical across the two arms, measured. Person is here because the same fix re-derives its
 * detail and workflow layout entirely, moving fragment anchors (`detail-tabs-9-*` becomes
 * `screen-detail-13-record-tabs-*`) on a screen Sprint 203 certified. Decision is here because its
 * card is the screen Sprint 203 could not certify and (d) is meant to make it certifiable.
 */
const CERTIFY_OBJECTS = ['Subscription', 'Person', 'Decision'];
const CONTEXTS = ['card', 'detail', 'form', 'inline', 'list', 'timeline', 'workflow', 'dashboard'];

/* ------------------------------------------------------------------ */
/*  The bridge                                                         */
/* ------------------------------------------------------------------ */

const storeRoot = fs.mkdtempSync(path.join(os.tmpdir(), 's204-m02-'));
const TOKEN = 's204-m02-token';
const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const bridge = spawn(process.execPath, ['dist/server.js'], {
  cwd: path.join(root, 'packages/mcp-bridge'),
  env: { ...process.env, MCP_BRIDGE_PORT: '0', BRIDGE_TOKEN: TOKEN, MCP_SCHEMA_STORE_ROOT: storeRoot, MCP_SCHEMA_STORE_DIR: 'schemas' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let bridgeLog = '';
bridge.stdout.on('data', chunk => { bridgeLog += chunk; });
bridge.stderr.on('data', chunk => { bridgeLog += chunk; });
const port = await new Promise<number>((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error(`bridge did not listen: ${bridgeLog}`)), 30_000);
  const poll = () => {
    const match = /listening on :(\d+)/.exec(bridgeLog);
    if (match) { clearTimeout(timer); resolve(Number(match[1])); } else setTimeout(poll, 100);
  };
  poll();
});
const base = `http://127.0.0.1:${port}`;
console.log(`[s204-m02] bridge on ${base}, store ${storeRoot}`);

type Preview = { framework: 'react' | 'vue'; url: string; appUrl: string; compiled: { sha256: string; bytes: number } };
type RenderResult = { compositionId: string; version: number; schemaHash: string; previews: Preview[] };

/**
 * `design.preview` is capped at ten calls a minute by the server policy and the bridge caps `/run` at
 * thirty, and those caps are the serving contract — not something a receipt may quietly raise. So the
 * harness waits instead. Measured the hard way: the first run of this script composed as fast as it
 * could and 51 of 68 screens came back refused, while the receipt it wrote still read "0 axe
 * violations" over the 17 that got through. A receipt that looks green because most of the work never
 * ran is the failure this paces around.
 */
const PREVIEW_INTERVAL_MS = 6_200;
let lastPreviewAt = 0;

async function preview(object: string, context: string): Promise<RenderResult> {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const wait = Math.max(0, lastPreviewAt + PREVIEW_INTERVAL_MS - Date.now());
    if (wait > 0) await new Promise(resolve => setTimeout(resolve, wait));
    lastPreviewAt = Date.now();
    const response = await fetch(`${base}/run`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-bridge-token': TOKEN },
      body: JSON.stringify({ tool: 'design_preview', input: { object, context } }),
    });
    const body = await response.text();
    if (response.ok && body.includes('"ok":true')) return (JSON.parse(body) as { result: RenderResult }).result;
    // A rate limit is a wait, not an answer. Anything else is a real refusal and is reported as one.
    if (/OODS-R001|RATE_LIMITED/.test(body)) { lastPreviewAt = Date.now() + 20_000; continue; }
    throw new Error(`design_preview ${object}/${context}: ${body.slice(0, 400)}`);
  }
  throw new Error(`design_preview ${object}/${context}: still rate limited after 6 attempts`);
}

/** The same served app under a different brand and theme — a query on the URL, not a second composition. */
function scopedAppUrl(appUrl: string, theme?: string, brand?: string): string {
  if (!theme && !brand) return appUrl;
  const url = new URL(appUrl);
  if (theme) url.searchParams.set('theme', theme);
  if (brand) url.searchParams.set('brand', brand);
  return url.toString();
}

/* ------------------------------------------------------------------ */
/*  What a rendered page is measured for                               */
/* ------------------------------------------------------------------ */

const axeSource = fs.readFileSync(path.join(root, 'node_modules/axe-core/axe.min.js'), 'utf8');

type Cell = {
  screen: string; framework: string; width: number; theme?: string; brand?: string;
  axe: Array<{ id: string; impact: string | null; nodes: number }>;
  consoleErrors: string[]; pageErrors: string[];
  horizontalOverflow: number; clippedNodes: number; belowFontFloor: number;
  components: number; shot: string;
};

/** The floor Sprint 203 measured against: no rendered text smaller than 9px. */
const FONT_FLOOR_PX = 9;

async function measure(page: Page, _width: number): Promise<Omit<Cell, 'screen' | 'framework' | 'width' | 'shot' | 'consoleErrors' | 'pageErrors'>> {
  await page.addScriptTag({ content: axeSource });
  const axeResults = await page.evaluate(async () => {
    const results = await (window as unknown as { axe: { run: (ctx: unknown, opts: unknown) => Promise<{ violations: Array<{ id: string; impact: string | null; nodes: unknown[] }> }> } })
      .axe.run(document, { resultTypes: ['violations'] });
    return results.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }));
  });
  const layout = await page.evaluate((floor: number) => {
    const doc = document.documentElement;
    // A node is CLIPPED when its own content does not fit the box it was given and the overflow is
    // hidden — that is text a reader cannot reach, as distinct from a scrollable region.
    let clipped = 0;
    let small = 0;
    for (const node of Array.from(document.querySelectorAll<HTMLElement>('body *'))) {
      const style = getComputedStyle(node);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      const hasText = Array.from(node.childNodes).some(child => child.nodeType === Node.TEXT_NODE && (child.textContent ?? '').trim().length > 0);
      if (!hasText) continue;
      if (parseFloat(style.fontSize) < floor) small += 1;
      const hiddenX = style.overflowX === 'hidden' || style.overflow === 'hidden';
      const hiddenY = style.overflowY === 'hidden' || style.overflow === 'hidden';
      if ((hiddenX && node.scrollWidth > node.clientWidth + 1) || (hiddenY && node.scrollHeight > node.clientHeight + 1)) clipped += 1;
    }
    return {
      horizontalOverflow: Math.max(0, doc.scrollWidth - doc.clientWidth),
      clippedNodes: clipped,
      belowFontFloor: small,
      components: document.querySelectorAll('[data-oods-component]').length,
    };
  }, FONT_FLOOR_PX);
  return { axe: axeResults, ...layout };
}

async function openCell(
  browser: Browser, appUrl: string, width: number, forcedColors: boolean,
): Promise<{ page: Page; consoleErrors: string[]; pageErrors: string[] }> {
  const page = await browser.newPage({
    viewport: { width, height: 1000 }, locale: 'en-US', timezoneId: 'UTC',
    ...(forcedColors ? { forcedColors: 'active' as const } : {}),
  });
  // tsx compiles with esbuild's `keepNames`, which rewrites a named arrow function as
  // `__name(() => …, "flatten")`. That helper exists in the bundle, not in the page, so any
  // `page.evaluate` body declaring a named function throws `__name is not defined`. The shim makes
  // the helper a no-op in the page; it is injected before navigation so it is in place for every
  // evaluate on this page, and it is inert for the artifact under test.
  await page.addInitScript(() => {
    const self = globalThis as unknown as { __name?: (fn: unknown) => unknown };
    if (!self.__name) self.__name = fn => fn;
  });
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.goto(appUrl, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.documentElement.dataset.oodsPreviewMounted === 'true', undefined, { timeout: 30_000 });
  return { page, consoleErrors, pageErrors };
}

/* ------------------------------------------------------------------ */
/*  Run                                                                */
/* ------------------------------------------------------------------ */

const browser = await chromium.launch({ headless: true });
const started = performance.now();
const cells: Cell[] = [];
const failures: string[] = [];

try {
  if (scope === 'touched' || scope === 'certify') {
    const WIDTHS = [390, 820, 1440];
    /**
     * The scope grid is driven by the URL, not by re-composing. `design.preview`'s `appUrl` carries
     * `?framework=&brand=&theme=`, so one composition serves all six brand/theme combinations — which
     * is both 6× fewer calls against a ten-a-minute cap and a stricter test, since every scope is
     * measured against the SAME generated artifact.
     */
    const SCOPES: Array<{ theme?: string; brand?: string }> = scope === 'certify'
      ? ['light', 'dark', 'hc'].flatMap(theme => ['A', 'B'].map(brand => ({ theme, brand })))
      : [{}];
    const plan: Screen[] = scope === 'touched'
      ? touchedScreens()
      : CERTIFY_OBJECTS.flatMap(object => CONTEXTS.map(context => ({ object, context })));
    const work = limit > 0 ? plan.slice(0, limit) : plan;
    console.log(`[s204-m02] ${work.length} compositions × 2 frameworks × ${WIDTHS.length} widths × ${SCOPES.length} scopes = ${work.length * 2 * WIDTHS.length * SCOPES.length} cells`);
    let done = 0;
    for (const entry of work) {
      let rendered: RenderResult;
      try {
        rendered = await preview(entry.object, entry.context);
      } catch (error) {
        failures.push(`${entry.object}/${entry.context}: ${(error as Error).message.slice(0, 260)}`);
        continue;
      }
      for (const view of rendered.previews) {
        for (const cellScope of SCOPES) {
          for (const width of WIDTHS) {
            const suffix = cellScope.theme ? `-${cellScope.theme}-${cellScope.brand}` : '';
            const name = `${entry.object}-${entry.context}${suffix}-${view.framework}-${width}`;
            // High contrast is measured under forced colours, because that is the environment the
            // scope describes; s203-m04 established that measuring it any other way reports contrast
            // failures that are not real, on screens an earlier sprint had already certified.
            const { page, consoleErrors, pageErrors } = await openCell(
              browser, scopedAppUrl(view.appUrl, cellScope.theme, cellScope.brand), width, cellScope.theme === 'hc',
            );
            const measured = await measure(page, width);
            const shot = path.join(shots, `${name}.png`);
            await page.screenshot({ path: shot, fullPage: true });
            await page.close();
            cells.push({
              screen: `${entry.object}/${entry.context}`, framework: view.framework, width,
              ...(cellScope.theme ? { theme: cellScope.theme, brand: cellScope.brand } : {}),
              consoleErrors, pageErrors, ...measured, shot: path.relative(out, shot),
            });
          }
        }
      }
      done += 1;
      if (done % 5 === 0) console.log(`[s204-m02] ${done}/${work.length} compositions, ${cells.length} cells, ${((performance.now() - started) / 1000).toFixed(0)}s`);
    }
  }

  if (scope === 'long-text') {
    /**
     * Defect (f), re-measured.
     *
     * The value is written onto the version the host serves — `attachToVersion`'s `model` is the
     * deterministic field model the page mounts with — and then the page is opened and asked how much
     * of that value it actually rendered. `charactersRendered` is the count of CHARACTERS of the value
     * present in the page's text, which is what the name says and what Sprint 203's receipt did not
     * report: it recorded 1, the same number as `nodesCarryingIt` in every single row, for a value
     * that rendered in full.
     */
    const fixtures = JSON.parse(fs.readFileSync(path.join(root, 'artifacts/product-reality/sprint-203/m04/long-text-fixtures.json'), 'utf8')) as
      Record<string, { source?: string; chars?: number; longestWord?: number; value?: string }>;
    const CASES: Array<{ object: string; context: string; field: string; fixture: string }> = [
      { object: 'Decision', context: 'card', field: 'decision_text', fixture: 'decision_text' },
      { object: 'Decision', context: 'detail', field: 'decision_text', fixture: 'decision_text' },
      { object: 'Decision', context: 'list', field: 'decision_text', fixture: 'decision_text' },
      { object: 'Person', context: 'card', field: 'blurb', fixture: 'blurb' },
      { object: 'Person', context: 'detail', field: 'blurb', fixture: 'blurb' },
      { object: 'Person', context: 'list', field: 'blurb', fixture: 'blurb' },
      { object: 'Cluster', context: 'card', field: 'lead_title', fixture: 'article_title' },
      { object: 'Cluster', context: 'detail', field: 'lead_title', fixture: 'article_title' },
      { object: 'Cluster', context: 'detail', field: 'lead_url', fixture: 'unbroken_token' },
      { object: 'Cluster', context: 'list', field: 'lead_title', fixture: 'article_title' },
    ];
    const camel = (name: string) => name.replace(/_([a-z])/g, (_m, letter: string) => letter.toUpperCase());
    const readings: Record<string, unknown> = {};
    for (const testCase of CASES) {
      const value = fixtures[testCase.fixture]?.value;
      assert(typeof value === 'string' && value.length > 0, `fixture ${testCase.fixture} has no value`);
      const rendered = await preview(testCase.object, testCase.context);
      // Write the extreme value onto the version the host serves, then ask the host for that same
      // composition again so it re-renders from the patched record. `versionPath`'s layout is
      // <store>/compositions/<id>/versions/<n>.json.
      const versionFile = path.join(storeRoot, 'compositions', rendered.compositionId, 'versions', `${rendered.version}.json`);
      assert(fs.existsSync(versionFile), `version record not found at ${versionFile}`);
      const record = JSON.parse(fs.readFileSync(versionFile, 'utf8')) as { model?: Record<string, unknown> };
      assert(record.model && Object.keys(record.model).length > 0, `version ${rendered.compositionId} v${rendered.version} carries no model to patch`);
      assert(Object.hasOwn(record.model, camel(testCase.field)), `the model has no ${camel(testCase.field)} to overwrite — the field is not in this screen's object shape`);
      record.model = { ...record.model, [camel(testCase.field)]: value };
      fs.writeFileSync(versionFile, JSON.stringify(record, null, 2));
      const key = `${testCase.object}/${testCase.context}/${testCase.field}`;
      readings[key] = {};
      for (const view of rendered.previews) {
        const { page, consoleErrors, pageErrors } = await openCell(browser, view.appUrl, 390, false);
        const reading = await page.evaluate((raw: string) => {
          /**
           * Both sides are whitespace-normalized before they are compared, and that is not a
           * convenience — it is the difference between a true reading and a false one. The value
           * holds `\n\n` paragraph breaks; `innerText` reports what the BOX does with them, which is
           * its own arrangement of line breaks. Comparing the raw value against `innerText` stops at
           * the first paragraph break and reports ~345 of 8,418 characters for a value that is
           * entirely present — a truncation that exists only in the measurement.
           */
          const flatten = (value: string) => value.replace(/\s+/g, ' ').trim();
          const needle = flatten(raw);
          const text = flatten(document.body.innerText ?? '');
          // How many characters of the value the page actually carries. A value rendered in full
          // reads back its own length; a truncated one reads back the longest prefix present.
          let present = 0;
          if (text.includes(needle)) present = needle.length;
          else { let low = 0, high = needle.length; while (low < high) { const mid = Math.ceil((low + high) / 2); if (text.includes(needle.slice(0, mid))) low = mid; else high = mid - 1; } present = low; }
          // The innermost elements carrying the value: a node whose text holds the opening of the
          // value and no child of which also holds it.
          const opening = needle.slice(0, Math.min(40, needle.length));
          const holds = (node: Element) => flatten(node.textContent ?? '').includes(opening);
          const carriers = Array.from(document.querySelectorAll<HTMLElement>('body *'))
            .filter(node => holds(node) && !Array.from(node.children).some(holds));
          let clipped = 0, ellipsised = 0;
          for (const node of carriers) {
            const style = getComputedStyle(node);
            if ((style.overflow === 'hidden' || style.overflowX === 'hidden') && node.scrollWidth > node.clientWidth + 1) clipped += 1;
            if ((style.overflow === 'hidden' || style.overflowY === 'hidden') && node.scrollHeight > node.clientHeight + 1) clipped += 1;
            if (style.textOverflow === 'ellipsis' || style.webkitLineClamp !== 'none') ellipsised += 1;
          }
          /**
           * Presence needs a threshold, not `> 0`. The prefix probe finds the longest opening of the
           * value that appears anywhere in the page, and on a screen that does not carry the value at
           * all a one- or three-character opening still matches by coincidence — which would report
           * `valuePresent: true` for a field that is simply not there. Presence therefore means the
           * first 40 characters, or the whole value when it is shorter than that.
           */
          const presenceFloor = Math.min(40, needle.length);
          return {
            valuePresent: present >= presenceFloor,
            presenceFloor,
            charactersRendered: present,
            charactersInValue: needle.length, charactersInRawValue: raw.length,
            renderedInFull: present === needle.length,
            nodesCarryingIt: carriers.length,
            clippedNodes: clipped,
            ellipsisedNodes: ellipsised,
            horizontalOverflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
            bodyScrollWidth: document.documentElement.scrollWidth,
          };
        }, value);
        const shot = path.join(shots, `${testCase.object}-${testCase.context}-${testCase.field}-${view.framework}-390.png`);
        await page.screenshot({ path: shot, fullPage: true });
        await page.close();
        (readings[key] as Record<string, unknown>)[view.framework] = { ...reading, consoleErrors, pageErrors, shot: path.relative(out, shot) };
        console.log(`[s204-m02] ${key} ${view.framework}: ${reading.charactersRendered}/${reading.charactersInValue} chars, ${reading.clippedNodes} clipped`);
      }
    }
    fs.writeFileSync(path.join(out, 'long-text.json'), JSON.stringify({
      note: 'Defect (f) re-measured. charactersRendered is the count of characters of the value present in the page text; Sprint 203 m04 reported 1 for every row, the same number as nodesCarryingIt.',
      head, label, scope, producer: stamp, fixtures: Object.fromEntries(Object.entries(fixtures).map(([k, v]) => [k, { source: v.source, chars: v.chars ?? v.value?.length }])),
      readings,
    }, null, 2) + '\n');
  }
} finally {
  await browser.close();
  bridge.kill('SIGTERM');
}

/* ------------------------------------------------------------------ */
/*  The receipt                                                        */
/* ------------------------------------------------------------------ */

if (scope === 'touched' || scope === 'certify') {
  /**
   * A refusal is one of two very different things and they must not be added together.
   *
   * `design.preview` accepts seven contexts and `dashboard` is not among them, so a dashboard screen
   * cannot be opened in a browser through this tool at all. That is a CONTRACT LIMIT: it is stated,
   * the screens are named, and the schema-level readout is what covers them. Anything else is a real
   * failure, and the run ends non-zero rather than writing a receipt whose green numbers describe
   * only the part that happened to run.
   */
  const notPreviewable = failures.filter(entry => /must be one of/.test(entry));
  const unexpected = failures.filter(entry => !/must be one of/.test(entry));
  const totals = {
    cells: cells.length,
    screens: new Set(cells.map(c => c.screen)).size,
    screensPlanned: (scope === 'touched' ? touchedScreens().length : CERTIFY_OBJECTS.length * CONTEXTS.length),
    screensNotPreviewable: notPreviewable.length,
    screensFailed: unexpected.length,
    axeViolations: cells.reduce((sum, c) => sum + c.axe.reduce((n, v) => n + v.nodes, 0), 0),
    screensWithAxeViolations: new Set(cells.filter(c => c.axe.length).map(c => c.screen)).size,
    consoleErrors: cells.reduce((sum, c) => sum + c.consoleErrors.length, 0),
    pageErrors: cells.reduce((sum, c) => sum + c.pageErrors.length, 0),
    horizontalOverflowCells: cells.filter(c => c.horizontalOverflow > 0).length,
    clippedTextCells: cells.filter(c => c.clippedNodes > 0).length,
    belowFontFloorCells: cells.filter(c => c.belowFontFloor > 0).length,
    wallSeconds: Number(((performance.now() - started) / 1000).toFixed(1)),
  };
  const byRule = new Map<string, number>();
  for (const cell of cells) for (const violation of cell.axe) byRule.set(violation.id, (byRule.get(violation.id) ?? 0) + violation.nodes);
  fs.writeFileSync(path.join(out, `matrix-${scope}.json`), JSON.stringify({
    head, label, scope, producer: stamp, totals,
    axeByRule: Object.fromEntries([...byRule].sort()),
    notPreviewable: notPreviewable.map(entry => entry.split(':')[0]),
    notPreviewableReason: notPreviewable.length ? 'design.preview accepts detail, list, form, timeline, card, inline and workflow; these contexts are outside that enum and are covered by the schema-level readout instead' : undefined,
    failed: unexpected, cells,
  }, null, 2) + '\n');
  console.log(`[s204-m02] ${JSON.stringify(totals, null, 2)}`);
  if (byRule.size) console.log(`[s204-m02] axe by rule: ${JSON.stringify(Object.fromEntries(byRule))}`);
  if (notPreviewable.length) console.log(`[s204-m02] ${notPreviewable.length} screens outside design.preview's context enum: ${notPreviewable.map(e => e.split(':')[0]).join(', ')}`);
  if (unexpected.length) {
    console.error(`[s204-m02] ${unexpected.length} screens FAILED to render:\n  ${unexpected.join('\n  ')}`);
    process.exitCode = 1;
  }
}
console.log(`[s204-m02] wrote ${out}`);
