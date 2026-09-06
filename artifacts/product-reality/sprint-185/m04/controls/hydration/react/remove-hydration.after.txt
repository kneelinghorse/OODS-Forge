import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { GeneratedUI, type GeneratedUIActions } from './GeneratedUI.js';
import { model } from './consumer-data.js';
import './consumer.css';

const root = document.getElementById('app');
if (!root) throw new Error('Missing #app hydration root.');
window.__OODS_ACTION_COUNTS__ = {"handleChange":0,"handleSubmit":0};
window.__OODS_ACTION_ARGS__ = {"handleChange":[],"handleSubmit":[]};
const actions: GeneratedUIActions = Object.freeze({
  handleChange: (...args: unknown[]) => {
    window.__OODS_ACTION_COUNTS__.handleChange += 1;
    window.__OODS_ACTION_ARGS__.handleChange.push(args);
  },
  handleSubmit: (...args: unknown[]) => {
    window.__OODS_ACTION_COUNTS__.handleSubmit += 1;
    window.__OODS_ACTION_ARGS__.handleSubmit.push(args);
  },
});
window.__OODS_ACTIONS_FROZEN__ = Object.isFrozen(actions);
(window as unknown as { __OODS_UNMOUNTED_TREE__: unknown }).__OODS_UNMOUNTED_TREE__ = React.createElement(GeneratedUI, { ...model, actions });
