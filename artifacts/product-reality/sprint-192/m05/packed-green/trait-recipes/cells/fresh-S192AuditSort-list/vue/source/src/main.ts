import { createSSRApp } from 'vue';
import GeneratedUI from './GeneratedUI.vue';
import { model } from './consumer-data.js';
import './consumer.css';

window.__OODS_ACTION_COUNTS__ = {"handleFilter":0,"handlePageChange":0,"handleRowClick":0,"handleSortChange":0};
window.__OODS_ACTION_ARGS__ = {"handleFilter":[],"handlePageChange":[],"handleRowClick":[],"handleSortChange":[]};
const actions = Object.freeze({
  handleFilter: (...args: unknown[]) => {
    window.__OODS_ACTION_COUNTS__.handleFilter += 1;
    window.__OODS_ACTION_ARGS__.handleFilter.push(args);
  },
  handlePageChange: (...args: unknown[]) => {
    window.__OODS_ACTION_COUNTS__.handlePageChange += 1;
    window.__OODS_ACTION_ARGS__.handlePageChange.push(args);
  },
  handleRowClick: (...args: unknown[]) => {
    window.__OODS_ACTION_COUNTS__.handleRowClick += 1;
    window.__OODS_ACTION_ARGS__.handleRowClick.push(args);
  },
  handleSortChange: (...args: unknown[]) => {
    window.__OODS_ACTION_COUNTS__.handleSortChange += 1;
    window.__OODS_ACTION_ARGS__.handleSortChange.push(args);
  },
});
window.__OODS_ACTIONS_FROZEN__ = Object.isFrozen(actions);
createSSRApp(GeneratedUI, { ...model, actions }).mount('#app');
