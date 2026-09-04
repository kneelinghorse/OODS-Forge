import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { App, type ConsumerActions } from './App.js';
import './consumer.css';

const root = document.getElementById('app');
if (!root) throw new Error('Missing #app hydration root.');
window.__OODS_DOMAIN_ACTIONS__ = { handleEdit: 0, handleDelete: 0 };
const actions = Object.freeze<ConsumerActions>({
  handleEdit: () => { window.__OODS_DOMAIN_ACTIONS__.handleEdit += 1; },
  handleDelete: () => { window.__OODS_DOMAIN_ACTIONS__.handleDelete += 1; },
});
window.__OODS_ACTIONS_FROZEN__ = Object.isFrozen(actions);
function HydrationProbe() {
  React.useEffect(() => { window.__OODS_HYDRATED__ = true; }, []);
  return <App actions={actions} />;
}
hydrateRoot(root, <HydrationProbe />);
