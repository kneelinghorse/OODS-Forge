import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { handle as compose } from '../../../../packages/mcp-server/src/tools/design.compose.js';
import { handle as generate } from '../../../../packages/mcp-server/src/tools/code.generate.js';
const rows = [];
for (const theme of ['light', 'dark'] as const) {
  const composition = await compose({ object: 'Subscription', context: 'workflow', preferences: { theme } });
  for (const framework of ['react', 'vue'] as const) {
    const result = await generate({ schema: composition.schema, framework, profile: 'build' });
    assert.equal(result.status, 'ok');
    const measured = JSON.parse(await fs.readFile(new URL(`./after-final/${theme}/${framework}/artifact.json`, import.meta.url), 'utf8'));
    assert.deepEqual(result.artifact, measured);
    rows.push({ theme, framework, contentHash: result.artifact!.contentHash, identicalToMeasuredArtifact: true });
  }
}
await fs.writeFile(new URL('./current-artifact-identity.json', import.meta.url), JSON.stringify({ rows, note: 'The final 1.1.0 contract metadata amendment and HTML explicit-label handling do not change any measured React/Vue application byte.' }, null, 2) + '\n');
console.log(JSON.stringify({ identicalArtifacts: rows.length }));
