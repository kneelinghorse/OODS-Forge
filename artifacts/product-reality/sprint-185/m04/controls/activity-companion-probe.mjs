// Newly measured Sprint 185 m04 control; absent from the original planning output.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
const root = process.argv[2];
const { handle } = await import(pathToFileURL(path.join(root, 'packages/mcp-server/dist/tools/code.generate.js')).href);
const schemaPath = path.join(root, 'artifacts/product-reality/sprint-183/m04/saved-schema-store/cmos-activity-redesign.json');
const bytes = fs.readFileSync(schemaPath);
const record = JSON.parse(bytes);
const cells = [];
for (const framework of ['react', 'vue']) {
  const result = await handle({ framework, profile: 'build', schema: record.schema });
  const issues = ['issues', 'errors', 'warnings', 'diagnostics'].flatMap((key) => result[key] ?? []);
  cells.push({ schema: 'cmos-activity-redesign', framework, status: result.status, artifactPresent: Boolean(result.artifact), issues });
}
const report = {
  missionId: 's185-m04',
  provenance: 'New companion observation; these two cells were not generated in the original planning probe or output.md.',
  schemaPath,
  schemaFileSha256: crypto.createHash('sha256').update(bytes).digest('hex'),
  schemaUnchanged: fs.readFileSync(schemaPath).equals(bytes),
  cells,
};
console.log(JSON.stringify(report, null, 2));
if (!report.schemaUnchanged || cells.some((cell) => cell.status !== 'ok' || !cell.artifactPresent || cell.issues.length)) process.exitCode = 1;
