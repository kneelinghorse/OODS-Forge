import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { VizAreaPreview } from '../src/index.js';

it('embeds a labelled static figure without altering renderer IDs or ARIA', () => {
  const svg = '<svg role="graphics-document"><g id="area-1" role="graphics-object" aria-label="Payment amount 19"><path d="M0,0L2,2"/></g></svg>';
  const html = renderToStaticMarkup(<VizAreaPreview svg={svg} title="Payments" description="Major units" />);
  expect(html).toContain('<figure');
  expect(html).toContain('role="img" aria-label="Payments"');
  expect(html).toContain(svg);
  expect(html).toContain('<figcaption>Payments</figcaption>');
  expect(html).not.toContain('data-viz-preview-placeholder');
  expect(renderToStaticMarkup(<VizAreaPreview />)).toContain('Area preview (640 x 360)');
  // A painted title (Vega's role-title-text) is not repeated; a title the SVG does not paint is the figure heading (Sprint 202 m01).
  const painted = '<svg><g class="mark-group role-title-text"><text>Payments</text></g></svg>';
  expect(renderToStaticMarkup(<VizAreaPreview svg={painted} title="Payments" />)).not.toContain('<figcaption>');
  // The narrow render sits beside the design-size one; the styles show it at 600px or less of figure width.
  const narrow = '<svg viewBox="0 0 370 230"><path d="M0,0L1,1"/></svg>';
  const both = renderToStaticMarkup(<VizAreaPreview svg={svg} svgNarrow={narrow} title="Payments" />);
  expect(both).toContain('data-viz-narrow="true"');
  expect(both).toContain(`<div data-viz-svg="true">${svg}</div><div data-viz-svg-narrow="true">${narrow}</div>`);
  expect(html).not.toContain('data-viz-narrow');
  expect(() => renderToStaticMarkup(<VizAreaPreview svg={svg} svgNarrow='<svg><script>bad()</script></svg>' />)).toThrow('self-contained');
  expect(() => renderToStaticMarkup(<VizAreaPreview svg='<svg><script>bad()</script></svg>' />)).toThrow('self-contained');
});
