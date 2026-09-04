import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';
import { createServer } from 'vite';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = resolve(packageRoot, '../..');
const artifactRoot = resolve(repositoryRoot, 'artifacts/product-reality/sprint-182/m02/visual-regression');
const canonicalIds = [
  'Badge', 'Banner', 'Button', 'Card', 'Checkbox', 'DatePicker', 'Grid',
  'Input', 'Select', 'Stack', 'Table', 'Tabs', 'Text', 'Textarea',
];
const allCells = ['A-light', 'A-dark', 'A-hc', 'B-light', 'B-dark', 'B-hc'];
const reuseHighContrast = process.argv.includes('--reuse-hc');
const cellsArgument = process.argv.find((argument) => argument.startsWith('--cells='));
const cells = cellsArgument
  ? cellsArgument.slice('--cells='.length).split(',')
  : reuseHighContrast
    ? allCells.filter((cell) => !cell.endsWith('-hc'))
    : allCells;
const partialRun = cellsArgument !== undefined;
for (const cell of cells) {
  if (!allCells.includes(cell)) throw new Error(`Unknown visual cell: ${cell}`);
}
const highContrastOnly = partialRun
  && JSON.stringify(cells) === JSON.stringify(['A-hc', 'B-hc']);
const partialSlug = cells.join('--');
const reportName = highContrastOnly
  ? 'hc-report.json'
  : partialRun
    ? `partial-${partialSlug}-report.json`
    : 'report.json';
const browserStatusName = highContrastOnly
  ? 'hc-browser-status.json'
  : partialRun
    ? `partial-${partialSlug}-browser-status.json`
    : 'browser-status.json';
const responsiveWidths = [
  { name: 'phone', width: 375 },
  { name: 'tablet', width: 768 },
  { name: 'desktop', width: 1280 },
];
const reviewedScreenshotSha256 = Object.freeze({
  'react-A-light-desktop.png': 'b829bde8c66aad6159b835c1560e8aae86f54c4ad74767ac52dd5a7d4749f0ad',
  'react-A-dark-desktop.png': 'c9d4c27115c0a9737372003e201e3900426bca0af2f3756e8022a0311bae5669',
  'react-A-hc-desktop-full.png': '987830e65213e8bd2198d27616b56f730b929e31a7c52f1d2eaf1e15c36f6e07',
  'react-B-light-desktop.png': '9582bb1a8a65c2a014c94b128c5bbd8d2e44a94b637b92931b7bf0d2603d7c5b',
  'react-B-dark-desktop.png': '448deb5df8e15ecdd42f4e34283b26ecd08f5cb3d2221832d7cc9469b89d3691',
  'react-B-hc-desktop-full.png': '1020d9ca4b6c2ee51ce039f5881ef2f59043f9d33dbc23093831dc370b1e55ec',
  'react-responsive-phone-375.png': '8f18b316b1e2e761fcabf8ce2a19c3f5fcca67cc98b3a8e457d5292cc686afb9',
  'react-responsive-tablet-768.png': '56e452317e0e3b2b75b2c0d278eca9d520f77d8c12a5d2d3beaa09ec564a62af',
  'react-responsive-desktop-1280.png': 'c94dcaa4b1e0d6bcf38d2ff4f89c81e5947147ca64f36980b3045e300002685c',
});

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

async function screenshotDigest(path) {
  return sha256(await readFile(path));
}

