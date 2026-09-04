import { renderToString } from '@vue/server-renderer';
import { createSSRApp } from 'vue';
import GeneratedUI from './GeneratedUI.vue';

async function main() {
  const html = await renderToString(createSSRApp(GeneratedUI));
  process.stdout.write(JSON.stringify({ html }));
}
void main();
