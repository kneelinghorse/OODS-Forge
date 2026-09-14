import { writeFileSync } from 'node:fs';
import { captureStableNormalizedHashes } from '../../../../packages/viz-core/test/s179-echarts-render-harness.js';
writeFileSync(new URL('./core-hashes.json',import.meta.url), JSON.stringify(captureStableNormalizedHashes(),null,2)+'\n');
