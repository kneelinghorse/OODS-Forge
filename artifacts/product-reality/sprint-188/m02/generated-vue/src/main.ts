import { createApp } from 'vue';
import App from './App.vue';
const query = new URLSearchParams(window.location.search);
createApp(App, { empty: query.get('mode') === 'empty', fail: query.get('mode') === 'error', latency: Number(query.get('latency') ?? 180) }).mount('#app');
