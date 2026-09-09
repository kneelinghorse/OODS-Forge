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
  expect(() => renderToStaticMarkup(<VizAreaPreview svg='<svg><script>bad()</script></svg>' />)).toThrow('self-contained');
});
