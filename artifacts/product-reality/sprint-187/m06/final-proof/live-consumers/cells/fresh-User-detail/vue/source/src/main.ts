import { createSSRApp } from 'vue';
import GeneratedUI from './GeneratedUI.vue';
import { model } from './consumer-data.js';
import './consumer.css';

window.__OODS_ACTION_COUNTS__ = {"handleDelete":0,"handleEdit":0};
window.__OODS_ACTION_ARGS__ = {"handleDelete":[],"handleEdit":[]};
const actions = Object.freeze({
  handleDelete: (...args: unknown[]) => {
    window.__OODS_ACTION_COUNTS__.handleDelete += 1;
    window.__OODS_ACTION_ARGS__.handleDelete.push(args);
  },
  handleEdit: (...args: unknown[]) => {
    window.__OODS_ACTION_COUNTS__.handleEdit += 1;
    window.__OODS_ACTION_ARGS__.handleEdit.push(args);
  },
});
window.__OODS_ACTIONS_FROZEN__ = Object.isFrozen(actions);
createSSRApp(GeneratedUI, { ...model, actions }).mount('#app');
