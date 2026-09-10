import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { expect, it } from 'vitest';
import { VizAreaPreview } from '../src/index.js';

it('embeds a labelled static figure without altering renderer IDs or ARIA', async () => {
  const svg = '<svg role="graphics-document"><g id="area-1" role="graphics-object" aria-label="Payment amount 19"><path d="M0,0L2,2"/></g></svg>';
  const html = await renderToString(createSSRApp({ render: () => h(VizAreaPreview, { svg, title: 'Payments', description: 'Major units' }) }));
  expect(html).toContain('<figure');
  expect(html).toContain('role="img" aria-label="Payments"');
  expect(html).toContain(svg);
  expect(html).toContain('<figcaption>Payments</figcaption>');
  expect(html).not.toContain('data-viz-preview-placeholder');
  expect(await renderToString(createSSRApp(VizAreaPreview))).toContain('Area preview (640 x 360)');
  await expect(renderToString(createSSRApp({ render: () => h(VizAreaPreview, { svg: '<svg><script>bad()</script></svg>' }) }))).rejects.toThrow('self-contained');
});
