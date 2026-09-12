// Artifact-only check using the existing producer and independently written auditor.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { verifySprint195Attribution } from '../../../../../scripts/product-reality/s185-closeout.mjs';
import { auditSprint195Attribution } from '../../../../../scripts/product-reality/s185-audit-closeout.mjs';
const dir = 'artifacts/product-reality/sprint-195/m07/movers';
const readFrozen = file => fs.readFileSync(file);
const readHistorical = (head, file) => execFileSync('git', ['show', `${head}:${file}`], { maxBuffer: 32 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
const attribution = JSON.parse(readFrozen(`${dir}/attribution.json`));
const movers = JSON.parse(readFrozen(`${dir}/sprint-wide-movers.json`));
const cmd = JSON.parse(readFrozen(`${dir}/patch-command.json`));
const patch = execFileSync(cmd.command[0], cmd.command.slice(1), { maxBuffer: 32 * 1024 * 1024 }).toString();
verifySprint195Attribution({ attribution, movers, implementationHead: attribution.head, readHistorical });
const audited = auditSprint195Attribution({ attribution, movers,
  migration: JSON.parse(readFrozen('artifacts/product-reality/sprint-195/m07/palette-migration-qualified.json')),
  readFrozen, readHistorical, rangeGitEvidence: { base: attribution.base, head: attribution.head, patch } });
console.log(JSON.stringify({ status: 'passed', producer: 'passed', independentAuditor: audited,
  builderSelfCertified: false, summary: attribution.summary }, null, 2));
