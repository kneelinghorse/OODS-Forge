import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
const query = new URLSearchParams(window.location.search);
const root = document.getElementById('app')!;
const app = <App empty={query.get('mode') === 'empty'} fail={query.get('mode') === 'error'} latency={Number(query.get('latency') ?? 180)} />;
if (root.hasChildNodes()) hydrateRoot(root, app); else createRoot(root).render(app);
