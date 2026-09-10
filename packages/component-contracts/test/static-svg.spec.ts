import { describe, expect, it } from 'vitest';
import { assertStaticSvg } from '../src/static-svg.js';

describe('passive SVG boundary', () => {
  const safe = '<svg xmlns="http://www.w3.org/2000/svg" role="graphics-document"><defs><clipPath id="clip-1"><rect width="20" height="20"/></clipPath></defs><g role="graphics-object" aria-label="A &amp; B" clip-path="url(#clip-1)"><path d="M0,0L20,20"/></g></svg>';
  it('retains every byte of IDs, local references and renderer accessibility', () => {
    expect(assertStaticSvg(safe)).toBe(safe);
  });
  it.each([
    '<script>alert(1)</script>', '<foreignObject><div>HTML</div></foreignObject>',
    '<image href="https://example.com/a.png"/>', '<use href="https://example.com/a.svg#x"/>',
    '<use href="data:image/svg+xml,anything"/>', '<use href="javascript:alert(1)"/>',
    '<g onload="alert(1)"/>', '<g style="fill:url(https://example.com/a.svg)"/>',
    '<g style="fill:u&#114;l(https://example.com/a.svg)"/>',
    '<g style="fill:u\\72l(https://example.com/a.svg)"/>',
    '<g fill="u\\72l(https://example.com/a.svg)"/>',
    '<g style="background:image-set(\'https://example.com/a.png\')"/>',
    '<style>@import "https://example.com/a.css";</style>',
    '<g xml:base="https://example.com/"><use href="#x"/></g>',
    '<g aria-label=noquotes/>', '<animate attributeName="href" to="https://example.com"/>',
    '<!DOCTYPE svg>', '<g aria-label="&Tab;"/>',
  ])('rejects active or externally dependent content: %s', content => {
    expect(() => assertStaticSvg(`<svg>${content}</svg>`)).toThrow('self-contained static SVG');
  });
});
