import { createSSRApp } from 'vue';
import GeneratedUI from './GeneratedUI.vue';
import { model } from './consumer-data.js';
import './consumer.css';

window.__OODS_ACTION_COUNTS__ = {"handleChange":0,"handleChange_addresses":0,"handleSubmit":0};
window.__OODS_ACTION_ARGS__ = {"handleChange":[],"handleChange_addresses":[],"handleSubmit":[]};
const actions = Object.freeze({
  handleChange: (...args: unknown[]) => {
    window.__OODS_ACTION_COUNTS__.handleChange += 1;
    window.__OODS_ACTION_ARGS__.handleChange.push(args);
  },
  handleChange_addresses: (...args: unknown[]) => {
    window.__OODS_ACTION_COUNTS__.handleChange_addresses += 1;
    window.__OODS_ACTION_ARGS__.handleChange_addresses.push(args);
  },
  handleSubmit: (...args: unknown[]) => {
    window.__OODS_ACTION_COUNTS__.handleSubmit += 1;
    window.__OODS_ACTION_ARGS__.handleSubmit.push(args);
  },
});
window.__OODS_ACTIONS_FROZEN__ = Object.isFrozen(actions);
createSSRApp(GeneratedUI, { ...model, actions }).mount('#app');