async function pngDimensions(path) {
  const bytes = await readFile(path);
  assert(bytes.subarray(1, 4).toString('ascii') === 'PNG', `${path}: screenshot is not a PNG.`);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(
  reportName !== 'hc-report.json' || highContrastOnly,
  'Only the exact A-hc,B-hc partial scope may write hc-report.json.',
);
assert(
  browserStatusName !== 'hc-browser-status.json' || highContrastOnly,
  'Only the exact A-hc,B-hc partial scope may write hc-browser-status.json.',
);

await mkdir(artifactRoot, { recursive: true });

let server;
let browser;
let browserStarted = false;
try {
  server = await createServer({
    root: packageRoot,
    configFile: false,
    logLevel: 'error',
    server: { host: '127.0.0.1', port: 0, strictPort: false },
  });
  await server.listen();
  const address = server.httpServer?.address();
  assert(address && typeof address !== 'string', 'Vite did not expose a local browser-test port.');
  const origin = `http://127.0.0.1:${address.port}`;

  browser = await chromium.launch({ headless: true });
  browserStarted = true;
  const browserVersion = browser.version();
  await browser.close();
  browser = undefined;
  const highContrastReport = reuseHighContrast
    ? JSON.parse(await readFile(resolve(artifactRoot, 'hc-report.json'), 'utf8'))
    : undefined;
  if (reuseHighContrast) {
    assert(highContrastReport?.status === 'passed', 'Reusable high-contrast evidence is not passing.');
    assert(
      JSON.stringify(highContrastReport.scope) === JSON.stringify(['A-hc', 'B-hc']),
      'Reusable high-contrast evidence does not cover A-hc and B-hc.',
    );
    assert(highContrastReport.browser?.version === browserVersion, 'Reusable high-contrast browser version differs.');
  }
  const screenshots = reuseHighContrast ? [...highContrastReport.screenshots] : [];
  const tokenFingerprints = new Map();
  for (const screenshot of screenshots) {
    const fingerprint = `${screenshot.proof.themeSurfaceToken}|${screenshot.proof.themeTextToken}`;
    tokenFingerprints.set(fingerprint, [...(tokenFingerprints.get(fingerprint) ?? []), `${screenshot.brand}-${screenshot.theme}`]);
  }
  const visualFailures = [];
  const checkVisual = (condition, message) => {
    if (!condition) visualFailures.push(message);
  };

  for (const cell of cells) {
    browser = await chromium.launch({ headless: true });
    const [brand, theme] = cell.split('-');
    // Keep the complete desktop showcase inside one viewport. Chromium's full-page tiler can
    // otherwise capture stale paint chunks even when layout metrics are correct.
    const page = await browser.newPage({ viewport: { width: 1280, height: 1400 }, deviceScaleFactor: 1 });
    await page.emulateMedia({
      colorScheme: theme === 'dark' ? 'dark' : 'light',
      forcedColors: theme === 'hc' ? 'active' : 'none',
    });
    const browserErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') browserErrors.push(`console: ${message.text()}`);
    });
    page.on('pageerror', (error) => browserErrors.push(`page: ${error.message}`));
    await page.goto(`${origin}/test/visual.html?brand=${brand}&theme=${theme}`, { waitUntil: 'networkidle' });
    await page.locator('body[data-visual-ready="true"]').waitFor();
    await page.addStyleTag({
      content: '*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }',
    });

    const proof = await page.evaluate((expectedIds) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) throw new Error('Canvas color resolver unavailable.');
      const rgba = (color) => {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = '#010203';
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
        return [...context.getImageData(0, 0, 1, 1).data];
      };
      const luminance = ([red, green, blue]) => {
        const channels = [red, green, blue].map((value) => {
          const normalized = value / 255;
          return normalized <= 0.04045
            ? normalized / 12.92
            : ((normalized + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
      };
      const effectiveBackground = (element) => {
        let current = element;
        while (current) {
          const value = getComputedStyle(current).backgroundColor;
          const color = rgba(value);
          if (color[3] > 0) return { value, color };
          current = current.parentElement;
        }
        return { value: getComputedStyle(document.body).backgroundColor, color: rgba(getComputedStyle(document.body).backgroundColor) };
      };
      const colorPair = (selector) => {
        const element = document.querySelector(selector);
        if (!(element instanceof HTMLElement)) throw new Error(`Missing visual state ${selector}`);
        const foregroundValue = getComputedStyle(element).color;
        const foreground = rgba(foregroundValue);
        const background = effectiveBackground(element);
        const light = Math.max(luminance(foreground), luminance(background.color));
        const dark = Math.min(luminance(foreground), luminance(background.color));
        const rect = element.getBoundingClientRect();
        return {
          selector,
          text: element.textContent?.trim() ?? '',
          foreground: foregroundValue,
          background: background.value,
          textFillColor: getComputedStyle(element).webkitTextFillColor,
          forcedColorAdjust: getComputedStyle(element).forcedColorAdjust,
          contrastRatio: Number(((light + 0.05) / (dark + 0.05)).toFixed(2)),
          width: Number(rect.width.toFixed(2)),
          height: Number(rect.height.toFixed(2)),
        };
      };
      const ids = [...new Set(
        [...document.querySelectorAll('[data-oods-component]')]
          .map((element) => element.getAttribute('data-oods-component'))
          .filter(Boolean),
      )].sort();
      const rootStyle = getComputedStyle(document.documentElement);
      const bodyStyle = getComputedStyle(document.body);
      return {
        ids,
        expectedIds: [...expectedIds].sort(),
        brand: document.documentElement.dataset.brand,
        theme: document.documentElement.dataset.theme,
        surfaceToken: rootStyle.getPropertyValue('--sys-surface-canvas').trim(),
        textToken: rootStyle.getPropertyValue('--sys-text-primary').trim(),
        themeSurfaceToken: rootStyle.getPropertyValue('--theme-surface-canvas').trim(),
        themeTextToken: rootStyle.getPropertyValue('--theme-text-primary').trim(),
        bodyBackground: bodyStyle.backgroundColor,
        bodyColor: bodyStyle.color,
        stylesheetCount: document.styleSheets.length,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        states: {
          criticalBadge: colorPair('[data-oods-component="Badge"][data-status="past_due"]'),
          criticalBanner: colorPair('[data-oods-component="Banner"][data-status="past_due"]'),
          validationError: colorPair('.oods-field-error'),
          enabledButton: colorPair('[data-oods-component="Button"]:not(:disabled)'),
          disabledButton: colorPair('[data-oods-component="Button"]:disabled'),
          dismissButton: colorPair('.oods-banner__dismiss'),
        },
        geometry: (() => {
          const shell = document.querySelector('.visual-shell')?.getBoundingClientRect();
          const profile = document.querySelector('[data-oods-component="Card"]')?.getBoundingClientRect();
          const wide = document.querySelector('.visual-section--wide')?.getBoundingClientRect();
          const table = document.querySelector('[data-oods-component="Table"]')?.getBoundingClientRect();
          const fieldControls = [...document.querySelectorAll('.oods-field-control')];
          const tableCells = [...document.querySelectorAll('[data-oods-component="Table"] th, [data-oods-component="Table"] td')];
          return {
            shellWidth: shell?.width ?? 0,
            profileWidth: profile?.width ?? 0,
            wideSectionWidth: wide?.width ?? 0,
            tableWidth: table?.width ?? 0,
            minimumFieldControlWidth: Math.min(...fieldControls.map((control) => control.getBoundingClientRect().width)),
            minimumTableCellWidth: Math.min(...tableCells.map((cell) => cell.getBoundingClientRect().width)),
            clippedFieldControls: fieldControls.filter((control) => control.scrollWidth > control.clientWidth + 1).length,
            clippedTableCells: tableCells.filter((cell) => cell.scrollWidth > cell.clientWidth + 1).length,
          };
        })(),
      };
    }, canonicalIds);

    assert(JSON.stringify(proof.ids) === JSON.stringify(proof.expectedIds), `${cell}: canonical DOM set differs.`);
    assert(proof.brand === brand && proof.theme === theme, `${cell}: theme attributes differ.`);
    assert(
      proof.surfaceToken.length > 0
        && proof.textToken.length > 0
        && proof.themeSurfaceToken.length > 0
        && proof.themeTextToken.length > 0,
      `${cell}: token CSS did not resolve.`,
    );
    assert(proof.stylesheetCount > 0, `${cell}: shared CSS was not loaded.`);
    assert(proof.scrollWidth <= proof.clientWidth + 1, `${cell}: desktop content clips horizontally.`);
    assert(browserErrors.length === 0, `${cell}: ${browserErrors.join('; ')}`);
    for (const name of ['criticalBadge', 'criticalBanner', 'validationError']) {
      const state = proof.states[name];
      checkVisual(state.text.length > 0 && state.width > 0 && state.height > 0, `${cell}: ${name} is not visibly labeled.`);
      checkVisual(state.foreground !== state.background, `${cell}: ${name} foreground equals its background.`);
      checkVisual(state.contrastRatio >= 4.5, `${cell}: ${name} contrast is ${state.contrastRatio}:1.`);
    }
    const enabled = proof.states.enabledButton;
    checkVisual(enabled.text.length > 0 && enabled.width > 0 && enabled.height > 0, `${cell}: enabled Button label is not visible.`);
    checkVisual(enabled.foreground !== enabled.background, `${cell}: enabled Button foreground equals its background.`);
    checkVisual(enabled.contrastRatio >= 4.5, `${cell}: enabled Button contrast is ${enabled.contrastRatio}:1.`);
    const disabled = proof.states.disabledButton;
    checkVisual(disabled.text === 'Unavailable' && disabled.width > 0 && disabled.height > 0, `${cell}: disabled label is not visible.`);
    checkVisual(disabled.foreground !== disabled.background, `${cell}: disabled foreground equals its background.`);
    checkVisual(disabled.contrastRatio >= 1.2, `${cell}: disabled label is visually indistinguishable.`);
    const dismiss = proof.states.dismissButton;
    checkVisual(dismiss.text === '×' && dismiss.width <= 48 && dismiss.height <= 48, `${cell}: dismiss control is not a compact visible button.`);
    checkVisual(proof.geometry.shellWidth >= 1100, `${cell}: desktop showcase shell collapsed to ${proof.geometry.shellWidth}px.`);
    checkVisual(proof.geometry.profileWidth >= 300, `${cell}: profile column collapsed to ${proof.geometry.profileWidth}px.`);
    checkVisual(proof.geometry.wideSectionWidth >= 1000, `${cell}: wide data section collapsed to ${proof.geometry.wideSectionWidth}px.`);
    checkVisual(proof.geometry.tableWidth >= 1000, `${cell}: table collapsed to ${proof.geometry.tableWidth}px.`);
    checkVisual(proof.geometry.minimumFieldControlWidth >= 300, `${cell}: field control collapsed to ${proof.geometry.minimumFieldControlWidth}px.`);
    checkVisual(proof.geometry.minimumTableCellWidth >= 100, `${cell}: table cells collapsed to ${proof.geometry.minimumTableCellWidth}px.`);
    checkVisual(proof.geometry.clippedFieldControls === 0, `${cell}: ${proof.geometry.clippedFieldControls} field controls clip.`);
    checkVisual(proof.geometry.clippedTableCells === 0, `${cell}: ${proof.geometry.clippedTableCells} table cells clip.`);

    const fingerprint = `${proof.themeSurfaceToken}|${proof.themeTextToken}`;
    tokenFingerprints.set(fingerprint, [...(tokenFingerprints.get(fingerprint) ?? []), cell]);

    const overview = page.locator('[data-tab-id="overview"]');
    await overview.focus();
    await overview.press('ArrowRight');
    const profile = page.locator('[data-tab-id="profile"]');
    await profile.waitFor();
    assert(await profile.getAttribute('aria-selected') === 'true', `${cell}: ArrowRight did not select Profile.`);
    assert(await profile.evaluate((element) => element === document.activeElement), `${cell}: ArrowRight did not move focus.`);
    await page.locator('[data-oods-component="Input"]').first().focus();
    await page.locator('[data-oods-component="Button"]:not(:disabled)').first().hover();
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const postInteractionProof = await page.evaluate(() => {
      const shell = document.querySelector('.visual-shell')?.getBoundingClientRect();
      const profile = document.querySelector('[data-oods-component="Card"]')?.getBoundingClientRect();
      const wide = document.querySelector('.visual-section--wide')?.getBoundingClientRect();
      const table = document.querySelector('[data-oods-component="Table"]')?.getBoundingClientRect();
      const fieldControls = [...document.querySelectorAll('.oods-field-control')];
      const tableCells = [...document.querySelectorAll('[data-oods-component="Table"] th, [data-oods-component="Table"] td')];
      const visibleContent = (selector, expected, minimumWidth) => {
        const element = document.querySelector(selector);
        if (!(element instanceof HTMLElement)) throw new Error(`Missing completeness target ${selector}`);
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        const value = element instanceof HTMLInputElement
          || element instanceof HTMLSelectElement
          || element instanceof HTMLTextAreaElement
          ? element.value
          : element.textContent?.replace(/\s+/g, ' ').trim() ?? '';
        return {
          selector,
          expected,
          value,
          minimumWidth,
          width: Number(rect.width.toFixed(2)),
          height: Number(rect.height.toFixed(2)),
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
        };
      };
      return {
        geometry: {
          shellWidth: shell?.width ?? 0,
          profileWidth: profile?.width ?? 0,
          wideSectionWidth: wide?.width ?? 0,
          tableWidth: table?.width ?? 0,
          minimumFieldControlWidth: Math.min(...fieldControls.map((control) => control.getBoundingClientRect().width)),
          minimumTableCellWidth: Math.min(...tableCells.map((cell) => cell.getBoundingClientRect().width)),
          clippedFieldControls: fieldControls.filter((control) => control.scrollWidth > control.clientWidth + 1).length,
          clippedTableCells: tableCells.filter((cell) => cell.scrollWidth > cell.clientWidth + 1).length,
        },
        visualCompleteness: [
          visibleContent('.visual-mini-card h2', 'Account profile', 100),
          visibleContent('label[for="visual-email"]', 'Email', 40),
          visibleContent('#visual-email', 'invalid', 300),
          visibleContent('#visual-renewal', '2026-09-30', 300),
          visibleContent('#visual-plan', 'pro', 300),
          visibleContent('#visual-notes', 'Call before renewal', 300),
          visibleContent('label[for="visual-marketing"]', 'Product updates', 100),
          visibleContent('[role="tabpanel"]:not([hidden])', 'Contact and identity information.', 100),
          visibleContent('[data-oods-component="Table"] thead tr', 'NamePlanStatus', 1000),
          visibleContent('[data-oods-component="Table"] tbody tr:first-child', 'NorthwindEnterpriseActive', 1000),
          visibleContent('[data-oods-component="Table"] tbody tr:nth-child(2)', 'ContosoProPast due', 1000),
        ],
      };
    });
    proof.geometry = postInteractionProof.geometry;
    proof.visualCompleteness = postInteractionProof.visualCompleteness;
    checkVisual(proof.geometry.shellWidth >= 1100, `${cell}: post-interaction shell collapsed to ${proof.geometry.shellWidth}px.`);
    checkVisual(proof.geometry.profileWidth >= 300, `${cell}: post-interaction profile collapsed to ${proof.geometry.profileWidth}px.`);
    checkVisual(proof.geometry.wideSectionWidth >= 1000, `${cell}: post-interaction data section collapsed to ${proof.geometry.wideSectionWidth}px.`);
    checkVisual(proof.geometry.tableWidth >= 1000, `${cell}: post-interaction table collapsed to ${proof.geometry.tableWidth}px.`);
    checkVisual(proof.geometry.minimumFieldControlWidth >= 300, `${cell}: post-interaction field control collapsed to ${proof.geometry.minimumFieldControlWidth}px.`);
    checkVisual(proof.geometry.minimumTableCellWidth >= 100, `${cell}: post-interaction table cells collapsed to ${proof.geometry.minimumTableCellWidth}px.`);
    checkVisual(proof.geometry.clippedFieldControls === 0, `${cell}: ${proof.geometry.clippedFieldControls} post-interaction field controls clip.`);
    checkVisual(proof.geometry.clippedTableCells === 0, `${cell}: ${proof.geometry.clippedTableCells} post-interaction table cells clip.`);
    for (const target of proof.visualCompleteness) {
      checkVisual(
        target.value.toLowerCase().includes(target.expected.toLowerCase()),
        `${cell}: ${target.selector} does not contain ${JSON.stringify(target.expected)}.`,
      );
      checkVisual(
        target.width >= target.minimumWidth && target.height > 0,
        `${cell}: ${target.selector} collapsed to ${target.width}x${target.height}px.`,
      );
      checkVisual(
        target.display !== 'none' && target.visibility === 'visible' && Number(target.opacity) > 0,
        `${cell}: ${target.selector} is not visibly rendered.`,
      );
    }
    const documentHeight = await page.evaluate(() => Math.ceil(document.documentElement.scrollHeight));
    assert(documentHeight <= 1400, `${cell}: ${documentHeight}px document exceeds the 1400px capture viewport.`);
    proof.capture = { mode: 'single-viewport', viewportHeight: 1400, documentHeight };

    const fileName = !partialRun && theme === 'hc'
      ? `react-${cell}-desktop-full.png`
      : partialRun && !highContrastOnly
        ? `react-${cell}-desktop-partial.png`
        : `react-${cell}-desktop.png`;
    const path = resolve(artifactRoot, fileName);
    await page.screenshot({ path, caret: 'initial' });
    const screenshotSha256 = await screenshotDigest(path);
    if (!partialRun) {
      const expectedSha256 = reviewedScreenshotSha256[basename(path)];
      assert(expectedSha256, `${path}: no reviewed raster SHA is pinned.`);
      assert(
        screenshotSha256 === expectedSha256,
        `${path}: raster SHA ${screenshotSha256} differs from reviewed ${expectedSha256}.`,
      );
    }
    const dimensions = await pngDimensions(path);
    assert(dimensions.width === 1280 && dimensions.height >= 900, `${cell}: malformed ${dimensions.width}x${dimensions.height} screenshot.`);
    screenshots.push({
      kind: 'brand-theme-cell',
      brand,
      theme,
      width: 1280,
      path: path.slice(repositoryRoot.length + 1),
      sha256: screenshotSha256,
      dimensions,
      proof: { ...proof, reviewedShaMatched: partialRun ? undefined : true },
    });
    await page.close();
    await browser.close();
    browser = undefined;
  }

  const duplicateFingerprints = [...tokenFingerprints.values()]
    .filter((members) => members.length > 1)
    .map((members) => [...members].sort());
  if (!partialRun) {
    assert(
      JSON.stringify(duplicateFingerprints) === JSON.stringify([['A-hc', 'B-hc']]),
      `Only the intentionally brand-neutral HC token pair may match: ${JSON.stringify(duplicateFingerprints)}.`,
    );
  }

  for (const viewport of partialRun ? [] : responsiveWidths) {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: viewport.width, height: 960 }, deviceScaleFactor: 1 });
    await page.emulateMedia({ colorScheme: 'light', forcedColors: 'none' });
    const browserErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') browserErrors.push(`console: ${message.text()}`);
    });
    page.on('pageerror', (error) => browserErrors.push(`page: ${error.message}`));
    await page.goto(`${origin}/test/visual.html?brand=A&theme=light`, { waitUntil: 'networkidle' });
    await page.locator('body[data-visual-ready="true"]').waitFor();
    await page.addStyleTag({
      content: '*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }',
    });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    let captureHeight = await page.evaluate(() => Math.ceil(document.documentElement.scrollHeight));
    await page.setViewportSize({ width: viewport.width, height: captureHeight });
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    const settledHeight = await page.evaluate(() => Math.ceil(document.documentElement.scrollHeight));
    if (settledHeight > captureHeight) {
      captureHeight = settledHeight;
      await page.setViewportSize({ width: viewport.width, height: captureHeight });
      await page.evaluate(() => {
        window.scrollTo(0, 0);
        return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
    }
    assert(captureHeight <= 2400, `${viewport.name}: ${captureHeight}px document exceeds the responsive capture limit.`);
    const layout = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      visibleComponents: [...document.querySelectorAll('[data-oods-component]')]
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        }).length,
      scrollY: window.scrollY,
    }));
    assert(layout.scrollWidth <= layout.clientWidth + 1, `${viewport.name}: content clips horizontally.`);
    assert(layout.visibleComponents >= canonicalIds.length, `${viewport.name}: canonical content is missing.`);
    assert(layout.scrollY === 0, `${viewport.name}: capture did not settle at the document origin.`);
    assert(browserErrors.length === 0, `${viewport.name}: ${browserErrors.join('; ')}`);

    const path = resolve(artifactRoot, `react-responsive-${viewport.name}-${viewport.width}.png`);
    await page.screenshot({ path, caret: 'initial' });
    const screenshotSha256 = await screenshotDigest(path);
    const expectedSha256 = reviewedScreenshotSha256[basename(path)];
    assert(expectedSha256, `${path}: no reviewed raster SHA is pinned.`);
    assert(
      screenshotSha256 === expectedSha256,
      `${path}: raster SHA ${screenshotSha256} differs from reviewed ${expectedSha256}.`,
    );
    const dimensions = await pngDimensions(path);
    assert(
      dimensions.width === viewport.width && dimensions.height === captureHeight,
      `${viewport.name}: malformed ${dimensions.width}x${dimensions.height} screenshot.`,
    );
    screenshots.push({
      kind: 'responsive',
      brand: 'A',
      theme: 'light',
      width: viewport.width,
      path: path.slice(repositoryRoot.length + 1),
      sha256: screenshotSha256,
      dimensions,
      proof: {
        ...layout,
        capture: { mode: 'single-viewport', viewportHeight: captureHeight },
        reviewedShaMatched: true,
      },
    });
    await page.close();
    await browser.close();
    browser = undefined;
  }

  const passed = visualFailures.length === 0;
  const report = {
    schemaVersion: '1.0.0',
    generatedAt: new Date().toISOString(),
    mission: 's182-m02',
    target: 'react',
    scope: partialRun ? cells : 'all-six-cells-and-responsive',
    reusedHighContrastEvidence: reuseHighContrast ? 'hc-report.json' : undefined,
    status: passed ? 'passed' : 'failed',
    browser: { name: 'chromium', version: browserVersion, headless: true },
    cssEntry: '@oods/component-styles/css',
    canonicalIds,
    selected: screenshots.length,
    failed: passed ? 0 : 1,
    skipped: 0,
    failures: visualFailures,
    screenshots,
  };
  await writeFile(resolve(artifactRoot, reportName), `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(resolve(artifactRoot, browserStatusName), `${JSON.stringify({
    generatedAt: report.generatedAt,
    status: report.status,
    browser: report.browser,
    selected: screenshots.length,
    failed: report.failed,
    skipped: 0,
  }, null, 2)}\n`);
  if (passed) {
    process.stdout.write(`React visual evidence: ${screenshots.length} passed, 0 failed, 0 skipped (${browserVersion})\n`);
  } else {
    process.exitCode = 1;
    process.stderr.write(`React visual evidence failed: ${visualFailures.join('; ')}\n`);
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  await writeFile(resolve(artifactRoot, browserStatusName), `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    status: browserStarted ? 'failed' : 'environment-blocked',
    selected: 0,
    failed: 1,
    skipped: 0,
    reason: message,
  }, null, 2)}\n`);
  throw error;
} finally {
  await browser?.close();
  await server?.close();
}
