import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import type { StoreOptions } from './store';
export function renderApp(options: StoreOptions = {}) { return renderToString(<App {...options} />); }
