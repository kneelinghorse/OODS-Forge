import { createSSRApp } from 'vue';
import GeneratedUI from './GeneratedUI.vue';
import { model } from './consumer-data.js';
import './consumer.css';

window.__OODS_ACTION_COUNTS__ = {"handleCancel":0,"handleDelete":0,"handleEdit":0,"handleViewTimeline":0};
window.__OODS_ACTION_ARGS__ = {"handleCancel":[],"handleDelete":[],"handleEdit":[],"handleViewTimeline":[]};
const actions = Object.freeze({
  handleCancel: (...args: unknown[]) => {
    window.__OODS_ACTION_COUNTS__.handleCancel += 1;
    window.__OODS_ACTION_ARGS__.handleCancel.push(args);
  },
  handleDelete: (...args: unknown[]) => {
    window.__OODS_ACTION_COUNTS__.handleDelete += 1;
    window.__OODS_ACTION_ARGS__.handleDelete.push(args);
  },
  handleEdit: (...args: unknown[]) => {
    window.__OODS_ACTION_COUNTS__.handleEdit += 1;
    window.__OODS_ACTION_ARGS__.handleEdit.push(args);
  },
  handleViewTimeline: (...args: unknown[]) => {
    window.__OODS_ACTION_COUNTS__.handleViewTimeline += 1;
    window.__OODS_ACTION_ARGS__.handleViewTimeline.push(args);
  },
});
window.__OODS_ACTIONS_FROZEN__ = Object.isFrozen(actions);
createSSRApp(GeneratedUI, { ...model, actions }).mount('#app');
