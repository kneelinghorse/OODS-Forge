import { renderToString } from '@vue/server-renderer';
import { createSSRApp } from 'vue';
import GeneratedUI from './GeneratedUI.vue';
import { model } from './consumer-data.js';

const actions = Object.freeze({
  handleChange: (..._args: unknown[]) => undefined,
  handleSubmit: (..._args: unknown[]) => undefined,
});
async function main() {
  const html = await renderToString(createSSRApp(GeneratedUI, { ...model, actions }));
  process.stdout.write(JSON.stringify({ html }));
}
void main();
