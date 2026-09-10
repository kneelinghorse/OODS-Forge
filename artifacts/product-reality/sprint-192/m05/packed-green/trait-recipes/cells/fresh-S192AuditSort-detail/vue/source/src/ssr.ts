import { renderToString } from '@vue/server-renderer';
import { createSSRApp } from 'vue';
import GeneratedUI from './GeneratedUI.vue';
import { model } from './consumer-data.js';

const actions = Object.freeze({
  handleDelete: (..._args: unknown[]) => undefined,
  handleEdit: (..._args: unknown[]) => undefined,
  handleViewTimeline: (..._args: unknown[]) => undefined,
});
async function main() {
  const html = await renderToString(createSSRApp(GeneratedUI, { ...model, actions }));
  process.stdout.write(JSON.stringify({ html }));
}
void main();
