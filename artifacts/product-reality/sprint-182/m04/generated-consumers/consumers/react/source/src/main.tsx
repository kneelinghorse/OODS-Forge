import '@oods/component-styles/css';
import './showcase.css';
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { GeneratedUI } from './GeneratedUI.js';

document.documentElement.dataset.brand = 'A';
document.documentElement.dataset.theme = 'light';
const root = document.getElementById('app');
if (!root) throw new Error('Missing #app hydration root.');
function HydrationProbe() {
  React.useEffect(() => { window.__OODS_HYDRATED__ = true; }, []);
  return <GeneratedUI />;
}
hydrateRoot(root, <HydrationProbe />);
