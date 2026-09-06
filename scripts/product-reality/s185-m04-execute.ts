import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { runS185M04LiveConsumers } from './s185-m04-live-consumers.js';
import { runS185M04HydrationBites } from './s185-m04-controls.js';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outputIndex = process.argv.indexOf('--output');
const missionRoot = outputIndex >= 0
  ? path.resolve(process.argv[outputIndex + 1]!)
  : path.join(repositoryRoot, 'artifacts/product-reality/sprint-185/m04');
const liveRoot = path.join(missionRoot, 'live-consumers');
const controlsRoot = path.join(missionRoot, 'controls');
const relative = (value: string) => path.relative(repositoryRoot, value);

async function main() {
  const startedAt = new Date().toISOString();
  let phase = 'live-consumers';
  fs.mkdirSync(missionRoot, { recursive: true });
  try {
    process.stdout.write('Starting sixteen live schema/framework consumers from one coherent package build.\n');
    const live = await runS185M04LiveConsumers({ artifactRoot: liveRoot });
    process.stdout.write(`Live consumers passed: ${JSON.stringify({
      cells: live.report.cellCount, passed: live.report.passed,
      applicable: live.report.applicable, notApplicable: live.report.notApplicable,
    })}\n`);
    phase = 'hydration-controls';
    // Keep the actual artifacts in memory. The control never reloads committed
    // artifact JSON or substitutes a separately generated version of the page.
    const hydration = await runS185M04HydrationBites({
      artifactRoot: controlsRoot,
      generationArtifactRoot: liveRoot,
      generationCells: live.generationCells,
      tarballs: live.tarballs,
    });
    const summary = {
      mission: 's185-m04', status: 'passed', startedAt, endedAt: new Date().toISOString(),
      liveReport: relative(path.join(liveRoot, 'report.json')),
      hydrationReport: relative(path.join(controlsRoot, 'hydration/report.json')),
      schemaTargetCells: live.report.cellCount,
      applicableGates: live.report.applicable,
      passedGates: live.report.passed,
      notApplicableGates: live.report.notApplicable,
      detectedHydrationBites: hydration.detectedBites,
      artifactReuse: 'The same in-memory generation cells and exact tarballs feed both live consumers and hydration controls.',
    };
    fs.writeFileSync(path.join(missionRoot, 'execution-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
    process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  } catch (error) {
    const reason = error instanceof Error ? error.stack ?? error.message : String(error);
    fs.writeFileSync(path.join(missionRoot, 'execution-summary.json'), `${JSON.stringify({
      mission: 's185-m04', status: 'failed', phase, startedAt,
      endedAt: new Date().toISOString(), reason,
    }, null, 2)}\n`);
    throw error;
  }
}

main().catch(error => { process.stderr.write(`${error.stack ?? error}\n`); process.exitCode = 1; });
