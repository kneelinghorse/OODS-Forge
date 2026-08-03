import fs from 'fs';
const { SEMANTIC_BRIDGE } = await import(
  '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/tokens/scripts/brand-bridge.mjs'
);
const BRIDGED = new Set(SEMANTIC_BRIDGE.map((e) => e.slot));
const t = fs.readFileSync(
  '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/mcp-server/src/render/document.ts',
  'utf8',
);
const start = t.indexOf('const DARK_THEME_OVERRIDES');
const open = t.indexOf('`', start);
const close = t.indexOf('`', open + 1);
const body = t.slice(open + 1, close);
const decls = [...body.matchAll(/(--theme-[a-z0-9-]+)\s*:/g)].map((x) => x[1]);
console.log('overrides decls:', decls.length, 'of which bridged:', decls.filter((d) => BRIDGED.has(d)).length);
console.log('non-bridged:', decls.filter((d) => !BRIDGED.has(d)).join(', '));
