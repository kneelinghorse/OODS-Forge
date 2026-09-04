import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium, type Browser } from 'playwright';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(packageRoot, '../..');
const componentCss = fs
  .readFileSync(path.join(packageRoot, 'src/components.css'), 'utf8')
  .replace(/^@import[^\n]+\n/u, '');
const tokenCss = fs.readFileSync(path.join(repoRoot, 'packages/tokens/dist/css/tokens.css'), 'utf8');

let browser: Browser;

beforeAll(async () => {
  browser = await chromium.launch({ headless: true });
});

afterAll(async () => {
  await browser?.close();
});

describe('s182-m01a shared high-contrast browser correction', () => {
  for (const brand of ['A', 'B'] as const) {
    it(`${brand} light/dark keeps the default disabled label distinct from its surface`, async () => {
      for (const theme of ['light', 'dark'] as const) {
        const page = await browser.newPage({
          colorScheme: theme,
          viewport: { width: 480, height: 240 },
        });
        await page.setContent(`<!doctype html>
          <html data-brand="${brand}" data-theme="${theme}">
            <head><style>${tokenCss}\n${componentCss}</style></head>
            <body><button class="oods-button" data-oods-component="Button" type="button" disabled>Unavailable</button></body>
          </html>`);
        const proof = await page.locator('.oods-button').evaluate((element) => {
          const style = getComputedStyle(element);
          return {
            color: style.color,
            background: style.backgroundColor,
            text: element.textContent?.trim(),
          };
        });
        expect(proof.text).toBe('Unavailable');
        expect(proof.color, `${brand}/${theme}`).not.toBe(proof.background);
        await page.close();
      }
    }, 30_000);

    for (const forcedColors of ['none', 'active'] as const) {
      it(`${brand}/hc keeps status, validation, disabled, and dismiss controls legible with forcedColors=${forcedColors}`, async () => {
        const page = await browser.newPage({
          colorScheme: 'dark',
          forcedColors,
          viewport: { width: 800, height: 600 },
        });
        await page.setContent(`<!doctype html>
          <html data-brand="${brand}" data-theme="hc">
            <head><style>${tokenCss}\n${componentCss}</style></head>
            <body>
              <span class="oods-badge" data-oods-component="Badge" data-tone="critical"
                style="--cmp-badge-background:var(--sys-status-critical-surface);--cmp-badge-border:var(--sys-status-critical-border);--cmp-badge-text:var(--sys-status-critical-text)">Past due</span>
              <section class="oods-banner" data-oods-component="Banner" data-tone="critical"
                style="--cmp-banner-background:var(--sys-status-critical-surface);--cmp-banner-border:var(--sys-status-critical-border);--cmp-banner-text:var(--sys-status-critical-text)">
                <span>Payment failed</span><button class="oods-banner-dismiss" type="button" aria-label="Dismiss">×</button>
              </section>
              <p class="oods-field-error">Enter a valid email</p>
              <button class="oods-button" data-oods-component="Button" type="button"
                style="--cmp-button-background:var(--sys-surface-interactive-primary-default);--cmp-button-text:var(--sys-text-on-interactive)">Update card</button>
              <button class="oods-button" data-oods-component="Button" type="button" disabled>Unavailable</button>
            </body>
          </html>`);

        const proof = await page.evaluate(() => {
          const colors = (selector: string) => {
            const element = document.querySelector<HTMLElement>(selector)!;
            const style = getComputedStyle(element);
            return {
              color: style.color,
              background: style.backgroundColor,
              border: style.borderColor,
              text: element.textContent?.trim(),
              forcedColorAdjust: style.forcedColorAdjust,
            };
          };
          const dismiss = document.querySelector<HTMLElement>('.oods-banner-dismiss')!;
          const dismissRect = dismiss.getBoundingClientRect();
          return {
            body: colors('body'),
            badge: colors('.oods-badge'),
            banner: colors('.oods-banner'),
            validation: colors('.oods-field-error'),
            enabled: colors('.oods-button:not(:disabled)'),
            disabled: colors('.oods-button:disabled'),
            dismiss: {
              ...colors('.oods-banner-dismiss'),
              width: dismissRect.width,
              height: dismissRect.height,
              label: dismiss.getAttribute('aria-label'),
            },
          };
        });

        expect(proof.badge.text).toBe('Past due');
        expect(proof.badge.color).toBe(proof.body.color);
        expect(proof.badge.color).not.toBe(proof.badge.background);
        expect(proof.banner.color).toBe(proof.body.color);
        expect(proof.banner.color).not.toBe(proof.banner.background);
        expect(proof.validation.color).toBe(proof.body.color);
        expect(proof.enabled.text).toBe('Update card');
        expect(proof.enabled.color).not.toBe(proof.enabled.background);
        expect(proof.enabled.forcedColorAdjust).toBe(forcedColors === 'active' ? 'none' : 'auto');
        expect(proof.disabled.text).toBe('Unavailable');
        expect(proof.disabled.color).not.toBe(proof.disabled.background);
        expect(proof.dismiss.label).toBe('Dismiss');
        expect(proof.dismiss.width).toBe(40);
        expect(proof.dismiss.height).toBe(40);
        await page.close();
      }, 30_000);
    }
  }
});
