import React from 'react';
import { renderToString } from 'react-dom/server';
import { GeneratedUI, type GeneratedUIActions } from './GeneratedUI.js';
import { model } from './consumer-data.js';

const actions: GeneratedUIActions = Object.freeze({
  handleFilter: (..._args: unknown[]) => undefined,
  handlePageChange: (..._args: unknown[]) => undefined,
  handleRowClick: (..._args: unknown[]) => undefined,
  handleSortChange: (..._args: unknown[]) => undefined,
});
const html = renderToString(React.createElement(GeneratedUI, { ...model, actions }));
process.stdout.write(JSON.stringify({ html }));
