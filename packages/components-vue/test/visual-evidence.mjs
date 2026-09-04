import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';
import { createServer } from 'vite';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = resolve(packageRoot, '../..');
const artifactRoot = resolve(repositoryRoot, 'artifacts/product-reality/sprint-182/m03/visual-regression');
const canonicalIds = [
  'Badge', 'Banner', 'Button', 'Card', 'Checkbox', 'DatePicker', 'Grid',
  'Input', 'Select', 'Stack', 'Table', 'Tabs', 'Text', 'Textarea',
];
const allCells = ['A-light', 'A-dark', 'A-hc', 'B-light', 'B-dark', 'B-hc'];
const cellsArgument = process.argv.find((argument) => argument.startsWith('--cells='));
const cells = cellsArgument ? cellsArgument.slice('--cells='.length).split(',') : allCells;
const partialRun = cellsArgument !== undefined;
for (const cell of cells) {
  if (!allCells.includes(cell)) throw new Error(`Unknown visual cell: ${cell}`);
}
const frozenHighContrastScope = partialRun
  && JSON.stringify(cells) === JSON.stringify(['A-hc', 'B-hc']);
const partialSlug = cells.join('--');
const reportName = !partialRun
  ? 'report.json'
  : frozenHighContrastScope
    ? 'hc-report.json'
    : `partial-${partialSlug}-report.json`;
const browserStatusName = !partialRun
  ? 'browser-status.json'
  : frozenHighContrastScope
    ? 'hc-browser-status.json'
    : `partial-${partialSlug}-browser-status.json`;
const responsiveWidths = [
  { name: 'phone', width: 375 },
  { name: 'tablet', width: 768 },
  { name: 'desktop', width: 1280 },
];
const reviewedScreenshotSha256 = Object.freeze({
  'vue-A-light-desktop.png': '46ba92a085ee89de0bcb70f2096397bf18eff55ec97726dd67d6cb26dee0f6d4',
  'vue-A-dark-desktop.png': 'a819be6e799fbc4cc148af110ddb4534ff71750ec6744bb7673d46aaf48a887c',
  'vue-A-hc-desktop-full.png': 'd2457e879e01f50a3b128ce198cbeb0cba9b7c6ce81a05b5dc819b27e8d5b29d',
  'vue-B-light-desktop.png': '7577934a1bacd8eda4a6cf5ea17b4e52a50774c5c3a45d3a4506f688b30600e6',
  'vue-B-dark-desktop.png': '398b1ba7efc2117040e7b71e89e466e78628e5e5af633c9d3890753abfc0fc3b',
  'vue-B-hc-desktop-full.png': 'e354a1360530d76c8263fd53647a2c838567dfa1af501bb46c544354912db62a',
  'vue-responsive-phone-375.png': 'd348ecb87b0b28e31a128840d1e43656317b7df8c2c8f2a9661f60941280e019',
  'vue-responsive-tablet-768.png': '5c6135b933d567aee2b6192042801a3232d8add46e3d2ae1cafcf436279f6520',
  'vue-responsive-desktop-1280.png': '4bfd0c251ce6bf534a6ed59b709bfd2c68decd17235e535a212baffd2906e7a4',
});
const evidenceInputPaths = [
  'packages/component-styles/dist/components.css',
  'packages/components-vue/package.json',
  'packages/components-vue/src/fields.ts',
  'packages/components-vue/src/index.ts',
  'packages/components-vue/src/primitives.ts',
  'packages/components-vue/src/table.ts',
  'packages/components-vue/src/tabs.ts',
  'packages/components-vue/src/types.ts',
  'packages/components-vue/test/visual-app.ts',
  'packages/components-vue/test/visual.css',
  'packages/components-vue/test/visual-evidence.mjs',
];

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

async function screenshotDigest(path) {
  return sha256(await readFile(path));
}

async function evidenceInputDigests() {
  return Promise.all(evidenceInputPaths.map(async (path) => ({
    path,
    sha256: sha256(await readFile(resolve(repositoryRoot, path))),
  })));
}

async function pngDimensions(path) {
  const bytes = await readFile(path);
  assert(bytes.subarray(1, 4).toString('ascii') === 'PNG', `${path}: screenshot is not a PNG.`);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

async function settlePage(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolvePaint) => {
      requestAnimationFrame(() => requestAnimationFrame(resolvePaint));
    });
  });
}

