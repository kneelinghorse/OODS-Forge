import { renderToString } from '@vue/server-renderer';
import { createSSRApp } from 'vue';
import GeneratedUI from './GeneratedUI.vue';
import { model } from './consumer-data.js';

const actions = Object.freeze({

});
async function main() {
  const html = await renderToString(createSSRApp(GeneratedUI, { ...model }));
  process.stdout.write(JSON.stringify({ html }));
}
void main();
