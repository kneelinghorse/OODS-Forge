import React from 'react';
import { renderToString } from 'react-dom/server';
import { App } from './App.js';

const html = renderToString(<App actions={{ handleEdit: () => undefined, handleDelete: () => undefined }} />);
process.stdout.write(JSON.stringify({ html }));
