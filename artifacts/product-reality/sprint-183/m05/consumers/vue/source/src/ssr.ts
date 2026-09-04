import { renderToString } from '@vue/server-renderer';
import { createSSRApp } from 'vue';
import App from './App.vue';

async function main() {
  const html = await renderToString(createSSRApp(App, {
    actions: { handleEdit: () => undefined, handleDelete: () => undefined },
  }));
  process.stdout.write(JSON.stringify({ html }));
}
void main();
