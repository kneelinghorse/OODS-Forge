import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StatusTimeline } from '../../../../packages/components-react/src/index.js';
import { renderMappedComponent } from '../../../../packages/mcp-server/src/render/component-map.js';
const require = createRequire(new URL('../../../../packages/components-vue/package.json', import.meta.url));
const { h } = require('vue'), { renderToString } = require('@vue/server-renderer');
const { StatusTimeline: VueTimeline } = require('@oods/components-vue');
const props = { status: 'pending_cancellation', events: [
 { from: null, to: 'active', at: '2026-09-01T12:00:00Z', actorId: 'operator-1', reason: 'Created' },
 { from: 'active', to: 'pending_cancellation', at: '2026-09-08T12:00:00Z', actorId: 'operator-2', reason: 'Budget' },
] };
const text = (value: string) => value.replace(/<[^>]+>/g, ' ').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const texts = {
 html: text(renderMappedComponent({ id: 'history', component: 'StatusTimeline', props }, '')!),
 react: text(renderToStaticMarkup(createElement(StatusTimeline, props))),
 vue: text(await renderToString(h(VueTimeline, props))),
};
assert.equal(texts.html, texts.react); assert.equal(texts.html, texts.vue);
await fs.writeFile(new URL('./timeline-parity.json', import.meta.url), JSON.stringify({ status: 'passed', allowlist: [], differenceCount: 0, props, texts }, null, 2) + '\n');
console.log('Three-target StatusTimeline text parity: zero differences.');
