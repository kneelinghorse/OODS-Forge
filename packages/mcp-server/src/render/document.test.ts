import { describe, expect, it } from 'vitest';
import { readTokensCssForDocument, renderDocument } from './document.js';

describe('renderDocument', () => {
  it('produces a valid standalone HTML5 document with defaults', () => {
    const html = renderDocument({
      screenHtml: '<section data-oods-component="Card">Hello</section>',
    });

    expect(html.startsWith('<!DOCTYPE html>')).toBe(true);
    expect(html).toContain('<html lang="en" data-theme="light" data-brand="default">');
    expect(html).toContain('<head>');
    expect(html).toContain('<body data-theme="light" data-brand="default">');
    expect(html).toContain('<main id="oods-preview-root"><section data-oods-component="Card">Hello</section></main>');
    expect(html).toContain('</body>');
    expect(html).toContain('</html>');
  });

  it('uses provided schema theme and explicit brand/title overrides', () => {
    const html = renderDocument({
      screenHtml: '<div>Preview</div>',
      schema: { theme: 'dark' },
      brand: 'A',
      title: 'Workbench Preview',
    });

    expect(html).toContain('<html lang="en" data-theme="dark" data-brand="A">');
    expect(html).toContain('<body data-theme="dark" data-brand="A">');
    expect(html).toContain('<title>Workbench Preview</title>');
  });

  it('inlines tokens CSS and component CSS blocks', () => {
    const html = renderDocument({
      screenHtml: '<div>Tokens</div>',
      componentCss: '.custom-preview { outline: 1px solid red; }',
    });
    const tokensCss = readTokensCssForDocument();

    expect(tokensCss.length).toBeGreaterThan(0);
    expect(html).toContain('<style data-source="tokens">');
    expect(html).toContain('<style data-source="components">');
    expect(html).toContain('--ref-border-radius-md');
    expect(html).toContain('[data-oods-component="Button"]');
    expect(html).toContain('.custom-preview { outline: 1px solid red; }');
  });

  it('uses --sys-* semantic tokens in component CSS', () => {
    const html = renderDocument({ screenHtml: '<div>Test</div>' });

    expect(html).toContain('var(--sys-surface-canvas');
    expect(html).toContain('var(--sys-text-primary');
    expect(html).toContain('var(--sys-surface-interactive-primary-default');
    expect(html).toContain('var(--sys-text-on-interactive');
    expect(html).toContain('var(--sys-border-subtle');
    expect(html).toContain('var(--sys-surface-raised');
    expect(html).toContain('var(--sys-status-info-surface');
    // Reference tokens remain as fallbacks
    expect(html).toContain('var(--ref-color-neutral-50');
    expect(html).toContain('var(--ref-border-radius-md');
  });

  it('wires the inverse-surface tokens into an inert [data-oods-surface="inverse"] rule (sprint-120 m02)', () => {
    // B1 surface-aware-text: the rule consumes the already-present --sys-text-inverse
    // + --sys-surface-inverse tokens. It is a pure-projection (#875) addition — a
    // string assertion is the right test because NOTHING emits the marker, so there
    // is no end-to-end behavior to exercise; this guards against the wiring regressing.
    const html = renderDocument({ screenHtml: '<div>Test</div>' });
    const inverseBlock = html.slice(html.indexOf('[data-oods-surface="inverse"]'));

    expect(html).toContain('[data-oods-surface="inverse"]');
    expect(inverseBlock).toContain('var(--sys-surface-inverse');
    expect(inverseBlock).toContain('var(--sys-text-inverse');
    // Reference-token fallbacks are preserved (no --sys dependency at render time).
    expect(inverseBlock).toContain('var(--ref-color-neutral-900');
    expect(inverseBlock).toContain('var(--ref-color-neutral-0');
  });

  it('forces the Button to inherit the surface sans font (sprint-119 m02)', () => {
    // A native <button> does NOT inherit font-family by default (the UA paints it
    // in -webkit-small-control), so without an explicit `inherit` a tokens-styled
    // Button renders in the platform font instead of the root's font.family.sans
    // (#oods-preview-root sets --ref-typography-families-sans). `inherit` resolves
    // up to that root rule — and to a brand override delivered via the client overlay.
    const html = renderDocument({ screenHtml: '<div>Test</div>' });
    const buttonBlock = html.slice(html.indexOf('[data-oods-component="Button"]'));
    expect(buttonBlock).toContain('font-family: inherit;');
  });

  it('injects dark theme overrides when theme is dark', () => {
    const html = renderDocument({
      screenHtml: '<div>Dark</div>',
      theme: 'dark',
    });

    expect(html).toContain('<style data-source="theme-overrides">');
    expect(html).toContain('--theme-surface-canvas: var(--theme-dark-surface-canvas)');
    expect(html).toContain('--theme-text-primary: var(--theme-dark-text-primary)');
    expect(html).toContain('--theme-text-muted: var(--theme-dark-text-muted)');
    expect(html).toContain('--theme-border-subtle: var(--theme-dark-border-subtle)');
    expect(html).toContain('--theme-status-info-surface: var(--theme-dark-status-info-surface)');
  });

  it('does not inject dark theme overrides for light theme', () => {
    const html = renderDocument({
      screenHtml: '<div>Light</div>',
      theme: 'light',
    });

    expect(html).not.toContain('data-source="theme-overrides"');
  });

  it('escapes title/attributes and returns well-formed closing tags', () => {
    const html = renderDocument({
      screenHtml: '<div>Escaped</div>',
      title: '<unsafe>',
      theme: 'light"quoted',
      brand: "default'brand",
    });

    expect(html).toContain('<title>&lt;unsafe&gt;</title>');
    expect(html).toContain('data-theme="light&quot;quoted"');
    expect(html).toContain('data-brand="default&#39;brand"');
    expect(html.endsWith('</html>')).toBe(true);
  });

  it('wires the Button padding to the size.spacing scalar tokens with literal fallbacks (sprint-121 m03)', () => {
    // B2 geometry scalar-token contract: the Button padding consumes
    // --oods-size-spacing-sm/-md (the size.* scalars from m01/m02) with the prior
    // 0.5rem/0.875rem literals as var() fallbacks, so default-absent rendering stays
    // byte-stable while a loaded tokens.css resolves the vars to 8px/14px.
    const html = renderDocument({ screenHtml: '<div>Test</div>' });
    const buttonBlock = html.slice(html.indexOf('[data-oods-component="Button"]'));
    expect(buttonBlock).toContain('var(--oods-size-spacing-sm, 0.5rem)');
    expect(buttonBlock).toContain('var(--oods-size-spacing-md, 0.875rem)');
  });

  it('inlines an inline tokenOverlay :root override into the components <style> (sprint-121 m05)', () => {
    // The repl render path resolves a tokenOverlay to a scoped :root{} block and passes it as
    // componentCss; renderDocument must emit it into the raw <style data-source="components">.
    const overlayBlock = ':root {\n  --oods-size-spacing-sm: 10px;\n}\n';
    const html = renderDocument({ screenHtml: '<div>Test</div>', componentCss: overlayBlock });
    const componentsStyle = html.slice(html.indexOf('<style data-source="components">'));
    expect(componentsStyle).toContain(':root {\n  --oods-size-spacing-sm: 10px;\n}');
    // ...and the Button still references that exact var, so the override actually lands on it.
    expect(componentsStyle).toContain('var(--oods-size-spacing-sm, 0.5rem)');
  });

  it('omits any token override when no componentCss overlay is supplied (default-absent) (sprint-121 m05)', () => {
    const html = renderDocument({ screenHtml: '<div>Test</div>' });
    expect(html).not.toContain('--oods-size-spacing-sm: 10px');
  });
});
