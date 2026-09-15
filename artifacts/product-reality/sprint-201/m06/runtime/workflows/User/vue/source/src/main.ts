for (const element of [document.documentElement, document.body]) { element.dataset.theme = "light"; element.dataset.brand = "A"; }
import { createApp, createSSRApp } from 'vue';
import App from './App.vue';
const query = new URLSearchParams(window.location.search);
const root = document.getElementById('app')!;
(root.hasChildNodes() ? createSSRApp : createApp)(App, { empty: query.get('mode') === 'empty', fail: query.get('mode') === 'error', latency: Number(query.get('latency') ?? 180) }).mount('#app');
