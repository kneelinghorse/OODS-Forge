/** Render the unmodified TraceLab frontend in scratch with fixed local API fixtures. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import net from 'node:net';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';

const root = path.resolve(import.meta.dirname, '../..');
const out = path.join(root, 'artifacts/product-reality/sprint-197/m06');
const repin = path.join(out, 'tracelab-repin');
const sheets = path.join(out, 'side-by-side');
const palette = process.argv[2]; assert(['before', 'after'].includes(palette));
const scratch = JSON.parse(await fs.readFile(path.join(repin, 'scratch.json'), 'utf8'));
const frontend = scratch.frontend;
assert(path.basename(scratch.scratch).startsWith('oods-s197-tracelab-'));
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const sha = value => createHash('sha256').update(value).digest('hex');
const json = value => JSON.stringify(value, null, 2) + '\n';
const packages = [];
for (const name of ['tokens', 'tw-variants']) {
  const archive = path.join(palette === 'before' ? path.join(scratch.scratch, 'old-vendor') : repin, `oods-${name}-0.1.0.tgz`);
  const target = path.join(frontend, 'node_modules/@oods', name);
  // The clean-install proof is retained separately. Select exact package bytes
  // for each visual worker without resolving any dependency or changing source.
  await fs.rm(target, { recursive: true, force: true }); await fs.mkdir(target, { recursive: true });
  execFileSync('tar', ['-xzf', archive, '--strip-components', '1', '-C', target]);
  packages.push({ name: `@oods/${name}`, archive: path.relative(root, archive), sha256: sha(await fs.readFile(archive)) });
}
const source = JSON.parse(await fs.readFile(path.join(repin, 'source-before.json'), 'utf8'));
for (const [file, hash] of Object.entries(source.frontendFiles)) {
  if (file === 'frontend/package-lock.json' || file.startsWith('frontend/vendor/')) continue;
  assert.equal(sha(await fs.readFile(path.join(scratch.scratch, file))), hash, `Scratch source changed: ${file}`);
}
// npm tarballs use normalized mtimes and unchanged package versions. Clear the
// scratch compiler cache so a new worker cannot reuse the other palette's CSS.
await fs.rm(path.join(frontend, '.next'), { recursive: true, force: true });
const cssPath = path.join(frontend, 'node_modules/@oods/tokens/dist/css/tokens.css');
const cssHash = sha(await fs.readFile(cssPath));
if (palette === 'after') assert.equal(cssHash, JSON.parse(await fs.readFile(path.join(repin, 'oods-provenance.json'), 'utf8')).clean_install_smoke.installed_css_sha256);
const at = '2026-09-08T12:00:00Z';
const mission = { id: 'mission-palette', project_id: 'project-palette', project_name: 'Research workspace', mission_id: 'VIS-001',
  title: 'Review the evidence trail', objective: 'Compare the sources behind the current findings and record the remaining questions.',
  success_criteria: ['Each finding links to a retained source.', 'Uncertainty is visible in the final report.'], context: {},
  deliverables: ['A source-linked findings report', 'An evidence ledger with review notes'], research_phases: {}, tags: ['evidence', 'review'], metadata: {},
  status: 'completed', queued_at: '2026-09-07T09:00:00Z', started_at: '2026-09-07T09:10:00Z', completed_at: '2026-09-07T10:20:00Z',
  deepsearch_job_id: null, execution_metadata: {}, result_document_ids: [], result_report_id: null,
  result_markdown: '## Findings\n\nThree source records support the current direction. One claim remains open for review.\n\n- Retain the source and its date.\n- Separate observations from conclusions.\n- Revisit conflicting evidence before closing the question.',
  result_protocol: null, error_message: null, created_at: '2026-09-07T09:00:00Z', updated_at: '2026-09-07T10:20:00Z', created_by: 'palette-reviewer' };
const project = { id: 'project-palette', name: 'Research workspace', description: 'A deterministic local visual fixture.', created_at: at, updated_at: at, status: 'active' };
const homeMission = { id: mission.id, mission_id: mission.mission_id, title: mission.title, status: 'completed', updated_at: mission.updated_at,
  started_at: mission.started_at, completed_at: mission.completed_at, reason: 'unreviewed', progress: { phase: 'review', percent: 100, current_step: 3, total_steps: 3 },
  report_id: null, evidence_count: 3, evidence_href: '/evidence?project_id=project-palette' };
const ledger = { entry_total: 3, page: 1, page_size: 20, entries: [
  ['supporting', 'Readers need a clear route back to the original source.', 'Source links and dates make the reasoning inspectable.'],
  ['background', 'The current work spans several connected research questions.', 'Keep the relationship between each claim and its mission visible.'],
  ['contradicting', 'One source reports a different sequence of events.', 'This finding needs a follow-up before it can be treated as settled.'],
].map(([disposition, claim, summary], i) => ({ id: `evidence-${i}`, project_id: project.id, mission_id: mission.id, session_key: 'visual-seed-197', claim, summary,
  source_url: `https://example.test/research/source-${i + 1}`, source_sighting_count: i + 1, disposition, tags: ['visual-fixture'], created_at: at })) };
const fixture = {
  '/auth/me': { user_id: 'palette-reviewer', email: 'reviewer@example.test', display_name: 'Reviewer', role: 'admin' },
  '/home': { generated_at: at, refresh_seconds: 30, stalled_after_seconds: 3600, missions: { total: 12, by_status: { completed: 9, in_progress: 2, blocked: 1 } },
    attention: { total: 1, items: [homeMission] }, active_runs: { total: 1, items: [{ ...homeMission, id: 'active-fixture', mission_id: 'VIS-002', title: 'Map the remaining questions', status: 'in_progress', completed_at: null, reason: null, progress: { phase: 'gathering', percent: 60, current_step: 3, total_steps: 5 } }] },
    recent_reports: { total: 1, items: [{ id: 'report-fixture', title: 'Source review — working findings', updated_at: at, href: '/reports/report-fixture' }] },
    recent_projects: { total: 1, items: [{ id: project.id, title: project.name, updated_at: at, href: `/projects/${project.id}` }] },
    evidence_activity: { total: 1, items: [{ project_id: project.id, mission_id: mission.id, session_key: 'visual-seed-197', origin: 'local visual fixture', entry_count: 3, last_created_at: at, href: `/evidence?project_id=${project.id}` }] } },
  '/projects': { data: [project], pagination: { page: 1, page_size: 20, total: 1, pages: 1 } },
  '/missions': { data: [mission], pagination: { page: 1, page_size: 20, total: 1, pages: 1 } },
  '/missions/mission-palette': mission, '/missions/mission-palette/logs': [], '/evidence': ledger,
};
const fixtureBytes = json(fixture), fixturePath = path.join(sheets, 'tracelab-fixture.json');
if (palette === 'before') await fs.writeFile(fixturePath, fixtureBytes);
else assert.equal(await fs.readFile(fixturePath, 'utf8'), fixtureBytes, 'Visual fixture changed between palettes');
const socket = net.createServer(); await new Promise(resolve => socket.listen(0, '127.0.0.1', resolve));
const port = socket.address().port; await new Promise(resolve => socket.close(resolve));
const url = `http://127.0.0.1:${port}`;
const serverLog = await fs.open(path.join(sheets, `tracelab-${palette}.server.log`), 'w');
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--webpack', '--hostname', '127.0.0.1', '--port', String(port)],
  { cwd: frontend, env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1', NEXT_PUBLIC_API_BASE_URL: url, NEXT_PUBLIC_API_PREFIX: '/api/v1' }, stdio: ['ignore', serverLog.fd, serverLog.fd] });
const browser = await chromium.launch({ headless: true });
const rows = [];
try {
  for (let attempt = 0; ; attempt++) {
    assert(attempt < 120 && server.exitCode === null, 'Scratch Next server failed to start');
    try { await fetch(url, { signal: AbortSignal.timeout(2000) }); break; } catch { await new Promise(resolve => setTimeout(resolve, 250)); }
  }
  for (const [pageName, route, readyText] of [['Home', '/', 'Map the remaining questions'], ['Evidence', '/evidence?project_id=project-palette', ledger.entries[0].claim], ['Mission', '/missions/mission-palette', mission.title]]) {
    for (const theme of ['light', 'dark']) for (const width of [390, 820, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 1080 }, locale: 'en-US', timezoneId: 'UTC', colorScheme: theme, reducedMotion: 'reduce' });
      const errors = [], requests = [], unexpected = []; page.on('pageerror', error => errors.push(error.message));
      await page.clock.install({ time: new Date(at) });
      await page.addInitScript(({ theme }) => {
        localStorage.setItem('tracelab.auth.v2', JSON.stringify({ token: 'local-visual-fixture', user_id: 'palette-reviewer', email: 'reviewer@example.test', display_name: 'Reviewer' }));
        localStorage.setItem('tracelab.theme.v1:palette-reviewer', theme);
      }, { theme });
      await page.route('**/api/v1/**', async request => {
        const key = new URL(request.request().url()).pathname.replace('/api/v1', '');
        requests.push({ method: request.request().method(), path: key });
        if (request.request().method() !== 'GET' || !Object.hasOwn(fixture, key)) { unexpected.push(requests.at(-1)); await request.abort(); return; }
        await request.fulfill({ json: fixture[key] });
      });
      await page.goto(url + route, { timeout: 60_000 });
      await page.getByText(readyText, { exact: true }).first().waitFor();
      await page.waitForLoadState('networkidle');
      await page.evaluate(() => document.fonts.ready);
      const observed = await page.evaluate(() => ({ brand: document.documentElement.dataset.brand, theme: document.documentElement.dataset.theme,
        background: getComputedStyle(document.body).backgroundColor, text: document.body.innerText,
        overflow: document.documentElement.scrollWidth > innerWidth, font: getComputedStyle(document.querySelector('h1')).fontFamily }));
      assert.equal(observed.brand, 'A'); assert.equal(observed.theme, theme); assert.deepEqual(errors, []); assert.deepEqual(unexpected, []);
      const file = `tracelab/${pageName}-${theme}-${width}-${palette}.png`; await fs.mkdir(path.dirname(path.join(sheets, file)), { recursive: true });
      await page.screenshot({ path: path.join(sheets, file), fullPage: true, animations: 'disabled' });
      rows.push({ id: `TraceLab-${pageName}-${theme}-${width}`, object: 'TraceLab', context: pageName, theme, brand: 'A', width, palette, file,
        sha256: sha(await fs.readFile(path.join(sheets, file))), fixtureSha256: sha(fixtureBytes), sourceHead: source.head,
        observed: { ...observed, text: undefined, textSha256: sha(observed.text) }, requests, errors });
      await page.close(); console.log(JSON.stringify({ pageName, theme, width, palette }));
    }
  }
  await fs.writeFile(path.join(sheets, `tracelab-${palette}.json`), json({ rows, packages, cssSha256: cssHash, sourceHead: source.head,
    fixtureSha256: sha(fixtureBytes), clock: at, builderSelfCertified: false, sourcePolicy: 'Unmodified frontend source; synthetic local GET responses; exact old/new token and variant tarballs materialized in scratch after a separate verified clean install.' }));
} finally {
  await browser.close(); const ended = once(server, 'exit'); server.kill('SIGTERM'); await ended; await serverLog.close();
}
