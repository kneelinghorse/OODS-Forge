import { createSSRApp } from 'vue';
import App, { type ConsumerActions } from './App.vue';
import './consumer.css';

window.__OODS_DOMAIN_ACTIONS__ = { handleEdit: 0, handleDelete: 0 };
const actions = Object.freeze<ConsumerActions>({
  handleEdit: () => { window.__OODS_DOMAIN_ACTIONS__.handleEdit += 1; },
  handleDelete: () => { window.__OODS_DOMAIN_ACTIONS__.handleDelete += 1; },
});
window.__OODS_ACTIONS_FROZEN__ = Object.isFrozen(actions);
createSSRApp(App, { actions }).mount('#app');
queueMicrotask(() => { window.__OODS_HYDRATED__ = true; });
