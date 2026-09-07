import React from 'react';
import { renderToString } from 'react-dom/server';
import { GeneratedUI } from './GeneratedUI.js';
import { model } from './consumer-data.js';

const actions = Object.freeze({

});
const html = renderToString(React.createElement(GeneratedUI, { ...model }));
process.stdout.write(JSON.stringify({ html }));
