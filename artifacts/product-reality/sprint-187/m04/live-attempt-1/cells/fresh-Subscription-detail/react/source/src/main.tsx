import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { GeneratedUI, type GeneratedUIActions } from './GeneratedUI.js';
import { model } from './consumer-data.js';
import './consumer.css';

const root = document.getElementById('app');
if (!root) throw new Error('Missing #app hydration root.');
window.__OODS_ACTION_COUNTS__ = {"handleDelete":0,"handleEdit":0};
window.__OODS_ACTION_ARGS__ = {"handleDelete":[],"handleEdit":[]};
const actions: GeneratedUIActions = Object.freeze({
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
hydrateRoot(root, React.createElement(GeneratedUI, { ...model, actions }));
