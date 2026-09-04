import React from 'react';
import { renderToString } from 'react-dom/server';
import { GeneratedUI } from './GeneratedUI.js';

const html = renderToString(<GeneratedUI />);
process.stdout.write(JSON.stringify({ html }));
