import '@oods/component-styles/css';
import './showcase.css';
import { createSSRApp } from 'vue';
import GeneratedUI from './GeneratedUI.vue';

document.documentElement.dataset.brand = 'A';
document.documentElement.dataset.theme = 'light';
createSSRApp(GeneratedUI).mount('#app');
queueMicrotask(() => { window.__OODS_HYDRATED__ = true; });
