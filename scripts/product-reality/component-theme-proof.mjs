import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { census, contractFailures } from './s192-token-resolution.mjs';

// Shared by the React and Vue test:visual entry points. No per-framework allowance.
export async function runComponentThemeProof({ framework, packageRoot, canonicalIds, supportedCells, contracts, createServer, chromium }) {
  const repositoryRoot = resolve(packageRoot, '../..');
  const argument = name => process.argv.find(value => value.startsWith(`--${name}=`))?.slice(name.length + 3);
  const output = resolve(repositoryRoot, argument('output') ?? `artifacts/product-reality/sprint-192/m04/${framework}`);
  const selected = argument('cells')?.split(',') ?? supportedCells.map(cell => `${cell.brand}-${cell.theme}`);
  const cells = supportedCells.filter(cell => selected.includes(`${cell.brand}-${cell.theme}`));
  assert.equal(new Set(selected).size, selected.length, 'Duplicate theme cell');
  assert.equal(cells.length, selected.length, 'Unknown theme cell');
  const tokenReport = census();
  assert.deepEqual(contractFailures(tokenReport, 14), [], 'Static token-resolution contract');
  await mkdir(output, { recursive: true });
  const server = await createServer({ root: packageRoot, configFile: false, logLevel: 'error', server: { host: '127.0.0.1', port: 0 } });
  let browser;
  const results = []; const failures = [];
  try {
    await server.listen();
    browser = await chromium.launch({ headless: true });
    const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
    for (const { brand, theme } of cells) {
      const cell = `${brand}-${theme}`;
      const errors = [];
      const page = await browser.newPage({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 1,
        colorScheme: theme === 'dark' || theme === 'hc' ? 'dark' : 'light', forcedColors: theme === 'hc' ? 'active' : 'none' });
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      await page.clock.setFixedTime(new Date('2026-09-10T12:00:00Z'));
      await page.goto(`${origin}/test/visual.html?brand=${brand}&theme=${theme}`, { waitUntil: 'networkidle' });
      await page.locator('body[data-visual-ready="true"]').waitFor();
      const proof = await page.evaluate(({ ids, contracts, theme }) => {
        const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        const rgba = value => {
          context.clearRect(0, 0, 1, 1); context.fillStyle = '#010203'; context.fillStyle = value;
          context.fillRect(0, 0, 1, 1); return [...context.getImageData(0, 0, 1, 1).data].map((v, i) => i === 3 ? v / 255 : v);
        };
        const over = (foreground, background) => foreground.slice(0, 3).map((v, i) => v * foreground[3] + background[i] * (1 - foreground[3])).concat(1);
        const background = element => {
          const chain = []; for (let current = element; current; current = current.parentElement) chain.unshift(current);
          return chain.reduce((paint, node) => over(rgba(getComputedStyle(node).backgroundColor), paint), [255, 255, 255, 1]);
        };
        const luminance = color => color.slice(0, 3).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
        const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + .05) / (Math.min(luminance(a), luminance(b)) + .05);
        const visible = element => element.getClientRects().length > 0 && getComputedStyle(element).visibility === 'visible' && !element.closest('[aria-hidden="true"]');
        const probe = document.createElement('span'); document.body.append(probe);
        const resolved = (property, value) => { probe.style.cssText = ''; probe.style.setProperty(property, value); return getComputedStyle(probe).getPropertyValue(property); };
        const rootStyle = getComputedStyle(document.documentElement);
        const tokens = Object.fromEntries(['--sys-surface-canvas', '--sys-text-primary', '--sys-surface-raised', '--sys-focus-ring'].map(name => [name, rootStyle.getPropertyValue(name).trim()]));
        const tokenBackground = resolved('background-color', 'var(--sys-surface-canvas)');
        const tokenForeground = resolved('color', 'var(--sys-text-primary)');
        probe.remove();
        const rows = ids.map(id => {
          const section = document.querySelector(`[data-scenario="${id}"]`);
          const component = section?.querySelector(`[data-oods-component="${id}"]`);
          if (!component) return { componentId: id, missing: true, pairs: [], controls: [], systemColours: [] };
          const associated = [...(component.labels ?? []), ...(component.getAttribute('aria-describedby')?.split(/\s+/).map(id => document.getElementById(id)).filter(Boolean) ?? [])];
          const elements = [...new Set([component, ...component.querySelectorAll('*'), ...associated.flatMap(label => [label, ...label.querySelectorAll('*')])])].filter(visible);
          const pairs = elements.flatMap((element, index) => {
            const text = [...element.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).map(node => node.textContent).join('').trim();
            const value = element.matches('input:not([type="checkbox"]),textarea,select') ? element.value || element.getAttribute('placeholder') || '' : '';
            if (!text && !value) return [];
            const style = getComputedStyle(element); const bg = background(element); const fg = rgba(style.color);
            let opacity = 1; for (let current = element; current; current = current.parentElement) opacity *= Number(getComputedStyle(current).opacity);
            fg[3] *= opacity;
            const painted = over(fg, bg);
            const ruleId = element.closest('button,a,input,select,textarea,[role="tab"]') ? 'text-on-interactive'
              : element.closest('.oods-badge,.oods-banner') ? 'status-text' : 'text-on-surface';
            return [{ element: `${element.tagName.toLowerCase()}[${index}]`, text: text || value, ruleId, foreground: style.color,
              background: bg, opacity, ratio: Number(contrast(painted, bg).toFixed(3)), visible: fg[3] > 0 && contrast(painted, bg) > 1 }];
          });
          const controls = [];
          if (Object.keys(contracts[id].keyboard ?? {}).length) {
            const control = section.querySelector(contracts[id].name.target);
            control?.focus();
            if (control) {
              const style = getComputedStyle(control);
              const outlined = style.outlineStyle !== 'none' && Number.parseFloat(style.outlineWidth) > 0;
              const shadow = style.boxShadow.match(/(?:rgba?|oklch|color)\([^)]+\)/)?.[0];
              const value = outlined ? style.outlineColor : shadow ?? 'transparent';
              const bg = background(control.parentElement);
              controls.push({ ruleId: 'focus-ring', target: contracts[id].name.target, focused: document.activeElement === control,
                outline: style.outline, boxShadow: style.boxShadow, foreground: value, background: bg,
                ratio: Number(contrast(over(rgba(value), bg), bg).toFixed(3)), visible: outlined || Boolean(shadow) });
              control.blur();
            }
          }
          const systemColours = elements.flatMap(element => ['color', 'background-color', 'border-top-color', 'outline-color'].flatMap(property =>
            /^(?:Canvas|CanvasText|Highlight|HighlightText|GrayText|ButtonFace|ButtonText|Field|FieldText)$/i.test(getComputedStyle(element).getPropertyValue(property).trim()) ? [{ element: element.tagName, property }] : []));
          const rect = component.getBoundingClientRect();
          return { componentId: id, width: rect.width, height: rect.height, pairs, controls, systemColours };
        });
        return { ids: [...document.querySelectorAll('[data-scenario]')].map(node => node.dataset.scenario),
          brand: document.documentElement.dataset.brand, theme: document.documentElement.dataset.theme,
          forcedColours: matchMedia('(forced-colors: active)').matches, tokens, tokenBackground, tokenForeground,
          bodyBackground: getComputedStyle(document.body).backgroundColor, bodyForeground: getComputedStyle(document.body).color,
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1, rows };
      }, { ids: canonicalIds, contracts, theme });
      const cellFailures = [];
      const check = (ok, message) => { if (!ok) cellFailures.push(`${framework}/${cell}: ${message}`); };
      check(JSON.stringify(proof.ids) === JSON.stringify(canonicalIds), 'canonical root set differs');
      check(proof.brand === brand && proof.theme === theme, `theme attributes differ: actual ${proof.brand}/${proof.theme}`);
      check(proof.forcedColours === (theme === 'hc'), 'forced-colours media differs');
      check(Object.values(proof.tokens).every(value => value.length), 'semantic token is undefined');
      check(proof.bodyBackground === proof.tokenBackground && proof.bodyForeground === proof.tokenForeground, 'canvas does not use resolved semantic tokens');
      check(!proof.overflow, 'page overflows horizontally');
      check(errors.length === 0, `browser errors ${errors.join('; ')}`);
      for (const row of proof.rows) {
        check(!row.missing && row.width > 0 && row.height > 0 && row.pairs.length > 0, `${row.componentId}: root/text is missing or invisible`);
        for (const pair of row.pairs) check(theme === 'hc' ? pair.visible : pair.ratio >= 4.5,
          `${row.componentId} ${pair.ruleId} ${pair.element} (${pair.text}): ${pair.ratio}:1`);
        check(row.controls.length === (Object.keys(contracts[row.componentId].keyboard ?? {}).length ? 1 : 0), `${row.componentId}: focus target is missing`);
        for (const control of row.controls) check(control.focused && control.visible && (theme === 'hc' ? control.ratio > 1 : control.ratio >= 3),
          `${row.componentId} ${control.ruleId}: ${control.ratio}:1, visible=${control.visible}`);
        if (theme !== 'hc') check(row.systemColours.length === 0, `${row.componentId}: computed system colour`);
      }
      const screenshot = `${framework}-${cell}.png`;
      await page.screenshot({ path: resolve(output, screenshot), fullPage: true, animations: 'disabled' });
      const screenshotSha256 = createHash('sha256').update(await readFile(resolve(output, screenshot))).digest('hex');
      results.push({ cell, brand, theme, status: cellFailures.length ? 'failed' : 'passed', screenshot, screenshotSha256, ...proof, errors, failures: cellFailures });
      failures.push(...cellFailures); await page.close();
    }
    const report = { schemaVersion: '1.0.0', mission: 's192-m04', target: framework, status: failures.length ? 'failed' : 'passed',
      generatedAt: new Date().toISOString(), browser: { name: 'chromium', version: browser.version() }, canonicalIds,
      selected: results.length, rootCells: canonicalIds.length * results.length, failed: failures.length, skipped: 0, failures, cells: results };
    await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(`${framework}: ${report.rootCells} root-cells, ${failures.length} failures, 0 skipped`);
    if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
  } finally { await browser?.close(); await server.close(); }
}