async function captureStableScreenshot(page, path) {
  await settlePage(page);
  const capture = await page.evaluate(() => {
    return {
      mode: 'single-viewport',
      documentHeight: Math.ceil(document.documentElement.scrollHeight),
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      scrollY: window.scrollY,
    };
  });
  assert(capture.scrollY === 0, `${path}: capture viewport is scrolled.`);
  assert(
    capture.documentHeight <= capture.viewportHeight,
    `${path}: ${capture.documentHeight}px document exceeds ${capture.viewportHeight}px viewport.`,
  );
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
  return {
    freshProcessCapture: true,
    singleViewportCapture: true,
    postInteractionRepaint: true,
    ...capture,
    reviewedShaMatched: partialRun ? undefined : true,
    sha256: screenshotSha256,
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(
  reportName !== 'hc-report.json' || frozenHighContrastScope,
  'Only the exact A-hc,B-hc partial scope may write hc-report.json.',
);
assert(
  browserStatusName !== 'hc-browser-status.json' || frozenHighContrastScope,
  'Only the exact A-hc,B-hc partial scope may write hc-browser-status.json.',
);

await mkdir(artifactRoot, { recursive: true });

const inProgressEvidence = {
  schemaVersion: '1.0.0',
  generatedAt: new Date().toISOString(),
  mission: 's182-m03',
  target: 'vue',
  status: 'failed',
  selected: 0,
  failed: 1,
  skipped: 0,
  reason: 'Capture is in progress; no visual evidence is accepted yet.',
};
await writeFile(resolve(artifactRoot, reportName), `${JSON.stringify(inProgressEvidence, null, 2)}\n`);
await writeFile(resolve(artifactRoot, browserStatusName), `${JSON.stringify(inProgressEvidence, null, 2)}\n`);

let server;
let browser;
let browserStarted = false;
let completedReport;
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

  let browserVersion;
  const openIsolatedPage = async (width, height = 1400) => {
    browser = await chromium.launch({ headless: true, args: ['--disable-gpu'] });
    browserStarted = true;
    browserVersion ??= browser.version();
    return browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  };
  const closeIsolatedPage = async (page) => {
    await page.close();
    await browser?.close();
    browser = undefined;
  };
  const screenshots = [];
  const tokenFingerprints = new Map();
  const visualFailures = [];
  const checkVisual = (condition, message) => {
    if (!condition) visualFailures.push(message);
  };

  for (const cell of cells) {
    const [brand, theme] = cell.split('-');
    const page = await openIsolatedPage(1280);
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
      const normalizedText = (element) => element?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
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
          dismissButton: colorPair('.oods-banner-dismiss'),
        },
        content: {
          pageTitle: normalizedText(document.querySelector('.visual-header h1')),
          sectionHeadings: [...document.querySelectorAll('.visual-section > h2, .visual-mini-card > h2')]
            .map(normalizedText),
          fieldLabels: [...document.querySelectorAll('.visual-mini-card label')].map(normalizedText),
          fieldValues: ['visual-email', 'visual-renewal', 'visual-plan', 'visual-notes']
            .map((id) => document.getElementById(id))
            .map((control) => control instanceof HTMLInputElement
              || control instanceof HTMLSelectElement
              || control instanceof HTMLTextAreaElement
              ? control.value
              : ''),
          validationError: normalizedText(document.querySelector('.oods-field-error')),
          actionLabels: [...document.querySelectorAll('.visual-actions [data-oods-component="Button"], .oods-banner-actions [data-oods-component="Button"]')]
            .map(normalizedText),
          tabLabels: [...document.querySelectorAll('[data-tab-id]')].map(normalizedText),
          tableCaption: normalizedText(document.querySelector('[data-oods-component="Table"] caption')),
          tableHeaders: [...document.querySelectorAll('[data-oods-component="Table"] th')].map(normalizedText),
          tableRows: [...document.querySelectorAll('[data-oods-component="Table"] tbody tr')]
            .map((row) => [...row.querySelectorAll('th, td')].map(normalizedText).join(' ')),
          footer: normalizedText(document.querySelector('.visual-footer')),
        },
        geometry: (() => {
          const shell = document.querySelector('.visual-shell')?.getBoundingClientRect();
          const profile = document.querySelector('[data-oods-component="Card"]')?.getBoundingClientRect();
          const wide = document.querySelector('.visual-section--wide')?.getBoundingClientRect();
          const table = document.querySelector('[data-oods-component="Table"]')?.getBoundingClientRect();
          const cells = [...document.querySelectorAll('[data-oods-component="Table"] th, [data-oods-component="Table"] td')];
          return {
            shellWidth: shell?.width ?? 0,
            profileWidth: profile?.width ?? 0,
            wideSectionWidth: wide?.width ?? 0,
            tableWidth: table?.width ?? 0,
            minimumTableCellWidth: Math.min(...cells.map((cell) => cell.getBoundingClientRect().width)),
            clippedTableCells: cells.filter((cell) => cell.scrollWidth > cell.clientWidth + 1).length,
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
    assert(proof.content.pageTitle === 'Account operations', `${cell}: page title is incomplete.`);
    assert(
      JSON.stringify(proof.content.sectionHeadings) === JSON.stringify(['Status and actions', 'Account profile', 'Navigation and data']),
      `${cell}: section headings are incomplete: ${JSON.stringify(proof.content.sectionHeadings)}.`,
    );
    assert(
      JSON.stringify(proof.content.fieldLabels) === JSON.stringify(['Email', 'Renewal date', 'Plan', 'Notes', 'Product updates']),
      `${cell}: field labels are incomplete: ${JSON.stringify(proof.content.fieldLabels)}.`,
    );
    assert(
      JSON.stringify(proof.content.fieldValues) === JSON.stringify(['invalid', '2026-09-30', 'pro', 'Call before renewal']),
      `${cell}: field values are incomplete: ${JSON.stringify(proof.content.fieldValues)}.`,
    );
    assert(proof.content.validationError === 'Enter a valid email', `${cell}: validation label is incomplete.`);
    assert(
      JSON.stringify(proof.content.actionLabels) === JSON.stringify(['Update card', 'Save changes', 'Unavailable']),
      `${cell}: action labels are incomplete: ${JSON.stringify(proof.content.actionLabels)}.`,
    );
    assert(
      JSON.stringify(proof.content.tabLabels) === JSON.stringify(['Overview', 'Profile', 'Security', 'Billing', 'Activity']),
      `${cell}: tab labels are incomplete: ${JSON.stringify(proof.content.tabLabels)}.`,
    );
    assert(proof.content.tableCaption === 'Subscriptions', `${cell}: table caption is incomplete.`);
    assert(
      JSON.stringify(proof.content.tableHeaders) === JSON.stringify(['Name', 'Plan', 'Status', 'Actions']),
      `${cell}: table headers are incomplete: ${JSON.stringify(proof.content.tableHeaders)}.`,
    );
    assert(
      JSON.stringify(proof.content.tableRows) === JSON.stringify(['Northwind Enterprise Active Open', 'Contoso Pro Past due Open']),
      `${cell}: table rows are incomplete: ${JSON.stringify(proof.content.tableRows)}.`,
    );
    assert(
      proof.content.footer === 'Frozen component-styles CSS · no consumer source scanning',
      `${cell}: visual footer is incomplete.`,
    );
    for (const name of ['criticalBadge', 'criticalBanner', 'validationError']) {
      const state = proof.states[name];
      checkVisual(state.text.length > 0 && state.width > 0 && state.height > 0, `${cell}: ${name} is not visibly labeled.`);
      checkVisual(state.foreground !== state.background, `${cell}: ${name} foreground equals its background.`);
      checkVisual(state.contrastRatio >= 4.5, `${cell}: ${name} contrast is ${state.contrastRatio}:1.`);
    }
    const enabled = proof.states.enabledButton;
    checkVisual(enabled.text.length > 0 && enabled.width > 0 && enabled.height > 0, `${cell}: enabled Button is not visibly labeled.`);
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
    checkVisual(proof.geometry.minimumTableCellWidth >= 100, `${cell}: table cells collapsed to ${proof.geometry.minimumTableCellWidth}px.`);
    checkVisual(proof.geometry.clippedTableCells === 0, `${cell}: ${proof.geometry.clippedTableCells} table cells clip.`);

    const fingerprint = `${proof.bodyBackground}|${proof.bodyColor}`;
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
    await settlePage(page);
    const postInteractionProof = await page.evaluate(() => {
      const normalizedText = (element) => element?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
      const profile = document.querySelector('[data-oods-component="Card"]')?.getBoundingClientRect();
      const table = document.querySelector('[data-oods-component="Table"]')?.getBoundingClientRect();
      const fieldControls = [...document.querySelectorAll('.oods-field-control')];
      const tableCells = [...document.querySelectorAll('[data-oods-component="Table"] th, [data-oods-component="Table"] td')];
      return {
        content: {
          selectedTab: normalizedText(document.querySelector('[role="tab"][aria-selected="true"]')),
          selectedPanel: normalizedText(document.querySelector('[role="tabpanel"]:not([hidden])')),
          fieldLabels: [...document.querySelectorAll('.visual-mini-card label')].map(normalizedText),
          tableRows: [...document.querySelectorAll('[data-oods-component="Table"] tbody tr')]
            .map((row) => [...row.querySelectorAll('th, td')].map(normalizedText).join(' ')),
        },
        geometry: {
          profileWidth: profile?.width ?? 0,
          tableWidth: table?.width ?? 0,
          minimumFieldControlWidth: Math.min(...fieldControls.map((control) => control.getBoundingClientRect().width)),
          minimumFieldControlHeight: Math.min(...fieldControls.map((control) => control.getBoundingClientRect().height)),
          minimumTableCellWidth: Math.min(...tableCells.map((cell) => cell.getBoundingClientRect().width)),
          minimumTableCellHeight: Math.min(...tableCells.map((cell) => cell.getBoundingClientRect().height)),
          clippedFieldControls: fieldControls.filter((control) => control.scrollWidth > control.clientWidth + 1).length,
          clippedTableCells: tableCells.filter((cell) => cell.scrollWidth > cell.clientWidth + 1).length,
        },
      };
    });
    const postInteractionGeometry = postInteractionProof.geometry;
    assert(postInteractionProof.content.selectedTab === 'Profile', `${cell}: selected tab label is incomplete after interaction.`);
    assert(
      postInteractionProof.content.selectedPanel === 'Contact and identity information.',
      `${cell}: selected panel content is incomplete after interaction.`,
    );
    assert(
      JSON.stringify(postInteractionProof.content.fieldLabels) === JSON.stringify(proof.content.fieldLabels),
      `${cell}: field labels changed or disappeared after interaction.`,
    );
    assert(
      JSON.stringify(postInteractionProof.content.tableRows) === JSON.stringify(proof.content.tableRows),
      `${cell}: table rows changed or disappeared after interaction.`,
    );
    checkVisual(postInteractionGeometry.profileWidth >= 300, `${cell}: post-interaction profile collapsed to ${postInteractionGeometry.profileWidth}px.`);
    checkVisual(postInteractionGeometry.tableWidth >= 1000, `${cell}: post-interaction table collapsed to ${postInteractionGeometry.tableWidth}px.`);
    checkVisual(postInteractionGeometry.minimumFieldControlWidth >= 270, `${cell}: post-interaction field controls collapsed to ${postInteractionGeometry.minimumFieldControlWidth}px.`);
    checkVisual(postInteractionGeometry.minimumFieldControlHeight >= 32, `${cell}: post-interaction field controls collapsed to ${postInteractionGeometry.minimumFieldControlHeight}px tall.`);
    checkVisual(postInteractionGeometry.minimumTableCellWidth >= 100, `${cell}: post-interaction table cells collapsed to ${postInteractionGeometry.minimumTableCellWidth}px.`);
    checkVisual(postInteractionGeometry.minimumTableCellHeight >= 32, `${cell}: post-interaction table cells collapsed to ${postInteractionGeometry.minimumTableCellHeight}px tall.`);
    checkVisual(postInteractionGeometry.clippedFieldControls === 0, `${cell}: ${postInteractionGeometry.clippedFieldControls} post-interaction field controls clip.`);
    checkVisual(postInteractionGeometry.clippedTableCells === 0, `${cell}: ${postInteractionGeometry.clippedTableCells} post-interaction table cells clip.`);
    proof.postInteractionGeometry = postInteractionGeometry;
    proof.postInteractionContent = postInteractionProof.content;

    const screenshotName = !partialRun && theme === 'hc'
      ? `vue-${cell}-desktop-full.png`
      : partialRun && !frozenHighContrastScope
        ? `vue-${cell}-desktop-partial.png`
        : `vue-${cell}-desktop.png`;
    const path = resolve(artifactRoot, screenshotName);
    const capture = await captureStableScreenshot(page, path);
    const dimensions = await pngDimensions(path);
    assert(
      dimensions.width === 1280 && dimensions.height === capture.viewportHeight,
      `${cell}: malformed ${dimensions.width}x${dimensions.height} screenshot.`,
    );
    screenshots.push({
      kind: 'brand-theme-cell',
      brand,
      theme,
      width: 1280,
      path: path.slice(repositoryRoot.length + 1),
      sha256: await screenshotDigest(path),
      dimensions,
      capture,
      proof,
    });
    await closeIsolatedPage(page);
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
    const page = await openIsolatedPage(viewport.width, 960);
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
    await settlePage(page);
    let captureHeight = await page.evaluate(() => Math.ceil(document.documentElement.scrollHeight));
    assert(captureHeight <= 2400, `${viewport.name}: ${captureHeight}px document exceeds the responsive capture limit.`);
    await page.setViewportSize({ width: viewport.width, height: captureHeight });
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      return new Promise((resolvePaint) => requestAnimationFrame(() => requestAnimationFrame(resolvePaint)));
    });
    const settledHeight = await page.evaluate(() => Math.ceil(document.documentElement.scrollHeight));
    if (settledHeight > captureHeight) {
      captureHeight = settledHeight;
      assert(captureHeight <= 2400, `${viewport.name}: ${captureHeight}px settled document exceeds the responsive capture limit.`);
      await page.setViewportSize({ width: viewport.width, height: captureHeight });
      await page.evaluate(() => {
        window.scrollTo(0, 0);
        return new Promise((resolvePaint) => requestAnimationFrame(() => requestAnimationFrame(resolvePaint)));
      });
    }
    const layout = await page.evaluate(() => {
      const normalizedText = (element) => element?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
      const overflowTrigger = document.querySelector('.oods-tabs-overflow-trigger');
      const overflowRect = overflowTrigger?.getBoundingClientRect();
      const profile = document.querySelector('[data-oods-component="Card"]')?.getBoundingClientRect();
      const fieldControls = [...document.querySelectorAll('.oods-field-control')];
      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        visibleComponents: [...document.querySelectorAll('[data-oods-component]')]
          .filter((element) => {
            const rect = element.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          }).length,
        overflowTrigger: {
          visible: Boolean(overflowRect && overflowRect.width > 0 && overflowRect.height > 0),
          text: overflowTrigger?.textContent?.trim() ?? '',
        },
        keyContent: {
          pageTitle: normalizedText(document.querySelector('.visual-header h1')),
          profileHeading: normalizedText(document.querySelector('.visual-mini-card h2')),
          fieldLabels: [...document.querySelectorAll('.visual-mini-card label')].map(normalizedText),
          validationError: normalizedText(document.querySelector('.oods-field-error')),
          actionLabels: [...document.querySelectorAll('.visual-actions [data-oods-component="Button"], .oods-banner-actions [data-oods-component="Button"]')]
            .map(normalizedText),
          tableHeaders: [...document.querySelectorAll('[data-oods-component="Table"] th')].map(normalizedText),
          tableRows: [...document.querySelectorAll('[data-oods-component="Table"] tbody tr')]
            .map((row) => [...row.querySelectorAll('th, td')].map(normalizedText).join(' ')),
        },
        keyGeometry: {
          profileWidth: profile?.width ?? 0,
          minimumFieldControlWidth: Math.min(...fieldControls.map((control) => control.getBoundingClientRect().width)),
          minimumFieldControlHeight: Math.min(...fieldControls.map((control) => control.getBoundingClientRect().height)),
          clippedFieldControls: fieldControls.filter((control) => control.scrollWidth > control.clientWidth + 1).length,
        },
      };
    });
    assert(layout.scrollWidth <= layout.clientWidth + 1, `${viewport.name}: content clips horizontally.`);
    assert(layout.visibleComponents >= canonicalIds.length, `${viewport.name}: canonical content is missing.`);
    assert(
      layout.keyContent.pageTitle === 'Account operations'
        && layout.keyContent.profileHeading === 'Account profile'
        && layout.keyContent.validationError === 'Enter a valid email',
      `${viewport.name}: key showcase copy is incomplete.`,
    );
    assert(
      JSON.stringify(layout.keyContent.fieldLabels) === JSON.stringify(['Email', 'Renewal date', 'Plan', 'Notes', 'Product updates']),
      `${viewport.name}: field labels are incomplete: ${JSON.stringify(layout.keyContent.fieldLabels)}.`,
    );
    assert(
      JSON.stringify(layout.keyContent.actionLabels) === JSON.stringify(['Update card', 'Save changes', 'Unavailable']),
      `${viewport.name}: action labels are incomplete: ${JSON.stringify(layout.keyContent.actionLabels)}.`,
    );
    assert(
      JSON.stringify(layout.keyContent.tableHeaders) === JSON.stringify(['Name', 'Plan', 'Status', 'Actions'])
        && JSON.stringify(layout.keyContent.tableRows) === JSON.stringify(['Northwind Enterprise Active Open', 'Contoso Pro Past due Open']),
      `${viewport.name}: table content is incomplete.`,
    );
    assert(layout.keyGeometry.profileWidth >= 300, `${viewport.name}: profile card collapsed to ${layout.keyGeometry.profileWidth}px.`);
    assert(
      layout.keyGeometry.minimumFieldControlWidth >= 250
        && layout.keyGeometry.minimumFieldControlHeight >= 32
        && layout.keyGeometry.clippedFieldControls === 0,
      `${viewport.name}: field controls are collapsed or clipped: ${JSON.stringify(layout.keyGeometry)}.`,
    );
    if (viewport.name === 'phone') {
      assert(
        layout.overflowTrigger.visible && layout.overflowTrigger.text === 'More sections',
        'phone: private Tabs overflow trigger is not visibly labeled.',
      );
    }
    assert(browserErrors.length === 0, `${viewport.name}: ${browserErrors.join('; ')}`);

    const path = resolve(artifactRoot, `vue-responsive-${viewport.name}-${viewport.width}.png`);
    const capture = await captureStableScreenshot(page, path);
    const dimensions = await pngDimensions(path);
    assert(
      dimensions.width === viewport.width && dimensions.height === capture.viewportHeight,
      `${viewport.name}: malformed ${dimensions.width}x${dimensions.height} screenshot.`,
    );
    screenshots.push({
      kind: 'responsive',
      brand: 'A',
      theme: 'light',
      width: viewport.width,
      path: path.slice(repositoryRoot.length + 1),
      sha256: await screenshotDigest(path),
      dimensions,
      capture,
      proof: layout,
    });
    await closeIsolatedPage(page);
  }

  const passed = visualFailures.length === 0;
  const report = {
    schemaVersion: '1.0.0',
    generatedAt: new Date().toISOString(),
    mission: 's182-m03',
    target: 'vue',
    scope: partialRun ? cells : 'all-six-cells-and-responsive',
    status: passed ? 'passed' : 'failed',
    browser: { name: 'chromium', version: browserVersion, headless: true },
    cssEntry: '@oods/component-styles/css',
    reviewedBaseline: partialRun ? undefined : {
      status: 'matched',
      method: 'human-reviewed section crops plus original-raster OCR, followed by exact SHA replay',
      source: 'packages/components-vue/test/visual-evidence.mjs#reviewedScreenshotSha256',
      selected: Object.keys(reviewedScreenshotSha256).length,
      failed: 0,
      skipped: 0,
    },
    inputs: await evidenceInputDigests(),
    canonicalIds,
    selected: screenshots.length,
    failed: passed ? 0 : 1,
    skipped: 0,
    failures: visualFailures,
    screenshots,
  };
  completedReport = report;
  await writeFile(resolve(artifactRoot, reportName), `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(resolve(artifactRoot, browserStatusName), `${JSON.stringify({
    generatedAt: report.generatedAt,
    status: report.status,
    browser: report.browser,
    selected: screenshots.length,
    failed: report.failed,
    skipped: 0,
  }, null, 2)}\n`);
  if (!passed) throw new Error(`Vue visual evidence failed: ${visualFailures.join('; ')}`);
  process.stdout.write(`Vue visual evidence: ${screenshots.length} passed, 0 failed, 0 skipped (${browserVersion})\n`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  const observed = completedReport ?? {
    status: browserStarted ? 'failed' : 'environment-blocked',
    selected: 0,
    failed: 1,
    skipped: 0,
  };
  await writeFile(resolve(artifactRoot, browserStatusName), `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    status: observed.status,
    browser: observed.browser,
    selected: observed.selected,
    failed: observed.failed,
    skipped: observed.skipped,
    reason: message,
  }, null, 2)}\n`);
  throw error;
} finally {
  await browser?.close();
  await server?.close();
}
