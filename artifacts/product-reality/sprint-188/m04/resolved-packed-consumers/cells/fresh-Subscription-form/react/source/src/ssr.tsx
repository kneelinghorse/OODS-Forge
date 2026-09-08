import React from 'react';
import { renderToString } from 'react-dom/server';
import { GeneratedUI, type GeneratedUIActions } from './GeneratedUI.js';
import { model } from './consumer-data.js';

const actions: GeneratedUIActions = Object.freeze({
  handleCancel: (..._args: unknown[]) => undefined,
  handleChange: (..._args: unknown[]) => undefined,
  handleSubmit: (..._args: unknown[]) => undefined,
});
const html = renderToString(React.createElement(GeneratedUI, { ...model, actions }));
process.stdout.write(JSON.stringify({ html }));
