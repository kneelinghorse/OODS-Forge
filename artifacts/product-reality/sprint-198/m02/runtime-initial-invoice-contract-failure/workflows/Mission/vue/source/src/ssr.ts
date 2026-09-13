import { createSSRApp } from 'vue';
import { renderToString } from '@vue/server-renderer';
import App from './App.vue';
import type { StoreOptions } from './store';
export function renderApp(options: StoreOptions = {}) { return renderToString(createSSRApp(App, { ...options })); }
