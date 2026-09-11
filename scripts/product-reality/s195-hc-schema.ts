import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const schemaRoot = path.join(root, 'packages/mcp-server/src/schemas');
const check = process.argv.includes('--check');
const description = 'CSS token theme for chart pixels, default light. HC emits the declared scope colors verbatim, including CSS system colors; their computed paints require a forced-colors browser. A renderer that substitutes undeclared paints is typed-deferred instead of returning misleading HC pixels. No server-side system-color hex palette is invented.';
for (const name of ['viz.render', 'dashboard.render', 'artifact.certify']) {
  for (const side of ['input', 'output']) {
    const target = path.join(schemaRoot, `${name}.${side}.json`);
    const schema = JSON.parse(fs.readFileSync(target, 'utf8'));
    if (side === 'input') {
      schema.properties.theme.enum = ['light', 'dark', 'hc'];
      schema.properties.theme.description = description;
      if (name === 'artifact.certify') schema.description = schema.description.replace('HC token exports exist, but server-side HC pixels are not supported.', 'HC contrast is exempt with reason forced-colors and no numeric grade; determinism, a11y and accuracy retain their normal evaluation.');
    } else if (name === 'viz.render') schema.properties.render.properties.theme.enum = ['light', 'dark', 'hc'];
    else if (name === 'dashboard.render') {
      schema.properties.output.properties.theme.enum = ['light', 'dark', 'hc'];
      schema.properties.html.description = 'Opt-in self-contained dashboard HTML with scoped chart SVG, KPI tiles and error placeholders. Light/dark renders all admitted chart types. HC chart rendering preserves declared token colors; unsupported renderer paints become typed error panels under the existing placeholder/omit policy.';
      schema.properties.outputHtmlHash.description = 'SHA-256 over the exact returned HTML bytes. Successful panels contain scoped SVG; failed panels follow the declared placeholder/omit policy, including measured HC render deferrals. This per-call identity is distinct from a certified runtime-matrix renderHashEpoch claim.';
    }
    else {
      const result = schema.properties.contrastResults.items;
      result.properties.theme.enum = ['light', 'dark', 'hc'];
      result.allOf = [{ if: { properties: { theme: { const: 'hc' } }, required: ['theme'] }, then: { required: ['reason'], properties: { verdict: { const: 'exempt' }, measured: { const: false } } }, else: { not: { required: ['reason'] } } }];
      result.properties.reason = { const: 'forced-colors', description: 'HC contrast is delegated to the user agent forced-colors palette; no numeric server grade is claimed.' };
      schema.properties.pillars.properties.contrast.description += schema.properties.pillars.properties.contrast.description.includes('HC contrast') ? '' : ' HC contrast is exempt with contrastResults reason forced-colors; the server preserves declared colors and makes no numeric contrast claim.';
    }
    const bytes = JSON.stringify(schema, null, 2) + '\n';
    if (check) { if (fs.readFileSync(target, 'utf8') !== bytes) throw new Error(`HC schema drift: ${target}`); }
    else fs.writeFileSync(target, bytes);

  }
}
// code.generate is the immediate public caller used by the required generated-app HC proof.
const codegenPath = path.join(schemaRoot, 'code.generate.input.json');
const codegen = JSON.parse(fs.readFileSync(codegenPath, 'utf8'));
codegen.properties.options.properties.theme.enum = ['light', 'dark', 'hc'];
const codegenBytes = JSON.stringify(codegen, null, 2) + '\n';
if (check) { if (fs.readFileSync(codegenPath, 'utf8') !== codegenBytes) throw new Error('HC code.generate theme drift'); }
else fs.writeFileSync(codegenPath, codegenBytes);
