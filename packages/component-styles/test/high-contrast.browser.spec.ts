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

describe('Sprint 182 shared component-style browser corrections', () => {
  it('s182-m01b keeps the Brand B light enabled action at or above 4.5:1', async () => {
    const page = await browser.newPage({
      colorScheme: 'light',
      forcedColors: 'none',
      viewport: { width: 480, height: 240 },
    });
    await page.setContent(`<!doctype html>
      <html data-brand="B" data-theme="light">
        <head><style>${tokenCss}\n${componentCss}</style></head>
        <body>
          <button class="oods-button" data-oods-component="Button" data-intent="primary" type="button"
            style="--cmp-button-background:var(--sys-surface-interactive-primary-default);--cmp-button-text:var(--sys-text-on-interactive)">Update card</button>
        </body>
      </html>`);

    const proof = await page.locator('.oods-button').evaluate((element) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) throw new Error('Canvas color resolver unavailable.');
      const rgba = (color: string) => {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = '#010203';
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
        return [...context.getImageData(0, 0, 1, 1).data];
      };
      const luminance = ([red, green, blue]: number[]) => {
        const channels = [red, green, blue].map((value) => {
          const normalized = value / 255;
          return normalized <= 0.04045
            ? normalized / 12.92
            : ((normalized + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
      };
      const style = getComputedStyle(element);
      const foreground = luminance(rgba(style.color));
      const background = luminance(rgba(style.backgroundColor));
      return {
        color: style.color,
        background: style.backgroundColor,
        contrastRatio: (Math.max(foreground, background) + 0.05)
          / (Math.min(foreground, background) + 0.05),
        text: element.textContent?.trim(),
      };
    });

    expect(proof.text).toBe('Update card');
    expect(proof.color).not.toBe(proof.background);
    expect(proof.contrastRatio).toBeGreaterThanOrEqual(4.5);
    await page.close();
  }, 30_000);

  it('makes every locked style state observable without utility CSS', async () => {
    const page = await browser.newPage({
      colorScheme: 'light',
      viewport: { width: 1024, height: 1600 },
    });
    const statusStyle = [
      '--cmp-badge-background:var(--sys-status-critical-surface)',
      '--cmp-badge-border:var(--sys-status-critical-border)',
      '--cmp-badge-text:var(--sys-status-critical-text)',
    ].join(';');
    const bannerStyle = [
      '--cmp-banner-background:var(--sys-status-critical-surface)',
      '--cmp-banner-border:var(--sys-status-critical-border)',
      '--cmp-banner-text:var(--sys-status-critical-text)',
    ].join(';');
    await page.setContent(`<!doctype html>
      <html data-brand="A" data-theme="light">
        <head>
          <style>${tokenCss}\n${componentCss}</style>
          <style>button, input, select, textarea { font: inherit; }</style>
        </head>
        <body>
          <span id="badge-subtle" class="oods-badge" data-oods-component="Badge" data-tone="critical" data-emphasis="subtle" style="${statusStyle}">Subtle</span>
          <span id="badge-solid" class="oods-badge" data-oods-component="Badge" data-tone="critical" data-emphasis="solid" style="${statusStyle}">Solid</span>
          <section id="banner-subtle" class="oods-banner" data-oods-component="Banner" data-tone="critical" data-emphasis="subtle" style="${bannerStyle}">Subtle</section>
          <section id="banner-solid" class="oods-banner" data-oods-component="Banner" data-tone="critical" data-emphasis="solid" style="${bannerStyle}">Solid</section>

          ${['neutral', 'primary', 'secondary', 'success', 'warning', 'danger']
            .map((intent) => `<button id="button-${intent}" class="oods-button" data-oods-component="Button" data-intent="${intent}" data-size="md">${intent}</button>`)
            .join('')}
          <button id="button-sm" class="oods-button" data-oods-component="Button" data-intent="secondary" data-size="sm">Small</button>
          <button id="button-lg" class="oods-button" data-oods-component="Button" data-intent="primary" data-size="lg">Large</button>

          ${['sm', 'md', 'lg']
            .map((size) => `<span id="text-${size}" class="oods-text" data-oods-component="Text" data-size="${size}" data-weight="regular">${size}</span>`)
            .join('')}
          ${['normal', 'medium', 'semibold']
            .map((weight) => `<span id="text-${weight}" class="oods-text" data-oods-component="Text" data-size="md" data-weight="${weight}">${weight}</span>`)
            .join('')}

          ${['compact', 'default', 'comfortable']
            .map((density) => `<table id="table-${density}" class="oods-table" data-oods-component="Table" data-density="${density}"><tbody><tr><td>Cell</td></tr></tbody></table>`)
            .join('')}

          ${['sm', 'md', 'lg']
            .map((size) => `<div id="tabs-${size}" class="oods-tabs" data-oods-component="Tabs" data-size="${size}"><div class="oods-tab-list"><button class="oods-tab" role="tab" aria-selected="true">Tab</button></div></div>`)
            .join('')}
        </body>
      </html>`);

    const proof = await page.evaluate(() => {
      const colors = (selector: string) => {
        const style = getComputedStyle(document.querySelector<HTMLElement>(selector)!);
        return {
          background: style.backgroundColor,
          border: style.borderTopColor,
          color: style.color,
        };
      };
      const button = (selector: string) => {
        const style = getComputedStyle(document.querySelector<HTMLElement>(selector)!);
        return {
          ...colors(selector),
          boxSizing: style.boxSizing,
          minHeight: style.minHeight,
          fontSize: style.fontSize,
          paddingBlock: style.paddingBlock,
          paddingInline: style.paddingInline,
        };
      };
      const text = (selector: string) => {
        const style = getComputedStyle(document.querySelector<HTMLElement>(selector)!);
        return { fontSize: style.fontSize, fontWeight: style.fontWeight, lineHeight: style.lineHeight };
      };
      const cell = (selector: string) => {
        const style = getComputedStyle(document.querySelector<HTMLElement>(`${selector} td`)!);
        return { fontSize: style.fontSize, paddingBlock: style.paddingBlock, paddingInline: style.paddingInline };
      };
      const tab = (selector: string) => {
        const style = getComputedStyle(document.querySelector<HTMLElement>(`${selector} .oods-tab`)!);
        return { fontSize: style.fontSize, paddingBlock: style.paddingBlock, paddingInline: style.paddingInline };
      };
      return {
        badgeSubtle: colors('#badge-subtle'),
        badgeSolid: colors('#badge-solid'),
        bannerSubtle: colors('#banner-subtle'),
        bannerSolid: colors('#banner-solid'),
        intents: Object.fromEntries(
          ['neutral', 'primary', 'secondary', 'success', 'warning', 'danger']
            .map((intent) => [intent, button(`#button-${intent}`)]),
        ),
        buttonSm: button('#button-sm'),
        buttonLg: button('#button-lg'),
        text: Object.fromEntries(
          ['sm', 'md', 'lg', 'normal', 'medium', 'semibold']
            .map((value) => [value, text(`#text-${value}`)]),
        ),
        tables: Object.fromEntries(
          ['compact', 'default', 'comfortable']
            .map((density) => [density, cell(`#table-${density}`)]),
        ),
        tabs: Object.fromEntries(
          ['sm', 'md', 'lg'].map((size) => [size, tab(`#tabs-${size}`)]),
        ),
      };
    });

    expect(proof.badgeSolid).toEqual({
      background: proof.badgeSubtle.color,
      border: proof.badgeSubtle.color,
      color: proof.badgeSubtle.background,
    });
    expect(proof.bannerSubtle).toEqual(proof.badgeSubtle);
    expect(proof.bannerSolid).toEqual({
      background: proof.bannerSubtle.color,
      border: proof.bannerSubtle.color,
      color: proof.bannerSubtle.background,
    });
    expect(new Set(Object.values(proof.intents).map((intent) => intent.background))).toHaveLength(6);
    expect(proof.intents.primary).toMatchObject({
      boxSizing: 'border-box', minHeight: '40px', fontSize: '16px',
      paddingBlock: '10px', paddingInline: '16px',
    });
    expect(proof.buttonSm).toMatchObject({
      boxSizing: 'border-box', minHeight: '32px', fontSize: '14px',
      paddingBlock: '6px', paddingInline: '12px',
    });
    expect(proof.buttonLg).toMatchObject({
      boxSizing: 'border-box', minHeight: '48px', fontSize: '20px',
      paddingBlock: '12px', paddingInline: '24px',
    });

    expect(proof.text.sm).toMatchObject({ fontSize: '14px', fontWeight: '400', lineHeight: '21px' });
    expect(proof.text.md).toMatchObject({ fontSize: '16px', fontWeight: '400', lineHeight: '24px' });
    expect(proof.text.lg).toMatchObject({ fontSize: '20px', fontWeight: '400', lineHeight: '28px' });
    expect(proof.text.normal.fontWeight).toBe('400');
    expect(proof.text.medium.fontWeight).toBe('500');
    expect(proof.text.semibold.fontWeight).toBe('600');

    expect(proof.tables.compact).toEqual({ fontSize: '14px', paddingBlock: '8px', paddingInline: '14px' });
    expect(proof.tables.default).toEqual({ fontSize: '16px', paddingBlock: '12px', paddingInline: '24px' });
    expect(proof.tables.comfortable).toEqual(proof.tables.default);

    expect(proof.tabs.sm).toEqual({ fontSize: '14px', paddingBlock: '8px', paddingInline: '10px' });
    expect(proof.tabs.md).toEqual({ fontSize: '16px', paddingBlock: '10px', paddingInline: '12px' });
    expect(proof.tabs.lg).toEqual({ fontSize: '20px', paddingBlock: '12px', paddingInline: '16px' });
    await page.close();
  }, 30_000);

  it('styles classed and raw native fields without boxing Vue-shaped wrappers', async () => {
    const page = await browser.newPage({
      colorScheme: 'light',
      viewport: { width: 640, height: 640 },
    });
    await page.setContent(`<!doctype html>
      <html data-brand="A" data-theme="light">
        <head><style>${tokenCss}\n${componentCss}</style></head>
        <body>
          <div id="vue-input-wrapper" class="oods-field" data-oods-component="Input">
            <label for="vue-input">Email</label>
            <input id="vue-input" class="oods-field-control">
          </div>
          <div id="vue-date-wrapper" class="oods-date-picker" data-oods-component="DatePicker">
            <div id="vue-date-field" class="oods-field" data-oods-component="Input">
              <label for="vue-date">Renewal date</label>
              <input id="vue-date" class="oods-field-control" type="date">
            </div>
          </div>
          <div id="vue-select-wrapper" class="oods-field" data-oods-component="Select">
            <label for="vue-select">Plan</label>
            <select id="vue-select" class="oods-field-control"><option>Pro</option></select>
          </div>
          <div id="vue-textarea-wrapper" class="oods-field" data-oods-component="Textarea">
            <label for="vue-textarea">Notes</label>
            <textarea id="vue-textarea" class="oods-field-control">Notes</textarea>
          </div>
          <input id="raw-input" data-oods-component="Input">
          <input id="raw-date" data-oods-component="DatePicker" type="date">
          <select id="raw-select" data-oods-component="Select"><option>Pro</option></select>
          <textarea id="raw-textarea" data-oods-component="Textarea">Notes</textarea>
        </body>
      </html>`);

    const proof = await page.evaluate(() => {
      const box = (selector: string) => {
        const style = getComputedStyle(document.querySelector<HTMLElement>(selector)!);
        return {
          background: style.backgroundColor,
          borderWidth: style.borderTopWidth,
          boxSizing: style.boxSizing,
          paddingBlock: style.paddingBlock,
          paddingInline: style.paddingInline,
        };
      };
      return {
        wrappers: [
          '#vue-input-wrapper',
          '#vue-date-wrapper',
          '#vue-date-field',
          '#vue-select-wrapper',
          '#vue-textarea-wrapper',
        ].map(box),
        controls: [
          '#vue-input',
          '#vue-date',
          '#vue-select',
          '#vue-textarea',
          '#raw-input',
          '#raw-date',
          '#raw-select',
          '#raw-textarea',
        ].map(box),
      };
    });

    for (const wrapper of proof.wrappers) {
      expect(wrapper).toMatchObject({
        background: 'rgba(0, 0, 0, 0)',
        borderWidth: '0px',
        boxSizing: 'content-box',
        paddingBlock: '0px',
        paddingInline: '0px',
      });
    }
    for (const control of proof.controls) {
      expect(control).toMatchObject({
        borderWidth: '1px',
        boxSizing: 'border-box',
        paddingBlock: '10px',
        paddingInline: '12px',
      });
      expect(control.background).not.toBe('rgba(0, 0, 0, 0)');
    }
    await page.close();
  }, 30_000);

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
              <span class="oods-badge" data-oods-component="Badge" data-tone="critical" data-emphasis="solid"
                style="--cmp-badge-background:var(--sys-status-critical-surface);--cmp-badge-border:var(--sys-status-critical-border);--cmp-badge-text:var(--sys-status-critical-text)">Past due</span>
              <section class="oods-banner" data-oods-component="Banner" data-tone="critical" data-emphasis="subtle"
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
