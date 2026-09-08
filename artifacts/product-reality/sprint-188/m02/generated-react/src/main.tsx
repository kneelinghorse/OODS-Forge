import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
const query = new URLSearchParams(window.location.search);
createRoot(document.getElementById('app')!).render(<App empty={query.get('mode') === 'empty'} fail={query.get('mode') === 'error'} latency={Number(query.get('latency') ?? 180)} />);
