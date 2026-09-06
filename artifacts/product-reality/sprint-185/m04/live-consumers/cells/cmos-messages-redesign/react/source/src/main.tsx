import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { GeneratedUI } from './GeneratedUI.js';
import { model } from './consumer-data.js';
import './consumer.css';

const root = document.getElementById('app');
if (!root) throw new Error('Missing #app hydration root.');
window.__OODS_ACTION_COUNTS__ = {};
window.__OODS_ACTION_ARGS__ = {};
const actions = Object.freeze({

});
window.__OODS_ACTIONS_FROZEN__ = Object.isFrozen(actions);
hydrateRoot(root, React.createElement(GeneratedUI, { ...model }));
