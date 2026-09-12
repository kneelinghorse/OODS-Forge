import React from 'react';
import { renderToString } from 'react-dom/server';
import { GeneratedUI, type GeneratedUIActions } from './GeneratedUI.js';
import { model } from './consumer-data.js';

const actions: GeneratedUIActions = Object.freeze({
  handleCancel: (..._args: unknown[]) => undefined,
  handleDelete: (..._args: unknown[]) => undefined,
  handleEdit: (..._args: unknown[]) => undefined,
  handleViewTimeline: (..._args: unknown[]) => undefined,
});
const html = renderToString(React.createElement(GeneratedUI, { ...model, actions }));
process.stdout.write(JSON.stringify({ html }));
