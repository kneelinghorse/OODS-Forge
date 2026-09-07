import { createSSRApp } from 'vue';
import GeneratedUI from './GeneratedUI.vue';
import { model } from './consumer-data.js';
import './consumer.css';

window.__OODS_ACTION_COUNTS__ = {"handleFilter":0,"handleRowClick":0,"handleSort":0};
window.__OODS_ACTION_ARGS__ = {"handleFilter":[],"handleRowClick":[],"handleSort":[]};
const actions = Object.freeze({
  handleFilter: (...args: unknown[]) => {
    window.__OODS_ACTION_COUNTS__.handleFilter += 1;
    window.__OODS_ACTION_ARGS__.handleFilter.push(args);
  },
  handleRowClick: (...args: unknown[]) => {
    window.__OODS_ACTION_COUNTS__.handleRowClick += 1;
    window.__OODS_ACTION_ARGS__.handleRowClick.push(args);
  },
  handleSort: (...args: unknown[]) => {
    window.__OODS_ACTION_COUNTS__.handleSort += 1;
    window.__OODS_ACTION_ARGS__.handleSort.push(args);
  },
});
window.__OODS_ACTIONS_FROZEN__ = Object.isFrozen(actions);
createSSRApp(GeneratedUI, { ...model, actions }).mount('#app');
