import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { GeneratedUI, type GeneratedUIActions } from './GeneratedUI.js';
import { model } from './consumer-data.js';
import './consumer.css';

const root = document.getElementById('app');
if (!root) throw new Error('Missing #app hydration root.');
window.__OODS_ACTION_COUNTS__ = {"handleFilter":0,"handleRowClick":0,"handleSort":0};
window.__OODS_ACTION_ARGS__ = {"handleFilter":[],"handleRowClick":[],"handleSort":[]};
const actions: GeneratedUIActions = Object.freeze({
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
hydrateRoot(root, React.createElement(GeneratedUI, { ...model, actions }));
