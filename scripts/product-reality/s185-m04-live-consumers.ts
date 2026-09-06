import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  REPOSITORY_ROOT,
  SCHEMA_NAMES,
  runLiveGenerationOnly,
  runLiveWorkflowProof,
  type S184M06SchemaName,
} from './s184-m06-live-consumers.js';
import { S185_SCHEMA_NAMES } from './s185-m04-consumer-contract.js';

export const S185_ALL_SCHEMA_NAMES = Object.freeze([...S185_SCHEMA_NAMES, ...SCHEMA_NAMES]);

export async function runS185M04LiveConsumers(options: Omit<Parameters<typeof runLiveWorkflowProof>[0], 'mission'>) {
  return runLiveWorkflowProof({ ...options, mission: 's185-m04', schemaNames: options.schemaNames ?? S185_ALL_SCHEMA_NAMES });
}

async function main() {
  const args = process.argv.slice(2);
  let artifactRoot = path.join(REPOSITORY_ROOT, 'artifacts/product-reality/sprint-185/m04/live-consumers');
  let generationOnly = false;
  let schemaNames: readonly S184M06SchemaName[] = S185_ALL_SCHEMA_NAMES;
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--generation-only') generationOnly = true;
    else if (args[index] === '--output' && args[index + 1]) artifactRoot = path.resolve(args[++index]!);
    else if (args[index] === '--schemas' && args[index + 1]) {
      const selected = args[++index]!.split(',');
      if (!selected.length || selected.some((name) => !S185_ALL_SCHEMA_NAMES.includes(name as S184M06SchemaName))
        || new Set(selected).size !== selected.length) throw new Error('--schemas requires distinct saved schema names from the eight-schema corpus.');
      schemaNames = selected as S184M06SchemaName[];
    } else throw new Error(`Unknown or incomplete argument: ${args[index]}`);
  }
  const result = generationOnly
    ? await runLiveGenerationOnly({ artifactRoot, schemaNames, mission: 's185-m04' })
    : await runS185M04LiveConsumers({ artifactRoot, schemaNames });
  process.stdout.write(`${JSON.stringify(result.report, null, 2)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
